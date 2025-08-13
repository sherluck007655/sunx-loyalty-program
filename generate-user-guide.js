#!/usr/bin/env node

/**
 * SunX Loyalty Program - User Guide Generator
 * Generates a comprehensive PDF user guide for installers
 */

const fs = require('fs');
const path = require('path');

// HTML content for the user guide
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SunX Loyalty Program - Installer User Guide</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* SunX Branding */
        .header {
            background: linear-gradient(135deg, #FF6B35, #FF8E53);
            color: white;
            padding: 40px 20px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 10px;
        }
        
        .logo {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .version {
            font-size: 0.9em;
            margin-top: 10px;
            opacity: 0.8;
        }
        
        /* Typography */
        h1 {
            color: #FF6B35;
            font-size: 2.5em;
            margin: 30px 0 20px 0;
            border-bottom: 3px solid #FF6B35;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #FF6B35;
            font-size: 1.8em;
            margin: 25px 0 15px 0;
            display: flex;
            align-items: center;
        }
        
        h3 {
            color: #FF8E53;
            font-size: 1.3em;
            margin: 20px 0 10px 0;
        }
        
        h4 {
            color: #666;
            font-size: 1.1em;
            margin: 15px 0 8px 0;
        }
        
        /* Icons */
        .icon {
            width: 30px;
            height: 30px;
            background: #FF6B35;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            margin-right: 10px;
            font-size: 0.8em;
        }
        
        /* Content Sections */
        .section {
            margin-bottom: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #FF6B35;
        }
        
        .step {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border: 1px solid #e9ecef;
            position: relative;
        }
        
        .step-number {
            background: #FF6B35;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9em;
            margin-right: 10px;
        }
        
        /* Feature boxes */
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .feature-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #FF6B35;
            text-align: center;
        }
        
        .feature-icon {
            font-size: 2.5em;
            color: #FF6B35;
            margin-bottom: 10px;
        }
        
        /* Lists */
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
        }
        
        /* Highlights */
        .highlight {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        
        .tip {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        
        .warning {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        
        /* Code/URL styling */
        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #FF6B35;
            color: white;
        }
        
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        /* Footer */
        .footer {
            background: #333;
            color: white;
            padding: 30px 20px;
            text-align: center;
            margin-top: 50px;
            border-radius: 10px;
        }
        
        .footer-logo {
            font-size: 1.5em;
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 10px;
        }
        
        /* Print styles */
        @media print {
            body {
                font-size: 12pt;
            }
            
            .container {
                max-width: none;
                margin: 0;
                padding: 0;
            }
            
            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            
            h1, h2 {
                page-break-after: avoid;
            }
            
            .step {
                page-break-inside: avoid;
            }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .feature-grid {
                grid-template-columns: 1fr;
            }
            
            .logo {
                font-size: 2em;
            }
            
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">SunX</div>
            <div class="subtitle">Loyalty Program - Installer User Guide</div>
            <div class="version">Version 2.0 | Complete Feature Guide</div>
        </div>

        <!-- Table of Contents -->
        <div class="section">
            <h2><span class="icon">📋</span>Table of Contents</h2>
            <ol>
                <li><a href="#getting-started">Getting Started</a></li>
                <li><a href="#dashboard">Dashboard Overview</a></li>
                <li><a href="#profile">Profile Management</a></li>
                <li><a href="#serial-numbers">Serial Number Management</a></li>
                <li><a href="#payments">Payment & Rewards</a></li>
                <li><a href="#promotions">Promotions & Bonuses</a></li>
                <li><a href="#training">Training Center</a></li>
                <li><a href="#downloads">Download Center</a></li>
                <li><a href="#mobile">Mobile App Usage</a></li>
                <li><a href="#troubleshooting">Troubleshooting</a></li>
            </ol>
        </div>

        <!-- Getting Started -->
        <div class="section" id="getting-started">
            <h1><span class="icon">🚀</span>Getting Started</h1>
            
            <h3>Welcome to SunX Loyalty Program!</h3>
            <p>The SunX Loyalty Program is designed to reward installers for their dedication and quality work. Earn points for every installation, access training materials, download technical documents, and get rewarded for your expertise.</p>
            
            <div class="feature-grid">
                <div class="feature-box">
                    <div class="feature-icon">💰</div>
                    <h4>Earn Rewards</h4>
                    <p>Get points for every serial number registration and convert them to cash rewards</p>
                </div>
                <div class="feature-box">
                    <div class="feature-icon">🎓</div>
                    <h4>Learn & Grow</h4>
                    <p>Access comprehensive training videos and technical documentation</p>
                </div>
                <div class="feature-box">
                    <div class="feature-icon">📱</div>
                    <h4>Mobile Ready</h4>
                    <p>Use the program on any device - desktop, tablet, or smartphone</p>
                </div>
            </div>

            <h3>System Requirements</h3>
            <ul>
                <li><strong>Web Browser:</strong> Chrome, Firefox, Safari, or Edge (latest versions)</li>
                <li><strong>Internet Connection:</strong> Required for all features</li>
                <li><strong>Mobile Device:</strong> iOS 12+ or Android 8+ for mobile app</li>
                <li><strong>Camera:</strong> Required for QR code scanning (mobile)</li>
            </ul>

            <h3>Account Registration</h3>
            <div class="step">
                <span class="step-number">1</span>
                <strong>Visit the Registration Page:</strong> Go to the SunX Loyalty Program website and click "Register"
            </div>
            <div class="step">
                <span class="step-number">2</span>
                <strong>Fill Your Details:</strong> Enter your name, email, phone number, and company information
            </div>
            <div class="step">
                <span class="step-number">3</span>
                <strong>Verify Your Account:</strong> Check your email for verification link and click to activate
            </div>
            <div class="step">
                <span class="step-number">4</span>
                <strong>Complete Profile:</strong> Add your professional details and upload profile picture
            </div>

            <div class="tip">
                <strong>💡 Pro Tip:</strong> Use your professional email address for registration to ensure you receive all important notifications and updates.
            </div>
        </div>

        <!-- Dashboard -->
        <div class="section" id="dashboard">
            <h1><span class="icon">📊</span>Dashboard Overview</h1>
            
            <p>Your dashboard is the central hub where you can see all your activity, earnings, and quick access to all features.</p>

            <h3>Dashboard Components</h3>
            
            <h4>📈 Statistics Cards</h4>
            <ul>
                <li><strong>Total Points:</strong> Your current point balance</li>
                <li><strong>Total Earnings:</strong> Cash rewards earned to date</li>
                <li><strong>Serial Numbers:</strong> Total registrations submitted</li>
                <li><strong>Pending Payments:</strong> Rewards awaiting processing</li>
            </ul>

            <h4>📋 Recent Activity</h4>
            <ul>
                <li>Latest serial number registrations</li>
                <li>Recent point earnings</li>
                <li>Payment status updates</li>
                <li>Promotion notifications</li>
            </ul>

            <h4>🎯 Quick Actions</h4>
            <ul>
                <li>Register new serial numbers</li>
                <li>Request payment</li>
                <li>View current promotions</li>
                <li>Access training materials</li>
            </ul>

            <div class="highlight">
                <strong>🔔 Notifications:</strong> Check the notification bell regularly for important updates, new promotions, and payment confirmations.
            </div>
        </div>

        <!-- Profile Management -->
        <div class="section" id="profile">
            <h1><span class="icon">👤</span>Profile Management</h1>
            
            <h3>Accessing Your Profile</h3>
            <div class="step">
                <span class="step-number">1</span>
                Click on your profile picture or name in the top navigation
            </div>
            <div class="step">
                <span class="step-number">2</span>
                Select "Profile" from the dropdown menu
            </div>

            <h3>Profile Information</h3>
            <table>
                <tr>
                    <th>Field</th>
                    <th>Description</th>
                    <th>Required</th>
                </tr>
                <tr>
                    <td>Full Name</td>
                    <td>Your complete legal name</td>
                    <td>Yes</td>
                </tr>
                <tr>
                    <td>Email</td>
                    <td>Primary contact email</td>
                    <td>Yes</td>
                </tr>
                <tr>
                    <td>Phone Number</td>
                    <td>Contact phone number</td>
                    <td>Yes</td>
                </tr>
                <tr>
                    <td>Company Name</td>
                    <td>Your installation company</td>
                    <td>Optional</td>
                </tr>
                <tr>
                    <td>Address</td>
                    <td>Business or home address</td>
                    <td>Required for payments</td>
                </tr>
                <tr>
                    <td>Bank Details</td>
                    <td>For payment processing</td>
                    <td>Required for payments</td>
                </tr>
            </table>

            <h3>Updating Your Profile</h3>
            <div class="step">
                <span class="step-number">1</span>
                <strong>Edit Information:</strong> Click "Edit Profile" button
            </div>
            <div class="step">
                <span class="step-number">2</span>
                <strong>Make Changes:</strong> Update any field as needed
            </div>
            <div class="step">
                <span class="step-number">3</span>
                <strong>Save Changes:</strong> Click "Save" to update your profile
            </div>

            <div class="warning">
                <strong>⚠️ Important:</strong> Keep your contact information and bank details up to date to ensure smooth payment processing.
            </div>
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('sunx-installer-guide.html', htmlContent);

console.log(`
🎉 SunX Installer User Guide HTML Generated!

📄 File created: sunx-installer-guide.html

🔧 To convert to PDF:
1. Open the HTML file in Chrome/Edge
2. Press Ctrl+P (Print)
3. Select "Save as PDF"
4. Choose "More settings" → "Paper size: A4"
5. Set margins to "Minimum"
6. Enable "Background graphics"
7. Click "Save"

📱 The guide includes:
✅ Complete feature walkthrough
✅ Step-by-step instructions
✅ SunX orange branding
✅ Mobile-responsive design
✅ Professional layout

🎯 Next: I'll continue adding more sections...
`);
