const pool = require('../config/database');

exports.findByUserId = async (userId) => {
    const result = await pool.query(`
        SELECT b.created_at as bookmarked_at, e.*
        FROM bookmarks b
        JOIN events e ON b.event_id = e.id
        WHERE b.user_id = $1 AND b.is_active = true
        ORDER BY e.start_date
    `, [userId]);

    return result.rows;
};

exports.add = async (userId, eventId) => {
    await pool.query(`
        INSERT INTO bookmarks (user_id, event_id, created_at, last_update, is_active)
        VALUES ($1, $2, NOW(), NOW(), TRUE)
        ON CONFLICT (user_id, event_id) DO UPDATE
        SET is_active = TRUE, last_update = NOW()
    `, [userId, eventId]);
};

exports.remove = async (userId, eventId) => {
    const result = await pool.query(`
        UPDATE bookmarks
        SET is_active = false, last_update = NOW()
        WHERE user_id = $1 AND event_id = $2 AND is_active = true
    `, [userId, eventId]);

    return result.rowCount > 0;
};


exports.findActiveWithUsersByEventId = async (eventId) => {
    const result = await pool.query(`
        SELECT b.*, u.email, u.name
        FROM bookmarks b
        JOIN users u ON b.user_id = u.id
        WHERE b.event_id = $1 AND b.is_active = true
    `, [eventId]);

    return result.rows;
};