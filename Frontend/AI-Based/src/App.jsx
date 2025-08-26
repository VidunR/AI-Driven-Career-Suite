import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { Dashboard } from "./components/Dashboard";
import { AppLayout } from "./components/Layout/AppLayout.jsx";
import { CVManager } from "./components/CVManager";
import { CVBuilder } from "./components/CVBuilder";
import { JobSearch } from "./components/JobSearch";
import { MockInterviewSetup } from "./components/MockInterviewSetup";
import { MockInterviewSession } from "./components/MockInterviewSession";
import { InterviewResults } from "./components/InterviewResults";
import { InterviewHistory } from "./components/InterviewHistory";
import { Leaderboard } from "./components/Leaderboard";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { Help } from "./components/Help";
import { getCurrentSession } from "./utils/supabase/client";

export default function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { user: sessionUser, accessToken: token } = await getCurrentSession();
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
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={(u, t) => { setUser(u); setAccessToken(t); }} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout user={user} onLogout={() => { setUser(null); setAccessToken(null); }} />}>
            <Route path="dashboard" element={<Dashboard user={user} accessToken={accessToken} />} />
            <Route path="cv-manager" element={<CVManager user={user} accessToken={accessToken} />} />
            <Route path="cv-builder" element={<CVBuilder user={user} accessToken={accessToken} />} />
            <Route path="job-search" element={<JobSearch user={user} accessToken={accessToken} />} />
            <Route path="mock-interview-setup" element={<MockInterviewSetup user={user} accessToken={accessToken} />} />
            <Route path="mock-interview-session" element={<MockInterviewSession user={user} accessToken={accessToken} />} />
            <Route path="interview-results" element={<InterviewResults user={user} accessToken={accessToken} />} />
            <Route path="interview-history" element={<InterviewHistory user={user} accessToken={accessToken} />} />
            <Route path="leaderboard" element={<Leaderboard user={user} accessToken={accessToken} />} />
            <Route path="profile" element={<Profile user={user} accessToken={accessToken} />} />
            <Route path="settings" element={<Settings user={user} accessToken={accessToken} />} />
            <Route path="help" element={<Help user={user} accessToken={accessToken} />} />
          </Route>
        </Route>

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
