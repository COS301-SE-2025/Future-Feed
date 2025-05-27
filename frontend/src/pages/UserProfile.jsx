import React from "react";
import Sidebar from "../components/Sidebar";
import ProfileInfo from "../components/ProfileInfo";
import Feed from "../components/Feed";
import "./css/userprofile.css";

const UserProfile = () => {
    return(
      <body className="user-profile-body">
        <div className="user-profile-page">
      <Sidebar />
      <div className="main-section">
        <ProfileInfo />
        <Feed />
      </div>
    </div>

      </body>
        
    );
};
export default UserProfile;