{/*component that contains the rhs of the notifications page*/ }
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

const RightSidebar = () => {
    return (
        <div className="hidden lg:block w-[350px] px-4 space-y-6">
            {/* Search Input */}
            <div className="sticky top-4 z-10 bg-gray-800">
                <Input
                    type="text"
                    placeholder="Search"
                    className="placeholder:text-slate-100 rounded-2xl px-4 py-2 bg-gray-800 text-slate-100 border focus:ring-0 focus:outline-none"
                />
            </div>

            {/* What's Happening */}
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

            {/* Who to follow */}
            <Card className="bg-gray-800 text-slate-100 rounded-2xl">
                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">Who to follow</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">City of Tshwane</p>
                                <p className="text-gray-400">@CityTshwane</p>
                            </div>
                            <Button variant="outline" className="text-black rounded-2xl bg-slate-300 border-slate-100 hover:bg-gray-800">follow</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Bruno Fernandes</p>
                                <p className="text-gray-400">@brunofernandes8</p>
                            </div>
                            <Button variant="outline" className="text-black rounded-2xl bg-slate-300 border-slate-100 hover:bg-gray-800">follow</Button>
                        </div>
                        <div>
                            <p className="text-blue-400 hover:underline cursor-pointer">Show more</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RightSidebar;