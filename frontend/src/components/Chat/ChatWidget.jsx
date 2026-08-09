import { useContext, useEffect, useState } from "react";

import AuthContext from "../../context/AuthContext";
import FloatingButton from "./FloatingButton";
import ChatPopup from "./ChatPopup";
import ChatLayout from "./ChatLayout";
import IncomingCallPopup from "./IncomingCallPopup";

import socket from "../../socket/socket";

import "./ChatWidget.css";

const ChatWidget = () => {
  const { user } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!user) {
      console.log("📞 ChatWidget: no user");
      return;
    }

    console.log("📞 ChatWidget: registering incoming call listener");

    const handleIncomingAudioCall = (data) => {
      console.log("🚨🚨🚨 ChatWidget RECEIVED incoming_audio_call:", data);

      setIncomingCall(data);
    };

    socket.on("incoming_audio_call", handleIncomingAudioCall);

    return () => {
      console.log("📞 ChatWidget: removing incoming call listener");

      socket.off("incoming_audio_call", handleIncomingAudioCall);
    };
  }, [user]);

  const handleAcceptCall = () => {
    console.log("✅ ACCEPT CALL:", incomingCall);

    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    console.log("❌ REJECT CALL:", incomingCall);

    setIncomingCall(null);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <FloatingButton onClick={() => setOpen(true)} />

      {open && (
        <ChatPopup onClose={() => setOpen(false)}>
          <ChatLayout />
        </ChatPopup>
      )}

      <IncomingCallPopup
        call={incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </>
  );
};

export default ChatWidget;
