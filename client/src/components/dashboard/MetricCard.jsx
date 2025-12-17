const MetricCard = ({ title, value, change, loading }) => {
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
                  <img src="/up.svg" alt="" />
                ) : (
                  <img src="/down.svg" alt="" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">More than yesterday</span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default MetricCard;