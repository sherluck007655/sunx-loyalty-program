const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Document title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentCategory',
        required: [true, 'Category is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required']
    },
    originalFileName: {
        type: String,
        required: [true, 'Original file name is required']
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required'],
        max: [50 * 1024 * 1024, 'File size cannot exceed 50MB'] // 50MB limit
    },
    fileType: {
        type: String,
        required: [true, 'File type is required'],
        enum: {
            values: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'application/zip'
            ],
            message: 'Invalid file type'
        }
    },
    fileExtension: {
        type: String,
        required: [true, 'File extension is required']
    },
    version: {
        type: String,
        default: '1.0'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    lastDownloaded: {
        type: Date
    },
    uploadedBy: {
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
documentSchema.index({ categoryId: 1, isActive: 1 });
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ isFeatured: 1, isActive: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ downloadCount: -1 });

// Virtual for file URL
documentSchema.virtual('fileUrl').get(function() {
    return `/uploads/documents/${this.fileName}`;
});

// Method to increment download count
documentSchema.methods.incrementDownload = async function() {
    this.downloadCount += 1;
    this.lastDownloaded = new Date();
    return this.save();
};

// Static method to get popular documents
documentSchema.statics.getPopular = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ downloadCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug color')
        .populate('uploadedBy', 'name email');
};

// Static method to get recent documents
documentSchema.statics.getRecent = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug color')
        .populate('uploadedBy', 'name email');
};

// Static method to search documents
documentSchema.statics.search = function(query, options = {}) {
    const {
        categoryId,
        tags,
        sortBy = 'createdAt',
        sortOrder = -1,
        limit = 20,
        skip = 0
    } = options;

    const searchQuery = { isActive: true };

    if (query) {
        searchQuery.$text = { $search: query };
    }

    if (categoryId) {
        searchQuery.categoryId = categoryId;
    }

    if (tags && tags.length > 0) {
        searchQuery.tags = { $in: tags };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    return this.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name slug color')
        .populate('uploadedBy', 'name email');
};

module.exports = mongoose.model('Document', documentSchema);
