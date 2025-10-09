import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
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

interface Topic {
  id: number;
  name: string;
}

interface PostProps {
  profilePicture?: string;
  username: string;
  handle: string;
  time: string;
  text: string;
  image?: string;
  isLiked: boolean;
  likeCount: number;
  isBookmarked: boolean;
  commentCount: number;
  isReshared: boolean;
  reshareCount: number;
  onLike: () => void;
  onBookmark: () => void;
  onAddComment: (commentText: string) => void;
  onReshare: () => void;
  onDelete: () => void;
  onNavigate: () => void;
  onProfileClick: () => void;
  className?: string;
  onToggleComments: () => void;
  showComments: boolean;
  comments: {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    createdAt: string;
    username: string;
    handle: string;
    profilePicture?: string;
  }[];
  isUserLoaded: boolean;
  currentUser: UserProfile | null;
  authorId: number;
  topics: Topic[];
  // NEW: Add loading state for image generation
  isImageLoading?: boolean;
}

const Post: React.FC<PostProps> = ({
  profilePicture,
  username,
  handle,
  time,
  text,
  image,
  isLiked,
  likeCount,
  isBookmarked,
  commentCount,
  isReshared,
  reshareCount,
  onLike,
  onBookmark,
  onAddComment,
  onReshare,
  onDelete,
  onNavigate,
  onProfileClick,
  className,
  onToggleComments,
  showComments,
  comments,
  isUserLoaded,
  currentUser,
  authorId,
  topics,
  // NEW: Add loading state for image generation
  isImageLoading = false,
}) => {
  const [newComment, setNewComment] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);

  const handleSubmitComment = () => {
    if (newComment.trim() && isUserLoaded) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const getInitials = (name: string | null | undefined) => {
    return name && typeof name === "string" && name.length > 0
      ? name.slice(0, 2).toUpperCase()
      : "NN";
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea")
    ) {
      return;
    }
    onNavigate();
  };

  return (
    <Card
      className={cn(
        "future-feed:bg-card future-feed:text-white text-black dark:bg-indigo-950 border-2 border- hover:bg-slate-200 dark:hover:bg-black rounded-2xl mt-3 mb-4 cursor-pointer relative group ",
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="sm:px-8 sm:py-1 ">
        <div className="flex gap-3 sm:gap-4">
          <Avatar
            className="h-10 w-10 sm:h-12 sm:w-12"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick();
            }}
          >
            {profilePicture ? (
              <AvatarImage
                src={profilePicture}
                alt={handle}
                onError={() => console.error(`Failed to load profile picture for ${handle}:`, profilePicture)}
              />
            ) : (
              <AvatarFallback>{getInitials(username)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 
                className="font-bold dark:text-white text-sm sm:text-base hover:cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onProfileClick();
                }}
              >
                {username || "Unknown User"}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm dark:text-gray-400 whitespace-nowrap transition-all duration-200 ${isHovered && currentUser && currentUser.id === authorId ? 'mr-8' : 'mr-0'}`}>
                  {time}
                </span>
                {currentUser && currentUser.id === authorId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className={`absolute top-3 right-2 h-6 w-6 p-1 text-red-500 hover:bg-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p 
              className="dark:text-gray-300 text-xs sm:text-sm mt-[-2px]"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick();
              }}
            >
              {handle || "@unknown"}
            </p>
            <p className="mt-2 dark:text-white text-sm sm:text-base max-w-full mr-10" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', textAlign: 'justify' }}>
              {text}
            </p>
            {topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic.id}
                    className="inline-block border dark:border-lime-400 bg-blue-500 dark:bg-lime-900 text-white dark:text-lime-200 text-xs sm:text-sm px-2 rounded-xl"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* NEW: Image section with loading state */}
            {isImageLoading ? (
              <div className="mt-4 rounded-lg border dark:border-lime-500 max-w-full h-auto flex items-center justify-center bg-gray-100 dark:bg-gray-800 min-h-[200px]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generating image...</p>
                </div>
              </div>
            ) : image ? (
              <img
                src={image}
                alt="Post"
                className="mt-4 rounded-lg max-w-full h-auto"
                onError={(e) => {
                  console.error("Failed to load post image:", image);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}

            <div className="flex flex-wrap justify-between sm:gap-4 mt-4" >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 sm:px-3",
                  isLiked ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-white",
                  "hover:text-red-500 dark:hover:text-red-400"
                )}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-current")} />

                <span className="hidden xl:inline">Like</span>
                <span className="ml-1">({likeCount})</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComments();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs sm:text-sm",
                  commentCount > 0 ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
                  "hover:text-gray-500 dark:hover:text-gray-400"
                )}
                aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <div className="relative">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="hidden xl:inline">Comment</span>
                <span className="ml-1">({commentCount})</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onReshare();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs sm:text-sm",
                  isReshared ? "text-green-500 dark:text-green-400" : "text-gray-500 dark:text-white",
                  "hover:text-green-500 dark:hover:text-green-400"
                )}
                aria-label={isReshared ? "Unreshare post" : "Reshare post"}
              >
                <Repeat2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xl:inline">Re-Feed</span>
                <span className="ml-1">({reshareCount})</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs sm:text-sm",
                  isBookmarked ? "text-yellow-500 dark:text-yellow-400" : "text-gray-500 dark:text-white",
                  "hover:text-yellow-500 dark:hover:text-yellow-400"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark className={cn("h-4 w-4 sm:h-5 sm:w-5", isBookmarked && "fill-current")} />
                <span className="hidden xl:inline">Bookmark</span>
              </Button>
            </div>
            {showComments && (
              <div className="mt-4">
                {comments.length > 0 ? (
                  <div className="mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 mb-2">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={comment.profilePicture} alt={comment.handle} />
                          <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-bold dark:text-white text-sm sm:text-base">{comment.username || "Unknown User"}</h2>
                          <p className="text-xs sm:text-sm dark:text-white line-clamp-3 max-w-full">
                            {comment.content}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No comments yet.
                  </p>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={isUserLoaded ? "Write a comment..." : "Please log in to comment"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full hover:border-white  resize-none border-2  text-xs sm:text-sm"
                    rows={2}
                    disabled={!isUserLoaded}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmitComment();
                    }}
                    className=" text-xs sm:text-sm"
                    disabled={!newComment.trim() || !isUserLoaded}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;