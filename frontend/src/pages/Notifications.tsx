import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import GRP2 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/context/NotificationContext";
import type { Notification } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, CheckCircle, Trash2, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
  email: string;
}

interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

const userCache = new Map<number, UserInfo>();

const Notifications = () => {
  const { notifications, unreadCount, setNotifications, fetchNotifications, markAllAsRead, currentUserId } = useNotifications();
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [userProfiles, setUserProfiles] = useState<Map<number, UserInfo>>(new Map());
  const [showSearch, setShowSearch] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [seconds, setSeconds] = useState(3);
  const navigate = useNavigate();
  const notificationTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName");
      }
      setUser(data);
      userCache.set(data.id, { id: data.id, username: data.username, displayName: data.displayName });
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userId: number): Promise<UserInfo> => {
    if (userCache.has(userId)) {
      return userCache.get(userId)!;
    }
    try {
      const res = await fetch(`${API_URL}/api/user/${userId}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch user ${userId}: ${res.status}`);
      const user = await res.json();
      const userInfo: UserInfo = {
        id: user.id ?? userId,
        username: user.username ?? `user${userId}`,
        displayName: user.displayName ?? `User ${userId}`,
        profilePicture: user.profilePicture ?? GRP2,
      };
      userCache.set(userId, userInfo);
      return userInfo;
    } catch (err) {
      console.warn(`Error fetching user ${userId}:`, err);
      const userInfo: UserInfo = {
        id: userId,
        username: `user${userId}`,
        displayName: `User ${userId}`,
        profilePicture: GRP2,
      };
      userCache.set(userId, userInfo);
      return userInfo;
    }
  };

  useEffect(() => {
    const initializeNotifications = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      if (currentUserId) {
        setLoading(true);
        await fetchNotifications(currentUserId);
        setLoading(false);
      } else {
        setError("User not authenticated. Please log in.");
        setLoading(false);
      }
    };

    initializeNotifications();
  }, [currentUserId, fetchNotifications, fetchCurrentUser]);

  useEffect(() => {
    setFilteredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const uniqueUserIds = Array.from(new Set(notifications.map((n) => n.senderUserId)));
      const userPromises = uniqueUserIds.map((userId) => fetchUser(userId));
      const users = await Promise.all(userPromises);
      const userMap = new Map(users.map((user) => [user.id, user]));
      setUserProfiles(userMap);
    };

    if (notifications.length > 0) {
      fetchUserProfiles();
    }
  }, [notifications, fetchUser]);

  useEffect(() => {
    if (!user && seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!user && seconds === 0) {
      navigate("/login", { replace: true });
    }
  }, [user, seconds, navigate]);

  const markAsRead = async (notificationId: number) => {
    if (!currentUserId) {
      setError("Please log in to mark notifications as read.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read?userId=${currentUserId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      setNotifications((prev: Notification[]) =>
        prev.map((notification: Notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to mark notification as read.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!currentUserId) {
      setError("Please log in to delete notifications.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}?userId=${currentUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Notification not found or you don't have permission to delete it");
        }
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      setNotifications((prev: Notification[]) =>
        prev.filter((notification: Notification) => notification.id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err instanceof Error ? err.message : "Failed to delete notification.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePostNavigation = (notification: Notification) => {
    const interactionTypes = ["LIKE", "COMMENT", "BOOKMARK", "RESHARE"];

    if (interactionTypes.includes(notification.type) && notification.postId) {
      navigate(`/post/${notification.postId}`);
      if (!notification.isRead && currentUserId) {
        const timer = setTimeout(() => {
          markAsRead(notification.id);
          notificationTimers.current.delete(notification.id);
        }, 1000);
        notificationTimers.current.set(notification.id, timer);
      }
    } else if (!notification.postId && interactionTypes.includes(notification.type)) {
      setError("This notification does not link to a post.");
      setTimeout(() => setError(null), 3000);
    } else {
      if (["FOLLOW", "UNFOLLOW", "MENTION"].includes(notification.type)) {
        navigate(`/profile/${notification.senderUserId}`);
      }
    }
  };

  const handleNotificationFilter = (query: string, userId?: number) => {
    if (query === "" && !userId) {
      setFilteredNotifications(notifications);
    } else if (userId) {
      setFilteredNotifications(
        notifications.filter((notification) => notification.senderUserId === userId)
      );
      setActiveTab("all");
    } else {
      setFilteredNotifications(
        notifications.filter((notification) => notification.type.toLowerCase() === query.toLowerCase())
      );
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      setFilteredNotifications(notifications);
    }
  };

  const applyTabFilter = (notifications: Notification[]) => {
    if (activeTab === "all") return notifications;
    if (activeTab === "interactions") return notifications.filter((notification) =>
      ["LIKE", "COMMENT", "BOOKMARK", "RESHARE", "FOLLOW", "UNFOLLOW"].includes(notification.type)
    );
    if (activeTab === "mentions") return notifications.filter((notification) =>
      notification.type === "MENTION"
    );
    return notifications;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderNotification = (notification: Notification) => {
    const user = userProfiles.get(notification.senderUserId) || {
      id: notification.senderUserId,
      username: notification.senderUsername,
      displayName: notification.senderUsername,
      profilePicture: GRP2,
    };

    return (
      <Card
        key={notification.id}
        className="dark:bg-indigo-950 dark:text-white future-feed:text-white border dark:border-slate-200 rounded-2xl cursor-pointer group relative future-feed:border-2 future-feed:text-white dark:border-2"
      >
        <CardContent
          className="flex gap-3 items-start p-5"
          onClick={() => handlePostNavigation(notification)}
        >
          <Avatar className="w-14 h-14 border-4 border-slate-300">
            <AvatarImage src={user.profilePicture || GRP2} alt={notification.senderUsername} />
            <AvatarFallback>{notification.senderUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p>
              <span className="future-feed:text-lime text-blue-400">@{notification.senderUsername}</span>{" "}
              {notification.massage}
            </p>
            <p className="text-gray-500 text-sm mt-4 future-feed:text-lime">{formatDate(notification.createdAt)}</p>
          </div>
          {!notification.isRead && (
            <div className="w-4 h-4 rounded-full bg-lime-500 mt-5.5 mr-5 future-feed:bg-white"></div>
          )}
        </CardContent>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-blue-950 text-black dark:text-white p-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
            Oops! Looks like you are not logged in.
          </h1>
          <p className="text-lg">
            Redirecting to login in {seconds} second{seconds !== 1 ? "s" : ""}...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 bg-white future-feed:bg-black dark:text-white mx-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto bg-white dark:border-slate-200 future-feed:border-2 future-feed:border-lime">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 p-4 pl-4 lg:ml-[270px] min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-indigo-950 dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-white font-bold">Notifications</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-blue-950 dark:border-slate-200">
              <DropdownMenuItem
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center cursor-pointer"
              >
                <Search className="mr-2 text-lime-400" />
                {showSearch ? "Hide Search" : "Show Search"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentUserId && markAllAsRead(currentUserId)}
                disabled={unreadCount === 0}
                className="flex items-center cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4 text-lime-400" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showSearch && (
          <div className="px-3 mt-2">
            <SearchBar
              notifications={notifications}
              onNotificationFilter={handleNotificationFilter}
              userProfiles={userProfiles}
            />
          </div>
        )}

        <Tabs defaultValue="all" className="w-full p-2" onValueChange={handleTabChange}>
          <TabsList className="w-full flex justify-around dark:bg-blue-950 border dark:border-slate-200 rounded-2xl">
            <TabsTrigger value="all" className="rounded-2xl">All</TabsTrigger>
            <TabsTrigger value="interactions" className="rounded-2xl">Interactions</TabsTrigger>
            <TabsTrigger value="mentions" className="rounded-2xl">Mentions</TabsTrigger>
          </TabsList>

          {loading && (
            <div className="space-y-4 mt-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl future-feed:border-2">
                  <CardContent className="flex gap-3 items-start p-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl mt-4">
              <CardContent className="p-4 text-center">
                <p className="text-red-500">Error: {error}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setError(null)}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <>
              <TabsContent value="all" className="space-y-4">
                {applyTabFilter(filteredNotifications).length > 0 ? (
                  applyTabFilter(filteredNotifications).map(renderNotification)
                ) : (
                  <p className="p-4 dark:text-gray-400">No notifications yet.</p>
                )}
              </TabsContent>
              <TabsContent value="interactions" className="space-y-4">
                {applyTabFilter(filteredNotifications).length > 0 ? (
                  applyTabFilter(filteredNotifications).map(renderNotification)
                ) : (
                  <p className="p-4 dark:text-gray-400">No interactions yet.</p>
                )}
              </TabsContent>
              <TabsContent value="mentions" className="space-y-4">
                {applyTabFilter(filteredNotifications).length > 0 ? (
                  applyTabFilter(filteredNotifications).map(renderNotification)
                ) : (
                  <p className="p-4 dark:text-gray-400">No mentions found.</p>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="w-full px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:sticky lg:top-0 lg:h-screen hidden lg:block mr-6.5">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhoToFollow />
        </div>
      </aside>
    </div>
  );
};

export default Notifications;