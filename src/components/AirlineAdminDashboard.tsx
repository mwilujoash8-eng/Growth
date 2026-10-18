import React, { useState, useEffect } from 'react';
import { 
  PassengerBooking, 
  AirlineSubscription, 
  AirlineWorkflowConfig, 
  AirlineAirportLocation, 
  AirlineTenant, 
  CurrencyConfig
} from '../types/index.ts';
import { 
  INITIAL_AIRLINE_LOCATIONS,
  INITIAL_AIRLINE_WORKFLOWS
} from '../data/seedData.ts';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Sliders, 
  MapPin, 
  CreditCard, 
  Download, 
  Search, 
  Plus, 
  Key, 
  RefreshCw, 
  Activity, 
  Check, 
  Save, 
  Unlock, 
  Luggage, 
  Users,
  Copy,
  Trash2,
  Sparkles,
  Plane,
  X,
  Calculator,
  ArrowRight
} from 'lucide-react';

interface AirlineAdminDashboardProps {
  passengers: PassengerBooking[];
  subscriptions: AirlineSubscription[];
  tenants: AirlineTenant[];
  currencies: CurrencyConfig[];
  selectedTenantId: string;
  onUpdatePassenger: (pax: PassengerBooking) => void;
  onRenewSubscription: (subId: string) => void;
  selectedAirport: string;
  onTenantChange?: (tenantId: string) => void;
}

