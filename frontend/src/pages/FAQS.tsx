
import {  useNavigate } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


const FAQS= () => {
    const navigate = useNavigate();
    return(
        <div className="min-h-screen text-slate-300 p-9 bg-gray-800">
            <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-slate-300 border rounded-2xl border-slate-100 z-10">
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
          <BreadcrumbPage>FAQ'S</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>



            </div>
            <div className="border h-fit flex-1 p-80 m-2 w-auto mx-7 rounded-2xl ">
                <h1 className="font-bold text-5xl">
                     Common FAQ for Twitter

                </h1>
                <h2 className="text-lg">
                    How do I create a Twitter profile?

                </h2>
                <p>
                   

You can create a Twitter profile by going to twitter.com and clicking on the "Sign up" button.
</p>
<h2 className="text-lg">
Can I change my Twitter handle?
</h2>


Yes, you can change your Twitter handle by going to your profile settings and clicking on the "Edit profile" button.
<h2>
Can I delete my tweets?
</h2>
<p>
Yes, you can delete your tweets by going to the tweet and clicking on the down arrow button, then selecting "Delete Tweet".
</p>





                

            </div>
             
        </div>
        

    )
}
export default FAQS