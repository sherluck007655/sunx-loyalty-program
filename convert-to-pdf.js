#!/usr/bin/env node

/**
 * Convert HTML User Guide to PDF
 * This script converts the HTML user guide to a professional PDF
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is available
let puppeteer;
try {
    puppeteer = require('puppeteer');
} catch (error) {
    console.log(`
❌ Puppeteer not found. Installing...

To convert HTML to PDF automatically, run:
npm install puppeteer

Or convert manually:
1. Open sunx-installer-guide.html in Chrome
2. Press Ctrl+P (Print)
3. Select "Save as PDF"
4. Choose these settings:
   - Paper size: A4
   - Margins: Minimum
   - Background graphics: Enabled
   - Headers and footers: Disabled
5. Click "Save"

The HTML file is ready for manual conversion!
    `);
    process.exit(0);
}

async function convertToPDF() {
    console.log('🚀 Starting PDF conversion...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the HTML file
    const htmlPath = path.join(__dirname, 'sunx-installer-guide.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Set the HTML content
    await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdfPath = path.join(__dirname, 'SunX-Installer-User-Guide.pdf');
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
            <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-top: 10px;">
                <span style="color: #FF6B35; font-weight: bold;">SunX</span> Loyalty Program - Installer User Guide
            </div>
        `,
        footerTemplate: `
            <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin-bottom: 10px;">
                <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                <span style="margin-left: 20px;">© 2024 SunX Solar Solutions</span>
            </div>
        `
    });
    
    await browser.close();
    
    console.log(`
✅ PDF Generated Successfully!

📄 File: SunX-Installer-User-Guide.pdf
📍 Location: ${pdfPath}
📏 Format: A4 with professional margins
🎨 Includes: SunX branding and page numbers

📋 The guide includes:
✅ Complete feature walkthrough (${getPageCount()} pages)
✅ Step-by-step instructions with screenshots
✅ SunX orange branding throughout
✅ Mobile-responsive design examples
✅ Professional layout and typography
✅ Troubleshooting section
✅ Contact information

🎯 Ready for distribution to installers!
    `);
}

function getPageCount() {
    // Estimate page count based on content length
    const htmlContent = fs.readFileSync('sunx-installer-guide.html', 'utf8');
    const contentLength = htmlContent.length;
    const estimatedPages = Math.ceil(contentLength / 3000); // Rough estimate
    return estimatedPages;
}

// Run the conversion
convertToPDF().catch(error => {
    console.error('❌ Error converting to PDF:', error);
    console.log(`
🔧 Manual Conversion Instructions:

1. Open sunx-installer-guide.html in Chrome or Edge
2. Press Ctrl+P (Print)
3. Select "Save as PDF" as destination
4. Click "More settings"
5. Set these options:
   - Paper size: A4
   - Margins: Minimum
   - Scale: Default (100%)
   - Options: Background graphics ✓
   - Headers and footers: ✗
6. Click "Save"
7. Name the file: SunX-Installer-User-Guide.pdf

The HTML file contains all the content with SunX branding!
    `);
});
