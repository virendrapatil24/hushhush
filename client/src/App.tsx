import { useEffect, useState } from "react"
import LandingPage from "./components/LandingPage"
import { ChatRoom } from "./components/ChatRoom";


const WS_URL = import.meta.env.VITE_WS_URL;

export interface User {
  id: string,
  name: string,
  roomId: string,
}

export interface Room {
  id: string,
  name: string,
  adminId: string,
  users: User[],
}

export interface Message {
  user: User,
  message: string,
  timestamp: Date,
}


function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableRooms, setAvailableRooms] = useState(2);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "CONNECT" }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ROOM_UPDATE") {
        setRoom(data.payload.room);
        setUser(data.payload.user);
        setIsAdmin(true);
      }

      if (data.type === "ROOMS_DETAIL") {
        setAvailableRooms(data.payload.roomLength)
      }

      if (data.type === "USER_DETAILS") {
        setUser(data.payload.user);
      }

      if (data.type === "CHAT_MESSAGE") {
        setMessages(prev => [...prev, data.payload])
      }

      if (data.type === "USER_JOINED" || data.type === "USER_LEFT") {
        setRoom(data.payload.room);
      }

      if (data.type === "ADMIN_LEFT") {
        setRoom(null);
      }

      if (data.error) alert(data.error);
    }
    setWs(socket);
    return () => socket.close();
  }, [])

  const handleJoinRoom = (roomId: string, userName: string) => {
    ws?.send(JSON.stringify({ type: "JOIN_ROOM", payload: { roomId, userName } }));
  }

  const handleCreateRoom = (roomName: string, userName: string) => {
    ws?.send(JSON.stringify({ type: "CREATE_ROOM", payload: { roomName, userName } }));
  }

  const handleLeaveRoom = () => {
    setRoom(null);
    ws?.send(JSON.stringify({ type: "LEAVE_ROOM" }))
  }

  const handleSendMessage = (inputMessage: string) => {
    ws?.send(JSON.stringify({ type: "CHAT_MESSAGE", payload: { roomId: room?.id, message: inputMessage } }))
  }

  const handleRemoveUser = (userId: string) => {
    ws?.send(JSON.stringify({ type: "REMOVE_USER", payload: { userId, roomId: room?.id } }))
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 ">
        {room ?
          <ChatRoom currRoom={room} currUser={user} isUserAdmin={isAdmin} chatMessages={messages} onLeaveRoom={handleLeaveRoom} onSendMessage={handleSendMessage} onRemoveUser={handleRemoveUser} /> :
          <LandingPage onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} availableRooms={availableRooms} />}
      </div>
    </>
  )
}
export default App
