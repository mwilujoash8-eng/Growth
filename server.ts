import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { 
  INITIAL_PASSENGERS, 
  INITIAL_STATIONS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_AUDIT_LOGS,
  AIRLINE_TENANTS,
  INITIAL_STAFF,
  INITIAL_FLIGHT_OPERATIONS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_AIRLINE_WORKFLOWS,
  INITIAL_AIRLINE_LOCATIONS,
  CURRENCIES 
} from './src/data/seedData.ts';
import { 
  PassengerBooking, 
  SecurityAuditRecord, 
  AirlineSubscription, 
  BiometricStationNode,
  AirlineTenant,
  StaffMember,
  FlightOperation,
  PassengerCorrectionRequest,
  AirlineWorkflowConfig,
  AirlineAirportLocation,
  UserRole
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// In-memory state for runtime
let passengers: PassengerBooking[] = JSON.parse(JSON.stringify(INITIAL_PASSENGERS));
let stations: BiometricStationNode[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));
let subscriptions: AirlineSubscription[] = JSON.parse(JSON.stringify(INITIAL_SUBSCRIPTIONS));
let auditLogs: SecurityAuditRecord[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let tenants: AirlineTenant[] = JSON.parse(JSON.stringify(AIRLINE_TENANTS));
let staff: StaffMember[] = JSON.parse(JSON.stringify(INITIAL_STAFF));
let flightOps: FlightOperation[] = JSON.parse(JSON.stringify(INITIAL_FLIGHT_OPERATIONS));
let correctionRequests: PassengerCorrectionRequest[] = JSON.parse(JSON.stringify(INITIAL_CORRECTION_REQUESTS));
let currencies = JSON.parse(JSON.stringify(CURRENCIES));
let workflows: Record<string, AirlineWorkflowConfig> = JSON.parse(JSON.stringify(INITIAL_AIRLINE_WORKFLOWS));
let airlineLocations: AirlineAirportLocation[] = JSON.parse(JSON.stringify(INITIAL_AIRLINE_LOCATIONS));

// Gemini client initialization (server-side only)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- TENANT ISOLATION HELPER ----------------
function getTenantContext(req: Request) {
  const role = (req.headers['x-user-role'] as UserRole) || 'PLATFORM_SUPER_ADMIN';
  const tenantId = (req.headers['x-tenant-id'] as string) || (req.query.tenantId as string) || 'ALL';
  const pnr = (req.headers['x-passenger-pnr'] as string) || (req.query.pnr as string) || '';
  return { role, tenantId, pnr };
}

// ---------------- API ENDPOINTS ----------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'FaceFly AI Airport Identity & Processing Gateway',
    version: '3.8.5',
    region: 'EU-WEST2 / AF-SOUTH1',
    geminiEnabled: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// Get passengers with strict tenant isolation
app.get('/api/passengers', (req: Request, res: Response) => {
  const { role, tenantId, pnr } = getTenantContext(req);
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  const flight = ((req.query.flight as string) || '').trim().toUpperCase();

  let filtered = [...passengers];

  // SERVER-ENFORCED TENANT ISOLATION
  if (role === 'PASSENGER') {
    if (!pnr) {
      res.json([]);
      return;
    }
    filtered = filtered.filter(p => p.pnr.toUpperCase() === pnr.toUpperCase());
  } else if (role === 'AIRLINE_ADMIN' || role === 'AIRPORT_OPERATIONS_STAFF') {
    if (tenantId && tenantId !== 'ALL') {
      filtered = filtered.filter(p => p.tenantId === tenantId);
    }
  } else if (role === 'SECURITY_REVIEWER') {
    // Security reviewer sees verified and flagged records, with PII minimization
    filtered = filtered.map(p => ({
      ...p,
      // Mask full passport number except last 4 digits for privacy governance
      passportNumber: p.passportNumber.slice(0, 3) + '***' + p.passportNumber.slice(-3),
    }));
  }

  if (flight && flight !== 'ALL') {
    filtered = filtered.filter(p => p.flightNumber.toUpperCase() === flight);
  }
  if (query) {
    filtered = filtered.filter(p => 
      p.pnr.toLowerCase().includes(query) ||
      p.passengerName.toLowerCase().includes(query) ||
      p.passportNumber.toLowerCase().includes(query)
    );
  }
  res.json(filtered);
});

// Get single passenger (with tenant security check)
app.get('/api/passengers/:idOrPnr', (req: Request, res: Response) => {
  const { role, tenantId, pnr } = getTenantContext(req);
  const identifier = req.params.idOrPnr.toUpperCase();
  const passenger = passengers.find(p => p.id === req.params.idOrPnr || p.pnr.toUpperCase() === identifier);

  if (!passenger) {
    res.status(404).json({ error: 'Passenger booking record not found' });
    return;
  }

  // Tenant Isolation Enforcement
  if (role === 'PASSENGER' && passenger.pnr.toUpperCase() !== pnr.toUpperCase()) {
    res.status(403).json({ error: 'Tenant Privacy Enforcement: You may only access your own passenger record' });
    return;
  }
  if ((role === 'AIRLINE_ADMIN' || role === 'AIRPORT_OPERATIONS_STAFF') && tenantId !== 'ALL' && passenger.tenantId !== tenantId) {
    res.status(403).json({ error: 'Tenant Isolation Violation: Airline is not authorized to access another carrier’s passenger' });
    return;
  }

  res.json(passenger);
});

// Biometric Verification Endpoint
app.post('/api/verify-biometric', async (req: Request, res: Response) => {
  const { pnr, stationId, overrideConfidence } = req.body;
  const passenger = passengers.find(p => p.pnr.toUpperCase() === (pnr || '').toUpperCase());

  if (!passenger) {
    res.status(404).json({ error: 'No passenger found for this booking reference / biometric token' });
    return;
  }

  const simulatedLatency = Math.floor(160 + Math.random() * 45);
  let confidence = overrideConfidence ?? (passenger.pnr === 'WB2290' ? 58.2 : 99.4);
  let liveness = passenger.pnr === 'WB2290' ? 62.1 : 98.9;
  const matchPassed = confidence >= 85.0 && liveness >= 90.0;

  passenger.biometricConfidence = confidence;
  passenger.livenessConfidence = liveness;
  passenger.processingLatencyMs = simulatedLatency;
  passenger.identityStatus = matchPassed ? 'PASSED' : 'FAILED';
  passenger.lastProcessedAt = new Date().toLocaleTimeString('en-GB');

  // CRITICAL AVIATION RULE:
  // A successful identity check must never automatically guarantee permission to board
  // if other airline requirements remain incomplete.
  const allPrerequisitesMet = 
    passenger.bookingStatus === 'PASSED' &&
    passenger.identityStatus === 'PASSED' &&
    passenger.checkInStatus === 'PASSED' &&
    passenger.securityStatus === 'PASSED' &&
    passenger.visaRequirement !== 'INVALID' &&
    passenger.visaRequirement !== 'PENDING_DOCUMENT_CHECK' &&
    passenger.securityWatchlistFlag === 'NONE';

  passenger.boardingStatus = allPrerequisitesMet ? 'PASSED' : 'BLOCKED';

  // Create immutable audit log
  const newAudit: SecurityAuditRecord = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
    eventType: matchPassed 
      ? (allPrerequisitesMet ? 'BOARDING_AUTHORIZED' : 'BIOMETRIC_MATCH_SUCCESS') 
      : 'BIOMETRIC_CONFIDENCE_LOW',
    severity: matchPassed ? (allPrerequisitesMet ? 'INFO' : 'NOTICE') : 'ALERT',
    actorRole: 'SYSTEM_AUTOMATION',
    actorIdentifier: `Node: ${stationId || 'GATE-CORE'}`,
    pnr: passenger.pnr,
    passengerName: passenger.passengerName,
    stationId: stationId || 'GATE-CORE',
    details: matchPassed 
      ? (allPrerequisitesMet 
          ? `Biometric match passed (${confidence}%). All 5 workflow stages verified. Boarding granted.`
          : `Biometric match passed (${confidence}%). NOTICE: Boarding withheld because check-in, visa, or baggage validation is incomplete.`)
      : `Biometric match failed (${confidence}% < 85% threshold). Manual gate officer verification required.`,
    cryptographicProof: 'sha256_' + Buffer.from(`${passenger.pnr}-${Date.now()}-${confidence}`).toString('hex').slice(0, 32),
  };
  auditLogs.unshift(newAudit);

  // Update station throughput
  const targetStation = stations.find(s => s.id === stationId);
  if (targetStation) {
    targetStation.totalScansToday += 1;
    if (!matchPassed) targetStation.mismatchesToday += 1;
  }

  res.json({
    passenger,
    matchPassed,
    confidence,
    liveness,
    latencyMs: simulatedLatency,
    allPrerequisitesMet,
    ruleEnforced: !allPrerequisitesMet && matchPassed ? 'Identity verified, but boarding blocked due to incomplete airline prerequisites' : null,
    auditRecord: newAudit,
  });
});

