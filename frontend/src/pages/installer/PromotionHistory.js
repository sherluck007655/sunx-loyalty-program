import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  GiftIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { promotionService } from '../../services/promotionService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PromotionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPromotionHistory();
  }, []);

  const fetchPromotionHistory = async () => {
    try {
      setLoading(true);
      // For now, we'll get all promotions and filter for participated ones
      const [promotionsResponse, statsResponse] = await Promise.all([
        promotionService.getActivePromotions(),
        promotionService.getPromotionDashboardStats()
      ]);
      
      // Filter for participated promotions (both active and completed)
      const participatedPromotions = promotionsResponse.data.promotions.filter(p => p.isParticipating);
      setHistory(participatedPromotions);
      setStats(statsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch promotion history');
      console.error('Fetch promotion history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (promotion) => {
    if (promotion.progress?.isCompleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Completed
        </span>
      );
    }
    
    const endDate = new Date(promotion.endDate);
    const now = new Date();
    
    if (endDate < now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <ClockIcon className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <Layout title="Promotion History">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/promotions"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Promotions
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Promotion History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View your participation history and earned rewards
              </p>
            </div>
          </div>
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
                      Total Participations
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.activeParticipations + stats.completedPromotions}
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
                  <ClockIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active
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
                  <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
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

        {/* History List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Promotion History
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No promotion history found</p>
                <Link to="/promotions" className="btn-primary">
                  Join Your First Promotion
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((promotion) => (
                  <div key={promotion.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                            {promotion.title}
                          </h3>
                          {getStatusBadge(promotion)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {promotion.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <TrophyIcon className="h-4 w-4 mr-1" />
                            <span>{formatCurrency(promotion.rewards?.amount || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    {promotion.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>{promotion.progress.current} / {promotion.progress.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(promotion.progress.percentage)}`}
                            style={{ width: `${Math.min(promotion.progress.percentage || 0, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{(promotion.progress.percentage || 0).toFixed(1)}% complete</span>
                          {promotion.progress.isCompleted && promotion.progress.completedAt && (
                            <span>Completed on {formatDate(promotion.progress.completedAt)}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reward Status */}
                    {promotion.progress?.isCompleted && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              Promotion Completed!
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Reward: {formatCurrency(promotion.rewards?.amount || 0)} - 
                              {promotion.participation?.rewardClaimed ? ' Claimed' : ' Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/promotions/${promotion.id}/progress`}
                        className="btn-outline flex-1 text-center"
                      >
                        View Details
                      </Link>
                      {!promotion.progress?.isCompleted && new Date(promotion.endDate) > new Date() && (
                        <Link
                          to={`/promotions/${promotion.id}/progress`}
                          className="btn-primary flex-1 text-center"
                        >
                          Continue Progress
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PromotionHistory;
