const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("❌ Browser notifications are not supported.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  const permission = await Notification.requestPermission();

  return permission === "granted";
};

const showNotification = ({ title, message, conversationId }) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body: message,
    icon: "/favicon.ico",
    tag: conversationId || "chat-message",
  });

  notification.onclick = () => {
    window.focus();

    notification.close();

    window.dispatchEvent(
      new CustomEvent("open-chat-conversation", {
        detail: {
          conversationId,
        },
      }),
    );
  };

  return notification;
};

export { requestNotificationPermission, showNotification };
