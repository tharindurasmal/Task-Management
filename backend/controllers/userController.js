const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ users });
});

const getPendingUsers = asyncHandler(async (req, res) => {
  // $ne: true catches both isApproved: false AND documents created before
  // this field existed (where it's missing entirely from the database).
  const users = await User.find({ role: 'user', isApproved: { $ne: true } }).sort({ createdAt: -1 });
  res.status(200).json({ users });
});

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