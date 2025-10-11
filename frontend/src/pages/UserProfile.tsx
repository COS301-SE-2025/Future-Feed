import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PersonalSidebar from "@/components/PersonalSidebar";
import Post from "@/components/ui/post";
import { formatRelativeTime } from "@/lib/timeUtils";
import { Skeleton } from "@/components/ui/skeleton";
import WhatsHappening from "@/components/WhatsHappening";
import WhoToFollow from "@/components/WhoToFollow";
import BotPost from "@/components/ui/BotPost";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Trash2, User } from "lucide-react";

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
  profilePicture?: string;
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
  createdAt: string;
  botId: number;
  isBot: boolean;
}

interface Topic {
  id: number;
  name: string;
}

interface RawPost {
  id: number;
  content: string;
  createdAt: string;
  imageUrl?: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    profilePicture?: string;
  };
  botId: number;
  isBot: boolean;
}

interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
}

interface FollowRelation {
  id: number;
  followerId: number;
  followedId: number;
  followedAt: string;
}

interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

interface cUserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePictureUrl?: string;
}

const userCache = new Map<number, UserInfo>();

const profileDataCache = {
  user: null as UserProfile | null,
  followers: [] as User[],
  followingUsers: [] as User[],
  posts: [] as PostData[],
  reshares: [] as PostData[],
  commented: [] as PostData[],
  likedPosts: [] as PostData[],
  bookmarkedPosts: [] as PostData[],
};

