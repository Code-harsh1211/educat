import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  LayoutDashboard, BookOpen, Users, Megaphone, GraduationCap,
  LogOut, Moon, Sun, Menu, X, ChevronRight, UserCircle, Play
} from 'lucide-react';

const teacherNav = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/teacher/students', icon: Users, label: 'Students' },
  { to: '/teacher/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/teacher/profile', icon: UserCircle, label: 'Profile' },
];

const studentNav = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/my-learning', icon: Play, label: 'My Learning' },
  { to: '/courses', icon: BookOpen, label: 'Browse Courses' },
  { to: '/student/profile', icon: UserCircle, label: 'Profile' },
];

export default function DashboardLayout({ role }) {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = role === 'teacher' ? teacherNav : studentNav;

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-72' : 'w-64'} h-full flex flex-col bg-dark-900 border-r border-dark-700`}>
      {/* Logo */}
      <div className="p-5 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">EduFlow</span>
        </div>
        {mobile && <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <span className={`badge text-xs ${role === 'teacher' ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30' : 'bg-primary-500/20 text-primary-300 border border-primary-500/30'}`}>
          {role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}>
            <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
            <span>{label}</span>
            {({ isActive }) => isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all">
          <LogOut className="w-4 h-4" /><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="h-16 bg-white dark:bg-dark-800 border-b border-slate-100 dark:border-dark-700 flex items-center px-6 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden btn-ghost p-2 -ml-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="btn-ghost p-2 rounded-xl" title="Toggle dark mode">
              {darkMode ? <Sun className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <Moon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
            </button>
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-dark-900 bg-mesh">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
