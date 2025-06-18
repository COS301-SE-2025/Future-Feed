import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex min-h-screen flex-col items-center font-['Cambay',Arial,sans-serif] bg-gray-200">
      <div className="mt-2 flex justify-center">
        <img src={logo} alt="Future Feed Logo" className="max-w-[311px]" />
      </div>
      <Card className="my-8 w-full max-w-[900px] rounded-[20px] border-2 border-lime-500 bg-white px-10 py-8 shadow-[0_0_30px_#999] sm:px-12">
        <CardHeader>
          <CardTitle className="text-center text-4xl sm:text-[40px]">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="max-h-[60vh] overflow-y-auto px-5 sm:px-12">
            <div className="mb-6">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="profilePic" className="mb-2 block text-left text-[24px] font-bold">
                  Profile Picture
                </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
              <Input
                type="file"
                id="profilePic"
                accept="image/*"
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="displayName" className="mb-2 block text-left text-[23px] font-bold">
                    Display Name
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
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
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="username" className="mb-2 block text-left text-[23px] font-bold">
                    Username
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleChange}
                className="h-auto rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="dob" className="mb-2 block text-left text-[23px] font-bold">
                    Date of Birth
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
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
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="email" className="mb-2 block text-left text-[23px] font-bold">
                    Email
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
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
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="password" className="mb-2 block text-left text-[23px] font-bold">
                    Password
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
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
              <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                  <Label htmlFor="confirmPassword" className="mb-2 block text-left text-[23px] font-bold">
                    Confirm Password
                  </Label>
                </span>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500"></div>
              </div>
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
                className="mb-6 h-[67px] w-[186px] rounded-[25px] border border-black bg-white text-[20px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-2 cursor-pointer"
              >
                Register
              </Button>
              <span className="text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600 hover:underline">
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