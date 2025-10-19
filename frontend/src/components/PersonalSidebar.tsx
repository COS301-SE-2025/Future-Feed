import { Home, User, Bell, Settings, Search, LogOut, Bot } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";

const PersonalSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  return (
    <>
      <aside className="drop-shadow-xl bg-white text-black border-rose-gold-accent-border border h-fit future-feed:bg-black future-feed:border-lime future-feed:text-lime  w-[200px] p-6 ml-4 rounded-lg border-2 shadow-md hidden lg:block mt-5">
        <div className="text-2xl text-blue-500 future-feed:text-lime font-bold mb-6">Future Feed</div>
        <nav className="future-feed:text-lime font-bold flex flex-col space-y-4 text-lg">
          <Link to="/home" className={`flex items-center gap-3 ${isActivePath('/home') ? 'text-blue-500' : ''
            }`}
          ><Home size={20} /> Home
          </Link>
          <Link to="/profile" className={`flex items-center gap-3 ${isActivePath('/profile') ? 'text-blue-500' : ''
            }`}
          > <User size={20} /> Profile
          </Link>
          <Link to="/bots" className={`flex items-center gap-3 ${isActivePath('/bots') ? 'text-blue-500' : ''
            }`}
          > <Bot size={20} /> My Bots
          </Link>
          <Link to="/notifications" className={`flex items-center gap-3 ${isActivePath('/notifications') ? 'text-blue-500' : ''
            }`}
          >
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 future-feed:bg-white animate-bounce`}></span>
              )}
            </div>
            Notifications
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 ${isActivePath('/settings') ? 'text-blue-500' : ''
            }`}
          > <Settings size={20} /> Settings
          </Link>
          <Link to="/explore" className={`flex items-center gap-3 ${isActivePath('/explore') ? 'text-blue-500 ' : ''
            }`}
          > <Search size={20} /> Explore
          </Link>
          <button
            onClick={handleLogout}
            className="text-black future-feed:text-lime flex items-center gap-3 hover:text-red-500 hover:cursor-pointer"
          >
            <LogOut size={20} /> Logout
          </button>
        </nav>
      </aside>
      <nav className="fixed bottom-0 w-full flex justify-around items-center future-feed:bg-black future-feed:border-lime future-feed:text-lime border-3 rounded-xl border-rose-gold-accent-border drop-shadow-xl text-black p-2 lg:hidden z-50 bg-white">
        <Link to="/home" className={`flex flex-col items-center relative hover:text-blue-200 ${isActivePath('/home') ? 'text-blue-500' : ''
          }`}
        > <Home strokeWidth={3} className="w-5 h-5" />
        </Link>
        <Link to="/profile" className={`flex items-center gap-3 hover:text-blue-200 ${isActivePath('/profile') ? 'text-blue-500 ' : ''
          }`}
        > <User strokeWidth={3} className="w-5 h-5" />
        </Link>

        <Link to="/bots" className={`flex items-center gap-3 hover:text-blue-200 ${isActivePath('/bots') ? 'text-blue-500' : ''
          }`}
        > <Bot strokeWidth={3} className="w-5 h-5" />
        </Link>
        <Link
          to="/notifications"
          className={`flex items-center gap-3 relative hover:text-blue-200 ${isActivePath('/notifications') ? 'text-blue-500' : ''
            }`}
        >
          <div className="relative">
            <Bell strokeWidth={3} className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 future-feed:bg-white animate-bounce"></span>
            )}
          </div>
        </Link>
        <Link to="/settings" className={`flex items-center gap-3 hover:text-blue-200 ${isActivePath('/settings') ? 'text-blue-500' : ''
          }`}
        > <Settings strokeWidth={3} className="w-5 h-5" />
        </Link>
        <Link to="/explore" className={`flex flex-col items-center hover:text-blue-200 ${isActivePath('/explore') ? 'text-blue-500' : ''
          }`}
        > <Search strokeWidth={3} className="w-5 h-5" />
        </Link>
      </nav>
    </>
  );
};

export default PersonalSidebar;