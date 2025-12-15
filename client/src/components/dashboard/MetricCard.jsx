const MetricCard = ({ title, value, change, icon, loading }) => {
  const isPositive = change >= 0;

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">

          <p className="text-sm font-medium text-gray-600 mb-3">{title}</p>
          

          <p className="text-4xl font-bold text-gray-900 mb-3">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          

          {change !== undefined && (
            <div className="flex items-center">
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs yesterday</span>
            </div>
          )}
        </div>
        

        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-3xl">{icon}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;