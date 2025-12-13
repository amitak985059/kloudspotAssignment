import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../context/SitesContext";
import { useState } from "react";

const Layout = ({ children }) => {
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

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside
        className={`bg-[#0D3C3F] text-white flex flex-col justify-between ${
          open ? "w-64" : "w-22"
        } transition-all duration-300`}
      >
        <div>
          {/* LOGO + TOGGLE */}
          <div className="flex w-full p-4 items-center justify-between">
            {open && <img src="/logoKloudspot.svg" alt="logo" />}
            <button onClick={() => setOpen(!open)}>
              <img className="w-8" src="/menu-line-horizontal.svg" alt="menu" />
            </button>
          </div>

          {/* NAV */}
          <nav className="mt-6 space-y-1 px-4">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex rounded-lg font-medium transition
                  ${
                    location.pathname === item.path
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

        {/* LOGOUT */}
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

      {/* MAIN */}
      <main className="flex-1 bg-gray-50">
        {/* HEADER */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Crowd Solutions
            </h1>

            {/* SITE SELECT */}
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

          {/* ACTION ICONS */}
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-gray-100 rounded-full">
              <img src="/alertIcon.svg" alt="alerts" />
            </button>
            <button className="p-2 bg-gray-100 rounded-full">
              <img src="/Profile.svg" alt="profile" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
