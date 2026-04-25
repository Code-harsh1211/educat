import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Users, TrendingUp, Star, Plus, ArrowRight,
  GraduationCap, BarChart2, Eye, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-500/5 text-primary-500',
    accent: 'from-accent-500/20 to-accent-500/5 text-accent-500',
    green: 'from-green-500/20 to-green-500/5 text-green-500',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-500',
  };
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-primary-400/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text)] font-display mb-0.5">{value}</p>
      <p className="text-sm font-medium text-[var(--text)] mb-0.5">{label}</p>
      {sub && <p className="text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getTeacherStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.monthlyData?.map(d => ({
    name: MONTHS[d._id.month - 1],
    enrollments: d.count,
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text)]">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Here's what's happening with your courses today.</p>
        </div>
        <Link
          to="/teacher/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold text-sm hover:shadow-glow hover:-translate-y-0.5 transition-all w-fit"
        >
          <Plus size={16} />
          New Course
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats?.stats?.totalCourses || 0} sub={`${stats?.stats?.publishedCourses || 0} published`} color="primary" />
        <StatCard icon={Users} label="Total Students" value={stats?.stats?.totalStudents || 0} sub="Unique enrolled" color="accent" />
        <StatCard icon={TrendingUp} label="Enrollments" value={stats?.stats?.totalEnrollments || 0} sub="All time" color="green" />
        <StatCard icon={GraduationCap} label="Lectures" value={stats?.stats?.totalLectures || 0} sub="Across all courses" color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enrollment chart */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-[var(--text)]">Enrollment Trends</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Last 6 months</p>
            </div>
            <BarChart2 size={18} className="text-[var(--text-muted)]" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text)' }}
                />
                <Area type="monotone" dataKey="enrollments" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorEnroll)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">
              No enrollment data yet. Share your courses to get started!
            </div>
          )}
        </div>

        {/* Recent enrollments */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text)]">Recent Students</h2>
            <Link to="/teacher/students" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {stats?.recentEnrollments?.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No enrollments yet</div>
          ) : (
            <div className="space-y-3">
              {(stats?.recentEnrollments || []).slice(0, 6).map(e => (
                <div key={e._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {e.student?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{e.student?.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{e.course?.title}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                    {new Date(e.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/teacher/courses', icon: BookOpen, label: 'Manage Courses', desc: 'View, edit, publish your courses', color: 'primary' },
          { to: '/teacher/students', icon: Users, label: 'View Students', desc: 'See all enrolled students', color: 'accent' },
          { to: '/teacher/announcements', icon: TrendingUp, label: 'Announcements', desc: 'Post updates for your students', color: 'green' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl hover:border-primary-400/40 hover:shadow-card transition-all"
          >
            <div className={`w-11 h-11 rounded-xl bg-${color}-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={`text-${color}-500`} />
            </div>
            <div>
              <p className="font-semibold text-[var(--text)] text-sm">{label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] ml-auto group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
