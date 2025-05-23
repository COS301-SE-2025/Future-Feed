import React from 'react';
import { FaHome, FaSearch, FaHeart, FaRobot, FaUser, FaPlusSquare , FaBell } from 'react-icons/fa';
import "./css/Sidebar.css";

const Sidebar = () => {
    return (
        <div className="sidebar">
      <div className="icon"><FaHome /></div>
      <div className="icon"><FaSearch /></div>
      <div className="icon"><FaPlusSquare /></div>
      <div className="icon"><FaBell /></div>
      <div className="icon"><FaUser /></div>
      <div className="icon"><FaRobot /></div>
    </div>

    );
};
export default Sidebar;