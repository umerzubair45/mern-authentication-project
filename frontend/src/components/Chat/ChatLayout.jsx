import { useEffect, useState } from "react";

import useApi from "../../hooks/useApi";
import useChat from "../../hooks/useChat";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

import Spinner from "../Spinner/Spinner";
import Alert from "../Alert/Alert";
import chatService from "../../services/chatService";

import "./ChatLayout.css";

const ChatLayout = ({ onIncomingAudioCall }) => {
  const { request } = useApi();

  const chatApi = chatService(request);

  const {
    users,
    setUsers,

    conversations,
    setConversations,

    selectedConversation,
    setSelectedConversation,
  } = useChat();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  =====================================
  Load Conversations
  =====================================
  */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [conversationResult, usersResult] = await Promise.all([
        chatApi.getConversations(),
        chatApi.getUsers(),
      ]);

      if (conversationResult.success) {
        setConversations(conversationResult.data.conversations || []);
      }

      if (usersResult.success) {
        setUsers(usersResult.data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-layout-loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-layout-error">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <ConversationList />

      <ChatWindow onIncomingAudioCall={onIncomingAudioCall} />
    </div>
  );
};

export default ChatLayout;
