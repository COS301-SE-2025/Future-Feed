// src/components/personalSidebar.tsx

import { Home, User, Bell, Settings, Search, LogOut, Bot } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { ThemeProvider } from "@/components/theme-provider"

const PersonalSidebar = () => {
  const navigate = useNavigate();

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

  return (
    <>
    <aside className="h-fit dark:bg-black dark:border-lime-500 dark:text-slate-100 w-[200px] p-6 mt-16 ml-4 rounded-2xl  border-3 border-lime-500 shadow-md hidden lg:block bg-lime-600">
      <div className="text-2xl font-bold mb-6 text-white dark:text-lime-500">Future Feed</div>
      <nav className="font-bold flex flex-col space-y-4 text-lg dark:text-lime-500 text-white ">
         <Link to="/home" className="flex items-center gap-3 dark:hover:text-white ">
          <Home size={20} /> Home
        </Link>
        <Link to="/profile" className="flex items-center gap-3 dark:hover:text-white">
          <User size={20} /> Profile
        </Link>
        <Link to="/bots" className="flex items-center gap-3 dark:hover:text-white">
          <Bot size={20} /> My Bots
        </Link>
        <Link to="/notifications" className="flex items-center gap-3 dark:hover:text-white ">
          <Bell size={20} /> Notifications
        </Link>
        <Link to="/settings" className="flex items-center gap-3 dark:hover:text-white ">
          <Settings size={20} /> Settings
        </Link>
        <Link to="/explore" className="flex items-center gap-3 dark:hover:text-white">
          <Search size={20} /> Explore
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-white dark:text-lime-500 hover:text-red-500 dark:hover:text-red-400 hover:cursor-pointer"
        >
          <LogOut size={20} /> Logout
        </button>
         <ThemeProvider >
          <div className="pe-9 flex items-center gap-2">
            <ModeToggle />
            <span className=" dark:hover:text-white dark:lime-500 hover:cursor-pointer">Theme</span>
          </div>
        </ThemeProvider>
        
      </nav>

         



    </aside>
       {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full flex justify-around items-center dark:bg-black border text-lime-500  dark:border-lime-500 p-2 lg:hidden dark:slate-100 z-50 bg-white">
        <Link to="/home" className="flex flex-col items-center">
          <Home strokeWidth={3} className="w-5 h-5 " />

        </Link>
        <Link to="/profile" className="flex items-center gap-3 dark:hover:text-blue-500">
          <User strokeWidth={3} className="w-5 h-5" />
        </Link>
        <Link to="/notifications" className="flex items-center gap-3 hover:text-blue-500 ">
          <Bell strokeWidth={3} className="w-5 h-5" /> 
        
         
        </Link>
        <Link to="/settings" className="flex items-center gap-3 hover:text-blue-500 ">
          <Settings strokeWidth={3}  className="w-5 h-5" /> 
        </Link>

        <Link to="/explore" className="flex flex-col items-center">
          <Search strokeWidth={3}  className="w-5 h-5" />
          
        </Link>
        
      </nav>

    </>
    
  );
};

export default PersonalSidebar;