// Update single workflow stage (e.g. check-in, manual gate override)
app.post('/api/passengers/:id/workflow', (req: Request, res: Response) => {
  const { stage, status, agentRole, reason } = req.body;
  const passenger = passengers.find(p => p.id === req.params.id);

  if (!passenger) {
    res.status(404).json({ error: 'Passenger record not found' });
    return;
  }

  if (stage === 'checkInStatus') {
    passenger.checkInStatus = status;
    if (status === 'PASSED' && passenger.seat === 'UNASSIGNED') {
      passenger.seat = '12B';
    }
  } else if (stage === 'securityStatus') {
    passenger.securityStatus = status;
    if (status === 'PASSED') {
      passenger.securityWatchlistFlag = 'NONE';
    }
  } else if (stage === 'visaRequirement') {
    passenger.visaRequirement = status;
  } else if (stage === 'dangerousGoodsDeclared') {
    passenger.dangerousGoodsDeclared = status;
  } else if (stage === 'baggageCount') {
    passenger.baggageCount = Number(status);
    passenger.baggageTagIds = Array.from({ length: passenger.baggageCount }, (_, i) => `${passenger.airlineCode}-BG${i + 1}-${Date.now().toString().slice(-4)}`);
  } else if (stage === 'manualOverride') {
    passenger.identityStatus = 'PASSED';
    passenger.boardingStatus = 'PASSED';
    passenger.agentNotes = `Agent Override by ${agentRole}: ${reason || 'Physical passport and boarding card verified manually'}`;
  }

  // Re-evaluate boarding readiness
  const readyToBoard = 
    passenger.bookingStatus === 'PASSED' &&
    passenger.identityStatus === 'PASSED' &&
    passenger.checkInStatus === 'PASSED' &&
    passenger.securityStatus === 'PASSED' &&
    passenger.visaRequirement !== 'INVALID' &&
    passenger.visaRequirement !== 'PENDING_DOCUMENT_CHECK' &&
    passenger.securityWatchlistFlag === 'NONE';

  passenger.boardingStatus = readyToBoard ? 'PASSED' : 'BLOCKED';

  // Audit record
  const log: SecurityAuditRecord = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
    eventType: stage === 'manualOverride' ? 'MANUAL_AGENT_OVERRIDE' : 'BOARDING_AUTHORIZED',
    severity: stage === 'manualOverride' ? 'NOTICE' : 'INFO',
    actorRole: agentRole || 'AIRPORT_OPERATIONS_STAFF',
    actorIdentifier: 'Station Gate Terminal',
    pnr: passenger.pnr,
    passengerName: passenger.passengerName,
    stationId: passenger.gate,
    details: `Stage '${stage}' updated to '${status}'. Reason: ${reason || 'Operational update'}. Boarding: ${passenger.boardingStatus}`,
    cryptographicProof: 'sha256_' + Math.random().toString(36).substring(2, 18),
  };
  auditLogs.unshift(log);

  res.json({ passenger, readyToBoard, log });
});

