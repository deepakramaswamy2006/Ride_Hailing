import { useState } from 'react';
import { MapPin, Navigation, Car, Zap, CheckCircle } from 'lucide-react';
import { ridesApi } from '../services/api';
import { Alert, StatusBadge, formatCurrency, shortId } from '../components/Shared';

const RIDE_TYPES = ['Economy', 'Premium', 'XL'];
const FARE_RATES = { Economy: { base: 40, perKm: 12 }, Premium: { base: 70, perKm: 20 }, XL: { base: 60, perKm: 16 } };

export default function BookRide({ onRefresh }) {
  const [form, setForm] = useState({ passengerName: '', pickup: '', destination: '', rideType: 'Economy', estimatedDistance: '' });
  const [farePreview, setFarePreview] = useState(null);
  const [bookedRide, setBookedRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setFarePreview(null); setBookedRide(null); };

  const validate = () => {
    if (!form.passengerName.trim()) return 'Passenger name is required';
    if (!form.pickup.trim()) return 'Pickup location is required';
    if (!form.destination.trim()) return 'Destination is required';
    if (!form.estimatedDistance || Number(form.estimatedDistance) <= 0) return 'Enter a valid distance (km)';
    return null;
  };

  const handleEstimate = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setEstimating(true);
    try {
      const res = await ridesApi.estimateFare({ rideType: form.rideType, estimatedDistance: Number(form.estimatedDistance) });
      setFarePreview(res);
    } catch (e) { setError(e.message); }
    finally { setEstimating(false); }
  };

  const handleBook = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await ridesApi.create({ ...form, estimatedDistance: Number(form.estimatedDistance) });
      setBookedRide(res.data);
      setSuccess('Ride booked successfully!');
      setForm({ passengerName: '', pickup: '', destination: '', rideType: 'Economy', estimatedDistance: '' });
      setFarePreview(null);
      if (onRefresh) onRefresh();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const rate = FARE_RATES[form.rideType];
  const quickFare = form.estimatedDistance ? Math.round(rate.base + rate.perKm * Number(form.estimatedDistance)) : null;

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="section-grid" style={{ gridTemplateColumns: '1fr 380px', alignItems: 'start' }}>
        {/* Booking Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ride Details</span>
            <MapPin size={18} color="var(--accent)" />
          </div>
          <div className="card-body">
            <Alert type="error" message={error} onClose={() => setError('')} />
            <Alert type="success" message={success} onClose={() => setSuccess('')} />

            <div className="form-group">
              <label className="form-label">Passenger Name</label>
              <input className="form-control" placeholder="Enter passenger name" value={form.passengerName} onChange={(e) => set('passengerName', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input className="form-control" placeholder="e.g., Koramangala, Bangalore" value={form.pickup} onChange={(e) => set('pickup', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <input className="form-control" placeholder="e.g., MG Road, Bangalore" value={form.destination} onChange={(e) => set('destination', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ride Type</label>
                <select className="form-control" value={form.rideType} onChange={(e) => set('rideType', e.target.value)}>
                  {RIDE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <div className="form-hint">Base ₹{rate.base} + ₹{rate.perKm}/km</div>
              </div>
              <div className="form-group">
                <label className="form-label">Distance (km)</label>
                <input className="form-control" type="number" min="0.1" step="0.1" placeholder="e.g., 8.5" value={form.estimatedDistance} onChange={(e) => set('estimatedDistance', e.target.value)} />
                {quickFare && <div className="form-hint">~{formatCurrency(quickFare)} estimated</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={handleEstimate} disabled={estimating} style={{ flex: 1 }}>
                {estimating ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Estimating...</> : <><Zap size={15} /> Estimate Fare</>}
              </button>
              <button className="btn btn-primary" onClick={handleBook} disabled={loading} style={{ flex: 1 }}>
                {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Booking...</> : <><Navigation size={15} /> Request Ride</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fare Estimate */}
          {farePreview && (
            <div className="fare-preview">
              <div className="fare-label">Estimated Fare</div>
              <div className="fare-amount">{formatCurrency(farePreview.fare)}</div>
              <div className="fare-details">
                <div className="fare-detail"><strong>{form.estimatedDistance} km</strong>Distance</div>
                <div className="fare-detail"><strong>{form.rideType}</strong>Ride type</div>
                <div className="fare-detail"><strong>{farePreview.availableDrivers}</strong>Drivers available</div>
              </div>
            </div>
          )}

          {/* Booked Ride Confirmation */}
          {bookedRide && (
            <div className="card">
              <div className="card-header">
                <span className="card-title" style={{ color: 'var(--success)' }}>
                  <CheckCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Ride Confirmed
                </span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ride ID</span>
                    <span className="ride-id">#{shortId(bookedRide._id)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Status</span>
                    <StatusBadge status={bookedRide.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Driver</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{bookedRide.driver?.name || 'Searching...'}</span>
                  </div>
                  {bookedRide.driver && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Vehicle</span>
                      <span style={{ fontSize: 13 }}>{bookedRide.driver.vehicle?.model}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Fare</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(bookedRide.fare)}</span>
                  </div>
                </div>

                {bookedRide.status === 'Requested' && (
                  <div className="alert alert-warning" style={{ marginTop: 12 }}>
                    No drivers available right now. Your ride is in queue.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fare Info Card */}
          {!farePreview && !bookedRide && (
            <div className="card">
              <div className="card-header"><span className="card-title">Fare Rates</span></div>
              <div className="card-body">
                {Object.entries(FARE_RATES).map(([type, r]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <StatusBadge status={type} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      ₹{r.base} + ₹{r.perKm}/km
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
