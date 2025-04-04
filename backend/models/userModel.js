const pool = require('../config/database');

exports.findAll = async () => {
    const result = await pool.query(`
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN users_roles r ON u.role_id = r.id
    `);
    return result.rows;
};

exports.findByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

exports.getRoleById = async (roleId) => {
    const result = await pool.query('SELECT * FROM users_roles WHERE id = $1', [roleId]);
    return result.rows[0];
};

exports.updateLastLogin = async (userId) => {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
};