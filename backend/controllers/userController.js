const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generatePassword } = require('../utils/passwordGenerator');
const { sendEmail } = require('../utils/sendMail');

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

exports.createUser = async (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Brakuje wymaganych danych' });
    }

    try {
        const rawPassword = generatePassword(10);
        console.log(rawPassword); //Żeby można było się jakoś zalogować :p
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newUser = await userModel.create({
            name: firstName,
            surname: lastName,
            password: hashedPassword,
            email,
            role_id: 'a7c0e2b2-55b4-4c31-8ec3-0e7f61f24d35'
        });

        await sendEmail(email, rawPassword);

        res.status(201).json(newUser);
    } catch (err) {
        handleErrors(err, res);
    }
};