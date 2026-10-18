import React, { useState } from 'react';
import { AirlineSubscription, CurrencyCode } from '../types/index.ts';
import { CURRENCIES } from '../data/seedData.ts';
import { 
  CreditCard, 
  DollarSign, 
  Calculator, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  FileText, 
  Key, 
  Download,
  TrendingUp,
  Percent,
  Sparkles
} from 'lucide-react';

interface AirlineBillingPortalProps {
  subscriptions: AirlineSubscription[];
  onRenewSubscription: (subId: string) => void;
}

export const AirlineBillingPortal: React.FC<AirlineBillingPortalProps> = ({
  subscriptions,
  onRenewSubscription,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('ZMW');
  const [targetAirlinesCount, setTargetAirlinesCount] = useState<number>(3);
  const [serverInfraCostZMW, setServerInfraCostZMW] = useState<number>(7500);
  const [selectedInvoiceSub, setSelectedInvoiceSub] = useState<AirlineSubscription | null>(subscriptions[0]);

  const currencyConfig = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  // Unit Economics Calculations
  const pricePerAirlineInZMW = 19000;
  const monthlyGrossRevenueZMW = targetAirlinesCount * pricePerAirlineInZMW;
  const monthlyServerCostsZMW = serverInfraCostZMW + (targetAirlinesCount * 800); // base + edge inference bandwidth
  const taxReserveRate = 0.15; // 15% corporate / small enterprise reserve
  const estimatedTaxReserveZMW = Math.round((monthlyGrossRevenueZMW - monthlyServerCostsZMW) * taxReserveRate);
  const netMonthlyProfitZMW = Math.max(0, monthlyGrossRevenueZMW - monthlyServerCostsZMW - estimatedTaxReserveZMW);
  
  // Personal spending goal: K30,000 / month (K360,000 / year)
  const personalSpendingGoalZMW = 30000;
  const personalGoalPct = Math.min(100, Math.round((netMonthlyProfitZMW / personalSpendingGoalZMW) * 100));
  const hasAchievedGoal = netMonthlyProfitZMW >= personalSpendingGoalZMW;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>ENTERPRISE B2B COMMERCIAL PORTAL · AIRLINES ARE THE PAYING CUSTOMERS</span>
          </div>
          <h1 className="text-xl font-bold text-white">Airline Subscriptions & Business Model</h1>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Display Currency:</span>
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCurrency(c.code)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedCurrency === c.code
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c.code} ({c.symbol})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Monthly Airline Subscription Plans</h2>
          <p className="text-xs text-slate-400">
            Airlines subscribe to FaceFly AI on a monthly basis. Passengers do not pay separately for identity processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Regional Feeder (Primary Zambia standard) */}
          <div className="p-6 rounded-2xl border-2 border-cyan-500/80 bg-gradient-to-b from-cyan-950/20 to-slate-900/60 relative shadow-xl flex flex-col justify-between">
            <div className="absolute top-4 right-4 text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              PRIMARY TIER (ZAMBIA)
            </div>

            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1 font-semibold">FOR REGIONAL AIRLINES</div>
              <h3 className="text-xl font-bold text-white">Regional Feeder Fleet</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Designed for carriers operating domestic and regional routes (e.g. Zambia Airways, Proflight).
              </p>

              <div className="mb-6 flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">
                  {currencyConfig.symbol} {Math.round(19000 / currencyConfig.exchangeRateToZMW).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Up to 8 airport biometric turnstiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>25,000 monthly passenger verifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Sub-200ms local edge vector matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>ICAO Doc 9303 OCR scanner driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>99.98% Service Level Agreement (SLA)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono block mb-2">
                Zambia Price: <strong className="text-white">K19,000 ZMW</strong>
              </span>
              <button className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors">
                Select Regional Plan
              </button>
            </div>
          </div>

          {/* Plan 2: Continental Fleet */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-400 mb-1 font-semibold">FOR MULTI-HUB OPERATORS</div>
              <h3 className="text-xl font-bold text-white">Continental Network</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                For medium-sized flag carriers connecting multiple African and Middle Eastern hubs.
              </p>

              <div className="mb-6 flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">
                  {currencyConfig.symbol} {Math.round(85000 / currencyConfig.exchangeRateToZMW).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Up to 24 biometric gate nodes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>120,000 monthly passenger verifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated Bag Drop (SITA/Vanderlande bridge)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority 24/7 aviation dispatch support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>99.99% Guaranteed High-Availability SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono block mb-2">
                Kenya Price: <strong className="text-white">KES 125,000</strong>
              </span>
              <button className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors border border-slate-700">
                Contact Enterprise Sales
              </button>
            </div>
          </div>

          {/* Plan 3: Global Flagship */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-400 mb-1 font-semibold">FOR MAJOR ALLIANCES</div>
              <h3 className="text-xl font-bold text-white">Global Flagship</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Unlimited worldwide gates, multi-datacenter replication, and dedicated cryptographic HSM hardware.
              </p>

              <div className="mb-6 flex items-baseline gap-1 font-mono">
                <span className="text-3xl font-extrabold text-white">
                  {currencyConfig.symbol} {Math.round(250000 / currencyConfig.exchangeRateToZMW).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Unlimited airport gates & stations worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Over 500,000 monthly passenger verifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Custom Interpol / Customs national API links</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Dedicated on-premise edge neural clusters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>99.995% Mission-Critical SLA</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono block mb-2">
                International: <strong className="text-white">$2,850 USD</strong>
              </span>
              <button className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors border border-slate-700">
                Request Custom Deployment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Unit Economics & Personal Spending Goal Milestone Simulator */}
      <div className="p-6 rounded-2xl border border-cyan-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Calculator className="w-4 h-4" />
              <span>BUSINESS UNIT ECONOMICS & PERSONAL SPENDING MILESTONE</span>
            </div>
            <h2 className="text-xl font-bold text-white">K30,000 Monthly Personal Budget Calculator</h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Simulate realistic business earnings, operating expenses, and tax reserves to reach your personal target of K30,000/month.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Personal Spending Goal:</span>
            <span className="text-lg font-bold font-mono text-cyan-300">K30,000 / month</span>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-950/70 rounded-xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Number of Paying Airlines:</span>
              <span className="font-bold text-cyan-400 text-sm">{targetAirlinesCount} Airlines</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={targetAirlinesCount}
              onChange={(e) => setTargetAirlinesCount(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>1 Airline (First Customer)</span>
              <span>3 Airlines (Goal Achieved)</span>
              <span>25 Airlines (Fleet)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">Monthly Operating & Server Expenses:</span>
              <span className="font-bold text-slate-200">K{serverInfraCostZMW.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="3000"
              max="20000"
              step="500"
              value={serverInfraCostZMW}
              onChange={(e) => setServerInfraCostZMW(Number(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>K3,000 (Lean VPS)</span>
              <span>K7,500 (Nominal Cloud)</span>
              <span>K20,000 (Full Redundancy)</span>
            </div>
          </div>
        </div>

        {/* Financial Ledger Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block mb-1">Monthly Gross Revenue:</span>
            <span className="text-lg font-bold text-white">K{monthlyGrossRevenueZMW.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">({targetAirlinesCount} × K19,000/mo)</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block mb-1">Server & AI Expenses:</span>
            <span className="text-lg font-bold text-rose-300">-K{monthlyServerCostsZMW.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Cloud + Edge bandwidth</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block mb-1">Tax & Emergency Reserve:</span>
            <span className="text-lg font-bold text-amber-300">-K{estimatedTaxReserveZMW.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">15% ZRA & compliance</span>
          </div>

          <div className="p-3.5 bg-cyan-950/40 rounded-lg border border-cyan-700/60">
            <span className="text-cyan-300 block mb-1 font-semibold">Net Business Profit:</span>
            <span className="text-lg font-bold text-emerald-300">K{netMonthlyProfitZMW.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Available for personal budget</span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="space-y-2 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Progress Toward K30,000 Monthly Personal Target:</span>
              <span className={`font-bold ${hasAchievedGoal ? 'text-emerald-400' : 'text-amber-400'}`}>
                {personalGoalPct}% {hasAchievedGoal ? '— GOAL UNLOCKED! 💰' : ''}
              </span>
            </div>
            <span className="text-slate-400">
              K{netMonthlyProfitZMW.toLocaleString()} / K30,000
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                hasAchievedGoal ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_#34d399]' : 'bg-cyan-500'
              }`}
              style={{ width: `${personalGoalPct}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            {hasAchievedGoal 
              ? `Congratulations! With ${targetAirlinesCount} subscribing airlines at K19,000/month, after paying all server costs (K${monthlyServerCostsZMW.toLocaleString()}) and setting aside K${estimatedTaxReserveZMW.toLocaleString()} for taxes, you have K${netMonthlyProfitZMW.toLocaleString()} net profit available each month.`
              : `To safely have K30,000 for personal spending, you need at least 3 paying airlines at K19,000/month so that operating expenses and taxes are covered first.`
            }
          </p>
        </div>
      </div>

      {/* Subscribed Airline Customer Accounts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Active Subscribed Airline Accounts</h2>

        <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{sub.airlineName}</span>
                  <span className="text-xs font-mono text-cyan-400">({sub.iataCode})</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {sub.tier}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">● ACTIVE</span>
                </div>

                <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-3">
                  <span>Base: {sub.homeBaseIata} ({sub.country})</span>
                  <span>·</span>
                  <span>Licensed Gates: {sub.licensedGates}</span>
                  <span>·</span>
                  <span>Scans This Month: {sub.currentMonthScans.toLocaleString()} / {sub.maxMonthlyScans.toLocaleString()}</span>
                  <span>·</span>
                  <span>SLA: {sub.slaUptime}%</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-white">
                    {sub.currency} {sub.monthlyPrice.toLocaleString()}/mo
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Next billing: {sub.nextBillingDate}
                  </div>
                </div>

                <button
                  onClick={() => onRenewSubscription(sub.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors"
                >
                  Renew / Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
