// src/components/personalSidebar.tsx

import { Home, User, Bell, Settings, Search } from "lucide-react";

import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { ThemeProvider } from "@/components/theme-provider"

const personalSidebar = () => {
  return (
    <>
    <aside className=" hidden sm:flex h-fit dark:bg-[#1a1a1a] dark:border-lime-500 dark:text-slate-100 w-[200px] p-6 mt-16 ml-4 rounded-2xl  border-3 border-lime-500 shadow-md hidden md:block bg-lime-600">
      <div className="text-2xl font-bold mb-6 text-white dark:text-lime-500">Future Feed</div>
      <nav className="font-bold flex flex-col space-y-4 text-lg dark:text-lime-500 text-white ">
         <Link to="/home" className="flex items-center gap-3 dark:hover:text-white ">
          <Home size={20} /> Home
        </Link>
        <Link to="/profile" className="flex items-center gap-3 dark:hover:text-white">
          <User size={20} /> Profile
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
         <ThemeProvider >
  <div className="pe-9 flex items-center gap-2">
    <ModeToggle />
    <span className=" dark:hover:text-white dark:lime-500">Theme</span>
  </div>
</ThemeProvider>
      </nav>

         



    </aside>
       {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full flex justify-around items-center dark:bg-black border text-lime-500  dark:border-lime-500 p-2 sm:hidden dark:slate-100 z-50">
        <Link to="/home" className="flex flex-col items-center">
          <Home strokeWidth={3} className="w-4 h-4 " />

        </Link>
        <Link to="/profile" className="flex items-center gap-3 dark:hover:text-blue-500">
          <User strokeWidth={3} className="w-4 h-4" />
        </Link>
        <Link to="/notifications" className="flex items-center gap-3 hover:text-blue-500 ">
          <Bell strokeWidth={3} className="w-4 h-4" /> 
        
         
        </Link>
        <Link to="/settings" className="flex items-center gap-3 hover:text-blue-500 ">
          <Settings strokeWidth={3}  className="w-4 h-4" /> 
        </Link>

        <Link to="/explore" className="flex flex-col items-center">
          <Search strokeWidth={3}  className="w-4 h-4" />
          
        </Link>
        
      </nav>

    </>
    
  );
};

export default personalSidebar;
