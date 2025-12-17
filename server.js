const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

let roomReadyStates = {};

io.on("connection", (socket) => {
    socket.on("create-room", (code) => socket.join(code));
    socket.on("join-room", (code) => socket.join(code));
    
    // Position & Status Sync
    socket.on("move", (data) => {
        socket.to(data.room).emit("player-update", { 
            id: socket.id, 
            pos: data.pos, 
            status: data.status 
        });
    });

    // Revive Logic
    socket.on('revive-player', (data) => {
        io.to(data.targetId).emit('player-revived');
    });

    // Extraction Door Logic
    socket.on('update-exit-status', (data) => {
        if(!roomReadyStates[data.room]) roomReadyStates[data.room] = {};
        roomReadyStates[data.room][socket.id] = data.inZone;
        
        const readyCount = Object.values(roomReadyStates[data.room]).filter(v => v === true).length;
        io.to(data.room).emit('exit-count-update', { readyCount });
    });

    // Chat
    socket.on("send-chat", (data) => {
        socket.to(data.room).emit("receive-chat", { msg: data.msg });
    });

    socket.on("disconnect", () => {
        // Cleanup room states on disconnect
        for(let room in roomReadyStates) {
            delete roomReadyStates[room][socket.id];
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server live on port ${PORT}`));