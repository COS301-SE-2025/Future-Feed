import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import GRP1 from "../assets/GRP1.jpg";
import WhatsHappening from "@/components/WhatsHappening";
import WhoToFollow from "@/components/WhoToFollow";

const Profile = () => {
  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="w-[1100px] mx-auto mt-3">
        <div className="relative">
          <div className="mt-25 dark:bg-lime-500 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3 border-lime-500 dark:border-lime-500">
              <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
                <AvatarImage src={GRP1} alt={`Username`} />
                <AvatarFallback>Username</AvatarFallback>
              </Link>
            </Avatar>
          </div>
        </div>
        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl font-bold">Display Name</h1>
              <p className="dark:text-gray-400">User Name</p>
              <p className="mt-2 text-sm"> This is my bio</p>
            </div>
              <Button variant="outline" className="mt-[-120px] text-white bg-lime-600 dark:hover:text-black dark:text-black dark:bg-lime-500 dark:border-lime-500 dark:hover:bg-lime-500 hover:cursor-pointer">
                Follow
              </Button>
          </div>
          <div className="mt-4 flex content-between gap-2 text-sm dark:text-gray-400">
              <span className="font-medium dark:text-white">0</span> Following ·
              <span className="font-medium dark:text-white">0</span> Followers ·
              <span className="font-medium dark:text-white">0</span> Bots ·
            <span className="font-medium dark:text-white">0</span> Posts
          </div>
        </div>
        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />
        <Tabs defaultValue="posts" className="w-full"> 
          <TabsList className="grid w-full dark:bg-black grid-cols-5 dark:border-lime-500">
            <TabsTrigger className="dark:text-lime-500" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="re-feeds">Re-Feeds</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="comments">Comments</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="p-0">
            
          </TabsContent>
          <TabsContent value="re-feeds" className="p-0">
            
          </TabsContent>
          <TabsContent value="comments">
            
          </TabsContent>
          <TabsContent value="likes">
            
          </TabsContent>
          <TabsContent value="bookmarks">
            
          </TabsContent>
        </Tabs>
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
  );
}

export default Profile;