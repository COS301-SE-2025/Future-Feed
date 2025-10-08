import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import futurefeedLogo from "../assets/white logo.png";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { username, password });
  };

  return (
    <div className="relative min-h-screen font-['Cambay',Arial,sans-serif] bg-gray-100 flex">
      {/* Left Diagonal Section */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-[#0a1d34]"
          style={{
            clipPath: "polygon(0 0, 50% 0, 35% 100%, 0% 100%)", // shifted so top ends near middle
          }}
        ></div>
        {/* Optional background effect */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1d34] via-[#102c4c] to-[#0a1d34] opacity-90"
          style={{
            clipPath: "polygon(0 0, 50% 0, 35% 100%, 0% 100%)",
          }}
        ></div>
        {/* Logo centered inside diagonal area */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 flex justify-center">
          <img
            src={futurefeedLogo}
            alt="Future Feed Logo"
            className="h-[400px] w-auto"
          />
        </div>
      </div>

      {/* Right Section with Login form */}
      <div className="relative z-10 flex w-full lg:w-1/2 items-center justify-center ml-auto p-8 translate-x-6"> 
        <Card className="w-full max-w-md rounded-xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Google button */}
              <Button
                type="button"
                className="w-full py-3 text-base rounded-full bg-gray-700 text-white hover:bg-gray-800 flex items-center justify-center hover:cursor-pointer"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google Logo"
                  className="mr-2 h-6 w-6"
                />
                Continue with Google
              </Button>

              {/* Username */}
              <div>
                <Label htmlFor="username" className="font-bold">Username</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="mt-2 h-12 rounded-full text-lg px-4"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="font-bold">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-2 h-12 rounded-full text-lg px-4"
                />
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Login button */}
              <Button
                type="submit"
                className="w-full py-3 text-lg rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Login
              </Button>

              {/* Register link */}
              <p className="text-center text-sm mt-4">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
