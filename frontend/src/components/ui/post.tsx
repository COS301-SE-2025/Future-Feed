import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

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
  }[];
  isUserLoaded: boolean;
  currentUser: UserProfile | null;
}

const Post: React.FC<PostProps> = ({
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
  className,
  onToggleComments,
  showComments,
  comments,
  isUserLoaded,
  currentUser,
}) => {
  const [newComment, setNewComment] = React.useState("");

  const handleSubmitComment = () => {
    if (newComment.trim() && isUserLoaded) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <Card className={cn("dark:bg-[#1a1a1a] border-2 border-lime-500 rounded-2xl mt-3 mb-4", className)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={currentUser?.profilePicture || GRP1} alt={`@${username}`} />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <h2 className="font-bold dark:text-white">{username}</h2>
              <span className="text-sm dark:text-gray-400">{time}</span>
            </div>
            <p className="dark:text-gray-300">{handle}</p>
            <p className="mt-2 dark:text-white">{text}</p>
            {image && (
              <img
                src={image}
                alt="Post"
                className="mt-4 rounded-lg border dark:border-lime-500 max-w-full h-auto"
              />
            )}
            <div className="flex justify-between mt-4 mr-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={cn(
                  "flex items-center gap-2",
                  isLiked ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-white",
                  "hover:text-red-500 dark:hover:text-red-400"
                )}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                <span className="text-sm">Like ({likeCount})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleComments}
                className={cn(
                  "flex items-center gap-2",
                  showComments ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-white",
                  "hover:text-blue-500 dark:hover:text-blue-400"
                )}
                aria-label={showComments ? "Hide comments" : "Show comments"}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Comment ({commentCount})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReshare}
                className={cn(
                  "flex items-center gap-2",
                  isReshared ? "text-green-500 dark:text-green-400" : "text-gray-500 dark:text-white",
                  "hover:text-green-500 dark:hover:text-green-400"
                )}
                aria-label={isReshared ? "Unreshare post" : "Reshare post"}
              >
                <span className="text-sm">Re-Feed ({reshareCount})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBookmark}
                className={cn(
                  "flex items-center gap-2",
                  isBookmarked ? "text-yellow-500 dark:text-yellow-400" : "text-gray-500 dark:text-white",
                  "hover:text-yellow-500 dark:hover:text-yellow-400"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                <span className="text-sm">Bookmark</span>
              </Button>
            </div>
            {showComments && (
              <div className="mt-4">
                {comments.length > 0 ? (
                  <div className="mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 mb-2">
                        <Avatar>
                          <AvatarImage src={currentUser?.profilePicture || GRP1} alt={`@${comment.handle}`} />
                          <AvatarFallback>{comment.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-bold dark:text-white">{comment.username}</h2>
                          <p className="text-sm dark:text-gray-300">{comment.handle}</p>
                          <p className="text-sm dark:text-white">{comment.content}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No comments yet.
                  </p>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={isUserLoaded ? "Write a comment..." : "Please log in to comment"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full dark:bg-black dark:text-white dark:border-lime-500 resize-none"
                    rows={2}
                    disabled={!isUserLoaded}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    className="bg-lime-500 text-white hover:bg-lime-600"
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