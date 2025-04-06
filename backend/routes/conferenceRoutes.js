const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        cb(null, `import-${Date.now()}${fileExt}`);
    }
});

// Filter to only allow JSON files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/json') {
        cb(null, true);
    } else {
        cb(new Error('Only JSON files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 10MB)' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Routes
router.get('/export/:id', requireAuth, requireMinRole('a'), conferenceController.exportConference);

router.post('/import',
    requireAuth,
    requireMinRole('a'),
    upload.single('file'),
    handleMulterError,
    conferenceController.importConference
);

router.get('/', requireAuth, conferenceController.getAllConferences);

router.delete('/:id', requireAuth, requireMinRole('a'), conferenceController.deleteConference);

module.exports = router;