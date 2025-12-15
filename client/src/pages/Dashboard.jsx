import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MetricCard from '../components/dashboard/MetricCard';
import OccupancyChart from '../components/dashboard/OccupancyChart';
import DemographicsChart from '../components/dashboard/DemographicsChart';
import DemographicsTimelineChart from '../components/dashboard/DemographicsTimelineChart';
import { analyticsAPI } from '../services/api';
import { useSites } from "../context/SitesContext";

const Dashboard = () => {
  const { selectedSite } = useSites();
  
  const [dateRange, setDateRange] = useState('today');
  const [customDates, setCustomDates] = useState({ from: '', to: '' });

  const [metrics, setMetrics] = useState({
    occupancy: { value: 0, change: 0 },
    footfall: { value: 0, change: 0 },
    dwellTime: { value: 0, change: 0 },
  });
  const [occupancyData, setOccupancyData] = useState([]);
  const [demographicsData, setDemographicsData] = useState([]);
  const [demographicsTimelineData, setDemographicsTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get date range in milliseconds
  const getDateRange = () => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(dateRange) {
      case 'today':
        return {
          fromUtc: today.getTime(),
          toUtc: now
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return {
          fromUtc: yesterday.getTime(),
          toUtc: yesterdayEnd.getTime()
        };
      case '7days':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          fromUtc: weekAgo.getTime(),
          toUtc: now
        };
      case '30days':
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return {
          fromUtc: monthAgo.getTime(),
          toUtc: now
        };
      case 'custom':
        if (customDates.from && customDates.to) {
          return {
            fromUtc: new Date(customDates.from).getTime(),
            toUtc: new Date(customDates.to).getTime()
          };
        }
        return { fromUtc: today.getTime(), toUtc: now };
      default:
        return { fromUtc: today.getTime(), toUtc: now };
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (!selectedSite?.siteId) return;

    try {
      setLoading(true);

      const { fromUtc, toUtc } = getDateRange();

      const payload = {
        siteId: selectedSite.siteId,
        fromUtc: fromUtc,
        toUtc: toUtc,
      };

      console.log("📤 Dashboard API payload:", payload);

      const [occupancyRes, footfallRes, dwellRes, demographicsRes] = 
        await Promise.all([
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

      // Calculate current occupancy from latest bucket
      let currentOccupancy = 0;
      if (occupancyRes?.buckets?.length > 0) {
        const latestBucket = occupancyRes.buckets[occupancyRes.buckets.length - 1];
        currentOccupancy = Math.round(latestBucket.avg);
      }

      // Set metrics
      setMetrics({
        occupancy: {
          value: currentOccupancy,
          change: 0,
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


      if (occupancyRes?.buckets) {
        const chartData = occupancyRes.buckets.map(bucket => ({
          time: bucket.local.split(' ')[1].substring(0, 5),
          timestamp: bucket.utc,
          occupancy: Math.round(bucket.avg),
        }));
        setOccupancyData(chartData);
      }


      if (demographicsRes?.buckets) {
        let totalMale = 0;
        let totalFemale = 0;

        demographicsRes.buckets.forEach(bucket => {
          totalMale += bucket.male || 0;
          totalFemale += bucket.female || 0;
        });

        setDemographicsData([
          { name: 'Male', value: Math.round(totalMale) },
          { name: 'Female', value: Math.round(totalFemale) },
        ]);

        setDemographicsTimelineData(demographicsRes.buckets);
      }

    } catch (error) {
      console.error("Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (selectedSite?.siteId) {
      fetchDashboardData();
    }
  }, [selectedSite, dateRange, customDates]);

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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Overview</h2>
            <p className="text-sm text-gray-500">Occupancy</p>
          </div>
          

          <div className="flex items-center space-x-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

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
        </div>


        {dateRange === 'custom' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={customDates.from}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={customDates.to}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="pt-5">
                <button
                  onClick={fetchDashboardData}
                  className="btn-primary"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}


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
            title="Avg Dwell Time"
            value={formatDwellTime(metrics.dwellTime.value)}
            change={metrics.dwellTime.change}
            icon="⏱️"
            loading={loading}
          />
        </div>


        <div className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Occupancy</h3>
        </div>


        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <OccupancyChart data={occupancyData} loading={loading} />
        </div>


        <div className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900">Demographics</h3>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">Chart of Demographics</h4>
            <DemographicsChart data={demographicsData} loading={loading} />
          </div>


          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">Demographics Analysis</h4>
            <DemographicsTimelineChart data={demographicsTimelineData} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;