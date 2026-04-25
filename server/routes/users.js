// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// Get all students (teacher)
router.get('/students', protect, authorize('teacher', 'admin'), async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, students });
});

// Toggle user active status (admin)
router.put('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

module.exports = router;
