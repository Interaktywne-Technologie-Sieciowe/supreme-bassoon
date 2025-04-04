const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');

router.get('/', requireAuth, requireMinRole('g'), eventController.getAllEvents);
router.get('/:id', requireAuth, requireMinRole('a'), eventController.getEventById);
router.post('/', requireAuth, requireMinRole('a'), eventController.createEvent);
router.put('/:id', requireAuth, requireMinRole('a'), eventController.updateEvent);
router.delete('/:id', requireAuth, requireMinRole('a'), eventController.deleteEvent);

module.exports = router;