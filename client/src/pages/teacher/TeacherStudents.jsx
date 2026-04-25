import { useState, useEffect } from 'react';
import { courseAPI } from '../../utils/api';
import { Users, Search, BookOpen, Loader2, Mail, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherStudents() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    courseAPI.getTeacherCourses()
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCourse === 'all') {
      // Fetch students for all courses
      setStudentsLoading(true);
      Promise.all(courses.map(c => courseAPI.getCourseStudents(c._id)))
        .then(results => {
          const all = results.flatMap((r, i) =>
            (r.data.enrollments || []).map(e => ({ ...e, courseName: courses[i]?.title }))
          );
          // Deduplicate by student id, keep all enrollments
          setEnrollments(all);
        })
        .catch(() => {})
        .finally(() => setStudentsLoading(false));
    } else {
      setStudentsLoading(true);
      courseAPI.getCourseStudents(selectedCourse)
        .then(({ data }) => setEnrollments(data.enrollments || []))
        .catch(() => toast.error('Failed to load students'))
        .finally(() => setStudentsLoading(false));
    }
  }, [selectedCourse, courses]);

  const filtered = enrollments.filter(e =>
    e.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.student?.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Unique student count
  const uniqueStudents = new Set(enrollments.map(e => e.student?._id)).size;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Students</h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">{uniqueStudents} unique students across {courses.length} courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Students', value: uniqueStudents, color: 'primary' },
          { icon: BookOpen, label: 'Total Courses', value: courses.length, color: 'accent' },
          { icon: TrendingUp, label: 'Total Enrollments', value: enrollments.length, color: 'green' },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-[var(--text-muted)]"
          />
        </div>
        <select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-48"
        >
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {/* Students table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {studentsLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-[var(--border)] mx-auto mb-3" />
              <p className="text-[var(--text-muted)] text-sm">No students found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Student', 'Course', 'Enrolled', 'Progress', 'Contact'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((e, idx) => (
                  <tr key={`${e._id}-${idx}`} className="hover:bg-[var(--bg)] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {e.student?.avatar
                            ? <img src={e.student.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                            : e.student?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{e.student?.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{e.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-[var(--text)] max-w-32 line-clamp-2">{e.courseName || e.course?.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-[var(--text-muted)]">{new Date(e.enrolledAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--border)] max-w-16">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${e.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{e.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`mailto:${e.student?.email}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-primary-500/10 hover:text-primary-500 transition-all"
                      >
                        <Mail size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
