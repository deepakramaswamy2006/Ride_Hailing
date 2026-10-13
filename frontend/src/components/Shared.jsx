export function StatusBadge({ status }) {
  const map = {
    Requested: 'badge-requested',
    Assigned: 'badge-assigned',
    'In Progress': 'badge-inprogress',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
    Available: 'badge-available',
    Offline: 'badge-offline',
    'On Trip': 'badge-ontrip',
    Economy: 'badge-economy',
    Premium: 'badge-premium',
    XL: 'badge-xl',
  };
  return <span className={`badge ${map[status] || 'badge-offline'}`}>{status}</span>;
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-center">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={40} strokeWidth={1.2} color="#9CA3AF" />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: 14 }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .6, padding: 0 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function shortId(id) {
  return id ? String(id).slice(-6).toUpperCase() : '—';
}
