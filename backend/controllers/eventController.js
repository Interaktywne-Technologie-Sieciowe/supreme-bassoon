const eventModel = require('../models/eventModel');
const bookmarkModel = require('../models/bookmarkModel');
const { sendEmail } = require("../utils/sendMail");

// Helper function for error handling
const handleErrors = (err, res) => {
    console.error(`Error: ${err.message}`, err);

    // Handle specific database errors
    if (err.code) {
        switch (err.code) {
            case '23503': // Foreign key violation
                return res.status(400).json({
                    error: 'Referenced entity does not exist',
                    details: err.detail
                });
            case '23505': // Unique violation
                return res.status(409).json({
                    error: 'Duplicate entry',
                    details: err.detail
                });
            case '22P02': // Invalid text representation (e.g. invalid UUID)
                return res.status(400).json({
                    error: 'Invalid input format',
                    details: 'One or more fields have an invalid format'
                });
            case '23502': // Not null violation
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: err.detail
                });
        }
    }

    // For validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.message
        });
    }

    // Default server error
    return res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ?
            'An unexpected error occurred' :
            err.message
    });
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await eventModel.findAll();
        res.json(events);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.getEventById = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        const result = await eventModel.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.createEvent = async (req, res) => {
    try {
        // Validate required fields
        const { name, start_date, end_date, conference_id } = req.body;

        if (!name || !start_date || !end_date || !conference_id) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Name, start date, end date, and conference ID are required'
            });
        }

        // Additional validation could go here
        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({
                error: 'Validation error',
                details: 'Start date must be before end date'
            });
        }

        const event = await eventModel.create(req.body);
        res.status(201).json(event);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.updateEvent = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        // Validate dates if both are provided
        const { start_date, end_date } = req.body;
        if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({
                error: 'Validation error',
                details: 'Start date must be before end date'
            });
        }

        const updated = await eventModel.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({
            message: 'Event updated successfully',
            event: updated
        });
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;

        if (!eventId) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const bookmarkedUsers = await bookmarkModel.findUsersByEventId(eventId);

        const deleted = await eventModel.remove(eventId);
        if (!deleted) {
            return res.status(404).json({ error: 'Event not found' });
        }

        for (const user of bookmarkedUsers) {
            try {
                const messageBody = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2>Hi ${user.name},</h2>
                        <p>The event <strong>${event.name}</strong>, that you had in your favorites has been removed.</p>
                        <p>Best Regards,<br>The MeetMe Team</p>
                    </div>
                `;
                const subject = `Event "${event.name}" has beem deleted`;

                await sendEmail(user.email, messageBody, subject);
            } catch (emailErr) {
                console.error(`Error while sending mail to ${user.email}:`, emailErr);
            }
        }

        res.json({ message: 'Event deleted successfully and notifications sent.' });
    } catch (err) {
        handleErrors(err, res);
    }
};