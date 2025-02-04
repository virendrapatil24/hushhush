import { WebSocketServer, WebSocket } from "ws";
import { generateRoomId } from "./utils"

interface User {
    id: string,
    name: string,
    roomId: string,
}

interface Room {
    id: string,
    name: string,
    adminId: string,
    users: User[],
}

interface Message {
    type: 'JOIN_ROOM' | 'CREATE_ROOM' | 'CHAT_MESSAGE' | 'REMOVE_USER' | 'USER_JOINED' | 'USER_LEFT' | 'ADMIN_LEFT' | 'ROOM_UPDATE';
    payload: any;
}


const wss = new WebSocketServer({ port: 8080 });
let rooms: Room[] = [];
const connections = new Map<string, WebSocket>();

wss.on("connection", (ws: WebSocket) => {
    const userId = crypto.randomUUID();
    connections.set(userId, ws);

    ws.on("message", (msg: string) => {
        let parsedMsg: Message;
        try {
            parsedMsg = JSON.parse(msg);
        } catch (error) {
            ws.send(JSON.stringify({ error: "Invalid JSON format." }));
            return;
        }

        if (!["CREATE_ROOM", "JOIN_ROOM", "CHAT_MESSAGE", "REMOVE_USER"].includes(parsedMsg.type)) {
            ws.send(JSON.stringify({ error: "Unknown message type." }));
            return;
        }

        // Create a new room with room admin
        if (parsedMsg.type === "CREATE_ROOM") {
            if (rooms.length >= 4) {
                ws.send(JSON.stringify({ error: "Room limit reached. Please try after sometime." }))
                return;
            }

            const existingRoom = rooms.find(room => room.adminId === userId);
            if (existingRoom) {
                ws.send(JSON.stringify({ error: "You already created a room!" }));
                return;
            }

            const roomId = generateRoomId();
            const newUser: User = {
                id: userId,
                name: parsedMsg.payload.userName,
                roomId: roomId,
            };
            const newRoom: Room = {
                id: roomId,
                name: parsedMsg.payload.roomName,
                adminId: userId,
                users: [newUser]
            };
            rooms.push(newRoom);

            ws.send(JSON.stringify({ type: "ROOM_UPDATE", payload: { user: newUser, room: newRoom } }))
        }

        // Join an existing room
        if (parsedMsg.type === "JOIN_ROOM") {
            const currRoom = rooms.find((room) => room.id === parsedMsg.payload.roomId);
            if (!currRoom) {
                ws.send(JSON.stringify({ error: "Incorrect room id." }))
                return;
            }

            if (currRoom.users.length >= 8) {
                ws.send(JSON.stringify({ error: "Room has reached its max capacity." }))
                return;
            }

            const existingUser = currRoom.users.find(user => user.id === userId);
            if (!existingUser) {
                const newUser: User = {
                    id: userId,
                    name: parsedMsg.payload.userName,
                    roomId: currRoom.id,
                }
                currRoom.users.push(newUser);
                ws.send(JSON.stringify({ type: "USER_JOINED", payload: { user: newUser, room: currRoom } }));
            } else {
                ws.send(JSON.stringify({ error: "You are already in this room." }));
            }
        }

        // Update the room chat
        if (parsedMsg.type === "CHAT_MESSAGE") {
            const currRoom = rooms.find(room => room.id === parsedMsg.payload.roomId);
            if (!currRoom) {
                ws.send(JSON.stringify({ error: "Incorrect room id." }))
                return;
            }

            const existingUser = currRoom.users.find(user => user.id === userId);
            if (!existingUser) {
                ws.send(JSON.stringify({ error: "You are not part of this room." }))
                return
            }

            currRoom.users.forEach((user) => {
                const userWs = connections.get(user.id)
                if (userWs) {
                    userWs.send(JSON.stringify({ type: "CHAT_MESSAGE", payload: { user: existingUser, message: parsedMsg.payload.message, timestamp: new Date() } }))
                }
            })
        }

        if (parsedMsg.type === "REMOVE_USER") {
            const currRoom = rooms.find(room => room.id === parsedMsg.payload.roomId);
            if (!currRoom) {
                ws.send(JSON.stringify({ error: "Incorrect room id." }))
                return;
            }

            if (currRoom.adminId !== userId) {
                ws.send(JSON.stringify({ error: "Only admin can remove users" }));
                return;
            }

            const existingUser = currRoom.users.find(user => user.id === parsedMsg.payload.userId);
            if (!existingUser) {
                ws.send(JSON.stringify({ error: "No corresponding user found." }))
            } else {
                currRoom.users = currRoom.users.filter(user => user.id !== parsedMsg.payload.userId)
                const userWs = connections.get(parsedMsg.payload.userId);
                if (userWs) {
                    userWs.send(JSON.stringify({ type: "REMOVE_USER", payload: { user: existingUser, room: currRoom } }))
                }
            }
        }

    })
    // Update if someone leaves the room
    ws.on("close", () => {
        const currRoom = rooms.find(room => room.users.find((user) => user.id === userId));
        if (!currRoom) return;

        if (currRoom.adminId === userId) {
            currRoom.users.forEach((user) => {
                const userWs = connections.get(user.id);
                if (userWs) {
                    userWs.send(JSON.stringify({ type: "ADMIN_LEFT", payload: { user: user, room: currRoom } }));
                }
            });
            rooms = rooms.filter(room => room !== currRoom);
            return;
        }

        currRoom.users = currRoom.users.filter(user => user.id !== userId);
        currRoom.users.forEach((user) => {
            const userWs = connections.get(user.id);
            if (userWs) {
                userWs.send(JSON.stringify({ type: "USER_LEFT", payload: { user: user, room: currRoom } }));
            }
        });
    })
})