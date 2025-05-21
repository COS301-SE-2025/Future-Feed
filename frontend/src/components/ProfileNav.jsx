import react from 'react';
const tabs = ['Posts', 'Media', 'Reposts', 'Likes', 'Highlights'];
const ProfileNav = () => {
    return (
        <div className="mt-4 flex justify-around bg-white p-2 rounded-lg shadow">
    {tabs.map((tab) => (
      <button
        key={tab}
        className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
      >
        {tab}
      </button>
    ))}
  </div>
    );

};
export default ProfileNav;