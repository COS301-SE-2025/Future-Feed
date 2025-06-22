import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Post from "@/components/ui/post";
import PersonalSidebar from "@/components/personalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaImage } from "react-icons/fa";

interface PostData {
  id: number;
  username: string;
  handle: string;
  time: string;
  text: string;
  image?: string;
}

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [nextPostId, setNextPostId] = useState(5);
  const [posts, setPosts] = useState<PostData[]>([
    {
      id: 1,
      username: "Syntex Squad",
      handle: "@syntexsquad",
      time: "2h ago",
      text: "Excited to share my latest project with you all!",
    },
    {
      id: 2,
      username: "Code Master",
      handle: "@codemaster",
      time: "5h ago",
      text: "Loving the new Future Feed design 💻",
    },
    {
      id: 3,
      username: "Tech Enthusiast",
      handle: "@techlover",
      time: "1d ago",
      text: "Shadcn actually so nice, Thank you Mr Arne",
    },
    {
      id: 4,
      username: "Debug Detective",
      handle: "@debugdetective",
      time: "2d ago",
      text: "Debugging is like being the detective in a crime movie where you're also the murderer 😅",
    },
  ]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPostText("");
    setPostImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPostImage(file);
    }
  };

  const handlePost = () => {
    if (postText.trim() || postImage) {
      const newPost: PostData = {
        id: nextPostId,
        username: "CurrentUser",
        handle: "@currentuser",
        time: "Just now",
        text: postText,
        image: postImage ? URL.createObjectURL(postImage) : undefined,
      };
      setPosts([newPost, ...posts]);
      setNextPostId(nextPostId + 1);
      handleCloseModal();
    }
  };

  return (
    <div className="flex min-h-screen dark:bg-[#1a1a1a] text-white max-w-screen-2xl mx-auto bg-white">
      <aside className="w-[245px] ml-6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <div className={`flex flex-1 max-w-[calc(100%-295px)] ${isModalOpen ? "backdrop-blur-sm" : ""}`}>
        <main className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto">
          <div
            className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-[#1a1a1a] border border-lime-500 rounded-2xl z-10 bg-white cursor-pointer"
            onClick={handleOpenModal}
          >
            <h1 className="text-xl dark:text-lime-500 font-bold text-lime-600">What's on your mind?</h1>
          </div>
          <Tabs defaultValue="for You" className="w-full p-2">
            <TabsList className="w-full flex justify-around rounded-2xl border border-lime-500 dark:bg-black sticky top-[68px] z-10">
              {["for You", "Following"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="flex-1 rounded-2xl dark:text-white text-green capitalize dark:data-[state=active]:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-500"
                >
                  {tab.replace(/^\w/, (c) => c.toUpperCase())}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="for You" className="p-0">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  username={post.username}
                  handle={post.handle}
                  time={post.time}
                  text={post.text}
                  image={post.image}
                />
              ))}
            </TabsContent>
            <TabsContent value="Following">
              <p className="p-4 dark:text-white">A list of people you are following is expected here</p>
            </TabsContent>
          </Tabs>
          <div className="w-full dark:bg-black px-4 mt-7 py-2 space-y-6 block lg:hidden">
            <WhatsHappening />
            <WhoToFollow />
          </div>
        </main>
        <aside className="w-[350px] mt-6 sticky top-0 h-screen overflow-y-auto hidden lg:block">
          <div className="w-[320px] mt-6 ml-3">
            <WhatsHappening />
          </div>
          <div className="w-[320px] mt-5 ml-3">
            <WhoToFollow />
          </div>
        </aside>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white dark:bg-black rounded-2xl p-6 w-[800px] min-h-[300px] border-2 border-lime-500 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-lime-700 dark:text-white">Share your thoughts</h2>
            <div className="flex flex-col flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full mb-4 text-gray-900 dark:bg-black dark:text-white dark:border-lime-500 flex-1 resize-none"
                rows={8}
              />
              {postImage && (
                <div className="mb-4">
                  <img
                    src={URL.createObjectURL(postImage)}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg border dark:border-lime-500"
                  />
                  <Button
                    variant="ghost"
                    className="text-red-500 mt-2 dark:text-red-400"
                    onClick={() => setPostImage(null)}
                  >
                    Remove Image
                  </Button>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="dark:text-white text-red-700 border-red-700 dark:border-lime-500"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="dark:text-white text-black dark:border-lime-500 flex items-center space-x-1 border-2 border-lime-500"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <FaImage className="w-4 h-4" />
                  <span> Attach Image</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  onClick={handlePost}
                  className="bg-lime-500 text-white hover:bg-lime-600"
                  disabled={!postText.trim() && !postImage}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;