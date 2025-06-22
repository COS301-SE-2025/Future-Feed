
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
const WhoToFollow = () => {
    return(
        <Card className="bg-green dark:bg-gray-800 border-none dark:shadow-lg dark:shadow-gray-800 dark:text-slate-100 rounded-2xl">
                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">Follow other people</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">City of Tshwane</p>
                                <p className="dark:text-gray-400">@CityTshwane</p>
                            </div>
                            <Button variant="outline" className="dark:text-black rounded-2xl dark:bg-slate-300 dark:border-slate-100 hover:bg-gray-800">follow</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Bruno Fernandes</p>
                                <p className="dark:text-gray-400">@brunofernandes8</p>
                            </div>
                            <Button variant="outline" className="dark:text-black rounded-2xl dark:bg-slate-300 dark:border-slate-100 hover:bg-gray-800">follow</Button>
                        </div>
                        <div>
                            <p className="dark:text-blue-400 hover:underline cursor-pointer">Show more</p>
                        </div>
                    </div>
                </CardContent>
            </Card> 
    );
}
export default WhoToFollow