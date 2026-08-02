const registerClientEvents = (socket, serverEvents) => {
  socket.on("hello-server", (data) => {
    console.log("📩 Received from client:", data);

    serverEvents.sendWelcome(socket, data.name);
  });
};

module.exports = registerClientEvents;
