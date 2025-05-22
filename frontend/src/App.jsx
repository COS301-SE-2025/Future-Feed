import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Construction from "./pages/Construction";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/construction" element={<Construction />} />
        <Route path="/user-profile" element={<UserProfile />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

