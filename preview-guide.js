#!/usr/bin/env node

/**
 * Preview User Guide in Browser
 * Simple HTTP server to preview the user guide
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/guide') {
        // Serve the HTML guide
        const htmlPath = path.join(__dirname, 'sunx-installer-guide.html');
        
        if (fs.existsSync(htmlPath)) {
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlContent);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('User guide not found. Please run: node generate-user-guide.js');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

server.listen(PORT, () => {
    console.log(`
🎉 SunX Installer User Guide Preview Server Started!

📖 View the guide: http://localhost:${PORT}

🖨️  To convert to PDF:
1. Open the guide in Chrome/Edge
2. Press Ctrl+P (Print)
3. Select "Save as PDF"
4. Settings:
   - Paper size: A4
   - Margins: Minimum
   - Background graphics: ✓
   - Headers/footers: ✗
5. Save as: SunX-Installer-User-Guide.pdf

📱 The guide is fully responsive and includes:
✅ Complete loyalty program walkthrough
✅ Step-by-step instructions
✅ SunX orange branding
✅ Professional layout
✅ Mobile-friendly design
✅ Troubleshooting section

Press Ctrl+C to stop the server.
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down preview server...');
    server.close(() => {
        console.log('✅ Server stopped.');
        process.exit(0);
    });
});
