// src/pages/Notifications.tsx
import { useState, useEffect } from "react";
import PersonalSidebar from "@/components/PersonalSidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import GRP2 from "../assets/GRP1.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import WhoToFollow from "@/components/WhoToFollow"
import WhatsHappening from "@/components/WhatsHappening"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

// Define the notification interface
interface Notification {
  id: number;
  type: string;
  senderUserId: number;
  massage: string; // Note: This appears to be a typo in the API (should be "message")
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

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      setError("Failed to load user info. Please log in again.");
      setCurrentUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeUserAndNotifications = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        fetchNotifications(user.id);
      }
    };

    initializeUserAndNotifications();
  }, []);

  const fetchNotifications = async (userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/notifications/${userId}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("access_token")}` 
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "verified") return notification.type === "VERIFIED"; // Adjust based on your API
    if (activeTab === "mentions") return notification.type === "MENTION"; // Adjust based on your API
    return true;
  });

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("access_token")}` 
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`${API_URL}/api/notifications/${currentUser.id}/read-all`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("access_token")}` 
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return (
    <div className="flex future-feed:bg-black future-feed:text-lime  min-h-screen bg-gray-200 dark:bg-blue-950 dark:text-white">
      <aside className="  lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      {/* Center Notification Feed */}
      <main className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto ">
        {/* Search for mobile */}
        <div className="block lg:hidden px-4 py-3 sticky top-0 z-10  bg-black dark:bg-blue-950  dark:border-slate-200">
          <Input
            type="text"
            placeholder="Search"
            className="rounded-full bg-black dark:bg-blue-950 dark:text-white dark:placeholder:text-lime-500 border-lime-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 sticky top-0 dark:bg-blue-950 border rounded-2xl dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-lime-500 font-bold">Notifications</h1>
          <div className="flex items-center gap-2">
            <Settings size={20} className="dark:text-lime-500" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full p-3" onValueChange={setActiveTab}>
          <TabsList className="w-full flex justify-around dark:bg-blue-950 border dark:border-slate-200 rounded-2xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>

          {/* Loading state */}
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

          {/* Error state */}
          {error && (
            <Card className="dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl mt-4">
              <CardContent className="p-4 text-center">
                <p className="text-red-500">Error loading notifications: {error}</p>
              </CardContent>
            </Card>
          )}
          {/* Notifications content */}
          {!loading && !error && (
            <>
              <TabsContent value="all" className="space-y-4 mt-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => (
                    <Card 
                      key={notification.id} 
                      className={`dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <CardContent className="flex gap-3 items-start p-4">
                        <Avatar className="w-14 h-14 border-4 border-slate-300">
                          <AvatarImage src={GRP2} alt={notification.senderUsername} />
                          <AvatarFallback>{notification.senderUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p>{notification.massage}</p>
                          <p className="text-gray-500 text-sm">{formatDate(notification.createdAt)}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="p-4 dark:text-gray-400">No notifications yet.</p>
                )}
              </TabsContent>
              <TabsContent value="mentions" className="space-y-4 mt-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => (
                    <Card 
                      key={notification.id} 
                      className={`dark:bg-blue-950 dark:text-white border dark:border-slate-200 rounded-2xl ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <CardContent className="flex gap-3 items-start p-4">
                        <Avatar className="w-14 h-14 border-4 border-slate-300">
                          <AvatarImage src={GRP2} alt={notification.senderUsername} />
                          <AvatarFallback>{notification.senderUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p>{notification.massage}</p>
                          <p className="text-gray-500 text-sm">{formatDate(notification.createdAt)}</p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="p-4 dark:text-gray-400">No mentions found.</p>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
        
        {/** For mobile devices */}
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
  )
}

export default Notifications;