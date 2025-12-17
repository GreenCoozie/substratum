const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("create-room", (code) => {
    socket.join(code);
  });

  socket.on("join-room", (code) => {
    socket.join(code);
  });

  socket.on("move", (data) => {
    // Sends your position to everyone else in your party code
    socket.to(data.room).emit("player-update", {
      id: socket.id,
      pos: data.pos
    });
  });
});

const listener = http.listen(process.env.PORT || 3000, () => {
  console.log("Substratum Server is running on port " + listener.address().port);
});