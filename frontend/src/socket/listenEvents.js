import socket from "./socket";

export const registerSocketListeners = ({
  setOnlineUsers,
  onReceiveMessage,
  onMessageSent,
  onMessageDelivered,
  onMessageRead,
  onMessageEdited,
  onMessageDeleted,
  onTyping,
  onStopTyping,
  onIncomingAudioCall,
  onCallStarted,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onCallUnavailable,
  onCallError,
} = {}) => {
  /*
  ==========================
  Online Users
  ==========================
  */

  socket.off("online_users");

  socket.on("online_users", (users) => {
    console.log("🟢 Online Users:", users);

    setOnlineUsers?.(users);
  });

  /*
  ==========================
  Receive Message
  ==========================
  */

  socket.off("receive_message");

  socket.on("receive_message", (message) => {
    console.log("📩 Received:", message);

    onReceiveMessage?.(message);
  });

  /*
==========================
Sender Acknowledgement
==========================
*/

  socket.off("message_sent");

  socket.on("message_sent", (message) => {
    console.log("✅ Message Sent:", message);

    onMessageSent?.(message);
  });
  socket.off("message_delivered");

  socket.on("message_delivered", (message) => {
    onMessageDelivered?.(message);
  });
  socket.off("message_read");

  socket.on("message_read", (message) => {
    onMessageRead?.(message);
  });
  /*
==========================
EDIT MESSAGE
==========================
*/

  socket.off("message_edited");

  socket.on("message_edited", (message) => {
    console.log("✏️ Message Edited:", message);

    onMessageEdited?.(message);
  });

  /*
==========================
DELETE MESSAGE
==========================
*/

  socket.off("message_deleted");

  socket.on("message_deleted", (message) => {
    console.log("🗑️ Message Deleted:", message);

    onMessageDeleted?.(message);
  });

  /*
  ==========================
  Typing
  ==========================
  */

  socket.off("typing");

  socket.on("typing", (data) => {
    onTyping?.(data);
  });

  /*
  ==========================
  Stop Typing
  ==========================
  */

  socket.off("stop_typing");

  socket.on("stop_typing", (data) => {
    onStopTyping?.(data);
  });

  /*
  ==========================
  Errors
  ==========================
  */

  socket.off("message_error");

  socket.on("message_error", (error) => {
    console.log("❌", error.message);
  });
  /*
==========================================
AUDIO CALL
==========================================
*/

  // socket.off("incoming_audio_call");

  // socket.on("incoming_audio_call", (data) => {
  //   console.log("📞 Incoming Audio Call:", data);

  //   onIncomingAudioCall?.(data);
  // });

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
};

export const removeSocketListeners = () => {
  socket.off("online_users");

  socket.off("receive_message");

  socket.off("message_sent");

  socket.off("typing");

  socket.off("stop_typing");

  socket.off("message_error");
  socket.off("connect");
  socket.off("disconnect");

  socket.off("welcome-client");
  socket.off("message_delivered");
  socket.off("message_read");
  socket.off("message_edited");
  socket.off("message_deleted");
  socket.off("user_offline");
  socket.off("incoming_audio_call");
  socket.off("call_started");
  socket.off("audio_call_accepted");
  socket.off("audio_call_rejected");
  socket.off("audio_call_ended");
  socket.off("call_unavailable");
  socket.off("call_error");
};
