import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import PersonalSidebar from "@/components/personalSidebar"
import GRP1 from "../assets/GRP1.jpg"

interface UserProfile {
  username: string
  displayName: string
  profilePicture?: string
  bio?: string
  dateOfBirth?: string
  email: string
}

const UserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/user/myInfo`, {
      credentials: "include",
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-4 text-white">Loading profile...</div>
  if (!user) return <div className="p-4 text-black">Not logged in.</div>

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
      <PersonalSidebar />

      <main className="w-[1100px] mx-auto">
        <div className="relative">
          <div className="mt-25 dark:bg-lime-500 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3 border-lime-500 dark:border-lime-500">
              <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl font-bold">{user.displayName || user.username}</h1>
              <p className="dark:text-gray-400">@{user.username}</p>
              <p className="mt-2 text-sm">{user.bio || "This is my bio"}</p>
            </div>
            <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
              <Button variant="outline" className="mt-[-220px] text-white bg-lime-600 dark:hover:text-black dark:text-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 dark:hover:bg-lime-500 hover:cursor-pointer">
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex content-between gap-2 text-sm dark:text-gray-400">
            <Link to="/followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">150</span> Following ·
            </Link>
            <Link to="/followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">1.2k</span> Followers ·
            </Link>
            <Link to="/followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">1</span> Bots ·
            </Link>
            <span className="font-medium dark:text-white">6</span> Posts
          </div>
        </div>

        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full dark:bg-black grid-cols-5 dark:border-lime-500">
            <TabsTrigger className="dark:text-lime-500" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="replies">Replies</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="media">Media</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="highlights">Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-0">
            {[
              { time: "2h ago", text: "Excited to share my latest project with you all!" },
              { time: "5h ago", text: "Loving the new Future Feed design 💻" },
              { time: "1d ago", text: "Shadcn actually so nice, Thank you Mr Arne" },
              { time: "2d ago", text: "Debugging is like being the detective in a crime movie where you're also the murderer 😅" },
              { time: "3d ago", text: "Setting up design is hard" },
              { time: "4d ago", text: "Excited for demo 2 with my team", image: GRP1 },
            ].map((post, index) => (
              <Card key={index} className="mt-3 dark:bg-[#1a1a1a] dark:border-lime-500 border-2 border-lime-500 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={user.profilePicture || GRP1} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h2 className="font-bold dark:text-white">{user.displayName || user.username}</h2>
                        <span className="text-sm dark:text-gray-400">{post.time}</span>
                      </div>
                      <p className="dark:text-gray-300">@{user.username}</p>
                      <p className="mt-2 dark:text-white">{post.text}</p>
                      {post.image && (
                        <img src={post.image} alt="Post" className="mt-4 rounded-lg border dark:border-gray-700" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="replies">
            <div className="p-4 dark:text-gray-400">No replies yet.</div>
          </TabsContent>
          <TabsContent value="media">
            <div className="p-4 dark:text-gray-400">No media yet.</div>
          </TabsContent>
          <TabsContent value="likes">
            <div className="p-4 dark:text-gray-400">No liked posts yet.</div>
          </TabsContent>
          <TabsContent value="highlights">
            <div className="p-4 dark:text-gray-400">No highlights available yet.</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserProfile
