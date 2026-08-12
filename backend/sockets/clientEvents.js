const { getSocketIds } = require("./onlineUsers");

const registerClientEvents = (socket, events) => {
  socket.on("hello-server", (data) => {
    console.log("📩 Received from client:", data);

    events.sendWelcome(socket, data.name);
  });

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
  // =========================
  // AUDIO CALL EVENTS
  // =========================

  socket.on("start_audio_call", (data) => {
    events.startAudioCall(socket, data);
  });

  socket.on("accept_audio_call", (data) => {
    events.acceptAudioCall(socket, data);
  });

  socket.on("reject_audio_call", (data) => {
    events.rejectAudioCall(socket, data);
  });
  // socket.on("end_audio_call", ({ callId, receiverId }) => {
  //   io.to(receiverId).emit("audio_call_ended", {
  //     callId,
  //   });
  // });

  socket.on("end_audio_call", (data) => {
    events.endAudioCall(socket, data);
  });

  // =========================
  // WEBRTC SIGNALING
  // =========================

  socket.on("webrtc_offer", ({ receiverId, callId, offer }) => {
    console.log("📡 WebRTC Offer:", {
      receiverId,
      callId,
    });

    const receiverSockets = getSocketIds(receiverId);

    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("webrtc_offer", {
        callId,
        callerId: socket.user.userId,
        offer,
      });
    }
  });

  socket.on("webrtc_answer", ({ callerId, callId, answer }) => {
    console.log("📡 WebRTC Answer:", {
      callerId,
      callId,
    });

    const callerSockets = getSocketIds(callerId);

    for (const socketId of callerSockets) {
      socket.to(socketId).emit("webrtc_answer", {
        callId,
        receiverId: socket.user.userId,
        answer,
      });
    }
  });

  socket.on("webrtc_ice_candidate", ({ receiverId, callId, candidate }) => {
    console.log("🧊 WebRTC ICE Candidate:", {
      receiverId,
      callId,
    });

    const receiverSockets = getSocketIds(receiverId);

    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("webrtc_ice_candidate", {
        callId,
        senderId: socket.user.userId,
        candidate,
      });
    }
  });
};

module.exports = registerClientEvents;
