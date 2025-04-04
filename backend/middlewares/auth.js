const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../auth')

function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Brak tokenu' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token nieprawidłowy lub wygasł' });
    }
}

module.exports = { requireAuth, SECRET_KEY };
