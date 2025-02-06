
import { TabsContent } from "@radix-ui/react-tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useState } from "react"
import { LogIn, Plus } from "lucide-react"

interface LandingPageProps {
    availableRooms: number,
    onJoinRoom: (roomId: string, userName: string) => void,
    onCreateRoom: (roomName: string, userName: string) => void
}

const LandingPage = ({ onJoinRoom, onCreateRoom, availableRooms }: LandingPageProps) => {
    const [roomId, setRoomId] = useState("");
    const [newRoomName, setNewRoomName] = useState("")
    const [userName, setUserName] = useState("")

    const handleJoinRoom = () => {
        if (roomId.trim() && userName.trim()) {
            onJoinRoom(roomId, userName)
        } else {
            alert("please fill all the details before joining room.")
        }
    }

    const handleCreateRoom = () => {
        if (newRoomName.trim() && userName.trim()) {
            onCreateRoom(newRoomName, userName)
        } else {
            alert("please fill all the details before creating room.")
        }
    }

    return (
        <Card className="w-full m-4 max-w-md bg-black/30 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    HushHush ✨
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="join" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="join">Join Room</TabsTrigger>
                        <TabsTrigger value="create">Create Room</TabsTrigger>
                    </TabsList>
                    <TabsContent value="join">
                        <div className="mt-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="roomId" className="text-gray-200">
                                    Room ID
                                </Label>
                                <Input
                                    id="roomId"
                                    placeholder="Enter room id"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="bg-slate-200 border-gray-200 text-black/80 placeholder-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomId" className="text-gray-200">
                                    Player Name
                                </Label>
                                <Input
                                    id="userName"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="bg-slate-200 border-gray-200 text-black/80 placeholder-gray-200"
                                />
                            </div>
                            <Button
                                onClick={handleJoinRoom}
                                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white">
                                <LogIn className="h-4 w-4 mr-2" />Join Room
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="create">
                        <div className="mt-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="roomId" className="text-gray-200">
                                    Room Name
                                </Label>
                                <Input
                                    id="roomName"
                                    placeholder="Enter room name"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    className="bg-slate-200 border-gray-200 text-black/80 placeholder-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomId" className="text-gray-200">
                                    Player Name
                                </Label>
                                <Input
                                    id="userName"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="bg-slate-200 border-gray-200 text-black/80 placeholder-gray-200"
                                />
                            </div>
                            <Button
                                onClick={handleCreateRoom}
                                className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white">
                                <Plus className="h-4 w-4 mr-2" />Create Room
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex item-center justify-center">
                <div className="text-sm font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    {availableRooms} available room{availableRooms > 1 ? "s" : ""}
                </div>
            </CardFooter>
        </Card>
    )
}

export default LandingPage