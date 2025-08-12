const express = require('express');
const router = express.Router();
const TrainingCategory = require('../models/TrainingCategory');
const TrainingVideo = require('../models/TrainingVideo');
const VideoView = require('../models/VideoView');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Get all training categories with video counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await TrainingCategory.getActiveWithVideos();
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching training categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training categories'
        });
    }
});

// Get videos by category
router.get('/categories/:categoryId/videos', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 20, difficulty } = req.query;
        
        const query = { 
            categoryId, 
            isActive: true 
        };
        
        if (difficulty) {
            query.difficulty = difficulty;
        }
        
        const skip = (page - 1) * limit;
        
        const [videos, total, category] = await Promise.all([
            TrainingVideo.find(query)
                .populate('categoryId', 'name slug')
                .sort({ sortOrder: 1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TrainingVideo.countDocuments(query),
            TrainingCategory.findById(categoryId)
        ]);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                videos,
                category,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching category videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos'
        });
    }
});

// Get single video details
router.get('/videos/:videoId', optionalAuth, async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const video = await TrainingVideo.findById(videoId)
            .populate('categoryId', 'name slug');
        
        if (!video || !video.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        // Record view if user is authenticated
        if (req.user) {
            await video.incrementViewCount(req.user.id);
        } else {
            await video.incrementViewCount();
        }
        
        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video'
        });
    }
});

// Search videos
router.get('/search', async (req, res) => {
    try {
        const { q, category, difficulty, page = 1, limit = 20 } = req.query;
        
        if (!q && !category && !difficulty) {
            return res.status(400).json({
                success: false,
                message: 'Search query, category, or difficulty is required'
            });
        }
        
        const skip = (page - 1) * limit;
        
        const videos = await TrainingVideo.searchVideos(q, category, difficulty)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await TrainingVideo.countDocuments({
            ...(q && { $text: { $search: q } }),
            ...(category && { categoryId: category }),
            ...(difficulty && { difficulty }),
            isActive: true
        });
        
        res.json({
            success: true,
            data: {
                videos,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search videos'
        });
    }
});

// Get featured videos
router.get('/featured', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const videos = await TrainingVideo.getFeatured(parseInt(limit));
        
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching featured videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured videos'
        });
    }
});

// Get popular videos
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const videos = await TrainingVideo.getPopular(parseInt(limit));
        
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching popular videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular videos'
        });
    }
});

// Get user's watch history (authenticated users only)
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const history = await VideoView.getUserWatchHistory(
            req.user.id, 
            parseInt(page), 
            parseInt(limit)
        );
        
        const total = await VideoView.countDocuments({ userId: req.user.id });
        
        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch watch history'
        });
    }
});

// Record video view progress (authenticated users only)
router.post('/videos/:videoId/progress', authenticateToken, async (req, res) => {
    try {
        const { videoId } = req.params;
        const { watchDuration, completed = false } = req.body;
        
        const video = await TrainingVideo.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        // Update or create view record
        await VideoView.findOneAndUpdate(
            { 
                videoId, 
                userId: req.user.id,
                viewedAt: {
                    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
                }
            },
            {
                watchDuration,
                completed,
                viewedAt: new Date()
            },
            { 
                upsert: true, 
                new: true 
            }
        );
        
        res.json({
            success: true,
            message: 'Progress recorded'
        });
    } catch (error) {
        console.error('Error recording video progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record progress'
        });
    }
});

module.exports = router;
