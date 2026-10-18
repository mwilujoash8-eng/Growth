import React, { useState } from 'react';
import { FlightOperation, UserRole } from '../types/index.ts';
import { 
  Plane, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface FlightOperationsViewProps {
  flights: FlightOperation[];
  onUpdateFlightStatus: (flightId: string, status: FlightOperation['status']) => void;
  activeRole: UserRole;
  selectedAirport: string;
}

export const FlightOperationsView: React.FC<FlightOperationsViewProps> = ({
  flights,
  onUpdateFlightStatus,
  activeRole,
  selectedAirport,
}) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightOperation>(flights[0]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Plane className="w-4 h-4 text-cyan-400" />
            <span>DISPATCH & AIRSIDE GATE MANAGEMENT · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Flight Operations & Gate Control</h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Scheduled Departures:</span>
          <span className="text-white font-bold">{flights.length} Flights Active</span>
        </div>
      </div>

      {/* Flight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.map((f) => {
          const isSelected = selectedFlight?.id === f.id;
          const boardedPct = Math.round((f.boardedCount / (f.totalSeats || 1)) * 100);

          let statusColor = 'text-slate-400';
          if (f.status === 'BOARDING') statusColor = 'text-emerald-400';
          if (f.status === 'FINAL_CALL') statusColor = 'text-amber-400 font-bold';
          if (f.status === 'CHECKIN_OPEN') statusColor = 'text-cyan-400';

          return (
            <div
              key={f.id}
              onClick={() => setSelectedFlight(f)}
              className={`p-5 rounded-xl border cursor-pointer transition-all space-y-4 ${
                isSelected 
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-xl' 
                  : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-white">{f.flightNumber}</span>
                    <span className="text-xs text-slate-400 font-medium">{f.airlineName}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">
                    {f.originAirport} → {f.destinationAirport} · {f.aircraftType}
                  </div>
                </div>

                <span className={`text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded bg-slate-950 border border-slate-800 ${statusColor}`}>
                  {f.status.replace('_', ' ')}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Biometric Boarded:</span>
                  <span className="text-white font-bold">{f.boardedCount} / {f.totalSeats} seats ({boardedPct}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${boardedPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                <div>
                  <span className="text-slate-500 block text-[10px]">Gate:</span>
                  <span className="text-white font-semibold">{f.gate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Dep Time:</span>
                  <span className="text-white font-semibold">{f.scheduledDeparture}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Terminal:</span>
                  <span className="text-slate-300">{f.terminal}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flight Detail Control Panel */}
      {selectedFlight && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400">ACTIVE FLIGHT DISPATCH</span>
              <h2 className="text-lg font-bold text-white">
                {selectedFlight.flightNumber} ({selectedFlight.originAirport} to {selectedFlight.destinationAirport})
              </h2>
            </div>

            {/* Quick Flight Status Dispatch Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Set Gate State:</span>
              {(['CHECKIN_OPEN', 'BOARDING', 'FINAL_CALL', 'CLOSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateFlightStatus(selectedFlight.id, st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    selectedFlight.status === st
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Checked In:</span>
              <span className="text-white font-bold text-base">{selectedFlight.checkedInCount}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Biometric Verified:</span>
              <span className="text-cyan-300 font-bold text-base">{selectedFlight.biometricVerifiedCount}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Boarded Through E-Gate:</span>
              <span className="text-emerald-300 font-bold text-base">{selectedFlight.boardedCount}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Assigned Gate:</span>
              <span className="text-white font-bold text-base">{selectedFlight.gate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
