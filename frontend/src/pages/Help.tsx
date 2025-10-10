import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";

import LoginHelp from "../assets/loginhelp.mp4";
import HowToLoginMobile from "../assets/howtologinmobile.mp4";
import PostCreationHelp from "../assets/postcreationhelp.mp4";
import FollowHelpDesktop from "../assets/followhelpdesktop.mp4";
import FollowHelpMobile from "../assets/followhelpmobile.mp4";
import HowToChangeThemeDesktop from "../assets/howtochangethemedesktop.mp4";
import HowToChangeThemeMobile from "../assets/howtochangethememobile.mp4";

const Help = () => {
 

  return (
    <div className="flex items-start future-feed:bg-black future-feed:text-lime min-h-screen bg-ffgrey dark:bg-blue-950 dark:text-white">
      <aside className="lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 sm:p-9 p-4 min-h-screen overflow-y-auto">
        <div className="border-rose-gold-accent-border future-feed:border-lime future-feed:bg-card flex border justify-between items-center px-2 py-4 sticky top-0 dark:bg-indigo-950 border-none dark:border-slate-200 z-10">
          <h1 className="text-xl dark:text-slate-200 font-bold">Help Center</h1>
        </div>

        <div className="drop-shadow-xl flex flex-col gap-2 p-3 rounded-lg w-full bg-white">
          <h2 className="text-xl future-feed:text-lime font-bold dark:text-slate-200">Mobile Devices</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="mobile-login">
              <AccordionTrigger>How to Log In</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full rounded-xl future-feed:border-lime border">
                  <source src={HowToLoginMobile} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mobile-post">
              <AccordionTrigger>How to Create a Post</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={PostCreationHelp} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mobile-follow">
              <AccordionTrigger>How to Follow Users</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={FollowHelpMobile} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mobile-theme">
              <AccordionTrigger>How to Change Theme</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={HowToChangeThemeMobile} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <h2 className="text-xl future-feed:text-lime font-bold dark:text-slate-200 mt-8">Larger Screen Devices</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="desktop-login">
              <AccordionTrigger>How to Log In</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={LoginHelp} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="desktop-post">
              <AccordionTrigger>How to Create a Post</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={PostCreationHelp} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="desktop-follow">
              <AccordionTrigger>How to Follow Users</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={FollowHelpDesktop} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="desktop-theme">
              <AccordionTrigger>How to Change Theme</AccordionTrigger>
              <AccordionContent>
                <video controls className="w-full future-feed:border-lime rounded-xl border">
                  <source src={HowToChangeThemeDesktop} type="video/mp4" />
                </video>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="w-full px-4 mt-7 py-2 space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:sticky lg:h-screen hidden lg:block mr-6.5">
        <div className="w-full lg:w-[320px] mt-5 lg:ml-7">
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