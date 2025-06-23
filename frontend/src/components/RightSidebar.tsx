{/*component that contains the rhs of the notifications page*/ }

import { Input } from "@/components/ui/input";

import WhatsHappening from "./WhatsHappening";
import WhoToFollow from "./WhoToFollow";

const RightSidebar = () => {
    return (
        <div className="hidden lg:block w-[350px] px-4 space-y-6">
            {/* Search Input */}
            <div className="sticky top-4 z-10 bg-black dark:bg-black">
                <Input
                    type="text"
                    placeholder="Search"
                    className=" bg-green dark:placeholder:text-lime-500 rounded-2xl px-4 py-2 dark:bg-black dark:text-slate-100 border dark:border-lime-500 focus:ring-0 focus:outline-none"
                />
            </div>
            <WhatsHappening />
            <WhoToFollow />

            
        </div>
    );
};

export default RightSidebar;