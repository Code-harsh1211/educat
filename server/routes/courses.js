const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getTeacherCourses, togglePublish, getCourseStudents, getTeacherStats
} = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', optionalAuth, getCourses);
router.get('/teacher/my-courses', protect, authorize('teacher', 'admin'), getTeacherCourses);
router.get('/teacher/stats', protect, authorize('teacher', 'admin'), getTeacherStats);
router.get('/:id', optionalAuth, getCourse);
router.post('/', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.put('/:id/publish', protect, authorize('teacher', 'admin'), togglePublish);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getCourseStudents);

module.exports = router;
