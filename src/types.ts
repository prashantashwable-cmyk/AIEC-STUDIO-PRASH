export type UserRole = 'admin' | 'surveyor' | 'technician' | 'customer' | 'supplier';
export type UserStatus = 'active' | 'pending' | 'inactive';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  status: UserStatus;
  avatarUrl?: string;
  region?: string;
  isDemo?: boolean;
  onboardingCompleted?: boolean;
  aadhaarOrPanDoc?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  bankVerifiedStatus?: 'verified' | 'failed' | 'pending';
  preferredZones?: string[];
  twoWheelerOwned?: boolean;
  email?: string;
  // Technician properties
  skillTags?: string[];
  certificateDocs?: string[];
  liabilityInsuranceDoc?: string;
  insuranceExpiryDate?: string;
  sopAcknowledgedFlag?: boolean;
  insuranceStatus?: 'active' | 'warning' | 'expired';
  // Supplier properties
  gstin?: string;
  companyName?: string;
  authorizedSignatoryName?: string;
  catalogSeedFile?: string;
  catalogSeedItems?: { name: string; price: number; sku: string }[];
  paymentTermsAcceptedFlag?: boolean;
  // Customer properties
  siteAddress?: string;
  communicationConsentFlags?: { sms: boolean; whatsapp: boolean; email: boolean };
  loginPreference?: 'password' | 'otp';
  passwordHash?: string;
  location_permission_status?: 'granted' | 'denied' | 'prompt' | 'unsupported';
  camera_permission_status?: 'granted' | 'denied' | 'prompt' | 'unsupported';
  notification_permission_status?: 'granted' | 'denied' | 'prompt' | 'unsupported';
  primer_shown_flag?: boolean;
  primer_shown_timestamp?: string;
  preferred_language?: 'en' | 'hi' | 'mr';
  theme_preference?: 'light' | 'snow' | 'dark' | 'system';
}

export type LeadStage = 'captured' | 'assigned' | 'contacted' | 'survey_done' | 'quoted' | 'negotiating' | 'closed_won' | 'closed_lost';

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  role?: 'owner' | 'contractor' | 'architect' | 'facility_manager' | '';
  companyName?: string;
  consentGiven?: boolean;
  noDirectContact?: boolean;
  relationshipNote?: string;
}

export interface BuildingInfo {
  address: string;
  floors: number;
  type: 'residential' | 'commercial' | 'industrial' | 'institutional' | 'mixed-use';
  driveType?: 'traction' | 'hydraulic' | 'machine-room-less';
  capacityPersons?: number;
  latitude?: number;
  longitude?: number;
  floor_count?: number;
  usage_type?: 'residential' | 'commercial' | 'institutional' | 'mixed-use';
  construction_stage?: 'foundation' | 'structure-up' | 'finishing' | 'ready';
  shaft_dimensions_estimate?: string;
  is_shaft_inaccessible?: boolean;
  is_mixed_use?: boolean;
  mixed_category_detail?: string;
  is_unusually_tall?: boolean;
  special_notes?: string;
  passenger_capacity_estimate?: number;
  shaft_sketch_data_url?: string;
}

export interface Lead {
  id: string;
  stage: LeadStage;
  surveyorId?: string;
  contactInfo: ContactInfo;
  buildingInfo: BuildingInfo;
  createdAt: string;
  updatedAt: string;
  commissionEarned?: number;
  gps_lat_lng?: string;
  gps_accuracy_meters?: number;
  site_photos?: { prompt: string; dataUrl: string; timestamp: string; geotag: string; isLive: boolean }[];
  capture_timestamp?: string;
  nearest_landmark_note?: string;
  is_duplicate_flagged?: boolean;
  duplicate_of_lead_id?: string;
  duplicate_distance_meters?: number;
  surveyor_duplicate_decision?: 'cancel' | 'override_proceed';
  surveyor_duplicate_reason?: string;
  loss_reason?: 'Price' | 'Timeline' | 'Chose Competitor' | 'Site Not Ready' | 'Unresponsive' | 'Not a Fit';
  loss_note?: string;
  revisit_reminder_date?: string;
  marked_lost_by?: string;
  lostAt?: string;
}

