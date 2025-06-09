
import { Routes, Route } from "react-router-dom"
import UserProfile from "./pages/UserProfile"
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import FAQS from "./pages/FAQS";
import Help from './pages/Help';
import LandingPage from "./pages/LandingPage";


function App() {
  return (
    <Routes>
      {/* Future routes: <Route path="/" element={<Landing />} /> */}
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/explore" element={<Explore />} />
       <Route path="/settings" element={<Settings />} />
       <Route path="/FAQS" element={<FAQS />} />
       <Route path="/help" element={<Help />} />
        <Route path="/landing" element={<LandingPage />} />
    </Routes>
  )
}

export default App;