import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Post from "@/components/ui/post";
import PersonalSidebar from "@/components/personalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaImage, FaTimes } from "react-icons/fa";
import { formatRelativeTime } from "@/lib/timeUtils";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
}

interface CommentData {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  username: string;
  handle: string;
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
}

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("for You");
  const userCache = new Map<number, { username: string; displayName: string }>();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchUser = async (userId: number, postUser?: any) => {
    if (userCache.has(userId)) {
      return userCache.get(userId)!;
    }
    if (postUser && postUser.id === userId) {
      const validUser = {
        username: postUser.username && typeof postUser.username === "string" ? postUser.username : `user${userId}`,
        displayName: postUser.displayName && typeof postUser.displayName === "string" ? postUser.displayName : `User ${userId}`,
      };
      userCache.set(userId, validUser);
      return validUser;
    }
    if (currentUser && userId === currentUser.id) {
      const user = { username: currentUser.username, displayName: currentUser.displayName };
      userCache.set(userId, user);
      return user;
    }
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) {
        console.warn(`Failed to fetch user ${userId}: HTTP ${res.status}`);
        throw new Error("Failed to fetch user");
      }
      const user = await res.json();
      if (user.id !== userId) {
        console.warn(`User ID mismatch: requested ${userId}, got ${user.id}`);
        throw new Error("User ID mismatch");
      }
      const validUser = {
        username: user.username && typeof user.username === "string" ? user.username : `user${userId}`,
        displayName: user.displayName && typeof user.displayName === "string" ? user.displayName : `User ${userId}`,
      };
      userCache.set(userId, validUser);
      return validUser;
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      const fallback = { username: `user${userId}`, displayName: `User ${userId}` };
      userCache.set(userId, fallback);
      return fallback;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      if (!data.username || !data.displayName) {
        console.warn("Invalid current user data:", data);
        throw new Error("User info missing username or displayName");
      }
      setCurrentUser(data);
      userCache.set(data.id, { username: data.username, displayName: data.displayName });
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const [postsRes, myResharesRes] = await Promise.all([
        fetch(`${API_URL}/api/posts`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" }),
      ]);
      if (!postsRes.ok) throw new Error(`Failed to fetch posts: ${postsRes.status}`);
      const apiPosts = await postsRes.json();
      const myReshares = myResharesRes.ok ? await myResharesRes.json() : [];

      const validPosts = apiPosts.filter((post: any) => {
        if (!post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post);
          return false;
        }
        return true;
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

      const formattedPosts = await Promise.all(
        validPosts.map(async (post: any) => {
          const [commentsRes, likesCountRes, myLikesRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/${post.id}`, { credentials: "include" }),
          ]);

          const comments = commentsRes.ok ? await commentsRes.json() : [];
          const validComments = comments.filter((comment: any) => {
            if (!comment.authorId) {
              console.warn("Skipping comment with undefined authorId:", comment);
              return false;
            }
            return true;
          });

          const commentsWithUsers = await Promise.all(
            validComments.map(async (comment: any) => {
              const user = await fetchUser(comment.authorId);
              return {
                ...comment,
                authorId: comment.authorId,
                username: user.displayName,
                handle: `@${user.username}`,
              };
            })
          );

          const postUser = await fetchUser(post.user.id, post.user);
          const isReshared = myReshares.some((reshare: any) => reshare.postId === post.id);
          const reshareCount = myReshares.filter((reshare: any) => reshare.postId === post.id).length;

          return {
            id: post.id,
            username: postUser.displayName,
            handle: `@${postUser.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            image: post.imageUrl,
            isLiked: myLikesRes.ok && myLikesRes.status === 200,
            isBookmarked: false,
            isReshared,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments: false,
          };
        })
      );
      setPosts(formattedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
    }
  };

  const fetchFollowingPosts = async () => {
    if (!currentUser?.id) return;

    try {
      const [followRes, myResharesRes] = await Promise.all([
        fetch(`${API_URL}/api/follow/following/${currentUser.id}`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" }),
      ]);
      if (!followRes.ok) throw new Error("Failed to fetch followed users");
      const followedUsers = await followRes.json();
      const myReshares = myResharesRes.ok ? await myResharesRes.json() : [];
      const followedIds = followedUsers.map((follow: any) => follow.followedId);

      const allFollowingPosts = await Promise.all(
        followedIds.map(async (userId: number) => {
          const res = await fetch(`${API_URL}/api/posts/user/${userId}`, { credentials: "include" });
          return res.ok ? await res.json() : [];
        })
      );

      const flattenedPosts = allFollowingPosts.flat();
      const validPosts = flattenedPosts.filter((post: any) => {
        if (!post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post);
          return false;
        }
        return true;
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

      const formattedPosts = await Promise.all(
        validPosts.map(async (post: any) => {
          const [commentsRes, likesCountRes, myLikesRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/${post.id}`, { credentials: "include" }),
          ]);

          const comments = commentsRes.ok ? await commentsRes.json() : [];
          const validComments = comments.filter((comment: any) => {
            if (!comment.authorId) {
              console.warn("Skipping comment with undefined authorId:", comment);
              return false;
            }
            return true;
          });

          const commentsWithUsers = await Promise.all(
            validComments.map(async (comment: any) => {
              const user = await fetchUser(comment.authorId);
              return {
                ...comment,
                authorId: comment.authorId,
                username: user.displayName,
                handle: `@${user.username}`,
              };
            })
          );

          const postUser = await fetchUser(post.user.id, post.user);
          const isReshared = myReshares.some((reshare: any) => reshare.postId === post.id);
          const reshareCount = myReshares.filter((reshare: any) => reshare.postId === post.id).length;

          return {
            id: post.id,
            username: postUser.displayName,
            handle: `@${postUser.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            image: post.imageUrl,
            isLiked: myLikesRes.ok && myLikesRes.status === 200,
            isBookmarked: false,
            isReshared,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments: false,
          };
        })
      );
      setFollowingPosts(formattedPosts);
    } catch (err) {
      console.error("Error fetching following posts:", err);
      setError("Failed to load posts from followed users.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        await fetchAllPosts();
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      if (activeTab === "Following") {
        fetchFollowingPosts();
      } else {
        fetchAllPosts();
      }
    }
  }, [currentUser, activeTab]);

  const handlePost = async () => {
    if (!postText.trim() || !currentUser) {
      setError("Please log in to post.");
      return;
    }

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
        username: currentUser.displayName,
        handle: `@${currentUser.username}`,
        time: formatRelativeTime(newPost.createdAt),
        text: newPost.content,
        image: newPost.imageUrl,
        isLiked: false,
        isBookmarked: false,
        isReshared: false,
        commentCount: 0,
        authorId: currentUser.id,
        likeCount: 0,
        reshareCount: 0,
        comments: [],
        showComments: false,
      };

      setPosts([formattedPost, ...posts].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10));
      setFollowingPosts([formattedPost, ...followingPosts].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10));
      setIsModalOpen(false);
      setPostText("");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to delete posts.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/del/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete post");
      const responseText = await res.text();
      if (responseText !== "Post deleted successfully") {
        throw new Error("Unexpected delete response");
      }

      setPosts(posts.filter((post) => post.id !== postId));
      setFollowingPosts(followingPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
      if (!post) return;

      const method = post.isLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to ${post.isLiked ? "unlike" : "like"} post`);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isLiked ? "unlike" : "like"} post.`);
    }
  };

  const handleReshare = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
      if (!post) return;

      const method = post.isReshared ? "DELETE" : "POST";
      const url = post.isReshared ? `${API_URL}/api/reshares/${postId}` : `${API_URL}/api/reshares`;
      const body = post.isReshared ? null : JSON.stringify({ postId });
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body,
      });

      if (!res.ok) throw new Error(`Failed to ${post.isReshared ? "unreshare" : "reshare"} post`);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isReshared: !p.isReshared,
                reshareCount: p.isReshared ? p.reshareCount - 1 : p.reshareCount + 1,
              }
            : p
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isReshared: !p.isReshared,
                reshareCount: p.isReshared ? p.reshareCount - 1 : p.reshareCount + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling reshare:", err);
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isReshared ? "unreshare" : "reshare"} post.`);
    }
  };

  const handleAddComment = async (postId: number, commentText: string) => {
    if (!currentUser) {
      setError("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        credentials: "include",
        body: commentText,
      });

      if (!res.ok) throw new Error(`Failed to add comment: ${res.status}`);
      const newComment = await res.json();

      const user = await fetchUser(currentUser.id);
      const formattedComment: CommentData = {
        id: newComment.id,
        postId: newComment.postId,
        authorId: newComment.authorId || currentUser.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        username: user.displayName,
        handle: `@${user.username}`,
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, formattedComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, formattedComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment.");
    }
  };

  const handleBookmark = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
    setFollowingPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const toggleComments = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
    setFollowingPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

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
          onBookmark={() => handleBookmark(post.id)}
          onAddComment={(commentText) => handleAddComment(post.id, commentText)}
          onReshare={() => handleReshare(post.id)}
          onDelete={() => handleDeletePost(post.id)}
          onToggleComments={() => toggleComments(post.id)}
          showComments={post.showComments || false}
          comments={post.comments || []}
          isUserLoaded={!!currentUser}
          currentUser={currentUser}
          authorId={post.authorId}
        />
      </div>
    ));
  };

  return (
    <div className="flex min-h-screen dark:bg-black text-white mx-auto bg-white">
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
          ) : !currentUser ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg dark:text-white">Please log in to view posts.</p>
            </div>
          ) : (
            <>
              <div
                className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-[#1a1a1a] border border-lime-500 rounded-2xl z-10 bg-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                <h1 className="text-xl dark:text-lime-500 font-bold text-lime-600">What's on your mind?</h1>
              </div>
              <Tabs defaultValue="for You" className="w-full p-2" onValueChange={setActiveTab}>
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
                  disabled={!postText.trim() || !currentUser}
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