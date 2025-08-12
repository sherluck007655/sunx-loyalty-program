// Test script to debug serial numbers fetching
import { mockStorageHelpers } from './services/mockStorage';
import { adminService } from './services/adminService';

const testSerialFetch = async () => {
  console.log('🧪 Testing Serial Numbers Fetching...');
  
  try {
    // Test mockStorageHelpers directly
    console.log('🔍 Testing mockStorageHelpers.getAllSerials() directly...');
    console.log('🔍 mockStorageHelpers available:', !!mockStorageHelpers);
    console.log('🔍 getAllSerials method available:', typeof mockStorageHelpers.getAllSerials);
    
    if (mockStorageHelpers.getAllSerials) {
      const directResult = mockStorageHelpers.getAllSerials(1, 10, {});
      console.log('✅ Direct getAllSerials call successful:', {
        serialsCount: directResult.serials.length,
        pagination: directResult.pagination,
        summary: directResult.summary
      });
    } else {
      console.error('❌ getAllSerials method not found');
    }
    
    // Test adminService.getAllSerials
    console.log('🔍 Testing adminService.getAllSerials()...');
    const serviceResponse = await adminService.getAllSerials(1, 10, {});
    console.log('✅ AdminService getAllSerials successful:', serviceResponse);
    
    console.log('🎉 All serial fetch tests passed!');
    
  } catch (error) {
    console.error('❌ Serial fetch test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};

// Run the test
testSerialFetch();

export default testSerialFetch;
