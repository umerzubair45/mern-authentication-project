import "./ConversationItem.css";

const ConversationItem = ({
  user,
  currentUser,
  conversation,
  selectedConversation,
  setSelectedConversation,
  onlineUsers,
  unreadCount,
}) => {
  const otherUser = user;

  const isOnline = onlineUsers.includes(otherUser._id);

  const lastMessage = conversation
    ? conversation.lastMessage?.message || "Start conversation"
    : "Start conversation";

  const time = conversation
    ? new Date(conversation.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // const unread =
  //   conversation?.unreadCounts?.[currentUser.userId] ||
  //   conversation?.unreadCounts?.get?.(currentUser.userId) ||
  //   0;

  const unread = conversation?.unreadCounts
    ? (conversation.unreadCounts[currentUser.userId] ??
      conversation.unreadCounts.get?.(currentUser.userId) ??
      0)
    : 0;
  return (
    <button
      type="button"
      className={`conversation-item ${
        selectedConversation?.participants?.[0]?._id === user._id
          ? "active"
          : ""
      }`}
      onClick={() => {
        if (conversation) {
          setSelectedConversation(conversation);
          return;
        }

        setSelectedConversation({
          _id: null,
          participants: [user],
          lastMessage: null,
        });
      }}
    >
      <div className="conversation-avatar-wrapper">
        <div className="conversation-avatar">
          {otherUser.userName.charAt(0).toUpperCase()}
        </div>

        {isOnline && <span className="conversation-online"></span>}
      </div>

      <div className="conversation-body">
        <div className="conversation-header">
          <h4 className="conversation-name">{otherUser.userName}</h4>

          <span className="conversation-time">{time}</span>
          {unread > 0 && <span className="conversation-badge">{unread}</span>}
        </div>

        <p className="conversation-message">{lastMessage}</p>
        {unreadCount > 0 && (
          <span className="conversation-unread">{unreadCount}</span>
        )}
      </div>
    </button>
  );
};

export default ConversationItem;
