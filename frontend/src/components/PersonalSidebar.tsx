import { Home, User, Bell, Settings, Search, LogOut, Bot } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";

const PersonalSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
//
// Helper function to check if a path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  return (
    <>
      <aside className="drop-shadow-xl bg-white text-black border-rose-gold-accent-border border h-fit future-feed:bg-black future-feed:border-lime future-feed:text-lime dark:bg-indigo-950 dark:border-slate-200 dark:text-slate-100 w-[200px] p-6 ml-4 rounded-lg border-2 shadow-md hidden lg:block mt-5">
        <div className="text-2xl text-blue-500 future-feed:text-lime font-bold mb-6 dark:text-slate-200">Future Feed</div>
        <nav className="future-feed:text-lime font-bold flex flex-col space-y-4 text-lg dark:text-slate-200">
          <Link to="/home" className={`flex items-center gap-3 dark:hover:text-white ${
              isActivePath('/home') ? 'text-blue-500 dark:text-blue-400' : ''
            }`}
          ><Home size={20} /> Home
          </Link>
          <Link to="/profile"  className={`flex items-center gap-3 dark:hover:text-white ${
              isActivePath('/profile') ? 'text-blue-500 dark:text-blue-400' : ''
            }`}
          > <User size={20} /> Profile
          </Link>
          <Link to="/bots"  className={`flex items-center gap-3 dark:hover:text-white ${
              isActivePath('/bots') ? 'text-blue-500 dark:text-blue-400' : ''
            }`}
          > <Bot size={20} /> My Bots
          </Link>
          <Link to="/notifications"  className={`flex items-center gap-3 dark:hover:text-white relative ${
              isActivePath('/notifications') ? 'text-blue-500 dark:text-blue-400' : ''
            }`}
          > <Bell size={20} /> Notifications
            {unreadCount > 0 && (
              <span className="absolute mb-4 ml-2.5 w-3 h-3 rounded-full bg-blue-500 future-feed:bg-white"></span>
            )}
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 dark:hover:text-white ${
              isActivePath('/settings') ? 'text-blue-500 dark:text-blue-400' : ''
            }`}
          > <Settings size={20} /> Settings
          </Link>
          <Link to="/explore" className={`flex items-center gap-3 dark:hover:text-white ${
              isActivePath('/explore') ? 'text-blue-500 dark:text-blue-400' : ''
            }`}
          > <Search size={20} /> Explore
          </Link>
          <button
            onClick={handleLogout}
            className="text-black future-feed:text-lime flex items-center gap-3  dark:text-slate-200 hover:text-red-500 dark:hover:text-red-400 hover:cursor-pointer"
          >
            <LogOut  size={20} /> Logout
          </button>
        </nav>
      </aside>

      {/* Fixed mobile navigation - removed duplicate nav element */}
      <nav className="fixed bottom-0 w-full flex justify-around items-center future-feed:bg-black future-feed:border-lime future-feed:text-lime dark:bg-indigo-950 border-3 rounded-xl border-rose-gold-accent-border drop-shadow-xl text-black dark:border-slate-200 p-2 lg:hidden z-50 bg-white dark:text-white ">
        <Link to="/home" className={`flex flex-col items-center relative hover:text-blue-200 ${
            isActivePath('/home') ? 'text-blue-500 dark:text-blue-400' : ''
          }`}
        > <Home strokeWidth={3} className="w-5 h-5" />
        </Link>
        <Link to="/profile"  className={`flex items-center gap-3 dark:hover:text-blue-500 hover:text-blue-200 ${
            isActivePath('/profile') ? 'text-blue-500 dark:text-blue-400' : ''
          }`}
        > <User strokeWidth={3} className="w-5 h-5" />
        </Link>

        <Link to="/bots" className={`flex items-center gap-3 dark:hover:text-white hover:text-blue-200 ${
            isActivePath('/bots') ? 'text-blue-500 dark:text-blue-400' : ''
          }`}
        > <Bot strokeWidth={3} className="w-5 h-5" />
          </Link>
        <Link to="/notifications" className={`flex items-center gap-3 relative hover:text-blue-200 ${
            isActivePath('/notifications') ? 'text-blue-500 dark:text-blue-400' : ''
          }`}
        > <Bell strokeWidth={3} className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 future-feed:bg-white"></span>
          )}
        </Link>
        <Link to="/settings" className={`flex items-center gap-3 hover:text-blue-200 ${
            isActivePath('/settings') ? 'text-blue-500 dark:text-blue-400' : ''
          }`}
        > <Settings strokeWidth={3} className="w-5 h-5" />
        </Link>
        <Link to="/explore" className={`flex flex-col items-center hover:text-blue-200 ${
            isActivePath('/explore') ? 'text-blue-500 dark:text-blue-400' : ''
          }`}
        > <Search strokeWidth={3} className="w-5 h-5" />
        </Link>
      </nav>
    </>
  );
};

export default PersonalSidebar;