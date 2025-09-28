import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhatsHappening from "@/components/WhatsHappening";
import WhoToFollow from "@/components/WhoToFollow";
import { formatRelativeTime } from "@/lib/timeUtils";
import { Skeleton } from "@/components/ui/skeleton";
import StaticPost from "@/components/ui/StaticPost";
import StaticBotPost from "@/components/ui/StaticBotPost";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
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
  profilePicture?:string;
}

interface RawComment {
  id: number;
  postId: number;
  userId?: number;
  content: string;
  createdAt: string;
  profilePicture?:string;
}

interface PostData {
  id: number;
  username: string;
  handle: string;
  profilePicture?:string;
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
  botId: number;
  isBot: boolean;
}

interface RawPost {
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string | null;
  user: {
    id: number;
    username: string;
    displayName: string;
  } | null;
  botId: number;
  isBot: boolean;
}

interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

const PostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const userCache = new Map<number, UserInfo>();

  const fetchUser = async (userId: number): Promise<UserInfo> => {
    if (userCache.has(userId)) {
      return userCache.get(userId)!;
    }
    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch user ${userId}`);
      const user = await res.json();
      const userInfo: UserInfo = {
        id: user.id ?? userId,
        username: user.username ?? `user${userId}`,
        displayName: user.displayName ?? `User ${userId}`,
        profilePicture: user.profilePicture
      };
      userCache.set(userId, userInfo);
      return userInfo;
    } catch (err) {
      console.warn(`Error fetching user ${userId}:`, err);
      const userInfo: UserInfo = {
        id: userId,
        username: `user${userId}`,
        displayName: `User ${userId}`,
      };
      userCache.set(userId, userInfo);
      return userInfo;
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
      setCurrentUser(data);
      userCache.set(data.id, { id: data.id, username: data.username, displayName: data.displayName });
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      return null;
    }
  };

const fetchPost = async (id: number, currentUserId: number) => {
  setLoading(true);
  try {
    const postRes = await fetch(`${API_URL}/api/posts/${id}`, { credentials: "include" });
    if (!postRes.ok) {
      throw new Error(`Failed to fetch post ${id}: ${postRes.status}`);
    }
    const post: RawPost = await postRes.json();
    const userInfo: UserInfo = post.user ?? (await fetchUser(currentUserId));
    const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, reshareCountRes, hasResharedRes] = await Promise.all([
      fetch(`${API_URL}/api/comments/post/${id}`, { credentials: "include" }),
      fetch(`${API_URL}/api/likes/count/${id}`, { credentials: "include" }),
      fetch(`${API_URL}/api/likes/has-liked/${id}`, { credentials: "include" }),
      fetch(`${API_URL}/api/bookmarks/${currentUserId}/${id}/exists`, { credentials: "include" }),
      fetch(`${API_URL}/api/reshares/${id}/count`, { credentials: "include" }),
      fetch(`${API_URL}/api/reshares/${id}/has-reshared`, { credentials: "include" }),
    ]);
    if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${id}: ${commentsRes.status}`);
    if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${id}: ${likesCountRes.status}`);
    if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${id}: ${hasLikedRes.status}`);
    if (!hasBookmarkedRes.ok) console.warn(`Failed to fetch bookmark status for post ID ${id}: ${hasBookmarkedRes.status}`);
    if (!reshareCountRes.ok) console.warn(`Failed to fetch reshare count for post ID ${id}: ${reshareCountRes.status}`);
    if (!hasResharedRes.ok) console.warn(`Failed to fetch has-reshared status for post ID ${id}: ${hasResharedRes.status}`);
    const comments = commentsRes.ok ? await commentsRes.json() : [];
    const validComments = (comments as RawComment[]).filter((c) => c.userId && c.content);
    const commentsWithUsers: CommentData[] = [];
    for (const comment of validComments) {
      try {
        const commentUserInfo = await fetchUser(comment.userId!);
        commentsWithUsers.push({
          id: comment.id,
          postId: comment.postId,
          authorId: comment.userId!,
          content: comment.content,
          createdAt: comment.createdAt,
          username: commentUserInfo.displayName,
          handle: `@${commentUserInfo.username}`,
          profilePicture: comment.profilePicture || "/default-profile.png", // Provide default
        });
      } catch (err) {
        console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
        // Skip invalid comments instead of adding null
      }
    }
    const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
    const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
    const isBookmarked = hasBookmarkedRes.ok ? await hasBookmarkedRes.json() : false;
    const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;
    const isReshared = hasResharedRes.ok ? await hasResharedRes.json() : false;
    setPost({
      id: post.id,
      username: userInfo.displayName,
      handle: `@${userInfo.username}`,
      profilePicture: userInfo.profilePicture || "/default-profile.png", // Provide default
      time: formatRelativeTime(post.createdAt),
      text: post.content,
      image: post.imageUrl || undefined,
      isLiked,
      isBookmarked,
      isReshared,
      commentCount: validComments.length,
      authorId: userInfo.id,
      likeCount,
      reshareCount,
      comments: commentsWithUsers,
      showComments: true,
      botId: post.botId,
      isBot: post.isBot
    });
  } catch (err) {
    console.error(`Error fetching post ${id}:`, err);
    setError(`Failed to load post: ${err instanceof Error ? err.message : "Unknown error"}`);
  } finally {
    setLoading(false);
  }
};

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to like/unlike posts.");
      return;
    }
    if (!post) {
      setError("Post not found.");
      return;
    }
    try {
      const wasLiked = post.isLiked;
      setPost((prev) => {
        if (!prev || prev.id !== postId) return prev;
        return {
          ...prev,
          isLiked: !wasLiked,
          likeCount: wasLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        };
      });
      const method = wasLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to ${wasLiked ? "unlike" : "like"} post ${postId}: ${res.status} ${errorText}`);
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return {
            ...prev,
            isLiked: wasLiked,
            likeCount: wasLiked ? prev.likeCount + 1 : prev.likeCount - 1,
          };
        });
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          throw new Error(`Failed to ${wasLiked ? "unlike" : "like"} post: ${errorText}`);
        }
      }
      const hasLikedRes = await fetch(`${API_URL}/api/likes/has-liked/${postId}`, {
        credentials: "include",
      });
      if (hasLikedRes.ok) {
        const likeData = await hasLikedRes.json();
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return { ...prev, isLiked: likeData === true };
        });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(`Failed to ${post.isLiked ? "unlike" : "like"} post.`);
    }
  };

  const handleBookmark = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to bookmark/unbookmark posts.");
      return;
    }
    if (!post) {
      setError("Post not found.");
      return;
    }
    try {
      const wasBookmarked = post.isBookmarked;
      setPost((prev) => {
        if (!prev || prev.id !== postId) return prev;
        return { ...prev, isBookmarked: !wasBookmarked };
      });
      const method = wasBookmarked ? "DELETE" : "POST";
      const url = `${API_URL}/api/bookmarks/${currentUser.id}/${postId}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to ${wasBookmarked ? "unbookmark" : "bookmark"} post ${postId}: ${res.status} ${errorText}`);
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return { ...prev, isBookmarked: wasBookmarked };
        });
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(errorText || `Failed to ${wasBookmarked ? "unbookmark" : "bookmark"} post.`);
        }
        return;
      }
      const hasBookmarkedRes = await fetch(`${API_URL}/api/bookmarks/${currentUser.id}/${postId}/exists`, {
        credentials: "include",
      });
      if (hasBookmarkedRes.ok) {
        const bookmarkData = await hasBookmarkedRes.json();
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return { ...prev, isBookmarked: bookmarkData === true };
        });
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setError(`Failed to ${post.isBookmarked ? "unbookmark" : "bookmark"} post.`);
    }
  };

  const handleReshare = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to reshare/unreshare posts.");
      return;
    }
    if (!post) {
      setError("Post not found.");
      return;
    }
    try {
      const wasReshared = post.isReshared;
      setPost((prev) => {
        if (!prev || prev.id !== postId) return prev;
        return {
          ...prev,
          isReshared: !wasReshared,
          reshareCount: wasReshared ? prev.reshareCount - 1 : prev.reshareCount + 1,
        };
      });
      const method = wasReshared ? "DELETE" : "POST";
      const url = wasReshared ? `${API_URL}/api/reshares/${postId}` : `${API_URL}/api/reshares`;
      const body = wasReshared ? null : JSON.stringify({ postId });
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to ${wasReshared ? "unreshare" : "reshare"} post ${postId}: ${res.status} ${errorText}`);
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return {
            ...prev,
            isReshared: wasReshared,
            reshareCount: wasReshared ? prev.reshareCount + 1 : prev.reshareCount - 1,
          };
        });
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          throw new Error(`Failed to ${wasReshared ? "unreshare" : "reshare"} post: ${errorText}`);
        }
      }
      const [hasResharedRes, reshareCountRes] = await Promise.all([
        fetch(`${API_URL}/api/reshares/${postId}/has-reshared`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares/${postId}/count`, { credentials: "include" }),
      ]);
      if (hasResharedRes.ok && reshareCountRes.ok) {
        const reshareData = await hasResharedRes.json();
        const reshareCount = await reshareCountRes.json();
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return { ...prev, isReshared: reshareData === true, reshareCount };
        });
      } else {
        console.warn(`Failed to fetch reshare status or count for post ${postId}`);
      }
    } catch (err) {
      console.error("Error toggling reshare:", err);
      setError(`Failed to ${post.isReshared ? "unreshare" : "reshare"} post.`);
    }
  };

  const handleAddComment = async (postId: number, commentText: string) => {
    if (!currentUser) {
      setError("Please log in to comment.");
      return;
    }
    if (!post) {
      setError("Post not found.");
      return;
    }
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    try {
      setPost((prev) => {
        if (!prev || prev.id !== postId) return prev;
        return {
          ...prev,
          comments: [
            ...prev.comments,
            {
              id: Date.now(),
              postId,
              authorId: currentUser.id,
              content: commentText,
              createdAt: new Date().toISOString(),
              username: currentUser.displayName,
              handle: `@${currentUser.username}`,
            },
          ],
          commentCount: prev.commentCount + 1,
        };
      });
      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        credentials: "include",
        body: commentText,
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to add comment to post ${postId}: ${res.status} ${errorText}`);
        setPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          return {
            ...prev,
            comments: prev.comments.filter((c) => c.id !== Date.now()),
            commentCount: prev.commentCount - 1,
          };
        });
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          throw new Error(`Failed to add comment: ${errorText}`);
        }
      }
      const newComment = await res.json();
      const formattedComment: CommentData = {
        id: newComment.id,
        postId: newComment.postId,
        authorId: newComment.userId || currentUser.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        username: currentUser.displayName,
        handle: `@${currentUser.username}`,
      };
      setPost((prev) => {
        if (!prev || prev.id !== postId) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) => (c.id === Date.now() ? formattedComment : c)),
          commentCount: prev.commentCount,
        };
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to delete posts.");
      return;
    }
    if (!post) {
      setError("Post not found.");
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
      navigate("/profile");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    }
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!postId || isNaN(parseInt(postId))) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }
      const parsedPostId = parseInt(postId);
      const currentUserData = await fetchCurrentUser();
      if (currentUserData?.id) {
        await fetchPost(parsedPostId, currentUserData.id);
      } else {
        setError("Cannot fetch post: User not authenticated.");
        setLoading(false);
      }
    };
    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <div className=" flex flex-col lg:flex-row min-h-screen min-h-screen future-feed:bg-black future-feed:text-lime  dark:bg-blue-950 dark:text-slate-200 overflow-y-auto mx-auto">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <PersonalSidebar />
        </aside>
        <main className="flex-1 max-w-full mx-auto p-4">
          <Card className="dark:bg-indigo-950 border-2 border-rose-gold-accent-border future-feed:border-lime future-feed:bg-card future-feed:text-white rounded-2xl my-7 mb-4">
            <CardContent className="p-1 mt-[-15px] ml-[20px]">
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="text-gray-500 dark:text-white hover:text-lime-500 dark:hover:text-lime-400 p-1 sm:p-2 mb-2"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4 future-feed:text-lime sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm ml-1">Back</span>
              </Button>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-24 mt-1 mb-3" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-64 w-full rounded-lg mb-4" />
                  <div className="flex justify-between mt-4 space-x-1 sm:space-x-2 mb-[-12px] ml-[-70px] lg:mr-20 lg:ml-10">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex gap-2 mb-6 mt-10">
                      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex gap-2 mb-6">
                      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-16 flex-1 rounded-lg" />
                      <Skeleton className="h-10 w-20 rounded-lg mt-3" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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

  if (error) {
    return (
      <div className="bg-gray-200 dark:bg-blue-950 future-feed:bg-black flex min-h-screen  dark:text-white overflow-y-auto">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <PersonalSidebar />
        </aside>
        <main className="w-[1100px] mx-auto p-4">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p>{error}</p>
          </div>
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

  if (!post) {
    return (
      <div className="bg-gray-200 dark:bg-blue-950 future-feed:bg-black flex min-h-screen  dark:text-white overflow-y-auto">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
          <PersonalSidebar />
        </aside>
        <main className="w-[1100px] mx-auto p-4">
          <div className="p-4 text-gray-400">Post not found.</div>
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

  return (
  <div className="future-feed:bg-black flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 text-white mx-auto bg-gray-200">
    <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
      <PersonalSidebar />
    </aside>
    <main className="flex-1 p-4 lg:pt-4 p-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto">
      {post.botId || post.isBot ? (
        <StaticBotPost
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
          onAddComment={(commentText: string) => handleAddComment(post.id, commentText)}
          onReshare={() => handleReshare(post.id)}
          onDelete={() => handleDeletePost(post.id)}
          onProfileClick={() => navigate(`/profile/${post.authorId}`)}
          showComments={post.showComments}
          comments={post.comments}
          isUserLoaded={!!currentUser}
          currentUser={currentUser}
          authorId={post.authorId}
          postId={post.id}
          botId={post.botId}
        />
      ) : (
        <StaticPost
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
          onAddComment={(commentText: string) => handleAddComment(post.id, commentText)}
          onReshare={() => handleReshare(post.id)}
          onDelete={() => handleDeletePost(post.id)}
          onProfileClick={() => navigate(`/profile/${post.authorId}`)}
          showComments={post.showComments}
          comments={post.comments}
          isUserLoaded={!!currentUser}
          currentUser={currentUser}
          authorId={post.authorId}
          postId={post.id}
        />
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

export default PostPage;