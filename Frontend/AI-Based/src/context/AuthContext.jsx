import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentSession } from "../utils/supabase/client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user: sessionUser, accessToken: token } =
          await getCurrentSession();
        if (sessionUser && token) {
          setUser(sessionUser);
          setAccessToken(token);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
