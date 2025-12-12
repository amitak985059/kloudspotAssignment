import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setopen] = useState(true)
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Overview", icon: "📊" },
    { path: "/entries", label: "Crowd Entries", icon: "👥" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <aside className={`bg-[#0D3C3F] text-white flex flex-col justify-between ${open ? "w-64" : "w-16"} transition-width duration-300`}>

        {/* Top Logo */}
        <div>
          <div className="flex place-items-stretch">
            <div className="space-y-1 p-6 rounded cursor-pointer" onClick={() => setopen(!open)}>
              <div className="w-6 h-[3px] bg-black"></div>
              <div className="w-6 h-[3px] bg-black"></div>
              <div className="w-6 h-[3px] bg-black"></div>
            </div>
            <div className="px-6 py-6 flex items-center space-x-3 border-b border-white/10">
              <img src="/logoKloudspot.png" className="h-8" alt="logo" />
              <h2 className="text-lg font-semibold">kloudspot</h2>
            </div>
          </div>


          {/* Menu */}
          <nav className="mt-6 space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition 
                          ${location.pathname === item.path
                    ? "bg-white/20 text-white"
                    : "text-gray-200 hover:bg-white/10"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Logout */}
        <div className="px-6 py-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <span>⏻</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ---------------- RIGHT CONTENT AREA ---------------- */}
      <main className="flex-1 bg-gray-50">
        {/* Top Header */}
        <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-gray-800">
            <h1 className="text-xl font-semibold">Crowd Solutions</h1>

            {/* Fake Dropdown Like Screenshot */}
            <button className="px-4 py-2 border rounded-lg bg-gray-100 text-sm">
              📍 Avenue Mall
            </button>
          </div>

          {/* Icons (placeholder) */}
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 bg-gray-100 rounded-full">👤</button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
