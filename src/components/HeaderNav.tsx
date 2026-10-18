import React from 'react';
import { UserRole } from '../types/index.ts';
import { 
  Building, 
  ChevronDown, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  Layers
} from 'lucide-react';

interface HeaderNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedAirport: string;
  onAirportChange: (code: string) => void;
  selectedTenantId: string;
  onTenantChange: (tenantId: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onTabChange,
  activeRole,
  onRoleChange,
  selectedAirport,
  onAirportChange,
  selectedTenantId,
  onTenantChange,
}) => {
  // Navigation tabs for the platform
  const navTabs = [
    { id: 'airline-admin', label: 'Airline Admin' },
    { id: 'executive', label: 'Executive' },
    { id: 'operations', label: 'Operations' },
    { id: 'checkin', label: 'Check-In' },
    { id: 'biometrics', label: 'Identity Gate' },
    { id: 'manifest', label: 'Passengers' },
    { id: 'flights', label: 'Flights' },
    { id: 'hardware', label: 'Cameras & Hardware' },
    { id: 'reports', label: 'Reports' },
    { id: 'billing', label: 'Subscriptions' },
    { id: 'staff', label: 'Staff & Roles' },
    { id: 'security', label: 'Security Centre' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Brand, Zone 2: Primary Nav, Zone 3: Primary Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Zone with Distinctive FaceFly AI Symbol */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('executive')}
            className="flex items-center gap-2.5 text-left group"
          >
            {/* Custom SVG Abstract Emblem: Identity, Movement, and Flight */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(34,211,238,0.25)] group-hover:border-cyan-400 transition-colors">
              <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Aerodynamic flight swept wing */}
                <path d="M4 28C14 26 26 20 36 8C28 18 20 28 14 34L4 28Z" fill="#0EA5E9" />
                {/* Biometric identity aperture curve */}
                <path d="M12 12C20 12 28 18 32 26C24 24 16 20 12 12Z" fill="#22D3EE" fillOpacity="0.85" />
                {/* Central biometric focal iris */}
                <circle cx="21" cy="20" r="3" fill="#FFFFFF" />
              </svg>
            </div>

            <div className="text-left">
              <span className="text-base font-extrabold tracking-tight text-white block group-hover:text-cyan-400 transition-colors">
                FaceFly AI
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-slate-300 overflow-x-auto py-1">
          {navTabs.slice(0, 7).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : 'hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="relative group">
            <button className="flex items-center gap-1 text-slate-400 hover:text-white py-1">
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-slate-900 border border-slate-800 rounded-lg py-1 shadow-2xl min-w-[140px] z-50">
              {navTabs.slice(7).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`block w-full text-left px-3 py-1.5 text-xs ${
                    currentTab === tab.id ? 'text-cyan-400 bg-slate-800 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Zone 3: 1 Primary Action Area & Role Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('kiosk')}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 rounded-md hover:bg-cyan-900/60 transition-colors whitespace-nowrap shrink-0"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Kiosk Terminal</span>
          </button>

          {/* User Role Selector */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-md">
              <span className="text-slate-400">Role:</span>
              <span className="font-semibold text-cyan-400">
                {activeRole === 'PLATFORM_SUPER_ADMIN' && 'Super Admin'}
                {activeRole === 'AIRLINE_ADMIN' && 'Airline Admin'}
                {activeRole === 'AIRPORT_OPERATIONS_STAFF' && 'Ops Staff'}
                {activeRole === 'SECURITY_REVIEWER' && 'Security Officer'}
                {activeRole === 'PASSENGER' && 'Passenger Portal'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </div>

            <select
              value={activeRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                onRoleChange(role);
                if (role === 'PASSENGER') onTabChange('passenger-portal');
                if (role === 'AIRLINE_ADMIN') onTabChange('airline-admin');
              }}
              aria-label="Select User Role"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              <option value="PLATFORM_SUPER_ADMIN">Platform Super Admin</option>
              <option value="AIRLINE_ADMIN">Airline Administrator</option>
              <option value="AIRPORT_OPERATIONS_STAFF">Airport Operations Staff</option>
              <option value="SECURITY_REVIEWER">Security Reviewer</option>
              <option value="PASSENGER">Passenger Self-Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operational Context Ribbon: Active Tenant & Station Controls */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-3">
          {/* Tenant Isolation Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Airline Tenant:</span>
            <select
              value={selectedTenantId}
              onChange={(e) => onTenantChange(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Tenants (Platform Super Admin View)</option>
              <option value="tenant-zn">Zambia Airways (ZN) · Base LUN</option>
              <option value="tenant-kq">Kenya Airways (KQ) · Base NBO</option>
              <option value="tenant-et">Ethiopian Airlines (ET) · Base ADD</option>
              <option value="tenant-wb">RwandAir (WB) · Base KGL</option>
            </select>
          </div>

          {/* Hub Airport */}
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span>Airport Station:</span>
            <div className="flex items-center gap-1">
              {['LUN', 'NBO', 'JNB', 'ADD', 'LHR'].map((hub) => (
                <button
                  key={hub}
                  onClick={() => onAirportChange(hub)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    selectedAirport === hub
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Sub-Navigation for Tablets / Small screens */}
          <div className="flex xl:hidden items-center gap-2 overflow-x-auto py-0.5">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap ${
                  currentTab === tab.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
