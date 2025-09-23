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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Percent } from 'lucide-react';
import { useNotifications,type Notification} from "@/context/NotificationContext";

interface Preset {
  id: number;
  userId: number;
  name: string;
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
}

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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { setNotifications } = useNotifications();

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

  const fetchUser = async (userId: number, postUser?: PostUser) => {
    if (postUser && postUser.id === userId && postUser.username && postUser.displayName) {
      const validUser = {
        username: postUser.username && typeof postUser.username === "string" ? postUser.username : `unknown${userId}`,
        displayName: postUser.displayName && typeof postUser.displayName === "string" ? postUser.displayName : `Unknown User ${userId}`,
        profilePicture: postUser.profilePicture,
      };
      return validUser;
    }

    if (currentUser && userId === currentUser.id) {
      const user = {
        username: currentUser.username,
        displayName: currentUser.displayName,
        profilePicture: currentUser.profilePicture,
      };
      console.debug(`Using currentUser for user ${userId}:`, user);
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
      setLoadingUsers(true);
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
    } finally {
      setLoadingUsers(false);
    }
  };

  //modified fetch topics for posts
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

  // Scroll handler
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

  // added fetchPaginated
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

          const existingPost = posts.find(p => p.id === post.id);
          const showComments = existingPost ? existingPost.showComments : false;

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
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount,
            comments: commentsWithUsers,
            showComments,
            topics: topicsRes,
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

  /**
   * Robustly parse a Response that *should* be JSON, but may:
   *  - include BOM/XSSI/log noise,
   *  - return primitives (true/false/5),
   *  - be mislabeled (no content-type).
   */
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

      if (!followRes.ok) throw new Error("Failed to fetch followed users");
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
        credentials: "include"
      });
      if (!response.ok) throw new Error('Failed to fetch Presets');
      const data = await response.json();
      setPresets(data);
    } catch (err) {
      setError("Error fetching presets");
      console.error("Error fetching presets:", err);
    } finally {
      setIsLoading(false);
    }
  }

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
      setError("Failed to fetch rules for the preset");
      console.log("Failed to fetch rules for the preset", err);
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }

  const createPreset = async () => {
    if (!newPresetName.trim()) {
      setError('Preset name is required');
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/presets`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newPresetName })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create preset: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setPresets(prev => [...prev, data]);
      setNewPresetName('');
      setError('');

    } catch (err) {
      console.log("Error couldn't create your preset.", err);
      setError("Couldn't create your preset.")
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }

  const addRule = async (presetId: number) => {
    // Validate that at least one filter condition is provided
    if (!newRule.topicId && !newRule.sourceType && !newRule.specificUserId) {
      setError('At least one filter condition (topic, source type, or specific user) is required');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    // Validate percentage if provided
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

      // Reset form
      setNewRule({
        topicId: undefined,
        sourceType: undefined,
        specificUserId: undefined,
        percentage: undefined
      });
      setError('');
    } catch (err) {
      setError("Couldn't add rule");
      console.log("Couldn't add rule", err);
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
      setError("Couldn't delete rule");
      console.log("Couldn't delete rule", err);
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  }

  // Helper function to format rule for display
  const formatRule = (rule: Rule) => {
    const parts = [];

    if (rule.topicId) {
      const topic = topics.find(t => t.id === rule.topicId);
      parts.push(`Topic: ${topic?.name || `ID ${rule.topicId}`}`);
    }

    if (rule.sourceType) {
      parts.push(`Source: ${rule.sourceType}`);
    }

    if (rule.specificUserId) {
      const user = allUsers.find(u => u.id === rule.specificUserId);
      parts.push(`User: ${user?.displayName || `ID ${rule.specificUserId}`}`);
    }

    if (rule.percentage) {
      parts.push(`${rule.percentage}%`);
    }

    return parts.join(' | ');
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

    const tempPostId = generateTempId();
    const createdAt = new Date().toISOString();
    const tempPost: PostData = {
      id: tempPostId,
      username: currentUser.displayName,
      handle: `@${currentUser.username}`,
      profilePicture: currentUser.profilePicture,
      time: formatRelativeTime(createdAt),
      createdAt,
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
      };

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
      setPosts((prev) => prev.filter((p) => p.id !== tempPostId));
      setFollowingPosts((prev) => prev.filter((p) => p.id !== tempPostId));
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
  const fetchNotifications = async (userId: number) => {
  try {
    const response = await fetch(`${API_URL}/api/notifications?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setError("Unauthorized. Please log in again.");
        return;
      }
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const data: Notification[] = await response.json();
    setNotifications(data); // Store in NotificationContext
  } catch (err) {
    console.error("Error fetching notifications:", err);
    setError("Failed to load notifications.");
    setTimeout(() => setError(null), 3000);
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

    // Optimistic update
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

      // Fetch updated bookmark status to confirm
      const bookmarksRes = await fetch(`${API_URL}/api/bookmarks/${currentUser.id}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!bookmarksRes.ok) throw new Error("Failed to fetch updated bookmarks");
      const bookmarks: ApiBookmark[] = await bookmarksRes.json();
      const bookmarkedPostIds = new Set(bookmarks.map((bookmark) => bookmark.postId));
      const confirmedIsBookmarked = bookmarkedPostIds.has(postId);

      // Update both posts and followingPosts with confirmed bookmark status
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
      // Revert optimistic update
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
        className="mt-4 b-4 border border-rose-gold-accent-border dark:border-slate-200 rounded-lg p-4 animate-pulse space-y-4"
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
        />
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
        await Promise.all([
          fetchTopics(),
          fetchNotifications(user.id),
        ]);
      }
      setLoading(false);
    };
    init();
  }, []);
  useEffect(() => {
    if (!currentUser) return;

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

  return (
    <div className="future-feed:bg-black flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 text-white mx-auto bg-gray-200">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />

        <div className="p-4 mt-6 border-t dark:border-slate-200 border-blue-500 future-feed:border-lime  flex flex-col gap-2 hidden lg:flex">
          <Button
            onClick={() => setIsTopicModalOpen(true)}
            className="w-[200px] future-feed:text-lime future-feed:border-lime"
            variant={"secondary"}
          >
            Create Topic
          </Button>
          <Button
            onClick={() => setIsViewTopicsModalOpen(true)}
            className="w-[200px] mt-3 future-feed:text-lime  future-feed:border-lime "
            variant={"secondary"}
          >
            View Topics
          </Button>
        </div>
      </aside>

      <button
        className="lg:hidden fixed top-5 right-5 bg-blue-500 text-white p-3 rounded-full z-20 shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/90 z-10 flex flex-col items-center justify-center mt-[-60px]">
          <div className="w-full max-w-xs p-4">
            <button
              onClick={handleLogout}
              className="mb-2 w-[255px] ml-4 mb-4 py-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-white hover:text-blue-500  transition-colors "
            >
              Logout
            </button>
            <div className="p-4 border-t dark:border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsTopicModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-white hover:text-blue-500  transition-colors"
              >
                Create Topic
              </button>
              <button
                onClick={() => {
                  setIsViewTopicsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-xl hover:bg-white hover:text-blue-500  transition-colors mt-3"
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
        <main className="flex-1 p-4 lg:pt-4 p-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto">
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
                className={`future-feed:bg-card future-feed:text-lime future-feed:border-lime flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-indigo-950 border bg-white dark:border-slate-200 rounded-2xl z-10  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isMobileMenuOpen ? "lg:flex hidden" : "flex"}`}
                onClick={() => setIsPostModalOpen(true)}
              >
                <h1 className=" future-feed:text-lime  text-xl dark:text-slate-200 font-bold text-black">What's on your mind?</h1>
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
                      <p className="text-lg dark:text-white">No posts available.</p>
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
                      <p className="text-lg dark:text-white">No posts from followed users.</p>
                      <Button
                        className="mt-4 bg-blue-500 hover:bg-white hover:text-blue-500  text-white"
                        onClick={() => fetchFollowingPosts()}
                      >
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    renderPosts(followingPosts)
                  )}
                </TabsContent>
                <TabsContent value="Presets">
                  <Tabs defaultValue="Your Presets" className={`w-full p-2 ${isMobileMenuOpen ? "hidden" : ""}`} onValueChange={setActiveTab}>
                    <TabsList className="w-full h-[30px] flex justify-around rounded-2xl mt-2 mb-2 border dark:border-slate-200 dark:bg-blue-950 sticky top-[68px] z-10 overflow-x-auto">
                      {["Your Presets", "Create Presets"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="flex-1 min-w-[100px] rounded-2xl text-sm lg:text-base"
                        >
                          {tab.replace(/^\w/, (c) => c.toUpperCase())}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="Your Presets" className="p-0">
                      {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          {error}
                        </div>
                      )}
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 dark:border-slate-200"></div>
                        </div>
                      ) : presets.length === 0 ? (
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-center text-gray-500">You don't have any presets yet.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {presets.map(preset => (
                            <Card key={preset.id} className="hover:bg-blue-500">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                  <CardTitle>{preset.name}</CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPreset(selectedPreset === preset.id ? null : preset.id)}
                                  className="mb-3"
                                >
                                  {selectedPreset === preset.id ? 'Hide Rules' : 'Show Rules'}
                                </Button>

                                {selectedPreset === preset.id && (
                                  <div className="mt-3 space-y-3">
                                    {/* Rule creation form */}
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <select
                                          value={newRule.topicId || ''}
                                          onChange={(e) => setNewRule({
                                            ...newRule,
                                            topicId: e.target.value ? parseInt(e.target.value) : undefined
                                          })}
                                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                        >
                                          <option value="">Select Topic</option>
                                          {topics.map(topic => (
                                            <option key={topic.id} value={topic.id}>
                                              {topic.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <select
                                          value={newRule.sourceType || ''}
                                          onChange={(e) => setNewRule({
                                            ...newRule,
                                            sourceType: e.target.value as 'user' | 'bot' | undefined
                                          })}
                                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                        >
                                          <option value="">Select Source Type</option>
                                          <option value="user">User Posts</option>
                                          <option value="bot">Bot Posts</option>
                                        </select>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <select
                                          value={newRule.specificUserId || ''}
                                          onChange={(e) => setNewRule({
                                            ...newRule,
                                            specificUserId: e.target.value ? parseInt(e.target.value) : undefined
                                          })}
                                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                          disabled={loadingUsers}
                                        >
                                          <option value="">Select Specific User</option>
                                          {allUsers.map(user => (
                                            <option key={user.id} value={user.id}>
                                              {user.displayName} (@{user.username})
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          placeholder="Percentage (1-100)"
                                          value={newRule.percentage || ''}
                                          onChange={(e) => setNewRule({
                                            ...newRule,
                                            percentage: e.target.value ? parseInt(e.target.value) : undefined
                                          })}
                                          className="flex-1"
                                        />
                                        <Percent size={16} className="text-gray-400" />
                                      </div>

                                      <Button
                                        className="w-full bg-blue-500 hover:bg-gray-500"
                                        onClick={() => addRule(preset.id)}
                                        size="sm"
                                      >
                                        <Plus size={16} className="mr-1" /> Add Rule
                                      </Button>
                                    </div>

                                    {/* Existing rules */}
                                    {rules[preset.id]?.length > 0 ? (
                                      <div className="space-y-2">
                                        {rules[preset.id].map(rule => (
                                          <div key={rule.id} className="flex items-center justify-between p-2 border rounded-md bg-white">
                                            <div className="flex items-center flex-1">
                                              <Filter size={14} className="mr-2 text-lime-500" />
                                              <span className="text-sm">{formatRule(rule)}</span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deleteRule(preset.id, rule.id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <FaTimes size={12} />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No rules added yet.</p>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="Create Presets">
                      <Card className="w-full">
                        <CardHeader>
                          <div className="text-center">
                            <CardTitle>Create a New Feed Preset</CardTitle>
                            <CardDescription>Create a named preset to organize your filtering rules</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                              {error}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Preset name (e.g., Tech & Bots)"
                              value={newPresetName}
                              onChange={(e) => setNewPresetName(e.target.value)}
                              className="flex-1"
                            />
                            <Button className="bg-lime-600" onClick={createPreset} disabled={isLoading}>
                              {isLoading ? 'Creating...' : 'Create Preset'}
                            </Button>
                          </div>
                          {presets.length > 0 && (
                            <div className="pt-4">
                              <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">Your Existing Presets</h3>
                              </div>
                              <div className="space-y-2">
                                {presets.map(preset => (
                                  <div key={preset.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <span>{preset.name}</span>
                                    <Badge variant="secondary">ID: {preset.id}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </>
          )}
        </main>
        <aside className="w-full lg:w-[350px] lg:mt-6 sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block ">
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
            <WhatsHappening />
          </div>
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
            <WhoToFollow />
          </div>
        </aside>
      </div>
      {isPostModalOpen && (
        <animated.div
          style={postModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/85 p-4"
        >
          <div className="bg-white future-feed:bg-black  dark:bg-indigo-950 rounded-2xl p-6 w-full max-w-2xl min-h-[500px] border-2 dark:border-slate-200 flex flex-col relative">
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
              <h2 className="text-xl font-bold mb-5 future-feed:text-lime  text-blue-500 dark:text-white">Share your thoughts</h2>
            </div>
            <div className="flex flex-col flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full mb-4 text-gray-900 dark:bg-blue-950 dark:text-white dark:border-slate-200 flex-1 resize-none"
                rows={8}
              />
              <div className="mb-4">
                <select
                  multiple
                  value={selectedTopicIds.map(String)}
                  onChange={(e) =>
                    setSelectedTopicIds(Array.from(e.target.selectedOptions, (option) => Number(option.value)))
                  }
                  className="dark:bg-blue-950 dark:text-white dark:border-slate-200 border-2 rounded-md p-2 w-full future-feed:text-lime text-blue-500"
                >
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id} className="text-center py-1">
                      {topic.name}
                    </option>
                  ))}
                </select>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple topics</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  className="dark:text-white text-black dark:border-slate-200 flex items-center space-x-1 border-2 dark:border-slate-200 dark:hover:border-white"
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
                  className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 "
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
            <h2 className="text-xl font-bold mb-4 text-blue-500 dark:text-white">All Topics</h2>
            <div className="flex flex-col">
              {topics.length === 0 ? (
                <p className="text-sm text-lime dark:text-gray-400">No topics available.</p>
              ) : (
                <ul className="list-disc pl-5 max-h-[300px] overflow-y-auto">
                  {topics.map((topic) => (
                    <li key={topic.id} className="text-sm text-blue-500 dark:text-white mb-2">
                      {topic.name}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                onClick={() => setIsViewTopicsModalOpen(false)}
                className="mt-4 bg-blue-500 text-white hover:bg-white hover:text-blue-500 "
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