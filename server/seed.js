require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const { Lecture, Enrollment } = require('./models/index');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eduflow');
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  await Lecture.deleteMany({});
  await Enrollment.deleteMany({});
  console.log('Cleared existing data');

  // Create teacher
  const teacher = await User.create({
    username: "teacher1",
    name: 'Dr. Sarah Johnson',
    email: 'teacher@demo.com',
    password: 'demo1234',
    role: 'teacher',
    bio: 'PhD in Computer Science with 10+ years of teaching experience. Passionate about making complex concepts simple.',
  });
  
  // Create students
  const student1 = await User.create({
    username: "student1",
    name: 'Alex Chen',
    email: 'student@demo.com',
    password: 'demo1234',
    role: 'student',
  });

  const student2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@demo.com',
    password: 'demo1234',
    role: 'student',
  });

  console.log('✅ Users created');

  // Create courses
  const course1 = await Course.create({
    title: 'Complete Python Programming Bootcamp',
    description: 'Master Python from scratch to advanced concepts. This comprehensive course covers everything you need to become a Python developer — from variables and loops to OOP, file handling, APIs, and real-world projects.\n\nYou will build 10+ projects including a web scraper, REST API, data analysis tool, and more.',
    shortDescription: 'Learn Python from basics to advanced with 50+ hands-on exercises and real projects.',
    teacher: teacher._id,
    category: 'Programming',
    level: 'Beginner',
    price: 0,
    isPublished: true,
    tags: ['python', 'programming', 'backend', 'beginner'],
    requirements: ['Basic computer knowledge', 'No prior programming experience needed', 'A computer with internet access'],
    whatYouLearn: [
      'Write Python programs with confidence',
      'Understand OOP principles',
      'Work with files and databases',
      'Build REST APIs with Flask',
      'Use Python for data analysis',
      'Deploy Python applications',
    ],
    enrolledStudents: [student1._id, student2._id],
  });

  const course2 = await Course.create({
    title: 'Advanced JavaScript & React Masterclass',
    description: 'Take your JavaScript skills to the next level. This course dives deep into modern JS (ES6+), asynchronous programming, React hooks, state management, and building production-ready applications.',
    shortDescription: 'Modern JavaScript and React — from intermediate to expert level.',
    teacher: teacher._id,
    category: 'Programming',
    level: 'Intermediate',
    price: 999,
    isPublished: true,
    tags: ['javascript', 'react', 'frontend', 'web development'],
    requirements: ['Basic HTML/CSS knowledge', 'Familiarity with basic JavaScript'],
    whatYouLearn: ['Master ES6+ features', 'Build React applications', 'State management with Redux', 'Testing with Jest'],
    enrolledStudents: [student1._id],
  });

  const course3 = await Course.create({
    title: 'Data Science with Python',
    description: 'Explore the world of data science using Python. Learn pandas, numpy, matplotlib, scikit-learn, and how to build machine learning models from scratch.',
    shortDescription: 'Data analysis, visualization, and machine learning with Python.',
    teacher: teacher._id,
    category: 'Science',
    level: 'Intermediate',
    price: 1499,
    isPublished: true,
    tags: ['data science', 'machine learning', 'python', 'AI'],
    requirements: ['Basic Python knowledge', 'High school mathematics'],
    whatYouLearn: ['Data manipulation with Pandas', 'Visualization with Matplotlib', 'Machine learning with scikit-learn', 'Real-world data projects'],
  });

  console.log('✅ Courses created');

  // Create lectures for course1
  const lectures = await Lecture.create([
    { title: 'Welcome & Course Overview', description: 'Introduction to the course structure, tools you need, and what you will build.', course: course1._id, order: 1, isPreview: true, views: 142 },
    { title: 'Setting Up Python Environment', description: 'Install Python, VS Code, and configure your development environment.', course: course1._id, order: 2, isPreview: true, views: 98 },
    { title: 'Variables and Data Types', description: 'Learn about Python variables, integers, floats, strings, and booleans.', course: course1._id, order: 3, views: 87 },
    { title: 'Control Flow: If/Else & Loops', description: 'Master conditional statements and loops in Python.', course: course1._id, order: 4, views: 76 },
    { title: 'Functions and Scope', description: 'Create reusable functions and understand Python scope rules.', course: course1._id, order: 5, views: 65 },
    { title: 'Lists, Tuples, and Dictionaries', description: 'Work with Python\'s core data structures.', course: course1._id, order: 6, views: 54 },
    { title: 'Object-Oriented Programming', description: 'Classes, objects, inheritance, and polymorphism in Python.', course: course1._id, order: 7, views: 43 },
    { title: 'File Handling & Exceptions', description: 'Read/write files and handle errors gracefully.', course: course1._id, order: 8, views: 32 },
  ]);

  // Update course with lecture IDs
  await Course.findByIdAndUpdate(course1._id, { lectures: lectures.map(l => l._id) });

  // Create lectures for course2
  const lectures2 = await Lecture.create([
    { title: 'Modern JavaScript (ES6+)', description: 'Arrow functions, destructuring, spread/rest, and more.', course: course2._id, order: 1, isPreview: true, views: 89 },
    { title: 'Async JavaScript: Promises & Async/Await', description: 'Master asynchronous programming in JavaScript.', course: course2._id, order: 2, views: 72 },
    { title: 'React Fundamentals', description: 'Components, JSX, props, and state.', course: course2._id, order: 3, views: 61 },
    { title: 'React Hooks Deep Dive', description: 'useState, useEffect, useContext, useReducer and custom hooks.', course: course2._id, order: 4, views: 48 },
  ]);
  await Course.findByIdAndUpdate(course2._id, { lectures: lectures2.map(l => l._id) });

  console.log('✅ Lectures created');

  // Create enrollments
  await Enrollment.create([
    { student: student1._id, course: course1._id, paymentStatus: 'free', progress: 62, completedLectures: lectures.slice(0, 5).map(l => l._id) },
    { student: student1._id, course: course2._id, paymentStatus: 'paid', progress: 25, completedLectures: [lectures2[0]._id] },
    { student: student2._id, course: course1._id, paymentStatus: 'free', progress: 25, completedLectures: lectures.slice(0, 2).map(l => l._id) },
  ]);

  await User.findByIdAndUpdate(student1._id, { enrolledCourses: [course1._id, course2._id] });
  await User.findByIdAndUpdate(student2._id, { enrolledCourses: [course1._id] });

  console.log('✅ Enrollments created');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Demo accounts:');
  console.log('  Teacher: teacher@demo.com / demo1234');
  console.log('  Student: student@demo.com / demo1234');
  console.log('  Student: priya@demo.com / demo1234');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
