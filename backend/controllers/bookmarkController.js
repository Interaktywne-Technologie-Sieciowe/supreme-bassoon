const { v4: isUuid } = require('uuid');
const bookmarkModel = require('../models/bookmarkModel');

// Shared error handler
const handleErrors = (err, res) => {
    console.error('Error:', err);

    if (err.code) {
        switch (err.code) {
            case '23503':
                return res.status(400).json({ error: 'Referenced event does not exist', details: err.detail });
            case '22P02':
                return res.status(400).json({ error: 'Invalid UUID format', details: err.detail });
        }
    }

    return res.status(500).json({ error: 'Internal server error' });
};

exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await bookmarkModel.findByUserId(req.user.id);
        res.json(bookmarks);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.addBookmark = async (req, res) => {
    const { eventId } = req.params;

    if (!isUuid(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID format' });
    }

    try {
        await bookmarkModel.add(req.user.id, eventId);
        res.status(201).json({ message: 'Event bookmarked successfully' });
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.removeBookmark = async (req, res) => {
    const { eventId } = req.params;

    try {
        const removed = await bookmarkModel.remove(req.user.id, eventId);
        if (!removed) {
            return res.status(404).json({ error: 'Bookmark not found or already inactive' });
        }

        res.json({ message: 'Bookmark deleted successfully' });
    } catch (err) {
        handleErrors(err, res);
    }
};
