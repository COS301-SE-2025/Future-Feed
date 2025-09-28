import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {  MessageCircle } from "lucide-react"
{/* https://FAQS.x.com/en/using-x/how-to-post*/ }
import { useNavigate } from "react-router-dom"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const FAQS = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-gray-200 p-6 future-feed:bg-black   min-h-screen  dark:bg-blue-950 ">
            <h1 className="font-bold future-feed:text-lime text-2xl text-right">FAQS Centre</h1>
            <div className="future-feed:bg-black bg-white border-rose-gold-accent-border flex future-feed:border-lime  border dark:border-slate-200 dark:bg-indigo-950 rounded-2xl  justify-between items-center my-3 px-4 py-3 sticky top-0  ">
                {/*breedcrumb to go back */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild
                                onClick={() => navigate("/profile")}
                                className="cursor-pointer">
                                <span>Profile</span>
                            </BreadcrumbLink>
                        </BreadcrumbItem>


                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild
                                onClick={() => navigate("/settings")}
                                className="cursor-pointer">
                                <span>Settings</span>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>FAQS Center </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

            </div>


            <div className="flex-1 p-6 pl-2 min-h-screen overflow-y-auto">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full "

                >
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How to post?</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p className="dark:text-slate-200 font-bold">
                                Step 1
                            </p>
                            <p>
                                Type your post(up to 280 characters) into the composite box at the top of your Home timeline, or select the Post button in the navigation bar.
                            </p>
                            <p className="dark:text-slate-200 font-bold">Step 2</p>
                            <p>You can select 1 picture at a time(for now) </p>
                            <p className="dark:text-slate-200 font-bold">Step 3</p>
                            <p> Select the Post button to post the Feed to your profile,done.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How to delete a post?</AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p className="dark:text-slate-200 font-bold">
                                Step 1
                            </p>
                            <p>
                                Visit your Profile page
                            </p>
                            <p className="dark:text-slate-200 font-bold">Step 2</p>
                            <p> Navigate to the post you wish to delete</p>
                            <p className="font-bold dark:text-slate-200">Step 3</p>
                            <p> Click the <p className="font-bold dark:text-slate-200">X</p> icon </p>
                            <p className="font-bold dark:text-slate-200">Step 4</p>
                            <p>Click the Delete post</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Keyboard Shortcuts </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p className="dark:text-slate-200 font-bold">
                                When on the settings page, here is a short list of keyboard shortcuts to use
                            </p>
                            <p>
                                ctrl + p = navigates to the official EPI-USE Website
                            </p>
                            <p>
                                ctrl + b = navigates to the FAQ's page

                            </p>
                            <p>ctrl + h = navigates to the FAQS page</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>How to protect your personal information </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p className="dark:text-slate-200 font-bold">
                                Consider what you post
                            </p>
                            <p>
                                You are in control of how much information you share on FUTURE FEED or any other website. Don’t post information you consider to be private, and be thoughtful about when you want to publicly share your location.
                            </p>
                            <p>
                                Be wary of any communication that asks for your private contact information, personal information, or passwords. If you are ever unsure before you post, we recommend you ask yourself the following questions:

                            </p>
                            <p>Who am I sharing this information with?</p>
                            <p>How much and what type of information am I sharing?</p>
                            <p>How many people can see the information I am sharing?</p>
                            <p>Can I trust all the people that see this information?</p>
                            <p className="dark:text-slate-200 font-bold">Not everyone has the same definition of what is considered private and what should be shared. If a friend or connection has posted information you prefer to be kept private, contact them and ask them to take down the content. Likewise, be considerate of others. If someone requests you remove information that you posted about them, please honor their request.</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger>How to post a reply </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p className="dark:text-slate-200 font-bold">
                                Step 1
                            </p>
                            <p>
                                Find the post you want to reply to.
                            </p>
                            <p className="dark:text-slate-200 font-bold">Step 2</p>
                            <p className="font-bold dark:text-slate-200">
                                 <MessageCircle />

                            </p> Click or tap the reply icon
                            <p className="font-bold dark:text-slate-200">Step 3</p>
                            <p>Type in your message and click or tap Reply to post it.</p>

                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                        <AccordionTrigger>How to Edit your profile </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <p className="dark:text-slate-200 font-bold">
                                Step 1
                            </p>
                            <p>
                              Navigate to the profile page
                            </p>
                            <p className="dark:text-slate-200 font-bold"> Step 2</p>
                            <p className="font-bold">
                               Click the "Edit Profile" button

                            </p>
                            <p className="dark:text-slate-200 font-bold">Step 3</p>
                            <p>A box will appear from the right where you can update the relevant details</p>
                            <p className="font-bold dark:text-slate-200">Step 4</p>
                            <p>Click 'Save changes' to save your changes</p>

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </div>

        </div>



    )

}
export default FAQS