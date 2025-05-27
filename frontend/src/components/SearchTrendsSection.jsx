import React from "react";
import "./css/SearchTrendsSection.css";

const trends = [
     { topic: "MTN$", posts: "1,200 posts" },
  { topic: "Polokwane City", posts: "1,225 posts" },
  { topic: "Mudau", posts: "Trending now" },
  { topic: "BBBEE", posts: "1,339 posts" },
  { topic: "Ribeiro", posts: "3,918 posts" },

];

const SearchTrendsSection = () => {
return(
     <div className="trends-section">
      <input className="search-input" type="text" placeholder="Search..."color="white" />
      <div className="trends-buttons">
        <button className="trends-button active">For you</button>
        <button className="trends-button">Trending</button>
        <button className="trends-button">News</button>
        <button className="trends-button">Sports</button>
        <button className="trends-button">Entertainment</button>
      </div>
      <div className="trends-box">
        <h2>Trending in South Africa</h2>
        {trends.map((item, i) => (
          <div key={i} className="trend-item">
            <div className="trend-topic">{item.topic}</div>
            <div className="trend-posts">{item.posts}</div>
          </div>
        ))}
      </div>
    </div>
);
};
export default SearchTrendsSection;