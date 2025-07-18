import { Routes, Route } from "react-router-dom"
import UserProfile from "./pages/UserProfile"
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import FAQS from "./pages/FAQS";
import Help from './pages/Help';
import LandingPage from "./pages/LandingPage";
import FollowerFollowing from "./pages/FollowerFollowing";
import HomePage from './pages/HomePage';
import Bots from './pages/Bots';
import Login from "./pages/Login";
import Construction from "./pages/Construction";
import RegisterPage from "./pages/RegisterPage";
import Forgot from "./pages/Forgot";
import EditProfilePage from "./pages/EditProfile";


function App() {
  return (
    <>
    
    <Routes>
      {/* Future routes: <Route path="/" element={<Landing />} /> */}
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/explore" element={<Explore />} />
       <Route path="/settings" element={<Settings />} />
       <Route path="/FAQS" element={<FAQS />} />
       <Route path="/help" element={<Help />} />
        <Route path="/" element={<LandingPage />} />
         <Route path="/followers" element={<FollowerFollowing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
      <Route path="/construction" element={<Construction />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgotpassword" element={<Forgot />} />
      <Route path="/edit-profile" element={<EditProfilePage />} />
      <Route path="/bots" element={<Bots />} />
    </Routes>
    </>

  )
}

export default App;