import PersonalSidebar from "@/components/PersonalSidebar";
import WhoToFollow from "@/components/WhoToFollow";
import WhatsHappening from "@/components/WhatsHappening";

const PostPage = () => {

  return (
    <div className="flex min-h-screen dark:bg-black dark:text-white overflow-y-auto">
        <aside className="w-full lg:w-[245px] lg:ml-6 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
            <PersonalSidebar />
        </aside>

        <main className="w-[1100px] mx-auto p-4">
            
        </main>
        
        <aside className="w-full lg:w-[350px] lg:mt-6 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden lg:block">
            <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
                <WhatsHappening />
            </div>
            <div className="w-full lg:w-[320px] mt-5 lg:ml-3">
                <WhoToFollow  />
            </div>
        </aside>
    </div>
  );
};

export default PostPage;