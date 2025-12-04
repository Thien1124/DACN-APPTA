const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

     (`MongoDB Connected: ${conn.connection.host}`);
     (`Database: ${conn.connection.name}`);
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDatabase;