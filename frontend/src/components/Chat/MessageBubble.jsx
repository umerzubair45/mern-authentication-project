import "./MessageBubble.css";
import useChat from "../../hooks/useChat";
import { editMessage, deleteMessage } from "../../socket/emitEvents";
import { useState } from "react";

const MessageBubble = ({ message, isMine }) => {
  const { setReplyingTo } = useChat();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleReply = () => {
    setReplyingTo(message);
  };

  /*
  ==========================================
  EDIT MESSAGE
  ==========================================
  */

  const handleEdit = () => {
    setEditText(message.message);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const newMessage = editText.trim();

    if (!newMessage || newMessage === message.message) {
      setIsEditing(false);
      setEditText(message.message);
      return;
    }

    editMessage({
      messageId: message._id,
      message: newMessage,
    });

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.message);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  /*
  ==========================================
  DELETE MESSAGE
  ==========================================
  */

  const handleDelete = () => {
    deleteMessage({
      messageId: message._id,
    });

    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`message-row ${
        isMine ? "message-row-right" : "message-row-left"
      }`}
    >
      <div
        className={`message-bubble ${
          isMine ? "message-sent" : "message-received"
        }`}
      >
        {/* ==========================================
            REPLY PREVIEW
        ========================================== */}

        {message.replyTo && (
          <div className="message-reply-preview">
            <div className="message-reply-user">
              ↪ {message.replyTo.sender?.userName || "User"}
            </div>

            <div className="message-reply-text">{message.replyTo.message}</div>
          </div>
        )}

        {/* ==========================================
            INLINE EDIT MODE
        ========================================== */}

        {isEditing ? (
          <div className="message-edit-mode">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              autoFocus
              className="message-edit-input"
            />

            <div className="message-edit-actions">
              <button
                type="button"
                className="message-edit-cancel"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

              <button
                type="button"
                className="message-edit-save"
                onClick={handleSaveEdit}
                disabled={!editText.trim()}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ==========================================
                MESSAGE TEXT
            ========================================== */}

            <div
              className={`message-text ${
                message.deleted ? "message-deleted" : ""
              }`}
            >
              {message.message}

              {message.edited && !message.deleted && (
                <span className="message-edited"> (edited)</span>
              )}
            </div>

            {/* ==========================================
                REPLY BUTTON
            ========================================== */}

            <div className="message-actions">
              <button
                type="button"
                className="message-reply-btn"
                onClick={handleReply}
                aria-label="Reply to message"
              >
                ↪ Reply
              </button>
            </div>

            {/* ==========================================
                EDIT / DELETE
            ========================================== */}

            {isMine && !message.deleted && (
              <div className="message-actions">
                <button type="button" onClick={handleEdit}>
                  ✏️Edit
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  🗑️Delete
                </button>
              </div>
            )}
            {showDeleteConfirm && (
              <div className="delete-confirm-box">
                <span>Delete this message?</span>

                <div className="delete-confirm-actions">
                  <button
                    type="button"
                    className="cencil-confirm-btn"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="delete-confirm-btn"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            {/* ==========================================
                TIME + DELIVERY STATUS
            ========================================== */}

            <div className="message-footer">
              <span className="message-time">{time}</span>

              {isMine && (
                <span
                  className={`message-status ${
                    message.status === "read" ? "read" : ""
                  }`}
                >
                  {message.status === "sent" && "✓"}

                  {message.status === "delivered" && "✓✓"}

                  {message.status === "read" && "✓✓"}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
