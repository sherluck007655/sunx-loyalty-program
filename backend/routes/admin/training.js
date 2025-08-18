const express = require('express');
const router = express.Router();
const TrainingCategory = require('../../models/TrainingCategory');
const TrainingVideo = require('../../models/TrainingVideo');
const { protectAdmin } = require('../../middleware/auth');

// Apply admin authentication to all routes
router.use(protectAdmin);

// ==================== TRAINING CATEGORIES ====================

// Get all training categories
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

// Get single training category
router.get('/categories/:id', async (req, res) => {
    try {
        const category = await TrainingCategory.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Training category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching training category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training category',
            error: error.message
        });
    }
});

// Create new training category
router.post('/categories', async (req, res) => {
    try {
        const {
            name,
            description,
            icon,
            color,
            sortOrder
        } = req.body;

        const category = new TrainingCategory({
            name,
            description,
            icon: icon || 'fas fa-play-circle',
            color: color || '#ff831f',
            sortOrder: sortOrder || 0,
            createdBy: req.admin._id
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
            message: 'Failed to create training category',
            error: error.message
        });
    }
});

// Update training category
router.put('/categories/:id', async (req, res) => {
    try {
        const {
            name,
            description,
            icon,
            color,
            sortOrder,
            isActive
        } = req.body;

        const category = await TrainingCategory.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Training category not found'
            });
        }

        // Update fields
        if (name !== undefined) category.name = name;
        if (description !== undefined) category.description = description;
        if (icon !== undefined) category.icon = icon;
        if (color !== undefined) category.color = color;
        if (sortOrder !== undefined) category.sortOrder = sortOrder;
        if (isActive !== undefined) category.isActive = isActive;
        
        category.updatedBy = req.admin._id;

        await category.save();

        res.json({
            success: true,
            data: category,
            message: 'Training category updated successfully'
        });
    } catch (error) {
        console.error('Error updating training category:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update training category',
            error: error.message
        });
    }
});

// Delete training category
router.delete('/categories/:id', async (req, res) => {
    try {
        const category = await TrainingCategory.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Training category not found'
            });
        }

        // Check if category has videos
        const videoCount = await TrainingVideo.countDocuments({ 
            categoryId: req.params.id,
            isActive: true 
        });

        if (videoCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${videoCount} active videos. Please move or delete the videos first.`
            });
        }

        await TrainingCategory.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Training category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting training category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete training category',
            error: error.message
        });
    }
});

// ==================== TRAINING VIDEOS ====================

// Get all training videos with filtering and pagination
router.get('/videos', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
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

// Get single training video
router.get('/videos/:id', async (req, res) => {
    try {
        const video = await TrainingVideo.findById(req.params.id)
            .populate('categoryId', 'name slug color')
            .populate('uploadedBy', 'name email');
        
        if (!video) {
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

// Create new training video
router.post('/videos', async (req, res) => {
    try {
        const {
            title,
            description,
            categoryId,
            videoUrl,
            duration,
            difficulty,
            language,
            tags,
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

        // Parse tags if provided
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = [];
            }
        }

        const video = new TrainingVideo({
            title,
            description,
            categoryId,
            videoUrl,
            duration,
            difficulty: difficulty || 'beginner',
            language: language || 'english',
            tags: parsedTags,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            uploadedBy: req.admin._id
        });

        await video.save();

        // Update category video count
        await category.updateVideoCount();

        // Populate the response
        const populatedVideo = await TrainingVideo.findById(video._id)
            .populate('categoryId', 'name slug color')
            .populate('uploadedBy', 'name email');

        res.status(201).json({
            success: true,
            data: populatedVideo,
            message: 'Training video created successfully'
        });
    } catch (error) {
        console.error('Error creating training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create training video',
            error: error.message
        });
    }
});

// Update training video
router.put('/videos/:id', async (req, res) => {
    try {
        const {
            title,
            description,
            categoryId,
            videoUrl,
            duration,
            difficulty,
            language,
            tags,
            isFeatured,
            isActive
        } = req.body;

        const video = await TrainingVideo.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Training video not found'
            });
        }

        // Verify category exists if changing
        if (categoryId && categoryId !== video.categoryId.toString()) {
            const category = await TrainingCategory.findById(categoryId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }
        }

        // Parse tags if provided
        let parsedTags = video.tags;
        if (tags !== undefined) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = [];
            }
        }

        // Update fields
        if (title !== undefined) video.title = title;
        if (description !== undefined) video.description = description;
        if (categoryId !== undefined) video.categoryId = categoryId;
        if (videoUrl !== undefined) video.videoUrl = videoUrl;
        if (duration !== undefined) video.duration = duration;
        if (difficulty !== undefined) video.difficulty = difficulty;
        if (language !== undefined) video.language = language;
        if (tags !== undefined) video.tags = parsedTags;
        if (isFeatured !== undefined) video.isFeatured = isFeatured === 'true' || isFeatured === true;
        if (isActive !== undefined) video.isActive = isActive === 'true' || isActive === true;

        video.updatedBy = req.admin._id;

        await video.save();

        // Update category video counts if category changed
        if (categoryId && categoryId !== video.categoryId.toString()) {
            const oldCategory = await TrainingCategory.findById(video.categoryId);
            const newCategory = await TrainingCategory.findById(categoryId);

            if (oldCategory) await oldCategory.updateVideoCount();
            if (newCategory) await newCategory.updateVideoCount();
        }

        // Populate the response
        const populatedVideo = await TrainingVideo.findById(video._id)
            .populate('categoryId', 'name slug color')
            .populate('uploadedBy', 'name email');

        res.json({
            success: true,
            data: populatedVideo,
            message: 'Training video updated successfully'
        });
    } catch (error) {
        console.error('Error updating training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update training video',
            error: error.message
        });
    }
});

// Delete training video
router.delete('/videos/:id', async (req, res) => {
    try {
        const video = await TrainingVideo.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Training video not found'
            });
        }

        const categoryId = video.categoryId;

        await TrainingVideo.findByIdAndDelete(req.params.id);

        // Update category video count
        const category = await TrainingCategory.findById(categoryId);
        if (category) {
            await category.updateVideoCount();
        }

        res.json({
            success: true,
            message: 'Training video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting training video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete training video',
            error: error.message
        });
    }
});

// Get training analytics
router.get('/analytics', async (req, res) => {
    try {
        const totalVideos = await TrainingVideo.countDocuments({ isActive: true });
        const totalCategories = await TrainingCategory.countDocuments({ isActive: true });
        const totalViews = await TrainingVideo.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
        ]);

        const popularVideos = await TrainingVideo.getPopular(5);
        const recentVideos = await TrainingVideo.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('categoryId', 'name color');

        const categoryStats = await TrainingCategory.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: 'trainingvideos',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'videos'
                }
            },
            {
                $project: {
                    name: 1,
                    color: 1,
                    videoCount: {
                        $size: {
                            $filter: {
                                input: '$videos',
                                cond: { $eq: ['$$this.isActive', true] }
                            }
                        }
                    },
                    totalViews: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$videos',
                                        cond: { $eq: ['$$this.isActive', true] }
                                    }
                                },
                                as: 'video',
                                in: '$$video.viewCount'
                            }
                        }
                    }
                }
            },
            { $sort: { videoCount: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalVideos,
                    totalCategories,
                    totalViews: totalViews[0]?.totalViews || 0
                },
                popularVideos,
                recentVideos,
                categoryStats
            }
        });
    } catch (error) {
        console.error('Error fetching training analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch training analytics',
            error: error.message
        });
    }
});

module.exports = router;
