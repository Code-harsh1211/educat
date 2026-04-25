const Course = require('../models/Course');
const { Lecture, Enrollment, Notification } = require('../models/index');
const User = require('../models/User');

// @desc    Get all courses (with search/filter)
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  const { search, category, level, price, sort, page = 1, limit = 12 } = req.query;
  const query = { isPublished: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }
  if (category && category !== 'All') query.category = category;
  if (level && level !== 'All') query.level = level;
  if (price === 'free') query.price = 0;
  if (price === 'paid') query.price = { $gt: 0 };

  let sortOption = { createdAt: -1 };
  if (sort === 'popular') sortOption = { 'enrolledStudents.length': -1 };
  if (sort === 'rating') sortOption = { 'rating.average': -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('teacher', 'name avatar')
    .select('-lectures')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    count: courses.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    courses,
  });
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'name avatar bio')
    .populate({ path: 'lectures', select: 'title description order videoDuration isPreview pdfName', options: { sort: { order: 1 } } });

  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  // Check if current user is enrolled
  let isEnrolled = false;
  let enrollment = null;
  if (req.user) {
    enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
    isEnrolled = !!enrollment;
  }

  res.json({ success: true, course, isEnrolled, enrollment });
};

// @desc    Create course (teacher only)
// @route   POST /api/courses
// @access  Private/Teacher
const createCourse = async (req, res) => {
  const { title, description, shortDescription, category, level, language, price, currency, tags, requirements, whatYouLearn } = req.body;

  const courseData = {
    title, description, shortDescription, category, level, language,
    price: Number(price) || 0,
    currency: currency || 'INR',
    teacher: req.user._id,
    tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    requirements: requirements ? (typeof requirements === 'string' ? JSON.parse(requirements) : requirements) : [],
    whatYouLearn: whatYouLearn ? (typeof whatYouLearn === 'string' ? JSON.parse(whatYouLearn) : whatYouLearn) : [],
  };

  if (req.file) {
    courseData.thumbnail = `/uploads/images/${req.file.filename}`;
  }

  const course = await Course.create(courseData);
  await course.populate('teacher', 'name avatar');

  res.status(201).json({ success: true, message: 'Course created successfully', course });
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Teacher
const updateCourse = async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
  }

  const updates = { ...req.body };
  if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
  if (updates.requirements && typeof updates.requirements === 'string') updates.requirements = JSON.parse(updates.requirements);
  if (updates.whatYouLearn && typeof updates.whatYouLearn === 'string') updates.whatYouLearn = JSON.parse(updates.whatYouLearn);
  if (updates.price) updates.price = Number(updates.price);

  if (req.file) {
    updates.thumbnail = `/uploads/images/${req.file.filename}`;
  }

  course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('teacher', 'name avatar');

  res.json({ success: true, message: 'Course updated', course });
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher
const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Delete related data
  await Lecture.deleteMany({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });
  await Course.findByIdAndDelete(course._id);

  res.json({ success: true, message: 'Course deleted successfully' });
};

// @desc    Get teacher's courses
// @route   GET /api/courses/teacher/my-courses
// @access  Private/Teacher
const getTeacherCourses = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id })
    .populate('teacher', 'name avatar')
    .sort({ createdAt: -1 });

  // Add enrollment count for each course
  const coursesWithStats = await Promise.all(courses.map(async (course) => {
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
    return { ...course.toJSON(), enrollmentCount };
  }));

  res.json({ success: true, courses: coursesWithStats });
};

// @desc    Toggle publish status
// @route   PUT /api/courses/:id/publish
// @access  Private/Teacher
const togglePublish = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.json({ success: true, message: `Course ${course.isPublished ? 'published' : 'unpublished'}`, course });
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private/Teacher
const getCourseStudents = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate('student', 'name email avatar createdAt')
    .sort({ enrolledAt: -1 });

  res.json({ success: true, enrollments });
};

// @desc    Get teacher dashboard stats
// @route   GET /api/courses/teacher/stats
// @access  Private/Teacher
const getTeacherStats = async (req, res) => {
  const courses = await Course.find({ teacher: req.user._id });
  const courseIds = courses.map(c => c._id);

  const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });
  const totalStudents = await Enrollment.distinct('student', { course: { $in: courseIds } });
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const totalLectures = await Lecture.countDocuments({ course: { $in: courseIds } });

  // Recent enrollments
  const recentEnrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('student', 'name email avatar')
    .populate('course', 'title')
    .sort({ enrolledAt: -1 })
    .limit(10);

  // Monthly enrollment data (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds }, enrolledAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: '$enrolledAt' }, month: { $month: '$enrolledAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalCourses: courses.length,
      publishedCourses,
      totalEnrollments,
      totalStudents: totalStudents.length,
      totalLectures,
    },
    recentEnrollments,
    monthlyData,
  });
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getTeacherCourses, togglePublish, getCourseStudents, getTeacherStats };
