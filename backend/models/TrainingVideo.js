const mongoose = require('mongoose');

const trainingVideoSchema = new mongoose.Schema({
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
        ref: 'TrainingCategory',
        required: true
    },
    videoType: {
        type: String,
        enum: ['youtube', 'facebook', 'vimeo', 'direct'],
        required: true,
        default: 'youtube'
    },
    videoUrl: {
        type: String,
        required: true
    },
    videoId: {
        type: String, // YouTube video ID, Facebook video ID, etc.
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
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
trainingVideoSchema.index({ categoryId: 1, isActive: 1, sortOrder: 1 });
trainingVideoSchema.index({ isActive: 1, isFeatured: 1 });
trainingVideoSchema.index({ title: 'text', description: 'text', tags: 'text' });
trainingVideoSchema.index({ difficulty: 1 });
trainingVideoSchema.index({ createdAt: -1 });

// Pre-save middleware to extract video ID and generate thumbnail
trainingVideoSchema.pre('save', function(next) {
    if (this.isModified('videoUrl')) {
        this.extractVideoInfo();
    }
    next();
});

// Method to extract video ID and generate thumbnail URL
trainingVideoSchema.methods.extractVideoInfo = function() {
    const url = this.videoUrl;
    
    if (this.videoType === 'youtube') {
        // Extract YouTube video ID
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        if (match) {
            this.videoId = match[1];
            this.thumbnailUrl = `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`;
        }
    } else if (this.videoType === 'facebook') {
        // Extract Facebook video ID (simplified)
        const facebookRegex = /facebook\.com\/.*\/videos\/(\d+)/;
        const match = url.match(facebookRegex);
        if (match) {
            this.videoId = match[1];
        }
    } else if (this.videoType === 'vimeo') {
        // Extract Vimeo video ID
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const match = url.match(vimeoRegex);
        if (match) {
            this.videoId = match[1];
            this.thumbnailUrl = `https://vumbnail.com/${this.videoId}.jpg`;
        }
    }
};

// Method to get embed URL
trainingVideoSchema.methods.getEmbedUrl = function() {
    switch (this.videoType) {
        case 'youtube':
            return `https://www.youtube.com/embed/${this.videoId}`;
        case 'facebook':
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(this.videoUrl)}`;
        case 'vimeo':
            return `https://player.vimeo.com/video/${this.videoId}`;
        default:
            return this.videoUrl;
    }
};

// Method to increment view count
trainingVideoSchema.methods.incrementViewCount = async function(userId = null) {
    this.viewCount += 1;
    await this.save();
    
    // Record view in analytics if user is provided
    if (userId) {
        const VideoView = mongoose.model('VideoView');
        await VideoView.create({
            videoId: this._id,
            userId: userId,
            viewedAt: new Date()
        });
    }
};

// Static method to get popular videos
trainingVideoSchema.statics.getPopular = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ viewCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug');
};

// Static method to get featured videos
trainingVideoSchema.statics.getFeatured = function(limit = 5) {
    return this.find({ isActive: true, isFeatured: true })
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug');
};

// Static method to search videos
trainingVideoSchema.statics.searchVideos = function(query, categoryId = null, difficulty = null) {
    const searchQuery = { isActive: true };
    
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    if (categoryId) {
        searchQuery.categoryId = categoryId;
    }
    
    if (difficulty) {
        searchQuery.difficulty = difficulty;
    }
    
    return this.find(searchQuery)
        .populate('categoryId', 'name slug')
        .sort({ score: { $meta: 'textScore' }, viewCount: -1 });
};

module.exports = mongoose.model('TrainingVideo', trainingVideoSchema);
