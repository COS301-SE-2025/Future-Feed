import React from "react";
import Post from "./Post";
import GRP1 from "../assets/GRP1.jpg";
import GRP2 from "../assets/GRP2.jpg";
import "./css/Feed.css";

const Feed = () => {
     const posts = [
    {
      displayname: "Syntex Squad",
      username: "Syntex Squad",
      time: "2 hours ago",
      content: "Final Capstone journey just started! Excited for the next months with my team.",
      image: GRP2,
    },
    {
      displayname: "Syntex Squad",
      username: "Bot",
      time: "Yesterday",
      content: "Future tech is here. Are you ready?",
      image: GRP1,
    },
    {
      displayname: "Syntex Squad",
      username: "Syntex Squad",
      time: "3 days ago",
      content: "Life update: This is going to be harder than i thought.",
      image: null,
    },
  ];

  return (
    <div className="feed-container">
      {posts.map((post, index) => (
        <Post
          key={index}
          displayname={post.displayname}
          username={post.username}
          time={post.time}
          content={post.content}
          image={post.image}
        />
      ))}
    </div>
  );
};
export default Feed;