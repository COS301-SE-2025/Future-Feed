import React from "react";
import Sidebar from "../components/Sidebar";
import "./css/searchPage.css";
import SearchTrendsSection from "../components/SearchTrendsSection";
import WhoToFollowSection from "../components/WhoToFollow";

const SearchPage = () => {
    return (
        <body className="search-page-body">
    <Sidebar />
            <div className="search-page">
      <div className="main-content">
        <SearchTrendsSection />
        <WhoToFollowSection />
      </div>
    </div>


        </body>
        
    );
};

export default SearchPage;