import React, { useState } from "react";
import "./css/EditProfile.css";
import GRP1 from "../assets/GRP1.jpg"; // Placeholder image, replace with actual thumbnail later
import { Link } from "react-router-dom"; // Import Link for navigation
import { FaArrowLeft } from "react-icons/fa"; // Import icon for back button

const EditProfile = () => {
    const [accountType, setAccountType] = useState("personal");

    return (
        <div className="edit-profile-body">
            

            <div className="edit-profile-container">
                <Link to="/user-profile" className="back-button">
                 <FaArrowLeft className="back-icon" />
                </Link>
               
                
            <h1>Edit Profile</h1>
            <img src={GRP1} alt="Profile" className="profile-picture" />
            <form className="edit-profile-form">
                <div className="form-group">
                    <label htmlFor="username">Name</label>
                    <input type="text" id="username" name="username" placeholder="Enter your username" />
                </div>
                <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <input type="text" id="website" name="Bio" placeholder=" Bio..." />
                </div>
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input type="text" id="location" name="Location" placeholder="Location..." />
                </div>
                <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input type="text" id="website" name="website" placeholder="https://example.com" />
                </div>

                {/* Radio button section */}
                <div className="form-group">
                    <label>Switch to Professional or Personal? </label>
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
