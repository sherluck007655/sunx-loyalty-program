const express = require('express');
const router = express.Router();
const TrainingCategory = require('../models/TrainingCategory');
const TrainingVideo = require('../models/TrainingVideo');
const { protectInstaller } = require('../middleware/auth');

// Apply installer authentication to all routes
router.use(protectInstaller);

// Get all training categories with video counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await TrainingCategory.getActiveWithCounts();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching training categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training categories',
            error: error.message
        });
    }
});

// Get videos by category
router.get('/categories/:categoryId/videos', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const {
            page = 1,
            limit = 12,
            difficulty,
            platform,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = sortOrder === 'desc' ? -1 : 1;

        const searchOptions = {
            categoryId,
            difficulty,
            platform,
            sortBy,
            sortOrder: sort,
            limit: parseInt(limit),
            skip
        };

        const videos = await TrainingVideo.search(search, searchOptions);
        const total = await TrainingVideo.countDocuments({ 
            categoryId,
            isActive: true,
            ...(difficulty && { difficulty }),
            ...(platform && { platform })
        });

        res.json({
            success: true,
            data: videos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching category videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category videos',
            error: error.message
        });
    }
});

// Get all videos with filtering and pagination
router.get('/videos', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            categoryId,
            difficulty,
            platform,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = sortOrder === 'desc' ? -1 : 1;

        const searchOptions = {
            categoryId,
            difficulty,
            platform,
            sortBy,
            sortOrder: sort,
            limit: parseInt(limit),
            skip
        };

        const videos = await TrainingVideo.search(search, searchOptions);
        const total = await TrainingVideo.countDocuments({ 
            isActive: true,
            ...(categoryId && { categoryId }),
            ...(difficulty && { difficulty }),
            ...(platform && { platform })
        });

        res.json({
            success: true,
            data: videos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching training videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training videos',
            error: error.message
        });
    }
});

// Get single video details
router.get('/videos/:id', async (req, res) => {
    try {
        const video = await TrainingVideo.findById(req.params.id)
            .populate('categoryId', 'name slug color')
            .populate('uploadedBy', 'name email');
        
        if (!video || !video.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Training video not found'
            });
        }

        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training video',
            error: error.message
        });
    }
});

// Increment video view count
router.post('/videos/:id/view', async (req, res) => {
    try {
        const video = await TrainingVideo.findById(req.params.id);
        
        if (!video || !video.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Training video not found'
            });
        }

        await video.incrementView();

        res.json({
            success: true,
            message: 'View count updated',
            data: {
                viewCount: video.viewCount
            }
        });
    } catch (error) {
        console.error('Error updating view count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update view count',
            error: error.message
        });
    }
});

// Get featured videos
router.get('/featured', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const videos = await TrainingVideo.getFeatured(parseInt(limit));
        
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching featured videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured videos',
            error: error.message
        });
    }
});

// Get popular videos
router.get('/popular', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const videos = await TrainingVideo.getPopular(parseInt(limit));
        
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching popular videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular videos',
            error: error.message
        });
    }
});

// Get recent videos
router.get('/recent', async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const videos = await TrainingVideo.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('categoryId', 'name slug color');
        
        res.json({
            success: true,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching recent videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent videos',
            error: error.message
        });
    }
});

// Search videos
router.get('/search', async (req, res) => {
    try {
        const {
            q: query,
            page = 1,
            limit = 12,
            categoryId,
            difficulty,
            platform,
            sortBy = 'relevance'
        } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        let sortOrder = -1;
        let sortField = 'createdAt';

        // Handle different sort options
        switch (sortBy) {
            case 'newest':
                sortField = 'createdAt';
                sortOrder = -1;
                break;
            case 'oldest':
                sortField = 'createdAt';
                sortOrder = 1;
                break;
            case 'popular':
                sortField = 'viewCount';
                sortOrder = -1;
                break;
            case 'relevance':
            default:
                sortField = 'score';
                sortOrder = { $meta: 'textScore' };
                break;
        }

        const searchOptions = {
            categoryId,
            difficulty,
            platform,
            sortBy: sortField,
            sortOrder,
            limit: parseInt(limit),
            skip
        };

        const videos = await TrainingVideo.search(query.trim(), searchOptions);
        
        // Get total count for pagination
        const searchQuery = { 
            isActive: true,
            $text: { $search: query.trim() }
        };
        
        if (categoryId) searchQuery.categoryId = categoryId;
        if (difficulty) searchQuery.difficulty = difficulty;
        if (platform) searchQuery.platform = platform;

        const total = await TrainingVideo.countDocuments(searchQuery);

        res.json({
            success: true,
            data: videos,
            query: query.trim(),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search videos',
            error: error.message
        });
    }
});

module.exports = router;
