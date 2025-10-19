import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import Post from "@/components/ui/post";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
  email: string;
}

interface CommentData {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  username: string;
  handle: string;
  profilePicture?: string;
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
  profilePicture?: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Mock posts data
const mockPosts: PostData[] = [
  {
    id: 1,
    username: "UserOne",
    handle: "@userone",
    time: "2h ago",
    text: "Soccer is an amazing sport",
    image: undefined,
    isLiked: false,
    isBookmarked: false,
    isReshared: false,
    commentCount: 5,
    authorId: 101,
    likeCount: 10,
    reshareCount: 3,
    comments: [
      {
        id: 1,
        postId: 1,
        authorId: 102,
        content: "Great post! I agree with your thoughts.",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        username: "UserTwo",
        handle: "@usertwo",
        profilePicture: "https://via.placeholder.com/50",
      },
    ],
    showComments: false,
    topics: [{ id: 1, name: "Sports" }],
    profilePicture: undefined,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 2,
    username: "UserTwo",
    handle: "@usertwo",
    time: "1h ago",
    text: "I think I found my new favorite sport! #Sports",
    image: undefined,
    isLiked: false,
    isBookmarked: true,
    isReshared: false,
    commentCount: 2,
    authorId: 102,
    likeCount: 8,
    reshareCount: 1,
    comments: [],
    showComments: false,
    topics: [{ id: 1, name: "Sports" }],
    profilePicture: undefined,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    username: "UserThree",
    handle: "@userthree",
    time: "30m ago",
    text: "Well, City won again! #Sports",
    image: undefined,
    isLiked: true,
    isBookmarked: false,
    isReshared: true,
    commentCount: 3,
    authorId: 103,
    likeCount: 15,
    reshareCount: 5,
    comments: [],
    showComments: false,
    topics: [{ id: 1, name: "Sports" }],
    profilePicture: undefined,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const TopicPage = () => {
  const { topicName } = useParams<{ topicName: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName");
      }
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      return null;
    }
  };

  // Mock fetch posts for the topic
  const fetchTopicPosts = () => {
    if (!topicName) {
      setError("Topic name is missing.");
      setLoading(false);
      return;
    }
    try {
      const filteredPosts = mockPosts
        .filter(post =>
          post.topics.some(topic => topic.name.toLowerCase() === topicName.toLowerCase())
        )
        .map(post => ({
          ...post,
          showComments: false,
          comments: post.comments || [],
        }));
      setPosts(filteredPosts);
      if (filteredPosts.length === 0) {
        setError(`No posts found for topic "${topicName}".`);
      }
    } catch (err) {
      console.error("Error processing mock posts:", err);
      setError(`Failed to load posts for topic "${topicName}".`);
    } finally {
      setLoading(false);
    }
  };

  // Handle post interactions
  const handleLike = (postId: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const handleReshare = (postId: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isReshared: !post.isReshared,
              reshareCount: post.isReshared ? post.reshareCount - 1 : post.reshareCount + 1,
            }
          : post
      )
    );
  };

  const handleAddComment = (postId: number, commentText: string) => {
    if (!currentUser) {
      setError("Please log in to comment.");
      return;
    }
    const tempId = Date.now();
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: tempId,
                  postId,
                  authorId: currentUser.id,
                  content: commentText,
                  createdAt: new Date().toISOString(),
                  username: currentUser.username,
                  handle: `@${currentUser.username.toLowerCase().replace(/\s+/g, "")}`,
                  profilePicture: currentUser.profilePicture,
                },
              ],
              commentCount: post.commentCount + 1,
            }
          : post
      )
    );
  };

  const handleDelete = (postId: number) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleToggleComments = (postId: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const handleNavigate = (postId: number) => {
    navigate(`/post/${postId}`);
  };

  const handleProfileClick = (authorId: number) => {
    navigate(`/profile/${authorId}`);
  };

  const handleBack = () => {
    if (!currentUser || window.history.length <= 2) {
      navigate("/home");
    } else {
      navigate(-1);
    }
  };

  // Load data and handle navigation
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const user = await fetchCurrentUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      fetchTopicPosts();
    };
    loadData();
  }, [topicName, navigate]);

  // Handle user authentication check
  useEffect(() => {
    if (!loading && !currentUser) {
      setError("User not authenticated.");
      navigate("/login", { replace: true });
    }
  }, [currentUser, loading, navigate]);



  // Loading state with skeleton
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen text-white mx-auto bg-white">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <PersonalSidebar />
        </aside>
        <main className="flex-1 p-4 lg:pt-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto mt-[21px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-rose-gold-accent-border rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full mt-2" />
                  <div className="h-4 bg-gray-300 rounded w-5/6 mt-2" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <aside className="w-full lg:w-[350px] lg:sticky lg:mt-[10px] lg:top-[16px] lg:h-screen hidden lg:block mr-6.5">
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
            <WhatsHappening />
          </div>
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7 lg:sticky">
            <WhoToFollow />
          </div>
        </aside>
      </div>
    );
  }

  // Error or no topic
  if (error || !topicName) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen text-white mx-auto bg-white">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <PersonalSidebar />
        </aside>
        <main className="flex-1 p-4 lg:pt-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto mt-[5px]">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error || "Topic not found."}</p>
          </div>
        </main>
        <aside className="w-full lg:w-[350px] flex-shrink-0 hidden lg:block mr-6.5">
          <div className="sticky top-4 space-y-5">
            <div className="w-full lg:w-[320px] lg:ml-7">
              <WhatsHappening />
            </div>
            <div className="w-full lg:w-[320px] lg:ml-7">
              <WhoToFollow />
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen text-white mx-auto bg-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="flex-1 p-4 lg:pt-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto mt-[5px]">
        {/* Topic Header */}
        <div className="mb-6">
            <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="text-gray-500 hover:text-blue-500 p-1 sm:p-2 mb-2 sm:mb-3 hover:cursor-pointer"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 future-feed:text-lime" />
                      <span className="sr-only sm:not-sr-only sm:inline text-sm ml-1 future-feed:text-white">
                        Back
                      </span>
                    </Button>
          <h1 className="text-3xl font-bold text-black">
            #{topicName}
          </h1>
          <p className="text-gray-600 mt-1">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"} on this topic
          </p>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Post
                key={post.id}
                profilePicture={post.profilePicture}
                username={post.username}
                handle={post.handle}
                time={post.time}
                text={post.text}
                image={post.image}
                isLiked={post.isLiked}
                likeCount={post.likeCount}
                isBookmarked={post.isBookmarked}
                commentCount={post.commentCount}
                isReshared={post.isReshared}
                reshareCount={post.reshareCount}
                onLike={() => handleLike(post.id)}
                onBookmark={() => handleBookmark(post.id)}
                onAddComment={(commentText) => handleAddComment(post.id, commentText)}
                onReshare={() => handleReshare(post.id)}
                onDelete={() => handleDelete(post.id)}
                onNavigate={() => handleNavigate(post.id)}
                onProfileClick={() => handleProfileClick(post.authorId)}
                onToggleComments={() => handleToggleComments(post.id)}
                showComments={post.showComments}
                comments={post.comments}
                isUserLoaded={!!currentUser}
                currentUser={currentUser}
                authorId={post.authorId}
                topics={post.topics}
                isImageLoading={false} // No image loading for mock data
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No posts found for this topic.</p>
        )}
      </main>
      <aside className="w-full lg:w-[350px] flex-shrink-0 hidden lg:block mr-6.5">
        <div className="sticky top-4 space-y-5">
          <div className="w-full lg:w-[320px] lg:ml-7">
            <WhatsHappening />
          </div>
          <div className="w-full lg:w-[320px] lg:ml-7">
            <WhoToFollow />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TopicPage;