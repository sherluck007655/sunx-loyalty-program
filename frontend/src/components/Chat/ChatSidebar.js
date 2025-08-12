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
  ExclamationTriangleIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
  DocumentArrowDownIcon,
  TagIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { chatService } from '../../services/chatService';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import AdminNewChatModal from './AdminNewChatModal';

const ChatSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onStartNewChat,
  onDeleteConversation,
  onRefreshConversations,
  currentUser,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const dropdownRef = useRef(null);
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== currentUser?.id);
        return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               conv.lastMessage?.message.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchTerm, currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation(); // Prevent selecting the conversation
    setOpenDropdown(null); // Close dropdown

    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        await chatService.deleteConversation(conversationId);
        if (onDeleteConversation) {
          onDeleteConversation(conversationId);
        }
        toast.success('Conversation deleted successfully');
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
      }
    }
  };

  const handleHideConversation = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);

    // TODO: Implement hide functionality
    toast.info('Hide conversation feature coming soon');
  };

  const handleArchiveConversation = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);

    // TODO: Implement archive functionality
    toast.info('Archive conversation feature coming soon');
  };

  const handleMarkAsImportant = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);

    try {
      await chatService.markConversationAsImportant(conversationId);
      toast.success('Conversation marked as important');
      // Refresh conversations to show updated state
      if (onRefreshConversations) {
        onRefreshConversations();
      }
    } catch (error) {
      toast.error('Failed to mark as important');
    }
  };

  const handleMuteNotifications = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);

    try {
      await chatService.muteConversationNotifications(conversationId);
      toast.success('Notifications muted for this conversation');
      if (onRefreshConversations) {
        onRefreshConversations();
      }
    } catch (error) {
      toast.error('Failed to mute notifications');
    }
  };

  const handleAddParticipants = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);

    // TODO: Open add participants modal
    toast.info('Add participants feature coming soon');
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

  const handleAddTags = async (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(null);

    // TODO: Open tags modal
    toast.info('Add tags feature coming soon');
  };

  const toggleDropdown = (conversationId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === conversationId ? null : conversationId);
  };

  const handleNewChatCreated = (conversation) => {
    if (onRefreshConversations) {
      onRefreshConversations();
    }
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-primary-500" />
            Messages
          </h2>
          
          {currentUser?.userType === 'admin' && (
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              title="Start new conversation"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && currentUser?.userType === 'installer' && (
              <button
                onClick={onStartNewChat}
                className="mt-3 btn-primary text-sm"
              >
                Start a conversation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
              const isSelected = selectedConversation?.id === conversation.id;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`group p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        otherParticipant?.type === 'admin' 
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        <span className="text-white font-medium">
                          {otherParticipant?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>

                      {/* Important indicator */}
                      {conversation.isImportant && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                          <StarIconSolid className="h-2 w-2 text-white" />
                        </div>
                      )}

                      {/* Muted indicator */}
                      {conversation.isMuted && (
                        <div className="absolute top-0 right-0 w-4 h-4 bg-gray-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                          <SpeakerXMarkIcon className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-medium truncate ${
                            hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {otherParticipant?.name || 'Unknown User'}
                          </h3>
                          {conversation.tags && conversation.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {conversation.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {tag}
                                </span>
                              ))}
                              {conversation.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{conversation.tags.length - 2}</span>
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

                          {/* Three-dots menu for admin users */}
                          {currentUser?.userType === 'admin' && (
                            <div className="relative ml-2" ref={dropdownRef}>
                              <button
                                onClick={(e) => toggleDropdown(conversation.id, e)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-full transition-colors"
                                title="More options"
                              >
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {openDropdown === conversation.id && (
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
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
                                      onClick={(e) => handleAddParticipants(conversation.id, e)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <UserPlusIcon className="h-4 w-4 mr-3" />
                                      Add Participants
                                    </button>

                                    <button
                                      onClick={(e) => handleExportConversation(conversation.id, e)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <DocumentArrowDownIcon className="h-4 w-4 mr-3" />
                                      Export Conversation
                                    </button>

                                    <button
                                      onClick={(e) => handleAddTags(conversation.id, e)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <TagIcon className="h-4 w-4 mr-3" />
                                      Add Tags
                                    </button>

                                    <hr className="my-1 border-gray-200 dark:border-gray-600" />

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
                          )}
                        </div>
                      </div>

                      {/* Last Message */}
                      {conversation.lastMessage && (
                        <div className="mt-1">
                          <p className={`text-sm truncate ${
                            hasUnread ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {conversation.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                            {truncateMessage(conversation.lastMessage.message)}
                          </p>
                        </div>
                      )}

                      {/* Participant Type Badge */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          otherParticipant?.type === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        }`}>
                          {otherParticipant?.type === 'admin' ? '👨‍💼 Admin' : '🔧 Installer'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
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

export default ChatSidebar;
