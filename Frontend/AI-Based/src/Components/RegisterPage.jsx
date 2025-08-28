import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Eye, EyeOff, Users } from 'lucide-react';
import { signUp } from '../utils/supabase/client';
import { toast } from 'sonner';

export function RegisterPage({ onRegister, onLogin, onBack }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return 'Please fill in all fields';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const { user, error: signUpError } = await signUp(fullName, formData.email, formData.password);
      
      if (signUpError) {
        throw new Error(signUpError);
      }

      if (user) {
        // For registration, we'll simulate a successful login with mock data
        const userData = {
          id: user.id,
          name: fullName,
          email: formData.email,
          cvCount: 0,
          interviewCount: 0
        };
        const mockToken = 'mock_access_token';
        onRegister(userData, mockToken);
      } else {
        throw new Error('Registration failed - no user data received');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-background p-4">
    {/* Back button in the top-left corner */}
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
      {/* Header */}
      <div className="text-center mb-8">        
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 mb-4 rounded-lg flex items-center justify-center">
              <img
                src="/favicon_1.png"
                alt="SkillSprint Logo"
                className="w-8 h-8 object-cover rounded-md mb-2"
              />
            <span className="ml-2 text-lg font-semibold">SkillSprint</span>
          </div>
            
        </div>
      </div>

    </div>

    <div className=" bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        

        {/* Registration Card */}
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
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login">
                  <Button
                    variant="link"
                    onClick={onLogin}
                    className="p-0 h-auto font-normal text-primary hover:text-primary/80"
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
  </div>
 );
}