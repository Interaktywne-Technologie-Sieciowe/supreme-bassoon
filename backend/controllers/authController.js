const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/auth");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { generateTokenForUser } = require("../utils/auth");
const { checkIfTokenIsValid, markTokenUsed } = require("../models/resetTokenModel");

// Optional shared error handler
const handleErrors = (err, res) => {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
};
// routes/auth.js or similar
exports.logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
    });
    return res.status(200).json({ message: "Logged out" });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email i hasło są wymagane" });
    }

    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "Niepoprawny email lub hasło" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Niepoprawny email lub hasło" });
        }

        const role = await userModel.getRoleById(user.role_id);
        const token = generateTokenForUser(user, role);

        await userModel.updateLastLogin(user.id);
        await userModel.incrementLoginCount(user.id);

        const oneHourInMilliseconds = 60 * 60 * 1000;

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: oneHourInMilliseconds,
            path: "/",
        });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                last_login: new Date().toISOString(),
                role: role.name,
            },
        });
    } catch (err) {
        handleErrors(err, res);
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: "Missing token or new password." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { email } = decoded;

        const tokenRecord = await checkIfTokenIsValid(token);
        if (!tokenRecord) {
            return res.status(400).json({ error: "Invalid or already used token." });
        }

        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "User does not exist." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updatePasswordByEmail(email, hashedPassword);

        await markTokenUsed(token);

        res.json({ message: "Pomyślnie zmieniono hasło" });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

exports.refreshLogin = async (req, res) => {
    try {
        // Get the token from the cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.id;

        // Fetch user from the database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const role = await userModel.getRoleById(user.role_id);
        // Return the user data
        res.json({
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                last_login: user.last_login,
                role: role.name,
            },
        });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        console.error("Error refreshing login:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.changePassword = async (req, res) => {
    const { userMail, newPassword } = req.body;
    if (!userMail || !newPassword) {
        return res.status(400).json({ error: "Brak email lub hasła." });
    }
try{
    const user = await userModel.findByEmail(userMail);
    if (!user) {
        return res.status(404).json({ error: "Użytkownik nie istanieje" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePasswordByEmail(userMail, hashedPassword);


    res.json({ message: "Hasło zotało zmienione." });
} catch (err) {
    return res.status(401).json({ error: "error password change from user panel." });
}
};


exports.changeEmail = async (req, res) => {
    const { userMail, newEmail } = req.body;
    if (!userMail || !newEmail) {
        return res.status(400).json({ error: "Brak email lub hasła." });
    }
try{
    const user = await userModel.findByEmail(userMail);
    if (!user) {
        return res.status(404).json({ error: "Użytkownik nie istanieje." });
    }

    await userModel.updateEmailByEmail(userMail, newEmail);


    res.json({ message: "Email changed successfully." });
} catch (err) {
    return res.status(401).json({ error: "error email change from user panel." });
}
};