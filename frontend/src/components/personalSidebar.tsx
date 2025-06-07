// src/components/personalSidebar.tsx

import { Home, User, Bell, Settings, Search } from "lucide-react";

const personalSidebar = () => {
  return (
    <aside className="h-fit bg-slate-300 border-white text-gray-800 w-[200px] p-6 mt-6 ml-4 rounded-2xl border border-gray-800 shadow-md hidden md:block">
      <div className="text-2xl font-bold mb-6">Future Feed</div>
      <nav className="font-bold flex flex-col space-y-4 text-lg text-gray-800">
        <a href="#" className="flex items-center gap-3 hover:text-blue-500">
          <Home size={20} /> Home
        </a>
        <a href="#" className="flex items-center gap-3 hover:text-blue-500">
          <User size={20} /> Profile
        </a>
        <a href="#" className="flex items-center gap-3 hover:text-blue-500">
          <Bell size={20} /> Notifications
        </a>
        <a href="#" className="flex items-center gap-3 hover:text-blue-500">
          <Settings size={20} /> Settings
        </a>
        <a href="#" className="flex items-center gap-3 hover:text-blue-500">
          <Search size={20} /> Search
        </a>
      </nav>
    </aside>
  );
};

export default personalSidebar;
