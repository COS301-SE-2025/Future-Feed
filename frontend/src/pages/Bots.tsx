import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PersonalSidebar from "@/components/PersonalSidebar";
import { FaTimes, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useSpring, animated } from "@react-spring/web";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";

interface Bot {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  isActive: boolean;
}

const Bots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([
    { id: 1, name: "SoccerBot", description: "Fetches latest soccer news", createdAt: "2025-07-01", isActive: true },
    { id: 2, name: "GamingBot", description: "Fetches latest gaming news", createdAt: "2025-07-02", isActive: false },
  ]);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createModalProps = useSpring({
    opacity: isCreateModalOpen ? 1 : 0,
    transform: isCreateModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 220, friction: 30 },
  });

  // Animation for edit modal
  const editModalProps = useSpring({
    opacity: isEditModalOpen ? 1 : 0,
    transform: isEditModalOpen ? "translateY(0px)" : "translateY(50px)",
    config: { tension: 220, friction: 30 },
  });

  const createBot = () => {
    if (!newBotName.trim() || !newBotDescription.trim()) {
      setError("Bot name and description cannot be empty.");
      return;
    }
    const newBot: Bot = {
      id: bots.length + 1,
      name: newBotName,
      description: newBotDescription,
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true,
    };
    setBots([...bots, newBot]);
    setNewBotName("");
    setNewBotDescription("");
    setIsCreateModalOpen(false);
    setError(null);
  };

  const updateBot = () => {
    if (!editingBot || !newBotName.trim() || !newBotDescription.trim()) {
      setError("Bot name and description cannot be empty.");
      return;
    }
    setBots(
      bots.map((bot) =>
        bot.id === editingBot.id
          ? { ...bot, name: newBotName, description: newBotDescription }
          : bot
      )
    );
    setNewBotName("");
    setNewBotDescription("");
    setIsEditModalOpen(false);
    setEditingBot(null);
    setError(null);
  };

  const deleteBot = (botId: number) => {
    setBots(bots.filter((bot) => bot.id !== botId));
    setError(null);
  };

  const toggleBotStatus = (botId: number, isActive: boolean) => {
    setBots(
      bots.map((bot) =>
        bot.id === botId ? { ...bot, isActive: !isActive } : bot
      )
    );
    setError(null);
  };

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white font-['Cambay',Arial,sans-serif]">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
            <PersonalSidebar />
        </aside>
      <main className="flex-1 p-4 lg:p-6">
        <Card className="max-w-[1100px] mx-auto rounded-2xl border-2 border-lime-500 bg-white dark:bg-[#1a1a1a] dark:text-white shadow-[2px_2px_20px_#000000]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-lime-600 dark:text-lime-500">Bots Management</CardTitle>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-lime-500 text-white hover:bg-lime-600"
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
                      <Card key={bot.id} className="border-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-bold">{bot.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{bot.description}</p>
                            <p className="text-sm text-gray-400">Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-400">Status: {bot.isActive ? "Active" : "Inactive"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="dark:border-lime-500 dark:text-lime-500"
                              onClick={() => {
                                setEditingBot(bot);
                                setNewBotName(bot.name);
                                setNewBotDescription(bot.description);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline"
                              className="dark:border-lime-500 dark:text-lime-500"
                              onClick={() => deleteBot(bot.id)}
                            >
                              <FaTrash />
                            </Button>
                            <Button
                              className={bot.isActive ? "bg-red-500 hover:bg-red-600" : "bg-lime-500 hover:bg-lime-600"}
                              onClick={() => toggleBotStatus(bot.id, bot.isActive)}
                            >
                              {bot.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="active">
                {bots.filter((bot) => bot.isActive).length === 0 ? (
                  <div className="text-center text-gray-400">No active bots.</div>
                ) : (
                  <div className="grid gap-4">
                    {bots.filter((bot) => bot.isActive).map((bot) => (
                      <Card key={bot.id} className="border-lime-500 dark:bg-[#1a1a1a] dark:border-lime-500">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-bold">{bot.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{bot.description}</p>
                            <p className="text-sm text-gray-400">Created: {new Date(bot.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="dark:border-lime-500 dark:text-lime-500"
                              onClick={() => {
                                setEditingBot(bot);
                                setNewBotName(bot.name);
                                setNewBotDescription(bot.description);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline"
                              className="dark:border-lime-500 dark:text-lime-500"
                              onClick={() => deleteBot(bot.id)}
                            >
                              <FaTrash />
                            </Button>
                            <Button
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => toggleBotStatus(bot.id, bot.isActive)}
                            >
                              Deactivate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <aside className="w-full lg:w-[350px] lg:mt-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block">
          <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
            <WhatsHappening />
          </div>
          <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
            <WhoToFollow  />
          </div>
        </aside>

      {isCreateModalOpen && (
        <animated.div
          style={createModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4"
        >
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border-2 border-lime-500">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-xl text-lime-600 dark:text-lime-500">Create New Bot</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewBotName("");
                  setNewBotDescription("");
                }}
                className="text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
              >
                <FaTimes className="w-6 h-6" />
              </Button>
            </div>
            <CardContent className="flex flex-col gap-4">
              <Input
                placeholder="Bot Name"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
              />
              <Input
                placeholder="Bot Description"
                value={newBotDescription}
                onChange={(e) => setNewBotDescription(e.target.value)}
                className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
              />
              <Button
                onClick={createBot}
                className="bg-lime-500 text-white hover:bg-lime-600"
                disabled={!newBotName.trim() || !newBotDescription.trim()}
              >
                Create Bot
              </Button>
            </CardContent>
          </Card>
        </animated.div>
      )}

      {isEditModalOpen && editingBot && (
        <animated.div
          style={editModalProps}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-4"
        >
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border-2 border-lime-500">
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-xl text-lime-600 dark:text-lime-500">Edit Bot</CardTitle>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setNewBotName("");
                  setNewBotDescription("");
                  setEditingBot(null);
                }}
                className="text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400"
              >
                <FaTimes className="w-6 h-6" />
              </Button>
            </div>
            <CardContent className="flex flex-col gap-4">
              <Input
                placeholder="Bot Name"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
              />
              <Input
                placeholder="Bot Description"
                value={newBotDescription}
                onChange={(e) => setNewBotDescription(e.target.value)}
                className="dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500"
              />
              <Button
                onClick={updateBot}
                className="bg-lime-500 text-white hover:bg-lime-600"
                disabled={!newBotName.trim() || !newBotDescription.trim()}
              >
                Update Bot
              </Button>
            </CardContent>
          </Card>
        </animated.div>
      )}
    </div>
  );
};

export default Bots;