// src/components/personalSidebar.tsx

import { Home, User, Bell, Settings, Search } from "lucide-react";

import { Link } from "react-router-dom";

const personalSidebar = () => {
  return (
    <>
    <aside className=" hidden sm:flex h-fit bg-gray-800 border-white text-slate-100 w-[200px] p-6 mt-6 ml-4 rounded-2xl border border-gray-800 shadow-md hidden md:block">
      <div className="text-2xl font-bold mb-6">Future Feed</div>
      <nav className="font-bold flex flex-col space-y-4 text-lg text-slate-100 ">
         <Link to="/" className="flex items-center gap-3 hover:text-blue-500 ">
          <Home size={20} /> Home
        </Link>
        <Link to="/profile" className="flex items-center gap-3 hover:text-blue-500">
          <User size={20} /> Profile
        </Link>
        <Link to="/notifications" className="flex items-center gap-3 hover:text-blue-500 ">
          <Bell size={20} /> Notifications
        </Link>
        <Link to="/settings" className="flex items-center gap-3 hover:text-blue-500 ">
          <Settings size={20} /> Settings
        </Link>
        <Link to="/explore" className="flex items-center gap-3 hover:text-blue-500 ">
          <Search size={20} /> Explore
        </Link>
      </nav>

         



    </aside>
       {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full flex justify-around items-center bg-gray-800 border border border-sky-100 p-2 sm:hidden slate-100 z-50">
        <Link to="/home" className="flex flex-col items-center">
          <Home className="w-5 h-5" />

        </Link>
        <Link to="/notifications" className="flex items-center gap-3 hover:text-blue-500 ">
          <Bell className="w-5 h-5" /> 
        
         
        </Link>
        <Link to="/settings" className="flex items-center gap-3 hover:text-blue-500 ">
          <Settings className="w-5 h-5" /> 
        </Link>

        <Link to="/explore" className="flex flex-col items-center">
          <Search className="w-5 h-5" />
          
        </Link>
        
      </nav>

    </>
    
  );
};

export default personalSidebar;
