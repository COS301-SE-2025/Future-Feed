import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import Post from "@/components/ui/post";
import GRP1 from "../assets/GRP1.jpg";
import WhatsHappening from "@/components/WhatsHappening";
import WhoToFollow from "@/components/WhoToFollow";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
  email: string;
}

interface CommentData {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  username: string;
  handle: string;
}

interface RawComment {
  id: number;
  postId: number;
  userId?: number;
  content: string;
  createdAt: string;
}

interface PostData {
  profilePicture?: string;
  id: number;
  username: string;
  handle: string;
  time: string;
  text: string;
  image?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  isReshared: boolean;
  commentCount: number;
  authorId: number;
  likeCount: number;
  reshareCount: number;
  comments: CommentData[];
  showComments: boolean;
  topics: Topic[];
}

interface Topic {
  id: number;
  name: string;
}

interface RawPost {
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture?: string;
  };

}

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
}

interface FollowRelation {
  id: number;
  followerId: number;
  followedId: number;
  followedAt: string;
}

interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

const userCache = new Map<number, UserInfo>();

const profileDataCache = {
  user: null as UserProfile | null,
  followers: [] as User[],
  followingUsers: [] as User[],
  posts: [] as PostData[],
  reshares: [] as PostData[],
  commented: [] as PostData[],
  likedPosts: [] as PostData[],
  bookmarkedPosts: [] as PostData[],
};

const Profile = () => {
  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="w-[1100px] mx-auto mt-3">
        <div className="relative">
          <div className="mt-25 dark:bg-lime-500 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3 border-lime-500 dark:border-lime-500">
              <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
                <AvatarImage src={GRP1} alt={`Username`} />
                <AvatarFallback>Username</AvatarFallback>
              </Link>
            </Avatar>
          </div>
        </div>
        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl font-bold">Display Name</h1>
              <p className="dark:text-gray-400">User Name</p>
              <p className="mt-2 text-sm"> This is my bio</p>
            </div>
            <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
              <Button variant="outline" className="mt-[-220px] text-white bg-lime-600 dark:hover:text-black dark:text-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 dark:hover:bg-lime-500 hover:cursor-pointer">
                Edit Profile
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex content-between gap-2 text-sm dark:text-gray-400">
            <Link to="/followers?tab=following" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Following ·
            </Link>
            <Link to="/followers?tab=followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Followers ·
            </Link>
            <Link to="/followers?tab=bots" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Bots ·
            </Link>
            <span className="font-medium dark:text-white">0</span> Posts
          </div>
        </div>
        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />
        <Tabs defaultValue="posts" className="w-full"> 
          <TabsList className="grid w-full dark:bg-black grid-cols-5 dark:border-lime-500">
            <TabsTrigger className="dark:text-lime-500" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="re-feeds">Re-Feeds</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="comments">Comments</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="p-0">
            
          </TabsContent>
          <TabsContent value="re-feeds" className="p-0">
            
          </TabsContent>
          <TabsContent value="comments">
            
          </TabsContent>
          <TabsContent value="likes">
            
          </TabsContent>
          <TabsContent value="bookmarks">
            
          </TabsContent>
        </Tabs>
      </main>
      <aside className="w-full lg:w-[350px] lg:mt-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
          <WhoToFollow />
        </div>
      </aside>
    </div>
  );
}

export default Profile;