import React, { useState } from 'react';
import { PassengerBooking, PassengerCorrectionRequest } from '../types/index.ts';
import { 
  User, 
  ShieldCheck, 
  Search, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Edit3, 
  FileText,
  Info
} from 'lucide-react';

interface PassengerPortalViewProps {
  passengers: PassengerBooking[];
  correctionRequests: PassengerCorrectionRequest[];
  onSubmitCorrection: (req: Partial<PassengerCorrectionRequest>) => void;
}

export const PassengerPortalView: React.FC<PassengerPortalViewProps> = ({
  passengers,
  correctionRequests,
  onSubmitCorrection,
}) => {
  const [pnrSearch, setPnrSearch] = useState('ZB1084');
  const [activePassenger, setActivePassenger] = useState<PassengerBooking | null>(
    passengers.find(p => p.pnr === 'ZB1084') || passengers[0]
  );

  // Correction form state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [fieldRequested, setFieldRequested] = useState('Passport Expiration Date');
  const [requestedValue, setRequestedValue] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [optOutNotice, setOptOutNotice] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = passengers.find(p => p.pnr.toUpperCase() === pnrSearch.trim().toUpperCase());
    setActivePassenger(found || null);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePassenger || !requestedValue) return;

    onSubmitCorrection({
      pnr: activePassenger.pnr,
      passengerName: activePassenger.passengerName,
      fieldRequested,
      currentValue: fieldRequested === 'Passport Expiration Date' ? activePassenger.passportExpiry : activePassenger.seat,
      requestedValue,
    });

    setRequestedValue('');
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowCorrectionModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <User className="w-4 h-4" />
            <span>PASSENGER SELF-SERVICE PRIVACY & CLEARANCE PORTAL</span>
          </div>
          <h1 className="text-2xl font-bold text-white">My Travel Identity & Boarding Status</h1>
          <p className="text-xs text-slate-300 mt-1">
            Review your biometric verification state, manage privacy consent, or request correction of travel records under international data protection laws.
          </p>
        </div>

        {/* PNR Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md pt-2">
          <input
            type="text"
            placeholder="Enter your 6-character PNR (e.g. ZB1084)"
            value={pnrSearch}
            onChange={(e) => setPnrSearch(e.target.value.toUpperCase())}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 uppercase"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Find My Journey
          </button>
        </form>
      </div>

      {activePassenger ? (
        <div className="space-y-6">
          {/* Passenger Status Docket */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400">BOOKING REFERENCE: {activePassenger.pnr}</span>
                <h2 className="text-xl font-bold text-white">{activePassenger.passengerName}</h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {activePassenger.airlineName} ({activePassenger.flightNumber}) · Seat: <strong className="text-white">{activePassenger.seat}</strong> · Gate: <strong className="text-cyan-300">{activePassenger.gate}</strong>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                  activePassenger.boardingStatus === 'PASSED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {activePassenger.boardingStatus === 'PASSED' ? 'BOARDING CLEARED' : 'PENDING STAGE COMPLETION'}
                </span>
              </div>
            </div>

            {/* 5 Stages from Passenger Perspective */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono">Your Journey Stages</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>1. Ticket Confirmation</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>2. Facial Identity Match</span>
                  <span className={`font-mono font-semibold flex items-center gap-1 ${
                    activePassenger.identityStatus === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {activePassenger.identityStatus === 'PASSED' ? 'Verified (Sub-200ms)' : 'Pending Scanner'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>3. Seat & Luggage Check-in</span>
                  <span className={`font-mono font-semibold flex items-center gap-1 ${
                    activePassenger.checkInStatus === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {activePassenger.checkInStatus === 'PASSED' ? 'Completed' : 'Seat Pending'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>4. Visa & Border Clearance</span>
                  <span className={`font-mono font-semibold flex items-center gap-1 ${
                    activePassenger.securityStatus === 'PASSED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {activePassenger.securityStatus === 'PASSED' ? 'Cleared' : 'Document Check'}
                  </span>
                </div>
              </div>
            </div>

            {/* Alternative Verification & Correction Controls */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Request Data Correction</span>
              </button>

              <button
                onClick={() => setOptOutNotice(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
              >
                Opt Out / Manual Physical Check
              </button>
            </div>

            {optOutNotice && (
              <div className="p-3.5 rounded-lg border border-cyan-800/80 bg-cyan-950/40 text-xs font-mono text-cyan-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Manual Physical Verification Selected</span>
                    <span>An airport ground agent at your gate has been alerted to conduct a standard physical passport inspection and verify your printed or mobile boarding barcode.</span>
                  </div>
                </div>
                <button 
                  onClick={() => setOptOutNotice(false)} 
                  className="text-slate-400 hover:text-white shrink-0 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Privacy Consent & GDPR / POPIA Compliance Summary */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Passenger Privacy Notice & Legal Rights</span>
            </div>
            <p className="text-slate-300">
              FaceFly AI acts as a data processor on behalf of your carrier ({activePassenger.airlineName}). 
              In compliance with the Zambian Data Protection Act (2021), GDPR (Regulation 2016/679), and POPIA, 
              no photographs or images of your face are stored after your flight. Biometric mathematical hashes are 
              automatically wiped 120 minutes post-departure.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-400 text-xs">
          No passenger booking found for reference "{pnrSearch}". Please check your booking confirmation.
        </div>
      )}

      {/* Data Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitRequest} className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Passenger Data Correction Request</h3>
              <button type="button" onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Under international privacy rights, you may request correction of inaccurate booking or passport records.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Field Requiring Correction</label>
                <select
                  value={fieldRequested}
                  onChange={(e) => setFieldRequested(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Passport Expiration Date">Passport Expiration Date</option>
                  <option value="Seat Assignment">Seat Preference / Assignment</option>
                  <option value="Spelling of Name">Spelling of Name (Minor correction)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Correct Value</label>
                <input
                  type="text"
                  required
                  placeholder="Enter accurate information"
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs"
                />
              </div>
            </div>

            {submitSuccess && (
              <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Correction request submitted to carrier dispatch</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono uppercase"
              >
                Submit Correction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
