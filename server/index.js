require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
console.log("ENV FILE LOADED:", process.env.JWT_SECRET);
const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const path = require('path');


// Route imports
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const enrollmentRoutes = require('./routes/enrollments');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const announcementRoutes = require('./routes/announcements');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://educat-neon.vercel.app" // replace after deploy
  ],
  credentials: true
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for local uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('EduFlow API is running 🚀');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eduflow');
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 EduFlow server running on port ${PORT}`);
      console.log(`📖 API docs: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
