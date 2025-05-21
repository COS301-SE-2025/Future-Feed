import React  from "react";
import "./css/Post.css";
//the logic here  ust to display each idnividual post 

const Post = ({username , time, content , image }) => {
 return(
     <div className="post">
      <div className="post-header">
        <span className="post-username">{username}</span>
        <span className="post-separator">|</span>
        <span className="post-time">{time}</span>
      </div>
      <div className="post-content">
        <p>{content}</p>
        {image && <img src={image} alt="Post" className="post-image" />}
      </div>
    </div>
 );
};
export default Post;