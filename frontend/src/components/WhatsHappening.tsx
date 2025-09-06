import { Card, CardContent } from "@/components/ui/card";
import {useLocation } from "react-router-dom";
import { Link } from "react-router-dom";


const WhatsHappening = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/home';
    return(
        <Card className="dark:bg-stone-400 dark:text-stone-700 border dark:border-stone-700 rounded-3xl border-5 border-lime-500  bg-lime-600 text-white">
                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">Latest Feeds</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">Kings World Cup Clubs</p>
                            <p className="dark:text-stone-700">LIVE · Paris 2025</p>
                        </div>
                        <div>
                            <p className="dark:text-stone-700">Trending in South Africa</p>
                            <p className="font-semibold">Cobrizi</p>
                        </div>
                        <div>
                            <p className="dark:text-stone-700">Trending in South Africa</p>
                            <p className="font-semibold">The River</p>
                        </div>
                        <Link to="/home" className="flex items-center gap-3 dark:hover:text-white">
                        <div className={!isHomePage ? "" : "invisible"}>
        <p className="dark:text-stone-700 hover:underline cursor-pointer">Show more</p>
      </div>
      </Link>
                       
                    </div>
                </CardContent>
            </Card>

    );
}
export default WhatsHappening;
