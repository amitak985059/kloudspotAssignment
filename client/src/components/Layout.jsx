import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../context/SitesContext";
import { useState, useEffect } from "react";
import socketService from "../services/socket";
import AlertsPanel from "../alerts/AlertsPanel";

const Layout = ({ children }) => {
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { sites, selectedSite, setSelectedSite, loading } = useSites();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Overview", icon: "/homeIcon.svg" },
    { path: "/entries", label: "Crowd Entries", icon: "/crowdIcon.svg" },
  ];
  useEffect(() => {
    socketService.connect();

    socketService.onAlert((data) => {
      const newAlert = {
        personName: data.personName,
        direction: data.direction,
        zoneName: data.zoneName,
        severity: data.severity,
        time: new Date(data.ts).toLocaleString(),
      };

      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => {
      socketService.offAlert();
    };
  }, []);


  return (
    <div className="flex min-h-screen">
      <aside
        className={`bg-[#0D3C3F] text-white flex flex-col justify-between ${open ? "w-64" : "w-22"
          } transition-all duration-300`}
      >
        <div>
          <div className="flex w-full p-4 items-center justify-between">
            {open && <img src="/logoKloudspot.svg" alt="logo" />}
            <button onClick={() => setOpen(!open)}>
              <img className="w-8" src="/menu-line-horizontal.svg" alt="menu" />
            </button>
          </div>

          <nav className="mt-6 space-y-1 px-4">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex rounded-lg font-medium transition
                  ${location.pathname === item.path
                    ? "bg-white/20 text-white"
                    : "text-gray-200 hover:bg-white/10"
                  }`}
              >
                <div className="flex p-4 items-center gap-4 w-full">
                  <img className="w-6" src={item.icon} alt="" />
                  {open && <span>{item.label}</span>}
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex w-full p-4 gap-4 hover:bg-white/10 rounded-lg"
          >
            <img src="/logoutIcon.svg" alt="" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Crowd Solutions
            </h1>
            <select
              disabled={loading}
              value={selectedSite?.siteId || ""}
              onChange={(e) => {
                const site = sites.find(
                  s => s.siteId === e.target.value
                );
                setSelectedSite(site);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D3C3F]"
            >
              {loading && <option>Loading sites...</option>}

              {!loading &&
                sites.map(site => (
                  <option key={site.siteId} value={site.siteId}>
                    {site.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-gray-100 rounded-full" onClick={() => setShowAlerts(true)}>
              <img src="/alertIcon.svg" alt="alerts" />
            </button>
            <button className="p-2 bg-gray-100 rounded-full">
              <img src="/Profile.svg" alt="profile" />
            </button>
          </div>
        </header>
        <div className="p-8">{children}</div>{showAlerts && (
          <AlertsPanel
            alerts={alerts}
            onClose={() => setShowAlerts(false)}
          />
        )}

      </main>
    </div>
  );
};

export default Layout;
