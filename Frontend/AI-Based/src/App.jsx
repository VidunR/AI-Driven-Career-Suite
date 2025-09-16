import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google"; 

import { LandingPage } from "./Components/LandingPage";
import { LoginPage } from "./Components/LoginPage";
import { RegisterPage } from "./Components/RegisterPage";
import { Dashboard } from "./Components/Dashboard";
import { AppLayout } from "./Components/Layout/AppLayout.jsx";
import { CVManager } from "./Components/CVManager";
import { CVBuilder } from "./Components/CVBuilder";
import JobSearch from "./Components/JobSearch";
import { MockInterviewSetup } from "./Components/MockInterviewSetup";
import { MockInterviewSession } from "./Components/MockInterviewSession";
import { InterviewResults } from "./Components/InterviewResults";
import { InterviewHistory } from "./Components/InterviewHistory";
import { Leaderboard } from "./Components/Leaderboard";
import { Profile } from "./Components/Profile";
import { Settings } from "./Components/Settings";
import { Help } from "./components/Help";
import { getCurrentSession } from "./utils/supabase/client";
import { AboutUs } from "./Components/AboutUs.jsx";
import { Careers } from "./Components/Careers.jsx";
import { Contact } from "./Components/Contact.jsx";
import { Blog } from "./Components/Blog.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1047448707893-msp6f7akm0ltjnocc9jtpkm686188j89.apps.googleusercontent.com";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading AI Career Suite...</p>
        </div>
      </div>
    );
  }

  // Wrapper to protect routes
  const ProtectedRoute = ({ children }) => {
    if (!user || !accessToken) {
      return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />;
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="about-us" element={<AboutUs />} />
          <Route path="careers" element={<Careers />} />
          <Route path="contact" element={<Contact />} />
          <Route path="blog" element={<Blog />} />
          <Route path="/" element={<LandingPage />} />
          {/* Optional alias so /landing-page links don’t 404 before redirect */}
          <Route path="landing-page" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={(u, t) => {
                  setUser(u);
                  setAccessToken(t);
                }}
              />
            }
          />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <AppLayout
                  user={user}
                  onLogout={() => {
                    setUser(null);
                    setAccessToken(null);
                  }}
                />
              }
            >
              <Route
                path="dashboard"
                element={<Dashboard user={user} accessToken={accessToken} />}
              />
              <Route
                path="cv-manager"
                element={<CVManager user={user} accessToken={accessToken} />}
              />
              <Route
                path="cv-builder"
                element={<CVBuilder user={user} accessToken={accessToken} />}
              />
              <Route
                path="job-search"
                element={<JobSearch user={user} accessToken={accessToken} />}
              />
              <Route
                path="mock-interview-setup"
                element={
                  <MockInterviewSetup user={user} accessToken={accessToken} />
                }
              />
              <Route
                path="mock-interview-session"
                element={
                  <MockInterviewSession user={user} accessToken={accessToken} />
                }
              />
              <Route
                path="interview-results"
                element={
                  <InterviewResults user={user} accessToken={accessToken} />
                }
              />
              <Route
                path="interview-history"
                element={
                  <InterviewHistory user={user} accessToken={accessToken} />
                }
              />
              <Route
                path="leaderboard"
                element={<Leaderboard user={user} accessToken={accessToken} />}
              />
              <Route
                path="profile"
                element={<Profile user={user} accessToken={accessToken} />}
              />
              <Route
                path="settings"
                element={<Settings user={user} accessToken={accessToken} />}
              />
              <Route
                path="help"
                element={<Help user={user} accessToken={accessToken} />}
              />
            </Route>
          </Route>

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}
