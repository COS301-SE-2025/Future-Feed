import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaRobot,
  FaUser,
  FaBell,
  FaImage,
} from 'react-icons/fa';
import ffCropped from '../assets/FF cropped.png';
import userProfile from '../assets/FF cropped.png';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider
} from '@/components/ui/sidebar'; // Adjust import based on Shadcn setup

const HomePage = () => {
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [posts, setPosts] = useState([]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postText && !postImage) return;
    const newPost = {
      id: Date.now(),
      profileImage: userProfile,
      username: 'Syntax Squad',
      postTime: 'Just now',
      content: postText,
      image: postImage,
    };
    setPosts([newPost, ...posts]);
    setPostText('');
    setPostImage(null);
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-200 relative">
      <img
        src={ffCropped}
        alt="Future Feed Logo"
        className="absolute left-[-660px] top-[-260px] h-15 w-15 z-10"
      />
      <SidebarProvider>
      <Sidebar className="absolute left-[-670px] top-[-140px] h-[387px] w-[70px] bg-white shadow-lg rounded-lg z-10">
        <SidebarContent>
          <SidebarHeader>
            <nav className="flex flex-col justify-between h-full p-5">
              <ul className="space-y-6">
                <SidebarMenuItem>
                  <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                    <FaHome className="text-2xl" />
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/search" className="flex items-center text-gray-600 hover:text-gray-900">
                    <FaSearch className="text-2xl" />
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/construction" className="flex items-center text-gray-600 hover:text-gray-900">
                    <FaRobot className="text-2xl" />
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/notifications" className="flex items-center text-gray-600 hover:text-gray-900">
                    <FaBell className="text-2xl" />
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/user-profile" className="flex items-center text-gray-600 hover:text-gray-900">
                    <FaUser className="text-2xl" />
                  </Link>
                </SidebarMenuItem>
              </ul>
            </nav>
          </SidebarHeader>
        </SidebarContent>
      </Sidebar>
      </SidebarProvider>
      <div className="flex-1 flex justify-center items-start mt-[-100px]">
        <div className="bg-white w-[1200px] h-[600px] rounded-[50px] p-4 shadow-lg overflow-y-auto no-scrollbar">
          <div className="new-post bg-gray-200 w-[1150px] h-[85px] rounded-[25px] mt-6 ml-5 p-1">
            <form onSubmit={handlePostSubmit} className="flex flex-col gap-2 max-w-[1058px]">
              <textarea
                className="bg-transparent border-none text-2xl font-bold leading-6 outline-none resize-none overflow-hidden h-auto max-h-[100px] mt-6 text-gray-600 w-[700px]"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                rows="2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  className="attachment-button bg-transparent border-2 border-gray-600 rounded-full h-10 w-10 flex items-center justify-center hover:border-black"
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  <FaImage className="text-xl text-gray-600 hover:text-black" />
                </button>
                <Button
                  type="submit"
                  className="new-post-button bg-gray-200 text-gray-600 border-4 border-gray-400 rounded-[20px] font-bold flex items-center gap-2 ml-[840px] mt-[-70px] p-3 hover:bg-gray-700"
                >
                  <h3>New Post</h3>
                </Button>
              </div>
            </form>
          </div>
          <Separator className="my-4 w-[1105px] h-[3px] bg-gray-600 ml-24" />
          {posts.map((post) => (
            <React.Fragment key={post.id}>
              <HomePagePost
                profileImage={post.profileImage}
                username={post.username}
                postTime={post.postTime}
                content={post.content}
                image={post.image}
                id={post.id}
                onDelete={handleDeletePost}
              />
              <Separator className="my-1 w-[1105px] h-[3px] bg-gray-600 ml-24" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;