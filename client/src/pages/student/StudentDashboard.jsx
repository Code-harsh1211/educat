import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, courseAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, TrendingUp, Award, ArrowRight, PlayCircle,
  Loader2, BarChart2, Star, Zap
} from 'lucide-react';

function ProgressRing({ progress, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="url(#grad)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      enrollmentAPI.getMyEnrollments(),
      courseAPI.getAll({ limit: 4, sort: 'popular' }),
    ]).then(([eRes, cRes]) => {
      setEnrollments(eRes.data.enrollments || []);
      const enrolled = eRes.data.enrollments?.map(e => e.course?._id) || [];
      setRecommended((cRes.data.courses || []).filter(c => !enrolled.includes(c._id)).slice(0, 3));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const completed = enrollments.filter(e => e.progress === 100).length;
  const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-primary-600 to-accent-700 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)'}} />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white mb-1">
              Good day, {user?.name?.split(' ')[0]}! 🎓
            </h1>
            <p className="text-primary-100 text-sm">
              {enrollments.length === 0
                ? "Start your learning journey by enrolling in a course."
                : `You're enrolled in ${enrollments.length} course${enrollments.length > 1 ? 's' : ''}. Keep it up!`}
            </p>
          </div>
          <div className="shrink-0 relative">
            <ProgressRing progress={totalProgress} size={64} stroke={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{totalProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Enrolled', value: enrollments.length, color: 'primary' },
          { icon: TrendingUp, label: 'In Progress', value: inProgress, color: 'accent' },
          { icon: Award, label: 'Completed', value: completed, color: 'green' },
          { icon: Zap, label: 'Avg Progress', value: `${totalProgress}%`, color: 'orange' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center mb-3`}>
              <Icon size={18} className={`text-${color}-500`} />
            </div>
            <p className="font-display font-bold text-xl text-[var(--text)]">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text)]">Continue Learning</h2>
            <Link to="/student/my-learning" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-10 text-center">
              <BookOpen className="w-12 h-12 text-[var(--border)] mx-auto mb-3" />
              <h3 className="font-semibold text-[var(--text)] mb-1">No courses yet</h3>
              <p className="text-[var(--text-muted)] text-sm mb-5">Explore our courses and start learning today!</p>
              <Link to="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 4).map(enrollment => {
                const course = enrollment.course;
                if (!course) return null;
                const firstLecture = course.lectures?.[0];
                return (
                  <div key={enrollment._id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex gap-4 hover:border-primary-400/30 transition-all">
                    <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary-700 to-accent-800">
                      {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text)] text-sm truncate">{course.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{course.teacher?.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--border)]">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-[var(--text-muted)] shrink-0">{enrollment.progress || 0}%</span>
                      </div>
                    </div>
                    {firstLecture && (
                      <Link
                        to={`/courses/${course._id}/lectures/${firstLecture._id}`}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shrink-0 self-center"
                      >
                        <PlayCircle size={18} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text)]">Recommended</h2>
            <Link to="/courses" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              See all <ArrowRight size={12} />
            </Link>
          </div>
          {recommended.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 text-center">
              <Star className="w-10 h-10 text-[var(--border)] mx-auto mb-2" />
              <p className="text-[var(--text-muted)] text-sm">No recommendations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommended.map(course => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="flex gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl hover:border-primary-400/40 transition-all"
                >
                  <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary-700 to-accent-800">
                    {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] text-xs truncate">{course.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{course.teacher?.name}</p>
                    <p className="text-[10px] mt-1 font-semibold text-primary-500">
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
