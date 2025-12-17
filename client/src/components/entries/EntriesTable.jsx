import { format } from 'date-fns';

const EntriesTable = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Gender', 'Entry Time', 'Exit Time', 'Dwell Time'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                {[...Array(5)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No entries found</h3>
        <p className="mt-1 text-sm text-gray-500">No visitor data available for the selected period.</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '--';
    try {
      let date;
      if (timestamp.includes('/')) {
        const [datePart, timePart] = timestamp.split(' ');
        const [day, month, year] = datePart.split('/');
        date = new Date(`${year}-${month}-${day}T${timePart}`);
      } else {
        date = new Date(timestamp);
      }
      return format(date, 'hh:mm a');
    } catch {
      return timestamp;
    }
  };

  const formatDwellTime = (minutes) => {
    if (!minutes && minutes !== 0) return '--';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="overflow-x-auto max-w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#E8E8E8]">
          <tr>
            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sex
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entry
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exit
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dwell Time
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((entry, index) => (
            <tr key={entry.id || index} className="hover:bg-gray-50">
              {/* Name */}
              <td className="px-6 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {entry.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.personName || 'Unknown'}
                    </div>
                  </div>
                </div>
              </td>

              {/* Sex */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {entry.gender
                  ? entry.gender.charAt(0).toUpperCase() + entry.gender.slice(1)
                  : 'N/A'}
              </td>

              {/* Entry */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {formatTime(entry.entryLocal)}
              </td>

              {/* Exit */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {entry.exitLocal ? formatTime(entry.exitLocal) : '--'}
              </td>

              {/* Dwell */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {entry.exitLocal ? formatDwellTime(entry.dwellMinutes) : '--'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntriesTable;
