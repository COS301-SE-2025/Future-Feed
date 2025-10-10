import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, SmilePlus, ArrowLeft, ChartNoAxesGantt, Trash2, ChevronUp, ChevronDown, EyeOff } from 'lucide-react';
import { useNotifications } from "@/context/NotificationContext";
import BotPost from "@/components/ui/BotPost";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
interface Preset {
  id: number;
  userId: number;
  name: string;
  defaultPreset?: boolean;
}

interface Rule {
  id: number;
  presetId: number;
  topicId?: number;
  sourceType?: 'user' | 'bot';
  specificUserId?: number;
  percentage?: number;
}

interface ApiFollow {
  followedId: number;
}
interface ApiUser {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}
interface ApiPost {
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string;
  user: ApiUser;
  botId: number;
  isBot: boolean;
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
  profilePicture?: string;
  time: string;
  createdAt: string;
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
  botId: number;
  isBot: boolean;
}

const HomePage = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isViewTopicsModalOpen, setIsViewTopicsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [botId, setBotId] = useState(0);
  const [isBot, setisBot] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [followingPosts, setFollowingPosts] = useState<PostData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Following");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tempIdCounter, setTempIdCounter] = useState(-1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [rules, setRules] = useState<{ [presedId: number]: Rule[] }>({});
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [newRule, setNewRule] = useState({
    topicId: undefined as number | undefined,
    sourceType: undefined as 'user' | 'bot' | undefined,
    specificUserId: undefined as number | undefined,
    percentage: undefined as number | undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const { fetchNotifications } = useNotifications();
  const [presetPosts, setPresetPosts] = useState<PostData[]>([]);
  const [loadingPresetPosts, setLoadingPresetPosts] = useState(false);
  const [isViewingPresetFeed, setIsViewingPresetFeed] = useState(false);
  const [defaultPresetId, setDefaultPresetId] = useState<number | null>(null);
  const [useAIGeneration, setUseAIGeneration] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageWidth, setImageWidth] = useState(384);
  const [imageHeight, setImageHeight] = useState(384);
  const [imageSteps, setImageSteps] = useState(8);
  const [imageModel, setImageModel] = useState("black-forest-labs/FLUX.1-schnell");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([]);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [isCreatePresetModalOpen, setIsCreatePresetModalOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState<ErrorResponse | null>(null);
  const [seconds, setSeconds] = useState(3);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const postModalProps = useSpring({
    opacity: isPostModalOpen ? 1 : 0,
    transform: isPostModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 250, friction: 35 },
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

  const createPresetModalProps = useSpring({
    opacity: isCreatePresetModalOpen ? 1 : 0,
    transform: isCreatePresetModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 250, friction: 35 },
  });

  interface ErrorResponse{
    error: string;
    message: string;
    labels?: string[];
  }

  interface PostUser {
    id: number;
    username?: string;
    displayName?: string;
    profilePicture?: string;
  }

  const generateTempId = () => {
    setTempIdCounter((prev) => prev - 1);
    return tempIdCounter - 1;
  };

  const fetchBot = async (botId: number, postBot?: { username?: string; displayName?: string; profilePicture?: string }) => {
    if (!botId) {
      console.warn("Invalid botId provided");
      return {
        username: "unknownbot",
        displayName: "Unknown Bot",
        profilePicture: undefined,
      };
    }
    if (postBot && postBot.username && postBot.displayName) {
      const bot = {
        username: postBot.username,
        displayName: postBot.displayName,
        profilePicture: postBot.profilePicture,
      };
      console.debug(`Using provided bot data for bot ${botId}:`, bot);
      return bot;
    }

    try {
      const res = await fetch(`${API_URL}/api/bot/${botId}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch bot ${botId}: ${res.status}`);
      const botData = await res.json();
      const validBot = {
        username: botData.username || `bot${botId}`,
        displayName: botData.displayName || `Bot ${botId}`,
        profilePicture: botData.profilePicture,
      };
      console.debug(`Fetched bot data for bot ${botId}:`, validBot);
      return validBot;
    } catch (err) {
      console.warn(`Failed to fetch bot ${botId}:`, err);
      const fallback = {
        username: `bot${botId}`,
        displayName: `Bot ${botId}`,
        profilePicture: undefined,
      };
      return fallback;
    }
  };

  const fetchUser = async (userId: number, postUser?: PostUser) => {

    if (currentUser && userId === currentUser.id) {
      const user = {
        username: currentUser.username,
        displayName: currentUser.displayName,
        profilePicture: currentUser.profilePicture,
      };
      console.debug(`Using currentUser for user ${userId} ${postUser}:`, user);
      return user;
    }
    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch user ${userId}: ${res.status}`);
      const userData: ApiUser = await res.json();
      const validUser = {
        username: userData.username || `unknown${userId}`,
        displayName: userData.displayName || `Unknown User ${userId}`,
        profilePicture: userData.profilePicture,
      };
      console.debug(`Fetched user data for user ${userId}:`, validUser);
      return validUser;
    } catch (err) {
      console.warn(`Failed to fetch user ${userId}:`, err);
      const fallback = {
        username: `unknown${userId}`,
        displayName: `Unknown User ${userId}`,
        profilePicture: undefined,
      };
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
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      setCurrentUser(null);
      return null;
    }
  };
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/all`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      setTimeout(() => setError(null), 3000);
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

  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);


  useEffect(() => {
    if (userSearchQuery.trim() === "") {
      setFilteredUsers(allUsers.slice(0, 5));
    } else {
      const query = userSearchQuery.toLowerCase();
      const filtered = allUsers.filter(user =>
        user.displayName?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      ).slice(0, 10);
      setFilteredUsers(filtered);
    }
  }, [userSearchQuery, allUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-search-container')) {
        setIsUserSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loadingForYou &&
        hasMore
      ) {
        const nextPage = currentPage + 1;
        fetchPaginatedPosts(nextPage).then((fetchedCount) => {
          if (fetchedCount === 0) {
            setHasMore(false);
          } else {
            setCurrentPage(nextPage);
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, loadingForYou, hasMore]);

  const fetchPaginatedPosts = async (page: number) => {
    if (!currentUser?.id) {
      console.warn("Cannot fetch posts: currentUser is not loaded");
      return 0;
    }
    console.debug(`Fetching posts page ${page}`);
    setLoadingForYou(true);

    try {
      const [postsRes, myResharesRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/api/posts/paginated?page=${page}&size=${PAGE_SIZE}`, { credentials: "include" }),
        fetch(`${API_URL}/api/reshares`, { credentials: "include" }),
        fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, { credentials: "include" }),
      ]);

      if (!postsRes.ok) throw new Error(`Failed to fetch posts: ${postsRes.status}`);
      if (!bookmarksRes.ok) throw new Error(`Failed to fetch bookmarks: ${bookmarksRes.status}`);

      const pageData = await postsRes.json();
      const apiPosts: ApiPost[] = pageData.content;
      const myReshares: ApiReshare[] = myResharesRes.ok ? await myResharesRes.json() : [];
      const bookmarks: ApiBookmark[] = await bookmarksRes.json();
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));

      const validPosts = apiPosts.filter(post => {
        if (!post.user?.id) {
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
              const user = await fetchUser(comment.userId, comment.user);
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

          let postUser;
          if (post.isBot && post.botId) {
            postUser = await fetchBot(post.botId, post.user);
          } else {
            postUser = await fetchUser(post.user.id, post.user);
          }
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

          const existingPost = posts.find(p => p.id === post.id);
          const showComments = existingPost ? existingPost.showComments : false;

          return {
            id: post.id,
            username: postUser.displayName,
            handle: post.isBot || post.botId ? `${postUser.username}` : `@${postUser.username}`,
            profilePicture: postUser.profilePicture,
            time: formatRelativeTime(post.createdAt),
            createdAt: post.createdAt,
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
            showComments,
            topics: topicsRes,
            isBot: post.isBot,
            botId: post.botId
          };
        })
      );

      setPosts(prev => {
        const postsMap = new Map(prev.map(p => [p.id, p]));
        formattedPosts.forEach(p => {
          if (postsMap.has(p.id)) {
            postsMap.set(p.id, { ...p, showComments: postsMap.get(p.id)!.showComments });
          } else {
            postsMap.set(p.id, p);
          }
        });
        return Array.from(postsMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    } catch (err) {
      console.error("Error fetching paginated posts:", err);
    } finally {
      setLoadingForYou(false);
    }
  };

  type ApiResponse =
    | ApiFollow[]
    | ApiReshare[]
    | ApiBookmark[]
    | ApiPost[]
    | ApiComment[]
    | number
    | boolean
    | string
    | { count: number }
    | { liked: boolean };

  const textPreview = (s: string, n = 500) => (s.length > n ? s.slice(0, n) + "…" : s);

  function stripBOM(s: string) {
    return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
  }

  function stripXssiPrefix(s: string) {
    if (s.startsWith(")]}',") || s.startsWith(")]}'\n")) {
      const i = s.indexOf("\n");
      return i >= 0 ? s.slice(i + 1) : "";
    }
    return s;
  }

  function sliceToJsonBlock(s: string) {
    const firstBrace = s.indexOf("{");
    const firstBracket = s.indexOf("[");
    const first = [firstBrace, firstBracket].filter(i => i >= 0).sort((a, b) => a - b)[0] ?? -1;
    if (first < 0) return s;
    const last = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
    if (last < first) return s;
    return s.slice(first, last + 1);
  }

  function looksLikeHtml(s: string) {
    return /<!doctype html>|<html[\s>]/i.test(s);
  }

  async function robustParse<T extends ApiResponse>(response: Response, endpointForLogs: string): Promise<T> {
    const contentType = response.headers.get("content-type") || "";
    const raw = stripBOM((await response.text()).trim());
    const cleaned = stripXssiPrefix(raw);

    if (!contentType.includes("application/json") && looksLikeHtml(cleaned)) {
      console.error(`HTML received from ${endpointForLogs}:`, textPreview(cleaned));
      throw new Error(`Non-JSON (HTML) received from ${endpointForLogs}`);
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        try {
          return JSON.parse(sliceToJsonBlock(cleaned)) as T;
        } catch {
          console.error(`Invalid JSON from ${endpointForLogs}:`, textPreview(raw));
          throw new Error(`Invalid JSON response from ${endpointForLogs}`);
        }
      }
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      const t = cleaned.toLowerCase();
      if (t === "true") return true as T;
      if (t === "false") return false as T;
      if (/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned) as T;
      return cleaned as T;
    }
  }

  const commonInit: RequestInit = {
    credentials: "include",
    headers: { Accept: "application/json" },
  };

  const fetchFollowingPosts = async () => {
    if (!currentUser?.id) {
      console.warn("Cannot fetch following posts: currentUser is not loaded");
      return;
    }

    console.debug("Fetching following posts");
    setLoadingFollowing(true);

    try {
      const [followRes, myResharesRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/api/follow/following/${currentUser.id}`, commonInit),
        fetch(`${API_URL}/api/reshares`, commonInit),
        fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, commonInit),
      ]);

      if (!bookmarksRes.ok) throw new Error(`Failed to fetch bookmarks: ${bookmarksRes.status}`);

      const followedUsers: ApiFollow[] = await robustParse<ApiFollow[]>(followRes, "follow");
      const myReshares: ApiReshare[] = myResharesRes.ok
        ? await robustParse<ApiReshare[]>(myResharesRes, "reshares")
        : [];
      const bookmarks: ApiBookmark[] = await robustParse<ApiBookmark[]>(bookmarksRes, "bookmarks");

      const bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));
      const followedIds = followedUsers.map((f: ApiFollow) => f.followedId);

      if (!followedIds.length) {
        setFollowingPosts([]);
        return;
      }

      const allFollowingPosts = await Promise.all(
        followedIds.map(async (userId: number) => {
          try {
            const res = await fetch(`${API_URL}/api/posts?userId=${userId}`, commonInit);
            if (!res.ok) return [];
            return await robustParse<ApiPost[]>(res, `posts?userId=${userId}`);
          } catch (error) {
            console.warn(`Failed to fetch posts for user ${userId}:`, error);
            return [];
          }
        })
      );

      const flattenedPosts: ApiPost[] = allFollowingPosts.flat();
      const uniquePosts: ApiPost[] = Array.from(
        new Map(flattenedPosts.map((post) => [post.id, post])).values()
      ).filter((post: ApiPost) => post.user?.id !== currentUser.id);

      const validPosts = uniquePosts.filter((post: ApiPost) => post.user?.id);

      const formattedPosts = await Promise.all(
        validPosts.map(async (post: ApiPost) => {
          try {
            const [commentsRes, likesCountRes, hasLikedRes, topicsRes] = await Promise.all([
              fetch(`${API_URL}/api/comments/post/${post.id}`, commonInit),
              fetch(`${API_URL}/api/likes/count/${post.id}`, commonInit),
              fetch(`${API_URL}/api/likes/has-liked/${post.id}`, commonInit),
              fetchTopicsForPost(post.id),
            ]);

            let comments: ApiComment[] = [];
            let likeCount = 0;
            let isLiked = false;
            let topics: Topic[] = [];

            try {
              comments = commentsRes.ok
                ? await robustParse<ApiComment[]>(commentsRes, `comments/post/${post.id}`)
                : [];
            } catch (error) {
              console.warn(`Failed to parse comments for post ${post.id}:`, error);
              comments = [];
            }

            try {
              const raw = likesCountRes.ok
                ? await robustParse<number | string | { count: number }>(
                  likesCountRes,
                  `likes/count/${post.id}`
                )
                : 0;
              if (typeof raw === "number") likeCount = raw;
              else if (typeof raw === "string") likeCount = Number(raw) || 0;
              else if (raw && "count" in raw) likeCount = Number(raw.count) || 0;
            } catch (error) {
              console.warn(`Failed to parse like count for post ${post.id}:`, error);
            }

            try {
              const raw = hasLikedRes.ok
                ? await robustParse<boolean | string | { liked: boolean }>(
                  hasLikedRes,
                  `likes/has-liked/${post.id}`
                )
                : false;
              if (typeof raw === "boolean") isLiked = raw;
              else if (typeof raw === "string") isLiked = raw.toLowerCase() === "true";
              else if (raw && "liked" in raw) isLiked = Boolean(raw.liked);
            } catch (error) {
              console.warn(`Failed to parse like status for post ${post.id}:`, error);
            }

            try {
              topics = await topicsRes;
            } catch (error) {
              console.warn(`Failed to fetch topics for post ${post.id}:`, error);
              topics = [];
            }

            const validComments = (comments || []).filter((c: ApiComment) => c.userId);

            const commentsWithUsers = await Promise.all(
              validComments.map(async (comment: ApiComment) => {
                try {
                  const user = await fetchUser(comment.userId, comment.user);
                  return {
                    id: comment.id,
                    postId: comment.postId,
                    authorId: comment.userId,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    username: user.displayName,
                    handle: `@${user.username}`,
                    profilePicture: user.profilePicture,
                  } as CommentData;
                } catch (error) {
                  console.warn(`Failed to process comment ${comment.id}:`, error);
                  return null;
                }
              })
            ).then((cs) => cs.filter((c): c is CommentData => c !== null));

            const postUser = await fetchUser(post.user.id, post.user);
            const isReshared = myReshares.some((r: ApiReshare) => r.postId === post.id);
            const reshareCount = myReshares.filter((r: ApiReshare) => r.postId === post.id).length;

            return {
              id: post.id,
              username: postUser.displayName,
              handle: `@${postUser.username}`,
              profilePicture: postUser.profilePicture,
              time: formatRelativeTime(post.createdAt),
              createdAt: post.createdAt,
              text: post.content,
              image: post.imageUrl,
              isLiked,
              isBookmarked: bookmarkedPostIds.has(post.id),
              isReshared,
              commentCount: validComments.length,
              authorId: post.user.id,
              likeCount,
              reshareCount,
              comments: commentsWithUsers,
              showComments: followingPosts.find((p) => p.id === post.id)?.showComments || false,
              topics,
              isBot: post.isBot,
              botId: post.botId
            };
          } catch (postError) {
            console.error(`Error processing post ${post.id}:`, postError);
            return null;
          }
        })
      );

      const successfulPosts = formattedPosts.filter((p): p is NonNullable<typeof p> => p !== null);

      setFollowingPosts(
        successfulPosts.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      console.error("Error fetching following posts:", err);
      setError("Failed to load posts from followed users.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingFollowing(false);
    }
  };
  const fetchDefaultPreset = async () => {
    try {
      const response = await fetch(`${API_URL}/api/presets/default`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          //console.log("No default preset found - this is normal for new users");
          setDefaultPresetId(null);
          return null;
        } else if (response.status === 500) {
          console.warn("Server error when fetching default preset - likely no default set");
          setDefaultPresetId(null);
          return null;
        }
        throw new Error(`Failed to fetch default preset: ${response.status}`);
      }

      const data: Preset = await response.json();
      setDefaultPresetId(data.id);
      return data;
    } catch (err) {
      console.warn("Error fetching default preset (this is normal if no default is set):", err);
      setDefaultPresetId(null);
      return null;
    }
  };

  const deletePreset = async (presetId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/presets/${presetId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!response.ok) throw new Error(`Failed to delete preset: ${response.status}`);
      setPresets((prev) => prev.filter((p) => p.id !== presetId));
      setRules((prev) => {
        const newRules = { ...prev };
        delete newRules[presetId];
        return newRules;
      });
      if (defaultPresetId === presetId) {
        setDefaultPresetId(null);
      }
      if (selectedPreset === presetId) {
        setSelectedPreset(null);
        setIsViewingPresetFeed(false);
        setPresetPosts([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error deleting preset:", err);
      setError("Failed to delete preset.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  const setDefaultPreset = async (presetId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/presets/${presetId}/default`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to set default preset: ${response.status} - ${errorText}`);
      }

      setDefaultPresetId(presetId);
      setPresets((prev) =>
        prev.map((p) => ({
          ...p,
          defaultPreset: p.id === presetId,
        }))
      );

      setError(null);
    } catch (err) {
      console.error("Error setting default preset:", err);
      setError("Failed to set default preset. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchPresetPosts = async (presetId: number) => {
    if (!currentUser?.id) {
      console.warn("Cannot fetch preset posts: currentUser is not loaded");
      return;
    }
    console.debug(`Fetching posts for preset ${presetId}`);
    setLoadingPresetPosts(true);
    setIsViewingPresetFeed(true);

    try {
      const [postsRes, myResharesRes, bookmarksRes] = await Promise.all([
        fetch(`${API_URL}/api/presets/feed/${presetId}`, commonInit),
        fetch(`${API_URL}/api/reshares`, commonInit),
        fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, commonInit),
      ]);

      if (!postsRes.ok) throw new Error(`Failed to fetch preset posts: ${postsRes.status}`);
      if (!bookmarksRes.ok) throw new Error(`Failed to fetch bookmarks: ${bookmarksRes.status}`);

      const apiPosts: ApiPost[] = await robustParse<ApiPost[]>(postsRes, `presets/feed/${presetId}`);
      const myReshares: ApiReshare[] = myResharesRes.ok
        ? await robustParse<ApiReshare[]>(myResharesRes, "reshares")
        : [];
      const bookmarks: ApiBookmark[] = await robustParse<ApiBookmark[]>(bookmarksRes, "bookmarks");
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));

      const validPosts = apiPosts.filter(post => {
        if (!post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post);
          return false;
        }
        return true;
      });

      const formattedPosts: PostData[] = await Promise.all(
        validPosts.map(async (post: ApiPost) => {
          const [commentsRes, likesCountRes, hasLikedRes, topicsRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, commonInit),
            fetch(`${API_URL}/api/likes/count/${post.id}`, commonInit),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, commonInit),
            fetchTopicsForPost(post.id),
          ]);

          const comments: ApiComment[] = commentsRes.ok
            ? await robustParse<ApiComment[]>(commentsRes, `comments/post/${post.id}`)
            : [];
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
                profilePicture: user.profilePicture,
              };
            })
          );

          let postUser;
          if (post.isBot && post.botId) {
            postUser = await fetchBot(post.botId, post.user); // post.user might have partial bot data
          } else {
            postUser = await fetchUser(post.user.id, post.user);
          }
          const isReshared = myReshares.some((reshare: ApiReshare) => reshare.postId === post.id);
          const reshareCount = myReshares.filter((reshare: ApiReshare) => reshare.postId === post.id).length;

          let isLiked: boolean = false;
          if (hasLikedRes.ok) {
            try {
              const raw = await robustParse<boolean | string | { liked: boolean }>(
                hasLikedRes,
                `likes/has-liked/${post.id}`
              );
              if (typeof raw === "boolean") {
                isLiked = raw;
              } else if (typeof raw === "string") {
                isLiked = raw.toLowerCase() === "true";
              } else if (raw && "liked" in raw) {
                isLiked = Boolean(raw.liked);
              } else {
                console.warn(`Unexpected like status format for post ${post.id}:`, raw);
              }
            } catch (err) {
              console.warn(`Failed to parse like status for post ${post.id}:`, err);
            }
          }

          return {
            id: post.id,
            username: postUser.displayName,
            handle: `@${postUser.username}`,
            profilePicture: postUser.profilePicture,
            time: formatRelativeTime(post.createdAt),
            createdAt: post.createdAt,
            text: post.content,
            image: post.imageUrl,
            isLiked,
            isBookmarked: bookmarkedPostIds.has(post.id),
            isReshared,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await robustParse<number>(likesCountRes, `likes/count/${post.id}`) : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments: false,
            topics: topicsRes,
            isBot: post.isBot,
            botId: post.botId
          };
        })
      );

      setPresetPosts(
        formattedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) {
      console.error(`Error fetching preset posts for preset ${presetId}:`, err);
      setTimeout(() => setError(null), 3000);
      setPresetPosts([]);
    } finally {
      setLoadingPresetPosts(false);
    }
  };

  const fetchTopics = async (): Promise<Topic[]> => {
    try {
      const res = await fetch(`${API_URL}/api/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch topics: ${res.status}`);
      const data: Topic[] = await res.json();
      setTopics(data || []);
      return data || [];
    } catch (err) {
      console.error("Error fetching topics:", err);
      setError("Failed to load topics.");
      setTimeout(() => setError(null), 3000);
      return [];
    }
  };

  const fetchPresets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/presets`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch presets: ${response.status}`);
      }

      const data: Preset[] = await response.json();
      setPresets(data);

      const defaultPreset = data.find((p) => p.defaultPreset);
      if (defaultPreset) {
        setDefaultPresetId(defaultPreset.id);
      } else {
        setDefaultPresetId(null);
      }

    } catch (err) {
      console.error("Error fetching presets:", err);
      setError("Error fetching presets");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRules = async (presetId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/presets/rules/${presetId}`, {
        method: "GET",
        credentials: "include"
      });
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(prev => ({ ...prev, [presetId]: data }));
    } catch (err) {
      console.debug(err);
      setError("Failed to fetch rules for the preset");
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }

  const createPreset = async (defaultPreset: boolean = false) => {
    if (!newPresetName.trim()) {
      setError("Preset name is required");
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/presets`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({ name: newPresetName, defaultPreset }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create preset: ${response.status} ${errorText}`);
      }
      const data: Preset = await response.json();
      setPresets((prev) => [...prev, data]);
      if (data.defaultPreset) {
        setDefaultPresetId(data.id);
        await setDefaultPreset(data.id);
      }
      setNewPresetName("");
      setError("");
    } catch (err) {
      console.error("Error couldn't create your preset.", err);
      setError("Couldn't create your preset.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const addRule = async (presetId: number) => {
    if (!newRule.topicId && !newRule.sourceType && !newRule.specificUserId) {
      setError('At least one filter condition (topic, source type, or specific user) is required');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    if (newRule.percentage !== undefined && (newRule.percentage < 1 || newRule.percentage > 100)) {
      setError('Percentage must be between 1 and 100');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/presets/rules`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presetId,
          topicId: newRule.topicId || null,
          sourceType: newRule.sourceType || null,
          specificUserId: newRule.specificUserId || null,
          percentage: newRule.percentage || null
        }),
      });

      if (!response.ok) throw new Error('Failed to add rule');

      const data = await response.json();
      setRules(prev => ({
        ...prev,
        [presetId]: [...(prev[presetId] || []), data],
      }));

      setNewRule({
        topicId: undefined,
        sourceType: undefined,
        specificUserId: undefined,
        percentage: undefined
      });
      setError('');
    } catch (err) {
      console.debug(err);
      setError("Rule percentage exceeded .");
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }
  const deleteRule = async (presetId: number, ruleId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/presets/rules/${ruleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete rule');

      setRules(prev => ({
        ...prev,
        [presetId]: (prev[presetId] || []).filter(rule => rule.id !== ruleId)
      }));
    } catch (err) {
      console.debug(err);
      setError("Couldn't delete rule");
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }

  const formatRule = (rule: Rule) => {
    const parts = [];

    if (rule.topicId) {
      const topic = topics.find(t => t.id === rule.topicId);
      parts.push(`Topic : ${topic?.name || `${rule.topicId}`}`);
    }

    if (rule.sourceType) {
      parts.push(`Source : ${rule.sourceType}`);
    }

    if (rule.specificUserId) {
      const user = allUsers.find(u => u.id === rule.specificUserId);
      parts.push(`User ${user?.displayName || user?.username || `${rule.specificUserId}`}`);
    }

    if (rule.percentage) {
      parts.push(`${rule.percentage}%`);
    }

    return parts.join(' \u00A0\u00A0|\u00A0\u00A0 '); // Using non-breaking spaces
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
      setNewTopicName("");
      setIsTopicModalOpen(false);
    } catch (err) {
      console.error("Error creating topic:", err);
      setError("Failed to create topic.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePost = async () => {
    if (!postText.trim() || !currentUser) {
      setError("Please log in to post.");
      return;
    }
    if (useAIGeneration && !imagePrompt.trim()) {
      setError("Image prompt cannot be empty when generating an AI image.");
      return;
    }

    const tempPostId = generateTempId();
    const createdAt = new Date().toISOString();
    const isGeneratingImage = useAIGeneration;

    const tempPost: PostData = {
      id: tempPostId,
      username: currentUser.displayName,
      handle: `@${currentUser.username}`,
      profilePicture: currentUser.profilePicture,
      time: formatRelativeTime(createdAt),
      createdAt,
      text: postText,
      image: isGeneratingImage ? "Generating AI image..." : (imageFile ? URL.createObjectURL(imageFile) : undefined),
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
      botId: botId,
      isBot: isBot
    };

    setPosts([tempPost, ...posts]);
    setIsPostModalOpen(false);

    if (isGeneratingImage) {
      setLoadingImages(prev => new Set(prev).add(tempPostId));
    }

    setPostText("");
    setisBot(false);
    setBotId(0);
    const selectedTopics = selectedTopicIds.slice();
    setSelectedTopicIds([]);
    const tempImageFile = imageFile;
    setImageFile(null);
    const tempImagePrompt = imagePrompt;
    setImagePrompt("");
    setUseAIGeneration(false);
    setImageWidth(384);
    setImageHeight(384);
    setImageSteps(8);
    setImageModel("black-forest-labs/FLUX.1-schnell");

    try {
      let res: Response;
      if (useAIGeneration) {
        const postData = {
          content: postText,
          isBot: false,
          imagePrompt,
          imageWidth,
          imageHeight,
          imageSteps,
          imageModel,
        };
        res = await fetch(`${API_URL}/api/posts`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      } else {
        const formData = new FormData();
        formData.append("post", JSON.stringify({ content: postText }));
        if (imageFile) {
          formData.append("media", imageFile);
        }
        res = await fetch(`${API_URL}/api/posts`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      }

      if (!res.ok) {
        try {
          const errorData = await res.json();
          if (errorData.error === "ContentRejected") {
            setErrorMessage(errorData.message || "Your post has been blocked.");
            setErrorData(errorData);
            setIsErrorDialogOpen(true);

            // Revert temp post immediately
            if (isGeneratingImage) {
              setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(tempPostId);
                return newSet;
              });
            }
            setPosts((prev) => prev.filter((p) => p.id !== tempPostId));
            setFollowingPosts((prev) => prev.filter((p) => p.id !== tempPostId));
            setSelectedTopicIds(selectedTopics);
            setPostText(postText);
            setisBot(isBot);
            setBotId(botId);
            setImageFile(tempImageFile);
            setImagePrompt(tempImagePrompt);
            setUseAIGeneration(!!tempImagePrompt);

            return; // Exit early, don't proceed with success flow
          }
        } catch (parseErr) {
          console.warn("Failed to parse error response as JSON:", parseErr);
        }
        throw new Error(`Failed to create post: ${res.status} ${await res.text()}`);
      }

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
          setTimeout(() => setError(null), 3000);
        }
      }

      const postTopics = await fetchTopicsForPost(newPost.id);

      const formattedPost: PostData = {
        id: newPost.id,
        username: currentUser.displayName,
        handle: `@${currentUser.username}`,
        profilePicture: currentUser.profilePicture,
        time: formatRelativeTime(newPost.createdAt),
        createdAt: newPost.createdAt,
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
        botId: newPost.botId,
        isBot: newPost.isBot
      };

      if (isGeneratingImage) {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempPostId);
          return newSet;
        });
      }

      setPosts((prev) =>
        [
          formattedPost,
          ...prev.filter((p) => p.id !== tempPostId),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post. Reverting...");
      setTimeout(() => setError(null), 3000);

      if (isGeneratingImage) {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempPostId);
          return newSet;
        });
      }

      setPosts((prev) => prev.filter((p) => p.id !== tempPostId));
      setFollowingPosts((prev) => prev.filter((p) => p.id !== tempPostId));
      setSelectedTopicIds(selectedTopics);
      setPostText(postText);
      setisBot(isBot);
      setBotId(botId);
      setImageFile(tempImageFile);
      setImagePrompt(tempImagePrompt);
      setUseAIGeneration(!!tempImagePrompt);
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

    try {
      const res = await fetch(`${API_URL}/api/posts/del/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete post");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Reverting...");
      setTimeout(() => setError(null), 3000);
      if (deletedPost) {
        setPosts((prev) => [...prev, deletedPost].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
      if (deletedFollowingPost) {
        setFollowingPosts((prev) =>
          [...prev, deletedFollowingPost].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      }
    }
  };
  const handleLike = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to like/unlike posts.");
      return;
    }

    const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
    if (!post) {
      setError("Post not found.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const originalIsLiked = post.isLiked;
    const originalLikeCount = post.likeCount;

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
    setFollowingPosts((prevPosts) => updatePostInArray(prevPosts));

    try {
      const method = originalIsLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to ${originalIsLiked ? "unlike" : "like"} post`);

      const [hasLikedRes, likeCountRes] = await Promise.all([
        fetch(`${API_URL}/api/likes/has-liked/${postId}`, { credentials: "include" }),
        fetch(`${API_URL}/api/likes/count/${postId}`, { credentials: "include" }),
      ]);

      if (!hasLikedRes.ok || !likeCountRes.ok) {
        throw new Error("Failed to fetch updated like status or count");
      }

      const isLiked = await hasLikedRes.json();
      const likeCount = await likeCountRes.json();

      const updatePostWithConfirmedValues = (postsArray: PostData[]) =>
        postsArray.map((p) =>
          p.id === postId ? { ...p, isLiked, likeCount } : p
        );

      setPosts((prevPosts) => updatePostWithConfirmedValues(prevPosts));
      setFollowingPosts((prevPosts) => updatePostWithConfirmedValues(prevPosts));
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(`Failed to ${originalIsLiked ? "unlike" : "like"} post. Reverting...`);
      setTimeout(() => setError(null), 3000);

      const revertPostInArray = (postsArray: PostData[]) =>
        postsArray.map((p) =>
          p.id === postId ? { ...p, isLiked: originalIsLiked, likeCount: originalLikeCount } : p
        );

      setPosts((prevPosts) => revertPostInArray(prevPosts));
      setFollowingPosts((prevPosts) => revertPostInArray(prevPosts));
    }
  };

  const handleReshare = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to reshare posts.");
      return;
    }

    const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
    if (!post) {
      setError("Post not found.");
      setTimeout(() => setError(null), 3000);
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
      setTimeout(() => setError(null), 3000);
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
      profilePicture: currentUser.profilePicture
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
        profilePicture: currentUser.profilePicture,
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
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Reverting...");
      setTimeout(() => setError(null), 3000);
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
    }
  };

  const handleBookmark = async (postId: number) => {
    if (!currentUser) {
      setError("Please log in to bookmark/unbookmark posts.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const post = posts.find((p) => p.id === postId) || followingPosts.find((p) => p.id === postId);
    if (!post) {
      setError("Post not found.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const originalIsBookmarked = post.isBookmarked;

    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );
    setFollowingPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );

    try {
      const method = originalIsBookmarked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/bookmarks/${currentUser.id}/${postId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to ${originalIsBookmarked ? "unbookmark" : "bookmark"} post: ${errorText}`);
      }

      const bookmarksRes = await fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!bookmarksRes.ok) throw new Error("Failed to fetch updated bookmarks");
      const bookmarks: ApiBookmark[] = await bookmarksRes.json();
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));
      const confirmedIsBookmarked = bookmarkedPostIds.has(postId);

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: confirmedIsBookmarked } : p
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: confirmedIsBookmarked } : p
        )
      );
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setError(`Failed to ${originalIsBookmarked ? "unbookmark" : "bookmark"} post. Reverting...`);
      setTimeout(() => setError(null), 3000);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: originalIsBookmarked } : p
        )
      );
      setFollowingPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, isBookmarked: originalIsBookmarked } : p
        )
      );
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "GET",
        credentials: "include",
      });
      setCurrentUser(null);
      setPosts([]);
      setFollowingPosts([]);
      navigate("/");
      localStorage.clear();
    } catch (err) {
      console.error("Logout failed", err);
      setError("Failed to log out. Please try again.");
      setTimeout(() => setError(null), 3000);
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
  };

  const renderSkeletonPosts = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <div
        key={index}
        className="b-4 border border-rose-gold-accent-border dark:border-slate-200 rounded-lg p-4 animate-pulse space-y-4"
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
        {post.botId || post.isBot ? (
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
            onProfileClick={() => navigate(`/profile/${post.authorId}`)}
            showComments={post.showComments}
            comments={post.comments}
            isUserLoaded={!!currentUser}
            currentUser={currentUser}
            authorId={post.authorId}
            topics={post.topics || []}
          />
        ) : (
          <Post
            username={post.username}
            handle={post.handle}
            profilePicture={post.profilePicture}
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
            onProfileClick={() => navigate(`/profile/${post.authorId}`)}
            showComments={post.showComments || false}
            comments={post.comments || []}
            isUserLoaded={!!currentUser}
            currentUser={currentUser}
            authorId={post.authorId}
            topics={post.topics || []}
            isImageLoading={loadingImages.has(post.id)}
          />
        )}
      </div>
    ));
  };

  useEffect(() => {
    fetchPresets();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const user = await fetchCurrentUser();
      if (user) {
        await fetchPresets();
        await Promise.all([
          fetchTopics(),
          fetchNotifications(user.id),
          (async () => {
            try {
              await fetchDefaultPreset();
            } catch (error) {
              console.warn("Failed to fetch default preset, continuing without it:", error);
            }
          })(),
        ]);
      }
      setLoading(false);
    };
    init();
  }, []);
  useEffect(() => {
    if (activeTab === "for You") {
      fetchPaginatedPosts(0);
    } else if (activeTab === "Following") {
      fetchFollowingPosts();
    }
  }, [activeTab, currentUser]);




  useEffect(() => {
    if (currentUser?.id && activeTab === "Following" && followingPosts.length === 0) {
      fetchFollowingPosts();
    }
    if (selectedPreset) {
      fetchRules(selectedPreset);
    }
  }, [currentUser, activeTab, selectedPreset]);

  useEffect(() => {
      if (seconds > 0) {
        const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        navigate("/login", { replace: true });
      }
    }, [seconds, navigate]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-blue-950 text-black dark:text-white p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
            Oops! Looks like you are not logged in.
          </h1>
          <p className="text-lg">
            Redirecting to login in {seconds} second{seconds !== 1 ? "s" : ""}...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="future-feed:bg-black flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 text-white mx-auto bg-white">
      <aside className="lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
        <div className="drop-shadow-xl border border-2 mt-8 w-45 h-1 ml-6.5 bg-white ">

        </div>
        <div className="ml-4 mt-8 flex flex-col hidden lg:flex">
          <Button
            onClick={() => setIsTopicModalOpen(true)}
            className="w-[200px] bg-white future-feed:text-lime future-feed:border-lime"
            variant={"secondary"}
          >
            Create Topic
          </Button>
          <Button
            onClick={() => setIsViewTopicsModalOpen(true)}
            className="w-[200px] bg-white mt-3 future-feed:text-lime future-feed:border-lime"
            variant={"secondary"}
          >
            View Topics
          </Button>
        </div>
      </aside>

      <button

        className="lg:hidden -translate-y-[15px] fixed top-5 right-5 bg-blue-500 dark:bg-white dark:text-indigo-950 future-feed:border-2 future-feed:bg-black dark:hover:text-gray-400 future-feed:bg-lime  text-white p-3 rounded-full z-20 shadow-lg future-feed:border-lime future-feed:text-white"

        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/90 z-10 flex flex-col items-center justify-center mt-[-60px]">
          <div className="w-full max-w-xs p-4">
            <button
              onClick={handleLogout}
              className="mb-2 w-[255px] ml-4 mb-4 py-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-white hover:text-blue-500 dark:hover:text-gray-400 transition-colors future-feed:bg-lime dark:bg-indigo-800"
            >
              Logout
            </button>
            <div className="p-4 border-t dark:border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsTopicModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-white hover:text-blue-500  transition-colors dark:hover:text-gray-400  future-feed:bg-lime dark:bg-indigo-800"
              >
                Create Topic
              </button>
              <button
                onClick={() => {
                  setIsViewTopicsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-white hover:text-blue-500  transition-colors mt-3 future-feed:bg-lime dark:hover:text-gray-400 dark:bg-indigo-800"
              >
                View Topics
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`flex flex-1 flex-col lg:flex-row max-w-full lg:max-w-[calc(100%-295px)] ${isPostModalOpen || isTopicModalOpen || isViewTopicsModalOpen ? "backdrop-blur-sm" : ""}`}
      >
        <main className="mt-1 flex-1 p-4 lg:pt-4 p-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto">
          {loading ? (
            renderSkeletonPosts()
          ) : !currentUser ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg dark:text-white">Please log in to view posts.</p>
            </div>
          ) : (
            <>
              <div
                className={`future-feed:bg-card future-feed:text-lime future-feed:border-lime flex justify-center items-center px-4 py-3 sticky top-0 dark:bg-indigo-950 border bg-white dark:border-slate-200 rounded-2xl z-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors drop-shadow-xl ${isMobileMenuOpen ? "lg:flex hidden" : "flex"}`}
                onClick={activeTab === "Presets" ? () => setIsCreatePresetModalOpen(true) : () => setIsPostModalOpen(true)}
              >
                <h1 className="future-feed:text-lime text-xl dark:text-slate-200 font-bold text-black">
                  {activeTab === "Presets" ? "Create a new preset" : "What's on your mind?"}
                </h1>
              </div>
              <Tabs defaultValue="Following" className={`w-full p-0 ${isMobileMenuOpen ? "hidden" : ""}`} onValueChange={setActiveTab}>
                <TabsList className="w-full flex justify-around rounded-2xl border k sticky top-[68px] z-10 overflow-x-auto">
                  {["for You", "Following", "Presets"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="flex-1 min-w-[100px] rounded-2xl text-sm lg:text-base"
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
                      <p className="text-lg future-feed:text-lime  dark:text-white">No posts available.</p>
                      <Button
                        className="mt-4 bg-black-500 hover:bg-white hover:text-blue-500  text-white"
                        onClick={() => fetchPaginatedPosts(0)}
                      >
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    renderPosts(posts)
                  )}
                </TabsContent>
                <TabsContent value="Following">
                  {loadingFollowing ? (
                    renderSkeletonPosts()
                  ) : followingPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">

                      <div className="flex flex-col justify-center items-center mt-10 gap-12">
                        <SmilePlus size={50} color="#3B82F6" />
                        <p className="dark:text-white text-xl future-feed:text-lime text-blue-500">No posts from followed users.</p>

                      </div>
                      <div className="flex gap-20 mt-13">
                        <Button
                          className="bg-gray-200 text-blue-500 hover:bg-white hover:text-blue-500"
                          onClick={() => navigate("/explore")}
                          size={'lg'}
                        >
                          Follow
                        </Button>
                        <Button
                          className="bg-gray-200 text-blue-500 hover:bg-white hover:text-blue-500"
                          onClick={() => fetchFollowingPosts()}
                          size={'lg'}
                        >
                          Refresh
                        </Button>
                      </div>

                    </div>
                  ) : (
                    <div className="mt-5">
                      {renderPosts(followingPosts)}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="Presets">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-2">
                      {error}
                    </div>
                  )}
                  {!defaultPresetId && presets.length === 0 && !isLoading && (
                    <div className="text-center p-8">
                      <p className="text-lg text-gray-500 mb-4">No presets found</p>
                      <p className="text-sm text-gray-400">Create your first preset to customize your feed!</p>
                    </div>
                  )}
                  {isViewingPresetFeed ? (
                    <>
                      <div className="flex items-center gap-2 p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsViewingPresetFeed(false);
                            setPresetPosts([]);
                            setSelectedPreset(null);
                          }}
                          className="bg-blue-500 text-white hover:bg-white hover:text-blue-500"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back to Presets
                        </Button>
                      </div>
                      {loadingPresetPosts ? (
                        renderSkeletonPosts()
                      ) : presetPosts.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <EyeOff className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No Posts available.</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            No posts available yet for this preset. Please add rules if rules are empty.
                          </p>
                        </div>
                      ) : (
                        renderPosts(presetPosts)
                      )}
                    </>
                  ) : isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {presets.length > 0 && (
                        <div className="mt-6 space-y-4">
                          {presets.map((preset) => (
                            <Card key={preset.id} className="w-full dark:bg-indigo-950 dark:border-slate-200 dark:text-white">
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-2xl font-bold dark:text-white">
                                    <Input
                                      value={preset.name}
                                      onChange={(e) => {
                                        setPresets((prev) =>
                                          prev.map((p) => (p.id === preset.id ? { ...p, name: e.target.value } : p))
                                        );
                                      }}
                                      className="border-0 bg-transparent text-lg font-bold dark:text-white text-black"
                                    />
                                  </CardTitle>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedPreset(selectedPreset === preset.id ? null : preset.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      {selectedPreset === preset.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-600">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedPreset(preset.id);
                                            fetchPresetPosts(preset.id);
                                          }}
                                        >
                                          <ChartNoAxesGantt className="mr-2 h-4 w-4 text-lime-400" />
                                          View Feed
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => setDefaultPreset(preset.id)}
                                          disabled={preset.defaultPreset}
                                        >
                                          {preset.defaultPreset ? "Default Preset" : "Set as Default"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <DropdownMenuItem
                                              onSelect={(e) => e.preventDefault()}
                                              className="text-red-500 focus:text-red-700"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                                              Delete Preset
                                            </DropdownMenuItem>
                                          </DialogTrigger>
                                          <DialogContent className="dark:bg-gray-800 dark:border-gray-600">
                                            <DialogHeader>
                                              <DialogTitle className="dark:text-white">Delete Preset</DialogTitle>
                                              <DialogDescription className="dark:text-gray-400">
                                                Are you sure you want to delete "{preset.name}" Preset ? This action cannot be undone.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                              <Button variant="outline" type="button">Cancel</Button>
                                              <Button
                                                variant="destructive"
                                                onClick={() => {
                                                  deletePreset(preset.id);
                                                }}
                                              >
                                                Delete
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="">
                                {selectedPreset === preset.id && (
                                  <div className="space-y-4">
                                    <div className="space-y-3">
                                      <div className="flex flex-col space-y-2">
                                        <select
                                          value={newRule.topicId || ""}
                                          onChange={(e) => setNewRule({ ...newRule, topicId: e.target.value ? Number(e.target.value) : undefined })}
                                          className="dark:bg-gray-800 dark:border-gray-600 dark:text-white flex h-8 w-full rounded-xl border px-3 text-sm bg-gray-300"
                                        >
                                          <option value="">Select Topic</option>
                                          {topics.map((topic) => (
                                            <option key={topic.id} value={topic.id}>
                                              {topic.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex flex-col space-y-2">
                                        <select
                                          value={newRule.sourceType || ""}
                                          onChange={(e) => setNewRule({ ...newRule, sourceType: e.target.value as 'user' | 'bot' | undefined })}
                                          className="dark:bg-gray-800 dark:border-gray-600 dark:text-white flex w-full rounded-xl border px-3 text-sm bg-gray-300 h-8"
                                        >
                                          <option value="">Select Source</option>
                                          <option value="user">User Posts</option>
                                          <option value="bot">Bot Posts</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col space-y-2">
                                        <div className="relative">
                                          <Input
                                            placeholder="Search users..."
                                            value={userSearchQuery}
                                            onChange={(e) => {
                                              setUserSearchQuery(e.target.value);
                                              setIsUserSearchOpen(true);
                                            }}
                                            onFocus={() => setIsUserSearchOpen(true)}
                                            className="dark:bg-gray-800 dark:border-gray-600 dark:text-white pr-10 bg-gray-300 text-black rounded-xl h-8"
                                          />
                                          {newRule.specificUserId && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setNewRule({ ...newRule, specificUserId: undefined });
                                                setUserSearchQuery("");
                                              }}
                                              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                            >
                                              <FaTimes size={12} className="text-red-500" />
                                            </Button>
                                          )}
                                          {isUserSearchOpen && filteredUsers.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                              {filteredUsers.map((user) => (
                                                <div
                                                  key={user.id}
                                                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                                                  onClick={() => {
                                                    setNewRule({ ...newRule, specificUserId: user.id });
                                                    setUserSearchQuery(`${user.displayName} (@${user.username})`);
                                                    setIsUserSearchOpen(false);
                                                  }}
                                                >
                                                  {user.profilePicture && (
                                                    <img src={user.profilePicture} alt={user.displayName} className="w-6 h-6 rounded-full" />
                                                  )}
                                                  <div>
                                                    <div className="text-sm font-medium dark:text-white">{user.displayName}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          placeholder="Percentage (1-100)%"
                                          value={newRule.percentage || ""}
                                          onChange={(e) => setNewRule({ ...newRule, percentage: e.target.value ? Number(e.target.value) : undefined })}
                                          className="flex-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-300 rounded-xl"
                                        />

                                      </div>
                                      <Button
                                        className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-xl h-8"
                                        onClick={() => addRule(preset.id)}
                                        disabled={!newRule.topicId && !newRule.sourceType && !newRule.specificUserId}
                                      >
                                        Add Rule
                                      </Button>
                                    </div>
                                    {rules[preset.id]?.length > 0 ? (
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium dark:text-white">Rules</h4>
                                        {rules[preset.id].map((rule) => (
                                          <div key={rule.id} className="flex items-center justify-between border rounded-xl bg-blue-500 dark:bg-gray-700 dark:border-gray-600">
                                            <div className="flex items-center space-x-2 px-3">
                                              <Filter className="h-4 w-4 text-white" />
                                              <span className="text-sm dark:text-white text-white">{formatRule(rule)}</span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteRule(preset.id, rule.id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <FaTimes size={14} />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <Filter className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No rules added yet.</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                          Add rules to customize your feed content
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {isCreatePresetModalOpen && (
                    <animated.div
                      style={createPresetModalProps}
                      className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 p-4"
                    >
                      <div className="bg-white future-feed:bg-black future-feed:border-lime dark:bg-indigo-950 rounded-2xl p-6 w-full max-w-md  border-2 dark:border-slate-200 flex flex-col relative">
                        <button
                          onClick={() => {
                            setIsCreatePresetModalOpen(false);
                            setNewPresetName("");
                          }}
                          className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
                          title="Close modal"
                        >
                          <FaTimes className="w-6 h-6" />
                        </button>
                        <div className="text-center mb-5">
                          <h2 className="text-xl font-bold future-feed:text-lime text-blue-500 dark:text-white">Create New Preset</h2>
                        </div>
                        <div className="flex flex space-x-4">
                          <Input
                            placeholder="Preset name (e.g., Tech & Bots)"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            className="dark:bg-blue-950 dark:text-white dark:border-slate-200"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={() => {
                                createPreset(false);
                                setIsCreatePresetModalOpen(false);
                              }}
                              className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 rounded-full"
                              disabled={!newPresetName.trim() || isLoading}
                            >
                              {isLoading ? "Creating..." : "Create"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </animated.div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

        </main>
        <aside className="w-full lg:w-[350px] lg:sticky  lg:top-0 lg:h-screen  hidden lg:block ">
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
            <WhatsHappening />

          </div>
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
            {/*  */}
            <WhoToFollow />
          </div>

        </aside>
      </div>
      {isPostModalOpen && (
        <animated.div
          style={postModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 p-4"
        >
          <div className="bg-white future-feed:bg-black future-feed:border-lime dark:bg-indigo-950 rounded-2xl p-6 w-full max-w-2xl min-h-[500px] border-2 dark:border-slate-200 flex flex-col relative">
            <button
              onClick={() => {
                setIsPostModalOpen(false);
                setPostText("");
                setBotId(0);
                setisBot(false);
                setSelectedTopicIds([]);
                setImageFile(null);
                setUseAIGeneration(false);
                setImagePrompt("");
                setImageWidth(384);
                setImageHeight(384);
              }}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
              title="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-5 future-feed:text-lime text-blue-500 dark:text-white">Share your thoughts</h2>
            </div>
            <div className="flex flex-col flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full mb-4 text-gray-900 dark:bg-blue-950 dark:text-white dark:border-slate-200 flex-1 future-feed:text-white resize-none"
                rows={8}
              />
              <div className="mb-4">
                <select
                  multiple
                  value={selectedTopicIds.map(String)}
                  onChange={(e) =>
                    setSelectedTopicIds(Array.from(e.target.selectedOptions, (option) => Number(option.value)))
                  }
                  className="future-feed:border-lime dark:bg-blue-950 dark:text-white dark:border-slate-200 border-2 rounded-md p-2 w-full future-feed:text-lime text-blue-500 h-20"
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id} className="text-center py-1 text-sm">
                      {topic.name}
                    </option>
                  ))}
                </select>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Hold Ctrl/Cmd to select multiple topics</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-around mb-2">
                  <Button
                    variant={useAIGeneration ? "outline" : "default"}
                    onClick={() => {
                      setUseAIGeneration(false);
                      setImagePrompt("");
                      setImageFile(null);
                    }}
                    className="w-40 dark:text-black text-black rounded-full"
                  >
                    Upload Image
                  </Button>
                  <Button
                    variant={useAIGeneration ? "default" : "outline"}
                    onClick={() => {
                      setUseAIGeneration(true);
                      setImageFile(null);
                    }}
                    className="w-40 dark:text-black text-black rounded rounded-full"
                  >
                    Generate AI Image
                  </Button>
                </div>
                {useAIGeneration ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Please enter your prompt here "
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full dark:bg-blue-950 dark:text-white dark:border-slate-200 rounded rounded-full mt-5 future-feed:text-white"
                    />
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      className="dark:text-white text-black dark:border-slate-200 flex items-center space-x-1 border-2 dark:border-slate-200 dark:hover:border-white rounded rounded-full w-41 h-9 border-2 border-blue-500 mt-2 ml-18"
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
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handlePost}
                  className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 rounded rounded-full"
                  disabled={!postText.trim() || !currentUser || (useAIGeneration && !imagePrompt.trim())}
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
          <div className="bg-white future-feed:bg-black future-feed:border-lime dark:bg-blue-950 rounded-2xl p-6 w-full max-w-md border-2 dark:border-slate-200 flex flex-col relative">
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
            <h2 className="text-xl font-bold mb-4 future-feed:text-lime  text-blue-500 dark:text-white">Create a Topic</h2>
            <div className="flex flex-col">
              <Input
                placeholder="Topic name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                className="mb-4 dark:bg-blue-950 dark:text-white dark:border-slate-200"
              />
              <Button
                onClick={createTopic}
                className="bg-blue-500 text-white hover:bg-white hover:text-blue-500"
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
          <div className="bg-white dark:bg-blue-950 rounded-2xl p-6 w-full max-w-md border-2 dark:border-slate-200 flex flex-col relative">
            <button
              onClick={() => setIsViewTopicsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
              title="Close modal"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-500 dark:text-white future-feed:text-black">All Topics</h2>
            <div className="flex flex-col">
              {topics.length === 0 ? (
                <p className="text-sm text-lime dark:text-gray-400 future-feed:text-gray">No topics available.</p>
              ) : (
                <ul className="list-disc pl-5 max-h-[300px] overflow-y-auto">
                  {topics.map((topic) => (
                    <li key={topic.id} className="text-sm text-blue-500 dark:text-white mb-2 future-feed:text-black">
                      {topic.name}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                onClick={() => setIsViewTopicsModalOpen(false)}
                className="mt-4 bg-blue-500 text-white hover:bg-white hover:text-blue-500 future-feed:border-lime-500"
              >
                Close
              </Button>
            </div>
          </div>
        </animated.div>
      )}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="dark:bg-gray-800  bg-red-400 border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center dark:text-white text-white">Post Blocked</DialogTitle>
            <DialogDescription className="text-white">
              {errorMessage}
              {errorData && errorData.labels && errorData.labels.length > 0 && (
                <div className="mt-2 text-sm text-black">
                  Labels: {errorData.labels.join(', ')}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
            className="text-red-500 bg-white"
              variant="outline"
              onClick={() => {
                setIsErrorDialogOpen(false);
                setErrorMessage('');
                setErrorData(null);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default HomePage;