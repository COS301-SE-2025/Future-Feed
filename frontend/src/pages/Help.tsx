import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
//extend with accordions
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


import LoginHelp from "../assets/loginhelp.mp4";
import HowToLoginMobile from "../assets/howtologinmobile.mp4";
import PostCreationHelp from "../assets/postcreationhelp.mp4";
import FollowHelpDesktop from "../assets/followhelpdesktop.mp4";
import FollowHelpMobile from "../assets/followhelpmobile.mp4";
import HowToChangeThemeDesktop from "../assets/howtochangethemedesktop.mp4";
import HowToChangeThemeMobile from "../assets/howtochangethememobile.mp4";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 dark:text-slate-300 min-h-screen dark:bg-black">
      <h1 className="font-bold text-2xl text-lime-500 text-right">Help Centre</h1>

      <div className="flex border rounded-2xl justify-between items-center my-3 px-4 py-3 sticky top-0 dark:bg-black border-lime-500">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild onClick={() => navigate("/profile")} className="cursor-pointer">
                <span>Profile</span>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild onClick={() => navigate("/settings")} className="cursor-pointer">
                <span>Settings</span>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Help Center</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Videos Section */}
      {/* split into mobile and desktop to include more videos w a cleaner UI hopefully*/ }
      <div className="flex flex-col gap-8 mt-6 mx-auto max-w-2xl">
  {/* Mobile Section */}
  <h2 className="text-xl font-bold text-lime-500">Mobile Devices</h2>
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value="mobile-login">
      <AccordionTrigger>How to Log In</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={HowToLoginMobile} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="mobile-post">
      <AccordionTrigger>How to Create a Post</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={PostCreationHelp} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="mobile-follow">
      <AccordionTrigger>How to Follow Users</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={FollowHelpMobile} type="video/mp4" />
        </video>
      </AccordionContent>

    </AccordionItem>
     <AccordionItem value="mobile-theme">
      <AccordionTrigger>How to Change Theme </AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={HowToChangeThemeMobile} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  

  {/* Desktop Section */}
  <h2 className="text-xl font-bold text-lime-500 mt-8">Larger Screen Devices</h2>
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value="desktop-login">
      <AccordionTrigger>How to Log In</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={LoginHelp} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="desktop-post">
      <AccordionTrigger>How to Create a Post</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={PostCreationHelp} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="desktop-follow">
      <AccordionTrigger>How to Follow Users</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={FollowHelpDesktop} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>
     <AccordionItem value="-theme">
      <AccordionTrigger>How to Change Theme</AccordionTrigger>
      <AccordionContent>
        <video controls className="w-full rounded-xl border border-lime-500">
          <source src={HowToChangeThemeDesktop} type="video/mp4" />
        </video>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>

    </div>
  );
};

export default Help;
