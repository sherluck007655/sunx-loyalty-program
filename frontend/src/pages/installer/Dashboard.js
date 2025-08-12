import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BoltIcon,
  CurrencyDollarIcon,
  GiftIcon,
  PlusIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import PendingApproval from '../../components/PendingApproval';
import NotificationsPanel from '../../components/NotificationsPanel';
import { useAuth } from '../../context/AuthContext';
import { installerService } from '../../services/installerService';
import { promotionService } from '../../services/promotionService';
import { formatCurrency, formatDate, formatLoyaltyCardId } from '../../utils/formatters';
import { getStatusColor } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimingMilestone, setClaimingMilestone] = useState(false);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promotionStats, setPromotionStats] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data first
      const dashboardResponse = await installerService.getDashboard();
      setDashboardData(dashboardResponse.data);

      // Fetch promotions data
      const promotionsResponse = await promotionService.getActivePromotions();
      setPromotions(promotionsResponse.data.promotions.slice(0, 3)); // Show only first 3

      // Fetch promotion stats
      const statsResponse = await promotionService.getPromotionDashboardStats();
      setPromotionStats(statsResponse.data);

      // Fetch notification count
      try {
        const response = await installerService.getNotifications();
        const notifications = response.data?.notifications || response.notifications || [];
        const unreadCount = response.data?.unreadCount || notifications.filter(n => !n.read).length;
        setNotificationCount(unreadCount);
      } catch (notifError) {
        console.error('Error loading notifications:', notifError);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimMilestone = async (milestoneNumber) => {
    try {
      setClaimingMilestone(true);
      const response = await installerService.claimMilestonePayment(milestoneNumber);

      if (response.success) {
        toast.success(response.message);
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to claim milestone payment');
      console.error('Claim milestone error:', error);
    } finally {
      setClaimingMilestone(false);
    }
  };

  const handleJoinPromotion = async (promotionId) => {
    try {
      await promotionService.joinPromotion(promotionId);
      toast.success('Successfully joined promotion!');
      fetchDashboardData(); // Refresh to show updated participation status
    } catch (error) {
      toast.error(error.message || 'Failed to join promotion');
    }
  };

  // Check if user needs approval
  if (user && user.status !== 'approved') {
    return <PendingApproval user={user} />;
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-12">
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  const { installer, recentSerials, recentPayments, stats } = dashboardData;

  // Ensure arrays are defined to prevent length errors
  const payments = recentPayments || [];
  const serials = recentSerials || [];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-sm sm:text-base text-primary-foreground/80 mb-4">
                  Loyalty Card ID: {formatLoyaltyCardId(user?.loyaltyCardId)}
                </p>
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm">
                  <div className="flex items-center">
                    <BoltIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                    <span>{stats?.totalInverters || 0} Inverters</span>
                  </div>
                  <div className="flex items-center">
                    <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                    <span>{stats?.totalPoints || 0} Points</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-1 ${stats?.isEligibleForPayment ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className={stats?.isEligibleForPayment ? 'text-green-400' : 'text-gray-400'}>
                      {stats?.isEligibleForPayment ? 'Payment Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col sm:flex-row gap-2">
                <Button
                  asChild
                  variant="secondary"
                  className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 w-full lg:w-auto touch-manipulation"
                  size="sm"
                >
                  <Link to="/serials/add">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Add Serial</span>
                  </Link>
                </Button>

                {stats?.isEligibleForPayment && (
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-green-600/20 text-primary-foreground hover:bg-green-600/30 w-full lg:w-auto touch-manipulation"
                    size="sm"
                  >
                    <Link to="/payments?request=true">
                      <CurrencyDollarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-sm sm:text-base">Request Payment</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Completed Milestones */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">
                  Completed Milestones
                </CardTitle>
                <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
                  {stats?.milestones?.completed || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Milestones Achieved
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats?.milestones?.completed || 0) * 10} total installations
                </p>
              </div>

              {stats?.milestones?.hasUnclaimedMilestone && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Milestone {stats.milestones.completed} Ready!
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Claim your PKR 5,000 reward
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleClaimMilestone(stats.milestones.completed)}
                      disabled={claimingMilestone}
                    >
                      {claimingMilestone ? 'Claiming...' : 'Claim'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Progress */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Current Milestone Progress
                </CardTitle>
                <BoltIcon className="h-6 w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stats?.milestones?.currentProgress || 0} / 10 Inverters
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {(stats?.milestones?.progressPercentage !== undefined && !isNaN(stats.milestones.progressPercentage))
                      ? Number(stats.milestones.progressPercentage).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>

                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats?.milestones?.progressPercentage || 0}%` }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {stats?.milestones?.nextMilestoneAt
                      ? `${stats.milestones.nextMilestoneAt} more installations needed`
                      : 'Milestone completed! Add more to start next milestone.'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Next milestone: {(stats?.milestones?.completed || 0) + 1}
                  </p>
                </div>

                {stats?.milestones?.currentProgress === 10 && !stats?.milestones?.hasUnclaimedMilestone && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                      🎉 Milestone completed! Check your completed milestones to claim reward.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BoltIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Inverters
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {stats?.totalInverters || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Points
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {stats?.totalPoints || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Payments
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.pendingPayments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GiftIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Promotions
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {promotionStats?.activeParticipations || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(promotionStats?.totalRewardsEarned || 0)} earned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Serial Numbers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">
                Recent Installations
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/serials">
                  View all →
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {serials.length > 0 ? (
                <div className="space-y-3">
                  {serials.map((serial) => (
                    <div key={serial._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-foreground">
                          {serial.serialNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(serial.installationDate)}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(serial.status)}`}>
                        {serial.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BoltIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No installations yet
                  </p>
                  <Link
                    to="/serials/add"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Add your first installation
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Promotions */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Promotions
              </h3>
              <Link
                to="/promotions"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all →
              </Link>
            </div>
            <div className="card-body">
              {promotions.length > 0 ? (
                <div className="space-y-4">
                  {promotions.map((promotion) => (
                    <div key={promotion.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <GiftIcon className="h-5 w-5 text-primary-500 mr-2" />
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {promotion.title}
                          </h4>
                        </div>
                        {promotion.isParticipating && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Participating
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {promotion.description.length > 80
                          ? `${promotion.description.substring(0, 80)}...`
                          : promotion.description}
                      </p>

                      {/* Progress Bar (if participating) */}
                      {promotion.isParticipating && promotion.progress && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{promotion.progress.current} / {promotion.progress.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(promotion.progress.percentage || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <TrophyIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {formatCurrency(promotion.rewards?.amount || 0)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {promotion.canJoin && !promotion.isParticipating && (
                            <button
                              onClick={() => handleJoinPromotion(promotion.id)}
                              className="text-xs bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 transition-colors"
                            >
                              Join Now
                            </button>
                          )}
                          {promotion.isParticipating && (
                            <Link
                              to={`/promotions/${promotion.id}/progress`}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors"
                            >
                              View Progress
                            </Link>
                          )}
                          <Link
                            to="/promotions"
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            All Promotions
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <GiftIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-3">
                    No active promotions available
                  </p>
                  <Link
                    to="/promotions"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Check for new promotions
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Payments
              </h3>
              <Link
                to="/payments"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View all →
              </Link>
            </div>
            <div className="card-body">
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-700 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.description}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No payments yet
                  </p>
                  <p className="text-sm text-gray-400">
                    Complete 10 installations to become eligible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Link
                to="/serials/add"
                className="flex items-center p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <PlusIcon className="h-6 w-6 text-primary-500 mr-3" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Add Serial
                </span>
              </Link>
              <Link
                to="/promotions"
                className="flex items-center p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <GiftIcon className="h-6 w-6 text-warning-500 mr-3" />
                <span className="font-medium text-gray-900 dark:text-white">
                  View Promotions
                </span>
              </Link>
              <Link
                to="/payments"
                className="flex items-center p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <CurrencyDollarIcon className="h-6 w-6 text-success-500 mr-3" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Payment History
                </span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ClockIcon className="h-6 w-6 text-gray-500 mr-3" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Update Profile
                </span>
              </Link>

              <button
                onClick={() => setShowNotifications(true)}
                className="flex items-center p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors relative"
              >
                <BellIcon className="h-6 w-6 text-blue-500 mr-3" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Notifications
                </span>
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </Layout>
  );
};

export default Dashboard;
