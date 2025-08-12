import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  MinusIcon,
  UserCircleIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { chatService } from '../../services/chatService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const FloatingChatWindow = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😊', '😂', '👍', '👎', '❤️', '🎉', '🤔', '😢', '😮', '🔥', '💯', '🙏'];

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for new messages only if conversation exists
    if (!conversation) return;

    const handleNewMessage = (message) => {
      if (message.chatId === conversation.id) {
        setMessages(prev => {
          // Prevent duplicate messages
          const messageExists = prev.some(m => m.id === message.id);
          if (messageExists) return prev;
          return [...prev, message];
        });
      }
    };

    chatService.on('message_received', handleNewMessage);
    chatService.on('message_sent', handleNewMessage);

    return () => {
      chatService.off('message_received', handleNewMessage);
      chatService.off('message_sent', handleNewMessage);
    };
  }, [conversation?.id]); // Only depend on conversation ID

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Validate currentUser
      if (!currentUser || !currentUser.id) {
        console.error('FloatingChatWindow: currentUser is invalid:', currentUser);
        toast.error('User information not available. Please refresh the page.');
        return;
      }

      // Get or create conversation with admin
      const conversations = await chatService.getConversations('installer', currentUser.id);
      let adminConversation = conversations.find(conv =>
        conv.participants.some(p => p.type === 'admin')
      );

      if (!adminConversation) {
        // Create new conversation with admin using current user info (without auto message)
        const userInfo = {
          id: currentUser.id,
          name: currentUser.name || 'Current User',
          userType: 'installer'
        };

        console.log('Creating new conversation for user:', userInfo);

        // Create conversation without initial message
        adminConversation = await chatService.createConversation(
          'admin-1',
          'admin',
          userInfo
        );
      }

      setConversation(adminConversation);

      // Load messages
      const response = await chatService.getMessages(adminConversation.id);
      setMessages(response.messages);

      console.log('Chat initialized successfully for user:', currentUser.name);

    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !conversation) return;

    try {
      setSending(true);
      await chatService.sendMessage(conversation.id, newMessage.trim(), 'text', [], currentUser);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const getMessageStatus = (message) => {
    switch (message.status) {
      case 'sending':
        return <ClockIcon className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <CheckIcon className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <div className="flex"><CheckIcon className="h-3 w-3 text-gray-400" /><CheckIcon className="h-3 w-3 text-gray-400 -ml-1" /></div>;
      case 'read':
        return <div className="flex"><CheckIcon className="h-3 w-3 text-blue-500" /><CheckIcon className="h-3 w-3 text-blue-500 -ml-1" /></div>;
      default:
        return null;
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className={`w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </div>
            <div>
              <h3 className="font-medium text-sm">Admin Support</h3>
              <p className="text-xs opacity-90">Online</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser?.id || message.senderType === 'installer';
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              isCurrentUser
                                ? 'bg-primary-500 text-white rounded-br-md'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.message}</p>
                          </div>
                          
                          <div className={`flex items-center mt-1 space-x-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {isCurrentUser && (
                              <div className="flex items-center">
                                {getMessageStatus(message)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <FaceSmileIcon className="h-4 w-4" />
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                          <div className="grid grid-cols-6 gap-1">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleEmojiClick(emoji)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`p-2 rounded-full transition-colors ${
                    newMessage.trim() && !sending
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingChatWindow;
