export const generateRoomId = (length = 6) => {
    let roomId = "";
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        const randomInt = Math.floor(Math.random() * characters.length);
        roomId += characters.charAt(randomInt)
    }

    return roomId;
}