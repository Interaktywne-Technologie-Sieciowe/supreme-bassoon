const express = require('express');
const cors = require('cors');
const os = require('os');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { generateTokenForUser } = require('./auth')
const { requireAuth } = require('./middlewares/auth');
const { requireMinRole } = require('./middlewares/roles')

// Constants
const PORT = 3000;

// Initialize Express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5137',
    'http://127.0.0.1:5173',
    'http://frontend:80',
    'http://frontend:443'
];
const extraOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

console.log('Allowed Origins:', allowedOrigins);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Database connection
const pool = new Pool({
    user: 'myuser',
    host: 'localhost',  // Change to 'postgres' for Docker
    database: 'mydatabase',
    password: 'mypassword',
    port: 5432
});

// Health Check Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Service is running',
        timestamp: new Date().toISOString(),
        hostname: os.hostname()
    });
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT u.*, r.name as role_name FROM users u JOIN users_roles r ON u.role_id = r.id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Fetch user from database
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get user role
        const roleResult = await pool.query('SELECT * FROM users_roles WHERE id = $1', [user.role_id]);
        const role = roleResult.rows[0];

        // Generate JWT token
        const token = generateTokenForUser(user, role)

        // Update last login time
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600 * 1000,  // 1 hour
            path: '/'
        });

        // Return user data (excluding password)
        res.json({
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                last_login: new Date().toISOString(),
                role: role.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/bookmarks', requireAuth, requireMinRole('u'), (req, res) => {
    res.json({ msg: 'Twoje ulubione eventy' });
});

app.post('/api/admin/import', requireAuth, requireMinRole('a'), (req, res) => {
    res.json({ msg: 'Import zakończony sukcesem' });
});

app.get('/api/events', requireAuth, requireMinRole('g'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, c.name as conference_name
            FROM events e
            JOIN conference c ON e.conference_id = c.id
            ORDER BY e.start_date
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/events/favorites', requireAuth, requireMinRole('u'), async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT e.*, b.created_at as bookmarked_at
            FROM bookmarks b
            JOIN events e ON b.event_id = e.id
            WHERE b.user_id = $1 AND b.is_active = true
            ORDER BY e.start_date
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching favorite events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
});