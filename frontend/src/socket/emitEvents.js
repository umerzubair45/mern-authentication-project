import socket from "./socket";

export const sendHello = (name) => {
  socket.emit("hello", {
    name,
  });
};

export const sendMessage = ({ receiverId, message, replyTo = null }) => {
  socket.emit("send_message", {
    receiverId,
    message,
    replyTo,
  });
};
export const messageDelivered = (data) => {
  socket.emit("message_delivered", data);
};
export const messageRead = (data) => {
  socket.emit("message_read", data);
};
export const typing = (receiverId) => {
  socket.emit("typing", {
    receiverId,
  });
};

export const stopTyping = (receiverId) => {
  socket.emit("stop_typing", {
    receiverId,
  });
};
export const editMessage = ({ messageId, message }) => {
  socket.emit("edit_message", {
    messageId,
    message,
  });
};

export const deleteMessage = ({ messageId }) => {
  socket.emit("delete_message", {
    messageId,
  });
};
/*
==========================================
AUDIO CALL
==========================================
*/

export const startAudioCall = ({ receiverId, callId }) => {
  socket.emit("start_audio_call", {
    receiverId,
    callId,
  });
};

export const acceptAudioCall = ({ callId, callerId }) => {
  socket.emit("accept_audio_call", {
    callId,
    callerId,
  });
};

export const rejectAudioCall = ({ callId, callerId }) => {
  socket.emit("reject_audio_call", {
    callId,
    callerId,
  });
};

export const endAudioCall = ({ callId, receiverId }) => {
  socket.emit("end_audio_call", {
    callId,
    receiverId,
  });
};
// WEBRTC SIGNALING

export const sendWebRTCOffer = ({ receiverId, callId, offer }) => {
  socket.emit("webrtc_offer", {
    receiverId,
    callId,
    offer,
  });
};

export const sendWebRTCAnswer = ({ callerId, callId, answer }) => {
  socket.emit("webrtc_answer", {
    callerId,
    callId,
    answer,
  });
};

export const sendWebRTCICECandidate = ({ receiverId, callId, candidate }) => {
  socket.emit("webrtc_ice_candidate", {
    receiverId,
    callId,
    candidate,
  });
};
