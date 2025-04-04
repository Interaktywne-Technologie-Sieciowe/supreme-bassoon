const userModel = require('../models/userModel');

// Reuse centralized error handler
const handleErrors = (err, res) => {
    console.error('Error:', err);

    if (err.code) {
        switch (err.code) {
            case '22P02':
                return res.status(400).json({ error: 'Invalid input format', details: err.detail });
        }
    }

    return res.status(500).json({ error: 'Internal server error' });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAll();
        res.json(users);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.adminImport = async (req, res) => {
    res.json({ msg: 'Import zakończony sukcesem' });
};
