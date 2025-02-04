import { WebSocketServer, WebSocket } from "ws";
import { generateRoomId } from "./utils"


const wss = new WebSocketServer({ port: 8080 });


interface room {
    id: string,
    admin: WebSocket,
    users: WebSocket[],
}

let rooms: room[] = []

wss.on("connection", (ws) => {

    ws.on("message", (msg) => {
        (ws as WebSocket & { id: string }).id = crypto.randomUUID();
        let parsedMsg;
        try {
            parsedMsg = JSON.parse(msg.toString());
        } catch (error) {
            ws.send(JSON.stringify({ error: "Invalid JSON format." }));
            return;
        }

        if (!["create", "join", "chat", "remove"].includes(parsedMsg.type)) {
            ws.send(JSON.stringify({ error: "Unknown message type." }));
            return;
        }

        // Create a new room with room admin
        if (parsedMsg.type === "create") {
            if (rooms.length >= 4) {
                ws.send(JSON.stringify({ error: "Room limit reached. Please try after sometime." }))
                return;
            }

            const existingRoom = rooms.find(room => room.admin === ws);
            if (existingRoom) {
                ws.send(JSON.stringify({ error: "You already created a room!" }));
                return;
            }

            const roomId = generateRoomId();
            const newRoom: room = {
                id: roomId,
                admin: ws,
                users: [ws]
            };
            rooms.push(newRoom);

            ws.send(JSON.stringify({ message: `Room created successfully`, currRoom: newRoom }))
        }

        // Join an existing room
        if (parsedMsg.type === "join") {
            const currRoom = rooms.find((room) => room.id === parsedMsg.roomId);
            if (!currRoom) {
                ws.send(JSON.stringify({ error: "Incorrect room id." }))
                return;
            }

            if (currRoom.users.length >= 8) {
                ws.send(JSON.stringify({ error: "Room has reached its max capacity." }))
                return;
            }

            const existingUser = currRoom.users.find(user => user === ws);
            if (!existingUser) {
                currRoom.users.push(ws);
                ws.send(JSON.stringify({ message: "Joined room successfully", roomId: currRoom.id }));
            } else {
                ws.send(JSON.stringify({ error: "You are already in this room." }));
            }
        }

        // Update the room chat
        if (parsedMsg.type === "chat") {
            const currRoom = rooms.find(room => room.id === parsedMsg.roomId);
            if (!currRoom) {
                ws.send(JSON.stringify({ error: "Incorrect room id." }))
                return;
            }

            const existingUser = currRoom.users.find(user => user === ws);
            if (!existingUser) {
                ws.send(JSON.stringify({ error: "You are not part of this room." }))
                return
            }

            currRoom.users.forEach((user) => {
                user.send(JSON.stringify({ chat: parsedMsg.chat, sender: (ws as WebSocket & { id: string }).id }))
            })
        }

        if (parsedMsg.type === "remove") {
            const currRoom = rooms.find(room => room.id === parsedMsg.roomId);
            if (!currRoom) {
                ws.send(JSON.stringify({ error: "Incorrect room id." }))
                return;
            }

            if (currRoom.admin !== ws) {
                ws.send(JSON.stringify({ error: "Only admin can remove users" }));
                return;
            }

            const existingUser = currRoom.users.find(user => (user as WebSocket & { id: string }).id === parsedMsg.userId);
            if (!existingUser) {
                ws.send(JSON.stringify({ error: "No corresponding user found." }))
            } else {
                currRoom.users = currRoom.users.filter(user => (user as WebSocket & { id: string }).id !== parsedMsg.userId)
            }
        }

    })
    // Update if someone leaves the room
    ws.on("close", () => {
        const currRoom = rooms.find(room => room.users.includes(ws));
        if (!currRoom) return;

        if (currRoom.admin === ws) {
            currRoom.users.forEach((user) => {
                user.send(JSON.stringify({ error: "Admin left the room." }));
            });
            rooms = rooms.filter(room => room !== currRoom);
            return;
        }

        currRoom.users = currRoom.users.filter(user => user !== ws);
        currRoom.users.forEach((user) => {
            user.send(JSON.stringify({ error: "A user has left the room." }));
        });
    })
})