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

  return (
    <Card className="bg-white border-rose-gold-accent-border future-feed:bg-black future-feed:text-lime text-black border-2 drop-shadow-xl transition-[border-width,border-right-color] duration-800 ease-out-in">
      <CardContent className="p-4">
        <h2 className="font-bold text-lg mb-4">Trending Topics </h2>
        <div className="space-y-3 text-sm">
          {isLoading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-3/4 " />
                  <Skeleton className="h-3 w-1/2 " />
                </div>
              ))}
            </>
          )}
          {isError && (
            <div className="text-red-300 text-sm">
              Failed to load trending topics: {error?.message}
            </div>
          )}
          {trendingTopics && trendingTopics.length > 0 && (
            <>
              {trendingTopics.map((topic) => (
                <div key={topic.id}>

                  <Link
                    to={`/topic/${encodeURIComponent(topic.id)}`}
                    className="font-semibold hover:underline"
                  >
                    #{topic.name}
                  </Link>
                </div>
              ))}
            </>
          )}
          {trendingTopics && trendingTopics.length === 0 && !isLoading && (
            <div className=" text-sm">
              <div key="Anime">
              <Link
                    to={`/topic/${encodeURIComponent(26)}`}
                    className="font-semibold hover:underline"
                  >
                    #Anime
                  </Link>
                </div>
              <div key="Tech">
              <Link
                    to={`/topic/${encodeURIComponent(1)}`}
                    className="font-semibold hover:underline"
                  >
                    #Tech
                  </Link>
                </div>
              <div key="Health">
              <Link
                    to={`/topic/${encodeURIComponent(2)}`}
                    className="font-semibold hover:underline"
                  >
                    #Health
                  </Link>
                </div>
              <div key="Sports">
              <Link
                    to={`/topic/${encodeURIComponent(3)}`}
                    className="font-semibold hover:underline"
                  >
                    #Sports
                  </Link>
                </div>
            </div>
          )}
          {!trendingTopics && !isLoading && !isError && (
            <>
              <div>
                <p className="font-semibold">ERROR , SOMETHING WENT WRONG, PLEASE BE PATIENT...</p>
              </div>
            </>
          )}
          <Link to="/home" className="flex items-center gap-3">
            <div className={!isHomePage ? "" : "invisible"}>
              <p className="hover:underline cursor-pointer">Show more</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
export default WhatsHappening;