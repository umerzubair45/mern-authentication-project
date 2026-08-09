import "./ChatPopup.css";
import Button from "../Button/Button";

const ChatPopup = ({ children, onClose }) => {
  return (
    <div className="chat-popup">
      <div className="chat-popup-header">
        <span>Messenger</span>

        <Button
          variant="secondary"
          className="chat-close-btn"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>

      <div className="chat-popup-body">{children}</div>
    </div>
  );
};

export default ChatPopup;
