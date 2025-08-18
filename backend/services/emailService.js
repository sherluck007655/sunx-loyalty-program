const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'sunxpv@gmail.com',
          pass: 'wcxg wvaa wyjj cqle' // App password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service configuration error:', error);
        } else {
          console.log('✅ Email service is ready to send messages');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: {
          name: 'SunX Loyalty Program',
          address: 'sunxpv@gmail.com'
        },
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendPasswordResetEmail(email, resetToken, userType = 'installer') {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&type=${userType}&email=${encodeURIComponent(email)}`;

    const subject = 'Reset Your SunX Account Password';
    const htmlContent = this.getPasswordResetEmailTemplate(resetUrl, userType);

    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendWelcomeEmail(email, name, userType = 'installer') {
    const subject = 'Welcome to SunX Loyalty Program!';
    const htmlContent = this.getWelcomeEmailTemplate(name, userType);
    
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendPaymentStatusEmail(email, name, paymentDetails) {
    const subject = `Payment Status Update - SunX Loyalty Program`;
    const htmlContent = this.getPaymentStatusEmailTemplate(name, paymentDetails);
    
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendPromotionNotificationEmail(email, name, promotionDetails) {
    const subject = 'New Promotion Available - SunX Loyalty Program';
    const htmlContent = this.getPromotionEmailTemplate(name, promotionDetails);
    
    return await this.sendEmail(email, subject, htmlContent);
  }

  getPasswordResetEmailTemplate(resetUrl, userType) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 0 10px; }
            .reset-button { display: inline-block; background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .reset-button:hover { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SunX</div>
                <div class="subtitle">Loyalty Program</div>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your SunX ${userType} account. If you made this request, click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="reset-button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
                
                <div class="warning">
                    <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email or contact our support team.
                </div>
                
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
                
                <p>Best regards,<br>The SunX Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 SunX Loyalty Program. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getWelcomeEmailTemplate(name, userType) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SunX</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 0 10px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SunX</div>
                <div class="subtitle">Loyalty Program</div>
            </div>
            <div class="content">
                <h2>Welcome to SunX Loyalty Program!</h2>
                <p>Dear ${name},</p>
                <p>Welcome to the SunX Loyalty Program! We're excited to have you as a ${userType} in our community.</p>
                
                <p>Your account has been successfully created and you can now:</p>
                <ul>
                    ${userType === 'installer' ? `
                    <li>Submit serial numbers for products</li>
                    <li>Track your loyalty points</li>
                    <li>Request payments</li>
                    <li>Participate in promotions</li>
                    ` : `
                    <li>Manage installer accounts</li>
                    <li>Review payment requests</li>
                    <li>Monitor system analytics</li>
                    <li>Configure system settings</li>
                    `}
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/${userType === 'admin' ? 'admin/' : ''}login" class="cta-button">Login to Your Account</a>
                </div>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>The SunX Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 SunX Loyalty Program. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getPaymentStatusEmailTemplate(name, paymentDetails) {
    const statusColor = {
      'approved': '#28a745',
      'paid': '#ff831f',
      'rejected': '#dc3545'
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Status Update</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 0 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; text-transform: uppercase; }
            .payment-details { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SunX</div>
                <div class="subtitle">Loyalty Program</div>
            </div>
            <div class="content">
                <h2>Payment Status Update</h2>
                <p>Dear ${name},</p>
                <p>We're writing to inform you about an update to your payment request:</p>
                
                <div class="payment-details">
                    <h3>Payment Details</h3>
                    <p><strong>Amount:</strong> ${paymentDetails.currency} ${paymentDetails.amount}</p>
                    <p><strong>Type:</strong> ${paymentDetails.paymentType}</p>
                    <p><strong>Status:</strong> <span class="status-badge" style="background-color: ${statusColor[paymentDetails.status] || '#6c757d'}">${paymentDetails.status}</span></p>
                    <p><strong>Request Date:</strong> ${new Date(paymentDetails.createdAt).toLocaleDateString()}</p>
                    ${paymentDetails.transactionId ? `<p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>` : ''}
                    ${paymentDetails.rejectionReason ? `<p><strong>Reason:</strong> ${paymentDetails.rejectionReason}</p>` : ''}
                </div>
                
                ${paymentDetails.status === 'approved' ? `
                <p>Great news! Your payment request has been approved and will be processed soon.</p>
                ` : paymentDetails.status === 'paid' ? `
                <p>Excellent! Your payment has been processed successfully. You should receive the funds according to your preferred payment method.</p>
                ` : paymentDetails.status === 'rejected' ? `
                <p>Unfortunately, your payment request has been rejected. Please review the reason above and contact support if you have any questions.</p>
                ` : ''}
                
                <p>You can view all your payment requests by logging into your account.</p>
                
                <p>Best regards,<br>The SunX Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 SunX Loyalty Program. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  getPromotionEmailTemplate(name, promotionDetails) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Promotion Available</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 30px -20px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 0 10px; }
            .promotion-card { background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #ff831f; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #ff831f 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SunX</div>
                <div class="subtitle">Loyalty Program</div>
            </div>
            <div class="content">
                <h2>🎉 New Promotion Available!</h2>
                <p>Dear ${name},</p>
                <p>We're excited to announce a new promotion that you can participate in:</p>
                
                <div class="promotion-card">
                    <h3>${promotionDetails.title}</h3>
                    <p>${promotionDetails.description}</p>
                    <p><strong>Reward:</strong> ${promotionDetails.rewardType} ${promotionDetails.rewardAmount}</p>
                    <p><strong>Target:</strong> ${promotionDetails.targetQuantity} serial numbers</p>
                    <p><strong>Valid Until:</strong> ${new Date(promotionDetails.endDate).toLocaleDateString()}</p>
                </div>
                
                <p>Don't miss out on this opportunity to earn extra rewards! Log in to your account to view the full details and start participating.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/promotions" class="cta-button">View Promotion</a>
                </div>
                
                <p>Best regards,<br>The SunX Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 SunX Loyalty Program. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new EmailService();
