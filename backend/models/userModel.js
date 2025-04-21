const pool = require("../config/database");

exports.findAll = async () => {
    const result = await pool.query(`
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN users_roles r ON u.role_id = r.id
    `);
    return result.rows;
};

exports.findByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

exports.findById = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
};

exports.getRoleById = async (roleId) => {
    const result = await pool.query("SELECT * FROM users_roles WHERE id = $1", [roleId]);
    return result.rows[0];
};

exports.updateLastLogin = async (userId) => {
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [userId]);
};

exports.create = async ({ name, surname, email, role_id, password }) => {
    const result = await pool.query(
        `
        INSERT INTO users (name, surname, email, role_id, created_at, password)
        VALUES ($1, $2, $3, $4, NOW(), $5 )
        RETURNING *
    `,
        [name, surname, email, role_id, password]
    );

    return result.rows[0];
};

exports.updatePasswordByEmail = async (email, newPassword) => {
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email]);
};

exports.delete = async (id) => {
    return await pool.query("DELETE FROM users WHERE id = $1", [id]);
};
