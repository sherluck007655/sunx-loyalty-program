import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  XMarkIcon,
  StarIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { chatService } from '../../services/chatService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const EnhancedChatWindow = ({ conversation, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setLoading(true);
      const response = await chatService.getMessages(conversation.id);
      const messageList = response.messages || [];

      // Ensure messages are sorted chronologically (oldest first, newest last)
      messageList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      console.log(`📨 Loaded ${messageList.length} messages for conversation ${conversation.id}`);
      setMessages(messageList);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversation) return;

    try {
      setSending(true);
      await chatService.sendMessage(
        conversation.id,
        newMessage.trim(),
        'text',
        [],
        currentUser
      );
      
      setNewMessage('');
      await loadMessages(); // Reload messages to show the new one
      
      // Focus back to input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleMarkAsImportant = async () => {
    try {
      await chatService.markConversationAsImportant(conversation.id);
      toast.success('Conversation importance updated');
      setShowActions(false);
    } catch (error) {
      toast.error('Failed to update importance');
    }
  };

  const handleMuteNotifications = async () => {
    try {
      await chatService.muteConversationNotifications(conversation.id);
      toast.success('Notification settings updated');
      setShowActions(false);
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleExportConversation = async () => {
    try {
      await chatService.exportConversation(conversation.id);
      toast.success('Conversation exported successfully');
      setShowActions(false);
    } catch (error) {
      toast.error('Failed to export conversation');
    }
  };

  const handleDeleteConversation = async () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await chatService.deleteConversation(conversation.id);
        toast.success('Conversation deleted successfully');
        onClose();
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
    setShowActions(false);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Welcome to SunX Chat
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Select a conversation from the sidebar to start messaging, or create a new conversation to get started.
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              otherParticipant?.type === 'admin' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}>
              <span className="text-white font-medium text-sm">
                {otherParticipant?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {otherParticipant?.name || 'Unknown User'}
              </h3>
              {conversation.isImportant && (
                <StarIconSolid className="h-4 w-4 text-yellow-500" />
              )}
              {conversation.isMuted && (
                <SpeakerXMarkIcon className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">Online</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toast.info('Voice call feature coming soon')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Voice Call"
          >
            <PhoneIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => toast.info('Video call feature coming soon')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Video Call"
          >
            <VideoCameraIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Conversation Info"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="More Actions"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                <button
                  onClick={handleMarkAsImportant}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  {conversation.isImportant ? (
                    <StarIconSolid className="h-4 w-4 mr-3 text-yellow-500" />
                  ) : (
                    <StarIcon className="h-4 w-4 mr-3" />
                  )}
                  {conversation.isImportant ? 'Remove Important' : 'Mark as Important'}
                </button>
                
                <button
                  onClick={handleMuteNotifications}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <SpeakerXMarkIcon className="h-4 w-4 mr-3" />
                  {conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </button>
                
                <button
                  onClick={handleExportConversation}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-3" />
                  Export Conversation
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                
                <button
                  onClick={handleDeleteConversation}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-3" />
                  Delete Conversation
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Close Chat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : Object.keys(messageGroups).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start the conversation below</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{date}</span>
                </div>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const isOwn = message.senderId === currentUser?.id;
                const showAvatar = !isOwn && (index === 0 || dateMessages[index - 1]?.senderId !== message.senderId);
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar for other user */}
                      {!isOwn && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                          showAvatar ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'invisible'
                        }`}>
                          {showAvatar && (otherParticipant?.name?.charAt(0) || 'U')}
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                        } shadow-sm`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => toast.info('File attachment feature coming soon')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="Attach File"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors resize-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => toast.info('Emoji picker coming soon')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
              title="Add Emoji"
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors disabled:cursor-not-allowed"
            title="Send Message"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      {/* Conversation Info Sidebar */}
      {showInfo && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Conversation Info</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                otherParticipant?.type === 'admin' 
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}>
                <span className="text-white font-medium text-lg">
                  {otherParticipant?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {otherParticipant?.name || 'Unknown User'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {otherParticipant?.type === 'admin' ? 'Admin' : 'Installer'}
              </p>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Messages</span>
                  <span className="text-gray-900 dark:text-white">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(conversation.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className="text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatWindow;
