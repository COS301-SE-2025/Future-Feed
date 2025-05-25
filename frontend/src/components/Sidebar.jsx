import React from "react";
import { FaHome, FaSearch, FaHeart, FaRobot, FaUser, FaPlusSquare , FaBell } from 'react-icons/fa';
import "./css/Sidebar.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar">
          <Link to="/home">
           <div className="icon"title="Home"><FaHome /></div>
          </Link>


     <Link to="/search">
      <div className="icon"title="Search"><FaSearch /></div>
     </Link>
     
      <div className="icon"title="Add"><FaPlusSquare /></div>
      <Link to="/notifications">
       <div className="icon"title="Notifications"><FaBell /></div>
      </Link>
     
      <Link to="/user-profile">
       <div className="icon"title="Profile"><FaUser /></div>
      
      </Link>
     
      <div className="icon"title="Bots"><FaRobot /></div>
    </div>

    );
};
export default Sidebar;