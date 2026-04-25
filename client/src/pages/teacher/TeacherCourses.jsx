import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../utils/api';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Users, BookOpen,
  MoreVertical, Loader2, CheckCircle, XCircle, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

function CourseRow({ course, onDelete, onTogglePublish }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onTogglePublish(course._id);
    } finally { setToggling(false); setMenuOpen(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(course._id);
    } finally { setDeleting(false); }
  };

  return (
    <div className={`bg-[var(--bg-card)] border rounded-2xl overflow-hidden transition-all ${deleting ? 'opacity-50' : 'border-[var(--border)] hover:border-primary-400/30'}`}>
      <div className="flex gap-0">
        {/* Thumbnail */}
        <div className="w-28 sm:w-36 shrink-0 relative bg-gradient-to-br from-primary-700 to-accent-800">
          {course.thumbnail
            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover absolute inset-0" />
            : <div className="flex items-center justify-center h-full min-h-24"><BookOpen className="w-8 h-8 text-white/20" /></div>
          }
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${course.isPublished ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
            {course.isPublished ? 'Live' : 'Draft'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[var(--text)] text-sm leading-snug truncate">{course.title}</h3>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
                <span className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)]">{course.category}</span>
                <span>{course.level}</span>
                {course.price === 0 ? <span className="text-green-500 font-medium">Free</span> : <span>₹{course.price}</span>}
              </div>
            </div>

            {/* Actions menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-all"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 w-44 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-20 overflow-hidden animate-slide-up">
                  <Link to={`/teacher/courses/${course._id}/edit`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
                    <Edit2 size={14} /> Edit Course
                  </Link>
                  <Link to={`/teacher/courses/${course._id}/lectures`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
                    <BookOpen size={14} /> Manage Lectures
                  </Link>
                  <Link to={`/courses/${course._id}`} target="_blank" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
                    <ExternalLink size={14} /> Preview
                  </Link>
                  <button onClick={handleToggle} disabled={toggling} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors">
                    {toggling ? <Loader2 size={14} className="animate-spin" /> : course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <div className="border-t border-[var(--border)]" />
                  <button onClick={handleDelete} disabled={deleting} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/5 transition-colors">
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-primary-400" />
              <span>{course.enrollmentCount || course.enrolledStudents?.length || 0} students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-accent-400" />
              <span>{course.lectures?.length || 0} lectures</span>
            </div>
            <span className="ml-auto">{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    courseAPI.getTeacherCourses()
      .then(({ data }) => setCourses(data.courses || []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await courseAPI.delete(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch { toast.error('Failed to delete course'); }
  };

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await courseAPI.togglePublish(id);
      setCourses(prev => prev.map(c => c._id === id ? { ...c, isPublished: data.course.isPublished } : c));
      toast.success(data.message);
    } catch { toast.error('Failed to update course'); }
  };

  const filtered = filter === 'all' ? courses : filter === 'published' ? courses.filter(c => c.isPublished) : courses.filter(c => !c.isPublished);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text)]">My Courses</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{courses.length} courses total</p>
        </div>
        <Link
          to="/teacher/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold text-sm hover:shadow-glow hover:-translate-y-0.5 transition-all w-fit"
        >
          <Plus size={16} /> Create Course
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['all', 'All', courses.length], ['published', 'Published', courses.filter(c => c.isPublished).length], ['draft', 'Drafts', courses.filter(c => !c.isPublished).length]].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-primary-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400'}`}
          >
            {label} <span className="ml-1 opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
          <BookOpen className="w-14 h-14 text-[var(--border)] mx-auto mb-4" />
          <h3 className="font-semibold text-[var(--text)] mb-2">
            {filter === 'all' ? "You haven't created any courses yet" : `No ${filter} courses`}
          </h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            {filter === 'all' ? 'Create your first course to start teaching!' : `Switch to "All" to see all your courses.`}
          </p>
          {filter === 'all' && (
            <Link to="/teacher/courses/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors">
              <Plus size={16} /> Create First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(course => (
            <CourseRow key={course._id} course={course} onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
          ))}
        </div>
      )}
    </div>
  );
}
