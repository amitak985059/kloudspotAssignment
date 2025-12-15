const severityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const AlertItem = ({ alert }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="text-xs text-gray-500 mb-1">
        {alert.time}
      </div>

      <div className="font-semibold">
        {alert.personName} {alert.direction}
      </div>

      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
        📍 {alert.zoneName}
      </div>

      <div className="mt-2 flex justify-end">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            severityColors[alert.severity] || "bg-gray-100"
          }`}
        >
          {alert.severity}
        </span>
      </div>
    </div>
  );
};

export default AlertItem;
