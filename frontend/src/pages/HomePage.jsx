import React from 'react';
import { useState } from 'react';
import './css/homePage.css';
import { FaHome, FaSearch, FaHeart, FaRobot, FaUser, FaBell} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [postText, setPostText] = useState('');
    return (
        <div className="home-page">
            {/* Logo */}
            <img src={ffCropped} alt="Future Feed Logo" className="homePage-logo" />
            {/* Sidebar */}
            <div className="navigation-sidebar">
                <nav>
                     <ul>
                    
                         <li className="active"><FaHome className="icon" /> </li>
                         <li><FaSearch className="icon" /> </li>
                         <li><FaRobot className="icon" /> </li>
                         <li><FaBell className="icon"/> </li>
                         <li><FaHeart className="icon" /> </li>
                         <Link to="/user-profile">
                         <li><FaUser className="icon" /> </li>
                         </Link>
                         
                     </ul>
                 </nav>
            </div>
            {/* Feed */}
            <div className="feed">
                <div className="new-post">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        console.log('Posted:', postText);
                        setPostText('');
                    }}>
                        <textarea
                            className="new-post-text"
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="What's on your mind?"
                            rows="2"
                        />
                        <button type="submit" className="create-post">
                            <h3 className="create-post-text">New Post</h3>
                        </button>
                    </form>
                </div>
                <div className="main-seperator-main"></div>
                {/* Post 1 */}
                <div className="post">
                    <div className="post-header">
                        <img src={ffCropped} alt="" className="profile-image" />
                        <span className="username">Display Name</span>
                        <span className="seperator">|</span>
                        <span className="post-time">2 days ago</span>
                        <span className="settings"><FaEllipsisH className="icon" /></span>
                    </div>
                    <div className="post-content">
                        <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
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
                <div className="main-seperator"></div>
                <div className="post">
                    <div className="post-header">
                        <img src={ffCropped} alt="" className="profile-image" />
                        <span className="username">Display Name</span>
                        <span className="seperator">|</span>
                        <span className="post-time">2 days ago</span>
                        <span className="settings"><FaEllipsisH className="icon" /></span>
                    </div>
                    <div className="post-content">
                        <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
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
                <div className="main-seperator"></div>
                <div className="post">
                    <div className="post-header">
                        <img src={ffCropped} alt="" className="profile-image" />
                        <span className="username">Display Name</span>
                        <span className="seperator">|</span>
                        <span className="post-time">2 days ago</span>
                        <span className="settings"><FaEllipsisH className="icon" /></span>
                    </div>
                    <div className="post-content">
                        <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
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
                <div className="main-seperator"></div>
                <div className="post">
                    <div className="post-header">
                        <img src={ffCropped} alt="" className="profile-image" />
                        <span className="username">Display Name</span>
                        <span className="seperator">|</span>
                        <span className="post-time">2 days ago</span>
                        <span className="settings"><FaEllipsisH className="icon" /></span>
                    </div>
                    <div className="post-content">
                        <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
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
                <div className="main-seperator"></div>
                <div className="post">
                    <div className="post-header">
                        <img src={ffCropped} alt="" className="profile-image" />
                        <span className="username">Display Name</span>
                        <span className="seperator">|</span>
                        <span className="post-time">2 days ago</span>
                        <span className="settings"><FaEllipsisH className="icon" /></span>
                    </div>
                    <div className="post-content">
                        <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
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
                <div className="main-seperator"></div>
                {/* Post 2 */}
                <div className="post">
                    <div className="post-header">
                        <img src={ffCropped} alt="" className="profile-image" />
                        <span className="username">Display Name</span>
                        <span className="seperator">|</span>
                        <span className="post-time">2 days ago</span>
                        <span className="settings"><FaEllipsisH className="icon" /></span>
                    </div>
                    <div className="post-content">
                        <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
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
                <div className="main-seperator"></div>
            </div>
        </div>
    );
};

export default HomePage;