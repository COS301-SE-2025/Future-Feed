import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PersonalSidebar from "@/components/PersonalSidebar";
import { FaTimes, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { Link } from "react-router-dom";

interface Bot {
  id: number;
  name: string;
  prompt: string;
  createdAt: string;
  schedule: "hourly" | "daily" | "weekly" | "monthly";
  contextSource: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const [newBotSchedule, setNewBotSchedule] = useState<Bot["schedule"]>("daily");
  const [newBotContextSource, setNewBotContextSource] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    allBots: false,
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
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in to view bots.");
        } else if (res.status === 404) {
          throw new Error("Bots endpoint not found. Please check the server configuration.");
        } else {
          const errorText = await res.text();
          throw new Error(`Failed to fetch bots: ${res.status} ${errorText}`);
        }
      }
      const botList: {
        id: number;
        ownerId: number;
        name: string;
        prompt: string;
        schedule: "hourly" | "daily" | "weekly" | "monthly";
        contextSource: string | null;
        createdAt: string;
      }[] = await res.json();

      const mappedBots: Bot[] = botList.map((bot) => ({
        id: bot.id,
        name: bot.name,
        prompt: bot.prompt,
        createdAt: bot.createdAt.split("T")[0],
        schedule: bot.schedule,
        contextSource: bot.contextSource || "",
      }));

      setBots(mappedBots);
    } catch (err) {
      console.error("Error fetching bots:", err);
      setError("Failed to fetch bots. Please try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, allBots: false }));
    }
  };

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim() || !newBotDescription.trim() || !newBotContextSource.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bots`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBotName,
          prompt: newBotDescription,
          schedule: newBotSchedule,
          contextSource: newBotContextSource,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Please log in to create a bot.");
        } else if (res.status === 400) {
          const errorText = await res.text();
          throw new Error(`Invalid input: ${errorText}`);
        } else {
          const errorText = await res.text();
          throw new Error(`Failed to create bot: ${res.status} ${errorText}`);
        }
      }

      const newBot: {
        id: number;
        ownerId: number;
        name: string;
        prompt: string;
        schedule: "hourly" | "daily" | "weekly" | "monthly";
        contextSource: string | null;
        createdAt: string;
      } = await res.json();

      setBots([
        ...bots,
        {
          id: newBot.id,
          name: newBot.name,
          prompt: newBot.prompt,
          createdAt: newBot.createdAt.split("T")[0],
          schedule: newBot.schedule,
          contextSource: newBot.contextSource || "",
        },
      ]);

      setNewBotName("");
      setNewBotDescription("");
      setNewBotSchedule("daily");
      setNewBotContextSource("");
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error creating bot:", err);
      setError("Failed to create bot. Please try again.");
    }
  };

  const updateBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot || !newBotName.trim() || !newBotDescription.trim() || !newBotContextSource.trim()) {
      setError("All fields are required.");
      return;
    }

    setBots(
      bots.map((bot) =>
        bot.id === editingBot.id
          ? {
              ...bot,
              name: newBotName,
              prompt: newBotDescription,
              schedule: newBotSchedule,
              contextSource: newBotContextSource,
            }
          : bot
      )
    );

    setNewBotName("");
    setNewBotDescription("");
    setNewBotSchedule("daily");
    setNewBotContextSource("");
    setIsEditModalOpen(false);
    setEditingBot(null);
    setError(null);
  };

  const deleteBot = (botId: number) => {
    setBots(bots.filter((bot) => bot.id !== botId));
    setError(null);
  };

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white">
      <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>
      <main className="flex-1 p-4 lg:p-6">
        <Card className="max-w-[1100px] mx-auto rounded-2xl border-2 border-lime-500 bg-white dark:bg-[#1a1a1a] dark:text-white shadow-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-lime-600 dark:text-lime-500">Bots Management</CardTitle>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-lime-500 text-white hover:bg-lime-600 cursor-pointer"
              >
                <FaPlus className="mr-2" /> Create Bot
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            {loading.allBots ? (
              <div className="text-center text-gray-400">Loading bots...</div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 dark:bg-black dark:border-lime-500">
                  <TabsTrigger className="dark:text-lime-500" value="all">All Bots</TabsTrigger>
                  <TabsTrigger className="dark:text-lime-500" value="active">Active Bots</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  {bots.length === 0 ? (
                    <div className="text-center text-gray-400">No bots created yet.</div>
                  ) : (
                    <div className="grid gap-4">
                      {bots.map((bot) => (
                        <Link to={`/bot/${bot.id}`} key={bot.id}>
                          <Card className="border-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-bold">{bot.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{bot.prompt}</p>
                                <p className="text-sm text-gray-400">Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="dark:border-lime-500 dark:text-lime-500 cursor-pointer"
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
                                  className="dark:border-lime-500 dark:text-lime-500 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteBot(bot.id);
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
                <TabsContent value="active">
                  {bots.length === 0 ? (
                    <div className="text-center text-gray-400">No active bots.</div>
                  ) : (
                    <div className="grid gap-4">
                      {bots.map((bot) => (
                        <Link to={`/bot/${bot.id}`} key={bot.id}>
                          <Card className="border-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-bold">{bot.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{bot.prompt}</p>
                                <p className="text-sm text-gray-400">Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="dark:border-lime-500 dark:text-lime-500 cursor-pointer"
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
                                  className="dark:border-lime-500 dark:text-lime-500 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteBot(bot.id);
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
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
      <aside className="w-full lg:w-[350px] lg:mt-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
          <WhoToFollow />
        </div>
      </aside>

      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4">
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border-2 border-lime-500">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-xl text-lime-600 dark:text-lime-500">Create New Bot</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewBotName("");
                  setNewBotDescription("");
                  setNewBotSchedule("daily");
                  setNewBotContextSource("");
                }}
                className="text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
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
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
                />
                <Input
                  placeholder="Bot Prompt"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
                />
                <select
                  value={newBotSchedule}
                  onChange={(e) => setNewBotSchedule(e.target.value as Bot["schedule"])}
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500 border p-2 rounded-md"
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
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
                />
                <Button
                  type="submit"
                  className="bg-lime-500 text-white hover:bg-lime-600 cursor-pointer"
                  disabled={!newBotName.trim() || !newBotDescription.trim() || !newBotContextSource.trim()}
                >
                  Create Bot
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {isEditModalOpen && editingBot && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4">
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border-2 border-lime-500">
            <div className="flex justify-between items-center mb-1">
              <CardTitle className="text-xl text-lime-600 dark:text-lime-500">Edit Bot</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setNewBotName("");
                  setNewBotDescription("");
                  setNewBotSchedule("daily");
                  setNewBotContextSource("");
                  setEditingBot(null);
                }}
                className="text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
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
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
                />
                <Input
                  placeholder="Bot Prompt"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
                />
                <select
                  value={newBotSchedule}
                  onChange={(e) => setNewBotSchedule(e.target.value as Bot["schedule"])}
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500 border p-2 rounded-md"
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
                  className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
                />
                <Button
                  type="submit"
                  className="bg-lime-500 text-white hover:bg-lime-600 cursor-pointer"
                  disabled={!newBotName.trim() || !newBotDescription.trim() || !newBotContextSource.trim()}
                >
                  Update Bot
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