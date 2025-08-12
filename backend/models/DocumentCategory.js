const mongoose = require('mongoose');

const documentCategorySchema = new mongoose.Schema({
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
        default: 'fas fa-file-alt'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    documentCount: {
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

// Index for efficient queries
documentCategorySchema.index({ isActive: 1, sortOrder: 1 });
documentCategorySchema.index({ slug: 1 });

// Pre-save middleware to generate slug
documentCategorySchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Virtual for documents
documentCategorySchema.virtual('documents', {
    ref: 'Document',
    localField: '_id',
    foreignField: 'categoryId'
});

// Method to update document count
documentCategorySchema.methods.updateDocumentCount = async function() {
    const Document = mongoose.model('Document');
    const count = await Document.countDocuments({ 
        categoryId: this._id, 
        isActive: true 
    });
    this.documentCount = count;
    return this.save();
};

// Static method to get active categories with document counts
documentCategorySchema.statics.getActiveWithDocuments = async function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $lookup: {
                from: 'documents',
                localField: '_id',
                foreignField: 'categoryId',
                as: 'documents'
            }
        },
        {
            $addFields: {
                documentCount: { $size: '$documents' }
            }
        },
        { $project: { documents: 0 } },
        { $sort: { sortOrder: 1, name: 1 } }
    ]);
};

module.exports = mongoose.model('DocumentCategory', documentCategorySchema);
