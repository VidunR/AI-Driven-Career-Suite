import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Eye, EyeOff, Users } from "lucide-react";
import { signIn } from "../utils/supabase/client";
import { toast } from "sonner";

export function LoginPage({ onLogin, onRegister, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const {
        user,
        accessToken,
        error: loginError,
      } = await signIn(email, password);

      if (loginError) {
        throw new Error(loginError.message);
      }

      if (user && accessToken) {
        onLogin(user, accessToken);
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Login failed - no user data received");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button at very top-left */}
      <div className="p-4">
        <Link to="/landing-page">
          <Button variant="ghost" size="sm" onClick={onBack}
            className="inline-flex items-center gap-2 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Header stays centered */}
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

      
        {/* Login Card */}
        <Card className="border-border max-w-md mx-auto mt-8">
          <CardHeader className="space-y-1 text-center mb-2">
            <CardTitle className="text-2xl font-bold ">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your SkillSprint account
            </CardDescription>
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
                  disabled={isLoading}
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
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register">
                  <Button
                    variant="link"
                    onClick={onRegister}
                    className="p-0 h-auto font-normal text-primary hover:text-primary/80"
                  >
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
