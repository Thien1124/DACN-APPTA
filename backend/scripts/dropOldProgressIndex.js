// Script to drop old userId index
const mongoose = require('mongoose');
require('dotenv').config();

const Progress = require('../src/models/Progress');

const dropOldIndex = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('📡 Connected to MongoDB');

    // Check current indexes
    console.log('📊 Current indexes:');
    const indexes = await Progress.collection.getIndexes();
    console.log(indexes);

    // Drop the old userId_1 index if it exists
    if (indexes.userId_1) {
      console.log('\n🗑️  Dropping old userId_1 index...');
      await Progress.collection.dropIndex('userId_1');
      console.log('✅ Old index dropped successfully!');
    } else {
      console.log('\n✅ Old index userId_1 not found, nothing to drop');
    }

    // Check indexes after drop
    console.log('\n📊 Indexes after cleanup:');
    const newIndexes = await Progress.collection.getIndexes();
    console.log(newIndexes);

    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropOldIndex();
