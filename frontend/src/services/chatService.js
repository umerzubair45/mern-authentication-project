const chatService = (request) => {
  const getUsers = () =>
    request({
      url: "/api/users",
      method: "GET",
      showSuccessToast: false,
    });

  const getConversations = () =>
    request({
      url: "/api/conversations",
      method: "GET",
      showSuccessToast: false,
    });

  const getMessages = (conversationId) =>
    request({
      url: `/api/messages/${conversationId}`,
      method: "GET",
      showSuccessToast: false,
    });
  const resetUnread = (conversationId) =>
    request({
      url: `/api/conversations/${conversationId}/unread`,
      method: "PATCH",
      showSuccessToast: false,
    });

  return {
    getUsers,
    getConversations,
    getMessages,
    resetUnread,
  };
};

export default chatService;
