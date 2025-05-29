import React, { useState } from "react";
import "./css/EditProfile.css";
import GRP1 from "../assets/GRP1.jpg"; // Default image
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";


const EditProfile = () => {
const { userData, setUserData } = useContext(UserContext);
const [username, setUsername] = useState(userData.username);
const [displayName, setDisplayName] = useState(userData.displayName);
const [bio, setBio] = useState(userData.bio);
const [profileImage, setProfileImage] = useState(userData.profileImage);
const [accountType, setAccountType] = useState(userData.accountType);

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageURL = URL.createObjectURL(file);
    setProfileImage(imageURL);
  }
};

const handleSubmit = (e) => {
  e.preventDefault();
  setUserData({
    username,
    displayName,
    bio,
    profileImage,
    accountType
  });
};

  return (
    <div className="edit-profile-body">
      <div className="edit-profile-container">
        <Link to="/user-profile" className="back-button">
          <FaArrowLeft className="back-icon" />
        </Link>

        <h1>Edit Profile</h1>

        <form className="edit-profile-form">
            <div className="form-group image-upload">
                <label htmlFor="profile-pic-upload" className="profile-pic-wrapper">
                <img src={profileImage} alt="Profile" className="profile-picture" />
                <input
                    type="file"
                    id="profile-pic-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                />
                </label>
            </div>

            <div className="form-group">
                <label htmlFor="display-name">Display Name</label>
                <input type="text" id="display-name" name="display-name" placeholder="Enter your username" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <input type="textarea" id="bio" name="bio" placeholder="Bio..." value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            {/* <div className="form-group">
                <label htmlFor="location">Location</label>
                <input type="text" id="location" name="location" placeholder="Location..." />
            </div>

            <div className="form-group">
                <label htmlFor="website">Website</label>
                <input type="url" id="website" name="website" placeholder="https://example.com" />
            </div> */}

            <div className="form-group">
                <label>Account Type</label>
                <div className="radio-group">
                <label>
                    <input
                    type="radio"
                    name="accountType"
                    value="personal"
                    checked={accountType === "personal"}
                    onChange={() => setAccountType("personal")}
                    />
                    Personal
                </label>
                <label>
                    <input
                    type="radio"
                    name="accountType"
                    value="professional"
                    checked={accountType === "professional"}
                    onChange={() => setAccountType("professional")}
                    />
                    Professional
                </label>
                </div>
            </div>

            <button type="submit" onClick={handleSubmit} className="save-button">Save Changes</button>
        </form>

      </div>
    </div>
  );
};

export default EditProfile;
