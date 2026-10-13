import { useEffect, useState } from 'react';
import { Users, RefreshCw, Info } from 'lucide-react';
import { driversApi } from '../services/api';
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '../components/Shared';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await driversApi.getAll();
      setDrivers(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleAvailability = async (driver) => {
    const next = driver.availability === 'Available' ? 'Offline' : 'Available';
    setToggling(driver._id); setSuccessMsg(''); setError('');
    try {
      await driversApi.updateAvailability(driver._id, next);
      setSuccessMsg(`${driver.name} is now ${next}`);
      load();
    } catch (e) { setError(e.message); }
    finally { setToggling(''); }
  };

  const statusOrder = { Available: 0, 'On Trip': 1, Assigned: 2, Offline: 3 };
  const sorted = [...drivers].sort((a, b) => (statusOrder[a.availability] ?? 9) - (statusOrder[b.availability] ?? 9));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div />
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Matching Algorithm Explanation */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title"><Info size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Driver Matching Algorithm</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
          {[
            { step: '1', title: 'Filter Available', desc: 'Only drivers with status "Available" are considered.' },
            { step: '2', title: 'Vehicle Match', desc: 'Prefer drivers whose vehicle type matches the requested ride type.' },
            { step: '3', title: 'Rating Sort', desc: 'Among matched drivers, the highest-rated driver is selected.' },
            { step: '4', title: 'Atomic Assign', desc: 'Driver is updated atomically (findOneAndUpdate) to prevent double-booking.' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{step}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drivers Grid */}
      {loading ? (
        <LoadingSpinner text="Loading drivers..." />
      ) : drivers.length === 0 ? (
        <EmptyState icon={Users} title="No drivers found" description="Drivers are seeded on first startup." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 14 }}>
          {sorted.map((d) => {
            const isActive = ['Assigned', 'On Trip'].includes(d.availability);
            const isToggling = toggling === d._id;
            return (
              <div key={d._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div className="driver-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>{d.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                      <StatusBadge status={d.availability} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div>📞 {d.phone}</div>
                      <div>🚗 {d.vehicle?.model} · {d.vehicle?.registrationNumber}</div>
                      <div>📍 {d.location?.address}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                        <span className="rating">★ {d.rating?.toFixed(1)}</span>
                        <span style={{ color: 'var(--text-light)' }}>·</span>
                        <StatusBadge status={d.vehicle?.type} />
                        <span style={{ color: 'var(--text-light)' }}>·</span>
                        <span>{d.totalRides} rides</span>
                      </div>
                    </div>
                  </div>
                </div>

                {d.isDemo && (
                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '4px 8px', borderRadius: 6 }}>
                    Demo driver — seeded on startup
                  </div>
                )}

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {isActive ? `🔒 Cannot toggle — ${d.availability}` : 'Toggle availability'}
                  </span>
                  <button
                    className={`btn btn-sm ${d.availability === 'Available' ? 'btn-secondary' : 'btn-success'}`}
                    disabled={isActive || isToggling}
                    onClick={() => toggleAvailability(d)}
                    title={isActive ? `Driver is ${d.availability} and cannot be toggled manually` : ''}
                  >
                    {isToggling ? <span className="spinner" style={{ width: 13, height: 13 }} /> : d.availability === 'Available' ? 'Go Offline' : 'Go Online'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
