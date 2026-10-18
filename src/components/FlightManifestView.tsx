import React, { useState } from 'react';
import { PassengerBooking, UserRole } from '../types/index.ts';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  Plane, 
  ShieldCheck, 
  Luggage, 
  CreditCard,
  Eye,
  Check,
  ChevronRight
} from 'lucide-react';

interface FlightManifestViewProps {
  passengers: PassengerBooking[];
  onUpdatePassenger: (pax: PassengerBooking) => void;
  onSelectPassengerForScan: (pnr: string) => void;
  activeRole: UserRole;
  selectedAirport: string;
}

export const FlightManifestView: React.FC<FlightManifestViewProps> = ({
  passengers,
  onUpdatePassenger,
  onSelectPassengerForScan,
  activeRole,
  selectedAirport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [flightFilter, setFlightFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AUTHORIZED' | 'BLOCKED' | 'PENDING'>('ALL');
  const [selectedPax, setSelectedPax] = useState<PassengerBooking | null>(passengers[0] || null);

  // Filter passengers
  const filtered = passengers.filter(p => {
    const matchesSearch = 
      p.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.passportNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFlight = flightFilter === 'ALL' || p.flightNumber === flightFilter;
    
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'AUTHORIZED' && p.boardingStatus === 'PASSED') ||
      (statusFilter === 'BLOCKED' && p.boardingStatus === 'BLOCKED') ||
      (statusFilter === 'PENDING' && p.boardingStatus === 'PENDING');

    return matchesSearch && matchesFlight && matchesStatus;
  });

  // Handler to update passenger stage directly
  const handleStageUpdate = async (stage: string, status: string) => {
    if (!selectedPax) return;
    try {
      const response = await fetch(`/api/passengers/${selectedPax.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          status,
          agentRole: activeRole,
          reason: `Manifest update by ${activeRole}`,
        }),
      });
      const data = await response.json();
      if (data.passenger) {
        onUpdatePassenger(data.passenger);
        setSelectedPax(data.passenger);
      }
    } catch (err) {
      console.error('Workflow update error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Flight Passenger Manifests & Clearance</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time IATA e-manifest with biometric token verification status ({selectedAirport}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search PNR, name, passport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 pl-9 pr-3 py-1.5 text-xs rounded-lg text-white font-mono focus:border-cyan-500 focus:outline-none w-56"
            />
          </div>

          {/* Flight Dropdown */}
          <select
            value={flightFilter}
            onChange={(e) => setFlightFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Active Flights</option>
            <option value="KQ 502">KQ 502 (Nairobi)</option>
            <option value="ZN 304">ZN 304 (Johannesburg)</option>
            <option value="ET 801">ET 801 (Addis Ababa)</option>
            <option value="WB 102">WB 102 (Kigali)</option>
          </select>
        </div>
      </div>

      {/* Main Split: Manifest Table and Passenger Clearance Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Passenger List Table */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Showing {filtered.length} Passengers</span>
            </div>

            {/* Status Filter Segmented Buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('AUTHORIZED')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Authorized
              </button>
              <button
                onClick={() => setStatusFilter('BLOCKED')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === 'BLOCKED' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Blocked/Pending
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/40 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">PNR / Pax Name</th>
                  <th className="py-2.5 px-3 font-semibold">Flight / Seat</th>
                  <th className="py-2.5 px-3 font-semibold">Biometric ID</th>
                  <th className="py-2.5 px-3 font-semibold">Check-in</th>
                  <th className="py-2.5 px-3 font-semibold">Gate Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filtered.map((p) => {
                  const isSelected = selectedPax?.id === p.id;
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPax(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{p.passengerName}</div>
                        <div className="font-mono text-[11px] text-cyan-400">PNR: {p.pnr} · {p.nationality}</div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="text-slate-200">{p.flightNumber}</div>
                        <div className={`text-[11px] ${p.seat === 'UNASSIGNED' ? 'text-amber-400' : 'text-slate-400'}`}>
                          Seat {p.seat}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        {p.identityStatus === 'PASSED' && (
                          <span className="text-emerald-400 font-semibold">{p.biometricConfidence}%</span>
                        )}
                        {p.identityStatus === 'FAILED' && (
                          <span className="text-rose-400 font-semibold">{p.biometricConfidence}% FAIL</span>
                        )}
                        {p.identityStatus === 'PENDING' && (
                          <span className="text-slate-500">NOT SCANNED</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        {p.checkInStatus === 'PASSED' ? (
                          <span className="text-emerald-400">BAGS ({p.baggageCount})</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">PENDING</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px]">
                        {p.boardingStatus === 'PASSED' ? (
                          <span className="text-emerald-400 font-bold">AUTHORIZED</span>
                        ) : (
                          <span className="text-amber-400 font-bold">WITHHELD</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPassengerForScan(p.pnr);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-mono text-[11px] transition-colors"
                        >
                          Scan →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Detailed Passenger Dossier & Clearance Editor */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-5">
          {selectedPax ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400">PASSPORT DOSSIER & RECORD</span>
                  <h2 className="text-xl font-bold text-white">{selectedPax.passengerName}</h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    PNR: {selectedPax.pnr} · {selectedPax.airlineName} · Gate: {selectedPax.gate}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    selectedPax.boardingStatus === 'PASSED' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {selectedPax.boardingStatus === 'PASSED' ? 'GATE UNLATCHED' : 'GATE WITHHELD'}
                  </span>
                </div>
              </div>

              {/* Passport Specs */}
              <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono space-y-2">
                <div className="text-slate-400 font-semibold">TRAVEL DOCUMENT SPECIFICATION (ICAO 9303)</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Passport No: <span className="text-white">{selectedPax.passportNumber}</span></div>
                  <div>Nationality: <span className="text-white">{selectedPax.nationality}</span></div>
                  <div>Expiry: <span className="text-white">{selectedPax.passportExpiry}</span></div>
                  <div>DOB: <span className="text-white">{selectedPax.dateOfBirth}</span></div>
                </div>
                <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-500 break-all">
                  SHA-256 Token: {selectedPax.biometricTemplateHash || 'NOT_ENROLLED_YET'}
                </div>
              </div>

              {/* Clearance Stage Actions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Ground Agent Operational Controls
                </h3>

                {/* Check-in seat allocation button */}
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">Check-in Status</span>
                    <p className="text-[11px] text-slate-400">Seat: {selectedPax.seat}</p>
                  </div>
                  {selectedPax.checkInStatus === 'PASSED' ? (
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStageUpdate('checkInStatus', 'PASSED')}
                      className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-[11px] transition-colors"
                    >
                      Allocate Seat 12B
                    </button>
                  )}
                </div>

                {/* Visa Status */}
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">Visa & Border Validation</span>
                    <p className="text-[11px] text-slate-400">Current: {selectedPax.visaRequirement}</p>
                  </div>
                  {selectedPax.visaRequirement === 'NOT_REQUIRED' || selectedPax.visaRequirement === 'VERIFIED_VALID' ? (
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Valid
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStageUpdate('visaRequirement', 'VERIFIED_VALID')}
                      className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[11px] transition-colors"
                    >
                      Verify Visa Stamp
                    </button>
                  )}
                </div>

                {/* Security Watchlist */}
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">Security Watchlist</span>
                    <p className="text-[11px] text-slate-400">{selectedPax.securityWatchlistFlag}</p>
                  </div>
                  {selectedPax.securityWatchlistFlag === 'NONE' ? (
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Cleared
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStageUpdate('securityStatus', 'PASSED')}
                      className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-[11px] transition-colors"
                    >
                      Clear Inspection Flag
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Link to Scan this Passenger */}
              <div className="pt-2">
                <button
                  onClick={() => onSelectPassengerForScan(selectedPax.pnr)}
                  className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Send to Live Biometric Scanner ({selectedPax.pnr})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a passenger from the flight manifest to inspect travel dossier.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
