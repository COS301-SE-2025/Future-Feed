import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../assets/Future feed transparent-Photoroom.png";

interface FormData {
  profilePic: File | null;
  displayName: string;
  username: string;
  dob: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    profilePic: null,
    displayName: "",
    username: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, files } = e.target;
    if (id === "profilePic" && files) {
      setFormData({ ...formData, profilePic: files[0] });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white font-['Cambay',Arial,sans-serif]">
      <div className="mt-10 flex justify-center">
        <img src={logo} alt="Future Feed Logo" className="max-w-[311px]" />
      </div>
      <Card className="my-8 w-full max-w-[900px] rounded-[20px] border border-black bg-white px-10 py-8 shadow-[0_0_30px_#999] sm:px-12">
        <CardHeader>
          <CardTitle className="text-center text-4xl sm:text-[40px]">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="max-h-[60vh] overflow-y-auto px-5 sm:px-12">
            <div className="mb-6">
              <Label htmlFor="profilePic" className="mb-2 block text-left text-[23px] font-bold">
                Profile Picture
              </Label>
              <Input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="displayName" className="mb-2 block text-left text-[23px] font-bold">
                Display Name
              </Label>
              <Input
                type="text"
                id="displayName"
                placeholder="Enter your display name"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="username" className="mb-2 block text-left text-[23px] font-bold">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username (without @)"
                required
                value={formData.username}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="dob" className="mb-2 block text-left text-[23px] font-bold">
                Date of Birth
              </Label>
              <Input
                type="date"
                id="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="email" className="mb-2 block text-left text-[23px] font-bold">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="password" className="mb-2 block text-left text-[23px] font-bold">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                placeholder="Enter a password"
                required
                value={formData.password}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="confirmPassword" className="mb-2 block text-left text-[23px] font-bold">
                Confirm Password
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Button
                type="submit"
                className="mb-6 h-[67px] w-[186px] rounded-[25px] border border-black bg-[#ddd] text-[20px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-[#ccc] cursor-pointer"
              >
                Register
              </Button>
              <span className="text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;