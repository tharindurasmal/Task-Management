const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/users  (admin only — enforced by requireAdmin middleware on the route)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ users });
});

// GET /api/users/pending  (admin only)
// Convenience endpoint returning just the users still waiting on approval.
const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user', isApproved: false }).sort({ createdAt: -1 });
  res.status(200).json({ users });
});

// PATCH /api/users/:id/approve  (admin only)
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.isApproved = true;
  await user.save();

  res.status(200).json({ user });
});


module.exports = { getUsers, getPendingUsers, approveUser };
