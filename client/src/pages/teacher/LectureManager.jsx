import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lectureAPI, courseAPI } from '../../utils/api';
import {
  ArrowLeft, Plus, Edit2, Trash2, PlayCircle, FileText,
  Upload, Save, X, Loader2, GripVertical, Eye, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function LectureForm({ courseId, lecture, onSave, onCancel }) {
  const isEditing = Boolean(lecture);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: lecture?.title || '',
    description: lecture?.description || '',
    isPreview: lecture?.isPreview || false,
  });
  const [video, setVideo] = useState(null);
  const [pdf, setPdf] = useState(null);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Lecture title is required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('isPreview', form.isPreview);
      if (video) fd.append('video', video);
      if (pdf) fd.append('pdf', pdf);

      if (isEditing) {
        const { data } = await lectureAPI.update(lecture._id, fd);
        onSave(data.lecture, 'updated');
      } else {
        const { data } = await lectureAPI.create(courseId, fd);
        onSave(data.lecture, 'created');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lecture');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-[var(--bg-card)] border-2 border-primary-500/30 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text)]">{isEditing ? 'Edit Lecture' : 'Add New Lecture'}</h3>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg)] transition-all">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Title <span className="text-red-400">*</span></label>
          <input
            value={form.title} onChange={set('title')}
            placeholder="e.g. Introduction to Variables"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-[var(--text-muted)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Description</label>
          <textarea
            value={form.description} onChange={set('description')} rows={2}
            placeholder="Brief description of this lecture..."
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-[var(--text-muted)]"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Video upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Video Lecture</label>
            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm
              ${video ? 'border-primary-500 bg-primary-500/5 text-primary-500' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400'}`}>
              <PlayCircle size={16} />
              {video ? video.name.slice(0, 20) + '...' : (lecture?.videoUrl ? 'Replace video' : 'Upload video')}
              <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} className="hidden" />
            </label>
            {lecture?.videoUrl && !video && <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle size={11} /> Video uploaded</p>}
          </div>

          {/* PDF upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Notes / PDF</label>
            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm
              ${pdf ? 'border-accent-500 bg-accent-500/5 text-accent-500' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-accent-400'}`}>
              <FileText size={16} />
              {pdf ? pdf.name.slice(0, 20) + '...' : (lecture?.pdfUrl ? 'Replace PDF' : 'Upload PDF')}
              <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files[0])} className="hidden" />
            </label>
            {lecture?.pdfUrl && !pdf && <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle size={11} /> PDF uploaded</p>}
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className={`relative w-9 h-5 rounded-full transition-colors ${form.isPreview ? 'bg-primary-500' : 'bg-[var(--border)]'}`}>
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPreview ? 'translate-x-4' : ''}`} />
            <input type="checkbox" checked={form.isPreview} onChange={set('isPreview')} className="hidden" />
          </div>
          <span className="text-sm text-[var(--text)]">Free preview (accessible without enrollment)</span>
        </label>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-sm hover:border-[var(--text-muted)] transition-all">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-60 transition-all">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving...' : isEditing ? 'Update Lecture' : 'Add Lecture'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LectureManager() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([
      courseAPI.getOne(courseId),
      lectureAPI.getForCourse(courseId),
    ]).then(([cRes, lRes]) => {
      setCourse(cRes.data.course);
      setLectures(lRes.data.lectures || []);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSave = (savedLecture, action) => {
    if (action === 'created') {
      setLectures(prev => [...prev, savedLecture]);
    } else {
      setLectures(prev => prev.map(l => l._id === savedLecture._id ? savedLecture : l));
    }
    toast.success(`Lecture ${action}!`);
    setShowForm(false);
    setEditingLecture(null);
  };

  const handleDelete = async (lectureId) => {
    if (!confirm('Delete this lecture? This cannot be undone.')) return;
    setDeleting(lectureId);
    try {
      await lectureAPI.delete(lectureId);
      setLectures(prev => prev.filter(l => l._id !== lectureId));
      toast.success('Lecture deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/teacher/courses" className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-400 transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-xl text-[var(--text)] truncate">Lectures: {course?.title}</h1>
          <p className="text-[var(--text-muted)] text-sm">{lectures.length} lectures</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingLecture(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold text-sm hover:shadow-glow transition-all"
        >
          <Plus size={15} /> Add Lecture
        </button>
      </div>

      {/* Add form */}
      {showForm && !editingLecture && (
        <LectureForm courseId={courseId} onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Lecture list */}
      {lectures.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
          <PlayCircle className="w-14 h-14 text-[var(--border)] mx-auto mb-4" />
          <h3 className="font-semibold text-[var(--text)] mb-2">No lectures yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">Add your first lecture to get started</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm">
            <Plus size={16} /> Add First Lecture
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {lectures.map((lecture, idx) => (
            <div key={lecture._id}>
              {editingLecture?._id === lecture._id ? (
                <LectureForm courseId={courseId} lecture={lecture} onSave={handleSave} onCancel={() => setEditingLecture(null)} />
              ) : (
                <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-start gap-4 transition-all ${deleting === lecture._id ? 'opacity-50' : 'hover:border-primary-400/30'}`}>
                  <div className="text-[var(--text-muted)] mt-1 cursor-grab"><GripVertical size={16} /></div>
                  <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[var(--text)] text-sm">{lecture.title}</h3>
                        {lecture.description && <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{lecture.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {lecture.videoUrl && (
                        <span className="flex items-center gap-1 text-xs text-primary-400">
                          <PlayCircle size={12} /> Video
                        </span>
                      )}
                      {lecture.pdfUrl && (
                        <span className="flex items-center gap-1 text-xs text-accent-400">
                          <FileText size={12} /> {lecture.pdfName || 'PDF'}
                        </span>
                      )}
                      {lecture.isPreview && (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <Eye size={12} /> Free Preview
                        </span>
                      )}
                      {lecture.views > 0 && (
                        <span className="text-xs text-[var(--text-muted)] ml-auto">{lecture.views} views</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => { setEditingLecture(lecture); setShowForm(false); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-primary-500/10 hover:text-primary-500 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(lecture._id)}
                      disabled={deleting === lecture._id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      {deleting === lecture._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
