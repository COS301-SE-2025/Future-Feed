import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../assets/Future Feed Main Dark v1.png";
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
    <div className="flex min-h-screen flex-col items-center bg-background text-foreground font-sans">
      <div className="mt-10 flex justify-center">
        <img src={logo} alt="Future Feed Logo" className="h-[311px] w-[311px]" />
      </div>

      <Card className="mb-8 mt-5 w-full max-w-[828px] rounded-2xl border border-lime-500 bg-card px-10 py-8 shadow-xl sm:px-12">
        <CardHeader>
          <CardTitle className="text-center text-4xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="px-5 sm:px-12">
            <Link to="/construction" className="no-underline">
              <Button
                variant="outline"
                className="mb-6 flex h-[50px] w-full items-center justify-center rounded-full border border-input bg-background text-lg font-bold shadow-sm hover:border-lime-500 dark:hover:cursor-pointer dark:hover:border-lime-500"
              >
                Continue with:
                <img src={googleLogo} alt="Google Login" className="ml-8 h-[37px] w-[80px]" />
              </Button>
            </Link>

            {/* Username */}
            <div className="mb-6">
              <div className="relative my-4 flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500" />
                <Label htmlFor="username" className="text-xl font-bold">
                  Username
                </Label>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500" />
              </div>
              <Input
                type="text"
                id="username"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleChange}
                className="h-[50px] rounded-full border border-input bg-muted px-4 focus:ring-2 focus:ring-lime-500"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="relative my-4 flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500" />
                <Label htmlFor="password" className="text-xl font-bold">
                  Password
                </Label>
                <div className="ml-2.5 h-px w-1/3 bg-lime-500" />
              </div>
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="h-[50px] rounded-full border border-input bg-muted px-4"
              />
            </div>

            <div className="mb-1 text-right">
              <Link to="/forgotpassword" className="text-sm font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <Button
                type="submit"
                className="mb-6 h-[67px] w-[186px] rounded-full bg-primary text-lg font-bold text-primary-foreground shadow hover:bg-primary/90 dark:hover:cursor-pointer dark:hover:border-lime-500"
              >
                Login
              </Button>
              <span className="text-center text-sm">
                Don’t have an account?{" "}
                <Link to="/register" className="font-semibold text-lime-600 hover:underline">
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
