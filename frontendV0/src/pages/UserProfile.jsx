import React from "react";
import Sidebar from "../components/Sidebar";
import ProfileInfo from "../components/ProfileInfo";
import Feed from "../components/Feed";
import "./css/userprofile.css";

const UserProfile = () => {
    return(
      <div className="user-profile-body">
        <div className="user-profile-page">
        
        <div className="main-section">
          <Sidebar />
          <ProfileInfo />
          <Feed />
        </div>
      </div>

      </div>
        
    );
};
export default UserProfile;