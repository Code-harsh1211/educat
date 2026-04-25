// routes/enrollments.js
const express = require('express');
const router = express.Router();
const { enrollInCourse, getMyEnrollments, unenrollFromCourse } = require('../controllers/otherControllers');
const { protect } = require('../middleware/auth');

router.post('/:courseId', protect, enrollInCourse);
router.get('/my', protect, getMyEnrollments);
router.delete('/:courseId', protect, unenrollFromCourse);

module.exports = router;
