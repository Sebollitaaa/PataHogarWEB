import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../api/notifications';
import { useNotifications } from '../context/NotificationsContext';
import { notificationText, notificationLink } from '../utils/notificationText';
import { timeAgo } from '../utils/format';
import './listing-pages.css';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { refresh } = useNotifications();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    notificationsApi.list(page).then(setData);
  }, [page]);

  async function handleClick(n) {
    if (!n.isRead) {
      await notificationsApi.markRead(n.id);
      setData((d) => ({ ...d, notifications: d.notifications.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) }));
      refresh();
    }
    navigate(notificationLink(n));
  }

  async function handleMarkAllRead() {
    await notificationsApi.markAllRead();
    setData((d) => ({ ...d, notifications: d.notifications.map((x) => ({ ...x, isRead: true })) }));
    refresh();
  }

  return (
    <div className="container listing-page" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Notificaciones</h1>
        {data?.notifications.some((n) => !n.isRead) && (
          <button className="link-btn" onClick={handleMarkAllRead}>Marcar todas como leídas</button>
        )}
      </div>

      {!data ? null : data.notifications.length === 0 ? (
        <div className="listing-empty"><p>No tenés notificaciones.</p></div>
      ) : (
        <>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {data.notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className="card"
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 10,
                    background: n.isRead ? 'var(--color-surface)' : 'var(--color-primary-light)',
                    display: 'flex', justifyContent: 'space-between', gap: 12, cursor: 'pointer',
                  }}
                >
                  <span>{notificationText(n)}</span>
                  <time style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</time>
                </button>
              </li>
            ))}
          </ul>

          {data.pagination.totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Página {page} de {data.pagination.totalPages}
              </span>
              <button className="btn btn-outline btn-sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
