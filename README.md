# 🎓 EduFlow — Full-Stack Online Teaching Platform

A complete, production-ready online teaching platform built with React (Vite + Tailwind CSS), Node.js + Express, and MongoDB.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Uploads | Multer (local) + Cloudinary (optional) |
| Charts | Recharts |
| Payments | Razorpay (optional) |

---

## 📁 Project Structure

```
eduflow/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── CourseDetailPage.jsx
│   │   │   ├── LecturePage.jsx
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.jsx
│   │   │   │   ├── TeacherCourses.jsx
│   │   │   │   ├── CourseEditor.jsx
│   │   │   │   ├── LectureManager.jsx
│   │   │   │   ├── TeacherStudents.jsx
│   │   │   │   └── TeacherAnnouncements.jsx
│   │   │   └── student/
│   │   │       ├── StudentDashboard.jsx
│   │   │       ├── MyLearning.jsx
│   │   │       └── StudentProfile.jsx
│   │   ├── components/shared/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── NotificationBell.jsx
│   │   ├── context/AuthContext.jsx
│   │   └── utils/api.js
│   └── package.json
│
└── server/                    # Node.js backend
    ├── models/
    │   ├── User.js
    │   ├── Course.js
    │   └── index.js           # Lecture, Enrollment, Comment, Announcement, Notification
    ├── controllers/
    │   ├── authController.js
    │   ├── courseController.js
    │   ├── lectureController.js
    │   └── otherControllers.js
    ├── routes/
    │   ├── auth.js
    │   ├── courses.js
    │   ├── lectures.js
    │   ├── enrollments.js
    │   ├── comments.js
    │   ├── notifications.js
    │   ├── announcements.js
    │   ├── users.js
    │   └── payments.js
    ├── middleware/
    │   ├── auth.js            # JWT protect + authorize
    │   └── upload.js          # Multer file upload
    ├── seed.js                # Demo data seeder
    ├── index.js               # Server entry point
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your values
```

Required `.env` values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduflow
JWT_SECRET=your_very_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database (optional)

```bash
cd server
npm run seed
```

This creates demo accounts:
- **Teacher**: `teacher@demo.com` / `demo1234`
- **Student**: `student@demo.com` / `demo1234`

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit: http://localhost:5173

---

## 🎯 Features

### 👤 Authentication
- Register/Login with JWT
- Role-based: Teacher & Student
- Password hashing (bcryptjs)
- Protected routes
- Profile management with avatar upload

### 🧑‍🏫 Teacher Dashboard
- **Analytics dashboard** with enrollment charts (Recharts)
- **Create/Edit/Delete courses** with thumbnail, tags, requirements
- **Publish/Unpublish** courses
- **Lecture Manager** — Upload videos + PDFs per lecture
- **Free preview** toggle per lecture
- **Student management** — view all enrolled students with progress
- **Announcements** — post global or course-specific updates

### 📚 Student Dashboard
- **Course catalog** with search, filter by category/level/price, pagination
- **Enroll** in free courses (paid via Razorpay)
- **Video player** with completion tracking
- **PDF download** for lecture notes
- **Progress tracking** — per lecture and per course
- **Comment system** — ask questions, reply to threads
- **Notification bell** — new lectures, announcements, replies

---

## 🔗 API Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
```

### Courses
```
GET    /api/courses              # All published (search/filter/paginate)
GET    /api/courses/:id          # Single course
POST   /api/courses              # Create (teacher)
PUT    /api/courses/:id          # Update (teacher)
DELETE /api/courses/:id          # Delete (teacher)
PUT    /api/courses/:id/publish  # Toggle publish
GET    /api/courses/teacher/my-courses
GET    /api/courses/teacher/stats
GET    /api/courses/:id/students
```

### Lectures
```
GET    /api/lectures/course/:courseId
GET    /api/lectures/:id
POST   /api/lectures/course/:courseId    # Create (teacher, multipart)
PUT    /api/lectures/:id                 # Update (teacher, multipart)
DELETE /api/lectures/:id
PUT    /api/lectures/:id/complete        # Mark complete (student)
```

### Enrollments
```
POST   /api/enrollments/:courseId   # Enroll
GET    /api/enrollments/my          # My enrollments
DELETE /api/enrollments/:courseId   # Unenroll
```

### Comments, Notifications, Announcements
```
GET/POST /api/comments/lecture/:lectureId
DELETE   /api/comments/:commentId
GET      /api/notifications
PUT      /api/notifications/:id/read
GET/POST /api/announcements
DELETE   /api/announcements/:id
```

---

## 💳 Payment Integration (Razorpay)

Add to `.env`:
```
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

The payment routes at `/api/payments/create-order` and `/api/payments/verify` are pre-built. Integrate the Razorpay JS SDK on the frontend to complete the checkout flow.

---

## ☁️ Cloudinary (Optional)

Replace Multer with Cloudinary for cloud file storage:
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 🚢 Deployment

### Backend (Railway / Render / Heroku)
```bash
cd server
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

Update `vite.config.js` proxy target to your production API URL.

---

## 🌙 Dark Mode

Toggle dark mode via the sidebar or top bar. Preference is saved to `localStorage`.

---

## 📄 License

MIT — Free to use for personal and commercial projects.
