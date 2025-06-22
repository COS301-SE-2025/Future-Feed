import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: number;
  username: string;
  text: string;
  time: string;
}

interface PostProps {
  username: string;
  handle: string;
  time: string;
  text: string;
  image?: string;
  className?: string;
}

const Post: React.FC<PostProps> = ({ username, handle, time, text, image, className }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleToggleComments = () => {
    setIsCommentOpen(!isCommentOpen);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: comments.length + 1,
        username: "CurrentUser",
        text: newComment,
        time: "Just now",
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  return (
    <Card className={cn("dark:bg-black border-2 border-lime-500 rounded-2xl mt-3 mb-4", className)}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={image || "https://via.placeholder.com/40"} />
            <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <h2 className="font-bold dark:text-white">{username}</h2>
              <span className="text-sm dark:text-white">{time}</span>
            </div>
            <p className="dark:text-white">{handle}</p>
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
                onClick={handleLike}
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
                onClick={handleToggleComments}
                className={cn(
                  "flex items-center gap-2",
                  isCommentOpen ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-white",
                  "hover:text-blue-500 dark:hover:text-blue-400"
                )}
                aria-label={isCommentOpen ? "Hide comments" : "Show comments"}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Comment ({comments.length})</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  "text-gray-500 dark:text-white hover:text-green-500 dark:hover:text-green-400"
                )}
                aria-label="Retweet post"
              >
              
                <span className="text-sm">Re-Feed</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
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
            {isCommentOpen && (
              <div className="mt-4">
                <div className="flex gap-2 mb-4">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full dark:bg-black dark:text-white dark:border-lime-500 resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleAddComment}
                    className="bg-lime-500 text-white hover:bg-lime-600"
                    disabled={!newComment.trim()}
                  >
                    Comment
                  </Button>
                </div>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://via.placeholder.com/32" />
                        <AvatarFallback>{comment.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <span className="font-bold dark:text-white text-sm">{comment.username}</span>
                          <span className="text-xs dark:text-white">{comment.time}</span>
                        </div>
                        <p className="dark:text-white text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm dark:text-white">No comments yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;