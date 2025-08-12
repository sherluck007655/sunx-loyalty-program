// Mock SMS service for demonstration
// In production, integrate with services like Twilio, AWS SNS, or local SMS providers

const sendSMS = async (phoneNumber, message) => {
  try {
    // Mock SMS sending - log to console
    console.log('=== SMS NOTIFICATION ===');
    console.log(`To: ${phoneNumber}`);
    console.log(`Message: ${message}`);
    console.log('======================');

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('SMS service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const sendWelcomeSMS = async (installer) => {
  const message = `Welcome to SunX Loyalty Program! Your loyalty card ID: ${installer.loyaltyCardId}. Start installing inverters to earn rewards!`;
  return await sendSMS(installer.phone, message);
};

const sendMilestoneSMS = async (installer, milestone) => {
  const message = `Congratulations! You've installed ${milestone} inverters and are eligible for payment. Check your dashboard for details.`;
  return await sendSMS(installer.phone, message);
};

const sendPromotionAlertSMS = async (installer, promotion) => {
  const message = `New promotion available: "${promotion.title}" - Install ${promotion.targetInverters} inverters to earn ${promotion.bonusAmount} ${promotion.currency}!`;
  return await sendSMS(installer.phone, message);
};

const sendPaymentUpdateSMS = async (installer, payment, status) => {
  let message;
  
  switch (status) {
    case 'approved':
      message = `Your payment of ${payment.amount} ${payment.currency} has been approved and will be processed soon.`;
      break;
    case 'paid':
      message = `Payment of ${payment.amount} ${payment.currency} has been successfully transferred to your account.`;
      break;
    case 'rejected':
      message = `Your payment request has been rejected. Please contact support for details.`;
      break;
    default:
      message = `Payment status updated: ${status}`;
  }
  
  return await sendSMS(installer.phone, message);
};

module.exports = {
  sendSMS,
  sendWelcomeSMS,
  sendMilestoneSMS,
  sendPromotionAlertSMS,
  sendPaymentUpdateSMS
};
