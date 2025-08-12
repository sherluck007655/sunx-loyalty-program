#!/usr/bin/env node

/**
 * Test Training System - Quick Demo
 * This script demonstrates the training system functionality
 * without requiring MongoDB to be running
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend/build'));

// Mock Data
const mockCategories = [
    {
        _id: '1',
        name: 'Application Training',
        slug: 'application-training',
        description: 'Learn how to use the loyalty program application effectively',
        icon: 'fas fa-mobile-alt',
        isActive: true,
        sortOrder: 1,
        videoCount: 5,
        totalDuration: 1800
    },
    {
        _id: '2',
        name: 'Inverter Settings',
        slug: 'inverter-settings',
        description: 'Complete guide to inverter configuration and optimization',
        icon: 'fas fa-cogs',
        isActive: true,
        sortOrder: 2,
        videoCount: 8,
        totalDuration: 2400
    },
    {
        _id: '3',
        name: 'Lithium Battery Installation',
        slug: 'lithium-battery-installation',
        description: 'Step-by-step lithium battery installation and setup',
        icon: 'fas fa-battery-full',
        isActive: true,
        sortOrder: 3,
        videoCount: 6,
        totalDuration: 2100
    }
];

const mockVideos = [
    {
        _id: 'v1',
        title: 'Getting Started with SunX Loyalty Program',
        description: 'Learn the basics of using the SunX loyalty program application',
        categoryId: { _id: '1', name: 'Application Training', slug: 'application-training' },
        videoType: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 300,
        difficulty: 'beginner',
        isActive: true,
        isFeatured: true,
        viewCount: 1250,
        tags: ['basics', 'introduction', 'loyalty program']
    },
    {
        _id: 'v2',
        title: 'Advanced Inverter Configuration',
        description: 'Deep dive into advanced inverter settings and optimization techniques',
        categoryId: { _id: '2', name: 'Inverter Settings', slug: 'inverter-settings' },
        videoType: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 600,
        difficulty: 'advanced',
        isActive: true,
        isFeatured: true,
        viewCount: 890,
        tags: ['inverter', 'configuration', 'advanced']
    },
    {
        _id: 'v3',
        title: 'Battery Safety and Installation',
        description: 'Essential safety procedures for lithium battery installation',
        categoryId: { _id: '3', name: 'Lithium Battery Installation', slug: 'lithium-battery-installation' },
        videoType: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: 450,
        difficulty: 'intermediate',
        isActive: true,
        isFeatured: false,
        viewCount: 567,
        tags: ['battery', 'safety', 'installation']
    }
];

const mockDocumentCategories = [
    {
        _id: 'd1',
        name: 'Inverter Documents',
        slug: 'inverter-documents',
        description: 'User manuals, datasheets, and specifications for inverters',
        icon: 'fas fa-file-pdf',
        isActive: true,
        sortOrder: 1,
        documentCount: 12
    },
    {
        _id: 'd2',
        name: 'Battery Documents',
        slug: 'battery-documents',
        description: 'Battery manuals, specifications, and installation guides',
        icon: 'fas fa-battery-half',
        isActive: true,
        sortOrder: 2,
        documentCount: 8
    }
];

const mockDocuments = [
    {
        _id: 'doc1',
        title: 'SunX 5kW Inverter Manual',
        description: 'Complete user manual for SunX 5kW solar inverter',
        categoryId: { _id: 'd1', name: 'Inverter Documents', slug: 'inverter-documents' },
        fileName: 'sunx-5kw-manual.pdf',
        originalFileName: 'SunX_5kW_Inverter_Manual.pdf',
        fileSize: 2048576,
        documentType: 'manual',
        fileType: 'pdf',
        tags: ['5kw', 'inverter', 'manual'],
        version: '2.1',
        isActive: true,
        isFeatured: true,
        downloadCount: 456
    },
    {
        _id: 'doc2',
        title: 'Lithium Battery Datasheet',
        description: 'Technical specifications for SunX lithium battery series',
        categoryId: { _id: 'd2', name: 'Battery Documents', slug: 'battery-documents' },
        fileName: 'lithium-battery-datasheet.pdf',
        originalFileName: 'SunX_Lithium_Battery_Datasheet.pdf',
        fileSize: 1024768,
        documentType: 'datasheet',
        fileType: 'pdf',
        tags: ['lithium', 'battery', 'specifications'],
        version: '1.3',
        isActive: true,
        isFeatured: true,
        downloadCount: 234
    }
];

// Training API Routes
app.get('/api/training/categories', (req, res) => {
    res.json({
        success: true,
        data: mockCategories
    });
});

app.get('/api/training/featured', (req, res) => {
    const featured = mockVideos.filter(v => v.isFeatured);
    res.json({
        success: true,
        data: featured
    });
});

app.get('/api/training/popular', (req, res) => {
    const popular = mockVideos.sort((a, b) => b.viewCount - a.viewCount);
    res.json({
        success: true,
        data: popular
    });
});

app.get('/api/training/categories/:categoryId/videos', (req, res) => {
    const { categoryId } = req.params;
    const videos = mockVideos.filter(v => v.categoryId._id === categoryId);
    const category = mockCategories.find(c => c._id === categoryId);
    
    res.json({
        success: true,
        data: {
            videos,
            category,
            pagination: {
                page: 1,
                limit: 20,
                total: videos.length,
                pages: 1
            }
        }
    });
});

app.get('/api/training/videos/:videoId', (req, res) => {
    const { videoId } = req.params;
    const video = mockVideos.find(v => v._id === videoId);
    
    if (!video) {
        return res.status(404).json({
            success: false,
            message: 'Video not found'
        });
    }
    
    res.json({
        success: true,
        data: video
    });
});

// Documents API Routes
app.get('/api/documents/categories', (req, res) => {
    res.json({
        success: true,
        data: mockDocumentCategories
    });
});

app.get('/api/documents/featured', (req, res) => {
    const featured = mockDocuments.filter(d => d.isFeatured);
    res.json({
        success: true,
        data: featured
    });
});

app.get('/api/documents/popular', (req, res) => {
    const popular = mockDocuments.sort((a, b) => b.downloadCount - a.downloadCount);
    res.json({
        success: true,
        data: popular
    });
});

app.get('/api/documents/types', (req, res) => {
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
});

app.get('/api/documents/file-types', (req, res) => {
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
});

app.get('/api/documents/categories/:categoryId/documents', (req, res) => {
    const { categoryId } = req.params;
    const documents = mockDocuments.filter(d => d.categoryId._id === categoryId);
    const category = mockDocumentCategories.find(c => c._id === categoryId);
    
    res.json({
        success: true,
        data: {
            documents,
            category,
            pagination: {
                page: 1,
                limit: 20,
                total: documents.length,
                pages: 1
            }
        }
    });
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Training System Demo Server Started!

📋 Available endpoints:
   • Training: http://localhost:${PORT}/training
   • Downloads: http://localhost:${PORT}/downloads
   • API: http://localhost:${PORT}/api

🎯 This is a demo server with mock data.
   To use with real database, set up MongoDB and run migrations.

💡 Next steps:
   1. Install MongoDB or use MongoDB Atlas
   2. Run: node migrations/migration-runner.js up
   3. Start the full backend: npm run dev

Press Ctrl+C to stop the server.
    `);
});
