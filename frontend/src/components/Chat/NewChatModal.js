import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { chatService } from '../../services/chatService';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const NewChatModal = ({ isOpen, onClose, onChatCreated, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [availableUsers, searchTerm]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      
      if (currentUser.userType === 'admin') {
        // Admin can chat with installers
        const response = await adminService.getInstallers(1, 100);
        const installers = response.data.installers || [];
        setAvailableUsers(installers.map(installer => ({
          id: installer.id,
          name: installer.name,
          email: installer.email,
          type: 'installer',
          status: 'online' // Mock status
        })));
      } else {
        // Installer can chat with admins
        const admins = await chatService.getOnlineUsers();
        setAvailableUsers(admins);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
      toast.error('Failed to load available users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!selectedUser || !message.trim()) {
      toast.error('Please select a user and enter a message');
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
      
      // Reset form
      setSelectedUser(null);
      setMessage('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    
    // Set default message based on user type
    if (currentUser.userType === 'installer') {
      setMessage('Hello! I need assistance with my account.');
    } else {
      setMessage(`Hello ${user.name}! How can I help you today?`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Start New Conversation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUser.userType === 'admin' ? 'Select an installer to chat with' : 'Contact support team'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Search Users */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {currentUser.userType === 'admin' ? 'Search Installers' : 'Available Support'}
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="mb-4">
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                {loading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No users found' : 'No users available'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedUser?.id === user.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.type === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}>
                            <span className="text-white font-medium text-sm">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.type === 'admin'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                              }`}>
                                {user.type === 'admin' ? '👨‍💼 Admin' : '🔧 Installer'}
                              </span>
                              <div className="ml-2 flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="ml-1 text-xs text-green-600 dark:text-green-400">Online</span>
                              </div>
                            </div>
                          </div>
                          
                          {selectedUser?.id === user.id && (
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Input */}
            {selectedUser && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateChat}
              disabled={!selectedUser || !message.trim() || creating}
              className="btn-primary"
            >
              {creating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </div>
              ) : (
                'Start Conversation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
