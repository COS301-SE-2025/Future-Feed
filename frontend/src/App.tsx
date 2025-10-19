import { Routes, Route, Navigate } from "react-router-dom";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import FAQS from "./pages/FAQS";
import Help from "./pages/Help";
import LandingPage from "./pages/LandingPage";
import FollowerFollowing from "./pages/FollowerFollowing";
import HomePage from "./pages/HomePage";
import Bots from "./pages/Bots";
import Login from "./pages/Login";
import Construction from "./pages/Construction";
import Forgot from "./pages/Forgot";
import EditProfilePage from "./pages/EditProfile";
import PostPage from "./pages/PostPage";
import BotPage from "./pages/BotPage";
import EditBotPage from "./pages/EditBot";
import Profile from "./pages/Profile";
import TopicPage from "./pages/TopicPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/profile/:profileId" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfilePage />} />
      <Route path="/followers" element={<FollowerFollowing />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/faqs" element={<FAQS />} />
      <Route path="/help" element={<Help />} />
      <Route path="/bots" element={<Bots />} />
      <Route path="/bot/:botId" element={<BotPage />} />
      <Route path="/edit-bot" element={<EditBotPage />} />
      <Route path="/post/:postId" element={<PostPage />} />
      <Route path="/topic/:topicName" element={<TopicPage />} />
      <Route path="/forgotpassword" element={<Forgot />} />
      <Route path="/construction" element={<Construction />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;