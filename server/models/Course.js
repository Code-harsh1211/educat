const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
  },
  thumbnail: {
    type: String,
    default: '',
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['Programming', 'Mathematics', 'Science', 'Language', 'Arts', 'Business', 'History', 'Other'],
    default: 'Other',
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  language: {
    type: String,
    default: 'English',
  },
  price: {
    type: Number,
    default: 0, // 0 = free
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  tags: [String],
  lectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  announcements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  requirements: [String],
  whatYouLearn: [String],
}, { timestamps: true });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function () {
  return this.enrolledStudents.length;
});

// Virtual for lecture count
courseSchema.virtual('lectureCount').get(function () {
  return this.lectures.length;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
