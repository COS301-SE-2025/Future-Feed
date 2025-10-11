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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [regSuccessful, setRegSuccessful] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const calculateAge = (birthDate: string) => {
    const today = new Date(2025, 9, 10);
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRegSuccessful(null);
    setIsLoading(true);

    if (isRegister) {
      if (!username || !password || !email || !displayName || !dateOfBirth) {
        setErrorMsg("All fields are required.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }
      if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
        setErrorMsg("Invalid email format.");
        setIsLoading(false);
        return;
      }
      const age = calculateAge(dateOfBirth);
      if (age < 13) {
        setErrorMsg("You must be at least 13 years old to register.");
        setIsLoading(false);
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
          setIsRegister(false);
          setRegSuccessful("Registration successful! Please login.");
        } else {
          const data = await res.json();
          setErrorMsg(data.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        setErrorMsg("An error occurred during registration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!username.trim() || !password.trim()) {
    setErrorMsg("Both username and password are required.");
    setIsLoading(false);
    return;
  }

  const params = new URLSearchParams();
  params.append("username", username.trim());
  params.append("password", password.trim());

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      credentials: "include",
      body: params.toString(),
    });

    if (res.ok) {
      navigate("/home");
    } else {
      let errorMessage = "Login failed. Please check your username or password.";
      try {
        const data = await res.json();
        if (data?.message) errorMessage = data.message;
      } catch {
      }
      setErrorMsg(errorMessage);
    }
  } catch (err) {
    setErrorMsg("Unable to connect to the server. Please try again later.");
  } finally {
    setIsLoading(false);
  }}
  };

  const handleToggle = () => {
  setIsRegister(!isRegister);
  setErrorMsg(null);
  setRegSuccessful(null);
};

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
          <img
            src={futurefeedLogo}
            alt="Future Feed Logo"
            className="h-[200px] sm:h-[300px] md:h-[400px] w-auto"
          />
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
            <CardTitle className="text-center text-3xl font-bold">{isRegister ? "Register" : "Login"}</CardTitle>
            {errorMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  {errorMsg}
                </div>
              )}
              {regSuccessful && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                  {regSuccessful}
                </div>
              )}
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
                  className="w-full lg:h-10 py-4 sm:py-3 text-base sm:text-base rounded-full bg-gray-700 text-white hover:bg-gray-800 flex items-center justify-center hover:cursor-pointer"
                >
                  <span className="whitespace-nowrap mr-2 gap-3">Continue with:         
                  
                  </span>
                   <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google Logo"
                    className="h-5 w-5 -translate-y-[2px] lg:h-4 lg:w-4 -translate-y-[2px]"
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
                  className="mt-2 lg:h-10 sm:h-12 rounded-full text-base px-4"
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
                      className="mt-2 lg:h-10 sm:h-12 rounded-full text-base px-4"
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
                      className="mt-2 h-9 sm:h-12 rounded-full text-base px-4"
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
                      className="mt-2 h-9 sm:h-12 rounded-full text-base px-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profilePic" className="font-bold">Profile Picture (Optional)</Label>
                    <Input
                      type="file"
                      id="profilePic"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="mt-2 lg:h-10 sm:h-12 rounded-full text-base px-4"
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
                  className="mt-2 lg:h-10 sm:h-12 rounded-full text-base px-4"
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
                    className="mt-2 lg:h-10 sm:h-12 rounded-full text-base px-4"
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
                disabled={isLoading}
                className="w-full py-3 text-lg rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:cursor-pointer">
                {isLoading ? "Loading..." : isRegister ? "Register" : "Login"}
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
