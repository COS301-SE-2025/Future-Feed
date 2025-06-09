import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

import GRP1 from "../assets/GRP1.jpg";
import PersonalSidebar from "@/components/personalSidebar"
{/*sheet */ }

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const UserProfile = () => {
  return (
    /*BELOW HERE IS THE WRAPPER / BODY DIV          
    w-[250px] p-6 border-r border-gray-800
    
    
    */
    <div className="flex min-h-screen  bg-gray-800 text-white overflow-y-auto">
      <PersonalSidebar />
      {/* 
      <aside className=" h-fit bg-black text-white w-[200px] p-6 mt-6 ml-4 rounded-2xl border border-gray-800 shadow-md hidden md:block">
        <div className="text-2xl font-bold mb-6">Future Feed</div>
        <nav className="flex flex-col space-y-4 text-lg text-gray-300">
          <a href="#" className="flex items-center gap-3 hover:text-blue-500">
            <Home size={20} /> Home
          </a>
          <a href="#" className="flex items-center gap-3 hover:text-blue-500">
            <User size={20} /> Profile
          </a>
          <a href="#" className="flex items-center gap-3 hover:text-blue-500">
            <Bell size={20} /> Notifications
          </a>
          <a href="#" className="flex items-center gap-3 hover:text-blue-500">
            <Settings size={20} /> Settings
          </a>
          <a href="#" className="flex items-center gap-3 hover:text-blue-500">
            <Search size={20} /> Search
          </a>
          

        </nav>
      </aside>
      Sidebar */}

      {/* Profile Main Section */}
      <main className="flex-1 max-w-2xl mx-auto border-x border-sky-100">
        {/* Banner + Avatar + Name */}
        <div className="relative">
          <div className="h-36 bg-blue-500 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-24 h-24 border-4 border-sky-100">
              <AvatarImage src={GRP1} alt="@syntexsquad" />
              <AvatarFallback>SYNTEXSQUAD,BRUH</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Name, handle, edit button */}
        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">Syntex Squad</h1>
              <p className="text-gray-400">@syntexsquad</p>
              <p className="mt-2 text-sm">yes</p>



            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="text-black bg-slate-300 border-gray-700 hover:bg-gray-800">Edit Profile</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit Profile</SheetTitle>
                  <SheetDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                  <div className="grid gap-3">
                    <Label htmlFor="sheet-name">Name</Label>
                    <Input id="sheet-name" placeholder="Syntex Squad" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="sheet-username">Username</Label>
                    <Input id="sheet-username" placeholder="@syntexsquad" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="sheet-bio">Bio</Label>
                    <Input id="sheet-name" placeholder="Oh Yeaaaaa!" />
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit" variant="outline" className="text-black hover:bg-gray-800">Save changes</Button>
                  <SheetClose asChild>
                    <Button variant="outline" className="text-black bg-blue-500 hover:bg-gray-800">Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/*BELOW IS THE SHEET COMPONENT THAT ACTS AS A POPUP*/}
            {/*<Button variant="outline" className="text-black bg-slate-300 border-gray-700 hover:bg-gray-800">
              Edit Profile
            </Button>*/}
          </div>






          <div className="mt-4 text-sm text-gray-400">
            <span className="font-medium text-white">150</span> Following ·{" "}
            <span className="font-medium text-white">1.2k</span> Followers ·{" "}
            <span className="font-medium text-white">1</span> Bots ·{" "}
            <span className="font-medium text-white">6</span> Posts
          </div>
        </div>

        <Separator className="my-4 bg-sky-100" />

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full bg-black   grid-cols-5 bg-transparent border-b border-sky-100">

            <TabsTrigger className="text-white" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="text-white" value="replies">Replies</TabsTrigger>
            <TabsTrigger className="text-white" value="media">Media</TabsTrigger>
            <TabsTrigger className="text-white" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="text-white" value="highlights">Highlights</TabsTrigger>

          </TabsList>

          <TabsContent value="posts" className="p-0">
            {[
              {
                time: "2h ago",
                text: "Excited to share my latest project with you all!",
              },
              {
                time: "5h ago",
                text: "Loving the new Future Feed design 💻",
              },
              {
                time: "1d ago",
                text: "Shadcn actually so nice, Thank you Mr Arne",
              },
              {
                time: "2d ago",
                text: "Debugging is like being the detective in a crime movie where you're also the murderer 😅",
              },
              {
                time: "3d ago",
                text: "Setting up design is hard",
              },
              {
                time: "4d ago",
                text: "Excited for demo 2 with my team",
                image: GRP1

              },
            ].map((post, index) => (
              <Card key={index} className="bg-gray-800 border-sky-100 border-b rounded-none">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={GRP1} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h2 className="font-bold text-white">Syntex Squad </h2>
                        <span className="text-sm text-gray-400">{post.time}</span>
                      </div>
                      <p className="text-gray-300">@syntexsquad</p>
                      <p className="mt-2 text-white">{post.text}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post"
                          className="mt-4 rounded-lg border border-gray-700"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          {/*expand this area to add replies media etc*/}

          <TabsContent value="replies">
            <div className="p-4 text-gray-400">No replies yet.</div>
          </TabsContent>

          <TabsContent value="media">
            <div className="p-4 text-gray-400">No media yet.</div>
          </TabsContent>

          <TabsContent value="likes">
            <div className="p-4 text-gray-400">No liked posts yet.</div>
          </TabsContent>

          <TabsContent value="highlights">
            <div className="p-4 text-gray-400">No highlights available  yet.</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserProfile;
