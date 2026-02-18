const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB...');

mongoose.connect('mongodb://127.0.0.1:27017/geo-shooter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('✓ MongoDB connected successfully');
    mongoose.connection.close();
    process.exit(0);
})
.catch(err => {
    console.log('✗ MongoDB connection failed');
    console.log('Error:', err.message);
    process.exit(1);
});
