const express = require('express');
const router = express.Router();
const { generateUsageReport } = require('../controllers/reportController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');

router.get('/usage/pdf', requireAuth, requireMinRole('a'), generateUsageReport);

module.exports = router;
