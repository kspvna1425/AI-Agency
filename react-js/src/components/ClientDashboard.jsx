import React, { useState } from 'react';
import { ArrowLeft, LogOut, PlusCircle } from 'lucide-react';

export default function ClientDashboard({
  user,
  requests,
  loading = false,
  loadError = '',
  onSaveRequest,
  onBackToSite,
  onLogout,
}) {
  const [service, setService] = useState('Web Development');
  const [budget, setBudget] = useState('$3,000 – $7,500');
  const [brief, setBrief] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [savedId, setSavedId] = useState('');

  // The backend already returns only this client's requests (JWT protected).
  const myRequests = requests;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSavedId('');
    setSubmitting(true);
    const res = await onSaveRequest({
      name: user.fullName,
      email,
      service,
      budget,
      brief,
    });
    setSubmitting(false);
    if (!res.ok) return setFormError(res.message);
    setBrief('');
    setSavedId(res.request.id);
  };

  return (
    <section className="py-12 bg-slate-50 min-h-[calc(100vh-130px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Client Workspace
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome, {user.fullName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              User ID: <code className="px-1.5 py-0.5 bg-slate-200/70 rounded">{user.userId}</code>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold hover:bg-slate-50"
            >
              <ArrowLeft size={15} /> Public Site
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Your Saved Requests</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{myRequests.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">AI Agent Resolutions</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">14,820</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Hours Saved / Month</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">310 hrs</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-xs text-slate-500">Account Status</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">Active</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Your Service Requests & Progress</h3>
            <div className="space-y-4">
              {loadError && (
                <p className="text-sm font-semibold text-rose-600">{loadError}</p>
              )}
              {loading && myRequests.length === 0 && (
                <p className="text-sm text-slate-500">Loading your requests…</p>
              )}
              {!loading && !loadError && myRequests.length === 0 && (
                <p className="text-sm text-slate-500">
                  No requests yet. Submit your first project request on the right.
                </p>
              )}
              {myRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {req.service} ({req.id})
                      </div>
                      <div className="text-xs text-slate-500">
                        {req.budget} · Status: {req.status}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                      {req.progress}% Complete
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{req.brief}</p>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all"
                      style={{ width: `${req.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Submit New Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user.email && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Pillar</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI Agents">AI Agents</option>
                  <option value="Workflow Automation">Workflow Automation</option>
                  <option value="Dedicated Freelancing">Dedicated Freelancing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="$1,500 – $3,000">$1,500 – $3,000</option>
                  <option value="$3,000 – $7,500">$3,000 – $7,500</option>
                  <option value="$7,500 – $15,000">$7,500 – $15,000</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Request Details</label>
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe what you need built..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                <PlusCircle size={16} /> {submitting ? 'Saving…' : 'Save Request to JSON'}
              </button>
              {formError && <p className="text-xs font-semibold text-rose-600">{formError}</p>}
              {savedId && (
                <p className="text-xs font-semibold text-emerald-600">Request {savedId} saved!</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
