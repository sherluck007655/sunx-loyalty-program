#!/usr/bin/env node

/**
 * Simple Training System Demo Server
 * Tests the API endpoints without complex routing
 */

const http = require('http');
const url = require('url');

const PORT = 3001;

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
    }
];

// Simple HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Route handling
    if (path === '/api/training/categories') {
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: mockCategories
        }));
    }
    else if (path === '/api/training/featured') {
        const featured = mockVideos.filter(v => v.isFeatured);
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: featured
        }));
    }
    else if (path === '/api/training/popular') {
        const popular = mockVideos.sort((a, b) => b.viewCount - a.viewCount);
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: popular
        }));
    }
    else if (path.startsWith('/api/training/categories/') && path.endsWith('/videos')) {
        const categoryId = path.split('/')[4];
        const videos = mockVideos.filter(v => v.categoryId._id === categoryId);
        const category = mockCategories.find(c => c._id === categoryId);
        
        res.writeHead(200);
        res.end(JSON.stringify({
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
        }));
    }
    else if (path.startsWith('/api/training/videos/')) {
        const videoId = path.split('/')[4];
        const video = mockVideos.find(v => v._id === videoId);
        
        if (!video) {
            res.writeHead(404);
            res.end(JSON.stringify({
                success: false,
                message: 'Video not found'
            }));
            return;
        }
        
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: video
        }));
    }
    else if (path === '/api/documents/categories') {
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: mockDocumentCategories
        }));
    }
    else if (path === '/api/documents/featured') {
        const featured = mockDocuments.filter(d => d.isFeatured);
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: featured
        }));
    }
    else if (path === '/api/documents/popular') {
        const popular = mockDocuments.sort((a, b) => b.downloadCount - a.downloadCount);
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: popular
        }));
    }
    else if (path === '/health') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'OK',
            message: 'Training System Demo Server'
        }));
    }
    else {
        // Default response
        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'Training System Demo API',
            availableEndpoints: [
                'GET /api/training/categories',
                'GET /api/training/featured',
                'GET /api/training/popular',
                'GET /api/training/categories/:id/videos',
                'GET /api/training/videos/:id',
                'GET /api/documents/categories',
                'GET /api/documents/featured',
                'GET /api/documents/popular',
                'GET /health'
            ],
            note: 'This is a demo server with mock data.'
        }));
    }
});

server.listen(PORT, () => {
    console.log(`
🚀 Training System Demo Server Started!

📋 Server running on: http://localhost:${PORT}

🎯 Test endpoints:
   • Training Categories: http://localhost:${PORT}/api/training/categories
   • Featured Videos: http://localhost:${PORT}/api/training/featured
   • Document Categories: http://localhost:${PORT}/api/documents/categories
   • Health Check: http://localhost:${PORT}/health

💡 This is a demo server with mock data.
   To use with real database, set up MongoDB and run migrations.

Press Ctrl+C to stop the server.
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down demo server...');
    server.close(() => {
        console.log('✅ Server stopped.');
        process.exit(0);
    });
});
