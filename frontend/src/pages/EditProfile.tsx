import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera } from "lucide-react";
import GRP1 from "../assets/GRP1.jpg";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

interface FormData {
  displayName: string;
  bio: string;
  profileImage: string;
  dob: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    bio: "",
    profileImage: GRP1,
    dob: "",
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/user/myInfo`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) =>
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          profileImage: data.profilePicture?.startsWith("blob:") ? GRP1 : data.profilePicture || GRP1,
          dob: data.dateOfBirth || "",
        })
      )
      .catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFormData({ ...formData, profileImage: imageURL });
      // For production: you'd want to upload this to a CDN/server and save the resulting URL
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          displayName: formData.displayName,
          bio: formData.bio,
          dateOfBirth: formData.dob,
          profilePicture: formData.profileImage,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      navigate("/profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center font-['Cambay',Arial,sans-serif] bg-gray-200 dark:bg-black dark:text-white">
      <ThemeProvider>
        <div className="pe-9 flex items-center gap-2">
          <ModeToggle />
        </div>
      </ThemeProvider>

      <Card className="mt-10 relative w-full max-w-[900px] rounded-[16px] border-2 border-lime-500 bg-white p-16 shadow-[0_0_30px_#999] dark:bg-[#1a1a1a] dark:border-lime-500 dark:shadow-none">
        <Link to="/profile">
          <Button
            className="absolute left-5 top-5 h-[40px] w-[40px] rounded-full border border-lime-500 bg-white p-0 hover:bg-gray-200 cursor-pointer hover:shadow-[1px_1px_10px_black] dark:bg-gray-200 dark:border-lime-500 dark:shadow-white dark:hover:bg-slate-400 dark:hover:shadow-none"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </Link>
        <CardHeader>
          <CardTitle className="text-center text-4xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="mb-3 flex w-full justify-center">
              <label htmlFor="profile-pic-upload" className="relative cursor-pointer">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="mx-auto h-[140px] w-[140px] rounded-full border-2 border-black object-cover shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:border-lime-500"
                />
                <Camera className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-white p-1 text-black shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                <Input type="file" id="profile-pic-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="mb-3 w-full max-w-[500px]">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="display-name" className="mb-2 block font-bold text-[18px]">
                    Display Name
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
              </div>
              <Input
                id="display-name"
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
              />
            </div>

            <div className="mb-3 w-full max-w-[500px]">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="dob" className="mb-2 block font-bold text-[18px]">
                    Date of Birth
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
              </div>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
              />
            </div>

            <div className="mb-3 w-full max-w-[500px]">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="bio" className="mb-2 block font-bold text-[18px]">
                    Bio
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
              </div>
              <Textarea
                id="bio"
                placeholder="Bio..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="h-[100px] w-full rounded-[20px] border border-black px-4 py-2 text-sm resize-y whitespace-pre-wrap dark:text-white dark:placeholder:text-slate-100"
              />
            </div>

            <Button
              type="submit"
              className="h-[58px] w-[186px] rounded-[25px] border border-black bg-white text-[15px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-3 mt-1 cursor-pointer"
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
