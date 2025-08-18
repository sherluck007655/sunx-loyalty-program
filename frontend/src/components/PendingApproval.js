import React from 'react';
import { 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const PendingApproval = ({ user }) => {
  const getStatusInfo = () => {
    switch (user?.status) {
      case 'pending':
        return {
          icon: ClockIcon,
          title: 'Account Pending Approval',
          message: 'Your account is currently under review by our admin team.',
          color: 'yellow',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'rejected':
        return {
          icon: ExclamationTriangleIcon,
          title: 'Account Rejected',
          message: 'Your account application has been rejected. Please contact support for more information.',
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: CheckCircleIcon,
          title: 'Account Approved',
          message: 'Your account is approved and active.',
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (user?.status === 'approved') {
    return null; // Don't show anything for approved users
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-6 text-center`}>
          <StatusIcon className={`h-16 w-16 ${statusInfo.iconColor} mx-auto mb-4`} />
          
          <h1 className={`text-xl font-semibold ${statusInfo.textColor} mb-2`}>
            {statusInfo.title}
          </h1>
          
          <p className={`${statusInfo.textColor} mb-6`}>
            {statusInfo.message}
          </p>

          <div className="space-y-4">
            <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg p-4`}>
              <h3 className={`text-sm font-medium ${statusInfo.textColor} mb-2`}>
                Account Information
              </h3>
              <div className="space-y-1 text-sm">
                <p className={statusInfo.textColor}>
                  <span className="font-medium">Name:</span> {user?.name}
                </p>
                <p className={statusInfo.textColor}>
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className={statusInfo.textColor}>
                  <span className="font-medium">Registered:</span> {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className={statusInfo.textColor}>
                  <span className="font-medium">Status:</span> 
                  <span className="capitalize ml-1">{user?.status}</span>
                </p>
              </div>
            </div>

            {user?.status === 'pending' && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-orange-600 dark:text-orange-300 space-y-1">
                  <li>• Admin will review your application</li>
                  <li>• You'll receive an email notification</li>
                  <li>• Once approved, you can start adding serial numbers</li>
                  <li>• You'll have access to all installer features</li>
                </ul>
              </div>
            )}

            {user?.status === 'rejected' && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Contact our support team for assistance:
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>📧 support@sunx.com</p>
                  <p>📞 +92-300-1234567</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
