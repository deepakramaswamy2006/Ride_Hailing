import { useEffect, useState } from 'react';
import { Car, RefreshCw, Play, CheckSquare, XCircle, CreditCard } from 'lucide-react';
import { ridesApi, paymentsApi } from '../services/api';
import { StatusBadge, LoadingSpinner, EmptyState, Alert, formatCurrency, formatTime, shortId } from '../components/Shared';

const STATUSES = ['All', 'Requested', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

function PaymentModal({ ride, onClose, onDone }) {
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handlePay = async () => {
    setLoading(true); setError('');
    try {
      const res = await paymentsApi.process(ride._id, method);
      setReceipt(res.data);
      if (onDone) onDone();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💳 Simulated Payment</h3>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="alert alert-warning" style={{ marginBottom: 14 }}>
            This is a simulated payment for demonstration only. No real money is charged.
          </div>
          {receipt ? (
            <div>
              <div className="alert alert-success" style={{ marginBottom: 14 }}>Payment successful!</div>
              <div className="receipt">
                <div className="receipt-row"><span>Ride ID</span><span className="ride-id">#{shortId(ride._id)}</span></div>
                <div className="receipt-row"><span>Amount</span><span>{formatCurrency(receipt.amount)}</span></div>
                <div className="receipt-row"><span>Method</span><span>{receipt.method}</span></div>
                <div className="receipt-row"><span>Transaction ID</span><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{receipt.transactionId}</span></div>
                <div className="receipt-row total"><span>Status</span><span className="receipt-badge">PAID ✓</span></div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <div className="receipt" style={{ marginBottom: 16 }}>
                <div className="receipt-row"><span>Passenger</span><span>{ride.passenger?.name}</span></div>
                <div className="receipt-row"><span>Route</span><span style={{ fontSize: 12, textAlign: 'right', maxWidth: 200 }}>{ride.pickup} → {ride.destination}</span></div>
                <div className="receipt-row total"><span>Total Fare</span><span style={{ color: 'var(--accent)' }}>{formatCurrency(ride.fare)}</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-control" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Cash</option>
                </select>
              </div>
              <Alert type="error" message={error} onClose={() => setError('')} />
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Processing...</> : <>Pay {formatCurrency(ride.fare)}</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RideDetailModal({ ride, onClose, onAction }) {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [paymentRide, setPaymentRide] = useState(null);

  const action = async (fn, label) => {
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    setLoading(label); setError('');
    try { await fn(); onAction(); }
    catch (e) { setError(e.message); }
    finally { setLoading(''); }
  };

  const canCancel = ['Requested', 'Assigned'].includes(ride.status);
  const canStart = ride.status === 'Assigned';
  const canComplete = ride.status === 'In Progress';
  const canPay = ride.status === 'Completed' && !ride.payment;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ride #{shortId(ride._id)}</h3>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <div className="receipt" style={{ marginBottom: 16 }}>
            <div className="receipt-row"><span>Status</span><StatusBadge status={ride.status} /></div>
            <div className="receipt-row"><span>Passenger</span><span>{ride.passenger?.name}</span></div>
            <div className="receipt-row"><span>Pickup</span><span>{ride.pickup}</span></div>
            <div className="receipt-row"><span>Destination</span><span>{ride.destination}</span></div>
            <div className="receipt-row"><span>Type</span><StatusBadge status={ride.rideType} /></div>
            <div className="receipt-row"><span>Distance</span><span>{ride.estimatedDistance} km</span></div>
            <div className="receipt-row"><span>Driver</span><span>{ride.driver?.name || 'Unassigned'}</span></div>
            <div className="receipt-row"><span>Vehicle</span><span>{ride.driver?.vehicle?.model || '—'}</span></div>
            <div className="receipt-row total"><span>Fare</span><span>{formatCurrency(ride.fare)}</span></div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canStart && (
              <button className="btn btn-success btn-sm" disabled={!!loading} onClick={() => action(() => ridesApi.start(ride._id), 'start trip')}>
                <Play size={13} /> {loading === 'start trip' ? 'Starting…' : 'Start Trip'}
              </button>
            )}
            {canComplete && (
              <button className="btn btn-primary btn-sm" disabled={!!loading} onClick={() => action(() => ridesApi.complete(ride._id), 'complete trip')}>
                <CheckSquare size={13} /> {loading === 'complete trip' ? 'Completing…' : 'Complete Trip'}
              </button>
            )}
            {canPay && (
              <button className="btn btn-warning btn-sm" onClick={() => setPaymentRide(ride)}>
                <CreditCard size={13} /> Pay Now
              </button>
            )}
            {canCancel && (
              <button className="btn btn-danger btn-sm" disabled={!!loading} onClick={() => action(() => ridesApi.cancel(ride._id), 'cancel ride')}>
                <XCircle size={13} /> {loading === 'cancel ride' ? 'Cancelling…' : 'Cancel Ride'}
              </button>
            )}
          </div>
        </div>
      </div>
      {paymentRide && (
        <PaymentModal
          ride={paymentRide}
          onClose={() => setPaymentRide(null)}
          onDone={() => { setPaymentRide(null); onAction(); }}
        />
      )}
    </div>
  );
}

export default function MyRides({ onRefresh }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await ridesApi.getAll(filter);
      setRides(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = () => { setSelected(null); load(); if (onRefresh) onRefresh(); };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="tabs">
          {STATUSES.map((s) => (
            <button key={s} className={`tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <LoadingSpinner text="Loading rides..." />
          ) : rides.length === 0 ? (
            <EmptyState icon={Car} title="No rides found" description={filter === 'All' ? 'Book your first ride!' : `No rides with status: ${filter}`} />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ride ID</th>
                    <th>Passenger</th>
                    <th>Pickup</th>
                    <th>Destination</th>
                    <th>Driver</th>
                    <th>Type</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Booked</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r._id}>
                      <td><span className="ride-id">#{shortId(r._id)}</span></td>
                      <td>{r.passenger?.name}</td>
                      <td style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickup}</td>
                      <td style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.destination}</td>
                      <td>{r.driver?.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      <td><StatusBadge status={r.rideType} /></td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(r.fare)}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-muted)' }}>{formatTime(r.createdAt)}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelected(r)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <RideDetailModal
          ride={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
