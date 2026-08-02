import socket from "./socket";

export const sendHello = (name) => {
  socket.emit("hello-server", {
    name,
  });
};
