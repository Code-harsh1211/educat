const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/otherControllers');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('teacher', 'admin'), createAnnouncement);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAnnouncement);

module.exports = router;
