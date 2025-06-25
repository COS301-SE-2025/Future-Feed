import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Post from "@/components/ui/post";
import PersonalSidebar from "@/components/personalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaImage, FaTimes } from "react-icons/fa";

interface CommentData{
  id: number;
  postId: number ;
  authorId: number ;
  createdAt: string ;
  username?: string ;
  handle?: string ;
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
  comments?:CommentData[];
  reshareCount: number;
}

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user info");
      const data = await res.json();
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      return null;
    }
  };

  // Fetch all posts for "For You" tab
  const fetchAllPosts = async () => {
    try {
      const [postsRes, likesRes, resharesRes] = await Promise.all([
        fetch(`${API_URL}/api/posts`, { credentials: "include" }),
        fetch(`${API_URL}/api/likes/my-likes`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" })
      ]);

      if (!postsRes.ok) throw new Error("Failed to fetch posts");
      const apiPosts = await postsRes.json();
      const likedPosts = likesRes.ok ? await likesRes.json() : [];
      const resharedPosts = resharesRes.ok ? await resharesRes.json() : [];

      const formattedPosts = await Promise.all(
        apiPosts.map(async (post: any) => {
          const [authorRes, commentsRes, likesCountRes, reshareCountRes] = await Promise.all([
            fetch(`${API_URL}/api/user/${post.authorId}`, { credentials: "include" }),
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/reshares/count/${post.id}`, { credentials: "include" })
          ]);

          const author = authorRes.ok ? await authorRes.json() : { 
            username: "unknown", 
            displayName: "Unknown" 
          };

          const comments = commentsRes.ok ? await commentsRes.json() : [];
          const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
          const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;

          // In fetchAllPosts and fetchFollowingPosts, modify the return object to include comments:
return {
  id: post.id,
  username: author.displayName || "Unknown",
  handle: `@${author.username || "unknown"}`,
  time: new Date(post.createdAt).toLocaleString(),
  text: post.content,
  image: undefined,
  isLiked: likedPosts.some((liked: any) => liked.postId === post.id),
  isBookmarked: false,
  isReshared: resharedPosts.some((reshared: any) => reshared.postId === post.id),
  commentCount: comments.length,
  authorId: post.authorId,
  likeCount,
  reshareCount,
  comments: comments.map((comment: any) => ({
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt
  })),
  showComments: false
};
        })
      );
      setPosts(formattedPosts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
      setLoading(false);
    }
  };
  const toggleComments = (postId: number) => {
  setPosts(prevPosts =>
    prevPosts.map(post =>
      post.id === postId 
        ? { ...post, showComments: !post.showComments } 
        : post
    )
  );
  setFollowingPosts(prevPosts =>
    prevPosts.map(post =>
      post.id === postId 
        ? { ...post, showComments: !post.showComments } 
        : post
    )
  );
};

  // Fetch posts for "Following" tab
  const fetchFollowingPosts = async () => {
    if (!currentUser?.id) return;
    
    try {
      const [followRes, likesRes, resharesRes] = await Promise.all([
        fetch(`${API_URL}/api/follow/following/${currentUser.id}`, { credentials: "include" }),
        fetch(`${API_URL}/api/likes/my-likes`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" })
      ]);

      if (!followRes.ok) throw new Error("Failed to fetch followed users");
      const followedUsers = await followRes.json();
      const followedIds = followedUsers.map((follow: any) => follow.followedId);
      const likedPosts = likesRes.ok ? await likesRes.json() : [];
      const resharedPosts = resharesRes.ok ? await resharesRes.json() : [];

      const allFollowingPosts = await Promise.all(
        followedIds.map(async (userId: number) => {
          const res = await fetch(`${API_URL}/api/posts/user/${userId}`, {
            credentials: "include",
          });
          return res.ok ? await res.json() : [];
        })
      );

      const flattenedPosts = allFollowingPosts.flat();
      const formattedPosts = await Promise.all(
        flattenedPosts.map(async (post: any) => {
          const [authorRes, commentsRes, likesCountRes, reshareCountRes] = await Promise.all([
            fetch(`${API_URL}/api/user/${post.authorId}`, { credentials: "include" }),
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/reshares/count/${post.id}`, { credentials: "include" })
          ]);

          const author = authorRes.ok ? await authorRes.json() : { 
            username: "unknown", 
            displayName: "Unknown" 
          };

          const comments = commentsRes.ok ? await commentsRes.json() : [];
          const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
          const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;

          return {
            id: post.id,
            username: author.displayName || "Unknown",
            handle: `@${author.username || "unknown"}`,
            time: new Date(post.createdAt).toLocaleString(),
            text: post.content,
            image: undefined,
            isLiked: likedPosts.some((liked: any) => liked.postId === post.id),
            isBookmarked: false,
            isReshared: resharedPosts.some((reshared: any) => reshared.postId === post.id),
            commentCount: comments.length,
            authorId: post.authorId,
            likeCount,
            reshareCount
          };
        })
      );
      setFollowingPosts(formattedPosts);
    } catch (err) {
      console.error("Error fetching following posts:", err);
      setError("Failed to load posts from followed users.");
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchAllPosts();
    };
    loadData();
  }, []);

  // Fetch following posts when currentUser changes
  useEffect(() => {
    if (currentUser?.id) fetchFollowingPosts();
  }, [currentUser]);

  // Handle post creation
  const handlePost = async () => {
    if (!postText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: postText }),
      });

      if (!res.ok) throw new Error("Failed to create post");
      const newPost = await res.json();

      const formattedPost: PostData = {
        id: newPost.id,
        username: currentUser.displayName || currentUser.username,
        handle: `@${currentUser.username}`,
        time: new Date(newPost.createdAt).toLocaleString(),
        text: newPost.content,
        image: undefined,
        isLiked: false,
        isBookmarked: false,
        isReshared: false,
        commentCount: 0,
        authorId: newPost.authorId,
        likeCount: 0,
        reshareCount: 0
      };

      setPosts([formattedPost, ...posts]);
      setIsModalOpen(false);
      setPostText("");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post.");
    }
  };

  // Handle like/unlike
  const handleLike = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId) || followingPosts.find(p => p.id === postId);
      if (!post) return;

      const method = post.isLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to ${method === "POST" ? "like" : "unlike"} post`);

      // Update both posts and followingPosts states
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId 
            ? { 
                ...p, 
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1
              } 
            : p
        )
      );
      setFollowingPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId 
            ? { 
                ...p, 
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1
              } 
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      // setError("Failed to update like status.");
    }
  };

  // Handle reshare/unreshare
  const handleReshare = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId) || followingPosts.find(p => p.id === postId);
      if (!post) return;

      const method = post.isReshared ? "DELETE" : "POST";
      const url = post.isReshared 
        ? `${API_URL}/api/reshares/${postId}`
        : `${API_URL}/api/reshares`;

      const res = await fetch(url, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        credentials: "include",
        body: method === "POST" ? JSON.stringify({ postId }) : undefined
      });

      if (!res.ok) throw new Error(`Failed to ${method === "POST" ? "reshare" : "unreshare"} post`);

      // Update both posts and followingPosts states
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId 
            ? { 
                ...p, 
                isReshared: !p.isReshared,
                reshareCount: p.isReshared ? p.reshareCount - 1 : p.reshareCount + 1
              } 
            : p
        )
      );
      setFollowingPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId 
            ? { 
                ...p, 
                isReshared: !p.isReshared,
                reshareCount: p.isReshared ? p.reshareCount - 1 : p.reshareCount + 1
              } 
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling reshare:", err);
      setError("Failed to update reshare status.");
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId: number, commentText: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        credentials: "include",
        body: commentText,
      });

      if (!res.ok) throw new Error("Failed to add comment");

      // Update both posts and followingPosts states
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId 
            ? { ...post, commentCount: post.commentCount + 1 } 
            : post
        )
      );
      setFollowingPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId 
            ? { ...post, commentCount: post.commentCount + 1 } 
            : post
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment.");
    }
  };

  // Handle bookmark (client-side only)
  const handleBookmark = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked } 
          : post
      )
    );
    setFollowingPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked } 
          : post
      )
    );
  };

  // Render posts
  const renderPosts = (posts: PostData[]) => {
  return posts.map((post) => (
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
        onLike={() => handleLike(post.id)}
        onReshare={() => handleReshare(post.id)}
        onBookmark={() => handleBookmark(post.id)}
        onAddComment={(commentText) => handleAddComment(post.id, commentText)}
        onToggleComments={() => toggleComments(post.id)}
        showComments={post.showComments || false}
        comments={post.comments || []}
      />
    </div>
  ));
};

  return (
    <div className="flex min-h-screen dark:bg-[#1a1a1a] text-white max-w-screen-2xl mx-auto bg-white">
      <aside className="w-[245px] ml-6 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <div className={`flex flex-1 max-w-[calc(100%-295px)] ${isModalOpen ? "backdrop-blur-sm" : ""}`}>
        <main className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg dark:text-white">Loading posts...</p>
            </div>
          ) : (
            <>
              {/* Post creation button */}
              <div
                className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-[#1a1a1a] border border-lime-500 rounded-2xl z-10 bg-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                <h1 className="text-xl dark:text-lime-500 font-bold text-lime-600">What's on your mind?</h1>
              </div>

              {/* Tabs */}
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
                  {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <p className="text-lg dark:text-white">No posts available.</p>
                      <Button 
                        className="mt-4 bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Create your first post
                      </Button>
                    </div>
                  ) : (
                    renderPosts(posts)
                  )}
                </TabsContent>
                
                <TabsContent value="Following">
                  {followingPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <p className="text-lg dark:text-white">No posts from followed users.</p>
                      <Button 
                        className="mt-4 bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={() => fetchFollowingPosts()}
                      >
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    renderPosts(followingPosts)
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
        <aside className="w-[350px] mt-6 sticky top-0 h-screen overflow-y-auto hidden lg:block">
          <div className="w-[320px] mt-6 ml-3">
            <WhatsHappening />
          </div>
          <div className="w-[320px] mt-5 ml-3">
            <WhoToFollow currentUserId={currentUser?.id} />
          </div>
        </aside>
      </div>

      {/* Post creation modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white dark:bg-black rounded-2xl p-6 w-full max-w-2xl min-h-[300px] border-2 border-lime-500 flex flex-col relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setPostText("");
              }}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
              title="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-lime-700 dark:text-white">Share your thoughts</h2>
            <div className="flex flex-col flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full mb-4 text-gray-900 dark:bg-black dark:text-white dark:border-lime-500 flex-1 resize-none"
                rows={8}
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  className="dark:text-white text-black dark:border-lime-500 flex items-center space-x-1 border-2 border-lime-500"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <FaImage className="w-4 h-4" />
                  <span>Attach Image</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={() => alert("Image upload is not supported by the backend.")}
                />
                <Button
                  onClick={handlePost}
                  className="bg-lime-500 text-white hover:bg-lime-600"
                  disabled={!postText.trim()}
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