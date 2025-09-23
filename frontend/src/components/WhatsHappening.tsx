import { Card, CardContent } from "@/components/ui/card";
import {useLocation } from "react-router-dom";
import { Link } from "react-router-dom";


const WhatsHappening = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/home';
    return(
        <Card className="bg-blue-500 border-rose-gold-accent-border future-feed:bg-black future-feed:text-lime dark:bg-indigo-950 dark:text-slate-200 border dark:border-slate-200 rounded-3xl border-3 text-white hover:border-5 hover:border-r-lime-300 hover:border-l-lime-300 transition-[border-width,border-right-color] duration-300 ease-in-out">
                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">Latest Feeds</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">Kings World Cup Clubs</p>
                            <p className="dark:text-slate-200">LIVE · Paris 2025</p>
                        </div>
                        <div>
                            <p className="dark:text-slate-200">Trending in South Africa</p>
                            <p className="font-semibold">Cobrizi</p>
                        </div>
                        <div>
                            <p className="dark:text-slate-200">Trending in South Africa</p>
                            <p className="font-semibold">The River</p>
                        </div>
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
