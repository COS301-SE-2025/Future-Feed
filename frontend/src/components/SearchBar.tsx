import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import GRP2 from "../assets/GRP1.jpg";
import type { Notification } from "@/context/NotificationContext"; // Use type-only import

// Define simplified user interface for search results
interface UserSearchResult {
  id: number;
  username: string;
  profilePicture?: string;
}

interface SearchBarProps {
  notifications: Notification[];
  onNotificationFilter: (query: string, userId?: number) => void;
  userProfiles: Map<number, UserSearchResult>;
}

const SearchBar = ({ notifications, onNotificationFilter, userProfiles }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Extract unique users from notifications
  const uniqueUsers: UserSearchResult[] = Array.from(
    new Map(
      notifications.map((notification) => {
        const user = userProfiles.get(notification.senderUserId) || {
          id: notification.senderUserId,
          username: notification.senderUsername,
          profilePicture: GRP2,
        };
        return [notification.senderUserId, user];
      })
    ).values()
  );

  // Filter users based on query
  const filteredUsers = query.trim()
    ? uniqueUsers.filter((user) =>
        user.username.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    const notificationTypes = ["mention", "like", "follow", "comment", "bookmark", "unfollow"];
    if (notificationTypes.includes(value.toLowerCase())) {
      onNotificationFilter(value.toUpperCase());
    } else {
      onNotificationFilter("");
    }
  };

  const handleUserClick = (userId: number) => {
    setQuery("");
    setIsFocused(false);
    onNotificationFilter("", userId); // Filter notifications by user
    navigate("/notifications"); // Ensure we're on the notifications page
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className=" absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-500" size={22} />
        <Input
          type="text"
          placeholder="Search notifications"
          value={query}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow clicks
          className="rounded-full bg-white dark:bg-blue-950 dark:text-white dark:placeholder:text-lime-500 border-l-4 border-b-4 border-l-gray-300 border-b-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 pl-10"
        />
      </div>

      {isFocused && query.trim() && filteredUsers.length > 0 && (
        <Card className="absolute z-20 w-full mt-2 dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl">
          <CardContent className="p-2">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex gap-3 items-center p-2 hover:bg-lime-400 rounded-lg cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.profilePicture || GRP2} alt={user.username} />
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;