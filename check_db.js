const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/geo-shooter';

console.log('Testing MongoDB connection...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ MongoDB is RUNNING and ACCESSIBLE.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection FAILED:');
    console.error(err.message);
    console.log('\nPossible fixes:');
    console.log('1. Make sure MongoDB Community Server is installed.');
    console.log('2. Make sure the MongoDB service is running.');
    console.log('   (Task Manager -> Services -> MongoDB)');
    process.exit(1);
  });
