import React from "react";
import { FaHome, FaSearch, FaHeart, FaRobot, FaUser, FaPlusSquare , FaBell } from 'react-icons/fa';
import "./css/Sidebar.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar">
          <Link to="/home">
           <div className="icon"><FaHome /></div>
          </Link>


     <Link to="/search">
      <div className="icon"><FaSearch /></div>
     </Link>
     
      <div className="icon"><FaPlusSquare /></div>
      <div className="icon"><FaBell /></div>
      <Link to="/user-profile">
       <div className="icon"><FaUser /></div>
      
      </Link>
     
      <div className="icon"><FaRobot /></div>
    </div>

    );
};
export default Sidebar;