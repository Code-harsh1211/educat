import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Star, ArrowRight, PlayCircle, Award, Zap, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: BookOpen, title: 'Rich Course Content', desc: 'Upload videos, PDFs, and resources to create engaging learning experiences.' },
  { icon: Users, title: 'Student Management', desc: 'Track enrollment, monitor progress, and engage with your students directly.' },
  { icon: Zap, title: 'Real-time Notifications', desc: 'Keep students informed with instant announcements and updates.' },
  { icon: Award, title: 'Progress Tracking', desc: 'Students track their learning journey with visual progress indicators.' },
  { icon: Globe, title: 'Accessible Anywhere', desc: 'Mobile-responsive design so learning happens on any device.' },
  { icon: Star, title: 'Interactive Comments', desc: 'Foster discussion with per-lecture comment threads and replies.' },
];

const stats = [
  { label: 'Active Students', value: '12,000+' },
  { label: 'Courses Available', value: '450+' },
  { label: 'Expert Teachers', value: '80+' },
  { label: 'Satisfaction Rate', value: '98%' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text)]">EduFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/courses" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-3 py-2">
              Browse Courses
            </Link>
            {user ? (
              <Link
                to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                className="text-sm bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all shadow-glow"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all shadow-glow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-sm font-medium mb-8">
            <Zap size={14} />
            The modern platform for online education
          </div>
          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-[var(--text)] mb-6 leading-tight">
            Teach & Learn
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">
              Without Limits
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            EduFlow empowers teachers to create compelling courses and gives students an immersive learning experience — all in one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register?role=teacher"
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold text-base hover:shadow-glow-lg hover:-translate-y-0.5 transition-all"
            >
              Start Teaching
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-2 px-6 py-3.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] rounded-2xl font-semibold text-base hover:border-primary-400 transition-all"
            >
              <PlayCircle size={18} className="text-primary-500" />
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-4xl bg-gradient-to-r from-primary-400 to-accent-500 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-[var(--text)] mb-4">Everything you need to teach online</h2>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">A complete toolkit for educators, designed to make online teaching effortless and effective.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-primary-400/40 hover:shadow-card transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-2">{title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 to-accent-700 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent" />
            <div className="relative">
              <h2 className="font-display font-bold text-4xl text-white mb-4">Ready to start your teaching journey?</h2>
              <p className="text-primary-100 text-lg mb-8">Join thousands of educators already using EduFlow to transform their students' lives.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register?role=teacher" className="px-8 py-3.5 bg-white text-primary-700 rounded-2xl font-bold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Create Teacher Account
                </Link>
                <Link to="/register" className="px-8 py-3.5 border-2 border-white/40 text-white rounded-2xl font-bold text-base hover:border-white transition-all">
                  Join as Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-[var(--text)]">EduFlow</span>
          </div>
          <p className="text-[var(--text-muted)] text-sm">© 2024 EduFlow. Built for educators, loved by learners.</p>
        </div>
      </footer>
    </div>
  );
}
