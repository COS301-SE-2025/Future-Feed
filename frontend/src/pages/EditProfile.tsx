import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Camera } from "lucide-react";
import GRP1 from "../assets/GRP1.jpg";

interface FormData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
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
    navigate("/user-profile");
  };

  return (
    <div className="flex min-h-screen flex-col items-center font-['Cambay',Arial,sans-serif] bg-gray-200">
      <Card className="mt-10 relative w-full max-w-[900px] rounded-[16px] border-2 border-lime-500 bg-white p-16 shadow-[0_0_30px_#999]">
        <Link to="/user-profile">
                  <Button
                    className="absolute left-5 top-5 h-[40px] w-[40px] rounded-full border border-lime-500 bg-white p-0 hover:bg-gray-200 cursor-pointer shadow-[2px_2px_4px_#888] hover:shadow-[1px_1px_10px_black]"
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

            <div className="mb-3 w-full max-w-[500px]">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="display-name" className="mb-2 block font-bold text-[18px]">
                    Display Name
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
              <Input
                type="text"
                id="display-name"
                placeholder="Enter your display name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-[20px] border border-black px-4 py-2 text-sm"
              />
            </div>

            <div className="mb-3 w-full max-w-[500px]">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="username" className="mb-2 block font-bold text-[18px]">
                    Username
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-[20px] border border-black px-4 py-2 text-sm"
              />
            </div>

            <div className="mb-3 w-full max-w-[500px]">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="bio" className="mb-2 block font-bold text-[18px]">
                    Bio
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
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
              className="h-[58px] w-[186px] rounded-[25px] border border-black bg-white text-[15px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-2 mt-1 cursor-pointer"
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