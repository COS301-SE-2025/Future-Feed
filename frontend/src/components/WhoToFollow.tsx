import { useEffect, useState, useMemo } from "react"
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFollowStore } from "@/store/useFollowStore"
import { useStableFollowStatus } from "@/hooks/useStableFollowingStatus"

//route detection for show morers
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import { useStoreHydration } from '@/hooks/useStoreHydration';

 const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"
 
interface User {
  id: number
  username: string
  name: string
  displayName: string
  email: string
  profilePicture?: string
  bio?: string | null
  dateOfBirth?: string | null
}

interface TopFollowedUser extends User {
  followerCount: number
}



const WhoToFollow = () => {
  const isHydrated = useStoreHydration();


  const [loadingFollow, setLoadingFollow] = useState<Record<number, boolean>>({});
  //const [statusesLoading, setStatusesLoading] = useState(false); // A
 
  const { removeFollowingUser, addFollowingUser} = useFollowStore()
  //prevent unnecessary re-renders
  //const followStatus = useFollowStore(state => state.followStatus);
  const safeUpdateStatus = useFollowStore(state => state.safeUpdateStatus);
  //route detection for show more
  const location = useLocation();
  const isExplorePage = location.pathname === '/explore';
  const navigate = useNavigate();
  

  // Fetch top users with React Query
  const { 
    data: topUsers = [], 
    isLoading, 
    error: fetchError 
  } = useQuery<TopFollowedUser[], Error>({
    queryKey: ['topFollowedUsers'],
    queryFn: async (): Promise<TopFollowedUser[]> => {
      const res = await fetch(`${API_URL}/api/user/top-followed`, {
        method: "GET",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch top users")
      return res.json() as Promise<TopFollowedUser[]>
    },
    staleTime: 30 * 60 * 1000, // 30 minutes until data becomes stale
    gcTime: 60 * 60 * 1000, // 1 hour until cache is garbage collected
  })

  // Fetch follow statuses in parallel
  useEffect(() => {
    if (topUsers.length === 0 || !isHydrated) return

    const fetchStatuses = async () => {
     // setStatusesLoading(true);
      try {
       const statuses = await Promise.all(
        topUsers.map(async (user: TopFollowedUser) => {
          try {
            const res = await fetch(`${API_URL}/api/follow/status/${user.id}`, {
              method: "GET",
              credentials: "include",
            })
            if (!res.ok) {
              console.error(`HTTP ${res.status} for user ${user.id}`);
              return { id: user.id, status: false };
            }
            
            const json = await res.json();
           // console.log(`Status for user ${user.id}:`, json.isFollowing);
            
            // Use the correct property name - API returns {isFollowing: true}
            return { id: user.id, status: json.isFollowing };
          } catch (error) {
            console.error(`Error fetching status for user ${user.id}:`, error);
            return { id: user.id, status: false };
          }
        })
      )
      
      statuses.forEach(({ id, status }) => {
        safeUpdateStatus(id, Boolean(status)); // Ensure boolean
      })
    } catch (err) {
      console.error("Error fetching follow statuses:", err)
    }
  }

  fetchStatuses()
}, [topUsers, safeUpdateStatus, isHydrated]) // Add isHydrated dependency

  const handleFollow = async (userId: number) => {
    setLoadingFollow((prev) => ({ ...prev, [userId]: true }))
    try {
     const res = await fetch(`${API_URL}/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followedId: userId }),
      })
      if (!res.ok) throw new Error(`Follow failed: ${res.status}`);
      //safeuodate
      safeUpdateStatus(userId, true);
      // Update local state

     // updateFollowStatus(userId, true)
      const userToAdd = topUsers.find((u: TopFollowedUser) => u.id === userId)
      if (userToAdd) {
        addFollowingUser(userToAdd)
      }
    } catch (err) {
      console.error(`Failed to follow user ${userId}`, err)
      //revert status on error
      safeUpdateStatus(userId,false);
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleUnfollow = async (userId: number) => {
    setLoadingFollow((prev) => ({ ...prev, [userId]: true }))
    try {
      const res = await fetch(`${API_URL}/api/follow/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Unfollow failed: ${res.status}`);
      //safeuodate
      safeUpdateStatus(userId, false);
      //updateFollowStatus(userId, false)
      removeFollowingUser(userId)
    } catch (err) {
      console.error(`Failed to unfollow user ${userId}`, err)
      //revert status
      safeUpdateStatus(userId,true);
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userId]: false }))
    }
  }
  //fetch all user ids first
  const userIds = useMemo(() => topUsers.map(user => user.id), [topUsers] );
    // Get stable statuses for all users at the top level
  const stableStatuses = useStableFollowStatus(userIds);
//
// Show loading state while hydrating
  if (!isHydrated || isLoading) {
    return (
      <Card className="dark:bg-indigo-950 dark:border-slate-200 dark:text-slate-200 rounded-3xl bg-blue-500  future-feed:bg-black future-feed:border-lime-500 future-feed:text-lime-500 rounded-3xl border-2 future-feed:border-lime-500 future-feed:bg-lime-600 text-white">
        <CardContent className="p-4">
          <h2 className="font-bold text-lg mb-4">Follow Latest</h2>
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
//
  return (

    <Card className="bg-blue-500 text-white   border-rose-gold-accent-border future-feed:bg-black future-feed:text-lime future-feed:border-lime  dark:bg-indigo-950 dark:border-slate-200 dark:text-slate-200 rounded-3xl border-2  dark:hover:border-r-lime-500 dark:hover:border-l-lime-500 hover:border-5 hover:border-r-lime-300 hover:border-l-lime-300 transition-[border-width,border-right-color] duration-800 ease-out-in">

      <CardContent className="p-4 min-h-[200px]">
        <h2 className="font-bold text-rose-gold-text-light text-lg mb-4">Follow Latest</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <p className="text-sm text-red-400">Could not load recommendations.</p>
        ) : (
          <div className="space-y-4 text-sm">
            {topUsers.map((user: TopFollowedUser) => {
              const isFollowing = stableStatuses[user.id] || false;
              return (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="w-10 h-10 border border-lime-500 hover:cursor-pointer"
                      onClick={() => navigate(`/profile/${user.id}`)}  
                    >
                      <AvatarImage src={user.profilePicture} alt={`@${user.username}`} />
                      <AvatarFallback>{user.username}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold hover:cursor-pointer hover:underline" onClick={() => navigate(`/profile/${user.id}`)}  >{user.username}</p>
                      <p className="dark:text-slate-200 hover:cursor-pointer hover:underline" onClick={() => navigate(`/profile/${user.id}`)}  >@{user.name}</p>
                    </div>
                  </div>

                  {loadingFollow[user.id] ? (
                    <Skeleton className="h-8 w-16 rounded-2xl" />
                  ) : isFollowing ? (
                    <Button variant={"secondary"}
                      className="w-[90px] rounded-full  font-semibold  hover:cursor-pointer"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      className="w-[90px] bg-white text-blue-500  rounded-full  font-semibold hover:cursor-pointer"
                      onClick={() => handleFollow(user.id)}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              )
            })}

            <Link to="/explore"className="flex items-center gap-3 dark:hover:text-white">
            <div className={!isExplorePage ? "" : "invisible"}>
        <p className="dark:text-slate-200 text-white  hover:underline cursor-pointer">Show more</p>
      </div>
     
      </Link>
            
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WhoToFollow