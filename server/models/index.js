const mongoose = require('mongoose');

// ─── Lecture Model ───────────────────────────────────────────────────────────
const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  videoPublicId: String, // for Cloudinary deletion
  videoDuration: {
    type: Number, // in seconds
    default: 0,
  },
  pdfUrl: {
    type: String,
    default: '',
  },
  pdfPublicId: String,
  pdfName: String,
  isPreview: {
    type: Boolean,
    default: false, // free preview without enrollment
  },
  views: {
    type: Number,
    default: 0,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  resources: [{
    name: String,
    url: String,
    type: { type: String, enum: ['pdf', 'link', 'zip', 'other'] },
  }],
}, { timestamps: true });

// ─── Enrollment Model ────────────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  completedLectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
  }],
  progress: {
    type: Number,
    default: 0, // percentage 0-100
    min: 0,
    max: 100,
  },
  lastAccessed: Date,
  paymentStatus: {
    type: String,
    enum: ['free', 'paid', 'pending'],
    default: 'free',
  },
  paymentId: String,
  certificateIssued: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// ─── Comment Model ───────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// ─── Announcement Model ──────────────────────────────────────────────────────
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null, // null = global announcement
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  attachments: [{
    name: String,
    url: String,
  }],
}, { timestamps: true });

// ─── Notification Model ──────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['enrollment', 'new_lecture', 'comment', 'reply', 'announcement', 'payment', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: String,
  read: {
    type: Boolean,
    default: false,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = {
  Lecture: mongoose.model('Lecture', lectureSchema),
  Enrollment: mongoose.model('Enrollment', enrollmentSchema),
  Comment: mongoose.model('Comment', commentSchema),
  Announcement: mongoose.model('Announcement', announcementSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
