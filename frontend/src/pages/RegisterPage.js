import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SunIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateEmail, validatePhone, validateCNIC } from '../utils/validators';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      cnic: '',
      address: ''
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      // Clear any previous errors
      clearError();

      console.log('🚀 Submitting registration:', { ...data, password: '[HIDDEN]' });

      const response = await registerUser(data);

      if (response.success) {
        toast.success(response.message || 'Registration successful! Your account is pending admin approval.');
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Registration failed';
      toast.error(errorMessage);

      // Reset form if email already exists
      if (errorMessage.toLowerCase().includes('email already registered')) {
        form.reset();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <SunIcon className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Join SunX Loyalty Program</CardTitle>
            <CardDescription>
              Create your installer account to start earning rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  rules={{
                    required: 'Phone number is required',
                    validate: (value) => validatePhone(value) || 'Please enter a valid phone number'
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="03001234567 or +923001234567"
                          autoComplete="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnic"
                  rules={{
                    required: 'CNIC is required',
                    validate: (value) => validateCNIC(value) || 'Please enter a valid CNIC (12345-1234567-1)'
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345-1234567-1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  rules={{
                    required: 'Address is required',
                    minLength: {
                      value: 10,
                      message: 'Address must be at least 10 characters'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your complete address"
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
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a secure password"
                            autoComplete="new-password"
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

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || loading}
                  className="w-full"
                >
                  {form.formState.isSubmitting || loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center">
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

        {/* Terms notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
