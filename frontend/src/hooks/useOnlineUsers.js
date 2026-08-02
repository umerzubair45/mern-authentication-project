import { useContext } from "react";
import OnlineUsersContext from "../context/OnlineUsersContext";

const useOnlineUsers = () => {
  return useContext(OnlineUsersContext);
};

export default useOnlineUsers;
