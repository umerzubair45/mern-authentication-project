import { useRef, useState } from "react";

import { FiSend, FiPaperclip, FiSmile, FiX } from "react-icons/fi";

import { sendMessage, typing, stopTyping } from "../../socket/emitEvents";

import Button from "../Button/Button";

import "./MessageInput.css";

const MessageInput = ({ receiverId, replyingTo, setReplyingTo }) => {
  const [text, setText] = useState("");
  const typingRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = text.trim();

    if (!message) return;

    console.log("Receiver ID:", receiverId);
    console.log("Message:", message);

    sendMessage({
      receiverId,
      message,
      replyTo: replyingTo?._id || null,
    });
    stopTyping(receiverId);

    setText("");
    setReplyingTo(null);
  };

  return (
    <div className="message-input-wrapper">
      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <div className="reply-preview-icon">↪</div>

            <div className="reply-preview-text">
              <span className="reply-preview-label">
                Replying to {replyingTo.sender?.userName || "User"}
              </span>

              <span className="reply-preview-message">
                {replyingTo.message}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="reply-preview-cancel"
            onClick={() => setReplyingTo(null)}
            aria-label="Cancel reply"
          >
            <FiX size={15} />
          </button>
        </div>
      )}

      <form className="message-input" onSubmit={handleSubmit}>
        <Button
          type="button"
          variant="secondary"
          className="message-action-btn"
        >
          <FiSmile />
        </Button>

        <input
          className="message-textbox"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);

            typing(receiverId);

            clearTimeout(typingRef.current);

            typingRef.current = setTimeout(() => {
              stopTyping(receiverId);
            }, 1000);
          }}
        />

        <Button
          type="button"
          variant="secondary"
          className="message-action-btn"
        >
          <FiPaperclip />
        </Button>

        <Button type="submit" className="message-send-btn">
          <FiSend />
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
