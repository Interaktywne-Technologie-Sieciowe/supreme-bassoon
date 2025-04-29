const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/auth");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { generatePassword } = require("../utils/passwordGenerator");
const { sendEmail } = require("../utils/sendMail");
const { createResetToken } = require('../models/resetTokenModel');

// Reuse centralized error handler
const handleErrors = (err, res) => {
    console.error("Error:", err);

    if (err.code) {
        switch (err.code) {
            case "22P02":
                return res.status(400).json({ error: "Invalid input format", details: err.detail });
        }
    }

    return res.status(500).json({ error: "Internal server error" });
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAll();
        res.json(users);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.createUser = async (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: "Brakuje wymaganych danych" });
    }

    try {
        const rawPassword = generatePassword(10);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newUser = await userModel.create({
            name: firstName,
            surname: lastName,
            password: hashedPassword,
            email,
            role_id: "a7c0e2b2-55b4-4c31-8ec3-0e7f61f24d35",
        });

        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });

        await createResetToken(newUser.id, token);

        const resetLink = `http://localhost:5173/PasswordChange?token=${token}`;
        const subj = 'Welcome to MeetMe!';
        const mailBody = `
            <p>Hi ${firstName}!</p>
            <p>Your MeetMe account has been created.</p>
            <p><strong>You need to set your password! </strong></p>
            <p>Click the button below to do so:</p>
            <p>
                <a href="${resetLink}" style="
                    background-color: #007BFF;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                ">
                    Change Password
                </a>
            </p>
        `;

        await sendEmail(email, mailBody, subj);

        res.status(201).json(newUser);
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Brakuje ID użytkownika" });
    }

    try {
        const deleted = await userModel.delete(id);

        if (deleted.rowCount === 0) {
            return res.status(404).json({ error: "Użytkownik nie istnieje" });
        }

        res.status(200).json({ message: "Użytkownik usunięty pomyślnie" });
    } catch (err) {
        handleErrors(err, res);
    }
};


exports.resetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Brakuje wymaganych danych" });
    }

    try {

        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Użytkownik o takim mailu nie istnieje" });
        }
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "15m" });
        await createResetToken(user.id, token);

        const resetLink = `http://localhost:5173/PasswordChange?token=${token}`;
        const subj = 'Zmiana hasła do konta MeetMe';
        const mailBody = `
                   <p>Hej ${user.name}!</p>   
    <p>Oto twój link do zmiany hasła:</p>
    <p>
        <a href="${resetLink}" style="
            background-color: #007BFF;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
        ">
            Resetuj hasło
        </a>
    </p>
                        `;

        await sendEmail(email, mailBody, subj);
        res.status(200).json({ Successmessage: "Link do resetowania hasła został wysłany na podany adres e-mail." });
    } catch (err) {
        handleErrors(err, res);
    }
};