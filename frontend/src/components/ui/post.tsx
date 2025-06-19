import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  return (
    <Card className={cn("dark:bg-gray-800 dark:border-gray-800 border-b rounded-none", className)}>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Post;