import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaRobot,
  FaUser,
  FaBell,
  FaImage
} from "react-icons/fa";
import ffCropped from "../assets/FF cropped.png";
import HomePagePost from "../components/HomePagePost";
import "./css/homePage.css";

const HomePage = () => {
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [posts, setPosts] = useState([]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result); // base64 string
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
      username: "Current User",
      postTime: "Just now",
      content: postText,
      image: postImage,
    };

    setPosts([newPost, ...posts]);
    setPostText("");
    setPostImage(null);
  };

  return (
    <div className="home-page">
      {/* Logo */}
      <img src={ffCropped} alt="Future Feed Logo" className="homePage-logo" />

      {/* Sidebar */}
      <div className="navigation-sidebar">
        <nav>
          <ul>
            <li className="active">
              <FaHome className="icon" />
            </li>
            <li>
              <FaSearch className="icon" />
            </li>
            <li>
              <FaRobot className="icon" />
            </li>
            <li>
              <FaBell className="icon" />
            </li>
            <li>
              <FaHeart className="icon" />
            </li>
            <Link to="/user-profile">
              <li>
                <FaUser className="icon" />
              </li>
            </Link>
          </ul>
        </nav>
      </div>

      {/* Feed */}
      <div className="feed">
        <div className="new-post">
          <form onSubmit={handlePostSubmit}>
            <div className="new-post-container">
              <textarea
                className="new-post-text"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                rows="2"
              />

              <div className="new-post-buttons">
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="photo-upload"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  className={`attachment-button ${
                    postImage ? "image-attached" : ""
                  }`}
                  onClick={() =>
                    document.getElementById("photo-upload").click()
                  }
                >
                  <FaImage className="attachment-icon" />
                </button>

                <button type="submit" className="create-post">
                  <h3 className="create-post-text">New Post</h3>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="main-seperator-main"></div>

        {/* Posts */}
        {posts.map((post) => (
          <React.Fragment key={post.id}>
            <HomePagePost
              profileImage={post.profileImage}
              username={post.username}
              postTime={post.postTime}
              content={post.content}
              image={post.image}
            />
            <div className="main-seperator"></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
