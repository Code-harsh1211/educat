import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from "../../utils/api";
import { Search, BookOpen, Users, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

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

  const handleFilter = (setter, val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-6 w-fit">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">EduFlow</span>
          </Link>

          <h1 className="font-display font-bold text-4xl text-white mb-3">
            Explore Courses
          </h1>

          <p className="text-primary-200 mb-6">
            {total} courses available
          </p>

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

            <button className="px-5 py-3 bg-white text-primary-700 rounded-xl font-semibold text-sm hover:bg-primary-50 transition">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* FILTER CARD */}
        <div className="mb-8 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-sm flex flex-wrap gap-4">

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => handleFilter(setCategory, c)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  category === c
                    ? 'bg-primary-500 text-white'
                    : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Right Filters */}
          <div className="flex gap-2 ml-auto">
            <select
              value={level}
              onChange={e => handleFilter(setLevel, e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)]"
            >
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>

            <select
              value={price}
              onChange={e => handleFilter(setPrice, e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)]"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            <select
              value={sort}
              onChange={e => handleFilter(setSort, e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg)] border border-[var(--border)]"
            >
              <option value="">Newest</option>
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse h-60" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-[var(--border)] mx-auto mb-4" />
            <h3>No courses found</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(c => <CourseCard key={c._id} course={c} />)}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}