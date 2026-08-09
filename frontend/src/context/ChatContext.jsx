import { createContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  const value = {
    conversations,
    setConversations,

    selectedConversation,
    setSelectedConversation,
    users,
    setUsers,

    messages,
    setMessages,

    typingUsers,
    setTypingUsers,

    replyingTo,
    setReplyingTo,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
