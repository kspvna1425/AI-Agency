/**
 * ============================================================================
 * SECRET ADMIN URL:
 * Append #admin to your website URL (e.g., http://localhost:5173/#admin)
 * Admin credentials are verified by the backend (.env hashes) — none are stored here.
 * ============================================================================
 */
import React, { useState, useEffect, useCallback } from 'react';
import * as api from './api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import InquiryForm from './components/InquiryForm';
import LoginModal from './components/LoginModal';
import ClientDashboard from './components/ClientDashboard';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';

const KEYS = { token: 'af7_r_jwt', user: 'af7_r_user', adminToken: 'af7_r_admin_jwt' };

const store = {
  get(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value == null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
};

function readSession() {
  try {
    const token = store.get(KEYS.token);
    const raw = store.get(KEYS.user);
    const user = raw ? JSON.parse(raw) : null;
    return token && user ? { token, user } : { token: '', user: null };
  } catch {
    return { token: '', user: null };
  }
}

export default function App() {
  const [route, setRoute] = useState(() =>
    window.location.hash === '#admin' ? 'admin' : 'landing'
  );
  const [session, setSession] = useState(readSession);
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');

  const [adminToken, setAdminToken] = useState(() => store.get(KEYS.adminToken) || '');
  const [adminData, setAdminData] = useState({ users: [], requests: [] });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminLoadError, setAdminLoadError] = useState('');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [selectedService, setSelectedService] = useState('Web Development');
  const [notice, setNotice] = useState('');

  const currentUser = session.user;

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') setRoute('admin');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Client workspace needs a logged-in user.
  useEffect(() => {
    if (route === 'client' && !currentUser) setRoute('landing');
  }, [route, currentUser]);

  const navigate = (nextRoute) => {
    if (nextRoute === 'admin') {
      window.location.hash = 'admin';
      setRoute('admin');
    } else {
      window.history.replaceState(null, '', window.location.pathname);
      setRoute(nextRoute === 'client' ? 'client' : 'landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // ---------- Client session ----------
  const endSession = useCallback(() => {
    store.set(KEYS.token, null);
    store.set(KEYS.user, null);
    setSession({ token: '', user: null });
    setMyRequests([]);
  }, []);

  const startSession = (token, user, email) => {
    // Backend never returns the plain email, so keep the one the user typed for the request form.
    const fullUser = { ...user, email: String(email || '').trim().toLowerCase() };
    store.set(KEYS.token, token);
    store.set(KEYS.user, JSON.stringify(fullUser));
    setSession({ token, user: fullUser });
    setAuthModalOpen(false);
    setNotice('');
    navigate('client');
  };

  const handleLogout = () => {
    endSession();
    navigate('landing');
  };

  const loadMyRequests = useCallback(async () => {
    if (!session.token) return;
    setRequestsLoading(true);
    setRequestsError('');
    const res = await api.getMyRequests(session.token);
    setRequestsLoading(false);
    if (res.ok) {
      setMyRequests(res.data.requests || []);
    } else if (res.status === 401) {
      endSession();
      setRoute('landing');
      setNotice('Your session expired. Please sign in again.');
    } else {
      setRequestsError(res.error);
    }
  }, [session.token, endSession]);

  useEffect(() => {
    if (route === 'client' && session.token) loadMyRequests();
  }, [route, session.token, loadMyRequests]);

  // ---------- Auth actions used by LoginModal ----------
  const auth = {
    signup: async (form) => {
      const res = await api.signup(form);
      if (!res.ok) return { ok: false, message: res.error };
      return { ok: true, message: res.data.message, devOtp: res.data.devOtp || '' };
    },
    verifySignup: async ({ email, otp }) => {
      const res = await api.verifySignupOtp({ email, otp });
      if (!res.ok) return { ok: false, message: res.error };
      startSession(res.data.token, res.data.user, email);
      return { ok: true };
    },
    login: async ({ email, password }) => {
      const res = await api.login({ email, password });
      if (res.status === 403 && res.data.requiresOtp) {
        return { ok: false, requiresOtp: true, message: res.error, devOtp: res.data.devOtp || '' };
      }
      if (!res.ok) return { ok: false, message: res.error };
      startSession(res.data.token, res.data.user, email);
      return { ok: true };
    },
    forgot: async ({ email }) => {
      const res = await api.forgotPassword({ email });
      if (!res.ok) return { ok: false, message: res.error };
      return { ok: true, message: res.data.message, devOtp: res.data.devOtp || '' };
    },
    reset: async (form) => {
      const res = await api.resetPassword(form);
      if (!res.ok) return { ok: false, message: res.error };
      return { ok: true, message: res.data.message };
    },
  };

  // ---------- Requests ----------
  const handleSaveRequest = async (payload) => {
    const res = await api.createRequest({ ...payload, userId: currentUser?.userId || '' });
    if (!res.ok) return { ok: false, message: res.error };
    if (session.token) loadMyRequests();
    return { ok: true, request: res.data.request };
  };

  // ---------- Admin ----------
  const adminLogout = useCallback(() => {
    store.set(KEYS.adminToken, null);
    setAdminToken('');
    setAdminData({ users: [], requests: [] });
  }, []);

  const loadAdminData = useCallback(async () => {
    if (!adminToken) return;
    setAdminLoading(true);
    setAdminLoadError('');
    const res = await api.getAdminData(adminToken);
    setAdminLoading(false);
    if (res.ok) {
      setAdminData({ users: res.data.users || [], requests: res.data.requests || [] });
    } else if (res.status === 401 || res.status === 403) {
      adminLogout();
    } else {
      setAdminLoadError(res.error);
    }
  }, [adminToken, adminLogout]);

  useEffect(() => {
    if (route === 'admin' && adminToken) loadAdminData();
  }, [route, adminToken, loadAdminData]);

  const handleAdminLogin = async ({ email, password }) => {
    const res = await api.adminLogin({ email, password });
    if (!res.ok) return { ok: false, message: res.error };
    store.set(KEYS.adminToken, res.data.token);
    setAdminToken(res.data.token);
    return { ok: true };
  };

  const handleUpdateProgress = async (id, progress) => {
    const res = await api.updateRequestProgress(adminToken, id, progress);
    if (res.ok) {
      setAdminData((prev) => ({
        ...prev,
        requests: prev.requests.map((r) => (r.id === id ? res.data.request : r)),
      }));
      return { ok: true };
    }
    if (res.status === 401 || res.status === 403) adminLogout();
    return { ok: false, message: res.error };
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar
        user={currentUser}
        onNavigate={navigate}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      {notice && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold px-4 py-2 text-center">
          {notice}
        </div>
      )}

      <main className="flex-grow">
        {route === 'landing' && (
          <>
            <Hero onOpenSignup={() => openAuth('signup')} />
            <ServicesSection onSelectService={setSelectedService} />
            <InquiryForm
              selectedService={selectedService}
              currentUser={currentUser}
              onSaveRequest={handleSaveRequest}
            />
          </>
        )}

        {route === 'client' && currentUser && (
          <ClientDashboard
            user={currentUser}
            requests={myRequests}
            loading={requestsLoading}
            loadError={requestsError}
            onSaveRequest={handleSaveRequest}
            onBackToSite={() => navigate('landing')}
            onLogout={handleLogout}
          />
        )}

        {route === 'admin' && (
          <AdminRoute
            isAuthenticated={Boolean(adminToken)}
            onAdminLogin={handleAdminLogin}
            onAdminLogout={adminLogout}
            users={adminData.users}
            requests={adminData.requests}
            loading={adminLoading}
            loadError={adminLoadError}
            onRefresh={loadAdminData}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </main>

      {authModalOpen && (
        <LoginModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          auth={auth}
        />
      )}

      <Footer />
    </div>
  );
}
