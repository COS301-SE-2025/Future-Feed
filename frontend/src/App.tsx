import React from "react";
import { Routes, Route } from "react-router-dom"
import UserProfile from "./pages/UserProfile"
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";

function App() {
  return (
    <Routes>
      {/* Future routes: <Route path="/" element={<Landing />} /> */}
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  )
}

export default App;