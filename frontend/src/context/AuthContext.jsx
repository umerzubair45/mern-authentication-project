import { createContext, useEffect, useState } from "react";
import useApi from "../hooks/useApi";

import { sendHello } from "../socket/emitEvents";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../socket/socketManager";
import useOnlineUsers from "../hooks/useOnlineUsers";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setOnlineUsers } = useOnlineUsers();
  const { request } = useApi();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !user) return;

    connectSocket({
      token,
      userName: user.userName,
      setOnlineUsers,
    });

    return () => {
      disconnectSocket({
        setOnlineUsers,
      });
    };
  }, [user]);
  // Login Function
  const login = (userData, accessToken) => {
    localStorage.setItem("token", accessToken);

    connectSocket({
      token: accessToken,
      userName: userData.userName,
      setOnlineUsers,
    });

    setUser(userData);

    navigate(userData.role === "admin" ? "/admin" : "/dashboard");
  };

  // Logout Function
  const logout = async () => {
    try {
      await request({
        url: "/api/auth/logout",
        method: "POST",
        showSuccessToast: false,
        retry: false,
      });
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      // Always clear frontend authentication
      localStorage.removeItem("token");
      disconnectSocket({
        setOnlineUsers,
      });
      setUser(null);

      navigate("/login");
    }
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const result = await request({
        url: "/api/auth/profile",
        method: "GET",
        showSuccessToast: false,
      });

      if (result?.success) {
        setUser(result.data.userData);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Check Auth Error:", error);

      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
