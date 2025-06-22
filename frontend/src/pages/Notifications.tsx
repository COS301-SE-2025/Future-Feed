// src/pages/Notifications.tsx
import PersonalSidebar from "@/components/personalSidebar"
import RightSidebar from "@/components/RightSidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import GRP2 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import { Input } from "@/components/ui/input"

const Notifications = () => {
  return (
    <div className="flex min-h-screen dark:bg-gray-800 dark:text-white">
      {/* Left Sidebar */}
      <PersonalSidebar />

      {/* Center Notification Feed */}
      <main className="h-fit p-6 dark:bg-gray-800 flex-1 max-w-4xl mx-7 rounded-2xl dark:shadow-lg dark:shadow-gray-800 min-h-screen">
        <div className="block lg:hidden px-4 py-3 sticky top-0 z-10  bg-black dark:bg-gray-800 border dark:border-gray-800">
        <Input
          type="text"
          placeholder="Search"
          className="rounded-full bg-black dark:bg-gray-800 dark:text-white dark:placeholder:text-slate-100 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
        />
      </div>

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-slate-300 border rounded-2xl dark:border-slate-100 z-10">
          <h1 className="text-xl dark:text-gray-800 font-bold">Notifications</h1>
          <Settings size={20} className="dark:text-gray-800" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full p-3 ">
          <TabsList className="w-full  flex justify-around dark:bg-gray-800 border dark:border-slate-100 rounded-2xl">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-slate-100 dark:data-[state=active]:text-gray-800"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-slate-100 dark:data-[state=active]:text-gray-800"
            >
              Verified
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="flex-1 rounded-2xl dark:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-slate-100 dark:data-[state=active]:text-gray-800"
            >
              Mentions
            </TabsTrigger>
          </TabsList>

          {/* Example Notification */}
          <TabsContent value="all">
            <Card className="dark:bg-gray-800 border-none dark:text-white dark:shadow-lg dark:shadow-gray-800 rounded-2xl">
              <CardContent className="flex gap-3 items-start p-4">
                 <Avatar className="w-14 h-14 border-4 border-slate-300">
              <AvatarImage src={GRP2} alt="@syntexsquad" />
              <AvatarFallback>SYNTEXSQUAD,BRUH</AvatarFallback>
            </Avatar>
                <div>
                  <p>
                    There was a login to your account <span className="text-blue-400">@syntexsquad</span> from a new device on June 22, 2025.
                  </p>
                  <p className="dark:text-blue-500 cursor-pointer hover:underline">Review it now.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* You can add verified/mentions TabsContent similarly */}
          <TabsContent value="verified">
            <p className="p-4 dark:text-gray-400">No verified activity yet.</p>
          </TabsContent>
          <TabsContent value="mentions">
            <p className="p-4 dark:text-gray-400">No mentions found.</p>
          </TabsContent>

        
        {/**for mobile devices */}
        </Tabs>
         <div className="w-full dark:bg-gray-800 px-4 mt-7 py-2 space-y-6 block lg:hidden">
      <WhatsHappening />
      <WhoToFollow />
    </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}

export default Notifications;
