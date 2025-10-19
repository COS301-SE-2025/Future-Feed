import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import Post from "@/components/ui/post";
import BotPost from "@/components/ui/BotPost";
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

interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePictureUrl?: string;
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
  isBot: boolean;
  botId?: number;
}

interface ApiPost {
  id: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: UserInfo | null;
  botId: number;
  isBot: boolean;
}

interface ApiComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
}

interface ApiReshare {
  postId: number;
}

interface ApiBookmark {
  postId: number;
}

interface PaginatedResponse {
  content: ApiPost[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PAGE_SIZE = 10;

const TopicPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Utility to format relative time
  const formatRelativeTime = (date: string): string => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Fetch user details
  const fetchUser = async (
    userId: number,
    isBot: boolean = false,
    cachedUser?: UserInfo
  ): Promise<UserProfile> => {
    if (cachedUser?.username && cachedUser?.displayName) {
      return {
        id: userId,
        username: cachedUser.username,
        displayName: cachedUser.displayName,
        profilePicture: cachedUser.profilePictureUrl,
        email: "",
      };
    }
    try {
      const endpoint = isBot ? `${API_URL}/api/bots/${userId}` : `${API_URL}/api/user/${userId}`;
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch ${isBot ? 'bot' : 'user'} ${userId}`);
      const data: UserProfile = await res.json();
      return data;
    } catch (err) {
      console.warn(`Error fetching ${isBot ? 'bot' : 'user'} ${userId}:`, err);
      return {
        id: userId,
        username: isBot ? `bot${userId}` : `user${userId}`,
        displayName: isBot ? `Bot #${userId}` : `User ${userId}`,
        email: "",
      };
    }
  };

