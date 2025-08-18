const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const DocumentCategory = require('../../models/DocumentCategory');
const Document = require('../../models/Document');
const DocumentDownload = require('../../models/DocumentDownload');
const { protectAdmin } = require('../../middleware/auth');

// Apply admin authentication to all routes
router.use(protectAdmin);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// File type validation
const allowedMimeTypes = [
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
];

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
        }
    }
});

// CATEGORY ROUTES

// Get all categories
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

// Get active categories with document counts
router.get('/categories/active', async (req, res) => {
    try {
        const categories = await DocumentCategory.getActiveWithCounts();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching active categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active categories'
        });
    }
});

// Create new category
router.post('/categories', async (req, res) => {
    try {
        const { name, description, icon, color, sortOrder } = req.body;
        
        const category = new DocumentCategory({
            name,
            description,
            icon,
            color,
            sortOrder,
            createdBy: req.admin._id,
            updatedBy: req.admin._id
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

// Update category
router.put('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, color, sortOrder, isActive } = req.body;
        
        const category = await DocumentCategory.findByIdAndUpdate(
            categoryId,
            {
                name,
                description,
                icon,
                color,
                sortOrder,
                isActive,
                updatedBy: req.admin._id
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

// Delete category
router.delete('/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        // Check if category has documents
        const documentCount = await Document.countDocuments({ categoryId, isActive: true });
        if (documentCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with active documents'
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

// DOCUMENT ROUTES

// Get all documents with filtering and pagination
router.get('/documents', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            categoryId,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            isActive
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const query = {};

        if (categoryId) query.categoryId = categoryId;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const documents = await Document.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('categoryId', 'name slug color')
            .populate('uploadedBy updatedBy', 'name email');

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
            version,
            tags,
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

        // Parse tags if provided
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                parsedTags = [];
            }
        }

        const document = new Document({
            title,
            description,
            categoryId,
            fileName: req.file.filename,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            fileExtension: path.extname(req.file.originalname),
            version,
            tags: parsedTags,
            isFeatured: isFeatured === 'true',
            uploadedBy: req.admin._id
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

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload document'
        });
    }
});

// Get single document
router.get('/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId)
            .populate('categoryId', 'name slug color')
            .populate('uploadedBy updatedBy', 'name email');

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

// Update document
router.put('/documents/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const {
            title,
            description,
            categoryId,
            version,
            tags,
            isFeatured,
            isActive
        } = req.body;

        // Verify category exists if categoryId is being updated
        if (categoryId) {
            const category = await DocumentCategory.findById(categoryId);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }
        }

        // Parse tags if provided
        let parsedTags = tags;
        if (tags && typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = [];
            }
        }

        const document = await Document.findByIdAndUpdate(
            documentId,
            {
                title,
                description,
                categoryId,
                version,
                tags: parsedTags,
                isFeatured,
                isActive,
                updatedBy: req.admin._id
            },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name slug color')
         .populate('uploadedBy updatedBy', 'name email');

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

        const document = await Document.findById(documentId);

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

        // Delete document record
        await Document.findByIdAndDelete(documentId);

        // Update category document count
        const category = await DocumentCategory.findById(document.categoryId);
        if (category) {
            await category.updateDocumentCount();
        }

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

// Download document (Admin)
router.get('/documents/:documentId/download', async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId);

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
