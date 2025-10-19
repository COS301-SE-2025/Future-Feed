
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import PersonalSidebar from "@/components/PersonalSidebar";
import { FaTimes, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Link } from "react-router-dom";
import { Settings, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

interface Bot {
  id: number;
  name: string;
  prompt: string;
  createdAt: string;
  schedule: "hourly" | "daily" | "weekly" | "monthly";
  contextSource: string;
  isActive: boolean;
}

interface ApiBot {
  id: number;
  ownerId: number;
  name: string;
  prompt: string;
  schedule: Bot["schedule"];
  contextSource: string | null;
  createdAt: string;
  isActive: boolean;
}

interface LoadingState {
  allBots: boolean;
  toggling: Set<number>;
  creating: boolean;
  editing: boolean;
  deleting: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [activeBots, setActiveBots] = useState<Bot[]>([]);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const [newBotSchedule, setNewBotSchedule] = useState<Bot["schedule"]>("daily");
  const [newBotContextSource, setNewBotContextSource] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBotId, setDeletingBotId] = useState<number | null>(null);
  const navigate = useNavigate();
    const [loading, setLoading] = useState<LoadingState>({
    allBots: false,
    toggling: new Set<number>(),
    creating: false,
    editing: false,
    deleting: false,
  });

  useEffect(() => {
    fetchAllBots();
  }, []);

  const fetchAllBots = async () => {
    setLoading((prev) => ({ ...prev, allBots: true }));
    try {
      const res = await fetch(`${API_URL}/api/bots/my`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 401) {
          navigate("/login")
          throw new Error("Unauthorized: Please log in to view bots.");
          
        } else if (res.status === 404) {
          throw new Error("Bots endpoint not found. Please check the server configuration.");
        } else {
          throw new Error(`Failed to fetch bots: ${errorText || res.status}`);
        }
      }

      const botList: ApiBot[] = await res.json();

      const botsWithActiveStatus: Bot[] = await Promise.all(
        botList.map(async (bot) => {
          try {
            const activeRes = await fetch(`${API_URL}/api/bots/${bot.id}/active`, {
              method: "GET",
              credentials: "include",
            });
            if (!activeRes.ok) throw new Error(`Failed to fetch active status for bot ${bot.id}`);
            const isActive: boolean = await activeRes.json();
            return {
              id: bot.id,
              name: bot.name,
              prompt: bot.prompt,
              createdAt: bot.createdAt.split("T")[0],
              schedule: bot.schedule,
              contextSource: bot.contextSource || "",
              isActive,
            } as Bot;
          } catch (err) {
            console.error(`Error fetching active status for bot ${bot.id}:`, err);
            return {
              id: bot.id,
              name: bot.name,
              prompt: bot.prompt,
              createdAt: bot.createdAt.split("T")[0],
              schedule: bot.schedule,
              contextSource: bot.contextSource || "",
              isActive: bot.isActive,
            } as Bot;
          }
        })
      );

      setBots(botsWithActiveStatus);
      setActiveBots(botsWithActiveStatus.filter((b) => b.isActive));
      setError(null);
    } catch (err) {
      console.error("Error fetching bots:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bots. Please try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, allBots: false }));
    }
  };

  const toggleBotActivation = async (botId: number) => {
    setLoading((prev) => ({ ...prev, toggling: new Set([...prev.toggling, botId]) }));
    try {
      const activeRes = await fetch(`${API_URL}/api/bots/${botId}/active`, {
        method: "GET",
        credentials: "include",
      });
      if (!activeRes.ok) throw new Error(`Failed to fetch active status for bot ${botId}`);
      const currentIsActive: boolean = await activeRes.json();

      const toggleRes = await fetch(
        `${API_URL}/api/bots/${botId}/${currentIsActive ? "deactivate" : "activate"}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!toggleRes.ok) {
        const errorText = await toggleRes.text();
        throw new Error(`Failed to ${currentIsActive ? "deactivate" : "activate"} bot: ${errorText || toggleRes.status}`);
      }

      setBots((prev) => {
        const next = prev.map((b) => (b.id === botId ? { ...b, isActive: !currentIsActive } : b));
        setActiveBots(next.filter((b) => b.isActive));
        return next;
      });
      setError(null);
    } catch (err) {
      console.error(`Error toggling bot ${botId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to toggle bot status. Please try again.");
    } finally {
      setLoading((prev) => {
        const next = new Set(prev.toggling);
        next.delete(botId);
        return { ...prev, toggling: next };
      });
    }
  };

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim() || !newBotDescription.trim()) {
      setError("Bot Name and Bot Prompt are required.");
      return;
    }

    setLoading((prev) => ({ ...prev, creating: true }));
    try {
      const res = await fetch(`${API_URL}/api/bots`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBotName,
          prompt: newBotDescription,
          schedule: newBotSchedule,
          contextSource: newBotContextSource.trim() || "N/A",
          isActive: true,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in to create a bot.");
        } else if (res.status === 400 && errorText.includes("Prompt flagged as unsafe")) {
          throw new Error(`${errorText} Please use a different prompt.`);
        } else {
          throw new Error(errorText || "Failed to create bot.");
        }
      }

      const newBot: ApiBot = await res.json();
      const mapped: Bot = {
        id: newBot.id,
        name: newBot.name,
        prompt: newBot.prompt,
        createdAt: newBot.createdAt.split("T")[0],
        schedule: newBot.schedule,
        contextSource: newBot.contextSource || "",
        isActive: newBot.isActive,
      };

      setBots((prev) => {
        const next = [...prev, mapped];
        setActiveBots(next.filter((b) => b.isActive));
        return next;
      });

      setNewBotName("");
      setNewBotDescription("");
      setNewBotSchedule("daily");
      setNewBotContextSource("");
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error creating bot:", err);
      setError(err instanceof Error ? err.message : "Failed to create bot. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  const updateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot || !newBotName.trim() || !newBotDescription.trim()) {
      setError("Bot Name and Bot Prompt are required.");
      return;
    }

    setLoading((prev) => ({ ...prev, editing: true }));
    try {
      const res = await fetch(`${API_URL}/api/bots/${editingBot.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBotName,
          prompt: newBotDescription,
          schedule: newBotSchedule,
          contextSource: newBotContextSource.trim() || "N/A",
          isActive: editingBot.isActive,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in to update a bot.");
        } else if (res.status === 400 && errorText.includes("Prompt flagged as unsafe")) {
          throw new Error(`${errorText} Please use a different prompt.`);
        } else {
          throw new Error(errorText || "Failed to update bot.");
        }
      }

      const updatedBot: ApiBot = await res.json();
      const mapped: Bot = {
        id: updatedBot.id,
        name: updatedBot.name,
        prompt: updatedBot.prompt,
        createdAt: updatedBot.createdAt.split("T")[0],
        schedule: updatedBot.schedule,
        contextSource: updatedBot.contextSource || "",
        isActive: updatedBot.isActive,
      };

      setBots((prev) => {
        const next = prev.map((b) => (b.id === editingBot.id ? mapped : b));
        setActiveBots(next.filter((b) => b.isActive));
        return next;
      });

      setNewBotName("");
      setNewBotDescription("");
      setNewBotSchedule("daily");
      setNewBotContextSource("");
      setIsEditModalOpen(false);
      setEditingBot(null);
      setError(null);
    } catch (err) {
      console.error("Error updating bot:", err);
      setError(err instanceof Error ? err.message : "Failed to update bot. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, editing: false }));
    }
  };

  const deleteBot = useCallback(async () => {
    if (!deletingBotId) return;

    setLoading((prev) => ({ ...prev, deleting: true }));
    try {
      const res = await fetch(`${API_URL}/api/bots/${deletingBotId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete bot.");
      }

      setBots((prev) => prev.filter((b) => b.id !== deletingBotId));
      setShowDeleteDialog(false);
      setDeletingBotId(null);
      setError(null);
    } catch (err) {
      console.error(`Error deleting bot ${deletingBotId}:`, err);
      setError(err instanceof Error ? err.message : "Failed to delete bot.");
    } finally {
      setLoading((prev) => ({ ...prev, deleting: false }));
    }
  }, [deletingBotId]);

  const SkeletonLoader: React.FC = () => (
    <div className="grid gap-4 sm:gap-6">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className=" ">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center animate-pulse">
            <div className="w-full">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 sm:w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4 sm:w-1/5" />
            </div>
            <div className="flex gap-2 sm:gap-3 items-center mt-4 sm:mt-0">
              <div className="h-8 w-16 bg-gray-200 rounded-full" />
              <div className="h-10 w-10 bg-gray-200 rounded" />
              <div className="h-10 w-10 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white future-feed:bg-black mx-auto">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="w-full lg:flex-1 p-2 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-2 sticky top-0 z-10">
          <h1 className="text-xl font-bold">Bots Management</h1>
          <div className="flex justify-between items-center gap-4">
            <Button onClick={() => setIsCreateModalOpen(true)} className="text-white cursor-pointer">
              <FaPlus className="mr-2" /> Create Bot
            </Button>
            <Link to="/settings">
              <Settings size={20} className="text-black" />
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full p-2">
          <TabsList className="w-full flex justify-around border rounded-2xl">
            <TabsTrigger className="rounded-2xl" value="all">My Bots</TabsTrigger>
            <TabsTrigger className="rounded-2xl" value="active">Active Bots</TabsTrigger>
          </TabsList>

          {loading.allBots ? (
            <SkeletonLoader />
          ) : (
            <>
              <TabsContent value="all" className="space-y-4">
                {bots.length === 0 ? (
                  <div className="text-center text-gray-400 mt-4">No bots created yet.</div>
                ) : (
                  <div className="grid gap-4 mt-4">
                    {bots.map((bot) => (
                      <Link to={`/bot/${bot.id}`} key={bot.id}>
                        <Card className="hover:bg-gray-100 transition-colors border rounded-2xl future-feed:border-2">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-bold future-feed:text-white">{bot.name}</h3>
                              <p className="text-sm text-gray-500 ">{bot.prompt}</p>
                              <p className="text-sm text-gray-400">Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${bot.isActive ? "text-blue-500" : "text-gray-400"}`}>
                                  {bot.isActive ? "On" : "Off"}
                                </span>
                                <Switch
                                  checked={bot.isActive}
                                  onCheckedChange={() => toggleBotActivation(bot.id)}
                                  disabled={loading.toggling.has(bot.id)}
                                  className="hover:cursor-pointer w-14 h-7 bg-gray-300 rounded-full relative data-[state=checked]:bg-gray-500 hover:data-[state=checked]:bg-gray-400 transition-colors duration-300 ease-in-out"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleBotActivation(bot.id);
                                  }}
                                >
                                  <span
                                    className={`absolute h-6 w-6 rounded-full bg-black shadow-lg transform transition-transform duration-300 ease-in-out ${bot.isActive ? "translate-x-8" : "translate-x-1"
                                      } ${bot.isActive ? "bg-blue-500" : "bg-gray-200"}`}
                                  />
                                </Switch>
                              </div>
                              <Button
                                variant="outline"
                                className="hover:cursor-pointer hover:bg-blue-500 transition-colors hover:text-white"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingBot(bot);
                                  setNewBotName(bot.name);
                                  setNewBotDescription(bot.prompt);
                                  setNewBotSchedule(bot.schedule);
                                  setNewBotContextSource(bot.contextSource);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline"
                                className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDeletingBotId(bot.id);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="active" className="space-y-4">
                {activeBots.length === 0 ? (
                  <div className="text-center text-gray-400 mt-4">No active bots.</div>
                ) : (
                  <div className="grid gap-4 mt-4">
                    {activeBots.map((bot) => (
                      <Link to={`/bot/${bot.id}`} key={bot.id}>
                        <Card className="hover:bg-gray-100 transition-colors border rounded-2xl future-feed:border-2">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-bold">{bot.name}</h3>
                              <p className="text-sm text-gray-500 ">{bot.prompt}</p>
                              <p className="text-sm text-gray-400">Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${bot.isActive ? "text-lime-500" : "text-gray-400"}`}>
                                  {bot.isActive ? "On" : "Off"}
                                </span>
                                <Switch
                                  checked={bot.isActive}
                                  onCheckedChange={() => toggleBotActivation(bot.id)}
                                  disabled={loading.toggling.has(bot.id)}
                                  className="w-14 h-7 bg-gray-300 rounded-full relative data-[state=checked]:bg-lime-500 hover:data-[state=unchecked]:bg-gray-400 transition-colors duration-300 ease-in-out"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleBotActivation(bot.id);
                                  }}
                                >
                                  <span
                                    className={`absolute h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${bot.isActive ? "translate-x-8" : "translate-x-1"
                                      } ${bot.isActive ? "bg-lime-100" : "bg-gray-200"}`}
                                  />
                                </Switch>
                              </div>
                              <Button
                                variant="outline"
                                className="cursor-pointer hover:bg-lime-500 hover:text-white transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditingBot(bot);
                                  setNewBotName(bot.name);
                                  setNewBotDescription(bot.prompt);
                                  setNewBotSchedule(bot.schedule);
                                  setNewBotContextSource(bot.contextSource);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <FaEdit />
                              </Button>
                              <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                aria-label={`Delete bot ${bot.name}`}
                                className="cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingBotId(bot.id);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <FaTrash />
                              </Button>
                            </DialogTrigger>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        <Dialog open={showDeleteDialog} onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeletingBotId(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Bot</DialogTitle>
              <DialogDescription
                className="mt-4"
              >
                Are you sure you want to delete this bot? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
                className="hover:cursor-pointer hover:bg-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={deleteBot}
                className="hover:cursor-pointer hover:bg-red-500"
                disabled={loading.deleting}
              >
                {loading.deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="w-full px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:sticky lg:top-0 lg:h-screen hidden lg:block mr-[41px]">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhoToFollow />
        </div>
      </aside>
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4">
          <Card className="rounded-2xl p-6 w-full max-w-md border-2 ">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-xl text-blue-500 future-feed:text-lime">Create New Bot</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewBotName("");
                  setNewBotDescription("");
                  setNewBotSchedule("daily");
                  setNewBotContextSource("");
                  setError(null);
                }}
                className="text-gray-600 hover:text-red-600 cursor-pointer"
              >
                <FaTimes className="w-6 h-6" />
              </Button>
            </div>
            <form onSubmit={createBot}>
              <CardContent className="flex flex-col gap-4">
                <Input
                  placeholder="Bot Name"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="future-feed:border-lime border-rose-gold-accent-border"
                />
                <Input
                  placeholder="Bot Prompt"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  className="future-feed:border-lime border-rose-gold-accent-border"
                />
                <select
                  value={newBotSchedule}
                  onChange={(e) => setNewBotSchedule(e.target.value as Bot["schedule"])}
                  className="future-feed:text-lime future-feed:bg-black border p-2 rounded-md future-feed:border-lime border-rose-gold-accent-border"
                >
                  <option className="future-feed:text-lime future-feed:bg-black" value="hourly">Hourly</option>
                  <option className="future-feed:text-lime future-feed:bg-black" value="daily">Daily</option>
                  <option className="future-feed:text-lime future-feed:bg-black" value="weekly">Weekly</option>
                  <option className="future-feed:text-lime future-feed:bg-black" value="monthly">Monthly</option>
                </select>
                <Input
                  placeholder="Context Source (URL)"
                  value={newBotContextSource}
                  onChange={(e) => setNewBotContextSource(e.target.value)}
                  className="future-feed:border-lime border-rose-gold-accent-border"
                />
                <Button
                  type="submit"
                  className="text-white hover:bg-blue-600 cursor-pointer"
                  disabled={loading.creating || !newBotName.trim() || !newBotDescription.trim()}
                >
                  {loading.creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Bot"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {isEditModalOpen && editingBot && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4">
          <Card className="bg-white rounded-2xl p-6 w-full max-w-md border-2 ">
            <div className="flex justify-between items-center mb-1">
              <CardTitle className="text-xl text-blue-500 future-feed:text-lime">Update Bot</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setNewBotName("");
                  setNewBotDescription("");
                  setNewBotSchedule("daily");
                  setNewBotContextSource("");
                  setEditingBot(null);
                  setError(null);
                }}
                className="text-gray-600 hover:text-red-600 cursor-pointer"
              >
                <FaTimes className="w-6 h-6" />
              </Button>
            </div>
            <form onSubmit={updateBot}>
              <CardContent className="flex flex-col gap-4">
                <Input
                  placeholder="Bot Name"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className=""
                />
                <Input
                  placeholder="Bot Prompt"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  className=""
                />
                <select
                  value={newBotSchedule}
                  onChange={(e) => setNewBotSchedule(e.target.value as Bot["schedule"])}
                  className="border p-2 rounded-md"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <Input
                  placeholder="Context Source (URL)"
                  value={newBotContextSource}
                  onChange={(e) => setNewBotContextSource(e.target.value)}
                  className=""
                />
                <Button
                  type="submit"
                  variant={"secondary"}
                  className="text-white bg-blue-500 cursor-pointer hover:bg-blue-600"
                  disabled={loading.editing || !newBotName.trim() || !newBotDescription.trim()}
                >
                  {loading.editing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Bot"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Bots;