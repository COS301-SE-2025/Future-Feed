import React from "react";
import { Routes, Route } from "react-router-dom"
import UserProfile from "./pages/UserProfile"

function App() {
  return (
    <Routes>
      {/* Future routes: <Route path="/" element={<Landing />} /> */}
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  )
}

export default App;