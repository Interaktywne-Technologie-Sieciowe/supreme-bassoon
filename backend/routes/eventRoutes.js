const express = require('express');
const router = express.Router();
const { getAllEvents } = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', requireAuth, requireMinRole('g'), getAllEvents);

module.exports = router;