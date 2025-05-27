import React from 'react';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';

const  PostCard =  ({text, images = [] }) => {
return (
    <div className="bg-white rounded-xl p-4 mt-4 shadow">
    <div className="flex items-center mb-2 space-x-2">
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg">👤</div>
      <div>
        <p className="font-medium">Display Name <span className="text-gray-400 text-sm">Username</span></p>
        <p>{text}</p>
      </div>
    </div>
    {images.length > 0 && (
      <div className="flex gap-2 mt-2">
        {images.map((img, idx) => (
          <img key={idx} src={img} alt="post" className="w-1/2 rounded-lg" />
        ))}
      </div>
    )}
    <div className="flex justify-around text-sm text-gray-600 mt-3">
      <button> <FaHeart className="icon" /> Like 0</button>
      <button> <FaComment className="icon" /> Comment 0</button>
      <button> <FaShare className="icon" /> Repost 0</button>
      <button> <FaHeart className="icon" /> Highlight</button>
    </div>
  </div>
);
};
export default PostCard;