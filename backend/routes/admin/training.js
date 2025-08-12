const express = require('express');
const router = express.Router();
const TrainingCategory = require('../../models/TrainingCategory');
const TrainingVideo = require('../../models/TrainingVideo');
const VideoView = require('../../models/VideoView');
const { authenticateAdmin } = require('../../middleware/auth');

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// TRAINING CATEGORIES MANAGEMENT

// Get all training categories (including inactive)
router.get('/categories', async (req, res) => {
    try {
        const categories = await TrainingCategory.find()
            .sort({ sortOrder: 1, name: 1 })
            .populate('createdBy updatedBy', 'name email');
        
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

// Create new training category
router.post('/categories', async (req, res) => {
    try {
        const { name, description, icon, sortOrder } = req.body;
        
        const category = new TrainingCategory({
            name,
            description,
            icon,
            sortOrder,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });
        
        await category.save();
        
        res.status(201).json({
            success: true,
            data: category,
            message: 'Training category created successfully'
        });
    } catch (error) {
        console.error('Error creating training category:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create training category'
        });
    }
});

// Update training category
router.put('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, sortOrder, isActive } = req.body;
        
        const category = await TrainingCategory.findByIdAndUpdate(
            categoryId,
            {
                name,
                description,
                icon,
                sortOrder,
                isActive,
                updatedBy: req.user.id
            },
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category,
            message: 'Training category updated successfully'
        });
    } catch (error) {
        console.error('Error updating training category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update training category'
        });
    }
});

// Delete training category
router.delete('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        // Check if category has videos
        const videoCount = await TrainingVideo.countDocuments({ categoryId });
        if (videoCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing videos'
            });
        }
        
        const category = await TrainingCategory.findByIdAndDelete(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Training category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting training category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete training category'
        });
    }
});

// TRAINING VIDEOS MANAGEMENT

// Get all training videos with filters
router.get('/videos', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            categoryId, 
            isActive, 
            difficulty,
            search 
        } = req.query;
        
        const query = {};
        
        if (categoryId) query.categoryId = categoryId;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$text = { $search: search };
        }
        
        const skip = (page - 1) * limit;
        
        const [videos, total] = await Promise.all([
            TrainingVideo.find(query)
                .populate('categoryId', 'name slug')
                .populate('createdBy updatedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            TrainingVideo.countDocuments(query)
        ]);
        
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
        console.error('Error fetching training videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training videos'
        });
    }
});

// Create new training video
router.post('/videos', async (req, res) => {
    try {
        const {
            title,
            description,
            categoryId,
            videoType,
            videoUrl,
            tags,
            difficulty,
            duration,
            sortOrder,
            isFeatured
        } = req.body;
        
        // Verify category exists
        const category = await TrainingCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }
        
        const video = new TrainingVideo({
            title,
            description,
            categoryId,
            videoType,
            videoUrl,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            difficulty,
            duration,
            sortOrder,
            isFeatured,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });
        
        await video.save();
        
        // Update category video count
        await category.updateVideoCount();
        
        res.status(201).json({
            success: true,
            data: video,
            message: 'Training video created successfully'
        });
    } catch (error) {
        console.error('Error creating training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create training video'
        });
    }
});

// Update training video
router.put('/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const {
            title,
            description,
            categoryId,
            videoType,
            videoUrl,
            tags,
            difficulty,
            duration,
            sortOrder,
            isFeatured,
            isActive
        } = req.body;
        
        const video = await TrainingVideo.findByIdAndUpdate(
            videoId,
            {
                title,
                description,
                categoryId,
                videoType,
                videoUrl,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                difficulty,
                duration,
                sortOrder,
                isFeatured,
                isActive,
                updatedBy: req.user.id
            },
            { new: true, runValidators: true }
        );
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        res.json({
            success: true,
            data: video,
            message: 'Training video updated successfully'
        });
    } catch (error) {
        console.error('Error updating training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update training video'
        });
    }
});

// Delete training video
router.delete('/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        
        const video = await TrainingVideo.findByIdAndDelete(videoId);
        
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }
        
        // Update category video count
        const category = await TrainingCategory.findById(video.categoryId);
        if (category) {
            await category.updateVideoCount();
        }
        
        // Delete related view records
        await VideoView.deleteMany({ videoId });
        
        res.json({
            success: true,
            message: 'Training video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete training video'
        });
    }
});

// Get video analytics
router.get('/videos/:videoId/analytics', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const analytics = await VideoView.getVideoAnalytics(videoId, start, end);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching video analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video analytics'
        });
    }
});

// Get training overview statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalCategories,
            activeCategories,
            totalVideos,
            activeVideos,
            totalViews,
            recentViews
        ] = await Promise.all([
            TrainingCategory.countDocuments(),
            TrainingCategory.countDocuments({ isActive: true }),
            TrainingVideo.countDocuments(),
            TrainingVideo.countDocuments({ isActive: true }),
            VideoView.countDocuments(),
            VideoView.countDocuments({
                viewedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
        ]);

        res.json({
            success: true,
            data: {
                categories: {
                    total: totalCategories,
                    active: activeCategories
                },
                videos: {
                    total: totalVideos,
                    active: activeVideos
                },
                views: {
                    total: totalViews,
                    recent: recentViews
                }
            }
        });
    } catch (error) {
        console.error('Error fetching training stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training statistics'
        });
    }
});

module.exports = router;
