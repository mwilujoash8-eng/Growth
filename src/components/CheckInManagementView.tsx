import React, { useState } from 'react';
import { PassengerBooking, UserRole } from '../types/index.ts';
import { 
  Luggage, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  Tag, 
  Check, 
  Plane,
  User
} from 'lucide-react';

interface CheckInManagementViewProps {
  passengers: PassengerBooking[];
  onUpdatePassenger: (pax: PassengerBooking) => void;
  activeRole: UserRole;
  selectedAirport: string;
}

export const CheckInManagementView: React.FC<CheckInManagementViewProps> = ({
  passengers,
  onUpdatePassenger,
  activeRole,
  selectedAirport,
}) => {
  const [selectedPaxId, setSelectedPaxId] = useState<string>(passengers[1]?.id || passengers[0]?.id || '');
  const [seatChoice, setSeatChoice] = useState('14C');
  const [baggageCountInput, setBaggageCountInput] = useState<number>(1);
  const [hazmatDeclared, setHazmatDeclared] = useState(true);

  const selectedPax = passengers.find(p => p.id === selectedPaxId) || passengers[0];

  // Complete passenger check-in
  const handleCompleteCheckIn = async () => {
    if (!selectedPax) return;
    try {
      // 1. Assign seat
      await fetch(`/api/passengers/${selectedPax.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'checkInStatus',
          status: 'PASSED',
          agentRole: activeRole,
          reason: `Seat ${seatChoice} assigned, ${baggageCountInput} bags tagged, hazmat declared.`,
        }),
      });

      // 2. Set baggage count
      await fetch(`/api/passengers/${selectedPax.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'baggageCount',
          status: baggageCountInput.toString(),
          agentRole: activeRole,
          reason: `Tagged ${baggageCountInput} checked pieces`,
        }),
      });

      // 3. Set hazmat declaration
      const res = await fetch(`/api/passengers/${selectedPax.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'dangerousGoodsDeclared',
          status: hazmatDeclared,
          agentRole: activeRole,
          reason: `IATA Dangerous goods declaration signed`,
        }),
      });

      const data = await res.json();
      if (data.passenger) {
        onUpdatePassenger(data.passenger);
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Luggage className="w-4 h-4 text-cyan-400" />
            <span>AIRLINE PASSENGER CHECK-IN & BAGGAGE DESK · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Check-In & Baggage Management</h1>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <span>Prerequisite Stage: </span>
          <span className="text-amber-400 font-bold">Mandatory before Gate Unlatching</span>
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Passenger Queue for Check-in */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Pending & Active Passenger Check-in Queue</h2>
            <span className="text-xs font-mono text-slate-400">{passengers.length} Booked</span>
          </div>

          <div className="divide-y divide-slate-800">
            {passengers.map((p) => {
              const isSelected = selectedPax?.id === p.id;
              const isCheckedIn = p.checkInStatus === 'PASSED';
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPaxId(p.id);
                    setBaggageCountInput(p.baggageCount || 1);
                    setSeatChoice(p.seat === 'UNASSIGNED' ? '14C' : p.seat);
                    setHazmatDeclared(p.dangerousGoodsDeclared);
                  }}
                  className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.passengerName}</span>
                      <span className="text-xs font-mono text-cyan-400">PNR: {p.pnr}</span>
                      <span className="text-xs text-slate-400 font-mono">· {p.flightNumber}</span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                      <span>Seat: <strong className={p.seat === 'UNASSIGNED' ? 'text-amber-400' : 'text-white'}>{p.seat}</strong></span>
                      <span>·</span>
                      <span>Bags: <strong className="text-white">{p.baggageCount}</strong></span>
                      <span>·</span>
                      <span>Identity: <strong className={p.identityStatus === 'PASSED' ? 'text-emerald-400' : 'text-slate-400'}>{p.identityStatus}</strong></span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      isCheckedIn ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {isCheckedIn ? 'CHECKED IN' : 'SEAT PENDING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Check-in Operations Desk Form */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
          {selectedPax && (
            <>
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-cyan-400">CHECK-IN COUNTER</span>
                <h3 className="text-lg font-bold text-white">{selectedPax.passengerName}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  PNR: {selectedPax.pnr} · Flight: {selectedPax.flightNumber} · Gate: {selectedPax.gate}
                </div>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Seat Selector */}
                <div>
                  <label className="text-slate-400 block mb-1">Aircraft Seat Assignment</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['12A', '12B', '14C', '16F'].map((seat) => (
                      <button
                        key={seat}
                        onClick={() => setSeatChoice(seat)}
                        className={`p-2 rounded-lg border text-center transition-colors ${
                          seatChoice === seat
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baggage Piece Counter */}
                <div>
                  <label className="text-slate-400 block mb-1">Checked Baggage Pieces</label>
                  <div className="flex items-center gap-3">
                    {[0, 1, 2, 3].map((count) => (
                      <button
                        key={count}
                        onClick={() => setBaggageCountInput(count)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          baggageCountInput === count
                            ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {count} {count === 1 ? 'Bag' : 'Bags'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IATA Hazardous Materials Declaration */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>IATA Dangerous Goods Regulation</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Passenger confirms no spare lithium batteries, compressed gases, or prohibited flammable materials are in checked baggage.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 pt-1">
                    <input
                      type="checkbox"
                      checked={hazmatDeclared}
                      onChange={(e) => setHazmatDeclared(e.target.checked)}
                      className="accent-cyan-400 w-4 h-4 rounded"
                    />
                    <span>Passenger has signed safety declaration</span>
                  </label>
                </div>

                {/* Submit Check-in Button */}
                <button
                  onClick={handleCompleteCheckIn}
                  className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Check-In & Issue Luggage Tags</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
