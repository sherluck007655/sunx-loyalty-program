import React, { useState, useEffect } from 'react';
import {
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WhatsAppBackup = ({ isVisible, onClose, currentUser, selectedInstaller }) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill message template
    if (selectedInstaller) {
      setMessage(`Hello ${selectedInstaller.name}, this is ${currentUser?.name} from SunX Support. I'm reaching out regarding your loyalty program account. How can I assist you today?`);
    } else {
      setMessage(`Hello, this is ${currentUser?.name} from SunX Support. I'm reaching out regarding your loyalty program account. How can I assist you today?`);
    }
  }, [selectedInstaller, currentUser]);

  useEffect(() => {
    // Validate WhatsApp number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    setIsValidNumber(phoneRegex.test(whatsappNumber.replace(/\s/g, '')));
  }, [whatsappNumber]);

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Format as international number
    if (cleaned.startsWith('+92')) {
      return cleaned.replace(/(\+92)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
    } else if (cleaned.startsWith('92')) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
    } else if (cleaned.startsWith('03')) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '+92 $1 $2 $3');
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsappNumber(formatted);
  };

  const openWhatsApp = () => {
    if (!isValidNumber || !message.trim()) {
      toast.error('Please enter a valid phone number and message');
      return;
    }

    setLoading(true);
    
    // Clean phone number for WhatsApp URL
    const cleanNumber = whatsappNumber.replace(/\s/g, '').replace('+', '');
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    try {
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      toast.success('WhatsApp opened successfully');
      
      // Log the interaction
      console.log('WhatsApp backup used:', {
        number: whatsappNumber,
        installer: selectedInstaller?.name,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error('Failed to open WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleCallPhone = () => {
    if (!isValidNumber) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\s/g, '');
    window.open(`tel:${cleanNumber}`, '_self');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                WhatsApp Backup Chat
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Alternative communication method
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Warning Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Chat System Backup
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                The internal chat system is experiencing issues. Use WhatsApp as a backup communication method.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Selected Installer Info */}
          {selectedInstaller && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedInstaller.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedInstaller.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedInstaller.email} • {selectedInstaller.loyaltyCardId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={handlePhoneChange}
                placeholder="+92 300 123 4567"
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  whatsappNumber && isValidNumber
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                    : whatsappNumber && !isValidNumber
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                } text-gray-900 dark:text-white`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {whatsappNumber && (
                  isValidNumber ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the installer's WhatsApp number with country code
            </p>
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message Template
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Enter your message..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This message will be pre-filled in WhatsApp
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCallPhone}
              disabled={!isValidNumber}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <PhoneIcon className="h-5 w-5" />
              <span>Call Phone</span>
            </button>
            
            <button
              onClick={openWhatsApp}
              disabled={!isValidNumber || !message.trim() || loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  <span>Open WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              How to use WhatsApp Backup:
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Enter the installer's WhatsApp phone number</li>
              <li>Review and customize the message template</li>
              <li>Click "Open WhatsApp" to start the conversation</li>
              <li>WhatsApp will open with the pre-filled message</li>
              <li>Send the message to start communicating</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>WhatsApp Backup Ready</span>
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppBackup;
