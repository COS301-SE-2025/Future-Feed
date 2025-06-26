// src/pages/Explore.tsx
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import PersonalSidebar from "@/components/personalSidebar";
import { Input } from "@/components/ui/input";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import RightSidebar from "@/components/RightSidebar";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
}

const Explore = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    
       fetch(
        `${import.meta.env.VITE_API_URL}/api/user/all`,
        { method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: "include" }
      )
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error("Failed to fetch users", err);
      })
      
      ;
      
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFollow = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followedId: id })
      });
      fetchUsers();
    } catch (err) {
      console.error("Follow failed", err);
    }
  };

  const handleUnfollow = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/follow/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      fetchUsers();
    } catch (err) {
      console.error("Unfollow failed", err);
    }
  };

  return (

    <div className="flex min-h-screen bg-gray-200 dark:bg-[#1a1a1a] dark:text-white">
      <aside className="w-[275px]">

        <PersonalSidebar />
      </aside>


      <main className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto">
        <div className="block lg:hidden px-4 py-3 sticky top-0 z-10 dark:bg-[#1a1a1a] bg-lime-600">
          <Input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-lime-600 rounded-full dark:bg-[#1a1a1a] dark:text-white border-lime-500 dark:placeholder:text-lime-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          />
        </div>


        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-[#1a1a1a] border rounded-2xl dark:border-lime-500 z-10">
          <h1 className="text-xl dark:text-lime-500 font-bold">Explore</h1>
          <Link to="/settings">
            <Settings size={20} className="dark:text-lime-500" />
          </Link>
        </div>

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

          <TabsContent value="forYou">
            <section className="p-4 border dark:border-lime-500">
              <h2 className="font-bold  text-lg mb-2">Today’s News</h2>
              {/* example news */}
            </section>
          </TabsContent>

          <TabsContent value="accounts">
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="dark:bg-black dark:text-white border dark:border-lime-500 rounded-2xl">
                  <CardContent className="flex gap-3 items-start p-4">
                    <Avatar className="w-14 h-14 border-4 border-slate-300">
                      <AvatarImage src={user.profilePicture} alt={user.username} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">@{user.username}</p>
                      <p className="text-sm dark:text-neutral-300 mt-1">{user.bio}</p>
                    </div>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className="px-4 py-1 rounded-full bg-lime-500 text-black font-semibold hover:bg-lime-600"
                    >
                      Follow
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="w-full dark:bg-[#1a1a1a] px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside>
        <RightSidebar query={query} setQuery={setQuery} />
      </aside>
    </div>
  );
};

export default Explore;
