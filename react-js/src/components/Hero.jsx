import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero({ onOpenSignup }) {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-blue-50/70 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-5">
            <Sparkles size={14} /> Next-Gen Light-First AI & Engineering Studio
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-5">
            Build Intelligent{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Web Apps, AI Agents
            </span>{' '}
            & Automated Workflows
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl">
            We partner with startups and enterprises to ship full-stack web platforms, custom RAG & voice AI agents, end-to-end workflow automation, and dedicated freelance engineering pods.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href="#inquiry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Launch Your Project <ArrowRight size={18} />
            </a>
            <button
              onClick={onOpenSignup}
              className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
            >
              Create Client Account
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">140+</div>
              <div className="text-xs text-slate-500">AI & Web Launches</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">99.9%</div>
              <div className="text-xs text-slate-500">Agent Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">48 hrs</div>
              <div className="text-xs text-slate-500">Freelance Kickoff</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-slate-500">
                Live Agency Delivery Pipeline
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xs text-slate-500">Active AI Agents</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">38</div>
                <div className="text-xs font-semibold text-emerald-600 mt-1">+18% this month</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xs text-slate-500">Tasks Automated</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-0.5">1.4M</div>
                <div className="text-xs font-semibold text-emerald-600 mt-1">Zero manual lag</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-sm font-semibold text-slate-900">SaaS Portal + Stripe</div>
                  <div className="text-xs text-slate-500">React · Node · PostgreSQL</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">Web Dev</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-sm font-semibold text-slate-900">24/7 WhatsApp & Voice Bot</div>
                  <div className="text-xs text-slate-500">RAG Docs · CRM Sync</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">AI Agent</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Lead & Invoice Pipeline</div>
                  <div className="text-xs text-slate-500">n8n · Webhooks · Slack</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">Automation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
