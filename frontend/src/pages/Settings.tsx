import {
  Link2,
  SquareArrowOutUpRight,
} from "lucide-react"
import PersonalSidebar from "@/components/PersonalSidebar"
import WhatsHappening from "@/components/WhatsHappening"
import WhoToFollow from "@/components/WhoToFollow"

import * as React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useState } from "react";

import { useNavigate } from "react-router-dom"

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
}

const Settings = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  React.useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/myInfo`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
        const data: UserProfile = await res.json();
        setCurrentUser(data);
        return data;
      } catch {
        navigate("/login");
        return null;
      }
    };

    const fetchData = async () => {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
    };
    
    fetchData();
    
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        window.open("https://www.epiuse.com/")
      }
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        navigate("/FAQS")
      }
      if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        navigate("/help")
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [navigate])
  
 

  return (
    <div className="flex items-start future-feed:bg-black future-feed:text-lime min-h-screen bg-ffgrey">
      <aside className="lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 p-2 overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-2 sticky top-0 z-10">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="w-full max-w-10xl mx-auto">
          <Command className="border-rose-gold-accent-border future-feed:border-lime rounded-2xl border shadow-md w-full max-w-full">
            <CommandInput placeholder=" Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>
                  <a
                    href="https://www.epiuse.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full"
                  >
                    <Link2 />
                    <span> EPI-USE Official Website </span>
                  </a>
                </CommandItem>
                <CommandItem
                  onSelect={() => navigate("/FAQS")}
                  className="cursor-pointer"
                >
                  <SquareArrowOutUpRight />
                  <span>FAQ'S</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="All">
                <CommandItem>
                  <a
                    href="https://www.epiuse.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full"
                  >
                    <Link2 />
                    <span>EPI-USE Official Website</span>
                  </a>
                  <kbd className="tracking-widest ml-auto">
                    <CommandShortcut>⌘P</CommandShortcut>
                  </kbd>
                </CommandItem>

                <CommandItem
                  onSelect={() => navigate("/FAQS")}
                  className="cursor-pointer"
                >
                  <SquareArrowOutUpRight />
                  <span>FAQ'S</span>
                  <kbd className="tracking-widest ml-auto">
                    <CommandShortcut>⌘B</CommandShortcut>
                  </kbd>
                </CommandItem>

                <CommandItem
                  onSelect={() => navigate("/help")}
                  className="cursor-pointer"
                >
                  <SquareArrowOutUpRight />
                  <span>Help center</span>
                  <kbd className="tracking-widest ml-auto">
                    <CommandShortcut>⌘H</CommandShortcut>
                  </kbd>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>

        <div className="w-full px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:sticky lg:h-screen hidden lg:block mr-[41px]">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
          <WhatsHappening />
        </div>
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7 lg:sticky">
          <WhoToFollow />
        </div>
      </aside>
    </div>
  );
};

export default Settings