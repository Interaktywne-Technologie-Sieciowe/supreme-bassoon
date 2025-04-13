const express = require('express');
const router = express.Router();
const { login, sendEmail } = require('../controllers/authController');

router.post('/', login);
router.post('/send-email', sendEmail);

module.exports = router;