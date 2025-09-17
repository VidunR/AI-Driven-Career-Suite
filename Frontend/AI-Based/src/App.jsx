import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";

// Public pages
import { LandingPage } from "./Components/LandingPage";
import { LoginPage } from "./Components/LoginPage";
import { RegisterPage } from "./Components/RegisterPage";
import { AboutUs } from "./Components/AboutUs.jsx";
import { Careers } from "./Components/Careers.jsx";
import { Contact } from "./Components/Contact.jsx";
import { Blog } from "./Components/Blog.jsx";

// Protected pages/layout
import { AppLayout } from "./Components/Layout/AppLayout.jsx";
import { Dashboard } from "./Components/Dashboard";
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

export default function App() {
  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "1047448707893-msp6f7akm0ltjnocc9jtpkm686188j89.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing-page" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="cv-manager" element={<CVManager />} />
                <Route path="cv-builder" element={<CVBuilder />} />
                <Route path="job-search" element={<JobSearch />} />
                <Route path="mock-interview-setup" element={<MockInterviewSetup />} />
                <Route path="mock-interview-session" element={<MockInterviewSession />} />
                <Route path="interview-results" element={<InterviewResults />} />
                <Route path="interview-history" element={<InterviewHistory />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
