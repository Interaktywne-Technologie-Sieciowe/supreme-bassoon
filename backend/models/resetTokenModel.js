const pool = require('../config/database');

exports.createResetToken = async (userId, token) => {
    await pool.query(`
        INSERT INTO password_reset_tokens (user_id, token, used, created_at)
        VALUES ($1, $2, FALSE, NOW())
    `, [userId, token]);
};

exports.checkIfTokenIsValid  = async (token) => {
    const result = await pool.query(`
        SELECT * FROM password_reset_tokens
        WHERE token = $1 AND used = FALSE
    `, [token]);

    return result.rows[0];
};

exports.markTokenUsed = async (token) => {
    await pool.query(`
        UPDATE password_reset_tokens
        SET used = TRUE
        WHERE token = $1
    `, [token]);
};
