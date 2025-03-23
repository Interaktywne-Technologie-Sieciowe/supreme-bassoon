const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = 3000;

// Default allowed origins
const defaultOrigins = [
    'http://localhost:5137',
    'http://127.0.0.1:5173',
    'http://frontend:80',
    'http://frontend:443',
];

// Load additional origins from environment variable (comma-separated)
const extraOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

// Merge both lists, ensuring uniqueness
const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};

app.use(cors(corsOptions));

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Service is running',
        timestamp: new Date().toISOString(),
        hostname: os.hostname(), // Show ECS task container name
    });
});

// Sample API Endpoint
app.get('/api/message', (req, res) => {
    res.json({
        message: 'Hello from the Express.js server!',
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
});
