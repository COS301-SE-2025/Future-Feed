
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
const WhoToFollow = () => {
    return(

        <Card className="bg-green dark:bg-black dark:border-lime-500 dark:text-lime-500 rounded-3xl border-2 border-lime-500  bg-lime-600 text-white">

                <CardContent className="p-4">
                    <h2 className="font-bold text-lg mb-4">Follow other people</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">City of Tshwane</p>
                                <p className="dark:text-lime-500">@CityTshwane</p>
                            </div>
                            <Button variant="outline" className="dark:text-lime-500 rounded-2xl dark:bg-black dark:border-lime-500 hover:bg-gray-800 text-lime-600">follow</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Bruno Fernandes</p>
                                <p className="dark:text-lime-500">@brunofernandes8</p>
                            </div>
                            <Button variant="outline" className="dark:text-lime-500 rounded-2xl dark:bg-black dark:border-lime-500 hover:bg-gray-800 text-lime-600">follow</Button>
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