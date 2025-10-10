import PersonalSidebar from "@/components/PersonalSidebar"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react";
import GRP1 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"

import { useLocation, useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useFollowStore } from "@/store/useFollowStore"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface UserProfile {
  id: number
  username: string
  displayName: string
  profilePicture?: string
  bio?: string | null
  dateOfBirth?: string | null
  email: string
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
  const [user, setUser] = useState<UserProfile | null>(null)
  const { updateFollowStatus, addFollowingUser, removeFollowingUser } = useFollowStore();
  const { followStatus } = useFollowStore();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { followingUsers, fetchFollowers, fetchFollowing, followers } = useFollowStore();
  const userCache = new Map<number, { username: string; displayName: string }>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") || "followers";

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`)
      const data: UserProfile = await res.json()
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName")
      }
      setUser(data)
      userCache.set(data.id, { username: data.username, displayName: data.displayName })
      return data
    } catch (err) {
      console.error("Error fetching user info:", err)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

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
        //console.log("Fetched all users:", allUsers);

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


      } else{
        navigate("/login")
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-4 text-white">Loading profile...</div>;
  if (!user) return <div className="p-4 text-black">Not logged in.</div>

  const renderUserCard = (user: User) => (
    <Card key={user.id} className=" border future-feed:bg-black future-feed:border-lime future-feed:text-white rounded-2xl">
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
            className="px-4 py-1 rounded-full  border border-gray-400 font-semibold  hover:cursor-pointer"
            variant={"secondary"}
          >
            Unfollow
          </Button>
        ) : (
          <Button
            onClick={() => handleFollow(user)}
            className="px-4 py-1 rounded-full font-semibold  hover:cursor-pointer"

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
        <Card key={idx} className=" rounded-2xl">
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

  return (
    <div className="bg-white  future-feed:bg-black flex min-h-screen dark:bg-blue-950 dark:text-slate-200">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="h-fit dark:bg-blue-950 flex-1 rounded-2xl border-none min-h-screen mt-5">


        <div className="future-feed:border-black  text-black flex flex-col items-center px-4 top-0 dark:bg-blue-950 border-none drop-shadow-xl rounded-xl dark:border-slate-200 z-10">
          <Avatar className=" w-24 h-24 border-4 ">
            <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
              <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>

            </Link>
          </Avatar>
          <h1 className="text-xl future-feed:text-white  font-bold">{user.displayName || user.username}</h1>
          <p className="dark:text-gray-400">@{user.username}</p>
        </div>

        <Tabs defaultValue={tabParam} className="w-full p-3 ">
          <TabsList className="w-full flex justify-around border  rounded-2xl">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-2xl  dark:data-[state=active]:border-b-2"
            >
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-2xl "
            >
              Following ({followingUsers.length})
            </TabsTrigger>

          </TabsList>

          <TabsContent value="followers">
            {followersLoading ? renderSkeleton() : (
              followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((user: User) => renderUserCard(user))}
                </div>
              ) : (
                <p className="p-4 dark:text-gray-400">You currently have no followers.</p>
              )
            )}
          </TabsContent>

          <TabsContent value="following">
            {followingLoading ? renderSkeleton() : (
              <div className="space-y-4">
                {followingUsers.map((user: User) => renderUserCard(user))}
              </div>
            )}
          </TabsContent>

        </Tabs>

        <div className="w-full lg:sticky  dark:bg-blue-950 px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main >
      <aside className="w-full lg:w-[350px] flex-shrink-0 hidden lg:block mr-6.5">
        <div className="sticky top-4 space-y-5">
          <div className="w-full lg:w-[320px] lg:ml-7">
            <WhatsHappening />
          </div>
          <div className="w-full lg:w-[320px] lg:ml-7">
            <WhoToFollow />
          </div>
        </div>
      </aside>

    </div>
  )
}

export default FollowerFollowing;
