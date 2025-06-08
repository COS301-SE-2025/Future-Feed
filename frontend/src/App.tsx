
import { Routes, Route } from "react-router-dom"
import UserProfile from "./pages/UserProfile"
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import FAQS from "./pages/FAQS";

function App() {
  return (
    <Routes>
      {/* Future routes: <Route path="/" element={<Landing />} /> */}
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/explore" element={<Explore />} />
       <Route path="/settings" element={<Settings />} />
       <Route path="/FAQS" element={<FAQS />} />
    </Routes>
  )
}

export default App;