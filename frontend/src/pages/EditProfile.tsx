import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaArrowLeft } from "react-icons/fa";
import { Camera } from "lucide-react";
import GRP1 from "../assets/GRP1.jpg";

interface FormData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
}

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    displayName: "",
    bio: "",
    profileImage: GRP1,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFormData({ ...formData, profileImage: imageURL });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-['Arial',sans-serif]">
      <Card className="relative w-full max-w-[900px] rounded-[16px] border border-black bg-white p-16 shadow-[0_0_30px_#999]">
        <Link to="/user-profile" className="absolute left-5 top-5 text-[#333] hover:text-[#007bff]">
          <FaArrowLeft className="text-2xl" />
        </Link>
        <CardHeader>
          <CardTitle className="text-center text-4xl">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="mb-8 flex w-full justify-center">
              <label htmlFor="profile-pic-upload" className="relative cursor-pointer">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="mx-auto h-[140px] w-[140px] rounded-full border-2 border-black object-cover shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
                />
                <Camera
                  className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-white p-1 text-black shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                />
                <Input
                  type="file"
                  id="profile-pic-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mb-5 w-full max-w-[500px]">
              <Label htmlFor="display-name" className="mb-2 block text-left font-semibold">
                Display Name
              </Label>
              <Input
                type="text"
                id="display-name"
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-[20px] border border-black px-4 py-2 text-sm"
              />
            </div>
            <div className="mb-5 w-full max-w-[500px]">
              <Label htmlFor="username" className="mb-2 block text-left font-semibold">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-[20px] border border-black px-4 py-2 text-sm"
              />
            </div>
            <div className="mb-5 w-full max-w-[500px]">
              <Label htmlFor="bio" className="mb-2 block text-left font-semibold">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Bio..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="h-[100px] w-full rounded-[20px] border border-black px-4 py-2 text-sm resize-y whitespace-pre-wrap"
              />
            </div>
            <Button
              type="submit"
              className="mt-2 h-[50px] w-[150px] rounded-[100px] border border-black bg-white text-base font-semibold text-black shadow-none hover:bg-gray-500 hover:text-white"
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