const mongoose = require('mongoose');

const documentDownloadSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    installerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Installer',
        required: true
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    downloadSource: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web'
    }
}, {
    timestamps: true
});

// Indexes for performance
documentDownloadSchema.index({ documentId: 1, downloadedAt: -1 });
documentDownloadSchema.index({ installerId: 1, downloadedAt: -1 });
documentDownloadSchema.index({ downloadedAt: -1 });

// Static method to get download statistics
documentDownloadSchema.statics.getStats = async function(options = {}) {
    const { 
        documentId, 
        installerId, 
        startDate, 
        endDate,
        groupBy = 'day' 
    } = options;

    const matchQuery = {};
    
    if (documentId) matchQuery.documentId = documentId;
    if (installerId) matchQuery.installerId = installerId;
    
    if (startDate || endDate) {
        matchQuery.downloadedAt = {};
        if (startDate) matchQuery.downloadedAt.$gte = new Date(startDate);
        if (endDate) matchQuery.downloadedAt.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (groupBy) {
        case 'hour':
            groupFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$downloadedAt" } };
            break;
        case 'day':
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" } };
            break;
        case 'month':
            groupFormat = { $dateToString: { format: "%Y-%m", date: "$downloadedAt" } };
            break;
        default:
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" } };
    }

    return this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: groupFormat,
                count: { $sum: 1 },
                uniqueUsers: { $addToSet: "$installerId" }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: "$uniqueUsers" }
            }
        },
        { $project: { uniqueUsers: 0 } },
        { $sort: { _id: 1 } }
    ]);
};

// Static method to get top downloaded documents
documentDownloadSchema.statics.getTopDocuments = function(limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
        { $match: { downloadedAt: { $gte: startDate } } },
        {
            $group: {
                _id: "$documentId",
                downloadCount: { $sum: 1 },
                uniqueUsers: { $addToSet: "$installerId" },
                lastDownload: { $max: "$downloadedAt" }
            }
        },
        {
            $addFields: {
                uniqueUserCount: { $size: "$uniqueUsers" }
            }
        },
        { $project: { uniqueUsers: 0 } },
        { $sort: { downloadCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'documents',
                localField: '_id',
                foreignField: '_id',
                as: 'document'
            }
        },
        { $unwind: '$document' },
        {
            $lookup: {
                from: 'documentcategories',
                localField: 'document.categoryId',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
    ]);
};

module.exports = mongoose.model('DocumentDownload', documentDownloadSchema);
