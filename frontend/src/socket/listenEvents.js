// src/socket/listenEvents.js

import socket from "./socket";

export const setupSocketListeners = ({
  setOnlineUsers,
  onReceiveMessage,
  onMessageSent,
  onMessageDelivered,
  onMessageRead,
  onMessageEdited,
  onMessageDeleted,
  onTyping,
  onStopTyping,

  // Audio call
  onCallStarted,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onCallUnavailable,
  onCallError,

  // WebRTC
  onWebRTCAnswer,
  onWebRTCICECandidate,
}) => {
  // =========================
  // ONLINE USERS
  // =========================

  socket.off("online_users");

  socket.on("online_users", (users) => {
    console.log("🟢 Online Users:", users);

    setOnlineUsers?.(users);
  });

  // =========================
  // RECEIVE MESSAGE
  // =========================

  socket.off("receive_message");

  socket.on("receive_message", (message) => {
    console.log("📩 Received:", message);

    onReceiveMessage?.(message);
  });

  // =========================
  // MESSAGE SENT
  // =========================

  socket.off("message_sent");

  socket.on("message_sent", (message) => {
    console.log("✅ Message Sent:", message);

    onMessageSent?.(message);
  });

  // =========================
  // MESSAGE DELIVERED
  // =========================

  socket.off("message_delivered");

  socket.on("message_delivered", (message) => {
    onMessageDelivered?.(message);
  });

  // =========================
  // MESSAGE READ
  // =========================

  socket.off("message_read");

  socket.on("message_read", (message) => {
    onMessageRead?.(message);
  });

  // =========================
  // EDIT MESSAGE
  // =========================

  socket.off("message_edited");

  socket.on("message_edited", (message) => {
    console.log("✏️ Message Edited:", message);

    onMessageEdited?.(message);
  });

  // =========================
  // DELETE MESSAGE
  // =========================

  socket.off("message_deleted");

  socket.on("message_deleted", (message) => {
    console.log("🗑️ Message Deleted:", message);

    onMessageDeleted?.(message);
  });

  // =========================
  // TYPING
  // =========================

  socket.off("typing");

  socket.on("typing", (data) => {
    onTyping?.(data);
  });

  // =========================
  // STOP TYPING
  // =========================

  socket.off("stop_typing");

  socket.on("stop_typing", (data) => {
    onStopTyping?.(data);
  });

  // =========================
  // AUDIO CALL
  // =========================

  socket.off("call_started");

  socket.on("call_started", (data) => {
    console.log("📞 Call Started:", data);

    onCallStarted?.(data);
  });

  socket.off("audio_call_accepted");

  socket.on("audio_call_accepted", (data) => {
    console.log("✅ Audio Call Accepted:", data);

    onCallAccepted?.(data);
  });

  socket.off("audio_call_rejected");

  socket.on("audio_call_rejected", (data) => {
    console.log("❌ Audio Call Rejected:", data);

    onCallRejected?.(data);
  });

  socket.off("audio_call_ended");

  socket.on("audio_call_ended", (data) => {
    console.log("📴 Audio Call Ended:", data);

    onCallEnded?.(data);
  });

  socket.off("call_unavailable");

  socket.on("call_unavailable", (data) => {
    console.log("⚠️ Call Unavailable:", data);

    onCallUnavailable?.(data);
  });

  socket.off("call_error");

  socket.on("call_error", (data) => {
    console.log("❌ Call Error:", data);

    onCallError?.(data);
  });

  // =========================
  // WEBRTC ANSWER
  // =========================

  socket.off("webrtc_answer");

  socket.on("webrtc_answer", (data) => {
    console.log("📡 WebRTC Answer Received:", data);

    onWebRTCAnswer?.(data);
  });

  // =========================
  // WEBRTC ICE CANDIDATE
  // =========================

  socket.off("webrtc_ice_candidate");

  socket.on("webrtc_ice_candidate", (data) => {
    console.log("🧊 WebRTC ICE Candidate Received:", data);

    onWebRTCICECandidate?.(data);
  });
};

// =========================
// REMOVE LISTENERS
// =========================

export const removeSocketListeners = () => {
  socket.off("online_users");

  socket.off("receive_message");

  socket.off("message_sent");

  socket.off("message_delivered");

  socket.off("message_read");

  socket.off("typing");

  socket.off("stop_typing");

  socket.off("message_edited");

  socket.off("message_deleted");

  socket.off("connect");

  socket.off("disconnect");

  socket.off("welcome-client");

  socket.off("user_offline");

  socket.off("call_started");

  socket.off("audio_call_accepted");

  socket.off("audio_call_rejected");

  socket.off("audio_call_ended");

  socket.off("call_unavailable");

  socket.off("call_error");

  socket.off("webrtc_offer");

  socket.off("webrtc_answer");

  socket.off("webrtc_ice_candidate");
};
