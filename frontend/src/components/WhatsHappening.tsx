import { Card, CardContent } from "@/components/ui/card";
import {useLocation } from "react-router-dom";


const WhatsHappening = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/home';
    return(
        <Card className="dark:bg-black dark:text-lime-500 border dark:border-lime-500 rounded-3xl border-2 border-lime-500  bg-lime-600 text-white">
                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">Latest Feeds</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">Kings World Cup Clubs</p>
                            <p className="dark:text-lime-500">LIVE · Paris 2025</p>
                        </div>
                        <div>
                            <p className="dark:text-lime-500">Trending in South Africa</p>
                            <p className="font-semibold">Cobrizi</p>
                        </div>
                        <div>
                            <p className="dark:text-lime-500">Trending in South Africa</p>
                            <p className="font-semibold">The River</p>
                        </div>
                        { !isHomePage && (
                             <div>
                            <p className="dark:text-gray-400 hover:underline cursor-pointer">Show more</p>
                        </div>

                        )}
                       
                    </div>
                </CardContent>
            </Card>

    );
}
export default WhatsHappening;
