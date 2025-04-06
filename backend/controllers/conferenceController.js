const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const { v4: uuidv4, validate: isUuid } = require('uuid'); // Added validate import

// REPLACEME: Use proper logger
const logInfo = (msg) => console.log('[INFO]', msg);
const logError = (msg) => console.error('[ERROR]', msg);

const handleErrors = (err, res) => {
    logError(err); // LOG: simple error logging
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
};

const validateConference = (conference) => {
    const requiredFields = ['name', 'start_date', 'end_date', 'location'];
    for (const field of requiredFields) {
        if (!conference[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

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
        logInfo(`Fetched ${rows.length} conferences`); // LOG
        res.json(rows);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.exportConference = async (req, res) => {
    try {
        const { id } = req.params;

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
        await fs.promises.writeFile(filePath, JSON.stringify(exportData, null, 2));

        logInfo(`Exported conference ${id} with ${events.length} events to ${filename}`); // LOG

        res.download(filePath, filename, (err) => {
            if (err) {
                logError(`Download error: ${err.message}`); // LOG
            }
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) logError(`Failed to delete temp file: ${unlinkErr.message}`); // LOG
                else logInfo(`Deleted export file ${filename}`); // LOG
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

        const fileExt = path.extname(file.originalname).toLowerCase();
        if (fileExt !== '.json') {
            await fs.promises.unlink(file.path);
            return res.status(400).json({ error: 'Only JSON files are allowed' });
        }

        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        let fileContent, conference, events;

        try {
            fileContent = await fs.promises.readFile(filePath, 'utf-8');
            const parsed = JSON.parse(fileContent);
            conference = parsed.conference;
            events = parsed.events;

            if (!conference || !events || !Array.isArray(events)) {
                throw new Error('Invalid file format');
            }

            validateConference(conference);
            logInfo(`Validated conference file with ${events.length} events`); // LOG
        } catch (parseErr) {
            await fs.promises.unlink(filePath);
            return res.status(400).json({ error: 'Invalid JSON file', message: parseErr.message });
        }

        const newConferenceId = uuidv4();
        const now = new Date().toISOString();

        await db.query('BEGIN');

        try {
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
            await fs.promises.unlink(filePath);

            logInfo(`Imported conference ${newConferenceId} with ${events.length} events`); // LOG

            res.json({
                message: 'Conference imported successfully',
                conferenceId: newConferenceId
            });
        } catch (dbErr) {
            await db.query('ROLLBACK');
            throw dbErr;
        }
    } catch (err) {
        if (req.file) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (unlinkErr) {
                logError(`Failed to clean up uploaded file: ${unlinkErr.message}`); // LOG
            }
        }
        handleErrors(err, res);
    }
};

exports.deleteConference = async (req, res) => {
    try {
        const { id } = req.params;

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

            await db.query('DELETE FROM CONFERENCE WHERE id = $1', [id]);
            await db.query('COMMIT');

            logInfo(`Deleted conference ${id}`); // LOG

            res.json({ message: 'Conference and related data deleted successfully' });
        } catch (dbErr) {
            await db.query('ROLLBACK');
            throw dbErr;
        }
    } catch (err) {
        handleErrors(err, res);
    }
};
