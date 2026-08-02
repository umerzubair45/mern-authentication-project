const sendWelcome = (socket, name) => {
  socket.emit("welcome-client", {
    message: `Welcome ${name}!`,
  });
};

module.exports = {
  sendWelcome,
};
