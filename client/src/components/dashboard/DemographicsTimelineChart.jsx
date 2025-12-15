import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DemographicsTimelineChart = ({ data, loading }) => {
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

  // Filter out buckets with zero values
  const chartData = data
    .filter(bucket => bucket.male > 0 || bucket.female > 0)
    .map(bucket => ({
      time: bucket.local.split(' ')[1].substring(0, 5), // "04:00"
      male: Math.round(bucket.male),
      female: Math.round(bucket.female),
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Time: {payload[0].payload.time}
          </p>
          <div className="space-y-1">
            <p className="text-sm flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Male: <span className="font-semibold ml-1">{payload[0].value}</span>
            </p>
            <p className="text-sm flex items-center">
              <span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span>
              Female: <span className="font-semibold ml-1">{payload[1].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="line"
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Line 
            type="monotone" 
            dataKey="male" 
            stroke="#60a5fa" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }}
            name="Male"
          />
          <Line 
            type="monotone" 
            dataKey="female" 
            stroke="#f472b6" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#f472b6', strokeWidth: 0 }}
            name="Female"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DemographicsTimelineChart;