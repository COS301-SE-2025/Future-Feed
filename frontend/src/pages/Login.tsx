import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import futurefeedLogo from "../assets/white logo.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      const body = {
        username,
        password,
        email,
        displayName,
        profilePicture,
        dateOfBirth,
      };

      try {
        const res = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (res.ok) {
          console.log("Registration successful");
          // Optionally toggle to login or navigate
          setIsRegister(false);
        } else {
          console.error("Registration failed");
        }
      } catch (err) {
        console.error("Error during registration:", err);
      }
    } else {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include",
          body: params.toString(),
        });

        if (res.ok) {
          console.log("Login successful");
          // Optionally navigate to dashboard or home
          navigate("/home"); // Adjust route as needed
        } else {
          console.error("Login failed");
        }
      } catch (err) {
        console.error("Error during login:", err);
      }
    }
  };

  const handleToggle = () => {
    setIsRegister(!isRegister);
  };

  return (
    <div className="relative min-h-screen font-['Cambay',Arial,sans-serif] bg-gray-100 flex overflow-hidden transition-all duration-500">
      <div className={`absolute inset-0 transition-transform duration-500 ${!isRegister ? "translate-x-full" : ""}`}>
        <div
          className="absolute inset-0 bg-[#0a1d34]"
          style={{
            clipPath: "polygon(50% 0, 100% 0, 100% 100%, 65% 100%)",
          }}
        ></div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1d34] via-[#102c4c] to-[#0a1d34] opacity-90"
          style={{
            clipPath: "polygon(50% 0, 100% 0, 100% 100%, 65% 100%)",
          }}
        ></div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 flex justify-center">
          <img
            src={futurefeedLogo}
            alt="Future Feed Logo"
            className="h-[400px] w-auto"
          />
        </div>
      </div>

      <div className={`absolute inset-0 transition-transform duration-500 ${isRegister ? "translate-x-full" : ""}`}>
        <div
          className="absolute inset-0 bg-[#0a1d34]"
          style={{
            clipPath: "polygon(0 0, 50% 0, 35% 100%, 0% 100%)",
          }}
        ></div>
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1d34] via-[#102c4c] to-[#0a1d34] opacity-90"
          style={{
            clipPath: "polygon(0 0, 50% 0, 35% 100%, 0% 100%)",
          }}
        ></div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 flex justify-center">
          <img
            src={futurefeedLogo}
            alt="Future Feed Logo"
            className="h-[400px] w-auto"
          />
        </div>
      </div>

      <div className={`relative z-10 flex w-full lg:w-1/2 items-center justify-center p-8 transition-transform duration-500 ${isRegister ? "translate-x-0" : "translate-x-full"}`}>
        <Card className="w-full max-w-md rounded-xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">{isRegister ? "Register" : "Login"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-7">
              {!isRegister && (
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
              )}
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
              {isRegister && (
                <>
                  <div>
                    <Label htmlFor="display-name" className="font-bold">Display Name</Label>
                    <Input
                      type="text"
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      required
                      className="mt-2 h-12 rounded-full text-lg px-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-bold">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="mt-2 h-12 rounded-full text-lg px-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob" className="font-bold">Date of Birth</Label>
                    <Input
                      type="date"
                      id="dob"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="mt-2 h-12 rounded-full text-lg px-4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profilePic" className="font-bold">Profile Picture</Label>
                    <Input
                      type="text"
                      id="profilePic"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      placeholder="Enter profile picture URL"
                      className="mt-2 h-12 rounded-full text-lg px-4"
                    />
                  </div>
                </>
              )}
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
              </div>
              {isRegister && (
                <div>
                  <Label htmlFor="confirm-password" className="font-bold">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="mt-2 h-12 rounded-full text-lg px-4"
                  />
                </div>
              )}
              {!isRegister && (
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              )}
              <Button
                type="submit"
                className="w-full py-3 text-lg rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                {isRegister ? "Register" : "Login"}
              </Button>
              <p className="text-center text-sm mt-4">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <Link to="#" onClick={handleToggle} className="text-blue-600 hover:underline">
                  {isRegister ? "Login" : "Register"}
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