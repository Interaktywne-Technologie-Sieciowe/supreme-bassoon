const { query } = require('../config/database');
const { v4: isUuid } = require('uuid');

const getBookmarks = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await query(`
            SELECT b.created_at as bookmarked_at, e.*
            FROM bookmarks b
            JOIN events e ON b.event_id = e.id
            WHERE b.user_id = $1 AND b.is_active = true
            ORDER BY e.start_date
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error on fetching bookmarks from the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addBookmark = async (req, res) => {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    // Validate UUID format
    if (!isUuid(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID format' });
    }

    try {
        await query(`
            INSERT INTO bookmarks (user_id, event_id, created_at, last_update, is_active)
            VALUES ($1, $2, NOW(), NOW(), TRUE)
            ON CONFLICT (user_id, event_id) DO UPDATE
            SET is_active = TRUE, last_update = NOW()
        `, [userId, eventId]);

        res.status(201).json({ message: 'Event bookmarked successfully' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ error: 'Event does not exist' });
        }

        console.error('Error adding bookmark:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const removeBookmark = async (req, res) => {
    const userId = req.user.id;
    const { eventId } = req.params;

    try {
        const result = await query(`
            UPDATE bookmarks
            SET is_active = false, last_update = NOW()
            WHERE user_id = $1 AND event_id = $2 AND is_active = true
        `, [userId, eventId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Bookmark not found or already inactive' });
        }

        res.json({ message: 'Bookmark deleted' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getBookmarks,
    addBookmark,
    removeBookmark
};