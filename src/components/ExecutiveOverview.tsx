import React from 'react';
import { AirlineTenant, AirlineSubscription, AirportHub } from '../types/index.ts';
import { AIRPORT_HUBS } from '../data/seedData.ts';
import { 
  Globe2, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Server,
  Layers,
  Plane,
  AlertCircle
} from 'lucide-react';

interface ExecutiveOverviewProps {
  tenants: AirlineTenant[];
  subscriptions: AirlineSubscription[];
  onApproveTenant: (tenantId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  tenants,
  subscriptions,
  onApproveTenant,
  onNavigateTab,
}) => {
  const activeTenantsCount = tenants.filter(t => t.status === 'ACTIVE').length;
  const pendingTenants = tenants.filter(t => t.status === 'PENDING_APPROVAL');

  // Sum monthly revenue in ZMW equivalent
  const totalMonthlyZMW = subscriptions.reduce((sum, s) => {
    if (s.currency === 'ZMW') return sum + s.monthlyPrice;
    if (s.currency === 'USD') return sum + (s.monthlyPrice * 20);
    if (s.currency === 'KES') return sum + (s.monthlyPrice * 0.15);
    if (s.currency === 'ZAR') return sum + (s.monthlyPrice * 1.10);
    return sum + s.monthlyPrice;
  }, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Hero Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
              <Globe2 className="w-4 h-4" />
              <span>Global Aviation Identity Backbone · Multi-Tenant Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Aviation Intelligence & Network Overview
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time monitoring across international hub airports. FaceFly AI provides sub-200ms biometric passenger clearance with mathematically irreversible zero-knowledge template security.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('operations')}
              className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
            >
              Operations Dashboard →
            </button>
            <button
              onClick={() => onNavigateTab('subscriptions')}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              Unit Economics (K30k Target)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Subscribed Airline Tenants</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {activeTenantsCount} Active
            </span>
            {pendingTenants.length > 0 && (
              <span className="text-xs font-mono text-amber-400">({pendingTenants.length} pending review)</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Zambia Airways, Kenya Airways, Ethiopian, RwandAir.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Monthly Recurring Revenue (ARR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              K{Math.round(totalMonthlyZMW).toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">ZMW equiv/mo</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Based on K19,000/mo regional rate + continental fleet tiers.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Biometric Throughput</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">172 ms</span>
            <span className="text-xs text-emerald-400 font-mono">-55% vs SITA (380ms)</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Sub-second walk-through processing on edge nodes.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Global Gateway SLA</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">99.985%</span>
            <span className="text-xs text-emerald-400 font-mono">Zero Outages</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Dual-edge local fallback prevents airport disruption.
          </p>
        </div>
      </div>

      {/* Pending Tenant Onboarding Approvals (Platform Super Admin Action Area) */}
      {pendingTenants.length > 0 && (
        <div className="p-5 rounded-xl border border-amber-800/80 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
              <AlertCircle className="w-4 h-4" />
              <span>Tenant Onboarding Approval Queue (Platform Super Admin)</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Action Required</span>
          </div>

          <div className="space-y-3">
            {pendingTenants.map((t) => (
              <div 
                key={t.id}
                className="p-4 rounded-lg border border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.name}</span>
                    <span className="font-mono text-cyan-400">({t.iataCode})</span>
                    <span className="text-slate-400">· {t.country} · Base: {t.homeAirport}</span>
                  </div>
                  <div className="text-slate-400 font-mono mt-1">
                    Requested Tier: <span className="text-slate-200">{t.tier}</span> · Gates: {t.approvedGatesCount} · Monthly: {t.currency} {t.monthlyFee.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveTenant(t.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-colors"
                  >
                    Approve Onboarding
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Airport Hubs & International Route Network */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active Airport Hub Network</h2>
            <p className="text-xs text-slate-400">Operational stations deployed across international border zones.</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">6 Hubs Live</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AIRPORT_HUBS.map((hub) => (
            <div 
              key={hub.code}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-white">{hub.code}</span>
                    <span className="text-xs font-medium text-slate-300">{hub.city}, {hub.country}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{hub.name}</p>
                </div>
                <Plane className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-850 text-xs font-mono text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[10px]">Airlines:</span>
                  <span className="text-white font-bold">{hub.activeAirlinesCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">E-Gates:</span>
                  <span className="text-cyan-300 font-bold">{hub.installedGatesCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Daily Pax:</span>
                  <span className="text-emerald-300 font-bold">{hub.dailyPassengers.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
