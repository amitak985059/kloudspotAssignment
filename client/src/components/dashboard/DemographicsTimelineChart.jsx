import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';


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
  <ResponsiveContainer width="100%" height={320}>
    <AreaChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
    >
      <defs>
        <linearGradient id="maleGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7FB2B1" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#7FB2B1" stopOpacity={0.05} />
        </linearGradient>

        <linearGradient id="femaleGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B5E0DF" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#B5E0DF" stopOpacity={0.05} />
        </linearGradient>
      </defs>

      <CartesianGrid
        stroke="#e5e7eb"
        strokeDasharray="4 4"
        vertical={false}
      />

      <XAxis
        dataKey="time"
        tick={{ fill: '#6b7280', fontSize: 12 }}
        axisLine={{ stroke: '#e5e7eb' }}
        tickLine={false}
        label={{
              value: "Time",
              position: "insideBottom",
              offset: -5,
              fill: "#374151",
              fontSize: 13
            }}
      />

      <YAxis
        tick={{ fill: '#6b7280', fontSize: 12 }}
        axisLine={false}
        tickLine={false}
        label={{
          value: 'Count',
          angle: -90,
          position: 'insideLeft',
          fill: '#374151',
          fontSize: 12
        }}
      />

      <Tooltip content={<CustomTooltip />} />

      <Legend
        verticalAlign="top"
        align="right"
        iconType="circle"
        wrapperStyle={{ fontSize: '14px' }}
      />

      <Area
        type="monotone"
        dataKey="male"
        stroke="#7FB2B1"
        strokeWidth={2.5}
        fill="url(#maleGradient)"
        name="Male"
        dot={false}
        activeDot={false}
      />

      <Area
        type="monotone"
        dataKey="female"
        stroke="#B5E0DF"
        strokeWidth={2.5}
        fill="url(#femaleGradient)"
        name="Female"
        dot={false}
        activeDot={false}
      />
    </AreaChart>
  </ResponsiveContainer>
</div>

  );
};

export default DemographicsTimelineChart;