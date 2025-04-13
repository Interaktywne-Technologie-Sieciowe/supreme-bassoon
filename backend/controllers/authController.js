const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateTokenForUser } = require('../utils/auth');
const { sendEmail: sendMailUtil } = require('../utils/sendMail');

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

exports.sendEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        await sendMailUtil(email);
        res.json({ message: 'Test email sent successfully' });
    } catch (err) {
        console.error('Email sending error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
};

