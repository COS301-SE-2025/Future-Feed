import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFollowStore } from "@/store/useFollowStore"

interface TopFollowedUser {
  id: number
  username: string
  name: string
  followerCount: number
  imageUrl?: string
}

const WhoToFollow = () => {
  const [topUsers, setTopUsers] = useState<TopFollowedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingFollow, setLoadingFollow] = useState<Record<number, boolean>>({})

  const API_Url = import.meta.env.VITE_API_Url || "http://localhost:8080"

  const { followStatus, updateFollowStatus } = useFollowStore()

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await fetch(`${API_Url}/api/user/top-followed`, {
          method: "GET",
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch top users")
        const data = await res.json()
        setTopUsers(data)

        // Fetch follow status for each user
        const statuses = await Promise.all(
          data.map(async (user: TopFollowedUser) => {
            const res = await fetch(`${API_Url}/api/follow/status/${user.id}`, {
              method: "GET",
              credentials: "include",
            })
            const json = await res.json()
            return [user.id, json.following] as const
          })
        )
        statuses.forEach(([id, status]) => updateFollowStatus(id, status))
      } catch (err) {
        console.error(err)
        setError("Could not load recommendations.")
      } finally {
        setLoading(false)
      }
    }

    fetchTopUsers()
  }, [updateFollowStatus])

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

        {loading ? (
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
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <div className="space-y-4 text-sm">
            {topUsers.map((user) => {
              const isFollowing = followStatus[user.id]

              return (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-lime-500">
                      <AvatarImage src={user.imageUrl} alt={`@${user.username}`} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="dark:text-lime-500">@{user.name.split("@")[0]}</p>
                    </div>
                  </div>

                  {loadingFollow[user.id] ? (
                    <Skeleton className="h-8 w-16 rounded-2xl" />
                  ) : isFollowing ? (
                    <Button
                      className="rounded-full  border border-gray-400 font-semibold dark:text-white dark:bg-black hover:bg-lime-500 hover:cursor-pointer"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      className="rounded-full bg-lime-500 text-black font-semibold hover:bg-lime-600 hover:cursor-pointer"
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
