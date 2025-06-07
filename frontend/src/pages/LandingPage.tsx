import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import futureFeedLogo from "../assets/Future feed transparent-Photoroom.png";
import googleLogo from "../assets/google logo.webp";
import ffCropped from "../assets/FF cropped.png";

const LandingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-['Cambay',Arial,sans-serif] font-bold">
      <div className="flex flex-col items-center justify-center text-center">
        <img
          src={futureFeedLogo}
          alt="Future Feed Logo"
          className="mb-5 h-[336px] w-[336px]"
        />
        <Card className="w-[649px] rounded-[20px] border border-gray-200 bg-white p-8 shadow-[2px_2px_20px_#000000]">
          <CardContent>
            <h2 className="mb-5 text-2xl font-bold">Join the family</h2>
            <Link to="/construction">
              <Button
                variant="outline"
                className="mb-3 flex h-auto w-full items-center justify-center rounded-lg border-gray-300 bg-white py-2 text-base font-bold shadow-[1px_1px_4px_gray] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] cursor-pointer"
              >
                <img
                  src={googleLogo}
                  alt="Google"
                  className="mr-2.5 h-[38px] w-[76px]"
                />
                Continue with Google
              </Button>
            </Link>
            <div className="relative my-[15px] flex items-center justify-center text-center">
              <div className="mr-2.5 h-px w-1/3 bg-[#555]"></div>
              <span className="text-[0.9rem] font-bold">
                Or just
              </span>
              <div className="ml-2.5 h-px w-1/3 bg-[#555]"></div>
            </div>
            <Link to="/register">
              <Button
                variant="outline"
                className="mb-3 flex h-auto w-full items-center justify-center rounded-lg border-gray-300 bg-white py-2 text-base font-bold shadow-[1px_1px_4px_gray] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] cursor-pointer"
              >
                <img
                  src={ffCropped}
                  alt="Create Icon"
                  className="mr-5 h-[38px] w-[45px]"
                />
                Create new Future Feed Account
              </Button>
            </Link>
            <div className="relative my-[15px] flex items-center justify-center text-center">
              <div className="mr-2.5 h-px w-1/3 bg-[#555]"></div>
              <span className="text-[0.9rem] font-bold">
                Already have an account?
              </span>
              <div className="ml-2.5 h-px w-1/3 bg-[#555]"></div>
            </div>
            <Link to="/login">
              <Button
                variant="outline"
                className="mb-3 flex h-auto w-full items-center justify-center rounded-lg border-gray-300 bg-white py-2 text-base font-bold shadow-[1px_1px_4px_gray] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] cursor-pointer"
              >
                <img
                  src={ffCropped}
                  alt="Login Icon"
                  className="mr-5 h-[38px] w-[45px]"
                />
                Log into an existing Future Feed Account
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="mt-6 text-sm">
              A world's worth of posts, your way.
            </p>
            <p className="mt-1 text-xs italic text-gray-500">
              @ 2025, <em>Syntex Squad</em>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;