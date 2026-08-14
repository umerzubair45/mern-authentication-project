import { useState, useRef } from "react";
import { useCall } from "../../context/CallContext";

import CallTimer from "./CallTimer";
import CallControls from "./CallControls";
import { endAudioCall } from "../../socket/emitEvents";

import "./ActiveCallWindow.css";

const ActiveCallWindow = () => {
  const { activeCall, clearActiveCall } = useCall();

  const activeCallRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  // Keep ref synchronized with Context
  activeCallRef.current = activeCall;

  if (!activeCall) {
    return null;
  }

  const { state, remoteUser } = activeCall;

  const displayName = remoteUser?.userName || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  /*
   * ============================================================
   * MUTE
   * ============================================================
   */

  const handleMute = () => {
    setIsMuted((prev) => !prev);
  };

  /*
   * ============================================================
   * SPEAKER
   * ============================================================
   */

  const handleSpeaker = () => {
    console.log("🔊 Speaker clicked");
  };

  /*
   * ============================================================
   * VIDEO
   * ============================================================
   */

  const handleVideo = () => {
    console.log("🎥 Video clicked");
  };

  /*
   * ============================================================
   * END CALL
   * ============================================================
   */

  const handleEnd = () => {
    const currentCall = activeCallRef.current;

    if (!currentCall) {
      console.log("⚠️ No active call to end.");
      return;
    }

    console.log("📞 ENDING CALL:", currentCall);

    /*
     * Tell server to terminate the call.
     *
     * Server knows the current user from socket.user
     * and uses callId to find the other participant.
     */

    endAudioCall({
      callId: currentCall.callId,
    });

    /*
     * Do NOT manually call cleanupWebRTC() here.
     *
     * CallContext.clearActiveCall() handles local cleanup.
     */

    clearActiveCall();

    console.log("✅ Call ended and local state cleaned");
  };

  /*
   * ============================================================
   * CALLING / CONNECTING
   * ============================================================
   */

  if (state === "calling" || state === "connecting") {
    return (
      <div className="call-overlay">
        <div className="call-window">
          <div className="call-avatar">{avatarLetter}</div>

          <h2>{displayName}</h2>

          <p className="call-status">
            {state === "calling" ? "Calling..." : "Connecting..."}
          </p>

          <button type="button" className="call-end-button" onClick={handleEnd}>
            📞 Cancel
          </button>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * CONNECTED
   * ============================================================
   */

  if (state === "connected") {
    return (
      <div className="call-overlay">
        <div className="call-window">
          <div className="call-avatar">{avatarLetter}</div>

          <h2>{displayName}</h2>

          <p className="call-status connected">● Connected</p>

          <div className="call-timer">
            <CallTimer isRunning />
          </div>

          <CallControls
            isMuted={isMuted}
            onMute={handleMute}
            onSpeaker={handleSpeaker}
            onVideo={handleVideo}
            onEnd={handleEnd}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default ActiveCallWindow;
