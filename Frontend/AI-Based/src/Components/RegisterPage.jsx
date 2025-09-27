import React, { useState, useEffect } from "react";
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

const countries = [
  "Sri Lanka",
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Japan",
  "China",
  "Singapore",
];

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

export function RegisterPage({ onBack }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [validation, setValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manual registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // if any validation errors exist, show generic error
    if (Object.keys(validation).length > 0) {
      setError("Please enter valid data.");
      setIsSubmitting(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        formData
      );

      if (response.data && response.data.newUser) {
        // Registration successful move to login
        navigate("/login");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // Google registration/login
  const registerWithGoogle = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: async (codeResponse) => {
      try {
        setIsGoogleLoading(true);
        setError("");

        // Send the authorization code to your backend
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
          code: codeResponse.code
        });

        const { token, message, user } = response.data;
        if (!token) throw new Error("Google registration failed. No token returned.");

        // Store the JWT token from your backend
        localStorage.setItem("jwtToken", token);

        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Google registration error:", err);
        setError(
          err.response?.data?.error || "Google sign-up failed. Please try again."
        );
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google registration error:", error);
      setError("Google sign-up failed. Please try again.");
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

  // Form validation
  useEffect(() => {
    const newValidation = {};
    const { firstName, lastName, email, country, password, confirmPassword } =
      formData;

    if (firstName && (firstName.length < 2 || firstName.length > 50)) {
      newValidation.firstName =
        "First name must be between 2 and 50 characters.";
    }
    if (lastName && (lastName.length < 2 || lastName.length > 50)) {
      newValidation.lastName = "Last name must be between 2 and 50 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newValidation.email = "Please enter a valid email address.";
    }
    if (isSubmitting && !country) {
      newValidation.country = "Please select a country.";
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (password && !passwordRegex.test(password)) {
      newValidation.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    if (confirmPassword && confirmPassword !== password) {
      newValidation.confirmPassword = "Passwords do not match.";
    }

    setValidation(newValidation);
  }, [formData, isSubmitting]);

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Back button */}
        <div className="mb-4">
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

        <Card className="border-border">
          <CardHeader className="space-y-1 text-center mb-2">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Start your AI-powered career journey today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    disabled={isLoading || isGoogleLoading}
                  />
                  {validation.firstName && (
                    <p className="text-red-500 text-xs">
                      {validation.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    disabled={isLoading || isGoogleLoading}
                  />
                  {validation.lastName && (
                    <p className="text-red-500 text-xs">
                      {validation.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
                  disabled={isLoading || isGoogleLoading}
                />
                {validation.email && (
                  <p className="text-red-500 text-xs">{validation.email}</p>
                )}
              </div>

              {/* Country dropdown */}
              <div className="space-y-2">
                <Label>
                  Country <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    disabled={isLoading || isGoogleLoading}
                  >
                    <option value="">Select a country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {validation.country && (
                  <p className="text-red-500 text-xs">{validation.country}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    disabled={isLoading || isGoogleLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {!showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {validation.password && (
                  <p className="text-red-500 text-xs">{validation.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    disabled={isLoading || isGoogleLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    disabled={isLoading || isGoogleLoading}
                  >
                    {!showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {validation.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {validation.confirmPassword}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isGoogleLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6 mt-4">
              <div className="flex-1 h-px bg-border" />
              <span className="px-3 text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social login buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => registerWithGoogle()}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 bg-primary text-white hover:opacity-90"
              >
                {isGoogleLoading ? "Connecting..." : <GoogleIcon className="h-5 w-5" />}
                <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
              </Button>

              <Button
                type="button"
                onClick={linkedInLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#0077B5] text-white hover:bg-[#005885]"
              >
                <LinkedInIcon className="h-5 w-5" />
                <span>Continue with LinkedIn</span>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-primary"
                  >
                    Sign in
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}