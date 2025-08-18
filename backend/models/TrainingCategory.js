const mongoose = require('mongoose');

const trainingCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true
    },
    icon: {
        type: String,
        default: 'fas fa-play-circle'
    },
    color: {
        type: String,
        default: '#ff831f' // SunX orange
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Indexes for performance
trainingCategorySchema.index({ isActive: 1, sortOrder: 1 });
trainingCategorySchema.index({ slug: 1 });
trainingCategorySchema.index({ name: 1 });

// Pre-save middleware to generate slug
trainingCategorySchema.pre('save', function(next) {
    if (this.isNew || this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Virtual for videos
trainingCategorySchema.virtual('videos', {
    ref: 'TrainingVideo',
    localField: '_id',
    foreignField: 'categoryId'
});

// Method to update video count
trainingCategorySchema.methods.updateVideoCount = async function() {
    const TrainingVideo = require('./TrainingVideo');
    this.videoCount = await TrainingVideo.countDocuments({ 
        categoryId: this._id, 
        isActive: true 
    });
    return this.save();
};

// Static method to get active categories with video counts
trainingCategorySchema.statics.getActiveWithCounts = async function() {
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
                videoCount: { 
                    $size: {
                        $filter: {
                            input: '$videos',
                            cond: { $eq: ['$$this.isActive', true] }
                        }
                    }
                }
            }
        },
        { $project: { videos: 0 } },
        { $sort: { sortOrder: 1, name: 1 } }
    ]);
};

module.exports = mongoose.model('TrainingCategory', trainingCategorySchema);
