import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const storedState = sessionStorage.getItem('linkedin_state');
      const errorParam = searchParams.get('error');

      console.log('=== LinkedIn Callback Frontend Debug ===');
      console.log('Code:', code);
      console.log('State:', state);
      console.log('Stored state:', storedState);

      if (errorParam) {
        console.log('LinkedIn error:', errorParam);
        setError('LinkedIn authentication was cancelled or failed.');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!state || state !== storedState) {
        console.log('State mismatch - security check failed');
        setError('Security verification failed. Please try again.');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      sessionStorage.removeItem('linkedin_state');

      if (!code) {
        console.log('No authorization code received');
        setError('No authorization code received from LinkedIn.');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('Frontend: About to send code to backend...');
        
        const response = await axios.post('http://localhost:5000/auth/linkedin', {
          code: code
        });

        console.log('Frontend: Received response from backend:', response.data);

        const { token, user } = response.data;
        
        if (!token) {
          console.log('Frontend: No token in response');
          throw new Error('LinkedIn login failed. No token returned.');
        }

        console.log('Frontend: Token received, storing in localStorage...');
        localStorage.setItem('jwtToken', token);

        // Verify token was stored
        const storedToken = localStorage.getItem('jwtToken');
        console.log('Frontend: Token stored successfully:', storedToken ? 'YES' : 'NO');

        console.log('Frontend: About to navigate to dashboard...');
        
        // Use navigate to go to dashboard
        window.location.href = '/dashboard';
        
      } catch (err) {
        console.error('Frontend: LinkedIn callback error:', err);
        console.error('Frontend: Error response:', err.response?.data);
        setError(
          err.response?.data?.error || 'LinkedIn sign-in failed. Please try again.'
        );
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleLinkedInCallback();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Completing LinkedIn sign-in...</p>
          <p className="text-xs text-muted-foreground mt-2">Check console for debug info</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Sign-in Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
}