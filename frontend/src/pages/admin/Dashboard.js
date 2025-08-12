import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  UserGroupIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BoltIcon,
  GiftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  StarIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { adminService } from '../../services/adminService';
import { chatService } from '../../services/chatService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [systemAnalytics, setSystemAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [showChatManagement, setShowChatManagement] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    loadConversations();

    // Set up real-time data refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    // Listen for new messages to update unread count
    const handleNewMessage = () => {
      loadConversations(); // Reload to get updated unread counts
      // Also refresh dashboard stats when new activity occurs
      fetchDashboardData();
    };

    chatService.on('message_received', handleNewMessage);

    return () => {
      clearInterval(refreshInterval);
      chatService.off('message_received', handleNewMessage);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadConversations = async () => {
    try {
      const userConversations = await chatService.getConversations('admin', 'admin-1');
      setConversations(userConversations);

      // Calculate total unread messages count
      const totalUnread = userConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
      setUnreadMessagesCount(0);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Dashboard: Starting data fetch...');

      // Fetch dashboard stats first
      console.log('🔍 Dashboard: Fetching stats...');
      try {
        const statsResponse = await adminService.getDashboardStats();
        console.log('✅ Dashboard: Stats received:', statsResponse);
        setStats(statsResponse.data);
      } catch (statsError) {
        console.error('❌ Dashboard: Stats failed:', statsError);
        // Set fallback stats
        setStats({
          installers: { total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0, growthRate: 0 },
          installations: { total: 0, recent: 0, averagePerInstaller: 0 },
          payments: { total: 0, pending: 0, approved: 0, paid: 0, totalAmount: 0, pendingAmount: 0, paidAmount: 0 },
          serials: { total: 0, recent: 0, uniqueProducts: 0, uniqueCities: 0 },
          overview: { totalPaidAmount: 0, averageRating: 0, totalSerials: 0, totalProducts: 0, totalCities: 0, systemHealth: 'unknown', lastUpdated: new Date().toISOString() }
        });
      }

      // Fetch system analytics
      console.log('🔍 Dashboard: Fetching analytics...');
      try {
        const analyticsResponse = await adminService.getSystemAnalytics();
        console.log('✅ Dashboard: Analytics received:', analyticsResponse);
        setSystemAnalytics(analyticsResponse.data);
      } catch (analyticsError) {
        console.error('❌ Dashboard: Analytics failed:', analyticsError);
        // Set fallback analytics
        setSystemAnalytics({
          userActivity: { totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0, userGrowthRate: 0, activeUserPercentage: 0 },
          serialActivity: { totalSerials: 0, recentSerials: 0, serialsToday: 0, avgSerialsPerUser: 0, serialGrowthRate: 0 },
          paymentActivity: { totalPayments: 0, pendingPayments: 0, approvedPayments: 0, totalPaymentAmount: 0, avgPaymentAmount: 0, pendingPaymentPercentage: 0 },
          systemHealth: { totalDataPoints: 0, dataIntegrity: 100, systemUptime: '99.9%', lastBackup: new Date().toISOString() }
        });
      }

      console.log('✅ Dashboard: All data loaded successfully');
    } catch (error) {
      console.error('❌ Dashboard data error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast.error(`Dashboard system error - using fallback data`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId, installerName) => {
    setOpenDropdown(null); // Close dropdown
    if (window.confirm(`Are you sure you want to delete the conversation with ${installerName}? This action cannot be undone.`)) {
      try {
        await chatService.deleteConversation(conversationId);
        const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
        setConversations(updatedConversations);

        // Recalculate unread messages count
        const totalUnread = updatedConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnread);

        toast.success('Conversation deleted successfully');
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
      }
    }
  };

  const handleHideConversation = async (conversationId, installerName) => {
    setOpenDropdown(null);
    // TODO: Implement hide functionality
    toast.info(`Hide conversation with ${installerName} - feature coming soon`);
  };

  const handleArchiveConversation = async (conversationId, installerName) => {
    setOpenDropdown(null);
    // TODO: Implement archive functionality
    toast.info(`Archive conversation with ${installerName} - feature coming soon`);
  };

  const handleMarkAsImportant = async (conversationId, installerName) => {
    setOpenDropdown(null);
    try {
      await chatService.markConversationAsImportant(conversationId);
      toast.success(`Conversation with ${installerName} marked as important`);
      loadConversations(); // Refresh to show updated state
    } catch (error) {
      toast.error('Failed to mark as important');
    }
  };

  const handleMuteNotifications = async (conversationId, installerName) => {
    setOpenDropdown(null);
    try {
      await chatService.muteConversationNotifications(conversationId);
      toast.success(`Notifications muted for conversation with ${installerName}`);
      loadConversations(); // Refresh to show updated state
    } catch (error) {
      toast.error('Failed to mute notifications');
    }
  };

  const handleAddParticipants = async (conversationId, installerName) => {
    setOpenDropdown(null);
    toast.info(`Add participants to conversation with ${installerName} - feature coming soon`);
  };

  const handleExportConversation = async (conversationId, installerName) => {
    setOpenDropdown(null);
    try {
      await chatService.exportConversation(conversationId);
      toast.success(`Conversation with ${installerName} exported successfully`);
    } catch (error) {
      toast.error('Failed to export conversation');
    }
  };

  const handleAddTags = async (conversationId, installerName) => {
    setOpenDropdown(null);
    toast.info(`Add tags to conversation with ${installerName} - feature coming soon`);
  };

  const toggleDropdown = (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === conversationId ? null : conversationId);
  };

  const formatNumber = (num) => {
    // Handle undefined, null, or non-numeric values
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }

    const numValue = Number(num);
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M';
    } else if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    return numValue.toString();
  };

  const getGrowthIndicator = (rate) => {
    if (rate > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <ArrowUpIcon className="h-4 w-4 mr-1" />
          +{rate}%
        </div>
      );
    } else if (rate < 0) {
      return (
        <div className="flex items-center text-red-600 text-sm">
          <ArrowDownIcon className="h-4 w-4 mr-1" />
          {rate}%
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }
  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-primary-foreground/80">
              Manage the SunX Loyalty Program
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Installers */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Total Installers
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {stats?.installers?.total || 0}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                      <Badge variant="success" className="text-xs">
                        {stats?.installers?.approved || 0} approved
                      </Badge>
                      {stats?.installers?.pending > 0 && (
                        <Badge variant="warning" className="text-xs">
                          {stats.installers.pending} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getGrowthIndicator(stats?.installers?.growthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Installations */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BoltIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Total Installations
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {formatNumber(stats?.installations?.total || 0)}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs text-blue-600">
                        {stats?.installations?.recent || 0} recent
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ~{stats?.installations?.averagePerInstaller || 0} avg/installer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Pending Payments
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {stats?.payments?.pending || 0}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs text-green-600">
                        {formatCurrency(stats?.payments?.pendingAmount || 0)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {stats?.payments?.approved || 0} approved
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getGrowthIndicator(stats?.payments?.growthRate)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Promotions */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <GiftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                  </div>
                  <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Active Promotions
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">
                      {stats?.promotions?.active || 0}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs text-blue-600">
                        {stats?.promotions?.total || 0} total
                      </span>
                      <span className="text-xs text-gray-500">
                        {stats?.promotions?.expired || 0} expired
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder Content */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Dashboard Features
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Available Features:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• View and manage installer accounts</li>
                  <li>• Approve/reject payment requests</li>
                  <li>• Create and manage promotions</li>
                  <li>• Monitor system analytics</li>
                  <li>• Generate reports</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Quick Actions:
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/admin/activities'}
                    className="btn-outline w-full"
                  >
                    View Recent Activities
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/reports'}
                    className="btn-outline w-full"
                  >
                    Generate Monthly Report
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/settings'}
                    className="btn-outline w-full"
                  >
                    System Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Overview */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Payment Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats?.payments?.pending || 0} payments
                    </span>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(stats?.payments?.pendingAmount || 0)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats?.payments?.approved || 0} payments
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats?.payments?.paid || 0} payments
                    </span>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(stats?.payments?.paidAmount || 0)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(stats?.payments?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Overview */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                System Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Paid Amount</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(stats?.overview?.totalPaidAmount || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(stats?.overview?.averageRating && !isNaN(stats.overview.averageRating))
                      ? Number(stats.overview.averageRating).toFixed(1)
                      : '0.0'}★
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Serial Numbers</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.serials?.total || 0} total
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Product Models</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.serials?.uniqueProducts || 0} models
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cities Covered</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.serials?.uniqueCities || 0} cities
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">System Health</span>
                    <span className="text-sm font-medium text-green-600 capitalize">
                      {stats?.overview?.systemHealth || 'Good'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Analytics Preview */}
        {systemAnalytics && (
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  System Analytics
                </h3>
                <button
                  onClick={() => window.location.href = '/admin/analytics'}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View Full Analytics →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-6 w-6 text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Active Users</div>
                      <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        {systemAnalytics.userActivity.activeUsers}
                      </div>
                      <div className="text-xs text-blue-500">
                        {systemAnalytics.userActivity.activeUserPercentage}% of total
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BoltIcon className="h-6 w-6 text-yellow-500 mr-3" />
                    <div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Recent Serials</div>
                      <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                        {systemAnalytics.serialActivity.recentSerials}
                      </div>
                      <div className="text-xs text-yellow-500">
                        Last 7 days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-3" />
                    <div>
                      <div className="text-sm text-green-600 dark:text-green-400">Payment Rate</div>
                      <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                        {(100 - parseFloat(systemAnalytics.paymentActivity.pendingPaymentPercentage)).toFixed(0)}%
                      </div>
                      <div className="text-xs text-green-500">
                        Processed
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-purple-500 mr-3" />
                    <div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Growth Rate</div>
                      <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                        +{systemAnalytics.userActivity.userGrowthRate}%
                      </div>
                      <div className="text-xs text-purple-500">
                        User growth
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <button
                onClick={() => window.location.href = '/admin/installers'}
                className="btn-outline text-left p-3 sm:p-4 touch-manipulation"
              >
                <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mb-2" />
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Manage Installers</div>
                <div className="text-xs text-gray-500">
                  {stats?.installers?.pending || 0} pending approval
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/payments'}
                className="btn-outline text-left p-3 sm:p-4 touch-manipulation"
              >
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mb-2" />
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Review Payments</div>
                <div className="text-xs text-gray-500">
                  {stats?.payments?.pending || 0} pending review
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/serials'}
                className="btn-outline text-left p-3 sm:p-4 touch-manipulation"
              >
                <BoltIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mb-2" />
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Serial Numbers</div>
                <div className="text-xs text-gray-500">
                  {stats?.serials?.recent || 0} recent submissions
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/promotions'}
                className="btn-outline text-left p-3 sm:p-4 touch-manipulation"
              >
                <GiftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 mb-2" />
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Promotions</div>
                <div className="text-xs text-gray-500">
                  {stats?.promotions?.active || 0} active campaigns
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/reports'}
                className="btn-outline text-left p-3 sm:p-4 touch-manipulation"
              >
                <DocumentArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 mb-2" />
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Generate Reports</div>
                <div className="text-xs text-gray-500">
                  Export system data
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/admin/activities'}
                className="btn-outline text-left p-3 sm:p-4 touch-manipulation"
              >
                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mb-2" />
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Recent Activities</div>
                <div className="text-xs text-gray-500">
                  Monitor system events
                </div>
              </button>

              <button
                onClick={() => setShowChatManagement(!showChatManagement)}
                className="btn-outline text-left p-3 sm:p-4 relative touch-manipulation"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500 mb-2" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Manage Chats</div>
                <div className="text-xs text-gray-500">
                  {unreadMessagesCount > 0
                    ? `${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''}`
                    : `${conversations.length} active conversation${conversations.length !== 1 ? 's' : ''}`
                  }
                </div>

                {/* Unread Badge */}
                {unreadMessagesCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </div>
                )}
              </button>
            </div>

            {/* Chat Management Section */}
            {showChatManagement && (
              <div className="mt-6 card">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Active Conversations
                    </h3>
                    <button
                      onClick={() => window.location.href = '/chat'}
                      className="btn-primary text-sm"
                    >
                      Open Chat Page
                    </button>
                  </div>

                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No active conversations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conversations.map((conversation) => {
                        const installer = conversation.participants.find(p => p.type === 'installer');
                        const hasUnread = conversation.unreadCount > 0;

                        return (
                          <div
                            key={conversation.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              hasUnread
                                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                hasUnread ? 'bg-blue-500' : 'bg-gray-500'
                              }`}>
                                <span className="text-white font-medium text-sm">
                                  {installer?.name?.charAt(0) || 'U'}
                                </span>
                              </div>

                              <div>
                                <h4 className={`font-medium ${
                                  hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {installer?.name || 'Unknown User'}
                                </h4>

                                {conversation.lastMessage && (
                                  <p className={`text-sm truncate max-w-xs ${
                                    hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {conversation.lastMessage.message.length > 50
                                      ? conversation.lastMessage.message.substring(0, 50) + '...'
                                      : conversation.lastMessage.message
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {hasUnread && (
                                <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                </div>
                              )}

                              <button
                                onClick={() => window.location.href = '/chat'}
                                className="btn-outline text-sm px-3 py-1"
                              >
                                View
                              </button>

                              {/* Three-dots menu */}
                              <div className="relative" ref={dropdownRef}>
                                <button
                                  onClick={(e) => toggleDropdown(conversation.id, e)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors"
                                  title="More options"
                                >
                                  <EllipsisVerticalIcon className="h-4 w-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {openDropdown === conversation.id && (
                                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleMarkAsImportant(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        {conversation.isImportant ? (
                                          <StarIconSolid className="h-4 w-4 mr-3 text-yellow-500" />
                                        ) : (
                                          <StarIcon className="h-4 w-4 mr-3" />
                                        )}
                                        {conversation.isImportant ? 'Remove Important' : 'Mark as Important'}
                                      </button>

                                      <button
                                        onClick={() => handleMuteNotifications(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <SpeakerXMarkIcon className="h-4 w-4 mr-3" />
                                        {conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                                      </button>

                                      <button
                                        onClick={() => handleAddParticipants(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <UserPlusIcon className="h-4 w-4 mr-3" />
                                        Add Participants
                                      </button>

                                      <button
                                        onClick={() => handleExportConversation(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-3" />
                                        Export Conversation
                                      </button>

                                      <button
                                        onClick={() => handleAddTags(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <TagIcon className="h-4 w-4 mr-3" />
                                        Add Tags
                                      </button>

                                      <hr className="my-1 border-gray-200 dark:border-gray-600" />

                                      <button
                                        onClick={() => handleHideConversation(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <EyeSlashIcon className="h-4 w-4 mr-3" />
                                        Hide Conversation
                                      </button>

                                      <button
                                        onClick={() => handleArchiveConversation(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                      >
                                        <ArchiveBoxIcon className="h-4 w-4 mr-3" />
                                        Archive Conversation
                                      </button>

                                      <button
                                        onClick={() => handleDeleteConversation(conversation.id, installer?.name)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                      >
                                        <TrashIcon className="h-4 w-4 mr-3" />
                                        Delete Conversation
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {stats?.overview?.lastUpdated ?
            new Date(stats.overview.lastUpdated).toLocaleString() :
            'Never'
          }
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