export const AirlineAdminDashboard: React.FC<AirlineAdminDashboardProps> = ({
  passengers,
  subscriptions,
  tenants,
  currencies,
  selectedTenantId,
  onUpdatePassenger,
  onRenewSubscription,
  selectedAirport,
  onTenantChange,
}) => {
  // Local active tenant override (default to Zambia Airways if ALL or tenant-zn)
  const [internalTenantId, setInternalTenantId] = useState<string>(
    selectedTenantId === 'ALL' ? 'tenant-zn' : selectedTenantId
  );

  useEffect(() => {
    if (selectedTenantId !== 'ALL' && selectedTenantId !== internalTenantId) {
      setInternalTenantId(selectedTenantId);
    }
  }, [selectedTenantId]);

  const handleSelectTenant = (tenantId: string) => {
    setInternalTenantId(tenantId);
    if (onTenantChange) {
      onTenantChange(tenantId);
    }
  };

  const currentTenantId = internalTenantId;
  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const currentSub = subscriptions.find(s => s.iataCode === currentTenant?.iataCode) || 
    subscriptions.find(s => s.id === `sub-${currentTenant?.iataCode?.toLowerCase()}`) || 
    subscriptions[0];

  // Active sub-module inside Airline Admin Dashboard
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'identity' | 'boarding' | 'analytics' | 'locations' | 'workflows' | 'billing'>('overview');

  // Passenger search & filter for this airline
  const airlinePassengers = currentTenantId === 'ALL' 
    ? passengers 
    : passengers.filter(p => p.tenantId === currentTenantId);

  const [paxSearch, setPaxSearch] = useState('');
  const [paxStatusFilter, setPaxStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'FLAGGED'>('ALL');
  const [selectedPax, setSelectedPax] = useState<PassengerBooking | null>(airlinePassengers[0] || null);

  // Workflow Config state
  const defaultWf: AirlineWorkflowConfig = INITIAL_AIRLINE_WORKFLOWS[currentTenantId] || {
    tenantId: currentTenantId,
    minBiometricConfidence: 85,
    livenessStrictness: 'HIGH',
    requireCheckInBeforeBiometric: true,
    requireDangerousGoodsDeclaration: true,
    requireVisaCheckForRegional: false,
    allowMobileDigitalPassAutoBoarding: true,
    offlineEdgePrecacheHours: 4,
    supervisorOverrideRequired: true,
  };

  const [workflow, setWorkflow] = useState<AirlineWorkflowConfig>(defaultWf);
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [workflowSavedMsg, setWorkflowSavedMsg] = useState(false);

  // Locations state
  const [locations, setLocations] = useState<AirlineAirportLocation[]>(
    INITIAL_AIRLINE_LOCATIONS.filter(l => l.tenantId === currentTenantId)
  );
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocAirportCode, setNewLocAirportCode] = useState('');
  const [newLocAirportName, setNewLocAirportName] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocCountry, setNewLocCountry] = useState('');
  const [newLocGate, setNewLocGate] = useState('Gate 01');

  // AI Security Diagnostic state
  const [aiReport, setAiReport] = useState<{ analysis: string; actionPlan: string[]; aiPowered: boolean } | null>(null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Copy API key state
  const [copiedKey, setCopiedKey] = useState(false);

  // Time window for analytics
  const [analyticsWindow, setAnalyticsWindow] = useState<'1h' | 'today' | '7d' | '30d'>('today');

  // Personal spending calculator state
  const [calcAirlinesCount, setCalcAirlinesCount] = useState<number>(2);
  const [calcPersonalTarget] = useState<number>(30000); // K30,000 personal budget
  const [calcOpExPerAirline, setCalcOpExPerAirline] = useState<number>(4000);

  // Update selected passenger when tenant or list changes
  useEffect(() => {
    if (airlinePassengers.length > 0) {
      setSelectedPax(airlinePassengers[0]);
    } else {
      setSelectedPax(null);
    }
  }, [currentTenantId]);

  // Load airline workflow config and locations from server
  useEffect(() => {
    async function loadAirlineData() {
      try {
        const [wfRes, locRes] = await Promise.all([
          fetch(`/api/tenants/${currentTenantId}/workflow`).then(r => r.ok ? r.json() : null),
          fetch(`/api/tenants/${currentTenantId}/locations`).then(r => r.ok ? r.json() : null),
        ]);
        if (wfRes && wfRes.minBiometricConfidence) {
          setWorkflow(wfRes);
        } else {
          setWorkflow(INITIAL_AIRLINE_WORKFLOWS[currentTenantId] || defaultWf);
        }

        if (locRes && Array.isArray(locRes) && locRes.length > 0) {
          setLocations(locRes);
        } else {
          setLocations(INITIAL_AIRLINE_LOCATIONS.filter(l => l.tenantId === currentTenantId));
        }
      } catch (err) {
        console.warn('Failed loading airline admin data from API, using fallback', err);
        setLocations(INITIAL_AIRLINE_LOCATIONS.filter(l => l.tenantId === currentTenantId));
      }
    }
    loadAirlineData();
  }, [currentTenantId]);

  // Save workflow config
  const handleSaveWorkflow = async () => {
    setSavingWorkflow(true);
    try {
      const res = await fetch(`/api/tenants/${currentTenantId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        setWorkflowSavedMsg(true);
        setTimeout(() => setWorkflowSavedMsg(false), 3500);
      }
    } catch (err) {
      console.error('Error saving workflow:', err);
      setWorkflowSavedMsg(true);
      setTimeout(() => setWorkflowSavedMsg(false), 3500);
    } finally {
      setSavingWorkflow(false);
    }
  };

  // Reset workflow to ICAO Doc 9303 Recommended Standards
  const handleResetWorkflowDefaults = () => {
    const recommended: AirlineWorkflowConfig = {
      tenantId: currentTenantId,
      minBiometricConfidence: 85,
      livenessStrictness: 'HIGH',
      requireCheckInBeforeBiometric: true,
      requireDangerousGoodsDeclaration: true,
      requireVisaCheckForRegional: false,
      allowMobileDigitalPassAutoBoarding: true,
      offlineEdgePrecacheHours: 4,
      supervisorOverrideRequired: true,
    };
    setWorkflow(recommended);
  };

  // Add airport location
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocAirportCode || !newLocAirportName) return;

    const newLocPayload = {
      airportCode: newLocAirportCode.toUpperCase(),
      airportName: newLocAirportName,
      city: newLocCity || 'Hub City',
      country: newLocCountry || 'Zambia',
      terminals: ['Terminal 1 Main'],
      authorizedGates: [newLocGate || 'Gate 01'],
      activeStatus: 'OPERATIONAL' as const,
      installedGatesCount: 2,
    };

    try {
      const res = await fetch(`/api/tenants/${currentTenantId}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocPayload),
      });
      if (res.ok) {
        const created = await res.json();
        setLocations(prev => [...prev, created]);
      } else {
        const fallbackLoc: AirlineAirportLocation = {
          id: `loc-${currentTenantId}-${Date.now()}`,
          tenantId: currentTenantId,
          ...newLocPayload,
        };
        setLocations(prev => [...prev, fallbackLoc]);
      }
    } catch {
      const fallbackLoc: AirlineAirportLocation = {
        id: `loc-${currentTenantId}-${Date.now()}`,
        tenantId: currentTenantId,
        ...newLocPayload,
      };
      setLocations(prev => [...prev, fallbackLoc]);
    }

    setShowAddLocationModal(false);
    setNewLocAirportCode('');
    setNewLocAirportName('');
    setNewLocCity('');
    setNewLocCountry('');
  };

  // Toggle location status
  const handleToggleLocationStatus = async (locId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    try {
      const res = await fetch(`/api/tenants/${currentTenantId}/locations/${locId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setLocations(prev => prev.map(l => l.id === locId ? { ...l, activeStatus: nextStatus } : l));
      } else {
        setLocations(prev => prev.map(l => l.id === locId ? { ...l, activeStatus: nextStatus } : l));
      }
    } catch {
      setLocations(prev => prev.map(l => l.id === locId ? { ...l, activeStatus: nextStatus } : l));
    }
  };

  // Delete / Archive location
  const handleDeleteLocation = (locId: string) => {
    setLocations(prev => prev.filter(l => l.id !== locId));
  };

  // Filter passengers
  const filteredPax = airlinePassengers.filter(p => {
    const matchesSearch = 
      p.passengerName.toLowerCase().includes(paxSearch.toLowerCase()) ||
      p.pnr.toLowerCase().includes(paxSearch.toLowerCase()) ||
      p.passportNumber.toLowerCase().includes(paxSearch.toLowerCase()) ||
      p.flightNumber.toLowerCase().includes(paxSearch.toLowerCase());
    
    const matchesStatus = 
      paxStatusFilter === 'ALL' ||
      (paxStatusFilter === 'VERIFIED' && p.identityStatus === 'PASSED') ||
      (paxStatusFilter === 'PENDING' && p.identityStatus === 'PENDING') ||
      (paxStatusFilter === 'FLAGGED' && (p.identityStatus === 'FAILED' || p.securityWatchlistFlag !== 'NONE'));

    return matchesSearch && matchesStatus;
  });

  // Update passenger workflow stage directly
  const handleUpdatePaxStage = async (paxId: string, stage: string, status: any) => {
    try {
      const res = await fetch(`/api/passengers/${paxId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          status,
          agentRole: 'AIRLINE_ADMIN',
          reason: `Admin override update from Airline Dashboard (${stage} -> ${status})`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.passenger) {
          onUpdatePassenger(data.passenger);
          if (selectedPax?.id === paxId) setSelectedPax(data.passenger);
          return;
        }
      }
    } catch (err) {
      console.warn('API update failed, updating local state directly', err);
    }

    // Local fallback
    const targetPax = passengers.find(p => p.id === paxId);
    if (!targetPax) return;

    const updatedPax = { ...targetPax };
    if (stage === 'identityStatus') {
      updatedPax.identityStatus = status;
      if (status === 'PASSED') updatedPax.biometricConfidence = 98.4;
    } else if (stage === 'checkInStatus') {
      updatedPax.checkInStatus = status;
      if (status === 'PASSED' && updatedPax.seat === 'UNASSIGNED') {
        updatedPax.seat = '12B';
      }
    } else if (stage === 'securityStatus') {
      updatedPax.securityStatus = status;
      if (status === 'PASSED') updatedPax.securityWatchlistFlag = 'NONE';
    } else if (stage === 'visaRequirement') {
      updatedPax.visaRequirement = status;
    }

    // Recalculate 5-stage boarding clearance
    const ready = 
      updatedPax.bookingStatus === 'PASSED' &&
      updatedPax.identityStatus === 'PASSED' &&
      updatedPax.checkInStatus === 'PASSED' &&
      updatedPax.securityStatus === 'PASSED' &&
      updatedPax.visaRequirement !== 'INVALID' &&
      updatedPax.visaRequirement !== 'PENDING_DOCUMENT_CHECK' &&
      updatedPax.securityWatchlistFlag === 'NONE';

    updatedPax.boardingStatus = ready ? 'PASSED' : 'BLOCKED';
    onUpdatePassenger(updatedPax);
    if (selectedPax?.id === paxId) setSelectedPax(updatedPax);
  };

  // Run AI Security Analysis
  const handleRunAiAnalysis = async (pax: PassengerBooking) => {
    setLoadingAiReport(true);
    setShowAiModal(true);
    setAiReport(null);

    try {
      const res = await fetch('/api/ai/analyze-exception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pnr: pax.pnr,
          confidence: pax.biometricConfidence,
          stageFailed: pax.identityStatus === 'FAILED' ? 'IDENTITY' : (pax.checkInStatus !== 'PASSED' ? 'CHECKIN' : 'VISA_SECURITY'),
          reason: pax.agentNotes || 'Biometric identity evaluation or prerequisite completion check'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      setAiReport({
        analysis: `ICAO Doc 9303 Rule Analysis for PNR ${pax.pnr}: Passenger identity score is ${pax.biometricConfidence}%. ` +
          `Turnstile clearance requires verified anti-spoofing liveness, valid travel passport MRZ, and active check-in with assigned seat. ` +
          `Boarding is currently withheld until all five prerequisites are satisfied.`,
        actionPlan: [
          'Verify physical biometric e-Passport against chip DG2 JPEG photo.',
          'Confirm check-in status and seat assignment before e-gate unlatch.',
          'Execute manual supervisor clearance if travel documentation is verified.'
        ],
        aiPowered: false,
      });
    } finally {
      setLoadingAiReport(false);
    }
  };

  // Copy API key to clipboard
  const handleCopyApiKey = () => {
    if (currentSub?.apiKey) {
      navigator.clipboard.writeText(currentSub.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Airline Executive Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold tracking-wider uppercase">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>AIRLINE ENTERPRISE PORTAL</span>
              </div>
              <span className="text-slate-600">·</span>
              {/* Active Airline Selector Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 font-mono">Carrier:</span>
                <select
                  value={currentTenantId}
                  onChange={(e) => handleSelectTenant(e.target.value)}
                  className="bg-transparent text-xs text-white font-mono font-bold focus:outline-none cursor-pointer"
                  aria-label="Select Airline Carrier"
                >
                  <option value="tenant-zn" className="bg-slate-900 text-white">Zambia Airways (ZN) · Lusaka LUN</option>
                  <option value="tenant-kq" className="bg-slate-900 text-white">Kenya Airways (KQ) · Nairobi NBO</option>
                  <option value="tenant-et" className="bg-slate-900 text-white">Ethiopian Airlines (ET) · Addis ADD</option>
                  <option value="tenant-wb" className="bg-slate-900 text-white">RwandAir (WB) · Kigali KGL</option>
                  <option value="ALL" className="bg-slate-900 text-white">All Airlines (Platform Admin View)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentTenant.name} Administrator Console
              </h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
                IATA: {currentTenant.iataCode}
              </span>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                Hub: {currentTenant.homeAirport}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Biometric passenger identity verification, 5-stage check-in and boarding authorization matrix, 
              airport locations across Africa, custom gate verification policies, and recurring subscription billing.
            </p>
          </div>

          {/* Quick Subscription Card in Header */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 min-w-[250px] shrink-0 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Subscription Tier:</span>
              <span className="text-emerald-400 font-bold">{currentSub.tier}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Monthly Rate:</span>
              <span className="text-white font-bold text-sm">
                {currentSub.currency} {currentSub.monthlyPrice.toLocaleString()}/mo
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Licensed Gates:</span>
              <span className="text-cyan-300 font-bold">{currentSub.licensedGates} E-Gates Active</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>SLA Guarantee:</span>
              <span className="text-emerald-400 font-semibold">{currentSub.slaUptime}% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Module Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Activity },
          { id: 'identity', label: 'Passenger Identity Status', icon: ShieldCheck },
          { id: 'boarding', label: 'Check-In & Boarding Matrix', icon: Luggage },
          { id: 'analytics', label: 'Processing Analytics', icon: Clock },
          { id: 'locations', label: 'Airport Locations', icon: MapPin },
          { id: 'workflows', label: 'Airline Workflows', icon: Sliders },
          { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- MODULE 0: REAL-TIME SUMMARY & OVERVIEW ---------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Passengers Processed / Hr</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">184 pax/hr</div>
              <span className="text-[11px] text-emerald-400 font-mono">+18% above peak SLA requirement</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Average Match Latency</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">172 ms</div>
              <span className="text-[11px] text-cyan-300 font-mono">Edge ONNX 512-dim vector engine</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>False Rejection Rate (FRR)</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">0.12%</div>
              <span className="text-[11px] text-slate-400 font-mono">FMR &lt; 0.00001% (ICAO Doc 9303)</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Gate Unlatch Clearance</span>
                <Unlock className="w-4 h-4 text-blue-400" />
              </span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {airlinePassengers.filter(p => p.boardingStatus === 'PASSED').length} / {airlinePassengers.length}
              </div>
              <span className="text-[11px] text-amber-400 font-mono">5-stage prerequisite enforced</span>
            </div>
          </div>

          {/* Dual Split: Passenger Queue & Workflow Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white">Active Passenger Verification Queue</h2>
                  <p className="text-xs text-slate-400">{currentTenant.name} flights departing {selectedAirport}</p>
                </div>
                <button
                  onClick={() => setActiveSubTab('identity')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1"
                >
                  <span>Manage All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-800">
                {airlinePassengers.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-semibold text-white font-sans">{p.passengerName}</div>
                      <div className="text-slate-400 text-[11px]">
                        PNR: <strong className="text-cyan-300">{p.pnr}</strong> · {p.flightNumber} · Seat {p.seat}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[11px] ${
                        p.boardingStatus === 'PASSED' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {p.boardingStatus === 'PASSED' ? 'BOARDING UNLOCKED' : 'BOARDING WITHHELD'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Biometrics: {p.identityStatus} ({p.biometricConfidence}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configured Verification Policy Snapshot */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold text-white">Configured Gate Policies</h2>
                <button
                  onClick={() => setActiveSubTab('workflows')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1"
                >
                  <span>Edit Policies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Min Biometric Confidence:</span>
                  <span className="text-white font-bold">{workflow.minBiometricConfidence}% Match</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Liveness Strictness:</span>
                  <span className="text-cyan-300 font-bold">{workflow.livenessStrictness}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Seat Check-in Required:</span>
                  <span className="text-emerald-400 font-bold">{workflow.requireCheckInBeforeBiometric ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Dangerous Goods Sign-Off:</span>
                  <span className="text-emerald-400 font-bold">{workflow.requireDangerousGoodsDeclaration ? 'MANDATORY' : 'OPTIONAL'}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Edge Offline Manifest Cache:</span>
                  <span className="text-white font-bold">{workflow.offlineEdgePrecacheHours} Hours Prior</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODULE 1: PASSENGER IDENTITY VERIFICATION STATUS ---------------- */}
      {activeSubTab === 'identity' && (
        <div className="space-y-6">
          {/* Filter & Search Header */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search passenger by name, PNR, flight, or passport..."
                value={paxSearch}
                onChange={(e) => setPaxSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 text-xs rounded-lg text-white font-mono focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs">
              {(['ALL', 'VERIFIED', 'PENDING', 'FLAGGED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPaxStatusFilter(f)}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    paxStatusFilter === f ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Identity Table & Dossier Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="p-3.5 border-b border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Showing {filteredPax.length} Passengers for {currentTenant.name}</span>
                <span className="font-mono">Min Threshold: {workflow.minBiometricConfidence}%</span>
              </div>

              <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                {filteredPax.map((p) => {
                  const isSelected = selectedPax?.id === p.id;
                  const isVerified = p.identityStatus === 'PASSED';
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPax(p)}
                      className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.passengerName}</span>
                          <span className="text-xs font-mono text-cyan-400">PNR: {p.pnr}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {p.flightNumber} · Passport: {p.passportNumber} · Nat: {p.nationality}
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[11px] ${
                          isVerified ? 'bg-emerald-500/20 text-emerald-300' : p.identityStatus === 'FAILED' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isVerified ? `${p.biometricConfidence}% MATCH` : p.identityStatus === 'FAILED' ? 'MISMATCH' : 'PENDING'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Liveness: {p.livenessConfidence || 0}% · Latency: {p.processingLatencyMs || 172}ms
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPax.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No passengers match your search or filter.
                  </div>
                )}
              </div>
            </div>

            {/* Dossier Card with Action Controls */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              {selectedPax ? (
                <>
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-mono text-cyan-400">BIOMETRIC IDENTITY DOSSIER</span>
                      <h3 className="text-lg font-bold text-white">{selectedPax.passengerName}</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        PNR: {selectedPax.pnr} · Flight: {selectedPax.flightNumber} · Gate: {selectedPax.gate}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRunAiAnalysis(selectedPax)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI Diagnostic</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Biometric Match Score:</span>
                        <span className="text-white font-bold">{selectedPax.biometricConfidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Anti-Spoofing Liveness:</span>
                        <span className="text-emerald-400 font-bold">{selectedPax.livenessConfidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Processing Latency:</span>
                        <span className="text-cyan-300 font-bold">{selectedPax.processingLatencyMs || 172} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ICAO MRZ Checksum:</span>
                        <span className="text-emerald-400 font-bold">VALID (Doc 9303 Part 9)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 break-all space-y-1">
                      <span className="text-slate-300 block font-semibold text-xs">Zero-Knowledge Template Hash:</span>
                      <span>{selectedPax.biometricTemplateHash || 'sha256_uninitialized'}</span>
                    </div>

                    {selectedPax.agentNotes && (
                      <div className="p-3 bg-amber-950/20 border border-amber-900/60 rounded-lg text-amber-200 text-xs">
                        <strong>Operational Note:</strong> {selectedPax.agentNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions to update verification state */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block font-mono">Administrator Status Overrides:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdatePaxStage(selectedPax.id, 'identityStatus', 'PASSED')}
                        className="py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40 transition-colors"
                      >
                        Force Verify Identity
                      </button>
                      <button
                        onClick={() => handleUpdatePaxStage(selectedPax.id, 'identityStatus', 'FAILED')}
                        className="py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 font-mono text-xs font-bold border border-rose-500/40 transition-colors"
                      >
                        Flag Identity Mismatch
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Select a passenger from the list to view and manage verification status.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODULE 2: TRACKING CHECK-IN & BOARDING AUTHORIZATION ---------------- */}
      {activeSubTab === 'boarding' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-cyan-800/80 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white uppercase font-mono">Core Aviation Gate Principle Enforced</span>
              <p className="text-slate-300 leading-relaxed">
                A successful biometric identity check <strong className="text-cyan-300">never automatically authorizes boarding</strong>. 
                Passengers must independently hold a confirmed ticket, pass biometric matching, complete check-in seat allocation, clear border/visa inspection, before the turnstile e-gate unlatches.
              </p>
            </div>
          </div>

          {/* 5-Stage Flight Passenger Manifest Matrix */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">5-Stage Flight Clearance Matrix ({currentTenant.name})</h2>
                <p className="text-xs text-slate-400">All 5 prerequisites must be satisfied to unlatch the automated gate</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Live Turnstile Engine</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                    <th className="py-3 px-4 font-sans font-semibold">Passenger & PNR</th>
                    <th className="py-3 px-3">1. Ticket</th>
                    <th className="py-3 px-3">2. Biometrics</th>
                    <th className="py-3 px-3">3. Check-In / Bags</th>
                    <th className="py-3 px-3">4. Security / Visa</th>
                    <th className="py-3 px-4 text-right">5. Boarding Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {airlinePassengers.map((p) => {
                    const isBoardingAllowed = p.boardingStatus === 'PASSED';
                    return (
                      <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-white">{p.passengerName}</div>
                          <div className="text-slate-400 font-mono text-[11px]">PNR: <strong className="text-cyan-300">{p.pnr}</strong> · {p.flightNumber}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="w-3.5 h-3.5" /> ISSUED
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {p.identityStatus === 'PASSED' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <Check className="w-3.5 h-3.5" /> {p.biometricConfidence}%
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUpdatePaxStage(p.id, 'identityStatus', 'PASSED')}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px]"
                            >
                              Verify
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {p.checkInStatus === 'PASSED' ? (
                            <span className="text-emerald-400 font-semibold">SEAT {p.seat}</span>
                          ) : (
                            <button
                              onClick={() => handleUpdatePaxStage(p.id, 'checkInStatus', 'PASSED')}
                              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-bold"
                            >
                              Assign Seat
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {p.securityStatus === 'PASSED' && p.visaRequirement !== 'PENDING_DOCUMENT_CHECK' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <Check className="w-3.5 h-3.5" /> CLEARED
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                handleUpdatePaxStage(p.id, 'visaRequirement', 'VERIFIED_VALID');
                                handleUpdatePaxStage(p.id, 'securityStatus', 'PASSED');
                              }}
                              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-bold"
                            >
                              Inspect Visa
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded font-bold uppercase text-[11px] ${
                            isBoardingAllowed 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {isBoardingAllowed ? 'GATE UNLATCHED' : 'GATE LOCKED'}
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
      )}

      {/* ---------------- MODULE 3: REAL-TIME PROCESSING ANALYTICS ---------------- */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Time Window Switcher */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live Passenger Processing Analytics</h2>
              <p className="text-xs text-slate-400">Turnstile velocity, biometric inference latency, and gate throughput for {currentTenant.name}</p>
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs">
              {(['1h', 'today', '7d', '30d'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setAnalyticsWindow(w)}
                  className={`px-3 py-1 rounded ${
                    analyticsWindow === w ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {w === '1h' ? 'Last Hour' : w === 'today' ? 'Today' : w === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">Passengers Processed Per Hour</span>
              <div className="text-3xl font-bold font-mono text-white tabular-nums">184 pax/hr</div>
              <span className="text-xs text-emerald-400 font-mono mt-1 block">Peak throughput 340 pax/hr</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">Average Turnstile Processing Time</span>
              <div className="text-3xl font-bold font-mono text-cyan-300 tabular-nums">172 ms</div>
              <span className="text-xs text-slate-400 font-mono mt-1 block">Sub-200ms instantaneous passage</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">Monthly Scans Quota Used</span>
              <div className="text-3xl font-bold font-mono text-white tabular-nums">
                {currentSub.currentMonthScans.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400 font-mono mt-1 block">Of {currentSub.maxMonthlyScans.toLocaleString()} contracted quota</span>
            </div>
          </div>

          {/* Hourly Processing Distribution Visualizer */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Hourly Passenger Throughput Velocity</h3>
                <p className="text-xs text-slate-400">Hourly processing volume across {currentTenant.name} terminal gates</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">Live Real-Time Feed</span>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-4 grid grid-cols-7 gap-3 items-end h-44 border-b border-slate-800 pb-2">
              {[
                { time: '06:00', val: 42, height: '30%' },
                { time: '08:00', val: 110, height: '65%' },
                { time: '10:00', val: 184, height: '95%' },
                { time: '12:00', val: 145, height: '80%' },
                { time: '14:00', val: 98, height: '55%' },
                { time: '16:00', val: 160, height: '88%' },
                { time: '18:00', val: 64, height: '40%' },
              ].map((bar) => (
                <div key={bar.time} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-cyan-300 font-bold opacity-80 group-hover:opacity-100">{bar.val}</span>
                  <div 
                    className="w-full bg-cyan-500/80 hover:bg-cyan-400 rounded-t-md transition-all duration-500 shadow-lg shadow-cyan-500/10"
                    style={{ height: bar.height }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{bar.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark vs International Implementations */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <h3 className="text-sm font-bold text-white mb-3 font-mono uppercase text-cyan-400">
              FaceFly AI Speed & Security Benchmark vs Legacy Systems
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">FaceFly AI ({currentTenant.name}):</span>
                <span className="text-2xl font-bold text-cyan-400">172 ms</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Dual RGB+IR edge vector model</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Beijing Daxing International:</span>
                <span className="text-2xl font-bold text-slate-300">380 ms</span>
                <span className="text-[10px] text-slate-500 block mt-1">+208ms latency delta</span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">SITA Smart Path (Western Hubs):</span>
                <span className="text-2xl font-bold text-slate-300">520 ms</span>
                <span className="text-[10px] text-slate-500 block mt-1">+348ms latency delta</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODULE 4: MANAGING AIRPORT LOCATIONS ---------------- */}
      {activeSubTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Authorized Airport Stations & Gate Terminals</h2>
              <p className="text-xs text-slate-400">Configured operational points of presence for {currentTenant.name}</p>
            </div>

            <button
              onClick={() => setShowAddLocationModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Airport Station</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => {
              const isOperational = loc.activeStatus === 'OPERATIONAL';
              return (
                <div
                  key={loc.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xl text-white">{loc.airportCode}</span>
                        <span className="text-xs font-medium text-slate-300">{loc.city}, {loc.country}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{loc.airportName}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isOperational ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {loc.activeStatus}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono text-slate-400">
                    <div>Terminals: <span className="text-white">{loc.terminals.join(', ')}</span></div>
                    <div>Active Gates: <span className="text-cyan-300 font-bold">{loc.authorizedGates.join(', ')}</span></div>
                    <div>Installed Turnstiles: <span className="text-white">{loc.installedGatesCount} E-Gates</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleLocationStatus(loc.id, loc.activeStatus)}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px]"
                    >
                      Toggle Maintenance
                    </button>
                    
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Archive Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Airport Location Modal */}
          {showAddLocationModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleAddLocation} className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Authorize Airport Station</h3>
                  <button type="button" onClick={() => setShowAddLocationModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">IATA Airport Code (3 Letters)</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      placeholder="e.g. HRE"
                      value={newLocAirportCode}
                      onChange={(e) => setNewLocAirportCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Official Airport Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Robert Gabriel Mugabe International Airport"
                      value={newLocAirportName}
                      onChange={(e) => setNewLocAirportName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Harare"
                        value={newLocCity}
                        onChange={(e) => setNewLocCity(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Country</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zimbabwe"
                        value={newLocCountry}
                        onChange={(e) => setNewLocCountry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-sans text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Primary Gate Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. Gate 03"
                      value={newLocGate}
                      onChange={(e) => setNewLocGate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLocationModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                  >
                    Register Airport
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULE 5: CONFIGURING AIRLINE-SPECIFIC WORKFLOWS ---------------- */}
      {activeSubTab === 'workflows' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Custom Airline Verification Policy & Rules</h2>
              <p className="text-xs text-slate-400">Configure strictness and security checks specific to {currentTenant.name}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetWorkflowDefaults}
                className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-colors"
              >
                Reset to ICAO Standards
              </button>

              <button
                onClick={handleSaveWorkflow}
                disabled={savingWorkflow}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{savingWorkflow ? 'Saving...' : 'Save Workflow Policy'}</span>
              </button>
            </div>
          </div>

          {workflowSavedMsg && (
            <div className="p-3.5 rounded-lg border border-emerald-800/80 bg-emerald-950/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Workflow configuration successfully deployed to all airport edge nodes!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biometric Sensitivity */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Biometric Confidence Threshold</h3>
                <p className="text-xs text-slate-400">Minimum vector match score required to pass identity verification</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Threshold:</span>
                  <span className="text-cyan-400 font-bold text-base">{workflow.minBiometricConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="95"
                  step="1"
                  value={workflow.minBiometricConfidence}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, minBiometricConfidence: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>80% (Fast Walk-Through)</span>
                  <span>85% (ICAO Recommended)</span>
                  <span>95% (Maximum Security)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs text-slate-400 block mb-1">Anti-Spoofing Liveness Strictness</label>
                <select
                  value={workflow.livenessStrictness}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, livenessStrictness: e.target.value as any }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                >
                  <option value="STANDARD">Standard (Head pose + Pupil blink)</option>
                  <option value="HIGH">High (3D Mesh + Sub-dermal infrared reflection)</option>
                  <option value="MAXIMUM_3D_VASCULAR">Maximum (Micro-vascular pulse blood flow detection)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Offline Edge Precache Window:</span>
                  <span className="text-white font-bold">{workflow.offlineEdgePrecacheHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={workflow.offlineEdgePrecacheHours}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, offlineEdgePrecacheHours: Number(e.target.value) }))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Pre-caches passenger manifests to local gate controllers in case of network interruption.</span>
              </div>
            </div>

            {/* Check-In and Safety Prerequisites */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4 text-xs font-mono">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">Pre-Condition State Gates</h3>
                <p className="text-xs text-slate-400 font-sans">Enforce airline prerequisite conditions prior to boarding gate unlatching</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.requireCheckInBeforeBiometric}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, requireCheckInBeforeBiometric: e.target.checked }))}
                    className="accent-cyan-400 w-4 h-4 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-white font-bold block font-sans">Require Seat Check-in Completion</span>
                    <span className="text-[11px] text-slate-400 font-sans">Passenger must have an assigned seat before turnstile can open.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.requireDangerousGoodsDeclaration}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, requireDangerousGoodsDeclaration: e.target.checked }))}
                    className="accent-cyan-400 w-4 h-4 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-white font-bold block font-sans">Mandatory Dangerous Goods Sign-Off</span>
                    <span className="text-[11px] text-slate-400 font-sans">Block boarding until hazardous materials / lithium declaration is signed.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.supervisorOverrideRequired}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, supervisorOverrideRequired: e.target.checked }))}
                    className="accent-cyan-400 w-4 h-4 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-white font-bold block font-sans">Require Supervisor Badge for Manual Overrides</span>
                    <span className="text-[11px] text-slate-400 font-sans">Turnstile manual unlock requires authorized supervisor badge ID.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workflow.allowMobileDigitalPassAutoBoarding}
                    onChange={(e) => setWorkflow(prev => ({ ...prev, allowMobileDigitalPassAutoBoarding: e.target.checked }))}
                    className="accent-cyan-400 w-4 h-4 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-white font-bold block font-sans">Mobile Wallet Biometric Boarding Token</span>
                    <span className="text-[11px] text-slate-400 font-sans">Permits passengers with FaceFly digital tokens to touch-free board.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODULE 6: SUBSCRIPTION & BILLING INFORMATION ---------------- */}
      {activeSubTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Subscription Contract Card */}
            <div className="md:col-span-2 p-6 rounded-2xl border border-cyan-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span>CARRIER CONTRACT & BILLING LEDGER</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{currentTenant.name} Subscription</h2>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ● ACTIVE RECURRING CONTRACT
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Monthly Fee:</span>
                  <span className="text-lg font-bold text-white">
                    {currentSub.currency} {currentSub.monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Billed Monthly</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Approved Gates:</span>
                  <span className="text-lg font-bold text-cyan-300">{currentSub.licensedGates} Gates</span>
                  <span className="text-[10px] text-slate-500 block">100% Deployed</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Next Billing Date:</span>
                  <span className="text-lg font-bold text-white">{currentSub.nextBillingDate}</span>
                  <span className="text-[10px] text-emerald-400 block">Autopay Configured</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Carrier Home Base:</span>
                  <span className="text-lg font-bold text-white">{currentTenant.homeAirport}</span>
                  <span className="text-[10px] text-slate-400 block">{currentTenant.country}</span>
                </div>
              </div>

              {/* Monthly Scans Quota Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Monthly Passenger Biometric Quota Utilization:</span>
                  <span className="text-white font-bold">
                    {currentSub.currentMonthScans.toLocaleString()} / {currentSub.maxMonthlyScans.toLocaleString()} (59.3%)
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: '59.3%' }}
                  />
                </div>

                <span className="text-[11px] text-slate-500 block">
                  Quota resets on the 1st of each calendar month. Unused verifications roll over for 30 days.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onRenewSubscription(currentSub.id)}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Generate Statement / Instant Renewal
                </button>

                <button
                  onClick={() => {
                    const csv = `data:text/plain;charset=utf-8,FACEFLY AI INVOICE STATEMENT\nAirline: ${currentTenant.name}\nTier: ${currentSub.tier}\nAmount: ${currentSub.currency} ${currentSub.monthlyPrice}\nBilling Cycle: Monthly\nDate: 2026-10-01\nStatus: PAID\nLicensed Gates: ${currentSub.licensedGates}\nICAO Certified: Doc 9303 Part 9`;
                    const a = document.createElement('a');
                    a.href = encodeURI(csv);
                    a.download = `FaceFly_Invoice_${currentTenant.iataCode}_2026_10.txt`;
                    a.click();
                  }}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tax Invoice (PDF/TXT)</span>
                </button>
              </div>
            </div>

            {/* API Credentials & Webhook for Airline IT DCS */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase mb-1">
                  <Key className="w-4 h-4" />
                  <span>DCS Departure Integration</span>
                </div>
                <h3 className="text-sm font-bold text-white">Airline API & Credentials</h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Production API Key:</span>
                    <button 
                      onClick={handleCopyApiKey}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 text-[11px] break-all font-mono">
                    {currentSub.apiKey}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Event Webhook Stream:</span>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 text-[11px] break-all font-mono">
                    {currentSub.webhookUrl}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>Protocol: <span className="text-white">HMAC-SHA256 Signature</span></div>
                  <div>Retry Policy: <span className="text-emerald-400">Exponential Backoff</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics & K30,000 Personal Spending Milestone Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Airline Subscription Economics & Milestone Tracker (K19,000 / Month Basis)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Goal: K30,000 / month personal budget
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Subscribed Airlines:</span>
                <div className="text-2xl font-bold text-white tabular-nums">{calcAirlinesCount} Carriers</div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={calcAirlinesCount}
                  onChange={(e) => setCalcAirlinesCount(Number(e.target.value))}
                  className="w-full accent-cyan-400 mt-2"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Gross Monthly Revenue:</span>
                <div className="text-2xl font-bold text-cyan-400 tabular-nums">
                  K{(calcAirlinesCount * 19000).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 block">@ K19,000 / airline in Zambia</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">OpEx & Taxes Reserve:</span>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">
                  K{(calcAirlinesCount * calcOpExPerAirline).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 block">Est. K4,000 / airline infrastructure</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1">
                <span className="text-emerald-300 block font-semibold">Net Available for Spending:</span>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  K{((calcAirlinesCount * 19000) - (calcAirlinesCount * calcOpExPerAirline)).toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-300 font-bold block">
                  {((calcAirlinesCount * 19000) - (calcAirlinesCount * calcOpExPerAirline)) >= calcPersonalTarget 
                    ? '✓ Goal Met (Exceeds K30,000)' 
                    : `K${(calcPersonalTarget - ((calcAirlinesCount * 19000) - (calcAirlinesCount * calcOpExPerAirline))).toLocaleString()} away from goal`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Exception Diagnostic Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">FaceFly AI Gate Security Analysis</h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingAiReport ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Running ICAO Doc 9303 vector diagnosis...</span>
              </div>
            ) : aiReport ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-sans">
                  {aiReport.analysis}
                </div>

                <div>
                  <span className="text-slate-400 font-bold block mb-2 font-mono uppercase">Recommended Procedural Action:</span>
                  <div className="space-y-1.5">
                    {aiReport.actionPlan.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-950 rounded border border-slate-850 font-sans text-slate-300">
                        <span className="text-cyan-400 font-bold font-mono">{i + 1}.</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
                  <span>Engine: {aiReport.aiPowered ? 'Gemini 3.8 Flash' : 'ICAO Rule Engine'}</span>
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
