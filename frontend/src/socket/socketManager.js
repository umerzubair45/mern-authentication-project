import socket from "./socket";
import { setupSocketListeners, removeSocketListeners } from "./listenEvents";

import { sendHello } from "./emitEvents";

export const connectSocket = ({
  token,
  userName,
  setOnlineUsers,
  onReceiveMessage,
  onTyping,
  onStopTyping,
} = {}) => {
  // Prevent duplicate connections
  if (socket.connected) return;

  socket.auth = {
    token,
  };

  // Register all socket listeners BEFORE connecting
  setupSocketListeners({
    setOnlineUsers,
    onReceiveMessage,
    onTyping,
    onStopTyping,
  });

  socket.connect();

  socket.once("connect", () => {
    console.log(`✅ ${userName} connected`);

    sendHello(userName);
  });

  socket.once("connect_error", (err) => {
    console.error("❌ Socket Error:", err.message);
  });
};

export const disconnectSocket = () => {
  // Remove all listeners
  removeSocketListeners();

  if (socket.connected) {
    socket.disconnect();
  }
};
