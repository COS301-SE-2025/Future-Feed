import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Trash2, User } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";

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
  displayName: string;
  bio: string;
  profileImage: string;
  dob: string;
}

interface UserResponse {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture: string;
  bio: string;
  dateOfBirth: string;
}

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    bio: "",
    profileImage: "",
    dob: "",
  });
  const [initialProfilePicture, setInitialProfilePicture] = useState<string>("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/user/myInfo`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
      .then((data: UserResponse) => {
        const profilePicture = data.profilePicture?.startsWith("blob:") || !data.profilePicture
          ? ""
          : data.profilePicture;
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          profileImage: profilePicture,
          dob: data.dateOfBirth || "",
        });
        setInitialProfilePicture(profilePicture);
      })
      .catch((err) => {
        console.error("Error fetching user info:", err);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, profileImage: base64String });
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const body = {
        displayName: formData.displayName,
        bio: formData.bio,
        dateOfBirth: formData.dob,
        ...(formData.profileImage !== initialProfilePicture && { profilePicture: formData.profileImage }),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${errorText}`);
      }

      const updatedUser: UserResponse = await response.json();
      if (
        updatedUser.displayName === formData.displayName &&
        updatedUser.bio === formData.bio &&
        updatedUser.dateOfBirth === formData.dob &&
        (formData.profileImage === initialProfilePicture || updatedUser.profilePicture === formData.profileImage)
      ) {
        navigate("/profile");
      } else {
        throw new Error("Profile update response does not match submitted data");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete account: ${errorText}`);
      }

      navigate("/"); // Redirect to landing page after delete
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center font-['Cambay',Arial,sans-serif] bg-gray-200 dark:bg-blue-950 dark:text-slate-200">
      <ThemeProvider>
        <Card className=" border-rose-gold accent border dark:border-slate-200 future-feed:border-lime mt-10 relative w-full max-w-[900px] rounded-[16px] border-2  p-16 shadow-[0_0_30px_#999]  dark:shadow-none">
          <div className="absolute left-5 top-5 flex items-center gap-2 flex-col">
            <Link to="/profile">
              <Button
                className="h-[40px] w-[40px] rounded-full border  p-0 hover:bg-gray-200 cursor-pointer hover:shadow-[1px_1px_10px_black] dark:bg-gray-200  dark:shadow-white dark:hover:bg-slate-400 dark:hover:shadow-none"
                variant="ghost"
              >
                <ArrowLeft className="h-5 w-5 text-black" />
              </Button>
            </Link>
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
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone.
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
                    handleDeleteAccount();
                  }}
                >
                  Yes, Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <CardHeader>
            <CardTitle className="text-center text-4xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="mb-3 flex w-full justify-center">
                <label htmlFor="profile-pic-upload" className="relative cursor-pointer">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="mx-auto h-[140px] w-[140px] rounded-full border-2 border-black object-cover shadow-[0_2px_6px_rgba(0,0,0,0.1)] "
                    />
                  ) : (
                    <div className="mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-full border-2 border-black bg-[#1a1a1a] shadow-[0_2px_6px_rgba(0,0,0,0.1)] ">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Camera className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-white p-1 text-black shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />
                  <Input
                    type="file"
                    id="profile-pic-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Display Name */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Display Name" htmlFor="display-name" />
                <Input
                  id="display-name"
                  placeholder="Enter your display name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
                />
              </div>

              {/* DOB */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Date of Birth" htmlFor="dob" />
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full rounded-[20px] border border-black px-4 py-2 text-sm dark:text-white dark:placeholder:text-slate-100"
                />
              </div>

              {/* Bio */}
              <div className="mb-3 w-full max-w-[500px]">
                <LabelBlock label="Bio" htmlFor="bio" />
                <Textarea
                  id="bio"
                  placeholder="Bio..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="h-[100px] w-full rounded-[20px] border border-black px-4 py-2 text-sm resize-y whitespace-pre-wrap dark:text-white dark:placeholder:text-slate-100"
                />
              </div>

              <Link to={"/profile"}>
              <Button
                type="submit"
                className="h-[58px] w-[186px] rounded-[25px] border border-black bg-white text-[15px] font-bold text-black hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-blue-500 hover:border-3 mt-3 cursor-pointer"
              
              >
                Save Changes
              </Button>
              </Link>
              
            </form>
          </CardContent>
        </Card>
      </ThemeProvider>
    </div>
  );
};

const LabelBlock = ({ label, htmlFor }: { label: string; htmlFor: string }) => (
  <div className="relative my-[15px] flex items-center justify-center text-center">
    <div className="mr-2.5 h-px w-1/3 future-feed:bg-lime bg-blue-500 dark:bg-slate-200"></div>
    <span className="text-[0.9rem] font-bold">
      <Label htmlFor={htmlFor} className="mb-2 block font-bold text-[18px]">
        {label}
      </Label>
    </span>
    <div className="ml-2.5 h-px w-1/3 future-feed:bg-lime  bg-blue-500 dark:bg-slate-200"></div>
  </div>
);

export default EditProfile;