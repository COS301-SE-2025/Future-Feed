import React from 'react';
import './css/ProfileInfo.css';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
import profilePic from '../assets/GRP1.jpg'; // porfile photo for now
//logic is to show users name profile etc

const ProfileInfo = () => {
    return(
         <div className="profile-info">
      <img src={profilePic} alt="Profile" className="profile-picture" />
      <h2 className="username">Display Name</h2>
      <p className="bio">Future Feed | Tech Enthusiast | Car Lover</p>

      <div className="profile-stats">
        <div>
          <span className="stat-number">120</span>
          <span className="stat-label">Posts</span>
        </div>
        <div>
          <span className="stat-number">1.5K</span>
          <span className="stat-label">Followers</span>
        </div>
        <div>
          <span className="stat-number">300</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    </div>
    );
};
export default ProfileInfo;