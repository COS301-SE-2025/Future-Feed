import React from 'react';
import "./css/userprofile.css";
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
import ProfileHeader from '../components/ProfileHeader';
import ProfileNav from '../components/ProfileNav';
import PostCard from '../components/PostCard';

const UserProfile = () => {
return (
     <div className="min-h-screen bg-gray-200 p-4">
    <div className="max-w-4xl mx-auto">
      <ProfileHeader />
      <ProfileNav />
      <PostCard text="This is how posts without images will look" />
      <PostCard
        text="This is how posts with text and images will look"
        images={["/img1.jpg", "/img2.jpg"]}
      />
    </div>
  </div>
);
};
export default UserProfile;