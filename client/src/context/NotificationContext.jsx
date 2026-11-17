import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../api/notifications.api.js';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';
import toast from 'react-hot-toast';
import { FiBell } from 'react-icons/fi';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user }  = useAuth();
  const { on }    = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  /* ── Load notifications from server ── */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await notificationsAPI.list({ limit: 20 });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.notifications.filter((n) => !n.read).length);
    } catch (_) { /* silent */ }
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* ── Real-time new notifications via Socket.IO ── */
  useEffect(() => {
    const cleanup = on('notification:new', (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
      toast(notif.message, {
        icon: '🔔',
        duration: 5000,
        style: { maxWidth: '340px' },
      });
    });
    return cleanup;
  }, [on]);

  const markRead = useCallback(async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id) => {
    await notificationsAPI.delete(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export default NotificationContext;
