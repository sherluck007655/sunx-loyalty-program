const mongoose = require('mongoose');

const documentDownloadSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
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
    downloadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
documentDownloadSchema.index({ documentId: 1, userId: 1 });
documentDownloadSchema.index({ documentId: 1, downloadedAt: -1 });
documentDownloadSchema.index({ userId: 1, downloadedAt: -1 });
documentDownloadSchema.index({ downloadedAt: -1 });

// Static method to get document analytics
documentDownloadSchema.statics.getDocumentAnalytics = async function(documentId, startDate, endDate) {
    const pipeline = [
        {
            $match: {
                documentId: new mongoose.Types.ObjectId(documentId),
                downloadedAt: {
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
                        date: "$downloadedAt"
                    }
                },
                totalDownloads: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: "$uniqueUsers" }
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

// Static method to get user download history
documentDownloadSchema.statics.getUserDownloadHistory = function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ userId })
        .populate('documentId', 'title fileType fileSize categoryId')
        .sort({ downloadedAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to get popular downloads
documentDownloadSchema.statics.getPopularDownloads = async function(startDate, endDate, limit = 10) {
    const pipeline = [
        {
            $match: {
                downloadedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: "$documentId",
                downloadCount: { $sum: 1 },
                uniqueUsers: { $addToSet: "$userId" }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: "$uniqueUsers" }
            }
        },
        {
            $lookup: {
                from: 'documents',
                localField: '_id',
                foreignField: '_id',
                as: 'document'
            }
        },
        {
            $unwind: '$document'
        },
        {
            $project: {
                documentId: '$_id',
                downloadCount: 1,
                uniqueUserCount: 1,
                title: '$document.title',
                fileType: '$document.fileType',
                categoryId: '$document.categoryId'
            }
        },
        {
            $sort: { downloadCount: -1 }
        },
        {
            $limit: limit
        }
    ];
    
    return this.aggregate(pipeline);
};

module.exports = mongoose.model('DocumentDownload', documentDownloadSchema);
