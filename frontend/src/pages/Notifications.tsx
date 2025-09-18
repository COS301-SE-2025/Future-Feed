// src/pages/Notifications.tsx
import PersonalSidebar from "@/components/PersonalSidebar"
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
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 bg-gray-200 dark:text-white mx-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      {/* Center Notification Feed */}
      <main className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto mt-11">
        {/*search for mbiles*/}
        <div className="block lg:hidden px-4 py-3 sticky top-0 z-10  bg-black dark:bg-blue-950  dark:border-slate-200">
          <Input
            type="text"
            placeholder="Search"
            className="rounded-full bg-black dark:bg-blue-950 dark:text-white dark:placeholder:text-lime-500 border-lime-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-blue-950 border rounded-2xl dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-lime-500 font-bold">Notifications</h1>
          <Settings size={20} className="dark:text-lime-500" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full p-3 ">
          <TabsList className="w-full  flex justify-around dark:bg-blue-950 border dark:border-slate-200 rounded-2xl">
            <TabsTrigger
              value="all"

            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="verified"

            >
              Verified
            </TabsTrigger>
            <TabsTrigger
              value="mentions"

            >
              Mentions
            </TabsTrigger>
          </TabsList>

          {/* Example Notification */}
          <TabsContent value="all">
            <Card className="dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl">
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
        <div className="w-full dark:bg-blue-950 px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:mt-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block">
          <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
            <WhatsHappening />
          </div>
          <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
            <WhoToFollow />
          </div>
        </aside>
    </div>
  )
}

export default Notifications;
