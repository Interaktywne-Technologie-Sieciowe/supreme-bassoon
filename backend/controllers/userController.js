const { query } = require('../config/database');

const getAllUsers = async (req, res) => {
    try {
        const result = await query(
            'SELECT u.*, r.name as role_name FROM users u JOIN users_roles r ON u.role_id = r.id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const adminImport = (req, res) => {
    res.json({ msg: 'Import zakończony sukcesem' });
};

module.exports = {
    getAllUsers,
    adminImport
};