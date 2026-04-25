const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/otherControllers');
const { protect } = require('../middleware/auth');

router.get('/lecture/:lectureId', protect, getComments);
router.post('/lecture/:lectureId', protect, addComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
