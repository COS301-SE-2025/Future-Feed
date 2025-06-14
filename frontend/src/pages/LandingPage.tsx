import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import FF from "../assets/FF cropped.png"
import Exploremobile from "../assets/explore_mobile.png"
import Notificationsmobile from "../assets/notifications_mobile.png"
import Help_mobile  from "../assets/help_mobile.png"
import Settingsmobile from "../assets/settings_mobile.png"
import Editprofilemobile from "../assets/edit profile_mobile.png"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
"use client"
import { AlignJustify } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

const LandingPage = () => {
    {/*code for dynamic imagess*/}
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<HTMLDivElement[]>([]);
    const section1Ref = useRef<HTMLDivElement>(null);
const section2Ref = useRef<HTMLDivElement>(null);
const section3Ref = useRef<HTMLDivElement>(null);
const section4Ref = useRef<HTMLDivElement>(null);
    
    const [currentImage, setCurrentImage] = useState(Exploremobile);

    const handleScroll = () => {
        const offsets = sectionRefs.current.map(
            (ref) => ref?.getBoundingClientRect().top || 0
        );
        const closestIndex = offsets.reduce(
            (closest, curr, i) =>
                Math.abs(curr) < Math.abs(offsets[closest]) ? i : closest,
            0
        );

        const images = [
            Exploremobile,
            Notificationsmobile,
            Editprofilemobile,
            Settingsmobile,
            Help_mobile,
        ];

        setCurrentImage(images[closestIndex] || Exploremobile);
    };

  useEffect(() => {
  sectionRefs.current = [
    section1Ref.current,
    section2Ref.current,
    section3Ref.current,
    section4Ref.current,
    
    
  ].filter((ref): ref is HTMLDivElement => ref !== null);
}, []);
useEffect(() => {
  const container = scrollContainerRef.current;
  container?.addEventListener("scroll", handleScroll);
  return () => container?.removeEventListener("scroll", handleScroll);
}, []);

    return (
        <div className="min-h-screen w-auto  bg-gray-800 text-white ">
            <div className="  ">
                <Sheet >
                    <SheetTrigger className="  " asChild>
                        <AlignJustify className="w-6 h-6"></AlignJustify>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Future Feed</SheetTitle>
                            <SheetDescription>
                                Join the Future Feed family
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label className="hover:underline cursor-pointer" htmlFor="sheet-create">New to Future Feed?</Label>
                                <Button variant="outline" className="text-slate-300 bg-blue-500 hover:bg-gray-800">Create Account</Button>
                            </div>
                            <div className="grid gap-3">
                                <Label className="hover:underline cursor-pointer" htmlFor="sheet-login">Already a member of the Future Feed family?</Label>
                                <Button variant="outline" className="text-slate-300 bg-blue-500 hover:bg-gray-800">Login</Button>
                            </div>
                        </div>
                        <SheetFooter>
                            <Button type="submit" variant="outline" className="text-black hover:bg-gray-800">Save changes</Button>
                            <SheetClose asChild>
                                <Button variant="outline" className="text-black bg-blue-500 hover:bg-gray-800">Close</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>

            </div>
            <div className="flex h-full">
                {/* Sticky Image Section */}
                <div className="w-1/2 flex justify-center items-start pt-20 sticky top-0 h-screen">
                    <AnimatePresence mode="wait">
  <motion.img
    key={currentImage}
    src={currentImage}
    alt="Phone"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2, ease:"easeInOut"  }}
    className="rounded-3xl border-4 border-white w-[300px] h-[650px] object-fit absolute"
  />
</AnimatePresence>
                </div>

                {/* Scrolling Text Section */}
                <div ref={scrollContainerRef} className=" w-1/2 overflow-y-auto overflow-hidden h-screen px-12 pt-20 space-y-90 scroll-smooth">
                    {/* Instagram and username */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-end items-center gap-3"
                    >
                        <span className="text-lg font-semibold">@syntexsquad</span>
                        <Avatar className="w-auto h-auto border-4 border-gray-800 bg-slate-300">
                            <AvatarImage src={FF} alt="@syntexsquad" />
                            <AvatarFallback>SYNTEXSQUAD</AvatarFallback>
                        </Avatar>
                    </motion.div>

                    {/* Section 1 */}
                    <motion.div
                        id="scroll-indicator"
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 100 }}
                        ref={section1Ref}

                        transition={{ duration: 0.8 }}
                        animate={{
                            translateY: "-100%",
                        }}

                    >
                        <span className="text-sm tezt-slate-300">FutureFeed</span>
                        <h1 className="text-5xl font-bold leading-tight">
                            Share ideas and <br /> connect through <br /> conversation with <br />
                            <span className="text-blue-500">Future Feed</span>
                        </h1>
                    </motion.div>

                    {/* Section 2 - Post your feed */}
                    <motion.div
                    ref={section2Ref}
                        id="scroll-indicator"
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 100 }}

                        transition={{ duration: 0.8 }}
                        animate={{
                            translateY: "-100%",
                        }}
                    >
                        <h1 className="text-4xl font-bold leading-tight text-blue-400">
                            What will you say?
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            Get started on Future Feed by logging in or creating <br /> your Future Feed account. <br />
                            your Future Feed username is reserved just for you
                        </p>
                    </motion.div>

                    {/* Section 3 - Get updates */}
                    <motion.div
                ref={section3Ref}
                        id="scroll-indicator"
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 100 }}

                        transition={{ duration: 0.8 }}
                        animate={{
                            translateY: "-100%",
                        }}
                    >
                        <h1 className="text-4xl font-bold leading-tight text-blue-300">
                            Keep up with your <br /> favourite creators <br />
                            and friends
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            See feeds from people and creators you follow
                        </p>
                    </motion.div>

                    {/* Section 4 - Get updates */}
                    <motion.div
                    ref={section4Ref}
                        id="scroll-indicator"
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 100 }}

                        transition={{ duration: 0.8 }}
                        animate={{
                            translateY: "-100%",
                        }}
                    >
                        <h1 className="text-4xl font-bold leading-tight text-blue-300">
                            Express yourself in <br /> more ways imaginable
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            Share a feed to friends in chatboxes <br />
                            Share feeds generated from bots <br />
                            Have your very own personal AI bot

                        </p>
                    </motion.div >


                    {/* Optional: Call to action */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}

                        transition={{ duration: 0.8 }}
                        animate={{
                            translateY: "-100%",
                        }}
                        className="pt-10"
                    >
                        <Button variant="outline" className="px-6 py-6 font-bold rounded-2xl shadow-lg transition duration-300 text-slate-300 bg-blue-500 border-slate-300  hover:bg-gray-800">Join the Future Feed Family</Button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
