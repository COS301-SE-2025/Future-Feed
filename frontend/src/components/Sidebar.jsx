import React from "react";
import { FaHome, FaSearch, FaHeart, FaRobot, FaUser, FaPlusSquare, FaBell } from 'react-icons/fa';
import "./css/Sidebar.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar">
          <Link to="/home">
           <div className="icon" title="Home"><FaHome /></div>
          </Link>
          <Link to="/search">
           <div className="icon" title="Search"><FaSearch /></div>
          </Link>
          <Link to="/post">
           <div className="icon" title="Post"><FaPlusSquare /></div>
          </Link>
          <Link to="/notifications">
           <div className="icon" title="Notifications"><FaBell /></div>
          </Link>
          <Link to="/user-profile">
           <div className="icon" title="Profile"><FaUser /></div>
          </Link>
          <Link to="/bots">
           <div className="icon" title="Bots"><FaRobot /></div>
          </Link>
        </div>
    );
};
export default Sidebar;