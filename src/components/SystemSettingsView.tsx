import React, { useState } from 'react';
import { CurrencyConfig, UserRole } from '../types/index.ts';
import { CURRENCIES } from '../data/seedData.ts';
import { 
  Settings, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  Key, 
  Server, 
  CheckCircle2, 
  Save,
  Globe2
} from 'lucide-react';

interface SystemSettingsViewProps {
  currencies: CurrencyConfig[];
  onUpdateCurrencyRate: (code: string, newRate: number) => void;
  activeRole: UserRole;
  selectedAirport: string;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  currencies,
  onUpdateCurrencyRate,
  activeRole,
  selectedAirport,
}) => {
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    currencies.forEach(c => {
      initial[c.code] = c.monthlySubscriptionRate;
    });
    return initial;
  });
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const handleRateChange = (code: string, val: string) => {
    setRates(prev => ({
      ...prev,
      [code]: Number(val),
    }));
  };

  const handleSave = (code: string) => {
    onUpdateCurrencyRate(code, rates[code]);
    setSavedSuccess(code);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>GLOBAL PLATFORM CONFIGURATION & SYSTEM ARCHITECTURE · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">System Settings & Multi-Country Pricing</h1>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Admin Level: <strong className="text-cyan-400">{activeRole}</strong>
        </span>
      </div>

      {/* Country-Specific Airline Pricing Configuration (Super Admin) */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase mb-1">
              <Globe2 className="w-4 h-4" />
              <span>Multi-Country Deployment Pricing Configuration</span>
            </div>
            <h2 className="text-lg font-bold text-white">Configured Local Monthly Subscription Rates</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Airlines are charged in their home country local currencies. The baseline in Zambia is K19,000/month.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {currencies.map((c) => (
            <div 
              key={c.code}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm">{c.name}</span>
                  <span className="text-xs font-mono text-slate-400 block">{c.code} ({c.symbol})</span>
                </div>
                {c.code === 'ZMW' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    PRIMARY BASELINE
                  </span>
                )}
              </div>

              <div className="space-y-1 font-mono text-xs">
                <label className="text-slate-400 block">Monthly Rate ({c.symbol}):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rates[c.code] ?? c.monthlySubscriptionRate}
                    onChange={(e) => handleRateChange(c.code, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                  <button
                    onClick={() => handleSave(c.code)}
                    className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {savedSuccess === c.code && (
                <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rate updated successfully</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tenant Isolation & Cryptographic Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Server-Enforced Tenant Isolation</span>
          </div>
          <h3 className="text-base font-bold text-white">Multi-Tenant Database Boundary</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Strict isolation keys (<code className="text-cyan-300 font-mono">tenantId</code>) are evaluated on every incoming request. 
            Airline administrators and operations officers cannot retrieve passenger records, booking itineraries, camera streams, or audit files belonging to another carrier.
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Cross-Tenant Leakage Protection: <span className="text-emerald-400 font-bold">ENFORCED</span></div>
            <div>Isolation Engine: <span className="text-white">Row-Level Key Policy (RLS)</span></div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
            <Lock className="w-4 h-4" />
            <span>FIPS 140-2 Level 3 Key Management</span>
          </div>
          <h3 className="text-base font-bold text-white">Biometric Vault Encryption</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Passenger facial vectors are hashed using irreversible 512-dimensional embedding matrices. 
            Keys are rotated every 30 days via Hardware Security Modules (HSM) adhering to ICAO Doc 9303 Part 9 and ISO/IEC 19794 standards.
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
            <div>Cryptographic Cipher: <span className="text-emerald-400 font-bold">AES-256-GCM</span></div>
            <div>Vector Retention: <span className="text-white">120 Minutes Ephemeral (GDPR/POPIA)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
