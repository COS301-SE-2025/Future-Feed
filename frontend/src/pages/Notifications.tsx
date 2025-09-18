import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonalSidebar from "@/components/PersonalSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import GRP2 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBar from "@/components/SearchBar";

// Define the notification interface
interface Notification {
  id: number;
  type: string;
  senderUserId: number;
  massage: string; // Note: Typo in API ("massage" should be "message")
  senderUsername: string;
  postId: number;
  isRead: boolean;
  createdAt: string;
}

// Define user interface
interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
}

// Simplified user info for caching
interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
}

// Cache for user data
const userCache = new Map<number, UserInfo>();

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [userProfiles, setUserProfiles] = useState<Map<number, UserInfo>>(new Map());
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Fetch user info for a single user
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

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      return null;
    }
  };

  // Fetch notifications
  const fetchNotifications = async (userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/notifications/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Unauthorized. Please log in again.");
          return;
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data: Notification[] = await response.json();
      setNotifications(data);
      setFilteredNotifications(data);

      // Fetch user profiles for all senderUserIds
      const uniqueUserIds = Array.from(new Set(data.map((n) => n.senderUserId)));
      const userPromises = uniqueUserIds.map((userId) => fetchUser(userId));
      const users = await Promise.all(userPromises);
      const userMap = new Map(users.map((user) => [user.id, user]));
      setUserProfiles(userMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize user and notifications
  useEffect(() => {
    const initializeUserAndNotifications = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        fetchNotifications(user.id);
      } else {
        setLoading(false);
      }
    };

    initializeUserAndNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setFilteredNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handlePostNavigation = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    navigate(`/post/${notification.postId}`);
  };

  // Handle notification filter from SearchBar
  const handleNotificationFilter = (query: string) => {
    if (query === "") {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((notification) => notification.type.toLowerCase() === query.toLowerCase())
      );
    }
  };

  // Apply tab filter
  const applyTabFilter = (notifications: Notification[]) => {
    if (activeTab === "all") return notifications;
    if (activeTab === "verified") return notifications.filter((notification) =>
      [3, 47].includes(notification.senderUserId)
    ); // Placeholder: Adjust for verified users
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

  // Render notification card
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
        className={`dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl ${
          !notification.isRead ? "border-l-3 border-l-blue-500" : ""
        } cursor-pointer`}
        onClick={() => handlePostNavigation(notification)}
      >
        <CardContent className="flex gap-3 items-start p-4">
          <Avatar className="w-14 h-14 border-4 border-slate-300">
            <AvatarImage src={user.profilePicture || GRP2} alt={notification.senderUsername} />
            <AvatarFallback>{notification.senderUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p>
              <span className="text-blue-400">@{notification.massage}</span>
            </p>
            <p className="text-gray-500 text-sm mt-4">{formatDate(notification.createdAt)}</p>
          </div>
          {!notification.isRead && (
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen dark:bg-blue-950 bg-gray-200 dark:text-white mx-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-blue-950 border rounded-2xl dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-lime-500 font-bold">Notifications</h1>
          <div className="">
            <SearchBar
              notifications={notifications}
              onNotificationFilter={handleNotificationFilter}
              userProfiles={userProfiles}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full p-3" onValueChange={setActiveTab}>
          <TabsList className="w-full flex justify-around dark:bg-blue-950 border dark:border-slate-200 rounded-2xl">
            <TabsTrigger value="all" className="rounded-2xl">All</TabsTrigger>
            <TabsTrigger value="verified" className="rounded-2xl">Verified</TabsTrigger>
            <TabsTrigger value="mentions" className="rounded-2xl">Mentions</TabsTrigger>
          </TabsList>

          {loading && (
            <div className="space-y-4 mt-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl">
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
                <p className="text-red-500">Error loading notifications: {error}</p>
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
              <TabsContent value="verified" className="space-y-4">
                {applyTabFilter(filteredNotifications).length > 0 ? (
                  applyTabFilter(filteredNotifications).map(renderNotification)
                ) : (
                  <p className="p-4 dark:text-gray-400">No verified activity yet.</p>
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

        <div className="w-full dark:bg-blue-950 px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:mt-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
          <WhoToFollow />
        </div>
      </aside>
    </div>
  );
};

export default Notifications;