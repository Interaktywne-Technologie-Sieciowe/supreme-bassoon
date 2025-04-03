const express = require('express');
const cors = require('cors');
const os = require('os');
const { Pool } = require('pg');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json())
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
    host: 'localhost',  // Change to 'postgres' if you run this server in a docker container
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

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT u.*, r.name as role_name FROM users u join users_roles r on u.role_id = r.id');
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const SECRET_KEY = "kluczjakklucz";
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Fetch user from database
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // Compare provided password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const role = (await pool.query("select * from USERS_ROLES where id = $1", [user.role_id])).rows[0];

        const token = jwt.sign(
            { id: user.id, email: user.email, role_code: role.code },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id]);

        // Return token and user info (excluding password)
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                last_login: new Date().toISOString(), // Approximate, as the DB update is async
                role: role.name,
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/stupid/endpoint", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // Verify and decode JWT
        console.log("Decoded Token:", decoded); // Print to console

        res.json({ message: "Token successfully decoded!", decoded });
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
});
