import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2, ArrowLeft, Share2, Bot } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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

interface PostProps {
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
  onProfileClick: () => void;
  className?: string;
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
  profilePicture?: string;
  postId: number;
  botId: number;
}

const StaticBotPost: React.FC<PostProps> = ({
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
  onProfileClick,
  className,
  showComments,
  comments,
  isUserLoaded,
  currentUser,
  authorId,
  profilePicture,
}) => {
  const [newComment, setNewComment] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);
  const navigate = useNavigate();

  const postUrl = window.location.href;

  const handleSubmitComment = () => {
    if (newComment.trim() && isUserLoaded) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleBack = () => {
    if (!currentUser || window.history.length <= 2) {
      navigate("/home");
    } else {
      navigate(-1);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000); // Hide pill after 3 seconds
    }).catch((err) => {
      console.error("Failed to copy link:", err);
    });
  };

  const getInitials = (name: string | null | undefined) => {
    return name && typeof name === "string" && name.length > 0
      ? name.slice(0, 2).toUpperCase()
      : "NN";
  };

  return (
    <Card className={cn("dark:bg-indigo-950 border-2 border-rose-gold-accent-border future-feed:border-lime rounded-2xl my-4 sm:my-6", className)}>
      {isCopied && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs sm:text-sm px-3 py-1 rounded-full z-10">
          Link copied!
        </div>
      )}
      <CardContent className="p-4 sm:p-6 ">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-gray-500 dark:text-white hover:text-lime-500 dark:hover:text-lime-400 p-1 sm:p-2 mb-2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4 future-feed:text-lime sm:h-5 sm:w-5" />
          <span className="hidden sm:inline text-sm ml-1 future-feed:text-white">Back</span>
        </Button>
        <div className="flex gap-4 sm:gap-6x">
          <Avatar 
            className="h-10 w-10 sm:h-12 sm:w-12 hover:cursor-pointer"
            onClick={(e) => {
                e.stopPropagation();
                onProfileClick();
              }}
          >
            <AvatarImage src={profilePicture} alt={handle} />
            <AvatarFallback>{getInitials(username)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center"> 
              <div className="flex items-center gap-2">
                <h2 
                  className="font-bold dark:text-white text-sm sm:text-base hover:cursor-pointer hover:underline future-feed:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick();
                  }}  
                >
                  {username || "Unknown User"}
                </h2>
                <Bot
                  className="ml-2 h-8 w-8 text-lime-400"
                  aria-label="Bot post indicator"
                  />
                <div className="flex items-center gap-2">
                  <span className="ml-200 future-feed:text-white text-xs sm:text-sm dark:text-gray-400 whitespace-nowrap">
                    {time}
                  </span>
                  {currentUser && currentUser.id === authorId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      className="text-red-500 hover:bg-lime-200 hover:text-red-600 dark:hover:text-red-400 p-1 sm:p-2"
                      aria-label="Delete post"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <p 
              className="dark:text-gray-300 text-xs sm:text-sm future-feed:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick();
              }}
            >
                {handle || "@unknown"}
            </p>
            <p className="mt-2 dark:text-white text-sm sm:text-base future-feed:text-white">{text}</p>
            {image && (
              <img
                src={image}
                alt="Post"
                className="mt-4 rounded-lg border  future-feed:border-lime max-w-full h-auto"
              />
            )}
            <div className="flex flex-wrap justify-between mt-4 gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={cn(
                  "flex items-center gap-2 px-3 py-2",
                  isLiked ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-white",
                  "hover:text-red-500 dark:hover:text-red-400"
                )}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6 future-feed:text-white", isLiked && "fill-current")} />
                <span className="hidden sm:inline text-sm future-feed:text-white">Like</span>
                <span className="text-xs sm:text-sm ml-1 future-feed:text-white">({likeCount})</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2 py-1 sm:px-3",
                  showComments ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-white",
                  "hover:text-blue-500 dark:hover:text-blue-400"
                )}
                aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 future-feed:text-white" />
                <span className="hidden sm:inline text-sm">Comment</span>
                <span className="text-xs sm:text-sm ml-1">({commentCount})</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onReshare}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 sm:px-3",
                  isReshared ? "text-green-500 dark:text-green-400" : "text-gray-500 dark:text-white",
                  "hover:text-green-500 dark:hover:text-green-400"
                )}
                aria-label={isReshared ? "Unreshare post" : "Reshare post"}
              >
                <Repeat2 className="h-5 w-5 sm:h-6 sm:w-6 future-feed:text-white" />
                <span className="hidden sm:inline text-sm future-feed:text-white">Re-Feed</span>
                <span className="text-xs sm:text-sm ml-1 future-feed:text-white">({reshareCount})</span>
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 sm:px-3 text-gray-500 dark:text-white hover:text-lime-500 dark:hover:text-lime-400"
                    )}
                    aria-label="Share post"
                  >
                    <Share2 className="h-5 w-5 sm:h-6 sm:w-6 future-feed:text-white" />
                    <span className="hidden sm:inline text-sm future-feed:text-white">Share</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 dark:bg-indigo-950 border-2 border-rose-gold-accent-border future-feed:border-lime">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={postUrl}
                      readOnly
                      className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 text-sm rounded border  future-feed:border-lime"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-blue-500 text-white hover:bg-lime-600"
                      aria-label="Copy link"
                    >
                      Copy
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmark}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 sm:px-3",
                  isBookmarked ? "text-yellow-500 dark:text-yellow-400" : "text-gray-500 dark:text-white",
                  "hover:text-yellow-500 dark:hover:text-yellow-400"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark className={cn("h-5 w-5 sm:h-6 sm:w-6 future-feed:text-white", isBookmarked && "fill-current")} />
                <span className="hidden sm:inline text-sm future-feed:text-white">Bookmark</span>
              </Button>
            </div>
            
            {showComments && (
              <div className="mt-4">
                {comments.length > 0 ? (
                  <div className="mb-4">
                    {comments.map((comment) => (

                      <div key={comment.id} className="flex gap-2 mb-6 mt-10">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={comment.profilePicture} alt={comment.handle} />
                          <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-bold future-feed:text-white  dark:text-white text-sm sm:text-base">{comment.username || "Unknown User"}</h2>
                          <p className="text-xs future-feed:text-white sm:text-sm dark:text-gray-300">{comment.handle || "@unknown"}</p>
                          <p className="text-xs sm:text-sm dark:text-white future-feed:text-white">{comment.content}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 future-feed:text-white ">
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
                    className="lg:w-full w-full mr-4 dark:border-slate-200 future-feed:border-lime dark:bg-indigo-950 future-feed:bg-black hover:border-white dark:text-white  future-feed:border-lime resize-none border-2 border-rose-gold-accent-border future-feed:border-lime text-xs sm:text-sm future-feed:text-white "
                    rows={2}
                    disabled={!isUserLoaded}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    className="bg-blue-500 mt-3 mr-4 text-white hover:bg-lime-600 text-xs sm:text-sm"
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

export default StaticBotPost;