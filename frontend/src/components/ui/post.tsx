import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/timeUtils";
import palettes from 'nice-color-palettes';

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
  className,
  onToggleComments,
  showComments,
  comments,
  isUserLoaded,
  currentUser,
  authorId,
  topics,
}) => {
  const [newComment, setNewComment] = React.useState("");
 
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
        "dark:bg-[#1a1a1a] border-2 border- hover:bg-lime-200 dark:hover:bg-black rounded-2xl mt-3 mb-4 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="sm:px-8 sm:py-1 ">
        <div className="flex gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage src={profilePicture} alt={handle} />
            <AvatarFallback>{getInitials(username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="font-bold dark:text-white text-sm sm:text-base">{username || "Unknown User"}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm dark:text-gray-400 whitespace-nowrap">
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
                    className="text-red-500 hover:bg-lime-200 hover:text-red-600 dark:hover:text-red-400 p-1 sm:p-2"
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="dark:text-gray-300 text-xs sm:text-sm mt-[-2px]">{handle || "@unknown"}</p>
            <p className="mt-2 dark:text-white text-sm sm:text-base max-w-full mr-10" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', textAlign: 'justify' }}>
              {text}
            </p>
            {topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic.id}
                    className="inline-block border dark:border-lime-400 border-lime-500 bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200 text-xs sm:text-sm px-2 rounded-md"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            )}
            {image && (
              <img
                src={image}
                alt="Post"
                className="mt-4 rounded-lg border dark:border-lime-500 max-w-full h-auto"
              />
            )}

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
                  showComments ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-white",
                  "hover:text-blue-500 dark:hover:text-blue-400"
                )}
                aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
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
                          <p className="text-xs sm:text-sm dark:text-gray-300">{comment.handle || "@unknown"}</p>
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
                    className="w-full dark:bg-black hover:border-white dark:text-white dark:border-lime-500 resize-none border-2 border-lime-500 text-xs sm:text-sm"
                    rows={2}
                    disabled={!isUserLoaded}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmitComment();
                    }}
                    className="bg-lime-500 text-white hover:bg-lime-600 text-xs sm:text-sm"
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