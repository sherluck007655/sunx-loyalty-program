import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BoltIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [systemAnalytics, setSystemAnalytics] = useState(null);
  const [businessAnalytics, setBusinessAnalytics] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [systemResponse, businessResponse, timeSeriesResponse] = await Promise.all([
        adminService.getSystemAnalytics(),
        adminService.getBusinessAnalytics(),
        adminService.getTimeSeriesAnalytics(timeRange)
      ]);
      
      setSystemAnalytics(systemResponse.data);
      setBusinessAnalytics(businessResponse.data);
      setTimeSeriesData(timeSeriesResponse.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend.direction === 'up') {
      return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    } else if (trend.direction === 'down') {
      return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
    }
    return <MinusIcon className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (direction) => {
    if (direction === 'up') return 'text-green-600';
    if (direction === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <Layout title="System Analytics">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="System Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              System Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Monitor system performance and business insights
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Range:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="form-select text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Analytics
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Insights
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Activity
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && systemAnalytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UsersIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(systemAnalytics.userActivity.totalUsers)}
                        </p>
                        <p className="text-xs text-green-600">
                          {systemAnalytics.userActivity.activeUsers} active
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm ${getTrendColor('up')}`}>
                      <div className="flex items-center">
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                        {systemAnalytics.userActivity.userGrowthRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BoltIcon className="h-8 w-8 text-yellow-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Serials
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(systemAnalytics.serialActivity.totalSerials)}
                        </p>
                        <p className="text-xs text-blue-600">
                          {systemAnalytics.serialActivity.serialsToday} today
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm ${getTrendColor('up')}`}>
                      <div className="flex items-center">
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                        {systemAnalytics.serialActivity.serialGrowthRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Total Payments
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(systemAnalytics.paymentActivity.totalPaymentAmount)}
                        </p>
                        <p className="text-xs text-yellow-600">
                          {systemAnalytics.paymentActivity.pendingPayments} pending
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Avg Serials/User
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {systemAnalytics.serialActivity.avgSerialsPerUser}
                        </p>
                        <p className="text-xs text-gray-500">
                          per installer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Health
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {systemAnalytics.systemHealth.dataIntegrity}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Data Integrity
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {systemAnalytics.systemHealth.systemUptime}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      System Uptime
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatNumber(systemAnalytics.systemHealth.totalDataPoints)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Data Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last Backup
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(systemAnalytics.systemHealth.lastBackup)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'users' && systemAnalytics && (
          <div className="space-y-6">
            {/* User Activity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Active Users (7 days)
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemAnalytics.userActivity.activeUsers}
                      </p>
                      <p className="text-sm text-gray-500">
                        {systemAnalytics.userActivity.activeUserPercentage}% of total
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <ArrowUpIcon className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        New Users (30 days)
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemAnalytics.userActivity.newUsersThisMonth}
                      </p>
                      <p className="text-sm text-green-600">
                        +{systemAnalytics.userActivity.userGrowthRate}% growth
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <BoltIcon className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Avg Activity
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {systemAnalytics.serialActivity.avgSerialsPerUser}
                      </p>
                      <p className="text-sm text-gray-500">
                        serials per user
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Engagement Chart Placeholder */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Engagement Trends
                </h3>
              </div>
              <div className="card-body">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      User engagement chart would be displayed here
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Integration with charting library needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Insights Tab */}
        {activeTab === 'business' && businessAnalytics && (
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Performing Installers
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {businessAnalytics.topInstallers.map((installer, index) => (
                    <div key={installer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {installer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {installer.city} • {installer.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {installer.serialCount} serials
                        </p>
                        <p className="text-sm text-green-600">
                          {formatCurrency(installer.totalEarnings)} earned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* City Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Geographic Distribution
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Top Cities by Installers
                    </h4>
                    <div className="space-y-3">
                      {businessAnalytics.cityStats.slice(0, 5).map((city) => (
                        <div key={city.city} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {city.city}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {city.count} installers
                            </span>
                            <div className="text-xs text-gray-500">
                              {city.serials} serials
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                      Summary Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Cities:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {businessAnalytics.summary.totalCities}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg Installers/City:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {businessAnalytics.summary.avgInstallersPerCity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Top City:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {businessAnalytics.summary.topCity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && businessAnalytics && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent System Activity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last {timeRange} days of system activity
                </p>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {businessAnalytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'registration' && (
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <UsersIcon className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === 'serial' && (
                          <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                            <BoltIcon className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === 'payment' && (
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CurrencyDollarIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>{activity.user}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.city}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(activity.timestamp)}</span>
                        </div>
                      </div>
                      {activity.amount && (
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;
