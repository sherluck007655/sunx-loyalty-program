import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { promotionService } from '../../services/promotionService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PromotionDetails = () => {
  const { promotionId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingReward, setUpdatingReward] = useState(null);

  useEffect(() => {
    fetchPromotionData();
  }, [promotionId]);

  const fetchPromotionData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, participantsResponse] = await Promise.all([
        adminService.getPromotionAnalytics(promotionId),
        adminService.getPromotionParticipants(promotionId, statusFilter)
      ]);
      
      setAnalytics(analyticsResponse.data);
      setParticipants(participantsResponse.data.participants);
    } catch (error) {
      toast.error('Failed to fetch promotion data');
      console.error('Fetch promotion data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (status) => {
    setStatusFilter(status);
    try {
      const response = await adminService.getPromotionParticipants(promotionId, status);
      setParticipants(response.data.participants);
    } catch (error) {
      toast.error('Failed to filter participants');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-orange-100 text-orange-800', text: 'Active' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      expired: { color: 'bg-gray-100 text-gray-800', text: 'Expired' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getRewardStatusBadge = (participant) => {
    const status = participant.rewardStatus || (participant.rewardClaimed ? 'paid' : 'pending');

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-orange-100 text-orange-800', text: 'Approved' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleRewardStatusUpdate = async (participationId, newStatus) => {
    try {
      setUpdatingReward(participationId);
      await promotionService.updateRewardStatus(participationId, newStatus);
      toast.success(`Reward status updated to ${newStatus}`);

      // Refresh the data
      fetchPromotionData();
    } catch (error) {
      toast.error(error.message || 'Failed to update reward status');
      console.error('Update reward status error:', error);
    } finally {
      setUpdatingReward(null);
    }
  };

  if (loading) {
    return (
      <Layout title="Promotion Details">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout title="Promotion Details">
        <div className="text-center py-12">
          <p className="text-gray-500">Promotion not found</p>
          <Link to="/admin/promotions" className="btn-primary mt-4">
            Back to Promotions
          </Link>
        </div>
      </Layout>
    );
  }

  const { promotion } = analytics;

  return (
    <Layout title={`Promotion: ${promotion.title}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/promotions"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Promotions
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {promotion.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {promotion.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(promotion.status)}
            <span className="text-sm text-gray-500">
              {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Participants
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalParticipants}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.completedParticipantsCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.completionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <TrophyIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Rewards
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(analytics.completedParticipants * (promotion.rewards?.amount || 0))}
                  </p>
                </div>
              </div>
            </div>
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
              onClick={() => setActiveTab('participants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participants'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Participants ({analytics.totalParticipants})
            </button>
            <button
              onClick={() => setActiveTab('completions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completions ({analytics.completedParticipantsCount || 0})
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'completions' && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Reward Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Promotion Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Promotion Details
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Type:</span>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {promotion.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Target:</span>
                  <p className="text-gray-900 dark:text-white">
                    {promotion.target?.value} {promotion.target?.type} ({promotion.target?.period})
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Reward:</span>
                  <p className="text-gray-900 dark:text-white">
                    {formatCurrency(promotion.rewards?.amount || 0)} - {promotion.rewards?.description}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Eligibility:</span>
                  <p className="text-gray-900 dark:text-white">
                    Min {promotion.eligibility?.minInstallations || 0} installations, 
                    {promotion.eligibility?.installerStatus || 'Any'} status
                    {promotion.eligibility?.newInstallersOnly && ', New installers only'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Analytics */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Progress Analytics
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Average Progress</span>
                    <span>{analytics.averageProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(analytics.averageProgress)}`}
                      style={{ width: `${Math.min(analytics.averageProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{analytics.activeParticipantsCount || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{analytics.completedParticipantsCount || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Participants
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusFilter('')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    statusFilter === ''
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilter('active')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    statusFilter === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusFilter('completed')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    statusFilter === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
            <div className="card-body">
              {participants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Installer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Valid Serials
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {participants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {participant.installer?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {participant.installer?.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                {participant.installer?.city} • {participant.installer?.totalInstallations} total installations
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(participant.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full">
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                <span>{participant.progress?.current || 0} / {participant.progress?.target || 0}</span>
                                <span>{(participant.progress?.percentage || 0).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(participant.progress?.percentage || 0)}`}
                                  style={{ width: `${Math.min(participant.progress?.percentage || 0, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(participant.joinedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {participant.progress?.validSerials || 0}
                            <div className="text-xs text-gray-500">
                              Since {formatDate(participant.progress?.countingStartDate)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {statusFilter ? `No ${statusFilter} participants found` : 'No participants found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'completions' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Completed Participants
              </h3>
            </div>
            <div className="card-body">
              {analytics.completedParticipants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Installer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Completed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Final Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Reward Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {analytics.completedParticipants
                        .filter(participant => {
                          if (!statusFilter) return true;
                          const status = participant.rewardStatus || (participant.rewardClaimed ? 'paid' : 'pending');
                          return status === statusFilter;
                        })
                        .map((participant) => {
                        const joinDate = new Date(participant.joinedAt);
                        const completeDate = new Date(participant.completedAt);
                        const durationDays = Math.ceil((completeDate - joinDate) / (1000 * 60 * 60 * 24));

                        return (
                          <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {participant.installer?.name || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {participant.installer?.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(participant.completedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {participant.progress?.current} / {participant.progress?.target}
                                </span>
                                <span className="ml-2 text-xs text-green-600">
                                  ({(participant.progress?.percentage || 0).toFixed(1)}%)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                {getRewardStatusBadge(participant)}
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(promotion.rewards?.amount || 0)}
                                </div>

                                {/* Admin Controls */}
                                <div className="flex space-x-1">
                                  {(participant.rewardStatus === 'pending' || !participant.rewardStatus) && (
                                    <button
                                      onClick={() => handleRewardStatusUpdate(participant.id, 'approved')}
                                      disabled={updatingReward === participant.id}
                                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      {updatingReward === participant.id ? '...' : 'Approve'}
                                    </button>
                                  )}
                                  {participant.rewardStatus === 'approved' && (
                                    <button
                                      onClick={() => handleRewardStatusUpdate(participant.id, 'paid')}
                                      disabled={updatingReward === participant.id}
                                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                      {updatingReward === participant.id ? '...' : 'Mark Paid'}
                                    </button>
                                  )}
                                  {(participant.rewardStatus === 'pending' || participant.rewardStatus === 'approved') && (
                                    <button
                                      onClick={() => handleRewardStatusUpdate(participant.id, 'rejected')}
                                      disabled={updatingReward === participant.id}
                                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                      {updatingReward === participant.id ? '...' : 'Reject'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {durationDays} days
                              <div className="text-xs text-gray-400">
                                {participant.progress?.validSerials || 0} valid serials
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No completed participants yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PromotionDetails;
