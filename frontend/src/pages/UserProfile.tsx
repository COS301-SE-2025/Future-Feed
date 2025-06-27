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

const UserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userCache = new Map<number, { username: string; displayName: string }>()

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

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
      console.log("Current User Details:", data) // Log user details
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

      const validPosts = apiPosts.filter((post: any) => {
        if (!post.user?.id) {
          console.warn("Skipping post with undefined user.id:", post)
          return false
        }
        return true
      })

      const formattedPosts = await Promise.all(
        validPosts.map(async (post: any) => {
          const [commentsRes, likesCountRes] = await Promise.all([
            fetch(`${API_URL}/api/comments/post/${post.id}`, { credentials: "include" }),
            fetch(`${API_URL}/api/likes/count/${post.id}`, { credentials: "include" }),
          ])

          const comments = commentsRes.ok ? await commentsRes.json() : []
          const validComments = comments.filter((comment: any) => {
            if (!comment.userId) {
              console.warn("Skipping comment with undefined userId:", comment)
              return false
            }
            return true
          })

          const commentsWithUsers = await Promise.all(
            validComments.map(async (comment: any) => {
              const user = await fetchUser(comment.userId)
              return {
                ...comment,
                authorId: comment.userId,
                username: user.displayName,
                handle: `@${user.username}`,
              }
            })
          )

          return {
            id: post.id,
            username: post.user.displayName || `User ${post.user.id}`,
            handle: `@${post.user.username || `user${post.user.id}`}`,
            time: formatRelativeTime(post.createdAt),
            text: post.content,
            image: post.imageUrl,
            isLiked: false,
            isBookmarked: false,
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
      setPosts(formattedPosts)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError("Failed to load posts.")
    }
  }

  const handleLike = async (postId: number) => {
    try {
      const post = posts.find((p) => p.id === postId)
      if (!post) return

      const method = post.isLiked ? "DELETE" : "POST"
      const res = await fetch(`${API_URL}/api/likes/${postId}`, {
        method,
        credentials: "include",
      })

      if (!res.ok) throw new Error(`Failed to ${post.isLiked ? "unlike" : "like"} post`)
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
      )
    } catch (err) {
      console.error("Error toggling like:", err)
      setError(`Failed to ${posts.find((p) => p.id === postId)?.isLiked ? "unlike" : "like"} post.`)
    }
  }

  const handleBookmark = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    )
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
  }

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await fetchCurrentUser()
      if (currentUser?.id) { // Only fetch posts if currentUser is valid
        await fetchUserPosts(currentUser.id)
      } else {
        setError("Cannot fetch posts: User not authenticated.")
      }
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
            <Link to="/followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Following ·
            </Link>
            <Link to="/followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Followers ·
            </Link>
            <Link to="/followers" className="flex items-center gap-3 hover:underline cursor-pointer">
              <span className="font-medium dark:text-white">0</span> Bots ·
            </Link>
            <span className="font-medium dark:text-white">{posts.length}</span> Posts
          </div>
        </div>

        <Separator className="my-4 bg-lime-500 dark:bg-lime-500" />

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full dark:bg-black grid-cols-5 dark:border-lime-500">
            <TabsTrigger className="dark:text-lime-500" value="posts">Posts</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="replies">Replies</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="media">Media</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="likes">Likes</TabsTrigger>
            <TabsTrigger className="dark:text-lime-500" value="highlights">Highlights</TabsTrigger>
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
                    show BSAuthenticationError: Failed to authenticate user
Comments={post.showComments}
                    comments={post.comments}
                    isUserLoaded={!!user}
                    currentUser={user}
                    authorId={post.authorId}
                  />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="replies">
            <div className="p-4 dark:text-gray-400">No replies yet.</div>
          </TabsContent>
          <TabsContent value="media">
            <div className="p-4 dark:text-gray-400">No media yet.</div>
          </TabsContent>
          <TabsContent value="likes">
            <div className="p-4 dark:text-gray-400">No liked posts yet.</div>
          </TabsContent>
          <TabsContent value="highlights">
            <div className="p-4 dark:text-gray-400">No highlights available yet.</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserProfile