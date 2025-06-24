// src/pages/Explore.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { Settings } from "lucide-react"
import PersonalSidebar from "@/components/personalSidebar"
import { Input } from "@/components/ui/input"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import RightSidebar from "@/components/RightSidebar"
import { Link } from "react-router-dom"

const Explore = () => {
  return (
    <div className="flex min-h-screen  bg-gray-200 dark:bg-black dark:text-white">
      {/* PersonalSidebar Left */}
      <aside className="w-[275px]  ">
        <PersonalSidebar />
      </aside>
      

      {/* Main Explore Content */}
      <main className="flex-1 max-w-2xl border bg-gray-200 dark:bg-black dark:border-lime-500 rounded-2xl p-6 min-h-screen">

         {/* Mobile Search Input */}
      <div className="block lg:hidden px-4 py-3 sticky top-0 z-10 dark:bg-black bg-lime-600">
        <Input
          type="text"
          placeholder="Search"
          className="bg-lime-600 rounded-full dark:bg-black dark:text-white border-lime-500 dark:placeholder:text-lime-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
        />
      </div>

       {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-black border rounded-2xl dark:border-lime-500 z-10">
          <h1 className="text-xl dark:text-lime-500 font-bold">Explore</h1>
          <Link to="/settings">
          <Settings size={20} className="dark:text-lime-500" />
          </Link>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="forYou" className="w-full p-2">
          <TabsList className="w-full flex justify-around rounded-2xl border dark:border-lime-500  dark:bg-black">
            {["forYou", "trending", "news", "sports", "entertainment"].map(tab => (
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
          <TabsContent value="trending">
            <p className="p-4 dark:text-gray-400">Trending content coming soon...</p>
          </TabsContent>
          <TabsContent value="news">
            <p className="p-4 dark:text-gray-400">News content coming soon...</p>
          </TabsContent>
          <TabsContent value="sports">
            <p className="p-4 dark:text-gray-400">Sports content coming soon...</p>
          </TabsContent>
          <TabsContent value="entertainment">
            <p className="p-4 dark:text-gray-400">Entertainment content coming soon...</p>
          </TabsContent>
        </Tabs>
           {/* Mobile RHS below main content */}
    <div className="w-full dark:bg-black px-4 mt-7 py-2 space-y-6 block lg:hidden">
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

export default Explore
