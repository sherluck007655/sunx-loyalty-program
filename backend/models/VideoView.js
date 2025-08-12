const mongoose = require('mongoose');

const videoViewSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingVideo',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sessionId: {
        type: String // For anonymous users
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    watchDuration: {
        type: Number, // in seconds
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
videoViewSchema.index({ videoId: 1, userId: 1 });
videoViewSchema.index({ videoId: 1, viewedAt: -1 });
videoViewSchema.index({ userId: 1, viewedAt: -1 });
videoViewSchema.index({ viewedAt: -1 });

// Compound index to prevent duplicate views within a time window
videoViewSchema.index({ 
    videoId: 1, 
    userId: 1, 
    viewedAt: 1 
}, { 
    partialFilterExpression: { userId: { $exists: true } }
});

// Static method to get video analytics
videoViewSchema.statics.getVideoAnalytics = async function(videoId, startDate, endDate) {
    const pipeline = [
        {
            $match: {
                videoId: new mongoose.Types.ObjectId(videoId),
                viewedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$viewedAt"
                    }
                },
                totalViews: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" },
                totalWatchTime: { $sum: "$watchDuration" },
                completedViews: {
                    $sum: { $cond: ["$completed", 1, 0] }
                }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: "$uniqueUsers" },
                completionRate: {
                    $multiply: [
                        { $divide: ["$completedViews", "$totalViews"] },
                        100
                    ]
                }
            }
        },
        {
            $project: {
                uniqueUsers: 0
            }
        },
        {
            $sort: { _id: 1 }
        }
    ];
    
    return this.aggregate(pipeline);
};

// Static method to get user watch history
videoViewSchema.statics.getUserWatchHistory = function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ userId })
        .populate('videoId', 'title thumbnailUrl duration categoryId')
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(limit);
};

module.exports = mongoose.model('VideoView', videoViewSchema);
