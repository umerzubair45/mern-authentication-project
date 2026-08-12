import { useContext, useEffect, useRef } from "react";
import { FiMoreVertical, FiPhone, FiVideo } from "react-icons/fi";
import AuthContext from "../../context/AuthContext";
import OnlineUsersContext from "../../context/OnlineUsersContext";
import {
  startAudioCall,
  sendWebRTCOffer,
  sendWebRTCICECandidate,
  endAudioCall,
} from "../../socket/emitEvents";
import socket from "../../socket/socket";
import Button from "../Button/Button";
import {
  createPeerConnection,
  getLocalAudioStream,
  addLocalStream,
  createOffer,
  setRemoteDescription,
  addIceCandidate,
  cleanupWebRTC,
} from "../../services/webrtcService";
import { useCall } from "../../context/CallContext";

import "./ChatHeader.css";

const ChatHeader = ({ conversation, isTyping }) => {
  const { user } = useContext(AuthContext);
  const remoteAudioRef = useRef(null);
  const activeCallRef = useRef(null);
  //const activeCallIdRef = useRef(null);
  const { onlineUsers, lastSeenUsers } = useContext(OnlineUsersContext);
  const { activeCall, setActiveCall, clearActiveCall } = useCall();

  console.log("========== CHAT HEADER ==========");
  console.log("Logged In User:", user);

  console.log("Participants:", conversation.participants);

  console.log("Logged User ID:", user.userId);

  useEffect(() => {
    activeCallRef.current = activeCall;

    console.log("📞 activeCallRef updated:", activeCall);
  }, [activeCall]);
  useEffect(() => {
    const handleWebRTCAnswer = async (data) => {
      console.log("📡 Caller received WebRTC answer:", data);

      const { callId, receiverId, answer } = data;

      const currentCall = activeCallRef.current;
      if (!currentCall) {
        console.log("⚠️ No active caller call.");
        return;
      }

      if (currentCall.callId !== callId) {
        console.log("⚠️ Answer belongs to another call.");
        return;
      }

      try {
        console.log("📡 Caller applying receiver answer...");

        await setRemoteDescription(answer);

        console.log("✅ Caller remote answer applied successfully.");
      } catch (error) {
        console.error("❌ Failed to apply caller remote answer:", error);
      }
    };

    const handleWebRTCICECandidate = async (data) => {
      console.log("🧊 Caller received receiver ICE candidate:", data);

      const { callId, candidate } = data;

      const currentCall = activeCallRef.current;

      console.log("📞 Current active call from ref:", currentCall);

      if (!currentCall) {
        console.log("⚠️ No active caller call.");
        return;
      }

      if (currentCall.callId !== callId) {
        console.log("⚠️ ICE candidate belongs to another call.");
        return;
      }

      try {
        await addIceCandidate(candidate);

        console.log("🧊 Caller added receiver ICE candidate.");
      } catch (error) {
        console.error("❌ Failed to add receiver ICE candidate:", error);
      }
    };

    socket.on("webrtc_answer", handleWebRTCAnswer);
    socket.on("webrtc_ice_candidate", handleWebRTCICECandidate);

    return () => {
      socket.off("webrtc_answer", handleWebRTCAnswer);
      socket.off("webrtc_ice_candidate", handleWebRTCICECandidate);
    };
  }, []);

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== user.userId,
  );
  console.log("Other User:", otherUser);

  const isOnline = onlineUsers.includes(otherUser._id);
  const lastSeen = lastSeenUsers[otherUser?._id];

  const handleEndCall = () => {
    const currentCall = activeCallRef.current;
    if (!currentCall) {
      console.log("⚠️ No active call to end.");
      return;
    }

    console.log("📞 CALLER ENDING CALL:", activeCall);

    endAudioCall({
      callId: currentCall.callId,
      receiverId:
        currentCall.role === "caller"
          ? currentCall.receiverId
          : currentCall.callerId,
    });

    cleanupWebRTC();

    clearActiveCall();

    console.log("✅ Call ended and local state cleaned");
  };

  return (
    <>
      <header className="chat-header">
        <div className="chat-user">
          <div className="chat-avatar-wrapper">
            <div className="chat-avatar">
              {otherUser.userName.charAt(0).toUpperCase()}
            </div>

            {isOnline && <span className="chat-online-dot" />}
          </div>

          <div className="chat-user-info">
            <h3>{otherUser.userName}</h3>
            {isTyping ? (
              <small className="chat-typing">Typing...</small>
            ) : (
              <small className={isOnline ? "online" : "offline"}>
                {isOnline ? "Online" : "Offline"}
              </small>
            )}

            <div className="chat-user-status">
              {isOnline ? (
                <span className="chat-online-status">Online</span>
              ) : (
                <span className="chat-offline-status">
                  {lastSeen
                    ? `Last seen ${new Date(otherUser.lastSeen).toLocaleString(
                        [],
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}`
                    : "Offline"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="chat-actions">
          <Button
            type="button"
            variant="secondary"
            className="chat-icon-btn"
            title="Voice Call"
            onClick={async () => {
              const callId = crypto.randomUUID();

              setActiveCall({
                callId,
                callerId: user.userId,
                receiverId: otherUser._id,
                role: "caller",
              });

              console.log("📞 Starting Audio Call:", {
                callId,
                callerId: user.userId,
                receiverId: otherUser._id,
              });

              // Existing call signaling
              startAudioCall({
                receiverId: otherUser._id,
                callId,
              });

              try {
                console.log("🌐 Creating WebRTC Peer Connection...");

                createPeerConnection({
                  onIceCandidate: (candidate) => {
                    console.log("🧊 Local ICE Candidate:", candidate);

                    sendWebRTCICECandidate({
                      receiverId: otherUser._id,
                      callId,
                      candidate,
                    });
                  },

                  onTrack: (remoteStream) => {
                    console.log(
                      "🔊 Caller received remote audio:",
                      remoteStream,
                    );

                    console.log(
                      "🎵 Remote tracks:",
                      remoteStream.getAudioTracks(),
                    );

                    if (!remoteAudioRef.current) {
                      console.error("❌ remoteAudioRef.current is NULL");
                      return;
                    }

                    console.log(
                      "🎧 Audio element found:",
                      remoteAudioRef.current,
                    );

                    remoteAudioRef.current.srcObject = remoteStream;

                    console.log(
                      "🎧 Audio srcObject:",
                      remoteAudioRef.current.srcObject,
                    );

                    remoteAudioRef.current
                      .play()
                      .then(() => {
                        console.log("✅ Remote audio playback started");
                        console.log(
                          "🔊 Audio paused:",
                          remoteAudioRef.current.paused,
                        );
                        console.log(
                          "🔊 Audio volume:",
                          remoteAudioRef.current.volume,
                        );
                      })
                      .catch((error) => {
                        console.error(
                          "❌ Remote audio playback failed:",
                          error,
                        );
                      });
                  },

                  onConnectionStateChange: (state) => {
                    console.log("🌐 WebRTC Connection State:", state);

                    if (state === "connected") {
                      console.log("✅ WebRTC AUDIO CONNECTED");
                    }

                    if (
                      state === "failed" ||
                      state === "disconnected" ||
                      state === "closed"
                    ) {
                      console.log("❌ WebRTC connection ended:", state);
                      cleanupWebRTC();

                      //activeCallIdRef.current = null;
                    }
                  },
                });

                console.log("🎙️ Getting microphone...");

                const stream = await getLocalAudioStream();

                console.log("🎙️ Microphone ready:", stream);

                addLocalStream(stream);

                console.log("🎙️ Local audio added to peer connection");

                const offer = await createOffer();

                console.log("📡 WebRTC Offer Created:", offer);

                sendWebRTCOffer({
                  receiverId: otherUser._id,
                  callId,
                  offer,
                });

                console.log("📡 WebRTC Offer Sent");
              } catch (error) {
                console.error("❌ WebRTC Caller Error:", error);
              }
            }}
          >
            <FiPhone />
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="chat-icon-btn"
            title="Video Call"
          >
            <FiVideo />
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="chat-icon-btn"
            title="More"
          >
            <FiMoreVertical />
          </Button>
          <button onClick={handleEndCall}>End Call</button>
        </div>
      </header>
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </>
  );
};

export default ChatHeader;
