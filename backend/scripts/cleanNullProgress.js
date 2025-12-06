// Script to clean up Progress records with null userId
const mongoose = require('mongoose');
require('dotenv').config();

const Progress = require('../src/models/Progress');

const cleanNullProgress = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📡 Connected to MongoDB');

    // Find all progress records with null user
    const nullRecords = await Progress.find({ user: null });
    console.log(`🔍 Found ${nullRecords.length} progress records with null userId`);

    if (nullRecords.length > 0) {
      // Delete them
      const result = await Progress.deleteMany({ user: null });
      console.log(`🗑️  Deleted ${result.deletedCount} null progress records`);
    } else {
      console.log('✅ No null progress records found');
    }

    // Check for duplicate index issue
    console.log('\n📊 Checking indexes...');
    const indexes = await Progress.collection.getIndexes();
    console.log('Current indexes:', indexes);

    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanNullProgress();
