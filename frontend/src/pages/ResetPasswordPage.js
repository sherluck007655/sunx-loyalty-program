import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/authService';
import { mockStorageHelpers } from '../services/mockStorage';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');
  const userType = searchParams.get('type') || 'installer';
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, password);

      if (response.success) {
        // Update the password in localStorage for mock storage users
        if (email && userType === 'installer') {
          console.log('🔄 Updating password in localStorage for:', email);

          // Get all installers from localStorage
          const allInstallers = mockStorageHelpers.getAllInstallers();
          const installerIndex = allInstallers.findIndex(i => i.email.toLowerCase() === email.toLowerCase());

          if (installerIndex !== -1) {
            // Update the password
            allInstallers[installerIndex].password = password;

            // Save back to localStorage
            localStorage.setItem('sunx_mock_installers', JSON.stringify(allInstallers));
            console.log('✅ Password updated in localStorage for:', email);
          } else {
            console.log('❌ Installer not found in localStorage:', email);
          }
        }

        setResetSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(response.message || 'Failed to reset password');
        if (response.message?.includes('Invalid or expired')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-red-600 dark:text-red-400">⚠</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Password reset links expire after 1 hour for security reasons. 
                Please request a new password reset link.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Password Reset Successful!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can now log in with your new password.
              </p>
              <Button
                onClick={() => navigate(userType === 'admin' ? '/admin/login' : '/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary">S</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
