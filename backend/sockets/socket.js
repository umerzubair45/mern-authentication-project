const socketAuth = require("./socketAuth");
const registerClientEvents = require("./clientEvents");
const serverEvents = require("./serverEvents");

const {
  addUser,
  removeUser,
  getOnlineUsers,
  printOnlineUsers,
} = require("./onlineUsers");

function initializeSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`✅ ${socket.user.userEmail} connected (${socket.id})`);

    addUser(socket.user.userId, socket.id);
    printOnlineUsers();

    io.emit("online-users", getOnlineUsers());

    registerClientEvents(socket, serverEvents);

    socket.on("disconnect", (reason) => {
      console.log(`❌ ${socket.user.userEmail} disconnected`);

      removeUser(socket.id);
      printOnlineUsers();
      io.emit("online-users", getOnlineUsers());

      console.log("Reason:", reason);
    });
  });
}

module.exports = initializeSocket;
