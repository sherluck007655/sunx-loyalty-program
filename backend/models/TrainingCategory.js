const mongoose = require('mongoose');

const trainingCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    icon: {
        type: String,
        default: 'fas fa-play-circle'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    videoCount: {
        type: Number,
        default: 0
    },
    totalDuration: {
        type: Number, // in seconds
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    }
}, {
    timestamps: true
});

// Index for efficient queries
trainingCategorySchema.index({ isActive: 1, sortOrder: 1 });
trainingCategorySchema.index({ slug: 1 });

// Pre-save middleware to generate slug
trainingCategorySchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Virtual for video count (will be populated separately)
trainingCategorySchema.virtual('videos', {
    ref: 'TrainingVideo',
    localField: '_id',
    foreignField: 'categoryId'
});

// Method to update video count
trainingCategorySchema.methods.updateVideoCount = async function() {
    const TrainingVideo = mongoose.model('TrainingVideo');
    const count = await TrainingVideo.countDocuments({ 
        categoryId: this._id, 
        isActive: true 
    });
    this.videoCount = count;
    return this.save();
};

// Static method to get active categories with video counts
trainingCategorySchema.statics.getActiveWithVideos = async function() {
    return this.aggregate([
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
            $addFields: {
                videoCount: { $size: '$videos' },
                totalDuration: { $sum: '$videos.duration' }
            }
        },
        { $project: { videos: 0 } },
        { $sort: { sortOrder: 1, name: 1 } }
    ]);
};

module.exports = mongoose.model('TrainingCategory', trainingCategorySchema);
