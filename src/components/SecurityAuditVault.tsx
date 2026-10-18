import React, { useState } from 'react';
import { SecurityAuditRecord } from '../types/index.ts';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Filter, 
  CheckCircle2, 
  Database,
  Terminal
} from 'lucide-react';

interface SecurityAuditVaultProps {
  auditLogs: SecurityAuditRecord[];
  selectedAirport: string;
}

export const SecurityAuditVault: React.FC<SecurityAuditVaultProps> = ({
  auditLogs,
  selectedAirport,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (filterSeverity === 'ALL') return true;
    return log.severity === filterSeverity;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>IMMUTABLE CRYPTOGRAPHIC LEDGER · ZERO-KNOWLEDGE PROOF · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Security Audit & Biometric Privacy Vault</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Total Audit Proofs:</span>
          <span className="text-white font-bold">{auditLogs.length} Events</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-bold">SHA-256 Validated</span>
        </div>
      </div>

      {/* Privacy Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
            <Key className="w-4 h-4" />
            <span>Zero-Knowledge Templates</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Raw facial photos are never saved to disk. FaceFly AI extracts 512-dimensional irreversible vector hashes encrypted with airline-specific HSM keys.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
            <Clock className="w-4 h-4" />
            <span>2-Hour Auto-Purge Lifecycle</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under GDPR, POPIA & Zambian Data Protection Act 2021, transient passenger biometric templates are cryptographically zeroed 120 minutes after flight takeoff.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold">
            <FileCheck className="w-4 h-4" />
            <span>Non-Repudiation Audit Seal</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every gate opening, security denial, and manual agent override generates an indelible SHA-256 digital signature stored for aviation authority audits.
          </p>
        </div>
      </div>

      {/* Filter and Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Cryptographic Event Stream</h2>
          </div>

          <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
            {['ALL', 'INFO', 'NOTICE', 'WARNING', 'ALERT'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  filterSeverity === sev ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Timestamp / Actor</th>
                <th className="py-2.5 px-3 font-semibold">Event Type</th>
                <th className="py-2.5 px-3 font-semibold">Subject PNR</th>
                <th className="py-2.5 px-3 font-semibold">Details & Rationale</th>
                <th className="py-2.5 px-4 font-semibold text-right">Digital Signature Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono text-xs">
              {filteredLogs.map((log) => {
                let badgeClass = 'text-slate-300';
                if (log.severity === 'ALERT') badgeClass = 'text-rose-400 font-bold';
                else if (log.severity === 'WARNING') badgeClass = 'text-amber-400 font-bold';
                else if (log.severity === 'NOTICE') badgeClass = 'text-cyan-400 font-bold';
                else if (log.severity === 'INFO') badgeClass = 'text-emerald-400';

                return (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{log.timestamp}</div>
                      <div className="text-[11px] text-slate-400">{log.actorRole} · {log.actorIdentifier}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={badgeClass}>{log.eventType}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-cyan-300 font-bold">{log.pnr || '—'}</div>
                      <div className="text-[11px] text-slate-400">{log.passengerName || ''}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-sans text-xs max-w-md">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {log.cryptographicProof.slice(0, 18)}...
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
