// src/pages/Explore.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings } from "lucide-react"
import PersonalSidebar from "@/components/PersonalSidebar"
import { Input } from "@/components/ui/input"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import RightSidebar from "@/components/RightSidebar"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"

interface SearchUser {
  id: number
  username: string
  displayName: string
  bio: string
  profilePicture: string
  
}


const Explore = () => {
 const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);

  useEffect(() => {
  if (query.trim() === "") {
    fetch(`${import.meta.env.VITE_API_URL}/api/user/all`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch(console.error);
  }
}, [query]);

useEffect(() => {
  const timeout = setTimeout(() => {
    if (query.trim()) {
      fetch(`${import.meta.env.VITE_API_URL}/api/user/search?q=${query}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch(console.error);
    }
  }, 300);

  return () => clearTimeout(timeout);
}, [query]);


  return (
    <div className="flex min-h-screen  bg-gray-200 dark:bg-[#1a1a1a] dark:text-white">
      {/* PersonalSidebar Left */}
      <aside className="w-[275px]  ">
        <PersonalSidebar />
      </aside>
      

      {/* Main Explore Content */}
      <main className="flex-1 max-w-2xl border bg-gray-200 dark:bg-[#1a1a1a] dark:border-lime-500 rounded-2xl p-6 min-h-screen">

        {/* Mobile Search Input */}
<div className="block lg:hidden px-4 py-3 sticky top-0 z-10 dark:bg-[#1a1a1a] bg-lime-600">
  <Input
    type="text"
    placeholder="Search"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="bg-lime-600 rounded-full dark:bg-[#1a1a1a] dark:text-white border-lime-500 dark:placeholder:text-lime-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
  />
</div>

       {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-[#1a1a1a] border rounded-2xl dark:border-lime-500 z-10">
          <h1 className="text-xl dark:text-lime-500 font-bold">Explore</h1>
          <Link to="/settings">
          <Settings size={20} className="dark:text-lime-500" />
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="forYou" className="w-full p-2">
          <TabsList className="w-full flex justify-around rounded-2xl border dark:border-lime-500  dark:bg-[#1a1a1a]">
            {["forYou", "accounts"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 rounded-2xl dark:lime-500 text-green capitalize dark:data-[state=active]:text-black dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-500"
              >
                {tab.replace(/^\w/, c => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent className="" value="forYou">
            <section className="p-4 border dark:border-lime-500">
              <h2 className="font-bold  text-lg mb-2">Today’s News</h2>
              <div className="mb-4">
                <p className="text-sm dark:text-neutral-400 mb-1">16 hours ago • News • 1M posts</p>
                <p className="font-semibold hover:underline cursor-pointer">
                  Protests Turn Tense: National Guard Deployed in LA Amid ICE Operations
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm dark:text-neutral-400 mb-1">Trending now • Entertainment • 4.8K posts</p>
                <p className="font-semibold hover:underline cursor-pointer">
                  R-Truth’s WWE Comeback: A Story of Fan Power and Redemption
                </p>
              </div>
              <div>
                <p className="text-sm dark:text-neutral-400 mb-1">1 day ago • Entertainment • 21K posts</p>
                <p className="font-semibold hover:underline cursor-pointer">
                  NIKKE x Stellar Blade Collaboration
                </p>
              </div>
            </section>

            {/* Trends List */}
            <section className="p-4 space-y-4 border dark:border-lime-500 p-0">
              {[
                { title: "Connie", posts: "10.1K", region: "Trending in South Africa" },
                { title: "Sharapova", posts: "3,165", region: "Sports · Trending" },
                { title: "#uyandaxchillerspunchvibes", posts: "17.6K", region: "Trending in South Africa" },
                { title: "Muller", posts: "12K", region: "Sports · Trending" },
              ].map((trend, idx) => (
                <div key={idx}>
                  <p className="text-sm dark:text-neutral-400">{trend.region}</p>
                  <p className="font-semibold cursor-pointer hover:underline">{trend.title}</p>
                  <p className="text-sm dark:text-neutral-400">{trend.posts} posts</p>
                </div>
              ))}
            </section>
          </TabsContent>

          {/* Placeholder for other tabs */}
          <TabsContent value="accounts">
             <div className="space-y-4">
    {results.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400 p-4">
        {query ? "No users found." : "Start typing to search for users."}
      </p>
    ) : (
      results.map((user: SearchUser) => (
        <UserCardWithFollow key={user.id} user={user} />
      ))
    )}
  </div>
                   </TabsContent>
          
        </Tabs>
           {/* Mobile RHS below main content */}
    <div className="w-full dark:bg-[#1a1a1a] px-4 mt-7 py-2 space-y-6 block lg:hidden">
      <WhatsHappening />
      <WhoToFollow />
    </div>
      </main>
    

      {/* Right PersonalSidebar */}
      <aside className="">
        <RightSidebar />
      </aside>
      
       {/* Mobile RHS below main content */}
   

    </div>
  )
}

export default Explore;
{/*part 2*/ }
const UserCardWithFollow = ({ user }: { user: SearchUser }) => {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch follow status on mount
    fetch(`${import.meta.env.VITE_API_URL}/api/follow/status/${user.id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setIsFollowing(data.following))
      .catch(() => setIsFollowing(false));
  }, [user.id]);

  const toggleFollow = async () => {
    setLoading(true);
    const endpoint = `${import.meta.env.VITE_API_URL}/api/follow/${user.id}`;
    const method = isFollowing ? "DELETE" : "POST";
    const body = isFollowing ? null : JSON.stringify({ followedId: user.id });

    try {
      await fetch(method === "POST" ? `${import.meta.env.VITE_API_URL}/api/follow` : endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
      });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Follow toggle failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-black dark:text-white border dark:border-lime-500 rounded-2xl">
      <CardContent className="flex gap-3 items-start p-4 justify-between">
        <div className="flex gap-4">
          <Avatar className="w-14 h-14 border-4 border-slate-300">
            <AvatarImage src={user.profilePicture} alt={user.username} />
            <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">@{user.username}</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-300">
              {user.bio || "No bio provided"}
            </p>
          </div>
        </div>
        <Button
          onClick={toggleFollow}
          disabled={loading || isFollowing === null}
          className={`text-sm rounded-full px-4 py-2 ${isFollowing ? "bg-gray-400 text-white hover:bg-gray-600" : "bg-lime-500 text-black hover:bg-lime-600"}`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </CardContent>
    </Card>
  );
};

