import { api } from './api';
import { adminNotificationService } from './adminNotificationService';

class ChatService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
    this.conversations = []; // Use array for better sorting
    this.messages = {}; // Use object for better access
    this.loadFromStorage(); // Load persisted data on initialization
  }

  // Load data from localStorage
  loadFromStorage() {
    try {
      const storedConversations = localStorage.getItem('chat_conversations');
      const storedMessages = localStorage.getItem('chat_messages');

      if (storedConversations) {
        this.conversations = JSON.parse(storedConversations);
        console.log('Loaded conversations:', this.conversations.length);
      } else {
        this.conversations = [];
      }

      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
        console.log('Loaded messages for chats:', Object.keys(this.messages).length);
      } else {
        this.messages = {};
      }
    } catch (error) {
      console.error('Error loading chat data from storage:', error);
      this.conversations = [];
      this.messages = {};
    }
  }

  // Save data to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('chat_conversations', JSON.stringify(this.conversations));
      localStorage.setItem('chat_messages', JSON.stringify(this.messages));
      console.log('Saved to storage - Conversations:', this.conversations.length, 'Messages:', Object.keys(this.messages).length);
    } catch (error) {
      console.error('Error saving chat data to storage:', error);
    }
  }

  // Clear all chat data (for testing/debugging)
  clearStorage() {
    try {
      localStorage.removeItem('chat_conversations');
      localStorage.removeItem('chat_messages');
      this.conversations = [];
      this.messages = {};
      console.log('Chat storage cleared');
    } catch (error) {
      console.error('Error clearing chat storage:', error);
    }
  }

  // Initialize WebSocket connection (simulated for demo)
  initializeSocket(userId, userType) {
    // In a real application, this would connect to a WebSocket server
    console.log(`Initializing chat socket for ${userType} ${userId}`);
    
    // Simulate WebSocket events
    this.simulateSocketEvents();
    
    return Promise.resolve();
  }

  // Simulate WebSocket events for demo (disabled auto-replies)
  simulateSocketEvents() {
    // Auto-reply simulation disabled for better user experience
    // In a real application, this would handle actual WebSocket events
    console.log('Chat service initialized - ready for real-time messaging');
  }

  // Removed simulateIncomingMessage to prevent auto-replies

  // Get chat conversations
  async getConversations(userType, userId) {
    try {
      // Validate input parameters
      if (!userType || !userId) {
        console.warn('getConversations called with invalid parameters:', { userType, userId });
        return [];
      }

      // No default conversations - start with clean slate
      // Conversations will be created only when users actually start chatting

      // Work with a copy to avoid mutations
      let conversations = [...this.conversations];

      // Remove duplicate conversations (same installer) and sort by last activity
      const uniqueConversations = [];
      const seenInstallers = new Set();

      // Sort conversations by last message timestamp (newest first, so most recent conversations appear at top)
      conversations.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.createdAt);
        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.createdAt);
        return bTime - aTime; // Most recent conversations at top
      });

      conversations.forEach(conv => {
        const installer = conv.participants.find(p => p.type === 'installer');
        if (installer) {
          if (!seenInstallers.has(installer.id)) {
            seenInstallers.add(installer.id);
            uniqueConversations.push(conv);
          }
        } else {
          uniqueConversations.push(conv);
        }
      });

      conversations = uniqueConversations;
      this.conversations = conversations;
      this.saveToStorage(); // Save cleaned conversations

      // Update conversations with latest messages from memory
      conversations.forEach(conv => {
        const chatMessages = this.messages[conv.id] || [];
        if (chatMessages.length > 0) {
          const lastMessage = chatMessages[chatMessages.length - 1];
          conv.lastMessage = {
            message: lastMessage.message,
            timestamp: lastMessage.timestamp,
            senderId: lastMessage.senderId
          };

          // Update unread count based on user type
          if (userType === 'admin') {
            const unreadMessages = chatMessages.filter(msg =>
              msg.senderType === 'installer' && msg.status !== 'read'
            );
            conv.unreadCount = unreadMessages.length;
          } else if (userType === 'installer') {
            const unreadMessages = chatMessages.filter(msg =>
              msg.senderType === 'admin' && msg.status !== 'read'
            );
            conv.unreadCount = unreadMessages.length;
          }
        }
      });

      // Filter conversations based on user type
      if (userType === 'installer') {
        return conversations.filter(conv =>
          conv.participants.some(p => p.id === userId && p.type === 'installer')
        );
      }

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getMessages(chatId, page = 1, limit = 50) {
    try {
      // Get stored messages
      let messages = this.messages[chatId] || [];

      // No demo messages - all chats start empty


      // Sort messages chronologically (oldest first, newest last) so new messages appear at bottom
      messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      console.log(`📨 Retrieved ${messages.length} messages for chat ${chatId}, sorted chronologically (oldest to newest)`);

      return {
        messages: messages, // Chronological order - new messages at bottom
        hasMore: false,
        total: messages.length
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatId, message, type = 'text', attachments = [], currentUser = null) {
    try {
      const newMessage = {
        id: `msg-${Date.now()}`,
        chatId,
        senderId: currentUser?.id || 'current-user',
        senderName: currentUser?.name || 'Current User',
        senderType: currentUser?.userType || 'installer',
        message,
        timestamp: new Date().toISOString(),
        type,
        attachments,
        status: 'sent' // New messages start as 'sent', become 'read' when marked as read
      };

      // Store message in memory (prevent duplicates)
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }

      const existingMessages = this.messages[chatId];
      const messageExists = existingMessages.some(m => m.id === newMessage.id);

      if (!messageExists) {
        existingMessages.push(newMessage);
        this.saveToStorage(); // Save after adding message
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update status to sent
      newMessage.status = 'sent';

      // Emit message sent event only once
      this.emit('message_sent', newMessage);

      // Update conversation with new message (prevent duplicates)
      let conversationIndex = this.conversations.findIndex(conv => conv.id === chatId);

      // If conversation doesn't exist, check if there's already a conversation with the same participants
      if (conversationIndex === -1 && newMessage.senderType === 'installer') {
        conversationIndex = this.conversations.findIndex(conv =>
          conv.participants.some(p => p.id === newMessage.senderId && p.type === 'installer')
        );

        // If found existing conversation with same installer, use that chatId instead
        if (conversationIndex !== -1) {
          const existingConv = this.conversations[conversationIndex];
          // Update the message's chatId to match existing conversation
          newMessage.chatId = existingConv.id;
          chatId = existingConv.id;

          // Move messages to existing conversation
          const existingMessages = this.messages[existingConv.id] || [];
          const newMessages = this.messages[chatId] || [];
          this.messages[existingConv.id] = [...existingMessages, ...newMessages.filter(m => m.id !== newMessage.id), newMessage];
          if (chatId !== existingConv.id) {
            delete this.messages[chatId];
          }
        }
      }

      if (conversationIndex !== -1) {
        this.conversations[conversationIndex].lastMessage = {
          id: newMessage.id,
          message: newMessage.message,
          timestamp: newMessage.timestamp,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          senderType: newMessage.senderType
        };

        // Update unread count based on message sender
        if (newMessage.senderType === 'installer') {
          // Installer message increases admin's unread count
          this.conversations[conversationIndex].unreadCount = (this.conversations[conversationIndex].unreadCount || 0) + 1;
        } else if (newMessage.senderType === 'admin') {
          // Admin message increases installer's unread count (but we don't track this in the same way)
          // The installer will see unread count when they load conversations
        }

        // Sort all conversations by last message timestamp (newest first, so most recent conversations appear at top)
        this.conversations.sort((a, b) => {
          const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.createdAt);
          const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.createdAt);
          return bTime - aTime; // Most recent conversations at top
        });

        this.saveToStorage(); // Save after updating conversations
        console.log('Updated conversation order after message');
      }

      // Only notify admin for installer messages (not admin's own messages)
      if (newMessage.senderType === 'installer') {
        // Add notification for admin
        adminNotificationService.addChatNotification(newMessage);

        // Update message status to delivered
        newMessage.status = 'delivered';
      } else if (newMessage.senderType === 'admin') {
        // Admin messages don't create notifications
        newMessage.status = 'sent';
      }

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create a new conversation without initial message
  async createConversation(participantId, participantType, currentUser = null) {
    try {
      // Check if conversation already exists with this installer
      const existingConv = this.conversations.find(conv =>
        conv.participants.some(p => p.id === currentUser?.id && p.type === 'installer')
      );

      if (existingConv) {
        // Use existing conversation
        return existingConv;
      }

      const chatId = `chat-${Date.now()}`;

      const conversation = {
        id: chatId,
        participants: [
          { id: currentUser?.id || 'current-user', name: currentUser?.name || 'Current User', type: currentUser?.userType || 'installer' },
          { id: participantId, name: 'Admin Support', type: participantType }
        ],
        lastMessage: null, // No initial message
        unreadCount: 0, // No unread messages initially
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Add conversation to stored conversations
      this.conversations.unshift(conversation); // Add to beginning
      this.saveToStorage(); // Save after creating conversation

      console.log('Created new conversation:', conversation.id, 'for user:', currentUser?.name);
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Start a new conversation with initial message
  async startConversation(participantId, participantType, initialMessage, currentUser = null) {
    try {
      // Check if conversation already exists with this installer
      const existingConv = this.conversations.find(conv =>
        conv.participants.some(p => p.id === currentUser?.id && p.type === 'installer')
      );

      if (existingConv) {
        // Use existing conversation
        await this.sendMessage(existingConv.id, initialMessage, 'text', [], currentUser);
        return existingConv;
      }

      const chatId = `chat-${Date.now()}`;

      // Send initial message
      await this.sendMessage(chatId, initialMessage, 'text', [], currentUser);

      const conversation = {
        id: chatId,
        participants: [
          { id: currentUser?.id || 'current-user', name: currentUser?.name || 'Current User', type: currentUser?.userType || 'installer' },
          { id: participantId, name: 'Admin Support', type: participantType }
        ],
        lastMessage: {
          message: initialMessage,
          timestamp: new Date().toISOString(),
          senderId: currentUser?.id || 'current-user'
        },
        unreadCount: 1, // New conversation has unread message for admin
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Add conversation to stored conversations
      this.conversations.unshift(conversation); // Add to beginning
      this.saveToStorage(); // Save after creating conversation

      console.log('Started new conversation:', conversation.id, 'for user:', currentUser?.name);
      return conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }

  // Mark messages as read without reordering conversations
  async markAsRead(chatId, messageIds) {
    try {
      // Update message status to 'read' in storage
      const messages = this.messages[chatId] || [];
      messages.forEach(message => {
        if (message.status !== 'read') {
          message.status = 'read';
        }
      });
      this.messages[chatId] = messages;

      // Update unread count without moving conversation
      const conversationIndex = this.conversations.findIndex(conv => conv.id === chatId);

      if (conversationIndex !== -1) {
        this.conversations[conversationIndex].unreadCount = 0;
      }

      // Save to storage to persist read status
      this.saveToStorage();
      console.log('Marked messages as read for chat:', chatId);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      this.emit('messages_read', { chatId, messageIds });

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get online users
  async getOnlineUsers() {
    try {
      return [
        { id: 'admin-1', name: 'Admin Support', type: 'admin', status: 'online' },
        { id: 'admin-2', name: 'Technical Support', type: 'admin', status: 'away' }
      ];
    } catch (error) {
      console.error('Error fetching online users:', error);
      throw error;
    }
  }

  // Delete a conversation (admin only)
  async deleteConversation(chatId) {
    try {
      // Remove from stored conversations
      this.conversations = this.conversations.filter(conv => conv.id !== chatId);

      // Remove messages for this chat
      delete this.messages[chatId];

      // Save to storage after deletion
      this.saveToStorage();
      console.log('Deleted conversation:', chatId);

      // Emit conversation deleted event
      this.emit('conversation_deleted', { chatId });

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Mark conversation as important
  async markConversationAsImportant(conversationId) {
    try {
      const conversation = this.conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        conversation.isImportant = !conversation.isImportant;
        this.saveToStorage();
        console.log(`✅ Conversation ${conversationId} importance updated`);
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Mark conversation as important failed:', error);
      throw error;
    }
  }

  // Mute conversation notifications
  async muteConversationNotifications(conversationId) {
    try {
      const conversation = this.conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        conversation.isMuted = !conversation.isMuted;
        this.saveToStorage();
        console.log(`✅ Conversation ${conversationId} mute status updated`);
      }
      return { success: true };
    } catch (error) {
      console.error('❌ Mute conversation notifications failed:', error);
      throw error;
    }
  }

  // Export conversation
  async exportConversation(conversationId) {
    try {
      const conversation = this.conversations.find(conv => conv.id === conversationId);
      const messages = this.messages[conversationId] || [];

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const exportData = {
        conversation,
        messages,
        exportedAt: new Date().toISOString()
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversationId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`✅ Conversation ${conversationId} exported successfully`);
      return { success: true };
    } catch (error) {
      console.error('❌ Export conversation failed:', error);
      throw error;
    }
  }

  // Mark conversation as important
  async markConversationAsImportant(chatId) {
    try {
      const conversation = this.conversations.find(conv => conv.id === chatId);
      if (conversation) {
        conversation.isImportant = !conversation.isImportant;
        this.saveToStorage();
        console.log(`Conversation ${chatId} marked as ${conversation.isImportant ? 'important' : 'not important'}`);
      }
      return true;
    } catch (error) {
      console.error('Error marking conversation as important:', error);
      throw error;
    }
  }

  // Mute/unmute conversation notifications
  async muteConversationNotifications(chatId) {
    try {
      const conversation = this.conversations.find(conv => conv.id === chatId);
      if (conversation) {
        conversation.isMuted = !conversation.isMuted;
        this.saveToStorage();
        console.log(`Conversation ${chatId} notifications ${conversation.isMuted ? 'muted' : 'unmuted'}`);
      }
      return true;
    } catch (error) {
      console.error('Error muting conversation notifications:', error);
      throw error;
    }
  }

  // Export conversation
  async exportConversation(chatId) {
    try {
      const conversation = this.conversations.find(conv => conv.id === chatId);
      const messages = this.messages[chatId] || [];

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const exportData = {
        conversation: {
          id: conversation.id,
          participants: conversation.participants,
          createdAt: conversation.createdAt,
          tags: conversation.tags || [],
          isImportant: conversation.isImportant || false
        },
        messages: messages.map(msg => ({
          id: msg.id,
          senderName: msg.senderName,
          message: msg.message,
          timestamp: msg.timestamp,
          type: msg.type
        })),
        exportedAt: new Date().toISOString()
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${chatId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Exported conversation ${chatId}`);
      return true;
    } catch (error) {
      console.error('Error exporting conversation:', error);
      throw error;
    }
  }

  // Add tags to conversation
  async addTagsToConversation(chatId, tags) {
    try {
      const conversation = this.conversations.find(conv => conv.id === chatId);
      if (conversation) {
        conversation.tags = conversation.tags || [];
        tags.forEach(tag => {
          if (!conversation.tags.includes(tag)) {
            conversation.tags.push(tag);
          }
        });
        this.saveToStorage();
        console.log(`Added tags to conversation ${chatId}:`, tags);
      }
      return true;
    } catch (error) {
      console.error('Error adding tags to conversation:', error);
      throw error;
    }
  }

  // Remove tags from conversation
  async removeTagsFromConversation(chatId, tags) {
    try {
      const conversation = this.conversations.find(conv => conv.id === chatId);
      if (conversation && conversation.tags) {
        conversation.tags = conversation.tags.filter(tag => !tags.includes(tag));
        this.saveToStorage();
        console.log(`Removed tags from conversation ${chatId}:`, tags);
      }
      return true;
    } catch (error) {
      console.error('Error removing tags from conversation:', error);
      throw error;
    }
  }

  // Event handling
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.eventListeners.clear();
  }
}

export const chatService = new ChatService();

// Make chatService available globally for debugging
if (typeof window !== 'undefined') {
  window.chatService = chatService;
}
