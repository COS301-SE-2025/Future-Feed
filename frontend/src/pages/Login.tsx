import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import lightLogo from "../assets/Future feed transparent-Photoroom.png";
import darkLogo from "../assets/Future Feed Main Dark v1.png";
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
    <div className="flex min-h-screen flex-col items-center bg-gray-200 font-['Cambay',Arial,sans-serif] dark:bg-black dark:text-white">
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
    </div>

      <Card className="mb-8 mt-5 w-full max-w-[828px] rounded-[20px] border-2 border-lime-500 bg-white px-6 py-6 shadow-[2px_2px_20px_#000000] sm:px-12 sm:py-8 outline dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500">
  <CardHeader>
    <CardTitle className="text-center text-3xl sm:text-[40px]">Login</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="px-2 sm:px-12">
      {/* Google Login */}
      <Button
        type="button"
        onClick={() => {
          console.log(import.meta.env.VITE_API_URL);
          window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
        }}
        variant="outline"
        className="mb-6 flex h-[50px] w-full items-center justify-center rounded-[20px] sm:rounded-[25px] border border-black bg-white px-4 sm:p-5 text-lg sm:text-[20px] font-bold shadow-[2px_2px_4px_#888] cursor-pointer dark:text-white dark:shadow-none dark:hover:border-lime-500"
      >
        Continue with:
        <img
          src={googleLogo}
          alt="Google Login"
          className="ml-4 sm:ml-8 h-[32px] w-[70px] sm:h-[37px] sm:w-[80px]"
        />
      </Button>

      {/* Username */}
      <div className="mb-6">
        <div className="relative my-[15px] flex items-center justify-center text-center">
          <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
          <span className="text-[0.9rem] font-bold">
            <Label
              htmlFor="username"
              className="mb-2 block text-left text-[24px] font-bold"
            >
              Username
            </Label>
          </span>
          <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
        </div>

        <Input
          type="text"
          id="username"
          placeholder="Enter your username"
          required
          value={formData.username}
          onChange={handleChange}
          className="h-[50px] rounded-[20px] sm:rounded-[25px] border border-black bg-[#e0e0e0] px-4 sm:p-5 text-base dark:text-white dark:placeholder:text-slate-100"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <div className="relative my-[15px] flex items-center justify-center text-center">
          <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
          <span className="text-[0.9rem] font-bold">
            <Label
              htmlFor="password"
              className="mb-2 block text-left text-[24px] font-bold"
            >
              Password
            </Label>
          </span>
          <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
        </div>

        <Input
          type="password"
          id="password"
          placeholder="Enter your password"
          required
          value={formData.password}
          onChange={handleChange}
          className="h-[50px] rounded-[20px] sm:rounded-[25px] border border-black bg-[#e0e0e0] px-4 sm:p-5 text-base dark:text-white dark:placeholder:text-slate-100"
        />
      </div>

      {/* Forgot password */}
      <div className="mb-1 text-right">
        <Link
          to="/forgotpassword"
          className="text-sm sm:text-[15px] font-bold text-black no-underline hover:underline dark:text-slate-200"
        >
          Forgot password?
        </Link>
      </div>

      {/* Login + Register */}
      <div className="flex flex-col items-center justify-center py-6">
        <Button
          type="submit"
          className="mb-6 h-[50px] sm:h-[67px] w-full sm:w-[186px] rounded-[20px] sm:rounded-[25px] border border-black bg-white text-lg sm:text-[24px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-3 cursor-pointer"
        >
          Login
        </Button>
        <span className="text-center text-sm sm:text-[16px]">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="no-underline hover:underline text-green-600"
          >
            Register here
          </Link>
        </span>
      </div>
    </form>
  </CardContent>
</Card>


            <div className="mb-6">
                <div className="relative my-[15px] flex items-center justify-center text-center">
              <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
              <span className="text-[0.9rem] font-bold">
                <Label htmlFor="username" className="mb-2 block text-left text-[24px] font-bold">
                Username
              </Label>
              </span>
              <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
            </div>
              
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleChange}
                className="h-[50px] rounded-[25px] border border-black bg-[#e0e0e0] p-5  dark:text-white dark:placeholder:text-slate-100 "
              />
            </div>
            <div className="mb-6">
                <div className="mb-6">
                <div className="relative my-[15px] flex items-center justify-center text-center">
              <div className="mr-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
              <span className="text-[0.9rem] font-bold">
                <Label htmlFor="password" className="mb-2 block text-left text-[24px] font-bold">
                    Password
                </Label>
              </span>
              <div className="ml-2.5 h-px w-1/3 bg-lime-500 dark:bg-lime-500"></div>
            </div>
            </div>
              
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="h-[50px] rounded-[25px] border border-black bg-[#e0e0e0] p-5  dark:text-white dark:placeholder:text-slate-100"
              />
            </div>
            <div className="mb-1 text-right">
              <Link to="/forgotpassword" className="text-[15px] font-bold text-black no-underline hover:underline dark:text-slate-200">
                Forgot password?
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              <Button
                type="submit"
                className="mb-6 h-[67px] w-[186px] rounded-[25px] border border-black bg-white text-[24px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-3 cursor-pointer"
              >
                Login
              </Button>
              <span className="text-center text-[16px]">
                Don’t have an account?{" "}
                <Link to="/register" className="no-underline hover:underline text-green-600">
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