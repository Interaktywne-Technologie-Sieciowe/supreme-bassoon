const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController')
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
router.get('/export/:id', requireAuth, requireMinRole('a'), conferenceController.exportConference);
router.post('/import', requireAuth, requireMinRole('a'), upload.single('file'), conferenceController.importConference);
router.get('/', requireAuth, conferenceController.getAllConferences);
router.delete('/:id', requireAuth, requireMinRole('a'), conferenceController.deleteConference);

module.exports = router;