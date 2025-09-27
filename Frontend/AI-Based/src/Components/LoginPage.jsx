import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

const GoogleIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.8 0 7.2 1.3 9.9 3.9l5.9-6C35.3 3.1 29.9 1 24 1 14.7 1 6.6 6.2 2.7 13.7l7.7 6c1.8-5.3 6.8-10.2 13.6-10.2Z" />
    <path fill="#34A853" d="M46.1 24.6c0-1.5-.1-2.6-.4-3.8H24v7.2h12.6c-.3 2.1-1.7 5.2-4.9 7.3l7.5 5.8c4.4-4.1 7-10 7-16.5Z" />
    <path fill="#FBBC05" d="M10.4 28.4A14.5 14.5 0 0 1 9.6 24c0-1.5.3-3 .8-4.4l-7.7-6A24 24 0 0 0 0 24c0 3.8.9 7.4 2.7 10.5l7.7-6Z" />
    <path fill="#4285F4" d="M24 47c6.5 0 12-2.1 16-5.8l-7.5-5.8c-2.1 1.4-4.9 2.4-8.5 2.4-6.8 0-12.5-4.6-14.6-10.9l-7.7 6C6.6 41.8 14.7 47 24 47Z" />
  </svg>
);

const LinkedInIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export function LoginPage({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      const { token } = response.data;
      if (!token) throw new Error("Login failed. No token returned.");

      // Store JWT token in localStorage
      localStorage.setItem("jwtToken", token);

      // Optional: decode token to get user info (or fetch from backend)
      onLogin?.({ email }, token);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Login failed. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Google login with backend integration
  const loginWithGoogle = useGoogleLogin({
    flow: "auth-code", // Changed from "implicit" to "auth-code"
    scope: "openid email profile",
    onSuccess: async (codeResponse) => {
      try {
        setIsGoogleLoading(true);
        setError("");

        // Send the authorization code to your backend
        const response = await axios.post("http://localhost:5000/auth/google", {
          code: codeResponse.code
        });

        const { token, message } = response.data;
        if (!token) throw new Error("Google login failed. No token returned.");

        // Store the JWT token from your backend
        localStorage.setItem("jwtToken", token);

        // Call onLogin callback
        onLogin?.({ provider: "google" }, token);

        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Google login error:", err);
        setError(
          err.response?.data?.error || "Google sign-in failed. Please try again."
        );
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google sign-in failed. Please try again.");
    },
  });

  const linkedInLogin = () => {
    const clientId = '86yjmxh0g4fzdk';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/linkedin/callback');
    // CORRECTED: Use OpenID Connect scopes
    const scope = encodeURIComponent('openid profile email');
    const state = Math.random().toString(36).substring(7);
    
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
   
    sessionStorage.setItem('linkedin_state', state);
    window.location.href = linkedInAuthUrl;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Link to="/landing-page">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img
              src="/favicon_1.png"
              alt="SkillSprint Logo"
              className="w-8 h-8 object-cover rounded-md"
            />
            <span className="ml-2 text-lg font-semibold">SkillSprint</span>
          </div>
        </div>
      </div>

      <Card className="border-border max-w-md mx-auto mt-8">
        <CardHeader className="space-y-1 text-center mb-2">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your SkillSprint account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isGoogleLoading}
                >
                  {!showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 mt-4">
            <div className="flex-1 h-px bg-border" />
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social buttons */}
          <Button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={isGoogleLoading || isLoading}
            className="mt-4 mb-3 w-full flex items-center justify-center gap-3 bg-primary text-white hover:opacity-90"
          >
            {isGoogleLoading ? "Connecting..." : <GoogleIcon className="h-5 w-5" />}
            <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
          </Button>

          <Button
            type="button"
            onClick={linkedInLogin}
            disabled={isGoogleLoading || isLoading}
            className="mt-3 w-full flex items-center justify-center gap-3 bg-[#0077B5] text-white hover:bg-[#005885]"
          >
            <LinkedInIcon className="h-5 w-5" />
            <span>Continue with LinkedIn</span>
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register">
                <Button variant="link" onClick={onRegister} className="p-0 h-auto font-normal text-primary hover:text-primary/80">
                  Create one here
                </Button>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}