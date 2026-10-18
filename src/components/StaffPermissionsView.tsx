import React, { useState } from 'react';
import { StaffMember, UserRole } from '../types/index.ts';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Lock,
  Building
} from 'lucide-react';

interface StaffPermissionsViewProps {
  staff: StaffMember[];
  onAddStaff: (newStaff: Partial<StaffMember>) => void;
  onRevokeStaff: (staffId: string) => void;
  activeRole: UserRole;
  selectedAirport: string;
}

export const StaffPermissionsView: React.FC<StaffPermissionsViewProps> = ({
  staff,
  onAddStaff,
  onRevokeStaff,
  activeRole,
  selectedAirport,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('AIRPORT_OPERATIONS_STAFF');
  const [badgeNumber, setBadgeNumber] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    onAddStaff({
      fullName,
      email,
      role,
      badgeNumber: badgeNumber || `STAFF-${Math.floor(1000 + Math.random() * 9000)}`,
      assignedAirport: selectedAirport,
      assignedStations: ['st-lun-board-gate4b'],
    });
    setFullName('');
    setEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSIONS · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Staff Management & Security Authorizations</h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Staff Badge</span>
        </button>
      </div>

      {/* Roles Breakdown Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            role: 'Platform Super Admin',
            desc: 'Cross-tenant oversight, country pricing configuration, airline onboarding approvals.',
            badge: 'FULL SYSTEM ACCESS',
          },
          {
            role: 'Airline Administrator',
            desc: 'Manages carrier gates, staff rosters, airline billing, and tenant-isolated flight manifests.',
            badge: 'TENANT SCOPED',
          },
          {
            role: 'Airport Operations Staff',
            desc: 'Station check-in, baggage injection, manual turnstile overrides, and passenger verification.',
            badge: 'GATE TOUCHPOINTS',
          },
          {
            role: 'Security Reviewer',
            desc: 'Investigates biometric divergence anomalies, spoof attempts, and INTERPOL watchlist hits.',
            badge: 'PRIVACY MINIMIZED',
          },
        ].map((r) => (
          <div key={r.role} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900/60 block w-fit">
              {r.badge}
            </span>
            <h3 className="text-sm font-bold text-white">{r.role}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Staff Roster Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Authorized Ground Staff & Administrative Roster</h2>
          <span className="text-xs font-mono text-slate-400">{staff.length} Active Credentials</span>
        </div>

        <div className="divide-y divide-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Staff Name & Badge</th>
                <th className="py-2.5 px-3 font-semibold">Assigned Role</th>
                <th className="py-2.5 px-3 font-semibold">Station / Hub</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{s.fullName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.email} · Badge: <strong className="text-cyan-300">{s.badgeNumber}</strong></div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-300">
                    {s.role}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-400">
                    {s.assignedAirport} (Airport Core)
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      s.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onRevokeStaff(s.id)}
                      className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
                        s.status === 'ACTIVE' 
                          ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80' 
                          : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80'
                      }`}
                    >
                      {s.status === 'ACTIVE' ? 'Revoke Access' : 'Reactivate Badge'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Provision Aviation Staff Credentials</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain Mwamba Zulu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Official Airline Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@carrier.aero"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                >
                  <option value="AIRPORT_OPERATIONS_STAFF">Airport Operations Staff (Gate Agent)</option>
                  <option value="AIRLINE_ADMIN">Airline Administrator</option>
                  <option value="SECURITY_REVIEWER">Airport Security & Border Officer</option>
                  <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Airport Badge Number</label>
                <input
                  type="text"
                  placeholder="e.g. ZN-GA-4410"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Issue Digital Badge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
