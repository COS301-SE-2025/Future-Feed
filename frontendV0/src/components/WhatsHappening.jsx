
import React from "react";
import "./css/WhatsHappening.css";
import GRP1 from "../assets/GRP1.jpg"; // Placeholder image, replace with actual thumbnail later
const trending = [
  {
    label: "LIVE",
    title: "Going Public",
    description: "",
    image: "", // Replace with real thumbnail later
  },
  {
    label: "Trending in South Africa",
    title: "Londie",
  },
  {
    label: "Sports · Trending",
    title: "Ancelotti",
    posts: "82K posts",
  },
  {
    label: "Trending in South Africa",
    title: "#WenaWodumo",
    posts: "1,193 posts",
  },
];

const WhatsHappening = () => {
  return (
    <div className="whats-happening">
      <h2>What’s happening</h2>
      {trending.map((item, i) => (
        <div className="trend-item" key={i}>
          {item.image && (
            <img src={item.image} alt="trend thumbnail" className="trend-thumb" />
          )}
          <div>
            <small>{item.label}</small>
            <h4>{item.title}</h4>
            {item.posts && <p>{item.posts}</p>}
          </div>
        </div>
      ))}
      <button className="show-more">Show more</button>
    </div>
  );
};

export default WhatsHappening;