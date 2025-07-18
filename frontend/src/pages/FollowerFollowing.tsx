// src/pages/FollowerFollowing.tsx
import PersonalSidebar from "@/components/PersonalSidebar"
import RightSidebar from "@/components/RightSidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react";
import GRP1 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import { Input } from "@/components/ui/input"
import { useLocation } from "react-router-dom"

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

const FollowerFollowing = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null)
  const [followStatus, setFollowStatus] = useState<Record<number, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const userCache = new Map<number, { username: string; displayName: string }>();
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<User[]>([]);
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
      console.log("Current User Details:", data) // Log user details
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
  
    const fetchFollowing = async (userId: number, allUsers: User[]) => {
      try {
        const res = await fetch(`${API_URL}/api/follow/following/${userId}`, {
          method: "GET",
          credentials: "include",
        });
  
        const data: FollowRelation[] = await res.json();
        const followedUserIds = data.map((relation) => relation.followedId);
        const followedUsers = allUsers.filter((user) => followedUserIds.includes(user.id));
        setFollowingUsers(followedUsers);
      } catch (err) {
        console.error("Failed to fetch following users", err);
      }
    };

    const fetchFollowers = async (userId: number, allUsers: User[]) => {
      try {
        const res = await fetch(`${API_URL}/api/follow/followers/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        const data: FollowRelation[] = await res.json();
        const followerUserIds = data.map((relation) => relation.followerId);
        const followerUsers = allUsers.filter((user) =>
          followerUserIds.includes(user.id)
        );
        setFollowers(followerUsers);
      } catch (err) {
        console.error("Failed to fetch followers", err);
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
  
    const handleFollow = async (id: number) => {
      try {
        await fetch(`${API_URL}/api/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ followedId: id }),
        });
        setFollowStatus((prev) => ({ ...prev, [id]: true }));
  
        if (currentUserId !== null) {
          await fetchFollowing(currentUserId, users);
        }
      } catch (err) {
        console.error("Follow failed", err);
      }
    };
  
    const handleUnfollow = async (id: number) => {
      try {
        await fetch(`${API_URL}/api/follow/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        setFollowStatus((prev) => ({ ...prev, [id]: false }));
  
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
          await fetchFollowers(currentUser.id, allUsers); // ✅ ADD THIS

          const statusEntries = await Promise.all(
            allUsers.map(async (user: User) => {
              const isFollowing = await checkFollowStatus(user.id);
              return [user.id, isFollowing] as const;
            })
          );

          setFollowStatus(Object.fromEntries(statusEntries));
        }
      };

      loadData();
    }, []);

    if (loading) return <div className="p-4 text-white">Loading profile...</div>;
    if (!user) return <div className="p-4 text-black">Not logged in.</div>
  
    const renderUserCard = (user: User) => (
      <Card key={user.id} className="dark:bg-[#1a1a1a] dark:text-white border dark:border-lime-500 rounded-2xl">
        <CardContent className="flex gap-3 items-start p-4">
          <Avatar className="w-14 h-14 border-4 border-slate-300">
            <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
            <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-gray-500 dark:text-neutral-400">@{user.username}</p>
            <p className="text-sm dark:text-neutral-300 mt-1">{user.bio}</p>
          </div>
          {followStatus[user.id] ? (
            <button
              onClick={() => handleUnfollow(user.id)}
              className="px-4 py-1 rounded-full border border-gray-400 dark:text-white font-semibold hover:bg-lime-500 hover:cursor-pointer"
            >
              Unfollow
            </button>
          ) : (
            <button
              onClick={() => handleFollow(user.id)}
              className="px-4 py-1 rounded-full bg-lime-500 text-black font-semibold hover:bg-lime-600 hover:cursor-pointer"
            >
              Follow
            </button>
          )}
        </CardContent>
      </Card>
    );

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white">
      {/* Left Sidebar */}
      <PersonalSidebar />

      {/* Center Notification Feed */}
      <main className="h-fit p-6 dark:bg-black flex-1 mx-7 my-7 rounded-2xl border-none min-h-screen">
        <div className="block lg:hidden px-4 py-3 sticky top-0 z-10  bg-black dark:bg-black border dark:border-black">
          <Input
            type="text"
            placeholder="Search"
            className="rounded-full bg-black dark:bg-black dark:text-white dark:placeholder:text-lime-600 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          />
        </div>

        {/* Header */}
        <div className="flex flex-col items-center px-4 py-3 sticky top-0 dark:bg-black border rounded-2xl dark:border-lime-600 z-10">
            <Avatar className=" w-24 h-24 border-4 dark:border-lime-600">
              <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
         
            <h1 className="text-xl font-bold">{user.displayName || user.username}</h1>
            <p className="dark:text-gray-400">@{user.username}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={tabParam} className="w-full p-3 ">
          <TabsList className="w-full flex justify-around dark:bg-black border dark:border-lime-600 rounded-2xl">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-600 dark:data-[state=active]:text-black"
            >
              Followers ({followers ? followers.length : 0})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-600 dark:data-[state=active]:text-black"
            >
              Following ({followingUsers ? followingUsers.length : 0})

            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-600 dark:data-[state=active]:text-black"
            >
              Bots
            </TabsTrigger>
          </TabsList>

          {/* Example Notification */}
          <TabsContent value="followers">
            {followers.length > 0 ? (
              <div className="space-y-4">
                {followers.map((user) => renderUserCard(user))}
              </div>
            ) : (
                  <p className="p-4 dark:text-gray-400">You currently have no followers.</p>
            )}
          </TabsContent>


          {/* You can add verified/mentions TabsContent similarly */}
          <TabsContent value="following">
            <div className="space-y-4">
              {followingUsers.map((user) => renderUserCard(user))}
            </div>
          </TabsContent>

          <TabsContent value="bots">
            <p className="p-4 dark:text-gray-400">You are currently not following any bots</p>
          </TabsContent>

        
        {/**for mobile devices */}
        </Tabs>
         <div className="w-full dark:bg-black px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}

export default FollowerFollowing;
