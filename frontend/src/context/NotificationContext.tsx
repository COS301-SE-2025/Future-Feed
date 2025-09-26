import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface Notification {
  id: number;
  type: string;
  senderUserId: number;
  massage: string;
  senderUsername: string;
  postId?: number;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  fetchNotifications: (userId: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
  currentUserId: number | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data = await res.json();
      setCurrentUserId(data.id);
      return data.id;
    } catch (err) {
      console.error("Error fetching user info:", err);
      return null;
    }
  }, [API_URL]);

  const fetchNotifications = useCallback(
    async (userId: number) => {
      try {
        const response = await fetch(`${API_URL}/api/notifications/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized. Please log in again.");
          }
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data: Notification[] = await response.json();
        console.log("Fetched notifications:", data); // Debug log
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
      }
    },
    [API_URL]
  );

  const markAllAsRead = useCallback(
    async (userId: number) => {
      try {
        const response = await fetch(`${API_URL}/api/notifications/mark-all-read?userId=${userId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to mark all notifications as read: ${response.status}`);
        }

        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
        console.log("All notifications marked as read"); // Debug log
      } catch (err) {
        console.error("Error marking all notifications as read:", err);
      }
    },
    [API_URL]
  );

  useEffect(() => {
    const initializeNotifications = async () => {
      const userId = await fetchCurrentUser();
      if (userId) {
        await fetchNotifications(userId);
      }
    };
    initializeNotifications();
  }, [fetchCurrentUser, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, setNotifications, fetchNotifications, markAllAsRead, currentUserId }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};