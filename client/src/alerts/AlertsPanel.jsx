import AlertItem from "./AlertItem";

const AlertsPanel = ({ alerts, onClose }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-[360px] bg-white border-l shadow-xl z-50 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Alerts</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black">
          ✕
        </button>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {alerts.length === 0 && (
          <p className="text-sm text-gray-500">No alerts</p>
        )}

        {alerts.map((alert, index) => (
          <AlertItem key={index} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
