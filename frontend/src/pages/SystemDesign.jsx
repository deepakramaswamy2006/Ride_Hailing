export default function SystemDesign() {
  return (
    <div className="sd-container">

      {/* ===== TABS ===== */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {['Low-Level Design', 'High-Level Design'].map((t, i) => (
          <a key={t} href={`#${i === 0 ? 'lld' : 'hld'}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>{t}</a>
        ))}
      </div>

      {/* ============================= LLD ============================= */}
      <div id="lld" className="sd-section">
        <h2>Low-Level Design (LLD)</h2>

        {/* Class Diagram */}
        <h3>UML Class Diagram</h3>
        <div className="sd-grid" style={{ marginBottom: 24 }}>
          {[
            { name: 'Passenger', attrs: ['passengerId: String', 'name: String', 'phone: String'], methods: ['requestRide()', 'cancelRide()'] },
            { name: 'Driver', attrs: ['driverId: String', 'name: String', 'availability: Enum', 'rating: Number'], methods: ['updateLocation()', 'acceptRide()'] },
            { name: 'Vehicle', attrs: ['vehicleId: String', 'model: String', 'registrationNumber: String', 'type: Enum'] , methods: [] },
            { name: 'Ride Request', attrs: ['requestId: String', 'pickupLocation: String', 'dropLocation: String', 'status: Enum', 'fare: Number'], methods: ['validate()', 'cancel()'] },
            { name: 'Driver Assignment', attrs: ['assignmentId: String', 'assignedTime: Date', 'driverId: Ref', 'rideId: Ref'], methods: ['assignDriver()', 'reassignDriver()'] },
            { name: 'Trip', attrs: ['tripId: String', 'startTime: Date', 'endTime: Date', 'status: Enum'], methods: ['startTrip()', 'completeTrip()'] },
            { name: 'Payment', attrs: ['paymentId: String', 'amount: Number', 'method: Enum', 'status: Enum', 'transactionId: String'], methods: ['processPayment()'] },
            { name: 'Location', attrs: ['latitude: Number', 'longitude: Number', 'address: String'], methods: [] },
          ].map(({ name, attrs, methods }) => (
            <div key={name} className="class-card">
              <div className="class-card-header">«class» {name}</div>
              {attrs.map((a) => <div key={a} className="class-attr" style={{ padding: '4px 0', borderTop: '1px solid var(--border)', fontSize: 12 }}>— {a}</div>)}
              {methods.length > 0 && <div style={{ borderTop: '2px solid var(--border)', marginTop: 6, paddingTop: 4 }} />}
              {methods.map((m) => <div key={m} className="class-method" style={{ padding: '3px 0', fontSize: 12 }}>+ {m}</div>)}
            </div>
          ))}
        </div>

        {/* Relationships */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">Class Relationships</span></div>
          <div className="card-body">
            {[
              ['Passenger', '1 → *', 'Ride Request', 'A passenger can make many ride requests'],
              ['Driver', '1 → 1', 'Vehicle', 'A driver owns one vehicle'],
              ['Driver Assignment', '1 → 1', 'Driver', 'Each assignment maps to one driver'],
              ['Driver Assignment', '1 → 1', 'Ride Request', 'Each assignment maps to one ride'],
              ['Ride Request', '1 → 1', 'Trip', 'A confirmed ride becomes one trip'],
              ['Trip', '1 → 1', 'Payment', 'A completed trip triggers one payment'],
              ['Driver', '* → 1', 'Location', 'Driver has a current location'],
            ].map(([from, rel, to, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
                <span style={{ fontWeight: 600, minWidth: 130, color: 'var(--accent)' }}>{from}</span>
                <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontFamily: 'monospace', fontSize: 11 }}>{rel}</span>
                <span style={{ fontWeight: 600, minWidth: 130 }}>{to}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* State Diagram */}
        <h3>Ride Lifecycle State Diagram</h3>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
              <div className="state-flow">
                <div className="state-box" style={{ background: '#FEF9C3', color: '#854D0E' }}>REQUESTED</div>
                <span className="state-arrow">→</span>
                <div className="state-box" style={{ background: '#DBEAFE', color: '#1E40AF' }}>ASSIGNED</div>
                <span className="state-arrow">→</span>
                <div className="state-box" style={{ background: '#D1FAE5', color: '#065F46' }}>IN PROGRESS</div>
                <span className="state-arrow">→</span>
                <div className="state-box" style={{ background: '#F0FDF4', color: '#15803D' }}>COMPLETED</div>
              </div>
              <div className="state-flow" style={{ marginLeft: 0 }}>
                <div className="state-box" style={{ background: '#FEF9C3', color: '#854D0E' }}>REQUESTED</div>
                <span className="state-arrow">→</span>
                <div className="state-box" style={{ background: '#FEE2E2', color: '#991B1B' }}>CANCELLED</div>
              </div>
              <div className="state-flow" style={{ marginLeft: 0 }}>
                <div className="state-box" style={{ background: '#DBEAFE', color: '#1E40AF' }}>ASSIGNED</div>
                <span className="state-arrow">→</span>
                <div className="state-box" style={{ background: '#FEE2E2', color: '#991B1B' }}>CANCELLED</div>
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-muted)' }}>
              <strong>Rules:</strong> Completed and In-Progress rides cannot be cancelled. State transitions are validated on the backend with meaningful error messages.
            </div>
          </div>
        </div>

        {/* Sequence Diagram */}
        <h3>Sequence Diagram — Ride Booking Flow</h3>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 0, justifyContent: 'space-around', marginBottom: 20, overflowX: 'auto' }}>
              {['Passenger', 'Ride Service', 'Matching Service', 'Driver', 'Notification Service'].map((actor) => (
                <div key={actor} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 90 }}>
                  <div style={{ padding: '6px 12px', background: 'var(--accent)', color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'center' }}>{actor}</div>
                  <div style={{ width: 2, height: 400, background: 'repeating-linear-gradient(to bottom, var(--border) 0, var(--border) 8px, transparent 8px, transparent 16px)' }} />
                </div>
              ))}
            </div>

            {[
              { from: 'Passenger', to: 'Ride Service', msg: 'POST /api/rides (booking data)', arrow: '→' },
              { from: 'Ride Service', to: 'Ride Service', msg: 'Validate input & calculate fare', arrow: '↻' },
              { from: 'Ride Service', to: 'Matching Service', msg: 'findBestDriver(rideType)', arrow: '→' },
              { from: 'Matching Service', to: 'Matching Service', msg: 'Query available drivers, sort by rating', arrow: '↻' },
              { from: 'Matching Service', to: 'Ride Service', msg: 'Return best driver', arrow: '←' },
              { from: 'Ride Service', to: 'Driver', msg: 'assignDriver() — atomic update', arrow: '→' },
              { from: 'Driver', to: 'Ride Service', msg: 'Driver status → Assigned', arrow: '←' },
              { from: 'Ride Service', to: 'Notification Service', msg: 'createNotification(DRIVER_ASSIGNED)', arrow: '→' },
              { from: 'Notification Service', to: 'Notification Service', msg: 'Save to MongoDB + publish to RabbitMQ', arrow: '↻' },
              { from: 'Ride Service', to: 'Passenger', msg: '201 Created — ride with driver details', arrow: '←' },
            ].map((s, i) => (
              <div key={i} className="seq-step">
                <div className="seq-num">{i + 1}</div>
                <div className="seq-content">
                  <strong>{s.from} {s.arrow} {s.to}</strong>
                  <p>{s.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REST API Reference */}
        <h3>REST API Reference</h3>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="api-table">
                <thead>
                  <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {[
                    ['POST', '/api/rides', 'Create a new ride & auto-assign driver'],
                    ['GET', '/api/rides', 'List all rides (filter by ?status=)'],
                    ['GET', '/api/rides/stats', 'Get dashboard statistics'],
                    ['GET', '/api/rides/:id', 'Get ride details'],
                    ['POST', '/api/rides/:id/cancel', 'Cancel a ride'],
                    ['POST', '/api/rides/:id/start', 'Start a trip (Assigned → In Progress)'],
                    ['POST', '/api/rides/:id/complete', 'Complete a trip (In Progress → Completed)'],
                    ['POST', '/api/rides/estimate', 'Estimate fare for a ride'],
                    ['GET', '/api/drivers', 'List all drivers'],
                    ['GET', '/api/drivers/available', 'List available drivers'],
                    ['PATCH', '/api/drivers/:id/availability', 'Toggle driver availability'],
                    ['GET', '/api/notifications', 'Get all notifications'],
                    ['PATCH', '/api/notifications/:id/read', 'Mark notification as read'],
                    ['PATCH', '/api/notifications/read-all', 'Mark all notifications as read'],
                    ['GET', '/api/payments', 'Get all payments'],
                    ['POST', '/api/payments', 'Process a simulated payment'],
                    ['GET', '/api/payments/ride/:rideId', 'Get payment for a specific ride'],
                  ].map(([method, path, desc]) => (
                    <tr key={path + method}>
                      <td><span className={`method method-${method.toLowerCase()}`}>{method}</span></td>
                      <td><code style={{ fontSize: 12.5 }}>{path}</code></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= HLD ============================= */}
      <div id="hld" className="sd-section">
        <h2>High-Level Design (HLD)</h2>

        {/* Architecture Diagram */}
        <h3>System Architecture</h3>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="hld-box blue" style={{ minWidth: 140 }}>📱 Passenger App</div>
                <div className="hld-box blue" style={{ minWidth: 140 }}>🚗 Driver App</div>
              </div>
              <div className="hld-arrow">↓</div>
              <div className="hld-box accent" style={{ width: 300 }}>🌐 API Gateway / Express.js</div>
              <div className="hld-arrow">↓</div>
              <div className="hld-box green" style={{ width: 300 }}>⚙️ Ride Service (Node.js)</div>
              <div className="hld-arrow">↓</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="hld-box amber" style={{ minWidth: 130, fontSize: 12 }}>🔍 Matching Service</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 130 }}>Find best available driver</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="hld-box amber" style={{ minWidth: 130, fontSize: 12 }}>💰 Pricing Service</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 130 }}>Calculate fare by type & km</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div className="hld-box amber" style={{ minWidth: 130, fontSize: 12 }}>💳 Payment Service</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 130 }}>Simulated payment processing</div>
                </div>
              </div>
              <div className="hld-arrow">↓</div>
              <div className="hld-box purple" style={{ width: 300 }}>📨 RabbitMQ Exchange (fanout)</div>
              <div className="hld-arrow">↓</div>
              <div className="hld-box green" style={{ width: 300 }}>🔔 Notification Service</div>
              <div className="hld-arrow">↓</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <div className="hld-box" style={{ fontSize: 12 }}>🍃 MongoDB Atlas</div>
                <div className="hld-box gray" style={{ fontSize: 12 }}>⚡ Redis (caching concept)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Decisions */}
        <h3>Architecture Decisions & Explanations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            {
              title: '🍃 Why MongoDB Atlas?',
              impl: true,
              body: 'MongoDB\'s flexible schema suits ride data with varying fields (driver, payment, location). Atlas provides managed hosting, automatic failover via replica sets, and built-in geospatial index support for location queries.',
            },
            {
              title: '📍 Geospatial Indexes',
              impl: false,
              body: 'MongoDB 2dsphere indexes allow efficient queries like "find drivers within 5km". In production, driver locations are indexed and queried using $nearSphere. This demo uses rating-based matching as a proxy.',
            },
            {
              title: '⚡ Caching (Concept)',
              impl: false,
              body: 'Redis would cache frequent queries like available drivers and fare rates. TTL of 30–60s keeps data fresh. This avoids hitting MongoDB on every booking request. Not implemented in this demo.',
            },
            {
              title: '📨 RabbitMQ Pub/Sub',
              impl: true,
              body: 'A fanout exchange broadcasts ride events to all subscribers independently. Multiple consumers (SMS, email, push) can receive the same event without coupling. The app continues working if RabbitMQ is down.',
            },
            {
              title: '🔒 Preventing Double-Booking',
              impl: true,
              body: 'Driver assignment uses MongoDB\'s findOneAndUpdate with a condition: { availability: "Available" }. If two requests race, only one wins the atomic update. The other falls through and finds no driver.',
            },
            {
              title: '📈 Horizontal Scaling',
              impl: false,
              body: 'Multiple Node.js instances behind a load balancer (e.g., Nginx or AWS ALB) share the same MongoDB Atlas cluster. Stateless Express design enables this. Session data would use Redis in production.',
            },
            {
              title: '🔁 Retries & Resilience',
              impl: false,
              body: 'Failed RabbitMQ publishes are logged but don\'t break the flow. In production, a dead-letter queue captures failed messages. MongoDB operations use retryable writes for transient network failures.',
            },
            {
              title: '⚖️ Load Balancing',
              impl: false,
              body: 'A reverse proxy distributes traffic across backend instances using round-robin or least-connections. Health checks remove unhealthy instances. PM2 cluster mode provides multi-core utilization on a single server.',
            },
          ].map(({ title, body, impl }) => (
            <div key={title} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span>{title}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: impl ? '#D1FAE5' : '#F3F4F6', color: impl ? '#065F46' : 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 6 }}>
                  {impl ? '✓ Implemented' : 'Concept only'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Data Layer */}
        <h3>Data Layer — MongoDB Collections</h3>
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="api-table">
                <thead>
                  <tr><th>Collection</th><th>Key Fields</th><th>Purpose</th></tr>
                </thead>
                <tbody>
                  {[
                    ['rides', 'passenger, pickup, destination, driver (ref), status, fare', 'Core ride records with full lifecycle'],
                    ['drivers', 'name, phone, vehicle, rating, location, availability', 'Driver profiles and real-time status'],
                    ['payments', 'ride (ref), amount, method, status, transactionId', 'Simulated payment records'],
                    ['notifications', 'eventType, message, ride (ref), isRead', 'Event log for all ride actions'],
                  ].map(([col, fields, purpose]) => (
                    <tr key={col}>
                      <td><code style={{ fontWeight: 700 }}>{col}</code></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fields}</td>
                      <td style={{ fontSize: 12.5 }}>{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
