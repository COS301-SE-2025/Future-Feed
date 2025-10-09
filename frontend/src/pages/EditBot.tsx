import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface FormData {
  botName: string;
  prompt: string;
  schedule: string;
  contextSource: string;
}

const EditBot: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    botName: "My Bot",
    prompt: "Share interesting facts and updates.",
    schedule: "daily",
    contextSource: "www.mySource.com",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //console.log("Saving bot settings:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/bots");
    } catch (err) {
      console.error("Error saving bot settings:", err);
    }
  };

  const handleDeleteBot = async () => {
    try {
      //console.log("Deleting bot:", formData.botName);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/bots");
    } catch (err) {
      console.error("Error deleting bot:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center font-['Cambay',Arial,sans-serif] bg-gray-200 dark:bg-black dark:text-white">
        <Card className="mt-10 relative w-full max-w-[900px] rounded-[16px] border-2 border-lime-500 bg-white p-16 shadow-[0_0_30px_#999] dark:bg-[#1a1a1a] dark:border-lime-500 dark:shadow-none">
          <div className="absolute left-5 top-5 flex items-center gap-2 flex-col">
            <Button
              onClick={() => navigate(-1)}
              className="h-[40px] w-[40px] rounded-full border border-lime-500 bg-white p-0 hover:bg-gray-200 cursor-pointer hover:shadow-[1px_1px_10px_black] dark:bg-gray-200 dark:border-lime-500 dark:shadow-white dark:hover:bg-slate-400 dark:hover:shadow-none"
              variant="ghost"
            >
              <ArrowLeft className="h-5 w-5 text-black" />
            </Button>
          </div>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                className="absolute right-5 top-5 h-[40px] w-[40px] rounded-full border border-red-600 bg-white p-0 hover:bg-red-100 cursor-pointer hover:shadow-[1px_1px_10px_black] dark:bg-gray-200 dark:border-red-600 dark:hover:bg-red-200 dark:hover:shadow-none"
                variant="ghost"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Bot</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this bot? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="border border-red-600 text-red-600 hover:bg-red-100 cursor-pointer"
                  onClick={() => {
                    setShowDeleteDialog(false);
                    handleDeleteBot();
                  }}
                >
                  Yes, Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <CardHeader>
            <CardTitle className="text-center text-4xl">Edit Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              {/* Bot Name */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Bot Name" htmlFor="bot-name" />
                <Input
                  id="bot-name"
                  placeholder="Enter your bot's name"
                  value={formData.botName}
                  onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                  className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
                />
              </div>

              {/* Prompt */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Prompt" htmlFor="prompt" />
                <Textarea
                  id="prompt"
                  placeholder="Enter the bot's prompt..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  className="h-[100px] w-full rounded-[20px] border border-black px-4 py-2 text-sm resize-y whitespace-pre-wrap dark:text-white dark:placeholder:text-slate-100"
                />
              </div>

              {/* Schedule */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Schedule" htmlFor="schedule" />
                <Select
                  value={formData.schedule}
                  onValueChange={(value: string) => setFormData({ ...formData, schedule: value })}
                >
                  <SelectTrigger
                    id="schedule"
                    className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
                  >
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="none">No activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Context Source */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Context Source" htmlFor="context-source" />
                <Input
                  id="context-source"
                  placeholder="Enter the bot's context source"
                  value={formData.contextSource}
                  onChange={(e) => setFormData({ ...formData, contextSource: e.target.value })}
                  className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
                />
              </div>

              <Button
                type="submit"
                className="h-[58px] w-[186px] rounded-[25px] border border-black bg-white text-[15px] font-bold text-black hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-3 mt-3 cursor-pointer"
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

const LabelBlock = ({ label, htmlFor }: { label: string; htmlFor: string }) => (
  <div className="relative my-[15px] flex items-center justify-center text-center">
    <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
    <span className="text-[0.9rem] font-bold">
      <Label htmlFor={htmlFor} className="mb-2 block font-bold text-[18px]">
        {label}
      </Label>
    </span>
    <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
  </div>
);

export default EditBot;