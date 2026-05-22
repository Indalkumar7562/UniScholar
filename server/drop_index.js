const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dropIndex = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship_db';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const collection = mongoose.connection.collection('profiles');
    
    // Check if index exists before dropping
    const indexes = await collection.indexes();
    const indexExists = indexes.some(idx => idx.name === 'sessionId_1');

    if (indexExists) {
      await collection.dropIndex('sessionId_1');
      console.log('✅ Successfully dropped stale index: sessionId_1');
    } else {
      console.log('ℹ️ Index sessionId_1 does not exist, skipping.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during index cleanup:', error.message);
    process.exit(1);
  }
};

dropIndex();
