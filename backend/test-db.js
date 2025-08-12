const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

const testConnection = async () => {
  try {
    console.log('Attempting to connect...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Ready state:', conn.connection.readyState);
    
    // Test a simple operation
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ test: 'Hello World' });
    await testDoc.save();
    console.log('✅ Test document saved successfully');
    
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document deleted successfully');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Full error:', error);
  }
};

testConnection();
