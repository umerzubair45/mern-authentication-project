const registerClientEvents = (socket, serverEvents) => {
  socket.on("hello-server", (data) => {
    console.log("📩 Received from client:", data);

    serverEvents.sendWelcome(socket, data.name);
  });
};

module.exports = registerClientEvents;

module.exports = (socket, events) => {
  socket.on("send_message", (data) => {
    events.sendMessage(socket, data);
  });

  socket.on("message_delivered", (data) => {
    events.messageDelivered(socket, data);
  });

  socket.on("message_read", (data) => {
    events.messageRead(socket, data);
  });
  socket.on("typing", (data) => {
    events.typing(socket, data);
  });

  socket.on("stop_typing", (data) => {
    events.stopTyping(socket, data);
  });
  socket.on("edit_message", (data) => {
    events.editSocketMessage(socket, data);
  });

  socket.on("delete_message", (data) => {
    events.deleteSocketMessage(socket, data);
  });
  /*
==========================================
AUDIO CALL EVENTS
==========================================
*/

  socket.on("start_audio_call", (data) => {
    events.startAudioCall(socket, data);
  });

  socket.on("accept_audio_call", (data) => {
    events.acceptAudioCall(socket, data);
  });

  socket.on("reject_audio_call", (data) => {
    events.rejectAudioCall(socket, data);
  });

  socket.on("end_audio_call", (data) => {
    events.endAudioCall(socket, data);
  });
};