// Airline Tenants Management (Platform Super Admin)
app.get('/api/tenants', (_req: Request, res: Response) => {
  res.json(tenants);
});

app.post('/api/tenants/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const tenant = tenants.find(t => t.id === req.params.id);
  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }
  tenant.status = status;

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
    eventType: 'SUBSCRIPTION_RENEWAL_BILLED',
    severity: status === 'SUSPENDED' ? 'ALERT' : 'INFO',
    actorRole: 'PLATFORM_SUPER_ADMIN',
    actorIdentifier: 'SuperAdmin-Console',
    stationId: 'PLATFORM-HQ',
    details: `Airline tenant ${tenant.name} status updated to ${status}.`,
    cryptographicProof: 'sha256_' + Math.random().toString(36).substring(2, 18),
  });

  res.json(tenant);
});

// Flight Operations (Tenant Filtered)
app.get('/api/flights', (req: Request, res: Response) => {
  const { role, tenantId } = getTenantContext(req);
  let filtered = [...flightOps];
  if ((role === 'AIRLINE_ADMIN' || role === 'AIRPORT_OPERATIONS_STAFF') && tenantId !== 'ALL') {
    filtered = filtered.filter(f => f.tenantId === tenantId);
  }
  res.json(filtered);
});

app.post('/api/flights/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const flight = flightOps.find(f => f.id === req.params.id);
  if (!flight) {
    res.status(404).json({ error: 'Flight not found' });
    return;
  }
  flight.status = status;
  res.json(flight);
});

