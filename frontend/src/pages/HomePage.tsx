import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Post from "@/components/ui/post";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FaBars, FaImage, FaTimes } from "react-icons/fa";
import { formatRelativeTime } from "@/lib/timeUtils";
import { useSpring, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

interface ApiFollow {
  followedId: number;
}
interface ApiUser {
  id: number;
  username: string;
  displayName: string;
}
interface ApiPost {
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string;
  user: ApiUser;
}
interface ApiComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  user: ApiUser;
}
interface ApiReshare {
  postId: number;
}
interface ApiBookmark {
  postId: number;
  content: string;
  authorId: number;
  createdAt: string;
}
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
interface PaginatedResponse {
  content: ApiPost[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}

const CACHE_EXPIRY_MS = 2 * 60 * 1000; // 5 minutes

const HomePage = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isViewTopicsModalOpen, setIsViewTopicsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("following");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pageForYou, setPageForYou] = useState(0);
  const [pageFollowing, setPageFollowing] = useState(0);
  const [hasMoreForYou, setHasMoreForYou] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const userCache = new Map<number, { username: string; displayName: string }>();
  const [tempIdCounter, setTempIdCounter] = useState(-1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const PAGE_SIZE = 10;

  const postModalProps = useSpring({
    opacity: isPostModalOpen ? 1 : 0,
    transform: isPostModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 220, friction: 30 },
  });

  const topicModalProps = useSpring({
    opacity: isTopicModalOpen ? 1 : 0,
    transform: isTopicModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 220, friction: 30 },
  });

  const viewTopicsModalProps = useSpring({
    opacity: isViewTopicsModalOpen ? 1 : 0,
    transform: isViewTopicsModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 220, friction: 30 },
  });

  interface PostUser {
    id: number;
    username?: string;
    displayName?: string;
  }

  const generateTempId = () => {
    setTempIdCounter((prev) => prev - 1);
    return tempIdCounter - 1;
  };

  const saveToCache = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (err) {
      console.warn(`Failed to save ${key} to localStorage:`, err);
    }
  };

  const loadFromCache = <T,>(key: string): { data: T; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data && parsed.timestamp) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Failed to load ${key} from localStorage:`, err);
    }
    return null;
  };

  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_EXPIRY_MS;
  };

  const fetchUser = async (userId: number, postUser?: PostUser) => {
    if (userCache.has(userId)) {
      const cachedUser = userCache.get(userId)!;
      console.debug(`Cache hit for user ${userId}:`, cachedUser);
      return cachedUser;
    }

    const storedUser = localStorage.getItem(`user_${userId}`);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.username && user.displayName) {
          console.debug(`localStorage hit for user ${userId}:`, user);
          userCache.set(userId, user);
          return user;
        }
      } catch (err) {
        console.warn(`Failed to parse localStorage for user ${userId}:`, err);
      }
    }

    if (postUser && postUser.id === userId) {
      const validUser = {
        username: postUser.username && typeof postUser.username === "string" ? postUser.username : `unknown${userId}`,
        displayName: postUser.displayName && typeof postUser.displayName === "string" ? postUser.displayName : `Unknown User ${userId}`,
      };
      console.debug(`Using postUser for user ${userId}:`, validUser);
      userCache.set(userId, validUser);
      localStorage.setItem(`user_${userId}`, JSON.stringify(validUser));
      return validUser;
    }

    if (currentUser && userId === currentUser.id) {
      const user = {
        username: currentUser.username,
        displayName: currentUser.displayName,
      };
      console.debug(`Using currentUser for user ${userId}:`, user);
      userCache.set(userId, user);
      localStorage.setItem(`user_${userId}`, JSON.stringify(user));
      return user;
    }

    console.warn(`No user data available for user ${userId}.`);
    const fallback = { username: `unknown${userId}`, displayName: `Unknown User ${userId}` };
    userCache.set(userId, fallback);
    localStorage.setItem(`user_${userId}`, JSON.stringify(fallback));
    return fallback;
  };

  const fetchCurrentUser = async () => {
    const cachedUser = loadFromCache<UserProfile>('currentUser');
    if (cachedUser && isCacheValid(cachedUser.timestamp)) {
      setCurrentUser(cachedUser.data);
      userCache.set(cachedUser.data.id, { username: cachedUser.data.username, displayName: cachedUser.data.displayName });
      return cachedUser.data;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      setCurrentUser(data);
      userCache.set(data.id, { username: data.username, displayName: data.displayName });
      saveToCache('currentUser', data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      setCurrentUser(null);
      return null;
    }
  };

  const fetchTopicsForPost = async (postId: number): Promise<Topic[]> => {
    try {
      const res = await fetch(`${API_URL}/api/topics/post/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch topic IDs for post ${postId}`);
      const topicIds: number[] = await res.json();
      const postTopics = topicIds
        .map((id) => topics.find((topic) => topic.id === id))
        .filter((topic): topic is Topic => !!topic);
      return postTopics;
    } catch (err) {
      console.error(`Error fetching topics for post ${postId}:`, err);
      return [];
    }
  };

  const fetchAllPosts = async (page: number = 0, append: boolean = false) => {
    console.debug(`Fetching posts for page ${page}, append: ${append}`);
    const cacheKey = `posts_page_${page}`;
    const cachedPosts = loadFromCache<PostData[]>(cacheKey);
    if (cachedPosts && isCacheValid(cachedPosts.timestamp) && !append) {
      console.debug(`Using cached posts for page ${page}`);
      setPosts(cachedPosts.data);
      setLoadingForYou(false);
      return;
    }

    setLoadingForYou(!append);
    setLoadingMore(append);
    try {
      const [postsRes, myResharesRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/api/posts/paginated?page=${page}&size=${PAGE_SIZE}`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" }),
        currentUser ? fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, { credentials: "include" }) : Promise.resolve({ ok: false, json: () => [] }),
      ]);
      if (!postsRes.ok) throw new Error(`Failed to fetch posts: ${postsRes.status}`);
      const paginatedResponse: PaginatedResponse = await postsRes.json();
      console.debug(`API response for page ${page}:`, paginatedResponse);
      const apiPosts: ApiPost[] = paginatedResponse.content;
      setHasMoreForYou(page < paginatedResponse.totalPages - 1);
      console.debug(`hasMoreForYou set to ${page < paginatedResponse.totalPages - 1} for page ${page}, totalPages: ${paginatedResponse.totalPages}`);
      const myReshares: ApiReshare[] = myResharesRes.ok ? await myResharesRes.json() : [];
      const bookmarks: ApiBookmark[] = bookmarksRes.ok ? await bookmarksRes.json() : [];
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));

      const validPosts = apiPosts.filter((post: ApiPost) => {
        if (!post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post);
          return false;
        }
        return true;
      });

      const formattedPosts = await Promise.all(
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
              const user = await fetchUser(comment.userId, comment.user);
              return {
                id: comment.id,
                postId: comment.postId,
                authorId: comment.userId,
                content: comment.content,
                createdAt: comment.createdAt,
                username: user.displayName,
                handle: `@${user.username}`,
              };
            })
          );

          const postUser = await fetchUser(post.user.id, post.user);
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
            handle: `@${postUser.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            image: post.imageUrl,
            isLiked,
            isBookmarked: bookmarkedPostIds.has(post.id),
            isReshared,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments: posts.find((p) => p.id === post.id)?.showComments || false,
            topics: topicsRes,
          };
        })
      );

      setPosts((prevPosts) =>
        append
          ? [
            ...prevPosts,
            ...formattedPosts.filter((newPost) => !prevPosts.some((p) => p.id === newPost.id)),
          ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          : formattedPosts
      );
      saveToCache(cacheKey, formattedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
      setTimeout(()=> {
        setError(null);
      }, 3000);
    } finally {
      setLoadingForYou(false);
      setLoadingMore(false);
    }
  };

  const fetchFollowingPosts = async (page: number = 0, append: boolean = false) => {
    if (!currentUser?.id) return;
    console.debug(`Fetching following posts for page ${page}, append: ${append}`);
    const cacheKey = `followingPosts_page_${page}`;
    const cachedFollowingPosts = loadFromCache<PostData[]>(cacheKey);
    if (cachedFollowingPosts && isCacheValid(cachedFollowingPosts.timestamp) && !append) {
      console.debug(`Using cached following posts for page ${page}`);
      setFollowingPosts(cachedFollowingPosts.data);
      setLoadingFollowing(false);
      return;
    }

    setLoadingFollowing(!append);
    setLoadingMore(append);
    try {
      const [followRes, myResharesRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/api/follow/following/${currentUser.id}`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" }),
        fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, { credentials: "include" }),
      ]);
      if (!followRes.ok) throw new Error("Failed to fetch followed users");
      const followedUsers: ApiFollow[] = await followRes.json();
      const myReshares: ApiReshare[] = myResharesRes.ok ? await myResharesRes.json() : [];
      const bookmarks: ApiBookmark[] = bookmarksRes.ok ? await bookmarksRes.json() : [];
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));
      const followedIds = followedUsers.map((follow: ApiFollow) => follow.followedId);

      const allFollowingPosts = await Promise.all(
        followedIds.map(async (userId: number) => {
          const res = await fetch(`${API_URL}/api/posts/paginated?page=${page}&size=${PAGE_SIZE}&userId=${userId}`, {
            credentials: "include",
          });
          if (!res.ok) return [];
          const paginatedResponse: PaginatedResponse = await res.json();
          console.debug(`API response for following posts, user ${userId}, page ${page}:`, paginatedResponse);
          setHasMoreFollowing(page < paginatedResponse.totalPages - 1);
          console.debug(`hasMoreFollowing set to ${page < paginatedResponse.totalPages - 1} for page ${page}, totalPages: ${paginatedResponse.totalPages}`);
          return paginatedResponse.content;
        })
      );

      const flattenedPosts: ApiPost[] = allFollowingPosts.flat();
      const validPosts = flattenedPosts.filter((post: ApiPost) => post.user?.id);

      const formattedPosts = await Promise.all(
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
              const user = await fetchUser(comment.userId, comment.user);
              return {
                id: comment.id,
                postId: comment.postId,
                authorId: comment.userId,
                content: comment.content,
                createdAt: comment.createdAt,
                username: user.displayName,
                handle: `@${user.username}`,
              };
            })
          );

          const postUser = await fetchUser(post.user.id, post.user);
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
            handle: `@${postUser.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            image: post.imageUrl,
            isLiked,
            isBookmarked: bookmarkedPostIds.has(post.id),
            isReshared,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments: followingPosts.find((p) => p.id === post.id)?.showComments || false,
            topics: topicsRes,
          };
        })
      );

      setFollowingPosts((prevPosts) =>
        append
          ? [
            ...prevPosts,
            ...formattedPosts.filter((newPost) => !prevPosts.some((p) => p.id === newPost.id)),
          ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          : formattedPosts
      );
      saveToCache(cacheKey, formattedPosts);
    } catch (err) {
      console.error("Error fetching following posts:", err);
      setError("Failed to load posts from followed users.");
      setTimeout(()=>{
        setError(null);
      }, 3000);
    } finally {
      setLoadingFollowing(false);
      setLoadingMore(false);
    }
  };

  const fetchTopics = async () => {
    const cachedTopics = loadFromCache<Topic[]>('topics');
    if (cachedTopics && isCacheValid(cachedTopics.timestamp)) {
      setTopics(cachedTopics.data);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch topics: ${res.status}`);
      const data: Topic[] = await res.json();
      setTopics(data || []);
      saveToCache('topics', data || []);
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Failed to load topics.");
    }
  };

  const createTopic = async () => {
    if (!newTopicName.trim()) {
      setError("Topic name cannot be empty.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ name: newTopicName }),
      });
      if (!res.ok) throw new Error("Failed to create topic");
      const newTopic: Topic = await res.json();
      setTopics([...topics, newTopic]);
      saveToCache('topics', [...topics, newTopic]);
      setNewTopicName("");
      setIsTopicModalOpen(false);
    } catch (err) {
      console.error("Error creating topic:", err);
      setError("Failed to create topic.");
    }
  };

  const handlePost = async () => {
    if (!postText.trim() || !currentUser) {
      setError("Please log in to post.");
      return;
    }

    const tempPostId = generateTempId();
    const tempPost: PostData = {
      id: tempPostId,
      username: currentUser.displayName,
      handle: `@${currentUser.username}`,
      time: formatRelativeTime(new Date().toISOString()),
      text: postText,
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
      isLiked: false,
      isBookmarked: false,
      isReshared: false,
      commentCount: 0,
      authorId: currentUser.id,
      likeCount: 0,
      reshareCount: 0,
      comments: [],
      showComments: false,
      topics: selectedTopicIds.map((id) => topics.find((t) => t.id === id)!).filter((t) => t),
    };

    setPosts([tempPost, ...posts]);
    setFollowingPosts([tempPost, ...followingPosts]);
    saveToCache(`posts_page_${pageForYou}`, [tempPost, ...posts]);
    saveToCache(`followingPosts_page_${pageFollowing}`, [tempPost, ...followingPosts]);
    setIsPostModalOpen(false);
    setPostText("");
    const selectedTopics = selectedTopicIds.slice();
    setSelectedTopicIds([]);
    const tempImageFile = imageFile;
    setImageFile(null);

    try {
      const formData = new FormData();
      formData.append("post", JSON.stringify({ content: postText }));
      if (imageFile) {
        formData.append("media", imageFile);
      }

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create post");
      const newPost: ApiPost = await res.json();
      if (selectedTopics.length > 0) {
        const assignRes = await fetch(`${API_URL}/api/topics/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          credentials: "include",
          body: JSON.stringify({
            postId: newPost.id,
            topicIds: selectedTopics,
          }),
        });
        if (!assignRes.ok) {
          console.warn("Failed to assign topics to post:", await assignRes.text());
          setError("Post created, but failed to assign topics.");
        }
      }

      const postTopics = await fetchTopicsForPost(newPost.id);

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
        topics: postTopics,
      };

      setPosts((prev) =>
        [
          formattedPost,
          ...prev.filter((p) => p.id !== tempPostId),
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      );
      setFollowingPosts((prev) =>
        [
          formattedPost,
          ...prev.filter((p) => p.id !== tempPostId),
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      );
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Reverting...");
      setPosts((prev) => prev.filter((p) => p.id !== tempPostId));
      setFollowingPosts((prev) => prev.filter((p) => p.id !== tempPostId));
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
      setSelectedTopicIds(selectedTopics);
      setPostText(postText);
      setImageFile(tempImageFile);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to delete posts.");
      return;
    }

    const deletedPost = posts.find((p) => p.id === postId);
    const deletedFollowingPost = followingPosts.find((p) => p.id === postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setFollowingPosts((prev) => prev.filter((p) => p.id !== postId));
    saveToCache(`posts_page_${pageForYou}`, posts);
    saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);

    try {
      const res = await fetch(`${API_URL}/api/posts/del/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete post");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Reverting...");
      if (deletedPost) {
        setPosts((prev) => [...prev, deletedPost].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
      }
      if (deletedFollowingPost) {
        setFollowingPosts((prev) =>
          [...prev, deletedFollowingPost].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        );
      }
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    }
  };

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to like/unlike posts.");
      return;
    }

    // Find the post in either posts or followingPosts
    const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
    if (!post) {
      setError("Post not found.");
      return;
    }

    // Store original state for rollback in case of failure
    const originalIsLiked = post.isLiked;
    const originalLikeCount = post.likeCount;

    // Optimistic UI update: Update both arrays but ensure no duplication
    const updatePostInArray = (postsArray: PostData[]) =>
      postsArray.map((p) =>
        p.id === postId
          ? {
            ...p,
            isLiked: !p.isLiked,
            likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
          }
          : p
      );

    setPosts((prevPosts) => updatePostInArray(prevPosts));
    setFollowingPosts((prevPosts) => (posts.find((p) => p.id === postId) ? prevPosts : updatePostInArray(prevPosts)));

    // Save to cache
    saveToCache(`posts_page_${pageForYou}`, posts);
    saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);

    try {
      // Toggle like via API
      const method = originalIsLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to ${originalIsLiked ? "unlike" : "like"} post`);

      // Fetch updated like status and count
      const [hasLikedRes, likeCountRes] = await Promise.all([
        fetch(`${API_URL}/api/likes/has-liked/${postId}`, { credentials: "include" }),
        fetch(`${API_URL}/api/likes/count/${postId}`, { credentials: "include" }),
      ]);

      if (!hasLikedRes.ok || !likeCountRes.ok) {
        throw new Error("Failed to fetch updated like status or count");
      }

      const isLiked = await hasLikedRes.json();
      const likeCount = await likeCountRes.json();

      // Update state with confirmed values
      const updatePostWithConfirmedValues = (postsArray: PostData[]) =>
        postsArray.map((p) =>
          p.id === postId ? { ...p, isLiked, likeCount } : p
        );

      setPosts((prevPosts) => updatePostWithConfirmedValues(prevPosts));
      setFollowingPosts((prevPosts) =>
        posts.find((p) => p.id === postId) ? prevPosts : updatePostWithConfirmedValues(prevPosts)
      );

      // Update cache with confirmed values
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(`Failed to ${originalIsLiked ? "unlike" : "like"} post. Reverting...`);

      // Revert state on error
      const revertPostInArray = (postsArray: PostData[]) =>
        postsArray.map((p) =>
          p.id === postId ? { ...p, isLiked: originalIsLiked, likeCount: originalLikeCount } : p
        );

      setPosts((prevPosts) => revertPostInArray(prevPosts));
      setFollowingPosts((prevPosts) =>
        posts.find((p) => p.id === postId) ? prevPosts : revertPostInArray(prevPosts)
      );

      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    }
  };

  const handleReshare = async (postId: number) => {
    const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
    if (!post) {
      setError("Post not found.");
      return;
    }

    const originalIsReshared = post.isReshared;
    const originalReshareCount = post.reshareCount;
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
    saveToCache(`posts_page_${pageForYou}`, posts);
    saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);

    try {
      const method = originalIsReshared ? "DELETE" : "POST";
      const url = originalIsReshared ? `${API_URL}/api/reshares/${postId}` : `${API_URL}/api/reshares`;
      const body = originalIsReshared ? null : JSON.stringify({ postId });
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body,
      });

      if (!res.ok) throw new Error(`Failed to ${originalIsReshared ? "unreshare" : "reshare"} post`);
    } catch (err) {
      console.error("Error toggling reshare:", err);
      setError(`Failed to ${originalIsReshared ? "unreshare" : "reshare"} post. Reverting...`);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isReshared: originalIsReshared, reshareCount: originalReshareCount }
            : p
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isReshared: originalIsReshared, reshareCount: originalReshareCount }
            : p
        )
      );
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
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

    const tempCommentId = generateTempId();
    const tempComment: CommentData = {
      id: tempCommentId,
      postId,
      authorId: currentUser.id,
      content: commentText,
      createdAt: new Date().toISOString(),
      username: currentUser.displayName,
      handle: `@${currentUser.username}`,
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
            ...post,
            comments: [...post.comments, tempComment],
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
            comments: [...post.comments, tempComment],
            commentCount: post.commentCount + 1,
          }
          : post
      )
    );
    saveToCache(`posts_page_${pageForYou}`, posts);
    saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);

    try {
      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        credentials: "include",
        body: commentText,
      });

      if (!res.ok) throw new Error(`Failed to add comment: ${res.status}`);
      const newComment = await res.json();

      const formattedComment: CommentData = {
        id: newComment.id,
        postId: newComment.postId,
        authorId: currentUser.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        username: currentUser.displayName,
        handle: `@${currentUser.username}`,
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: [...post.comments.filter((c) => c.id !== tempCommentId), formattedComment],
              commentCount: post.commentCount,
            }
            : post
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: [...post.comments.filter((c) => c.id !== tempCommentId), formattedComment],
              commentCount: post.commentCount,
            }
            : post
        )
      );
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Reverting...");
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.filter((c) => c.id !== tempCommentId),
              commentCount: post.commentCount - 1,
            }
            : post
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.filter((c) => c.id !== tempCommentId),
              commentCount: post.commentCount - 1,
            }
            : post
        )
      );
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    }
  };

  const handleBookmark = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to bookmark/unbookmark posts.");
      return;
    }

    const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
    if (!post) {
      setError("Post not found.");
      return;
    }

    const originalIsBookmarked = post.isBookmarked;
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? { ...p, isBookmarked: !p.isBookmarked }
          : p
      )
    );
    setFollowingPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? { ...p, isBookmarked: !p.isBookmarked }
          : p
      )
    );
    saveToCache(`posts_page_${pageForYou}`, posts);
    saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);

    try {
      const method = originalIsBookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/bookmarks/${currentUser.id}/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to ${originalIsBookmarked ? "unbookmark" : "bookmark"} post`);
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setError(`Failed to ${originalIsBookmarked ? "unbookmark" : "bookmark"} post. Reverting...`);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isBookmarked: originalIsBookmarked }
            : p
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isBookmarked: originalIsBookmarked }
            : p
        )
      );
      saveToCache(`posts_page_${pageForYou}`, posts);
      saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      localStorage.removeItem('currentUser');
      localStorage.removeItem('topics');
      localStorage.removeItem('activeTab');
      Object.keys(localStorage)
        .filter((key) => key.startsWith('posts_page_') || key.startsWith('followingPosts_page_'))
        .forEach((key) => localStorage.removeItem(key));
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
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
    saveToCache(`posts_page_${pageForYou}`, posts);
    saveToCache(`followingPosts_page_${pageFollowing}`, followingPosts);
  };

  const renderSkeletonPosts = () => {
    return Array.from({ length: PAGE_SIZE }).map((_, index) => (
      <div
        key={index}
        className="mt-4 b-4 border border-lime-300 dark:border-lime-700 rounded-lg p-4 animate-pulse space-y-4"
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
          onNavigate={() => navigate(`/post/${post.id}`)}
          showComments={post.showComments || false}
          comments={post.comments || []}
          isUserLoaded={!!currentUser}
          currentUser={currentUser}
          authorId={post.authorId}
          topics={post.topics || []}
        />
      </div>
    ));
  };

  useEffect(() => {
    const loadData = async () => {
      const cachedActiveTab = loadFromCache<string>('activeTab');
      if (cachedActiveTab && isCacheValid(cachedActiveTab.timestamp)) {
        setActiveTab(cachedActiveTab.data);
      }

      const user = await fetchCurrentUser();
      if (user) {
        await Promise.all([fetchAllPosts(0), fetchTopics()]);
        setHasMoreForYou(true);
      }
      setLoading(false);
    };
    loadData();

    const intervalId = setInterval(() => {
      if (pageForYou === 0 && activeTab === "for You") {
        fetchAllPosts(0);
      } else if (pageFollowing === 0 && activeTab === "Following") {
        fetchFollowingPosts(0);
      }
    }, 360000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentUser?.id && activeTab === "Following" && followingPosts.length === 0) {
      fetchFollowingPosts(0);
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    saveToCache('activeTab', activeTab);
    // Reset pagination when switching tabs
    if (activeTab === "for You") {
      setPageForYou(0);
      setHasMoreForYou(true);
      if (posts.length === 0) {
        fetchAllPosts(0);
      }
    } else if (activeTab === "Following") {
      setPageFollowing(0);
      setHasMoreFollowing(true);
      if (followingPosts.length === 0) {
        fetchFollowingPosts(0);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    console.debug(`Setting up IntersectionObserver, activeTab: ${activeTab}, hasMoreForYou: ${hasMoreForYou}, hasMoreFollowing: ${hasMoreFollowing}, loadMoreRef: ${!!loadMoreRef.current}`);
    if (!loadMoreRef.current || loading || (activeTab === "for You" && !hasMoreForYou) || (activeTab === "Following" && !hasMoreFollowing)) {
      console.debug("Skipping observer setup: ref missing, loading, or no more posts");
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        console.debug("IntersectionObserver triggered", entries);
        if (entries[0].isIntersecting && !loadingMore) {
          console.debug(`Loading more posts for ${activeTab}, current page: ${activeTab === "for You" ? pageForYou : pageFollowing}`);
          if (activeTab === "for You" && hasMoreForYou) {
            setPageForYou((prev) => {
              const nextPage = prev + 1;
              console.debug(`Fetching next page for For You: ${nextPage}`);
              fetchAllPosts(nextPage, true);
              return nextPage;
            });
          } else if (activeTab === "Following" && hasMoreFollowing) {
            setPageFollowing((prev) => {
              const nextPage = prev + 1;
              console.debug(`Fetching next page for Following: ${nextPage}`);
              fetchFollowingPosts(nextPage, true);
              return nextPage;
            });
          }
        }
      },
      { threshold: 0.5, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      console.debug("Observing loadMoreRef");
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        console.debug("Cleaning up observer");
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [activeTab, hasMoreForYou, hasMoreFollowing, loadingMore, loading, posts.length, followingPosts.length]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-black text-white mx-auto bg-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
        <div className="p-4 mt-6 border-t border-lime-500 flex flex-col gap-2 hidden lg:flex">
          <Button
            onClick={() => setIsTopicModalOpen(true)}
            className="w-[200px] dark:bg-black dark:border-3 dark:border-lime-500 bg-lime-600 text-white dark:text-lime-600 border-3 border-lime-300 hover:bg-white hover:text-lime-600 dark:hover:bg-[#1a1a1a]"
          >
            Create Topic
          </Button>
          <Button
            onClick={() => setIsViewTopicsModalOpen(true)}
            className="w-[200px] mt-3 dark:text-lime-600 dark:bg-black dark:border-3 dark:border-lime-600 bg-lime-600 border-3 border-lime-500 text-white hover:bg-white hover:text-lime-600 dark:hover:bg-[#1a1a1a]"
          >
            View Topics
          </Button>
        </div>
      </aside>

      <button
        className="lg:hidden fixed top-5 right-5 bg-lime-500 text-white p-3 rounded-full z-20 shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/90 z-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-xs p-4">
            <ThemeProvider>
              <div className="pe-9 flex mb-30 ml-30 gap-2 rounded">
                <ModeToggle />
              </div>
            </ThemeProvider>
            <button
              onClick={handleLogout}
              className="mb-2 w-[255px] ml-4 mb-4 py-2 px-4 bg-lime-500 text-white rounded hover:bg-lime-600 transition-colors "
            >
              Logout
            </button>
            <div className="p-4 border-t border-lime-500 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsTopicModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-lime-500 text-white rounded hover:bg-lime-600 transition-colors"
              >
                Create Topic
              </button>
              <button
                onClick={() => {
                  setIsViewTopicsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-lime-500 text-white rounded hover:bg-lime-600 transition-colors mt-3"
              >
                View Topics
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`flex flex-1 flex-col lg:flex-row max-w-full lg:max-w-[calc(100%-295px)] ${isPostModalOpen || isTopicModalOpen || isViewTopicsModalOpen ? "backdrop-blur-sm" : ""
          }`}
      >
        <main className="flex-1 p-4 lg:pt-4 p-4 lg:p-6 lg:pl-2 min-h-screen overflow-y-auto">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          {loading ? (
            renderSkeletonPosts()
          ) : !currentUser ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg dark:text-white">Please log in to view posts.</p>
            </div>
          ) : (
            <>
              <div
                className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-[#1a1a1a] border border-lime-500 rounded-2xl z-10 bg-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsPostModalOpen(true)}
              >
                <h1 className="text-xl dark:text-lime-500 font-bold text-lime-600">What's on your mind?</h1>
              </div>
              <Tabs defaultValue="for You" className="w-full p-2" onValueChange={setActiveTab}>
                <TabsList className="w-full flex justify-around rounded-2xl border border-lime-500 dark:bg-black sticky top-[68px] z-10 overflow-x-auto">
                  {["for You", "Following", "Presets"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="flex-1 min-w-[100px] rounded-2xl dark:text-white text-green capitalize dark:data-[state=active]:text-white dark:data-[state=active]:border-b-2 dark:data-[state=active]:border-lime-500 text-sm lg:text-base"
                    >
                      {tab.replace(/^\w/, (c) => c.toUpperCase())}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="for You" className="p-0">
                  {loadingForYou ? (
                    renderSkeletonPosts()
                  ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <p className="text-lg dark:text-white">No posts available.</p>
                      <Button
                        className="mt-4 bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={() => setIsPostModalOpen(true)}
                      >
                        Create your first post
                      </Button>
                    </div>
                  ) : (
                    <>
                      {renderPosts(posts)}
                      {hasMoreForYou && (
                        <div ref={loadMoreRef} className="flex justify-center py-4 min-h-[50px]">
                          {loadingMore ? (
                            <div className="animate-spin mt-[-20px] rounded-full h-13 w-13 border-t-2 border-b-2 border-lime-500"></div>
                          ) : (
                            <p className="text-sm dark:text-white">Scroll to load more...</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="Following">
                  {loadingFollowing ? (
                    renderSkeletonPosts()
                  ) : followingPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <p className="text-lg dark:text-white">No posts from followed users.</p>
                      <Button
                        className="mt-4 bg-lime-500 hover:bg-lime-600 text-white"
                        onClick={() => fetchFollowingPosts(0)}
                      >
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <>
                      {renderPosts(followingPosts)}
                      {hasMoreFollowing && (
                        <div ref={loadMoreRef} className="flex justify-center py-4 min-h-[50px]">
                          {loadingMore ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-500"></div>
                          ) : (
                            <p className="text-sm dark:text-white">Scroll to load more...</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="Presets">
                  <p className="text-3xl mt-40 font-bold dark:text-white text-lime-600 text-center">
                    Presets to be implemented
                  </p>
                </TabsContent>
              </Tabs>
            </>
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
      {isPostModalOpen && (
        <animated.div
          style={postModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 p-4"
        >
          <div className="bg-white dark:bg-[#1a1f1f] rounded-2xl p-6 w-full max-w-2xl min-h-[500px] border-2 border-lime-500 flex flex-col relative">
            <button
              onClick={() => {
                setIsPostModalOpen(false);
                setPostText("");
                setSelectedTopicIds([]);
              }}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
              title="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-5 text-lime-700 dark:text-white">Share your thoughts</h2>
            </div>
            <div className="flex flex-col flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full mb-4 text-gray-900 dark:bg-black dark:text-white dark:border-lime-500 flex-1 resize-none"
                rows={8}
              />
              <div className="mb-4">
                <select
                  multiple
                  value={selectedTopicIds.map(String)}
                  onChange={(e) =>
                    setSelectedTopicIds(Array.from(e.target.selectedOptions, (option) => Number(option.value)))
                  }
                  className="dark:bg-black dark:text-white dark:border-lime-500 border-2 rounded-md p-2 w-full text-lime-700"
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple topics</p>
              </div>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  className="dark:text-white text-black dark:border-lime-500 flex items-center space-x-1 border-2 border-lime-500 dark:hover:border-lime-800"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <FaImage className="w-4 h-4" />
                  <span>{imageFile ? `Image: ${imageFile.name}` : "Attach Image"}</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  id="image-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                    }
                  }}
                />
                <Button
                  onClick={handlePost}
                  className="bg-lime-500 text-white hover:bg-lime-800"
                  disabled={!postText.trim() || !currentUser}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </animated.div>
      )}
      {isTopicModalOpen && (
        <animated.div
          style={topicModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
        >
          <div className="bg-white dark:bg-black rounded-2xl p-6 w-full max-w-md border-2 border-lime-500 flex flex-col relative">
            <button
              onClick={() => {
                setIsTopicModalOpen(false);
                setNewTopicName("");
              }}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
              title="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-lime-700 dark:text-white">Create a Topic</h2>
            <div className="flex flex-col">
              <Input
                placeholder="Topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="mb-4 dark:bg-black dark:text-white dark:border-lime-500"
              />
              <Button
                onClick={createTopic}
                className="bg-lime-500 text-white hover:bg-lime-600"
                disabled={!newTopicName.trim() || !currentUser}
              >
                Create
              </Button>
            </div>
          </div>
        </animated.div>
      )}
      {isViewTopicsModalOpen && (
        <animated.div
          style={viewTopicsModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
        >
          <div className="bg-white dark:bg-black rounded-2xl p-6 w-full max-w-md border-2 border-lime-500 flex flex-col relative">
            <button
              onClick={() => setIsViewTopicsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
              title="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-lime-700 dark:text-white">All Topics</h2>
            <div className="flex flex-col">
              {topics.length === 0 ? (
                <p className="text-sm text-lime dark:text-gray-400">No topics available.</p>
              ) : (
                <ul className="list-disc pl-5 max-h-[300px] overflow-y-auto">
                  {topics.map((topic) => (
                    <li key={topic.id} className="text-sm text-lime-700 dark:text-white mb-2">
                      {topic.name}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                onClick={() => setIsViewTopicsModalOpen(false)}
                className="mt-4 bg-lime-500 text-white hover:bg-lime-600"
              >
                Close
              </Button>
            </div>
          </div>
        </animated.div>
      )}
    </div>
  );
};

export default HomePage;