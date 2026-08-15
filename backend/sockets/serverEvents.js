const Conversation = require("../models/Conversation");
const { getSocketIds } = require("./onlineUsers");
const {
  createMessage,
  markDelivered,
  markRead,
  editMessage,
  deleteMessage,
} = require("../controllers/messageController");

/*
==========================================
WELCOME
==========================================
*/

const sendWelcome = (socket, name) => {
  socket.emit("welcome-client", {
    message: `Welcome ${name}!`,
  });
};

/*
==========================================
SEND MESSAGE
==========================================
*/

const sendMessage = async (socket, data) => {
  try {
    const senderId = socket.user.userId;

    const { receiverId, message, replyTo = null } = data;

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (!receiverId || !message?.trim()) {
      return socket.emit("message_error", {
        message: "Receiver and message are required.",
      });
    }

    /*
    ==========================================
    SAVE MESSAGE
    ==========================================
    */

    console.log("Socket User:", socket.user);

    console.log("Received Payload:", data);

    console.log("Sender:", senderId);

    console.log("Receiver:", receiverId);

    const newMessage = await createMessage({
      senderId,
      receiverId,
      message,
      replyTo,
    });

    /*
   

    /*
    ==========================================
    SEND TO RECEIVER
    ==========================================
    */

    const receiverSockets = getSocketIds(receiverId);

    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("receive_message", newMessage);
    }

    /*
    ==========================================
    SEND ACK TO SENDER
    ==========================================
    */

    socket.emit("message_sent", newMessage);
  } catch (error) {
    console.error(error);

    socket.emit("message_error", {
      message: "Failed to send message.",
    });
  }
};
/*
==========================================
EDIT MESSAGE
==========================================
*/

const editSocketMessage = async (socket, data) => {
  try {
    const { messageId, message } = data;

    const userId = socket.user.userId;

    const updatedMessage = await editMessage(messageId, userId, message);

    const receiverId = updatedMessage.receiver._id.toString();

    const receiverSockets = getSocketIds(receiverId);

    // Send update to receiver
    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("message_edited", updatedMessage);
    }

    // Send update to sender
    socket.emit("message_edited", updatedMessage);
  } catch (error) {
    console.error("Edit message error:", error);

    socket.emit("message_error", {
      message: error.message || "Failed to edit message.",
    });
  }
};

/*
==========================================
DELETE MESSAGE
==========================================
*/

const deleteSocketMessage = async (socket, data) => {
  try {
    const { messageId } = data;

    const userId = socket.user.userId;

    const deletedMessage = await deleteMessage(messageId, userId);

    const receiverId = deletedMessage.receiver._id.toString();

    const receiverSockets = getSocketIds(receiverId);

    // Send update to receiver
    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("message_deleted", deletedMessage);
    }

    // Send update to sender
    socket.emit("message_deleted", deletedMessage);
  } catch (error) {
    console.error("Delete message error:", error);

    socket.emit("message_error", {
      message: error.message || "Failed to delete message.",
    });
  }
};
/*
==========================================
TYPING
==========================================
*/

const typing = (socket, data) => {
  const { receiverId } = data;

  const receiverSockets = getSocketIds(receiverId);

  for (const socketId of receiverSockets) {
    socket.to(socketId).emit("typing", {
      senderId: socket.user.userId,
    });
  }
};

/*
==========================================
STOP TYPING
==========================================
*/

const stopTyping = (socket, data) => {
  const { receiverId } = data;

  const receiverSockets = getSocketIds(receiverId);

  for (const socketId of receiverSockets) {
    socket.to(socketId).emit("stop_typing", {
      senderId: socket.user.userId,
    });
  }
};
const messageDelivered = async (socket, { messageId, senderId }) => {
  try {
    const updatedMessage = await markDelivered(messageId);

    const senderSockets = getSocketIds(senderId);

    for (const socketId of senderSockets) {
      socket.to(socketId).emit("message_delivered", updatedMessage);
    }
  } catch (error) {
    console.error(error);
  }
};
const messageRead = async (socket, { messageId, senderId }) => {
  try {
    const updatedMessage = await markRead(messageId);

    const senderSockets = getSocketIds(senderId);

    for (const socketId of senderSockets) {
      socket.to(socketId).emit("message_read", updatedMessage);
    }
  } catch (error) {
    console.error(error);
  }
};

