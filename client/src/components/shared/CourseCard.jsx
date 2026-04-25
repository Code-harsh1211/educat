import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, Star, Lock, Globe } from 'lucide-react';

const levelColors = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function CourseCard({ course, showActions, onEdit, onDelete, onPublish }) {
  const enrolled = course.enrolledStudents?.length || course.enrollmentCount || 0;
  const lectures = course.lectures?.length || course.lectureCount || 0;

  return (
    <div className="card overflow-hidden hover:shadow-lg dark:hover:shadow-card-dark transition-all duration-300 group flex flex-col">
      {/* Thumbnail */}
      <Link to={`/courses/${course._id}`} className="block relative overflow-hidden h-44 bg-gradient-to-br from-primary-600 to-accent-600 flex-shrink-0">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          {course.price === 0 ? (
            <span className="badge bg-green-500 text-white">Free</span>
          ) : (
            <span className="badge bg-dark-900/80 text-white backdrop-blur-sm">
              ₹{course.price}
            </span>
          )}
        </div>

        {/* Published badge (teacher view) */}
        {showActions && (
          <div className="absolute top-3 left-3">
            <span className={`badge ${course.isPublished ? 'bg-green-500/80 text-white' : 'bg-dark-800/80 text-slate-300'} backdrop-blur-sm`}>
              {course.isPublished ? <><Globe className="w-3 h-3" /> Published</> : <><Lock className="w-3 h-3" /> Draft</>}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`badge ${levelColors[course.level] || levelColors.Beginner} text-xs`}>
            {course.level}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{course.category}</span>
        </div>

        <Link to={`/courses/${course._id}`}>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {course.title}
          </h3>
        </Link>

        {course.teacher && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            by <span className="font-medium text-slate-700 dark:text-slate-300">{course.teacher.name || course.teacher}</span>
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-auto mb-3">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{enrolled}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{lectures} lessons</span>
          {course.rating?.average > 0 && (
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{course.rating.average.toFixed(1)}</span>
          )}
        </div>

        {/* Teacher actions */}
        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-dark-600">
            <button onClick={() => onEdit?.(course)} className="flex-1 btn-secondary text-xs py-1.5 px-3">Edit</button>
            <button onClick={() => onPublish?.(course)} className={`flex-1 text-xs py-1.5 px-3 rounded-xl font-semibold transition-all ${course.isPublished ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'}`}>
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={() => onDelete?.(course)} className="py-1.5 px-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 text-xs font-semibold transition-all">Del</button>
          </div>
        )}
      </div>
    </div>
  );
}
