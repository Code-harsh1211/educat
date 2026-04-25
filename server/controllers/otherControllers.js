const Course = require('../models/Course');
const { Lecture, Enrollment, Comment, Notification, Announcement } = require('../models/index');
const User = require('../models/User');

// ─── ENROLLMENT CONTROLLER ───────────────────────────────────────────────────

const enrollInCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  if (!course.isPublished) return res.status(400).json({ success: false, message: 'Course is not available' });

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (existing) return res.status(400).json({ success: false, message: 'Already enrolled in this course' });

  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: course._id,
    paymentStatus: course.price === 0 ? 'free' : 'pending',
  });

  if (course.price === 0) {
    await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });

    // Notify teacher
    await Notification.create({
      recipient: course.teacher,
      sender: req.user._id,
      type: 'enrollment',
      title: 'New Student Enrolled',
      message: `${req.user.name} enrolled in "${course.title}"`,
      link: `/teacher/courses/${course._id}/students`,
    });
  }

  res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
};

const getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id, paymentStatus: { $ne: 'pending' } })
    .populate({ path: 'course', populate: { path: 'teacher', select: 'name avatar' } })
    .sort({ enrolledAt: -1 });

  res.json({ success: true, enrollments });
};

const unenrollFromCourse = async (req, res) => {
  const enrollment = await Enrollment.findOneAndDelete({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

  await Course.findByIdAndUpdate(req.params.courseId, { $pull: { enrolledStudents: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $pull: { enrolledCourses: req.params.courseId } });

  res.json({ success: true, message: 'Unenrolled successfully' });
};

// ─── COMMENT CONTROLLER ──────────────────────────────────────────────────────

const getComments = async (req, res) => {
  const comments = await Comment.find({ lecture: req.params.lectureId, parentComment: null })
    .populate('author', 'name avatar role')
    .populate({ path: 'replies', populate: { path: 'author', select: 'name avatar role' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, comments });
};

const addComment = async (req, res) => {
  const { text, parentCommentId } = req.body;
  const lecture = await Lecture.findById(req.params.lectureId);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });

  const commentData = {
    text,
    author: req.user._id,
    lecture: lecture._id,
    course: lecture.course,
  };

  if (parentCommentId) {
    commentData.parentComment = parentCommentId;
    const parentComment = await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: null } });
  }

  const comment = await Comment.create(commentData);
  await comment.populate('author', 'name avatar role');

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: comment._id } });
  } else {
    await Lecture.findByIdAndUpdate(lecture._id, { $push: { comments: comment._id } });
  }

  // Notify course teacher
  const course = await Course.findById(lecture.course);
  if (course && course.teacher.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: course.teacher,
      sender: req.user._id,
      type: 'comment',
      title: 'New Comment on Lecture',
      message: `${req.user.name} commented on "${lecture.title}"`,
      link: `/courses/${course._id}/lectures/${lecture._id}`,
    });
  }

  res.status(201).json({ success: true, comment });
};

const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: comment._id } });
  } else {
    await Lecture.findByIdAndUpdate(comment.lecture, { $pull: { comments: comment._id } });
  }

  await Comment.findByIdAndDelete(comment._id);
  res.json({ success: true, message: 'Comment deleted' });
};

// ─── NOTIFICATION CONTROLLER ─────────────────────────────────────────────────

const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.json({ success: true, notifications, unreadCount });
};

const markNotificationRead = async (req, res) => {
  if (req.params.id === 'all') {
    await Notification.updateMany({ recipient: req.user._id }, { read: true });
  } else {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true });
  }
  res.json({ success: true, message: 'Notifications marked as read' });
};

// ─── ANNOUNCEMENT CONTROLLER ─────────────────────────────────────────────────

const getAnnouncements = async (req, res) => {
  const { courseId } = req.query;
  const query = courseId ? { course: courseId } : { course: null };

  const announcements = await Announcement.find(query)
    .populate('author', 'name avatar')
    .sort({ isPinned: -1, createdAt: -1 });

  res.json({ success: true, announcements });
};

const createAnnouncement = async (req, res) => {
  const { title, content, courseId, priority, isPinned } = req.body;

  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
  }

  const announcement = await Announcement.create({
    title, content,
    author: req.user._id,
    course: courseId || null,
    priority: priority || 'medium',
    isPinned: isPinned || false,
  });

  await announcement.populate('author', 'name avatar');

  // Notify enrolled students if course announcement
  if (courseId) {
    const enrollments = await Enrollment.find({ course: courseId }).select('student');
    await Promise.all(enrollments.map(e =>
      Notification.create({
        recipient: e.student,
        sender: req.user._id,
        type: 'announcement',
        title: 'New Announcement',
        message: title,
        link: `/courses/${courseId}`,
      })
    ));
  }

  res.status(201).json({ success: true, announcement });
};

const deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

  if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Announcement deleted' });
};

module.exports = {
  enrollInCourse, getMyEnrollments, unenrollFromCourse,
  getComments, addComment, deleteComment,
  getNotifications, markNotificationRead,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
};
