const Course = require('../models/Course');
const { Lecture, Enrollment, Notification } = require('../models/index');
const User = require('../models/User');

// @desc    Get lectures for a course
// @route   GET /api/lectures/course/:courseId
// @access  Private
const getCourseLectures = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  const isTeacher = course.teacher.toString() === req.user._id.toString();
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });

  if (!isTeacher && !enrollment && req.user.role !== 'admin') {
    // Return only preview lectures
    const lectures = await Lecture.find({ course: course._id, isPreview: true }).sort({ order: 1 });
    return res.json({ success: true, lectures, isEnrolled: false });
  }

  const lectures = await Lecture.find({ course: course._id })
    .populate({ path: 'comments', populate: { path: 'author', select: 'name avatar' } })
    .sort({ order: 1 });

  res.json({ success: true, lectures, isEnrolled: !!enrollment });
};

// @desc    Get single lecture
// @route   GET /api/lectures/:id
// @access  Private
const getLecture = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id)
    .populate({ path: 'comments', populate: { path: 'author', select: 'name avatar role' } });

  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });

  const course = await Course.findById(lecture.course);
  const isTeacher = course.teacher.toString() === req.user._id.toString();
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: lecture.course });

  if (!isTeacher && !enrollment && !lecture.isPreview && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Please enroll in this course to access lectures' });
  }

  // Increment view count
  await Lecture.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, lecture });
};

// @desc    Create lecture
// @route   POST /api/lectures/course/:courseId
// @access  Private/Teacher
const createLecture = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const lectureCount = await Lecture.countDocuments({ course: course._id });
  const lectureData = {
    title: req.body.title,
    description: req.body.description,
    course: course._id,
    order: lectureCount + 1,
    isPreview: req.body.isPreview === 'true',
  };

  if (req.files) {
    if (req.files.video) {
      lectureData.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
      lectureData.videoDuration = Number(req.body.videoDuration) || 0;
    }
    if (req.files.pdf) {
      lectureData.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
      lectureData.pdfName = req.files.pdf[0].originalname;
    }
  }

  const lecture = await Lecture.create(lectureData);
  await Course.findByIdAndUpdate(course._id, { $push: { lectures: lecture._id } });

  // Notify enrolled students
  const enrollments = await Enrollment.find({ course: course._id }).select('student');
  await Promise.all(enrollments.map(e =>
    Notification.create({
      recipient: e.student,
      sender: req.user._id,
      type: 'new_lecture',
      title: 'New Lecture Available',
      message: `New lecture "${lecture.title}" added to "${course.title}"`,
      link: `/courses/${course._id}/lectures/${lecture._id}`,
    })
  ));

  res.status(201).json({ success: true, message: 'Lecture created', lecture });
};

// @desc    Update lecture
// @route   PUT /api/lectures/:id
// @access  Private/Teacher
const updateLecture = async (req, res) => {
  let lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });

  const course = await Course.findById(lecture.course);
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updates = { ...req.body };
  if (updates.isPreview) updates.isPreview = updates.isPreview === 'true';
  if (updates.order) updates.order = Number(updates.order);

  if (req.files) {
    if (req.files.video) {
      updates.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
    }
    if (req.files.pdf) {
      updates.pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
      updates.pdfName = req.files.pdf[0].originalname;
    }
  }

  lecture = await Lecture.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Lecture updated', lecture });
};

// @desc    Delete lecture
// @route   DELETE /api/lectures/:id
// @access  Private/Teacher
const deleteLecture = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });

  const course = await Course.findById(lecture.course);
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await Course.findByIdAndUpdate(lecture.course, { $pull: { lectures: lecture._id } });
  await Lecture.findByIdAndDelete(lecture._id);

  res.json({ success: true, message: 'Lecture deleted' });
};

// @desc    Mark lecture as complete
// @route   PUT /api/lectures/:id/complete
// @access  Private/Student
const markComplete = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: lecture.course });
  if (!enrollment) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

  const alreadyCompleted = enrollment.completedLectures.includes(lecture._id);

  if (!alreadyCompleted) {
    enrollment.completedLectures.push(lecture._id);

    // Calculate progress
    const totalLectures = await Lecture.countDocuments({ course: lecture.course });
    enrollment.progress = Math.round((enrollment.completedLectures.length / totalLectures) * 100);
    enrollment.lastAccessed = new Date();
    await enrollment.save();
  }

  res.json({ success: true, message: 'Lecture marked as complete', enrollment });
};

module.exports = { getCourseLectures, getLecture, createLecture, updateLecture, deleteLecture, markComplete };
