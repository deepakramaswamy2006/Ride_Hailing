const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your_mongodb_atlas_connection_string') {
    console.error('\n========================================');
    console.error('  MONGODB_URI is not configured!');
    console.error('========================================');
    console.error('  Please follow these steps:');
    console.error('  1. Go to https://cloud.mongodb.com');
    console.error('  2. Create a free cluster (M0)');
    console.error('  3. Create a database user');
    console.error('  4. Whitelist your IP in Network Access');
    console.error('  5. Get your connection string');
    console.error('  6. Copy backend/.env.example to backend/.env');
    console.error('  7. Replace MONGODB_URI with your connection string');
    console.error('========================================\n');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Check your MONGODB_URI in backend/.env');
    process.exit(1);
  }
};

module.exports = connectDB;
