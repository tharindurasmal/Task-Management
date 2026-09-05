const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/users  (admin only — enforced by requireAdmin middleware on the route)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ users });
});

module.exports = { getUsers };
