// Using built-in fetch (Node.js 18+)

async function testAdminLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sunx.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Admin login successful!');
      console.log('Admin:', data.data.admin.name);
      console.log('Role:', data.data.admin.role);
    } else {
      console.log('❌ Admin login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testAdminLogin();
