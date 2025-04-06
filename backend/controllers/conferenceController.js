const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const handleErrors = (err, res) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
};

exports.getAllConferences = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM CONFERENCE ORDER BY start_date DESC');
        res.json(rows);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.exportConference = async (req, res) => {
    try {
        const { id } = req.params;

        const confRes = await db.query('SELECT * FROM CONFERENCE WHERE id = $1', [id]);
        const conference = confRes.rows[0];

        if (!conference) return res.status(404).json({ error: 'Conference not found' });

        const eventsRes = await db.query('SELECT * FROM EVENTS WHERE conference_id = $1', [id]);
        const events = eventsRes.rows;

        const exportData = { conference, events };

        const filename = `conference-${id}.json`;
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

        res.download(filePath, filename);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};
exports.importConference = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'File is required' });

        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { conference, events } = JSON.parse(fileContent);

        await db.query('BEGIN');

        // Insert conference
        const confRes = await db.query(
            `INSERT INTO CONFERENCE (id, name, created_at, start_date, end_date, description, last_update, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [conference.id, conference.name, conference.created_at, conference.start_date, conference.end_date, conference.description, conference.last_update, conference.location]
        );

        // Insert events
        for (const event of events) {
            await db.query(
                `INSERT INTO EVENTS (id, name, created_at, start_date, end_date, conference_id, location, last_update)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [event.id, event.name, event.created_at, event.start_date, event.end_date, event.conference_id, event.location, event.last_update]
            );
        }

        await db.query('COMMIT');
        res.json({ message: 'Conference imported successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};
exports.deleteConference = async (req, res) => {
    try {
        const { id } = req.params;

        const confRes = await db.query('SELECT * FROM CONFERENCE WHERE id = $1', [id]);
        if (confRes.rows.length === 0) return res.status(404).json({ error: 'Conference not found' });

        await db.query('DELETE FROM CONFERENCE WHERE id = $1', [id]);
        res.json({ message: 'Conference and related data deleted successfully' });
    } catch (err) {
        handleErrors(err, res);
    }
};