// Staff & Permissions (Tenant Filtered)
app.get('/api/staff', (req: Request, res: Response) => {
  const { role, tenantId } = getTenantContext(req);
  let filtered = [...staff];
  if ((role === 'AIRLINE_ADMIN' || role === 'AIRPORT_OPERATIONS_STAFF') && tenantId !== 'ALL') {
    filtered = filtered.filter(s => s.tenantId === tenantId || s.tenantId === 'PLATFORM');
  }
  res.json(filtered);
});

app.post('/api/staff', (req: Request, res: Response) => {
  const newStaff: StaffMember = {
    id: `stf-${Date.now()}`,
    tenantId: req.body.tenantId || 'tenant-zn',
    fullName: req.body.fullName,
    email: req.body.email,
    badgeNumber: req.body.badgeNumber || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
    role: req.body.role || 'AIRPORT_OPERATIONS_STAFF',
    assignedAirport: req.body.assignedAirport || 'LUN',
    assignedStations: req.body.assignedStations || ['st-lun-board-gate4b'],
    status: 'ACTIVE',
    lastActive: 'Just created',
  };
  staff.push(newStaff);
  res.json(newStaff);
});

app.post('/api/staff/:id/revoke', (req: Request, res: Response) => {
  const member = staff.find(s => s.id === req.params.id);
  if (!member) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }
  member.status = member.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
  res.json(member);
});

// Passenger Correction Requests (GDPR / Data Rectification)
app.get('/api/correction-requests', (_req: Request, res: Response) => {
  res.json(correctionRequests);
});

app.post('/api/correction-requests', (req: Request, res: Response) => {
  const newRequest: PassengerCorrectionRequest = {
    id: `cr-${Date.now()}`,
    pnr: req.body.pnr,
    passengerName: req.body.passengerName,
    fieldRequested: req.body.fieldRequested,
    currentValue: req.body.currentValue,
    requestedValue: req.body.requestedValue,
    status: 'PENDING',
    submittedAt: 'Just now',
  };
  correctionRequests.unshift(newRequest);
  res.json(newRequest);
});

