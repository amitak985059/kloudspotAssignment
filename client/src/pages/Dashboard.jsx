import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/dashboard/MetricCard';
import OccupancyChart from '../components/dashboard/OccupancyChart';
import DemographicsChart from '../components/dashboard/DemographicsChart';
import { analyticsAPI } from '../services/api';
import socketService from '../services/socket';
import { useSites } from "../context/SitesContext";


const Dashboard = () => {
  const { selectedSite } = useSites();

  const [metrics, setMetrics] = useState({
    occupancy: { value: 0, change: 0 },
    footfall: { value: 0, change: 0 },
    dwellTime: { value: 0, change: 0 },
  });
  const [occupancyData, setOccupancyData] = useState([]);
  const [demographicsData, setDemographicsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!selectedSite?.siteId) return;

    try {
      setLoading(true);

      const now = Math.floor(Date.now() / 1000);
      const fromUtc = now - 24 * 60 * 60;

      const payload = {
        siteId: selectedSite.siteId,
        fromUtc,
        toUtc: now,
      };

      const [
        occupancyRes,
        footfallRes,
        dwellRes,
        demographicsRes,
      ] = await Promise.all([
        analyticsAPI.getOccupancy(payload),
        analyticsAPI.getFootfall(payload),
        analyticsAPI.getDwellTime(payload),
        analyticsAPI.getDemographics(payload),
      ]);

      setMetrics({
        occupancy: {
          value: occupancyRes.data?.current ?? 0,
          change: occupancyRes.data?.change ?? 0,
        },
        footfall: {
          value: footfallRes.data?.total ?? 0,
          change: footfallRes.data?.change ?? 0,
        },
        dwellTime: {
          value: dwellRes.data?.average ?? 0,
          change: dwellRes.data?.change ?? 0,
        },
      });

      // Update charts (adjust based on actual API response structure)
      setOccupancyData(
        (occupancyRes.data?.timeline || []).map(item => ({
          time: item.ts
            ? new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : item.time,
          occupancy: item.count ?? item.occupancy ?? 0,
        }))
      );

      const breakdown = demographicsRes.data?.breakdown || {};

      setDemographicsData(
        Object.entries(breakdown).map(([key, value]) => ({
          gender: key,
          count: value,
        }))
      );


    } catch (error) {
      console.error("❌ Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };


  // Setup Socket.IO listeners
  useEffect(() => {
    socketService.connect();

    // Listen for alerts
    socketService.onAlert((data) => {
      console.log('received from socket Alert received:', data);
      setAlert({
        message: `${data.personName} ${data.direction} at ${data.zoneName}`,
        severity: data.severity,
        timestamp: new Date(data.ts),
      });

      // Auto-hide alert after 20 seconds
      setTimeout(() => setAlert(null), 20000);
    });

    // Listen for live occupancy updates
    socketService.onLiveOccupancy((data) => {
      if (data.siteId !== selectedSite?.siteId) return;

      setMetrics(prev => ({
        ...prev,
        occupancy: {
          ...prev.occupancy,
          value: data.siteOccupancy,
        },
      }));
    });


    return () => {
      socketService.offAlert();
      socketService.offLiveOccupancy();
    };
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [selectedSite]);

  // Format dwell time (assuming it's in minutes)
  const formatDwellTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <button
            onClick={fetchDashboardData}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Alert Banner */}
        {alert && (
          <div className={`p-4 rounded-lg border ${alert.severity === 'high'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Live Occupancy"
            value={metrics.occupancy.value}
            change={metrics.occupancy.change}
            icon="👥"
            loading={loading}
          />
          <MetricCard
            title="Today's Footfall"
            value={metrics.footfall.value}
            change={metrics.footfall.change}
            icon="🚶"
            loading={loading}
          />
          <MetricCard
            title="Average Dwell Time"
            value={formatDwellTime(metrics.dwellTime.value)}
            change={metrics.dwellTime.change}
            icon="⏱️"
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OccupancyChart data={occupancyData} loading={loading} />
          <DemographicsChart data={demographicsData} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;