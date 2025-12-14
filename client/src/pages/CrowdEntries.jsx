import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EntriesTable from '../components/entries/EntriesTable';
import { analyticsAPI } from '../services/api';
import { PAGINATION } from '../utils/constants';
import { useSites } from "../context/SitesContext";


const CrowdEntries = () => {
  const { selectedSite, loading: sitesLoading } = useSites();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: PAGINATION.DEFAULT_PAGE,
    totalPages: 1,
    totalRecords: 0,
    limit: PAGINATION.DEFAULT_LIMIT,
  });

  const fetchEntries = async (page = 1) => { // this could change page = any number
    if (!selectedSite?.siteId) return;

    try {
      setLoading(true);

      const now = Math.floor(Date.now());
      const last24Hours = now - 24 * 60 * 60 * 1000;

      const payload = {
        siteId: selectedSite.siteId,
        fromUtc: last24Hours,
        toUtc: now,
        pageSize: pagination.limit,
        pageNumber: page,
      };

      const data = await analyticsAPI.getEntryExit(payload);
      setEntries(data.records || []);

      setPagination({
        currentPage: data.pageNumber || page,
        totalPages: data.totalPages || 1,
        totalRecords: data.totalRecords || 0,
        limit: pagination.limit,
      });
    } catch (error) {
      console.error("Entry/Exit API Error:", error);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
  if (!selectedSite) return;
  fetchEntries(1);
}, [selectedSite]);



  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchEntries(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchEntries(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crowd Entries</h2>
            <p className="text-sm text-gray-600 mt-1">
              View detailed entry and exit records for all visitors
            </p>
          </div>
          <div className="flex items-center space-x-4">
            
            <button
              onClick={() => fetchEntries(pagination.currentPage)}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing <span className="font-medium text-gray-900">
                {entries.length > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0}
              </span> to <span className="font-medium text-gray-900">
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)}
              </span> of <span className="font-medium text-gray-900">
                {pagination.totalRecords}
              </span> entries
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <EntriesTable data={entries} loading={loading} />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm ${pagination.currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === pagination.currentPage - 2 ||
                    pageNum === pagination.currentPage + 2
                  ) {
                    return <span key={pageNum} className="text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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