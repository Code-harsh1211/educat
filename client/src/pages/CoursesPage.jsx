import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../utils/api';
import { Search, Filter, BookOpen, Users, Clock, Star, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Programming', 'Mathematics', 'Science', 'Language', 'Arts', 'Business', 'History', 'Other'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function CourseCard({ course }) {
  const { user } = useAuth();
  const isEnrolled = user?.enrolledCourses?.includes(course._id);

  return (
    <Link
      to={`/courses/${course._id}`}
      className="group block bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-400/40"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-700 to-accent-800 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 text-xs rounded-lg bg-black/50 text-white backdrop-blur">
            {course.level}
          </span>
          <span className="px-2 py-1 text-xs rounded-lg bg-primary-500/80 text-white">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </span>
        </div>

        {isEnrolled && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-semibold">
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs text-primary-500 font-medium">
          {course.category}
        </span>

        <h3 className="font-semibold text-sm mt-1 mb-2 line-clamp-2 group-hover:text-primary-500">
          {course.title}
        </h3>

        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
          {course.shortDescription || course.description}
        </p>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{course.teacher?.name || "Instructor"}</span>
          <span>{course.enrolledStudents?.length || 0} students</span>
        </div>
      </div>
    </Link>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [price, setPrice] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await courseAPI.getAll({ search, category, level, price, sort, page, limit: 12 });
      setCourses(data.courses);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch { } finally {
      setLoading(false);
    }
  }, [search, category, level, price, sort, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilter = (setter, val) => { setter(val); setPage(1); };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700/90 to-primary-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-6 w-fit">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">EduFlow</span>
          </Link>
          <h1 className="font-display font-bold text-4xl text-white mb-3">Explore Courses</h1>
          <p className="text-primary-200 mb-6">{total} courses available</p>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 rounded-2xl bg-[var(--bg-card)] backdrop-blur-md
           border border-[var(--border)] shadow-sm">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => handleFilter(setCategory, c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${category === c ? 'bg-primary-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <select
              value={level}
              onChange={e => handleFilter(setLevel, e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] focus:outline-none focus:border-primary-400"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select
              value={price}
              onChange={e => handleFilter(setPrice, e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] focus:outline-none focus:border-primary-400"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={sort}
              onChange={e => handleFilter(setSort, e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] focus:outline-none focus:border-primary-400"
            >
              <option value="">Newest</option>
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden animate-pulse">
                <div className="h-44 bg-[var(--border)]" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-[var(--border)] rounded w-1/3" />
                  <div className="h-4 bg-[var(--border)] rounded" />
                  <div className="h-3 bg-[var(--border)] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-[var(--border)] mx-auto mb-4" />
            <h3 className="text-[var(--text)] font-semibold text-lg mb-2">No courses found</h3>
            <p className="text-[var(--text-muted)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map(c => <CourseCard key={c._id} course={c} />)}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${page === p ? 'bg-primary-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400 disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
