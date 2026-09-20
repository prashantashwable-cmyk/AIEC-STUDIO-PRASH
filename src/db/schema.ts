import { pgTable, text, timestamp, boolean, integer, jsonb, serial, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  phoneNumber: text('phone_number'),
  role: text('role').notNull().default('customer'), // 'admin' | 'surveyor' | 'technician' | 'customer' | 'supplier' | 'partner' | 'qc_inspector'
  stateCode: text('state_code').default('MH'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const elevatorContracts = pgTable('elevator_contracts', {
  id: text('id').primaryKey(),
  contractNumber: text('contract_number').notNull().unique(),
  customerId: text('customer_id').notNull().references(() => users.id),
  customerName: text('customer_name').notNull(),
  buildingName: text('building_name').notNull(),
  buildingAddress: text('building_address').notNull(),
  city: text('city').notNull(),
  stateCode: text('state_code').notNull().default('MH'),
  contractType: text('contract_type').notNull(), // 'installation' | 'comprehensive_amc' | 'non_comprehensive_amc' | 'modernization'
  elevatorSpec: jsonb('elevator_spec').notNull(), // { floors, capacityKg, speedMps, driveType, doorType }
  contractValueInr: decimal('contract_value_inr', { precision: 12, scale: 2 }).notNull(),
  gstAmountInr: decimal('gst_amount_inr', { precision: 12, scale: 2 }).notNull(),
  totalAmountInr: decimal('total_amount_inr', { precision: 12, scale: 2 }).notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending' | 'partially_paid' | 'paid' | 'overdue'
  contractStatus: text('contract_status').notNull().default('draft'), // 'draft' | 'active' | 'renewed' | 'expired' | 'terminated'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  stateLiftActClauses: jsonb('state_lift_act_clauses'), // Maharashtra Lift Act 2017 specific tags
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const siteSopsAndInspections = pgTable('site_sops_and_inspections', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull().references(() => elevatorContracts.id),
  assignedTechnicianId: text('assigned_technician_id').notNull().references(() => users.id),
  assignedTechnicianName: text('assigned_technician_name').notNull(),
  sopType: text('sop_type').notNull(), // 'installation_safety' | 'preventive_maintenance' | 'breakdown_sos' | 'qc_audit'
  stepProgress: integer('step_progress').notNull().default(0), // 0 to 100
  lockoutTagoutConfirmed: boolean('lockout_tagout_confirmed').default(false),
  safetyHarnessVerified: boolean('safety_harness_verified').default(false),
  siteGpsCoordinates: jsonb('site_gps_coordinates'), // { lat, lng, accuracyMeters }
  checkInTimestamp: timestamp('check_in_timestamp'),
  checkOutTimestamp: timestamp('check_out_timestamp'),
  checklistData: jsonb('checklist_data').notNull().default({}),
  inspectionPhotos: jsonb('inspection_photos').default([]),
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'flagged'
  qcSignoffNotes: text('qc_signoff_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditLogsMaster = pgTable('audit_logs_master', {
  id: serial('id').primaryKey(),
  actorUserId: text('actor_user_id').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  actionType: text('action_type').notNull(), // 'CREATE_CONTRACT', 'SIGN_SOP', 'DATA_EXPORT', 'PERMISSION_OVERRIDE', 'TERMINATE_SESSION'
  entityType: text('entity_type').notNull(), // 'contract', 'sop', 'user', 'system_setting', 'payment'
  entityId: text('entity_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  auditPayload: jsonb('audit_payload'),
  severity: text('severity').notNull().default('INFO'), // 'INFO' | 'WARNING' | 'CRITICAL'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const breakdownAlertsSos = pgTable('breakdown_alerts_sos', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull().references(() => elevatorContracts.id),
  reportedByUserId: text('reported_by_user_id').notNull().references(() => users.id),
  elevatorIdentifier: text('elevator_identifier').notNull(),
  severityLevel: text('severity_level').notNull().default('HIGH'), // 'CRITICAL_TRAPPED_PASSENGER' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: text('status').notNull().default('open'), // 'open' | 'van_dispatched' | 'technician_on_site' | 'resolved'
  assignedTechnicianId: text('assigned_technician_id').references(() => users.id),
  estimatedArrivalMinutes: integer('estimated_arrival_minutes'),
  vibrationTelematicsData: jsonb('vibration_telematics_data'),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
