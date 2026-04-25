import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lectureAPI, commentAPI, courseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, FileText,
  MessageSquare, Send, Trash2, Download, PlayCircle, Loader2,
  BookOpen, List, X
} from 'lucide-react';
import toast from 'react-hot-toast';

function CommentSection({ lectureId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    commentAPI.getForLecture(lectureId)
      .then(({ data }) => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lectureId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await commentAPI.add(lectureId, { text, parentCommentId: replyTo?._id });
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c._id === replyTo._id ? { ...c, replies: [...(c.replies || []), data.comment] } : c
        ));
      } else {
        setComments(prev => [data.comment, ...prev]);
      }
      setText('');
      setReplyTo(null);
      toast.success('Comment posted');
    } catch { toast.error('Failed to post comment'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId, parentId) => {
    try {
      await commentAPI.delete(commentId);
      if (parentId) {
        setComments(prev => prev.map(c =>
          c._id === parentId ? { ...c, replies: c.replies.filter(r => r._id !== commentId) } : c
        ));
      } else {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  const CommentItem = ({ comment, isReply = false, parentId }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {comment.author?.avatar
          ? <img src={comment.author.avatar} className="w-full h-full rounded-full object-cover" alt="" />
          : comment.author?.name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[var(--text)]">{comment.author?.name}</span>
          {comment.author?.role === 'teacher' && (
            <span className="px-1.5 py-0.5 rounded bg-primary-500/15 text-primary-500 text-[10px] font-semibold">Instructor</span>
          )}
          <span className="text-xs text-[var(--text-muted)] ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{comment.text}</p>
        <div className="flex items-center gap-3 mt-2">
          {!isReply && (
            <button onClick={() => setReplyTo(comment)} className="text-xs text-[var(--text-muted)] hover:text-primary-500 transition-colors">
              Reply
            </button>
          )}
          {(user?._id === comment.author?._id || user?.role === 'teacher' || user?.role === 'admin') && (
            <button onClick={() => handleDelete(comment._id, parentId)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={12} />
            </button>
          )}
        </div>
        {!isReply && comment.replies?.map(reply => (
          <CommentItem key={reply._id} comment={reply} isReply parentId={comment._id} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-primary-500" />
        Discussion ({comments.length})
      </h3>

      {/* Post comment */}
      <form onSubmit={handleSubmit} className="mb-6">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
            <span className="text-xs text-primary-500">Replying to <strong>{replyTo.author?.name}</strong></span>
            <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-primary-400 hover:text-primary-600"><X size={14} /></button>
          </div>
        )}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={replyTo ? 'Write a reply...' : 'Ask a question or leave a comment...'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary-500" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-muted)] text-sm">No comments yet. Be the first to ask a question!</div>
      ) : (
        <div className="space-y-5">
          {comments.map(c => <CommentItem key={c._id} comment={c} />)}
        </div>
      )}
    </div>
  );
}

export default function LecturePage() {
  const { courseId, lectureId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [lecture, setLecture] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedIds, setCompletedIds] = useState([]);

  useEffect(() => {
    Promise.all([
      lectureAPI.getOne(lectureId),
      lectureAPI.getForCourse(courseId),
      courseAPI.getOne(courseId),
    ]).then(([lRes, lsRes, cRes]) => {
      setLecture(lRes.data.lecture);
      setLectures(lsRes.data.lectures || []);
      setCourse(cRes.data.course);
      // Get completed from enrollment
      if (cRes.data.enrollment) {
        setCompletedIds(cRes.data.enrollment.completedLectures || []);
        setCompleted(cRes.data.enrollment.completedLectures?.includes(lectureId));
      }
    }).catch(() => toast.error('Failed to load lecture'))
      .finally(() => setLoading(false));
  }, [lectureId, courseId]);

  const handleMarkComplete = async () => {
    try {
      const { data } = await lectureAPI.markComplete(lectureId);
      setCompleted(true);
      setCompletedIds(data.enrollment?.completedLectures || []);
      toast.success('Lecture marked as complete! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking complete');
    }
  };

  const currentIndex = lectures.findIndex(l => l._id === lectureId);
  const prevLecture = lectures[currentIndex - 1];
  const nextLecture = lectures[currentIndex + 1];

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (!lecture) return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <p className="text-[var(--text-muted)]">Lecture not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center px-4 gap-3 shrink-0">
        <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm hidden sm:block truncate max-w-48">{course?.title}</span>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text)] truncate">{lecture.title}</p>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] text-sm transition-all"
        >
          <List size={15} />
          <span className="hidden sm:block">Contents</span>
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Video player */}
            {lecture.videoUrl && (
              <div className="rounded-2xl overflow-hidden bg-black mb-6 shadow-2xl">
                <video
                  ref={videoRef}
                  src={lecture.videoUrl}
                  controls
                  className="w-full aspect-video"
                  onEnded={handleMarkComplete}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Lecture info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display font-bold text-2xl text-[var(--text)] mb-1">{lecture.title}</h1>
                {lecture.description && (
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed">{lecture.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!completed ? (
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all"
                  >
                    <CheckCircle size={16} />
                    Mark Complete
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <CheckCircle size={16} />
                    Completed!
                  </div>
                )}
              </div>
            </div>

            {/* PDF download */}
            {lecture.pdfUrl && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center shrink-0">
                  <FileText className="text-accent-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">{lecture.pdfName || 'Lecture Notes'}</p>
                  <p className="text-xs text-[var(--text-muted)]">PDF Document</p>
                </div>
                <a
                  href={lecture.pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500 text-white text-xs font-semibold hover:bg-accent-600 transition-colors"
                >
                  <Download size={13} />
                  Download
                </a>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)] mb-6">
              <button
                onClick={() => prevLecture && navigate(`/courses/${courseId}/lectures/${prevLecture._id}`)}
                disabled={!prevLecture}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:border-primary-400 hover:text-[var(--text)] disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                {currentIndex + 1} / {lectures.length}
              </span>
              <button
                onClick={() => nextLecture && navigate(`/courses/${courseId}/lectures/${nextLecture._id}`)}
                disabled={!nextLecture}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-40 transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* Comments */}
            <CommentSection lectureId={lectureId} />
          </div>
        </div>

        {/* Sidebar - lecture list */}
        {sidebarOpen && (
          <aside className="hidden lg:flex flex-col w-80 border-l border-[var(--border)] bg-[var(--bg-card)] shrink-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text)] text-sm">Course Content</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">{completedIds.length} / {lectures.length} complete</p>
              <div className="h-1.5 rounded-full bg-[var(--border)] mt-2">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                  style={{ width: `${lectures.length ? (completedIds.length / lectures.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-[var(--border)]">
              {lectures.map((l, idx) => {
                const isActive = l._id === lectureId;
                const isDone = completedIds.includes(l._id);
                return (
                  <button
                    key={l._id}
                    onClick={() => navigate(`/courses/${courseId}/lectures/${l._id}`)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-[var(--bg)] transition-colors ${isActive ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold transition-all
                      ${isDone ? 'border-green-500 bg-green-500 text-white' : isActive ? 'border-primary-500 text-primary-500' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                    >
                      {isDone ? <CheckCircle size={12} /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug ${isActive ? 'text-primary-500' : 'text-[var(--text)]'}`}>
                        {l.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {l.videoUrl && <PlayCircle size={10} className="text-[var(--text-muted)]" />}
                        {l.pdfUrl && <FileText size={10} className="text-[var(--text-muted)]" />}
                        {l.videoDuration > 0 && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {Math.floor(l.videoDuration / 60)}:{String(l.videoDuration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
