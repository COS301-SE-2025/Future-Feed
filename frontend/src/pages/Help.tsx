import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import LoginHelp from "../assets/loginhelp.mp4";
import PostCreationHelp from "../assets/postcreationhelp.mp4";
import FollowHelp from "../assets/followhelp.mp4";

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
      <div className="flex flex-col gap-6 mt-6 mx-auto items-center">
  <div className="rounded-xl overflow-hidden border border-lime-500 w-[400px]">
    <video controls className="w-full h-auto rounded-xl">
      <source src={LoginHelp} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <p className="text-center mt-2 font-semibold text-lime-400">How to Log In</p>
  </div>

  <div className="rounded-xl overflow-hidden border border-lime-500 w-[400px]">
    <video controls className="w-full h-auto rounded-xl">
      <source src={PostCreationHelp} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <p className="text-center mt-2 font-semibold text-lime-400">How to Create a Post</p>
  </div>

  <div className="rounded-xl overflow-hidden border border-lime-500 w-[400px]">
    <video controls className="w-full h-auto rounded-xl">
      <source src={FollowHelp} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <p className="text-center mt-2 font-semibold text-lime-400">How to Follow Users</p>
  </div>
</div>
    </div>
  );
};

export default Help;
