

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import { useEffect, useState } from "react";
import HowtoLoginDesktop from "../assets/howtologindesktop.mp4";
import HowToLoginMobile from "../assets/howtologinmobile.mp4";

import HowToFollowDesktop from "../assets/howtofollowdesktop.mp4";
import HowToFollowMobile from "../assets/howtofollowmobile.mp4";
import HowToCreateBotsDesktop from "../assets/howtomakebotdesktop.mp4";
import HowToCreateBotsMobile from "../assets/howtomakebotmobile.mp4";
import HowToCreatePostsMobile from "../assets/howtocreatepostmobile.mp4";

import HowToCreatePostDesktop from "../assets/howtoCreatePostdesktop.mp4";

import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  profilePicture?: string;
  bio?: string | null;
  dateOfBirth?: string | null;
  email: string;
}


const Help = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/myInfo`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch user info: ${res.status}`);
      const data: UserProfile = await res.json();
      if (!data.username || !data.displayName) {
        throw new Error("User info missing username or displayName");
      }
      setCurrentUser(data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err);
      navigate("/login");
      return null;
    }
  };

  useEffect(() => {
  const initializeData = async () => {
    await fetchCurrentUser();
  };

  initializeData();
}, []);

if(!currentUser){
  console.error("You are not logged in. Please log in.");
  navigate("/login");
}
 

 return (
    <div className="flex items-start future-feed:bg-black future-feed:text-lime  min-h-screen bg-ffgrey dark:bg-blue-950 dark:text-white">
       <aside className="lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 sm:p9 p-4  min-h-screen overflow-y-auto">


        <div className="border-rose-gold-accent-border future-feed:border-lime future-feed:bg-card flex border justify-between items-center px-2 py-4 sticky top-0 dark:bg-indigo-950 border-none dark:border-slate-200  z-10">
          <h1 className="text-xl dark:text-slate-200 font-bold">Help Center</h1>
        </div>
        {/* Videos Section */}
      {/* split into mobile and desktop to include more videos w a cleaner UI hopefully*/ }
      <div className="drop-shadow-xl flex flex-col gap-2 p-3 rounded-lg w-full    bg-white">
  {/* Mobile Section */}
  <h2 className="text-xl future-feed:text-lime font-bold dark:text-slate-200">Mobile Devices</h2>
  <Accordion type="single" collapsible className="w-full ">
    <AccordionItem value="mobile-login">
      <AccordionTrigger>How to Log In</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl future-feed:border-lime border ">
          <source src={HowToLoginMobile} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="mobile-post">
      <AccordionTrigger>How to Create a Post</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowToCreatePostsMobile} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="mobile-follow">
      <AccordionTrigger>How to Follow Users</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowToFollowMobile} type="video/mp4" />
        </video>
      </AccordionContent>

    </AccordionItem>
     <AccordionItem value="mobile-theme">
      <AccordionTrigger>How to Create a Bot </AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowToCreateBotsMobile} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  

  {/* Desktop Section */}
  <h2 className="text-xl future-feed:text-lime font-bold dark:text-slate-200 mt-8">Larger Screen Devices</h2>
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value="desktop-login">
      <AccordionTrigger>How to Log In</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowtoLoginDesktop} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="desktop-post">
      <AccordionTrigger>How to Create a Post</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowToCreatePostDesktop} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="desktop-follow">
      <AccordionTrigger>How to Follow Users</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowToFollowDesktop} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>
     <AccordionItem value="-theme">
      <AccordionTrigger>How to Create a Bot</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full future-feed:border-lime rounded-xl border ">
          <source src={HowToCreateBotsDesktop} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  </div>

        

        <div className="w-full  px-4 mt-7 py-2  space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px]    lg:sticky lg:h-screen  hidden lg:block mr-6.5 ">
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7 ">
            <WhatsHappening />
           
          </div>
          <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
        
            <WhoToFollow />
          </div>
        
        </aside>
    </div>
  
  );
};

export default Help;