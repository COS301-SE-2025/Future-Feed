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
import Forgot from "./pages/Forgot";
import PostPage from "./pages/PostPage";
import BotPage from "./pages/BotPage";
import Profile from "./pages/Profile";


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
      <Route path="/forgotpassword" element={<Forgot />} />
      <Route path="/bots" element={<Bots />} />
      <Route path="/post/:postId" element={<PostPage />} />
      <Route path="/bot/:botId" element={<BotPage />} />
      <Route path="/profile/:profileId" element={<Profile />} />
    </Routes>
    </>
  )
}

export default App;