import { useEffect, useState } from 'react';
import { Car, Activity, Users, DollarSign, RefreshCw } from 'lucide-react';
import { ridesApi, driversApi, notificationsApi } from '../services/api';
import { StatusBadge, LoadingSpinner, EmptyState, formatCurrency, formatTime, shortId, timeAgo } from '../components/Shared';

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard({ onRefresh }) {
  const [stats, setStats] = useState(null);
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [sRes, rRes, dRes, nRes] = await Promise.all([
        ridesApi.getStats(),
        ridesApi.getAll(),
        driversApi.getAll(),
        notificationsApi.getAll(),
      ]);
      setStats(sRes.data);
      setRides(rRes.data.slice(0, 8));
      setDrivers(dRes.data.filter((d) => d.availability === 'Available').slice(0, 5));
      setNotifications(nRes.data.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Live system overview from MongoDB Atlas
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon={Car} label="Total Rides" value={stats?.totalRides ?? 0} colorClass="blue" />
        <StatCard icon={Activity} label="Active Rides" value={stats?.activeRides ?? 0} colorClass="green" />
        <StatCard icon={Users} label="Available Drivers" value={stats?.availableDrivers ?? 0} colorClass="amber" />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue)} colorClass="purple" />
      </div>

      {/* Recent Rides + Notifications */}
      <div className="section-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Rides</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              {rides.length === 0 ? (
                <EmptyState icon={Car} title="No rides yet" description="Book your first ride!" />
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Passenger</th>
                      <th>Pickup</th>
                      <th>Driver</th>
                      <th>Fare</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((r) => (
                      <tr key={r._id}>
                        <td><span className="ride-id">#{shortId(r._id)}</span></td>
                        <td>{r.passenger?.name}</td>
                        <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickup}</td>
                        <td>{r.driver?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                        <td>{formatCurrency(r.fare)}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Available Drivers */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header" style={{ paddingBottom: 12 }}>
              <span className="card-title">Available Drivers</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{drivers.length} online</span>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              {drivers.length === 0 ? (
                <EmptyState icon={Users} title="No drivers available" />
              ) : (
                drivers.map((d) => (
                  <div key={d._id} className="driver-card" style={{ marginBottom: 8, padding: '10px 14px' }}>
                    <div className="driver-avatar">{d.name[0]}</div>
                    <div className="driver-info">
                      <div className="driver-name">{d.name}</div>
                      <div className="driver-meta">{d.vehicle?.model} · {d.location?.address}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="rating">★ {d.rating?.toFixed(1)}</span>
                      <StatusBadge status={d.availability} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Notifications</span>
            </div>
            <div>
              {notifications.length === 0 ? (
                <EmptyState icon={Activity} title="No notifications" />
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                    <div className={`notif-dot2 ${n.isRead ? 'read' : ''}`} />
                    <div className="notif-text">
                      <div className="notif-event">{n.eventType?.replace(/_/g, ' ')}</div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
