const express = require('express');
const cors = require('cors');
const os = require('os');
const { Pool } = require('pg'); // Import PostgreSQL client

const app = express();
const PORT = 3000;

// CORS setup
const defaultOrigins = [
    'http://localhost:5173/',
    'http://localhost:5137',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://frontend:80',
    'http://frontend:443',
];
const extraOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

console.log('Allowed Origins:', allowedOrigins);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};

app.use(cors(corsOptions));

// PostgreSQL connection settings
const pool = new Pool({
    user: 'myuser',
    host: 'localhost',  // Change to 'postgres' if running in Docker Compose
    database: 'mydatabase',
    password: 'mypassword',
    port: 5432,
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Service is running',
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
    });
});

// Sample API to Fetch Data from PostgreSQL
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
});
