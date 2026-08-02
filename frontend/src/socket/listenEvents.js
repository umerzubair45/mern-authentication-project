/*import socket from "./socket";

export const registerListeners = () => {
  socket.on("welcome-client", (data) => {
    console.log("📨", data.message);
  });
};

export const removeListeners = () => {
  socket.off("welcome-client");
};

export const listenOnlineUsers = (setOnlineUsers) => {
  socket.on("online-users", (users) => {
    console.log("🟢 Online Users:", users);

    setOnlineUsers(users);
  });
};
export const removeOnlineUsersListener = () => {
  socket.off("online-users");
};*/

import socket from "./socket";

export const registerSocketListeners = ({ setOnlineUsers }) => {
  socket.on("connect", () => {
    console.log("✅ Socket Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket Disconnected:", reason);
  });

  socket.on("online-users", (users) => {
    console.log("🟢 Online Users:", users);

    setOnlineUsers(users);
  });

  socket.on("welcome-client", (data) => {
    console.log(data.message);
  });
};

export const removeSocketListeners = () => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("online-users");
  socket.off("welcome-client");
};
