import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Construction: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 font-['Cambay',Arial,sans-serif]">
      <Card className="max-w-[600px] rounded-2xl border-lime-500 border-2 bg-white p-7 shadow-[0_0_20px_rgba(0,0,0,0.1)] shadow-[2px_2px_20px_#000000]">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#333333]">
            Page Under Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className="mb-10 text-lg text-[#666666]">
            This is currently being worked on! See you soon.
          </CardDescription>
          <div className="text-center text-[100px] text-[#FFA500]">🚧</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Construction;