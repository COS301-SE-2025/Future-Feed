import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";
import PersonalSidebar from "@/components/PersonalSidebar";
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
const FAQS = () => {
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

  if (!currentUser) {
    console.error("You are not logged in. Please log in.");
    navigate("/login");
  }

  return (
    <div className="flex items-start future-feed:bg-black future-feed:text-lime  min-h-screen bg-ffgrey">
      <aside className="lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 sm:p9 p-4  min-h-screen overflow-y-auto">


        <div className="border-none future-feed:border-lime future-feed:bg-card flex border justify-between items-center px-2 py-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold">Frequently Asked Questions</h1>
        </div>
        <div className="drop-shadow-xl flex flex-col gap-2 p-3 rounded-lg w-full bg-white">

          <Accordion
            type="single"
            collapsible
            className="w-full "

          >
            <AccordionItem value="item-1">
              <AccordionTrigger>How to post?</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p className="font-bold">
                  Step 1
                </p>
                <p>
                  Type your post(up to 280 characters) into the composite box at the top of your Home timeline, or select the Post button in the navigation bar.
                </p>
                <p className="font-bold">Step 2</p>
                <p>You can select 1 picture at a time(for now) </p>
                <p className="font-bold">Step 3</p>
                <p> Select the Post button to post the Feed to your profile,done.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How to delete a post?</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p className="font-bold">
                  Step 1
                </p>
                <p>
                  Visit your Profile page
                </p>
                <p className="font-bold">Step 2</p>
                <p> Navigate to the post you wish to delete</p>
                <p className="font-bold ">Step 3</p>
                <p> Click the <p className="font-bold ">X</p> icon </p>
                <p className="font-bold ">Step 4</p>
                <p>Click the Delete post</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Keyboard Shortcuts </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p className="font-bold">
                  When on the settings page, here is a short list of keyboard shortcuts to use
                </p>
                <p>
                  ctrl + p = navigates to the official EPI-USE Website
                </p>
                <p>
                  ctrl + b = navigates to the FAQ's page

                </p>
                <p>ctrl + h = navigates to the FAQS page</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How to protect your personal information </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p className="font-bold">
                  Consider what you post
                </p>
                <p>
                  You are in control of how much information you share on FUTURE FEED or any other website. Don’t post information you consider to be private, and be thoughtful about when you want to publicly share your location.
                </p>
                <p>
                  Be wary of any communication that asks for your private contact information, personal information, or passwords. If you are ever unsure before you post, we recommend you ask yourself the following questions:

                </p>
                <p>Who am I sharing this information with?</p>
                <p>How much and what type of information am I sharing?</p>
                <p>How many people can see the information I am sharing?</p>
                <p>Can I trust all the people that see this information?</p>
                <p className="font-bold">Not everyone has the same definition of what is considered private and what should be shared. If a friend or connection has posted information you prefer to be kept private, contact them and ask them to take down the content. Likewise, be considerate of others. If someone requests you remove information that you posted about them, please honor their request.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How to post a reply </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p className="font-bold">
                  Step 1
                </p>
                <p>
                  Find the post you want to reply to.
                </p>
                <p className="font-bold">Step 2</p>
                <p className="font-bold ">
                  <MessageCircle />

                </p> Click or tap the reply icon
                <p className="font-bold ">Step 3</p>
                <p>Type in your message and click or tap Reply to post it.</p>

              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>How to Edit your profile </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <p className="font-bold">
                  Step 1
                </p>
                <p>
                  Navigate to the profile page
                </p>
                <p className="font-bold"> Step 2</p>
                <p className="font-bold">
                  Click the "Edit Profile" button

                </p>
                <p className="font-bold">Step 3</p>
                <p>A box will appear from the right where you can update the relevant details</p>
                <p className="font-bold">Step 4</p>
                <p>Click 'Save changes' to save your changes</p>

              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>



        <div className="w-full  px-4 mt-7 py-2  space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:sticky      lg:h-screen  hidden lg:block mr-6.5 ">
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

export default FAQS