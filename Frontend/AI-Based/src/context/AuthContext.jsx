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
        // First check for JWT token from LinkedIn/Google login
        const jwtToken = localStorage.getItem('jwtToken');
        if (jwtToken) {
          console.log('AuthContext: Found JWT token, using it');
          setAccessToken(jwtToken);
          // You might want to decode the JWT to get user info, or fetch user data
          setUser({ provider: 'linkedin' }); // Temporary user object
          setIsLoading(false);
          return;
        }

        // If no JWT token, check Supabase session
        const { user: sessionUser, accessToken: token } = await getCurrentSession();
        if (sessionUser && token) {
          console.log('AuthContext: Found Supabase session');
          setUser(sessionUser);
          setAccessToken(token);
        } else {
          console.log('AuthContext: No valid session found');
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

    // Store JWT token in localStorage for persistence
    if (token) {
      localStorage.setItem('jwtToken', token);
    }

    setIsLoading(false);
  };

  const logout = () => {

    setUser(null);
    setAccessToken(null);
    // Clear JWT token from localStorage
    localStorage.removeItem('jwtToken');
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