import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // includes Tailwind

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


////////

// /* Base Styles */
// body, html {
//     margin: 0;
//     padding: 0;
//     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
//     background-color: #f8f8f8;
//     color: #333;
// }

// .app-container {
//     display: flex;
//     min-height: 100vh;
// }

// /* Navigation Sidebar */
// .navigation-sidebar {
//     width: 250px;
//     background-color: white;
//     border: 3px #a76c6c;
//     padding: 20px;
//     position: fixed;
//     height: auto;
//     display: flex;
//     flex-direction: column;
//     left:100px;
// }

// .logo {
//     font-size: 24px;
//     font-weight: bold;
//     margin-bottom: 15px;
//     padding-left: 10px;
// }

// nav ul {
//     list-style: none;
//     padding: 0;
//     margin: 0;
// }

// nav ul li {
//     padding: 12px 16px;
//     margin: 4px 0;
//     border-radius: 8px;
//     cursor: pointer;
//     font-weight: 500;
//     display: flex;
//     align-items: center;
// }

// nav ul li:hover {
//     background-color: #f5f5f5;
// }

// nav ul li.active {
//     font-weight: bold;
// }

// .icon {
//     margin-right: 12px;
//     font-size: 1.2em;
// }

// .new-post-button {
//     margin-top: 20px;
//     padding: 12px;
//     background-color: black;
//     color: white;
//     border: none;
//     border-radius: 8px;
//     font-weight: bold;
//     cursor: pointer;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 8px;
// }

// .new-post-button:hover {
//     background-color: #333;
// }

// /* Main Feed */
// .main-feed {
//     flex: 1;
//     margin-left: 250px;
//     padding: 20px;
//     max-width: 600px;
// }

// .create-post {
//     background-color: white;
//     padding: 16px;
//     border-radius: 8px;
//     margin-bottom: 20px;
//     border: 1px solid #e2e2e2;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
// }

// .create-post h3 {
//     margin: 0;
//     color: #666;
// }

// .post-button {
//     background-color: black;
//     color: white;
//     border: none;
//     padding: 8px 16px;
//     border-radius: 20px;
//     font-weight: bold;
//     cursor: pointer;
// }

// /* Posts */
// .posts-container {
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
// }

// .post {
//     background-color: white;
//     padding: 16px;
//     border-radius: 8px;
//     border: 1px solid #e2e2e2;
// }

// .post-header {
//     display: flex;
//     justify-content: space-between;
//     margin-bottom: 12px;
//     font-size: 14px;
// }

// .username {
//     font-weight: bold;
// }

// .post-time {
//     color: #999;
// }

// .post-content {
//     line-height: 1.5;
// }

// /* Responsive Design */
// @media (max-width: 768px) {
//     .navigation-sidebar {
//         width: 80px;
//         padding: 10px;
//     }
    
//     .logo, nav ul li span, .new-post-button span {
//         display: none;
//     }
    
//     .new-post-button {
//         justify-content: center;
//         padding: 12px 8px;
//     }
    
//     .main-feed {
//         margin-left: 80px;
//     }
// }