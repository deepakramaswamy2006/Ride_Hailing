const BASE_URL = '/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`).then(handleResponse),

  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),
};

// Rides
export const ridesApi = {
  getAll: (status) => api.get(`/rides${status && status !== 'All' ? `?status=${status}` : ''}`),
  getById: (id) => api.get(`/rides/${id}`),
  getStats: () => api.get('/rides/stats'),
  create: (body) => api.post('/rides', body),
  estimateFare: (body) => api.post('/rides/estimate', body),
  cancel: (id, reason) => api.post(`/rides/${id}/cancel`, { reason }),
  start: (id) => api.post(`/rides/${id}/start`, {}),
  complete: (id) => api.post(`/rides/${id}/complete`, {}),
};

// Drivers
export const driversApi = {
  getAll: () => api.get('/drivers'),
  getAvailable: () => api.get('/drivers/available'),
  updateAvailability: (id, availability) =>
    api.patch(`/drivers/${id}/availability`, { availability }),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => api.patch('/notifications/read-all', {}),
};

// Payments
export const paymentsApi = {
  getAll: () => api.get('/payments'),
  getByRide: (rideId) => api.get(`/payments/ride/${rideId}`),
  process: (rideId, method) => api.post('/payments', { rideId, method }),
};
