import { Message, Room, User } from "@/App"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Crown, LogOut, Send, Smile, User as UserIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ScrollArea } from "./ui/scroll-area"
import { useRef, useState } from "react"
import { Input } from "./ui/input"

interface ChatRoomProps {
    currRoom: Room,
    currUser: User | null,
    isUserAdmin: boolean,
    chatMessages: Message[],
    onLeaveRoom: () => void,
    onSendMessage: (inputMessage: string) => void,
    onRemoveUser: (userId: string) => void,
}

export const ChatRoom = ({ currRoom, currUser, isUserAdmin, chatMessages, onLeaveRoom, onSendMessage, onRemoveUser }: ChatRoomProps) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [inputMessage, setInputMessage] = useState("");

    const removeUser = (userId: string) => {
        onRemoveUser(userId);
    }

    const sendMessage = () => {
        onSendMessage(inputMessage)
        setInputMessage("");
    }

    return (
        <Card className="w-full m-4 max-w-lg bg-black/30 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="border-b border-gray-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 ">
                            ✨ {currRoom.name} {currRoom.id}
                        </h2>
                    </div>
                    <div className="space-x-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-transparent">
                                    <UserIcon className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="min-w-48 max-w-60  bg-black/30 backdrop-blur-md border-0 ">
                                <h2 className="font-semibold text-slate-300 mb-2">Users</h2>
                                <ul className="space-y-2">
                                    {currRoom.users.map((user) => (
                                        <li key={user.id} className="flex items-center justify-between">
                                            <span className="flex items-center justify-between gap-1 text-slate-200"> <h3>{user.name}</h3> {isUserAdmin && user.id === currUser?.id && (
                                                <span className="flex p-2 items-center">
                                                    <Crown className="h-4 w-4 align-center inline text-yellow-300" />
                                                </span>
                                            )}</span>
                                            {isUserAdmin && user.id !== currUser?.id && (
                                                <Button onClick={() => removeUser(user.id)} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-transparent">
                                                    <X className="h-4 w-4 p-0" />
                                                </Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={onLeaveRoom} variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-transparent">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea ref={scrollAreaRef} className="h-[60vh] p-4">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`mb-4 ${msg.user.id === currUser?.id ? "ml-auto" : "mr-auto"} max-w-[80%]`}>
                            <div
                                className={`rounded-2xl p-3 ${msg.user.id === currUser?.id
                                    ? "bg-white/20 text-slate-200"
                                    : "bg-black/20 backdrop-blur-md text-slate-200"
                                    }`}
                            >
                                <p className="font-medium mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">{msg.user.name}</p>
                                <p>{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t border-gray-500 p-4">
                <div className="flex w-full space-x-2">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-transparent">
                        <Smile className="h-6 w-6" />
                    </Button>
                    <Input
                        placeholder="Drop your thoughts..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-grow bg-black/20 border-slate-500 text-slate-50 placeholder-slate-200"
                    />
                    <Button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
