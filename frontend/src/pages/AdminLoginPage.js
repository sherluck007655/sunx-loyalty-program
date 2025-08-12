import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SunIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading, error, clearError, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && userType === 'admin') {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, userType, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      await login(data, 'admin');
      toast.success('Admin login successful!');
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <ShieldCheckIcon className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administrator Access</CardTitle>
            <CardDescription>
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your admin email"
                          autoComplete="username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: 'Password is required'
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your admin password"
                            autoComplete="current-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3">
                    <div className="text-sm text-destructive">
                      {error}
                    </div>
                  </div>
                )}

                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || loading}
                  className="w-full"
                >
                  {form.formState.isSubmitting || loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Sign in as Admin'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    Installer Login
                  </Link>
                  <br />
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    ← Back to home
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>



        {/* Security notice */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex">
            <ShieldCheckIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5 dark:text-yellow-400" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Security Notice:</strong> Admin access is restricted and monitored.
              All activities are logged for security purposes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
