const { query } = require('../config/database');

const getAllEvents = async (req, res) => {
    try {
        const result = await query(`
            SELECT e.*, c.name as conference_name
            FROM events e
            JOIN conference c ON e.conference_id = c.id
            ORDER BY e.start_date
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllEvents
};