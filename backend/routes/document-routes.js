const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const DocumentCategory = require('../models/DocumentCategory');
const Document = require('../models/Document');
const DocumentDownload = require('../models/DocumentDownload');
const { protectInstaller } = require('../middleware/auth');

// Apply installer authentication to all routes
router.use(protectInstaller);

// Get active categories with document counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await DocumentCategory.getActiveWithCounts();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching document categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document categories'
        });
    }
});

// Get documents with filtering, search, and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            categoryId,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            featured
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = { isActive: true };

        if (categoryId) query.categoryId = categoryId;
        if (featured === 'true') query.isFeatured = true;
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sortOptions = {};
        if (sortBy === 'downloads') {
            sortOptions.downloadCount = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'name') {
            sortOptions.title = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
        }

        const documents = await Document.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('categoryId', 'name slug color')
            .select('-filePath'); // Don't expose file path to installers

        const total = await Document.countDocuments(query);

        res.json({
            success: true,
            data: {
                documents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents'
        });
    }
});

// Get popular documents
router.get('/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const documents = await Document.getPopular(parseInt(limit));
        
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching popular documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular documents'
        });
    }
});

// Get recent documents
router.get('/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const documents = await Document.getRecent(parseInt(limit));
        
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching recent documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent documents'
        });
    }
});

// Get single document details
router.get('/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        
        const document = await Document.findOne({ 
            _id: documentId, 
            isActive: true 
        })
        .populate('categoryId', 'name slug color')
        .select('-filePath'); // Don't expose file path to installers
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document'
        });
    }
});

// Download document
router.get('/:documentId/download', async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findOne({
            _id: documentId,
            isActive: true
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Check if file exists
        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Log download
        const downloadLog = new DocumentDownload({
            documentId: document._id,
            installerId: req.installer._id,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            downloadSource: 'web'
        });

        await downloadLog.save();

        // Increment download count
        await document.incrementDownload();

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
        res.setHeader('Content-Type', document.fileType);
        res.setHeader('Content-Length', document.fileSize);

        // Stream file to response
        const fileStream = fs.createReadStream(document.filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document'
        });
    }
});

module.exports = router;
