{/*component that contains the rhs of the notifications page*/ }

import { Input } from "@/components/ui/input";

import WhatsHappening from "./WhatsHappening";
import WhoToFollow from "./WhoToFollow";

const RightSidebar = () => {
    return (
        <div className="hidden lg:block w-[350px] px-4 space-y-6">
            {/* Search Input */}
            <div className="sticky top-4 z-10 bg-gray-800">
                <Input
                    type="text"
                    placeholder="Search"
                    className="placeholder:text-slate-100 rounded-2xl px-4 py-2 bg-gray-800 text-slate-100 border focus:ring-0 focus:outline-none"
                />
            </div>
            <WhatsHappening />
            <WhoToFollow />

            
        </div>
    );
};

export default RightSidebar;