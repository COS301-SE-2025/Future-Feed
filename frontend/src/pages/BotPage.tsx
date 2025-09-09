import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Post from "@/components/ui/post";
import { formatRelativeTime } from "@/lib/timeUtils";
import { FaRobot } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

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
}

interface Topic {
  id: number;
  name: string;
}

interface PostData {
  id: number;
  username: string; // Used as display name (bot.name)
  handle: string; // @bot.schedule
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
  ownerId: number;
  name: string;
  prompt: string;
  schedule: string;
  contextSource: string;
  createdAt: string;
}

interface BotPost {
  id: number;
  botId: number;
  postId: number;
  createdAt: string;
}

interface SinglePostResponse {
  id: number;
  content: string;
  authorId: number;
  createdAt: string;
  imageUrl?: string;
}

interface RawComment {
  id: number;
  postId: number;
  userId?: number;
  content: string;
  createdAt: string;
}

const API_URL = "http://localhost:8080";

const BotPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { botId } = useParams<{ botId: string }>();
  const [bot, setBot] = useState<BotProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUser = async (
    userId: number
  ): Promise<{ id: number; username: string; displayName: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
      const user = await res.json();
      return {
        id: user.id ?? userId,
        username: user.username ?? `user${userId}`,
        displayName: user.displayName ?? `User ${userId}`,
      };
    } catch (err) {
      console.warn(`Error fetching user ${userId}:`, err);
      return {
        id: userId,
        username: `user${userId}`,
        displayName: `User ${userId}`,
      };
    }
  };

  const fetchTopicsForPost = async (postId: number): Promise<Topic[]> => {
    try {
      const res = await fetch(`${API_URL}/api/topics/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
      });
      if (!res.ok) {
        console.warn(`Failed to fetch topics for post ${postId}: ${res.status}`);
        return [];
      }
      const topicIds: number[] = await res.json();

      const resTopics = await fetch(`${API_URL}/api/topics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
      });
      const allTopics: Topic[] = resTopics.ok ? await resTopics.json() : [];
      return topicIds
        .map((id) => allTopics.find((t) => t.id === id))
        .filter((t): t is Topic => !!t);
    } catch (err) {
      console.warn(`Error fetching topics for post ${postId}:`, err);
      return [];
    }
  };

  const fetchBotPosts = async () => {
    if (!botId) {
      setError("Invalid bot ID");
      setLoading(false);
      return;
    }

    const parsedBotId = Number.parseInt(botId, 10);
    if (Number.isNaN(parsedBotId)) {
      setError("Invalid bot ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const botPostsResponse = await fetch(
        `${API_URL}/api/bot-posts/by-bot/${parsedBotId}`,
        { credentials: "include" }
      );
      if (!botPostsResponse.ok) {
        throw new Error(`Failed to fetch bot posts: ${botPostsResponse.status}`);
      }
      const botPosts: BotPost[] = await botPostsResponse.json();

      // Limit to the first 10 posts
      const limitedBotPosts = botPosts.slice(0, 10);

      const formattedPosts = await Promise.all(
        limitedBotPosts.map(async (bp) => {
          try {
            const postResponse = await fetch(
              `${API_URL}/api/posts/${bp.postId}`,
              { credentials: "include" }
            );
            if (!postResponse.ok) {
              console.warn(`Skipping post ID ${bp.postId}: ${postResponse.status}`);
              return null;
            }
            const postData: SinglePostResponse = await postResponse.json();

            const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, topics] =
              await Promise.all([
                fetch(`${API_URL}/api/comments/post/${postData.id}`, {
                  credentials: "include",
                }),
                fetch(`${API_URL}/api/likes/count/${postData.id}`, {
                  credentials: "include",
                }),
                fetch(`${API_URL}/api/likes/has-liked/${postData.id}`, {
                  credentials: "include",
                }),
                fetch(
                  `${API_URL}/api/bookmarks/${parsedBotId}/${postData.id}/exists`,
                  { credentials: "include" }
                ),
                fetchTopicsForPost(postData.id),
              ]);

            const comments = commentsRes.ok ? await commentsRes.json() : [];
            const validComments = (comments as RawComment[]).filter(
              (c) => c.userId && c.content
            );

            const commentsWithUsers: CommentData[] = (
              await Promise.all(
                validComments.map(async (comment: RawComment) => {
                  try {
                    const cu = await fetchUser(comment.userId!);
                    return {
                      id: comment.id,
                      postId: comment.postId,
                      authorId: comment.userId!,
                      content: comment.content,
                      createdAt: comment.createdAt,
                      username: cu.displayName,
                      handle: `@${cu.username}`,
                    };
                  } catch (err) {
                    console.warn(
                      `Failed to fetch user for comment ID ${comment.id}:`,
                      err
                    );
                    return null;
                  }
                })
              )
            ).filter((c): c is CommentData => c !== null);

            const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
            const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
            const isBookmarked = hasBookmarkedRes.ok
              ? await hasBookmarkedRes.json()
              : false;

            return {
              id: postData.id,
              username: bot?.name || "Unknown Bot", // Use bot.name as display name
              handle: `@${bot?.schedule || "unknown"}`,
              time: formatRelativeTime(postData.createdAt),
              text: postData.content,
              ...(postData.imageUrl ? { image: postData.imageUrl } : {}),
              isLiked,
              isBookmarked,
              isReshared: false,
              commentCount: validComments.length,
              authorId: postData.authorId,
              likeCount,
              reshareCount: 0,
              comments: commentsWithUsers,
              showComments: false,
              topics: topics ?? [],
            };
          } catch (err) {
            console.warn(`Error processing post ID ${bp.postId}:`, err);
            return null;
          }
        })
      );

      const validPosts = formattedPosts.filter((p): p is PostData => p !== null);
      setPosts(validPosts);
      if (validPosts.length === 0) {
        console.warn("No valid posts after processing.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bot data");
    } finally {
      setLoading(false);
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
        throw new Error("User info missing username or displayName");
      }
      setUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      navigate("/login");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }
      if (!bot) {
        setError("Please log in to like/unlike posts.");
        return;
      }

      const wasLiked = post.isLiked;

      // optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );

      const method = wasLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        // revert
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: wasLiked,
                  likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
                }
              : p
          )
        );
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }
        throw new Error(
          `Failed to ${wasLiked ? "unlike" : "like"} post: ${errorText}`
        );
      }

      // sync truth
      const hasLikedRes = await fetch(
        `${API_URL}/api/likes/has-liked/${postId}`,
        { credentials: "include" }
      );
      if (hasLikedRes.ok) {
        const likeData = await hasLikedRes.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isLiked: likeData === true } : p
          )
        );
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to toggle like.");
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }
      if (!user) {
        setError("Please log in to bookmark/unbookmark posts.");
        return;
      }
      if (!bot) {
        setError("Please log in to bookmark/unbookmark posts.");
        return;
      }
      const wasBookmarked = post.isBookmarked;

      // optimistic
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
        )
      );

      const method = wasBookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/bookmarks/${bot.id}/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        // revert
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isBookmarked: wasBookmarked } : p
          )
        );
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }
        throw new Error(
          `Failed to ${wasBookmarked ? "unbookmark" : "bookmark"} post: ${errorText}`
        );
      }

      // sync truth
      const hasBookmarkedRes = await fetch(
        `${API_URL}/api/bookmarks/${user.id}/${postId}/exists`,
        { credentials: "include" }
      );
      if (hasBookmarkedRes.ok) {
        const exists = await hasBookmarkedRes.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isBookmarked: exists === true } : p
          )
        );
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setError("Failed to toggle bookmark.");
    }
  };

  const handleAddComment = async (postId: number, commentText: string) => {
    if (!bot) {
      setError("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    const tempId = Date.now();

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }

      // optimistic add
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: tempId,
                    postId,
                    authorId: bot.id,
                    content: commentText,
                    createdAt: new Date().toISOString(),
                    username: bot.name,
                    handle: `@${bot.schedule}`,
                  },
                ],
                commentCount: p.commentCount + 1,
              }
            : p
        )
      );

      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        credentials: "include",
        body: commentText,
      });

      if (!res.ok) {
        const errorText = await res.text();
        // revert optimistic comment
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.filter((c) => c.id !== tempId),
                  commentCount: Math.max(0, p.commentCount - 1),
                }
              : p
          )
        );
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
          return;
        }
        throw new Error(`Failed to add comment: ${errorText}`);
      }

      const newComment = await res.json();

      // replace temp with real id/data
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === tempId
                    ? {
                        id: newComment.id,
                        postId: newComment.postId,
                        authorId: newComment.userId || bot.id,
                        content: newComment.content,
                        createdAt: newComment.createdAt,
                        username: bot.name,
                        handle: `@${bot.schedule}`,
                      }
                    : c
                ),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
      // ensure revert
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.filter((c) => c.id !== tempId),
                commentCount: Math.max(0, p.commentCount - 1),
              }
            : p
        )
      );
      setError("Failed to add comment.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!bot) {
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
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    }
  };

  const handleExecuteBot = async () => {
    if (!bot) {
      setError("Please log in to execute the bot.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/bots/${botId}/execute`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to execute bot: ${errorText}`);
      }
      const result = await res.json();
      console.log("Bot executed successfully:", result);
      location.reload(); // Reload to reflect changes
    } catch (err) {
      console.error("Error executing bot:", err);
      setError("Failed to execute bot.");
    }
  };

  const fetchBotInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bots/${botId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch bot info: ${res.status}`);
      const data: BotProfile = await res.json();
      if (!data.name) {
        throw new Error("Bot info missing name");
      }
      setBot(data);
      return data;
    } catch (err) {
      console.error("Error fetching bot info:", err);
      setError("Failed to load bot info. Please log in again.");
      navigate("/login");
      setBot(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

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
    const loadData = async () => {
      await fetchBotInfo();
      await fetchBotPosts();
      await fetchCurrentUser();
    };
    loadData();
  }, [botId]);

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
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-black text-white mx-auto bg-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="flex-1 p-4 lg:p-6 mt-25">
        <div className="relative">
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3 border-lime-500 dark:border-lime-500">
              <Link
                to="/edit-bot"
                className="flex items-center justify-center h-full w-full"
              >
                <FaRobot className="w-20 h-20 text-gray-600 dark:text-gray-300" />
              </Link>
            </Avatar>
          </div>
        </div>
        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl font-bold">{bot.name}</h1>
              <p className="dark:text-gray-400">Schedule: {bot.schedule}</p>
              <p className="mt-2 text-sm">{bot.prompt || "This is an area for prompt"}</p>
            </div>
            <div className="mt-[-50px] gap-4 flex items-center">
              <Button
                variant="outline"
                className="-mt-30 text-white bg-lime-600 dark:hover:text-white dark:text-black dark:bg-lime-500 dark:border-lime-500 dark:hover:bg-lime-800 hover:cursor-pointer"
                onClick={handleExecuteBot}
              >
                Execute Bot
              </Button>
              <Button
                variant="outline"
                className="-mt-30 text-white bg-lime-600 dark:hover:text-black dark:text-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 dark:hover:bg-lime-500 hover:cursor-pointer"
                onClick={() => navigate("/edit-bot")}
              >
                Edit Bot
              </Button>
            </div>
          </div>
          <div className="mt-4 flex content-between gap-2 text-sm dark:text-gray-400">
            <Link
              to="/followers?tab=followers"
              className="flex items-center gap-3 hover:underline cursor-pointer"
            >
              <span className="font-medium dark:text-white">0</span> Followers ·
            </Link>
            <span className="font-medium dark:text-white">{posts.length}</span> Posts
          </div>
        </div>
        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
        {posts.length === 0 ? (
          <div className="p-4 text-gray-400">No posts yet.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="mb-4">
              <Post
                profilePicture={FaRobot.toString()}
                username={bot.name}
                handle={bot.schedule}
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
                onLike={() => handleLike(post.id)}
                onBookmark={() => handleBookmark(post.id)}
                onReshare={() => {}}
                onAddComment={(commentText) => handleAddComment(post.id, commentText)}
                onDelete={() => handleDeletePost(post.id)}
                onNavigate={() => navigate(`/post/${post.id}`)}
                currentUser={user}
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