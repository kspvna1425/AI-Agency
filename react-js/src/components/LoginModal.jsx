import React, { useState } from 'react';
import { X, MailCheck, KeyRound } from 'lucide-react';

const INPUT =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600';
const BTN =
  'w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60';

const TITLES = {
  login: 'Client Login',
  signup: 'Create Client Account',
  verify: 'Verify Email OTP',
  forgot: 'Forgot Password',
  reset: 'Reset Password with OTP',
};

export default function LoginModal({ initialMode = 'login', onClose, auth }) {
  const [mode, setMode] = useState(initialMode); // login | signup | verify | forgot | reset
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setMessage('');
    setDevOtp('');
  };

  const run = (fn) => async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const submitLogin = run(async () => {
    const res = await auth.login({ email, password });
    if (res.ok) return; // App closes the modal and opens the workspace
    if (res.requiresOtp) {
      setMode('verify');
      setMessage(res.message);
      setDevOtp(res.devOtp || '');
      setOtp('');
      return;
    }
    setError(res.message);
  });

  const submitSignup = run(async () => {
    const res = await auth.signup({ fullName, email, password });
    if (!res.ok) return setError(res.message);
    setMode('verify');
    setMessage(res.message);
    setDevOtp(res.devOtp || '');
    setOtp('');
  });

  const submitVerify = run(async () => {
    const res = await auth.verifySignup({ email, otp });
    if (!res.ok) setError(res.message);
  });

  const submitForgot = run(async () => {
    const res = await auth.forgot({ email });
    if (!res.ok) return setError(res.message);
    setMode('reset');
    setMessage(res.message);
    setDevOtp(res.devOtp || '');
    setOtp('');
  });

  const submitReset = run(async () => {
    const res = await auth.reset({ email, otp, newPassword });
    if (!res.ok) return setError(res.message);
    setMode('login');
    setPassword('');
    setOtp('');
    setNewPassword('');
    setDevOtp('');
    setMessage(res.message);
  });

  const otpInput = (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      required
      maxLength={6}
      pattern="[0-9]{6}"
      placeholder="6-Digit OTP"
      value={otp}
      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
      className={`${INPUT} text-center tracking-widest font-bold text-base`}
    />
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{TITLES[mode]}</h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {(mode === 'login' || mode === 'signup') && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 text-xs font-semibold rounded-lg transition ${
                mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {message && (
          <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl mb-3">
            {message}
          </p>
        )}
        {devOtp && (
          <p className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 p-2.5 rounded-xl mb-3">
            Dev Mode OTP Preview: <strong>{devOtp}</strong>
          </p>
        )}
        {error && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl mb-3">
            {error}
          </p>
        )}

        {mode === 'login' && (
          <form onSubmit={submitLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button type="submit" disabled={loading} className={BTN}>
              {loading ? 'Signing in…' : 'Sign In to Workspace'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={submitSignup} className="space-y-4">
            <p className="text-xs text-slate-500">
              A 6-digit OTP will be sent to your email to verify your account. Your password is stored
              securely (hashed) on the server.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder="e.g. Vikash Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password * (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT}
              />
            </div>
            <button type="submit" disabled={loading} className={BTN}>
              {loading ? 'Sending OTP…' : 'Create Account & Send Email OTP'}
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form onSubmit={submitVerify} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <MailCheck size={16} className="text-blue-600 shrink-0" />
              <span>Enter the 6-digit OTP sent to {email}</span>
            </div>
            {otpInput}
            <button type="submit" disabled={loading} className={BTN}>
              {loading ? 'Verifying…' : 'Verify OTP & Activate Account'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-xs text-slate-500 hover:text-slate-800"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={submitForgot} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <KeyRound size={16} className="text-blue-600 shrink-0" />
              <span>Enter your registered email to receive a 6-digit reset OTP.</span>
            </div>
            <input
              type="email"
              required
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
            <button type="submit" disabled={loading} className={BTN}>
              {loading ? 'Sending…' : 'Send Password Reset OTP'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-xs text-slate-500 hover:text-slate-800"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={submitReset} className="space-y-4">
            {otpInput}
            <input
              type="password"
              required
              minLength={6}
              placeholder="New Password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT}
            />
            <button type="submit" disabled={loading} className={BTN}>
              {loading ? 'Updating…' : 'Verify OTP & Update Password'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-xs text-slate-500 hover:text-slate-800"
            >
              ← Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
