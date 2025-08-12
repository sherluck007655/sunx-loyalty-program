// Mock email service for demonstration
// In production, integrate with services like SendGrid, Mailgun, or AWS SES

const sendEmail = async (to, subject, message, type = 'text') => {
  try {
    // Mock email sending - log to console
    console.log('=== EMAIL NOTIFICATION ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Type: ${type}`);
    console.log('========================');

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const sendWelcomeEmail = async (installer) => {
  const subject = 'Welcome to SunX Loyalty Program!';
  const message = `
    Dear ${installer.name},

    Welcome to the SunX Loyalty Program! 

    Your loyalty card ID is: ${installer.loyaltyCardId}

    You can now start submitting inverter serial numbers to earn points and rewards.
    
    For every 10 inverters you install, you'll be eligible for payment rewards.

    Best regards,
    SunX Team
  `;

  return await sendEmail(installer.email, subject, message);
};

const sendMilestoneEmail = async (installer, milestone) => {
  const subject = 'Congratulations! Milestone Achieved!';
  const message = `
    Dear ${installer.name},

    Congratulations! You have successfully installed ${milestone} inverters and are now eligible for payment.

    Your current stats:
    - Total Inverters: ${installer.totalInverters}
    - Total Points: ${installer.totalPoints}
    - Loyalty Card ID: ${installer.loyaltyCardId}

    Please check your dashboard to submit a payment request.

    Best regards,
    SunX Team
  `;

  return await sendEmail(installer.email, subject, message);
};

const sendPromotionCompletedEmail = async (installer, promotion) => {
  const subject = 'Promotion Completed - Bonus Earned!';
  const message = `
    Dear ${installer.name},

    Congratulations! You have successfully completed the promotion: "${promotion.title}"

    You have earned a bonus of ${promotion.bonusAmount} ${promotion.currency}!

    The bonus will be processed and added to your next payment.

    Best regards,
    SunX Team
  `;

  return await sendEmail(installer.email, subject, message);
};

const sendPaymentApprovedEmail = async (installer, payment) => {
  const subject = 'Payment Approved!';
  const message = `
    Dear ${installer.name},

    Good news! Your payment request has been approved.

    Payment Details:
    - Amount: ${payment.amount} ${payment.currency}
    - Description: ${payment.description}
    - Status: ${payment.status}

    The payment will be processed to your registered bank account within 3-5 business days.

    Best regards,
    SunX Team
  `;

  return await sendEmail(installer.email, subject, message);
};

const sendPaymentRejectedEmail = async (installer, payment) => {
  const subject = 'Payment Request Update';
  const message = `
    Dear ${installer.name},

    We regret to inform you that your payment request has been rejected.

    Payment Details:
    - Amount: ${payment.amount} ${payment.currency}
    - Description: ${payment.description}
    - Rejection Reason: ${payment.rejectionReason}

    Please contact our support team if you have any questions.

    Best regards,
    SunX Team
  `;

  return await sendEmail(installer.email, subject, message);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendMilestoneEmail,
  sendPromotionCompletedEmail,
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail
};
