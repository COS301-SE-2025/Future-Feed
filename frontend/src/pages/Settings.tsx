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


import { useNavigate } from "react-router-dom"
//add theme in settings for mobile devices
//plus it makes sense to have it in settings

const Settings = () => {
  const navigate = useNavigate()

  React.useEffect(() => {
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
    <div className="flex items-start future-feed:bg-black future-feed:text-lime  min-h-screen bg-ffgrey dark:bg-blue-950 dark:text-white">
      <aside className="  lg:w-[245px] lg:ml-6 py-5   flex-shrink-0 lg:sticky  lg:top-[50px] lg:h-screen overflow-y-auto">
        <PersonalSidebar />
      </aside>

      <main className="flex-1 sm:p9 p-4  min-h-screen overflow-y-auto">


        <div className="border-rose-gold-accent-border future-feed:border-lime future-feed:bg-card flex border justify-between items-center px-2 py-4 sticky top-0 dark:bg-indigo-950 border-none dark:border-slate-200  z-10">
          <h1 className="text-xl dark:text-slate-200 font-bold">Settings</h1>
        </div>
        {/* Command Box */}
      <Command className=" border-rose-gold-accent-border future-feed:border-lime rounded-2xl border dark:border-slate-200  shadow-md w-full">
        <CommandInput placeholder=" Search..." />
        <CommandList >
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup  heading="Suggestions">
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
            <CommandItem
              
              className="cursor-pointer"
            >
              <SquareArrowOutUpRight />
             
              
                        <div className="p-4 rounded-md  border bg-transparent hover:bg-slate-200/20
               transition-colors duration-200
               w-10 h-4 flex items-center justify-center">
                          
                        </div>
                      
              
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
         

        

        <div className="w-full  px-4 mt-7 py-2  space-y-6 block lg:hidden">
          <WhatsHappening />
          <WhoToFollow />
        </div>
      </main>

      <aside className="w-full lg:w-[350px] lg:sticky     lg:mt-[10px] lg:top-[16px] lg:h-screen  hidden lg:block mr-6.5 ">
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

export default Settings
