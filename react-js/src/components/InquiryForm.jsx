import React, { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function InquiryForm({ selectedService, currentUser, onSaveRequest }) {
  const [name, setName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [service, setService] = useState(selectedService || 'Web Development');
  const [budget, setBudget] = useState('$3,000 – $7,500');
  const [brief, setBrief] = useState('');
  const [savedId, setSavedId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedService) setService(selectedService);
  }, [selectedService]);

  // Pre-fill once the visitor signs in (never overwrite what they already typed).
  useEffect(() => {
    if (currentUser?.fullName) setName((n) => n || currentUser.fullName);
    if (currentUser?.email) setEmail((v) => v || currentUser.email);
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavedId('');
    setLoading(true);
    const res = await onSaveRequest({ name, email, service, budget, brief });
    setLoading(false);
    if (!res.ok) return setError(res.message);
    setBrief('');
    setSavedId(res.request.id);
  };

  return (
    <section id="inquiry" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Start a Project
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 mb-4">
            Submit Your Project Brief
          </h2>
          <p className="text-slate-600 mb-6">
            Every request submitted here is automatically recorded into{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">requests.json</code> so our engineering team can scope and track your project.
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">JSON Request Persistence</div>
              <div className="text-xs text-slate-600 mt-1">
                Captures Request ID, User ID, service pillar, budget tier, and timestamp in requests.json.
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">24-Hour Scoped Roadmap</div>
              <div className="text-xs text-slate-600 mt-1">
                Receive milestone breakdowns, architecture recommendations, and sprint pricing within one business day.
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email *</label>
              <input
                type="email"
                required
                maxLength={150}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Pillar *</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Web Development">Web Development</option>
                <option value="AI Agents">AI Agents</option>
                <option value="Workflow Automation">Workflow Automation</option>
                <option value="Dedicated Freelancing">Dedicated Freelancing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Estimated Budget *</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="$1,500 – $3,000">$1,500 – $3,000</option>
                <option value="$3,000 – $7,500">$3,000 – $7,500</option>
                <option value="$7,500 – $15,000">$7,500 – $15,000</option>
                <option value="$15,000+">$15,000+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Goals & Requirements *
            </label>
            <textarea
              rows={4}
              required
              maxLength={2000}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe your web app, AI agent use case, automation stack, or freelance sprint requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            <Send size={16} /> {loading ? 'Submitting…' : 'Submit Request'}
          </button>

          {error && (
            <p className="text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              {error}
            </p>
          )}

          {savedId && (
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <CheckCircle size={18} />
              <span>Request {savedId} saved to requests.json!</span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