export type DealStatus = 'pending' | 'closed' | 'cancelled';

export interface Deal {
  id: string;
  leadId: string;
  status: DealStatus;
  agreedPrice: number;
  advancePaid: boolean;
  specs: {
    floors: number;
    driveType: string;
    capacity: string;
    cabinStyle: string;
  };
  createdAt: string;
}

export type JobStatus = 'pending' | 'in_progress' | 'qc_pending' | 'completed';

export interface SopStep {
  id: string;
  label: string;
  completed: boolean;
  photoUrl?: string;
  verifiedAt?: string;
}

export interface Job {
  id: string;
  dealId: string;
  technicianId?: string;
  status: JobStatus;
  sopSteps: SopStep[];
  startedAt?: string;
  completedAt?: string;
}

export type PaymentStage = 'Advance (30%)' | 'Material Delivery (40%)' | 'Installation Start (20%)' | 'Handover & QC (10%)' | string;
export type PaymentStatus = 'unpaid' | 'paid' | 'pending' | 'overdue' | 'disputed' | 'partial';

export interface Payment {
  id: string;
  dealId: string;
  stage: PaymentStage;
  amount: number;
  paidAmount?: number;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  daysOverdue?: number;
  paymentMethod?: 'UPI' | 'NEFT' | 'Cheque' | 'Cash' | 'Bank Transfer' | 'Gateway';
  referenceNo?: string;
  isDisputed?: boolean;
  disputeReason?: string;
  disputeLoggedAt?: string;
  isPaused?: boolean;
  pauseReason?: string;
  pausedAt?: string;
  salesOwner?: string;
  customerName?: string;
  siteName?: string;
  isHighValue?: boolean;
}

export interface ReminderRule {
  id: string;
  daysOffset: number; // e.g. -3 (3 days before due), 0 (on due date), 3 (3 days overdue), 7 (7 days overdue), 15 (15 days overdue)
  title: string;
  channel: 'SMS' | 'WhatsApp' | 'Email' | 'Call Task';
  tone: 'Friendly Nudge' | 'Standard Invoice' | 'Firm Notice' | 'Legal Escalation';
  templateId: string;
  templateBody: string;
  isActive: boolean;
  escalationTier: 1 | 2 | 3 | 4;
}

export interface SupplierCatalogItem {
  itemId: string;
  itemName: string;
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  catalog: SupplierCatalogItem[];
  region?: string;
}

export interface Territory {
  id: string;
  name: string;
  polygonCoordinates: { lat: number; lng: number }[];
  assignedSurveyorIds: string[];
  monthlyLeadTarget: number;
  monthlyLeadsCaptured?: number;
  conversionRate?: number;
  color?: string;
}

export interface SiteVisit {
  id: string;
  leadId: string;
  leadName: string;
  claimedAddress: string;
  surveyorId: string;
  surveyorName: string;
  timestamp: string;
  photoUrl: string;
  capturedLatLng: { lat: number; lng: number };
  deviceGpsAccuracyRadius: number; // in meters
  geoMatchConfidence: number; // percentage (0 to 100)
  status: 'pending' | 'approved' | 'flagged';
  flagReason?: string;
  notes?: string;
}

export type EscalationStatus = 'received' | 'acknowledged' | 'resolved';

export interface EmergencyAlert {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: 'surveyor' | 'technician';
  staffPhone: string;
  staffAvatarUrl?: string;
  alertType: 'site_accident' | 'safety_concern' | 'aggressive_customer' | 'vehicle_breakdown';
  alertLocation: string;
  lat: number;
  lng: number;
  escalationStatus: EscalationStatus;
  receivedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  isArchived: boolean;
  cancelledAt?: string; // If triggered accidentally and within 10s cancel window
  escalatedToBackupAt?: string; // If backup SMS channel triggered
}


