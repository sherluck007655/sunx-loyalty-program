import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BoltIcon,
  GiftIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: ClockIcon },
    { value: 'user_registration', label: 'User Registrations', icon: UsersIcon },
    { value: 'payment_request', label: 'Payment Requests', icon: CurrencyDollarIcon },
    { value: 'payment_approved', label: 'Payment Approvals', icon: CurrencyDollarIcon },
    { value: 'serial_submission', label: 'Serial Submissions', icon: BoltIcon },
    { value: 'promotion_created', label: 'Promotions', icon: GiftIcon },
    { value: 'comment_added', label: 'Comments', icon: ChatBubbleLeftIcon },
    { value: 'system_action', label: 'System Actions', icon: DocumentTextIcon }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    fetchActivities();
  }, [filter, dateRange]);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      // Generate real activities from actual system data
      const realActivities = await generateRealActivities();

      // Filter by selected type
      let filteredActivities = filter === 'all'
        ? realActivities
        : realActivities.filter(activity => activity.type === filter);

      // Apply search filter
      if (searchTerm) {
        filteredActivities = filteredActivities.filter(activity =>
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.user.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply date range filter
      if (dateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        filteredActivities = filteredActivities.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          switch (dateRange) {
            case 'today':
              return activityDate >= today;
            case 'yesterday':
              return activityDate >= yesterday && activityDate < today;
            case 'week':
              return activityDate >= weekStart;
            case 'month':
              return activityDate >= monthStart;
            default:
              return true;
          }
        });
      }

      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const generateRealActivities = async () => {
    const activities = [];

    try {
      // Import mockStorageHelpers to get real data
      const { mockStorageHelpers } = await import('../../services/mockStorage');

      // Get real data from the system
      const installers = mockStorageHelpers.getAllInstallers();
      const serials = mockStorageHelpers.getAllSerials(1, 100);
      const payments = mockStorageHelpers.getPayments(1, 100);
      const promotions = mockStorageHelpers.getAllPromotions();

      // Generate activities from installer registrations
      installers.forEach(installer => {
        activities.push({
          id: `reg-${installer.id}`,
          type: 'user_registration',
          title: 'New User Registration',
          description: `${installer.name} registered as a new installer`,
          user: installer.name,
          userEmail: installer.email,
          timestamp: installer.joinedAt || new Date().toISOString(),
          metadata: {
            city: installer.city || 'Not specified',
            loyaltyCardId: installer.loyaltyCardId,
            status: installer.status
          }
        });
      });

      // Generate activities from serial submissions
      serials.serials.forEach(serial => {
        const installer = installers.find(i => i.id === serial.installer?.id);
        if (installer) {
          activities.push({
            id: `serial-${serial.id}`,
            type: 'serial_submission',
            title: 'Serial Number Submitted',
            description: `Serial number ${serial.serialNumber} submitted for validation`,
            user: installer.name,
            userEmail: installer.email,
            timestamp: serial.createdAt || new Date().toISOString(),
            metadata: {
              serialNumber: serial.serialNumber,
              inverterModel: serial.inverterModel || 'SunX Inverter',
              location: serial.location
            }
          });
        }
      });

      // Generate activities from payment requests
      payments.payments.forEach(payment => {
        const installer = installers.find(i => i.id === payment.installer?.id);
        if (installer) {
          activities.push({
            id: `payment-${payment.id}`,
            type: 'payment_request',
            title: 'Payment Request Submitted',
            description: `Payment request for PKR ${payment.amount.toLocaleString()} submitted`,
            user: installer.name,
            userEmail: installer.email,
            timestamp: payment.createdAt || new Date().toISOString(),
            metadata: {
              amount: payment.amount,
              paymentMethod: payment.paymentMethod || 'bank_transfer',
              status: payment.status
            }
          });

          // Add payment approval activities if approved
          if (payment.status === 'approved' || payment.status === 'paid') {
            activities.push({
              id: `approval-${payment.id}`,
              type: 'payment_approved',
              title: 'Payment Approved',
              description: `Payment request #${payment.id} approved by admin`,
              user: 'Admin User',
              userEmail: 'admin@sunx.com',
              timestamp: payment.updatedAt || payment.createdAt || new Date().toISOString(),
              metadata: {
                amount: payment.amount,
                paymentId: payment.id,
                installerName: installer.name
              }
            });
          }
        }
      });

      // Generate activities from promotions
      promotions.forEach(promotion => {
        activities.push({
          id: `promo-${promotion.id}`,
          type: 'promotion_created',
          title: 'Promotion Created',
          description: `New promotion "${promotion.title}" created`,
          user: 'Admin User',
          userEmail: 'admin@sunx.com',
          timestamp: promotion.createdAt || new Date().toISOString(),
          metadata: {
            promotionTitle: promotion.title,
            rewardAmount: promotion.rewards?.amount || 0,
            status: promotion.status
          }
        });
      });

      // Add system activities only if there's actual data
      if (installers.length > 0 || serials.serials.length > 0 || payments.payments.length > 0) {
        activities.push({
          id: 'system-status',
          type: 'system_action',
          title: 'System Status Update',
          description: `System running with ${installers.length} installers, ${serials.serials.length} serial numbers, and ${payments.payments.length} payments`,
          user: 'System',
          userEmail: 'system@sunx.com',
          timestamp: new Date().toISOString(),
          metadata: {
            totalUsers: installers.length,
            totalSerials: serials.serials.length,
            totalPayments: payments.payments.length
          }
        });
      }

      // Sort activities by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('✅ Generated real activities:', activities.length);
      return activities;

    } catch (error) {
      console.error('❌ Error generating real activities:', error);
      return [];
    }
  };

  // Remove the old mock activities array - replaced with real data generation



  const refreshActivities = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
    toast.success('Activities refreshed');
  };

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type);
    return activityType ? activityType.icon : ClockIcon;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'payment_request':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'payment_approved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'serial_submission':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'promotion_created':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      case 'comment_added':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      case 'system_action':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return formatDate(timestamp);
  };

  return (
    <Layout title="Recent Activities">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Recent Activities
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Monitor system activities and user actions
            </p>
          </div>
          
          <button
            onClick={refreshActivities}
            disabled={refreshing}
            className="btn-outline flex items-center"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Activity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Type
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-select"
                >
                  {activityTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="form-select"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="card">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activities ({activities.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No activities found for the selected filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const colorClasses = getActivityColor(activity.type);

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(activity.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {activity.description}
                        </p>

                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{activity.user}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.userEmail}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>

                        {/* Activity Metadata */}
                        {activity.metadata && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                              >
                                <span className="font-medium capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span className="ml-1">
                                  {(() => {
                                    if (typeof value === 'number' && key.includes('amount')) {
                                      return formatCurrency(value);
                                    }
                                    if (typeof value === 'object' && value !== null) {
                                      // Handle location objects specifically
                                      if (key === 'location' && value.address && value.city) {
                                        return `${value.address}, ${value.city}`;
                                      }
                                      // Handle other objects
                                      return JSON.stringify(value);
                                    }
                                    return String(value || 'N/A');
                                  })()}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Button (for future pagination) */}
            {activities.length > 0 && (
              <div className="text-center mt-6">
                <button className="btn-outline">
                  Load More Activities
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Activities;
