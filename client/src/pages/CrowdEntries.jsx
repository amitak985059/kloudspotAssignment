import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EntriesTable from '../components/entries/EntriesTable';
import { analyticsAPI } from '../services/api';
import { PAGINATION } from '../utils/constants';
import { useSites } from "../context/SitesContext";

const CrowdEntries = () => {
  const { selectedSite } = useSites();

  const [dateRange, setDateRange] = useState('today');
  const [customDates, setCustomDates] = useState({ from: '', to: '' });
  
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: PAGINATION.DEFAULT_PAGE,
    totalPages: 1,
    totalRecords: 0,
    limit: PAGINATION.DEFAULT_LIMIT,
  });

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

  const fetchEntries = async (page = 1) => {
    if (!selectedSite?.siteId) return;

    try {
      setLoading(true);

      const { fromUtc, toUtc } = getDateRange();

      const payload = {
        siteId: selectedSite.siteId,
        fromUtc: fromUtc,
        toUtc: toUtc,
        pageSize: pagination.limit,
        pageNumber: page,
      };

      console.log("Entry/Exit API payload:", payload);

      const data = await analyticsAPI.getEntryExit(payload);
      console.log("Entry/Exit API response:", data);

      setEntries(data.records || []);

      setPagination({
        currentPage: data.pageNumber || page,
        totalPages: data.totalPages || 1,
        totalRecords: data.totalRecords || 0,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Entry/Exit API Error:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetching entries when site or date range changes
  useEffect(() => {
    if (selectedSite?.siteId) {
      fetchEntries(1);
    }
  }, [selectedSite, dateRange, customDates]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchEntries(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
    fetchEntries(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            <p className="text-sm text-gray-500 mt-1">
              View detailed entry and exit records for all visitors
            </p>
          </div>

          {/* Date Range Selector */}
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
              
            </div>

            
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
                  onClick={() => fetchEntries(1)}
                  className="btn-primary"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}


        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">
                {entries.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}
              </span> to <span className="font-medium text-gray-900">
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)}
              </span> of <span className="font-medium text-gray-900">
                {pagination.totalRecords}
              </span> entries
            </div>


            
          </div>
        </div>


        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EntriesTable data={entries} loading={loading} />
        </div>


        {pagination.totalPages > 1 && (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div className="flex items-center justify-center space-x-3">

      {/* Previous */}
      <button
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1 || loading}
        className="text-gray-600 disabled:opacity-30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      <div className="flex items-center space-x-4">
        {[...Array(pagination.totalPages)].map((_, i) => {
          const page = i + 1;

          const isVisible =
            page === 1 ||
            page === pagination.totalPages ||
            (page >= pagination.currentPage - 1 &&
              page <= pagination.currentPage + 1);

          if (!isVisible) {
            if (
              page === pagination.currentPage - 2 ||
              page === pagination.currentPage + 2
            ) {
              return (
                <span key={page} className="text-gray-400">
                  …
                </span>
              );
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={loading}
              className={`px-1 pb-1 text-sm font-medium transition
                ${
                  pagination.currentPage === page
                    ? 'text-black border-b-2 border-[#009490]'
                    : 'text-gray-600 hover:text-black'
                }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages || loading}
        className="text-gray-600 disabled:opacity-30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
)}

      </div>
    </Layout>
  );
};

export default CrowdEntries;