const User = require('../models/User');
const bcrypt = require('bcrypt');

// Update user profile (name, avatar)
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;
    const update = {};
    if (name) update.name = name;
    if (avatar) update.avatar = avatar;
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload avatar (base64 string)
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ error: 'No avatar provided' });
    const user = await User.findByIdAndUpdate(userId, { avatar }, { new: true });
    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Old and new password are required' });
    const user = await User.findById(userId);
    if (!user || !user.password) return res.status(400).json({ error: 'User not found' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Old password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('id email name avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  updateUserProfile,
  uploadAvatar,
  changePassword,
  getUserProfile,
}; 