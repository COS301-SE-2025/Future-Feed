import React from "react";
import Post from "./Post";
import GRP1 from "../assets/GRP1.jpg";
import GRP2 from "../assets/GRP2.jpg";
import "./css/Feed.css";

const Feed = () => {
     const posts = [
    {
      username: "Display Name",
      time: "2 hours ago",
      content: "Check out my latest ride — it's a beast!",
      image: GRP2,
    },
    {
      username: "Bot",
      time: "Yesterday",
      content: "Future tech is here. Are you ready?",
      image: GRP1,
    },
    {
      username: "Display Name",
      time: "3 days ago",
      content: "Life update: Just finished my third year of Computer Science!",
      image: null,
    },
  ];

  return (
    <div className="feed-container">
      {posts.map((post, index) => (
        <Post
          key={index}
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