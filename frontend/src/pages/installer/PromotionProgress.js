import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeftIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  BoltIcon,
  MapPinIcon,
  StarIcon,
  GiftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { promotionService } from '../../services/promotionService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PromotionProgress = () => {
  const { promotionId } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validSerials, setValidSerials] = useState([]);

  useEffect(() => {
    fetchPromotionProgress();
  }, [promotionId]);

  const fetchPromotionProgress = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching promotion progress for ID:', promotionId);

      const response = await promotionService.getPromotionProgress(promotionId);
      console.log('✅ Promotion progress data:', response.data);

      setPromotion(response.data.promotion);

      // Get valid serials for this promotion (mock data for now)
      // In real implementation, this would come from the backend
      setValidSerials([]);

    } catch (error) {
      toast.error('Failed to fetch promotion progress');
      console.error('Fetch promotion progress error:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Layout title="Promotion Progress">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!promotion) {
    return (
      <Layout title="Promotion Progress">
        <div className="text-center py-12">
          <p className="text-gray-500">Promotion not found</p>
          <Link to="/promotions" className="btn-primary mt-4">
            Back to Promotions
          </Link>
        </div>
      </Layout>
    );
  }

  const Icon = getPromotionIcon(promotion.type);
  const progress = {
    current: promotion.currentProgress || 0,
    target: promotion.targetInverters || 0,
    percentage: promotion.progressPercentage || 0
  };
  const isCompleted = promotion.isCompleted || false;

  return (
    <Layout title={`Progress: ${promotion.title}`}>
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
          </div>
        </div>

        {/* Promotion Header Card */}
        <div className="card gradient-primary text-white">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">{promotion.title}</h1>
                  <p className="text-white/90 mb-2">{promotion.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-white/80">
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
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isCompleted ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body text-center">
              <ChartBarIcon className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Current Progress
              </h3>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {progress.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {progress.current} of {progress.target} completed
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <ClockIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Time Remaining
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.max(0, Math.ceil((new Date(promotion.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Days left
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Reward
              </h3>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {formatCurrency(promotion.rewards?.amount || 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isCompleted ? 'Earned!' : 'Potential reward'}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detailed Progress
            </h3>
          </div>
          <div className="card-body space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Overall Progress</span>
                <span>{progress.current} / {progress.target}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(progress.percentage)}`}
                  style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
                {progress.percentage.toFixed(1)}% complete
              </div>
            </div>

            {/* Progress Details by Type */}
            {promotion.type === 'quality_target' && progress.rating !== undefined && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                  Quality Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Installations:</span>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {progress.current} / {progress.target}
                      <span className={`ml-2 text-sm ${progress.current >= progress.target ? 'text-green-600' : 'text-blue-600'}`}>
                        {progress.current >= progress.target ? '✓' : '○'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Average Rating:</span>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {progress.rating?.toFixed(1) || '0.0'} / {progress.ratingTarget || '5.0'}
                      <span className={`ml-2 text-sm ${progress.meetsQuality ? 'text-green-600' : 'text-blue-600'}`}>
                        {progress.meetsQuality ? '✓' : '○'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {promotion.type === 'geographic_expansion' && progress.cities && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
                  Geographic Coverage
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-green-700 dark:text-green-300">Cities Covered:</span>
                    <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                      {progress.cities?.length || 0} / {progress.target}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-green-700 dark:text-green-300">Cities:</span>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {progress.cities?.join(', ') || 'None yet'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Counting Period Info */}
            {progress.countingStartDate && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Counting Period
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Only installations added after <strong>{formatDate(progress.countingStartDate)}</strong> count towards this promotion.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Valid installations: {progress.validSerials || 0}
                </p>
              </div>
            )}

            {/* Completion Status */}
            {isCompleted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                      Congratulations! Promotion Completed
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You have successfully completed this promotion and earned {formatCurrency(promotion.rewards?.amount || 0)}.
                      {progress.completedAt && ` Completed on ${formatDate(progress.completedAt)}.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PromotionProgress;
