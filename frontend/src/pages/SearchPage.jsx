import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import "./css/searchPage.css";
import SearchTrendsSection from "../components/SearchTrendsSection";
import WhoToFollowSection from "../components/WhoToFollow";

const SearchPage = () => {
    return (
        <div className="search-page-body">
            <div className="search-page">
              <Sidebar />
            <div className="main-content">
              
              <SearchTrendsSection />
              <WhoToFollowSection />

            </div>
          </div>


        </div>
        
    );
};

export default SearchPage;