interface FormData {
  displayName: string;
  bio: string;
  profileImage: string;
  dob: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [reshares, setReshares] = useState<PostData[]>([]);
  const [commentedPosts, setCommented] = useState<PostData[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostData[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostData[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tabLoading, setTabLoading] = useState({
    posts: false,
    refeeds: false,
    comments: false,
    likes: false,
    bookmarks: false,
  });
  const [fetchedTabs, setFetchedTabs] = useState({
    posts: false,
    refeeds: false,
    comments: false,
    likes: false,
    bookmarks: false,
  });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    bio: "",
    profileImage: "",
    dob: "",
  });
  const [initialProfilePicture, setInitialProfilePicture] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const navigate = useNavigate();

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
        profilePicture: user.profilePicture ?? "",
      };
      userCache.set(userId, userInfo);
      return userInfo;
    } catch (err) {
      console.warn(`Error fetching user ${userId}:`, err);
      const userInfo: UserInfo = {
        id: userId,
        username: `user${userId}`,
        displayName: `User ${userId}`,
        profilePicture: "",
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
      setUser(data);
      userCache.set(data.id, { id: data.id, username: data.username, displayName: data.displayName });
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

  const fetchFollowing = async (userId: number, allUsers: User[]) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/following/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      const data: FollowRelation[] = await res.json();
      const followedUserIds = data.map((relation) => relation.followedId);
      const followedUsers = allUsers.filter((user) => followedUserIds.includes(user.id));
      setFollowingUsers(followedUsers);
      profileDataCache.followingUsers = followedUsers;
      return followedUsers;
    } catch (err) {
      console.error("Failed to fetch following users", err);
      return [];
    }
  };

  const fetchFollowers = async (userId: number, allUsers: User[]) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/followers/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      const data: FollowRelation[] = await res.json();
      const followerUserIds = data.map((relation) => relation.followerId);
      const followerUsers = allUsers.filter((user) => followerUserIds.includes(user.id));
      setFollowers(followerUsers);
      profileDataCache.followers = followerUsers;
      return followerUsers;
    } catch (err) {
      console.error("Failed to fetch followers", err);
      return [];
    }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/user/all`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  };

  const fetchResharedPosts = async (currentUserId: number) => {
    setTabLoading((prev) => ({ ...prev, refeeds: true }));
    try {
      const res = await fetch(`${API_URL}/api/reshares`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch reshared posts: ${res.status} ${errorText}`);
      }
      const resharedList: {
        userId: number;
        post: {
          id: number;
          content: string;
          imageUrl: string | null;
          createdAt: string;
          user: UserInfo | null;
          botId: number;
          isBot: boolean;
        };
        createdAt: string;
        postId: number;
        botId: number;
        isBot: boolean;
      }[] = await res.json();
      if (!Array.isArray(resharedList) || resharedList.length === 0) {
        console.warn("No reshared posts found for user");
        setReshares([]);
        setFetchedTabs((prev) => ({ ...prev, refeeds: true }));
        profileDataCache.reshares = [];
        return;
      }
      const resharedPosts = await Promise.all(
        resharedList.map(async (reshare) => {
          try {
            const authorId = reshare.post.user?.id ?? 0;
            const userInfo: UserInfo = reshare.post.user ?? (await fetchUser(authorId));
            const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, reshareCountRes, hasResharedRes, topicRes] = await Promise.all([
              fetch(`${API_URL}/api/comments/post/${reshare.post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/count/${reshare.post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/has-liked/${reshare.post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/bookmarks/${currentUserId}/${reshare.post.id}/exists`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${reshare.post.id}/count`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${reshare.post.id}/has-reshared`, { credentials: "include" }),
              fetchTopicsForPost(reshare.post.id),
            ]);
            if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${reshare.post.id}: ${commentsRes.status}`);
            if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${reshare.post.id}: ${likesCountRes.status}`);
            if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${reshare.post.id}: ${hasLikedRes.status}`);
            if (!hasBookmarkedRes.ok) console.warn(`Failed to fetch bookmark status for post ID ${reshare.post.id}: ${hasBookmarkedRes.status}`);
            if (!reshareCountRes.ok) console.warn(`Failed to fetch reshare count for post ID ${reshare.post.id}: ${reshareCountRes.status}`);
            if (!hasResharedRes.ok) console.warn(`Failed to fetch has-reshared status for post ID ${reshare.post.id}: ${hasResharedRes.status}`);
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
                  profilePicture: commentUserInfo.id == currentUserId ? user?.profilePicture:commentUserInfo.profilePicture ,
                });
                } catch (err) {
                console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
              }
            }
            const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
            const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
            const isBookmarked = hasBookmarkedRes.ok ? await hasBookmarkedRes.json() : false;
            const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;
            const isReshared = hasResharedRes.ok ? await hasResharedRes.json() : false;
            const postData: PostData = {
              id: reshare.post.id,
              profilePicture: userInfo.profilePicture,
              username: userInfo.displayName,
              handle: reshare.isBot || reshare.botId ? `${userInfo.username}` : `@${userInfo.username}`,
              time: formatRelativeTime(reshare.post.createdAt),
              text: reshare.post.content,
              ...(reshare.post.imageUrl ? { image: reshare.post.imageUrl } : {}),
              isLiked,
              isBookmarked,
              isReshared,
              commentCount: validComments.length,
              authorId: userInfo.id,
              likeCount,
              reshareCount,
              comments: commentsWithUsers,
              showComments: false,
              topics: topicRes,
              createdAt: reshare.post.createdAt,
              isBot: reshare.post.isBot,
              botId: reshare.post.botId
            };
            return postData;
          } catch (err) {
            console.warn(`Error processing post ID ${reshare.post.id}:`, err);
            return null;
          }
        })
      );
      const validReshares = resharedPosts.filter((p): p is PostData => p !== null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReshares(validReshares);
      setFetchedTabs((prev) => ({ ...prev, refeeds: true }));
      profileDataCache.reshares = validReshares;
      if (validReshares.length === 0) {
        console.warn("No valid reshared posts after processing.");
      }
    } catch (err) {
      console.error("Error fetching reshared posts:", err);
      setError(`Failed to load reshared posts: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setTabLoading((prev) => ({ ...prev, refeeds: false }));
    }
  };

  const fetchCommentedPosts = async (userId: number, currentUserId: number) => {
    setTabLoading((prev) => ({ ...prev, comments: true }));
    try {
      const com = await fetch(`${API_URL}/api/posts/commented/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!com.ok) {
        const errorText = await com.text();
        throw new Error(`Failed to fetch commented posts: ${com.status} ${errorText}`);
      }
      const commentedList: {
        id: number;
        content: string;
        imageUrl: string | null;
        createdAt: string;
        user: UserInfo | null;
        isBot: boolean;
        botId: number;
        profilePicture: string;
      }[] = await com.json();
      if (!Array.isArray(commentedList) || commentedList.length === 0) {
        console.warn("No commented posts found for user:", userId);
        setCommented([]);
        setFetchedTabs((prev) => ({ ...prev, comments: true }));
        profileDataCache.commented = [];
        return;
      }
      const commentedPosts = await Promise.all(
        commentedList.map(async (post) => {
          try {
            const authorId = post.user?.id ?? 0;
            const userInfo: cUserInfo = post.user ?? (await fetchUser(authorId));
            const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, reshareCountRes, hasResharedRes, topicRes] = await Promise.all([
              fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/bookmarks/${currentUserId}/${post.id}/exists`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/count`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/has-reshared`, { credentials: "include" }),
              fetchTopicsForPost(post.id),
            ]);
            if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${post.id}: ${commentsRes.status}`);
            if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${post.id}: ${likesCountRes.status}`);
            if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${post.id}: ${hasLikedRes.status}`);
            if (!hasBookmarkedRes.ok) console.warn(`Failed to fetch bookmark status for post ID ${post.id}: ${hasBookmarkedRes.status}`);
            if (!reshareCountRes.ok) console.warn(`Failed to fetch reshare count for post ID ${post.id}: ${reshareCountRes.status}`);
            if (!hasResharedRes.ok) console.warn(`Failed to fetch has-reshared status for post ID ${post.id}: ${hasResharedRes.status}`);
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
                  profilePicture: commentUserInfo.id == currentUserId ? user?.profilePicture:commentUserInfo.profilePicture ,
                });
                } catch (err) {
                console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
              }
            }
            const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
            const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
            const isBookmarked = hasBookmarkedRes.ok ? await hasBookmarkedRes.json() : false;
            const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;
            const isReshared = hasResharedRes.ok ? await hasResharedRes.json() : false;
            const postData: PostData = {
              id: post.id,
              profilePicture: post.profilePicture || userInfo.profilePictureUrl,
              username: userInfo.displayName,
              handle: post.isBot || post.botId ? `${userInfo.username}` : `@${userInfo.username}`,
              time: formatRelativeTime(post.createdAt),
              text: post.content,
              ...(post.imageUrl ? { image: post.imageUrl } : {}),
              isLiked,
              isBookmarked,
              isReshared,
              commentCount: validComments.length,
              authorId: userInfo.id,
              likeCount,
              reshareCount,
              comments: commentsWithUsers,
              showComments: false,
              topics: topicRes,
              createdAt: post.createdAt,
              botId: post.botId,
              isBot: post.isBot
            };
            return postData;
          } catch (err) {
            console.warn(`Error processing post ID ${post.id}:`, err);
            return null;
          }
        })
      );
      const validComments = commentedPosts.filter((p): p is PostData => p !== null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCommented(validComments);
      setFetchedTabs((prev) => ({ ...prev, comments: true }));
      profileDataCache.commented = validComments;
      if (validComments.length === 0) {
        console.warn("No valid commented posts after processing.");
      }
    } catch (err) {
      console.error("Error fetching commented posts:", err);
      setError(`Failed to load commented posts: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setTabLoading((prev) => ({ ...prev, comments: false }));
    }
  };

  const fetchLikedPosts = async (userId: number, currentUserId: number) => {
    setTabLoading((prev) => ({ ...prev, likes: true }));
    try {
      const lik = await fetch(`${API_URL}/api/posts/liked/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!lik.ok) {
        const errorText = await lik.text();
        throw new Error(`Failed to fetch liked posts: ${lik.status} ${errorText}`);
      }
      const likedList: {
        id: number;
        content: string;
        imageUrl: string | null;
        createdAt: string;
        user: UserInfo | null;
        botId: number;
        isBot: boolean;
      }[] = await lik.json();
      if (!Array.isArray(likedList) || likedList.length === 0) {
        console.warn("No liked posts found for user:", userId);
        setLikedPosts([]);
        setFetchedTabs((prev) => ({ ...prev, likes: true }));
        profileDataCache.likedPosts = [];
        return;
      }
      const likedPosts = await Promise.all(
        likedList.map(async (post) => {
          console.log(post)
          try {
            const authorId = post.user?.id ?? 0;
            const userInfo: cUserInfo = post.user ?? (await fetchUser(authorId));
            const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, reshareCountRes, hasResharedRes, topicRes] = await Promise.all([
              fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/bookmarks/${currentUserId}/${post.id}/exists`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/count`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/has-reshared`, { credentials: "include" }),
              fetchTopicsForPost(post.id),
            ]);
            if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${post.id}: ${commentsRes.status}`);
            if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${post.id}: ${likesCountRes.status}`);
            if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${post.id}: ${hasLikedRes.status}`);
            if (!hasBookmarkedRes.ok) console.warn(`Failed to fetch bookmark status for post ID ${post.id}: ${hasBookmarkedRes.status}`);
            if (!reshareCountRes.ok) console.warn(`Failed to fetch reshare count for post ID ${post.id}: ${reshareCountRes.status}`);
            if (!hasResharedRes.ok) console.warn(`Failed to fetch has-reshared status for post ID ${post.id}: ${hasResharedRes.status}`);
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
                  profilePicture: commentUserInfo.id == currentUserId ? user?.profilePicture:commentUserInfo.profilePicture ,
                });
                } catch (err) {
                console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
              }
            }
            const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
            const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
            const isBookmarked = hasBookmarkedRes.ok ? await hasBookmarkedRes.json() : false;
            const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;
            const isReshared = hasResharedRes.ok ? await hasResharedRes.json() : false;
            const postData: PostData = {
              id: post.id,
              profilePicture: userInfo.profilePictureUrl,
              username: userInfo.displayName,
              handle: post.isBot || post.botId ? `${userInfo.username}` : `@${userInfo.username}`,
              time: formatRelativeTime(post.createdAt),
              text: post.content,
              ...(post.imageUrl ? { image: post.imageUrl } : {}),
              isLiked,
              isBookmarked,
              isReshared,
              commentCount: validComments.length,
              authorId: userInfo.id,
              likeCount,
              reshareCount,
              comments: commentsWithUsers,
              showComments: false,
              topics: topicRes,
              createdAt: post.createdAt,
              botId: post.botId,
              isBot: post.isBot
            };
            return postData;
          } catch (err) {
            console.warn(`Error processing post ID ${post.id}:`, err);
            return null;
          }
        })
      );
      const validLikes = likedPosts.filter((p): p is PostData => p !== null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLikedPosts(validLikes);
      setFetchedTabs((prev) => ({ ...prev, likes: true }));
      profileDataCache.likedPosts = validLikes;
      if (validLikes.length === 0) {
        console.warn("No valid liked posts after processing.");
      }
    } catch (err) {
      console.error("Error fetching liked posts:", err);
      setError(`Failed to load liked posts: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setTabLoading((prev) => ({ ...prev, likes: false }));
    }
  };

  const fetchBookmarkedPosts = async (userId: number, currentUserId: number) => {
    if(!user){
      setError("Please log in")
    }
    setTabLoading((prev) => ({ ...prev, bookmarks: true }));
    try {
      const book = await fetch(`${API_URL}/api/bookmarks/${userId}`, {
        credentials: "include",
      });
      if (!book.ok) throw new Error(`Failed to fetch bookmarks: ${book.status}`);
      const bookmarkedList: { 
        id: number; 
        userId: number; 
        postId: number; 
        bookmarkedAt: string;

       }[] = await book.json();
      if (!Array.isArray(bookmarkedList) || bookmarkedList.length === 0) {
        console.warn("No bookmarked posts found for user:", userId);
        setBookmarkedPosts([]);
        setFetchedTabs((prev) => ({ ...prev, bookmarks: true }));
        profileDataCache.bookmarkedPosts = [];
        return;
      }
      const bookmarkedPosts = await Promise.all(
        bookmarkedList.map(async (bookmark) => {
          try {
            const postRes = await fetch(`${API_URL}/api/posts/${bookmark.postId}`, {
              credentials: "include",
            });
            if (!postRes.ok) {
              console.warn(`Skipping bookmark for missing post ID: ${bookmark.postId}`);
              return null;
            }
            const post: RawPost = await postRes.json();
            const authorId = post.user?.id ?? 0;
            const userInfo: cUserInfo = post.user ?? (await fetchUser(authorId));
            const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, reshareCountRes, hasResharedRes, topicRes] = await Promise.all([
              fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/bookmarks/${currentUserId}/${post.id}/exists`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/count`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/has-reshared`, { credentials: "include" }),
              fetchTopicsForPost(post.id),
            ]);
            if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${post.id}: ${commentsRes.status}`);
            if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${post.id}: ${likesCountRes.status}`);
            if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${post.id}: ${hasLikedRes.status}`);
            if (!hasBookmarkedRes.ok) console.warn(`Failed to fetch bookmark status for post ID ${post.id}: ${hasBookmarkedRes.status}`);
            if (!reshareCountRes.ok) console.warn(`Failed to fetch reshare count for post ID ${post.id}: ${reshareCountRes.status}`);
            if (!hasResharedRes.ok) console.warn(`Failed to fetch has-reshared status for post ID ${post.id}: ${hasResharedRes.status}`);
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
                  profilePicture: commentUserInfo.id == currentUserId ? user?.profilePicture:commentUserInfo.profilePicture ,
                });
                } catch (err) {
                console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
              }
            }
            const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
            const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
            const isBookmarked = hasBookmarkedRes.ok ? await hasBookmarkedRes.json() : false;
            const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;
            const isReshared = hasResharedRes.ok ? await hasResharedRes.json() : false;
            const postData: PostData = {
              id: post.id,
              profilePicture: userInfo.profilePictureUrl,
              username: userInfo.displayName,
              handle: post.isBot || post.botId ? `${userInfo.username}` : `@${userInfo.username}`,
              time: formatRelativeTime(post.createdAt),
              text: post.content,
              ...(post.imageUrl ? { image: post.imageUrl } : {}),
              isLiked,
              isBookmarked,
              isReshared,
              commentCount: validComments.length,
              authorId: userInfo.id,
              likeCount,
              reshareCount,
              comments: commentsWithUsers,
              showComments: false,
              topics: topicRes,
              createdAt: post.createdAt,
              isBot: post.isBot,
              botId: post.botId
            };
            return postData;
          } catch (err) {
            console.warn(`Error processing post ID ${bookmark.postId}:`, err);
            return null;
          }
        })
      );
      const validBookmarks = bookmarkedPosts.filter((p): p is PostData => p !== null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookmarkedPosts(validBookmarks);
      setFetchedTabs((prev) => ({ ...prev, bookmarks: true }));
      profileDataCache.bookmarkedPosts = validBookmarks;
      if (validBookmarks.length === 0) {
        console.warn("No valid bookmarked posts after processing.");
      }
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError(`Failed to load bookmarked posts: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setTabLoading((prev) => ({ ...prev, bookmarks: false }));
    }
  };

  const fetchUserPosts = async (userId: number, currentUserId: number) => {
    setTabLoading((prev) => ({ ...prev, posts: true }));
    try {
      const res = await fetch(`${API_URL}/api/posts/user/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
      const apiPosts: {
        id: number;
        content: string;
        imageUrl: string | null;
        createdAt: string;
        user: UserInfo | null;
        botId: number;
        isBot: boolean;
      }[] = await res.json();
      if (!Array.isArray(apiPosts) || apiPosts.length === 0) {
        setPosts([]);
        setFetchedTabs((prev) => ({ ...prev, posts: true }));
        profileDataCache.posts = [];
        return [];
      }
      const formattedPosts = await Promise.all(
        apiPosts.map(async (post) => {
          try {
            const authorId = post.user?.id ?? 0;
            const userInfo: UserInfo = post.user ?? (await fetchUser(authorId));
            const [commentsRes, likesCountRes, hasLikedRes, hasBookmarkedRes, reshareCountRes, hasResharedRes, topicRes] = await Promise.all([
              fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
              fetch(`${API_URL}/api/bookmarks/${currentUserId}/${post.id}/exists`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/count`, { credentials: "include" }),
              fetch(`${API_URL}/api/reshares/${post.id}/has-reshared`, { credentials: "include" }),
              fetchTopicsForPost(post.id),
            ]);
            if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${post.id}: ${commentsRes.status}`);
            if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${post.id}: ${likesCountRes.status}`);
            if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${post.id}: ${hasLikedRes.status}`);
            if (!hasBookmarkedRes.ok) console.warn(`Failed to fetch bookmark status for post ID ${post.id}: ${hasBookmarkedRes.status}`);
            if (!reshareCountRes.ok) console.warn(`Failed to fetch reshare count for post ID ${post.id}: ${reshareCountRes.status}`);
            if (!hasResharedRes.ok) console.warn(`Failed to fetch has-reshared status for post ID ${post.id}: ${hasResharedRes.status}`);
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
                  profilePicture: commentUserInfo.profilePicture,
                });
                } catch (err) {
                console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
              }
            }
            const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
            const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;
            const isBookmarked = hasBookmarkedRes.ok ? await hasBookmarkedRes.json() : false;
            const reshareCount = reshareCountRes.ok ? await reshareCountRes.json() : 0;
            const isReshared = hasResharedRes.ok ? await hasResharedRes.json() : false;
            const postData: PostData = {
              id: post.id,
              profilePicture: userInfo.profilePicture,
              username: userInfo.displayName,
              handle: post.isBot || post.botId ? `${userInfo.username}` : `@${userInfo.username}`,
              time: formatRelativeTime(post.createdAt),
              text: post.content,
              ...(post.imageUrl ? { image: post.imageUrl } : {}),
              isLiked,
              isBookmarked,
              isReshared,
              commentCount: validComments.length,
              authorId: userInfo.id,
              likeCount,
              reshareCount,
              comments: commentsWithUsers,
              showComments: false,
              topics: topicRes,
              createdAt: post.createdAt,
              botId: post.botId,
              isBot: post.isBot
            };
            return postData;
          } catch (err) {
            console.warn(`Error processing post ID ${post.id}:`, err);
            return null;
          }
        })
      );
      const validPosts = formattedPosts.filter((p): p is PostData => p !== null).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(validPosts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
      setFetchedTabs((prev) => ({ ...prev, posts: true }));
      profileDataCache.posts = validPosts;
      if (validPosts.length === 0) {
        console.warn("No valid posts after processing.");
      }
      return validPosts;
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(`Failed to load posts: ${err instanceof Error ? err.message : "Unknown error"}`);
      return [];
    } finally {
      setTabLoading((prev) => ({ ...prev, posts: false }));
    }
  };

  const handleTabChange = async (value: string, currentUserId: number) => {
    if (!user?.id) return;
    if (value === "posts" && !fetchedTabs.posts) {
      await fetchUserPosts(user.id, currentUserId);
    } else if (value === "re-feeds" && !fetchedTabs.refeeds) {
      await fetchResharedPosts(currentUserId);
    } else if (value === "comments" && !fetchedTabs.comments) {
      await fetchCommentedPosts(user.id, currentUserId);
    } else if (value === "likes" && !fetchedTabs.likes) {
      await fetchLikedPosts(user.id, currentUserId);
    } else if (value === "bookmarks" && !fetchedTabs.bookmarks) {
      await fetchBookmarkedPosts(user.id, currentUserId);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) ||
                  reshares.find((p) => p.id === postId) ||
                  bookmarkedPosts.find((p) => p.id === postId) ||
                  likedPosts.find((p) => p.id === postId) ||
                  commentedPosts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }
      if (!user) {
        setError("Please log in to like/unlike posts.");
        return;
      }
      const wasLiked = post.isLiked;
      const updatePostState = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        );
      setPosts(updatePostState);
      setReshares(updatePostState);
      setBookmarkedPosts(updatePostState);
      setCommented(updatePostState);
      if (!wasLiked) {
        setLikedPosts((prev) => {
          if (prev.some((p) => p.id === postId)) return updatePostState(prev);
          return [...prev, { ...post, isLiked: true, likeCount: post.likeCount + 1 }];
        });
      } else {
        setLikedPosts((prev) => prev.filter((p) => p.id !== postId));
      }
      const method = wasLiked ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to ${wasLiked ? "unlike" : "like"} post ${postId}: ${res.status} ${errorText}`);
        const revertPostState = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: wasLiked,
                  likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
                }
              : p
          );
        setPosts(revertPostState);
        setReshares(revertPostState);
        setBookmarkedPosts(revertPostState);
        setCommented(revertPostState);
        setLikedPosts((prev) => (wasLiked ? [...prev, post] : prev.filter((p) => p.id !== postId)));
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
        const updateLikeStatus = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: likeData === true }
              : p
          );
        setPosts(updateLikeStatus);
        setReshares(updateLikeStatus);
        setBookmarkedPosts(updateLikeStatus);
        setCommented(updateLikeStatus);
        setLikedPosts((prev) =>
          likeData === true
            ? prev.some((p) => p.id === postId)
              ? updateLikeStatus(prev)
              : [...prev, { ...post, isLiked: true }]
            : prev.filter((p) => p.id !== postId)
        );
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isLiked ? "unlike" : "like"} post.`);
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) ||
                  reshares.find((p) => p.id === postId) ||
                  bookmarkedPosts.find((p) => p.id === postId) ||
                  likedPosts.find((p) => p.id === postId) ||
                  commentedPosts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }
      if (!user) {
        setError("Please log in to bookmark/unbookmark posts.");
        return;
      }
      const wasBookmarked = post.isBookmarked;
      const updateBookmarkState = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isBookmarked: !p.isBookmarked }
            : p
        );
      setPosts(updateBookmarkState);
      setReshares(updateBookmarkState);
      setCommented(updateBookmarkState);
      setLikedPosts(updateBookmarkState);
      if (!wasBookmarked) {
        setBookmarkedPosts((prev) => {
          if (prev.some((p) => p.id === postId)) return updateBookmarkState(prev);
          return [...prev, { ...post, isBookmarked: true }];
        });
      } else {
        setBookmarkedPosts((prev) => prev.filter((p) => p.id !== postId));
      }
      const method = wasBookmarked ? "DELETE" : "POST";
      const url = `${API_URL}/api/bookmarks/${user.id}/${postId}`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to ${wasBookmarked ? "unbookmark" : "bookmark"} post ${postId}: ${res.status} ${errorText}`);
        const revertBookmarkState = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isBookmarked: wasBookmarked }
              : p
          );
        setPosts(revertBookmarkState);
        setReshares(revertBookmarkState);
        setCommented(revertBookmarkState);
        setLikedPosts(revertBookmarkState);
        setBookmarkedPosts((prev) => (wasBookmarked ? [...prev, post] : prev.filter((p) => p.id !== postId)));
        if (res.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(errorText || `Failed to ${wasBookmarked ? "unbookmark" : "bookmark"} post.`);
        }
        return;
      }
      const hasBookmarkedRes = await fetch(`${API_URL}/api/bookmarks/${user.id}/${postId}/exists`, {
        credentials: "include",
      });
      if (hasBookmarkedRes.ok) {
        const bookmarkData = await hasBookmarkedRes.json();
        const updateBookmarkStatus = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isBookmarked: bookmarkData === true }
              : p
          );
        setPosts(updateBookmarkStatus);
        setReshares(updateBookmarkStatus);
        setCommented(updateBookmarkStatus);
        setLikedPosts(updateBookmarkStatus);
        setBookmarkedPosts((prev) =>
          bookmarkData === true
            ? prev.some((p) => p.id === postId)
              ? updateBookmarkStatus(prev)
              : [...prev, { ...post, isBookmarked: true }]
            : prev.filter((p) => p.id !== postId)
        );
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isBookmarked ? "unbookmark" : "bookmark"} post.`);
    }
  };

  const handleReshare = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) ||
                  reshares.find((p) => p.id === postId) ||
                  bookmarkedPosts.find((p) => p.id === postId) ||
                  likedPosts.find((p) => p.id === postId) ||
                  commentedPosts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }
      if (!user) {
        setError("Please log in to reshare/unreshare posts.");
        return;
      }
      const wasReshared = post.isReshared;
      const updateReshareState = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isReshared: !p.isReshared,
                reshareCount: p.isReshared ? p.reshareCount - 1 : p.reshareCount + 1,
              }
            : p
        );
      setPosts(updateReshareState);
      setBookmarkedPosts(updateReshareState);
      setCommented(updateReshareState);
      setLikedPosts(updateReshareState);
      if (!wasReshared) {
        setReshares((prev) => {
          if (prev.some((p) => p.id === postId)) return updateReshareState(prev);
          return [...prev, { ...post, isReshared: true, reshareCount: post.reshareCount + 1 }];
        });
      } else {
        setReshares((prev) => prev.filter((p) => p.id !== postId));
      }
      const method = wasReshared ? "DELETE" : "POST";
      const url = wasReshared ? `${API_URL}/api/reshares/${postId}` : `${API_URL}/api/reshares`;
      const body = wasReshared ? null : JSON.stringify({ postId });
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body,
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to ${wasReshared ? "unreshare" : "reshare"} post ${postId}: ${res.status} ${errorText}`);
        const revertReshareState = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isReshared: wasReshared,
                  reshareCount: wasReshared ? p.reshareCount + 1 : p.reshareCount - 1,
                }
              : p
          );
        setPosts(revertReshareState);
        setBookmarkedPosts(revertReshareState);
        setCommented(revertReshareState);
        setLikedPosts(revertReshareState);
        setReshares((prev) => (wasReshared ? [...prev, post] : prev.filter((p) => p.id !== postId)));
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
        const updateReshareStatus = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isReshared: reshareData === true, reshareCount }
              : p
          );
        setPosts(updateReshareStatus);
        setBookmarkedPosts(updateReshareStatus);
        setCommented(updateReshareStatus);
        setLikedPosts(updateReshareStatus);
        setReshares((prev) =>
          reshareData === true
            ? prev.some((p) => p.id === postId)
              ? updateReshareStatus(prev)
              : [...prev, { ...post, isReshared: true, reshareCount }]
            : prev.filter((p) => p.id !== postId)
        );
      } else {
        console.warn(`Failed to fetch reshare status or count for post ${postId}`);
      }
    } catch (err) {
      console.error("Error toggling reshare:", err);
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isReshared ? "unreshare" : "reshare"} post.`);
    }
  };

  const handleAddComment = async (postId: number, commentText: string) => {
    if (!user) {
      setError("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    try {
      const post = posts.find((p) => p.id === postId) ||
                  reshares.find((p) => p.id === postId) ||
                  bookmarkedPosts.find((p) => p.id === postId) ||
                  likedPosts.find((p) => p.id === postId) ||
                  commentedPosts.find((p) => p.id === postId);
      if (!post) {
        setError("Post not found.");
        return;
      }
      const updateCommentState = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: Date.now(),
                    postId,
                    authorId: user.id,
                    content: commentText,
                    createdAt: new Date().toISOString(),
                    username: user.displayName,
                    handle: `@${user.username}`,
                  },
                ],
                commentCount: p.commentCount + 1,
              }
            : p
        );
      setPosts(updateCommentState);
      setReshares(updateCommentState);
      setBookmarkedPosts(updateCommentState);
      setLikedPosts(updateCommentState);
      setCommented((prev) => {
        if (prev.some((p) => p.id === postId)) return updateCommentState(prev);
        return [...prev, { ...post, comments: [...post.comments, {
          id: Date.now(),
          postId,
          authorId: user.id,
          content: commentText,
          createdAt: new Date().toISOString(),
          username: user.displayName,
          handle: `@${user.username}`,
        }], commentCount: post.commentCount + 1 }];
      });
      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        credentials: "include",
        body: commentText,
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to add comment to post ${postId}: ${res.status} ${errorText}`);
        const revertCommentState = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: p.comments.filter((c) => c.id !== Date.now()),
                  commentCount: p.commentCount - 1,
                }
              : p
          );
        setPosts(revertCommentState);
        setReshares(revertCommentState);
        setBookmarkedPosts(revertCommentState);
        setLikedPosts(revertCommentState);
        setCommented((prev) => prev.filter((p) => p.id !== postId || p.commentCount > 1));
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
        authorId: newComment.userId || user.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        username: user.displayName,
        handle: `@${user.username}`,
      };
      const updateCommentStatus = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === Date.now() ? formattedComment : c
                ),
                commentCount: p.commentCount,
              }
            : p
        );
      setPosts(updateCommentStatus);
      setReshares(updateCommentStatus);
      setBookmarkedPosts(updateCommentStatus);
      setLikedPosts(updateCommentStatus);
      setCommented((prev) => {
        if (prev.some((p) => p.id === postId)) return updateCommentStatus(prev);
        return [...prev, { ...post, comments: [...post.comments.map((c) => c.id === Date.now() ? formattedComment : c)], commentCount: post.commentCount }];
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment.");
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!user) {
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
      setReshares((prev) => prev.filter((post) => post.id !== postId));
      setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId));
      setLikedPosts((prev) => prev.filter((post) => post.id !== postId));
      setCommented((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, profileImage: base64String });
      };
      reader.onerror = () => {
        console.error("Error reading file");
        setError("Failed to read profile image.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const body = {
        displayName: formData.displayName,
        bio: formData.bio,
        dateOfBirth: formData.dob,
        ...(formData.profileImage !== initialProfilePicture && { profilePicture: formData.profileImage }),
      };

      const response = await fetch(`${API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }

      const updatedUser = await response.json();
      if (
        updatedUser.displayName === formData.displayName &&
        updatedUser.bio === formData.bio &&
        updatedUser.dateOfBirth === formData.dob &&
        (formData.profileImage === initialProfilePicture || updatedUser.profilePicture === formData.profileImage)
      ) {
        setUser(updatedUser); // Update user state
        profileDataCache.user = updatedUser; // Update cache
        setShowEditProfileModal(false); // Close modal
      } else {
        throw new Error("Profile update response does not match submitted data");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete account: ${errorText}`);
      }

      navigate("/"); // Redirect to landing page
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account.");
    }
  };

  const toggleComments = (postId: number) => {
    const updateCommentToggle = (prevPosts: PostData[]) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      );
    setPosts(updateCommentToggle);
    setReshares(updateCommentToggle);
    setBookmarkedPosts(updateCommentToggle);
    setLikedPosts(updateCommentToggle);
    setCommented(updateCommentToggle);
  };

  const renderSkeletonPosts = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="mb-4 border  dark:border-slate-200 rounded-lg p-4 animate-pulse space-y-4"
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
    const loadInitialData = async () => {
      setLoading(true);
      if (profileDataCache.user) {
        setUser(profileDataCache.user);
        setFollowers(profileDataCache.followers);
        setFollowingUsers(profileDataCache.followingUsers);
        setPosts(profileDataCache.posts);
        setReshares(profileDataCache.reshares);
        setCommented(profileDataCache.commented);
        setLikedPosts(profileDataCache.likedPosts);
        setBookmarkedPosts(profileDataCache.bookmarkedPosts);
        setFetchedTabs({
          posts: profileDataCache.posts.length > 0,
          refeeds: profileDataCache.reshares.length > 0,
          comments: profileDataCache.commented.length > 0,
          likes: profileDataCache.likedPosts.length > 0,
          bookmarks: profileDataCache.bookmarkedPosts.length > 0,
        });
        setFormData({
          displayName: profileDataCache.user.displayName || "",
          bio: profileDataCache.user.bio || "",
          profileImage: profileDataCache.user.profilePicture?.startsWith("blob:") || !profileDataCache.user.profilePicture
            ? ""
            : profileDataCache.user.profilePicture,
          dob: profileDataCache.user.dateOfBirth || "",
        });
        setInitialProfilePicture(
          profileDataCache.user.profilePicture?.startsWith("blob:") || !profileDataCache.user.profilePicture
            ? ""
            : profileDataCache.user.profilePicture
        );
        setLoading(false);
        return;
      }
      const currentUser = await fetchCurrentUser();
      if (currentUser?.id) {
        const allUsers = await fetchUsers();
        await Promise.all([
          fetchFollowing(currentUser.id, allUsers),
          fetchFollowers(currentUser.id, allUsers),
          fetchUserPosts(currentUser.id, currentUser.id),
        ]);
        profileDataCache.user = currentUser;
        setFormData({
          displayName: currentUser.displayName || "",
          bio: currentUser.bio || "",
          profileImage: currentUser.profilePicture?.startsWith("blob:") || !currentUser.profilePicture
            ? ""
            : currentUser.profilePicture,
          dob: currentUser.dateOfBirth || "",
        });
        setInitialProfilePicture(
          currentUser.profilePicture?.startsWith("blob:") || !currentUser.profilePicture
            ? ""
            : currentUser.profilePicture
        );
      } else {
        setError("Cannot fetch data: User not authenticated.");
      }
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const LabelBlock = ({ label, htmlFor }: { label: string; htmlFor: string }) => (
    <div className="relative my-[15px] flex items-center justify-center text-center">
      <div className="mr-2.5 h-px w-1/3 future-feed:bg-lime bg-gray-500 dark:bg-slate-200"></div>
      <span className="text-[0.9rem] font-bold">
        <Label htmlFor={htmlFor} className="mb-2 block font-bold text-[18px]">
          {label}
        </Label>
      </span>
      <div className="ml-2.5 h-px w-1/3 future-feed:bg-lime bg-gray-500 dark:bg-slate-200"></div>
    </div>
  );

  if (loading) {
    return (
      <div className=" flex flex-col lg:flex-row min-h-screen min-h-screen future-feed:bg-black future-feed:text-lime  dark:bg-blue-950 dark:text-slate-200 overflow-y-auto mx-auto">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto mt-5">
          <PersonalSidebar />
        </aside>
        
        <main className="flex-1 p-4 lg:pt-4 p-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto mt-[21px]">
          <div className="relative">
            <Skeleton className="mt-1 h-40 w-full" />
            <div className="absolute -bottom-10 left-4">
              <Skeleton className="w-27 h-27 rounded-full" />
            </div>
          </div>
          <div
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
        </main>
        <aside className="w-full lg:w-[350px] lg:sticky    lg:mt-[10px] lg:top-[16px] lg:h-screen  hidden lg:block mr-6.5 ">
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

  if (!user) return <div className="p-4 text-black">Not logged in.</div>;

  return (
    <div className="future-feed:bg-black flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 text-white mx-auto bg-white">
      <button
        className="lg:hidden fixed top-2 left-2 bg-blue-500 future-feed:bg-lime text-white p-3 rounded-full z-20 shadow-lg "
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
      {isMobileMenuOpen && (
    <div className="md:hidden fixed inset-0 bg-black/90 z-10 flex flex-col items-center justify-center text-white">
      <PersonalSidebar />
      <Button
        variant="secondary"
        className="mt-4 bg-white dark:bg-slate-200 dark:text-black"
        onClick={() => navigate("/edit-profile")}
      >
        Edit Profile
      </Button>
      <Button
        variant="secondary"
        className="mt-4 bg-white dark:bg-slate-200 dark:text-black"
        onClick={() => navigate("/followers?tab=following")}
      >
        View Following
      </Button>
      <Button
        variant="secondary"
        className="mt-4 bg-white dark:bg-slate-200 dark:text-black"
        onClick={() => navigate("/followers?tab=followers")}
      >
        View Followers
      </Button>
    </div>
  )}
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="flex-1 p-4 lg:pt-4 p-4 lg:p-2 lg:pl-2 min-h-screen overflow-y-auto mt-[21px]">
      <Card className="mb-5 ">
        <CardContent className="ml-[-10px]">
          <div className="relative">
          <div className="mt-10 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-20 h-20 ">
              <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
                <AvatarImage src={user.profilePicture} alt={`@${user.username}`} />
                <AvatarFallback className="bg-white text-gray-600 dark:bg-slate-200 dark:text-black h-18 w-20 rounded-full flex items-center justify-center text-4xl">
                  <FaUser>
                  </FaUser>
                </AvatarFallback>
              </Link>
            </Avatar>
          </div>
        </div>
          <div className="pt-16 px-4">
          <div className="text-gray-400 flex justify-between items-start">
            <div className="ml-30 mt-[-110px]">
              <h1 className="text-xl text-black font-bold ">{user.displayName || user.username}</h1>
              <p className="text-slate-500 text-lg font-bold">@{user.username}</p>
              <p className="mt-2 text-xl text-black">{user.bio}</p>
            </div>
                <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className=" bg-white border-rose-gold-accent-border mt-[-100px] dark:hover:bg-slate-200 dark:hover:text-black hover:cursor-pointer"
                    >
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px] future-feed:bg-[#1a1a1a] bg-white dark:bg-[#1a1a1a] border-2 border-drop-shadow-x dark:border-lime-500 p-16 rounded-[16px]">
                    <DialogHeader>
                      <DialogTitle className="text-center future-feed:text-white text-4xl">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col items-center">
                      <div className="mb-3 flex w-full justify-center">
                        <label htmlFor="profile-pic-upload" className="relative cursor-pointer">
                          {formData.profileImage ? (
                            <img
                              src={formData.profileImage}
                              alt="Profile"
                              className="mx-auto h-[140px] w-[140px] rounded-full border-2 border-black object-cover shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                            />
                          ) : (
                            <div className="mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-full border-2 border-black bg-[#1a1a1a] shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                              <img
                              src={formData.profileImage}
                              alt="Profile"
                              className="mx-auto h-[140px] w-[140px] rounded-full border-2 border-black object-cover shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                            />
                            </div>
                          )}
                          <Camera className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-white p-1 text-black shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
                          <Input
                            type="file"
                            id="profile-pic-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="mb-3 w-full max-w-[500px] ">
                        <LabelBlock label="Display Name" htmlFor="display-name" />
                        <Input
                          id="display-name"
                          placeholder="Enter your display name"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="text-black bg-white w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white  dark:text-white dark:placeholder:text-slate-100"
                        />
                      </div>
                      <div className="mb-3 w-full max-w-[500px]">
                        <LabelBlock label="Date of Birth" htmlFor="dob" />
                        <Input
                          id="dob"
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
                        />
                      </div>
                      <div className="mb-3 w-full max-w-[500px]">
                        <LabelBlock label="Bio" htmlFor="bio" />
                        <Textarea
                          id="bio"
                          placeholder="Bio..."
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="future-feed:text-white future-feed:bg-card h-[100px] w-full rounded-[20px] border border-black px-4 py-2 text-sm resize-y whitespace-pre-wrap dark:text-white dark:placeholder:text-slate-100"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="h-[58px] w-[186px] rounded-[25px] border border-black bg-white text-[15px] font-bold text-black hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-blue-500 hover:border-3 mt-3 cursor-pointer"
                      >
                        Save Changes
                      </Button>
                    </form>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button
                          className="absolute left-5 top-5 h-[40px] w-[40px] rounded-full border border-red-600 bg-white p-0 hover:bg-red-100 cursor-pointer hover:shadow-[1px_1px_10px_black] dark:bg-gray-200 dark:border-red-600 dark:hover:bg-red-200 dark:hover:shadow-none"
                          variant="ghost"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your account? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setShowDeleteDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            className="border border-red-600 text-red-600 hover:bg-red-100 cursor-pointer bg-white dark:bg-gray-200 dark:border-red-600 dark:hover:bg-red-200"
                            onClick={() => {
                              setShowDeleteDialog(false);
                              handleDeleteAccount();
                            }}
                          >
                            Yes, Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </DialogContent>
                </Dialog>
          </div>
          <div className="left-4 text-black mt-4 flex content-between gap-2 text-sm dark:text-slate-500">
            <Link to="/followers?tab=following" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium">{followingUsers ? followingUsers.length : 0}</span> Following ·
            </Link>
            <Link to="/followers?tab=followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-slate-200">{followers ? followers.length : 0}</span> Followers ·
            </Link>
            <span className="font-medium dark:text-slate-200">{posts.length}</span> Posts
          </div>
        </div>
        </CardContent>

      </Card>
        <Tabs defaultValue="posts" className="w-full p-0" onValueChange={(value) => handleTabChange(value, user.id)}>
          <TabsList className="w-full flex justify-around rounded-2xl border k sticky top-[68px] z-10 overflow-x-auto">
            <TabsTrigger className="text-black" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="text-black" value="re-feeds">Re-Feeds</TabsTrigger>
            <TabsTrigger className="text-black" value="comments">Comments</TabsTrigger>
            <TabsTrigger className="text-black" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="text-black" value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="p-0">
            {error && (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p>{error}</p>
    </div>
  )}
  {tabLoading.posts ? (
    <div className="flex flex-col gap-6 py-4">
      {renderSkeletonPosts()}
    </div>
  ) : posts.length === 0 ? (
    <div className="p-4 dark:text-slate-500 text-gray-400">No posts yet.</div>
  ) : (
    posts.map((post) => (
      <div key={post.id} className="mb-4">
        {post.botId || post.isBot ? (
          <BotPost
            profilePicture={user.profilePicture}
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
                  />
                  ) : (
                    <Post
                    profilePicture={user.profilePicture}
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
                  />
                  )}
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="re-feeds" className="p-0">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            {tabLoading.refeeds ? (
              <div className="flex flex-col gap-6 py-4">
                {renderSkeletonPosts()}
              </div>
            ) : reshares.length === 0 ? (
              <div className="p-4 dark:text-slate-500 text-gray-400">No re-feeds yet.</div>
            ) : (
              reshares.map((post) => (
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
                  />
                  )}
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="comments">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            {tabLoading.comments ? (
              <div className="flex flex-col gap-6 py-4">
                {renderSkeletonPosts()}
              </div>
            ) : commentedPosts.length === 0 ? (
              <div className="p-4 dark:text-slate-500 text-gray-400">No commented posts yet.</div>
            ) : (
              commentedPosts.map((post) => (
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
                  />
                  )}
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="likes">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            {tabLoading.likes ? (
              <div className="flex flex-col gap-6 py-4">
                {renderSkeletonPosts()}
              </div>
            ) : likedPosts.length === 0 ? (
              <div className="p-4 dark:text-slate-500 text-gray-400">No likes yet.</div>
            ) : (
              likedPosts.map((post) => (
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics || []}
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics}
                  />
                  )}
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="bookmarks">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            {tabLoading.bookmarks ? (
              <div className="flex flex-col gap-6 py-4">
                {renderSkeletonPosts()}
              </div>
            ) : bookmarkedPosts.length === 0 ? (
              <div className="p-4 dark:text-slate-500 text-gray-400">No bookmarks yet.</div>
            ) : (
              bookmarkedPosts.map((post) => (
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
                    isUserLoaded={!!user}
                    currentUser={user}
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
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                    topics={post.topics}
                  />
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <aside className="w-full lg:w-[350px] lg:sticky    lg:mt-[10px] lg:top-[16px] lg:h-screen  hidden lg:block mr-6.5 ">
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

export default UserProfile;