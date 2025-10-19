import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/timeUtils";
import { FaRobot } from "react-icons/fa";

interface BotProfile {
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
  currentUser: BotProfile | null;
  authorId: number;
  topics: Topic[];
}

const BotPost: React.FC<PostProps> = ({
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
        "bg-card future-feed:text-white border-2 border- hover:bg-slate-200 rounded-2xl mt-3 mb-4 cursor-pointer relative group",
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
              <AvatarFallback>
                  <FaRobot
                    className=" h-8 w-8 text-gray-500"
                    aria-label="Bot post profile"
                  />
                </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 
                  className="font-bold text-sm sm:text-base hover:cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick();
                  }}
                >
                  {username || "Unknown User"}
                </h2>
                <FaRobot
                  className="ml-2 h-8 w-8 text-gray-500"
                  aria-label="Bot post indicator"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm future-feed:text-white whitespace-nowrap transition-all duration-200 ${isHovered && currentUser && currentUser.id === authorId ? 'mr-8' : 'mr-0'}`}>
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
                    className={`absolute top-3 right-2 h-6 w-6 p-1 text-red-500 hover:bg-slate-300 hover:text-red-600 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p 
              className="text-xs sm:text-sm mt-[-2px]"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick();
              }}
            >
              {handle || "@unknown"}
            </p>
            <p className="mt-2 text-sm sm:text-base max-w-full mr-10" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', textAlign: 'justify' }}>
              {text}
            </p>
            {topics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic.id}
                    className="inline-block border bg-blue-500 text-white text-xs sm:text-sm px-2 rounded-xl"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
            )}
            {image && (
              <img
                src={image}
                alt="BotPost"
                className="mt-4 rounded-lg border max-w-full h-auto"
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
                  isLiked ? "text-red-500" : "text-gray-500",
                  "hover:text-red-500 "
                )}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-current")} />
                <span className="hidden xl:inline">Like</span>
                <span className="ml-1">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComments();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs sm:text-sm",
                  commentCount > 0 ? "text-blue-500" : "text-gray-500",
                  "hover:text-gray-500"
                )}
                aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <div className="relative">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="hidden xl:inline">Comment</span>
                <span className="ml-1">{commentCount}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onReshare();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs sm:text-sm",
                  isReshared ? "text-green-500" : "text-gray-500 ",
                  "hover:text-green-500"
                )}
                aria-label={isReshared ? "Unreshare post" : "Reshare post"}
              >
                <Repeat2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xl:inline">Re-Feed</span>
                <span className="ml-1">{reshareCount}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 text-xs sm:text-sm",
                  isBookmarked ? "text-yellow-500" : "text-gray-500",
                  "hover:text-yellow-500"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark className={cn("h-4 w-4 sm учебное пособие sm:h-5 sm:w-5", isBookmarked && "fill-current")} />
                <span className="hidden xl:inline">Bookmark</span>
              </Button>
            </div>
            {showComments && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4 pb-2 ml-2 border-b border-gray-200">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-sm text-gray-700">
                    Comments
                  </h3>
                </div>

                {comments.length > 0 ? (
                  <div className="mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 mb-3 p-2 rounded-lg bg-gray-50 ">
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

                {/* Add "Add a comment" label */}
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
                    className="text-xs sm:text-sm bg-blue-500 hover:cursor-pointer hover:bg-blue-600"
                    disabled={!newComment.trim() || !isUserLoaded}
                  >
                    Post
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

export default BotPost;