const express = require('express');
const { getUsers, getPendingUsers, approveUser } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, getUsers);
router.get('/pending', authenticate, requireAdmin, getPendingUsers);
router.patch('/:id/approve', authenticate, requireAdmin, approveUser);

module.exports = router;
