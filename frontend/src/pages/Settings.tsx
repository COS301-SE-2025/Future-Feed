import {
  Link2,
  SquareArrowOutUpRight,
} from "lucide-react"


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

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { useNavigate } from "react-router-dom"
//add theme in settings for mobile devices
//plus it makes sense to have it in settings
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

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
    <div className="min-h-screen dark:bg-blue-950 bg-gray-200 dark:slate-200 p-4 sm:p-8">
      {/* Breadcrumb wrapper */}
      <div className="w-full mb-6 ">
        <div className="dark:bg-indigo-950 bg-white dark:border-slate-200 border p-4 rounded-xl w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  onClick={() => navigate("/home")}
                  className="cursor-pointer"
                >
                  <span>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  onClick={() => navigate("/explore")}
                  className="cursor-pointer"
                >
                  <span>Explore</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  <span>Profile</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Command Box */}
      <Command className=" rounded-2xl border dark:border-slate-200  shadow-md w-full">
        <CommandInput placeholder=" Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
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
             
              
               <ThemeProvider >
                        <div className="p-4 rounded-md  border bg-transparent hover:bg-slate-200/20
               transition-colors duration-200
               w-10 h-4 flex items-center justify-center">
                          <ModeToggle  />
                          
                        </div>
                      </ThemeProvider>
                      
              
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export default Settings
