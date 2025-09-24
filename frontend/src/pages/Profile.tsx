import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhatsHappening from "@/components/WhatsHappening";
import WhoToFollow from "@/components/WhoToFollow";
import { useParams } from "react-router-dom";

interface User {
  id: number;
  username: string;
  displayName: string;
  bio?: string;
  following?: number;
  followers?: number;
  bots?: number;
  posts?: number;
  profilePicture?: string;
}

const API_URL = "http://localhost:8080";

const Profile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (): Promise<User> => {
    console.log("Fetching user with ID:", profileId);
    try {
      const res = await fetch(`${API_URL}/api/user/${profileId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user ${profileId}`);
      const userData = await res.json();
      return {
        id: userData.id ?? parseInt(profileId || "0"),
        username: userData.username ?? `user${profileId}`,
        displayName: userData.displayName ?? `User ${profileId}`,
        bio: userData.bio ?? "This is my bio",
        following: userData.following ?? 0,
        followers: userData.followers ?? 0,
        bots: userData.bots ?? 0,
        posts: userData.posts ?? 0,
        profilePicture: userData.profilePicture ?? undefined,
      };
    } catch (err) {
      console.warn(`Error fetching user ${profileId}:`, err);
      return {
        id: parseInt(profileId || "0"),
        username: `user${profileId}`,
        displayName: `User ${profileId}`,
        bio: "This is my bio",
        following: 0,
        followers: 0,
        bots: 0,
        posts: 0,
        profilePicture: undefined,
      };
    }
  };

  const checkFollowStatus = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/status/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      return data.following;
    } catch (err) {
      console.error("Failed to check follow status for user", userId, err);
      return false;
    }
  };

  const updateFollowStatuses = async (users: User[]) => {
      const currentStatuses = useFollowStore.getState().followStatus;
      const newStatuses = { ...currentStatuses };
  
      // Only check statuses for users we don't already know about
      const usersToCheck = users.filter(user => !(user.id in currentStatuses));
  
      if (usersToCheck.length > 0) {
        const statusUpdates = await Promise.all(
          usersToCheck.map(async (user) => {
            const isFollowing = await checkFollowStatus(user.id);
            return { id: user.id, status: isFollowing };
          })
        );
  
        statusUpdates.forEach(({ id, status }) => {
          newStatuses[id] = status;
        });
  
        useFollowStore.getState().bulkSetFollowStatus(newStatuses);
      }
    };

  useEffect(() => {
    const loadUser = async () => {
      if (!profileId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const userData = await fetchUser();
      setUser(userData);
      setIsLoading(false);
    };
    loadUser();
  }, [profileId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !profileId) {
    return <div>User not found</div>;
  }

  return (
    <div className="bg-gray-200 future-feed:bg-black future-feed:text-lime flex min-h-screen dark:bg-blue-950 dark:text-slate-200 overflow-y-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="w-[1100px] mx-auto mt-3">
        <div className="relative">
          <div className="mt-25 dark:bg-slate-200 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3  ">
                <AvatarImage src={user.profilePicture} alt={`@${user.username}`} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="pt-16 px-4">
          <div className="text-gray-400 flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl future-feed:text-white  font-bold">{user.displayName || user.username}</h1>
              <p className="dark:text-slate-500">@{user.username}</p>
              <p className="mt-2 text-sm">{user.bio || "This is my bio"}</p>
            </div>
              <Button variant="secondary" className="bg-white border-rose-gold-accent-border mt-[-90px] dark:hover:bg-slate-200 dark:hover:text-black hover:cursor-pointer">
                Follow
              </Button>
          </div>
          <div className=" text-gray-400 mt-4 flex content-between gap-2 text-sm dark:text-slate-500">
            <Link to="/followers?tab=following" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-slate-200"> 0</span> Following ·
            </Link>
            <Link to="/followers?tab=followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-slate-200"> 0</span> Followers ·
            </Link>
            <Link to="/followers?tab=bots" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-slate-200">0</span> Bots ·
            </Link>
            <span className="font-medium dark:text-slate-200">0</span> Posts
          </div>
        </div>
        <Separator className="my-4 future-feed:bg-lime bg-blue-500 dark:bg-slate-200" />
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full  dark:bg-blue-950 grid-cols-5 ">
            <TabsTrigger className="text-black" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="text-black" value="re-feeds">Re-Feeds</TabsTrigger>
            <TabsTrigger className="text-black" value="comments">Comments</TabsTrigger>
            <TabsTrigger className="text-black" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="text-black" value="bookmarks">Bookmarks</TabsTrigger>
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
};

export default Profile;