const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const conferenceModel = require('../models/conferenceModel');

// Generic error handler
const handleErrors = (err, res) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
};

exports.exportConference = async (req, res) => {
    try {
        const { conferenceId } = req.params;

        const conference = await conferenceModel.findConferenceById(conferenceId);
        if (!conference) {
            return res.status(404).json({ error: 'Conference not found' });
        }

        const events = await conferenceModel.getEventsForConference(conferenceId);
        const bookmarks = await conferenceModel.getBookmarksByEventIds(events.map(e => e.id));
        const usersConference = await conferenceModel.getUsersForConference(conferenceId);

        const exportData = {
            conference,
            events,
            bookmarks,
            users_conference: usersConference
        };

        const filePath = path.join(__dirname, `../uploads/conference-${conferenceId}.json`);

        // Write the file and wait for it to finish
        fs.writeFile(filePath, JSON.stringify(exportData, null, 2), (err) => {
            if (err) {
                console.error('File write failed:', err);
                return res.status(500).json({ error: 'Failed to export conference' });
            }

            // Download only after the file is ready
            res.download(filePath);
        });
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.importConference = async (req, res) => {
    try {
        if (!req.file || !req.file.filename) {
            return res.status(400).json({
                error: 'No file uploaded',
                details: 'Expected a file field named "file" in form-data'
            });
        }

        const filePath = path.join(__dirname, `../uploads/${req.file.filename}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await conferenceModel.importFullConference(client, data);
            await client.query('COMMIT');

            res.status(201).json({ message: 'Conference imported successfully' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        handleErrors(err, res);
    }
};
exports.getAllConferences = async (req, res) => {
    try {
        const conferences = await conferenceModel.findAllConferences();
        res.json(conferences);
    } catch (err) {
        handleErrors(err, res);
    }
};