import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

const Construction: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 font-['Cambay',Arial,sans-serif] dark:bg-black dark:text-white">
      <ThemeProvider>
          <div className="pe-9 flex items-center gap-2">
              <ModeToggle />

          </div>
      </ThemeProvider>
      <Card className="max-w-[600px] rounded-2xl border-lime-500 border-2 bg-white p-7 shadow-[0_0_20px_rgba(0,0,0,0.1)] shadow-[2px_2px_20px_#000000] dark:bg-[#1a1a1a] dark:text-white dark:border-lime-500">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Page Under Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CardDescription className="mb-10 text-lg dark:text-white">
            This is currently being worked on! See you soon.
          </CardDescription>
          <div className="text-center text-[100px]">🚧</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Construction;