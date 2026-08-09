import MessageList from "./MessageList";

import "./MessageContainer.css";

const MessageContainer = ({ messages, bottomRef }) => {
  return (
    <div className="message-container">
      <MessageList messages={messages} />

      <div ref={bottomRef}></div>
    </div>
  );
};

export default MessageContainer;
