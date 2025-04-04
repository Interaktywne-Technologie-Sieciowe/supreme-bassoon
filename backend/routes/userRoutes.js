const express = require('express');
const router = express.Router();
const { getAllUsers, adminImport } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', getAllUsers);
router.post('/admin/import', requireAuth, requireMinRole('a'), adminImport);

module.exports = router;