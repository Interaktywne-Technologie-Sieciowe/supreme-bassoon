const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/auth');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateTokenForUser } = require('../utils/auth');

// Optional shared error handler
const handleErrors = (err, res) => {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const role = await userModel.getRoleById(user.role_id);
        const token = generateTokenForUser(user, role);

        await userModel.updateLastLogin(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600 * 1000,
            path: '/'
        });

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
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Missing token or new password' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;

        const user = await userModel.findByEmail(email);
        if (!user) return res.status(404).json({ error: 'User does not exist' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updatePasswordByEmail(email, hashedPassword);

        res.json({ message: 'Password changed succesfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};