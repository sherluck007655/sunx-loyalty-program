// Test script to debug dashboard data loading
import { adminService } from './services/adminService';
import { mockStorageHelpers } from './services/mockStorage';

const testDashboardData = async () => {
  console.log('🧪 Testing Dashboard Data Loading...');
  
  try {
    // Test mockStorageHelpers directly
    console.log('🔍 Testing mockStorageHelpers.getSystemAnalytics()...');
    const analytics = mockStorageHelpers.getSystemAnalytics();
    console.log('✅ Direct analytics call successful:', analytics);
    
    // Test adminService.getDashboardStats
    console.log('🔍 Testing adminService.getDashboardStats()...');
    const statsResponse = await adminService.getDashboardStats();
    console.log('✅ Dashboard stats successful:', statsResponse);
    
    // Test adminService.getSystemAnalytics
    console.log('🔍 Testing adminService.getSystemAnalytics()...');
    const analyticsResponse = await adminService.getSystemAnalytics();
    console.log('✅ System analytics successful:', analyticsResponse);
    
    console.log('🎉 All dashboard tests passed!');
    
  } catch (error) {
    console.error('❌ Dashboard test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};

// Run the test
testDashboardData();

export default testDashboardData;
