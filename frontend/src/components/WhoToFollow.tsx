import { useEffect, useState } from "react"
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFollowStore } from "@/store/useFollowStore"

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

interface FollowStatusResponse {
  following: boolean
}

const WhoToFollow = () => {
  const [loadingFollow, setLoadingFollow] = useState<Record<number, boolean>>({})
  const API_Url = import.meta.env.VITE_API_Url || "http://localhost:8080"
  const { followStatus, removeFollowingUser, addFollowingUser, updateFollowStatus } = useFollowStore()

  // Fetch top users with React Query
  const { 
    data: topUsers = [], 
    isLoading, 
    error: fetchError 
  } = useQuery<TopFollowedUser[], Error>({
    queryKey: ['topFollowedUsers'],
    queryFn: async (): Promise<TopFollowedUser[]> => {
      const res = await fetch(`${API_Url}/api/user/top-followed`, {
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
    if (topUsers.length === 0) return

    const fetchStatuses = async () => {
      try {
        const statuses = await Promise.all(
          topUsers.map(async (user: TopFollowedUser) => {
            const res = await fetch(`${API_Url}/api/follow/status/${user.id}`, {
              method: "GET",
              credentials: "include",
            })
            const json: FollowStatusResponse = await res.json()
            return { id: user.id, status: json.following }
          })
        )
        statuses.forEach(({ id, status }: { id: number; status: boolean }) => 
          updateFollowStatus(id, status)
        )
      } catch (err) {
        console.error("Error fetching follow statuses:", err)
      }
    }

    fetchStatuses()
  }, [topUsers, updateFollowStatus, API_Url])

  const handleFollow = async (userId: number) => {
    setLoadingFollow((prev) => ({ ...prev, [userId]: true }))
    try {
      await fetch(`${API_Url}/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followedId: userId }),
      })
      updateFollowStatus(userId, true)
      const userToAdd = topUsers.find((u: TopFollowedUser) => u.id === userId)
      if (userToAdd) {
        addFollowingUser(userToAdd)
      }
    } catch (err) {
      console.error(`Failed to follow user ${userId}`, err)
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleUnfollow = async (userId: number) => {
    setLoadingFollow((prev) => ({ ...prev, [userId]: true }))
    try {
      await fetch(`${API_Url}/api/follow/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      updateFollowStatus(userId, false)
      removeFollowingUser(userId)
    } catch (err) {
      console.error(`Failed to unfollow user ${userId}`, err)
    } finally {
      setLoadingFollow((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <Card className="bg-green dark:bg-black dark:border-lime-500 dark:text-lime-500 rounded-3xl border-2 border-lime-500 bg-lime-600 text-white">
      <CardContent className="p-4">
        <h2 className="font-bold text-lg mb-4">Follow Latest</h2>

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
              const isFollowing = followStatus[user.id]

              return (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-lime-500">
                      <AvatarImage src={user.profilePicture} alt={`@${user.username}`} />
                      <AvatarFallback>{user.username}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="dark:text-lime-500">@{user.name}</p>
                    </div>
                  </div>

                  {loadingFollow[user.id] ? (
                    <Skeleton className="h-8 w-16 rounded-2xl" />
                  ) : isFollowing ? (
                    <Button
                      className="w-[90px] rounded-full border border-gray-400 font-semibold dark:text-white dark:bg-black hover:bg-lime-500 hover:cursor-pointer"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      className="w-[90px] rounded-full bg-lime-500 text-black font-semibold hover:bg-lime-600 hover:cursor-pointer"
                      onClick={() => handleFollow(user.id)}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              )
            })}

            <div>
              <p className="dark:text-gray-400 hover:underline cursor-pointer">Show more</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WhoToFollow