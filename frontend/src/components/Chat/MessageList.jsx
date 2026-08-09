import { useContext } from "react";

import AuthContext from "../../context/AuthContext";

import MessageBubble from "./MessageBubble";

import "./MessageList.css";

const MessageList = ({ messages }) => {
  const { user } = useContext(AuthContext);

  if (!messages.length) {
    return <div className="message-list-empty">Start your conversation 👋</div>;
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          isMine={message.sender._id === user.userId}
        />
      ))}
    </div>
  );
};

export default MessageList;
