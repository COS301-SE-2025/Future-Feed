import React, { useState } from "react";
import "./css/EditProfile.css";
import GRP1 from "../assets/GRP1.jpg"; // Default image
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const EditProfile = () => {
  const [accountType, setAccountType] = useState("personal");
  const [profileImage, setProfileImage] = useState(GRP1);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfileImage(imageURL);
    }
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
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Enter your username" />
            </div>

            <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <input type="text" id="bio" name="bio" placeholder="Bio..." />
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

            <button type="submit" className="save-button">Save Changes</button>
        </form>

      </div>
    </div>
  );
};

export default EditProfile;
