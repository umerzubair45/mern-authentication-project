import socket from "./socket";
import { registerSocketListeners, removeSocketListeners } from "./listenEvents";

import { sendHello } from "./emitEvents";

export const connectSocket = ({ token, userName, setOnlineUsers }) => {
  if (socket.connected) {
    return;
  }

  socket.auth = {
    token,
  };

  registerSocketListeners({
    setOnlineUsers,
  });

  socket.connect();

  socket.once("connect", () => {
    console.log("✅ Socket Connected");

    sendHello(userName);
  });
};

export const disconnectSocket = ({ setOnlineUsers }) => {
  removeSocketListeners();

  socket.disconnect();

  setOnlineUsers([]);
};
