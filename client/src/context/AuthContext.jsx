import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eduflow_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('eduflow_dark') === 'true');

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('eduflow_dark', darkMode);
  }, [darkMode]);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('eduflow_token');
    if (token) {
      authAPI.getMe()
        .then(({ data }) => { setUser(data.user); localStorage.setItem('eduflow_user', JSON.stringify(data.user)); })
        .catch(() => { localStorage.removeItem('eduflow_token'); localStorage.removeItem('eduflow_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('eduflow_token', data.token);
    localStorage.setItem('eduflow_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const { data } = await authAPI.register({ name, email, password, role });
    localStorage.setItem('eduflow_token', data.token);
    localStorage.setItem('eduflow_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Account created successfully!');
    return data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('eduflow_token');
    localStorage.removeItem('eduflow_user');
    setUser(null);
    toast.success('Logged out');
    window.location.href = '/login';
  }, []);

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    localStorage.setItem('eduflow_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, loading, darkMode, setDarkMode, login, register, logout, updateUser, isTeacher: user?.role === 'teacher' || user?.role === 'admin', isStudent: user?.role === 'student' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
