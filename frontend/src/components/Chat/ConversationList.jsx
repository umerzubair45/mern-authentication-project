import { useContext, useMemo, useState } from "react";

import AuthContext from "../../context/AuthContext";
import OnlineUsersContext from "../../context/OnlineUsersContext";

import useChat from "../../hooks/useChat";
import Button from "../Button/Button";
import Input from "../Input/Input";
import ConversationItem from "./ConversationItem";
import { requestNotificationPermission } from "../../services/notificationService";
import "./ConversationList.css";

const ConversationList = () => {
  const { user } = useContext(AuthContext);

  const { onlineUsers } = useContext(OnlineUsersContext);

  const {
    users,
    conversations,
    selectedConversation,
    setSelectedConversation,
  } = useChat();

  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      return (
        user.userName.toLowerCase().includes(keyword) ||
        user.userEmail.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  const sidebarUsers = useMemo(() => {
    const list = filteredUsers.map((chatUser) => {
      const conversation = conversations.find((item) =>
        item.participants.some(
          (participant) => participant._id === chatUser._id,
        ),
      );

      return {
        user: chatUser,
        conversation,
        unread: conversation?.unreadCounts?.[user.userId] || 0,
      };
    });

    list.sort((a, b) => {
      // 1. Selected conversation always first
      if (
        selectedConversation &&
        a.user._id ===
          selectedConversation.participants.find((p) => p._id !== user.userId)
            ?._id
      )
        return -1;

      if (
        selectedConversation &&
        b.user._id ===
          selectedConversation.participants.find((p) => p._id !== user.userId)
            ?._id
      )
        return 1;

      // 2. Unread first
      if (a.unread !== b.unread) {
        return b.unread - a.unread;
      }

      // 3. Latest conversation
      const aTime = a.conversation
        ? new Date(a.conversation.updatedAt).getTime()
        : 0;

      const bTime = b.conversation
        ? new Date(b.conversation.updatedAt).getTime()
        : 0;

      return bTime - aTime;
    });

    return list;
  }, [filteredUsers, conversations, selectedConversation, user.userId]);
  return (
    <aside className="conversation-list">
      <div className="conversation-list-header">
        <h2 className="conversation-title">Chats</h2>

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type="button"
          className="notification-enable-btn"
          onClick={requestNotificationPermission}
        >
          🔔 Enable Notifications
        </Button>
      </div>

      <div className="conversation-scroll">
        {filteredUsers.length === 0 ? (
          <div className="conversation-empty">No conversations found</div>
        ) : (
          sidebarUsers.map(({ user: chatUser, conversation }) => {
            const sortedConversations = [...conversations].sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
            );
            // const conversation = sortedConversations.find((item) =>
            //   item.participants.some(
            //     (participant) => participant._id === chatUser._id,
            //   ),
            // );

            return (
              <ConversationItem
                key={chatUser._id}
                user={chatUser}
                currentUser={user}
                conversation={conversation}
                onlineUsers={onlineUsers}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                unreadCount={conversation?.unreadCounts?.[user.userId] || 0}
              />
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
