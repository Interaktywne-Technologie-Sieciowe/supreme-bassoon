const pool = require('../config/database');

exports.findAll = async () => {
    const result = await pool.query(`
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN users_roles r ON u.role_id = r.id
    `);
    return result.rows;
};
