import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  StarIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
  DocumentArrowDownIcon,
  TagIcon,
  Cog6ToothIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { chatService } from '../../services/chatService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import AdminNewChatModal from './AdminNewChatModal';

const EnhancedChatSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onRefreshConversations,
  currentUser,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm.trim()) return true;
    
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      otherParticipant?.name?.toLowerCase().includes(searchLower) ||
      conversation.lastMessage?.message?.toLowerCase().includes(searchLower) ||
      conversation.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Sort conversations: important first, then by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // Important conversations first
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    
    // Then by last message time
    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.createdAt);
    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.createdAt);
    return bTime - aTime;
  });

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return formatDate(timestamp);
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await chatService.deleteConversation(conversationId);
        toast.success('Conversation deleted successfully');
        if (onRefreshConversations) {
          onRefreshConversations();
        }
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const handleHideConversation = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    toast.info('Hide conversation feature coming soon');
  };

  const handleArchiveConversation = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    toast.info('Archive conversation feature coming soon');
  };

  const handleMarkAsImportant = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    
    try {
      await chatService.markConversationAsImportant(conversationId);
      toast.success('Conversation importance updated');
      if (onRefreshConversations) {
        onRefreshConversations();
      }
    } catch (error) {
      toast.error('Failed to update importance');
    }
  };

  const handleMuteNotifications = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    
    try {
      await chatService.muteConversationNotifications(conversationId);
      toast.success('Notification settings updated');
      if (onRefreshConversations) {
        onRefreshConversations();
      }
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleExportConversation = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);
    
    try {
      await chatService.exportConversation(conversationId);
      toast.success('Conversation exported successfully');
    } catch (error) {
      toast.error('Failed to export conversation');
    }
  };

  const handleNewChatCreated = (conversation) => {
    if (onRefreshConversations) {
      onRefreshConversations();
    }
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  const toggleDropdown = (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === conversationId ? null : conversationId);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Chat Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            
            {/* New Chat Button for Admin */}
            {currentUser?.userType === 'admin' && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                title="Start new conversation"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New</span>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations, messages, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Quick Actions Bar */}
        {showSettings && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Quick Actions</span>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button className="p-2 text-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs">
                <ArchiveBoxIcon className="h-4 w-4 mx-auto mb-1" />
                Archive All
              </button>
              <button className="p-2 text-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs">
                <StarIcon className="h-4 w-4 mx-auto mb-1" />
                Important
              </button>
              <button className="p-2 text-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-xs">
                <SpeakerXMarkIcon className="h-4 w-4 mx-auto mb-1" />
                Muted
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {currentUser?.userType === 'admin' && !searchTerm && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Start your first conversation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
              const isSelected = selectedConversation?.id === conversation.id;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`group p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-r-4 border-primary-500' : ''
                  } ${conversation.isImportant ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Enhanced Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        otherParticipant?.type === 'admin'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600'
                      } ${hasUnread ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
                        <span className="text-white font-medium">
                          {otherParticipant?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      
                      {/* Status Indicators */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      
                      {conversation.isImportant && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                          <StarIconSolid className="h-2 w-2 text-white" />
                        </div>
                      )}
                      
                      {conversation.isMuted && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-gray-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                          <SpeakerXMarkIcon className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <h3 className={`text-sm font-medium truncate ${
                            hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {otherParticipant?.name || 'Unknown User'}
                          </h3>
                          
                          {/* Tags */}
                          {conversation.tags && conversation.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {conversation.tags.slice(0, 1).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {tag}
                                </span>
                              ))}
                              {conversation.tags.length > 1 && (
                                <span className="text-xs text-gray-500">+{conversation.tags.length - 1}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLastMessageTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}

                          {hasUnread && (
                            <div className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center ml-2">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}

                          {/* Three Dots Menu */}
                          <div className="relative" ref={dropdownRef}>
                            <button
                              onClick={(e) => toggleDropdown(conversation.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-all"
                            >
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </button>

                            {/* Enhanced Dropdown Menu */}
                            {openDropdown === conversation.id && (
                              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Conversation Actions</p>
                                </div>
                                
                                <div className="py-1">
                                  <button
                                    onClick={(e) => handleMarkAsImportant(conversation.id, e)}
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
                                    onClick={(e) => handleMuteNotifications(conversation.id, e)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <SpeakerXMarkIcon className="h-4 w-4 mr-3" />
                                    {conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                                  </button>
                                  
                                  <button
                                    onClick={(e) => handleExportConversation(conversation.id, e)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <DocumentArrowDownIcon className="h-4 w-4 mr-3" />
                                    Export Conversation
                                  </button>
                                  
                                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                                  
                                  <button
                                    onClick={(e) => handleHideConversation(conversation.id, e)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <EyeSlashIcon className="h-4 w-4 mr-3" />
                                    Hide Conversation
                                  </button>
                                  
                                  <button
                                    onClick={(e) => handleArchiveConversation(conversation.id, e)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <ArchiveBoxIcon className="h-4 w-4 mr-3" />
                                    Archive Conversation
                                  </button>
                                  
                                  <button
                                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <TrashIcon className="h-4 w-4 mr-3" />
                                    Delete Conversation
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Last Message Preview */}
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                          {conversation.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
          <span>•</span>
          <span>{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Admin New Chat Modal */}
      <AdminNewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleNewChatCreated}
        currentUser={currentUser}
      />
    </div>
  );
};

export default EnhancedChatSidebar;
