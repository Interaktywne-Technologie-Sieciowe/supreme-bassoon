const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5137',
    'http://127.0.0.1:5173',
    'http://frontend:80',
    'http://frontend:443'
];

const extraOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true
};

module.exports = { corsOptions, allowedOrigins };