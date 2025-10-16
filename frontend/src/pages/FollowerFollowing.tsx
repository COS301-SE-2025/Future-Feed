import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { useFollowStore } from "@/store/useFollowStore";
import GRP1 from "../assets/GRP1.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
  email: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  displayName: string;
  email: string;
  profilePicture?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
}

const FollowerFollowing = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { updateFollowStatus, addFollowingUser, removeFollowingUser, followingUsers, fetchFollowers, fetchFollowing, followers } = useFollowStore();
  const { followStatus } = useFollowStore();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "followers";
  const navigate = useNavigate();
  const userCache = new Map<number, { username: string; displayName: string }>();

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName");
      }
      setUser(data);
      userCache.set(data.id, { username: data.username, displayName: data.displayName });
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setUser(null);
      navigate("/login");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/user/all`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
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

  const handleFollow = async (user: User) => {
    try {
      await fetch(`${API_URL}/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followedId: user.id }),
      });
      updateFollowStatus(user.id, true);
      addFollowingUser(user);
      if (currentUserId !== null) {
        await fetchFollowing(currentUserId, users);
      }
    } catch (err) {
      console.error("Follow failed", err);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      await fetch(`${API_URL}/api/follow/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      updateFollowStatus(userId, false);
      removeFollowingUser(userId);
      if (currentUserId !== null) {
        await fetchFollowing(currentUserId, users);
      }
    } catch (err) {
      console.error("Unfollow failed", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setCurrentUserId(currentUser.id);
        const allUsers = await fetchUsers();
        setUsers(allUsers);
        await fetchFollowing(currentUser.id, allUsers);
        setFollowingLoading(false);
        await fetchFollowers(currentUser.id, allUsers);
        setFollowersLoading(false);
        const statusEntries = await Promise.all(
          allUsers.map(async (user: User) => {
            const isFollowing = await checkFollowStatus(user.id);
            return [user.id, isFollowing] as const;
          })
        );
        useFollowStore.getState().bulkSetFollowStatus(Object.fromEntries(statusEntries));
      }
    };
    loadData();
  }, []);

  const renderUserCard = (user: User) => (
    <Card key={user.id} className="border future-feed:bg-black future-feed:border-lime future-feed:text-white rounded-2xl">
      <CardContent className="flex gap-3 items-start p-4">
        <Avatar className="w-14 h-14 border-4 border-slate-300">
          <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
          <AvatarFallback>{user.username}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-sm text-gray-500 dark:text-slate-500">@{user.username}</p>
          <p className="text-sm dark:text-slate-500 mt-1">{user.bio || ""}</p>
        </div>
        {followStatus[user.id] ? (
          <Button
            onClick={() => handleUnfollow(user.id)}
            className="px-4 py-1 rounded-full border border-gray-400 font-semibold hover:cursor-pointer"
            variant="secondary"
          >
            Unfollow
          </Button>
        ) : (
          <Button
            onClick={() => handleFollow(user)}
            className="px-4 py-1 rounded-full font-semibold hover:cursor-pointer"
          >
            Follow
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="rounded-2xl">
          <CardContent className="flex gap-3 items-start p-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-blue-950 future-feed:bg-black future-feed:text-lime">
        <main className="flex-1 p-4">
          <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-4 w-1/3 mx-auto mb-4" />
          {renderSkeleton()}
        </main>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-blue-950 future-feed:bg-black border-t dark:border-slate-700">
          <PersonalSidebar />
        </nav>
      </div>
    );
  }

  if (!user) return <div className="p-4 text-black dark:text-white">Not logged in.</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-blue-950 future-feed:bg-black future-feed:text-lime text-black dark:text-slate-200">
      <aside className="hidden lg:block w-[245px] ml-6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 p-4 lg:mr-7">
        <div className="bg-white dark:bg-blue-950 future-feed:bg-black rounded-2xl p-4 mb-4">
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 border-4 border-slate-300">
              <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
                <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Link>
            </Avatar>
            <h1 className="text-xl font-bold mt-2 future-feed:text-white">{user.displayName || user.username}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-500">@{user.username}</p>
          </div>
        </div>

        <Tabs defaultValue={tabParam} className="w-full">
          <TabsList className="w-full flex justify-around border rounded-2xl mb-4 bg-white dark:bg-blue-950 future-feed:bg-black">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-2xl data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-2xl data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Following ({followingUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers">
            {followersLoading ? renderSkeleton() : (
              followers.length > 0 ? (
                <div className="space-y-4">{followers.map((user) => renderUserCard(user))}</div>
              ) : (
                <p className="p-4 text-gray-500 dark:text-slate-500">You currently have no followers.</p>
              )
            )}
          </TabsContent>

          <TabsContent value="following">
            {followingLoading ? renderSkeleton() : (
              followingUsers.length > 0 ? (
                <div className="space-y-4">{followingUsers.map((user) => renderUserCard(user))}</div>
              ) : (
                <p className="p-4 text-gray-500 dark:text-slate-500">You are not following anyone.</p>
              )
            )}
          </TabsContent>
        </Tabs>

        <div className="lg:hidden mt-6 space-y-6">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="hidden lg:block w-[350px]">
        <div className="sticky top-4 space-y-5">
          <div className="w-[320px]"><WhatsHappening /></div>
          <div className="w-[320px]"><WhoToFollow /></div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-blue-950 future-feed:bg-black border-t dark:border-slate-700 z-50">
        <PersonalSidebar />
      </nav>
    </div>
  );
};

export default FollowerFollowing;