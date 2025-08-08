import { Input } from "@/components/ui/input";
import WhatsHappening from "./WhatsHappening";
import WhoToFollow from "./WhoToFollow";

const RightSidebar = () => {
  return (
    <div className="hidden lg:block w-[350px] px-4 space-y-6">
      {/* Search Input */}
      
        
      <WhatsHappening />
      <WhoToFollow />
    </div>
  );
};

export default RightSidebar;
