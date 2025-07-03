// src/pages/FollowerFollowing.tsx
import PersonalSidebar from "@/components/PersonalSidebar"
import RightSidebar from "@/components/RightSidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

import GRP2 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import { Input } from "@/components/ui/input"

const FollowerFollowing = () => {
  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white">
      {/* Left Sidebar */}
      <PersonalSidebar />

      {/* Center Notification Feed */}
      <main className="h-fit p-6 dark:bg-black flex-1 mx-7 my-7 rounded-2xl border dark:border-lime-600 min-h-screen">
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
              <AvatarImage  src={GRP2} alt="@syntexsquad" />
              <AvatarFallback>SYNTEXSQUAD,BRUH</AvatarFallback>
            </Avatar>
          <h1 className="text-xl dark:text-slate-300 font-bold">Syntex Squad</h1>
          <span className="dark:text-slate-300 font-bold">@syntexsquad</span>
         
        </div>

        {/* Tabs */}
        <Tabs defaultValue="followers" className="w-full p-3 ">
          <TabsList className="w-full  flex justify-around dark:bg-black border dark:border-lime-600 rounded-2xl">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-600 dark:data-[state=active]:text-black"
            >
              Followers
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-600 dark:data-[state=active]:text-black"
            >
              Following
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
            <Card className="dark:bg-black dark:text-white border dark:border-lime-600 rounded-2xl">
              <CardContent className="flex gap-3 items-start p-4">
                 <Avatar className="w-14 h-14 border-4 border-slate-300">
              <AvatarImage src={GRP2} alt="@syntexsquad" />
              <AvatarFallback>SYNTEXSQUAD,BRUH</AvatarFallback>
            </Avatar>
                <div>
                  <p>
                    You currently have no followers
                  </p>
                  <p className="dark:text-blue-500 cursor-pointer hover:underline">Show more.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* You can add verified/mentions TabsContent similarly */}
          <TabsContent value="following">
            <p className="p-4 dark:text-gray-400">Currently following no one.</p>
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
