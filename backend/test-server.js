const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test server is running',
    timestamp: new Date().toISOString()
  });
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    data: { test: true }
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API test: http://localhost:${PORT}/api/test`);
});
