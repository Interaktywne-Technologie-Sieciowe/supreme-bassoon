const express = require('express');
const router = express.Router();
const { getAllUsers, adminImport } = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');
const { requireMinRole } = require('../middlewares/roles');

router.get('/', getAllUsers);
router.post('/admin/import', requireAuth, requireMinRole('a'), adminImport);



router.post('/admin/action', requireMinRole('a'), (req, res) => {
    res.json({ message: 'Akcja wykonana pomyślnie przez admina' });
});

router.get('/user/action', requireMinRole('u'), (req, res) => {
    res.json({ message: 'Akcja wykonana przez użytkownika' });
});




module.exports = router;