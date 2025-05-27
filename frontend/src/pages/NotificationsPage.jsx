/*main notifcations shabang*/
import React from "react";
import NotificationsRight from "../components/Notificationsrhs";
import Sidebar from "../components/Sidebar";
import "./css/Notificationspage.css"; 


const NotificationsPage = () => {
  return (
    <div className="layout-wrapper">
      <div className="layout-container">
      <Sidebar />

      <div className="notifications-main">
        
        <h1 className="page-title">Notifications</h1>
        <div className="notifications-buttons">
          <button className="notifications-button active">All</button>
          <button className="notifications-button">Mentions</button>
          <button className="notifications-button">Verified</button>
        </div>
        <div className="notification-card">
          Recent Login to your account @Syntex Squad from a new Device on May 27, 2025
        </div>
      </div>

      <NotificationsRight />
    </div>
    </div>
    
  );
};

export default NotificationsPage;