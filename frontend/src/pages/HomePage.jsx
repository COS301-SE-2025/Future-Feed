import React from 'react';
import '../styles/homePage.css';
import { FaHome, FaSearch, FaHeart, FaRobot, FaUser, FaBell} from 'react-icons/fa';

const HomePage = () => {
    return (
        // <div className="app-container">
        //     {/* Navigation Sidebar */}
        //     <div className="navigation-sidebar">
        //         <nav>
        //             <ul>
        //                 <li className="active"><FaHome className="icon" /> <span>Home</span></li>
        //                 <li><FaSearch className="icon" /> <span>Search</span></li>
        //                 <li><FaRobot className="icon" /> <span>Bots</span></li>
        //                 <li className="icon"> Addition</li>
        //                 <li><FaHeart className="icon" /> <span>Activity</span></li>
        //                 <li><FaUser className="icon" /> <span>Profile</span></li>
        //             </ul>
        //         </nav>
        //     </div>

        //     {/* Main Feed */}
        //     <div className="main-feed">
        //         {/* Create Post */}
        //         <div className="create-post">
        //             <h3>What's on your mind?</h3>
        //             <button className="post-button">Post</button>
        //         </div>

        //         {/* Posts Feed */}
        //         <div className="posts-container">
        //             <div className="post">
        //                 <div className="post-header">
        //                     <span className="username">Display Name</span>
        //                     <span className="post-time">2 days ago</span>
        //                 </div>
        //                 <div className="post-content">
        //                     <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
        //                 </div>
        //             </div>

        //             <div className="post">
        //                 <div className="post-header">
        //                     <span className="username">Bot</span>
        //                     <span className="post-time">1hr ago</span>
        //                 </div>
        //                 <div className="post-content">
        //                     <p>+ Active</p>
        //                     <p>Brand New Audi RS 5 ABT SportsBack, What a boost!!!</p>
        //                 </div>
        //             </div>

        //             <div className="post">
        //                 <div className="post-header">
        //                     <span className="username">Display Name</span>
        //                     <span className="post-time">3 days ago</span>
        //                 </div>
        //                 <div className="post-content">
        //                     {/* Post content would go here */}
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
        <div className = "home-page">
            {/*sidebar*/}
            <div className ="navigation-sidebar">
                <nav>
                     <ul>
                         <li className="active"><FaHome className="icon" /> </li>
                         <li><FaSearch className="icon" /> </li>
                         <li><FaRobot className="icon" /> </li>
                         <li><FaBell className="icon"/> </li>
                         <li><FaHeart className="icon" /> </li>
                         <li><FaUser className="icon" /> </li>
                     </ul>
                 </nav>
            </div>
            {/*sidebar*/}
            <h1 className='welcome-message'>Welcome, Feature feed</h1>
            <div className ="feed">
                    <div className="new-post">
                        <h3 className="new-post-text"> What's on your mind ?</h3>
                        <div className="create-post">
                            <h3 className="create-post-text"> New Post</h3>
                        </div>
                    </div>
                    <div className="post">
                         <div className="post-header">
                             <span className="username">Display Name</span>
                             <span className="post-time">2 days ago</span>
                         </div>
                         <div className="post-content">
                             <p>Hey everyone, I hope all is well. I'd like to take this opportunity to introduce you to future feed</p>
                         </div>
                     </div>

                     <div className="post">
                         <div className="post-header">
                             <span className="username">Bot</span>
                             <span className="post-time">1hr ago</span>
                         </div>
                         <div className="post-content">
                             <p>+ Active</p>
                             <p>Brand New Audi RS 5 ABT SportsBack, What a boost!!!</p>
                         </div>
                     </div>

                     <div className="post">
                         <div className="post-header">
                             <span className="username">Display Name</span>
                             <span className="post-time">3 days ago</span>
                         </div>
                         <div className="post-content">
                             {/* Post content would go here */}
                         </div>
                     </div>
            </div>
        </div>
    );
};

export default HomePage;