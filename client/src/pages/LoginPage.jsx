import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'teacher') setForm({ email: 'teacher@demo.com', password: 'demo123' });
    else setForm({ email: 'student@demo.com', password: 'demo123' });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-900">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-700 via-primary-800 to-dark-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 shadow-glow">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl text-white font-bold mb-4">Welcome Back</h1>
          <p className="text-primary-200 text-lg leading-relaxed">
            Continue your learning journey with EduFlow. Access courses, track progress, and grow every day.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[['500+', 'Courses'], ['12K+', 'Students'], ['98%', 'Satisfaction']].map(([n, l]) => (
              <div key={l} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-primary-300 text-xs mt-1">{l}</div>
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

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Create one</Link></p>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('teacher')} className="flex-1 py-2 px-3 rounded-xl border-2 border-dashed border-accent-300 dark:border-accent-700 text-accent-600 dark:text-accent-400 text-xs font-semibold hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors">
              👨‍🏫 Teacher Demo
            </button>
            <button onClick={() => fillDemo('student')} className="flex-1 py-2 px-3 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              🎓 Student Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <input className="input pl-10 pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-500 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
