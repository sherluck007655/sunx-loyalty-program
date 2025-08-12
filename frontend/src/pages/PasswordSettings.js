import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PasswordUpdate from '../components/PasswordUpdate';
import { KeyIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

const PasswordSettings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState('installer');

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem('sunx_current_user');
    const adminUser = localStorage.getItem('sunx_admin_user');
    
    if (adminUser) {
      const admin = JSON.parse(adminUser);
      setCurrentUser(admin);
      setUserType('admin');
    } else if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserType('installer');
    }
  }, []);

  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Please log in to access password settings
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Password & Security
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account password and security settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Password Update Form */}
          <div className="lg:col-span-2">
            <PasswordUpdate
              userType={userType}
              userId={currentUser.id}
              userEmail={currentUser.email}
            />
          </div>

          {/* Security Information */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Account Information
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {userType}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {currentUser.email}
                    </p>
                  </div>
                  {currentUser.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {currentUser.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <KeyIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Security Tips
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p>Use a unique password that you don't use elsewhere</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p>Make your password at least 8 characters long</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p>Include a mix of letters, numbers, and symbols</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p>Don't share your password with anyone</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p>Update your password regularly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Password Update */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Password History
                    </h3>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Last updated: {currentUser.passwordUpdatedAt 
                      ? new Date(currentUser.passwordUpdatedAt).toLocaleDateString()
                      : 'Never updated'
                    }
                  </p>
                  <p className="mt-2">
                    For security reasons, we recommend updating your password every 90 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PasswordSettings;
