const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { v4: uuidv4, validate: isUuid } = require('uuid'); // Added validate import

const handleErrors = (err, res) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
};

// Validate conference object
const validateConference = (conference) => {
    const requiredFields = ['name', 'start_date', 'end_date', 'location'];
    for (const field of requiredFields) {
        if (!conference[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Validate dates
    const startDate = new Date(conference.start_date);
    const endDate = new Date(conference.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
    }

    if (startDate > endDate) {
        throw new Error('End date must be after start date');
    }
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

        // Validate UUID using the uuid library
        if (!isUuid(id)) {
            return res.status(400).json({ error: 'Invalid conference ID format' });
        }

        const confRes = await db.query('SELECT * FROM CONFERENCE WHERE id = $1', [id]);
        const conference = confRes.rows[0];

        if (!conference) return res.status(404).json({ error: 'Conference not found' });

        const eventsRes = await db.query('SELECT * FROM EVENTS WHERE conference_id = $1', [id]);
        const events = eventsRes.rows;

        const exportData = { conference, events };

        const filename = `conference-${id}-${Date.now()}.json`;
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

        // Set cleanup after download
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            // Delete the temporary file after download
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Failed to delete temp file:', unlinkErr);
            });
        });
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.importConference = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'File is required' });

        // Check file extension
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (fileExt !== '.json') {
            // Clean up invalid file
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: 'Only JSON files are allowed' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        let fileContent, conference, events;

        try {
            fileContent = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(fileContent);
            conference = parsed.conference;
            events = parsed.events;

            // Validate data
            if (!conference || !events || !Array.isArray(events)) {
                throw new Error('Invalid file format');
            }

            validateConference(conference);
        } catch (parseErr) {
            // Clean up invalid file
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Invalid JSON file', message: parseErr.message });
        }

        // Generate new IDs to avoid conflicts
        const newConferenceId = uuidv4();
        const now = new Date().toISOString();

        await db.query('BEGIN');

        try {
            // Insert conference with new ID
            await db.query(
                `INSERT INTO CONFERENCE (id, name, created_at, start_date, end_date, description, last_update, location)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    newConferenceId,
                    conference.name,
                    now,
                    conference.start_date,
                    conference.end_date,
                    conference.description || '',
                    now,
                    conference.location
                ]
            );

            // Insert events with new IDs
            for (const event of events) {
                await db.query(
                    `INSERT INTO EVENTS (id, name, created_at, start_date, end_date, conference_id, location, last_update)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        uuidv4(),
                        event.name,
                        now,
                        event.start_date,
                        event.end_date,
                        newConferenceId,
                        event.location || '',
                        now
                    ]
                );
            }

            await db.query('COMMIT');

            // Clean up file after import
            fs.unlinkSync(filePath);

            res.json({
                message: 'Conference imported successfully',
                conferenceId: newConferenceId
            });
        } catch (dbErr) {
            await db.query('ROLLBACK');
            throw dbErr;
        }
    } catch (err) {
        // Try to clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        handleErrors(err, res);
    }
};

exports.deleteConference = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate UUID using the uuid library
        if (!isUuid(id)) {
            return res.status(400).json({ error: 'Invalid conference ID format' });
        }

        await db.query('BEGIN');

        try {
            const confRes = await db.query('SELECT * FROM CONFERENCE WHERE id = $1', [id]);
            if (confRes.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ error: 'Conference not found' });
            }

            // We could explicitly delete events, but the schema has CASCADE delete
            await db.query('DELETE FROM CONFERENCE WHERE id = $1', [id]);

            await db.query('COMMIT');
            res.json({ message: 'Conference and related data deleted successfully' });
        } catch (dbErr) {
            await db.query('ROLLBACK');
            throw dbErr;
        }
    } catch (err) {
        handleErrors(err, res);
    }
};