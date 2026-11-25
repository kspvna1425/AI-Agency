/**
 * SECRET ADMIN ROUTE COMPONENT (#admin)
 * Access by appending #admin to your URL (e.g., http://localhost:5173/#admin)
 * Credentials are verified by the backend (/api/admin/login) — nothing is hardcoded here.
 */
import React, { useState, useEffect } from 'react';
import { Download, LogOut, ShieldCheck, RefreshCw } from 'lucide-react';

const short = (hash) => (hash ? `${String(hash).slice(0, 10)}…` : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');

function ProgressSlider({ request, onCommit }) {
  const [value, setValue] = useState(request.progress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(request.progress);
  }, [request.progress]);

  // Save once when the admin releases the slider (not on every tick).
  const commit = async () => {
    if (value === request.progress) return;
    setSaving(true);
    setError('');
    const res = await onCommit(request.id, value);
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      setValue(request.progress);
    }
  };

  return (
    <div>
      <div className="text-xs font-semibold mb-1">
        {request.status} ({value}%){saving && <span className="text-slate-400"> · saving…</span>}
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        className="accent-blue-600"
      />
      {error && <div className="text-xs text-rose-600 mt-1">{error}</div>}
    </div>
  );
}

export default function AdminRoute({
  isAuthenticated,
  onAdminLogin,
  onAdminLogout,
  users,
  requests,
  loading = false,
  loadError = '',
  onRefresh,
  onUpdateProgress,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await onAdminLogin({ email, password });
    setSubmitting(false);
    if (!res.ok) setError(res.message);
    else setPassword('');
  };

  const downloadJson = (filename, payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <section className="py-16 bg-slate-50 min-h-[calc(100vh-130px)] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            <ShieldCheck size={15} /> Restricted Admin Access
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Admin Portal Sign In</h2>
          <p className="text-xs text-slate-500 mb-6">
            Authorized administrators only. Sign in to inspect users and requests stored on the
            server.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                required
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign In to Admin Panel'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-slate-50 min-h-[calc(100vh-130px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Admin Command Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              JSON Data Store & Operations
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => downloadJson('users.json', users)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold hover:bg-slate-50"
            >
              <Download size={14} /> Download users.json
            </button>
            <button
              onClick={() => downloadJson('requests.json', requests)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100"
            >
              <Download size={14} /> Download requests.json
            </button>
            <button
              onClick={onAdminLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold hover:bg-slate-50"
            >
              <LogOut size={14} /> Admin Logout
            </button>
          </div>
        </div>

        {loadError && (
          <p className="mb-4 text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
            {loadError}
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Saved Users (users.json)</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Saved Requests (requests.json)</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{requests.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Monthly Recurring Revenue</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">$48,500</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Freelance Utilization</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">92%</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Registered Users Log (users.json)</h3>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              Live Server Sync
            </span>
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs">
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Email (hashed)</th>
                  <th className="py-3 px-3">Verified</th>
                  <th className="py-3 px-3">Password</th>
                  <th className="py-3 px-3">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.emailHash || u.userId} className="border-b border-slate-100">
                    <td className="py-3 px-3 font-mono text-xs">{u.userId}</td>
                    <td className="py-3 px-3 font-semibold">{u.fullName}</td>
                    <td className="py-3 px-3 font-mono text-xs" title={u.emailHash}>
                      {short(u.emailHash)}
                    </td>
                    <td className="py-3 px-3 text-xs">{u.emailVerified ? 'Yes' : 'No'}</td>
                    <td className="py-3 px-3 text-xs text-slate-500">
                      {u.passwordHashed ? 'bcrypt hashed' : '—'}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500">{fmtDate(u.lastLogin)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 px-3 text-xs text-slate-500">
                      {loading ? 'Loading…' : 'No users yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <details>
            <summary className="cursor-pointer text-xs font-semibold text-blue-600">
              Inspect Raw users.json
            </summary>
            <pre className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs overflow-x-auto max-h-60">
              {JSON.stringify(users, null, 2)}
            </pre>
          </details>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Client Service Requests Log (requests.json)
            </h3>
            <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-semibold">
              Live Server Sync
            </span>
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs">
                  <th className="py-3 px-3">Request ID</th>
                  <th className="py-3 px-3">Client / User ID</th>
                  <th className="py-3 px-3">Service & Budget</th>
                  <th className="py-3 px-3">Brief</th>
                  <th className="py-3 px-3">Status & Progress</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr key={`${r.id}-${r.createdAt}-${i}`} className="border-b border-slate-100">
                    <td className="py-3 px-3 font-mono text-xs">{r.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-slate-500" title={r.emailHash}>
                        {r.userId} · {short(r.emailHash)}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-xs font-semibold">
                        {r.service}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">{r.budget}</div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 max-w-xs">{r.brief}</td>
                    <td className="py-3 px-3">
                      <ProgressSlider request={r} onCommit={onUpdateProgress} />
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 px-3 text-xs text-slate-500">
                      {loading ? 'Loading…' : 'No requests yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <details>
            <summary className="cursor-pointer text-xs font-semibold text-blue-600">
              Inspect Raw requests.json
            </summary>
            <pre className="mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs overflow-x-auto max-h-60">
              {JSON.stringify(requests, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </section>
  );
}
