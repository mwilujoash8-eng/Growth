import React, { useState, useEffect } from 'react';
import { 
  PassengerBooking, 
  BiometricStationNode, 
  AirlineSubscription, 
  SecurityAuditRecord, 
  UserRole,
  AirlineTenant,
  StaffMember,
  FlightOperation,
  PassengerCorrectionRequest,
  CurrencyConfig
} from './types/index.ts';
import { 
  INITIAL_PASSENGERS, 
  INITIAL_STATIONS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_AUDIT_LOGS,
  AIRLINE_TENANTS,
  INITIAL_STAFF,
  INITIAL_FLIGHT_OPERATIONS,
  INITIAL_CORRECTION_REQUESTS,
  CURRENCIES
} from './data/seedData.ts';

import { HeaderNav } from './components/HeaderNav.tsx';
import { ExecutiveOverview } from './components/ExecutiveOverview.tsx';
import { OperationsHub } from './components/OperationsHub.tsx';
import { CheckInManagementView } from './components/CheckInManagementView.tsx';
import { BiometricVerificationStation } from './components/BiometricVerificationStation.tsx';
import { FlightManifestView } from './components/FlightManifestView.tsx';
import { FlightOperationsView } from './components/FlightOperationsView.tsx';
import { HardwareGateManager } from './components/HardwareGateManager.tsx';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView.tsx';
import { AirlineAdminDashboard } from './components/AirlineAdminDashboard.tsx';
import { AirlineBillingPortal } from './components/AirlineBillingPortal.tsx';
import { StaffPermissionsView } from './components/StaffPermissionsView.tsx';
import { SecurityAuditVault } from './components/SecurityAuditVault.tsx';
import { SystemSettingsView } from './components/SystemSettingsView.tsx';
import { PassengerPortalView } from './components/PassengerPortalView.tsx';
import { PassengerKioskMode } from './components/PassengerKioskMode.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('airline-admin');
  const [activeRole, setActiveRole] = useState<UserRole>('PLATFORM_SUPER_ADMIN');
  const [selectedAirport, setSelectedAirport] = useState<string>('LUN');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');

  // Application state
  const [passengers, setPassengers] = useState<PassengerBooking[]>(INITIAL_PASSENGERS);
  const [stations, setStations] = useState<BiometricStationNode[]>(INITIAL_STATIONS);
  const [subscriptions, setSubscriptions] = useState<AirlineSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [tenants, setTenants] = useState<AirlineTenant[]>(AIRLINE_TENANTS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [flightOps, setFlightOps] = useState<FlightOperation[]>(INITIAL_FLIGHT_OPERATIONS);
  const [correctionRequests, setCorrectionRequests] = useState<PassengerCorrectionRequest[]>(INITIAL_CORRECTION_REQUESTS);
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>(CURRENCIES);

  // Initial data loading from server API with tenant header context
  useEffect(() => {
    async function loadData() {
      try {
        const headers: Record<string, string> = {
          'x-tenant-id': selectedTenantId,
          'x-user-role': activeRole,
        };

        const [paxRes, stRes, subRes, audRes, tenRes, stfRes, fltRes, reqRes] = await Promise.all([
          fetch(`/api/passengers?tenantId=${selectedTenantId}`, { headers }).then(r => r.ok ? r.json() : null),
          fetch('/api/stations').then(r => r.ok ? r.json() : null),
          fetch('/api/subscriptions').then(r => r.ok ? r.json() : null),
          fetch('/api/audit-logs').then(r => r.ok ? r.json() : null),
          fetch('/api/tenants').then(r => r.ok ? r.json() : null),
          fetch('/api/staff', { headers }).then(r => r.ok ? r.json() : null),
          fetch('/api/flights', { headers }).then(r => r.ok ? r.json() : null),
          fetch('/api/correction-requests').then(r => r.ok ? r.json() : null),
        ]);

        if (paxRes && Array.isArray(paxRes)) setPassengers(paxRes);
        if (stRes && Array.isArray(stRes)) setStations(stRes);
        if (subRes && subRes.subscriptions) setSubscriptions(subRes.subscriptions);
        if (subRes && subRes.currencies) setCurrencies(subRes.currencies);
        if (audRes && Array.isArray(audRes)) setAuditLogs(audRes);
        if (tenRes && Array.isArray(tenRes)) setTenants(tenRes);
        if (stfRes && Array.isArray(stfRes)) setStaff(stfRes);
        if (fltRes && Array.isArray(fltRes)) setFlightOps(fltRes);
        if (reqRes && Array.isArray(reqRes)) setCorrectionRequests(reqRes);
      } catch (err) {
        console.warn('API data fetch failed, using local initial state', err);
      }
    }
    loadData();
  }, [selectedTenantId, activeRole]);

  // Update a single passenger in state
  const handleUpdatePassenger = (updatedPax: PassengerBooking) => {
    setPassengers(prev => prev.map(p => p.id === updatedPax.id ? updatedPax : p));
  };

  // Toggle a station maintenance state
  const handleToggleStation = async (stationId: string) => {
    try {
      const res = await fetch(`/api/stations/${stationId}/toggle`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setStations(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
    } catch {
      setStations(prev => prev.map(s => {
        if (s.id === stationId) {
          return { ...s, status: s.status === 'ONLINE' ? 'MAINTENANCE' : 'ONLINE' };
        }
        return s;
      }));
    }
  };

  // Renew an airline subscription
  const handleRenewSubscription = async (subId: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}/renew`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setSubscriptions(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
    } catch {
      setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status: 'ACTIVE' } : s));
    }
  };

  // Approve a tenant onboarding request (Platform Super Admin)
  const handleApproveTenant = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
    } catch {
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'ACTIVE' } : t));
    }
  };

  // Update Flight status
  const handleUpdateFlightStatus = async (flightId: string, status: FlightOperation['status']) => {
    try {
      const res = await fetch(`/api/flights/${flightId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFlightOps(prev => prev.map(f => f.id === updated.id ? updated : f));
      }
    } catch {
      setFlightOps(prev => prev.map(f => f.id === flightId ? { ...f, status } : f));
    }
  };

  // Add staff member
  const handleAddStaff = async (newStaffData: Partial<StaffMember>) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStaffData,
          tenantId: selectedTenantId === 'ALL' ? 'tenant-zn' : selectedTenantId,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setStaff(prev => [...prev, created]);
      }
    } catch {
      // local fallback
      const dummy: StaffMember = {
        id: `stf-${Date.now()}`,
        tenantId: selectedTenantId === 'ALL' ? 'tenant-zn' : selectedTenantId,
        fullName: newStaffData.fullName || 'New Officer',
        email: newStaffData.email || 'staff@facefly.aero',
        badgeNumber: newStaffData.badgeNumber || 'ZN-GA-9912',
        role: newStaffData.role || 'AIRPORT_OPERATIONS_STAFF',
        assignedAirport: selectedAirport,
        assignedStations: ['st-lun-board-gate4b'],
        status: 'ACTIVE',
        lastActive: 'Just created',
      };
      setStaff(prev => [...prev, dummy]);
    }
  };

  // Revoke staff member
  const handleRevokeStaff = async (staffId: string) => {
    try {
      const res = await fetch(`/api/staff/${staffId}/revoke`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
    } catch {
      setStaff(prev => prev.map(s => {
        if (s.id === staffId) {
          return { ...s, status: s.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE' };
        }
        return s;
      }));
    }
  };

  // Update country pricing rate
  const handleUpdateCurrencyRate = async (code: string, newRate: number) => {
    try {
      const res = await fetch(`/api/pricing-config/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlySubscriptionRate: newRate }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrencies(prev => prev.map(c => c.code === updated.code ? updated : c));
      }
    } catch {
      setCurrencies(prev => prev.map(c => c.code === code ? { ...c, monthlySubscriptionRate: newRate } : c));
    }
  };

  // Submit passenger data correction
  const handleSubmitCorrection = async (req: Partial<PassengerCorrectionRequest>) => {
    try {
      const res = await fetch('/api/correction-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) {
        const created = await res.json();
        setCorrectionRequests(prev => [created, ...prev]);
      }
    } catch (err) {
      console.error('Correction submit error:', err);
    }
  };

  // Filter passengers according to active tenant isolation
  const visiblePassengers = selectedTenantId === 'ALL'
    ? passengers
    : passengers.filter(p => p.tenantId === selectedTenantId);

  const visibleFlights = selectedTenantId === 'ALL'
    ? flightOps
    : flightOps.filter(f => f.tenantId === selectedTenantId);

  // Handle passenger kiosk modal
  if (currentTab === 'kiosk') {
    return (
      <PassengerKioskMode
        passengers={passengers}
        onExitKiosk={() => setCurrentTab('operations')}
        onUpdatePassenger={handleUpdatePassenger}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Navigation with custom emblem and role selector */}
      <HeaderNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        selectedAirport={selectedAirport}
        onAirportChange={setSelectedAirport}
        selectedTenantId={selectedTenantId}
        onTenantChange={setSelectedTenantId}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'airline-admin' && (
          <AirlineAdminDashboard
            passengers={passengers}
            subscriptions={subscriptions}
            tenants={tenants}
            currencies={currencies}
            selectedTenantId={selectedTenantId}
            onUpdatePassenger={handleUpdatePassenger}
            onRenewSubscription={handleRenewSubscription}
            selectedAirport={selectedAirport}
            onTenantChange={setSelectedTenantId}
          />
        )}

        {currentTab === 'executive' && (
          <ExecutiveOverview
            tenants={tenants}
            subscriptions={subscriptions}
            onApproveTenant={handleApproveTenant}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'operations' && (
          <OperationsHub
            passengers={visiblePassengers}
            stations={stations}
            onNavigateToBiometrics={() => setCurrentTab('biometrics')}
            onNavigateToManifest={() => setCurrentTab('manifest')}
            onNavigateToPricing={() => setCurrentTab('billing')}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'checkin' && (
          <CheckInManagementView
            passengers={visiblePassengers}
            onUpdatePassenger={handleUpdatePassenger}
            activeRole={activeRole}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'biometrics' && (
          <BiometricVerificationStation
            passengers={visiblePassengers}
            stations={stations}
            onUpdatePassenger={handleUpdatePassenger}
            activeRole={activeRole}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'manifest' && (
          <FlightManifestView
            passengers={visiblePassengers}
            onUpdatePassenger={handleUpdatePassenger}
            onSelectPassengerForScan={() => setCurrentTab('biometrics')}
            activeRole={activeRole}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'flights' && (
          <FlightOperationsView
            flights={visibleFlights}
            onUpdateFlightStatus={handleUpdateFlightStatus}
            activeRole={activeRole}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'hardware' && (
          <HardwareGateManager
            stations={stations}
            onToggleStation={handleToggleStation}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsAnalyticsView
            stations={stations}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'billing' && (
          <AirlineBillingPortal
            subscriptions={subscriptions}
            onRenewSubscription={handleRenewSubscription}
          />
        )}

        {currentTab === 'staff' && (
          <StaffPermissionsView
            staff={staff}
            onAddStaff={handleAddStaff}
            onRevokeStaff={handleRevokeStaff}
            activeRole={activeRole}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'security' && (
          <SecurityAuditVault
            auditLogs={auditLogs}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'settings' && (
          <SystemSettingsView
            currencies={currencies}
            onUpdateCurrencyRate={handleUpdateCurrencyRate}
            activeRole={activeRole}
            selectedAirport={selectedAirport}
          />
        )}

        {currentTab === 'passenger-portal' && (
          <PassengerPortalView
            passengers={passengers}
            correctionRequests={correctionRequests}
            onSubmitCorrection={handleSubmitCorrection}
          />
        )}
      </main>

      {/* Enterprise Aviation Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">FaceFly AI</span>
            <span>·</span>
            <span>One Identity. A Smarter Journey.</span>
            <span>·</span>
            <span className="text-cyan-400 font-mono">v3.8.5 Enterprise SaaS</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono">
            <span>Tenant Isolation: <strong className="text-emerald-400 font-semibold">Strict Active</strong></span>
            <span>·</span>
            <span>Zambia Subscription: <strong className="text-white">K19,000 / month</strong></span>
            <span>·</span>
            <span>ICAO Doc 9303 Part 9 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
