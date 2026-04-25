import { useState, useEffect } from 'react';
import { announcementAPI, courseAPI } from '../../utils/api';
import { Megaphone, Plus, Trash2, Loader2, Pin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: 'text-green-500 bg-green-500/10', medium: 'text-yellow-500 bg-yellow-500/10', high: 'text-red-500 bg-red-500/10' };

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', courseId: '', priority: 'medium', isPinned: false });

  useEffect(() => {
    Promise.all([
      announcementAPI.getAll(),
      courseAPI.getTeacherCourses(),
    ]).then(([aRes, cRes]) => {
      setAnnouncements(aRes.data.announcements || []);
      setCourses(cRes.data.courses || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Title and content are required');
    setSubmitting(true);
    try {
      const { data } = await announcementAPI.create(form);
      setAnnouncements(prev => [data.announcement, ...prev]);
      setForm({ title: '', content: '', courseId: '', priority: 'medium', isPinned: false });
      setShowForm(false);
      toast.success('Announcement posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Announcement deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text)]">Announcements</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">Post updates for your students</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold text-sm hover:shadow-glow transition-all"
        >
          <Plus size={15} /> New Announcement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--bg-card)] border-2 border-primary-500/30 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-[var(--text)]">Create Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Title <span className="text-red-400">*</span></label>
              <input
                value={form.title} onChange={set('title')} placeholder="Announcement title..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-[var(--text-muted)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Content <span className="text-red-400">*</span></label>
              <textarea
                value={form.content} onChange={set('content')} rows={4} placeholder="Write your announcement here..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-[var(--text-muted)]"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Course (optional)</label>
                <select value={form.courseId} onChange={set('courseId')} className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All students</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Priority</label>
                <select value={form.priority} onChange={set('priority')} className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isPinned ? 'bg-primary-500' : 'bg-[var(--border)]'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPinned ? 'translate-x-4' : ''}`} />
                    <input type="checkbox" checked={form.isPinned} onChange={set('isPinned')} className="hidden" />
                  </div>
                  <span className="text-sm text-[var(--text)]">Pin this</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-sm">Cancel</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-60">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Megaphone size={15} />}
                Post Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
          <Megaphone className="w-12 h-12 text-[var(--border)] mx-auto mb-3" />
          <p className="text-[var(--text)] font-semibold mb-1">No announcements yet</p>
          <p className="text-[var(--text-muted)] text-sm">Create your first announcement to inform students</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a._id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-primary-400/30 transition-all">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {a.isPinned && <Pin size={14} className="text-primary-400 shrink-0" />}
                  <h3 className="font-semibold text-[var(--text)]">{a.title}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${PRIORITY_COLORS[a.priority]}`}>
                    {a.priority}
                  </span>
                  {a.course && (
                    <span className="px-2 py-0.5 rounded-md text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                      Course specific
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{a.content}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                <span>Posted by {a.author?.name}</span>
                <span>·</span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
