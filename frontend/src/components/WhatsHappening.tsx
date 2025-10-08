// components/WhatsHappening.tsx
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTrendingTopics } from "@/hooks/useTrendingTopics";
import { Skeleton } from "@/components/ui/skeleton";


const WhatsHappening = () => {

  const location = useLocation();
  const isHomePage = location.pathname === '/home';
  
  const { 
    data: trendingTopics, 
    isLoading, 
    error,
    isError
  } = useTrendingTopics();

  // Debug logs


  return (
    <Card className="bg-white border-rose-gold-accent-border future-feed:bg-black future-feed:text-lime dark:bg-indigo-950 dark:text-slate-200 border dark:border-slate-200  text-black border-2 drop-shadow-xl   transition-[border-width,border-right-color] duration-800 ease-out-in">
      <CardContent className="p-4">
        <h2 className="font-bold text-lg mb-4">Trending Topics </h2>
        <div className="space-y-3 text-sm">
          
          {/* Loading state */}
          {isLoading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-400" />
                  <Skeleton className="h-3 w-1/2 bg-gray-400" />
                </div>
              ))}
            </>
          )}
          
          {/* Error state */}
          {isError && (
            <div className="text-red-300 text-sm">
              Failed to load trending topics: {error?.message}
            </div>
          )}
          
          {/* Success state - show ALL trending topics from API */}
          {trendingTopics && trendingTopics.length > 0 && (
            <>
              {trendingTopics.map((topic) => (
                <div key={topic.id}>
                
                  <p className="font-semibold">#{topic.name}</p>
                </div>
              ))}
            </>
          )}
          
          {/* Empty state */}
          {trendingTopics && trendingTopics.length === 0 && !isLoading && (
            <div className=" text-sm">
                  <p className="font-semibold">#Anime</p>
                  <p className="font-semibold">#Tech</p>
                  <p className="font-semibold">#Health</p>
            </div>
          )}
          
          {/* Fallback content only if we have no data and not loading */}
          {!trendingTopics && !isLoading && !isError && (
            <>
              <div>
                <p className="font-semibold">ERROR , SOMETHING WENT WRONG, PLEASE BE PATIENT...</p>
                
              </div>
              
            </>
          )}
          
          <Link to="/home" className="flex items-center gap-3 dark:hover:text-white">
            <div className={!isHomePage ? "" : "invisible"}>
              <p className="dark:text-slate-200 hover:underline cursor-pointer">Show more</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default WhatsHappening;