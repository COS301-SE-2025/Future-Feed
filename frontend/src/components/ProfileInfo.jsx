import React from 'react';
import './css/ProfileInfo.css';
import { FaHeart, FaComment, FaShare } from 'react-icons/fa';
import profilePic from '../assets/GRP1.jpg'; // porfile photo for now
import { Link } from 'react-router-dom';
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";

//logic is to show users name profile etc

const ProfileInfo = () => {
  const { userData } = useContext(UserContext);

    return(
         <div className="profile-info">
          {/*edit profile buttong goes here*/ }
          <div className="edit-profile-btn-container">
            <Link to="/edit-profile">
            <button className="edit-profile-btn">Edit Profile</button>
            
            </Link>
        
      </div>
      <img src={userData.profileImage} alt="Profile" className="profile-picture" />
      <h1 className="displayname">{userData.displayName}</h1>
      <h2 className="username">@{userData.username}</h2>
      <p className="bio">{userData.bio}</p>
      

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
        <div>
          <span className="stat-number">1</span>
          <span className="stat-label">Bots</span>
        </div>
      </div>
      {/*buttons like post , highlitghs etc*/ }
      <div className="profile-btn-container">
        <button className="profile-button-btn">Posts</button>
        <button className="profile-button-btn">Media</button>
        <button className="profile-button-btn">Reposts</button>
        <button className="profile-button-btn">Highlights</button>
        <button className="profile-button-btn">Likes</button>
        {/*Twitter has this option*/}
        <button className="profile-button-btn">Replies</button>

      </div>
      
      
    </div>
    );
};
export default ProfileInfo;