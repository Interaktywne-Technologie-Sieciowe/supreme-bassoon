const crypto = require('crypto');

function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

module.exports = { generatePassword };