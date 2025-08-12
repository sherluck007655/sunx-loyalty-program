import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import FloatingChatWindow from './FloatingChatWindow';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);

  // Only show for installers and hide on chat page
  useEffect(() => {
    const shouldShow = userType === 'installer' && !location.pathname.includes('/chat');
    setIsVisible(shouldShow);
  }, [location.pathname, userType]);

  // Load unread count
  useEffect(() => {
    if (user && isVisible) {
      loadUnreadCount();
      
      // Listen for new messages
      const handleNewMessage = () => {
        loadUnreadCount();
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      };

      chatService.on('message_received', handleNewMessage);
      
      return () => {
        chatService.off('message_received', handleNewMessage);
      };
    }
  }, [user, isVisible]);

  const loadUnreadCount = async () => {
    try {
      const conversations = await chatService.getConversations(userType, user.id);
      const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleChatClick = () => {
    setShowChatWindow(!showChatWindow);
  };

  if (!isVisible || !user) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {/* Chat Button */}
        <button
          onClick={handleChatClick}
          className={`relative w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
            isAnimating ? 'animate-bounce' : ''
          }`}
          title="Chat with Support"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6 mx-auto" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}

          {/* Pulse Animation for New Messages */}
          {isAnimating && (
            <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-75"></div>
          )}
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Chat with Support'}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Floating Chat Window */}
      {showChatWindow && (
        <FloatingChatWindow
          isOpen={showChatWindow}
          onClose={() => setShowChatWindow(false)}
          currentUser={user}
        />
      )}
    </>
  );
};

export default FloatingChatButton;
