const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const os = require('os');
const { corsOptions } = require('./config/cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const conferenceRoutes = require('./routes/conferenceRoutes')

// Initialize Express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Service is running',
        timestamp: new Date().toISOString(),
        hostname: os.hostname()
    });
});

// Routes
app.use('/api/login', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/conferences', conferenceRoutes);

module.exports = app;