import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  GiftIcon,
  TrophyIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  BoltIcon,
  ArrowRightIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { promotionService } from '../../services/promotionService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchPromotions();
    fetchStats();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getActivePromotions();
      setPromotions(response.data.promotions);
    } catch (error) {
      toast.error('Failed to fetch promotions');
      console.error('Fetch promotions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await promotionService.getPromotionDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleJoinPromotion = async (promotionId) => {
    try {
      setJoining(true);
      await promotionService.joinPromotion(promotionId);
      toast.success('Successfully joined promotion!');
      fetchPromotions();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to join promotion');
      console.error('Join promotion error:', error);
    } finally {
      setJoining(false);
    }
  };

  const openPromotionDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setShowDetailsModal(true);
  };

  const getPromotionIcon = (type) => {
    const icons = {
      installation_target: BoltIcon,
      milestone: TrophyIcon,
      quality_target: StarIcon,
      geographic_expansion: MapPinIcon
    };
    return icons[type] || GiftIcon;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const renderPromotionCard = (promotion) => {
    const Icon = getPromotionIcon(promotion.type);
    const isParticipating = promotion.isParticipating;
    const canJoin = promotion.canJoin;
    const progress = promotion.progress;

    return (
      <div key={promotion._id} className="card hover:shadow-lg transition-shadow">
        <div className="card-body">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {promotion.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </p>
              </div>
            </div>
            {isParticipating && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Participating
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {promotion.description}
          </p>

          {/* Progress Bar */}
          {isParticipating && progress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{progress?.current || 0} / {progress?.target || 0}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress?.percentage || 0)}`}
                  style={{ width: `${Math.min(progress?.percentage || 0, 100)}%` }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(progress?.percentage || 0).toFixed(1)}% complete
              </div>
            </div>
          )}

          {/* Reward */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Reward: {formatCurrency(promotion.rewards?.amount || 0)}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {promotion.rewards?.description || 'Bonus reward'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => openPromotionDetails(promotion)}
              className="flex-1 btn-outline"
            >
              View Details
            </button>
            {canJoin && !isParticipating && (
              <button
                onClick={() => handleJoinPromotion(promotion._id)}
                disabled={joining}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {joining ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Joining...</span>
                  </>
                ) : (
                  'Join Promotion'
                )}
              </button>
            )}
            {isParticipating && (
              <Link
                to={`/promotions/${promotion._id}/progress`}
                className="flex-1 btn-primary text-center inline-flex items-center justify-center"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Progress
              </Link>
            )}
            {!canJoin && !isParticipating && (
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Not Eligible
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="Active Promotions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Active Promotions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Join active promotions and earn bonus rewards for your installations
            </p>
          </div>
          <Link
            to="/promotions/history"
            className="btn-outline flex items-center justify-center w-full sm:w-auto text-sm sm:text-base px-3 py-2"
          >
            <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">View History</span>
            <span className="sm:hidden">History</span>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <GiftIcon className="h-8 w-8 text-primary-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Available Promotions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.availablePromotions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Participations
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.activeParticipations}
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
                      {stats.completedPromotions}
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
                      {formatCurrency(stats.totalRewardsEarned)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available ({promotions.filter(p => p.canJoin).length})
            </button>
            <button
              onClick={() => setActiveTab('participating')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'participating'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Participating ({promotions.filter(p => p.isParticipating).length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Promotions ({promotions.length})
            </button>
          </nav>
        </div>

        {/* Promotions Content */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div>
              {activeTab === 'available' && (
                <div>
                  {promotions.filter(p => p.canJoin).length === 0 ? (
                    <div className="card">
                      <div className="card-body text-center py-12">
                        <GiftIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Available Promotions
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          You've joined all available promotions or don't meet eligibility requirements.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {promotions.filter(p => p.canJoin).map(renderPromotionCard)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'participating' && (
                <div>
                  {promotions.filter(p => p.isParticipating).length === 0 ? (
                    <div className="card">
                      <div className="card-body text-center py-12">
                        <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Active Participations
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          You're not currently participating in any promotions. Check the Available tab to join new promotions!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {promotions.filter(p => p.isParticipating).map(renderPromotionCard)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'all' && (
                <div>
                  {promotions.length === 0 ? (
                    <div className="card">
                      <div className="card-body text-center py-12">
                        <GiftIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Promotions Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          There are currently no promotions available. Check back later for new opportunities!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {promotions.map(renderPromotionCard)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Promotion Details Modal */}
        {showDetailsModal && selectedPromotion && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Promotion Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPromotion(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Promotion Header */}
                  <div className="text-center">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      {React.createElement(getPromotionIcon(selectedPromotion.type), {
                        className: "h-8 w-8 text-primary-600 dark:text-primary-400"
                      })}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedPromotion.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPromotion.description}
                    </p>
                  </div>

                  {/* Campaign Period */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Campaign Period
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Start Date:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatDate(selectedPromotion.startDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">End Date:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {formatDate(selectedPromotion.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Target Requirements */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                      <BoltIcon className="h-4 w-4 mr-2" />
                      Target Requirements
                    </h4>
                    <div className="text-sm">
                      <p className="text-blue-800 dark:text-blue-200">
                        <span className="font-medium">Target:</span> {selectedPromotion.target?.value || 0} {selectedPromotion.target?.type || 'items'}
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 mt-1">
                        <span className="font-medium">Period:</span> {selectedPromotion.target?.period || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Progress (if participating) */}
                  {selectedPromotion.isParticipating && selectedPromotion.progress && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Your Progress
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 dark:text-green-300">Progress</span>
                          <span className="text-green-900 dark:text-green-100 font-medium">
                            {selectedPromotion.progress.current} / {selectedPromotion.progress.target}
                          </span>
                        </div>
                        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(selectedPromotion.progress.percentage || 0, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm text-green-600 dark:text-green-400">
                          {(selectedPromotion.progress.percentage || 0).toFixed(1)}% complete
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                      <TrophyIcon className="h-4 w-4 mr-2" />
                      Rewards
                    </h4>
                    <div className="space-y-2">
                      <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg">
                        {formatCurrency(selectedPromotion.rewards?.amount || 0)}
                      </p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        {selectedPromotion.rewards?.description || 'Bonus reward'}
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                        Type: {selectedPromotion.rewards?.type?.replace('_', ' ') || 'Cash'}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Eligibility Requirements
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Minimum Installations:</span> {selectedPromotion.eligibility?.minInstallations || 0}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Installer Status:</span> {selectedPromotion.eligibility?.installerStatus || 'Any'}
                      </p>
                      {selectedPromotion.eligibility?.newInstallersOnly && (
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Special:</span> New installers only
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  {selectedPromotion.canJoin && !selectedPromotion.isParticipating && (
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleJoinPromotion(selectedPromotion.id);
                      }}
                      className="btn-primary"
                    >
                      Join Promotion
                    </button>
                  )}
                  {selectedPromotion.isParticipating && (
                    <Link
                      to={`/promotions/${selectedPromotion._id}/progress`}
                      className="btn-primary"
                      onClick={() => setShowDetailsModal(false)}
                    >
                      View Progress
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPromotion(null);
                    }}
                    className="btn-outline"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Promotions;
