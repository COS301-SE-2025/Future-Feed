import React, { useState } from 'react';
import {
  FaHeart,
  FaComment,
  FaRetweet,
  FaStar,
  FaEllipsisH
} from 'react-icons/fa';
import '../pages/css/homePage.css';

const HomePagePost = ({ profileImage, username, postTime, content, image }) => {
  const [liked, setLiked] = useState(false);

  const handleLikeClick = () => {
    setLiked(!liked);
  };

  return (
    <div className="post1">
      <div className="post-header1">
        <img src={profileImage} alt="" className="profile-image1" />
        <span className="username1">{username}</span>
        <span className="seperator1">|</span>
        <span className="post-time1">{postTime}</span>
        <span className="settings1">
          <FaEllipsisH className="icon1" />
        </span>
      </div>
      <div className="post-content1">
        {content && <p>{content}</p>}
        {image && <img src={image} alt="Post" className="post-image1" />}
      </div>
      <div className="post-actions1">
        <div className="left-actions1">
          <button
            className={`action-button1 ${liked ? 'liked1' : ''}`}
            onClick={handleLikeClick}
          >
            <FaHeart className="action-icon1" />
          </button>
          <button className="action-button1">
            <FaComment className="action-icon1" />
          </button>
          <button className="action-button1">
            <FaRetweet className="action-icon1" />
          </button>
        </div>
        <button className="bookmark-button1">
          <FaStar className="action-icon1" />
        </button>
      </div>
    </div>
  );
};

export default HomePagePost;