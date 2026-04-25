import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LecturePage from './pages/LecturePage';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CourseEditor from './pages/teacher/CourseEditor';
import LectureManager from './pages/teacher/LectureManager';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyLearning from './pages/student/MyLearning';
import StudentProfile from './pages/student/StudentProfile';

// Layout
import DashboardLayout from './components/shared/DashboardLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user)
    return <Navigate to={user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route
        path="/courses/:courseId/lectures/:lectureId"
        element={<ProtectedRoute><LecturePage /></ProtectedRoute>}
      />

      <Route
        path="/teacher"
        element={<ProtectedRoute roles={['teacher', 'admin']}><DashboardLayout role="teacher" /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="courses" element={<TeacherCourses />} />
        <Route path="courses/new" element={<CourseEditor />} />
        <Route path="courses/:id/edit" element={<CourseEditor />} />
        <Route path="courses/:id/lectures" element={<LectureManager />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route
        path="/student"
        element={<ProtectedRoute roles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="my-learning" element={<MyLearning />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        {/* 🌈 GLOBAL BACKGROUND WRAPPER */}
        <div className="min-h-screen relative overflow-hidden">

          {/* Gradient Layer */}
          <div className="fixed inset-0 z-0 pointer-events-none bg-[var(--bg-gradient)] blur-3xl opacity-70" />

          {/* App Content */}
          <div className="relative z-10">
            <AppRoutes />
          </div>

        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
            },
            duration: 3500,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}