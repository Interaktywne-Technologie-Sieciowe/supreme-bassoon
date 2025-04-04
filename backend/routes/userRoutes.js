const express = require('express');
const router = express.Router();
const { getAllUsers, adminImport } = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');

router.get('/', getAllUsers);
router.post('/admin/import', requireAuth, requireMinRole('a'), adminImport);

module.exports = router;