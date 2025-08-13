#!/usr/bin/env node

/**
 * Preview Tutorial Guide in Browser
 * Simple HTTP server to preview the tutorial-focused user guide
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3003;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/guide') {
        // Serve the HTML guide
        const htmlPath = path.join(__dirname, 'complete-tutorial-guide.html');
        
        if (fs.existsSync(htmlPath)) {
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Tutorial guide not found.');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

server.listen(PORT, () => {
    console.log(`
🎉 SunX Installer Tutorial Guide Preview Server Started!

📖 View the guide: http://localhost:${PORT}

🎯 Tutorial Features:
✅ First-time user walkthrough
✅ Step-by-step registration process
✅ Dashboard explanation with meanings
✅ Profile setup requirements
✅ Serial number registration tutorial
✅ Payment process and admin timeline
✅ Complete workflow from installation to payment
✅ Troubleshooting common issues
✅ NO mobile app details (as requested)
✅ Focus on web-based workflow

🖨️  To convert to PDF:
1. Open the guide in Chrome/Edge
2. Press Ctrl+P (Print)
3. Select "Save as PDF"
4. Settings:
   - Paper size: A4
   - Margins: Minimum
   - Background graphics: ✓
   - Headers/footers: ✗
5. Save as: SunX-Installer-Tutorial-Guide.pdf

📱 The guide is fully responsive and includes:
✅ Tutorial-focused approach
✅ What happens when admin reviews
✅ Timeline expectations
✅ Action-required indicators
✅ Complete workflow guide
✅ SunX orange branding throughout

Press Ctrl+C to stop the server.
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down tutorial guide preview server...');
    server.close(() => {
        console.log('✅ Server stopped.');
        process.exit(0);
    });
});
