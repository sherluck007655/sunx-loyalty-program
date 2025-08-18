const axios = require('axios');

async function testDocumentsAPI() {
    const baseURL = 'http://localhost:5000/api';
    
    try {
        console.log('🧪 Testing Documents API...\n');
        
        // First, let's login as admin to get a token
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${baseURL}/auth/admin/login`, {
            email: 'admin@sunx.com',
            password: 'admin123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Admin login failed: ' + loginResponse.data.message);
        }

        const adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful');

        // Now let's try to login as installer or create one
        console.log('2. Trying to login as installer...');
        let installerToken;

        try {
            const installerLogin = await axios.post(`${baseURL}/auth/installer/login`, {
                phone: '03001234567',
                password: 'installer123'
            });

            if (installerLogin.data.success) {
                installerToken = installerLogin.data.token;
                console.log('✅ Installer login successful');
            } else {
                throw new Error('Installer login failed');
            }
        } catch (error) {
            console.log('❌ Installer login failed, will use admin token for testing');
            installerToken = adminToken;
        }
        
        const headers = {
            'Authorization': `Bearer ${installerToken}`,
            'Content-Type': 'application/json'
        };

        // Test 3: Get document categories
        console.log('\n3. Testing document categories endpoint...');
        const categoriesResponse = await axios.get(`${baseURL}/documents/categories`, { headers });
        
        if (categoriesResponse.data.success) {
            console.log('✅ Categories endpoint working');
            console.log(`   Found ${categoriesResponse.data.data.length} categories:`);
            categoriesResponse.data.data.forEach(cat => {
                console.log(`   - ${cat.name} (${cat.documentCount} docs)`);
            });
        } else {
            console.log('❌ Categories endpoint failed');
        }
        
        // Test 4: Get all documents
        console.log('\n4. Testing documents list endpoint...');
        const documentsResponse = await axios.get(`${baseURL}/documents`, { headers });

        if (documentsResponse.data.success) {
            console.log('✅ Documents endpoint working');
            console.log(`   Found ${documentsResponse.data.data.documents.length} documents`);
            console.log(`   Pagination: Page ${documentsResponse.data.data.pagination.page} of ${documentsResponse.data.data.pagination.pages}`);
        } else {
            console.log('❌ Documents endpoint failed');
        }

        // Test 5: Get popular documents
        console.log('\n5. Testing popular documents endpoint...');
        const popularResponse = await axios.get(`${baseURL}/documents/popular`, { headers });

        if (popularResponse.data.success) {
            console.log('✅ Popular documents endpoint working');
            console.log(`   Found ${popularResponse.data.data.length} popular documents`);
        } else {
            console.log('❌ Popular documents endpoint failed');
        }

        // Test 6: Get recent documents
        console.log('\n6. Testing recent documents endpoint...');
        const recentResponse = await axios.get(`${baseURL}/documents/recent`, { headers });

        if (recentResponse.data.success) {
            console.log('✅ Recent documents endpoint working');
            console.log(`   Found ${recentResponse.data.data.length} recent documents`);
        } else {
            console.log('❌ Recent documents endpoint failed');
        }
        
        console.log('\n🎉 All Documents API tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testDocumentsAPI();
