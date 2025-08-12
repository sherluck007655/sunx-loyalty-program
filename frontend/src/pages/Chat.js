import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import EnhancedChatSidebar from '../components/Chat/EnhancedChatSidebar';
import EnhancedChatWindow from '../components/Chat/EnhancedChatWindow';
import WhatsAppBackup from '../components/Chat/WhatsAppBackup';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user, userType } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showWhatsAppBackup, setShowWhatsAppBackup] = useState(false);
  const [chatError, setChatError] = useState(false);

  useEffect(() => {
    if (user) {
      initializeChat();
      loadConversations();
    }
  }, [user]);

  const initializeChat = async () => {
    try {
      await chatService.initializeSocket(user.id, userType);
      
      // Listen for new messages
      chatService.on('message_received', handleNewMessage);
      chatService.on('message_sent', handleMessageSent);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to connect to chat service');
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);

      // Validate user data
      if (!user || !user.id || !userType) {
        console.error('Chat: Invalid user data:', { user, userType });
        toast.error('User information not available. Please log in again.');
        return;
      }

      const userConversations = await chatService.getConversations(userType, user.id);
      setConversations(userConversations);

      console.log(`Loaded ${userConversations.length} conversations for ${userType} ${user.name}`);

      // Auto-select first conversation if available
      if (userConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(userConversations[0]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setChatError(true);
      toast.error('Chat system error - WhatsApp backup available');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    // Update conversations list with new message
    setConversations(prev => prev.map(conv => {
      if (conv.id === message.chatId) {
        return {
          ...conv,
          lastMessage: {
            message: message.message,
            timestamp: message.timestamp,
            senderId: message.senderId
          },
          unreadCount: selectedConversation?.id === message.chatId ? 0 : (conv.unreadCount || 0) + 1
        };
      }
      return conv;
    }));

    // Show notification if message is not from current conversation
    if (selectedConversation?.id !== message.chatId && message.senderId !== user.id) {
      toast.success(`New message from ${message.senderName}`, {
        duration: 3000,
        position: 'top-right'
      });
    }
  };

  const handleMessageSent = (message) => {
    // Update conversations list with sent message
    setConversations(prev => prev.map(conv => {
      if (conv.id === message.chatId) {
        return {
          ...conv,
          lastMessage: {
            message: message.message,
            timestamp: message.timestamp,
            senderId: message.senderId
          }
        };
      }
      return conv;
    }));
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      try {
        await chatService.markAsRead(conversation.id, []);
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        ));
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleStartNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleNewChatCreated = (newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setShowNewChatModal(false);
    toast.success('New conversation started');
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));

    // If the deleted conversation was selected, clear selection
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatService.disconnect();
    };
  }, []);

  return (
    <Layout title="Messages">
      <div className="h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900 -m-6">
        {/* Error Banner */}
        {chatError && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3 z-10">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Chat System Issue Detected
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Internal chat is experiencing problems. Use WhatsApp backup for communication.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppBackup(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Use WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Chat Sidebar */}
        <EnhancedChatSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onRefreshConversations={loadConversations}
          currentUser={user}
          loading={loading}
        />

        {/* Enhanced Chat Window */}
        <EnhancedChatWindow
          conversation={selectedConversation}
          onClose={handleCloseChat}
          currentUser={user}
        />

        {/* WhatsApp Backup Modal */}
        <WhatsAppBackup
          isVisible={showWhatsAppBackup}
          onClose={() => setShowWhatsAppBackup(false)}
          currentUser={user}
          selectedInstaller={selectedConversation ?
            selectedConversation.participants.find(p => p.id !== user?.id) : null
          }
        />
      </div>
    </Layout>
  );
};

export default Chat;
