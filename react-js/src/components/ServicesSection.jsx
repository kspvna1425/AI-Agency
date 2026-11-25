import React from 'react';
import { Globe, Bot, Zap, Users, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../data/services';

const ICONS = {
  'web-dev': Globe,
  'ai-agents': Bot,
  automation: Zap,
  freelancing: Users,
};

const STYLES = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
};

export default function ServicesSection({ onSelectService }) {
  return (
    <section id="services" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Four Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3">
            Everything You Need to Scale Modern Operations
          </h2>
          <p className="text-slate-600">
            Clean light-mode UX, modular full-stack architecture, and transparent sprint delivery.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((svc) => {
            const Icon = ICONS[svc.id];
            return (
              <div
                key={svc.id}
                id={svc.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${STYLES[svc.accent]}`}>
                  <Icon size={24} />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {svc.badge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2.5">{svc.title}</h3>
                <p className="text-sm text-slate-600 mb-5">{svc.description}</p>
                <ul className="space-y-2 mb-6 flex-grow">
                  {svc.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 size={15} className="text-blue-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#inquiry"
                  onClick={() => onSelectService(svc.title)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Scope {svc.title} <ArrowUpRight size={16} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
