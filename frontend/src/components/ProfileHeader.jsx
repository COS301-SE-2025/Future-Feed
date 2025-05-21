//modular code
import React from 'react';

import logo from "../assets/Future feed transparent-Photoroom.png";

const ProfileHeader = () => {
    return (
        <div className="bg-white rounded-2xl shadow p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl">👤</div>
        <div>
          <h2 className="text-xl font-semibold">Display Name</h2>
          <p className="text-gray-500">Username</p>
          <p className="text-sm text-gray-400">Bio</p>
        </div>
      </div>
      <button className="px-4 py-2 bg-gray-100 rounded-lg border shadow-sm hover:bg-gray-200">
        Edit Profile
      </button>
    </div>
    <div className="mt-4 text-center text-gray-600">
      0 Followers | 0 Following | 0 Bots
    </div>
  </div>

    );
    
};
export default ProfileHeader;