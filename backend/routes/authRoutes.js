const express = require('express');
const { register, login, getMe, getGreeting } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/greeting', authenticate, getGreeting);

module.exports = router;
