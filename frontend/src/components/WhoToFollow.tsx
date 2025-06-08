
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
const WhoToFollow = () => {
    return(
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
    );
}
export default WhoToFollow