/**
 * API client for backend-otp (server.js). Backend is NOT modified; every call below
 * matches an existing endpoint exactly.
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

async function call(path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return {
      ok: false,
      status: 0,
      data: {},
      error: `Backend server unreachable at ${API_URL}. Start backend-otp (npm start) and try again.`,
    };
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  return {
    ok: res.ok,
    status: res.status,
    data,
    error: res.ok ? '' : data.error || `Request failed (${res.status}).`,
  };
}

const clean = (email) => String(email || '').trim().toLowerCase();

// ---- Client auth (OTP) ----
export const signup = ({ fullName, email, password }) =>
  call('/api/auth/signup', { method: 'POST', body: { fullName: fullName.trim(), email: clean(email), password } });

export const verifySignupOtp = ({ email, otp }) =>
  call('/api/auth/verify-signup-otp', { method: 'POST', body: { email: clean(email), otp: String(otp).trim() } });

export const login = ({ email, password }) =>
  call('/api/auth/login', { method: 'POST', body: { email: clean(email), password } });

export const forgotPassword = ({ email }) =>
  call('/api/auth/forgot-password', { method: 'POST', body: { email: clean(email) } });

export const resetPassword = ({ email, otp, newPassword }) =>
  call('/api/auth/reset-password', {
    method: 'POST',
    body: { email: clean(email), otp: String(otp).trim(), newPassword },
  });

// ---- Requests ----
export const createRequest = (payload) =>
  call('/api/requests', { method: 'POST', body: { ...payload, email: clean(payload.email) } });

export const getMyRequests = (token) => call('/api/my-requests', { token });

// ---- Admin ----
export const adminLogin = ({ email, password }) =>
  call('/api/admin/login', { method: 'POST', body: { email: clean(email), password } });

export const getAdminData = (token) => call('/api/admin/data', { token });

export const updateRequestProgress = (token, id, progress) =>
  call(`/api/admin/requests/${encodeURIComponent(id)}`, { method: 'PATCH', token, body: { progress } });