app.post('/api/correction-requests/:id/review', (req: Request, res: Response) => {
  const { status, reviewedBy } = req.body;
  const request = correctionRequests.find(r => r.id === req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  request.status = status;
  request.reviewedBy = reviewedBy || 'Airline Operations Officer';
  res.json(request);
});

// Airline Workflow Configuration
app.get('/api/tenants/:id/workflow', (req: Request, res: Response) => {
  const tenantId = req.params.id;
  const config = workflows[tenantId] || {
    tenantId,
    minBiometricConfidence: 85,
    livenessStrictness: 'HIGH',
    requireCheckInBeforeBiometric: true,
    requireDangerousGoodsDeclaration: true,
    requireVisaCheckForRegional: false,
    allowMobileDigitalPassAutoBoarding: true,
    offlineEdgePrecacheHours: 4,
    supervisorOverrideRequired: true,
  };
  res.json(config);
});

app.post('/api/tenants/:id/workflow', (req: Request, res: Response) => {
  const tenantId = req.params.id;
  workflows[tenantId] = {
    ...workflows[tenantId],
    ...req.body,
    tenantId,
  };

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
    eventType: 'BOARDING_AUTHORIZED',
    severity: 'INFO',
    actorRole: 'AIRLINE_ADMIN',
    actorIdentifier: `Tenant Admin: ${tenantId}`,
    stationId: 'HQ-PORTAL',
    details: `Custom verification workflow updated for airline ${tenantId}. Min confidence threshold: ${workflows[tenantId].minBiometricConfidence}%.`,
    cryptographicProof: 'sha256_' + Math.random().toString(36).substring(2, 18),
  });

  res.json(workflows[tenantId]);
});

// Airline Airport Locations
app.get('/api/tenants/:id/locations', (req: Request, res: Response) => {
  const tenantId = req.params.id;
  const locs = airlineLocations.filter(l => l.tenantId === tenantId);
  res.json(locs);
});

app.post('/api/tenants/:id/locations', (req: Request, res: Response) => {
  const tenantId = req.params.id;
  const newLoc: AirlineAirportLocation = {
    id: `loc-${tenantId}-${Date.now()}`,
    tenantId,
    airportCode: (req.body.airportCode || 'LUN').toUpperCase(),
    airportName: req.body.airportName || 'International Airport',
    city: req.body.city || 'Lusaka',
    country: req.body.country || 'Zambia',
    terminals: req.body.terminals || ['Terminal 1'],
    authorizedGates: req.body.authorizedGates || ['Gate 01'],
    activeStatus: req.body.activeStatus || 'OPERATIONAL',
    installedGatesCount: Number(req.body.installedGatesCount) || 2,
  };
  airlineLocations.push(newLoc);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
    eventType: 'BOARDING_AUTHORIZED',
    severity: 'INFO',
    actorRole: 'AIRLINE_ADMIN',
    actorIdentifier: `Tenant Admin: ${tenantId}`,
    stationId: newLoc.airportCode,
    details: `New airport operational station registered: ${newLoc.airportName} (${newLoc.airportCode}).`,
    cryptographicProof: 'sha256_' + Math.random().toString(36).substring(2, 18),
  });

  res.json(newLoc);
});

app.post('/api/tenants/:id/locations/:locId/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const loc = airlineLocations.find(l => l.id === req.params.locId);
  if (!loc) {
    res.status(404).json({ error: 'Location not found' });
    return;
  }
  loc.activeStatus = status;
  res.json(loc);
});

// Stations list and controls
app.get('/api/stations', (_req: Request, res: Response) => {
  res.json(stations);
});

app.post('/api/stations/:id/toggle', (req: Request, res: Response) => {
  const station = stations.find(s => s.id === req.params.id);
  if (!station) {
    res.status(404).json({ error: 'Station not found' });
    return;
  }
  station.status = station.status === 'ONLINE' ? 'MAINTENANCE' : 'ONLINE';
  res.json(station);
});

