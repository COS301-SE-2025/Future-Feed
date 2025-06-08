import { Card, CardContent } from "@/components/ui/card";


const WhatsHappening = () => {
    return(
        <Card className="bg-gray-800 text-slate-100 rounded-2xl">
                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">What's happening</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">Kings World Cup Clubs</p>
                            <p className="text-gray-400">LIVE · Paris 2025</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Trending in South Africa</p>
                            <p className="font-semibold">Cobrizi</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Trending in South Africa</p>
                            <p className="font-semibold">The River</p>
                        </div>
                        <div>
                            <p className="text-blue-400 hover:underline cursor-pointer">Show more</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

    );
}
export default WhatsHappening;
