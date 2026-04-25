const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { Enrollment, Notification } = require('../models/index');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.price === 0) return res.status(400).json({ success: false, message: 'This course is free' });

    // Razorpay integration (requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env)
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured' });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: course.price * 100, // paise
      currency: course.currency || 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`,
      notes: { courseId, userId: req.user._id.toString() },
    });

    res.json({ success: true, order, course: { title: course.title, price: course.price } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment and enroll
router.post('/verify', protect, async (req, res) => {
  try {
    const { courseId, paymentId, orderId, signature } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Verify signature
    const crypto = require('crypto');
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Enroll student
    await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      { paymentStatus: 'paid', paymentId },
      { upsert: true, new: true }
    );

    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });

    await Notification.create({
      recipient: course.teacher,
      sender: req.user._id,
      type: 'payment',
      title: 'New Paid Enrollment',
      message: `${req.user.name} purchased "${course.title}"`,
    });

    res.json({ success: true, message: 'Payment verified and enrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