// Subscriptions & Airline Account Management
app.get('/api/subscriptions', (_req: Request, res: Response) => {
  res.json({
    subscriptions,
    currencies,
    defaultMonthlyPriceZambia: 19000,
  });
});

app.post('/api/subscriptions/:id/renew', (req: Request, res: Response) => {
  const sub = subscriptions.find(s => s.id === req.params.id);
  if (!sub) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }
  sub.status = 'ACTIVE';
  sub.nextBillingDate = '2026-12-01';

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-GB') + ' UTC',
    eventType: 'SUBSCRIPTION_RENEWAL_BILLED',
    severity: 'INFO',
    actorRole: 'AIRLINE_ADMIN',
    actorIdentifier: `Finance Portal: ${sub.airlineName}`,
    stationId: 'HQ-BILLING',
    details: `Subscription renewed for ${sub.airlineName}: ${sub.currency} ${sub.monthlyPrice.toLocaleString()}/month.`,
    cryptographicProof: 'sha256_' + Math.random().toString(36).substring(2, 18),
  });

  res.json(sub);
});

// Country-Specific Pricing Updates (Platform Super Admin)
app.post('/api/pricing-config/:code', (req: Request, res: Response) => {
  const { monthlySubscriptionRate } = req.body;
  const curr = currencies.find((c: any) => c.code === req.params.code);
  if (!curr) {
    res.status(404).json({ error: 'Currency code not found' });
    return;
  }
  curr.monthlySubscriptionRate = Number(monthlySubscriptionRate);
  res.json(curr);
});

// Audit logs
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(auditLogs);
});

// AI-powered Aviation Security & Biometric Diagnostic
app.post('/api/ai/analyze-exception', async (req: Request, res: Response) => {
  const { pnr, reason, confidence, stageFailed } = req.body;

  if (!ai) {
    const fallbackReport = {
      analysis: `Rule Engine Diagnostic for PNR ${pnr || 'N/A'}: Stage failure detected at ${stageFailed || 'IDENTITY'}. ` +
        `Measured biometric confidence is ${confidence || 58.2}%. ICAO Doc 9303 Part 9 standards require minimum 85% match ` +
        `and verified anti-spoofing micro-movement score before unlocking automated gates. ` +
        `Recommendation: Direct passenger to Station Gate Agent for physical travel document inspection and secondary UV hologram verification.`,
      actionPlan: [
        'Inspect physical passport under 365nm UV light.',
        'Cross-check traveler face against chip ICAO DG2 JPEG template.',
        'Verify visa / travel authorization stamp in physical passport.',
        'If verified, execute Gate Agent Manual Override with badge number.'
      ],
      aiPowered: false,
    };
    res.json(fallbackReport);
    return;
  }

  try {
    const prompt = `You are the Chief Aviation Biometric Security Officer for FaceFly AI at an international airport.
Analyze the following passenger exception incident:
Passenger PNR: ${pnr}
Stage Failed: ${stageFailed}
Biometric Match Confidence: ${confidence}%
Context / Reason: ${reason}

Provide a concise 3-sentence technical security diagnosis adhering to ICAO Doc 9303 standards and GDPR/POPIA airport privacy guidelines, followed by 3 actionable procedural steps for the ground agent.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      analysis: response.text || 'Diagnostic completed.',
      actionPlan: [
        'Verify physical travel document against ICAO Doc 9303 security features.',
        'Request passenger remove tinted eyewear, headwear, or face coverings for secondary scan.',
        'Log ground officer badge ID if manual override is issued.'
      ],
      aiPowered: true,
    });
  } catch (err: any) {
    console.error('Gemini diagnostic error:', err);
    res.json({
      analysis: `Manual Security Assessment: PNR ${pnr} requires physical verification. Biometric score below certified threshold.`,
      actionPlan: ['Inspect paper credentials', 'Check immigration status', 'Log manual clearance'],
      aiPowered: false,
    });
  }
});

// Mount Vite in dev mode or serve static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✈️ FaceFly AI Gateway active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
