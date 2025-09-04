import React from "react";
import "./css/WhoToFollow.css";

const followList = [
  { name: "Toni Kroos", handle: "@ToniKroos" },
  { name: "Erling Haaland", handle: "@ErlingHaaland" },
  { name: "Sky Sports Football", handle: "@SkyFootball" },
];

const WhoToFollowSection = () => {
  return (
    <div className="who-to-follow">
      <h3>Who to follow</h3>
      {followList.map((user, index) => (
        <div className="follow-item" key={index}>
          <div>
            <div className="follow-name">{user.name}</div>
            <div className="follow-handle">{user.handle}</div>
          </div>
          <button className="follow-btn">Follow</button>
        </div>
      ))}
    </div>
  );
};

export default WhoToFollowSection;