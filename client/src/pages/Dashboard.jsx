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

      // CRITICAL: API expects milliseconds, not seconds
      const now = Date.now(); // milliseconds
      const fromUtc = now - (24 * 60 * 60 * 1000); // 24 hours ago in milliseconds

      const payload = {
        siteId: selectedSite.siteId,
        fromUtc: fromUtc,
        toUtc: now,
      };

      console.log("📤 Dashboard API payload:", payload);

      const [
        occupancyRes,
        footfallRes,
        dwellRes,
        demographicsRes,
      ] = await Promise.all([
        analyticsAPI.getOccupancy(payload).catch(err => {
          console.error("Occupancy error:", err);
          return null;
        }),
        analyticsAPI.getFootfall(payload).catch(err => {
          console.error("Footfall error:", err);
          return null;
        }),
        analyticsAPI.getDwellTime(payload).catch(err => {
          console.error("Dwell error:", err);
          return null;
        }),
        analyticsAPI.getDemographics(payload).catch(err => {
          console.error("Demographics error:", err);
          return null;
        }),
      ]);

      console.log("API Responses:", {
        occupancy: occupancyRes,
        footfall: footfallRes,
        dwell: dwellRes,
        demographics: demographicsRes
      });

      // Calculate current occupancy from latest bucket
      let currentOccupancy = 0;
      if (occupancyRes && occupancyRes.buckets && occupancyRes.buckets.length > 0) {
        const latestBucket = occupancyRes.buckets[occupancyRes.buckets.length - 1];
        currentOccupancy = Math.round(latestBucket.avg);
      }

      // Set metrics with correct field names from actual API responses
      setMetrics({
        occupancy: {
          value: currentOccupancy,
          change: 0, // API doesn't provide change percentage
        },
        footfall: {
          value: footfallRes?.footfall ?? 0, 
          change: 0,
        },
        dwellTime: {
          value: dwellRes?.avgDwellMinutes ?? 0,
          change: 0,
        },
      });

      // Extract occupancy chart data from buckets
      if (occupancyRes && occupancyRes.buckets) {
        const chartData = occupancyRes.buckets.map(bucket => ({
          time: bucket.local.split(' ')[1], // Extract time part "04:00:00"
          timestamp: bucket.utc,
          occupancy: Math.round(bucket.avg),
        }));
        setOccupancyData(chartData);
        console.log("📊 Occupancy chart data:", chartData.length, "points");
      }

      // Extract demographics chart data from buckets
      // Calculate totals across all time buckets
      if (demographicsRes && demographicsRes.buckets) {
        let totalMale = 0;
        let totalFemale = 0;

        demographicsRes.buckets.forEach(bucket => {
          totalMale += bucket.male || 0;
          totalFemale += bucket.female || 0;
        });

        const demographicsChartData = [
          { name: 'Male', value: Math.round(totalMale), gender: 'male' },
          { name: 'Female', value: Math.round(totalFemale), gender: 'female' },
        ];

        setDemographicsData(demographicsChartData);
        console.log("📊 Demographics chart data:", demographicsChartData);
      }

    } catch (error) {
      console.error("Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup Socket.IO listeners
  useEffect(() => {
    socketService.connect();

    // Listen for alerts
    socketService.onAlert((data) => {
      console.log(' Alert received:', data);
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
      console.log('Live occupancy update:', data);
      
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
  }, [selectedSite]);

  // Fetch data when site changes
  useEffect(() => {
    if (selectedSite?.siteId) {
      console.log("🔄 Site changed, fetching data for:", selectedSite);
      fetchDashboardData();
    }
  }, [selectedSite]);

  // Format dwell time
  const formatDwellTime = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
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
            disabled={loading}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Alert Banner */}
        {alert && (
          <div className={`p-4 rounded-lg border ${
            alert.severity === 'high'
              ? 'bg-red-50 border-red-200 text-red-700'
              : alert.severity === 'medium'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{alert.message}</span>
              </div>
              <button
                onClick={() => setAlert(null)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
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