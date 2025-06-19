import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Card className={cn("dark:bg-gray-800 dark:border-gray-800 border rounded-2xl mt-2", className)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={image || "https://via.placeholder.com/40"} />
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
                className="mt-4 rounded-lg border dark:border-gray-700"
              />
            )}
            <div className="flex justify-between mt-4 mr-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2",
                  isLiked ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400",
                  "hover:text-red-500 dark:hover:text-red-400"
                )}
                aria-label={isLiked ? "Unlike post" : "Like post"}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                <span className="text-sm">Like</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                aria-label="Comment on post"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Comment</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
                aria-label="Retweet post"
              >
                <Repeat className="h-5 w-5" />
                <span className="text-sm">Re-Feed</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={cn(
                  "flex items-center gap-2",
                  isBookmarked ? "text-yellow-500 dark:text-yellow-400" : "text-gray-500 dark:text-gray-400",
                  "hover:text-yellow-500 dark:hover:text-yellow-400"
                )}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              >
                <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
                <span className="text-sm">Bookmark</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;