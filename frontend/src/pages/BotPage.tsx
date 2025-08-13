import { useEffect, useState } from "react";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import Post from "@/components/ui/post";
import { formatRelativeTime } from "@/lib/timeUtils";
import { FaRobot } from "react-icons/fa"; // Specific robot icon from react-icons
import { Skeleton } from "@/components/ui/skeleton";

interface CommentData {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  username: string;
  handle: string;
}

interface Topic {
  id: number;
  name: string;
}

interface PostData {
  id: number;
  username: string;
  handle: string;
  time: string;
  text: string;
  image?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  isReshared: boolean;
  commentCount: number;
  authorId: number;
  likeCount: number;
  reshareCount: number;
  comments: CommentData[];
  showComments: boolean;
  topics: Topic[];
}

interface BotProfile {
  id: number;
  username: string;
  displayName: string;
  bio?: string;
  email: string;
}

const mockBotData: BotProfile = {
  id: 1,
  username: "mybot",
  displayName: "My Bot",
  bio: "This is a mock bot created for demonstration purposes.",
  email: "no email for bot",
};

const mockPosts: PostData[] = [
  {
    id: 1,
    username: "My Bot",
    handle: "@mybot",
    time: formatRelativeTime(new Date().toISOString()),
    text: "Hello, I'm your friendly bot sharing some cool info!",
    image: undefined,
    isLiked: false,
    isBookmarked: false,
    isReshared: false,
    commentCount: 2,
    authorId: 1,
    likeCount: 10,
    reshareCount: 5,
    comments: [
      {
        id: 1,
        postId: 1,
        authorId: 2,
        content: "Great post, bot!",
        createdAt: new Date().toISOString(),
        username: "User1",
        handle: "@user1",
      },
      {
        id: 2,
        postId: 1,
        authorId: 3,
        content: "Keep it up!",
        createdAt: new Date().toISOString(),
        username: "User2",
        handle: "@user2",
      },
    ],
    showComments: false,
    topics: [
      { id: 1, name: "Bot" },
      { id: 2, name: "AI" },
    ],
  },
  {
    id: 2,
    username: "My Bot",
    handle: "@mybot",
    time: formatRelativeTime(new Date(Date.now() - 86400000).toISOString()),
    text: "Another post from your favorite bot!",
    image: undefined,
    isLiked: false,
    isBookmarked: false,
    isReshared: false,
    commentCount: 0,
    authorId: 1,
    likeCount: 3,
    reshareCount: 1,
    comments: [],
    showComments: false,
    topics: [{ id: 1, name: "Bot" }],
  },
];

const BotPage = () => {
  const [bot, setBot] = useState<BotProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderSkeletonPosts = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="mb-4 border border-lime-300 dark:border-lime-700 rounded-lg p-4 animate-pulse space-y-4"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
      </div>
    ));
  };

  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBot(mockBotData);
        setPosts(mockPosts);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load bot data");
      } finally {
        setLoading(false);
      }
    };
    loadMockData();
  }, []);

  const toggleComments = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <PersonalSidebar />
        </aside>
        <main className="flex-1 p-4 lg:p-6">
          <div className="relative">
            <Skeleton className="mt-25 h-40 w-full" />
            <div className="absolute -bottom-10 left-4">
              <Skeleton className="w-27 h-27 rounded-full" />
            </div>
          </div>
          <div className="pt-16 px-4">
            <div className="flex justify-between items-start">
              <div className="ml-30 mt-[-120px]">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-10 w-32 mt-[-220px]" />
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="my-4 h-1 w-full" />
          <div className="flex flex-col gap-6 py-4">{renderSkeletonPosts()}</div>
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

  if (!bot) return <div className="p-4 text-black">Bot not found.</div>;

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="flex-1 p-4 lg:p-6">
        <div className="relative">
          <div className="-mt-15 h-40 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3 border-lime-500 dark:border-lime-500">
              <Link to="/edit-bot" className="flex items-center justify-center gap-3 dark:hover:text-white h-full w-full">
                <FaRobot className="w-20 h-20 text-gray-600 dark:text-gray-300" />
                {/* <AvatarFallback>{bot.username.slice(0, 2).toUpperCase()}</AvatarFallback> */}
              </Link>
            </Avatar>
          </div>
        </div>
        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl font-bold">{bot.displayName || bot.username}</h1>
              <p className="dark:text-gray-400">@{bot.username}</p>
              <p className="mt-2 text-sm">{bot.bio || "This is my bot's bio"}</p>
            </div>
            <Link to="/edit-bot" className="flex items-center gap-3 dark:hover:text-white">
              <Button
                variant="outline"
                className="mt-[-220px] text-white bg-lime-600 dark:hover:text-black dark:text-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 dark:hover:bg-lime-500 hover:cursor-pointer"
              >
                Edit Bot
              </Button>
            </Link>
          </div>
          <div className="mt-4 flex content-between gap-2 text-sm dark:text-gray-400">
            <Link to="/followers?tab=followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Followers ·
            </Link>
            <span className="font-medium dark:text-white">{posts.length}</span> Posts
          </div>
        </div>
        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        {posts.length === 0 ? (
          <div className="p-4 text-gray-400">No posts yet.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="mb-4">
              <Post
                username={post.username}
                handle={post.handle}
                time={post.time}
                text={post.text}
                image={post.image}
                isLiked={post.isLiked}
                likeCount={post.likeCount}
                isBookmarked={post.isBookmarked}
                isReshared={post.isReshared}
                reshareCount={post.reshareCount}
                commentCount={post.commentCount}
                onToggleComments={() => toggleComments(post.id)}
                showComments={post.showComments}
                comments={post.comments}
                isUserLoaded={!!bot}
                onLike={() => {}}
                onBookmark={() => {}}
                onReshare={() => {}}
                onAddComment={() => {}}
                onDelete={() => {}}
                onNavigate={() => {}}
                currentUser={bot}
                authorId={post.authorId}
                topics={post.topics || []}
              />
            </div>
          ))
        )}
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
};

export default BotPage;