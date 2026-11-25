import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ user, onNavigate, onOpenAuth, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const goLanding = () => {
    onNavigate('landing');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={goLanding}
          className="flex items-center gap-2.5 font-extrabold text-xl text-slate-900"
        >
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold">
            AF
          </span>
          <span>
            AetherFlow<span className="text-blue-600">.ai</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#services" onClick={goLanding} className="hover:text-blue-600 transition">Services</a>
          <a href="#web-dev" onClick={goLanding} className="hover:text-blue-600 transition">Web Dev</a>
          <a href="#ai-agents" onClick={goLanding} className="hover:text-blue-600 transition">AI Agents</a>
          <a href="#automation" onClick={goLanding} className="hover:text-blue-600 transition">Automation</a>
          <a href="#freelancing" onClick={goLanding} className="hover:text-blue-600 transition">Freelancing</a>
          <a href="#inquiry" onClick={goLanding} className="hover:text-blue-600 transition">Start Project</a>
        </nav>

        {/* Client-Only Controls: Login + Create Account OR My Workspace + Logout */}
        <div className="hidden sm:flex items-center gap-2.5">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('client')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                My Workspace
              </button>
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Account
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <a href="#services" onClick={goLanding}>Services</a>
            <a href="#web-dev" onClick={goLanding}>Web Development</a>
            <a href="#ai-agents" onClick={goLanding}>AI Agents</a>
            <a href="#automation" onClick={goLanding}>Workflow Automation</a>
            <a href="#freelancing" onClick={goLanding}>Dedicated Freelancing</a>
            <a href="#inquiry" onClick={goLanding}>Start Project</a>
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            {user ? (
              <>
                <button onClick={() => { onNavigate('client'); setMobileOpen(false); }} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600">
                  My Workspace
                </button>
                <button onClick={() => { onLogout(); setMobileOpen(false); }} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { onOpenAuth('login'); setMobileOpen(false); }} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200">
                  Login
                </button>
                <button onClick={() => { onOpenAuth('signup'); setMobileOpen(false); }} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white">
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
