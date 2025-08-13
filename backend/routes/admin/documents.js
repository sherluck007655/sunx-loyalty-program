const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DocumentCategory = require('../../models/DocumentCategory');
const Document = require('../../models/Document');
const DocumentDownload = require('../../models/DocumentDownload');
const { protectAdmin } = require('../../middleware/auth');

// Apply admin authentication to all routes
router.use(protectAdmin);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/documents');
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
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// DOCUMENT CATEGORIES MANAGEMENT

// Get all document categories (including inactive)
router.get('/categories', async (req, res) => {
    try {
        const categories = await DocumentCategory.find()
            .sort({ sortOrder: 1, name: 1 })
            .populate('createdBy updatedBy', 'name email');
        
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

// Create new document category
router.post('/categories', async (req, res) => {
    try {
        const { name, description, icon, sortOrder } = req.body;
        
        const category = new DocumentCategory({
            name,
            description,
            icon,
            sortOrder,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });
        
        await category.save();
        
        res.status(201).json({
            success: true,
            data: category,
            message: 'Document category created successfully'
        });
    } catch (error) {
        console.error('Error creating document category:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create document category'
        });
    }
});

// Update document category
router.put('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, sortOrder, isActive } = req.body;
        
        const category = await DocumentCategory.findByIdAndUpdate(
            categoryId,
            {
                name,
                description,
                icon,
                sortOrder,
                isActive,
                updatedBy: req.user.id
            },
            { new: true, runValidators: true }
        );
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category,
            message: 'Document category updated successfully'
        });
    } catch (error) {
        console.error('Error updating document category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update document category'
        });
    }
});

// Delete document category
router.delete('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        // Check if category has documents
        const documentCount = await Document.countDocuments({ categoryId });
        if (documentCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing documents'
            });
        }
        
        const category = await DocumentCategory.findByIdAndDelete(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Document category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting document category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document category'
        });
    }
});

// DOCUMENTS MANAGEMENT

// Get all documents with filters
router.get('/documents', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            categoryId, 
            isActive, 
            documentType,
            fileType,
            search 
        } = req.query;
        
        const query = {};
        
        if (categoryId) query.categoryId = categoryId;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (documentType) query.documentType = documentType;
        if (fileType) query.fileType = fileType;
        if (search) {
            query.$text = { $search: search };
        }
        
        const skip = (page - 1) * limit;
        
        const [documents, total] = await Promise.all([
            Document.find(query)
                .populate('categoryId', 'name slug')
                .populate('createdBy updatedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Document.countDocuments(query)
        ]);
        
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
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents'
        });
    }
});

// Upload new document
router.post('/documents', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const {
            title,
            description,
            categoryId,
            documentType,
            tags,
            version,
            isFeatured
        } = req.body;
        
        // Verify category exists
        const category = await DocumentCategory.findById(categoryId);
        if (!category) {
            // Delete uploaded file if category doesn't exist
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }
        
        // Determine file type from extension
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        const fileTypeMap = {
            '.pdf': 'pdf',
            '.doc': 'doc',
            '.docx': 'docx',
            '.xls': 'xls',
            '.xlsx': 'xlsx',
            '.ppt': 'ppt',
            '.pptx': 'pptx',
            '.txt': 'txt',
            '.zip': 'zip',
            '.rar': 'rar'
        };
        
        const fileType = fileTypeMap[fileExt] || 'other';
        
        const document = new Document({
            title,
            description,
            categoryId,
            fileName: req.file.filename,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            documentType,
            fileType,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            version,
            isFeatured,
            createdBy: req.user.id,
            updatedBy: req.user.id
        });
        
        await document.save();
        
        // Update category document count
        await category.updateDocumentCount();
        
        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        
        // Delete uploaded file if there was an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to upload document'
        });
    }
});

// Update document
router.put('/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const {
            title,
            description,
            categoryId,
            documentType,
            tags,
            version,
            isFeatured,
            isActive
        } = req.body;

        const document = await Document.findByIdAndUpdate(
            documentId,
            {
                title,
                description,
                categoryId,
                documentType,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                version,
                isFeatured,
                isActive,
                updatedBy: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            data: document,
            message: 'Document updated successfully'
        });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update document'
        });
    }
});

// Delete document
router.delete('/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findByIdAndDelete(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Delete physical file
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Update category document count
        const category = await DocumentCategory.findById(document.categoryId);
        if (category) {
            await category.updateDocumentCount();
        }

        // Delete related download records
        await DocumentDownload.deleteMany({ documentId });

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document'
        });
    }
});

// Get document analytics
router.get('/documents/:documentId/analytics', async (req, res) => {
    try {
        const { documentId } = req.params;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const analytics = await DocumentDownload.getDocumentAnalytics(documentId, start, end);

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Error fetching document analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document analytics'
        });
    }
});

// Get documents overview statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalCategories,
            activeCategories,
            totalDocuments,
            activeDocuments,
            totalDownloads,
            recentDownloads
        ] = await Promise.all([
            DocumentCategory.countDocuments(),
            DocumentCategory.countDocuments({ isActive: true }),
            Document.countDocuments(),
            Document.countDocuments({ isActive: true }),
            DocumentDownload.countDocuments(),
            DocumentDownload.countDocuments({
                downloadedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
        ]);

        res.json({
            success: true,
            data: {
                categories: {
                    total: totalCategories,
                    active: activeCategories
                },
                documents: {
                    total: totalDocuments,
                    active: activeDocuments
                },
                downloads: {
                    total: totalDownloads,
                    recent: recentDownloads
                }
            }
        });
    } catch (error) {
        console.error('Error fetching document stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document statistics'
        });
    }
});

module.exports = router;
