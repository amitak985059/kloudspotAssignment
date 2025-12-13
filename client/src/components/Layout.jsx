import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setopen] = useState(false)
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

      <aside className={`bg-[#0D3C3F] text-white flex flex-col justify-between ${open ? "w-64" : "w-22"} transition-width duration-300`}>
        <div>
          <div className="flex w-full h-22 p-4 items-center justify-between ">

            <div className={` ${open ? "" : "hidden"}`}>
              <img src="/logoKloudspot.svg" className="" alt="logo" />

            </div>
            <div className="w-fit cursor-pointer" onClick={() => setopen(!open)}>
              <img className="w-8" src="/menu-line-horizontal.svg" alt="" />
            </div>
          </div>

          <nav className="mt-6 space-y-1 px-4">
            {navItems.map((item) => (
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
                  <div className="w-8 cursor-pointer"><img className="" src={item.icon} alt="" /></div>
                  {open && <span>{item.label}</span>}
                </div>

              </Link>
            ))}
          </nav>
        </div>

       
        <div className="flex w-full p-4 ">
          <button className="flex w-full p-4 gap-4 hover:bg-white/10 rounded-lg" onClick={handleLogout}>
            <img src="/logoutIcon.svg" alt="" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50">
        <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-gray-800">
            <h1 className="text-xl font-semibold">Crowd Solutions</h1>

            <button className="px-4 py-2 border rounded-lg bg-gray-100 text-sm">
              Avenue Mall
            </button>
          </div>


          <div className="flex items-center space-x-4">
            <button className="p-2 bg-gray-100 rounded-full"><img src="/alertIcon.svg" alt="" /></button>
            <button className="p-2 bg-gray-100 rounded-full"><img src="/Profile.svg" alt="" /></button>
          </div>
        </header>


        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
