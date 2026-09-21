const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (res.status === 401) {
    // token missing/expired — force back to login rather than showing a confusing error
    localStorage.removeItem('token');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired, please log in again');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  getStudents: () => fetch(`${BASE}/students`, { headers: authHeaders() }).then(handle),

  getStudent: (id) => fetch(`${BASE}/students/${id}`, { headers: authHeaders() }).then(handle),

  createStudent: (data) =>
    fetch(`${BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),

  updateStudent: (id, data) =>
    fetch(`${BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),

  deleteStudent: (id) =>
    fetch(`${BASE}/students/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),

  markAttendance: (student_id, date, status) =>
    fetch(`${BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ student_id, date, status }),
    }).then(handle),

  getAttendanceByDate: (date) =>
    fetch(`${BASE}/attendance/date/${date}`, { headers: authHeaders() }).then(handle),

  bulkAttendance: (date, records) =>
    fetch(`${BASE}/attendance/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ date, records }),
    }).then(handle),

  addFee: (data) =>
    fetch(`${BASE}/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),

  updateFee: (id, data) =>
    fetch(`${BASE}/fees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),

  deleteFee: (id) =>
    fetch(`${BASE}/fees/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handle),

  getFeeSummary: () => fetch(`${BASE}/fees/summary/all`, { headers: authHeaders() }).then(handle),

  getRecentFees: (limit = 8) =>
    fetch(`${BASE}/fees/recent?limit=${limit}`, { headers: authHeaders() }).then(handle),
};
