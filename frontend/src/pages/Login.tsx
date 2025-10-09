import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import futurefeedLogo from "../assets/white logo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (res.ok) {
          console.log("Registration successful");
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
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          credentials: "include",
          body: params.toString(),
        });

        if (res.ok) {
          console.log("Login successful");
          navigate("/home");
        } else {
          console.error("Login failed");
        }
      } catch (err) {
        console.error("Error during login:", err);
      }
    }
  };

  const handleToggle = () => setIsRegister(!isRegister);

  return (
    <div className="relative min-h-screen font-['Cambay',Arial,sans-serif] bg-gray-100 flex flex-col lg:flex-row overflow-hidden transition-all duration-500">

      {/* LEFT SIDE IMAGE SECTION (hidden on mobile) */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ${
          !isRegister ? "translate-x-full" : ""
        } hidden lg:block`}
      >
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
          <img src={futurefeedLogo} alt="Future Feed Logo" className="h-[400px] w-auto" />
        </div>
      </div>

      {/* RIGHT SIDE IMAGE SECTION (hidden on mobile) */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ${
          isRegister ? "translate-x-full" : ""
        } hidden lg:block`}
      >
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
          <img src={futurefeedLogo} alt="Future Feed Logo" className="h-[400px] w-auto" />
        </div>
      </div>

      {/* FORM SECTION */}
      <div
        className={`relative z-10 flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-10 transition-transform duration-500 ${
          isRegister ? "lg:translate-x-0" : "lg:translate-x-full"
        }`}
      >
        <Card className="w-full max-w-sm sm:max-w-md rounded-xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl sm:text-3xl font-bold">
              {isRegister ? "Register" : "Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">

              {/* GOOGLE SIGN-IN */}
              {!isRegister && (
                <Button
                  type="button"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
                  }}
                  className="w-full py-3 sm:py-3 text-sm sm:text-base rounded-full bg-gray-700 text-white hover:bg-gray-800 flex items-center justify-center hover:cursor-pointer"
                >
                  <span className="whitespace-nowrap mr-2">Continue with:</span>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google Logo"
                    className="h-5 w-5 hidden lg:inline"
                  />
                </Button>
              )}

              {/* USERNAME */}
              <div>
                <Label htmlFor="username" className="font-bold text-sm sm:text-base">
                  Username
                </Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                />
              </div>

              {/* REGISTER FIELDS */}
              {isRegister && (
                <>
                  <div>
                    <Label htmlFor="display-name" className="font-bold text-sm sm:text-base">
                      Display Name
                    </Label>
                    <Input
                      type="text"
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      required
                      className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-bold text-sm sm:text-base">
                      Email
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dob" className="font-bold text-sm sm:text-base">
                      Date of Birth
                    </Label>
                    <Input
                      type="date"
                      id="dob"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profilePic" className="font-bold text-sm sm:text-base">
                      Profile Picture
                    </Label>
                    <Input
                      type="file"
                      id="profilePic"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                    />
                  </div>
                </>
              )}

              {/* PASSWORD */}
              <div>
                <Label htmlFor="password" className="font-bold text-sm sm:text-base">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                />
              </div>

              {/* CONFIRM PASSWORD (REGISTER ONLY) */}
              {isRegister && (
                <div>
                  <Label htmlFor="confirm-password" className="font-bold text-sm sm:text-base">
                    Confirm Password
                  </Label>
                  <Input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="mt-2 h-11 sm:h-12 rounded-full text-base px-4"
                  />
                </div>
              )}

              {/* FORGOT PASSWORD */}
              {!isRegister && (
                <div className="text-right mt-1 sm:mt-2">
                  <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* SUBMIT */}
              <Button
                type="submit"
                className="w-full py-2.5 sm:py-3 text-base sm:text-lg rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:cursor-pointer"
              >
                {isRegister ? "Register" : "Login"}
              </Button>

              {/* TOGGLE LOGIN/REGISTER */}
              <p className="text-center text-xs sm:text-sm mt-3 sm:mt-4">
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <Link
                  to="#"
                  onClick={handleToggle}
                  className="text-blue-600 hover:underline"
                >
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
