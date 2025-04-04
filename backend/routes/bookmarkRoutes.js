const express = require('express');
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');

router.get('/', requireAuth, requireMinRole('u'), getBookmarks);
router.post('/:eventId', requireAuth, requireMinRole('u'), addBookmark);
router.delete('/:eventId', requireAuth, requireMinRole('u'), removeBookmark);

module.exports = router;