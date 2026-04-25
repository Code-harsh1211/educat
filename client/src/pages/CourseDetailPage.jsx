import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseAPI, enrollmentAPI, lectureAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Users, Clock, Lock, PlayCircle, FileText, CheckCircle, ChevronDown, ChevronUp, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    courseAPI.getOne(id)
      .then(({ data }) => {
        setCourse(data.course);
        setIsEnrolled(data.isEnrolled);
        setEnrollment(data.enrollment);
      })
      .catch(() => toast.error('Course not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(id);
      setIsEnrolled(true);
      toast.success('Enrolled successfully!');
      // Redirect to first lecture
      if (course.lectures?.[0]) {
        navigate(`/courses/${id}/lectures/${course.lectures[0]._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Course not found</p>
    </div>
  );

  const isTeacher = user?._id === course.teacher?._id || user?.role === 'admin';
  const totalDuration = course.lectures?.reduce((sum, l) => sum + (l.videoDuration || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/courses" className="inline-flex items-center gap-2 text-primary-300 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Courses
          </Link>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-xs font-medium">{course.category}</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white/70 text-xs font-medium">{course.level}</span>
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-4 leading-tight">{course.title}</h1>
              <p className="text-white/70 leading-relaxed mb-6 text-sm">{course.shortDescription || course.description?.slice(0, 200)}</p>
              <div className="flex items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                    {course.teacher?.name?.[0]}
                  </div>
                  <span className="text-white/80">{course.teacher?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>{course.lectures?.length || 0} lectures</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment card */}
            <div className="lg:row-start-1">
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl sticky top-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-700 to-accent-800 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-4">
                    {course.price === 0 ? (
                      <span className="text-2xl font-bold text-green-500">Free</span>
                    ) : (
                      <span className="text-2xl font-bold text-[var(--text)]">₹{course.price}</span>
                    )}
                  </div>

                  {isTeacher ? (
                    <div className="space-y-2">
                      <Link to={`/teacher/courses/${id}/lectures`} className="block w-full py-3 rounded-xl bg-primary-500 text-white text-center font-semibold text-sm hover:bg-primary-600 transition-colors">
                        Manage Lectures
                      </Link>
                      <Link to={`/teacher/courses/${id}/edit`} className="block w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text)] text-center font-semibold text-sm hover:border-primary-400 transition-colors">
                        Edit Course
                      </Link>
                    </div>
                  ) : isEnrolled ? (
                    <div className="space-y-3">
                      {enrollment && (
                        <div>
                          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                            <span>Progress</span><span>{enrollment.progress || 0}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--border)]">
                            <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
                          </div>
                        </div>
                      )}
                      {course.lectures?.[0] && (
                        <Link to={`/courses/${id}/lectures/${course.lectures[0]._id}`} className="block w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white text-center font-semibold text-sm hover:opacity-90 transition-all">
                          Continue Learning
                        </Link>
                      )}
                      <div className="flex items-center gap-2 text-green-500 text-sm justify-center">
                        <CheckCircle size={16} />
                        <span className="font-medium">You're enrolled!</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold text-sm hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {enrolling ? <><Loader2 size={16} className="animate-spin" /> Enrolling...</> : course.price > 0 ? `Enroll for ₹${course.price}` : 'Enroll for Free'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* What you'll learn */}
          {course.whatYouLearn?.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--text)] mb-4">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                    <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course content */}
          <div>
            <h2 className="font-display font-bold text-xl text-[var(--text)] mb-4">Course Content</h2>
            <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
              {course.lectures?.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-sm">No lectures yet</div>
              ) : (
                course.lectures?.map((lecture, idx) => (
                  <div key={lecture._id} className={`border-b border-[var(--border)] last:border-b-0 ${isEnrolled || lecture.isPreview ? 'hover:bg-[var(--bg)] cursor-pointer' : ''}`}>
                    <div
                      className="flex items-center gap-3 px-5 py-4"
                      onClick={() => (isEnrolled || lecture.isPreview || isTeacher) && navigate(`/courses/${id}/lectures/${lecture._id}`)}
                    >
                      <div className="w-7 h-7 rounded-full border-2 border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-muted)] shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {lecture.videoUrl ? <PlayCircle size={15} className="text-primary-400 shrink-0" /> : <FileText size={15} className="text-accent-400 shrink-0" />}
                        <span className={`text-sm truncate ${isEnrolled || lecture.isPreview ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{lecture.title}</span>
                        {lecture.isPreview && <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-medium">Preview</span>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {lecture.pdfUrl && <FileText size={13} className="text-[var(--text-muted)]" />}
                        {lecture.videoDuration > 0 && (
                          <span className="text-xs text-[var(--text-muted)]">{Math.floor(lecture.videoDuration / 60)}:{String(lecture.videoDuration % 60).padStart(2, '0')}</span>
                        )}
                        {!isEnrolled && !lecture.isPreview && !isTeacher && <Lock size={13} className="text-[var(--text-muted)]" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display font-bold text-xl text-[var(--text)] mb-3">About this course</h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl text-[var(--text)] mb-3">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
