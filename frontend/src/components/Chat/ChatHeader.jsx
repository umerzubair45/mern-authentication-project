import { useContext } from "react";
import { FiMoreVertical, FiPhone, FiVideo } from "react-icons/fi";
import AuthContext from "../../context/AuthContext";
import OnlineUsersContext from "../../context/OnlineUsersContext";
import { startAudioCall } from "../../socket/emitEvents";

import Button from "../Button/Button";

import "./ChatHeader.css";

const ChatHeader = ({ conversation, isTyping }) => {
  const { user } = useContext(AuthContext);

  const { onlineUsers, lastSeenUsers } = useContext(OnlineUsersContext);

  console.log("========== CHAT HEADER ==========");
  console.log("Logged In User:", user);

  console.log("Participants:", conversation.participants);

  console.log("Logged User ID:", user.userId);

  const otherUser = conversation.participants.find(
    (participant) => participant._id !== user.userId,
  );
  console.log("Other User:", otherUser);

  const isOnline = onlineUsers.includes(otherUser._id);
  const lastSeen = lastSeenUsers[otherUser?._id];

  return (
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
          onClick={() => {
            const callId = crypto.randomUUID();

            console.log("📞 Starting Audio Call:", {
              callId,
              receiverId: otherUser._id,
            });

            startAudioCall({
              receiverId: otherUser._id,
              callId,
            });
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
      </div>
    </header>
  );
};

export default ChatHeader;
