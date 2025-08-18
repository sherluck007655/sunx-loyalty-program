const mongoose = require('mongoose');

const trainingVideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
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
        ref: 'TrainingCategory',
        required: [true, 'Category is required']
    },
    
    // Video URL and Platform Information
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required'],
        trim: true
    },
    platform: {
        type: String,
        required: [true, 'Video platform is required'],
        enum: ['youtube', 'vimeo', 'facebook', 'other'],
        default: 'youtube'
    },
    videoId: {
        type: String,
        required: false,
        default: 'unknown',
        trim: true
    },
    embedUrl: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    
    // Video Metadata
    duration: {
        type: String, // Format: "10:30" or "1:05:30"
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    language: {
        type: String,
        default: 'english',
        trim: true
    },
    
    // Content Organization
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
    
    // Analytics
    viewCount: {
        type: Number,
        default: 0
    },
    lastViewed: {
        type: Date
    },
    
    // Admin Information
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
trainingVideoSchema.index({ categoryId: 1, isActive: 1 });
trainingVideoSchema.index({ title: 'text', description: 'text', tags: 'text' });
trainingVideoSchema.index({ isFeatured: 1, isActive: 1 });
trainingVideoSchema.index({ createdAt: -1 });
trainingVideoSchema.index({ viewCount: -1 });
trainingVideoSchema.index({ difficulty: 1 });
trainingVideoSchema.index({ platform: 1 });

// Pre-save middleware to extract video information
trainingVideoSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('videoUrl')) {
        try {
            const { platform, videoId, embedUrl, thumbnailUrl } = this.extractVideoInfo(this.videoUrl);

            this.platform = platform;
            this.videoId = videoId || 'unknown'; // Provide fallback
            this.embedUrl = embedUrl;
            this.thumbnailUrl = thumbnailUrl;
        } catch (error) {
            console.error('Error extracting video info:', error);
            // Set defaults if extraction fails
            this.platform = 'other';
            this.videoId = 'unknown';
            this.embedUrl = this.videoUrl;
            this.thumbnailUrl = '';
        }
    }

    // Ensure videoId is never undefined
    if (!this.videoId) {
        this.videoId = 'unknown';
    }

    next();
});

// Method to extract video information from URL
trainingVideoSchema.methods.extractVideoInfo = function(url) {
    let platform = 'other';
    let videoId = 'unknown';
    let embedUrl = url;
    let thumbnailUrl = '';

    try {
        // YouTube URL patterns (including Shorts)
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);

        if (youtubeMatch && youtubeMatch[1]) {
            platform = 'youtube';
            videoId = youtubeMatch[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            return { platform, videoId, embedUrl, thumbnailUrl };
        }

        // Vimeo URL patterns
        const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
        const vimeoMatch = url.match(vimeoRegex);

        if (vimeoMatch && vimeoMatch[1]) {
            platform = 'vimeo';
            videoId = vimeoMatch[1];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
            thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`;
            return { platform, videoId, embedUrl, thumbnailUrl };
        }

        // Facebook URL patterns
        const facebookRegex = /(?:facebook\.com\/.*\/videos\/|fb\.watch\/)([0-9]+)/;
        const facebookMatch = url.match(facebookRegex);

        if (facebookMatch && facebookMatch[1]) {
            platform = 'facebook';
            videoId = facebookMatch[1];
            embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
            thumbnailUrl = ''; // Facebook doesn't provide direct thumbnail URLs
            return { platform, videoId, embedUrl, thumbnailUrl };
        }

        // If no pattern matches, generate a unique ID from URL
        videoId = Buffer.from(url).toString('base64').substring(0, 11);

    } catch (error) {
        console.error('Error in extractVideoInfo:', error);
        // Generate a fallback ID
        videoId = Date.now().toString();
    }

    return { platform, videoId, embedUrl, thumbnailUrl };
};

// Method to increment view count
trainingVideoSchema.methods.incrementView = async function() {
    this.viewCount += 1;
    this.lastViewed = new Date();
    return this.save();
};

// Static method to search videos
trainingVideoSchema.statics.search = function(query, options = {}) {
    const {
        categoryId,
        difficulty,
        platform,
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

    if (difficulty) {
        searchQuery.difficulty = difficulty;
    }

    if (platform) {
        searchQuery.platform = platform;
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

// Static method to get featured videos
trainingVideoSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ isActive: true, isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug color');
};

// Static method to get popular videos
trainingVideoSchema.statics.getPopular = function(limit = 6) {
    return this.find({ isActive: true })
        .sort({ viewCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('categoryId', 'name slug color');
};

module.exports = mongoose.model('TrainingVideo', trainingVideoSchema);
