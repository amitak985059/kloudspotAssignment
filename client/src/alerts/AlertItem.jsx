const severityColors = {
  high: "bg-[#B42019] text-white",
  medium: "bg-[#FF9902] text-white",
  low: "bg-[#00AB7B] text-white",
};

const AlertItem = ({ alert }) => {
  const formatAlertTime = (dateStr) => {
    const date = new Date(dateStr);

    return date
      .toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "")
      .replace(" at ", " ");
  };
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="text-xs text-gray-500 mb-1">
        {formatAlertTime(alert.time)}
      </div>

      <div className="font-semibold">
        {alert.personName} {alert.direction}
      </div>

      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
        <img className="w-[18px]" src="/alertLocationLogo.svg" alt="" />{alert.zoneName}
      </div>

      <div className="mt-2 flex justify-end">
        <div className="">
          <span
            className={`px-4 py-2 min-w-[72px] text-center rounded-sm text-xs font-semibold 
  ${severityColors[alert.severity] || "bg-gray-100"}`}
          >
            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
