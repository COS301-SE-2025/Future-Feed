import {
  Link2,
  SquareArrowOutUpRight,
  
} from "lucide-react"
"use client"
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

const Settings = () => {
    {/*command allowos us to use ctrl+ letter to act as a shortcut*/ }
  
     const navigate = useNavigate()
     
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        window.open("https://www.epiuse.com/") // Opens in a new tab
      }
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        navigate("/FAQS")
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [navigate])

  return (
    <div className="p-9 flex min-h-screen bg-gray-800 text-white overflow-y-auto">
        <Command className="text-slate-300 rounded-2xl border border-slate-300 bg-gray-800 shadow-md md:min-w-[100px]">
      <CommandInput placeholder=" Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
           
            
            <a 
            href="https://www.epiuse.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full "
            >
                 <Link2 />
            <span> EPI-USE Official Website </span>
            </a>
          </CommandItem>
          <CommandItem
          onSelect={() => navigate("/FAQS")}
          className="cursor-pointer">
        
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
            className="flex items-center gap-2 w-full "
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
          className="cursor-pointer">
        
            <SquareArrowOutUpRight />
            <span>FAQ'S</span>
           <kbd className="tracking-widest ml-auto">
          <CommandShortcut>⌘B</CommandShortcut>
        </kbd>
          </CommandItem>
          
        </CommandGroup>
      </CommandList>
    </Command>


    </div>

    
  )
}
export default Settings