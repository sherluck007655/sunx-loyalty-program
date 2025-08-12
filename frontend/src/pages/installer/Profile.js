import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  UserIcon,
  CreditCardIcon,
  IdentificationIcon,
  MapPinIcon,
  BoltIcon,
  TrophyIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import PasswordUpdate from '../../components/PasswordUpdate';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { installerService } from '../../services/installerService';
import { formatLoyaltyCardId, formatPhoneNumber, formatCNIC } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Badge } from '../../components/ui/badge';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Fetch real-time dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const response = await installerService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      accountType: user?.accountType || 'individual',
      loyaltyCardId: user?.loyaltyCardId || ''
    }
  });

  const {
    register: registerPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors, isSubmitting: isPaymentSubmitting }
  } = useForm({
    defaultValues: {
      accountTitle: user?.bankDetails?.accountTitle || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      bankName: user?.bankDetails?.bankName || '',
      branchCode: user?.bankDetails?.branchCode || ''
    }
  });

  const {
    register: registerLoyaltyCard,
    handleSubmit: handleLoyaltyCardSubmit,
    formState: { errors: loyaltyCardErrors, isSubmitting: isLoyaltyCardSubmitting },
    setError: setLoyaltyCardError
  } = useForm({
    defaultValues: {
      loyaltyCardId: user?.loyaltyCardId || ''
    }
  });

  const onProfileSubmit = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      updateUser(response.data.installer);
      toast.success('Profile updated successfully!');
      fetchDashboardData(); // Refresh real-time data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onLoyaltyCardSubmit = async (data) => {
    try {
      // Validate loyalty card format
      const cardId = data.loyaltyCardId.toUpperCase();
      if (!cardId.match(/^SUNX-\d{6}$/)) {
        setLoyaltyCardError('loyaltyCardId', {
          type: 'manual',
          message: 'Loyalty card must be in format SUNX-000001'
        });
        return;
      }

      // Check for duplicates
      const response = await authService.updateLoyaltyCard({ loyaltyCardId: cardId });
      updateUser(response.data.installer);
      toast.success('Loyalty card updated successfully!');
      fetchDashboardData(); // Refresh real-time data
    } catch (error) {
      if (error.response?.status === 409) {
        setLoyaltyCardError('loyaltyCardId', {
          type: 'manual',
          message: 'This loyalty card is already registered to another account'
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to update loyalty card');
      }
    }
  };

  const onPaymentSubmit = async (data) => {
    try {
      const response = await authService.updatePaymentProfile(data);
      updateUser({ bankDetails: response.data.bankDetails });
      toast.success('Payment profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment profile');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'loyalty', name: 'Loyalty Card', icon: IdentificationIcon },
    { id: 'payment', name: 'Payment Details', icon: CreditCardIcon },
    { id: 'password', name: 'Password & Security', icon: KeyIcon }
  ];

  return (
    <Layout title="Profile">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.name}
                </h1>
                <p className="text-muted-foreground">
                  Loyalty Card: {formatLoyaltyCardId(user?.loyaltyCardId)}
                </p>
                <div className="flex items-center mt-2 space-x-4 text-sm">
                  {loadingDashboard ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center text-muted-foreground">
                        <BoltIcon className="h-4 w-4 mr-1" />
                        <span>{dashboardData?.stats?.totalInverters || 0} Inverters</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        <span>{dashboardData?.stats?.totalPoints || 0} Points</span>
                      </div>
                      {dashboardData?.stats?.isEligibleForPayment && (
                        <Badge variant="success">
                          Eligible for Payment
                        </Badge>
                      )}
                      {dashboardData?.stats?.milestones && (
                        <div className="flex items-center text-muted-foreground">
                          <span>{dashboardData.stats.milestones.completed} Milestones</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Additional Profile Info */}
                <div className="flex items-center mt-3 space-x-4 text-xs text-gray-400">
                  {user?.city && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      <span>{user.city}</span>
                    </div>
                  )}
                  {user?.accountType && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {user.accountType === 'individual' ? 'Individual' : 'Business'} Account
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    Member since {new Date(user?.joinedAt || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
                  <tab.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...registerProfile('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        type="text"
                      />
                      {profileErrors.name && (
                        <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...registerProfile('phone', {
                          required: 'Phone number is required'
                        })}
                        type="tel"
                      />
                      {profileErrors.phone && (
                        <p className="text-sm text-destructive">{profileErrors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnic">CNIC</Label>
                      <Input
                        id="cnic"
                        type="text"
                        value={formatCNIC(user?.cnic) || ''}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">CNIC cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...registerProfile('city', {
                          required: 'City is required',
                          minLength: { value: 2, message: 'City must be at least 2 characters' }
                        })}
                        type="text"
                      className="form-input"
                      placeholder="Enter your city"
                    />
                    {profileErrors.city && (
                      <p className="form-error">{profileErrors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Account Type</label>
                    <select
                      {...registerProfile('accountType', {
                        required: 'Account type is required'
                      })}
                      className="form-input"
                    >
                      <option value="individual">Individual Account</option>
                      <option value="business">Business Account</option>
                    </select>
                    {profileErrors.accountType && (
                      <p className="form-error">{profileErrors.accountType.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    {...registerProfile('address', {
                      required: 'Address is required',
                      minLength: { value: 10, message: 'Address must be at least 10 characters' }
                    })}
                    rows={3}
                    className="form-input"
                  />
                  {profileErrors.address && (
                    <p className="form-error">{profileErrors.address.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isProfileSubmitting}
                    className="btn-primary"
                  >
                    {isProfileSubmitting ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="loyalty" className="mt-6">
              <CardHeader>
                <CardTitle>Loyalty Card</CardTitle>
                <CardDescription>
                  Add or update your SunX loyalty card number.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoyaltyCardSubmit(onLoyaltyCardSubmit)} className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                    Loyalty Card Management
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    Add or update your SunX loyalty card number. Each card can only be registered to one account.
                  </p>
                </div>

                <div className="max-w-md">
                  <label className="form-label">Loyalty Card Number</label>
                  <input
                    {...registerLoyaltyCard('loyaltyCardId', {
                      required: 'Loyalty card number is required',
                      pattern: {
                        value: /^SUNX-\d{6}$/i,
                        message: 'Loyalty card must be in format SUNX-000001'
                      }
                    })}
                    type="text"
                    className="form-input"
                    placeholder="SUNX-000001"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {loyaltyCardErrors.loyaltyCardId && (
                    <p className="form-error">{loyaltyCardErrors.loyaltyCardId.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Format: SUNX-XXXXXX (e.g., SUNX-000001)
                  </p>
                </div>

                {user?.loyaltyCardId && (
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Current Loyalty Card
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {formatLoyaltyCardId(user.loyaltyCardId)}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Registered on {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Important Notes
                  </h4>
                  <ul className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
                    <li>• Each loyalty card can only be registered to one account</li>
                    <li>• Duplicate registrations are not allowed</li>
                    <li>• Contact support if you need to transfer a card</li>
                    <li>• Card format must be exactly SUNX-XXXXXX</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoyaltyCardSubmitting}
                    className="btn-primary"
                  >
                    {isLoyaltyCardSubmitting ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      user?.loyaltyCardId ? 'Update Loyalty Card' : 'Add Loyalty Card'
                    )}
                  </button>
                </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Update your bank account information for payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit(onPaymentSubmit)} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Payment Information
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Add your bank details to receive payments when you reach milestones or complete promotions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Account Title</label>
                    <input
                      {...registerPayment('accountTitle', {
                        required: 'Account title is required'
                      })}
                      type="text"
                      className="form-input"
                      placeholder="Account holder name"
                    />
                    {paymentErrors.accountTitle && (
                      <p className="form-error">{paymentErrors.accountTitle.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Account Number</label>
                    <input
                      {...registerPayment('accountNumber', {
                        required: 'Account number is required'
                      })}
                      type="text"
                      className="form-input"
                      placeholder="Bank account number"
                    />
                    {paymentErrors.accountNumber && (
                      <p className="form-error">{paymentErrors.accountNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Bank Name</label>
                    <input
                      {...registerPayment('bankName', {
                        required: 'Bank name is required'
                      })}
                      type="text"
                      className="form-input"
                      placeholder="e.g., HBL, UBL, MCB"
                    />
                    {paymentErrors.bankName && (
                      <p className="form-error">{paymentErrors.bankName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Branch Code (Optional)</label>
                    <input
                      {...registerPayment('branchCode')}
                      type="text"
                      className="form-input"
                      placeholder="Branch code"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPaymentSubmitting}
                    className="btn-primary"
                  >
                    {isPaymentSubmitting ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      'Update Payment Details'
                    )}
                  </button>
                </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Update your password and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <PasswordUpdate
                    userType="installer"
                    userId={user?.id}
                    userEmail={user?.email}
                  />
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
