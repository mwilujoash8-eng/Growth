export type UserRole = 
  | 'PLATFORM_SUPER_ADMIN' 
  | 'AIRLINE_ADMIN' 
  | 'AIRPORT_OPERATIONS_STAFF' 
  | 'SECURITY_REVIEWER' 
  | 'PASSENGER'
  | 'SYSTEM_AUTOMATION';

export type StationType = 'KIOSK' | 'BAG_DROP' | 'SECURITY_EGATE' | 'BOARDING_GATE';

export interface AirlineTenant {
  id: string;
  name: string;
  iataCode: string;
  country: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  homeAirport: string;
  tier: SubscriptionTier;
  monthlyFee: number;
  currency: CurrencyCode;
  contactEmail: string;
  staffCount: number;
  approvedGatesCount: number;
  createdAt: string;
}

export interface AirlineWorkflowConfig {
  tenantId: string;
  minBiometricConfidence: number; // 80 - 95%
  livenessStrictness: 'STANDARD' | 'HIGH' | 'MAXIMUM_3D_VASCULAR';
  requireCheckInBeforeBiometric: boolean;
  requireDangerousGoodsDeclaration: boolean;
  requireVisaCheckForRegional: boolean;
  allowMobileDigitalPassAutoBoarding: boolean;
  offlineEdgePrecacheHours: number;
  supervisorOverrideRequired: boolean;
}

export interface AirlineAirportLocation {
  id: string;
  tenantId: string;
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
  terminals: string[];
  authorizedGates: string[];
  activeStatus: 'OPERATIONAL' | 'MAINTENANCE' | 'PLANNED';
  installedGatesCount: number;
}

export interface StaffMember {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  badgeNumber: string;
  role: UserRole;
  assignedAirport: string;
  assignedStations: string[];
  status: 'ACTIVE' | 'REVOKED';
  lastActive: string;
}

export interface PassengerCorrectionRequest {
  id: string;
  pnr: string;
  passengerName: string;
  fieldRequested: string;
  currentValue: string;
  requestedValue: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
}

export type CurrencyCode = 'ZMW' | 'USD' | 'KES' | 'ZAR' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  monthlySubscriptionRate: number; // e.g. K19,000 in ZMW, $950 in USD
  exchangeRateToZMW: number;
}

export type SubscriptionTier = 'REGIONAL_FEEDER' | 'CONTINENTAL_FLEET' | 'GLOBAL_FLAGSHIP';

export interface AirlineSubscription {
  id: string;
  airlineName: string;
  iataCode: string;
  country: string;
  homeBaseIata: string;
  tier: SubscriptionTier;
  monthlyPrice: number;
  currency: CurrencyCode;
  status: 'ACTIVE' | 'TRIAL' | 'PENDING_RENEWAL';
  licensedGates: number;
  activeAirports: string[];
  maxMonthlyScans: number;
  currentMonthScans: number;
  contractStartDate: string;
  nextBillingDate: string;
  apiKey: string;
  webhookUrl: string;
  slaUptime: number; // e.g. 99.99
}

export type ClearanceStageStatus = 'PASSED' | 'PENDING' | 'FAILED' | 'BLOCKED';

export interface FlightOperation {
  id: string;
  tenantId: string;
  flightNumber: string;
  airlineName: string;
  airlineCode: string;
  originAirport: string;
  destinationAirport: string;
  scheduledDeparture: string;
  actualDeparture?: string;
  gate: string;
  terminal: string;
  aircraftType: string;
  totalSeats: number;
  checkedInCount: number;
  biometricVerifiedCount: number;
  boardedCount: number;
  status: 'SCHEDULED' | 'CHECKIN_OPEN' | 'BOARDING' | 'FINAL_CALL' | 'CLOSED' | 'DEPARTED';
}

export interface PassengerBooking {
  id: string;
  tenantId: string; // Tenant isolation key
  pnr: string; // 6-character PNR like KQ781A, ZB904X
  flightNumber: string;
  airlineName: string;
  airlineCode: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  gate: string;
  seat: string;
  passengerName: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  mrzLine1: string;
  mrzLine2: string;
  photoUrl: string;
  biometricEnrolled: boolean;
  biometricTemplateHash: string;
  
  // The 5 strict aviation workflow stages
  bookingStatus: ClearanceStageStatus; // 1. Booking valid & ticketed
  identityStatus: ClearanceStageStatus; // 2. Biometric match passed
  checkInStatus: ClearanceStageStatus; // 3. Seat chosen, luggage checked
  securityStatus: ClearanceStageStatus; // 4. Customs, watchlist & border control
  boardingStatus: ClearanceStageStatus; // 5. Final gate clearance
  
  // Additional operational details
  visaRequirement: 'NOT_REQUIRED' | 'VERIFIED_VALID' | 'PENDING_DOCUMENT_CHECK' | 'INVALID';
  baggageCount: number;
  baggageTagIds: string[];
  dangerousGoodsDeclared: boolean;
  securityWatchlistFlag: 'NONE' | 'INTERPOL_INQUIRY' | 'TRAVEL_BAN' | 'MANUAL_INSPECTION_REQUIRED';
  biometricConfidence: number; // 0 - 100%
  livenessConfidence: number; // 0 - 100%
  processingLatencyMs: number;
  lastTouchpoint: StationType | 'NONE';
  lastProcessedAt?: string;
  agentNotes?: string;
}

export interface BiometricStationNode {
  id: string;
  name: string;
  stationType: StationType;
  airportCode: string; // e.g. "LUN", "NBO", "JNB", "ADD"
  airportName: string;
  terminal: string;
  gateLocation: string;
  ipAddress: string;
  rtspStream: string;
  cameraHardware: string;
  mrzScannerHardware: string;
  status: 'ONLINE' | 'ACTIVE_PROCESSING' | 'STANDBY' | 'MAINTENANCE';
  hardwareBridge: 'ONVIF_PROFILE_S' | 'WEBRTC_SECURE' | 'RTSP_H264' | 'USB_ICAO_DRIVER';
  firmwareVersion: string;
  throughputPerHour: number;
  averageLatencyMs: number;
  totalScansToday: number;
  mismatchesToday: number;
}

export interface SecurityAuditRecord {
  id: string;
  timestamp: string;
  eventType: 
    | 'BIOMETRIC_MATCH_SUCCESS' 
    | 'BIOMETRIC_SPOOF_BLOCKED' 
    | 'BIOMETRIC_CONFIDENCE_LOW' 
    | 'BOARDING_AUTHORIZED' 
    | 'BOARDING_DENIED_CHECKIN_INCOMPLETE' 
    | 'BOARDING_DENIED_SECURITY_FLAG' 
    | 'MANUAL_AGENT_OVERRIDE' 
    | 'PASSPORT_MRZ_DECODED' 
    | 'SUBSCRIPTION_RENEWAL_BILLED';
  severity: 'INFO' | 'NOTICE' | 'WARNING' | 'ALERT';
  actorRole: UserRole;
  actorIdentifier: string;
  pnr?: string;
  passengerName?: string;
  stationId: string;
  details: string;
  cryptographicProof: string; // SHA-256 hash
}

export interface SystemBenchmark {
  category: string;
  faceFlyScore: string;
  chinaDaxingScore: string;
  sitaSmartPathScore: string;
  visionBoxScore: string;
  advantageNote: string;
}

export interface AirportHub {
  code: string;
  city: string;
  country: string;
  name: string;
  activeAirlinesCount: number;
  installedGatesCount: number;
  dailyPassengers: number;
}
