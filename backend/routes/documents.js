const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DocumentCategory = require('../models/DocumentCategory');
const Document = require('../models/Document');
const DocumentDownload = require('../models/DocumentDownload');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, and RAR files are allowed.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Get all document categories with document counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await DocumentCategory.getActiveWithDocuments();
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

// Get documents by category
router.get('/categories/:categoryId/documents', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 20, documentType, fileType } = req.query;
        
        const query = { 
            categoryId, 
            isActive: true 
        };
        
        if (documentType) {
            query.documentType = documentType;
        }
        
        if (fileType) {
            query.fileType = fileType;
        }
        
        const skip = (page - 1) * limit;
        
        const [documents, total, category] = await Promise.all([
            Document.find(query)
                .populate('categoryId', 'name slug')
                .sort({ isFeatured: -1, downloadCount: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Document.countDocuments(query),
            DocumentCategory.findById(categoryId)
        ]);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                documents,
                category,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching category documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents'
        });
    }
});

// Search documents
router.get('/search', async (req, res) => {
    try {
        const { q, category, documentType, fileType, page = 1, limit = 20 } = req.query;
        
        if (!q && !category && !documentType && !fileType) {
            return res.status(400).json({
                success: false,
                message: 'Search query or filter is required'
            });
        }
        
        const skip = (page - 1) * limit;
        
        const documents = await Document.searchDocuments(q, category, documentType, fileType)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Document.countDocuments({
            ...(q && { $text: { $search: q } }),
            ...(category && { categoryId: category }),
            ...(documentType && { documentType }),
            ...(fileType && { fileType }),
            isActive: true
        });
        
        res.json({
            success: true,
            data: {
                documents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search documents'
        });
    }
});

// Get featured documents
router.get('/featured', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const documents = await Document.getFeatured(parseInt(limit));
        
        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching featured documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured documents'
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

// Download document
router.get('/:documentId/download', optionalAuth, async (req, res) => {
    try {
        const { documentId } = req.params;
        
        const document = await Document.findById(documentId);
        
        if (!document || !document.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        const filePath = path.join(__dirname, '../uploads/documents', document.fileName);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        // Record download
        if (req.user) {
            await document.incrementDownloadCount(req.user.id);
        } else {
            await document.incrementDownloadCount();
        }
        
        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document'
        });
    }
});

// Get user's download history (authenticated users only)
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const history = await DocumentDownload.getUserDownloadHistory(
            req.user.id, 
            parseInt(page), 
            parseInt(limit)
        );
        
        const total = await DocumentDownload.countDocuments({ userId: req.user.id });
        
        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching download history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch download history'
        });
    }
});

// Get document types for filtering
router.get('/types', async (req, res) => {
    try {
        const types = [
            { value: 'manual', label: 'User Manual' },
            { value: 'datasheet', label: 'Datasheet' },
            { value: 'specification', label: 'Specification' },
            { value: 'guide', label: 'Installation Guide' },
            { value: 'warranty', label: 'Warranty Document' },
            { value: 'certificate', label: 'Certificate' },
            { value: 'other', label: 'Other' }
        ];

        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document types'
        });
    }
});

// Get file types for filtering
router.get('/file-types', async (req, res) => {
    try {
        const fileTypes = [
            { value: 'pdf', label: 'PDF' },
            { value: 'doc', label: 'Word Document' },
            { value: 'docx', label: 'Word Document (DOCX)' },
            { value: 'xls', label: 'Excel Spreadsheet' },
            { value: 'xlsx', label: 'Excel Spreadsheet (XLSX)' },
            { value: 'ppt', label: 'PowerPoint Presentation' },
            { value: 'pptx', label: 'PowerPoint Presentation (PPTX)' },
            { value: 'txt', label: 'Text File' },
            { value: 'zip', label: 'ZIP Archive' },
            { value: 'rar', label: 'RAR Archive' }
        ];

        res.json({
            success: true,
            data: fileTypes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch file types'
        });
    }
});

module.exports = router;
