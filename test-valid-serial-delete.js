async function main() {
  const base = 'http://localhost:5000/api';

  const headers = { 'Content-Type': 'application/json' };

  // 1) Login as admin
  const loginRes = await fetch(`${base}/auth/admin/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: 'admin@sunx.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Admin login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.data.token;
  console.log('Got admin token');

  // 2) Create a unique test product
  const ts = Date.now();
  const testProduct = {
    name: `Test Product ${ts}`,
    model: `TP-${ts}`,
    type: 'inverter',
    points: 50,
    serialPattern: { prefix: 'ZZT', length: 12, format: 'ALPHANUMERIC' },
    description: 'Temporary product for deletion test'
  };

  const productRes = await fetch(`${base}/admin/products`, {
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token}` },
    body: JSON.stringify(testProduct)
  });
  const productData = await productRes.json();
  if (!productData.success) {
    console.error('Create product failed:', productData);
    process.exit(1);
  }
  const productId = productData.data._id || productData.data.id || productData.data?.data?.id;
  console.log('Created product:', productId);

  // 3) Add a valid serial tied to the product
  const serialNumber = 'ZZT123456789';
  const addSerialRes = await fetch(`${base}/admin/valid-serials`, {
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ serialNumber, productId })
  });
  const addSerialData = await addSerialRes.json();
  if (!addSerialData.success) {
    console.error('Add valid serial failed:', addSerialData);
    process.exit(1);
  }
  console.log('Added valid serial:', serialNumber);

  // 4) Delete the valid serial
  const delRes = await fetch(`${base}/admin/valid-serials/${serialNumber}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delData = await delRes.json();
  console.log('Delete response:', delData);

  // 5) Verify it no longer exists (expect 404)
  const delAgain = await fetch(`${base}/admin/valid-serials/${serialNumber}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delAgainJson = await delAgain.json();
  console.log('Delete again response (expected failure):', delAgain.status, delAgainJson.message);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