/*
==========================================
AUDIO CALL — START CALL
==========================================
*/

const startAudioCall = (socket, data) => {
  try {
    const callerId = socket.user.userId;

    const { receiverId, callId } = data;

    if (!receiverId || !callId) {
      return socket.emit("call_error", {
        message: "Receiver and call ID are required.",
      });
    }

    const receiverSockets = getSocketIds(receiverId);

    if (receiverSockets.size === 0) {
      return socket.emit("call_unavailable", {
        callId,
        receiverId,
        message: "User is offline.",
      });
    }
    console.log("📞 SOCKET USER:", socket.user);
    console.log("📞 CALLER USERNAME:", socket.user.userName);
    const callData = {
      callId,
      callerId,
      receiverId,
      caller: {
        _id: socket.user.userId,
        userName: socket.user.userName,
      },
    };

    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("incoming_audio_call", callData);
    }
    console.log("📞 CALL DATA:", callData);
    socket.emit("call_started", {
      callId,
      receiverId,
    });
  } catch (error) {
    console.error("Start Audio Call Error:", error);

    socket.emit("call_error", {
      message: "Unable to start call.",
    });
  }
};

/*
==========================================
ACCEPT AUDIO CALL
==========================================
*/

const acceptAudioCall = (socket, data) => {
  try {
    const { callId, callerId } = data;

    if (!callId || !callerId) {
      return socket.emit("call_error", {
        message: "Call information is required.",
      });
    }

    const receiverId = socket.user.userId;

    const callerSockets = getSocketIds(callerId);

    for (const socketId of callerSockets) {
      socket.to(socketId).emit("audio_call_accepted", {
        callId,
        callerId,
        receiverId,
      });
    }
  } catch (error) {
    console.error("Accept Audio Call Error:", error);
  }
};

/*
==========================================
REJECT AUDIO CALL
==========================================
*/

const rejectAudioCall = (socket, data) => {
  try {
    const { callId, callerId } = data;

    if (!callId || !callerId) {
      return socket.emit("call_error", {
        message: "Call information is required.",
      });
    }

    const receiverId = socket.user.userId;

    const callerSockets = getSocketIds(callerId);

    for (const socketId of callerSockets) {
      socket.to(socketId).emit("audio_call_rejected", {
        callId,
        callerId,
        receiverId,
      });
    }
  } catch (error) {
    console.error("Reject Audio Call Error:", error);
  }
};

/*
==========================================
END AUDIO CALL
==========================================
*/

const endAudioCall = (socket, data) => {
  try {
    const { callId, receiverId } = data;

    if (!callId || !receiverId) {
      return socket.emit("call_error", {
        message: "Call information is required.",
      });
    }

    const callerId = socket.user.userId;

    console.log("📴 END CALL REQUEST:", {
      callId,
      endingUser: callerId,
      targetUser: receiverId,
    });

    const receiverSockets = getSocketIds(receiverId);

    console.log("📡 TARGET SOCKETS:", {
      targetUser: receiverId,
      socketCount: receiverSockets.size,
      socketIds: [...receiverSockets],
    });

    for (const socketId of receiverSockets) {
      socket.to(socketId).emit("audio_call_ended", {
        callId,
        callerId,
        receiverId,
      });
    }
    console.log("✅ audio_call_ended emitted");
  } catch (error) {
    console.error("End Audio Call Error:", error);
  }
};

module.exports = {
  sendWelcome,
  sendMessage,
  messageDelivered,
  messageRead,
  typing,
  stopTyping,
  editSocketMessage,
  deleteSocketMessage,
  startAudioCall,
  acceptAudioCall,
  rejectAudioCall,
  endAudioCall,
};
