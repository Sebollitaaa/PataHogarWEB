import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationsApi } from '../api/notifications';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    const [{ count }, { notifications }] = await Promise.all([
      notificationsApi.unreadCount(),
      notificationsApi.list(1),
    ]);
    setUnreadCount(count);
    setRecent(notifications.slice(0, 6));
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else {
      setUnreadCount(0);
      setRecent([]);
    }
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setUnreadCount((c) => c + 1);
      setRecent((list) => [notification, ...list].slice(0, 6));
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  const markRead = useCallback(async (id) => {
    await notificationsApi.markRead(id);
    setRecent((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setRecent((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationsContext.Provider value={{ unreadCount, recent, refresh, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications debe usarse dentro de <NotificationsProvider>');
  return ctx;
}
