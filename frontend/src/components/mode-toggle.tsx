import { Moon, Sun, CreativeCommons } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="dark:bg-gray-800 dark:bg-blue-950 dark:border-slate-200 hover:cursor-pointer">
        <DropdownMenu>
      <DropdownMenuTrigger asChild
      className="dark:border-slate-200">
        <Button className="bg-blue-500 text-white dark:bg-blue-950 dark:border-slate-200 hover:cursor-pointer"  size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          
          <Moon className="dark:text-slate-200 dark:border-slate-200 absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <CreativeCommons className="text-slate-200 absolute h-[1.2rem] w-[1.2rem] scale-0 transition-all future-feed:scale-100" />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("future-feed")}>
          Future Feed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    </div>
    
  )
}