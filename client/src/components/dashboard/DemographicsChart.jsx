import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  Male: '#60a5fa',
  Female: '#f472b6',
  male: '#60a5fa',
  female: '#f472b6',
};

const DemographicsChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  // Calculate ing the total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const pieData = data.map(item => ({
    name: item.name,
    value: item.value,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  // Custom label for the pie chart
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="w-full">

      <div className="flex justify-center mb-4">
        <div style={{ width: '280px', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="flex flex-col space-y-3 mt-4">
        {pieData.map((item, index) => (
          <div key={index} className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">

              <div 
                className="flex items-center justify-center w-8 h-8 rounded"
                style={{ backgroundColor: COLORS[item.name] + '20' }}
              >
                {item.name === 'Male' ? (
                  <svg className="w-5 h-5" style={{ color: COLORS[item.name] }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 9c0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.7-1.3 3-3 3s-3-1.3-3-3zm3 11c-2.8 0-8-1.4-8-4.2V15h16v.8c0 2.8-5.2 4.2-8 4.2z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" style={{ color: COLORS[item.name] }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {item.percentage}% {item.name}s
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>


      {/* <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">Total Crowd</p>
        <p className="text-2xl font-bold text-gray-900">{total}</p>
      </div> */}
    </div>
  );
};

export default DemographicsChart;