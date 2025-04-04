const express = require('express');
const router = express.Router();
const { getAllEvents } = require('../controllers/eventController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');

router.get('/', requireAuth, requireMinRole('g'), getAllEvents);

module.exports = router;