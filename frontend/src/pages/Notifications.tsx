// src/pages/Notifications.tsx
import PersonalSidebar from "@/components/personalSidebar"
import RightSidebar from "@/components/RightSidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import GRP2 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Notifications = () => {
  return (
    <div className="flex min-h-screen bg-gray-800 text-white">
      {/* Left Sidebar */}
      <PersonalSidebar />

      {/* Center Notification Feed */}
      <main className="h-fit p-6 bg-gray-800 flex-1 max-w-4xl mx-7 rounded-2xl border border-slate-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-slate-300 border rounded-2xl border-slate-100 z-10">
          <h1 className="text-xl text-gray-800 font-bold">Notifications</h1>
          <Settings size={20} className="text-gray-800" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full p-3 ">
          <TabsList className="w-full  flex justify-around bg-gray-800 border border-slate-100 rounded-2xl">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-2xl text-white data-[state=active]:border-b-2 data-[state=active]:border-slate-100 data-[state=active]:text-gray-800"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="verified"
              className="flex-1 rounded-2xl text-white data-[state=active]:border-b-2 data-[state=active]:border-slate-100 data-[state=active]:text-gray-800"
            >
              Verified
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="flex-1 rounded-2xl text-white data-[state=active]:border-b-2 data-[state=active]:border-slate-100 data-[state=active]:text-gray-800"
            >
              Mentions
            </TabsTrigger>
          </TabsList>

          {/* Example Notification */}
          <TabsContent value="all">
            <Card className="bg-gray-800 text-white border border-slate-100 rounded-2xl">
              <CardContent className="flex gap-3 items-start p-4">
                 <Avatar className="w-14 h-14 border-4 border-slate-300">
              <AvatarImage src={GRP2} alt="@syntexsquad" />
              <AvatarFallback>SYNTEXSQUAD,BRUH</AvatarFallback>
            </Avatar>
                <div>
                  <p>
                    There was a login to your account <span className="text-blue-400">@syntexsquad</span> from a new device on June 22, 2025.
                  </p>
                  <p className="text-blue-500 cursor-pointer hover:underline">Review it now.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* You can add verified/mentions TabsContent similarly */}
          <TabsContent value="verified">
            <p className="p-4 text-gray-400">No verified activity yet.</p>
          </TabsContent>
          <TabsContent value="mentions">
            <p className="p-4 text-gray-400">No mentions found.</p>
          </TabsContent>
        </Tabs>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}

export default Notifications;
