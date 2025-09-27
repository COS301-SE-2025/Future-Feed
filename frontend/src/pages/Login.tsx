import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import lightLogo from "../assets/Future feed transparent-Photoroom.png";
import darkLogo from "../assets/Dark mode.png";
import futurefeedLogo from "../assets/Future Feed Main Dark v1.png";
import googleLogo from "../assets/Google transparent.png";
import { ThemeProvider } from "@/components/theme-provider";

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
    <div className="future-feed:bg-black flex min-h-screen flex-col items-center bg-gray-200 font-['Cambay',Arial,sans-serif] dark:bg-blue-950 dark:text-slate-200">
      <ThemeProvider>
          
      
      <div className="mt-10 flex justify-center">
      {/* Light mode logo */}
      <img
        src={lightLogo}
        alt="Future Feed Logo - Light"
        className="h-[311px] w-[311px] dark:hidden"
      />
      {/* Dark mode logo */}
      <img
        src={darkLogo}
        alt="Future Feed Logo - Dark"
        className="hidden h-[311px] w-[311px] dark:block"
      />
      {/* Future Feed mode logo */}
      <img
        src={futurefeedLogo}
        alt="Future Feed Logo - Future Feed"
        className="h-[311px] w-[311px] dark:block dark:hidden"
      />
    </div>

<Card className="mb-8 mt-5 w-full max-w-[828px] rounded-[20px] border-2 border-rose-gold-accent-border bg-white px-4 sm:px-10 py-6 sm:py-8 shadow-[2px_2px_20px_#000000] outline">
  <CardHeader>
    <CardTitle className="text-center future-feed:text-lime text-3xl sm:text-[40px]">Login</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="px-2 sm:px-12">
      {/* Google Login Button - Improved for mobile */}
      <Button
        type="button"
        onClick={() => {
          console.log(import.meta.env.VITE_API_URL);
          window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
        }}
        className="text-black mb-6 flex h-14 sm:h-[50px] w-full items-center justify-center rounded-2xl sm:rounded-[25px] border border-black bg-white p-4 sm:p-5 text-lg sm:text-[20px] font-bold shadow-[2px_2px_4px_#888] cursor-pointer  transition-colors"
      >
        <span className="whitespace-nowrap">Continue with:</span>
        <img src={googleLogo} alt="Google Login" className="ml-4 sm:ml-8 h-8 sm:h-[37px] w-16 sm:w-[80px]" />
      </Button>

      <div className="mb-6">
        <div className="relative my-4 sm:my-[15px] flex items-center justify-center text-center">
          <div className="mr-2.5 h-px w-1/3 bg-blue-500 future-feed:bg-lime dark:bg-slate-200"></div>
          <span className="text-[0.9rem] font-bold">
            <Label htmlFor="username" className="mb-2 block future-feed:text-lime text-left text-xl sm:text-[24px] font-bold">
              Username
            </Label>
          </span>
          <div className="ml-2.5 h-px w-1/3 bg-blue-500 future-feed:bg-lime dark:bg-slate-200"></div>
        </div>
        
        <Input
          type="text"
          id="username"
          placeholder="Enter your username"
          required
          value={formData.username}
          onChange={handleChange}
          className="h-14 sm:h-[50px] rounded-2xl sm:rounded-[25px] border border-black bg-[#e0e0e0] p-4 sm:p-5 dark:text-slate-200 dark:placeholder:text-slate-100 text-base sm:text-lg"
        />
      </div>
      
      <div className="mb-6">
        <div className="relative my-4 sm:my-[15px] flex items-center justify-center text-center">
          <div className="mr-2.5 h-px w-1/3 bg-blue-500 future-feed:bg-lime dark:bg-slate-200"></div>
          <span className="text-[0.9rem] font-bold">
            <Label htmlFor="password" className="mb-2 block future-feed:text-lime text-left text-xl sm:text-[24px] font-bold">
              Password
            </Label>
          </span>
          <div className="ml-2.5 h-px w-1/3 bg-blue-500 future-feed:bg-lime dark:bg-slate-200"></div>
        </div>
        
        <Input
          type="password"
          id="password"
          placeholder="Enter your password"
          required
          value={formData.password}
          onChange={handleChange}
          className="h-14 sm:h-[50px] rounded-2xl sm:rounded-[25px] border border-black bg-[#e0e0e0] p-4 sm:p-5 dark:text-slate-200 dark:placeholder:text-slate-100 text-base sm:text-lg"
        />
      </div>
      
      <div className="mb-4 text-right">
        <Link to="/forgotpassword" className="future-feed:text-white text-sm sm:text-[15px] font-bold text-black no-underline hover:underline dark:text-slate-200">
          Forgot password?
        </Link>
      </div>
      
      <div className="flex flex-col items-center justify-center py-4 sm:py-6">
        {/* Login Button - Improved for mobile */}
        <Button
          type="submit"
          className="mb-6 h-16 sm:h-[67px] w-40 sm:w-[186px] rounded-2xl sm:rounded-[25px] border border-black bg-white text-xl sm:text-[24px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-blue-500 hover:border-2 cursor-pointer transition-all"
        >
          Login
        </Button>
        
        <span className="text-center future-feed:text-lime text-sm sm:text-[16px]">
          Don't have an account?{" "}
          <Link to="/register" className="future-feed:text-white no-underline hover:underline text-blue-500">
            Register here
          </Link>
        </span>
      </div>
    </form>
  </CardContent>
</Card>
      </ThemeProvider>
    </div>
  );
};

export default Login;
