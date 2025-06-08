// src/components/personalSidebar.tsx

import { Home, User, Bell, Settings, Search } from "lucide-react";

import { Link } from "react-router-dom";

const personalSidebar = () => {
  return (
    <aside className="h-fit bg-gray-800 border-white text-slate-100 w-[200px] p-6 mt-6 ml-4 rounded-2xl border border-gray-800 shadow-md hidden md:block">
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
          <Search size={20} /> explore
        </Link>
      </nav>
    </aside>
  );
};

export default personalSidebar;
