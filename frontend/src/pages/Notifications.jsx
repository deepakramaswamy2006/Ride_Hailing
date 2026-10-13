import { useEffect, useState } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { notificationsApi } from '../services/api';
import { LoadingSpinner, EmptyState, Alert, timeAgo } from '../components/Shared';

const EVENT_COLORS = {
  RIDE_REQUESTED: '#4F46E5',
  DRIVER_ASSIGNED: '#3B82F6',
  DRIVER_ACCEPTED: '#06B6D4',
  TRIP_STARTED: '#10B981',
  TRIP_COMPLETED: '#059669',
  RIDE_CANCELLED: '#EF4444',
  PAYMENT_PROCESSED: '#9333EA',
};

const EVENT_ICONS = {
  RIDE_REQUESTED: '🛺',
  DRIVER_ASSIGNED: '🚗',
  DRIVER_ACCEPTED: '✅',
  TRIP_STARTED: '▶️',
  TRIP_COMPLETED: '🏁',
  RIDE_CANCELLED: '❌',
  PAYMENT_PROCESSED: '💳',
};

export default function Notifications({ onRefresh }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
      if (onRefresh) onRefresh();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      if (onRefresh) onRefresh();
    } catch (_) {}
  };

  const markAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onRefresh) onRefresh();
    } catch (e) { setError(e.message); }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {unread > 0 ? <><span style={{ fontWeight: 600, color: 'var(--accent)' }}>{unread} unread</span> notifications</> : 'All caught up!'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAll}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="Notifications appear here as ride events occur." />
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${n.isRead ? '' : 'unread'}`}
              style={{ cursor: n.isRead ? 'default' : 'pointer' }}
              onClick={() => !n.isRead && markRead(n._id)}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${EVENT_COLORS[n.eventType]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {EVENT_ICONS[n.eventType] || '📢'}
              </div>
              <div className="notif-text">
                <div className="notif-event" style={{ color: EVENT_COLORS[n.eventType] || 'var(--accent)' }}>
                  {n.eventType?.replace(/_/g, ' ')}
                </div>
                <div className="notif-msg">{n.message}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                  {!n.isRead && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>· click to mark read</span>}
                </div>
              </div>
              <div className={`notif-dot2 ${n.isRead ? 'read' : ''}`} style={{ flexShrink: 0 }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
