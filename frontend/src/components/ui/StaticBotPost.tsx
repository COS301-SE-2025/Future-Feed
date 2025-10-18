import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2, ArrowLeft, Share2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/timeUtils";
import { FaRobot } from "react-icons/fa";

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
      setTimeout(() => setIsCopied(false), 3000);
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
    <Card
      className={cn(
        "border-2 border-rose-gold-accent-border future-feed:border-lime rounded-2xl my-2 sm:my-4 md:my-6 mx-2 sm:mx-4",
        "max-w-full pb-16 lg:pb-6",
        className
      )}
    >
      {isCopied && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs sm:text-sm px-3 py-1 rounded-full z-10">
          Link copied!
        </div>
      )}
      <CardContent className="p-3 sm:p-4 md:p-6">
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
        <div className="flex gap-3 sm:gap-4 md:gap-6">
          <Avatar
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 hover:cursor-pointer flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick();
            }}
          >
            <AvatarImage src={profilePicture} alt={handle} />
            <AvatarFallback className="text-xs sm:text-sm">
              <FaRobot className="h-8 w-8 text-gray-500" aria-label="Bot post profile" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <h2
                  className="font-bold text-sm sm:text-base hover:cursor-pointer hover:underline future-feed:text-white truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick();
                  }}
                >
                  {username || "Unknown User"}
                </h2>
                <FaRobot className="h-6 w-6 text-gray-500" aria-label="Bot post indicator" />
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs sm:text-sm future-feed:text-white whitespace-nowrap">
                  {time}
                </span>
                {currentUser && currentUser.id === authorId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-500 hover:bg-lime-200 hover:text-red-600 p-1 sm:p-2"
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                )}
              </div>
            </div>
            <p
              className="text-xs sm:text-sm future-feed:text-white mt-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick();
              }}
            >
              {handle || "@unknown"}
            </p>
            <p className="mt-2 text-sm sm:text-base future-feed:text-white break-words">
              {text}
            </p>
            {image && (
              <div className="mt-3 sm:mt-4">
                <img
                  src={image}
                  alt="Post"
                  className="rounded-lg border future-feed:border-lime w-full h-auto max-h-[400px] object-contain"
                />
              </div>
            )}
            <div className="flex flex-wrap justify-between mt-3 sm:mt-4 gap-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 min-w-[80px] sm:min-w-[100px]",
                  isLiked ? "text-red-500" : "text-gray-500",
                  "hover:text-red-500 hover:cursor-pointer"
                )}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart
                  className={cn("h-4 w-4 sm:h-5 sm:w-5 future-feed:text-white", isLiked && "fill-current")}
                />
                <span className="hidden xs:inline text-xs sm:text-sm future-feed:text-white">Like</span>
                <span className="text-xs sm:text-sm ml-0.5 future-feed:text-white">{likeCount}</span>
              </Button>

              {/* Comment Button */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2 py-1 min-w-[80px] sm:min-w-[100px]",
                  showComments ? "text-blue-500" : "text-gray-500",
                  "hover:text-blue-500"
                )}
                aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 future-feed:text-white" />
                <span className="hidden xs:inline text-xs sm:text-sm">Comment</span>
                <span className="text-xs sm:text-sm ml-0.5">{commentCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onReshare}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 min-w-[80px] sm:min-w-[100px]",
                  isReshared ? "text-green-500" : "text-gray-500",
                  "hover:text-green-500 hover:cursor-pointer"
                )}
                aria-label={isReshared ? "Unreshare post" : "Reshare post"}
              >
                <Repeat2 className="h-4 w-4 sm:h-5 sm:w-5 future-feed:text-white" />
                <span className="hidden xs:inline text-xs sm:text-sm future-feed:text-white">Re-Feed</span>
                <span className="text-xs sm:text-sm ml-0.5 future-feed:text-white">{reshareCount}</span>
              </Button>

              {/* Share Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 min-w-[80px] sm:min-w-[100px] text-gray-500 hover:text-green-500 hover:cursor-pointer"
                    )}
                    aria-label="Share post"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5 future-feed:text-white" />
                    <span className="hidden xs:inline text-xs sm:text-sm future-feed:text-white">Share</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-w-[90vw] border-2 border-rose-gold-accent-border future-feed:border-lime">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={postUrl}
                      readOnly
                      className="flex-1 p-2 bg-gray-100 text-sm rounded border future-feed:border-lime w-full"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-blue-500 text-white hover:bg-blue-600 w-full sm:w-auto hover:cursor-pointer"
                      aria-label="Copy link"
                    >
                      Copy
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Bookmark Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmark}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 min-w-[80px] sm:min-w-[100px]",
                  isBookmarked ? "text-yellow-500" : "text-gray-500",
                  "hover:text-yellow-500"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark
                  className={cn("h-4 w-4 sm:h-5 sm:w-5 future-feed:text-white", isBookmarked && "fill-current")}
                />
                <span className="hidden xs:inline text-xs sm:text-sm future-feed:text-white">Bookmark</span>
              </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4 pb-2 ml-2 mr-2 border-b border-gray-200"></div>
                {comments.length > 0 ? (
                  <div className="mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 mb-3 p-2 rounded-lg bg-gray-50">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={comment.profilePicture} alt={comment.handle} />
                          <AvatarFallback>{getInitials(comment.username)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="font-bold text-sm sm:text-base">{comment.username || "Unknown User"}</h2>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm mt-1">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 mb-4 rounded-lg bg-gray-50">
                    <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}

                <div className="mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Add a comment
                  </label>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder={isUserLoaded ? "Write your comment here..." : "Please log in to comment"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full hover:border-white resize-none border-2 text-xs sm:text-sm border-blue-500"
                    rows={2}
                    disabled={!isUserLoaded}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmitComment();
                    }}
                    className="text-xs sm:text-sm rounded-full mt-3 bg-blue-500 hover:cursor-pointer hover:bg-blue-600"
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