import React, { useState, useRef, useEffect } from 'react';
import { PassengerBooking, BiometricStationNode, UserRole } from '../types/index.ts';
import { 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Scan, 
  UserCheck, 
  FileText, 
  Lock, 
  Unlock, 
  Key, 
  Sparkles,
  Info
} from 'lucide-react';

interface BiometricVerificationStationProps {
  passengers: PassengerBooking[];
  stations: BiometricStationNode[];
  onUpdatePassenger: (passenger: PassengerBooking) => void;
  activeRole: UserRole;
  selectedAirport: string;
}

export const BiometricVerificationStation: React.FC<BiometricVerificationStationProps> = ({
  passengers,
  stations,
  onUpdatePassenger,
  activeRole,
  selectedAirport,
}) => {
  // Selected passenger for scanning
  const [selectedPnr, setSelectedPnr] = useState<string>(passengers[0]?.pnr || 'KQ9041');
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || 'st-lun-board-gate4b');
  
  // Camera feed mode: 'SIMULATOR' or 'LIVE_WEBCAM'
  const [cameraMode, setCameraMode] = useState<'SIMULATOR' | 'LIVE_WEBCAM'>('SIMULATOR');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scanning lifecycle state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    confidence: number;
    liveness: number;
    latencyMs: number;
    allPrerequisitesMet: boolean;
    ruleEnforced: string | null;
  } | null>(null);

  // Manual Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideBadge, setOverrideBadge] = useState('GA-8820');
  const [overrideReason, setOverrideReason] = useState('Physical biometric e-passport and paper boarding card validated by ground officer.');

  // AI Diagnostic
  const [aiReport, setAiReport] = useState<{ analysis: string; actionPlan: string[]; aiPowered: boolean } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Find active passenger
  const activePassenger = passengers.find(p => p.pnr.toUpperCase() === selectedPnr.toUpperCase()) || passengers[0];
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle webcam toggle
  const toggleWebcam = async () => {
    if (cameraMode === 'SIMULATOR') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsWebcamActive(true);
        setCameraMode('LIVE_WEBCAM');
      } catch (err) {
        console.warn('Webcam permission not granted or device unavailable, remaining in high-fidelity simulator mode', err);
        setCameraMode('SIMULATOR');
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsWebcamActive(false);
      setCameraMode('SIMULATOR');
    }
  };

  // Run Biometric Scan
  const handleTriggerScan = async () => {
    if (!activePassenger) return;
    setIsScanning(true);
    setScanProgress(10);
    setScanResult(null);
    setAiReport(null);

    // Realistic scan progress animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 40);

    try {
      const response = await fetch('/api/verify-biometric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pnr: activePassenger.pnr,
          stationId: activeStation.id,
        }),
      });

      const data = await response.json();
      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        if (data.passenger) {
          onUpdatePassenger(data.passenger);
        }
        setScanResult({
          success: data.matchPassed,
          confidence: data.confidence,
          liveness: data.liveness,
          latencyMs: data.latencyMs,
          allPrerequisitesMet: data.allPrerequisitesMet,
          ruleEnforced: data.ruleEnforced,
        });
      }, 150);
    } catch (err) {
      console.error('Scan error:', err);
      clearInterval(interval);
      setIsScanning(false);
    }
  };

  // Submit Manual Override
  const handleSubmitOverride = async () => {
    if (!activePassenger) return;
    try {
      const response = await fetch(`/api/passengers/${activePassenger.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'manualOverride',
          status: 'PASSED',
          agentRole: activeRole,
          reason: `Override by ${overrideBadge}: ${overrideReason}`,
        }),
      });
      const data = await response.json();
      if (data.passenger) {
        onUpdatePassenger(data.passenger);
      }
      setShowOverrideModal(false);
      setScanResult({
        success: true,
        confidence: 100,
        liveness: 100,
        latencyMs: 12,
        allPrerequisitesMet: true,
        ruleEnforced: null,
      });
    } catch (err) {
      console.error('Override error:', err);
    }
  };

  // Request AI Security Diagnostic
  const handleRequestAiDiagnostic = async () => {
    if (!activePassenger) return;
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/analyze-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pnr: activePassenger.pnr,
          confidence: activePassenger.biometricConfidence,
          stageFailed: activePassenger.identityStatus !== 'PASSED' ? 'IDENTITY' : 'CHECK_IN_OR_VISA',
          reason: activePassenger.agentNotes || 'Pending verification stage',
        }),
      });
      const data = await response.json();
      setAiReport(data);
    } catch (err) {
      console.error('AI diagnostic error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Station Header & Passenger Fast-Selector */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Scan className="w-4 h-4 text-cyan-400" />
            <span>AUTHORISED BIOMETRIC SCANNER INTERFACE · {selectedAirport}</span>
          </div>
          <h1 className="text-xl font-bold text-white">Live Passenger Identity Processing</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Test Scenario:</span>
            <select
              value={selectedPnr}
              onChange={(e) => {
                setSelectedPnr(e.target.value);
                setScanResult(null);
                setAiReport(null);
              }}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {passengers.map((p) => (
                <option key={p.pnr} value={p.pnr}>
                  {p.pnr} · {p.passengerName} ({p.flightNumber} - {p.gate})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Terminal Gate:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.stationType})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Scanner Workbench Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Biometric Camera Sensor & Optical MRZ Reader */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            {/* Camera Viewport Header */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>FEED: {activeStation.name} [{cameraMode}]</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  60 FPS · 1080p
                </span>

                <button
                  onClick={toggleWebcam}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                >
                  {cameraMode === 'SIMULATOR' ? 'Use Real Webcam' : 'Use Simulator'}
                </button>
              </div>
            </div>

            {/* Video / Simulator Viewport */}
            <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
              {cameraMode === 'LIVE_WEBCAM' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-radial from-slate-900 to-slate-950">
                  <img
                    src={activePassenger?.photoUrl || '/src/assets/images/passport_sample_specimen_1792308091166.jpg'}
                    alt="Passenger Biometric Face Subject"
                    className="w-56 h-56 object-cover rounded-xl border border-slate-800 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle 3D grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                </div>
              )}

              {/* Real-time Facial Landmark & HUD Bounding Overlay */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                {/* Top Corner Markers */}
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
                  <div className="text-right font-mono text-[11px] text-cyan-400/90 bg-slate-950/80 px-2 py-1 rounded border border-cyan-900/50">
                    <div>PUPIL_IPD: 64.2mm</div>
                    <div>IR_ILLUM: 850nm NOMINAL</div>
                  </div>
                  <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
                </div>

                {/* Central Biometric Scanning Reticle */}
                <div className="relative self-center w-64 h-64 border border-dashed border-cyan-400/40 rounded-2xl flex items-center justify-center">
                  {/* Active Scan Laser Sweeper */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scanline" />
                  )}

                  {/* Corner Targets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                  {/* Anti-spoofing micro-indicator */}
                  <div className="text-center font-mono text-[10px] text-cyan-300 bg-slate-950/70 px-2 py-0.5 rounded">
                    {isScanning ? `EXTRACTING VECTORS... ${scanProgress}%` : 'FACE LOCK ACQUIRED'}
                  </div>
                </div>

                {/* Bottom Corner Markers & Telemetry */}
                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
                  <div className="font-mono text-[11px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                    <div>LIVENESS: <span className="text-emerald-400 font-semibold">{activePassenger?.livenessConfidence || 98.7}%</span></div>
                    <div>MATCH_LATENCY: <span className="text-cyan-300 font-semibold">{activePassenger?.processingLatencyMs || 174} ms</span></div>
                  </div>
                  <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>
            </div>

            {/* Scanner Controls Bar */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <span>Hardware Bridge: </span>
                <span className="font-mono text-white font-medium">{activeStation.hardwareBridge}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerScan}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Processing...' : 'Run Biometric Match'}</span>
                </button>

                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agent Override</span>
                </button>
              </div>
            </div>
          </div>

          {/* ICAO Doc 9303 Optical MRZ Reader Specimen Box */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-200">ICAO 9303 MRZ Optical Specimen</span>
              <span className="font-mono text-emerald-400">NFC Chip Cryptogram: VALID</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1 overflow-x-auto">
              <div className="tracking-widest">{activePassenger?.mrzLine1}</div>
              <div className="tracking-widest">{activePassenger?.mrzLine2}</div>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Doc No: <span className="text-white">{activePassenger?.passportNumber}</span></span>
              <span>Nat: <span className="text-white">{activePassenger?.nationality}</span></span>
              <span>Exp: <span className="text-white">{activePassenger?.passportExpiry}</span></span>
              <span>DOB: <span className="text-white">{activePassenger?.dateOfBirth}</span></span>
            </div>
          </div>
        </div>

        {/* Right Column: 5-Stage Clearance Matrix & Strict Aviation Rule */}
        <div className="lg:col-span-6 space-y-4">
          {/* CRITICAL AVIATION PRINCIPLE WARNING BANNER */}
          <div className="p-4 rounded-xl border border-cyan-800/60 bg-gradient-to-r from-cyan-950/50 to-slate-900/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-white uppercase tracking-wide">
                  Aviation Gate Rule #1: State Separation
                </span>
                <p className="text-slate-300 leading-relaxed">
                  A successful identity check <strong className="text-cyan-300">never automatically guarantees permission to board</strong>. 
                  Boarding turnstiles only unlatch when Booking, Identity, Check-in seat allocation, Baggage clearance, and Border Security are all simultaneously satisfied.
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Identity Summary Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400">PNR: {activePassenger?.pnr}</span>
                <h2 className="text-lg font-bold text-white">{activePassenger?.passengerName}</h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {activePassenger?.airlineName} · {activePassenger?.flightNumber} · {activePassenger?.originAirport} → {activePassenger?.destinationAirport}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Seat Assignment</span>
                <div className={`font-mono font-bold text-base ${
                  activePassenger?.seat === 'UNASSIGNED' ? 'text-amber-400' : 'text-white'
                }`}>
                  {activePassenger?.seat}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Gate:</span>
                <span className="text-white font-medium">{activePassenger?.gate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Dep Time:</span>
                <span className="text-white font-medium">{activePassenger?.departureTime}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Bags:</span>
                <span className="text-white font-medium">
                  {activePassenger?.baggageCount} Tagged
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Visa:</span>
                <span className={`font-medium ${
                  activePassenger?.visaRequirement === 'NOT_REQUIRED' || activePassenger?.visaRequirement === 'VERIFIED_VALID'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}>
                  {activePassenger?.visaRequirement}
                </span>
              </div>
            </div>
          </div>

          {/* The 5-Stage Verification Matrix */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">5-Stage Clearance Matrix</h3>
              <span className="text-xs font-mono text-slate-400">Real-time gate logic</span>
            </div>

            <div className="space-y-2.5">
              {/* Stage 1: Booking */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">01</span>
                  <div>
                    <span className="font-semibold text-white">Booking Confirmation</span>
                    <p className="text-[11px] text-slate-400">Valid e-ticket in airline reservation inventory</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TICKETED</span>
                </div>
              </div>

              {/* Stage 2: Biometric Identity Match */}
              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                activePassenger?.identityStatus === 'PASSED'
                  ? 'border-emerald-900/60 bg-emerald-950/20'
                  : activePassenger?.identityStatus === 'FAILED'
                  ? 'border-rose-900/60 bg-rose-950/20'
                  : 'border-slate-800 bg-slate-950/70'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">02</span>
                  <div>
                    <span className="font-semibold text-white">Biometric Identity Verification</span>
                    <p className="text-[11px] text-slate-400">
                      Match Confidence: {activePassenger?.biometricConfidence}% · Liveness: {activePassenger?.livenessConfidence}%
                    </p>
                  </div>
                </div>
                <div className="font-mono font-semibold">
                  {activePassenger?.identityStatus === 'PASSED' && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> PASSED
                    </span>
                  )}
                  {activePassenger?.identityStatus === 'FAILED' && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> MISMATCH
                    </span>
                  )}
                  {activePassenger?.identityStatus === 'PENDING' && (
                    <span className="text-slate-400">PENDING SCAN</span>
                  )}
                </div>
              </div>

              {/* Stage 3: Check-in & Baggage */}
              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                activePassenger?.checkInStatus === 'PASSED'
                  ? 'border-emerald-900/60 bg-emerald-950/20'
                  : 'border-amber-900/60 bg-amber-950/20'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">03</span>
                  <div>
                    <span className="font-semibold text-white">Check-In & Baggage Tagging</span>
                    <p className="text-[11px] text-slate-400">
                      Seat: {activePassenger?.seat} · Hazmat Declared: {activePassenger?.dangerousGoodsDeclared ? 'YES' : 'NO'}
                    </p>
                  </div>
                </div>
                <div className="font-mono font-semibold">
                  {activePassenger?.checkInStatus === 'PASSED' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> COMPLETED
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> INCOMPLETE
                    </span>
                  )}
                </div>
              </div>

              {/* Stage 4: Border & Security */}
              <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                activePassenger?.securityStatus === 'PASSED' && activePassenger?.securityWatchlistFlag === 'NONE'
                  ? 'border-emerald-900/60 bg-emerald-950/20'
                  : 'border-amber-900/60 bg-amber-950/20'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">04</span>
                  <div>
                    <span className="font-semibold text-white">Security & Visa Clearance</span>
                    <p className="text-[11px] text-slate-400">
                      Watchlist: {activePassenger?.securityWatchlistFlag} · Visa: {activePassenger?.visaRequirement}
                    </p>
                  </div>
                </div>
                <div className="font-mono font-semibold">
                  {activePassenger?.securityStatus === 'PASSED' && activePassenger?.securityWatchlistFlag === 'NONE' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> CLEARED
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> INSPECT VISA
                    </span>
                  )}
                </div>
              </div>

              {/* Stage 5: Final Boarding Authorization */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                activePassenger?.boardingStatus === 'PASSED'
                  ? 'border-emerald-500 bg-emerald-950/40'
                  : 'border-amber-500/80 bg-amber-950/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    activePassenger?.boardingStatus === 'PASSED' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {activePassenger?.boardingStatus === 'PASSED' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400">STAGE 05: TURNSTILE DECISION</span>
                    <h4 className="text-base font-bold text-white">
                      {activePassenger?.boardingStatus === 'PASSED' ? 'BOARDING AUTHORIZED' : 'BOARDING WITHHELD'}
                    </h4>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className={`px-3 py-1.5 rounded font-bold uppercase ${
                    activePassenger?.boardingStatus === 'PASSED' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {activePassenger?.boardingStatus === 'PASSED' ? 'GATE UNLATCHED' : 'GATE LOCKED'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Security Diagnostics Trigger for Exceptions */}
            {activePassenger?.boardingStatus !== 'PASSED' && (
              <div className="pt-2">
                <button
                  onClick={handleRequestAiDiagnostic}
                  disabled={isLoadingAi}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoadingAi ? 'Consulting Aviation Security Diagnostic...' : 'Analyze Exception & ICAO 9303 Compliance with AI'}</span>
                </button>
              </div>
            )}

            {/* AI Report Card */}
            {aiReport && (
              <div className="p-4 rounded-lg border border-cyan-900/60 bg-cyan-950/30 text-xs space-y-2">
                <div className="flex items-center justify-between text-cyan-400 font-mono text-[11px]">
                  <span>AI TECHNICAL EXCEPTION REPORT</span>
                  <span>{aiReport.aiPowered ? 'Gemini 3.8 Flash' : 'Rule Engine Engine'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{aiReport.analysis}</p>
                <div className="pt-2 border-t border-cyan-900/40 space-y-1">
                  <span className="font-semibold text-white">Ground Agent Protocol:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {aiReport.actionPlan.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Key className="w-4 h-4" />
                <span>Authorised Gate Agent Manual Override</span>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Issuing an override will manually unlock turnstile gate for <strong className="text-white">{activePassenger?.passengerName}</strong> (PNR: {activePassenger?.pnr}). 
              This event is cryptographically sealed in the immutable airport audit vault.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Officer Badge ID</label>
                <input
                  type="text"
                  value={overrideBadge}
                  onChange={(e) => setOverrideBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Justification / Physical Verification</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOverride}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Confirm & Unlock Turnstile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
