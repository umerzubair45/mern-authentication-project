const socketAuth = require("./socketAuth");
const registerClientEvents = require("./clientEvents");
const serverEvents = require("./serverEvents");
const User = require("../models/User");
const {
  addUser,
  removeUser,
  getOnlineUsers,
  getLastSeen,
  getAllLastSeen,
  printOnlineUsers,
} = require("./onlineUsers");

function initializeSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`✅ ${socket.user.userEmail} connected (${socket.id})`);

    addUser(socket.user.userId, socket.id);
    printOnlineUsers();

    io.emit("online-users", getOnlineUsers());
    io.emit("user-online", {
      userId: socket.user.userId,
    });
    socket.emit("initial-last-seen", getAllLastSeen());

    registerClientEvents(socket, serverEvents);

    socket.on("disconnect", async (reason) => {
      console.log(`❌ ${socket.user.userEmail} disconnected`);

      removeUser(socket.id);
      printOnlineUsers();
      try {
        await User.findByIdAndUpdate(
          socket.user.userId,
          {
            lastSeen: new Date(),
          },
          {
            returnDocument: "after",
          },
        );

        console.log(`🕐 Last seen saved for ${socket.user.userEmail}`);
        io.emit("user_offline", {
          userId: socket.user.userId,
          lastSeen: new Date(),
        });
      } catch (error) {
        console.error("❌ Failed to save last seen:", error);
      }

      io.emit("online-users", getOnlineUsers());
      io.emit("user-last-seen", {
        userId: socket.user.userId,
        lastSeen: getLastSeen(socket.user.userId),
      });

      console.log("Reason:", reason);
    });
  });
}

module.exports = initializeSocket;
