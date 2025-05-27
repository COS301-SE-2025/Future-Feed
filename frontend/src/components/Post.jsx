import React, {useState}  from "react";
import "./css/Post.css";
/*
for responsiveness, the following buttons are used to indicate that they have been clciked
regheart -> faheart
regcomment -> facomment
regbookmark -> fabookmark
*/ 
import GRP1 from "../assets/GRP1.jpg"; // profile photo for now
import { FaRegHeart, FaHeart,FaRobot, FaRegComment, FaComment, FaShare, FaRetweet, FaRegBookmark, FaBookmark} from "react-icons/fa";
//the logic here  ust to display each idnividual post 

const Post = ({displayname,username , time, content , image }) => {
/*for respo*/
 const [isLiked, setisLiked] = useState(false);
  const [isCommented, setisCommented] = useState(false);
  const [isRetweeted, setisRetweeted] = useState(false);
  const [isBookmarked, setisBookmarked] = useState(false);
  /*we need a way to differentiate betwene bot and user [psts*/
  const isBot = username.includes("Bot") || username.endsWith("_ai");


 return(
     <div className="post">
      <div className="post-header">
        <img src= {GRP1} alt="Profile" className="post-profile-picture" />
        <span className="post-displayname">{displayname}</span>
        <span className="post-username">@{username}</span>
       {/*bot check here*/ }
          {isBot && <FaRobot className="bot-icon" />}  {/* Add conditional check */} 
        <span className="post-separator">|</span>
        <span className="post-time">{time}</span>
      </div>
      <div className="post-content">
        <p>{content}</p>
        {image && <img src={image} alt="Post" className="post-image" />}
      </div>
      <div className="post-actions">
        {/*like button*/ }
        <button className="post-action-button" onClick={() => setisLiked(!isLiked)}>
          {isLiked?(
            <FaHeart color="black" className="post-action-icon" />
          ):(
            <FaRegHeart className="post-action-icon" />
          )}
          <span> Like </span>
          </button>
          {/*comment */}
          <button className="post-action-button" onClick={() => setisCommented(!isCommented)}>
          {isCommented?(
            <FaComment color="black" className="action-icon" />
          ) : (
            <FaRegComment className="action-icon" />
          )}
          <span>Comment</span>
          </button>
          {/*reshare */}
          <button className="post-action-button" onClick={() => setisRetweeted(!isRetweeted)}>
          {isRetweeted?(
           <FaRetweet color="black" className="action-icon" />
          ) : (
            <FaShare color="lightgrey"className="action-icon" />
          )}
          <span>Reshare</span>
          </button>
          {/*bookmark */}
          <button className="post-action-button" onClick={() => setisBookmarked(!isBookmarked)}>
          {isBookmarked?(
            <FaBookmark color="black" className="action-icon" />
          ) : (
            <FaRegBookmark className="action-icon" />
          )}
          <span>Highlight</span>
          </button>
        
       </div> 
    </div>
 );
};
export default Post;