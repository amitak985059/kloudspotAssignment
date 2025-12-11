import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/dashboard/MetricCard';
import OccupancyChart from '../components/dashboard/OccupancyChart';
import DemographicsChart from '../components/dashboard/DemographicsChart';
import { analyticsAPI } from '../services/api';
import socketService from '../services/socket';

const Dashboard = () => {
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
    try {
      setLoading(true);

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const params = {
        startDate: startOfDay,
        endDate: endOfDay,
      };

      // Fetch all data in parallel
      const [occupancyRes, footfallRes, dwellRes, demographicsRes] = await Promise.all([
        analyticsAPI.getOccupancy(params),
        analyticsAPI.getFootfall(params),
        analyticsAPI.getDwellTime(params),
        analyticsAPI.getDemographics(params),
      ]);

      // Update metrics (adjust based on actual API response structure)
      setMetrics({
        occupancy: {
          value: occupancyRes.data?.current || occupancyRes.current || 0,
          change: occupancyRes.data?.change || occupancyRes.change || 0,
        },
        footfall: {
          value: footfallRes.data?.total || footfallRes.total || 0,
          change: footfallRes.data?.change || footfallRes.change || 0,
        },
        dwellTime: {
          value: dwellRes.data?.average || dwellRes.average || 0,
          change: dwellRes.data?.change || dwellRes.change || 0,
        },
      });

      // Update charts (adjust based on actual API response structure)
      setOccupancyData(occupancyRes.data?.timeline || occupancyRes.timeline || []);
      setDemographicsData(demographicsRes.data?.breakdown || demographicsRes.breakdown || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup Socket.IO listeners
  useEffect(() => {
    socketService.connect();

    // Listen for alerts
    socketService.onAlert((data) => {
      console.log('Alert received:', data);
      setAlert({
        message: `${data.action} detected in ${data.zone}`,
        severity: data.severity,
        timestamp: new Date(),
      });

      // Auto-hide alert after 5 seconds
      setTimeout(() => setAlert(null), 5000);
    });

    // Listen for live occupancy updates
    socketService.onLiveOccupancy((data) => {
      console.log('Live occupancy update:', data);
      setMetrics(prev => ({
        ...prev,
        occupancy: {
          ...prev.occupancy,
          value: data.count || data.occupancy,
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
  }, []);

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
          <div className={`p-4 rounded-lg border ${
            alert.severity === 'high' 
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