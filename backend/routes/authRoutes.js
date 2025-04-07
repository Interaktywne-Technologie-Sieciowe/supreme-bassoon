const express = require('express');
const router = express.Router();
const { login, sendTestEmail } = require('../controllers/authController');

router.post('/', login);
router.post('/send-test-email', sendTestEmail);

module.exports = router;