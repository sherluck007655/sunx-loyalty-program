const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentCategory',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number, // in bytes
        required: true
    },
    documentType: {
        type: String,
        enum: ['manual', 'datasheet', 'specification', 'guide', 'warranty', 'certificate', 'other'],
        required: true,
        default: 'manual'
    },
    fileType: {
        type: String,
        enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'],
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    version: {
        type: String,
        default: '1.0'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
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

// Indexes for efficient queries
documentSchema.index({ categoryId: 1, isActive: 1 });
documentSchema.index({ documentType: 1, isActive: 1 });
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ isFeatured: 1, isActive: 1 });
documentSchema.index({ downloadCount: -1 });
documentSchema.index({ createdAt: -1 });

// Virtual for file URL
documentSchema.virtual('fileUrl').get(function() {
    return `/api/documents/${this._id}/download`;
});

// Method to get file size in human readable format
documentSchema.methods.getFormattedFileSize = function() {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Method to increment download count
documentSchema.methods.incrementDownloadCount = async function(userId = null) {
    this.downloadCount += 1;
    await this.save();
    
    // Record download in analytics if user is provided
    if (userId) {
        const DocumentDownload = mongoose.model('DocumentDownload');
        await DocumentDownload.create({
            documentId: this._id,
            userId: userId,
            downloadedAt: new Date()
        });
    }
};

// Static method to get popular documents
documentSchema.statics.getPopular = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ downloadCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug');
};

// Static method to get featured documents
documentSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ isActive: true, isFeatured: true })
        .sort({ downloadCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug');
};

// Static method to search documents
documentSchema.statics.searchDocuments = function(query, categoryId = null, documentType = null, fileType = null) {
    const searchQuery = { isActive: true };
    
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    if (categoryId) {
        searchQuery.categoryId = categoryId;
    }
    
    if (documentType) {
        searchQuery.documentType = documentType;
    }
    
    if (fileType) {
        searchQuery.fileType = fileType;
    }
    
    return this.find(searchQuery)
        .populate('categoryId', 'name slug')
        .sort({ score: { $meta: 'textScore' }, downloadCount: -1 });
};

// Static method to get documents by category
documentSchema.statics.getByCategory = function(categoryId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ categoryId, isActive: true })
        .populate('categoryId', 'name slug')
        .sort({ isFeatured: -1, downloadCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

module.exports = mongoose.model('Document', documentSchema);
