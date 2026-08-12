import { useContext, useEffect, useState, useRef } from "react";

import AuthContext from "../../context/AuthContext";
import FloatingButton from "./FloatingButton";
import ChatPopup from "./ChatPopup";
import ChatLayout from "./ChatLayout";
import IncomingCallPopup from "./IncomingCallPopup";

import socket from "../../socket/socket";

import {
  createPeerConnection,
  getLocalAudioStream,
  addLocalStream,
  createAnswer,
  cleanupWebRTC,
  setRemoteDescription,
} from "../../services/webrtcService";

import {
  sendWebRTCAnswer,
  sendWebRTCICECandidate,
  acceptAudioCall,
  rejectAudioCall,
} from "../../socket/emitEvents";

import "./ChatWidget.css";

const ChatWidget = () => {
  const { user } = useContext(AuthContext);

  const [open, setOpen] = useState(false);

  // Incoming call information
  const [incomingCall, setIncomingCall] = useState(null);

  // Whether receiver clicked Accept
  const [callAccepted, setCallAccepted] = useState(false);

  // WebRTC offer can arrive before OR after user clicks Accept
  const [pendingOffer, setPendingOffer] = useState(null);
  const remoteAudioRef = useRef(null);
  /*
   * ============================================================
   * INCOMING AUDIO CALL + WEBRTC OFFER LISTENERS
   * ============================================================
   */

  useEffect(() => {
    if (!user) {
      console.log("📞 ChatWidget: no user");
      return;
    }

    console.log("📞 ChatWidget: registering incoming call listeners");

    const handleIncomingAudioCall = (data) => {
      console.log("🚨🚨🚨 ChatWidget RECEIVED incoming_audio_call:", data);

      setIncomingCall(data);
      setCallAccepted(false);
    };

    const handleWebRTCOffer = (data) => {
      console.log("📡 ChatWidget RECEIVED WebRTC offer:", data);

      setPendingOffer(data);
    };

    socket.on("incoming_audio_call", handleIncomingAudioCall);

    socket.on("webrtc_offer", handleWebRTCOffer);

    return () => {
      console.log("📞 ChatWidget: removing incoming call listeners");

      socket.off("incoming_audio_call", handleIncomingAudioCall);

      socket.off("webrtc_offer", handleWebRTCOffer);
    };
  }, [user]);

  /*
   * ============================================================
   * WAIT UNTIL BOTH:
   *
   * 1. Receiver accepted call
   * 2. WebRTC offer arrived
   *
   * Then start WebRTC.
   * ============================================================
   */

  useEffect(() => {
    if (!callAccepted) {
      return;
    }

    if (!incomingCall) {
      return;
    }

    if (!pendingOffer) {
      console.log("⏳ WebRTC offer has not arrived yet.");

      return;
    }

    if (pendingOffer.callId !== incomingCall.callId) {
      console.log("⚠️ WebRTC offer belongs to another call.");

      return;
    }

    console.log("✅ Call accepted + WebRTC offer available.");

    handleAcceptedWebRTC(incomingCall, pendingOffer);
  }, [callAccepted, incomingCall, pendingOffer]);
  const handleEndCall = () => {
    if (!incomingCall && !activeCall) {
      return;
    }

    const callId = incomingCall?.callId || activeCall?.callId;

    const callerId = incomingCall?.callerId || activeCall?.callerId;

    console.log("📞 RECEIVER ENDING CALL");

    endAudioCall({
      receiverId: callerId,
      callId,
    });

    cleanupWebRTC();

    setIncomingCall(null);
    setPendingOffer(null);
    setCallAccepted(false);
  };
  /*
   * ============================================================
   * ACCEPT AUDIO CALL
   * ============================================================
   *
   * IMPORTANT:
   * This function only marks the call as accepted.
   *
   * WebRTC processing happens in the useEffect above
   * when pendingOffer is available.
   */

  const handleAcceptCall = () => {
    if (!incomingCall) {
      return;
    }

    console.log("✅ ACCEPT CALL:", incomingCall);

    const { callId, callerId } = incomingCall;

    // Tell server IMMEDIATELY that receiver accepted
    acceptAudioCall({
      callerId,
      callId,
    });

    console.log("✅ Audio call acceptance sent to server");

    // Mark receiver as accepted
    setCallAccepted(true);
    // setIncomingCall(null);
  };

  /*
   * ============================================================
   * PROCESS ACCEPTED WEBRTC CALL
   * ============================================================
   */

  const handleAcceptedWebRTC = async (call, offerData) => {
    try {
      const { callId, callerId } = call;

      const { offer } = offerData;

      console.log("🌐 Starting receiver WebRTC:", {
        callId,
        callerId,
      });

      /*
       * --------------------------------------------------------
       * 1. Create Peer Connection
       * --------------------------------------------------------
       */

      createPeerConnection({
        onIceCandidate: (candidate) => {
          console.log("🧊 Receiver ICE Candidate:", candidate);

          sendWebRTCICECandidate({
            receiverId: callerId,
            callId,
            candidate,
          });
        },

        onTrack: (remoteStream) => {
          console.log("🔊 RECEIVER REMOTE STREAM:", remoteStream);

          const remoteTrack = remoteStream.getAudioTracks()[0];

          console.log("🎵 REMOTE TRACK:", remoteTrack);
          console.log("🎵 Initial muted:", remoteTrack.muted);
          console.log("🎵 Initial enabled:", remoteTrack.enabled);
          console.log("🎵 Initial readyState:", remoteTrack.readyState);

          if (!remoteAudioRef.current) {
            console.error("❌ Receiver audio element is NULL");
            return;
          }

          const audio = remoteAudioRef.current;

          audio.srcObject = remoteStream;
          audio.autoplay = true;
          audio.playsInline = true;
          audio.muted = false;
          audio.volume = 1;

          const playRemoteAudio = async () => {
            try {
              await audio.play();

              console.log("🔊 REMOTE AUDIO PLAYING");
              console.log("🔊 paused:", audio.paused);
              console.log("🔊 muted:", audio.muted);
              console.log("🔊 volume:", audio.volume);
              console.log("🔊 readyState:", audio.readyState);
            } catch (error) {
              console.error("❌ REMOTE AUDIO PLAY FAILED:", error);
            }
          };

          // Try immediately
          playRemoteAudio();

          // Important: remote WebRTC audio can initially be muted
          // and become unmuted later.
          remoteTrack.onunmute = () => {
            console.log("🔊🔊🔊 REMOTE TRACK UNMUTED");

            playRemoteAudio();
          };

          remoteTrack.onmute = () => {
            console.log("🔇 REMOTE TRACK MUTED");
          };

          remoteTrack.onended = () => {
            console.log("🛑 REMOTE TRACK ENDED");
          };
        },

        onConnectionStateChange: (state) => {
          console.log("🌐 Receiver WebRTC state:", state);

          if (state === "connected") {
            console.log("✅ AUDIO CALL CONNECTED");
          }

          if (
            state === "failed" ||
            state === "disconnected" ||
            state === "closed"
          ) {
            console.log("❌ AUDIO CALL ENDED:", state);

            cleanupWebRTC();

            setCallAccepted(false);
            setIncomingCall(null);
            setPendingOffer(null);
          }
        },
      });

      /*
       * --------------------------------------------------------
       * 2. Get Receiver Microphone
       * --------------------------------------------------------
       */

      console.log("🎙️ Receiver getting microphone...");

      const stream = await getLocalAudioStream();

      console.log("🎙️ Receiver microphone ready:", stream);

      /*
       * --------------------------------------------------------
       * 3. Add Receiver Microphone
       * --------------------------------------------------------
       */

      addLocalStream(stream);

      console.log("🎙️ Receiver microphone added to peer connection");

      /*
       * --------------------------------------------------------
       * 4. Apply Caller Offer
       * --------------------------------------------------------
       */

      console.log("📡 Applying caller offer...");

      console.log("📡 Offer:", offer);

      if (!offer || !offer.type || !offer.sdp) {
        throw new Error("Invalid WebRTC offer received.");
      }

      await setRemoteDescription(offer);

      console.log("✅ Caller offer applied");

      /*
       * --------------------------------------------------------
       * 5. Create Receiver Answer
       * --------------------------------------------------------
       */

      const answer = await createAnswer();

      console.log("📡 Receiver answer created:", answer);

      /*
       * --------------------------------------------------------
       * 6. Send Answer Back To Caller
       * --------------------------------------------------------
       */

      sendWebRTCAnswer({
        callerId,
        callId,
        answer,
      });

      console.log("📡 Receiver answer sent");

      /*
       * --------------------------------------------------------
       * 8. Remove Incoming Popup
       * --------------------------------------------------------
       */

      setIncomingCall(null);

      /*
       * Keep pendingOffer cleared after processing
       */

      setPendingOffer(null);

      /*
       * We don't need this flag anymore
       */

      setCallAccepted(false);
    } catch (error) {
      console.error("❌ Receiver WebRTC Error:", error);

      cleanupWebRTC();

      setCallAccepted(false);
      setPendingOffer(null);
    }
  };

  /*
   * ============================================================
   * REJECT AUDIO CALL
   * ============================================================
   */

  const handleRejectCall = () => {
    if (!incomingCall) {
      return;
    }

    console.log("❌ REJECT CALL:", incomingCall);

    rejectAudioCall({
      callerId: incomingCall.callerId,

      callId: incomingCall.callId,
    });

    setIncomingCall(null);
    setPendingOffer(null);
    setCallAccepted(false);

    cleanupWebRTC();
  };

  /*
   * ============================================================
   * NO USER
   * ============================================================
   */

  if (!user) {
    return null;
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

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
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </>
  );
};

export default ChatWidget;
