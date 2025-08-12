import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SunIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    defaultValues: {
      emailOrPhone: '',
      password: ''
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    console.log('🔍 LoginPage onSubmit called with data:', data);
    try {
      console.log('🔍 Calling AuthContext login function...');
      await login(data, 'installer');
      console.log('✅ Login successful in LoginPage!');
      toast.success('Login successful!');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('❌ Login error in LoginPage:', err);
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg bg-primary">
              <SunIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline touch-manipulation"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Welcome back</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your credentials to access your installer dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="emailOrPhone"
                  rules={{
                    required: 'Email or phone number is required'
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email or phone number"
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
                            placeholder="Enter your password"
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
                    'Sign in'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    ← Back to home
                  </Link>
                  <div>
                    <span className="text-sm text-muted-foreground">Don't have an account? </span>
                    <Link
                      to="/register"
                      className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                    >
                      Sign up here
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default LoginPage;
