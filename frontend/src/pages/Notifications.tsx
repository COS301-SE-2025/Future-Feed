import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/notifications", {
        credentials: "include", // keep JSESSIONID
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Delete all notifications
  const clearAllNotifications = async () => {
    try {
      await fetch("http://localhost:8080/api/notifications", {
        method: "DELETE",
        credentials: "include",
      });
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <p className="text-center p-6">Loading notifications...</p>;

  return (
      <div className="max-w-2xl mx-auto mt-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-500" /> Notifications
          </h1>
          {notifications.length > 0 && (
              <Button variant="destructive" onClick={clearAllNotifications}>
                Clear All
              </Button>
          )}
        </div>

        {notifications.length === 0 ? (
            <p className="text-gray-500 text-center">No notifications yet.</p>
        ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                  <Card key={n.id} className="shadow-md">
                    <CardContent className="flex justify-between items-center p-4">
                      <div>
                        <p className="font-semibold">{n.senderUsername}</p>
                        <p className="text-gray-600 text-sm">{n.type}</p>
                        {n.postId && (
                            <p className="text-xs text-gray-500">Post ID: {n.postId}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(n.id)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  );
}
