import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { User, Mail, Phone, FileText, Camera, Save, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function Section({ title, children }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
      <h2 className="font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)] mb-1.5">
        <Icon size={14} className="text-[var(--text-muted)]" /> {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-[var(--text-muted)]";

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setPw = k => e => setPwForm(p => ({ ...p, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('bio', form.bio);
      fd.append('phone', form.phone);
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await authAPI.updateProfile(fd);
      updateUser(data.user);
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Please fill all fields');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setPwLoading(true);
    try {
      await authAPI.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--text)]">Profile Settings</h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Profile info */}
      <Section title="Personal Information">
        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {avatarPreview
                  ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()
                }
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Camera size={20} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text)]">{user?.name}</p>
              <p className="text-sm text-[var(--text-muted)] capitalize">{user?.role}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-primary-500 hover:underline mt-1"
              >
                Change photo
              </button>
            </div>
          </div>

          <Field label="Full Name" icon={User}>
            <input value={form.name} onChange={set('name')} className={inputCls} placeholder="Your full name" />
          </Field>

          <Field label="Email" icon={Mail}>
            <input value={user?.email} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
          </Field>

          <Field label="Phone" icon={Phone}>
            <input value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+91 12345 67890" />
          </Field>

          <Field label="Bio" icon={FileText}>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="Tell us about yourself..."
              maxLength={500}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-[var(--text-muted)] text-right mt-1">{form.bio.length}/500</p>
          </Field>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 text-white font-semibold text-sm hover:shadow-glow hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5 flex items-center gap-2">
              <Lock size={14} className="text-[var(--text-muted)]" /> Current Password
            </label>
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={pwForm.currentPassword}
                onChange={setPw('currentPassword')}
                className={`${inputCls} pr-10`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5 flex items-center gap-2">
              <Lock size={14} className="text-[var(--text-muted)]" /> New Password
            </label>
            <div className="relative">
              <input
                type={showPw.new ? 'text' : 'password'}
                value={pwForm.newPassword}
                onChange={setPw('newPassword')}
                className={`${inputCls} pr-10`}
                placeholder="Min. 6 characters"
              />
              <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
                {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-semibold text-sm hover:border-primary-400 transition-all disabled:opacity-60"
            >
              {pwLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Account info */}
      <Section title="Account Information">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Account Type', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
            { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
            { label: 'Email', value: user?.email },
            { label: 'Status', value: 'Active' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[var(--text-muted)] text-xs mb-0.5">{label}</p>
              <p className="text-[var(--text)] font-medium">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
