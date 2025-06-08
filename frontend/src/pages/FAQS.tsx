
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
                     Common FAQ for Future Feed

                </h1>
                <h2 className="font-bold text-lg">
                    How do I create a Future Feed profile?

                </h2>
                <p>
                   

You can create a Future Feed profile by going to Future Feed and clicking on the "Sign up" button.
</p>
<h2 className="font-bold text-lg">
Can I change my Future Feed handle?
</h2 >


Yes, you can change your Future Feed handle by going to your profile settings and clicking on the "Edit profile" button.
<h2 className="font-bold text-lg" >
Can I delete my tweets?
</h2>
<p>
Yes, you can delete your tweets by going to the tweet and clicking on the down arrow button, then selecting "Delete Tweet".
</p>
<h2 className="font-bold text-lg" >How to delete multiple posts</h2>
<p>We do not provide a way to bulk-delete posts. You can only delete posts manually, one by one.</p>
<h2 className="font-bold text-lg">What happens to posts I delete?</h2>
<p>When you delete a post, it is removed from your account, the timeline of any accounts that follow you, and from Future Feed search results on Future Feed, Future Feed for iOS, and Future Feed for Android.
Reposts of the deleted post will also be removed on Future Feed, Future Feed for iOS, and Future Feed for Android.
Once a post has been deleted, the post contents, associated metadata, and all analytical information about that post is no longer publicly available on Future Feed.
If other people have copied and pasted part or all of your teFuture Feedt into their own post, their posts will not be removed.
If other people have reposted your post with a comment of their own, their posts will not be removed. </p>





                

            </div>
             
        </div>
        

    )
}
export default FAQS