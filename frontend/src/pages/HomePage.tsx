// src/pages/Explore.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Post from "@/components/ui/post"
import PersonalSidebar from "@/components/personalSidebar"
import { Input } from "@/components/ui/input"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import RightSidebar from "@/components/RightSidebar"

const HomePage = () => {
  return (
    <div className="flex min-h-screen  bg-yellow dark:bg-gray-800 dark:text-white">
      {/* PersonalSidebar Left */}
      <aside className="w-[275px]  ">
        <PersonalSidebar />
      </aside>
      

      {/* Main Explore Content */}
      <main className="flex-1 p-6 min-h-screen">

       {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-slate-300 border rounded-2xl dark:border-slate-100 z-10">
          <h1 className="text-xl dark:text-gray-800 font-bold">What's on your mind ?</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="forYou" className="w-full p-2">
          <TabsList className="w-full flex justify-around rounded-2xl border dark:border-slate-300  dark:bg-gray-800">
            {["forYou","Following"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 rounded-2xl dark:text-white text-green capitalize dark:data-[state=active]:text-gray-800 dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-gray-800"
              >
                {tab.replace(/^\w/, c => c.toUpperCase())}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="forYou" className="p-0">
            {[
              {
                username: "Syntex Squad",
                handle: "@syntexsquad",
                time: "2h ago",
                text: "Excited to share my latest project with you all!",
                image: "https://via.placeholder.com/300",
              },
              {
                username: "Code Master",
                handle: "@codemaster",
                time: "5h ago",
                text: "Loving the new Future Feed design 💻",
              },
              {
                username: "Tech Enthusiast",
                handle: "@techlover",
                time: "1d ago",
                text: "Shadcn actually so nice, Thank you Mr Arne",
              },
              {
                username: "Debug Detective",
                handle: "@debugdetective",
                time: "2d ago",
                text: "Debugging is like being the detective in a crime movie where you're also the murderer 😅",
              },
            ].map((post, index) => (
              <Post
                key={index}
                username={post.username}
                handle={post.handle}
                time={post.time}
                text={post.text}
                image={post.image}
              />
            ))}
          </TabsContent>

          {/* Placeholder for other tabs */}
          <TabsContent value="Following">
            <p className="p-4 dark:text-gray-400">A list of people you are following is expected here </p>
          </TabsContent>
        </Tabs>
           {/* Mobile RHS below main content */}
    <div className="w-full dark:bg-gray-800 px-4 mt-7 py-2 space-y-6 block lg:hidden">
      <WhatsHappening />
      <WhoToFollow />
    </div>
      </main>
    

      {/* Right PersonalSidebar */}
      <aside className="mt-6 px-5">
        <WhatsHappening />
        <WhoToFollow />
      </aside>
      
       {/* Mobile RHS below main content */}
   

    </div>
  )
}

export default HomePage
