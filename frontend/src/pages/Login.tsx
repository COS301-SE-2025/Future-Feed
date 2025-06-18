import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../assets/Future feed transparent-Photoroom.png";
import googleLogo from "../assets/Google transparent.png";

interface FormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white font-['Cambay',Arial,sans-serif]">
      <div className="mt-10 flex justify-center">
        <img src={logo} alt="Future Feed Logo" className="h-[311px] w-[311px]" />
      </div>
      <Card className="mb-8 mt-5 w-full max-w-[828px] rounded-[20px] border border-black bg-white px-10 py-8 shadow-[0_0_30px_#999] sm:px-12">
        <CardHeader>
          <CardTitle className="text-center text-[40px]">Login</CardTitle>
        </CardHeader>
        <CardContent>
          
          <form className="px-5 sm:px-12">
            <Link to="/construction" className="text-black no-underline hover:underline">
            <Button
              variant="outline"
              className="mb-6 flex h-[50px] w-full items-center justify-center rounded-[25px] border border-black bg-[#e0e0e0] p-5 text-[20px] font-bold shadow-[2px_2px_4px_#888] hover:bg-[#ccc] cursor-pointer"
            >
              Continue with:
              <img src={googleLogo} alt="Google Login" className="ml-8 h-[37px] w-[80px]" />
            </Button>
          </Link>
            <div className="mb-6">
                <div className="relative my-[15px] flex items-center justify-center text-center">
              <div className="mr-2.5 h-px w-1/3 bg-[#555]"></div>
              <span className="text-[0.9rem] font-bold">
                <Label htmlFor="username" className="mb-2 block text-left text-[24px] font-bold">
                Username
              </Label>
              </span>
              <div className="ml-2.5 h-px w-1/3 bg-[#555]"></div>
            </div>
              
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleChange}
                className="h-[50px] rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-6">
                <div className="mb-6">
                <div className="relative my-[15px] flex items-center justify-center text-center">
              <div className="mr-2.5 h-px w-1/3 bg-[#555]"></div>
              <span className="text-[0.9rem] font-bold">
                <Label htmlFor="password" className="mb-2 block text-left text-[24px] font-bold">
                    Password
                </Label>
              </span>
              <div className="ml-2.5 h-px w-1/3 bg-[#555]"></div>
            </div>
            </div>
              
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="h-[50px] rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="mb-1 text-right">
              <Link to="/forgotpassword" className="text-[15px] font-bold text-black no-underline hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Button
                type="submit"
                className="mb-6 h-[67px] w-[186px] rounded-[25px] border border-black bg-[#ddd] text-[24px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-[#ccc] cursor-pointer"
              >
                Login
              </Button>
              <span className="text-center text-[16px]">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 no-underline hover:underline">
                  Register here
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;