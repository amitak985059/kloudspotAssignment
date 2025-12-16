import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';


const OccupancyChart = ({ data, loading}) => {


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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            Time: {payload[0].payload.time}
          </p>
          <p className="text-sm text-gray-600">
            Occupancy: <span className="font-semibold text-primary-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 40, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7FB2B1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#7FB2B1" stopOpacity={0.05} />
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
              value: "Count",
              angle: -90,
              position: "insideLeft",
              fill: "#374151",
              fontSize: 13
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '14px' }}
          />

          {/* LIVE vertical line */}
          <ReferenceLine
            x={data[data.length - 1]?.time}
            stroke="#b91c1c"
            strokeDasharray="4 4"
            label={{
              value: "LIVE",
              position: "top",
              fill: "#ffffff",
              fontSize: 12,
              background: "#b91c1c"
            }}
          />

          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="#7FB2B1"
            strokeWidth={2.5}
            fill="url(#occupancyGradient)"
            name="Occupancy"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>


  );
};

export default OccupancyChart;