import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { chatService } from '../../services/chatService';
import toast from 'react-hot-toast';

const AdminNewChatModal = ({ isOpen, onClose, onChatCreated, currentUser }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
      setSelectedUser(null);
      setSearchTerm('');
      setMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim()) {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.loyaltyCardId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchTerm, availableUsers]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      
      // Get all installers
      const response = await adminService.getInstallers(1, 100);
      const installers = response.data.installers || [];
      
      // Filter out installers who already have conversations
      const conversations = await chatService.getConversations('admin', currentUser.id);
      const existingUserIds = conversations.map(conv => 
        conv.participants.find(p => p.type === 'installer')?.id
      ).filter(Boolean);
      
      const availableInstallers = installers
        .filter(installer => !existingUserIds.includes(installer.id))
        .map(installer => ({
          id: installer.id,
          name: installer.name,
          email: installer.email,
          loyaltyCardId: installer.loyaltyCardId,
          type: 'installer',
          status: installer.status || 'active'
        }));
      
      setAvailableUsers(availableInstallers);
      setFilteredUsers(availableInstallers);
    } catch (error) {
      console.error('Error loading available users:', error);
      toast.error('Failed to load available users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to start conversation with');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter an initial message');
      return;
    }

    try {
      setCreating(true);
      
      const conversation = await chatService.startConversation(
        selectedUser.id,
        selectedUser.type,
        message.trim(),
        currentUser
      );
      
      onChatCreated(conversation);
      toast.success(`Started conversation with ${selectedUser.name}`);
      onClose();
      
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateChat();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Start New Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search installers by name, email, or card ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* User List */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Installer ({filteredUsers.length} available)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              {loading ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {searchTerm ? 'No installers found matching your search' : 'No new installers available for chat'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email} • {user.loyaltyCardId}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChat}
              disabled={!selectedUser || !message.trim() || creating}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="h-4 w-4" />
              )}
              <span>{creating ? 'Starting...' : 'Start Conversation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewChatModal;
