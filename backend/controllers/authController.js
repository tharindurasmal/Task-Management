const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isApproved: user.isApproved,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/register
// Public self-registration always creates a normal 'user' — role is never
// taken from the request body, so nobody can register themselves as admin.
// The account starts UNAPPROVED (isApproved: false via the schema default)
// and cannot log in until an admin approves it. No token is issued here —
// registering does not log you in.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role: 'user' });

  res.status(201).json({
    message: 'Registration successful. An admin needs to approve your account before you can log in.',
    user: toPublicUser(user),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  // password has select:false on the schema, so we explicitly ask for it here
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Admins are always allowed in. Normal users must be approved first.
  if (user.role !== 'admin' && !user.isApproved) {
    return res.status(403).json({
      error: 'Your account is pending admin approval. Please check back later.',
    });
  }

  const token = signToken(user);
  res.status(200).json({ token, user: toPublicUser(user) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({ user: toPublicUser(user) });
});

module.exports = { register, login, getMe };