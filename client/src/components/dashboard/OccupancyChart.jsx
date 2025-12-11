import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const OccupancyChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Timeline</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Format data for chart
  const formattedData = data.map(item => ({
    ...item,
    time: item.timestamp ? format(new Date(item.timestamp), 'HH:mm') : item.time,
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="occupancy" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', r: 4 }}
            activeDot={{ r: 6 }}
            name="Occupancy"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyChart;