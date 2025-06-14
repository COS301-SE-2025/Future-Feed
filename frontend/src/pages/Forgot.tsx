import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../assets/Future feed transparent-Photoroom.png";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface FormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
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
      <Card className="relative mb-8 mt-5 w-full max-w-[828px] rounded-[20px] border-2 border-lime-500 bg-white px-10 py-8 shadow-[0_0_30px_#999] sm:px-12">
        <Link to="/login">
          <Button
            className="absolute left-5 top-5 h-[40px] w-[40px] rounded-full border border-lime-500 bg-white p-0 hover:bg-gray-200 cursor-pointer shadow-[2px_2px_4px_#888] hover:shadow-[1px_1px_10px_black]"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
        </Link>
        
        <CardHeader>
          <CardTitle className="text-center text-[40px]">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="px-5 sm:px-12">
            <div className="mb-6">
                <div className="relative my-[15px] flex items-center justify-center text-center">
                <div className="mr-2.5 h-px w-1/3 bg-lime-500"></div>
                <span className="text-[0.9rem] font-bold">
                <Label htmlFor="email" className="mb-2 block text-left text-[24px] font-bold">
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
                className="h-[50px] rounded-[25px] border border-black bg-[#e0e0e0] p-5"
              />
            </div>
            <div className="flex justify-center py-6">
              <Button
                type="submit"
                className="h-[67px] w-[186px] rounded-[25px] border border-black bg-white text-[20px] font-bold text-black shadow-[2px_2px_4px_#888] hover:bg-gray-200 hover:shadow-[1px_1px_10px_black] hover:border-lime-500 hover:border-2 cursor-pointer"
              >
                Reset password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;