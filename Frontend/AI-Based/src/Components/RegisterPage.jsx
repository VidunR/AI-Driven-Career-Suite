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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
        "http://localhost:5000/auth/register",
        formData
      );

      if (response.data && response.data.newUser) {
        // Registration successful → move to login
        navigate("/login");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

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
          <Link to="./landing-page">
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
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

              <Button type="submit" className="w-full" disabled={isLoading}>
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
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white hover:opacity-90"
                onClick={() => console.log("Google login")}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 w-5 bg-white rounded-sm"
                />
                Google
              </Button>

              <Button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white hover:opacity-90"
                onClick={() => console.log("LinkedIn login")}
              >
                <img
                  src="https://www.svgrepo.com/show/448234/linkedin.svg"
                  alt="LinkedIn"
                  className="h-5 w-5 bg-white rounded-sm"
                />
                LinkedIn
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
