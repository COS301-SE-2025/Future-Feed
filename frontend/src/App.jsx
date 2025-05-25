import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Construction from "./pages/Construction";
import UserProfile from "./pages/UserProfile";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import NotificationsPage from "./pages/NotificationsPage";
import EditProfilePage from "./pages/EditProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/construction" element={<Construction />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

