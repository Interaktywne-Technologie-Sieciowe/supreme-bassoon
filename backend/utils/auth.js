const jwt = require('jsonwebtoken');
const SECRET_KEY = 'kluczjakklucz'; // lub użyj process.env.SECRET_KEY

function generateTokenForUser(user, role) {
    return jwt.sign(
        { id: user.id, email: user.email, role_code: role.code },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
}

module.exports = { SECRET_KEY, generateTokenForUser };
