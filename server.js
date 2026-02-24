const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me'; // In production use environment variable

// Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from root

// MongoDB Connection
let isConnected = false;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geo-shooter';

const connectDB = async () => {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', MONGO_URI.replace(/:([^:@]+)@/, ':****@')); // Log masked URI for debugging

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s
        });
        console.log('✅ MongoDB connected successfully');
        isConnected = true;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Full error:', JSON.stringify(err, null, 2));
        
        // Don't just retry blindly, log specific hints
        if (err.message.includes('bad auth')) {
            console.error('Hint: Check your username and password in MONGO_URI.');
        } else if (err.message.includes('ECONNREFUSED') || err.message.includes('cluster unavailable')) {
            console.error('Hint: Check Network Access in Atlas (0.0.0.0/0 required).');
        }

        console.log('Retrying in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Middleware to check DB connection
app.use('/api', (req, res, next) => {
    if (!isConnected) {
        return res.status(503).json({ error: 'Service Unavailable: Database not connected. Is MongoDB running?' });
    }
    next();
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    highScore: { type: Number, default: 0 }, // Max wave reached
    bestScore: { type: Number, default: 0 }, // Max score reached
    totalKills: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // In seconds
    gamesPlayed: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);

// Auth Routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        // Use a generic error message for security
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Game Stats Routes
app.post('/api/stats', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { wave, kills, time, score } = req.body;
        
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Update stats
        if (wave > user.highScore) user.highScore = wave;
        if (score > (user.bestScore || 0)) user.bestScore = score;
        user.totalKills += kills;
        user.totalTime += time;
        user.gamesPlayed += 1;
        
        await user.save();
        res.json({ message: 'Stats updated', highScore: user.highScore, bestScore: user.bestScore });
    } catch (error) {
        res.status(500).json({ error: 'Error updating stats' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find().sort({ bestScore: -1 }).limit(10).select('username highScore bestScore');
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching leaderboard' });
    }
});

// Serve Game
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
