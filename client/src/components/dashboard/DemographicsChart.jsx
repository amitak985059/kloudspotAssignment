import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  Male: '#7FB2B1',
  Female: '#B5E0DF',
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
        <div style={{ width: '260px', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={6}
                cornerRadius={12}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>


              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-500 text-sm"
              >
                Total Crowd
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-900 text-xl font-semibold"
              >
                100%
              </text>
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
                <img
                  src={item.name === 'Male' ? '/male.svg' : '/female.svg'}
                  alt={item.name}
                  className="w-5 h-5"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {item.percentage}% {item.name}s
              </span>
            </div>

          </div>
        ))}
      </div>


      
    </div>
  );
};

export default DemographicsChart;