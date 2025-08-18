const mongoose = require('mongoose');

const documentCategorySchema = new mongoose.Schema({
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
        default: 'fas fa-file-alt'
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
    documentCount: {
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
documentCategorySchema.index({ isActive: 1, sortOrder: 1 });
documentCategorySchema.index({ slug: 1 });
documentCategorySchema.index({ name: 1 });

// Pre-save middleware to generate slug
documentCategorySchema.pre('save', function(next) {
    if (this.isNew || this.isModified('name') || !this.slug) {
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
documentCategorySchema.statics.getActiveWithCounts = async function() {
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
                documentCount: { 
                    $size: {
                        $filter: {
                            input: '$documents',
                            cond: { $eq: ['$$this.isActive', true] }
                        }
                    }
                }
            }
        },
        { $project: { documents: 0 } },
        { $sort: { sortOrder: 1, name: 1 } }
    ]);
};

module.exports = mongoose.model('DocumentCategory', documentCategorySchema);