  // Fetch all topics
  const fetchTopics = async (): Promise<Topic[]> => {
    try {
      const res = await fetch(`${API_URL}/api/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch topics");
      const topics: Topic[] = await res.json();
      setTopics(topics);
      return topics;
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Failed to load topics.");
      setTimeout(() => setError(null), 3000);
      return [];
    }
  };

  // Fetch topics for a post
  const fetchTopicsForPost = async (postId: number): Promise<Topic[]> => {
    try {
      const res = await fetch(`${API_URL}/api/topics/post/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch topic IDs for post ${postId}`);
      const topicIds: number[] = await res.json();

      let currentTopics = topics;
      if (!currentTopics.length) {
        currentTopics = await fetchTopics();
      }

      const postTopics = topicIds
        .map((id) => currentTopics.find((topic) => topic.id === id))
        .filter((topic): topic is Topic => !!topic);

      return postTopics;
    } catch (err) {
      console.error(`Error fetching topics for post ${postId}:`, err);
      setError("Failed to load topics for post.");
      setTimeout(() => setError(null), 3000);
      return [];
    }
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, { credentials: "include" });
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

  // Fetch paginated posts for the topic
  const fetchTopicPosts = async (page: number = 0) => {
    if (!currentUser?.id) {
      console.warn("Cannot fetch posts: currentUser is not loaded");
      setError("User not authenticated.");
      return;
    }
    if (!topicId || isNaN(parseInt(topicId))) {
      setError("Invalid topic ID.");
      setLoading(false);
      return;
    }
    console.debug(`Fetching topic posts for topic ${topicId}, page ${page}`);
    setLoading(page === 0);
    setLoadingMore(page > 0);

    try {
      const [postsRes, myResharesRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/api/topics/${topicId}/posts/paginated?page=${page}&size=${PAGE_SIZE}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" }),
        fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, { credentials: "include" }),
      ]);

      if (!postsRes.ok) {
        const errorData = await postsRes.json();
        throw new Error(errorData.message || `Failed to fetch posts: ${postsRes.status}`);
      }
      if (!bookmarksRes.ok) throw new Error(`Failed to fetch bookmarks: ${bookmarksRes.status}`);

      const pageData: PaginatedResponse = await postsRes.json();
      const apiPosts: ApiPost[] = pageData.content;
      setHasMore(!pageData.last);
      const myReshares: ApiReshare[] = myResharesRes.ok ? await myResharesRes.json() : [];
      const bookmarks: ApiBookmark[] = await bookmarksRes.json();
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));

      const validPosts = apiPosts.filter((post) => {
        if (!post.isBot && !post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post);
          return false;
        }
        return true;
      });

      const formattedPosts: PostData[] = await Promise.all(
        validPosts.map(async (post: ApiPost) => {
          const [commentsRes, likesCountRes, hasLikedRes, topicsRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
            fetchTopicsForPost(post.id),
          ]);

          const comments: ApiComment[] = commentsRes.ok ? await commentsRes.json() : [];
          const validComments = comments.filter((comment: ApiComment) => comment.userId);

          const commentsWithUsers = await Promise.all(
            validComments.map(async (comment: ApiComment) => {
              const user = await fetchUser(comment.userId);
              return {
                id: comment.id,
                postId: comment.postId,
                authorId: comment.userId,
                content: comment.content,
                createdAt: comment.createdAt,
                username: user.displayName,
                handle: `@${user.username}`,
                profilePicture: user.profilePicture,
              };
            })
          );

          const authorId = post.isBot ? post.botId : post.user?.id || post.botId;
          const postUser = await fetchUser(authorId, post.isBot, post.user || undefined);
          const isReshared = myReshares.some((reshare: ApiReshare) => reshare.postId === post.id);
          const reshareCount = myReshares.filter((reshare: ApiReshare) => reshare.postId === post.id).length;

          let isLiked = false;
          if (hasLikedRes.ok) {
            try {
              isLiked = await hasLikedRes.json();
            } catch (err) {
              console.warn(`Failed to parse like status for post ${post.id}:`, err);
            }
          }

          return {
            id: post.id,
            username: postUser.displayName,
            handle: post.isBot || post.botId ? `${postUser.username}` : `@${postUser.username}`,
            profilePicture: postUser.profilePicture,
            time: formatRelativeTime(post.createdAt),
            createdAt: post.createdAt,
            text: post.content,
            image: post.imageUrl || undefined,
            isLiked,
            isBookmarked: bookmarkedPostIds.has(post.id),
            isReshared,
            commentCount: validComments.length,
            authorId,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments: false,
            topics: topicsRes,
            isBot: post.isBot,
            botId: post.botId,
          };
        })
      );

      setPosts((prev) =>
        page === 0
          ? formattedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          : [...prev, ...formattedPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) {
      console.error("Error fetching topic posts:", err);
      setError(`Failed to load posts for topic ID ${topicId}.`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle post interactions
  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
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
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const handleReshare = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
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
    setPosts((prev) =>
      prev.map((post) =>
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
                  username: currentUser.displayName,
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
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleToggleComments = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
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
      await fetchTopics();
    };
    loadData();
  }, [navigate]);

  useEffect(() => {
    if (currentUser && topicId) {
      setPosts([]);
      setPage(0);
      setHasMore(true);
      fetchTopicPosts(0);
    }
  }, [currentUser, topicId]);

  useEffect(() => {
    if (currentUser && topicId && page > 0) {
      fetchTopicPosts(page);
    }
  }, [page, currentUser, topicId]);

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
  if (error || !topicId) {
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
            {topics.find((topic) => topic.id === parseInt(topicId || "0"))?.name
              ? topics.find((topic) => topic.id === parseInt(topicId || "0"))!.name.charAt(0).toUpperCase() +
                topics.find((topic) => topic.id === parseInt(topicId || "0"))!.name.slice(1)
              : `Topic ${topicId}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {posts.length} {posts.length === 1 ? "Post" : "Posts"} on this topic
          </p>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => {
              const isLastPost = index === posts.length - 1;
              return (
                <div key={post.id} ref={isLastPost ? lastPostElementRef : null}>
                  {post.isBot ? (
                    <BotPost
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
                    />
                  ) : (
                    <Post
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
                      isImageLoading={false}
                    />
                  )}
                </div>
              );
            })}
            {loadingMore && (
              <div className="animate-pulse space-y-4 mt-4">
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
            )}
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