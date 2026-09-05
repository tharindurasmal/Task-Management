const express = require('express');
const { getUsers } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, getUsers);

module.exports = router;
