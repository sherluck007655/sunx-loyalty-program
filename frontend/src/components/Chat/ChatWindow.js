import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  XMarkIcon,
  UserCircleIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/formatters';
import { chatService } from '../../services/chatService';
import toast from 'react-hot-toast';

const ChatWindow = ({ conversation, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😊', '😂', '👍', '👎', '❤️', '🎉', '🤔', '😢', '😮', '🔥', '💯', '🙏'];

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation]);

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

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(conversation.id);
      setMessages(response.messages);
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

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

  const otherParticipant = conversation?.participants?.find(p => p.id !== currentUser?.id);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {otherParticipant?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {otherParticipant?.name || 'Support'}
            </h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUser?.id ||
                                    (currentUser?.userType === 'admin' && message.senderType === 'admin') ||
                                    (currentUser?.userType === 'installer' && message.senderType === 'installer');
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-full resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="grid grid-cols-6 gap-1">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
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
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
