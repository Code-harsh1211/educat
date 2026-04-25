import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../../utils/api';
import { BookOpen, PlayCircle, Award, Clock, Search, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function CourseProgressCard({ enrollment }) {
  const course = enrollment.course;
  const progress = enrollment.progress || 0;
  const isCompleted = progress === 100;
  const firstLecture = course?.lectures?.[0];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-primary-400/40 hover:shadow-card transition-all">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary-700 to-accent-800">
        {course?.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />}
        {isCompleted && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-green-500/90 backdrop-blur flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div
            className={`h-full transition-all ${isCompleted ? 'bg-green-400' : 'bg-gradient-to-r from-primary-400 to-accent-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[var(--text)] text-sm leading-snug mb-1 line-clamp-2">{course?.title}</h3>
        <p className="text-xs text-[var(--text-muted)] mb-3">{course?.teacher?.name}</p>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
          <span className="flex items-center gap-1">
            <CheckCircle size={11} className="text-green-500" />
            {enrollment.completedLectures?.length || 0} / {course?.lectures?.length || 0} lectures
          </span>
          <span className={`font-semibold ${isCompleted ? 'text-green-500' : 'text-primary-500'}`}>{progress}%</span>
        </div>

        {firstLecture ? (
          <Link
            to={`/courses/${course?._id}/lectures/${firstLecture._id}`}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all
              ${isCompleted
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border border-green-500/20'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-glow'}`}
          >
            {isCompleted ? <><Award size={15} /> Review Course</> : <><PlayCircle size={15} /> Continue</>}
          </Link>
        ) : (
          <Link
            to={`/courses/${course?._id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400 transition-all"
          >
            <BookOpen size={15} /> View Course
          </Link>
        )}
      </div>
    </div>
  );
}

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then(({ data }) => setEnrollments(data.enrollments || []))
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => {
    const matchSearch = e.course?.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'completed' ? e.progress === 100 :
      filter === 'in-progress' ? (e.progress > 0 && e.progress < 100) :
      filter === 'not-started' ? (e.progress === 0) :
      true;
    return matchSearch && matchFilter;
  });

  const stats = {
    all: enrollments.length,
    completed: enrollments.filter(e => e.progress === 100).length,
    'in-progress': enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
    'not-started': enrollments.filter(e => e.progress === 0).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">My Learning</h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">{enrollments.length} courses enrolled</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-[var(--text-muted)]"
          />
        </div>
        <div className="flex gap-2">
          {[['all', 'All'], ['in-progress', 'In Progress'], ['completed', 'Completed'], ['not-started', 'Not Started']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${filter === val ? 'bg-primary-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400'}`}
            >
              {label} ({stats[val]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
          <BookOpen className="w-14 h-14 text-[var(--border)] mx-auto mb-4" />
          <h3 className="font-semibold text-[var(--text)] mb-2">
            {enrollments.length === 0 ? "You haven't enrolled in any courses yet" : "No courses match your filter"}
          </h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            {enrollments.length === 0 ? "Browse our course catalog to get started!" : "Try a different filter or search term."}
          </p>
          {enrollments.length === 0 && (
            <Link to="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors">
              Browse Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(e => <CourseProgressCard key={e._id} enrollment={e} />)}
        </div>
      )}
    </div>
  );
}
