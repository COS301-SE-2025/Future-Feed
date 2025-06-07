import React from "react";
import { Routes, Route } from "react-router-dom"
import UserProfile from "./pages/UserProfile"
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      {/* Future routes: <Route path="/" element={<Landing />} /> */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  )
}

export default App;