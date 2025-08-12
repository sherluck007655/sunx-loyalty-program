const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const Installer = require('./models/Installer');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/sunx_loyalty';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected for testing');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample notifications
const createSampleNotifications = async () => {
  try {
    // Find an installer to create notifications for
    const installer = await Installer.findOne();
    
    if (!installer) {
      console.log('❌ No installer found. Please create an installer first.');
      return;
    }

    console.log(`📧 Creating notifications for installer: ${installer.name} (${installer._id})`);

    // Create sample notifications
    const notifications = [
      {
        type: 'payment_approved',
        title: 'Payment Approved! 🎉',
        message: 'Your payment request for PKR 5,000 has been approved and will be processed soon.',
        priority: 'high',
        data: {
          amount: 5000,
          actionUrl: '/payments'
        }
      },
      {
        type: 'promotion_created',
        title: 'New Promotion Available! 🎁',
        message: 'A new promotion "Winter Bonus 2024" is now available. Join now to earn extra rewards!',
        priority: 'medium',
        data: {
          actionUrl: '/promotions'
        }
      },
      {
        type: 'milestone_reached',
        title: 'Milestone Achieved! 🏆',
        message: 'Congratulations! You have successfully installed 10 inverters and are now eligible for payment.',
        priority: 'high',
        data: {
          milestoneCount: 10,
          actionUrl: '/dashboard'
        }
      },
      {
        type: 'system_announcement',
        title: 'System Maintenance Notice 🔧',
        message: 'The system will undergo maintenance on Sunday from 2:00 AM to 4:00 AM. Please plan accordingly.',
        priority: 'medium',
        data: {
          actionUrl: '/dashboard'
        }
      },
      {
        type: 'payment_comment',
        title: 'New Comment on Payment 💬',
        message: 'Admin has added a comment to your payment request. Please check for updates.',
        priority: 'medium',
        data: {
          actionUrl: '/payments'
        }
      }
    ];

    // Create notifications using the static method
    const createdNotifications = [];
    for (const notifData of notifications) {
      const notification = await Notification.createForInstaller(installer._id, notifData);
      createdNotifications.push(notification);
      console.log(`✅ Created: ${notification.title}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Total notifications created: ${createdNotifications.length}`);
    console.log(`- Installer ID: ${installer._id}`);
    console.log(`- Installer Name: ${installer.name}`);

    // Test unread count
    const unreadCount = await Notification.getUnreadCount(installer._id, 'installer');
    console.log(`- Unread notifications: ${unreadCount}`);

    return createdNotifications;

  } catch (error) {
    console.error('❌ Error creating sample notifications:', error);
    throw error;
  }
};

// Test notification queries
const testNotificationQueries = async () => {
  try {
    console.log('\n🔍 Testing notification queries...');

    // Find an installer
    const installer = await Installer.findOne();
    if (!installer) {
      console.log('❌ No installer found for testing');
      return;
    }

    // Test getting notifications
    const notifications = await Notification.find({
      recipientId: installer._id,
      recipientType: 'installer'
    }).sort({ createdAt: -1 });

    console.log(`📋 Found ${notifications.length} notifications for ${installer.name}`);

    // Test marking one as read
    if (notifications.length > 0) {
      const firstNotification = notifications[0];
      console.log(`📖 Marking notification as read: ${firstNotification.title}`);
      await firstNotification.markAsRead();
      
      const updatedNotification = await Notification.findById(firstNotification._id);
      console.log(`✅ Read status: ${updatedNotification.read}, Read at: ${updatedNotification.readAt}`);
    }

    // Test unread count after marking one as read
    const newUnreadCount = await Notification.getUnreadCount(installer._id, 'installer');
    console.log(`📊 Updated unread count: ${newUnreadCount}`);

  } catch (error) {
    console.error('❌ Error testing notification queries:', error);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting notification system tests...\n');
    
    await connectDB();
    await createSampleNotifications();
    await testNotificationQueries();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the backend server if not running');
    console.log('2. Test the API endpoints:');
    console.log('   - GET /api/installer/notifications');
    console.log('   - PUT /api/installer/notifications/:id/read');
    console.log('   - PUT /api/installer/notifications/read-all');
    console.log('3. Check the installer dashboard for notifications');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the tests
runTests();
