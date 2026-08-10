import { useContext, useEffect, useRef } from "react";

import AuthContext from "../../context/AuthContext";

import useApi from "../../hooks/useApi";
import useChat from "../../hooks/useChat";

import chatService from "../../services/chatService";
import { showNotification } from "../../services/notificationService";
import ChatHeader from "./ChatHeader";
//import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";
import MessageContainer from "./MessageContainer";
import { useLayoutEffect } from "react";

import {
  setupSocketListeners,
  removeSocketListeners,
} from "../../socket/listenEvents";
import {
  messageDelivered,
  messageRead,
  editMessage,
  deleteMessage,
  typing,
  stopTyping,
} from "../../socket/emitEvents";

import "./ChatWindow.css";

const ChatWindow = () => {
  const { request } = useApi();
  const { user } = useContext(AuthContext);

  const chatApi = chatService(request);

  const {
    selectedConversation,
    messages,
    setMessages,
    setConversations,
    typingUsers,
    setTypingUsers,
    replyingTo,
    setReplyingTo,
  } = useChat();

  const bottomRef = useRef(null);
  useEffect(() => {
    if (!selectedConversation?._id) return;

    chatApi.resetUnread(selectedConversation._id);
    messages.forEach((message) => {
      if (message.receiver?._id === user.userId && message.status !== "read") {
        messageRead({
          messageId: message._id,
          senderId: message.sender._id,
        });
      }
    });

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === selectedConversation._id
          ? {
              ...conversation,
              unreadCounts: {
                ...conversation.unreadCounts,
                [user.userId]: 0,
              },
            }
          : conversation,
      ),
    );
  }, [selectedConversation]);
  /*
  =====================================
  Load Messages
  =====================================
  */

  useEffect(() => {
    if (!selectedConversation) return;

    loadMessages();
  }, [selectedConversation]);

  const loadMessages = async () => {
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    const result = await chatApi.getMessages(selectedConversation._id);

    if (result.success) {
      setMessages(result.data.messages || []);
    }
  };

  /*
  =====================================
  Socket
  =====================================
  */

  useEffect(() => {
    setupSocketListeners({
      onReceiveMessage: handleReceiveMessage,
      onMessageSent: handleReceiveMessage,
      onMessageDelivered: handleMessageDelivered,
      onMessageRead: handleMessageRead,
      onTyping: handleTyping,
      onStopTyping: handleStopTyping,
      onMessageEdited: handleMessageEdited,
      onMessageDeleted: handleMessageDeleted,
    });

    return () => {
      removeSocketListeners();
    };
  }, []);

  const handleReceiveMessage = (message) => {
    console.log("Socket Message:", message);
    /*
  ==========================================
  BROWSER NOTIFICATION
  ==========================================
  */

    const senderId = message.sender?._id;
    const receiverId = message.receiver?._id;

    const isIncomingMessage = receiverId === user.userId;

    const isCurrentConversation =
      selectedConversation?._id === message.conversation?._id;

    if (isIncomingMessage && !isCurrentConversation) {
      showNotification({
        title: message.sender?.userName || "New message",
        message: message.message,
        conversationId: message.conversation?._id,
      });
    }
    /*
  ==========================================
  Update Messages
  ==========================================
  */

    setMessages((prev) => {
      const exists = prev.some((item) => item._id === message._id);

      if (exists) {
        return prev;
      }

      return [...prev, message];
    });

    /*
  ==========================================
  Update Conversation Sidebar
  ==========================================
  */

    setConversations((prev) => {
      let list = [...prev];

      const index = list.findIndex((c) => c._id === message.conversation._id);

      if (index === -1) {
        list.unshift({
          ...message.conversation,

          lastMessage: {
            _id: message._id,
            sender: message.sender,
            receiver: message.receiver,
            message: message.message,
            status: message.status,
            createdAt: message.createdAt,
          },

          updatedAt: message.createdAt,

          unreadCounts: {
            [user.userId]: message.receiver._id === user.userId ? 1 : 0,
          },
        });

        return list;
      }

      const updatedConversation = {
        ...list[index],

        lastMessage: {
          _id: message._id,
          sender: message.sender,
          receiver: message.receiver,
          message: message.message,
          status: message.status,
          createdAt: message.createdAt,
        },

        updatedAt: message.createdAt,

        unreadCounts: {
          ...(list[index].unreadCounts || {}),

          ...(message.receiver._id === user.userId && {
            [user.userId]: (list[index].unreadCounts?.[user.userId] || 0) + 1,
          }),
        },
      };

      list.splice(index, 1);

      list.unshift(updatedConversation);

      return [...list]; // IMPORTANT
    });
    if (message.receiver._id === user.userId) {
      messageDelivered({
        messageId: message._id,
        senderId: message.sender._id,
      });
    }
  };
  const handleMessageDelivered = (message) => {
    setMessages((prev) =>
      prev.map((item) =>
        item._id === message._id
          ? {
              ...item,
              status: message.status,
            }
          : item,
      ),
    );

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.lastMessage?._id !== message._id) return conversation;

        return {
          ...conversation,
          lastMessage: {
            ...conversation.lastMessage,
            status: message.status,
          },
        };
      }),
    );
  };
  const handleMessageRead = (message) => {
    setMessages((prev) =>
      prev.map((item) =>
        item._id === message._id
          ? {
              ...item,
              status: message.status,
            }
          : item,
      ),
    );

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.lastMessage?._id !== message._id) return conversation;

        return {
          ...conversation,
          lastMessage: {
            ...conversation.lastMessage,
            status: message.status,
          },
        };
      }),
    );
  };
  const handleTyping = ({ senderId }) => {
    setTypingUsers((prev) =>
      prev.includes(senderId) ? prev : [...prev, senderId],
    );
  };

  const handleStopTyping = ({ senderId }) => {
    setTypingUsers((prev) => prev.filter((id) => id !== senderId));
  };
  const handleMessageEdited = (updatedMessage) => {
    setMessages((prev) =>
      prev.map((message) =>
        message._id === updatedMessage._id ? updatedMessage : message,
      ),
    );

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.lastMessage?._id !== updatedMessage._id) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: {
            ...conversation.lastMessage,
            message: updatedMessage.message,
            edited: updatedMessage.edited,
          },
        };
      }),
    );
  };

  const handleMessageDeleted = (deletedMessage) => {
    setMessages((prev) =>
      prev.map((message) =>
        message._id === deletedMessage._id ? deletedMessage : message,
      ),
    );

    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.lastMessage?._id !== deletedMessage._id) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: {
            ...conversation.lastMessage,
            message: deletedMessage.message,
            deleted: deletedMessage.deleted,
          },
        };
      }),
    );
  };
  /*
  =====================================
  Auto Scroll
  =====================================
  */
  useLayoutEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  /*
  =====================================
  Empty
  =====================================
  */

  if (!selectedConversation) {
    return <EmptyChat />;
  }

  console.log("========== CHAT WINDOW ==========");
  console.log("Logged User:", user);

  console.log("Selected Conversation:", selectedConversation);

  console.log("Participants:", selectedConversation.participants);

  const otherUser = selectedConversation.participants.find(
    (participant) => participant._id !== user.userId,
  );
  const isTyping = typingUsers.includes(otherUser._id);

  console.log("Other User:", otherUser);

  return (
    <section className="chat-window">
      <ChatHeader conversation={selectedConversation} isTyping={isTyping} />

      <MessageContainer messages={messages} bottomRef={bottomRef}>
        <div ref={bottomRef}></div>
      </MessageContainer>

      <MessageInput
        receiverId={otherUser._id}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </section>
  );
};

export default ChatWindow;
