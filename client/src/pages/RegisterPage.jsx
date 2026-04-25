import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [role, setRole] = useState("student");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-700 via-accent-800 to-dark-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl text-white font-bold mb-4">Start Learning Today</h1>
          <p className="text-accent-200 text-lg leading-relaxed">
            Join thousands of students and teachers on EduFlow. Build skills, share knowledge, transform lives.
          </p>
          <div className="mt-10 space-y-4">
            {['📚 Access 500+ expert-led courses', '🏆 Track progress and earn certificates', '💬 Engage with a vibrant community'].map(f => (
              <div key={f} className="flex items-center gap-3 text-accent-100 text-sm bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">EduFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link></p>

          {/* Role selector */}
          <div className="flex gap-4 mt-4">
          <button
            onClick={() => setForm(p => ({ ...p, role: "teacher" }))}
            className={`flex-1 py-2 rounded-lg border-2 transition-all duration-200 
              ${form.role === "teacher"
                ? "border-purple-500 bg-purple-100 text-purple-700"
                : "border-dashed border-purple-300 hover:bg-purple-50"}
            `}
          >
            👨‍🏫 Teacher Demo
          </button>

          <button
            onClick={() => setForm(p => ({ ...p, role: "student" }))}
            className={`flex-1 py-2 rounded-lg border-2 transition-all duration-200 
              ${form.role === "student"
                ? "border-blue-500 bg-blue-100 text-blue-700"
                : "border-dashed border-blue-300 hover:bg-blue-50"}
            `}
          >
            🎓 Student Demo
          </button>
        </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-10" type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required minLength={2} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-10" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-10 pr-10" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</span> : `Create ${form.role === 'teacher' ? 'Teacher' : 'Student'} Account`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
