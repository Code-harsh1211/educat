import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';

const typeColors = {
  enrollment: 'bg-green-500',
  new_lecture: 'bg-blue-500',
  comment: 'bg-purple-500',
  reply: 'bg-indigo-500',
  announcement: 'bg-orange-500',
  payment: 'bg-emerald-500',
  system: 'bg-slate-500',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markRead('all');
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const markOneRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-600 transition-colors">
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ width: 18, height: 18, fontSize: 10 }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 card shadow-xl z-50 overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-600">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} className="btn-ghost text-xs py-1 px-2 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id}
                  className={`flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-dark-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                  onClick={() => markOneRead(n._id)}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type] || 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
