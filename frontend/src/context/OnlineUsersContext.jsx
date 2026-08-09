import { createContext, useEffect, useState } from "react";
import socket from "../socket/socket";

const OnlineUsersContext = createContext();

export const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenUsers, setLastSeenUsers] = useState({});

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };
    const handleInitialLastSeen = (data) => {
      console.log("🕒 Initial Last Seen:", data);

      setLastSeenUsers(data);
    };
    /*
    ==========================================
    User Comes Online
    ==========================================
    */

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => {
        if (prev.includes(userId)) {
          return prev;
        }

        return [...prev, userId];
      });

      // Remove old last seen
      setLastSeenUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];

        return updated;
      });
    };

    /*
    ==========================================
    User Goes Offline
    ==========================================
    */

    const handleUserLastSeen = ({ userId, lastSeen }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));

      setLastSeenUsers((prev) => ({
        ...prev,
        [userId]: lastSeen,
      }));
    };

    socket.on("online-users", handleOnlineUsers);

    socket.on("initial-last-seen", handleInitialLastSeen);

    socket.on("user-online", handleUserOnline);

    socket.on("user-last-seen", handleUserLastSeen);

    return () => {
      socket.off("online-users", handleOnlineUsers);

      socket.off("initial-last-seen", handleInitialLastSeen);

      socket.off("user-online", handleUserOnline);

      socket.off("user-last-seen", handleUserLastSeen);
    };
  }, []);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, lastSeenUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export default OnlineUsersContext;
