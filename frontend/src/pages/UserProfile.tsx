import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import PersonalSidebar from "@/components/PersonalSidebar"
import Post from "@/components/ui/post"
import { formatRelativeTime } from "@/lib/timeUtils"
import GRP1 from "../assets/GRP1.jpg"

interface UserProfile {
  id: number
  username: string
  displayName: string
  profilePicture?: string
  bio?: string | null
  dateOfBirth?: string | null
  email: string
}

interface CommentData {
  id: number
  postId: number
  authorId: number
  content: string
  createdAt: string
  username: string
  handle: string
}

interface RawComment {
  id: number
  postId: number
  userId?: number
  content: string
  createdAt: string
}

interface PostData {
  id: number
  username: string
  handle: string
  time: string
  text: string
  image?: string
  isLiked: boolean
  isBookmarked: boolean
  isReshared: boolean
  commentCount: number
  authorId: number
  likeCount: number
  reshareCount: number
  comments: CommentData[]
  showComments: boolean
}

interface RawPost {
  id: number
  content: string
  createdAt: string
  imageUrl?: string
  user?: {
    id: number
    username: string
    displayName: string
  }
}

interface User {
  id: number
  username: string
  displayName: string
  email: string
  profilePicture: string
  bio: string
}

interface FollowRelation {
  id: number
  followerId: number
  followedId: number
  followedAt: string
}

const UserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userCache = new Map<number, { username: string; displayName: string }>()
  const [reshares, setReshares] = useState<PostData[]>([])
  const [commentedPosts, setCommented] = useState<PostData[]>([])
  const [likedPosts, setLikedPosts] = useState<PostData[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostData[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [followingUsers, setFollowingUsers] = useState<User[]>([])

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

  const fetchFollowing = async (userId: number, allUsers: User[]) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/following/${userId}`, {
        method: "GET",
        credentials: "include",
      })
      const data: FollowRelation[] = await res.json()
      const followedUserIds = data.map((relation) => relation.followedId)
      const followedUsers = allUsers.filter((user) => followedUserIds.includes(user.id))
      setFollowingUsers(followedUsers)
    } catch (err) {
      console.error("Failed to fetch following users", err)
    }
  }

  const fetchFollowers = async (userId: number, allUsers: User[]) => {
    try {
      const res = await fetch(`${API_URL}/api/follow/followers/${userId}`, {
        method: "GET",
        credentials: "include",
      })
      const data: FollowRelation[] = await res.json()
      const followerUserIds = data.map((relation) => relation.followerId)
      const followerUsers = allUsers.filter((user) => followerUserIds.includes(user.id))
      setFollowers(followerUsers)
    } catch (err) {
      console.error("Failed to fetch followers", err)
    }
  }

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/user/all`, {
      method: "GET",
      credentials: "include",
    })
    return await res.json()
  }

  const fetchResharedPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reshares`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Failed to fetch reshares: ${res.status}`)
      const resharedList: { id: number; userId: number; postId: number; resharedAt: string }[] = await res.json()

      const resharedPosts = await Promise.all(
        resharedList.map(async (reshare) => {
          const postRes = await fetch(`${API_URL}/api/posts/${reshare.postId}`, {
            credentials: "include",
          })
          if (!postRes.ok) {
            console.warn(`Skipping reshare for missing post ID: ${reshare.postId}`)
            return null
          }
          const post: RawPost = await postRes.json()

          if (!post.user?.id) {
            console.warn("Skipping invalid post:", post)
            return null
          }

          const [commentsRes, likesCountRes, hasLikedRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
          ])

          const comments = commentsRes.ok ? await commentsRes.json() : []
          const validComments = (comments as RawComment[]).filter((c) => !!c.userId)

          const commentsWithUsers: CommentData[] = await Promise.all(
            validComments.map(async (comment: RawComment): Promise<CommentData> => {
              const userInfo = await fetchUser(comment.userId!)
              return {
                id: comment.id,
                postId: comment.postId,
                authorId: comment.userId!,
                content: comment.content,
                createdAt: comment.createdAt,
                username: userInfo.displayName,
                handle: `@${userInfo.username}`,
              }
            })
          )

          let isLiked = false
          if (hasLikedRes.ok) {
            const likeData = await hasLikedRes.json()
            isLiked = likeData === true
          }

          return {
            id: post.id,
            username: post.user.displayName,
            handle: `@${post.user.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            ...(post.imageUrl ? { image: post.imageUrl } : {}),
            isLiked,
            isBookmarked: false,
            isReshared: true,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount: 1,
            comments: commentsWithUsers,
            showComments: false,
          }
        })
      )

      const validReshares = resharedPosts.filter((p): p is PostData => p !== null)
      setReshares(validReshares)
    } catch (err) {
      console.error("Error fetching reshares:", err)
      setError("Failed to load reshared posts.")
    }
  }

  const fetchCommentedPosts = async (userId: number) => {
  try {
    const com = await fetch(`${API_URL}/api/posts/commented/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!com.ok) {
      const errorText = await com.text();
      throw new Error(`Failed to fetch commented posts: ${com.status} ${errorText}`);
    }

    const commentedList: { id: number; content: string; imageUrl: string | null; createdAt: string }[] = await com.json();
    console.log("Fetched commented posts:", commentedList);

    if (!Array.isArray(commentedList) || commentedList.length === 0) {
      console.warn("No commented posts found for user:", userId);
      setCommented([]);
      return;
    }

    const commentedPosts = await Promise.all(
      commentedList.map(async (post) => {
        try {
          // Use fallback user data since userId is missing
          const userInfo = { id: 0, username: `user${post.id}`, displayName: `User ${post.id}` };

          const [commentsRes, likesCountRes, hasLikedRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
          ]);

          if (!commentsRes.ok) console.warn(`Failed to fetch comments for post ID ${post.id}: ${commentsRes.status}`);
          if (!likesCountRes.ok) console.warn(`Failed to fetch like count for post ID ${post.id}: ${likesCountRes.status}`);
          if (!hasLikedRes.ok) console.warn(`Failed to fetch has-liked status for post ID ${post.id}: ${hasLikedRes.status}`);

          const comments = commentsRes.ok ? await commentsRes.json() : [];
          const validComments = (comments as RawComment[]).filter((c) => c.userId && c.content);

          const commentsWithUsers: CommentData[] = (
            await Promise.all(
              validComments.map(async (comment: RawComment) => {
                try {
                  const commentUserInfo = await fetchUser(comment.userId!);
                  return {
                    id: comment.id,
                    postId: comment.postId,
                    authorId: comment.userId!,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    username: commentUserInfo.displayName,
                    handle: `@${commentUserInfo.username}`,
                  };
                } catch (err) {
                  console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
                  return null;
                }
              })
            )
          ).filter((comment): comment is CommentData => comment !== null);

          const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
          const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;

          return {
            id: post.id,
            username: userInfo.displayName,
            handle: `@${userInfo.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            ...(post.imageUrl ? { image: post.imageUrl } : {}),
            isLiked,
            isBookmarked: false,
            isReshared: false,
            commentCount: validComments.length,
            authorId: userInfo.id,
            likeCount,
            reshareCount: 0,
            comments: commentsWithUsers,
            showComments: false,
          };
        } catch (err) {
          console.warn(`Error processing post ID ${post.id}:`, err);
          return null;
        }
      })
    );

    const validComments = commentedPosts.filter((p): p is PostData => p !== null);
    setCommented(validComments);

    if (validComments.length === 0) {
      console.warn("No valid commented posts after processing.");
    }
  } catch (err) {
    console.error("Error fetching commented posts:", err);
    setError(`Failed to load commented posts: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};

  const fetchBookmarkedPosts = async (userId: number) => {
    try {
      const book = await fetch(`${API_URL}/api/bookmarks/${userId}`, {
        credentials: "include",
      })
      if (!book.ok) throw new Error(`Failed to fetch bookmarks: ${book.status}`)
      const bookmarkedList: { id: number; userId: number; postId: number; bookmarkedAt: string }[] = await book.json()

      const bookmarkedPosts = await Promise.all(
        bookmarkedList.map(async (bookmark) => {
          const postRes = await fetch(`${API_URL}/api/posts/${bookmark.postId}`, {
            credentials: "include",
          })
          if (!postRes.ok) {
            console.warn(`Skipping bookmark for missing post ID: ${bookmark.postId}`)
            return null
          }
          const post: RawPost = await postRes.json()

          if (!post.user?.id) {
            console.warn("Skipping invalid post:", post)
            return null
          }

          const [commentsRes, likesCountRes, hasLikedRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
          ])

          const comments = commentsRes.ok ? await commentsRes.json() : []
          const validComments = (comments as RawComment[]).filter((c) => !!c.userId)

          const commentsWithUsers: CommentData[] = await Promise.all(
            validComments.map(async (comment: RawComment): Promise<CommentData> => {
              const userInfo = await fetchUser(comment.userId!)
              return {
                id: comment.id,
                postId: comment.postId,
                authorId: comment.userId!,
                content: comment.content,
                createdAt: comment.createdAt,
                username: userInfo.displayName,
                handle: `@${userInfo.username}`,
              }
            })
          )

          let isLiked = false
          if (hasLikedRes.ok) {
            const likeData = await hasLikedRes.json()
            isLiked = likeData === true
          }

          return {
            id: post.id,
            username: post.user.displayName,
            handle: `@${post.user.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            ...(post.imageUrl ? { image: post.imageUrl } : {}),
            isLiked,
            isBookmarked: true,
            isReshared: false,
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount: 0,
            comments: commentsWithUsers,
            showComments: false,
          }
        })
      )

      const validBookmarks = bookmarkedPosts.filter((p): p is PostData => p !== null)
      setBookmarkedPosts(validBookmarks)
    } catch (err) {
      console.error("Error fetching bookmarks:", err)
      setError("Failed to load bookmarked posts.")
    }
  }

  const fetchLikedPosts = async (userId: number) => {
  try {
    const likesRes = await fetch(`${API_URL}/api/posts/liked/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!likesRes.ok) {
      const errorText = await likesRes.text();
      throw new Error(`Failed to fetch liked posts: ${likesRes.status} ${errorText}`);
    }

    const likedList: RawPost[] = await likesRes.json();

    if (!Array.isArray(likedList) || likedList.length === 0) {
      console.warn("No liked posts found for user:", userId);
      setLikedPosts([]);
      return;
    }

    const likedPosts = await Promise.all(
      likedList.map(async (post) => {
        try {
          if (!post.user?.id || !post.user.username || !post.user.displayName) {
            console.warn(`Invalid post data for post ID ${post.id}:`, post);
            return null;
          }

          const [commentsRes, likesCountRes, hasLikedRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
          ]);

          const comments = commentsRes.ok ? await commentsRes.json() : [];
          const validComments = (comments as RawComment[]).filter(
            (c) => c.userId && c.content
          );

          const commentsWithUsers: CommentData[] = (
            await Promise.all(
              validComments.map(async (comment: RawComment) => {
                try {
                  const userInfo = await fetchUser(comment.userId!);
                  return {
                    id: comment.id,
                    postId: comment.postId,
                    authorId: comment.userId!,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    username: userInfo.displayName,
                    handle: `@${userInfo.username}`,
                  };
                } catch (err) {
                  console.warn(`Failed to fetch user for comment ID ${comment.id}:`, err);
                  return null;
                }
              })
            )
          ).filter((comment): comment is CommentData => comment !== null);

          const isLiked = hasLikedRes.ok ? await hasLikedRes.json() : false;
          const likeCount = likesCountRes.ok ? await likesCountRes.json() : 0;

          return {
            id: post.id,
            username: post.user.displayName,
            handle: `@${post.user.username}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            ...(post.imageUrl ? { image: post.imageUrl } : {}),
            isLiked,
            isBookmarked: false, 
            isReshared: false, 
            commentCount: validComments.length,
            authorId: post.user.id,
            likeCount,
            reshareCount: 0,
            comments: commentsWithUsers,
            showComments: false,
          };
        } catch (err) {
          console.warn(`Error processing post ID ${post.id}:`, err);
          return null;
        }
      })
    );

    const validLikes = likedPosts.filter((p): p is PostData => p !== null);
    setLikedPosts(validLikes);

    if (validLikes.length === 0) {
      console.warn("No valid liked posts after processing.");
    }
  } catch (err) {
    console.error("Error fetching liked posts:", err);
    setError(`Failed to load liked posts: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};

  const fetchUser = async (userId: number) => {
    if (userCache.has(userId)) {
      return userCache.get(userId)!
    }
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch user")
      const user = await res.json()
      const validUser = {
        username: user.username || `user${userId}`,
        displayName: user.displayName || `User ${userId}`,
      }
      userCache.set(userId, validUser)
      return validUser
    } catch {
      const fallback = { username: `user${userId}`, displayName: `User ${userId}` }
      userCache.set(userId, fallback)
      return fallback
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`)
      const data: UserProfile = await res.json()
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName")
      }
      setUser(data)
      userCache.set(data.id, { username: data.username, displayName: data.displayName })
      return data
    } catch (err) {
      console.error("Error fetching user info:", err)
      setError("Failed to load user info. Please log in again.")
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async (userId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/posts/user/${userId}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`)
      const apiPosts = await res.json()

      const validPosts = (apiPosts as RawPost[]).filter((post) => {
        if (!post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post)
          return false
        }
        return true
      })

      const formattedPosts = await Promise.all(
        validPosts.map(async (post: RawPost) => {
          const [commentsRes, likesCountRes, hasLikedRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/has-liked/${post.id}`, { credentials: "include" }),
          ])

          const comments = commentsRes.ok ? await commentsRes.json() : []
          const validComments = (comments as RawComment[]).filter((comment) => {
            if (!comment.userId) {
              console.warn("Skipping comment with undefined userId:", comment)
              return false
            }
            return true
          })

          const commentsWithUsers: CommentData[] = await Promise.all(
            validComments.map(async (comment: RawComment): Promise<CommentData> => {
              const userInfo = await fetchUser(comment.userId!) 
              return {
                id: comment.id,
                postId: comment.postId,
                authorId: comment.userId!, 
                content: comment.content,
                createdAt: comment.createdAt,
                username: userInfo.displayName,
                handle: `@${userInfo.username}`,
              }
            })
          )

          let isLiked = false
          if (hasLikedRes.ok) {
            const likeData = await hasLikedRes.json()
            isLiked = likeData === true
          }

          return {
            id: post.id,
            username: post.user?.displayName || `User ${post.user?.id}`,
            handle: `@${post.user?.username || `user${post.user?.id}`}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            image: post.imageUrl,
            isLiked,
            isBookmarked: false,
            isReshared: false,
            commentCount: validComments.length,
            authorId: post.user!.id, 
            likeCount: likesCountRes.ok ? await likesCountRes.json() : 0,
            reshareCount: 0,
            comments: commentsWithUsers,
            showComments: false,
          }
        })
      )
      setPosts(formattedPosts)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError("Failed to load posts.")
    }
  }

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) ||
                  reshares.find((p) => p.id === postId) ||
                  bookmarkedPosts.find((p) => p.id === postId) ||
                  likedPosts.find((p) => p.id === postId)
      if (!post) {
        setError("Post not found.")
        return
      }
      if (!user) {
        setError("Please log in to like/unlike posts.")
        return
      }

      const updatePostState = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )

      setPosts(updatePostState)
      setReshares(updatePostState)
      setBookmarkedPosts(updatePostState)
      setLikedPosts(updatePostState)
      setCommented(updatePostState)

      const method = post.isLiked ? "DELETE" : "POST"
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Failed to ${post.isLiked ? "unlike" : "like"} post ${postId}: ${res.status} ${errorText}`)
        const revertPostState = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  isLiked: post.isLiked,
                  likeCount: post.isLiked ? p.likeCount + 1 : p.likeCount - 1,
                }
              : p
          )

        setPosts(revertPostState)
        setReshares(revertPostState)
        setBookmarkedPosts(revertPostState)
        setLikedPosts(revertPostState)
        setCommented(revertPostState)

        if (res.status === 401) {
          setError("Session expired. Please log in again.")
        } else {
          throw new Error(`Failed to ${post.isLiked ? "unlike" : "like"} post: ${errorText}`)
        }
      }

      const hasLikedRes = await fetch(`${API_URL}/api/likes/has-liked/${postId}`, {
        credentials: "include",
      })
      if (hasLikedRes.ok) {
        const likeData = await hasLikedRes.json()
        const updateLikeStatus = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: likeData === true }
              : p
          )

        setPosts(updateLikeStatus)
        setReshares(updateLikeStatus)
        setBookmarkedPosts(updateLikeStatus)
        setLikedPosts(updateLikeStatus)
        setCommented(updateLikeStatus)
      }
    } catch (err) {
      console.error("Error toggling like:", err)
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isLiked ? "unlike" : "like"} post.`)
    }
  }

  const handleBookmark = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId) ||
                  reshares.find((p) => p.id === postId) ||
                  bookmarkedPosts.find((p) => p.id === postId) ||
                  likedPosts.find((p) => p.id === postId)
      if (!post) {
        setError("Post not found.")
        return
      }
      if (!user) {
        setError("Please log in to bookmark/unbookmark posts.")
        return
      }

      const updateBookmarkState = (prevPosts: PostData[]) =>
        prevPosts.map((p) =>
          p.id === postId
            ? { ...p, isBookmarked: !p.isBookmarked }
            : p
        )

      setPosts(updateBookmarkState)
      setReshares(updateBookmarkState)
      setBookmarkedPosts(updateBookmarkState)
      setLikedPosts(updateBookmarkState)
      setCommented(updateBookmarkState)

      const method = post.isBookmarked ? "DELETE" : "POST"
      const url = post.isBookmarked ? `${API_URL}/api/bookmarks/${postId}` : `${API_URL}/api/bookmarks`
      const body = post.isBookmarked ? null : JSON.stringify({ postId })

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body,
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Failed to ${post.isBookmarked ? "unbookmark" : "bookmark"} post ${postId}: ${res.status} ${errorText}`)
        const revertBookmarkState = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isBookmarked: post.isBookmarked }
              : p
          )

        setPosts(revertBookmarkState)
        setReshares(revertBookmarkState)
        setBookmarkedPosts(revertBookmarkState)
        setLikedPosts(revertBookmarkState)
        setCommented(revertBookmarkState)

        if (res.status === 401) {
          setError("Session expired. Please log in again.")
        } else {
          throw new Error(`Failed to ${post.isBookmarked ? "unbookmark" : "bookmark"} post: ${errorText}`)
        }
      }

      const hasBookmarkedRes = await fetch(`${API_URL}/api/bookmarks/has-bookmarked/${postId}`, {
        credentials: "include",
      })
      if (hasBookmarkedRes.ok) {
        const bookmarkData = await hasBookmarkedRes.json()
        const updateBookmarkStatus = (prevPosts: PostData[]) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, isBookmarked: bookmarkData === true }
              : p
          )

        setPosts(updateBookmarkStatus)
        setReshares(updateBookmarkStatus)
        setBookmarkedPosts(updateBookmarkStatus)
        setLikedPosts(updateBookmarkStatus)
        setCommented(updateBookmarkStatus)
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err)
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isBookmarked ? "unbookmark" : "bookmark"} post.`)
    }
  }

  const handleReshare = () => {
    setError("Reshare functionality is currently unavailable.")
  }

  const handleAddComment = async (postId: number, commentText: string) => {
    if (!user) {
      setError("Please log in to comment.")
      return
    }
    if (!commentText.trim()) {
      setError("Comment cannot be empty.")
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/comments/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        credentials: "include",
        body: commentText,
      })

      if (!res.ok) throw new Error(`Failed to add comment: ${res.status}`)
      const newComment = await res.json()

      const formattedComment: CommentData = {
        id: newComment.id,
        postId: newComment.postId,
        authorId: newComment.userId || user.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        username: user.displayName,
        handle: `@${user.username}`,
      }

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
      )
      setReshares((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, formattedComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      )
      setBookmarkedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, formattedComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      )
      setLikedPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, formattedComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      )
      setCommented((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, formattedComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      )
    } catch (err) {
      console.error("Error adding comment:", err)
      setError("Failed to add comment.")
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!user) {
      setError("Please log in to delete posts.")
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/posts/del/${postId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Failed to delete post")
      const responseText = await res.text()
      if (responseText !== "Post deleted successfully") {
        throw new Error("Unexpected delete response")
      }

      setPosts(posts.filter((post) => post.id !== postId))
      setReshares(reshares.filter((post) => post.id !== postId))
      setBookmarkedPosts(bookmarkedPosts.filter((post) => post.id !== postId))
      setLikedPosts(likedPosts.filter((post) => post.id !== postId))
      setCommented(commentedPosts.filter((post) => post.id !== postId))
    } catch (err) {
      console.error("Error deleting post:", err)
      setError("Failed to delete post.")
    }
  }

  const toggleComments = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    )
    setReshares((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    )
    setBookmarkedPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    )
    setLikedPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    )
    setCommented((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    )
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const currentUser = await fetchCurrentUser()
      if (currentUser?.id) {
        await fetchUserPosts(currentUser.id)
        await fetchResharedPosts()
        await fetchBookmarkedPosts(currentUser.id)
        await fetchLikedPosts(currentUser.id)
        await fetchCommentedPosts(currentUser.id)
        const allUsers = await fetchUsers()
        await fetchFollowing(currentUser.id, allUsers)
        await fetchFollowers(currentUser.id, allUsers)
      } else {
        setError("Cannot fetch posts: User not authenticated.")
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div className="p-4 text-white">Loading profile...</div>
  if (!user) return <div className="p-4 text-black">Not logged in.</div>

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
      <PersonalSidebar />
      <main className="w-[1100px] mx-auto">
        <div className="relative">
          <div className="mt-25 dark:bg-lime-500 w-full" />
          <div className="absolute -bottom-10 left-4">
            <Avatar className="w-27 h-27 border-3 border-lime-500 dark:border-lime-500">
              <AvatarImage src={user.profilePicture || GRP1} alt={`@${user.username}`} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="pt-16 px-4">
          <div className="flex justify-between items-start">
            <div className="ml-30 mt-[-120px]">
              <h1 className="text-xl font-bold">{user.displayName || user.username}</h1>
              <p className="dark:text-gray-400">@{user.username}</p>
              <p className="mt-2 text-sm">{user.bio || "This is my bio"}</p>
            </div>
            <Link to="/edit-profile" className="flex items-center gap-3 dark:hover:text-white">
              <Button variant="outline" className="mt-[-220px] text-white bg-lime-600 dark:hover:text-black dark:text-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 dark:hover:bg-lime-500 hover:cursor-pointer">
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="mt-4 flex content-between gap-2 text-sm dark:text-gray-400">
            <Link to="/followers?tab=following" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">{followingUsers ? followingUsers.length : 0}</span> Following ·
            </Link>
            <Link to="/followers?tab=followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">{followers ? followers.length : 0}</span> Followers ·
            </Link>
            <Link to="/followers?tab=bots" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Bots ·
            </Link>
            <span className="font-medium dark:text-white">{posts.length}</span> Posts
          </div>
        </div>

        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full dark:bg-black grid-cols-5 dark:border-lime-500">
            <TabsTrigger className="dark:text-lime-500" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="re-feeds">Re-Feeds</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="comments">Comments</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-0">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            {posts.length === 0 ? (
              <div className="p-4 text-gray-400">No posts yet.</div>
            ) : (
              posts.map((post) => (
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
                    onReshare={handleReshare}
                    onDelete={() => handleDeletePost(post.id)}
                    onToggleComments={() => toggleComments(post.id)}
                    showComments={post.showComments}
                    comments={post.comments}
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                  />
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
            {reshares.length === 0 ? (
              <div className="p-4 text-gray-400">No re-feeds yet.</div>
            ) : (
              reshares.map((post) => (
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
                    onReshare={handleReshare}
                    onDelete={() => handleDeletePost(post.id)}
                    onToggleComments={() => toggleComments(post.id)}
                    showComments={post.showComments}
                    comments={post.comments}
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                  />
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
            {commentedPosts.length === 0 ? (
              <div className="p-4 text-gray-400">No commented posts yet.</div>
            ) : (
              commentedPosts.map((post) => (
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
                    onReshare={handleReshare}
                    onDelete={() => handleDeletePost(post.id)}
                    onToggleComments={() => toggleComments(post.id)}
                    showComments={post.showComments}
                    comments={post.comments}
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                  />
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
            {likedPosts.length === 0 ? (
              <div className="p-4 text-gray-400">No likes yet.</div>
            ) : (
              likedPosts.map((post) => (
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
                    onReshare={handleReshare}
                    onDelete={() => handleDeletePost(post.id)}
                    onToggleComments={() => toggleComments(post.id)}
                    showComments={post.showComments}
                    comments={post.comments}
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                  />
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
            {bookmarkedPosts.length === 0 ? (
              <div className="p-4 text-gray-400">No bookmarks yet.</div>
            ) : (
              bookmarkedPosts.map((post) => (
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
                    onReshare={handleReshare}
                    onDelete={() => handleDeletePost(post.id)}
                    onToggleComments={() => toggleComments(post.id)}
                    showComments={post.showComments}
                    comments={post.comments}
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                  />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserProfile