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
      console.log("🔥 CALLCONTEXT RECEIVED END EVENT:", data);

      setActiveCall((currentCall) => {
        console.log("🔥 CURRENT ACTIVE CALL:", currentCall);

        if (!currentCall) {
          console.log("⚠️ No active call in CallContext");
          return null;
        }

        if (currentCall.callId !== data.callId) {
          console.log("⚠️ CALL ID MISMATCH", {
            currentCallId: currentCall.callId,
            receivedCallId: data.callId,
          });

          return currentCall;
        }

        console.log("🔥 CALL ENDED → UPDATING CONTEXT");

        return {
          ...currentCall,
          state: "ended",
        };
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
