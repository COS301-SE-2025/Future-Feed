import React from 'react';
import { FaHeart, FaComment, FaRetweet, FaStar, FaEllipsisH } from 'react-icons/fa';
import '../pages/css/homePage.css';

const HomePagePost = ({ profileImage, username, postTime, content }) => {
  return (
    <div className="post">
      <div className="post-header">
        <img src={profileImage} alt="" className="profile-image" />
        <span className="username">{username}</span>
        <span className="seperator">|</span>
        <span className="post-time">{postTime}</span>
        <span className="settings"><FaEllipsisH className="icon" /></span>
      </div>
      <div className="post-content">
        <p>{content}</p>
      </div>
      <div className="post-actions">
        <div className="left-actions">
          <button className="action-button"><FaHeart className="action-icon" /> </button>
          <button className="action-button"><FaComment className="action-icon" /> </button>
          <button className="action-button"><FaRetweet className="action-icon" /> </button>
        </div>
        <button className="bookmark-button"><FaStar className="action-icon" /> </button>
      </div>
    </div>
  );
};

export default HomePagePost;