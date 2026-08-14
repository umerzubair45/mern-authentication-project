import { createContext, useContext, useEffect, useState } from "react";

import socket from "../socket/socket";
import { cleanupWebRTC } from "../services/webrtcService";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);

  /*
   * ============================================================
   * REMOTE CALL ENDED
   * ============================================================
   */

  useEffect(() => {
    const handleAudioCallEnded = (data) => {
      console.log("📴 CallContext: audio_call_ended received:", data);

      setActiveCall((currentCall) => {
        /*
         * Ignore an old/stale call-ended event.
         */

        if (!currentCall) {
          console.log("⚠️ CallContext: no active call");
          return null;
        }

        if (currentCall.callId !== data.callId) {
          console.log("⚠️ CallContext: call ID mismatch", {
            currentCallId: currentCall.callId,
            receivedCallId: data.callId,
          });

          return currentCall;
        }

        console.log("🧹 CallContext: remote call ended");

        cleanupWebRTC();

        return null;
      });
    };

    socket.on("audio_call_ended", handleAudioCallEnded);

    return () => {
      socket.off("audio_call_ended", handleAudioCallEnded);
    };
  }, []);

  /*
   * ============================================================
   * CLEAR LOCAL CALL
   * ============================================================
   */

  const clearActiveCall = () => {
    console.log("🧹 CallContext: clearing activeCall");

    cleanupWebRTC();

    setActiveCall(null);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        setActiveCall,
        clearActiveCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }

  return context;
};

export default CallContext;
