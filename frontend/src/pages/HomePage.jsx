import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaRobot,
  FaUser,
  FaBell,
  FaImage
} from 'react-icons/fa';
import ffCropped from '../assets/FF cropped.png';
import HomePagePost from '../components/HomePagePost';
import './css/homePage.css';

const HomePage = () => {
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [posts, setPosts] = useState([]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postText && !postImage) return;
    const newPost = {
      id: Date.now(),
      profileImage: ffCropped,
      username: 'Current User',
      postTime: 'Just now',
      content: postText,
      image: postImage,
    };
    setPosts([newPost, ...posts]);
    setPostText('');
    setPostImage(null);
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  return (
    <div className="home-page1">
      <img src={ffCropped} alt="Future Feed Logo" className="homePage-logo1" />
      <div className="navigation-sidebar1">
        <nav>
          <ul>
            <li className="active1">
              <FaHome className="icon1" />
            </li>
            <li>
              <FaSearch className="icon1" />
            </li>
            <li>
              <FaRobot className="icon1" />
            </li>
            <li>
              <FaBell className="icon1" />
            </li>
            <li>
              <FaHeart className="icon1" />
            </li>
            <Link to="/user-profile">
              <li>
                <FaUser className="icon1" />
              </li>
            </Link>
          </ul>
        </nav>
      </div>
      <div className="feed1">
        <div className="new-post1">
          <form onSubmit={handlePostSubmit}>
            <div className="new-post-container1">
              <textarea
                className="new-post-text1"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                rows="2"
              />
              <div className="new-post-buttons1">
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  className={`attachment-button1 ${postImage ? 'image-attached1' : ''}`}
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <FaImage className="attachment-icon1" />
                </button>
                <button type="submit" className="new-post-button1">
                  <h3 className="create-post-text1">New Post</h3>
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="main-seperator-main1"></div>
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            <HomePagePost
              profileImage={post.profileImage}
              username={post.username}
              postTime={post.postTime}
              content={post.content}
              image={post.image}
              id={post.id}
              onDelete={handleDeletePost}
            />
            <div className="main-seperator1"></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HomePage;