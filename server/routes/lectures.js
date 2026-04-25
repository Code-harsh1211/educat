// routes/lectures.js
const express = require('express');
const router = express.Router();
const { getCourseLectures, getLecture, createLecture, updateLecture, deleteLecture, markComplete } = require('../controllers/lectureController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const lectureUpload = upload.fields([{ name: 'video', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

router.get('/course/:courseId', protect, getCourseLectures);
router.get('/:id', protect, getLecture);
router.post('/course/:courseId', protect, authorize('teacher', 'admin'), lectureUpload, createLecture);
router.put('/:id', protect, authorize('teacher', 'admin'), lectureUpload, updateLecture);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLecture);
router.put('/:id/complete', protect, markComplete);

module.exports = router;
