const express = require("express");
const socket = require("socket.io");

const {clientJoin, getUser } = require('./public/js/info.js')

// App setup
const PORT = 3000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);

});


// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

//we use a set to store users, sets objects are for unique values of any type
const activeUsers = new Set();

io.on("connection", function (socket) {
  socket.on('join', ({username, room}) => {
    const client = clientJoin(socket.id, username, room);
      socket.join(client.room);
    socket.emit('message', `${username} connected to the chat`);
    socket.broadcast.to(client.room).emit('message', `${username} joined the chat`);
    socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    //... is the the spread operator, adds to the set while retaining what was in there already
    io.emit("new user", [...activeUsers]);
  });
      socket.on("chat message", function (data) {
      io.to(client.room).emit("chat message", data);
  });
    socket.on("typing", (name) => {
      socket.broadcast.to(client.room).emit("typing", name);
    });
    socket.on("disconnect", function () {
      activeUsers.delete(socket.userId);
      io.to(client.room).emit('message', `A ${username} left the chat`);
      console.log("User disconnected");
      io.emit("user disconnected", socket.userId);
    });
    //sending alert message to the existing users
    socket.on("NewUserMessage", function(data){
      socket.to(client.room).emit("NewUserMessage", data);
      socket.join(client.room);
    });
  });
  


});