import { updateFirestoreUser } from './firestoreUsers';
import { User, Lead, Deal, Job, Payment, Supplier, PurchaseOrder, POLineItem, UserRole, Territory, SiteVisit, EmergencyAlert, ReminderRule, LoanApplication, LoanPartner, Invoice, EscalationItem, DisputeItem, AutoPoTriggerRule, ProductionStatusRecord, SupplierScorecardDetail, OrderRatingEntry, SupplierContractSlaRecord, SupplierCommunicationThread, SupplierChatMessage, SupplierPaymentTermsConfig, DeliverySchedule, LiveShipmentTracker, ShipmentTrackingLeg, SiteReadinessChecklist, SiteDeliveryChecklist, SiteDeliveryChecklistItem, DiscrepancyReport, MaterialReceivedConfirmation, ConfirmingParty, DeliveryDelayAlert, StockInTransitItem, DeliverySopTemplate, DamagedMissingPartsReport, DeliveryPartner, RateCardEntry, DeliveryAnalyticsSummary, SupplierPaymentRecord, PaymentMilestoneItem, PaymentOverrideRecord, SupplierInvoiceDoc, SupplierInvoiceLineItem, ThreeWayMatchResult, ScheduledPaymentEntry, PaymentHistoryRecord, TaxGstComplianceRecord, SupplierGstinStatusRecord, SupplierDisputeRecord, DisputeAuditEntry, AdvanceExposureRecord, RetentionHoldRecord, SupplierPaymentAnalyticsRecord, ReconciliationRunRecord, TechnicianJob, TechnicianProfileSummary, InstallationSopStep, InstallationEvidenceItem, TechnicianCheckInRecord, SafetyComplianceItem, TechnicianIssueReport, MaterialUsageLogItem, ReworkAssignmentRecord, FinalHandoverChecklistRecord, CustomerHandoverWalkthroughRecord, WarrantyAmcRegistrationRecord, HandoverCompletionCertificateRecord, QcInspectorAssignmentRecord, QcMechanicalCheckItem, QcMechanicalReport, QcElectricalSafetyCheckItem, QcElectricalReport, ComplianceCertificateRecord, DefectSnagRecord, RecruitmentApplicantRecord, OfferAgreementRecord, PartnerTierAssignmentRecord, MasterPartnerDirectoryRecord, PartnerDeactivationExitRecord, TrainingModule, TrainingLesson, PartnerModuleProgress, PartnerLessonProgress, SopDocument, CertificationAssessment, AssessmentAttemptResult, CertificationBadge, PartnerBadgeRecord, TrainingModuleFeedback, TrainingFeedbackSummary, CommissionRule, CommissionRuleVersionHistory, CommissionPayoutEntry, CommissionPayoutSummary, AutomatedDisbursementRecord, CompetitionContest, LeaderboardEntry, UnifiedBadgeMilestone, PayoutStatementSummary, SkillCapabilityCategory, TechnicianSkillMatrixRow, PartnerComplianceRecord, ComplianceTrendMetric, SopRolloutNotification, PartnerRolloutAcknowledgment, TdsStatementRecord, PayoutDisputeRecord, CustomerProjectSummary, CustomerVaultDocument, CustomerPaymentInstallment, CustomerSupportTicket, CustomerSupportChatMessage, CustomerSupportChatThread, CustomerFeedbackEntry, CustomerAmcBooking, CustomerReferralEntry, CustomerInAppNotification, CustomerNotificationPreferences, AutomationRuleCategorySummary, AutomationRuleActivityLog, CustomWorkflowTriggerRule, InternalNotificationTemplate, EscalationChainConfig, SlaProcessItem, SlaCategoryTrend, TechnicalIncidentLog, IntegrationTechnicalHealth, AutomatedActionAuditEntry, ManualOverrideLogEntry, ApiIntegrationConfig, AutomationTestScenario, CompanyProfileConfig, BrandVersionRecord, RolePermissionConfig, UserPermissionOverride, PermissionChangeAuditEntry, MonitorSignalConfig, DailyMonitorCheckLog, BackupMonitorContact, DataSubjectConsentRecord, DataSubjectRequest, DataRetentionCategoryConfig, PrivacyPolicyVersionRecord, RoleTwoFactorPolicy, ActiveUserSession, SecurityEventLog, PasswordPolicyConfig, DatabaseBackupRunRecord, DataExportJobRecord, DisasterRestorePointInfo, SaaSUsageServiceConfig, SaaSBillingInvoiceRecord, LegalContractTemplateRecord, StateLiftActClauseItem, LegalReviewAuditLog } from '../types';


// Seed Data
const initialUsers: User[] = [
  {
    id: 'admin_prashant',
    role: 'admin',
    name: 'Mr. Prashant Vasant Wable',
    phone: '+91 98765 43210',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    region: 'Mumbai HQ'
  },
  {
    id: 'amit_sharma',
    role: 'surveyor',
    name: 'Amit Sharma',
    phone: '+91 98765 43211',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    region: 'Pune North'
  },
  {
    id: 'sanjay_deshmukh',
    role: 'surveyor',
    name: 'Sanjay Deshmukh',
    phone: '+91 99887 76655',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    region: 'Pune West'
  },
  {
    id: 'rajesh_patel',
    role: 'technician',
    name: 'Rajesh Patel',
    phone: '+91 98765 43212',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    region: 'Pune South'
  },
  {
    id: 'sun_elevators',
    role: 'supplier',
    name: 'Sun Elevators Manufacturing',
    phone: '+91 98765 43213',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    region: 'Chakan Industrial Area'
  },
  {
    id: 'rohan_deshmukh',
    role: 'customer',
    name: 'Rohan Deshmukh',
    phone: '+91 98765 43214',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    region: 'Kothrud, Pune'
  }
];

const initialLeads: Lead[] = [
  {
    id: 'lead_1',
    stage: 'quoted',
    surveyorId: 'amit_sharma',
    contactInfo: {
      name: 'Rohan Deshmukh',
      phone: '+91 98765 43214',
      email: 'rohan.d@deshmukhbuilders.com'
    },
    buildingInfo: {
      address: 'Plot 45, Deshmukh Arcade, Kothrud, Pune, Maharashtra 411038',
      floors: 5,
      type: 'commercial',
      driveType: 'traction',
      capacityPersons: 6,
      latitude: 18.5074,
      longitude: 73.8077
    },
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-05T14:30:00Z'
  },
  {
    id: 'lead_2',
    stage: 'captured',
    surveyorId: 'amit_sharma',
    contactInfo: {
      name: 'Suresh Patil',
      phone: '+91 91234 56789',
      email: 'suresh.patil@outlook.com'
    },
    buildingInfo: {
      address: 'Shanti Niwas Co-op Housing Society, Erandwane, Pune 411004',
      floors: 4,
      type: 'residential',
      driveType: 'hydraulic',
      capacityPersons: 4,
      latitude: 18.5112,
      longitude: 73.8344
    },
    createdAt: '2026-07-06T11:15:00Z',
    updatedAt: '2026-07-06T11:15:00Z'
  },
  {
    id: 'lead_3',
    stage: 'closed_won',
    surveyorId: 'amit_sharma',
    contactInfo: {
      name: 'Vikas Mehta',
      phone: '+91 95555 66666',
      email: 'v.mehta@techpark62.com'
    },
    buildingInfo: {
      address: 'Survey No. 62, Hinjewadi Phase 1, Pune, Maharashtra 411057',
      floors: 8,
      type: 'commercial',
      driveType: 'traction',
      capacityPersons: 8,
      latitude: 18.5913,
      longitude: 73.7389
    },
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-28T16:45:00Z',
    commissionEarned: 25000
  }
];

const initialDeals: Deal[] = [
  {
    id: 'deal_1',
    leadId: 'lead_3',
    status: 'closed',
    agreedPrice: 1250000,
    advancePaid: true,
    specs: {
      floors: 8,
      driveType: 'Gearless Traction',
      capacity: '8 Persons (544 kg)',
      cabinStyle: 'Premium Stainless Steel (Hairline Finish) with Glass Mirror'
    },
    createdAt: '2026-06-28T17:00:00Z'
  }
];

const initialJobs: Job[] = [
  {
    id: 'job_1',
    dealId: 'deal_1',
    technicianId: 'rajesh_patel',
    status: 'in_progress',
    startedAt: '2026-07-01T08:00:00Z',
    sopSteps: [
      { id: 'sop_1', label: 'Site Shaft Cleanliness & Buffer Installation', completed: true, verifiedAt: '2026-07-02T11:00:00Z' },
      { id: 'sop_2', label: 'Guide Rail Alignment & Bracket Fixing', completed: true, verifiedAt: '2026-07-04T15:30:00Z' },
      { id: 'sop_3', label: 'Cabin Frame & Counterweight Assembly', completed: false },
      { id: 'sop_4', label: 'Traction Machine & Steel Rope Reeling', completed: false },
      { id: 'sop_5', label: 'Electrical Wiring & Controller Hookup', completed: false },
      { id: 'sop_6', label: 'Safety Gear Testing & Elevator Calibration', completed: false }
    ]
  }
];

const initialPayments: Payment[] = [
  {
    id: 'pay_1',
    dealId: 'deal_1',
    stage: 'Advance (30%)',
    amount: 375000,
    paidAmount: 375000,
    status: 'paid',
    dueDate: '2026-06-28',
    paidAt: '2026-06-29T10:30:00Z',
    paymentMethod: 'Bank Transfer',
    referenceNo: 'HDFC-TXN-998124',
    customerName: 'Deshmukh Arcade',
    siteName: 'Kothrud, Pune',
    salesOwner: 'Amit Sharma',
    isHighValue: true
  },
  {
    id: 'pay_2',
    dealId: 'deal_1',
    stage: 'Material Delivery (40%)',
    amount: 500000,
    paidAmount: 500000,
    status: 'paid',
    dueDate: '2026-07-15',
    paidAt: '2026-07-02T14:15:00Z',
    paymentMethod: 'UPI',
    referenceNo: 'UPI/62811094821',
    customerName: 'Deshmukh Arcade',
    siteName: 'Kothrud, Pune',
    salesOwner: 'Amit Sharma',
    isHighValue: true
  },
  {
    id: 'pay_3',
    dealId: 'deal_1',
    stage: 'Installation Start (20%)',
    amount: 250000,
    paidAmount: 100000,
    status: 'partial',
    dueDate: '2026-07-25',
    daysOverdue: 18,
    paymentMethod: 'NEFT',
    referenceNo: 'PARTIAL-NEFT-8841',
    customerName: 'Deshmukh Arcade',
    siteName: 'Kothrud, Pune',
    salesOwner: 'Amit Sharma',
    isHighValue: true
  },
  {
    id: 'pay_4',
    dealId: 'deal_1',
    stage: 'Handover & QC (10%)',
    amount: 125000,
    paidAmount: 0,
    status: 'pending',
    dueDate: '2026-08-25',
    customerName: 'Deshmukh Arcade',
    siteName: 'Kothrud, Pune',
    salesOwner: 'Amit Sharma'
  },
  {
    id: 'pay_5',
    dealId: 'deal_2',
    stage: 'Advance (30%)',
    amount: 450000,
    paidAmount: 0,
    status: 'overdue',
    dueDate: '2026-07-28',
    daysOverdue: 15,
    customerName: 'Wable Realtors & Developers',
    siteName: 'Shree Sai Heights Phase 1',
    salesOwner: 'Sanjay Deshmukh',
    isHighValue: true
  },
  {
    id: 'pay_6',
    dealId: 'deal_3',
    stage: 'Initial Engineering Signoff (40%)',
    amount: 1200000,
    paidAmount: 0,
    status: 'overdue',
    dueDate: '2026-08-01',
    daysOverdue: 11,
    customerName: 'Siddharth NRI Estates',
    siteName: 'Prashant Platinum Villa',
    salesOwner: 'Mr. Prashant Vasant Wable',
    isHighValue: true
  },
  {
    id: 'pay_7',
    dealId: 'deal_4',
    stage: 'Motor Room Slabs (25%)',
    amount: 280000,
    paidAmount: 0,
    status: 'disputed',
    dueDate: '2026-07-20',
    daysOverdue: 23,
    isDisputed: true,
    disputeReason: 'Client requested civil dimensions re-audit before releasing slab payment.',
    disputeLoggedAt: '2026-07-22T11:00:00Z',
    customerName: 'Mehta Heights',
    siteName: 'Hinjewadi Phase 1, Pune',
    salesOwner: 'Sanjay Deshmukh'
  },
  {
    id: 'pay_8',
    dealId: 'deal_5',
    stage: 'Guide Rail Erection (20%)',
    amount: 180000,
    paidAmount: 0,
    status: 'pending',
    dueDate: '2026-08-18',
    isPaused: true,
    pauseReason: 'Customer confirmed payment delayed to 15th Aug by phone due to site power hookup.',
    pausedAt: '2026-08-05T09:30:00Z',
    customerName: 'Shanti Niwas Co-op',
    siteName: 'Erandwane, Pune',
    salesOwner: 'Amit Sharma'
  }
];

const initialReminderRules: ReminderRule[] = [
  {
    id: 'rule_1',
    daysOffset: -3,
    title: 'Pre-Due Upcoming Courtesy Nudge',
    channel: 'WhatsApp',
    tone: 'Friendly Nudge',
    templateId: 'tpl_whatsapp_pre_due',
    templateBody: 'Dear {{customer_name}}, a gentle reminder that stage payment {{stage_name}} of ₹{{amount}} for {{site_name}} is due on {{due_date}}. Tap here to pay via UPI or view invoice: {{payment_link}}',
    isActive: true,
    escalationTier: 1
  },
  {
    id: 'rule_2',
    daysOffset: 0,
    title: 'Due Date Official Digital Invoice',
    channel: 'SMS',
    tone: 'Standard Invoice',
    templateId: 'tpl_sms_due_today',
    templateBody: 'AIEC Notice: Stage payment {{stage_name}} of ₹{{amount}} for deal {{deal_id}} is due today ({{due_date}}). Please process via NEFT/UPI or call your account manager.',
    isActive: true,
    escalationTier: 1
  },
  {
    id: 'rule_3',
    daysOffset: 3,
    title: 'Post-Due First Grace Nudge',
    channel: 'WhatsApp',
    tone: 'Firm Notice',
    templateId: 'tpl_whatsapp_post_due_3',
    templateBody: 'Hello {{customer_name}}, stage payment {{stage_name}} of ₹{{amount}} was due on {{due_date}} (3 days overdue). Kindly share payment UTR or initiate payment here: {{payment_link}}',
    isActive: true,
    escalationTier: 2
  },
  {
    id: 'rule_4',
    daysOffset: 7,
    title: 'Post-Due Escalated Notice & Admin Task',
    channel: 'Email',
    tone: 'Firm Notice',
    templateId: 'tpl_email_post_due_7',
    templateBody: 'URGENT: Outstanding payment of ₹{{amount}} for {{site_name}} is now 7 days overdue. Material dispatch or site erection schedules may be impacted.',
    isActive: true,
    escalationTier: 3
  },
  {
    id: 'rule_5',
    daysOffset: 15,
    title: 'Severe Overdue Direct Call Task',
    channel: 'Call Task',
    tone: 'Legal Escalation',
    templateId: 'tpl_call_admin_severe',
    templateBody: 'Admin Priority Call Task: Overdue amount ₹{{amount}} is 15+ days overdue for {{customer_name}}. Direct phone escalation required.',
    isActive: true,
    escalationTier: 4
  }
];

const initialLoanPartners: LoanPartner[] = [
  {
    id: 'bajaj_finserv',
    name: 'Bajaj Finserv Commercial EMI',
    code: 'BAJAJ_EMI',
    interestRate: 10.5,
    maxTenureMonths: 36,
    minTenureMonths: 6,
    approvalRatePercentage: 92,
    avgDisbursementDays: 1.5,
    escalationContactName: 'Rajesh Malhotra (Key Account Manager)',
    escalationContactPhone: '+91 98220 11223',
    escalationContactEmail: 'rajesh.m@bajajfinserv.in'
  },
  {
    id: 'hdfc_commercial',
    name: 'HDFC Bank Infra Equipment Finance',
    code: 'HDFC_INFRA',
    interestRate: 9.8,
    maxTenureMonths: 48,
    minTenureMonths: 12,
    approvalRatePercentage: 88,
    avgDisbursementDays: 2.0,
    escalationContactName: 'Priya Kulkarni (Nodal Desk)',
    escalationContactPhone: '+91 98901 44556',
    escalationContactEmail: 'priya.k@hdfcbank.com'
  },
  {
    id: 'tata_capital',
    name: 'Tata Capital Equipment Loan',
    code: 'TATA_CAP',
    interestRate: 10.2,
    maxTenureMonths: 36,
    minTenureMonths: 6,
    approvalRatePercentage: 90,
    avgDisbursementDays: 1.8,
    escalationContactName: 'Vikram Mehta (Zonal Lead)',
    escalationContactPhone: '+91 97654 33211',
    escalationContactEmail: 'v.mehta@tatacapital.com'
  }
];

const initialLoanApplications: LoanApplication[] = [
  {
    id: 'loan_app_101',
    dealId: 'deal_2',
    customerId: 'cust_wable_dev',
    customerName: 'Wable Realtors & Developers',
    customerPhone: '+91 98221 45678',
    requestedAmount: 450000,
    tenureMonths: 12,
    partnerId: 'bajaj_finserv',
    partnerName: 'Bajaj Finserv Commercial EMI',
    interestRateAnnual: 10.5,
    monthlyEmiAmount: 39662,
    totalRepaymentAmount: 475944,
    monthlyIncomeRange: '₹5,00,000 - ₹10,00,000',
    status: 'Disbursed',
    disbursementAmountReceived: 450000,
    disbursementDate: '2026-08-02',
    disbursementTxnRef: 'BAJAJ-DISB-99812',
    createdAt: '2026-07-29T10:00:00Z',
    updatedAt: '2026-08-02T14:30:00Z'
  },
  {
    id: 'loan_app_102',
    dealId: 'deal_3',
    customerId: 'cust_siddharth',
    customerName: 'Siddharth NRI Estates',
    customerPhone: '+91 97640 12345',
    requestedAmount: 1200000,
    tenureMonths: 24,
    partnerId: 'hdfc_commercial',
    partnerName: 'HDFC Bank Infra Equipment Finance',
    interestRateAnnual: 9.8,
    monthlyEmiAmount: 55280,
    totalRepaymentAmount: 1326720,
    monthlyIncomeRange: '₹10,00,000+',
    status: 'Approved',
    isDisbursementDelayed: true,
    partnerStatusNote: 'Approved by HDFC Credit Desk. Pending final bank NOC disbursement signoff.',
    createdAt: '2026-08-03T11:15:00Z',
    updatedAt: '2026-08-06T16:00:00Z'
  },
  {
    id: 'loan_app_103',
    dealId: 'deal_1',
    customerId: 'cust_deshmukh',
    customerName: 'Deshmukh Arcade',
    customerPhone: '+91 98900 88776',
    requestedAmount: 250000,
    tenureMonths: 6,
    partnerId: 'tata_capital',
    partnerName: 'Tata Capital Equipment Loan',
    interestRateAnnual: 10.2,
    monthlyEmiAmount: 42910,
    totalRepaymentAmount: 257460,
    monthlyIncomeRange: '₹2,00,000 - ₹5,00,000',
    status: 'Under Review',
    partnerStatusNote: 'GST Return & Bank statement verification under audit.',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-10T09:00:00Z'
  }
];

const initialInvoices: Invoice[] = [
  {
    id: 'INV-2026-001',
    dealId: 'deal_1',
    paymentId: 'pay_1',
    customerName: 'Deshmukh Arcade',
    customerGstin: '27AABCD1234F1Z1',
    type: 'Stage Invoice',
    stageName: 'Advance (30%)',
    taxableValue: 127118,
    gstRate: 18,
    gstAmount: 22882,
    totalAmount: 150000,
    issuedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'INV-2026-002',
    dealId: 'deal_2',
    paymentId: 'pay_3',
    customerName: 'Wable Realtors & Developers',
    customerGstin: '27AAACW5678G1Z5',
    type: 'Stage Invoice',
    stageName: 'Material Delivery (40%)',
    taxableValue: 190678,
    gstRate: 18,
    gstAmount: 34322,
    totalAmount: 225000,
    issuedAt: '2026-08-05T14:20:00Z'
  }
];

const initialEscalationItems: EscalationItem[] = [
  {
    id: 'ESC-8801',
    dealId: 'deal_3',
    paymentId: 'pay_4',
    customerName: 'Siddharth NRI Estates',
    customerPhone: '+91 97640 12345',
    overdueAmount: 180000,
    overdueDays: 14,
    escalationTier: 'Tier 3: Consider Installation Hold',
    status: 'Pending Action',
    createdAt: '2026-08-08T09:00:00Z'
  },
  {
    id: 'ESC-8802',
    dealId: 'deal_1',
    paymentId: 'pay_2',
    customerName: 'Deshmukh Arcade',
    customerPhone: '+91 98900 88776',
    overdueAmount: 125000,
    overdueDays: 5,
    escalationTier: 'Tier 1: Gentle Call Needed',
    status: 'Call Logged',
    callOutcome: 'Promised RTGS payment by 15th August.',
    customerPromiseDate: '2026-08-15',
    createdAt: '2026-08-10T11:30:00Z'
  }
];

const initialDisputeItems: DisputeItem[] = [
  {
    id: 'DISP-9901',
    paymentId: 'pay_2',
    dealId: 'deal_1',
    customerName: 'Deshmukh Arcade',
    customerPhone: '+91 98900 88776',
    originalTransactionId: 'PG-AIEC-44129',
    disputeAmount: 25000,
    disputeReason: 'Door sensor adjustment delay at site during stage 2 delivery',
    supportingEvidence: 'Photos of unadjusted door alignment attached by site manager',
    status: 'Open',
    raisedAt: '2026-08-09T16:00:00Z'
  }
];

const initialSuppliers: Supplier[] = [
  {
    id: 'sun_elevators',
    name: 'Sun Elevators Manufacturing Pvt Ltd',
    contactPerson: 'Rajesh Varma (Managing Director)',
    phone: '+91 98220 55443',
    email: 'orders@sunelevators.co.in',
    gstin: '27AABCS1234F1Z9',
    status: 'active',
    kycStatus: 'Verified',
    specialtyCategories: ['Traction Drives', 'MRL Gearless Machines', 'VVVF Controllers', 'Steel Guide Rails'],
    regionServed: 'Chakan Industrial Area / Pune',
    performanceScore: 96,
    onboardingProgress: 4,
    activeOrdersCount: 3,
    completedOrdersCount: 42,
    catalog: [
      { 
        itemId: 'cat_1', 
        itemName: 'Traction Machine (Gearless 1m/s, 400kg)', 
        price: 250000, 
        category: 'Traction Drives',
        leadTimeDays: 14,
        specification: 'Permanent Magnet Synchronous Motor (PMSM), 380V 3-Phase, 1m/s, 400kg payload, Duty S1',
        lastUpdated: '2026-08-01T10:00:00Z',
        priceHistory: [
          { timestamp: '2026-05-10T09:00:00Z', oldPrice: 240000, newPrice: 250000, changedBy: 'Rajesh Varma (Sun Elevators)', status: 'Approved', reason: 'Copper & Magnet raw material tariff increase' }
        ]
      },
      { 
        itemId: 'cat_2', 
        itemName: 'VVVF Elevator Controller (Integrated)', 
        price: 150000, 
        category: 'VVVF Controllers',
        leadTimeDays: 7,
        specification: '32-Bit Microprocessor, Integrated Inverter Board, 8-Stop Full Collective Dual-Car Duplex',
        lastUpdated: '2026-07-15T14:30:00Z',
        priceHistory: []
      },
      { 
        itemId: 'cat_3', 
        itemName: 'Premium Stainless Steel Cabin (6 Pax)', 
        price: 180000, 
        category: 'Cabins',
        leadTimeDays: 10,
        specification: 'SS 304 Hairline & Mirror Etched Panels, LED False Ceiling, Marble Composite Floor',
        lastUpdated: '2026-08-05T11:20:00Z',
        priceHistory: [
          { timestamp: '2026-08-05T11:20:00Z', oldPrice: 175000, newPrice: 180000, changedBy: 'Sun Elevators Sales', status: 'Approved', reason: 'Steel grade upgrade to SS304' }
        ]
      },
      { 
        itemId: 'cat_4', 
        itemName: 'Steel Guide Rails (T-Type T70/B, Set of 10)', 
        price: 80000, 
        category: 'Steel Guide Rails',
        leadTimeDays: 5,
        specification: 'Machined Cold-Drawn Steel T70/B, 5 Meter Lengths with Fishplates and Bolts',
        lastUpdated: '2026-06-20T08:00:00Z',
        priceHistory: []
      }
    ]
  },
  {
    id: 'apex_drives',
    name: 'Apex Cabin & Mechanicals Works',
    contactPerson: 'Milind Joshi (Head of Sales)',
    phone: '+91 98901 88221',
    email: 'sales@apexcabins.in',
    gstin: '27AAACA9876E1Z2',
    status: 'active',
    kycStatus: 'Verified',
    specialtyCategories: ['Cabin Frames & Slings', 'Counterweights', 'Hydraulic Cylinders', 'Safety Gears'],
    regionServed: 'Bhiwandi Logistics Hub / Mumbai Region',
    performanceScore: 92,
    onboardingProgress: 4,
    activeOrdersCount: 2,
    completedOrdersCount: 28,
    catalog: [
      { 
        itemId: 'cat_5', 
        itemName: 'Cabin Frame & Car Sling Heavy Assembly', 
        price: 95000, 
        category: 'Cabin Frames & Slings',
        leadTimeDays: 8,
        specification: 'Heavy Channel Steel Structural Frame with Instantaneous Safety Wedge Gear Mounts',
        lastUpdated: '2026-07-28T09:15:00Z'
      },
      { 
        itemId: 'cat_6', 
        itemName: 'Cast Iron Counterweight Blocks (Set of 24)', 
        price: 60000, 
        category: 'Counterweights',
        leadTimeDays: 4,
        specification: 'High Density Cast Iron Frame Filler Blocks 25kg each with Vibration Isolation Pads',
        lastUpdated: '2026-06-15T10:00:00Z'
      },
      { 
        itemId: 'cat_7', 
        itemName: 'Over-Speed Governor & Safety Gear Device', 
        price: 45000, 
        category: 'Safety Gears',
        leadTimeDays: 6,
        specification: 'Bi-Directional Flyball Governor, 1.0 m/s Tripping Speed, Progressive Safety Clamp',
        lastUpdated: '2026-07-10T16:00:00Z'
      },
      { 
        itemId: 'cat_8', 
        itemName: 'Heavy Duty Hydraulic Power Pack Unit (300 Bar)', 
        price: 210000, 
        category: 'Hydraulic Cylinders',
        leadTimeDays: 18,
        specification: 'Italian Pump Assembly, Blain Valve Block, 15 HP Submerged Motor, 200L Fluid Tank',
        lastUpdated: '2026-08-08T12:00:00Z',
        pendingPrice: 225000,
        pendingPriceReason: 'Blain Valve import custom duty surcharge',
        priceHistory: [
          { timestamp: '2026-08-08T12:00:00Z', oldPrice: 210000, newPrice: 225000, changedBy: 'Milind Joshi (Apex)', status: 'Pending Admin Review', reason: 'Blain Valve import custom duty surcharge' }
        ]
      }
    ]
  },
  {
    id: 'indo_german_drives',
    name: 'Indo-German Elevator Motors & Hydraulics',
    contactPerson: 'Dr. K. S. Kulkarni (Technical Director)',
    phone: '+91 97654 11223',
    email: 'tech@indogerman-lifts.com',
    gstin: '27AAGCI4567M1Z8',
    status: 'active',
    kycStatus: 'Verified',
    specialtyCategories: ['Hydraulic Drives', 'Vacuum Pneumatic Systems', 'Screw-Driven Lifts', 'Accessibility Lifts (IS 14671)'],
    regionServed: 'PCMC & Pan-Maharashtra',
    performanceScore: 98,
    onboardingProgress: 4,
    activeOrdersCount: 1,
    completedOrdersCount: 19,
    catalog: [
      { 
        itemId: 'cat_9', 
        itemName: 'Vacuum Pneumatic Seal & Cylinder Module', 
        price: 320000, 
        category: 'Vacuum Pneumatic Systems',
        leadTimeDays: 21,
        specification: 'Polycarbonate Poly-Cylinder, Multi-Stage Vacuum Turbine 3.7kW, Seal Ring Assembly',
        lastUpdated: '2026-08-02T15:00:00Z'
      },
      { 
        itemId: 'cat_10', 
        itemName: 'Screw-Driven Platform Shaft Mechanism (IS 14671)', 
        price: 290000, 
        category: 'Accessibility Lifts (IS 14671)',
        leadTimeDays: 15,
        specification: 'Trapezoidal Steel Screw Shaft with Bronze Drive Nut, Self-Locking Safety System (IS 14671)',
        lastUpdated: '2026-07-30T10:00:00Z'
      },
      { 
        itemId: 'cat_11', 
        itemName: 'Wheelchair Platform Lift Component Kit', 
        price: 175000, 
        category: 'Accessibility Lifts (IS 14671)',
        leadTimeDays: 12,
        specification: 'Incline / Vertical Platform Mech, Automatic Ramp Barrier, Braille Tactile Controls',
        lastUpdated: '2026-06-18T11:00:00Z'
      }
    ]
  },
  {
    id: 'deccan_precision',
    name: 'Deccan Precision Elevator Hardware',
    contactPerson: 'Suresh Patil (Operations Manager)',
    phone: '+91 98229 00112',
    email: 'spatil@deccanprecision.co.in',
    gstin: '27AABCD9900H1Z4',
    status: 'suspended',
    kycStatus: 'Suspended',
    specialtyCategories: ['Door Operators', 'COP & LOP Touch Panels'],
    regionServed: 'Hadapsar Industrial Zone, Pune',
    performanceScore: 64,
    suspensionReason: 'QC Defect threshold exceeded (3 site door sensor alignment failures). In-flight POs allowed under close Admin monitoring.',
    onboardingProgress: 3,
    activeOrdersCount: 1,
    completedOrdersCount: 12,
    catalog: [
      { 
        itemId: 'cat_12', 
        itemName: 'Automatic Center Opening Door Operator', 
        price: 75000, 
        category: 'Door Operators',
        leadTimeDays: 9,
        specification: 'VVVF Motorized Door Header with Infrared Multi-Beam Light Curtain Sensors',
        lastUpdated: '2026-07-01T10:00:00Z',
        isDiscontinued: true
      },
      { 
        itemId: 'cat_13', 
        itemName: 'Glass COP Touch Button Panel with TFT Display', 
        price: 42000, 
        category: 'COP & LOP Touch Panels',
        leadTimeDays: 7,
        specification: 'Tempered Black Glass Touch Keypad, 7-Inch Color TFT Display, Voice Annunciator Module',
        lastUpdated: '2026-07-20T13:00:00Z'
      }
    ]
  }
];

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2026-SUN-101',
    linkedDealId: 'deal_1',
    customerName: 'Deshmukh Arcade',
    siteLocation: 'Kothrud, Pune',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    lineItems: [
      {
        itemId: 'cat_1',
        itemName: 'Traction Machine (Gearless 1m/s, 400kg)',
        category: 'Traction Drives',
        quantity: 1,
        catalogPrice: 250000,
        agreedUnitPrice: 250000,
        quotedUnitPrice: 250000,
        totalPrice: 250000
      },
      {
        itemId: 'cat_2',
        itemName: 'VVVF Elevator Controller (Integrated)',
        category: 'VVVF Controllers',
        quantity: 1,
        catalogPrice: 150000,
        agreedUnitPrice: 150000,
        quotedUnitPrice: 150000,
        totalPrice: 150000
      },
      {
        itemId: 'cat_4',
        itemName: 'Steel Guide Rails (T-Type T70/B, Set of 10)',
        category: 'Steel Guide Rails',
        quantity: 1,
        catalogPrice: 80000,
        agreedUnitPrice: 80000,
        quotedUnitPrice: 80000,
        totalPrice: 80000
      }
    ],
    subtotalAmount: 480000,
    gstRate: 18,
    gstAmount: 86400,
    totalAmount: 566400,
    expectedDeliveryDate: '2026-08-28',
    status: 'Acknowledged',
    createdFromDealClosureAt: '2026-07-02T10:00:00Z',
    sentAt: '2026-07-03T11:00:00Z',
    communicationThreadRef: 'TH-SUP-SUN-101'
  },
  {
    id: 'PO-2026-APEX-102',
    linkedDealId: 'deal_1',
    customerName: 'Deshmukh Arcade',
    siteLocation: 'Kothrud, Pune',
    supplierId: 'apex_drives',
    supplierName: 'Apex Cabin & Mechanicals Works',
    splitPoGroupRef: 'SPLIT-DEAL-1',
    lineItems: [
      {
        itemId: 'cat_5',
        itemName: 'Cabin Frame & Car Sling Heavy Assembly',
        category: 'Cabin Frames & Slings',
        quantity: 1,
        catalogPrice: 95000,
        agreedUnitPrice: 98000,
        quotedUnitPrice: 95000,
        totalPrice: 98000,
        priceDiscrepancyFlag: true
      },
      {
        itemId: 'cat_6',
        itemName: 'Cast Iron Counterweight Blocks (Set of 24)',
        category: 'Counterweights',
        quantity: 1,
        catalogPrice: 60000,
        agreedUnitPrice: 60000,
        quotedUnitPrice: 60000,
        totalPrice: 60000
      }
    ],
    subtotalAmount: 158000,
    gstRate: 18,
    gstAmount: 28440,
    totalAmount: 186440,
    expectedDeliveryDate: '2026-08-25',
    status: 'In Production',
    hasPriceDiscrepancy: true,
    discrepancyNote: 'Cabin sling price increased by ₹3,000 over quotation baseline. Approved by Mr. Prashant Wable.',
    createdFromDealClosureAt: '2026-07-02T10:00:00Z',
    sentAt: '2026-07-03T11:30:00Z',
    communicationThreadRef: 'TH-SUP-APEX-102'
  },
  {
    id: 'PO-2026-AUTO-DRAFT',
    linkedDealId: 'deal_2',
    customerName: 'Wable Realtors & Developers',
    siteLocation: 'Shree Sai Heights Phase 1',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    lineItems: [
      {
        itemId: 'cat_3',
        itemName: 'Premium Stainless Steel Cabin (6 Pax)',
        category: 'Cabins',
        quantity: 2,
        catalogPrice: 180000,
        agreedUnitPrice: 180000,
        quotedUnitPrice: 180000,
        totalPrice: 360000
      },
      {
        itemId: 'cat_2',
        itemName: 'VVVF Elevator Controller (Integrated)',
        category: 'VVVF Controllers',
        quantity: 2,
        catalogPrice: 150000,
        agreedUnitPrice: 150000,
        quotedUnitPrice: 150000,
        totalPrice: 300000
      }
    ],
    subtotalAmount: 660000,
    gstRate: 18,
    gstAmount: 118800,
    totalAmount: 778800,
    expectedDeliveryDate: '2026-09-05',
    status: 'Draft',
    createdFromDealClosureAt: '2026-08-01T14:00:00Z'
  }
];

const initialSiteVisits: SiteVisit[] = [
  {
    id: 'visit_101',
    leadId: 'lead_1',
    leadName: 'Rohan Deshmukh',
    claimedAddress: 'Kothrud, Pune',
    surveyorId: 'amit_sharma',
    surveyorName: 'Amit Sharma',
    timestamp: '2026-07-08T09:15:00-07:00',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=60',
    capturedLatLng: { lat: 18.5085, lng: 73.8122 },
    deviceGpsAccuracyRadius: 8,
    geoMatchConfidence: 98,
    status: 'approved',
    notes: 'Primary shaft measurements taken. Matches drawings.'
  },
  {
    id: 'visit_102',
    leadId: 'lead_2',
    leadName: 'Mehta Heights',
    claimedAddress: 'Hinjewadi Phase 1, Pune',
    surveyorId: 'sanjay_deshmukh',
    surveyorName: 'Sanjay Deshmukh',
    timestamp: '2026-07-08T08:30:00-07:00',
    photoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=60',
    capturedLatLng: { lat: 18.5842, lng: 73.7485 },
    deviceGpsAccuracyRadius: 45,
    geoMatchConfidence: 89,
    status: 'pending',
    notes: 'Reinforcement bar structure check.'
  },
  {
    id: 'visit_103',
    leadId: 'lead_3',
    leadName: 'Chakan Industrial Estate',
    claimedAddress: 'Chakan Industrial Area, Pune',
    surveyorId: 'amit_sharma',
    surveyorName: 'Amit Sharma',
    timestamp: '2026-07-07T16:45:00-07:00',
    photoUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=60',
    capturedLatLng: { lat: 18.6650, lng: 73.8410 },
    deviceGpsAccuracyRadius: 15,
    geoMatchConfidence: 34,
    status: 'pending',
    notes: 'Ground level clear layout checked.'
  },
  {
    id: 'visit_104',
    leadId: 'lead_1',
    leadName: 'Rohan Deshmukh',
    claimedAddress: 'Kothrud, Pune',
    surveyorId: 'sanjay_deshmukh',
    surveyorName: 'Sanjay Deshmukh',
    timestamp: '2026-07-07T11:20:00-07:00',
    photoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600&auto=format&fit=crop&q=60',
    capturedLatLng: { lat: 18.4200, lng: 73.7500 },
    deviceGpsAccuracyRadius: 12,
    geoMatchConfidence: 11,
    status: 'flagged',
    flagReason: 'Mismatched location coordinates. Surveyor uploaded photos from an unrelated residential building in Ambegaon instead of Kothrud.',
    notes: 'Re-inspection requested.'
  },
  {
    id: 'visit_105',
    leadId: 'lead_2',
    leadName: 'Mehta Heights',
    claimedAddress: 'Hinjewadi Phase 1, Pune',
    surveyorId: 'sanjay_deshmukh',
    surveyorName: 'Sanjay Deshmukh',
    timestamp: '2026-07-06T14:10:00-07:00',
    photoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60',
    capturedLatLng: { lat: 18.5851, lng: 73.7481 },
    deviceGpsAccuracyRadius: 10,
    geoMatchConfidence: 100,
    status: 'approved',
    notes: 'Site dimensions and layout verified.'
  }
];

const initialAlerts: EmergencyAlert[] = [
  {
    id: 'alert_101',
    staffId: 'rajesh_patel',
    staffName: 'Rajesh Patel',
    staffRole: 'technician',
    staffPhone: '+91 98765 43212',
    staffAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    alertType: 'site_accident',
    alertLocation: 'Plot 45, Deshmukh Arcade, Kothrud, Pune',
    lat: 18.5074,
    lng: 73.8077,
    escalationStatus: 'received',
    receivedAt: new Date(Date.now() - 3 * 60000).toISOString(), // 3 mins ago
    isArchived: false,
  },
  {
    id: 'alert_102',
    staffId: 'amit_sharma',
    staffName: 'Amit Sharma',
    staffRole: 'surveyor',
    staffPhone: '+91 98765 43211',
    staffAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    alertType: 'aggressive_customer',
    alertLocation: 'Shanti Niwas Co-op Housing Society, Erandwane, Pune',
    lat: 18.5112,
    lng: 73.8344,
    escalationStatus: 'acknowledged',
    receivedAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
    acknowledgedAt: new Date(Date.now() - 42 * 60000).toISOString(),
    isArchived: false,
  },
  {
    id: 'alert_103',
    staffId: 'sanjay_deshmukh',
    staffName: 'Sanjay Deshmukh',
    staffRole: 'surveyor',
    staffPhone: '+91 99887 76655',
    staffAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    alertType: 'vehicle_breakdown',
    alertLocation: 'Chakan Industrial Area, Pune',
    lat: 18.6650,
    lng: 73.8410,
    escalationStatus: 'resolved',
    receivedAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    acknowledgedAt: new Date(Date.now() - 118 * 60000).toISOString(),
    resolvedAt: new Date(Date.now() - 95 * 60000).toISOString(),
    resolutionNote: 'Backup logistics dispatched. Sanjay got a replacement flat-bed truck.',
    isArchived: true,
  }
];

const initialRecruitmentApplicants: RecruitmentApplicantRecord[] = [
  {
    id: 'app_2026_01',
    applicantName: 'Vikram Shelar',
    applicantPhone: '+91 98220 11223',
    interestedRoles: ['technician'],
    primaryRole: 'technician',
    applicationSource: 'qr_flyer',
    sourceDetails: 'Kothrud Industrial Area Recruitment Banner',
    initialInterestTimestamp: '2026-08-10T10:30:00Z',
    dob: '1994-06-15',
    fullAddress: 'Flat 302, Sai Residency, Kothrud, Pune, Maharashtra 411038',
    pincode: '411038',
    experienceYears: 5,
    experienceSummary: 'Worked on elevator mechanical guide rails and door operator alignment at local contractor firm.',
    hasPriorElevatorExperience: true,
    territoryPreferences: ['Pune West', 'PCMC', 'Chakan'],
    availabilityTimeframe: 'immediate',
    referenceContacts: [
      {
        id: 'ref_1',
        name: 'Ramesh Patil',
        phone: '+91 98220 99887',
        relation: 'Former Site Foreman',
        verificationStatus: 'verified',
        notes: 'Confirmed 3 years of hands-on elevator mechanical assembly.'
      }
    ],
    idProofUploaded: true,
    licenseUploaded: true,
    bankDetailsProvided: true,
    screeningScore: {
      totalScore: 92,
      completenessScore: 30,
      experienceScore: 32,
      territoryNeedScore: 30,
      scoreBreakdownSummary: 'High score due to 5yrs direct elevator experience, full document readiness, and coverage in high-need Chakan/PCMC zone.'
    },
    interviewRecord: {
      id: 'int_01',
      slotDateTime: '2026-08-14T11:00:00Z',
      mode: 'phone',
      interviewerName: 'Mr. Prashant Vasant Wable',
      status: 'scheduled',
      reminderSent: true,
      notes: 'Focus on mechanical guide rail alignment & VFD wiring safety experience.'
    },
    verificationChecks: [
      {
        id: 'v_01',
        itemKey: 'aadhaar_id',
        label: 'Aadhaar Identity Verification',
        requiredForRoles: ['technician', 'surveyor', 'supplier', 'sales_rep'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'UIDAI API Gateway',
        verifiedAt: '2026-08-11T12:00:00Z'
      },
      {
        id: 'v_02',
        itemKey: 'wireman_license',
        label: 'Wireman / ITI Electrical License',
        requiredForRoles: ['technician'],
        method: 'manual_admin',
        status: 'passed',
        verifiedBy: 'Mr. Prashant Vasant Wable',
        verifiedAt: '2026-08-11T14:10:00Z',
        notes: 'Verified License No. MH-ELE-2019-8891 against PWD database.'
      },
      {
        id: 'v_03',
        itemKey: 'reference_check',
        label: 'Site Supervisor Reference Check',
        requiredForRoles: ['technician', 'surveyor'],
        method: 'manual_admin',
        status: 'passed',
        verifiedBy: 'Mr. Prashant Vasant Wable',
        verifiedAt: '2026-08-11T14:15:00Z',
        notes: 'Ramesh Patil confirmed clean safety track record.'
      },
      {
        id: 'v_04',
        itemKey: 'safety_cert',
        label: 'Elevator Safety & Harness Orientation',
        requiredForRoles: ['technician'],
        method: 'field_agent',
        status: 'conditional_approval',
        conditionalDeadline: '2026-08-25',
        notes: 'Conditional approval pending 2-hour AIEC safety harness module completion.'
      }
    ],
    status: 'interview_scheduled',
    lastSavedAt: '2026-08-11T14:20:00Z',
    assignedRecruiterName: 'Mr. Prashant Vasant Wable'
  },
  {
    id: 'app_2026_02',
    applicantName: 'Rajesh Deshmukh',
    applicantPhone: '+91 97654 32109',
    interestedRoles: ['surveyor'],
    primaryRole: 'surveyor',
    applicationSource: 'whatsapp_referral',
    sourceDetails: 'Referred by Amit Sharma',
    initialInterestTimestamp: '2026-08-12T09:15:00Z',
    experienceYears: 3,
    experienceSummary: 'Civil diploma with site measurement experience for commercial building hoistways.',
    hasPriorElevatorExperience: false,
    territoryPreferences: ['Hadapsar', 'Pune East'],
    availabilityTimeframe: '1_2_weeks',
    idProofUploaded: true,
    licenseUploaded: false,
    bankDetailsProvided: false,
    screeningScore: {
      totalScore: 74,
      completenessScore: 20,
      experienceScore: 24,
      territoryNeedScore: 30,
      scoreBreakdownSummary: 'Moderate score. Good civil background and high demand in Hadapsar, but missing bank details & trade license copy.'
    },
    interviewRecord: {
      id: 'int_02',
      slotDateTime: '2026-08-15T15:30:00Z',
      mode: 'video',
      locationOrLink: 'https://meet.aiec.in/survey-screening-02',
      interviewerName: 'Mr. Prashant Vasant Wable',
      status: 'scheduled',
      reminderSent: true
    },
    verificationChecks: [
      {
        id: 'v_05',
        itemKey: 'aadhaar_id',
        label: 'Aadhaar Identity Verification',
        requiredForRoles: ['surveyor'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'UIDAI API Gateway',
        verifiedAt: '2026-08-12T10:00:00Z'
      },
      {
        id: 'v_06',
        itemKey: 'reference_check',
        label: 'Civil Engineering Reference',
        requiredForRoles: ['surveyor'],
        method: 'manual_admin',
        status: 'pending',
        notes: 'Awaiting phone call with previous civil contractor.'
      }
    ],
    status: 'under_review',
    lastSavedAt: '2026-08-12T09:25:00Z'
  },
  {
    id: 'app_2026_03',
    applicantName: 'Apex Elevator Components Pvt Ltd',
    applicantPhone: '+91 98900 44332',
    interestedRoles: ['supplier'],
    primaryRole: 'supplier',
    applicationSource: 'field_agent',
    sourceDetails: 'Bhosari MIDC Supplier Scouting Drive',
    initialInterestTimestamp: '2026-08-09T14:00:00Z',
    experienceYears: 8,
    experienceSummary: 'Manufacturing stainless steel cabin walls, car operating panels & guide rail brackets.',
    hasPriorElevatorExperience: true,
    territoryPreferences: ['PCMC', 'Chakan'],
    availabilityTimeframe: 'immediate',
    idProofUploaded: true,
    licenseUploaded: true,
    bankDetailsProvided: true,
    screeningScore: {
      totalScore: 88,
      completenessScore: 30,
      experienceScore: 35,
      territoryNeedScore: 23,
      scoreBreakdownSummary: 'High score for OEM supplier in Bhosari. Complete GSTIN & BIS manufacturing certificates provided.'
    },
    verificationChecks: [
      {
        id: 'v_07',
        itemKey: 'gstin_proof',
        label: 'GSTIN & Factory Registration Check',
        requiredForRoles: ['supplier'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'GST Portal API',
        verifiedAt: '2026-08-10T09:00:00Z'
      },
      {
        id: 'v_08',
        itemKey: 'bank_mandate',
        label: 'Cancelled Cheque / Bank Mandate',
        requiredForRoles: ['supplier'],
        method: 'manual_admin',
        status: 'passed',
        verifiedBy: 'Mr. Prashant Vasant Wable',
        verifiedAt: '2026-08-10T10:00:00Z'
      }
    ],
    status: 'submitted',
    lastSavedAt: '2026-08-09T14:30:00Z'
  },
  {
    id: 'app_2026_04',
    applicantName: 'Sanjay More',
    applicantPhone: '+91 91234 56789',
    interestedRoles: ['sales_rep'],
    primaryRole: 'sales_rep',
    applicationSource: 'social_media',
    initialInterestTimestamp: '2026-08-08T11:20:00Z',
    experienceYears: 1,
    experienceSummary: 'Retail electrical appliance sales, looking to move into elevator sales.',
    hasPriorElevatorExperience: false,
    territoryPreferences: ['Pune West'],
    availabilityTimeframe: '1_month',
    idProofUploaded: true,
    licenseUploaded: false,
    bankDetailsProvided: false,
    screeningScore: {
      totalScore: 52,
      completenessScore: 15,
      experienceScore: 12,
      territoryNeedScore: 25,
      scoreBreakdownSummary: 'Lower score due to lack of elevator sales experience and 1 month availability delay.'
    },
    status: 'draft',
    lastSavedAt: '2026-08-08T11:30:00Z'
  }
];

// In-Memory state with LocalStorage Backup
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(`aiec_${key}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Error parsing localStorage for ${key}`, e);
    }
  }
  return defaultValue;
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(`aiec_${key}`, JSON.stringify(value));
};

export class DbManager {
  private static getStore<T>(key: string, defaultVal: T): T {
    return getLocalData(key, defaultVal);
  }

  private static setStore<T>(key: string, value: T): void {
    setLocalData(key, value);
    // Dispatch custom event to notify React components of changes
    window.dispatchEvent(new Event('aiec_db_update'));
  }

  // Users API
  static getUsers(): User[] {
    return this.getStore('users', initialUsers);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  static updateUser(user: User): void {
    const list = this.getUsers().map(u => u.id === user.id ? user : u);
    this.setStore('users', list);
    // Real (non-demo) users also persist to Firestore, so their profile/role
    // survives a refresh or a new session — demo sessions never touch it.
    if (!user.isDemo) {
      updateFirestoreUser(user).catch(err => console.error('Firestore user sync failed:', err));
    }
  }

  static addUser(user: User): void {
    const list = [...this.getUsers(), user];
    this.setStore('users', list);
    if (!user.isDemo) {
      updateFirestoreUser(user).catch(err => console.error('Firestore user sync failed:', err));
    }
  }

  // Leads API
  static getLeads(): Lead[] {
    return this.getStore('leads', initialLeads);
  }

  static getLeadById(id: string): Lead | undefined {
    return this.getLeads().find(l => l.id === id);
  }

  static updateLead(lead: Lead): void {
    const list = this.getLeads().map(l => l.id === lead.id ? lead : l);
    this.setStore('leads', list);
  }

  static addLead(lead: Lead): void {
    const list = [lead, ...this.getLeads()];
    this.setStore('leads', list);
  }

  // Deals API
  static getDeals(): Deal[] {
    return this.getStore('deals', initialDeals);
  }

  static getDealById(id: string): Deal | undefined {
    return this.getDeals().find(d => d.id === id);
  }

  static updateDeal(deal: Deal): void {
    const list = this.getDeals().map(d => d.id === deal.id ? deal : d);
    this.setStore('deals', list);
  }

  static addDeal(deal: Deal): void {
    const list = [deal, ...this.getDeals()];
    this.setStore('deals', list);
  }

  // Jobs API
  static getJobs(): Job[] {
    return this.getStore('jobs', initialJobs);
  }

  static getJobById(id: string): Job | undefined {
    return this.getJobs().find(j => j.id === id);
  }

  static updateJob(job: Job): void {
    const list = this.getJobs().map(j => j.id === job.id ? job : j);
    this.setStore('jobs', list);
  }

  static addJob(job: Job): void {
    const list = [job, ...this.getJobs()];
    this.setStore('jobs', list);
  }

  // Payments API
  static getPayments(): Payment[] {
    return this.getStore('payments', initialPayments);
  }

  static getPaymentById(id: string): Payment | undefined {
    return this.getPayments().find(p => p.id === id);
  }

  static updatePayment(payment: Payment): void {
    const list = this.getPayments().map(p => p.id === payment.id ? payment : p);
    this.setStore('payments', list);
  }

  static addPayment(payment: Payment): void {
    const list = [payment, ...this.getPayments()];
    this.setStore('payments', list);
  }

  // Suppliers API
  static getSuppliers(): Supplier[] {
    return this.getStore('suppliers', initialSuppliers);
  }

  static getSupplierById(id: string): Supplier | undefined {
    return this.getSuppliers().find(s => s.id === id);
  }

  static updateSupplier(supplier: Supplier): void {
    const list = this.getSuppliers().map(s => s.id === supplier.id ? supplier : s);
    this.setStore('suppliers', list);
  }

  static addSupplier(supplier: Supplier): void {
    const list = [supplier, ...this.getSuppliers()];
    this.setStore('suppliers', list);
  }

  // Territories API
  static getTerritories(): Territory[] {
    return this.getStore('territories', initialTerritories);
  }

  static getTerritoryById(id: string): Territory | undefined {
    return this.getTerritories().find(t => t.id === id);
  }

  static updateTerritory(territory: Territory): void {
    const list = this.getTerritories().map(t => t.id === territory.id ? territory : t);
    this.setStore('territories', list);
  }

  static addTerritory(territory: Territory): void {
    const list = [...this.getTerritories(), territory];
    this.setStore('territories', list);
  }

  static deleteTerritory(id: string): void {
    const list = this.getTerritories().filter(t => t.id !== id);
    this.setStore('territories', list);
  }

  // Site Visits API
  static getSiteVisits(): SiteVisit[] {
    return this.getStore('site_visits', initialSiteVisits);
  }

  static getSiteVisitById(id: string): SiteVisit | undefined {
    return this.getSiteVisits().find(v => v.id === id);
  }

  static updateSiteVisit(visit: SiteVisit): void {
    const list = this.getSiteVisits().map(v => v.id === visit.id ? visit : v);
    this.setStore('site_visits', list);
  }

  static addSiteVisit(visit: SiteVisit): void {
    const list = [visit, ...this.getSiteVisits()];
    this.setStore('site_visits', list);
  }

  // Emergency Alerts API
  static getEmergencyAlerts(): EmergencyAlert[] {
    return this.getStore('emergency_alerts', initialAlerts);
  }

  // Rework Assignments API
  static getReworkAssignments(): ReworkAssignmentRecord[] {
    return this.getStore('rework_assignments', initialReworkAssignments);
  }

  static getReworkAssignmentById(id: string): ReworkAssignmentRecord | undefined {
    return this.getReworkAssignments().find(r => r.id === id);
  }

  static updateReworkAssignment(record: ReworkAssignmentRecord): void {
    const list = this.getReworkAssignments().map(r => r.id === record.id ? record : r);
    this.setStore('rework_assignments', list);
  }

  static addReworkAssignment(record: ReworkAssignmentRecord): void {
    const list = [record, ...this.getReworkAssignments()];
    this.setStore('rework_assignments', list);
  }

  // Final Handover Checklist API
  static getFinalHandoverChecklists(): FinalHandoverChecklistRecord[] {
    return this.getStore('final_handover_checklists', initialFinalHandoverChecklists);
  }

  static getFinalHandoverChecklistByJobId(jobId: string): FinalHandoverChecklistRecord | undefined {
    return this.getFinalHandoverChecklists().find(f => f.jobId === jobId);
  }

  static updateFinalHandoverChecklist(record: FinalHandoverChecklistRecord): void {
    const list = this.getFinalHandoverChecklists().map(f => f.jobId === record.jobId ? record : f);
    this.setStore('final_handover_checklists', list);
  }

  static addFinalHandoverChecklist(record: FinalHandoverChecklistRecord): void {
    const list = [record, ...this.getFinalHandoverChecklists()];
    this.setStore('final_handover_checklists', list);
  }

  // Customer Walkthrough API
  static getCustomerWalkthroughs(): CustomerHandoverWalkthroughRecord[] {
    return this.getStore('customer_walkthroughs', initialCustomerWalkthroughs);
  }

  static getCustomerWalkthroughByJobId(jobId: string): CustomerHandoverWalkthroughRecord | undefined {
    return this.getCustomerWalkthroughs().find(w => w.jobId === jobId);
  }

  static updateCustomerWalkthrough(record: CustomerHandoverWalkthroughRecord): void {
    const list = this.getCustomerWalkthroughs().map(w => w.jobId === record.jobId ? record : w);
    this.setStore('customer_walkthroughs', list);
  }

  static addCustomerWalkthrough(record: CustomerHandoverWalkthroughRecord): void {
    const list = [record, ...this.getCustomerWalkthroughs()];
    this.setStore('customer_walkthroughs', list);
  }

  // Warranty & AMC Registration API
  static getWarrantyAmcRegistrations(): WarrantyAmcRegistrationRecord[] {
    return this.getStore('warranty_amc_registrations', initialWarrantyAmcRegistrations);
  }

  static getWarrantyAmcByJobId(jobId: string): WarrantyAmcRegistrationRecord | undefined {
    return this.getWarrantyAmcRegistrations().find(w => w.jobId === jobId);
  }

  static updateWarrantyAmcRegistration(record: WarrantyAmcRegistrationRecord): void {
    const list = this.getWarrantyAmcRegistrations().map(w => w.jobId === record.jobId ? record : w);
    this.setStore('warranty_amc_registrations', list);
  }

  static addWarrantyAmcRegistration(record: WarrantyAmcRegistrationRecord): void {
    const list = [record, ...this.getWarrantyAmcRegistrations()];
    this.setStore('warranty_amc_registrations', list);
  }

  // Handover Completion Certificate API
  static getHandoverCompletionCertificates(): HandoverCompletionCertificateRecord[] {
    return this.getStore('handover_completion_certificates', initialHandoverCompletionCertificates);
  }

  static getHandoverCompletionCertificateByJobId(jobId: string): HandoverCompletionCertificateRecord | undefined {
    return this.getHandoverCompletionCertificates().find(c => c.jobId === jobId);
  }

  static updateHandoverCompletionCertificate(record: HandoverCompletionCertificateRecord): void {
    const list = this.getHandoverCompletionCertificates().map(c => c.jobId === record.jobId ? record : c);
    this.setStore('handover_completion_certificates', list);
  }

  static addHandoverCompletionCertificate(record: HandoverCompletionCertificateRecord): void {
    const list = [record, ...this.getHandoverCompletionCertificates()];
    this.setStore('handover_completion_certificates', list);
  }


  static getEmergencyAlertById(id: string): EmergencyAlert | undefined {
    return this.getEmergencyAlerts().find(a => a.id === id);
  }

  static updateEmergencyAlert(alert: EmergencyAlert): void {
    const list = this.getEmergencyAlerts().map(a => a.id === alert.id ? alert : a);
    this.setStore('emergency_alerts', list);
  }

  static addEmergencyAlert(alert: EmergencyAlert): void {
    const list = [alert, ...this.getEmergencyAlerts()];
    this.setStore('emergency_alerts', list);
  }

  // Reminder Rules API
  static getReminderRules(): ReminderRule[] {
    return this.getStore('reminder_rules', initialReminderRules);
  }

  static updateReminderRule(rule: ReminderRule): void {
    const list = this.getReminderRules().map(r => r.id === rule.id ? rule : r);
    this.setStore('reminder_rules', list);
  }

  static addReminderRule(rule: ReminderRule): void {
    const list = [...this.getReminderRules(), rule];
    this.setStore('reminder_rules', list);
  }

  // Loan Financing API
  static getLoanPartners(): LoanPartner[] {
    return this.getStore('loan_partners', initialLoanPartners);
  }

  static getLoanApplications(): LoanApplication[] {
    return this.getStore('loan_applications', initialLoanApplications);
  }

  static updateLoanApplication(app: LoanApplication): void {
    const list = this.getLoanApplications().map(a => a.id === app.id ? app : a);
    this.setStore('loan_applications', list);
  }

  static addLoanApplication(app: LoanApplication): void {
    const list = [app, ...this.getLoanApplications()];
    this.setStore('loan_applications', list);
  }

  // Invoices API
  static getInvoices(): Invoice[] {
    return this.getStore('invoices', initialInvoices);
  }

  static addInvoice(inv: Invoice): void {
    const list = [inv, ...this.getInvoices()];
    this.setStore('invoices', list);
  }

  static updateInvoice(inv: Invoice): void {
    const list = this.getInvoices().map(i => i.id === inv.id ? inv : i);
    this.setStore('invoices', list);
  }

  // Escalation Items API
  static getEscalations(): EscalationItem[] {
    return this.getStore('escalations', initialEscalationItems);
  }

  static addEscalation(esc: EscalationItem): void {
    const list = [esc, ...this.getEscalations()];
    this.setStore('escalations', list);
  }

  static updateEscalation(esc: EscalationItem): void {
    const list = this.getEscalations().map(e => e.id === esc.id ? esc : e);
    this.setStore('escalations', list);
  }

  // Disputes API
  static getDisputes(): DisputeItem[] {
    return this.getStore('disputes', initialDisputeItems);
  }

  static addDispute(disp: DisputeItem): void {
    const list = [disp, ...this.getDisputes()];
    this.setStore('disputes', list);
  }

  static updateDispute(disp: DisputeItem): void {
    const list = this.getDisputes().map(d => d.id === disp.id ? disp : d);
    this.setStore('disputes', list);
  }

  // Purchase Orders API
  static getPurchaseOrders(): PurchaseOrder[] {
    return this.getStore('purchase_orders', initialPurchaseOrders);
  }

  static getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return this.getPurchaseOrders().find(p => p.id === id);
  }

  static addPurchaseOrder(po: PurchaseOrder): void {
    const list = [po, ...this.getPurchaseOrders()];
    this.setStore('purchase_orders', list);
  }

  static updatePurchaseOrder(po: PurchaseOrder): void {
    const list = this.getPurchaseOrders().map(p => p.id === po.id ? po : p);
    this.setStore('purchase_orders', list);
  }

  static deletePurchaseOrder(id: string): void {
    const list = this.getPurchaseOrders().filter(p => p.id !== id);
    this.setStore('purchase_orders', list);
  }

  // Supplier Merge Action
  static mergeSuppliers(canonicalId: string, duplicateId: string): void {
    const suppliers = this.getSuppliers();
    const canonical = suppliers.find(s => s.id === canonicalId);
    const duplicate = suppliers.find(s => s.id === duplicateId);

    if (!canonical || !duplicate) return;

    // 1. Re-link all POs from duplicate to canonical
    const pos = this.getPurchaseOrders();
    const updatedPos = pos.map(p => {
      if (p.supplierId === duplicateId) {
        return {
          ...p,
          supplierId: canonicalId,
          supplierName: canonical.name,
          notes: `${p.notes || ''} [Merged from supplier ${duplicate.name}]`
        };
      }
      return p;
    });
    this.setStore('purchase_orders', updatedPos);

    // 2. Update canonical supplier stats & merge catalog items
    const mergedCatalog = [...canonical.catalog];
    duplicate.catalog.forEach(item => {
      if (!mergedCatalog.some(c => c.itemId === item.itemId || c.itemName === item.itemName)) {
        mergedCatalog.push(item);
      }
    });

    const updatedCanonical: Supplier = {
      ...canonical,
      catalog: mergedCatalog,
      completedOrdersCount: (canonical.completedOrdersCount || 0) + (duplicate.completedOrdersCount || 0),
      activeOrdersCount: (canonical.activeOrdersCount || 0) + (duplicate.activeOrdersCount || 0)
    };

    const updatedDuplicate: Supplier = {
      ...duplicate,
      status: 'inactive',
      kycStatus: 'Suspended',
      suspensionReason: `Merged into canonical supplier record ${canonical.name} (${canonicalId}).`,
      mergedIntoSupplierId: canonicalId
    };

    const updatedSuppliers = suppliers.map(s => {
      if (s.id === canonicalId) return updatedCanonical;
      if (s.id === duplicateId) return updatedDuplicate;
      return s;
    });

    this.setStore('suppliers', updatedSuppliers);
  }

  // Auto-PO Trigger Rules API
  static getAutoPoRules(): AutoPoTriggerRule[] {
    return this.getStore('auto_po_rules', initialAutoPoRules);
  }

  static addAutoPoRule(rule: AutoPoTriggerRule): void {
    const list = [rule, ...this.getAutoPoRules()];
    this.setStore('auto_po_rules', list);
  }

  static updateAutoPoRule(rule: AutoPoTriggerRule): void {
    const list = this.getAutoPoRules().map(r => r.id === rule.id ? rule : r);
    this.setStore('auto_po_rules', list);
  }

  // Manufacturer Production Status API (096)
  static getProductionRecords(): ProductionStatusRecord[] {
    return this.getStore('production_records', initialProductionRecords);
  }

  static addProductionRecord(record: ProductionStatusRecord): void {
    const list = [record, ...this.getProductionRecords()];
    this.setStore('production_records', list);
  }

  static updateProductionRecord(record: ProductionStatusRecord): void {
    const list = this.getProductionRecords().map(p => p.id === record.id ? record : p);
    this.setStore('production_records', list);
  }

  // Supplier Rating & Quality Scorecard API (097)
  static getSupplierScorecards(): SupplierScorecardDetail[] {
    return this.getStore('supplier_scorecards', initialSupplierScorecards);
  }

  static updateSupplierScorecard(scorecard: SupplierScorecardDetail): void {
    const list = this.getSupplierScorecards().map(s => s.supplierId === scorecard.supplierId ? scorecard : s);
    // If not found in list, append it
    if (!list.some(s => s.supplierId === scorecard.supplierId)) {
      list.push(scorecard);
    }
    this.setStore('supplier_scorecards', list);
  }

  // Supplier Contracts & SLA API (098)
  static getSupplierContracts(): SupplierContractSlaRecord[] {
    return this.getStore('supplier_contracts', initialSupplierContracts);
  }

  static addSupplierContract(contract: SupplierContractSlaRecord): void {
    const list = [contract, ...this.getSupplierContracts()];
    this.setStore('supplier_contracts', list);
  }

  static updateSupplierContract(contract: SupplierContractSlaRecord): void {
    const list = this.getSupplierContracts().map(c => c.id === contract.id ? contract : c);
    this.setStore('supplier_contracts', list);
  }

  // Supplier Communication Threads API (099)
  static getSupplierThreads(): SupplierCommunicationThread[] {
    return this.getStore('supplier_threads', initialSupplierThreads);
  }

  static addSupplierThread(thread: SupplierCommunicationThread): void {
    const list = [thread, ...this.getSupplierThreads()];
    this.setStore('supplier_threads', list);
  }

  static updateSupplierThread(thread: SupplierCommunicationThread): void {
    const list = this.getSupplierThreads().map(t => t.id === thread.id ? thread : t);
    this.setStore('supplier_threads', list);
  }

  static addMessageToThread(threadId: string, message: SupplierChatMessage): void {
    const threads = this.getSupplierThreads();
    const updated = threads.map(t => {
      if (t.id === threadId) {
        const newMsgs = [...t.messages, message];
        return {
          ...t,
          lastResponseTimestamp: message.timestamp,
          lastMessageText: message.text,
          messages: newMsgs,
          unresponsiveFlag: false // Reset unresponsive flag on new activity
        };
      }
      return t;
    });
    this.setStore('supplier_threads', updated);
  }

  // Supplier Payment Terms Config API (100)
  static getSupplierPaymentTermsConfigs(): SupplierPaymentTermsConfig[] {
    return this.getStore('supplier_payment_terms', initialPaymentTermsConfigs);
  }

  static addSupplierPaymentTermsConfig(config: SupplierPaymentTermsConfig): void {
    const list = [config, ...this.getSupplierPaymentTermsConfigs()];
    this.setStore('supplier_payment_terms', list);
  }

  static updateSupplierPaymentTermsConfig(config: SupplierPaymentTermsConfig): void {
    const list = this.getSupplierPaymentTermsConfigs().map(c => c.id === config.id ? config : c);
    if (!list.some(c => c.id === config.id)) {
      list.push(config);
    }
    this.setStore('supplier_payment_terms', list);
  }

  // Delivery Schedules API (Prompt 101)
  static getDeliverySchedules(): DeliverySchedule[] {
    return this.getStore('delivery_schedules', initialDeliverySchedules);
  }

  static addDeliverySchedule(schedule: DeliverySchedule): void {
    const list = [schedule, ...this.getDeliverySchedules()];
    this.setStore('delivery_schedules', list);
  }

  static updateDeliverySchedule(schedule: DeliverySchedule): void {
    const list = this.getDeliverySchedules().map(s => s.id === schedule.id ? schedule : s);
    if (!list.some(s => s.id === schedule.id)) {
      list.push(schedule);
    }
    this.setStore('delivery_schedules', list);
  }

  // Live Shipment Trackers API (Prompt 102)
  static getShipmentTrackers(): LiveShipmentTracker[] {
    return this.getStore('shipment_trackers', initialShipmentTrackers);
  }

  static addShipmentTracker(tracker: LiveShipmentTracker): void {
    const list = [tracker, ...this.getShipmentTrackers()];
    this.setStore('shipment_trackers', list);
  }

  static updateShipmentTracker(tracker: LiveShipmentTracker): void {
    const list = this.getShipmentTrackers().map(t => t.id === tracker.id ? tracker : t);
    if (!list.some(t => t.id === tracker.id)) {
      list.push(tracker);
    }
    this.setStore('shipment_trackers', list);
  }

  // Site Delivery Checklist API (Prompt 103)
  static getSiteDeliveryChecklists(): SiteDeliveryChecklist[] {
    return this.getStore('site_delivery_checklists', initialSiteDeliveryChecklists);
  }

  static addSiteDeliveryChecklist(checklist: SiteDeliveryChecklist): void {
    const list = [checklist, ...this.getSiteDeliveryChecklists()];
    this.setStore('site_delivery_checklists', list);
  }

  static updateSiteDeliveryChecklist(checklist: SiteDeliveryChecklist): void {
    const list = this.getSiteDeliveryChecklists().map(c => c.id === checklist.id ? checklist : c);
    if (!list.some(c => c.id === checklist.id)) {
      list.push(checklist);
    }
    this.setStore('site_delivery_checklists', list);
  }

  // Discrepancy Reports API (Prompt 103)
  static getDiscrepancyReports(): DiscrepancyReport[] {
    return this.getStore('discrepancy_reports', initialDiscrepancyReports);
  }

  static addDiscrepancyReport(report: DiscrepancyReport): void {
    const list = [report, ...this.getDiscrepancyReports()];
    this.setStore('discrepancy_reports', list);
  }

  static updateDiscrepancyReport(report: DiscrepancyReport): void {
    const list = this.getDiscrepancyReports().map(r => r.id === report.id ? report : r);
    if (!list.some(r => r.id === report.id)) {
      list.push(report);
    }
    this.setStore('discrepancy_reports', list);
  }

  // Material Received Confirmations API (Prompt 104)
  static getMaterialConfirmations(): MaterialReceivedConfirmation[] {
    return this.getStore('material_confirmations', initialMaterialConfirmations);
  }

  static addMaterialConfirmation(conf: MaterialReceivedConfirmation): void {
    const list = [conf, ...this.getMaterialConfirmations()];
    this.setStore('material_confirmations', list);
  }

  static updateMaterialConfirmation(conf: MaterialReceivedConfirmation): void {
    const list = this.getMaterialConfirmations().map(c => c.id === conf.id ? conf : c);
    if (!list.some(c => c.id === conf.id)) {
      list.push(conf);
    }
    this.setStore('material_confirmations', list);
  }

  // Delivery Delay Alerts API (Prompt 105)
  static getDeliveryDelayAlerts(): DeliveryDelayAlert[] {
    return this.getStore('delivery_delay_alerts', initialDeliveryDelayAlerts);
  }

  static addDeliveryDelayAlert(alert: DeliveryDelayAlert): void {
    const list = [alert, ...this.getDeliveryDelayAlerts()];
    this.setStore('delivery_delay_alerts', list);
  }

  static updateDeliveryDelayAlert(alert: DeliveryDelayAlert): void {
    const list = this.getDeliveryDelayAlerts().map(a => a.id === alert.id ? alert : a);
    if (!list.some(a => a.id === alert.id)) {
      list.push(alert);
    }
    this.setStore('delivery_delay_alerts', list);
  }

  // Stock-in-Transit API (Prompt 106)
  static getStockInTransitItems(): StockInTransitItem[] {
    return this.getStore('stock_in_transit', initialStockInTransit);
  }

  static addStockInTransitItem(item: StockInTransitItem): void {
    const list = [item, ...this.getStockInTransitItems()];
    this.setStore('stock_in_transit', list);
  }

  static updateStockInTransitItem(item: StockInTransitItem): void {
    const list = this.getStockInTransitItems().map(s => s.id === item.id ? item : s);
    if (!list.some(s => s.id === item.id)) {
      list.push(item);
    }
    this.setStore('stock_in_transit', list);
  }

  // Delivery SOP Templates API (Prompt 107)
  static getDeliverySopTemplates(): DeliverySopTemplate[] {
    return this.getStore('delivery_sop_templates', initialDeliverySopTemplates);
  }

  static addDeliverySopTemplate(tmpl: DeliverySopTemplate): void {
    const list = [tmpl, ...this.getDeliverySopTemplates()];
    this.setStore('delivery_sop_templates', list);
  }

  static updateDeliverySopTemplate(tmpl: DeliverySopTemplate): void {
    const list = this.getDeliverySopTemplates().map(t => t.id === tmpl.id ? tmpl : t);
    if (!list.some(t => t.id === tmpl.id)) {
      list.push(tmpl);
    }
    this.setStore('delivery_sop_templates', list);
  }

  // Damaged/Missing Parts Reports API (Prompt 108)
  static getDamagedPartsReports(): DamagedMissingPartsReport[] {
    return this.getStore('damaged_parts_reports', initialDamagedMissingPartsReports);
  }

  static addDamagedPartsReport(report: DamagedMissingPartsReport): void {
    const list = [report, ...this.getDamagedPartsReports()];
    this.setStore('damaged_parts_reports', list);
  }

  static updateDamagedPartsReport(report: DamagedMissingPartsReport): void {
    const list = this.getDamagedPartsReports().map(r => r.id === report.id ? report : r);
    if (!list.some(r => r.id === report.id)) {
      list.push(report);
    }
    this.setStore('damaged_parts_reports', list);
  }

  // Delivery Partners API (Prompt 109)
  static getDeliveryPartners(): DeliveryPartner[] {
    return this.getStore('delivery_partners', initialDeliveryPartners);
  }

  static addDeliveryPartner(partner: DeliveryPartner): void {
    const list = [partner, ...this.getDeliveryPartners()];
    this.setStore('delivery_partners', list);
  }

  static updateDeliveryPartner(partner: DeliveryPartner): void {
    const list = this.getDeliveryPartners().map(p => p.id === partner.id ? partner : p);
    if (!list.some(p => p.id === partner.id)) {
      list.push(partner);
    }
    this.setStore('delivery_partners', list);
  }

  // Delivery Analytics API (Prompt 110)
  static getDeliveryAnalyticsSummary(): DeliveryAnalyticsSummary {
    return this.getStore('delivery_analytics_summary', initialDeliveryAnalyticsSummary);
  }

  static updateDeliveryAnalyticsSummary(summary: DeliveryAnalyticsSummary): void {
    this.setStore('delivery_analytics_summary', summary);
  }

  // Supplier Payment Processing API (Prompt 111 & 112)
  static getSupplierPayments(): SupplierPaymentRecord[] {
    return this.getStore('supplier_payment_records', initialSupplierPayments);
  }

  static addSupplierPayment(record: SupplierPaymentRecord): void {
    const list = [record, ...this.getSupplierPayments()];
    this.setStore('supplier_payment_records', list);
  }

  static updateSupplierPayment(record: SupplierPaymentRecord): void {
    const list = this.getSupplierPayments().map(p => p.id === record.id ? record : p);
    if (!list.some(p => p.id === record.id)) {
      list.push(record);
    }
    this.setStore('supplier_payment_records', list);
  }

  // Supplier Invoice Matching API (Prompt 113)
  static getSupplierInvoices(): SupplierInvoiceDoc[] {
    return this.getStore('supplier_invoices', initialSupplierInvoices);
  }

  static addSupplierInvoice(doc: SupplierInvoiceDoc): void {
    const list = [doc, ...this.getSupplierInvoices()];
    this.setStore('supplier_invoices', list);
  }

  static updateSupplierInvoice(doc: SupplierInvoiceDoc): void {
    const list = this.getSupplierInvoices().map(i => i.id === doc.id ? doc : i);
    if (!list.some(i => i.id === doc.id)) {
      list.push(doc);
    }
    this.setStore('supplier_invoices', list);
  }

  // Supplier Payment Schedule API (Prompt 114)
  static getScheduledPayments(): ScheduledPaymentEntry[] {
    return this.getStore('scheduled_payments', initialScheduledPayments);
  }

  static addScheduledPayment(entry: ScheduledPaymentEntry): void {
    const list = [entry, ...this.getScheduledPayments()];
    this.setStore('scheduled_payments', list);
  }

  static updateScheduledPayment(entry: ScheduledPaymentEntry): void {
    const list = this.getScheduledPayments().map(s => s.id === entry.id ? entry : s);
    if (!list.some(s => s.id === entry.id)) {
      list.push(entry);
    }
    this.setStore('scheduled_payments', list);
  }

  // Supplier Payment History API (Prompt 115)
  static getPaymentHistory(): PaymentHistoryRecord[] {
    return this.getStore('payment_history', initialPaymentHistory);
  }

  static addPaymentHistory(record: PaymentHistoryRecord): void {
    const list = [record, ...this.getPaymentHistory()];
    this.setStore('payment_history', list);
  }

  // Tax/GST Compliance API (Prompt 116)
  static getTaxGstCompliance(): TaxGstComplianceRecord {
    const stored = localStorage.getItem('aiec_tax_gst_compliance');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return initialTaxGstComplianceRecord;
  }

  static updateTaxGstCompliance(record: TaxGstComplianceRecord): void {
    localStorage.setItem('aiec_tax_gst_compliance', JSON.stringify(record));
  }

  // Supplier Dispute Resolution API (Prompt 117)
  static getSupplierDisputes(): SupplierDisputeRecord[] {
    return this.getStore('supplier_disputes', initialSupplierDisputes);
  }

  static addSupplierDispute(dispute: SupplierDisputeRecord): void {
    const list = [dispute, ...this.getSupplierDisputes()];
    this.setStore('supplier_disputes', list);
  }

  static updateSupplierDispute(dispute: SupplierDisputeRecord): void {
    const list = this.getSupplierDisputes().map(d => d.id === dispute.id ? dispute : d);
    if (!list.some(d => d.id === dispute.id)) {
      list.push(dispute);
    }
    this.setStore('supplier_disputes', list);
  }

  // Advance Payment & Retention API (Prompt 118)
  static getAdvanceExposures(): AdvanceExposureRecord[] {
    return this.getStore('advance_exposures', initialAdvanceExposures);
  }

  static updateAdvanceExposure(exposure: AdvanceExposureRecord): void {
    const list = this.getAdvanceExposures().map(a => a.id === exposure.id ? exposure : a);
    if (!list.some(a => a.id === exposure.id)) {
      list.push(exposure);
    }
    this.setStore('advance_exposures', list);
  }

  static getRetentionHolds(): RetentionHoldRecord[] {
    return this.getStore('retention_holds', initialRetentionHolds);
  }

  static updateRetentionHold(hold: RetentionHoldRecord): void {
    const list = this.getRetentionHolds().map(r => r.id === hold.id ? hold : r);
    if (!list.some(r => r.id === hold.id)) {
      list.push(hold);
    }
    this.setStore('retention_holds', list);
  }

  // Supplier Payment Analytics API (Prompt 119)
  static getSupplierPaymentAnalytics(): SupplierPaymentAnalyticsRecord {
    return this.getStore('supplier_payment_analytics', initialSupplierPaymentAnalytics);
  }

  // Auto-Reconciliation API (Prompt 120)
  static getReconciliationRuns(): ReconciliationRunRecord[] {
    return this.getStore('reconciliation_runs', initialReconciliationRuns);
  }

  // Installation & Technician Module API (Prompt 121 & 122)
  static getTechnicianJobs(): TechnicianJob[] {
    return this.getStore('technician_jobs', initialTechnicianJobs);
  }

  static getTechnicianJobById(id: string): TechnicianJob | undefined {
    return this.getTechnicianJobs().find(j => j.id === id);
  }

  static updateTechnicianJob(job: TechnicianJob): void {
    const list = this.getTechnicianJobs().map(j => j.id === job.id ? job : j);
    if (!list.some(j => j.id === job.id)) {
      list.push(job);
    }
    this.setStore('technician_jobs', list);
  }

  static getTechnicianProfile(techId: string): TechnicianProfileSummary {
    const profiles = this.getStore('technician_profiles', initialTechnicianProfiles);
    const profile = profiles.find(p => p.technicianId === techId);
    if (profile) return profile;
    return {
      technicianId: techId,
      name: 'Ramesh Patil',
      phone: '+91 98220 11223',
      monthlyCompletedCount: 6,
      currentQualityScore: 98.4,
      pendingPayoutINR: 42500,
      safetyAlertActive: false
    };
  }

  // SOP Steps
  static getInstallationSopSteps(jobId: string): InstallationSopStep[] {
    const all = this.getStore('installation_sop_steps', initialInstallationSopSteps);
    return all.filter(s => s.jobId === jobId);
  }

  static updateInstallationSopStep(updatedStep: InstallationSopStep): void {
    const all = this.getStore('installation_sop_steps', initialInstallationSopSteps);
    const idx = all.findIndex(s => s.id === updatedStep.id);
    if (idx >= 0) {
      all[idx] = updatedStep;
    } else {
      all.push(updatedStep);
    }
    this.setStore('installation_sop_steps', all);

    // Auto-update job SOP progress percentage
    const jobSteps = all.filter(s => s.jobId === updatedStep.jobId);
    const doneCount = jobSteps.filter(s => s.status === 'completed' || s.status === 'na_confirmed').length;
    const progressPercent = Math.round((doneCount / (jobSteps.length || 1)) * 100);

    const job = this.getTechnicianJobById(updatedStep.jobId);
    if (job) {
      job.sopProgressPercent = progressPercent;
      job.sopStage = updatedStep.title;
      if (progressPercent === 100) {
        job.status = 'pending_qc';
      }
      this.updateTechnicianJob(job);
    }
  }

  // Evidence
  static getInstallationEvidenceByJob(jobId: string): InstallationEvidenceItem[] {
    const all = this.getStore('installation_evidence', initialInstallationEvidence);
    return all.filter(e => e.jobId === jobId);
  }

  static addInstallationEvidence(evidence: InstallationEvidenceItem): void {
    const all = this.getStore('installation_evidence', initialInstallationEvidence);
    all.push(evidence);
    this.setStore('installation_evidence', all);

    // Also attach to corresponding SOP step
    const steps = this.getStore('installation_sop_steps', initialInstallationSopSteps);
    const step = steps.find(s => s.id === evidence.sopStepId);
    if (step) {
      if (!step.evidenceList) step.evidenceList = [];
      step.evidenceList.push(evidence);
      this.updateInstallationSopStep(step);
    }
  }

  // Check-In / Check-Out
  static getActiveCheckIn(jobId: string, techId: string): TechnicianCheckInRecord | undefined {
    const all = this.getStore('technician_checkins', initialTechnicianCheckIns);
    return all.find(c => c.jobId === jobId && c.technicianId === techId && c.status === 'active_onsite');
  }

  static getCheckInHistory(jobId: string): TechnicianCheckInRecord[] {
    const all = this.getStore('technician_checkins', initialTechnicianCheckIns);
    return all.filter(c => c.jobId === jobId);
  }

  static checkInTechnician(record: TechnicianCheckInRecord): void {
    const all = this.getStore('technician_checkins', initialTechnicianCheckIns);
    all.unshift(record);
    this.setStore('technician_checkins', all);
  }

  static checkOutTechnician(
    checkInId: string, 
    checkOutLat: number, 
    checkOutLng: number, 
    notes?: string
  ): TechnicianCheckInRecord | undefined {
    const all = this.getStore('technician_checkins', initialTechnicianCheckIns);
    const record = all.find(c => c.id === checkInId);
    if (record) {
      const now = new Date();
      record.checkOutTimestamp = now.toISOString();
      record.checkOutLat = checkOutLat;
      record.checkOutLng = checkOutLng;
      record.checkOutNotes = notes;
      record.status = 'checked_out';

      // calculate duration
      const startTime = new Date(record.checkInTimestamp).getTime();
      const endTime = now.getTime();
      record.onsiteDurationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));

      // check if SOP was incomplete
      const jobSteps = this.getInstallationSopSteps(record.jobId);
      const incomplete = jobSteps.some(s => s.status === 'pending');
      record.hasIncompleteSopAtCheckOut = incomplete;

      this.setStore('technician_checkins', all);
    }
    return record;
  }

  // Safety Compliance Checklist
  static getSafetyComplianceItems(jobId: string): SafetyComplianceItem[] {
    const all = this.getStore('safety_compliance_items', initialSafetyComplianceItems);
    return all.filter(s => s.jobId === jobId);
  }

  static updateSafetyComplianceItem(updatedItem: SafetyComplianceItem): void {
    const all = this.getStore('safety_compliance_items', initialSafetyComplianceItems);
    const idx = all.findIndex(s => s.id === updatedItem.id);
    if (idx >= 0) {
      all[idx] = updatedItem;
    } else {
      all.push(updatedItem);
    }
    this.setStore('safety_compliance_items', all);
  }

  // Technician Issue / Blocker Reports
  static getTechnicianIssueReports(jobId: string): TechnicianIssueReport[] {
    const all = this.getStore('technician_issue_reports', initialTechnicianIssueReports);
    return all.filter(r => r.jobId === jobId);
  }

  static addTechnicianIssueReport(report: TechnicianIssueReport): void {
    const all = this.getStore('technician_issue_reports', initialTechnicianIssueReports);
    all.unshift(report);
    this.setStore('technician_issue_reports', all);
  }

  static updateTechnicianIssueReport(report: TechnicianIssueReport): void {
    const all = this.getStore('technician_issue_reports', initialTechnicianIssueReports);
    const idx = all.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      all[idx] = report;
    } else {
      all.push(report);
    }
    this.setStore('technician_issue_reports', all);
  }

  // Material Usage Logs
  static getMaterialUsageLogs(jobId: string): MaterialUsageLogItem[] {
    const all = this.getStore('material_usage_logs', initialMaterialUsageLogs);
    return all.filter(m => m.jobId === jobId);
  }

  static updateMaterialUsageLog(item: MaterialUsageLogItem): void {
    const all = this.getStore('material_usage_logs', initialMaterialUsageLogs);
    const idx = all.findIndex(m => m.id === item.id);
    if (idx >= 0) {
      all[idx] = item;
    } else {
      all.push(item);
    }
    this.setStore('material_usage_logs', all);
  }

  static addMaterialUsageLog(item: MaterialUsageLogItem): void {
    const all = this.getStore('material_usage_logs', initialMaterialUsageLogs);
    all.push(item);
    this.setStore('material_usage_logs', all);
  }

  // QC Inspector Assignment API (Prompt 131)
  static getQcAssignments(): QcInspectorAssignmentRecord[] {
    return this.getStore('qc_assignments', initialQcAssignments);
  }

  static getQcAssignmentByJobId(jobId: string): QcInspectorAssignmentRecord | undefined {
    return this.getQcAssignments().find(a => a.jobId === jobId);
  }

  static saveQcAssignment(assignment: QcInspectorAssignmentRecord): void {
    const list = this.getQcAssignments().map(a => a.jobId === assignment.jobId ? assignment : a);
    if (!list.some(a => a.jobId === assignment.jobId)) {
      list.push(assignment);
    }
    this.setStore('qc_assignments', list);

    // Also update job status if needed
    const job = this.getTechnicianJobById(assignment.jobId);
    if (job) {
      if (assignment.assignmentStatus === 'scheduled') {
        job.status = 'pending_qc';
      }
      this.updateTechnicianJob(job);
    }
  }

  // Mechanical QC Checklist API (Prompt 132)
  static getMechanicalChecklist(jobId: string): QcMechanicalCheckItem[] {
    const all = this.getStore('qc_mechanical_checklists', initialMechanicalChecklists);
    const items = all.filter(i => i.jobId === jobId);
    if (items.length > 0) return items;
    // Return default set mapped for this jobId
    return initialMechanicalChecklists.map(item => ({ ...item, jobId, id: `mech_${jobId}_${item.itemKey}` }));
  }

  static updateMechanicalCheckItem(item: QcMechanicalCheckItem): void {
    const all = this.getStore('qc_mechanical_checklists', initialMechanicalChecklists);
    const idx = all.findIndex(i => i.id === item.id || (i.jobId === item.jobId && i.itemKey === item.itemKey));
    if (idx >= 0) {
      all[idx] = item;
    } else {
      all.push(item);
    }
    this.setStore('qc_mechanical_checklists', all);
  }

  static getMechanicalReport(jobId: string): QcMechanicalReport {
    const reports = this.getStore('qc_mechanical_reports', initialQcReports);
    const report = reports.find(r => r.jobId === jobId);
    const items = this.getMechanicalChecklist(jobId);
    if (report) {
      report.items = items;
      report.totalCheckItems = items.length;
      report.passedCount = items.filter(i => i.result === 'passed').length;
      report.exceptionsCount = items.filter(i => i.result === 'pass_with_exception').length;
      report.failedCount = items.filter(i => i.result === 'failed').length;
      return report;
    }
    return {
      id: 'report_' + jobId,
      jobId,
      inspectorId: 'user_qc_001',
      inspectorName: 'Vikram Salunkhe',
      overallStatus: 'pending',
      totalCheckItems: items.length,
      passedCount: items.filter(i => i.result === 'passed').length,
      exceptionsCount: items.filter(i => i.result === 'pass_with_exception').length,
      failedCount: items.filter(i => i.result === 'failed').length,
      items
    };
  }

  static saveMechanicalReport(report: QcMechanicalReport): void {
    const reports = this.getStore('qc_mechanical_reports', initialQcReports);
    const idx = reports.findIndex(r => r.jobId === report.jobId);
    if (idx >= 0) {
      reports[idx] = report;
    } else {
      reports.push(report);
    }
    this.setStore('qc_mechanical_reports', reports);
  }

  // Electrical & Safety QC Checklist API (Prompt 133)
  static getElectricalChecklist(jobId: string): QcElectricalSafetyCheckItem[] {
    const all = this.getStore('qc_electrical_checklists', initialElectricalChecklists);
    const items = all.filter(i => i.jobId === jobId);
    if (items.length > 0) return items;
    return initialElectricalChecklists.map(item => ({ ...item, jobId, id: `elec_${jobId}_${item.itemKey}` }));
  }

  static updateElectricalCheckItem(item: QcElectricalSafetyCheckItem): void {
    const all = this.getStore('qc_electrical_checklists', initialElectricalChecklists);
    const idx = all.findIndex(i => i.id === item.id || (i.jobId === item.jobId && i.itemKey === item.itemKey));
    if (idx >= 0) {
      all[idx] = item;
    } else {
      all.push(item);
    }
    this.setStore('qc_electrical_checklists', all);
  }

  static getElectricalReport(jobId: string): QcElectricalReport {
    const reports = this.getStore('qc_electrical_reports', []);
    const report = reports.find((r: QcElectricalReport) => r.jobId === jobId);
    const items = this.getElectricalChecklist(jobId);
    const hasFail = items.some(i => i.result === 'failed');
    const allPassed = items.every(i => i.result === 'passed');
    
    if (report) {
      report.items = items;
      report.totalCheckItems = items.length;
      report.passedCount = items.filter(i => i.result === 'passed').length;
      report.failedCount = items.filter(i => i.result === 'failed').length;
      report.hardBlockActive = hasFail || !allPassed;
      report.overallStatus = allPassed ? 'passed' : hasFail ? 'failed_hard_blocked' : 'pending';
      return report;
    }

    return {
      id: 'report_elec_' + jobId,
      jobId,
      inspectorId: 'user_qc_001',
      inspectorName: 'Vikram Salunkhe',
      overallStatus: allPassed ? 'passed' : hasFail ? 'failed_hard_blocked' : 'pending',
      totalCheckItems: items.length,
      passedCount: items.filter(i => i.result === 'passed').length,
      failedCount: items.filter(i => i.result === 'failed').length,
      hardBlockActive: hasFail || !allPassed,
      items
    };
  }

  static saveElectricalReport(report: QcElectricalReport): void {
    const reports = this.getStore('qc_electrical_reports', []);
    const idx = reports.findIndex((r: QcElectricalReport) => r.jobId === report.jobId);
    if (idx >= 0) {
      reports[idx] = report;
    } else {
      reports.push(report);
    }
    this.setStore('qc_electrical_reports', reports);
  }

  // Compliance Certification API (Prompt 134)
  static getComplianceCertificate(jobId: string): ComplianceCertificateRecord | undefined {
    const list = this.getStore('compliance_certificates', initialComplianceCertificates);
    let cert = list.find(c => c.jobId === jobId);
    if (!cert && jobId === 'job_2026_101') {
      cert = initialComplianceCertificates[0];
    }
    return cert;
  }

  static saveComplianceCertificate(cert: ComplianceCertificateRecord): void {
    const list = this.getStore('compliance_certificates', initialComplianceCertificates);
    const idx = list.findIndex(c => c.id === cert.id || c.jobId === cert.jobId);
    if (idx >= 0) {
      list[idx] = cert;
    } else {
      list.push(cert);
    }
    this.setStore('compliance_certificates', list);
  }

  // Defect / Snag List API (Prompt 135)
  static getDefectSnags(): DefectSnagRecord[] {
    return this.getStore('defect_snags', initialDefectSnags);
  }

  static updateDefectSnag(snag: DefectSnagRecord): void {
    this.saveSnagItem(snag);
  }

  static getTechnicians(): User[] {
    return this.getUsers().filter(u => u.role === 'technician');
  }

  // Recruitment & Applicant Store Methods (Module 15)
  static getRecruitmentApplicants(): RecruitmentApplicantRecord[] {
    return this.getStore('recruitment_applicants', initialRecruitmentApplicants);
  }

  static getRecruitmentApplicantById(id: string): RecruitmentApplicantRecord | undefined {
    return this.getRecruitmentApplicants().find(a => a.id === id);
  }

  static saveRecruitmentApplicant(applicant: RecruitmentApplicantRecord): void {
    const list = this.getRecruitmentApplicants();
    const idx = list.findIndex(a => a.id === applicant.id || (a.applicantPhone === applicant.applicantPhone && a.applicantPhone !== ''));
    if (idx >= 0) {
      // Merge interested roles if phone matches
      const existing = list[idx];
      const mergedRoles = Array.from(new Set([...existing.interestedRoles, ...applicant.interestedRoles]));
      list[idx] = { ...existing, ...applicant, interestedRoles: mergedRoles, lastSavedAt: new Date().toISOString() };
    } else {
      list.push({ ...applicant, lastSavedAt: new Date().toISOString() });
    }
    this.setStore('recruitment_applicants', list);
  }

  // Offer & Onboarding Agreements API (Prompt 146)
  static getOfferAgreements(): OfferAgreementRecord[] {
    return this.getStore('offer_agreements', initialOfferAgreements);
  }

  static getOfferAgreementByApplicantId(applicantId: string): OfferAgreementRecord | undefined {
    return this.getOfferAgreements().find(a => a.applicantId === applicantId);
  }

  static saveOfferAgreement(agreement: OfferAgreementRecord): void {
    const list = this.getOfferAgreements();
    const idx = list.findIndex(a => a.id === agreement.id || a.applicantId === agreement.applicantId);
    if (idx >= 0) {
      list[idx] = agreement;
    } else {
      list.push(agreement);
    }
    this.setStore('offer_agreements', list);

    // If signed and activated, update applicant status to activated
    if (agreement.status === 'signed_active' && agreement.activationTriggeredFlag) {
      const applicant = this.getRecruitmentApplicantById(agreement.applicantId);
      if (applicant && applicant.status !== 'activated') {
        this.saveRecruitmentApplicant({ ...applicant, status: 'activated' });
      }
    }
  }

  // Partner Tier Assignment API (Prompt 148)
  static getPartnerTierAssignments(): PartnerTierAssignmentRecord[] {
    return this.getStore('partner_tier_assignments', initialPartnerTierAssignments);
  }

  static getPartnerTierAssignmentById(id: string): PartnerTierAssignmentRecord | undefined {
    return this.getPartnerTierAssignments().find(p => p.id === id || p.partnerId === id);
  }

  static savePartnerTierAssignment(tierRec: PartnerTierAssignmentRecord): void {
    const list = this.getPartnerTierAssignments();
    const idx = list.findIndex(p => p.id === tierRec.id || p.partnerId === tierRec.partnerId);
    if (idx >= 0) {
      list[idx] = tierRec;
    } else {
      list.push(tierRec);
    }
    this.setStore('partner_tier_assignments', list);
  }

  // Master Partner Directory API (Prompt 149)
  static getMasterPartners(): MasterPartnerDirectoryRecord[] {
    return this.getStore('master_partners_directory', initialMasterPartners);
  }

  static getMasterPartnerById(id: string): MasterPartnerDirectoryRecord | undefined {
    return this.getMasterPartners().find(p => p.id === id);
  }

  static saveMasterPartner(partner: MasterPartnerDirectoryRecord): void {
    const list = this.getMasterPartners();
    const idx = list.findIndex(p => p.id === partner.id);
    if (idx >= 0) {
      list[idx] = partner;
    } else {
      list.push(partner);
    }
    this.setStore('master_partners_directory', list);
  }

  // Partner Deactivation / Exit API (Prompt 150)
  static getPartnerExitRecords(): PartnerDeactivationExitRecord[] {
    return this.getStore('partner_exit_records', initialPartnerExitRecords);
  }

  static getPartnerExitRecordByPartnerId(partnerId: string): PartnerDeactivationExitRecord | undefined {
    return this.getPartnerExitRecords().find(r => r.partnerId === partnerId);
  }

  static savePartnerExitRecord(exitRecord: PartnerDeactivationExitRecord): void {
    const list = this.getPartnerExitRecords();
    const idx = list.findIndex(r => r.id === exitRecord.id || r.partnerId === exitRecord.partnerId);
    if (idx >= 0) {
      list[idx] = exitRecord;
    } else {
      list.push(exitRecord);
    }
    this.setStore('partner_exit_records', list);

    // If fully deactivated, sync partner activeStatus in Master Partner Directory
    if (exitRecord.status === 'fully_deactivated' || exitRecord.accessRevokedTimestamp) {
      const partner = this.getMasterPartnerById(exitRecord.partnerId);
      if (partner && partner.activeStatus !== 'deactivated') {
        this.saveMasterPartner({ ...partner, activeStatus: 'deactivated', activeJobsCount: 0, activeLeadsCount: 0, activePosCount: 0 });
      }
    }
  }

  // Module 16: Training & SOP Library API (Prompts 151 & 152)
  static getTrainingModules(): TrainingModule[] {
    return this.getStore('training_modules_library', initialTrainingModules);
  }

  static getPartnerModuleProgressList(partnerId: string): PartnerModuleProgress[] {
    const all = this.getStore('partner_module_progress', initialPartnerModuleProgress);
    return all.filter(p => p.partnerId === partnerId);
  }

  static getPartnerModuleProgress(partnerId: string, moduleId: string): PartnerModuleProgress | undefined {
    const list = this.getPartnerModuleProgressList(partnerId);
    return list.find(p => p.moduleId === moduleId);
  }

  static savePartnerModuleProgress(progress: PartnerModuleProgress): void {
    const all = this.getStore('partner_module_progress', initialPartnerModuleProgress);
    const idx = all.findIndex(p => p.partnerId === progress.partnerId && p.moduleId === progress.moduleId);
    if (idx >= 0) {
      all[idx] = progress;
    } else {
      all.push(progress);
    }
    this.setStore('partner_module_progress', all);
  }

  // Module 16: Prompt 153 - SOP Document Repository API
  static getSopDocuments(): SopDocument[] {
    return this.getStore('sop_documents_repository', initialSopDocuments);
  }

  static toggleSopBookmark(docId: string): void {
    const all = this.getSopDocuments();
    const doc = all.find(d => d.id === docId);
    if (doc) {
      doc.isBookmarked = !doc.isBookmarked;
      this.setStore('sop_documents_repository', all);
    }
  }

  static toggleSopOfflineDownload(docId: string): void {
    const all = this.getSopDocuments();
    const doc = all.find(d => d.id === docId);
    if (doc) {
      doc.isDownloadedOffline = !doc.isDownloadedOffline;
      this.setStore('sop_documents_repository', all);
    }
  }

  // Module 16: Prompt 154 - Quiz & Certification Test API
  static getCertificationAssessments(): CertificationAssessment[] {
    return this.getStore('certification_assessments', initialCertificationAssessments);
  }

  static getAssessmentById(id: string): CertificationAssessment | undefined {
    return this.getCertificationAssessments().find(a => a.id === id);
  }

  static getAssessmentAttempts(partnerId: string, assessmentId: string): AssessmentAttemptResult[] {
    const all = this.getStore('assessment_attempts', initialAssessmentAttempts);
    return all.filter(a => a.partnerId === partnerId && a.assessmentId === assessmentId);
  }

  static saveAssessmentAttempt(attemptResult: AssessmentAttemptResult): void {
    const all = this.getStore('assessment_attempts', initialAssessmentAttempts);
    all.push(attemptResult);
    this.setStore('assessment_attempts', all);

    // If passed, auto-award the certification badge
    if (attemptResult.passed) {
      const assessment = this.getAssessmentById(attemptResult.assessmentId);
      if (assessment && assessment.badgeIdToAward) {
        this.awardBadgeToPartner(attemptResult.partnerId, assessment.badgeIdToAward);
      }
    }
  }

  // Module 16: Prompt 155 - Certification Badges API
  static getCertificationBadges(): CertificationBadge[] {
    return this.getStore('certification_badges', initialCertificationBadges);
  }

  static getPartnerBadgeRecords(partnerId: string): PartnerBadgeRecord[] {
    const all = this.getStore('partner_badge_records', initialPartnerBadgeRecords);
    return all.filter(b => b.partnerId === partnerId);
  }

  static awardBadgeToPartner(partnerId: string, badgeId: string): PartnerBadgeRecord {
    const all = this.getStore('partner_badge_records', initialPartnerBadgeRecords);
    const existing = all.find(b => b.partnerId === partnerId && b.badgeId === badgeId);
    if (existing) {
      existing.issueDate = new Date().toISOString().split('T')[0];
      existing.renewalStatus = 'active';
      this.setStore('partner_badge_records', all);
      return existing;
    }

    const badge = this.getCertificationBadges().find(b => b.id === badgeId);
    const issueDate = new Date().toISOString().split('T')[0];
    let expiryDate: string | undefined = undefined;

    if (badge?.isTimeLimited && badge?.validityMonths) {
      const exp = new Date();
      exp.setMonth(exp.getMonth() + badge.validityMonths);
      expiryDate = exp.toISOString().split('T')[0];
    }

    const masterP = this.getMasterPartners().find(p => p.id === partnerId);
    const newBadgeRecord: PartnerBadgeRecord = {
      id: `pbr_${Date.now()}`,
      partnerId,
      partnerName: masterP ? masterP.partnerName : 'Sanjay Tukaram Deshmukh',
      badgeId,
      issueDate,
      expiryDate,
      renewalStatus: 'active',
      certificateNumber: `AIEC-CERT-${Math.floor(100000 + Math.random() * 900000)}`
    };

    all.push(newBadgeRecord);
    this.setStore('partner_badge_records', all);
    return newBadgeRecord;
  }

  // Module 16: Prompt 157 - Skill Matrix & Gap Analysis API
  static getSkillCapabilities(): SkillCapabilityCategory[] {
    return this.getStore('skill_capabilities', initialSkillCapabilities);
  }

  static getTechnicianSkillMatrix(): TechnicianSkillMatrixRow[] {
    return this.getStore('technician_skill_matrix', initialTechnicianSkillMatrixRows);
  }

  static toggleSkillDecliningPriority(skillId: string): SkillCapabilityCategory[] {
    const all = this.getSkillCapabilities();
    const item = all.find(s => s.id === skillId);
    if (item) {
      item.isDecliningPriority = !item.isDecliningPriority;
      this.setStore('skill_capabilities', all);
    }
    return all;
  }

  static assignTrainingForSkillGap(partnerIds: string[], moduleId: string): void {
    const complianceList = this.getPartnerComplianceRecords();
    partnerIds.forEach(pId => {
      const existing = complianceList.find(c => c.partnerId === pId);
      if (existing) {
        existing.complianceStatus = 'grace_period';
        existing.uncompletedModuleId = moduleId;
        existing.nonComplianceReason = 'never_started';
      }
    });
    this.setStore('partner_compliance_records', complianceList);
  }

  // Module 16: Prompt 158 - Training Compliance Tracker API
  static getPartnerComplianceRecords(): PartnerComplianceRecord[] {
    return this.getStore('partner_compliance_records', initialPartnerComplianceRecords);
  }

  static getComplianceTrendMetrics(): ComplianceTrendMetric[] {
    return this.getStore('compliance_trend_metrics', initialComplianceTrendMetrics);
  }

  static sendBulkComplianceReminder(partnerIds: string[]): number {
    const list = this.getPartnerComplianceRecords();
    const nowStr = new Date().toISOString();
    let updatedCount = 0;
    list.forEach(item => {
      if (partnerIds.length === 0 || partnerIds.includes(item.partnerId)) {
        if (item.complianceStatus !== 'fully_compliant') {
          item.lastReminderSentAt = nowStr;
          updatedCount++;
        }
      }
    });
    this.setStore('partner_compliance_records', list);
    return updatedCount;
  }

  // Module 16: Prompt 159 - New SOP Rollout Notification API
  static getSopRolloutNotifications(): SopRolloutNotification[] {
    return this.getStore('sop_rollout_notifications', initialSopRolloutNotifications);
  }

  static getPartnerRolloutAcknowledgments(rolloutId?: string): PartnerRolloutAcknowledgment[] {
    const all = this.getStore('partner_rollout_acknowledgments', initialPartnerRolloutAcknowledgments);
    if (rolloutId) {
      return all.filter(a => a.rolloutId === rolloutId);
    }
    return all;
  }

  static createSopRolloutNotification(data: Omit<SopRolloutNotification, 'id' | 'createdDate' | 'acknowledgedCount' | 'totalAffectedPartners'>): SopRolloutNotification {
    const all = this.getSopRolloutNotifications();
    const newRollout: SopRolloutNotification = {
      ...data,
      id: `srn_${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      acknowledgedCount: 0,
      totalAffectedPartners: 45,
      status: 'published'
    };
    all.unshift(newRollout);
    this.setStore('sop_rollout_notifications', all);
    return newRollout;
  }

  static acknowledgeSopRollout(rolloutId: string, partnerId: string, quizPassed: boolean = false, score?: number): PartnerRolloutAcknowledgment {
    const all = this.getStore('partner_rollout_acknowledgments', initialPartnerRolloutAcknowledgments);
    let record = all.find(a => a.rolloutId === rolloutId && a.partnerId === partnerId);
    if (!record) {
      const masterP = this.getMasterPartners().find(p => p.id === partnerId);
      record = {
        id: `pra_${Date.now()}`,
        rolloutId,
        partnerId,
        partnerName: masterP ? masterP.partnerName : 'Field Technician',
        partnerRole: (masterP?.role as UserRole) || 'technician',
        territory: masterP?.primaryTerritory || 'Mumbai South',
        status: quizPassed ? 'quiz_passed' : 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        quizScorePercent: score
      };
      all.push(record);
    } else {
      record.status = quizPassed ? 'quiz_passed' : 'acknowledged';
      record.acknowledgedAt = new Date().toISOString();
      if (score !== undefined) record.quizScorePercent = score;
    }
    this.setStore('partner_rollout_acknowledgments', all);

    // Update rollout acknowledged count
    const rollouts = this.getSopRolloutNotifications();
    const rollout = rollouts.find(r => r.id === rolloutId);
    if (rollout) {
      rollout.acknowledgedCount = all.filter(a => a.rolloutId === rolloutId && a.status !== 'pending').length;
      this.setStore('sop_rollout_notifications', rollouts);
    }

    return record;
  }

  static rollbackSopRollout(rolloutId: string): void {
    const rollouts = this.getSopRolloutNotifications();
    const rollout = rollouts.find(r => r.id === rolloutId);
    if (rollout) {
      rollout.status = 'rolled_back';
      this.setStore('sop_rollout_notifications', rollouts);
    }
  }

  // Module 16: Prompt 160 - Training Feedback API
  static getTrainingFeedbackList(moduleId?: string): TrainingModuleFeedback[] {
    const all = this.getStore('training_module_feedbacks', initialTrainingModuleFeedback);
    if (moduleId && moduleId !== 'all') {
      return all.filter(f => f.trainingModuleId === moduleId);
    }
    return all;
  }

  static submitTrainingFeedback(data: Omit<TrainingModuleFeedback, 'id' | 'createdAt' | 'status' | 'moderationFlag'>): TrainingModuleFeedback {
    const all = this.getStore('training_module_feedbacks', initialTrainingModuleFeedback);
    const newFeedback: TrainingModuleFeedback = {
      ...data,
      id: `tfb_${Date.now()}`,
      status: data.isCriticalSafetyIssue ? 'under_review' : 'submitted',
      createdAt: new Date().toISOString(),
      moderationFlag: 'clean'
    };
    all.unshift(newFeedback);
    this.setStore('training_module_feedbacks', all);
    return newFeedback;
  }

  static updateFeedbackStatus(feedbackId: string, status: TrainingModuleFeedback['status']): void {
    const all = this.getStore('training_module_feedbacks', initialTrainingModuleFeedback);
    const item = all.find(f => f.id === feedbackId);
    if (item) {
      item.status = status;
      this.setStore('training_module_feedbacks', all);
    }
  }

  static toggleFeedbackModeration(feedbackId: string): void {
    const all = this.getStore('training_module_feedbacks', initialTrainingModuleFeedback);
    const item = all.find(f => f.id === feedbackId);
    if (item) {
      item.moderationFlag = item.moderationFlag === 'hidden' ? 'clean' : 'hidden';
      this.setStore('training_module_feedbacks', all);
    }
  }

  static getTrainingFeedbackSummaries(): TrainingFeedbackSummary[] {
    const modules = this.getTrainingModules();
    const feedbacks = this.getTrainingFeedbackList();

    return modules.map(mod => {
      const modFeedbacks = feedbacks.filter(f => f.trainingModuleId === mod.id && f.moderationFlag !== 'hidden');
      const count = modFeedbacks.length;
      const avgClarity = count > 0 ? Number((modFeedbacks.reduce((acc, curr) => acc + curr.clarityRating, 0) / count).toFixed(1)) : 4.5;
      const avgRelevance = count > 0 ? Number((modFeedbacks.reduce((acc, curr) => acc + curr.relevanceRating, 0) / count).toFixed(1)) : 4.8;
      const criticalCount = modFeedbacks.filter(f => f.isCriticalSafetyIssue).length;

      let qualityStatus: TrainingFeedbackSummary['qualityStatus'] = 'excellent';
      if (criticalCount > 0 || avgClarity < 3.0) {
        qualityStatus = 'critical_review_required';
      } else if (avgClarity < 4.0 || avgRelevance < 4.0) {
        qualityStatus = 'needs_revision';
      }

      return {
        trainingModuleId: mod.id,
        trainingModuleTitle: mod.moduleTitle,
        totalFeedbackCount: count || 8,
        averageClarityRating: avgClarity,
        averageRelevanceRating: avgRelevance,
        criticalSafetyIssueCount: criticalCount,
        responseRatePercent: count > 0 ? Math.min(100, Math.round((count / 15) * 100)) : 42,
        totalLearnersCompleted: 15,
        qualityStatus
      };
    });
  }

  // Module 17: Prompt 161 & 162 - Commission Rules & Payout Methods
  static getCommissionRules(): CommissionRule[] {
    return this.getStore('commission_rules', initialCommissionRules);
  }

  static saveCommissionRule(updatedRule: CommissionRule, changeReason?: string): void {
    const rules = this.getStore('commission_rules', initialCommissionRules);
    const history = this.getStore('commission_rule_history', initialCommissionRuleHistory);

    const idx = rules.findIndex(r => r.id === updatedRule.id);
    if (idx >= 0) {
      rules[idx] = {
        ...updatedRule,
        updatedAt: new Date().toISOString()
      };
    } else {
      rules.push({
        ...updatedRule,
        updatedAt: new Date().toISOString()
      });
    }
    this.setStore('commission_rules', rules);

    // Save history version
    const newHist: CommissionRuleVersionHistory = {
      id: `crh_${Date.now()}`,
      ruleId: updatedRule.id,
      ruleName: updatedRule.ruleName,
      ruleVersion: updatedRule.ruleVersion,
      baseRateOrAmount: updatedRule.baseRateOrAmount,
      calculationType: updatedRule.calculationType,
      changedBy: updatedRule.updatedBy || 'Mr. Prashant Vasant Wable',
      changedAt: new Date().toISOString(),
      changeReason: changeReason || 'Configuration update via Admin Engine'
    };
    history.unshift(newHist);
    this.setStore('commission_rule_history', history);
  }

  static getCommissionRuleHistory(ruleId?: string): CommissionRuleVersionHistory[] {
    const history = this.getStore('commission_rule_history', initialCommissionRuleHistory);
    if (ruleId) {
      return history.filter(h => h.ruleId === ruleId);
    }
    return history;
  }

  static getCommissionPayoutEntries(): CommissionPayoutEntry[] {
    return this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
  }

  static approveCommissionPayout(entryId: string): void {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    const item = entries.find(e => e.id === entryId);
    if (item) {
      item.status = 'approved_pending_payout';
      item.approvedAt = new Date().toISOString();
      this.setStore('commission_payout_entries', entries);
    }
  }

  static approveAllPendingCommissionPayouts(): number {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    let count = 0;
    entries.forEach(item => {
      if (item.status === 'pending_approval') {
        item.status = 'approved_pending_payout';
        item.approvedAt = new Date().toISOString();
        count++;
      }
    });
    this.setStore('commission_payout_entries', entries);
    return count;
  }

  static holdCommissionPayout(entryId: string, note?: string): void {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    const item = entries.find(e => e.id === entryId);
    if (item) {
      item.status = 'held_dispute';
      if (note) item.notes = note;
      this.setStore('commission_payout_entries', entries);
    }
  }

  static updateCommissionPayoutStatus(entryId: string, status: CommissionPayoutEntry['status'], notes?: string): void {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    const item = entries.find(e => e.id === entryId);
    if (item) {
      item.status = status;
      if (notes) item.notes = notes;
      if (status === 'approved_pending_payout') {
        item.approvedAt = new Date().toISOString();
      } else if (status === 'paid') {
        item.paidAt = new Date().toISOString();
      }
      this.setStore('commission_payout_entries', entries);
    }
  }

  static getCommissionPayoutSummary(): CommissionPayoutSummary {
    const entries = this.getCommissionPayoutEntries();

    let pendingAmt = 0;
    let pendingCount = 0;
    let approvedAmt = 0;
    let approvedCount = 0;
    let paidAmt = 0;
    let paidCount = 0;
    let heldCount = 0;

    const breakdownMap: Record<string, { label: string; totalAmount: number; count: number }> = {};

    entries.forEach(e => {
      if (e.status === 'pending_approval') {
        pendingAmt += e.amount;
        pendingCount++;
      } else if (e.status === 'approved_pending_payout') {
        approvedAmt += e.amount;
        approvedCount++;
      } else if (e.status === 'paid') {
        paidAmt += e.amount;
        paidCount++;
      } else if (e.status === 'held_dispute') {
        heldCount++;
      }

      if (!breakdownMap[e.triggerType]) {
        breakdownMap[e.triggerType] = {
          label: e.triggerTypeLabel,
          totalAmount: 0,
          count: 0
        };
      }
      breakdownMap[e.triggerType].totalAmount += e.amount;
      breakdownMap[e.triggerType].count++;
    });

    const breakdownByStage = Object.keys(breakdownMap).map(k => ({
      triggerType: k,
      label: breakdownMap[k].label,
      totalAmount: breakdownMap[k].totalAmount,
      count: breakdownMap[k].count
    }));

    return {
      totalPendingAmount: pendingAmt,
      totalPendingCount: pendingCount,
      totalApprovedAmount: approvedAmt,
      totalApprovedCount: approvedCount,
      totalPaidThisMonth: paidAmt,
      totalPaidCount: paidCount,
      heldDisputeCount: heldCount,
      breakdownByStage
    };
  }

  static rejectCommissionPayout(entryId: string, reason: string): void {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    const item = entries.find(e => e.id === entryId);
    if (item) {
      item.status = 'rejected';
      item.notes = reason || 'Rejected by Admin review';
      this.setStore('commission_payout_entries', entries);
    }
  }

  static expediteCommissionPayout(entryId: string): void {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    const item = entries.find(e => e.id === entryId);
    if (item) {
      item.isExpeditedHardship = true;
      item.status = 'approved_pending_payout';
      item.approvedAt = new Date().toISOString();
      item.notes = (item.notes ? item.notes + ' ' : '') + '[EXPEDITED: Partner Hardship Request Approved]';
      this.setStore('commission_payout_entries', entries);
    }
  }

  static saveCommissionPayoutEntry(entry: CommissionPayoutEntry): void {
    const entries = this.getCommissionPayoutEntries();
    const idx = entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.unshift(entry);
    }
    this.setStore('commission_payout_entries', entries);
  }

  static getAutomatedDisbursements(): AutomatedDisbursementRecord[] {
    return this.getStore('automated_disbursements', initialAutomatedDisbursements);
  }

  static triggerBatchDisbursement(entryIds: string[], method: 'bank_neft' | 'bank_rtgs' | 'upi_instant' = 'bank_neft'): AutomatedDisbursementRecord[] {
    const entries = this.getStore('commission_payout_entries', initialCommissionPayoutEntries);
    const disbursements = this.getStore('automated_disbursements', initialAutomatedDisbursements);
    const batchId = `BATCH-${new Date().toISOString().slice(0, 10)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecords: AutomatedDisbursementRecord[] = [];

    // Group entries by partnerId
    const partnerGroup: Record<string, CommissionPayoutEntry[]> = {};
    entries.forEach(e => {
      if (entryIds.includes(e.id) && (e.status === 'approved_pending_payout' || e.status === 'pending_approval')) {
        if (!partnerGroup[e.partnerId]) partnerGroup[e.partnerId] = [];
        partnerGroup[e.partnerId].push(e);
      }
    });

    Object.keys(partnerGroup).forEach((pId, idx) => {
      const pEntries = partnerGroup[pId];
      const totalAmt = pEntries.reduce((sum, item) => sum + item.amount, 0);
      const first = pEntries[0];

      // Mark entries as paid
      pEntries.forEach(item => {
        item.status = 'paid';
        item.paidAt = new Date().toISOString();
        item.payoutBatchId = batchId;
      });

      const disbRecord: AutomatedDisbursementRecord = {
        id: `disb_${Date.now()}_${idx}`,
        payoutEntryIds: pEntries.map(e => e.id),
        partnerId: pId,
        partnerName: first.partnerName,
        partnerRole: first.partnerRole,
        bankAccountMasked: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        ifscCode: 'HDFC0001242',
        upiId: `${first.partnerName.toLowerCase().replace(/\s+/g, '')}@okaxis`,
        disbursementMethod: method,
        amount: totalAmt,
        status: 'completed',
        batchId: batchId,
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        retryCount: 0
      };

      disbursements.unshift(disbRecord);
      newRecords.push(disbRecord);
    });

    this.setStore('commission_payout_entries', entries);
    this.setStore('automated_disbursements', disbursements);
    return newRecords;
  }

  static retryFailedDisbursement(disbursementId: string): void {
    const disbursements = this.getStore('automated_disbursements', initialAutomatedDisbursements);
    const item = disbursements.find(d => d.id === disbursementId);
    if (item) {
      item.status = 'completed';
      item.failureReason = undefined;
      item.completedAt = new Date().toISOString();
      item.retryCount += 1;
      this.setStore('automated_disbursements', disbursements);
    }
  }

  static getCompetitionContests(): CompetitionContest[] {
    return this.getStore('competition_contests', initialCompetitionContests);
  }

  static saveCompetitionContest(contest: CompetitionContest): void {
    const list = this.getCompetitionContests();
    const idx = list.findIndex(c => c.id === contest.id);
    if (idx >= 0) {
      list[idx] = contest;
    } else {
      list.unshift(contest);
    }
    this.setStore('competition_contests', list);
  }

  static endContestEarly(contestId: string, reason: string): void {
    const list = this.getCompetitionContests();
    const contest = list.find(c => c.id === contestId);
    if (contest) {
      contest.isActive = false;
      contest.description += ` [Concluded early: ${reason}]`;
      this.setStore('competition_contests', list);
    }
  }

  static getLeaderboardEntries(contestId?: string): LeaderboardEntry[] {
    const entries = this.getStore('leaderboard_entries', initialLeaderboardEntries);
    if (contestId) {
      return entries.filter(e => e.contestId === contestId).sort((a, b) => a.rank - b.rank);
    }
    return entries.sort((a, b) => a.rank - b.rank);
  }

  static getUnifiedBadgesForPartner(partnerId?: string): UnifiedBadgeMilestone[] {
    return this.getStore('unified_badges', initialUnifiedBadges);
  }

  static getTdsStatements(partnerId?: string): TdsStatementRecord[] {
    const list = this.getStore('tds_statements', initialTdsStatements);
    if (partnerId) {
      return list.filter(s => s.partnerId === partnerId || partnerId === 'p_001');
    }
    return list;
  }

  static saveTdsStatement(statement: TdsStatementRecord): void {
    const list = this.getTdsStatements();
    const idx = list.findIndex(s => s.id === statement.id);
    if (idx >= 0) {
      list[idx] = statement;
    } else {
      list.unshift(statement);
    }
    this.setStore('tds_statements', list);
  }

  static getPayoutDisputes(partnerId?: string): PayoutDisputeRecord[] {
    const list = this.getStore('payout_disputes', initialPayoutDisputes);
    if (partnerId) {
      return list.filter(d => d.partnerId === partnerId || partnerId === 'p_001');
    }
    return list;
  }

  static savePayoutDispute(dispute: PayoutDisputeRecord): void {
    const list = this.getStore('payout_disputes', initialPayoutDisputes);
    const idx = list.findIndex(d => d.id === dispute.id);
    if (idx >= 0) {
      list[idx] = dispute;
    } else {
      list.unshift(dispute);
    }
    this.setStore('payout_disputes', list);
  }

  static resolvePayoutDispute(
    disputeId: string, 
    resolutionType: 'adjustment_approved' | 'explanation_provided' | 'escalated' | 'dismissed',
    notes: string,
    correctiveAmount?: number,
    isSystemic?: boolean,
    senderName: string = 'Accounts Admin (Prashant Wable)'
  ): void {
    const list = this.getPayoutDisputes();
    const dispute = list.find(d => d.id === disputeId);
    if (dispute) {
      dispute.resolutionType = resolutionType;
      dispute.resolutionNotes = notes;
      dispute.resolvedAt = new Date().toISOString();
      dispute.isSystemicRuleIssue = isSystemic || false;
      
      if (resolutionType === 'adjustment_approved') {
        dispute.status = 'adjustment_approved';
        dispute.correctiveAdjustmentAmount = correctiveAmount || dispute.disputedAmount;
        
        // Generate corrective entry in Commission Payout Entries
        const newEntry: CommissionPayoutEntry = {
          id: `pay_adj_${Date.now()}`,
          partnerId: dispute.partnerId,
          partnerName: dispute.partnerName,
          partnerRole: dispute.partnerRole,
          triggerType: 'dispute_adjustment_credit',
          triggerTypeLabel: `Corrective Adjustment: ${dispute.disputeSubject}`,
          referenceDocId: dispute.payoutEntryId,
          referenceDocNo: `ADJ-${dispute.payoutReferenceNo}`,
          amount: dispute.correctiveAdjustmentAmount,
          appliedRuleId: 'RULE-DISPUTE-CORRECTION',
          appliedRuleVersion: 'v2026.1',
          status: 'approved_pending_payout',
          earnedAt: new Date().toISOString(),
          payoutBatchId: `BATCH-ADJ-${new Date().toISOString().slice(0, 10)}`,
          notes: `Dispute Resolution Approval: ${notes}`
        };
        this.saveCommissionPayoutEntry(newEntry);
      } else if (resolutionType === 'explanation_provided') {
        dispute.status = 'explanation_provided';
      } else if (resolutionType === 'escalated') {
        dispute.status = 'escalated';
      } else {
        dispute.status = 'explanation_provided';
      }

      dispute.auditMessages.push({
        senderName,
        senderRole: 'admin',
        timestamp: new Date().toISOString(),
        messageText: `Resolution (${resolutionType.replace(/_/g, ' ')}): ${notes}`
      });

      this.savePayoutDispute(dispute);
    }
  }

  static getCustomerProjects(customerId?: string): CustomerProjectSummary[] {
    const list = this.getStore('customer_projects', initialCustomerProjects);
    if (customerId) {
      return list.filter(p => p.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerProject(project: CustomerProjectSummary): void {
    const list = this.getCustomerProjects();
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.unshift(project);
    }
    this.setStore('customer_projects', list);
  }

  static getCustomerVaultDocuments(customerId?: string): CustomerVaultDocument[] {
    const list = this.getStore('customer_vault_docs', initialCustomerVaultDocuments);
    if (customerId) {
      return list.filter(d => d.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerVaultDocument(doc: CustomerVaultDocument): void {
    const list = this.getCustomerVaultDocuments();
    const idx = list.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      list[idx] = doc;
    } else {
      list.unshift(doc);
    }
    this.setStore('customer_vault_docs', list);
  }

  static getCustomerPaymentInstallments(customerId?: string, projectId?: string): CustomerPaymentInstallment[] {
    let list = this.getStore('customer_payment_installments', initialCustomerPaymentInstallments);
    if (customerId) {
      list = list.filter(i => i.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    if (projectId) {
      list = list.filter(i => i.projectId === projectId);
    }
    return list;
  }

  static saveCustomerPaymentInstallment(installment: CustomerPaymentInstallment): void {
    const list = this.getCustomerPaymentInstallments();
    const idx = list.findIndex(i => i.id === installment.id);
    if (idx >= 0) {
      list[idx] = installment;
    } else {
      list.unshift(installment);
    }
    this.setStore('customer_payment_installments', list);
  }

  static getCustomerSupportTickets(customerId?: string): CustomerSupportTicket[] {
    const list = this.getStore('customer_support_tickets', initialCustomerSupportTickets);
    if (customerId) {
      return list.filter(t => t.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerSupportTicket(ticket: CustomerSupportTicket): void {
    const list = this.getCustomerSupportTickets();
    const idx = list.findIndex(t => t.id === ticket.id);
    if (idx >= 0) {
      list[idx] = ticket;
    } else {
      list.unshift(ticket);
    }
    this.setStore('customer_support_tickets', list);
  }

  static getCustomerSupportChatThread(customerId?: string): CustomerSupportChatThread {
    const list = this.getStore('customer_support_chat_threads', initialCustomerSupportChatThreads);
    if (customerId) {
      return list.find(t => t.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001') || list[0];
    }
    return list[0];
  }

  static saveCustomerSupportChatThread(thread: CustomerSupportChatThread): void {
    const list = this.getStore('customer_support_chat_threads', initialCustomerSupportChatThreads);
    const idx = list.findIndex(t => t.id === thread.id);
    if (idx >= 0) {
      list[idx] = thread;
    } else {
      list.unshift(thread);
    }
    this.setStore('customer_support_chat_threads', list);
  }

  static getCustomerFeedbackEntries(customerId?: string): CustomerFeedbackEntry[] {
    const list = this.getStore('customer_feedback_entries', initialCustomerFeedbackEntries);
    if (customerId) {
      return list.filter(f => f.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerFeedbackEntry(entry: CustomerFeedbackEntry): void {
    const list = this.getCustomerFeedbackEntries();
    const idx = list.findIndex(f => f.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    this.setStore('customer_feedback_entries', list);
  }

  static getCustomerAmcBookings(customerId?: string): CustomerAmcBooking[] {
    const list = this.getStore('customer_amc_bookings', initialCustomerAmcBookings);
    if (customerId) {
      return list.filter(b => b.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerAmcBooking(booking: CustomerAmcBooking): void {
    const list = this.getCustomerAmcBookings();
    const idx = list.findIndex(b => b.id === booking.id);
    if (idx >= 0) {
      list[idx] = booking;
    } else {
      list.unshift(booking);
    }
    this.setStore('customer_amc_bookings', list);
  }

  static getCustomerReferrals(customerId?: string): CustomerReferralEntry[] {
    const list = this.getStore('customer_referral_entries', initialCustomerReferrals);
    if (customerId) {
      return list.filter(r => r.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerReferral(ref: CustomerReferralEntry): void {
    const list = this.getCustomerReferrals();
    const idx = list.findIndex(r => r.id === ref.id);
    if (idx >= 0) {
      list[idx] = ref;
    } else {
      list.unshift(ref);
    }
    this.setStore('customer_referral_entries', list);
  }

  static getCustomerNotifications(customerId?: string): CustomerInAppNotification[] {
    const list = this.getStore('customer_in_app_notifications', initialCustomerNotifications);
    if (customerId) {
      return list.filter(n => n.customerId === customerId || customerId === 'admin_prashant' || customerId === 'p_001');
    }
    return list;
  }

  static saveCustomerNotification(notif: CustomerInAppNotification): void {
    const list = this.getCustomerNotifications();
    const idx = list.findIndex(n => n.id === notif.id);
    if (idx >= 0) {
      list[idx] = notif;
    } else {
      list.unshift(notif);
    }
    this.setStore('customer_in_app_notifications', list);
  }

  static markAllNotificationsAsRead(customerId?: string): void {
    const list = this.getCustomerNotifications(customerId);
    const updated = list.map(n => ({ ...n, readStatus: true }));
    this.setStore('customer_in_app_notifications', updated);
  }

  static getCustomerNotificationPreferences(customerId?: string): CustomerNotificationPreferences {
    const prefs = this.getStore('customer_notification_preferences', initialCustomerNotificationPreferences);
    return prefs || {
      customerId: customerId || 'p_001',
      whatsappEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      allowPromotional: false,
      allowMilestones: true,
      allowPaymentReminders: true
    };
  }

  static saveCustomerNotificationPreferences(prefs: CustomerNotificationPreferences): void {
    this.setStore('customer_notification_preferences', prefs);
  }

  // Master Automation Rules Methods
  static getAutomationCategorySummaries(): AutomationRuleCategorySummary[] {
    return this.getStore('automation_rule_category_summaries', initialAutomationRuleCategorySummaries);
  }

  static toggleGlobalPauseAutomationCategory(categoryKey: string): AutomationRuleCategorySummary[] {
    const list = this.getAutomationCategorySummaries();
    const updated = list.map(c => {
      if (c.categoryKey === categoryKey) {
        const nextPaused = !c.isPausedGlobally;
        return {
          ...c,
          isPausedGlobally: nextPaused,
          healthStatus: nextPaused ? ('paused' as const) : ('healthy' as const)
        };
      }
      return c;
    });
    this.setStore('automation_rule_category_summaries', updated);
    return updated;
  }

  static getAutomationActivityLogs(): AutomationRuleActivityLog[] {
    return this.getStore('automation_rule_activity_logs', initialAutomationRuleActivityLogs);
  }

  static addAutomationActivityLog(log: AutomationRuleActivityLog): void {
    const logs = this.getAutomationActivityLogs();
    logs.unshift(log);
    this.setStore('automation_rule_activity_logs', logs);
  }

  static getCustomWorkflowRules(): CustomWorkflowTriggerRule[] {
    return this.getStore('custom_workflow_trigger_rules', initialCustomWorkflowTriggerRules);
  }

  static saveCustomWorkflowRule(rule: CustomWorkflowTriggerRule): void {
    const rules = this.getCustomWorkflowRules();
    const idx = rules.findIndex(r => r.id === rule.id);
    if (idx >= 0) {
      rules[idx] = rule;
    } else {
      rules.unshift(rule);
    }
    this.setStore('custom_workflow_trigger_rules', rules);
  }

  static toggleCustomWorkflowRuleStatus(ruleId: string, nextStatus: 'active' | 'paused' | 'archived'): void {
    const rules = this.getCustomWorkflowRules();
    const updated = rules.map(r => r.id === ruleId ? { ...r, status: nextStatus } : r);
    this.setStore('custom_workflow_trigger_rules', updated);
  }

  // Internal Notification Templates Methods
  static getInternalNotificationTemplates(): InternalNotificationTemplate[] {
    return this.getStore('internal_notification_templates', initialInternalNotificationTemplates);
  }

  static saveInternalNotificationTemplate(tpl: InternalNotificationTemplate): void {
    const list = this.getInternalNotificationTemplates();
    const idx = list.findIndex(t => t.id === tpl.id);
    if (idx >= 0) {
      list[idx] = tpl;
    } else {
      list.unshift(tpl);
    }
    this.setStore('internal_notification_templates', list);
  }

  // Escalation Chain Configuration Methods
  static getEscalationChainConfigs(): EscalationChainConfig[] {
    return this.getStore('escalation_chain_configs', initialEscalationChainConfigs);
  }

  static saveEscalationChainConfig(config: EscalationChainConfig): void {
    const list = this.getEscalationChainConfigs();
    const idx = list.findIndex(c => c.id === config.id);
    if (idx >= 0) {
      list[idx] = config;
    } else {
      list.unshift(config);
    }
    this.setStore('escalation_chain_configs', list);
  }

  static updateEscalationDrillStatus(id: string, status: 'passed' | 'failed_gap_detected' | 'not_tested'): void {
    const list = this.getEscalationChainConfigs();
    const updated = list.map(c => c.id === id ? {
      ...c,
      lastDrillStatus: status,
      lastDrillTestDate: new Date().toISOString().split('T')[0]
    } : c);
    this.setStore('escalation_chain_configs', updated);
  }

  // SLA Timers & Breach Methods
  static getSlaProcessItems(): SlaProcessItem[] {
    return this.getStore('sla_process_items', initialSlaProcessItems);
  }

  static getSlaCategoryTrends(): SlaCategoryTrend[] {
    return this.getStore('sla_category_trends', initialSlaCategoryTrends);
  }

  static updateSlaProcessItemStatus(id: string, nextStatus: 'on_track' | 'warning' | 'breached'): void {
    const items = this.getSlaProcessItems();
    const updated = items.map(i => i.id === id ? { ...i, breachStatus: nextStatus } : i);
    this.setStore('sla_process_items', updated);
  }

  // System Health & Technical Incident Methods
  static getIntegrationTechnicalHealth(): IntegrationTechnicalHealth[] {
    return this.getStore('integration_technical_health', initialIntegrationTechnicalHealth);
  }

  static getTechnicalIncidentLogs(): TechnicalIncidentLog[] {
    return this.getStore('technical_incident_logs', initialTechnicalIncidentLogs);
  }

  // Audit Log of Automated Actions Methods
  static getAutomatedActionAuditEntries(): AutomatedActionAuditEntry[] {
    return this.getStore('automated_action_audit_entries', initialAutomatedActionAuditEntries);
  }

  static saveAutomatedActionAuditEntry(entry: AutomatedActionAuditEntry): void {
    const list = this.getAutomatedActionAuditEntries();
    list.unshift(entry);
    this.setStore('automated_action_audit_entries', list);
  }

  // Manual Override Console Log Methods
  static getManualOverrideLogEntries(): ManualOverrideLogEntry[] {
    return this.getStore('manual_override_log_entries', initialManualOverrideLogEntries);
  }

  static saveManualOverrideLogEntry(entry: ManualOverrideLogEntry): void {
    const list = this.getManualOverrideLogEntries();
    list.unshift(entry);
    this.setStore('manual_override_log_entries', list);

    // Automatically create a corresponding audit entry
    const auditEntry: AutomatedActionAuditEntry = {
      auditEntryId: `aud_${Date.now()}`,
      automationSource: 'Manual Override Console',
      ruleId: `override_${entry.overrideId}`,
      ruleName: entry.overrideAction,
      triggeringCondition: `Manual Override by ${entry.adminName}`,
      actionTaken: `${entry.overrideAction} on ${entry.targetRecordId}`,
      affectedRecordId: entry.targetRecordId,
      category: 'manual_override',
      timestamp: entry.timestamp,
      payloadDetails: JSON.stringify({ adminId: entry.adminId, mandatoryReason: entry.mandatoryReason }, null, 2),
      executionStatus: 'overridden',
      wasManualOverride: true,
      overrideReason: entry.mandatoryReason
    };
    this.saveAutomatedActionAuditEntry(auditEntry);
  }

  // API Integration Config Methods
  static getApiIntegrationConfigs(): ApiIntegrationConfig[] {
    return this.getStore('api_integration_configs', initialApiIntegrationConfigs);
  }

  static saveApiIntegrationConfig(config: ApiIntegrationConfig): void {
    const list = this.getApiIntegrationConfigs();
    const idx = list.findIndex(c => c.id === config.id);
    if (idx >= 0) {
      list[idx] = config;
    } else {
      list.push(config);
    }
    this.setStore('api_integration_configs', list);
  }

  // Automation Test Scenarios Methods
  static getAutomationTestScenarios(): AutomationTestScenario[] {
    return this.getStore('automation_test_scenarios', initialAutomationTestScenarios);
  }

  static saveAutomationTestScenario(scenario: AutomationTestScenario): void {
    const list = this.getAutomationTestScenarios();
    const idx = list.findIndex(s => s.testScenarioId === scenario.testScenarioId);
    if (idx >= 0) {
      list[idx] = scenario;
    } else {
      list.unshift(scenario);
    }
    this.setStore('automation_test_scenarios', list);
  }

  // Company Profile Methods
  static getCompanyProfileConfig(): CompanyProfileConfig {
    return this.getStore('company_profile_config', initialCompanyProfileConfig);
  }

  static saveCompanyProfileConfig(config: CompanyProfileConfig): void {
    this.setStore('company_profile_config', config);
  }

  // Role Permissions Methods
  static getRolePermissionConfigs(): RolePermissionConfig[] {
    return this.getStore('role_permission_configs', initialRolePermissionConfigs);
  }

  static saveRolePermissionConfig(config: RolePermissionConfig): void {
    const list = this.getRolePermissionConfigs();
    const idx = list.findIndex(r => r.roleId === config.roleId);
    if (idx >= 0) {
      list[idx] = config;
    } else {
      list.push(config);
    }
    this.setStore('role_permission_configs', list);
  }

  // User Permission Overrides Methods
  static getUserPermissionOverrides(): UserPermissionOverride[] {
    return this.getStore('user_permission_overrides', initialUserPermissionOverrides);
  }

  static saveUserPermissionOverride(override: UserPermissionOverride): void {
    const list = this.getUserPermissionOverrides();
    const idx = list.findIndex(o => o.overrideId === override.overrideId);
    if (idx >= 0) {
      list[idx] = override;
    } else {
      list.unshift(override);
    }
    this.setStore('user_permission_overrides', list);
  }

  // Permission Change Audit Entries Methods
  static getPermissionChangeAuditEntries(): PermissionChangeAuditEntry[] {
    return this.getStore('permission_change_audit_entries', initialPermissionChangeAuditEntries);
  }

  static savePermissionChangeAuditEntry(entry: PermissionChangeAuditEntry): void {
    const list = this.getPermissionChangeAuditEntries();
    list.unshift(entry);
    this.setStore('permission_change_audit_entries', list);
  }

  // Single-Person Monitor Methods
  static getMonitorSignals(): MonitorSignalConfig[] {
    return this.getStore('monitor_signals', initialMonitorSignals);
  }

  static saveMonitorSignal(signal: MonitorSignalConfig): void {
    const list = this.getMonitorSignals();
    const idx = list.findIndex(s => s.signalId === signal.signalId);
    if (idx >= 0) {
      list[idx] = signal;
    } else {
      list.push(signal);
    }
    this.setStore('monitor_signals', list);
  }

  static getDailyMonitorCheckLogs(): DailyMonitorCheckLog[] {
    return this.getStore('daily_monitor_check_logs', initialDailyMonitorCheckLogs);
  }

  static addDailyMonitorCheckLog(log: DailyMonitorCheckLog): void {
    const list = this.getDailyMonitorCheckLogs();
    list.unshift(log);
    this.setStore('daily_monitor_check_logs', list);
  }

  static getBackupMonitorContacts(): BackupMonitorContact[] {
    return this.getStore('backup_monitor_contacts', initialBackupMonitorContacts);
  }

  static saveBackupMonitorContact(contact: BackupMonitorContact): void {
    const list = this.getBackupMonitorContacts();
    const idx = list.findIndex(b => b.backupId === contact.backupId);
    if (idx >= 0) {
      list[idx] = contact;
    } else {
      list.push(contact);
    }
    this.setStore('backup_monitor_contacts', list);
  }

  // Data Privacy Methods
  static getDataSubjectConsentRecords(): DataSubjectConsentRecord[] {
    return this.getStore('data_subject_consent_records', initialDataSubjectConsentRecords);
  }

  static getDataSubjectRequests(): DataSubjectRequest[] {
    return this.getStore('data_subject_requests', initialDataSubjectRequests);
  }

  static saveDataSubjectRequest(request: DataSubjectRequest): void {
    const list = this.getDataSubjectRequests();
    const idx = list.findIndex(r => r.requestId === request.requestId);
    if (idx >= 0) {
      list[idx] = request;
    } else {
      list.unshift(request);
    }
    this.setStore('data_subject_requests', list);
  }

  static getDataRetentionCategoryConfigs(): DataRetentionCategoryConfig[] {
    return this.getStore('data_retention_category_configs', initialDataRetentionCategoryConfigs);
  }

  static saveDataRetentionCategoryConfig(config: DataRetentionCategoryConfig): void {
    const list = this.getDataRetentionCategoryConfigs();
    const idx = list.findIndex(c => c.categoryId === config.categoryId);
    if (idx >= 0) {
      list[idx] = config;
    } else {
      list.push(config);
    }
    this.setStore('data_retention_category_configs', list);
  }

  static getPrivacyPolicyVersionRecords(): PrivacyPolicyVersionRecord[] {
    return this.getStore('privacy_policy_version_records', initialPrivacyPolicyVersionRecords);
  }

  static addPrivacyPolicyVersionRecord(record: PrivacyPolicyVersionRecord): void {
    const list = this.getPrivacyPolicyVersionRecords();
    list.unshift(record);
    this.setStore('privacy_policy_version_records', list);
  }

  // Security & Session Methods
  static getRoleTwoFactorPolicies(): RoleTwoFactorPolicy[] {
    return this.getStore('role_two_factor_policies', initialRoleTwoFactorPolicies);
  }

  static saveRoleTwoFactorPolicy(policy: RoleTwoFactorPolicy): void {
    const list = this.getRoleTwoFactorPolicies();
    const idx = list.findIndex(p => p.roleId === policy.roleId);
    if (idx >= 0) {
      list[idx] = policy;
    } else {
      list.push(policy);
    }
    this.setStore('role_two_factor_policies', list);
  }

  static getActiveUserSessions(): ActiveUserSession[] {
    return this.getStore('active_user_sessions', initialActiveUserSessions);
  }

  static revokeUserSession(sessionId: string): void {
    const list = this.getActiveUserSessions();
    const updated = list.filter(s => s.sessionId !== sessionId);
    this.setStore('active_user_sessions', updated);
  }

  static getSecurityEventLogs(): SecurityEventLog[] {
    return this.getStore('security_event_logs', initialSecurityEventLogs);
  }

  static saveSecurityEventLog(event: SecurityEventLog): void {
    const list = this.getSecurityEventLogs();
    const idx = list.findIndex(e => e.eventId === event.eventId);
    if (idx >= 0) {
      list[idx] = event;
    } else {
      list.unshift(event);
    }
    this.setStore('security_event_logs', list);
  }

  static getPasswordPolicyConfig(): PasswordPolicyConfig {
    return this.getStore('password_policy_config', initialPasswordPolicyConfig);
  }

  static savePasswordPolicyConfig(config: PasswordPolicyConfig): void {
    this.setStore('password_policy_config', config);
  }








  static getPayoutStatement(partnerId: string, periodLabel: string = 'Current Financial Quarter'): PayoutStatementSummary {
    const entries = this.getCommissionPayoutEntries().filter(e => !partnerId || e.partnerId === partnerId || partnerId === 'p_001');
    const totalEarned = entries.reduce((sum, e) => sum + e.amount, 0);
    const paidEntries = entries.filter(e => e.status === 'paid');
    const totalDisbursed = paidEntries.reduce((sum, e) => sum + e.amount, 0);
    const pendingEntries = entries.filter(e => e.status === 'pending_approval' || e.status === 'approved_pending_payout');
    const pendingPayout = pendingEntries.reduce((sum, e) => sum + e.amount, 0);
    const tdsDeducted = Math.round(totalDisbursed * 0.05); // 5% TDS under Sec 194H/194C
    const netDisbursed = totalDisbursed - tdsDeducted;

    return {
      partnerId: partnerId || 'p_001',
      partnerName: entries[0]?.partnerName || 'Sanjay Tukaram Deshmukh',
      periodLabel,
      startDate: '2026-04-01',
      endDate: '2026-08-31',
      totalEarned,
      totalDisbursed,
      pendingPayout,
      tdsDeducted,
      netDisbursed,
      entriesCount: entries.length
    };
  }






  static getSnagsByJobId(jobId: string): DefectSnagRecord[] {
    const all = this.getStore('defect_snags', initialDefectSnags);
    const jobSnags = all.filter(s => s.jobId === jobId);
    if (jobSnags.length > 0) return jobSnags;
    return initialDefectSnags.map(s => ({ ...s, jobId }));
  }

  static saveSnagItem(snag: DefectSnagRecord): void {
    const all = this.getStore('defect_snags', initialDefectSnags);
    const idx = all.findIndex(s => s.id === snag.id);
    if (idx >= 0) {
      all[idx] = snag;
    } else {
      all.push(snag);
    }
    this.setStore('defect_snags', all);
  }

  static updateSnagStatus(snagId: string, status: DefectSnagRecord['resolutionStatus'], reworkNotes?: string, verifiedBy?: string): void {
    const all = this.getStore('defect_snags', initialDefectSnags);
    const snag = all.find(s => s.id === snagId);
    if (snag) {
      snag.resolutionStatus = status;
      if (reworkNotes) snag.reworkNotes = reworkNotes;
      if (verifiedBy) {
        snag.reverifiedByInspectorName = verifiedBy;
        snag.reverifiedAt = new Date().toLocaleString();
      }
      if (status === 'qc_verified_closed' || status === 'customer_waived_cosmetic') {
        snag.hardBlockHandoverFlag = false;
      }
      this.saveSnagItem(snag);
    }
  }



  static updateReconciliationRun(run: ReconciliationRunRecord): void {
    const list = this.getReconciliationRuns().map(r => r.id === run.id ? run : r);
    if (!list.some(r => r.id === run.id)) {
      list.push(run);
    }
    this.setStore('reconciliation_runs', list);
  }

  static markTransactionReconciled(runId: string, txId: string, reason: string, userEmail: string): void {
    const runs = this.getReconciliationRuns();
    const updated = runs.map(run => {
      if (run.id === runId) {
        const updatedTxs = run.unmatchedTransactions.map(tx => {
          if (tx.id === txId) {
            return {
              ...tx,
              status: 'manually_reconciled' as const,
              manualReason: reason,
              reconciledBy: userEmail,
              reconciledAt: new Date().toISOString()
            };
          }
          return tx;
        });
        const remainingUnmatched = updatedTxs.filter(t => t.status !== 'manually_reconciled').length;
        return {
          ...run,
          unmatchedCount: remainingUnmatched,
          unmatchedTransactions: updatedTxs,
          status: remainingUnmatched === 0 ? ('pass_all_matched' as const) : run.status
        };
      }
      return run;
    });
    this.setStore('reconciliation_runs', updated);
  }

  static addReconciliationRun(run: ReconciliationRunRecord): void {
    const list = [run, ...this.getReconciliationRuns()];
    this.setStore('reconciliation_runs', list);
  }


  // Helper to reset the entire database to seeds

  static resetToSeeds(): void {
    localStorage.removeItem('aiec_users');
    localStorage.removeItem('aiec_leads');
    localStorage.removeItem('aiec_deals');
    localStorage.removeItem('aiec_jobs');
    localStorage.removeItem('aiec_payments');
    localStorage.removeItem('aiec_suppliers');
    localStorage.removeItem('aiec_purchase_orders');
    localStorage.removeItem('aiec_auto_po_rules');
    localStorage.removeItem('aiec_production_records');
    localStorage.removeItem('aiec_supplier_scorecards');
    localStorage.removeItem('aiec_supplier_contracts');
    localStorage.removeItem('aiec_supplier_threads');
    localStorage.removeItem('aiec_supplier_payment_terms');
    localStorage.removeItem('aiec_delivery_schedules');
    localStorage.removeItem('aiec_shipment_trackers');
    localStorage.removeItem('aiec_territories');
    localStorage.removeItem('aiec_site_visits');
    localStorage.removeItem('aiec_emergency_alerts');
    localStorage.removeItem('aiec_reminder_rules');
    localStorage.removeItem('aiec_loan_partners');
    localStorage.removeItem('aiec_loan_applications');
    localStorage.removeItem('aiec_invoices');
    localStorage.removeItem('aiec_escalations');
    localStorage.removeItem('aiec_disputes');
    window.dispatchEvent(new Event('aiec_db_update'));
  }
}

const initialAutoPoRules: AutoPoTriggerRule[] = [
  {
    id: 'rule_1',
    ruleName: 'Standard Elevator Deal Auto-PO Routing Rule',
    triggerCondition: 'immediately_on_countersignature',
    weights: {
      priceWeight: 40,
      deliverySpeedWeight: 30,
      performanceScoreWeight: 20,
      regionProximityWeight: 10
    },
    approvalThresholdAmount: 500000,
    requireApprovalIfDiscrepancy: true,
    ruleActiveFlag: true,
    updatedAt: '2026-08-10T10:00:00Z',
    updatedBy: 'Mr. Prashant Wable (Admin)',
    lastSimulatedResult: {
      simulatedAt: '2026-08-11T16:30:00Z',
      sampleConfig: 'Traction Gearless 6-Pax (Sun Elevators vs Apex)',
      selectedSupplierId: 'sun_elevators',
      selectedSupplierName: 'Sun Elevators Manufacturing Pvt Ltd',
      calculatedScore: 94.2,
      runnerUpSupplierName: 'Apex Cabin & Mechanicals Works',
      concentrationWarning: 'Sun Elevators is currently selected for 68% of active traction orders. Higher price weight may risk single-supplier dependency.'
    }
  },
  {
    id: 'rule_2',
    ruleName: 'Hydraulic & Accessibility Fast-Track Ordering',
    triggerCondition: 'after_advance_payment_clears',
    weights: {
      priceWeight: 30,
      deliverySpeedWeight: 50,
      performanceScoreWeight: 10,
      regionProximityWeight: 10
    },
    approvalThresholdAmount: 350000,
    requireApprovalIfDiscrepancy: true,
    ruleActiveFlag: true,
    updatedAt: '2026-08-08T12:00:00Z',
    updatedBy: 'Mr. Prashant Wable (Admin)',
    lastSimulatedResult: {
      simulatedAt: '2026-08-11T14:10:00Z',
      sampleConfig: 'Hydraulic Heavy Duty Power Pack 300 Bar',
      selectedSupplierId: 'indo_german_drives',
      selectedSupplierName: 'Indo-German Elevator Motors & Hydraulics',
      calculatedScore: 96.8,
      runnerUpSupplierName: 'Apex Cabin & Mechanicals Works'
    }
  }
];

// Seed territories data for Pune
const initialTerritories: Territory[] = [
  {
    id: 't_north',
    name: 'Pune North (Chakan)',
    polygonCoordinates: [
      { lat: 18.7300, lng: 73.8200 },
      { lat: 18.7300, lng: 73.8800 },
      { lat: 18.6600, lng: 73.8800 },
      { lat: 18.6600, lng: 73.8200 }
    ],
    assignedSurveyorIds: ['amit_sharma'],
    monthlyLeadTarget: 40,
    monthlyLeadsCaptured: 34,
    conversionRate: 68,
    color: '#0E4B3D'
  },
  {
    id: 't_south',
    name: 'Pune South (Kothrud/Katraj)',
    polygonCoordinates: [
      { lat: 18.5200, lng: 73.7800 },
      { lat: 18.5200, lng: 73.8300 },
      { lat: 18.4500, lng: 73.8300 },
      { lat: 18.4500, lng: 73.7800 }
    ],
    assignedSurveyorIds: ['sanjay_deshmukh'],
    monthlyLeadTarget: 35,
    monthlyLeadsCaptured: 28,
    conversionRate: 72,
    color: '#B8873D'
  },
  {
    id: 't_east',
    name: 'Pune East (Kharadi)',
    polygonCoordinates: [
      { lat: 18.5800, lng: 73.9000 },
      { lat: 18.5800, lng: 73.9700 },
      { lat: 18.5100, lng: 73.9700 },
      { lat: 18.5100, lng: 73.9000 }
    ],
    assignedSurveyorIds: ['amit_sharma'],
    monthlyLeadTarget: 30,
    monthlyLeadsCaptured: 19,
    conversionRate: 60,
    color: '#8A64D6'
  },
  {
    id: 't_west',
    name: 'Pune West (Hinjewadi)',
    polygonCoordinates: [
      { lat: 18.6200, lng: 73.7000 },
      { lat: 18.6200, lng: 73.7700 },
      { lat: 18.5400, lng: 73.7700 },
      { lat: 18.5400, lng: 73.7000 }
    ],
    assignedSurveyorIds: ['sanjay_deshmukh'],
    monthlyLeadTarget: 50,
    monthlyLeadsCaptured: 42,
    conversionRate: 75,
    color: '#E5A93C'
  }
];

const initialProductionRecords: ProductionStatusRecord[] = [
  {
    id: 'prod_rec_1',
    poId: 'PO-2026-0891',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    isManufacturer: true,
    componentName: 'Traction Machine Frame & 6-Pax Gearless Motor Unit',
    batchNumber: 'BATCH-2026-08-A',
    productionStage: 'Custom Fabrication',
    completionPercentage: 65,
    stalledFlag: false,
    estimatedCompletionDate: '2026-08-20',
    sharedBatchPoIds: ['PO-2026-0891', 'PO-2026-0894'],
    stageEvidenceUploads: [
      {
        id: 'up_1',
        stageName: 'Raw Material Sourced',
        fileName: 'Mill_Test_Cert_IS2062_Steel.pdf',
        fileUrl: '#',
        uploadedAt: '2026-08-05T10:30:00Z',
        uploadedBy: 'Sun Factory QC',
        note: 'IS 2062 Structural Steel grade verification passed'
      },
      {
        id: 'up_2',
        stageName: 'Custom Fabrication',
        fileName: 'CNC_Motor_Frame_Welding_Inspection.jpg',
        fileUrl: '#',
        uploadedAt: '2026-08-09T14:15:00Z',
        uploadedBy: 'Sun Shop Floor Mgr',
        note: 'Frame laser alignment verified to ±0.2mm'
      }
    ],
    stageHistory: [
      {
        stageName: 'Raw Material Sourced',
        timestamp: '2026-08-05T10:00:00Z',
        updatedBy: 'Sun Elevators Factory',
        note: 'Steel plates and copper windings delivered',
        completionPercentage: 25
      },
      {
        stageName: 'Custom Fabrication',
        timestamp: '2026-08-08T09:00:00Z',
        updatedBy: 'Sun Elevators Factory',
        note: 'Machining and stator winding assembly underway',
        completionPercentage: 65
      }
    ],
    updatedAt: '2026-08-09T14:15:00Z'
  },
  {
    id: 'prod_rec_2',
    poId: 'PO-2026-0892',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    isManufacturer: true,
    componentName: 'SS 304 Hairline Finish Custom Cabin & COP Panel',
    batchNumber: 'BATCH-APX-412',
    productionStage: 'Quality & Testing',
    completionPercentage: 85,
    stalledFlag: true,
    stalledReason: 'Waiting for custom mirror glass panel replacement after micro-scratch detected during internal QC',
    stalledSinceDays: 3,
    estimatedCompletionDate: '2026-08-18',
    stageEvidenceUploads: [
      {
        id: 'up_3',
        stageName: 'Quality & Testing',
        fileName: 'Cabin_Lighting_COP_Wiring_Test.pdf',
        fileUrl: '#',
        uploadedAt: '2026-08-10T11:00:00Z',
        uploadedBy: 'Apex QC Auditor',
        note: 'Electrical circuitry and emergency alarm passed'
      }
    ],
    stageHistory: [
      {
        stageName: 'Raw Material Sourced',
        timestamp: '2026-08-02T10:00:00Z',
        updatedBy: 'Apex Cabins',
        note: 'SS 304 sheets received with protective film',
        completionPercentage: 30
      },
      {
        stageName: 'Custom Fabrication',
        timestamp: '2026-08-06T11:00:00Z',
        updatedBy: 'Apex Cabins',
        note: 'Laser cutting and hydraulic bending complete',
        completionPercentage: 65
      },
      {
        stageName: 'Quality & Testing',
        timestamp: '2026-08-09T16:00:00Z',
        updatedBy: 'Apex Cabins',
        note: 'Internal inspection found minor mirror panel flaw; panel re-ordered',
        completionPercentage: 85
      }
    ],
    updatedAt: '2026-08-10T11:00:00Z'
  }
];

const initialSupplierScorecards: SupplierScorecardDetail[] = [
  {
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    overallScore: 94,
    deliveryScore: 96,
    qualityScore: 92,
    commercialScore: 95,
    responsivenessScore: 93,
    scoreTrend: 'improving',
    adminContextNote: 'Heavy monsoon rains caused 2-day freight transport delay in July; factory production speed remains exceptional.',
    ratingsHistory: [
      {
        id: 'rate_101',
        orderId: 'PO-2026-0840',
        supplierId: 'sun_elevators',
        supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
        overallRating: 4.8,
        deliveryTimelinessDays: 0,
        qualityDefectLogged: false,
        attributedTo: 'supplier_part',
        completedDate: '2026-07-28',
        disputeStatus: 'none'
      },
      {
        id: 'rate_102',
        orderId: 'PO-2026-0812',
        supplierId: 'sun_elevators',
        supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
        overallRating: 3.5,
        deliveryTimelinessDays: 2,
        qualityDefectLogged: true,
        defectNotes: 'Minor scratch on drive housing cover; motor functional',
        attributedTo: 'technician_installation_error',
        completedDate: '2026-07-15',
        disputeStatus: 'resolved_corrected',
        disputeReason: 'Scratch occurred during technician unloading at site, not during factory packing.',
        disputeAdminNote: 'Site inspection confirmed damage happened during manual offloading by site crew. Rating corrected to exclude supplier penalty.',
        disputeSubmittedAt: '2026-07-18T10:00:00Z',
        disputeResolvedAt: '2026-07-20T14:30:00Z'
      },
      {
        id: 'rate_103',
        orderId: 'PO-2026-0780',
        supplierId: 'sun_elevators',
        supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
        overallRating: 5.0,
        deliveryTimelinessDays: -1,
        qualityDefectLogged: false,
        attributedTo: 'supplier_part',
        completedDate: '2026-06-30',
        disputeStatus: 'none'
      }
    ]
  },
  {
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    overallScore: 88,
    deliveryScore: 85,
    qualityScore: 91,
    commercialScore: 89,
    responsivenessScore: 87,
    scoreTrend: 'stable',
    adminContextNote: 'High custom cabin request volume in Q2; lead times expanding slightly.',
    ratingsHistory: [
      {
        id: 'rate_201',
        orderId: 'PO-2026-0822',
        supplierId: 'apex_cabins',
        supplierName: 'Apex Cabin & Mechanicals Works',
        overallRating: 4.2,
        deliveryTimelinessDays: 1,
        qualityDefectLogged: false,
        attributedTo: 'supplier_part',
        completedDate: '2026-07-22',
        disputeStatus: 'none'
      },
      {
        id: 'rate_202',
        orderId: 'PO-2026-0790',
        supplierId: 'apex_cabins',
        supplierName: 'Apex Cabin & Mechanicals Works',
        overallRating: 3.2,
        deliveryTimelinessDays: 3,
        qualityDefectLogged: true,
        defectNotes: 'Handrail mounting hole misaligned by 4mm',
        attributedTo: 'supplier_part',
        completedDate: '2026-07-02',
        disputeStatus: 'disputed',
        disputeReason: 'Custom drawing revision v2 provided by surveyor specified new hole center; cabin built as per approved drawing v2.',
        disputeSubmittedAt: '2026-07-05T11:20:00Z'
      }
    ]
  }
];

const initialSupplierContracts: SupplierContractSlaRecord[] = [
  {
    id: 'contract_sun_01',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    contractTitle: 'Master Traction Drive OEM Supply & SLA Agreement 2026',
    status: 'active',
    paymentTermsDays: 30,
    paymentTermsDescription: '20% advance on PO dispatch, 80% Net-30 upon site delivery receipt & GRN verification',
    deliverySlaDays: 14,
    qualityStandardsExpected: [
      'IS 14671 Elevator Safety Standard Compliant',
      'ISO 9001:2015 Factory Quality Certified',
      '100% No-Defect Pre-Dispatch Motor Insulation Testing'
    ],
    noLiabilityWarrantyTerms: '24-Month direct OEM manufacturer warranty pass-through. AIEC acts strictly as digital aggregator orchestrator without direct equipment manufacture liability.',
    agreementStartDate: '2025-09-01',
    agreementExpiryDate: '2026-08-31',
    agreementDocumentUrl: '#',
    lastRenewedAt: '2025-09-01T00:00:00Z',
    amendmentHistory: [
      {
        id: 'amend_1',
        title: 'Lead Time Reduction Amendment (18 days -> 14 days)',
        effectiveDate: '2026-01-15',
        summary: 'Agreed 14-day SLA window upon commissioning of Chakan Factory Line 2.',
        documentUrl: '#',
        uploadedAt: '2026-01-10T10:00:00Z',
        uploadedBy: 'Mr. Prashant Wable (Admin)'
      }
    ]
  },
  {
    id: 'contract_apex_01',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    contractTitle: 'Custom Stainless Steel Cabin & Structural Metal SLA Agreement',
    status: 'renewal_due',
    paymentTermsDays: 15,
    paymentTermsDescription: '30% advance on PO receipt, 70% Net-15 upon dispatch readiness notice',
    deliverySlaDays: 12,
    qualityStandardsExpected: [
      'Grade 304 Stainless Steel Material Verification',
      'Laser Cutting Precision ±0.2mm',
      'Safe Protective Film Packaging'
    ],
    noLiabilityWarrantyTerms: '12-Month direct fabricator structural warranty pass-through to customer.',
    agreementStartDate: '2025-08-15',
    agreementExpiryDate: '2026-08-15',
    agreementDocumentUrl: '#',
    lastRenewedAt: '2025-08-15T00:00:00Z',
    amendmentHistory: []
  }
];

const initialSupplierThreads: SupplierCommunicationThread[] = [
  {
    id: 'thread_1',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    relatedPoId: 'PO-2026-0891',
    topicTitle: 'PO-2026-0891 Dispatch Timeline & Motor Plate Drawing Signoff',
    status: 'active',
    unresponsiveFlag: false,
    unresponsiveWindowHours: 24,
    lastResponseTimestamp: '2026-08-11T16:20:00Z',
    lastMessageText: 'Raw material mill test certificate uploaded. Laser alignment of stator frame completed today.',
    unreadCount: 0,
    messages: [
      {
        id: 'msg_101',
        senderRole: 'admin',
        senderName: 'Mr. Prashant Vasant Wable',
        timestamp: '2026-08-10T10:00:00Z',
        text: 'Please confirm dispatch readiness for PO-2026-0891 (Traction Machine 6-Pax). Site installation at Deshmukh Arcade is scheduled for Aug 22.',
        attachments: [
          {
            id: 'att_1',
            fileName: 'PO-2026-0891_Official_Dispatch_Notice.pdf',
            fileType: 'po_link',
            fileUrl: '#',
            fileSize: '420 KB'
          }
        ],
        isRead: true
      },
      {
        id: 'msg_102',
        senderRole: 'bot',
        senderName: 'AIEC Logistics Engine (Automated)',
        timestamp: '2026-08-10T10:01:00Z',
        text: 'System Note: Standard SLA delivery window is 14 days (Target: Aug 20, 2026). Milestone track created.',
        isRead: true
      },
      {
        id: 'msg_103',
        senderRole: 'supplier',
        senderName: 'Sun Factory QC Manager',
        timestamp: '2026-08-11T16:20:00Z',
        text: 'Raw material mill test certificate uploaded. Laser alignment of stator frame completed today. Proceeding to copper winding high-voltage insulation test tomorrow.',
        attachments: [
          {
            id: 'att_2',
            fileName: 'Stator_Laser_Alignment_Report_Aug11.pdf',
            fileType: 'pdf',
            fileUrl: '#',
            fileSize: '1.2 MB'
          }
        ],
        isRead: true
      }
    ]
  },
  {
    id: 'thread_2',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    relatedPoId: 'PO-2026-0892',
    topicTitle: 'PO-2026-0892 Replacement Glass Mirror Panel Exception',
    status: 'escalated_unresponsive',
    unresponsiveFlag: true,
    unresponsiveWindowHours: 24,
    lastResponseTimestamp: '2026-08-09T09:15:00Z',
    lastMessageText: 'Micro-scratch detected on custom mirror panel during internal QC. Re-order placed with glass vendor.',
    unreadCount: 1,
    messages: [
      {
        id: 'msg_201',
        senderRole: 'supplier',
        senderName: 'Apex Dispatch Supervisor',
        timestamp: '2026-08-09T09:15:00Z',
        text: 'Micro-scratch detected on custom mirror panel during internal QC. Re-order placed with glass vendor.',
        isRead: true
      },
      {
        id: 'msg_202',
        senderRole: 'admin',
        senderName: 'Mr. Prashant Vasant Wable',
        timestamp: '2026-08-10T14:30:00Z',
        text: 'Apex team: Please update expected replacement glass arrival date. Deshmukh site cabin installation cannot stall past Aug 18.',
        isRead: true
      },
      {
        id: 'msg_203',
        senderRole: 'system_log',
        senderName: 'System Escalation Monitor',
        timestamp: '2026-08-11T15:00:00Z',
        text: '⚠️ Unresponsive Flag Triggered: Supplier has not replied in >24 hours following Admin urgent inquiry. Escalated to Automation Health & Exception board.',
        isRead: false
      }
    ]
  }
];

const initialPaymentTermsConfigs: SupplierPaymentTermsConfig[] = [
  {
    id: 'terms_tier_1',
    tierLevel: 'tier_1_preferred',
    termType: 'net_30',
    milestoneSplit: { advancePct: 20, dispatchDeliveryPct: 70, retentionPct: 10 },
    retentionPct: 10,
    autoReleaseRetentionDaysAfterHandover: 14,
    advanceRequiredFlag: false,
    creditLimitINR: 2500000,
    isCustomOverride: false,
    graduationScoreThreshold: 90,
    lastUpdatedBy: 'System Tier Default',
    updatedAt: '2026-08-01T00:00:00Z',
    notes: 'Standard preferred tier terms for suppliers with Performance Score 90+'
  },
  {
    id: 'terms_tier_2',
    tierLevel: 'tier_2_approved',
    termType: 'net_15',
    milestoneSplit: { advancePct: 15, dispatchDeliveryPct: 75, retentionPct: 10 },
    retentionPct: 10,
    autoReleaseRetentionDaysAfterHandover: 21,
    advanceRequiredFlag: false,
    creditLimitINR: 1000000,
    isCustomOverride: false,
    graduationScoreThreshold: 75,
    lastUpdatedBy: 'System Tier Default',
    updatedAt: '2026-08-01T00:00:00Z',
    notes: 'Approved tier terms for verified suppliers with Performance Score 75-89'
  },
  {
    id: 'terms_tier_3',
    tierLevel: 'tier_3_probationary',
    termType: 'advance_required',
    milestoneSplit: { advancePct: 40, dispatchDeliveryPct: 45, retentionPct: 15 },
    retentionPct: 15,
    autoReleaseRetentionDaysAfterHandover: 30,
    advanceRequiredFlag: true,
    creditLimitINR: 300000,
    isCustomOverride: false,
    graduationScoreThreshold: 75,
    lastUpdatedBy: 'System Tier Default',
    updatedAt: '2026-08-01T00:00:00Z',
    notes: 'Probationary tier terms requiring 40% advance and 15% installation retention hold'
  },
  {
    id: 'terms_sun_override',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    tierLevel: 'tier_1_preferred',
    termType: 'milestone_split',
    milestoneSplit: { advancePct: 20, dispatchDeliveryPct: 70, retentionPct: 10 },
    retentionPct: 10,
    autoReleaseRetentionDaysAfterHandover: 14,
    advanceRequiredFlag: false,
    creditLimitINR: 3500000,
    isCustomOverride: true,
    graduationScoreThreshold: 90,
    lastUpdatedBy: 'Mr. Prashant Vasant Wable (Admin)',
    updatedAt: '2026-08-05T10:00:00Z',
    notes: 'Custom negotiated credit limit ₹35L based on 94 performance score and OEM motor reliability'
  },
  {
    id: 'terms_apex_override',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    tierLevel: 'tier_2_approved',
    termType: 'milestone_split',
    milestoneSplit: { advancePct: 30, dispatchDeliveryPct: 60, retentionPct: 10 },
    retentionPct: 10,
    autoReleaseRetentionDaysAfterHandover: 21,
    advanceRequiredFlag: true,
    creditLimitINR: 1200000,
    isCustomOverride: true,
    graduationScoreThreshold: 85,
    lastUpdatedBy: 'Mr. Prashant Vasant Wable (Admin)',
    updatedAt: '2026-08-02T11:00:00Z',
    notes: '30% advance required due to custom SS sheet cutting upfront raw material commitments'
  }
];

const initialDeliverySchedules: DeliverySchedule[] = [
  {
    id: 'ds_101',
    poId: 'PO-2026-0891',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    customerName: 'Shree Sai Developers (Kothrud Residency)',
    siteAddress: 'Plot 42, Karve Road, Kothrud, Pune - 411038',
    itemSummary: 'PO-2026-0891: Gearless Traction Motor 10HP & Control Panel v4',
    prerequisitePoId: undefined,
    scheduledDeliveryDate: '2026-08-15',
    deliveryTimeWindow: '10:00 AM - 01:00 PM',
    siteReadinessConfirmedFlag: true,
    siteReadinessChecklist: {
      shaftCivilWorkComplete: true,
      unloadingAreaClear: true,
      powerSupply3PhaseReady: true,
      siteEngineerSignoff: true,
      craneScaffoldingAvailable: true,
      confirmedBy: 'Er. Rajesh Patil (Site Engineer)',
      confirmedAt: '2026-08-10T14:30:00Z'
    },
    status: 'technician_assigned',
    assignedTechnicianId: 'tech_sanjay',
    assignedTechnicianName: 'Sanjay Kumar (Sr. Elevator Technician)',
    supplierAvailableWindows: ['09:00 AM - 12:00 PM', '10:00 AM - 01:00 PM', '02:00 PM - 05:00 PM'],
    createdAt: '2026-08-08T09:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z'
  },
  {
    id: 'ds_102',
    poId: 'PO-2026-0892',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    customerName: 'Shree Sai Developers (Kothrud Residency)',
    siteAddress: 'Plot 42, Karve Road, Kothrud, Pune - 411038',
    itemSummary: 'PO-2026-0892: Stainless Steel Mirror Finish Cabin & Car Frame',
    prerequisitePoId: 'PO-2026-0891', // Cabin must arrive AFTER drive unit Motor PO-0891
    scheduledDeliveryDate: '2026-08-17',
    deliveryTimeWindow: '02:00 PM - 05:00 PM',
    siteReadinessConfirmedFlag: false,
    siteReadinessChecklist: {
      shaftCivilWorkComplete: true,
      unloadingAreaClear: false,
      powerSupply3PhaseReady: true,
      siteEngineerSignoff: false,
      craneScaffoldingAvailable: true
    },
    status: 'pending_site_readiness',
    supplierAvailableWindows: ['11:00 AM - 02:00 PM', '02:00 PM - 05:00 PM'],
    createdAt: '2026-08-09T10:00:00Z',
    updatedAt: '2026-08-09T10:00:00Z'
  },
  {
    id: 'ds_103',
    poId: 'PO-2026-0870',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    customerName: 'Pratibha Enclave Phase 2 (Viman Nagar)',
    siteAddress: 'A-Wing, Viman Nagar Central, Pune - 411014',
    itemSummary: 'PO-2026-0870: Microprocessor VVVF Drive Controller Unit',
    scheduledDeliveryDate: '2026-08-14',
    deliveryTimeWindow: '09:00 AM - 12:00 PM',
    siteReadinessConfirmedFlag: true,
    siteReadinessChecklist: {
      shaftCivilWorkComplete: true,
      unloadingAreaClear: true,
      powerSupply3PhaseReady: true,
      siteEngineerSignoff: true,
      craneScaffoldingAvailable: true,
      confirmedBy: 'Vikram Joshi (Project Mgr)',
      confirmedAt: '2026-08-11T11:00:00Z'
    },
    status: 'in_transit',
    assignedTechnicianId: 'tech_vikas',
    assignedTechnicianName: 'Vikas Deshmukh (Installation Lead)',
    rescheduledReason: 'Supplier factory dispatch delayed by 24 hours due to quality audit check',
    rescheduleHistory: [
      {
        previousDate: '2026-08-13',
        newDate: '2026-08-14',
        reason: 'Supplier factory dispatch delayed by 24 hours due to quality audit check',
        requestedBy: 'Sun Elevators Logistics',
        timestamp: '2026-08-12T08:00:00Z'
      }
    ],
    supplierAvailableWindows: ['09:00 AM - 12:00 PM', '01:00 PM - 04:00 PM'],
    createdAt: '2026-08-07T12:00:00Z',
    updatedAt: '2026-08-12T08:00:00Z'
  }
];

const initialShipmentTrackers: LiveShipmentTracker[] = [
  {
    id: 'st_870',
    poId: 'PO-2026-0870',
    customerName: 'Pratibha Enclave Phase 2 (Viman Nagar)',
    customerPhone: '+91 98220 12345',
    siteAddress: 'A-Wing, Viman Nagar Central, Pune - 411014',
    siteLatLng: { lat: 18.5679, lng: 73.9143 },
    status: 'in_transit',
    activeLegId: 'leg_870_1',
    legs: [
      {
        legId: 'leg_870_1',
        poId: 'PO-2026-0870',
        legTitle: 'Leg 1: Heavy Drive Unit & Traction Motor',
        supplierId: 'sun_elevators',
        supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
        driverName: 'Ramesh Pawar',
        driverPhone: '+91 98901 23456',
        vehicleNumber: 'MH 12 QX 4821 (Eicher 14ft)',
        vehicleType: 'Heavy Flatbed Truck',
        hasLiveGps: true,
        currentLatLng: { lat: 18.5412, lng: 73.8821 },
        lastLocationTimestamp: 'Just now (Live)',
        speedKmph: 42,
        distanceRemainingKm: 6.4,
        etaEstimate: '22 mins (Approx 11:30 AM)',
        transitMilestone: 'in_transit',
        customerNotifiedFlag: true,
        whatsappNotificationLog: [
          {
            sentAt: '2026-08-12T09:00:00Z',
            messageText: 'AIEC Delivery Update: Vehicle MH 12 QX 4821 carrying your elevator drive unit has dispatched from Chakan Hub! ETA: 11:30 AM.',
            status: 'read'
          }
        ],
        milestoneHistory: [
          { milestone: 'dispatched', timestamp: '2026-08-12T08:30:00Z', locationName: 'Chakan Manufacturing Hub', note: 'Quality seal verified & loaded' },
          { milestone: 'in_transit', timestamp: '2026-08-12T09:15:00Z', locationName: 'Yerwada Flyover', note: 'Approaching city limits' }
        ]
      },
      {
        legId: 'leg_870_2',
        poId: 'PO-2026-0870',
        legTitle: 'Leg 2: VVVF Control Panel & Wiring Harness',
        supplierId: 'delta_controls',
        supplierName: 'Delta Control Systems',
        driverName: 'Suresh More',
        driverPhone: '+91 97654 32109',
        vehicleNumber: 'MH 14 HG 1102 (Tempo)',
        vehicleType: 'Covered Goods Carrier',
        hasLiveGps: false, // Fallback milestone tracking!
        etaEstimate: 'Scheduled Arrived 02:00 PM',
        transitMilestone: 'dispatched',
        customerNotifiedFlag: true,
        whatsappNotificationLog: [
          {
            sentAt: '2026-08-12T09:30:00Z',
            messageText: 'AIEC Delivery Update: Leg 2 (Control Panel) has dispatched via Delta Express logistics. ETA: 02:00 PM.',
            status: 'delivered'
          }
        ],
        milestoneHistory: [
          { milestone: 'dispatched', timestamp: '2026-08-12T09:30:00Z', locationName: 'Bhosari Industrial Estate', note: 'Dispatched via Delta Logistics' }
        ]
      }
    ],
    updatedAt: '2026-08-12T09:45:00Z'
  }
];

const initialSiteDeliveryChecklists: SiteDeliveryChecklist[] = [
  {
    id: 'chk_103_870',
    poId: 'PO-2026-0870',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    customerName: 'Pratibha Enclave Phase 2 (Viman Nagar)',
    siteAddress: 'A-Wing, Viman Nagar Central, Pune - 411014',
    deliveryType: 'full',
    receivedBy: 'Rajesh Patel (Lead Tech)',
    receiverRole: 'technician',
    receiverPhone: '+91 98765 43212',
    discrepancyFlag: true,
    discrepancyReportId: 'disc_870_1',
    status: 'in_progress',
    paymentTriggered: false,
    createdAt: '2026-08-12T09:00:00Z',
    updatedAt: '2026-08-12T09:30:00Z',
    items: [
      {
        id: 'itm_1',
        itemName: 'Gearless PMSM Traction Motor (8KW)',
        partNumber: 'SE-MOT-800',
        expectedQty: 1,
        receivedQty: 1,
        condition: 'good',
        photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300'],
        verified: true,
        isMandatory: true,
        notes: 'Serial #MOT-2026-991 inspected and verified with seal intact.'
      },
      {
        id: 'itm_2',
        itemName: 'VVVF Microprocessor Control Panel & Cabinet',
        partNumber: 'DC-CP-500',
        expectedQty: 1,
        receivedQty: 1,
        condition: 'good',
        photos: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300'],
        verified: true,
        isMandatory: true,
        notes: 'All terminal blocks and breakers secure.'
      },
      {
        id: 'itm_3',
        itemName: 'Stainless Steel Hairline Finished Elevator Cabin Shell',
        partNumber: 'SE-CAB-SS304',
        expectedQty: 1,
        receivedQty: 1,
        condition: 'minor_scratches',
        photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300'],
        verified: true,
        isMandatory: true,
        notes: 'Minor surface scuff on protective film; stainless steel intact underneath.'
      },
      {
        id: 'itm_4',
        itemName: 'High-Tensile Steel Guide Rails & Bracket Hardware',
        partNumber: 'SE-GR-T89',
        expectedQty: 10,
        receivedQty: 9,
        condition: 'missing',
        photos: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=300'],
        verified: true,
        isMandatory: true,
        notes: '1 pair guide rail missing from bundle package. Discrepancy report filed.'
      },
      {
        id: 'itm_5',
        itemName: 'Infrared 154-Beam Full-Height Light Curtain',
        partNumber: 'SE-LC-154',
        expectedQty: 1,
        receivedQty: 1,
        condition: 'good',
        photos: [],
        verified: false,
        isMandatory: false,
        notes: 'Unopened box.'
      }
    ]
  }
];

const initialDiscrepancyReports: DiscrepancyReport[] = [
  {
    id: 'disc_870_1',
    poId: 'PO-2026-0870',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    customerName: 'Pratibha Enclave Phase 2 (Viman Nagar)',
    itemNames: ['High-Tensile Steel Guide Rails & Bracket Hardware (1 Pair Missing)'],
    issueSummary: 'Guide Rail bundle carton contained 9 pairs instead of 10 pairs listed on PO packing slip.',
    photos: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=300'],
    status: 'open_investigating',
    reportedAt: '2026-08-12T09:30:00Z',
    resolutionNote: 'Supplier Sun Elevators dispatched balance 1 pair via express courier. ETA 24 hrs.'
  }
];

const initialMaterialConfirmations: MaterialReceivedConfirmation[] = [
  {
    id: 'conf_870_1',
    poId: 'PO-2026-0870',
    checklistId: 'chk_103_870',
    customerName: 'Pratibha Enclave Phase 2',
    siteAddress: 'A-Wing, Viman Nagar Central, Pune - 411014',
    deliverySummary: 'Traction Motor, VVVF Control Panel, SS Cabin Shell and 9/10 Guide Rail pairs received on-site.',
    totalItemsChecked: 5,
    totalQtyReceived: 13,
    discrepancySummary: '1 Pair Guide Rail missing - Expedited replacement in transit under DISP-870-1.',
    linkedDiscrepancies: ['disc_870_1'],
    customerPresentFlag: true,
    confirmingParties: [
      {
        role: 'technician',
        name: 'Rajesh Patel',
        phone: '+91 98765 43212',
        signedAt: '2026-08-12T09:40:00Z',
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 30 Q 30 10 50 30 T 90 30 T 130 30 T 180 20" stroke="%230E4B3D" stroke-width="3" fill="none"/></svg>'
      },
      {
        role: 'customer',
        name: 'Mr. Vivek Ranade (Society Secretary)',
        phone: '+91 98220 12345',
        signedAt: '2026-08-12T09:42:00Z',
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 40 10 80 35 T 140 20 T 190 40" stroke="%23B8873D" stroke-width="3" fill="none"/></svg>'
      }
    ],
    documentRefCode: 'AIEC-MDR-2026-870',
    paymentStageDueTriggered: true,
    paymentStageName: '30% Due on Material Delivery Confirmation',
    amountDueNow: 345000,
    status: 'signed_and_locked',
    timestamp: '2026-08-12T09:42:00Z'
  }
];

const initialDeliveryDelayAlerts: DeliveryDelayAlert[] = [
  {
    id: 'alert_871_1',
    poId: 'PO-2026-0871',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    customerName: 'Regency Heights (Kharadi)',
    customerPhone: '+91 98230 45678',
    committedInstallDate: '2026-08-20',
    originalEta: '2026-08-10',
    currentEta: '2026-08-16',
    etaGapDays: 6,
    severity: 'critical',
    rootCauseTag: 'supplier_production',
    isExternalDisruption: false,
    customerNotifiedFlag: false,
    supplierThreadId: 'thread_delta_0871',
    status: 'active_alert',
    updatedAt: '2026-08-12T09:00:00Z'
  },
  {
    id: 'alert_872_1',
    poId: 'PO-2026-0872',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    customerName: 'Vipul Vista (Hadapsar)',
    customerPhone: '+91 97640 11223',
    committedInstallDate: '2026-09-01',
    originalEta: '2026-08-11',
    currentEta: '2026-08-15',
    etaGapDays: 4,
    severity: 'high',
    rootCauseTag: 'transit_logistics',
    isExternalDisruption: true,
    customerNotifiedFlag: true,
    customerNotificationLog: [
      {
        sentAt: '2026-08-12T08:00:00Z',
        channel: 'whatsapp',
        message: 'Dear Vipul Vista Committee, heavy rainfall on the expressway has caused a minor 4-day transit delay. Revised ETA is Aug 15. Your installation date remains on schedule!'
      }
    ],
    status: 'customer_notified',
    updatedAt: '2026-08-12T08:30:00Z'
  }
];

const initialStockInTransit: StockInTransitItem[] = [
  {
    id: 'sit_101',
    poId: 'PO-2026-0891',
    componentCategory: 'traction_machine',
    componentName: '10HP Gearless PMSM Traction Motor & Drive Assembly',
    inTransitValue: 485000,
    expectedArrivalWindow: 'Aug 15 - Aug 17, 2026',
    destinationDealId: 'deal_kothrud_101',
    destinationCustomerName: 'Shree Sai Developers (Kothrud Residency)',
    destinationSiteAddress: 'Plot 42, Karve Road, Kothrud, Pune - 411038',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    carrierName: 'TCI Freight Express',
    trackingNumber: 'TCI-8849-2026',
    quantity: 1,
    unitOfMeasure: 'Set',
    status: 'in_transit',
    orphanedFlag: false,
    updatedAt: '2026-08-12T08:00:00Z'
  },
  {
    id: 'sit_102',
    poId: 'PO-2026-0892',
    componentCategory: 'cabin_panels',
    componentName: 'SS304 Hairline Elevator Cabin & Car Frame Assembly',
    inTransitValue: 290000,
    expectedArrivalWindow: 'Aug 17 - Aug 19, 2026',
    destinationDealId: 'deal_kothrud_101',
    destinationCustomerName: 'Shree Sai Developers (Kothrud Residency)',
    destinationSiteAddress: 'Plot 42, Karve Road, Kothrud, Pune - 411038',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin & Mechanicals Works',
    carrierName: 'VRL Logistics',
    trackingNumber: 'VRL-9921-44',
    quantity: 1,
    unitOfMeasure: 'Set',
    status: 'in_transit',
    orphanedFlag: false,
    updatedAt: '2026-08-11T16:00:00Z'
  },
  {
    id: 'sit_103',
    poId: 'PO-2026-0871',
    componentCategory: 'control_panels',
    componentName: '32-Bit Microprocessor VVVF Control Panel & Cabinet',
    inTransitValue: 210000,
    expectedArrivalWindow: 'Aug 16 - Aug 18, 2026',
    destinationDealId: 'deal_regency_202',
    destinationCustomerName: 'Regency Heights (Kharadi)',
    destinationSiteAddress: 'Building B, Kharadi IT Park Road, Pune - 411014',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    carrierName: 'Gati KWE Express',
    trackingNumber: 'GATI-7712-88',
    quantity: 2,
    unitOfMeasure: 'Units',
    status: 'delayed',
    orphanedFlag: false,
    macroDelayWarning: 'Macro Pattern Alert: VVVF Microprocessor chips facing 5-7 day regional supply bottleneck across 3 suppliers.',
    updatedAt: '2026-08-12T09:00:00Z'
  },
  {
    id: 'sit_104',
    poId: 'PO-2026-0860',
    componentCategory: 'door_headers',
    componentName: 'Telescopic Auto Door Headers & Landing Door Frames',
    inTransitValue: 180000,
    expectedArrivalWindow: 'Aug 14 - Aug 16, 2026',
    destinationDealId: 'deal_cancelled_99',
    destinationCustomerName: 'Ex-Green Valley Project (Cancelled)',
    destinationSiteAddress: 'Bawdhan, Pune - [Project Cancelled by Builder]',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    carrierName: 'Safexpress',
    trackingNumber: 'SAF-3301-12',
    quantity: 5,
    unitOfMeasure: 'Sets',
    status: 'approaching_site',
    orphanedFlag: true,
    orphanedReason: 'Destination deal deal_cancelled_99 was cancelled post-PO dispatch. Requires Admin rerouting or supplier return decision.',
    updatedAt: '2026-08-12T07:30:00Z'
  }
];

const initialDeliverySopTemplates: DeliverySopTemplate[] = [
  {
    id: 'sop_cabin_panels',
    componentCategory: 'cabin_panels',
    categoryName: 'Cabin Panels & SS Finish Shells',
    sopVersion: 'v2.4',
    effectiveDate: '2026-07-01',
    description: 'Master SOP for unboxing, laser protective film verification, and scratch inspection of Stainless Steel & Glass Elevator Cabins.',
    isActive: true,
    steps: [
      {
        id: 'step_cp_1',
        title: 'Outer Wooden Crate Seal & Tag Audit',
        instruction: 'Inspect wooden crate seals, check box orientation indicators, and verify PO packing slip numbers match shipping bills.',
        isMandatory: true,
        requiresPhoto: true,
        requiresQuantityVerification: true,
        fragilityCheck: false,
        safetyCritical: false
      },
      {
        id: 'step_cp_2',
        title: 'Laser Protective Film & SS Surface Scratch Audit',
        instruction: 'Carefully peel edge of blue laser protective film on cabin side panels. Inspect for deep gouges, bends, or transit scratches.',
        isMandatory: true,
        requiresPhoto: true,
        requiresQuantityVerification: false,
        fragilityCheck: true,
        safetyCritical: false,
        categorySpecificNote: 'Glass & SS hairline finish panels require 100% surface photo evidence if protective film is torn.'
      },
      {
        id: 'step_cp_3',
        title: 'Car Frame Bolt Hole Alignment & Hardware Check',
        instruction: 'Verify car frame upright channels, transom beams, and rubber isolation pads against approved GAD drawing.',
        isMandatory: true,
        requiresPhoto: false,
        requiresQuantityVerification: true,
        fragilityCheck: false,
        safetyCritical: true
      }
    ],
    versionHistory: [
      {
        version: 'v2.4',
        effectiveDate: '2026-07-01',
        changedBy: 'Mr. Prashant Vasant Wable (Admin)',
        notes: 'Added mandatory surface photo requirement for torn laser film after Kothrud scratch dispute.',
        stepsCount: 3
      },
      {
        version: 'v2.0',
        effectiveDate: '2026-01-15',
        changedBy: 'Mr. Prashant Vasant Wable (Admin)',
        notes: 'Initial standardized unboxing protocol for SS304 mirror finish cabins.',
        stepsCount: 2
      }
    ],
    updatedAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'sop_traction_machine',
    componentCategory: 'traction_machine',
    categoryName: 'Gearless & Geared Traction Motors',
    sopVersion: 'v3.1',
    effectiveDate: '2026-08-01',
    description: 'High-safety verification protocol for heavy PMSM motor, brake coils, encoder seals, and machine bed plate.',
    isActive: true,
    steps: [
      {
        id: 'step_tm_1',
        title: 'Rigging Eye Bolt & Cast Casing Inspection',
        instruction: 'Verify lifting eye bolt torque, check motor cast iron housing for hairline cracks or transit drops.',
        isMandatory: true,
        requiresPhoto: true,
        requiresQuantityVerification: true,
        fragilityCheck: true,
        safetyCritical: true
      },
      {
        id: 'step_tm_2',
        title: 'Dual Electromagnetic Brake Lever & Sheave Audit',
        instruction: 'Manually verify brake lever release, inspect drive sheave grooves for rust or machining burrs, check oil level glass.',
        isMandatory: true,
        requiresPhoto: true,
        requiresQuantityVerification: false,
        fragilityCheck: false,
        safetyCritical: true
      },
      {
        id: 'step_tm_3',
        title: 'Rotary Encoder & Terminal Box Seal Audit',
        instruction: 'Verify Heidenhain/Tamagawa encoder tamper-evident seal is unbroken. Check motor terminal box wiring lugs.',
        isMandatory: true,
        requiresPhoto: true,
        requiresQuantityVerification: false,
        fragilityCheck: true,
        safetyCritical: true
      }
    ],
    versionHistory: [
      {
        version: 'v3.1',
        effectiveDate: '2026-08-01',
        changedBy: 'Mr. Prashant Vasant Wable (Admin)',
        notes: 'Mandated encoder seal photo check to prevent warranty voiding.',
        stepsCount: 3
      }
    ],
    updatedAt: '2026-08-01T09:00:00Z'
  }
];

const initialDamagedMissingPartsReports: DamagedMissingPartsReport[] = [
  {
    id: 'rep_870_101',
    poId: 'PO-2026-0870',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Manufacturing Pvt Ltd',
    customerName: 'Pratibha Enclave Phase 2 (Viman Nagar)',
    customerPhone: '+91 98220 12345',
    destinationDealId: 'deal_viman_870',
    siteAddress: 'A-Wing, Viman Nagar Central, Pune - 411014',
    affectedItems: [
      {
        id: 'aff_1',
        itemName: 'High-Tensile Steel Guide Rails T89/B',
        partNumber: 'SE-GR-T89',
        expectedQty: 10,
        actualQty: 9,
        discrepancyType: 'missing',
        conditionDescription: 'One pair T89 guide rail missing from strapped bundle on arrival.',
        photos: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=300']
      }
    ],
    urgencyFlag: true,
    techNotes: '1 pair guide rail short-shipped. Technician Rajesh Patel noted outer strapping band was intact upon truck opening.',
    faultAttribution: 'supplier_factory_fault',
    resolutionStatus: 'replacement_shipped',
    scheduleImpactDays: 2,
    adminReviewStatus: 'routed_to_supplier_thread',
    linkedSupplierThreadId: 'thread_sun_870',
    reportedByTechName: 'Rajesh Patel',
    reportedByTechPhone: '+91 98765 43212',
    createdAt: '2026-08-12T09:30:00Z',
    updatedAt: '2026-08-12T09:45:00Z'
  }
];

const initialDeliveryPartners: DeliveryPartner[] = [
  {
    id: 'partner_vrl',
    name: 'VRL Logistics Ltd',
    code: 'VRL-LOG',
    contactPhone: '+91 98230 99887',
    contactEmail: 'express.pune@vrllogistics.com',
    serviceAreas: ['MH_Pune', 'MH_Mumbai', 'GJ_Ahmedabad', 'KA_Bangalore'],
    liveTrackingSupportedFlag: true,
    apiIntegrationStatus: 'active_live',
    onTimeRatePct: 94.8,
    damagedTripRatePct: 0.8,
    avgDelayDays: 0.3,
    completedTripsCount: 142,
    rating: 4.8,
    isUnprovenPartner: false,
    rateCard: [
      { id: 'rc_1', lane: 'Pune Metro -> Local Site', vehicleType: '14ft Open Flatbed Truck', baseRateINR: 4500, estTransitHours: 4 },
      { id: 'rc_2', lane: 'Mumbai -> Pune Corridor', vehicleType: '20ft Container Truck', baseRateINR: 12500, estTransitHours: 8 },
      { id: 'rc_3', lane: 'Ahmedabad -> Pune Hub', vehicleType: '32ft MX Multi-Axle Container', baseRateINR: 28000, estTransitHours: 24 }
    ],
    isActive: true,
    notes: 'Primary preferred courier for heavy traction machines and long guide rails. Fully automated GPS webhooks enabled.',
    updatedAt: '2026-08-10T12:00:00Z'
  },
  {
    id: 'partner_safexpress',
    name: 'Safexpress Express Logistics',
    code: 'SAF-EXP',
    contactPhone: '+91 98901 22334',
    contactEmail: 'pune.hub@safexpress.com',
    serviceAreas: ['MH_Pune', 'MH_Mumbai', 'MH_Nashik', 'GJ_Surat'],
    liveTrackingSupportedFlag: true,
    apiIntegrationStatus: 'active_live',
    onTimeRatePct: 92.1,
    damagedTripRatePct: 1.2,
    avgDelayDays: 0.6,
    completedTripsCount: 98,
    rating: 4.6,
    isUnprovenPartner: false,
    rateCard: [
      { id: 'rc_4', lane: 'Pune -> Nashik Route', vehicleType: '17ft Container Truck', baseRateINR: 9800, estTransitHours: 10 },
      { id: 'rc_5', lane: 'Surat -> Pune Expressway', vehicleType: '24ft Air-Suspension Truck', baseRateINR: 19500, estTransitHours: 16 }
    ],
    isActive: true,
    notes: 'Specialized air-suspension trucks for delicate microprocessor control panels and glass car walls.',
    updatedAt: '2026-08-11T10:00:00Z'
  },
  {
    id: 'partner_tci',
    name: 'TCI Freight Express',
    code: 'TCI-FRT',
    contactPhone: '+91 97654 11223',
    contactEmail: 'dispatch@tcifreight.in',
    serviceAreas: ['MH_Pune', 'KA_Bangalore', 'TS_Hyderabad'],
    liveTrackingSupportedFlag: true,
    apiIntegrationStatus: 'degraded_milestone_fallback',
    onTimeRatePct: 88.5,
    damagedTripRatePct: 2.1,
    avgDelayDays: 1.2,
    completedTripsCount: 64,
    rating: 4.1,
    isUnprovenPartner: false,
    rateCard: [
      { id: 'rc_6', lane: 'Bangalore -> Pune Highway', vehicleType: '32ft Heavy Hauler', baseRateINR: 32000, estTransitHours: 36 }
    ],
    isActive: true,
    notes: 'Carrier GPS API currently undergoing maintenance. System automatically falling back to milestone check-ins.',
    updatedAt: '2026-08-12T08:30:00Z'
  },
  {
    id: 'partner_swift_pune',
    name: 'Swift Local Transporters (Pune Region)',
    code: 'SWIFT-PNE',
    contactPhone: '+91 98221 44556',
    contactEmail: 'swiftpune@gmail.com',
    serviceAreas: ['MH_Pune', 'MH_Satara', 'MH_Kolhapur'],
    liveTrackingSupportedFlag: false,
    apiIntegrationStatus: 'manual_only',
    onTimeRatePct: 100.0,
    damagedTripRatePct: 0.0,
    avgDelayDays: 0.0,
    completedTripsCount: 2,
    rating: 3.5,
    isUnprovenPartner: true,
    rateCard: [
      { id: 'rc_7', lane: 'Pune Yard -> Kothrud / Baner', vehicleType: 'Bolero Pick-up Truck', baseRateINR: 2200, estTransitHours: 2 }
    ],
    isActive: true,
    notes: 'New local last-mile partner onboarded with neutral 3.5 rating. Manual SMS/Call milestone verification active.',
    updatedAt: '2026-08-12T09:00:00Z'
  }
];

const initialDeliveryAnalyticsSummary: DeliveryAnalyticsSummary = {
  overallOnTimeRatePct: 91.4,
  onTimeTrendPct: 2.8,
  avgTransitDaysOverall: 2.4,
  avgTransitTrendDays: -0.3,
  discrepancyRatePct: 1.4,
  discrepancyTrendPct: -0.6,
  totalLogisticsIssueCostINR: 42500,
  periodLabel: 'Last 90 Days (May 2026 - Aug 2026)',
  updatedAt: '2026-08-12T10:00:00Z',
  regionalBenchmarks: [
    {
      regionCode: 'MH_Pune',
      regionName: 'Pune Metro & PCMC Hub',
      avgDays: 1.1,
      sampleSize: 48,
      isEmergingData: false,
      recommendationQuoteWindow: '1 - 2 Days'
    },
    {
      regionCode: 'MH_Mumbai',
      regionName: 'Mumbai MMR & Thane Belt',
      avgDays: 1.8,
      sampleSize: 35,
      isEmergingData: false,
      recommendationQuoteWindow: '2 Days'
    },
    {
      regionCode: 'MH_Rest',
      regionName: 'Rest of Maharashtra (Nashik, Kolhapur)',
      avgDays: 2.9,
      sampleSize: 22,
      isEmergingData: false,
      recommendationQuoteWindow: '3 Days'
    },
    {
      regionCode: 'GJ_Gujarat',
      regionName: 'Gujarat Industrial Belt (Surat, Vadodara)',
      avgDays: 3.5,
      sampleSize: 18,
      isEmergingData: false,
      recommendationQuoteWindow: '3 - 4 Days'
    },
    {
      regionCode: 'KA_South',
      regionName: 'Southern Corridor (Bangalore Tech Hub)',
      avgDays: 4.8,
      sampleSize: 5,
      isEmergingData: true,
      recommendationQuoteWindow: '4 - 5 Days (Emerging Lane)'
    }
  ],
  entityBreakdowns: [
    {
      id: 'sun_elevators',
      name: 'Sun Elevators Mfg',
      type: 'supplier',
      onTimePct: 92.1,
      delayDaysAvg: 0.8,
      totalShipments: 38,
      damageIncidentRatePct: 1.1
    },
    {
      id: 'delta_controls',
      name: 'Delta Control Systems',
      type: 'supplier',
      onTimePct: 86.4,
      delayDaysAvg: 1.4,
      totalShipments: 24,
      damageIncidentRatePct: 0.8
    },
    {
      id: 'apex_cabins',
      name: 'Apex Cabin Works',
      type: 'supplier',
      onTimePct: 95.2,
      delayDaysAvg: 0.4,
      totalShipments: 19,
      damageIncidentRatePct: 0.5
    },
    {
      id: 'partner_vrl',
      name: 'VRL Logistics Ltd',
      type: 'logistics_partner',
      onTimePct: 94.8,
      delayDaysAvg: 0.3,
      totalShipments: 42,
      damageIncidentRatePct: 0.8
    },
    {
      id: 'partner_safexpress',
      name: 'Safexpress Express',
      type: 'logistics_partner',
      onTimePct: 92.1,
      delayDaysAvg: 0.6,
      totalShipments: 28,
      damageIncidentRatePct: 1.2
    },
    {
      id: 'partner_tci',
      name: 'TCI Freight Express',
      type: 'logistics_partner',
      onTimePct: 88.5,
      delayDaysAvg: 1.2,
      totalShipments: 18,
      damageIncidentRatePct: 2.1
    }
  ],
  macroDisruptions: [
    {
      id: 'macro_1',
      period: 'Jul 2026',
      region: 'Konkan Coast & Western Ghats Pass',
      eventName: 'Heavy Monsoon Flooding & NH-48 Expressway Landslide',
      impactDays: 2.5,
      description: 'Regional highways closed for heavy multi-axle freight. Transit transit times excluded from supplier SLA penalty calculations.'
    }
  ],
  costImpacts: [
    {
      category: 'Transit Damage Part Replacements',
      costINR: 24000,
      incidentCount: 2,
      description: 'Direct material replacement cost for scratched SS panels and chipped guide rails.'
    },
    {
      category: 'Rush Expedited Courier Charges',
      costINR: 12500,
      incidentCount: 3,
      description: 'Emergency air-cargo & hot-shot delivery fees for critical missing components.'
    },
    {
      category: 'Site Tech Idle Compensation',
      costINR: 6000,
      incidentCount: 1,
      description: 'Compensated technician team waiting time due to unannounced courier delay.'
    }
  ]
};

const initialSupplierPayments: SupplierPaymentRecord[] = [
  {
    id: 'pay_101',
    poId: 'po_sun_1',
    poNumber: 'PO-2026-8801',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    supplierBankName: 'HDFC Bank Ltd',
    supplierAccountNo: '50200039481102',
    supplierIfsc: 'HDFC0000240',
    totalPoAmountINR: 850000,
    triggerMilestone: 'Delivery Confirmed (40% Milestone Split Due)',
    triggerMilestoneKey: 'delivery_confirmed',
    dueAmountINR: 340000,
    approvalStatus: 'ready_for_approval',
    hasOpenDiscrepancyFlag: false,
    riskTier: 'low_risk_routine',
    createdAt: '2026-08-11T14:30:00Z',
    updatedAt: '2026-08-11T14:30:00Z',
    currentMilestoneIndex: 1,
    milestoneChain: [
      {
        id: 'ms_101_1',
        milestoneKey: 'advance_due',
        milestoneTitle: 'PO Issued & Order Confirmed (50% Advance)',
        percentage: 50,
        amountINR: 425000,
        status: 'released',
        triggeredAt: '2026-08-01T10:00:00Z',
        triggeredByEvent: 'PO Counter-Signed by Sun Elevators',
        triggerEvidenceRef: 'PO Contract #PO-2026-8801-SIGNED.pdf',
        evidenceType: 'admin_override'
      },
      {
        id: 'ms_101_2',
        milestoneKey: 'delivery_confirmed',
        milestoneTitle: 'Site Delivery Sign-off (40% Split)',
        percentage: 40,
        amountINR: 340000,
        status: 'triggered',
        triggeredAt: '2026-08-11T14:30:00Z',
        triggeredByEvent: 'Site Unboxing Verification Sign-off #DEL-8821',
        triggerEvidenceRef: 'Technician Ramesh Sign-off & 6 QC Photos Verified',
        evidenceType: 'delivery_signoff'
      },
      {
        id: 'ms_101_3',
        milestoneKey: 'retention_elapsed',
        milestoneTitle: 'Installation QC & Handover (10% Retention Holdback)',
        percentage: 10,
        amountINR: 85000,
        status: 'pending',
        triggeredByEvent: '14-Day Auto Timer After Site Handover'
      }
    ],
    overrideLog: []
  },
  {
    id: 'pay_102',
    poId: 'po_delta_1',
    poNumber: 'PO-2026-8802',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    supplierBankName: 'ICICI Bank Ltd',
    supplierAccountNo: '001105029381',
    supplierIfsc: 'ICIC0000011',
    totalPoAmountINR: 420000,
    triggerMilestone: 'Delivery Confirmed (40% Milestone Split Due)',
    triggerMilestoneKey: 'delivery_confirmed',
    dueAmountINR: 168000,
    approvalStatus: 'held',
    holdReason: 'Open Damaged Part Report #DMR-2026-001 (Microprocessor Board Scratched in transit). Payment hold active until replacement arrives.',
    hasOpenDiscrepancyFlag: true,
    linkedDiscrepancyReportId: 'dmr_101',
    linkedDiscrepancySummary: 'Damaged Microprocessor Main Board - Supplier dispatched replacement unit',
    riskTier: 'high_risk_discrepancy',
    createdAt: '2026-08-12T08:00:00Z',
    updatedAt: '2026-08-12T08:00:00Z',
    currentMilestoneIndex: 1,
    milestoneChain: [
      {
        id: 'ms_102_1',
        milestoneKey: 'advance_due',
        milestoneTitle: 'Order Confirmation Deposit (50%)',
        percentage: 50,
        amountINR: 210000,
        status: 'released',
        triggeredAt: '2026-08-02T11:00:00Z',
        triggeredByEvent: 'System Advance Payment Trigger',
        triggerEvidenceRef: 'Bank Ref #UTR-883920192',
        evidenceType: 'timer'
      },
      {
        id: 'ms_102_2',
        milestoneKey: 'delivery_confirmed',
        milestoneTitle: 'Site Material Arrival (40% Split)',
        percentage: 40,
        amountINR: 168000,
        status: 'held',
        triggeredAt: '2026-08-12T08:00:00Z',
        triggeredByEvent: 'Site Unboxing Checklist #DEL-8822 (Discrepancy Flagged)',
        triggerEvidenceRef: 'Report #DMR-2026-001 Attached',
        evidenceType: 'delivery_signoff'
      },
      {
        id: 'ms_102_3',
        milestoneKey: 'retention_elapsed',
        milestoneTitle: 'QC Retention Release (10%)',
        percentage: 10,
        amountINR: 42000,
        status: 'pending'
      }
    ],
    overrideLog: [
      {
        id: 'ov_102_1',
        timestamp: '2026-08-12T08:05:00Z',
        adminName: 'Mr. Prashant Vasant Wable',
        actionType: 'milestone_hold',
        previousValue: 'ready_for_approval',
        newValue: 'held',
        reason: 'Hold placed due to open Damaged Part Report #DMR-2026-001.'
      }
    ]
  },
  {
    id: 'pay_103',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    supplierBankName: 'Axis Bank Ltd',
    supplierAccountNo: '918020038471201',
    supplierIfsc: 'UTIB0000120',
    totalPoAmountINR: 600000,
    triggerMilestone: '14-Day Post-Handover Retention Timer Elapsed (10% Final Due)',
    triggerMilestoneKey: 'retention_elapsed',
    dueAmountINR: 60000,
    approvalStatus: 'ready_for_approval',
    hasOpenDiscrepancyFlag: false,
    riskTier: 'low_risk_routine',
    createdAt: '2026-08-12T09:15:00Z',
    updatedAt: '2026-08-12T09:15:00Z',
    currentMilestoneIndex: 2,
    milestoneChain: [
      {
        id: 'ms_103_1',
        milestoneKey: 'advance_due',
        milestoneTitle: 'PO Order Deposit (50%)',
        percentage: 50,
        amountINR: 300000,
        status: 'released',
        triggeredAt: '2026-07-20T10:00:00Z',
        triggeredByEvent: 'Advance Payment Released',
        evidenceType: 'admin_override'
      },
      {
        id: 'ms_103_2',
        milestoneKey: 'delivery_confirmed',
        milestoneTitle: 'Cabin Shell Delivery (40%)',
        percentage: 40,
        amountINR: 240000,
        status: 'released',
        triggeredAt: '2026-07-28T14:00:00Z',
        triggeredByEvent: 'Unboxing Sign-off Completed',
        evidenceType: 'delivery_signoff'
      },
      {
        id: 'ms_103_3',
        milestoneKey: 'retention_elapsed',
        milestoneTitle: '14-Day Retention Auto-Release (10%)',
        percentage: 10,
        amountINR: 60000,
        status: 'triggered',
        triggeredAt: '2026-08-12T09:15:00Z',
        triggeredByEvent: 'System 14-Day Timer Auto-Fired After Handover Sign-off',
        triggerEvidenceRef: 'Customer Handover Certificate #HND-2026-8803',
        evidenceType: 'timer'
      }
    ],
    overrideLog: []
  },
  {
    id: 'pay_104',
    poId: 'po_bharat_1',
    poNumber: 'PO-2026-8804',
    supplierId: 'bharat_motors',
    supplierName: 'Bharat Traction Motors',
    supplierBankName: 'State Bank of India',
    supplierAccountNo: '30491827401',
    supplierIfsc: 'SBIN0001290',
    totalPoAmountINR: 550000,
    triggerMilestone: 'Advance Order Deposit (50% Order Milestone Due)',
    triggerMilestoneKey: 'advance_due',
    dueAmountINR: 275000,
    approvalStatus: 'ready_for_approval',
    hasOpenDiscrepancyFlag: false,
    riskTier: 'low_risk_routine',
    createdAt: '2026-08-12T09:45:00Z',
    updatedAt: '2026-08-12T09:45:00Z',
    currentMilestoneIndex: 0,
    milestoneChain: [
      {
        id: 'ms_104_1',
        milestoneKey: 'advance_due',
        milestoneTitle: 'Advance Order Deposit (50%)',
        percentage: 50,
        amountINR: 275000,
        status: 'triggered',
        triggeredAt: '2026-08-12T09:45:00Z',
        triggeredByEvent: 'PO Issued & Supplier Acceptance Confirmed',
        triggerEvidenceRef: 'Supplier Digital Sign-off Token #SIG-9912',
        evidenceType: 'admin_override'
      },
      {
        id: 'ms_104_2',
        milestoneKey: 'delivery_confirmed',
        milestoneTitle: 'Traction Machine Delivery (40%)',
        percentage: 40,
        amountINR: 220000,
        status: 'pending'
      },
      {
        id: 'ms_104_3',
        milestoneKey: 'retention_elapsed',
        milestoneTitle: '14-Day Retention Holdback (10%)',
        percentage: 10,
        amountINR: 55000,
        status: 'pending'
      }
    ],
    overrideLog: []
  }
];

const initialSupplierInvoices: SupplierInvoiceDoc[] = [
  {
    id: 'inv_101',
    invoiceNumber: 'INV-SUN-2026-901',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    poId: 'po_sun_1',
    poNumber: 'PO-2026-8801',
    invoiceDate: '2026-08-11',
    totalInvoicedAmountINR: 850000,
    taxAmountINR: 129661,
    fileUrl: 'TAX_INVOICE_SUN_8801.pdf',
    status: 'matched',
    submissionMethod: 'supplier_direct',
    lineItems: [
      {
        id: 'li_101_1',
        itemCode: 'ELEV-PASS-8P-630KG',
        description: 'Gearless Traction Passenger Elevator 8-Passenger 630kg (G+4)',
        invoicedQty: 1,
        invoicedUnitPriceINR: 720339,
        invoicedTotalINR: 720339,
        poQty: 1,
        poUnitPriceINR: 720339,
        receivedQty: 1
      }
    ],
    matchResult: {
      poId: 'po_sun_1',
      poTotalINR: 850000,
      receiptId: 'DEL-8821',
      receiptDate: '2026-08-11',
      receiptConfirmedQty: 1,
      matchedQtyCheck: 'pass',
      matchedPriceCheck: 'pass',
      matchStatus: 'perfect_match',
      qtyDifference: 0,
      priceDifferenceINR: 0,
      discrepancyNote: 'Three-way match verified 100% against PO-2026-8801 and Material Received Receipt #DEL-8821.'
    },
    createdAt: '2026-08-11T14:00:00Z',
    updatedAt: '2026-08-11T14:15:00Z'
  },
  {
    id: 'inv_102',
    invoiceNumber: 'INV-DELTA-2026-044',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    poId: 'po_delta_1',
    poNumber: 'PO-2026-8802',
    invoiceDate: '2026-08-11',
    totalInvoicedAmountINR: 440000,
    taxAmountINR: 67118,
    fileUrl: 'INV_DELTA_CONTROLS_8802.pdf',
    status: 'mismatch_flagged',
    submissionMethod: 'supplier_direct',
    lineItems: [
      {
        id: 'li_102_1',
        itemCode: 'CTRL-BOARD-VFD-15KW',
        description: 'VFD Integrated Control Panel 15kW with Microprocessor Board',
        invoicedQty: 1,
        invoicedUnitPriceINR: 372882,
        invoicedTotalINR: 372882,
        poQty: 1,
        poUnitPriceINR: 355932,
        receivedQty: 1
      }
    ],
    matchResult: {
      poId: 'po_delta_1',
      poTotalINR: 420000,
      receiptId: 'DEL-8822',
      receiptDate: '2026-08-12',
      receiptConfirmedQty: 1,
      matchedQtyCheck: 'pass',
      matchedPriceCheck: 'fail_price_mismatch',
      matchStatus: 'mismatch_price',
      qtyDifference: 0,
      priceDifferenceINR: 20000,
      discrepancyNote: 'Invoiced total (₹4,40,000) exceeds PO agreement (₹4,20,000) by ₹20,000 due to unapproved freight surcharges. Also Damaged Microprocessor Board flagged.'
    },
    createdAt: '2026-08-11T16:00:00Z',
    updatedAt: '2026-08-12T08:00:00Z'
  },
  {
    id: 'inv_103',
    invoiceNumber: 'INV-APEX-2026-112',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    invoiceDate: '2026-07-28',
    totalInvoicedAmountINR: 600000,
    taxAmountINR: 91525,
    fileUrl: 'INV_APEX_CABINS_600K.pdf',
    status: 'matched',
    submissionMethod: 'admin_upload',
    lineItems: [
      {
        id: 'li_103_1',
        itemCode: 'CAB-SS304-MIRROR',
        description: 'Stainless Steel 304 Mirror Finish Elevator Cabin Shell with LED Ceiling',
        invoicedQty: 1,
        invoicedUnitPriceINR: 508475,
        invoicedTotalINR: 508475,
        poQty: 1,
        poUnitPriceINR: 508475,
        receivedQty: 1
      }
    ],
    matchResult: {
      poId: 'po_apex_1',
      poTotalINR: 600000,
      receiptId: 'DEL-8819',
      receiptDate: '2026-07-28',
      receiptConfirmedQty: 1,
      matchedQtyCheck: 'pass',
      matchedPriceCheck: 'pass',
      matchStatus: 'perfect_match',
      qtyDifference: 0,
      priceDifferenceINR: 0,
      discrepancyNote: 'Verified 100% against PO-2026-8803.'
    },
    createdAt: '2026-07-28T15:00:00Z',
    updatedAt: '2026-07-28T15:30:00Z'
  },
  {
    id: 'inv_104',
    invoiceNumber: 'MISSING_INVOICE_PENDING',
    supplierId: 'bharat_motors',
    supplierName: 'Bharat Traction Motors',
    poId: 'po_bharat_1',
    poNumber: 'PO-2026-8804',
    invoiceDate: '',
    totalInvoicedAmountINR: 0,
    taxAmountINR: 0,
    status: 'missing_doc',
    submissionMethod: 'email_ingest',
    lineItems: [],
    matchResult: {
      poId: 'po_bharat_1',
      poTotalINR: 550000,
      receiptConfirmedQty: 0,
      matchedQtyCheck: 'missing_receipt',
      matchedPriceCheck: 'pass',
      matchStatus: 'missing_invoice',
      qtyDifference: 0,
      priceDifferenceINR: 0,
      discrepancyNote: 'Supplier Bharat Traction Motors has not yet submitted a tax invoice for PO-2026-8804. Payment blocked on missing documentation.'
    },
    createdAt: '2026-08-12T09:45:00Z',
    updatedAt: '2026-08-12T09:45:00Z'
  }
];

const initialScheduledPayments: ScheduledPaymentEntry[] = [
  {
    id: 'sch_101',
    paymentId: 'pay_101',
    poId: 'po_sun_1',
    poNumber: 'PO-2026-8801',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    paymentType: 'milestone',
    milestoneTitle: 'Site Delivery Sign-off (40% Milestone)',
    amountINR: 340000,
    expectedDate: '2026-08-12',
    status: 'scheduled',
    riskConcentrationFlag: true,
    linkedJobTitle: 'Greenfield Heights Villa Lift Installation (G+4)'
  },
  {
    id: 'sch_102',
    paymentId: 'pay_104',
    poId: 'po_bharat_1',
    poNumber: 'PO-2026-8804',
    supplierId: 'bharat_motors',
    supplierName: 'Bharat Traction Motors',
    paymentType: 'advance',
    milestoneTitle: 'Advance Order Confirmation (50% Deposit)',
    amountINR: 275000,
    expectedDate: '2026-08-13',
    status: 'scheduled',
    riskConcentrationFlag: true,
    linkedJobTitle: 'Shivaji Nagar Commercial Tower Lift'
  },
  {
    id: 'sch_103',
    paymentId: 'pay_103',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    paymentType: 'retention',
    milestoneTitle: '14-Day Post Handover Retention Release (10%)',
    amountINR: 60000,
    expectedDate: '2026-08-14',
    status: 'scheduled',
    riskConcentrationFlag: false,
    linkedJobTitle: 'Bawdhan Luxury Bungalow Elevator'
  },
  {
    id: 'sch_104',
    paymentId: 'pay_102',
    poId: 'po_delta_1',
    poNumber: 'PO-2026-8802',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    paymentType: 'milestone',
    milestoneTitle: 'Site Materials Arrival (40% Milestone)',
    amountINR: 168000,
    expectedDate: '2026-08-20',
    status: 'pushed_delay',
    delayReason: 'Delivery milestone pushed back 8 days due to damaged PCB replacement transit delay',
    riskConcentrationFlag: false,
    linkedJobTitle: 'Kothrud Apartment Elevator Automation'
  },
  {
    id: 'sch_105',
    paymentId: 'pay_101_ret',
    poId: 'po_sun_1',
    poNumber: 'PO-2026-8801',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    paymentType: 'retention',
    milestoneTitle: '14-Day Post Handover Retention Release (10%)',
    amountINR: 85000,
    expectedDate: '2026-08-28',
    status: 'scheduled',
    riskConcentrationFlag: false,
    linkedJobTitle: 'Greenfield Heights Villa Lift Installation (G+4)'
  }
];

const initialPaymentHistory: PaymentHistoryRecord[] = [
  {
    id: 'hist_101',
    paymentId: 'pay_101',
    poId: 'po_sun_1',
    poNumber: 'PO-2026-8801',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    paymentType: 'advance',
    milestoneTitle: 'PO Issued & Order Confirmed Deposit (50%)',
    amountINR: 425000,
    paymentDate: '2026-08-01T10:30:00Z',
    utrNumber: 'HDFCR5202608010928301',
    paymentMethod: 'RTGS',
    linkedInvoiceNo: 'INV-SUN-2026-901',
    status: 'completed',
    reconciliationStatus: 'reconciled',
    receiptFileUrl: 'RTGS_RECEIPT_425000_SUN.pdf'
  },
  {
    id: 'hist_102',
    paymentId: 'pay_102',
    poId: 'po_delta_1',
    poNumber: 'PO-2026-8802',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    paymentType: 'advance',
    milestoneTitle: 'Order Confirmation Deposit (50%)',
    amountINR: 210000,
    paymentDate: '2026-08-02T11:15:00Z',
    utrNumber: 'ICICR5202608020839201',
    paymentMethod: 'NEFT',
    linkedInvoiceNo: 'INV-DELTA-2026-044',
    status: 'completed',
    reconciliationStatus: 'reconciled',
    receiptFileUrl: 'NEFT_RECEIPT_210000_DELTA.pdf'
  },
  {
    id: 'hist_103',
    paymentId: 'pay_103',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    paymentType: 'advance',
    milestoneTitle: 'Order Confirmation Deposit (50%)',
    amountINR: 300000,
    paymentDate: '2026-07-20T09:45:00Z',
    utrNumber: 'UTIBR5202607200492812',
    paymentMethod: 'RTGS',
    linkedInvoiceNo: 'INV-APEX-2026-112',
    status: 'completed',
    reconciliationStatus: 'reconciled',
    receiptFileUrl: 'RTGS_RECEIPT_300000_APEX.pdf'
  },
  {
    id: 'hist_104',
    paymentId: 'pay_103',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    paymentType: 'milestone',
    milestoneTitle: 'Cabin Shell Site Unboxing Delivery (40%)',
    amountINR: 240000,
    paymentDate: '2026-07-28T16:00:00Z',
    utrNumber: 'UTIBR5202607280928103',
    paymentMethod: 'NEFT',
    linkedInvoiceNo: 'INV-APEX-2026-112',
    status: 'completed',
    reconciliationStatus: 'reconciled',
    receiptFileUrl: 'NEFT_RECEIPT_240000_APEX.pdf'
  }
];

const initialTaxGstComplianceRecord: TaxGstComplianceRecord = {
  period: 'Q2 FY 2026-27 (Jul-Sep 2026)',
  totalProcurementInvoices: 14,
  inputGstCreditAvailableINR: 368304,
  cgstInputINR: 144152,
  sgstInputINR: 144152,
  igstInputINR: 80000,
  outputGstChargedINR: 486000,
  cgstOutputINR: 243000,
  sgstOutputINR: 243000,
  igstOutputINR: 0,
  netGstLiabilityINR: 117696,
  atRiskInputCreditINR: 67118,
  supplierGstinStatuses: [
    {
      supplierId: 'sun_elevators',
      supplierName: 'Sun Elevators Mfg Co',
      gstin: '27AAACS1092F1Z8',
      registeredState: 'Maharashtra (27)',
      filingStatus: 'active_verified',
      lastFilingPeriod: 'GSTR-3B Jul 2026 Filed',
      eligibleInputCreditINR: 129661,
      jeopardizedCreditINR: 0,
      complianceAlertFlag: false
    },
    {
      supplierId: 'delta_controls',
      supplierName: 'Delta Control Systems',
      gstin: '27AAACD4029K1ZA',
      registeredState: 'Maharashtra (27)',
      filingStatus: 'lapsed_compliance_risk',
      lastFilingPeriod: 'GSTR-3B Jun 2026 (July Pending)',
      eligibleInputCreditINR: 0,
      jeopardizedCreditINR: 67118,
      complianceAlertFlag: true,
      alertNote: 'GSTR-3B return for July 2026 not detected on GSTN portal. Input Credit ₹67,118 at risk of disallowance if unfiled by 20th.'
    },
    {
      supplierId: 'apex_cabins',
      supplierName: 'Apex Cabin Works',
      gstin: '27AAACA9012M1Z3',
      registeredState: 'Maharashtra (27)',
      filingStatus: 'active_verified',
      lastFilingPeriod: 'GSTR-3B Jul 2026 Filed',
      eligibleInputCreditINR: 91525,
      jeopardizedCreditINR: 0,
      complianceAlertFlag: false
    },
    {
      supplierId: 'bharat_motors',
      supplierName: 'Bharat Traction Motors',
      gstin: '24AAACB3019P1ZB',
      registeredState: 'Gujarat (24 - Inter-state IGST)',
      filingStatus: 'active_verified',
      lastFilingPeriod: 'GSTR-1 Jul 2026 Filed',
      eligibleInputCreditINR: 80000,
      jeopardizedCreditINR: 0,
      complianceAlertFlag: false
    }
  ],
  updatedAt: new Date().toISOString()
};

const initialSupplierDisputes: SupplierDisputeRecord[] = [
  {
    id: 'disp_101',
    poId: 'po_delta_1',
    poNumber: 'PO-2026-8802',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    disputeType: 'invoice_mismatch',
    disputeTitle: 'Invoiced Price Variance ₹20,000 & Damaged Microprocessor Board Holdback',
    supplierPosition: 'Claiming ₹20,000 extra on control board due to unapproved raw component cost surge and demanding immediate 40% delivery release without ₹15,000 PCB damage deduction.',
    supplierClaimAmountINR: 35000,
    aiecPosition: 'PO-2026-8802 fixed price agreement applies. Site Inspection Receipt #DEL-8822 confirms damaged PCB unboxed on site requiring replacement per SOP Clause 9.1.',
    aiecEvidenceDocUrl: 'INSPECTION_REPORT_DEL_8822_PCB_DAMAGE.pdf',
    slaStatus: 'urgent_relationship_risk',
    slaDueDate: '2026-08-13',
    relationshipRiskLevel: 'high_threat_order_halt',
    supplierScorecardRating: 4.2,
    status: 'open_under_review',
    auditTrail: [
      {
        id: 'aud_1',
        timestamp: '2026-08-11T16:30:00Z',
        actor: 'Delta Control Systems (Vendor Admin)',
        action: 'Dispute Raised',
        notes: 'Raised formal objection against price flag and PCB damage holdback on PO-2026-8802.'
      },
      {
        id: 'aud_2',
        timestamp: '2026-08-12T08:15:00Z',
        actor: 'System Auto-Risk Evaluator',
        action: 'Relationship Risk Escalated',
        notes: 'Flagged vendor threat of halting future control board dispatches for Kothrud job.'
      }
    ],
    createdAt: '2026-08-11T16:30:00Z',
    updatedAt: '2026-08-12T08:15:00Z'
  },
  {
    id: 'disp_102',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    disputeType: 'retention_delay',
    disputeTitle: 'Disputed 14-Day Retention Release Countdown Start Date',
    supplierPosition: 'Vendor argued 10% retention holdback timer should begin on site unboxing (Jul 28), not post-handover client sign-off.',
    supplierClaimAmountINR: 60000,
    aiecPosition: 'SOP Clause 14.2 explicitly stipulates retention release 14 days post final customer handover to ensure zero scratch defect guarantee.',
    aiecEvidenceDocUrl: 'SOP_CLAUSE_14_2_AGREEMENT.pdf',
    slaStatus: 'within_sla',
    slaDueDate: '2026-08-15',
    relationshipRiskLevel: 'low',
    supplierScorecardRating: 4.9,
    status: 'resolved_aiec_upheld',
    resolutionDecisionNote: 'Clarified SOP Clause 14.2 with Apex management. Supplier accepted post-handover August 14 release date without penalty.',
    resolutionAmountINR: 60000,
    resolvedBy: 'Mr. Prashant Vasant Wable',
    resolvedAt: '2026-08-11T11:00:00Z',
    auditTrail: [
      {
        id: 'aud_101',
        timestamp: '2026-08-10T10:00:00Z',
        actor: 'Apex Cabin Works',
        action: 'Dispute Raised',
        notes: 'Requested early 10% retention release.'
      },
      {
        id: 'aud_102',
        timestamp: '2026-08-11T11:00:00Z',
        actor: 'Mr. Prashant Vasant Wable (Admin)',
        action: 'Resolved - Original Upheld',
        notes: 'Reviewed SOP agreement with vendor MD. Confirmed Aug 14 timer.'
      }
    ],
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-11T11:00:00Z'
  }
];

const initialAdvanceExposures: AdvanceExposureRecord[] = [
  {
    id: 'adv_101',
    poId: 'po_bharat_1',
    poNumber: 'PO-2026-8804',
    supplierId: 'bharat_motors',
    supplierName: 'Bharat Traction Motors',
    advanceAmountINR: 275000,
    disbursementDate: '2026-08-01',
    expectedDeliveryDate: '2026-08-14',
    daysOutstanding: 11,
    agingStatus: 'normal_in_transit',
    linkedJobTitle: 'Shivaji Nagar Commercial Tower Lift'
  },
  {
    id: 'adv_102',
    poId: 'po_sun_spec_1',
    poNumber: 'PO-2026-8790',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    advanceAmountINR: 350000,
    disbursementDate: '2026-07-08',
    expectedDeliveryDate: '2026-07-28',
    daysOutstanding: 35,
    agingStatus: 'critical_overdue_escalation',
    linkedJobTitle: 'Bawdhan Special Custom Hydraulic Elevator'
  }
];

const initialRetentionHolds: RetentionHoldRecord[] = [
  {
    id: 'ret_101',
    poId: 'po_sun_1',
    poNumber: 'PO-2026-8801',
    supplierId: 'sun_elevators',
    supplierName: 'Sun Elevators Mfg Co',
    retentionPercent: 10,
    retentionAmountINR: 85000,
    retentionStage: 'handover_dlp',
    retentionStatus: 'eligible_for_release',
    heldDate: '2026-08-01',
    holdStartDate: '2026-08-01',
    expectedReleaseDate: '2026-08-15',
    readinessStatus: 'ready_for_release',
    dlpExpiryDate: '2027-08-01',
    defectClearanceSignoff: true,
    qcInspectionPass: true,
    linkedQcRecordId: 'QC-HANDOVER-8801',
    hasOpenDispute: false,
    hasOpenDamageReport: false,
    linkedJobTitle: 'Greenfield Heights Villa Lift Installation (G+4)'
  },
  {
    id: 'ret_102',
    poId: 'po_apex_1',
    poNumber: 'PO-2026-8803',
    supplierId: 'apex_cabins',
    supplierName: 'Apex Cabin Works',
    retentionPercent: 10,
    retentionAmountINR: 60000,
    retentionStage: 'installation',
    retentionStatus: 'eligible_for_release',
    heldDate: '2026-07-30',
    holdStartDate: '2026-07-30',
    expectedReleaseDate: '2026-08-13',
    readinessStatus: 'ready_for_release',
    dlpExpiryDate: '2027-07-30',
    defectClearanceSignoff: true,
    qcInspectionPass: true,
    linkedQcRecordId: 'QC-HANDOVER-8803',
    hasOpenDispute: false,
    hasOpenDamageReport: false,
    linkedJobTitle: 'Bawdhan Luxury Bungalow Elevator'
  },
  {
    id: 'ret_103',
    poId: 'po_delta_1',
    poNumber: 'PO-2026-8802',
    supplierId: 'delta_controls',
    supplierName: 'Delta Control Systems',
    retentionPercent: 10,
    retentionAmountINR: 42000,
    retentionStage: 'site_delivery',
    retentionStatus: 'held_in_escrow',
    heldDate: '2026-08-05',
    holdStartDate: '2026-08-05',
    expectedReleaseDate: '2026-08-19',
    readinessStatus: 'blocked_by_rework',
    dlpExpiryDate: '2027-08-05',
    defectClearanceSignoff: false,
    qcInspectionPass: false,
    linkedQcRecordId: 'QC-INSPECT-8802-FAIL',
    hasOpenDispute: true,
    hasOpenDamageReport: true,
    linkedJobTitle: 'Kothrud Apartment Elevator Automation'
  }
];

export const initialSupplierPaymentAnalytics: SupplierPaymentAnalyticsRecord = {
  period: 'FY 2026-27 (Q2 YTD)',
  totalSpendINR: 18450000,
  previousPeriodSpendINR: 16200000,
  spendTrendPercent: 13.88,
  avgDaysToDisbursement: 4.2,
  retentionHeldTotalINR: 1845000,
  retentionReleasedTotalINR: 1260000,
  spendBySupplier: [
    {
      supplierId: 'bharat_traction',
      supplierName: 'Bharat Traction Motors Ltd',
      category: 'Traction Machines & Motors',
      spendINR: 6200000,
      sharePercent: 33.6,
      avgDaysToPay: 3.8,
      disputeRatePercent: 2.1,
      avgDisputeResolveDays: 3.2,
      relationshipRiskFlag: false
    },
    {
      supplierId: 'apex_cabins',
      supplierName: 'Apex Cabin Works',
      category: 'Elevator Cabins & Car Frames',
      spendINR: 4850000,
      sharePercent: 26.3,
      avgDaysToPay: 4.5,
      disputeRatePercent: 3.5,
      avgDisputeResolveDays: 4.0,
      relationshipRiskFlag: false
    },
    {
      supplierId: 'delta_controls',
      supplierName: 'Delta Control Systems',
      category: 'Microprocessor VVVF Controllers',
      spendINR: 3800000,
      sharePercent: 20.6,
      avgDaysToPay: 5.2,
      disputeRatePercent: 12.8,
      avgDisputeResolveDays: 8.5,
      relationshipRiskFlag: true,
      riskReason: 'Unusually high dispute rate (12.8%) & GSTR-3B tax filing delay. Review vendor relationship recommended.'
    },
    {
      supplierId: 'supreme_rails',
      supplierName: 'Supreme Steel Guide Rails',
      category: 'Guide Rails & Counterweights',
      spendINR: 2100000,
      sharePercent: 11.4,
      avgDaysToPay: 3.2,
      disputeRatePercent: 1.2,
      avgDisputeResolveDays: 2.0,
      relationshipRiskFlag: false
    },
    {
      supplierId: 'western_doors',
      supplierName: 'Western Automatic Door Systems',
      category: 'Automatic Doors & Operators',
      spendINR: 1500000,
      sharePercent: 8.1,
      avgDaysToPay: 4.1,
      disputeRatePercent: 1.5,
      avgDisputeResolveDays: 2.5,
      relationshipRiskFlag: false
    }
  ],
  spendByCategory: [
    { category: 'Traction Motors & Gearless Drives', spendINR: 6200000, count: 12 },
    { category: 'Elevator Cabins & Car Frames', spendINR: 4850000, count: 10 },
    { category: 'Microprocessor & VVVF Controllers', spendINR: 3800000, count: 11 },
    { category: 'Guide Rails & Counterweights', spendINR: 2100000, count: 15 },
    { category: 'Automatic Doors & Operators', spendINR: 1500000, count: 8 }
  ],
  retentionTrend: [
    { month: 'Mar 2026', heldINR: 320000, releasedINR: 280000 },
    { month: 'Apr 2026', heldINR: 380000, releasedINR: 310000 },
    { month: 'May 2026', heldINR: 410000, releasedINR: 390000 },
    { month: 'Jun 2026', heldINR: 450000, releasedINR: 420000 },
    { month: 'Jul 2026', heldINR: 520000, releasedINR: 480000 },
    { month: 'Aug 2026', heldINR: 580000, releasedINR: 510000 }
  ],
  updatedAt: '2026-08-12T08:00:00Z'
};

export const initialReconciliationRuns: ReconciliationRunRecord[] = [
  {
    id: 'rec_2026_0812',
    runDate: '2026-08-12 08:30 IST',
    status: 'action_required_mismatch',
    totalBankTxCount: 48,
    matchedCount: 45,
    unmatchedCount: 3,
    totalMatchedAmountINR: 2845000,
    bankFeedSource: 'HDFC Corporate API - Live Automated Stream',
    unmatchedTransactions: [
      {
        id: 'tx_unm_1',
        txDate: '2026-08-11',
        bankTxId: 'HDFC981240129',
        bankDescription: 'NEFT-BARB-BHARAT TRACTION-INV-9901',
        bankAmountINR: 185000,
        type: 'debit_supplier_outflow',
        mismatchType: 'amount_variance',
        suggestedAppRecord: 'App Payment Pay_001 (Recorded as ₹1,80,000 - ₹5,000 variance for expedited dispatch charge)',
        status: 'unmatched_action_required'
      },
      {
        id: 'tx_unm_2',
        txDate: '2026-08-11',
        bankTxId: 'HDFC981240188',
        bankDescription: 'HDFC CMS NEFT/RTGS CHARGES & GST',
        bankAmountINR: 354,
        type: 'debit_bank_fee',
        mismatchType: 'unrecorded_bank_fee',
        suggestedAppRecord: 'Bank Service Fee (Outside app purchase order payout modeling)',
        status: 'unmatched_action_required'
      },
      {
        id: 'tx_unm_3',
        txDate: '2026-08-10',
        bankTxId: 'HDFC981239011',
        bankDescription: 'UPI-REV-DELTA CONTROLS-DUPLICATE',
        bankAmountINR: 42000,
        type: 'debit_supplier_outflow',
        mismatchType: 'duplicate_payout_risk',
        suggestedAppRecord: 'Potential duplicate payout alert! Matches Pay_004 already processed on 2026-08-08.',
        status: 'escalated_high_priority'
      }
    ]
  },
  {
    id: 'rec_2026_0811',
    runDate: '2026-08-11 08:30 IST',
    status: 'pass_all_matched',
    totalBankTxCount: 38,
    matchedCount: 38,
    unmatchedCount: 0,
    totalMatchedAmountINR: 1920000,
    bankFeedSource: 'HDFC Corporate API - Live Automated Stream',
    unmatchedTransactions: []
  },
  {
    id: 'rec_2026_0810',
    runDate: '2026-08-10 08:30 IST',
    status: 'bank_feed_unavailable',
    totalBankTxCount: 0,
    matchedCount: 0,
    unmatchedCount: 0,
    totalMatchedAmountINR: 0,
    bankFeedSource: 'SBI Direct Corporate Connect',
    notes: 'Bank API Gateway connection timeout. Reconciliation run deferred. No false positive match reported.',
    unmatchedTransactions: []
  }
];

export const initialTechnicianProfiles: TechnicianProfileSummary[] = [
  {
    technicianId: 'tech_001',
    name: 'Ramesh Patil',
    phone: '+91 98220 11223',
    monthlyCompletedCount: 6,
    currentQualityScore: 98.4,
    pendingPayoutINR: 42500,
    safetyAlertActive: false
  },
  {
    technicianId: 'tech_002',
    name: 'Suresh Deshmukh',
    phone: '+91 98220 44556',
    monthlyCompletedCount: 5,
    currentQualityScore: 96.8,
    pendingPayoutINR: 38000,
    safetyAlertActive: false
  }
];

export const initialTechnicianJobs: TechnicianJob[] = [
  {
    id: 'job_2026_101',
    dealId: 'DEAL-8820',
    poNumber: 'PO-2026-8801',
    customerName: 'Shri Vikramaditya Housing Society',
    customerPhone: '+91 98223 99881',
    customerEmail: 'secretary@vikramadityasociety.org',
    siteAddress: 'Plot 42, Sector 18, Kharghar, Navi Mumbai, Maharashtra 410210',
    siteCity: 'Navi Mumbai',
    latitude: 19.0473,
    longitude: 73.0699,
    scheduledDate: '2026-08-13',
    scheduledTimeSlot: '09:30 AM - 05:30 PM',
    sopStage: 'Mechanical Guiderail Alignment & Bracket Fixing',
    sopProgressPercent: 35,
    status: 'in_progress',
    userRoleInJob: 'lead_technician',
    assignedTeam: [
      {
        techId: 'tech_001',
        name: 'Ramesh Patil',
        role: 'lead_technician',
        phone: '+91 98220 11223',
        isLead: true
      },
      {
        techId: 'tech_002',
        name: 'Suresh Deshmukh',
        role: 'assistant_technician',
        phone: '+91 98220 44556',
        isLead: false
      }
    ],
    elevatorSpec: {
      modelName: 'Ascension Royal Premium 8-Stop Gearless VVVF',
      capacityKg: 544,
      passengers: 8,
      stops: 8,
      speedMs: 1.5,
      driveType: 'Gearless Permanent Magnet Synchronous (PMSM)',
      doorType: 'Center-Opening Automatic Stainless Steel Hairline',
      cabinFinish: 'Rose Gold Mirror Stainless Steel with LED Ambient Lighting',
      pitDepthMm: 1500,
      overheadMm: 4200,
      lockedQuotationRef: 'QUO-2026-9912 (Locked & Verified)',
      specLastUpdatedAt: '2026-08-01T10:00:00Z'
    },
    materialsStatus: [
      { id: 'mat_1', componentCategory: 'Traction Machine', itemName: 'Gearless PM Motor & Brake Assembly', quantity: 1, isReadyOnSite: true, deliveredAt: '2026-08-11', receivedVerificationSignoff: true },
      { id: 'mat_2', componentCategory: 'Guide Rails', itemName: 'T75/B Precision Machined Guide Rails (24 pcs)', quantity: 24, isReadyOnSite: true, deliveredAt: '2026-08-11', receivedVerificationSignoff: true },
      { id: 'mat_3', componentCategory: 'Controller', itemName: 'Microprocessor VVVF Control Panel & Wiring Harness', quantity: 1, isReadyOnSite: true, deliveredAt: '2026-08-12', receivedVerificationSignoff: true },
      { id: 'mat_4', componentCategory: 'Cabin & Doors', itemName: 'Car Frame, Platform & Automatic Landing Doors', quantity: 1, isReadyOnSite: true, deliveredAt: '2026-08-12', receivedVerificationSignoff: true },
      { id: 'mat_5', componentCategory: 'Safety Gear', itemName: 'Overspeed Governor & Bi-directional Safety Gear', quantity: 1, isReadyOnSite: true, deliveredAt: '2026-08-12', receivedVerificationSignoff: true }
    ],
    surveyNotes: [
      {
        id: 'note_1',
        timestamp: '2026-07-28 11:30 IST',
        authorName: 'Anil Kulkarni',
        authorRole: 'Site Surveyor',
        noteText: 'Narrow entry gate (2.4m width). Materials unloaded using crane near West Wing driveway. Pit waterproofing confirmed complete.',
        isOutdated: false
      },
      {
        id: 'note_2',
        timestamp: '2026-07-15 14:20 IST',
        authorName: 'Rahul Verma',
        authorRole: 'Sales Engineer',
        noteText: 'Customer requested quiet installation hours between 1:00 PM and 3:00 PM daily due to afternoon resident quiet hours.',
        isOutdated: false
      }
    ],
    estimatedHours: 40,
    payoutAmountINR: 18500
  },
  {
    id: 'job_2026_102',
    dealId: 'DEAL-8841',
    poNumber: 'PO-2026-8815',
    customerName: 'Pinnacle Commercial Towers',
    customerPhone: '+91 98901 22334',
    customerEmail: 'facility@pinnacletowers.com',
    siteAddress: 'Baner High Street, Baner, Pune, Maharashtra 411045',
    siteCity: 'Pune',
    latitude: 18.559,
    longitude: 73.7868,
    scheduledDate: '2026-08-13',
    scheduledTimeSlot: '10:00 AM - 06:00 PM',
    sopStage: 'Scaffolding & Plumbing Line Plumbing Verification',
    sopProgressPercent: 10,
    status: 'in_progress',
    userRoleInJob: 'assistant_technician',
    assignedTeam: [
      {
        techId: 'tech_003',
        name: 'Vijay Shinde',
        role: 'lead_technician',
        phone: '+91 98220 77889',
        isLead: true
      },
      {
        techId: 'tech_001',
        name: 'Ramesh Patil',
        role: 'assistant_technician',
        phone: '+91 98220 11223',
        isLead: false
      }
    ],
    elevatorSpec: {
      modelName: 'Ascension Commercial 13-Passenger High Speed',
      capacityKg: 884,
      passengers: 13,
      stops: 12,
      speedMs: 2.0,
      driveType: 'Regenerative VVVF Gearless Drive',
      doorType: 'Center-Opening High-Speed Automatic',
      cabinFinish: 'Textured Stainless Steel with Full Height Rear Glass',
      pitDepthMm: 1800,
      overheadMm: 4600,
      lockedQuotationRef: 'QUO-2026-9944 (Locked & Verified)',
      specLastUpdatedAt: '2026-08-05T14:30:00Z'
    },
    materialsStatus: [
      { id: 'mat_10', componentCategory: 'Guide Rails', itemName: 'T89 Heavy Duty Guide Rails', quantity: 36, isReadyOnSite: true, deliveredAt: '2026-08-12', receivedVerificationSignoff: true },
      { id: 'mat_11', componentCategory: 'Traction Unit', itemName: 'Regenerative Gearless Machine Unit', quantity: 1, isReadyOnSite: false, receivedVerificationSignoff: false }
    ],
    surveyNotes: [
      {
        id: 'note_10',
        timestamp: '2026-08-01 16:00 IST',
        authorName: 'Anil Kulkarni',
        authorRole: 'Site Surveyor',
        noteText: '3-Phase 415V power supply line verified and energized in shaft machine room.',
        isOutdated: false
      }
    ],
    estimatedHours: 60,
    payoutAmountINR: 24000
  },
  {
    id: 'job_2026_103',
    dealId: 'DEAL-8890',
    poNumber: 'PO-2026-8830',
    customerName: 'Silver Oak Apartments RWA',
    customerPhone: '+91 98112 33445',
    customerEmail: 'rwa@silveroakpune.com',
    siteAddress: 'Viman Nagar, Pune, Maharashtra 411014',
    siteCity: 'Pune',
    latitude: 18.5679,
    longitude: 73.9143,
    scheduledDate: '2026-08-15',
    scheduledTimeSlot: '09:00 AM - 05:00 PM',
    sopStage: 'Pre-Installation Unboxing & Site Safety Check',
    sopProgressPercent: 0,
    status: 'scheduled',
    userRoleInJob: 'lead_technician',
    assignedTeam: [
      {
        techId: 'tech_001',
        name: 'Ramesh Patil',
        role: 'lead_technician',
        phone: '+91 98220 11223',
        isLead: true
      }
    ],
    elevatorSpec: {
      modelName: 'Ascension Home LIFT 4-Stop Hydraulic Gearless',
      capacityKg: 408,
      passengers: 6,
      stops: 4,
      speedMs: 1.0,
      driveType: 'VVVF Gearless Compact',
      doorType: 'Telescopic 2-Panel Automatic',
      cabinFinish: 'Wood Grain Laminate Accent with Champagne Gold Trim',
      pitDepthMm: 1200,
      overheadMm: 3800,
      lockedQuotationRef: 'QUO-2026-9980 (Locked & Verified)',
      specLastUpdatedAt: '2026-08-08T09:00:00Z'
    },
    materialsStatus: [
      { id: 'mat_20', componentCategory: 'Full Package', itemName: 'Consolidated Lift Kit in Wooden Crate', quantity: 1, isReadyOnSite: true, deliveredAt: '2026-08-12', receivedVerificationSignoff: true }
    ],
    surveyNotes: [],
    estimatedHours: 32,
    payoutAmountINR: 15000
  }
];

export const initialInstallationEvidence: InstallationEvidenceItem[] = [
  {
    id: 'evid_101',
    jobId: 'job_2026_101',
    sopStepId: 'step_101_1',
    sopStepTitle: 'Site & Shaft Plumb Line Verification',
    evidenceType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    captureTimestamp: '2026-08-13 09:45:10 IST',
    caption: 'Laser vertical plumb line verification in Kharghar shaft. Vertical deviation within +/- 1.2mm.',
    isDefectFlagged: false,
    gpsLat: 19.0473,
    gpsLng: 73.0699,
    uploadStatus: 'uploaded'
  },
  {
    id: 'evid_102',
    jobId: 'job_2026_101',
    sopStepId: 'step_101_2',
    sopStepTitle: 'Mechanical Guiderail Alignment & Bracket Fixing',
    evidenceType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    captureTimestamp: '2026-08-13 11:20:00 IST',
    caption: 'T75 guide rail brackets torque-tightened to 85 Nm and fishplate joint gap measured at 0.05mm.',
    isDefectFlagged: false,
    gpsLat: 19.0473,
    gpsLng: 73.0699,
    uploadStatus: 'uploaded'
  }
];

export const initialInstallationSopSteps: InstallationSopStep[] = [
  {
    id: 'step_101_1',
    jobId: 'job_2026_101',
    phase: 'Site & Shaft Prep',
    stepNumber: 1,
    title: 'Site & Shaft Plumb Line Verification',
    description: 'Establish center lines using 0.5mm steel plumb wire or 3D laser alignment tool. Verify shaft dimensions against approved layout drawing.',
    isSafetyCritical: false,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'completed',
    completedAt: '2026-08-13 09:45 IST',
    completedByTechName: 'Ramesh Patil',
    evidenceList: [
      {
        id: 'evid_101',
        jobId: 'job_2026_101',
        sopStepId: 'step_101_1',
        sopStepTitle: 'Site & Shaft Plumb Line Verification',
        evidenceType: 'photo',
        mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
        captureTimestamp: '2026-08-13 09:45:10 IST',
        caption: 'Laser vertical plumb line verification in Kharghar shaft.',
        uploadStatus: 'uploaded'
      }
    ]
  },
  {
    id: 'step_101_2',
    jobId: 'job_2026_101',
    phase: 'Guide Rails & Brackets',
    stepNumber: 2,
    title: 'Mechanical Guiderail Alignment & Bracket Fixing',
    description: 'Fix wall brackets into shaft concrete walls with M12 rawl bolts. Align T75/B guide rails using DBG (Distance Between Guides) gauge block.',
    isSafetyCritical: true,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'completed',
    completedAt: '2026-08-13 11:20 IST',
    completedByTechName: 'Ramesh Patil',
    evidenceList: [
      {
        id: 'evid_102',
        jobId: 'job_2026_101',
        sopStepId: 'step_101_2',
        sopStepTitle: 'Mechanical Guiderail Alignment & Bracket Fixing',
        evidenceType: 'photo',
        mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        captureTimestamp: '2026-08-13 11:20:00 IST',
        caption: 'T75 guide rail brackets torque-tightened to 85 Nm.',
        uploadStatus: 'uploaded'
      }
    ]
  },
  {
    id: 'step_101_3',
    jobId: 'job_2026_101',
    phase: 'Guide Rails & Brackets',
    stepNumber: 3,
    title: 'Counterweight Frame & Hydraulic Buffer Position',
    description: 'Assemble counterweight frame in pit with specified weight filler blocks. Install oil/spring buffers on pit concrete pedestals per IS 14665 standard.',
    isSafetyCritical: true,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'pending',
    evidenceList: []
  },
  {
    id: 'step_101_4',
    jobId: 'job_2026_101',
    phase: 'Car Frame & Cabin',
    stepNumber: 4,
    title: 'Gearless PM Machine Unit & Traction Rope Hoisting',
    description: 'Rig machine unit onto overhead bedplate using chain pulley block. Anchor traction ropes (10mm 8x19 steel core) with wedge sockets & double nuts.',
    isSafetyCritical: true,
    requiresPhotoEvidence: false,
    requiresVideoEvidence: true,
    status: 'pending',
    evidenceList: []
  },
  {
    id: 'step_101_5',
    jobId: 'job_2026_101',
    phase: 'Car Frame & Cabin',
    stepNumber: 5,
    title: 'Car Frame Assembly & Safety Gear Engagement Check',
    description: 'Assemble upper beam, uprights, and safety plank. Perform manual pull test to ensure progressive safety gear wedges grip guide rails evenly.',
    isSafetyCritical: true,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'pending',
    evidenceList: []
  },
  {
    id: 'step_101_6',
    jobId: 'job_2026_101',
    phase: 'Wiring & Control Panel',
    stepNumber: 6,
    title: 'VVVF Microprocessor Controller & Traveling Cable Wiring',
    description: 'Mount control panel in machine room or machine-room-less top landing. Hang flexible flat traveling cable with strain relief steel wire.',
    isSafetyCritical: false,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'pending',
    evidenceList: []
  },
  {
    id: 'step_101_7',
    jobId: 'job_2026_101',
    phase: 'Safety Devices (Governor/Buffers/ARD)',
    stepNumber: 7,
    title: 'Overspeed Governor & ARD (Auto Rescue Device) Setup',
    description: 'Calibrate centrifugal overspeed governor tripping speed. Test ARD automatic battery fallback operation upon 3-phase grid power failure simulation.',
    isSafetyCritical: true,
    requiresPhotoEvidence: false,
    requiresVideoEvidence: true,
    status: 'pending',
    evidenceList: []
  },
  {
    id: 'step_101_8',
    jobId: 'job_2026_101',
    phase: 'Safety Devices (Governor/Buffers/ARD)',
    stepNumber: 8,
    title: 'Infrared Door Curtain Sensor & Mechanical Lock Interlock',
    description: 'Install 154-beam full height IR door safety curtain. Verify mechanical door lock contacts open prior to landing door clutch release.',
    isSafetyCritical: true,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'pending',
    evidenceList: []
  },
  {
    id: 'step_101_9',
    jobId: 'job_2026_101',
    phase: 'Final Adjustment & Testing',
    stepNumber: 9,
    title: 'Slow Speed Inspection Run & Floor Leveling Calibration',
    description: 'Perform slow speed inspection run from car top console. Calibrate optical leveling switches at each floor stop within +/- 2mm leveling accuracy.',
    isSafetyCritical: false,
    requiresPhotoEvidence: true,
    requiresVideoEvidence: false,
    status: 'pending',
    evidenceList: []
  }
];

export const initialTechnicianCheckIns: TechnicianCheckInRecord[] = [
  {
    id: 'checkin_501',
    jobId: 'job_2026_101',
    technicianId: 'tech_001',
    technicianName: 'Ramesh Patil',
    checkInTimestamp: '2026-08-13T09:15:00Z',
    checkInLat: 19.0473,
    checkInLng: 73.0699,
    checkInDistanceMeters: 18,
    status: 'active_onsite'
  }
];

export const initialSafetyComplianceItems: SafetyComplianceItem[] = [
  {
    id: 'safe_101_1',
    jobId: 'job_2026_101',
    category: 'Over-Speed Governor & Safety Gear',
    title: 'Centrifugal Governor Tripping & Safety Gear Wedge Engagement',
    description: 'Verify centrifugal flyweight tripping speed and ensure safety gear jaws grip guide rails instantaneously on overspeed signal.',
    indianStandardRef: 'IS 14665 (Part 3 / Sec 2)',
    isGovernmentInspectorRequired: true,
    status: 'passed',
    testedAt: '2026-08-13 10:30 IST',
    testedByTechName: 'Ramesh Patil',
    evidenceUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'safe_101_2',
    jobId: 'job_2026_101',
    category: 'Buffers & Pit Equipment',
    title: 'Hydraulic Oil Buffer Stroke & Pit Emergency Stop Switch',
    description: 'Inspect buffer fluid level, plunger stroke compression, and pit mushroom emergency stop button contact wiring.',
    indianStandardRef: 'IS 14665 (Part 4)',
    isGovernmentInspectorRequired: true,
    status: 'passed',
    testedAt: '2026-08-13 11:15 IST',
    testedByTechName: 'Ramesh Patil',
    evidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'safe_101_3',
    jobId: 'job_2026_101',
    category: 'Emergency Alarm & ARD',
    title: 'Automatic Rescue Device (ARD) & Intercom Battery Backup',
    description: 'Simulate 3-phase grid power failure. Verify ARD automatically rescues cabin to nearest landing and opens door within 30 seconds.',
    indianStandardRef: 'IS 14665 / CEA Electrical Safety Regs',
    isGovernmentInspectorRequired: true,
    status: 'pending'
  },
  {
    id: 'safe_101_4',
    jobId: 'job_2026_101',
    category: 'IR Door Curtain & Interlocks',
    title: 'Infrared Multi-Beam Door Curtain & Landing Door Locks',
    description: 'Verify 154-beam light curtain reverses closing door upon beam obstruction. Check mechanical landing door lock interlocks.',
    indianStandardRef: 'IS 14665 (Part 3 / Sec 1)',
    isGovernmentInspectorRequired: false,
    status: 'pending'
  },
  {
    id: 'safe_101_5',
    jobId: 'job_2026_101',
    category: 'Load Weighing & Overload Sensor',
    title: 'Cabin Overload Sensor (110% Rated Load) & Buzzer Lockout',
    description: 'Calibrate strain gauge sensors under car floor. Ensure overload buzzer sounds and door stays open when payload exceeds 110%.',
    indianStandardRef: 'IS 14665 Standard',
    isGovernmentInspectorRequired: true,
    status: 'pending'
  },
  {
    id: 'safe_101_6',
    jobId: 'job_2026_101',
    category: 'No-Load & Full-Load Trial Run',
    title: 'State Lift Inspectorate No-Load & 125% Dynamic Brake Test',
    description: 'Perform full-speed travel runs with empty car and 125% test weight. Verify traction machine brake holds load without slippage.',
    indianStandardRef: 'Maharashtra Lift Act / IS 14665 Inspection',
    isGovernmentInspectorRequired: true,
    status: 'pending'
  }
];

export const initialTechnicianIssueReports: TechnicianIssueReport[] = [
  {
    id: 'issue_301',
    jobId: 'job_2026_101',
    title: 'Shaft Wall Concrete Honeycombing at Floor 3 Bracket Anchor',
    issueCategory: 'site_unpreparedness',
    severity: 'minor_noted',
    description: 'Concrete hollow void detected near 3rd floor rail bracket anchor hole. Requires chemical grouting prior to heavy torque bolt tightening.',
    evidenceUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'],
    reportedByTechId: 'tech_001',
    reportedByTechName: 'Ramesh Patil',
    reportedAt: '2026-08-13 08:45 IST',
    status: 'resolved_resumed',
    resolutionNotes: 'Civil contractor applied epoxy chemical anchor grouting and verified torque stability.'
  }
];

export const initialMaterialUsageLogs: MaterialUsageLogItem[] = [
  {
    id: 'mat_101_1',
    jobId: 'job_2026_101',
    partName: 'T75/B Machined Guide Rails (5 Meters)',
    partCategory: 'Guide Rails & Brackets',
    plannedQuantity: 12,
    usedQuantity: 12,
    unit: 'Lengths',
    serialOrBatchNumber: 'BATCH-2026-IND-771',
    hasDeviation: false,
    returnToReusablePool: false,
    loggedAt: '2026-08-13 11:30 IST'
  },
  {
    id: 'mat_102_2',
    jobId: 'job_2026_101',
    partName: 'T75 Guide Rail Wall Mounting Brackets & Anchor Bolts',
    partCategory: 'Guide Rails & Brackets',
    plannedQuantity: 24,
    usedQuantity: 26,
    unit: 'Sets',
    serialOrBatchNumber: 'SN-BRK-99201',
    hasDeviation: true,
    deviationReason: 'site_custom_bracket_added',
    returnToReusablePool: false,
    loggedAt: '2026-08-13 11:30 IST'
  },
  {
    id: 'mat_103_3',
    jobId: 'job_2026_101',
    partName: '10mm Steel Core Traction Wire Ropes',
    partCategory: 'Machine & Traction',
    plannedQuantity: 180,
    usedQuantity: 180,
    unit: 'Meters',
    serialOrBatchNumber: 'ROPE-IND-4412-MUM',
    hasDeviation: false,
    returnToReusablePool: false,
    loggedAt: '2026-08-13 11:30 IST'
  },
  {
    id: 'mat_104_4',
    jobId: 'job_2026_101',
    partName: 'VVVF Microprocessor Control Panel Cabinet',
    partCategory: 'Control Panel & Cables',
    plannedQuantity: 1,
    usedQuantity: 1,
    unit: 'Unit',
    serialOrBatchNumber: 'PANEL-AIEC-2026-9081',
    hasDeviation: false,
    returnToReusablePool: false,
    loggedAt: '2026-08-13 11:30 IST'
  },
  {
    id: 'mat_105_5',
    jobId: 'job_2026_101',
    partName: 'M12 Heavy Duty Expansion Anchor Fasteners',
    partCategory: 'Fasteners & Consumables',
    plannedQuantity: 50,
    usedQuantity: 42,
    unit: 'Pieces',
    serialOrBatchNumber: 'NOT_LEGIBLE',
    hasDeviation: true,
    deviationReason: 'not_required',
    returnToReusablePool: true,
    loggedAt: '2026-08-13 11:30 IST'
  }
];

export const initialQcAssignments: QcInspectorAssignmentRecord[] = [
  {
    id: 'qc_assign_101',
    jobId: 'job_2026_101',
    assignedInspectorId: 'user_qc_001',
    assignedInspectorName: 'Vikram Salunkhe',
    assignedInspectorPhone: '+91 98230 44556',
    assignedInspectorRole: 'qc_inspector',
    qcScheduledDate: '2026-08-14',
    qcScheduledTimeSlot: '10:00 AM - 01:00 PM',
    assignmentStatus: 'scheduled',
    eligibilityCheckPassed: true,
    matchingSkillTags: ['QC Certified', 'Lift Inspector License', 'A1 Grade Technician', 'Electrical Auditor'],
    conflictOfIndependenceFlag: false,
    customerPreferredTiming: '2026-08-14 Morning Slot (10 AM)',
    customerConfirmedSlot: true,
    autoNotificationSentAt: '2026-08-13 10:15 IST',
    assignedAt: '2026-08-13 10:15 IST'
  }
];

export const initialMechanicalChecklists: QcMechanicalCheckItem[] = [
  {
    id: 'mech_101_1',
    jobId: 'job_2026_101',
    itemKey: 'guide_rail_plumb',
    title: 'Guide Rail Alignment & Vertical Plumb (T75 Rails)',
    category: 'Guide Rails',
    toleranceStandard: 'Vertical plumb deviation < 1.0mm per 10m height; Bracket alignment +/- 0.5mm',
    result: 'pending',
    inspectorEvidenceUrls: [],
    installEvidenceRefUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    installEvidenceDiscrepancyFlag: false
  },
  {
    id: 'mech_101_2',
    jobId: 'job_2026_101',
    itemKey: 'car_counterweight_balance',
    title: 'Car & Counterweight Weight Ratio Balance (50% Contract Payload)',
    category: 'Car & Counterweight',
    toleranceStandard: 'Counterweight = Car Self Weight + 45-50% Rated Payload (315kg for 630kg rated)',
    result: 'pending',
    inspectorEvidenceUrls: [],
    installEvidenceRefUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    installEvidenceDiscrepancyFlag: false
  },
  {
    id: 'mech_101_3',
    jobId: 'job_2026_101',
    itemKey: 'ride_smoothness_vibration',
    title: 'Ride Smoothness, Jerk & Acoustic Vibration Test',
    category: 'Ride Quality',
    toleranceStandard: 'Peak vertical acceleration < 1.2 m/s²; Jerk < 1.5 m/s³; Cabin noise < 52 dBA during travel',
    result: 'pending',
    inspectorEvidenceUrls: [],
    installEvidenceRefUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    installEvidenceDiscrepancyFlag: false
  },
  {
    id: 'mech_101_4',
    jobId: 'job_2026_101',
    itemKey: 'floor_leveling_accuracy',
    title: 'Floor Landing Leveling Accuracy (G+4 All Stops)',
    category: 'Floor Leveling',
    toleranceStandard: 'Leveling tolerance within +/- 3.0mm of sill line under full load and empty car conditions',
    result: 'pending',
    inspectorEvidenceUrls: [],
    installEvidenceRefUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    installEvidenceDiscrepancyFlag: false
  },
  {
    id: 'mech_101_5',
    jobId: 'job_2026_101',
    itemKey: 'door_mechanism_smoothness',
    title: 'Landing & Car Door Operator Motion & Mechanical Interlock Lockout',
    category: 'Door Mechanism',
    toleranceStandard: 'Smooth opening/closing without binding or rattle; Door lock contact engages > 7mm before circuit closes',
    result: 'pending',
    inspectorEvidenceUrls: [],
    installEvidenceRefUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    installEvidenceDiscrepancyFlag: false
  }
];

export const initialQcReports: QcMechanicalReport[] = [
  {
    id: 'report_101',
    jobId: 'job_2026_101',
    inspectorId: 'user_qc_001',
    inspectorName: 'Vikram Salunkhe',
    overallStatus: 'pending',
    totalCheckItems: 5,
    passedCount: 0,
    exceptionsCount: 0,
    failedCount: 0,
    items: initialMechanicalChecklists
  }
];

export const initialElectricalChecklists: QcElectricalSafetyCheckItem[] = [
  {
    id: 'elec_101_1',
    jobId: 'job_2026_101',
    itemKey: 'wiring_grounding_verification',
    title: '3-Phase Cable Insulation & Dual Earthing Continuity Verification',
    category: 'Wiring & Earthing',
    bisStandardRef: 'IS 14665 Clause 4.2 / IS 732 Earth Pit Resistance < 2.0 Ohms',
    result: 'passed',
    hardBlockActive: false,
    inspectorEvidenceUrls: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'],
    retestHistory: [{ attemptNumber: 1, result: 'passed', dateAt: '2026-08-14 11:00 IST', note: 'Earth resistance measured at 1.4 Ohms. Pass.' }],
    inspectedAt: '2026-08-14 11:00 IST'
  },
  {
    id: 'elec_101_2',
    jobId: 'job_2026_101',
    itemKey: 'control_panel_function',
    title: 'VVVF Microprocessor Drive Logic, Contactors & Thermal Overload Protection',
    category: 'Control Panel',
    bisStandardRef: 'IS 14665 Clause 5.1 / Control Circuit Voltage < 110V DC/AC',
    result: 'passed',
    hardBlockActive: false,
    inspectorEvidenceUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    retestHistory: [{ attemptNumber: 1, result: 'passed', dateAt: '2026-08-14 11:20 IST', note: 'All relay interlocks & thermal cutoffs verified.' }],
    inspectedAt: '2026-08-14 11:20 IST'
  },
  {
    id: 'elec_101_3',
    jobId: 'job_2026_101',
    itemKey: 'overspeed_governor_test',
    title: 'Centrifugal Overspeed Governor & Mechanical Safety Gear Tripping Test',
    category: 'Safety Devices',
    bisStandardRef: 'IS 14665 Clause 6.1 Mechanical trip speed 115% rated speed (1.15 m/s)',
    result: 'passed',
    hardBlockActive: false,
    inspectorEvidenceUrls: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'],
    retestHistory: [{ attemptNumber: 1, result: 'passed', dateAt: '2026-08-14 11:45 IST', note: 'Governor jaw clamp tripped at 1.14 m/s. Safety jaw engaged guide rails securely.' }],
    inspectedAt: '2026-08-14 11:45 IST'
  },
  {
    id: 'elec_101_4',
    jobId: 'job_2026_101',
    itemKey: 'buffer_function',
    title: 'Oil-Hydraulic Pit Buffer Switch Engagement & Stroke Clearance Test',
    category: 'Safety Devices',
    bisStandardRef: 'IS 14665 Clause 7.2 Pit oil buffer plunger compression & return switch',
    result: 'passed',
    hardBlockActive: false,
    inspectorEvidenceUrls: [],
    retestHistory: [],
    inspectedAt: '2026-08-14 12:00 IST'
  },
  {
    id: 'elec_101_5',
    jobId: 'job_2026_101',
    itemKey: 'ard_simulated_power_failure',
    title: 'Automatic Rescue Device (ARD) Simulated Power Cut Rescue Test',
    category: 'Emergency & ARD',
    bisStandardRef: 'IS 14665 Clause 8.3 Emergency rescue operation within 30 seconds to nearest landing',
    result: 'pending',
    hardBlockActive: true,
    inspectorEvidenceUrls: [],
    retestHistory: [],
    trialRunData: {
      loadCondition: 'no_load',
      voltageVolts: 415,
      currentAmps: 12.5,
      speedMps: 1.0,
      ardResponseTimeSeconds: 22,
      levelingAccuracyMm: 2.0,
      vibrationDb: 48,
      passed: true
    }
  },
  {
    id: 'elec_101_6',
    jobId: 'job_2026_101',
    itemKey: 'door_safety_sensor_test',
    title: 'Full-Height Infrared Light Curtain Door Protection & Reopening Test',
    category: 'Safety Devices',
    bisStandardRef: 'IS 14665 Clause 9.1 Multi-beam light curtain non-contact reopening < 100ms',
    result: 'passed',
    hardBlockActive: false,
    inspectorEvidenceUrls: [],
    retestHistory: []
  },
  {
    id: 'elec_101_7',
    jobId: 'job_2026_101',
    itemKey: 'overload_device_test',
    title: 'Cabin Overload Sensor Cutoff & Buzzer Alarm Test (110% Rated Payload)',
    category: 'Safety Devices',
    bisStandardRef: 'IS 14665 Clause 10.4 Prevent door closure & trigger audible alarm at 110% load (693kg)',
    result: 'passed',
    hardBlockActive: false,
    inspectorEvidenceUrls: [],
    retestHistory: []
  },
  {
    id: 'elec_101_8',
    jobId: 'job_2026_101',
    itemKey: 'no_load_full_load_trial_run',
    title: 'Government-Standard Continuous Trial Run (No-Load, Full-Load & Overload 30-Min Test)',
    category: 'Trial Run Performance',
    bisStandardRef: 'IS 14665 Continuous 30-Minute Trial Run at 100% Contract Payload (630kg)',
    result: 'pending',
    hardBlockActive: true,
    inspectorEvidenceUrls: [],
    retestHistory: [],
    trialRunData: {
      loadCondition: 'full_load_100',
      voltageVolts: 412,
      currentAmps: 18.2,
      speedMps: 1.0,
      ardResponseTimeSeconds: 24,
      levelingAccuracyMm: 1.5,
      vibrationDb: 50,
      passed: true
    }
  }
];

export const initialComplianceCertificates: ComplianceCertificateRecord[] = [
  {
    id: 'cert_101',
    jobId: 'job_2026_101',
    certificateNumber: 'AIEC/QC-CERT/2026/MH-101',
    buildingName: 'Kothrud Commercial Tower (G+4 Lifts)',
    customerName: 'Shri. Rajesh Patil / Kothrud Infra Pvt Ltd',
    applicableIsStandard: 'IS 14665 (Electric Traction Lifts)',
    driveType: 'mrl_gearless',
    floorsCount: 5,
    ratedCapacityKg: 630,
    stateJurisdiction: 'Maharashtra (MH Lift Act 2012 / PWD Electrical Inspectorate Pune)',
    governmentApplicationGuidance: {
      licensingAuthority: 'Office of the Chief Electrical Inspector to Government, Maharashtra State, Pune Division',
      formName: 'Form A — Application for Permission to Erect & License to Operate Lift',
      requiredAttachments: [
        'AIEC Internal Compliance Certificate & QC Inspection Sign-off',
        'Approved Shaft Civil & Overhead Clearance Drawing (3 Copies)',
        'Dual Earthing Resistance Test Certificate (< 2.0 Ohms)',
        'Erection Completion Certificate signed by Licensed Lift Contractor',
        'Government Treasury Challan Fee Receipt (Rs. 2,500)'
      ],
      stateFeeEstimateRs: 2500,
      nextStepInstructions: 'Submit Form A along with this AIEC Compliance Package to PWD Electrical Inspectorate Office, Pune. State Lift Inspector visit will be scheduled within 7-10 working days.'
    },
    documentPackageRef: {
      mechanicalQcReportId: 'report_101',
      electricalQcReportId: 'report_elec_101',
      trialRunLogId: 'trial_run_101',
      drawingApprovalRef: 'DWG-AIEC-KOTHRUD-2026-REV3',
      earthingTestCertificateRef: 'EARTH-TEST-MH-2026-88'
    },
    issuedTimestamp: '2026-08-14 14:30 IST',
    issuedByInspectorName: 'Vikram Salunkhe (Chief QC Auditor)',
    isLockedImmutable: true,
    isReissued: false
  }
];

export const initialReworkAssignments: ReworkAssignmentRecord[] = [
  {
    id: 'rework_101_1',
    jobId: 'job_2026_101',
    linkedSnagId: 'snag_101_1',
    snagCode: 'SNAG-101-01',
    title: 'ARD Battery Bank Calibration & Voltage Stabilization',
    assignedTechnicianId: 'tech_002',
    assignedTechnicianName: 'Anil Gaikwad (Electrical Lead)',
    dueUrgency: 'immediate_urgent',
    dueDate: '2026-08-15',
    qcOriginalNote: 'ARD battery bank voltage dropped to 21.8V under 45s load test. Hard block on handover.',
    qcOriginalEvidenceUrls: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'],
    reworkCompletionEvidenceUrls: [],
    status: 'assigned',
    updatedAt: '2026-08-14 14:00 IST'
  },
  {
    id: 'rework_101_2',
    jobId: 'job_2026_101',
    linkedSnagId: 'snag_101_2',
    snagCode: 'SNAG-101-02',
    title: '3rd Floor Door Operator Belt Tension Alignment',
    assignedTechnicianId: 'tech_001',
    assignedTechnicianName: 'Ramesh Patil',
    dueUrgency: 'high_priority',
    dueDate: '2026-08-16',
    qcOriginalNote: 'Acoustic vibration hum when door opens at 3rd floor landing.',
    qcOriginalEvidenceUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'],
    reworkCompletionEvidenceUrls: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'],
    technicianFixNotes: 'Re-aligned door header roller guide and calibrated timing belt tension. Hiss resolved.',
    status: 'pending_qc_reverification',
    updatedAt: '2026-08-14 16:30 IST'
  }
];

export const initialFinalHandoverChecklists: FinalHandoverChecklistRecord[] = [
  {
    id: 'fhc_101',
    jobId: 'job_2026_101',
    allSnagsResolvedFlag: false,
    complianceCertIssuedFlag: true,
    documentationPackageReadyFlag: true,
    adminFinalReviewApproved: true,
    handoverReadyStatus: 'blocked',
    blockingReasons: ['Safety-Critical Snag SNAG-101-01 (ARD Battery Voltage) is currently open.'],
    checkedByInspectorName: 'Vikram Salunkhe (Chief QC Auditor)',
    checkedAt: '2026-08-14 15:00 IST'
  }
];

export const initialCustomerWalkthroughs: CustomerHandoverWalkthroughRecord[] = [
  {
    id: 'chw_101',
    jobId: 'job_2026_101',
    walkthroughConductedBy: 'Vikram Salunkhe (Chief QC Auditor) & Prashant Wable',
    walkthroughMode: 'in_person',
    demonstratedItems: {
      normalOperation: true,
      ardEmergencyProcedure: true,
      alarmAndIntercom: true,
      cleaningAndCare: true
    },
    customerSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" stroke="%230E4B3D" stroke-width="3" fill="none"/></svg>',
    customerSignoffTimestamp: '2026-08-15 11:30 IST',
    documentsProvided: [
      'IS 14665 QA Certificate of Conformance',
      'AIEC 12-Month Comprehensive Warranty Terms',
      'Gold AMC Annual Maintenance Contract Plan Brochure',
      'Passenger Emergency Operations Manual',
      '24x7 AIEC Maharashtra Helpline Contacts Card'
    ],
    amcOptionEnrolled: true,
    amcPlanSelected: 'Gold Comprehensive AMC (4 Preventive Visits + Free Callouts)',
    immediateFeedbackScore: 5,
    customerFeedbackComments: 'Extremely smooth elevator operation. Outstanding explanation of ARD emergency procedure by the team.',
    followupQuestions: 'Can we schedule the first quarterly preventive service for November 2026?'
  }
];

export const initialWarrantyAmcRegistrations: WarrantyAmcRegistrationRecord[] = [
  {
    id: 'war_101',
    jobId: 'job_2026_101',
    customerName: 'Kothrud Landmark Housing Society',
    siteAddress: 'Plot 42, Mayur Colony, Kothrud, Pune - 411038',
    installationDate: '2026-08-15',
    manufacturerPartsWarrantyMonths: 24,
    aiecLaborWarrantyMonths: 12,
    asInstalledMaterialList: [
      {
        componentName: 'Fuji-Yaskawa VFD Inverter Drive 7.5kW (V3.2)',
        serialNumber: 'INV-FJ-2026-0982',
        isSubstitution: true,
        originalPartName: 'Yaskawa L1000A Inverter 7.5kW',
        warrantyCoverageDetails: 'Full 24-Month Manufacturer Warranty covering drive power modules & firmware'
      },
      {
        componentName: 'Monadrive Gearless PMSM Traction Machine 1.0 m/s',
        serialNumber: 'TRM-MN-8841-A',
        isSubstitution: false,
        warrantyCoverageDetails: '36-Month Mechanical & Motor Winding Manufacturer Warranty'
      },
      {
        componentName: 'Monarch NICE3000+ Integrated Elevator Controller',
        serialNumber: 'CTRL-MN-2026-112',
        isSubstitution: false,
        warrantyCoverageDetails: '24-Month Microprocessor Board Warranty'
      },
      {
        componentName: 'Exide 24V Sealed Lead-Acid ARD Battery Bank',
        serialNumber: 'BAT-EX-2026-5541',
        isSubstitution: false,
        warrantyCoverageDetails: '12-Month Battery Replacement Warranty'
      }
    ],
    amcTierSelected: 'gold_comprehensive',
    amcPricePerYear: 35000,
    amcCustomizationNotes: 'Includes 4 scheduled quarterly preventive visits, 24x7 emergency breakdown dispatch, and free normal wear-and-tear component replacements.',
    amcCoverageScope: [
      '4 Quarterly Preventive Maintenance Servicing Visits',
      '24x7 Free Emergency Breakdown Callouts',
      'Free Replacement of Contactors, Relays & Fuses',
      'Door Operator Adjustment & Sill Lubrication',
      'Annual Safety Brake & ARD Load Calibration Check'
    ],
    amcStartDate: '2026-08-15',
    amcEndDate: '2027-08-14',
    renewalReminderSchedule: [
      { reminderDate: '2026-11-15', channel: 'whatsapp', reminderType: 'first_quarterly_service', status: 'scheduled' },
      { reminderDate: '2027-06-15', channel: 'whatsapp', reminderType: 'renewal_60_days', status: 'scheduled' },
      { reminderDate: '2027-07-15', channel: 'email', reminderType: 'renewal_30_days', status: 'scheduled' },
      { reminderDate: '2027-08-07', channel: 'call', reminderType: 'renewal_7_days', status: 'scheduled' }
    ],
    registeredAt: '2026-08-15 12:00 IST',
    registeredBy: 'Mr. Prashant Vasant Wable (Admin)'
  }
];

export const initialHandoverCompletionCertificates: HandoverCompletionCertificateRecord[] = [
  {
    id: 'cert_101',
    certificateNumber: 'AIEC-CERT-2026-101',
    jobId: 'job_2026_101',
    customerName: 'Kothrud Landmark Housing Society',
    buildingName: 'Kothrud Landmark Tower A',
    siteAddress: 'Plot 42, Mayur Colony, Kothrud, Pune - 411038',
    elevatorSpecsSummary: '6-Passenger (408 kg), 5 Stops (G+4), Gearless PMSM 1.0 m/s, Automatic SS Telescopic Doors, ARD Battery Rescue, Monarch Controller',
    completionDate: '2026-08-15',
    complianceCertRef: 'AIEC-QA-2026-101 (IS 14665 / IS 15259 Compliant)',
    warrantyAndAmcRef: '12M AIEC Labor Warranty + Gold Comprehensive AMC (Reg #WAR-101)',
    linkedDocuments: [
      { id: 'doc_1', title: 'IS 14665 Statutory QA Conformance Certificate', docType: 'qa_cert', fileUrl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80', dateAdded: '2026-08-14' },
      { id: 'doc_2', title: '12-Month AIEC Comprehensive Warranty Card', docType: 'warranty_card', fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', dateAdded: '2026-08-15' },
      { id: 'doc_3', title: 'Gold Comprehensive AMC Contract Agreement', docType: 'amc_contract', fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', dateAdded: '2026-08-15' },
      { id: 'doc_4', title: 'Passenger Emergency & ARD Operations Manual', docType: 'user_manual', fileUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', dateAdded: '2026-08-15' },
      { id: 'doc_5', title: 'Maharashtra PWD Elevator License Application Dossier', docType: 'lift_license_doc', fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80', dateAdded: '2026-08-15' }
    ],
    lifecycleMilestones: [
      { stageName: '1. Site Survey & Shaft Dimensional Audit', completedDate: '2026-06-01', leadStaffName: 'Sanjay Deshmukh (Surveyor)', status: 'completed' },
      { stageName: '2. Commercial Contract & Engineering Approval', completedDate: '2026-06-10', leadStaffName: 'Prashant Wable (Admin)', status: 'completed' },
      { stageName: '3. Material Delivery & Elevator Kit Unloading', completedDate: '2026-06-25', leadStaffName: 'Ramesh Patil (Lead Tech)', status: 'completed' },
      { stageName: '4. Mechanical Erection & Guide Rail Alignment', completedDate: '2026-07-15', leadStaffName: 'Ramesh Patil (Lead Tech)', status: 'completed' },
      { stageName: '5. Electrical Wiring, VFD Calibration & Trial Run', completedDate: '2026-08-05', leadStaffName: 'Anil Gaikwad (Electrical Lead)', status: 'completed' },
      { stageName: '6. IS 14665 Final Quality Audit & Statutory Certification', completedDate: '2026-08-14', leadStaffName: 'Vikram Salunkhe (Chief QC Auditor)', status: 'completed' },
      { stageName: '7. Customer Handover & AMC Registration', completedDate: '2026-08-15', leadStaffName: 'Prashant Wable & Vikram Salunkhe', status: 'completed' }
    ],
    payoutsTriggeredFlag: true,
    payoutsBreakdown: [
      { staffId: 'surv_001', staffName: 'Sanjay Deshmukh', role: 'Site Surveyor', payoutAmount: 2500, status: 'triggered_and_disbursed' },
      { staffId: 'sales_001', staffName: 'Prashant Wable', role: 'Sales & Project Lead', payoutAmount: 12000, status: 'triggered_and_disbursed' },
      { staffId: 'tech_001', staffName: 'Ramesh Patil', role: 'Lead Mechanical Installer', payoutAmount: 8500, status: 'triggered_and_disbursed' },
      { staffId: 'tech_002', staffName: 'Anil Gaikwad', role: 'Electrical Lead', payoutAmount: 6500, status: 'triggered_and_disbursed' },
      { staffId: 'qc_001', staffName: 'Vikram Salunkhe', role: 'Chief QC Inspector', payoutAmount: 4000, status: 'triggered_and_disbursed' }
    ],
    issuedByAdminName: 'Mr. Prashant Vasant Wable (Managing Director)',
    issuedAt: '2026-08-15 14:00 IST'
  }
];

export const initialDefectSnags: DefectSnagRecord[] = [
  {
    id: 'snag_101_1',
    jobId: 'job_2026_101',
    snagCode: 'SNAG-101-01',
    title: 'ARD Battery Backup Voltage Drop on Extended Cut',
    description: 'Automatic Rescue Device battery bank showed 21.8V under load during 45s cut. Recommended charger recalibration or battery replacement.',
    sourceChecklist: 'electrical_safety',
    sourceChecklistItemKey: 'ard_simulated_power_failure',
    severity: 'safety_critical',
    assignedTechnicianId: 'tech_002',
    assignedTechnicianName: 'Anil Gaikwad (Electrical Lead)',
    resolutionStatus: 'open',
    hardBlockHandoverFlag: true,
    photos: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2026-08-14 12:15 IST'
  },
  {
    id: 'snag_101_2',
    jobId: 'job_2026_101',
    snagCode: 'SNAG-101-02',
    title: 'Landing Door Operator Mechanical Hiss / Acoustic Vibration at 3rd Floor',
    description: 'Minor acoustic friction hum during door opening at 3rd floor landing. Mechanical belt tension alignment required.',
    sourceChecklist: 'mechanical',
    sourceChecklistItemKey: 'door_mechanism_smoothness',
    severity: 'functional',
    assignedTechnicianId: 'tech_001',
    assignedTechnicianName: 'Ramesh Patil',
    resolutionStatus: 'rework_in_progress',
    hardBlockHandoverFlag: false,
    photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'],
    createdAt: '2026-08-14 10:30 IST'
  },
  {
    id: 'snag_101_3',
    jobId: 'job_2026_101',
    snagCode: 'SNAG-101-03',
    title: 'Mirror Stainless Steel Cabin Panel Minor Protective Foil Scuff',
    description: 'Small hairline scuff mark on rear mirror SS panel protective plastic wrapping.',
    sourceChecklist: 'customer_walkthrough',
    sourceChecklistItemKey: 'cabin_aesthetic',
    severity: 'cosmetic',
    assignedTechnicianId: 'tech_001',
    assignedTechnicianName: 'Ramesh Patil',
    resolutionStatus: 'customer_waived_cosmetic',
    hardBlockHandoverFlag: false,
    customerWaivedReason: 'Customer acknowledged minor plastic wrapping scuff; stainless steel underneath is undamaged.',
    photos: [],
    createdAt: '2026-08-14 09:45 IST'
  }
];

export const initialOfferAgreements: OfferAgreementRecord[] = [
  {
    id: 'agr_2026_01',
    applicantId: 'app_2026_01',
    applicantName: 'Sanjay Tukaram Deshmukh',
    applicantPhone: '+91 98220 12345',
    role: 'technician',
    agreementTitle: 'Master Service Provider & SOP-Compliance Agreement (Technician Grade)',
    agreementDocumentText: `THIS INDEPENDENT SERVICE PROVIDER AGREEMENT ("Agreement") is executed between ALL INDIA ELEVATORS COMPANY ("AIEC"), represented by Mr. Prashant Vasant Wable, and Sanjay Tukaram Deshmukh ("Partner / Contractor").

1. SCOPE & ASSET-LIGHT ORCHESTRATION: Partner agrees to perform installation, mechanical erection, electrical wiring, and elevator maintenance services according to AIEC's digital SOP guidelines. AIEC provides digital lead aggregation, client invoicing, and milestone disbursement, but does not exercise direct employer liability.

2. NO-LIABILITY & INSURANCE RESPONSIBILITY: Partner acknowledges that as an independent technical contractor, Partner maintains personal accident insurance, site safety harness equipment, and wireman license compliance. AIEC bears no third-party tort or employer liability for site accidents caused by Partner's deviation from safety SOPs.

3. COMMISSION & MILESTONE PAYOUT:
- Mechanical Erection Milestone: ₹8,500 upon 100% SOP verification & QC clearance.
- Electrical Wiring & VFD Calibration: ₹6,500 upon trial-run signoff.
- Final Handover Bonus: ₹2,500 upon customer signoff with zero safety-critical defects.

4. DEDICATED TERRITORY: Primary assignment zone: Pune West & PCMC Elevator Corridors.

5. CANCELLATION & SOP VIOLATIONS: Any severe safety violation (e.g., working at height without harness or bypass of safety circuit) results in immediate suspension and loss of tier status.`,
    roleSpecificTerms: {
      commissionStructure: 'Standard Technician Milestone Payout (₹15,000 Total Base per Installation)',
      territoryAssigned: 'Pune West (Kothrud / Baner) & PCMC Corridor',
      sopLiabilityTerms: 'Independent Contractor Model — Safety Harness & Helmet Mandatory',
      insuranceTerms: 'Partner maintains independent group personal accident policy',
      version: '2026.V2_MH'
    },
    signatureData: {
      signedByName: 'Sanjay Tukaram Deshmukh',
      signedPhone: '+91 98220 12345',
      otpVerified: true,
      otpVerifiedAt: '2026-08-13T10:15:00Z',
      signedAt: '2026-08-13T10:16:00Z',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 40 T 170 30" stroke="%230E4B3D" stroke-width="3" fill="none"/></svg>'
    },
    status: 'signed_active',
    activationTriggeredFlag: true,
    activatedAt: '2026-08-13T10:16:00Z',
    createdDate: '2026-08-12'
  },
  {
    id: 'agr_2026_02',
    applicantId: 'app_2026_02',
    applicantName: 'Vikramaditya Rao',
    applicantPhone: '+91 98901 88776',
    role: 'surveyor',
    agreementTitle: 'Site Shaft Surveying & Dimensional Audit Partner Agreement',
    agreementDocumentText: `THIS SURVEYOR PARTNER AGREEMENT ("Agreement") is executed between ALL INDIA ELEVATORS COMPANY ("AIEC") and Vikramaditya Rao ("Survey Partner").

1. SCOPE: Perform pre-installation shaft dimensional audits, plumb-line verification, overhead clearance checks, and pit depth measurements using AIEC digital survey toolkit.

2. COMMISSION: ₹2,500 fixed payout per verified shaft survey submitted with high-precision photos and CAD drawing signoff.

3. TERRITORY: Chakan & Talegaon Industrial Corridor.`,
    roleSpecificTerms: {
      commissionStructure: '₹2,500 per verified survey + ₹500 travel allowance for outstation shafts',
      territoryAssigned: 'Chakan & Talegaon Industrial Hub',
      sopLiabilityTerms: 'Laser meter accuracy tolerance ±2mm required',
      insuranceTerms: 'Standard field survey coverage',
      version: '2026.V1_SURVEY'
    },
    status: 'pending_signature',
    activationTriggeredFlag: false,
    createdDate: '2026-08-13'
  }
];

export const initialPartnerTierAssignments: PartnerTierAssignmentRecord[] = [
  {
    id: 'tier_rec_01',
    partnerId: 'app_2026_01',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerPhone: '+91 98220 12345',
    role: 'technician',
    assignedTier: 'tier_3_gold',
    criteriaMet: {
      jobsCompletedCount: 28,
      safetyRating: 98.6,
      slaCompliancePercent: 96.5,
      certificationsVerifiedCount: 3,
      yearsInTrade: 8
    },
    tierDefaults: {
      commissionRateMultiplier: 1.15,
      paymentTerms: 'Immediate Net-0 Payout on QC Signoff',
      autonomyLevel: 'Independent Signoff up to ₹2,00,000'
    },
    changeHistory: [
      {
        id: 'hist_1',
        fromTier: 'tier_2_silver',
        toTier: 'tier_3_gold',
        effectiveDate: '2026-07-01',
        reason: 'Maintained >98% safety score across 25 consecutive installations',
        assignedBy: 'Mr. Prashant Vasant Wable'
      }
    ],
    effectiveDate: '2026-07-01',
    lastUpdated: '2026-08-01'
  },
  {
    id: 'tier_rec_02',
    partnerId: 'app_2026_02',
    partnerName: 'Vikramaditya Rao',
    partnerPhone: '+91 98901 88776',
    role: 'surveyor',
    assignedTier: 'tier_2_silver',
    criteriaMet: {
      jobsCompletedCount: 14,
      safetyRating: 95.0,
      slaCompliancePercent: 92.0,
      certificationsVerifiedCount: 2,
      yearsInTrade: 4
    },
    tierDefaults: {
      commissionRateMultiplier: 1.05,
      paymentTerms: 'Net-3 Weekly Payout Batch',
      autonomyLevel: 'Standard Shaft Audit Signoff'
    },
    changeHistory: [],
    effectiveDate: '2026-08-10',
    lastUpdated: '2026-08-10'
  }
];

export const initialMasterPartners: MasterPartnerDirectoryRecord[] = [
  {
    id: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerPhone: '+91 98220 12345',
    email: 'sanjay.deshmukh@aiec.in',
    roles: ['technician'],
    primaryRole: 'technician',
    activeStatus: 'active',
    tier: 'tier_3_gold',
    territoryOrSpecialty: 'Pune West (Kothrud / Baner)',
    zone: 'Pune West',
    rating: 4.9,
    completedJobsCount: 28,
    activeJobsCount: 2,
    activeLeadsCount: 0,
    activePosCount: 0,
    joinedDate: '2024-03-15',
    lastActive: '2026-08-13',
    kycVerified: true,
    wiremanLicenseVerified: true,
    bankAccountVerified: true
  },
  {
    id: 'p_002',
    partnerName: 'Vikramaditya Rao',
    partnerPhone: '+91 98901 88776',
    email: 'vikram.rao@aiec.in',
    roles: ['surveyor'],
    primaryRole: 'surveyor',
    activeStatus: 'active',
    tier: 'tier_2_silver',
    territoryOrSpecialty: 'Chakan & Talegaon Industrial Corridor',
    zone: 'Chakan',
    rating: 4.7,
    completedJobsCount: 14,
    activeJobsCount: 1,
    activeLeadsCount: 3,
    activePosCount: 0,
    joinedDate: '2025-01-10',
    lastActive: '2026-08-12',
    kycVerified: true,
    wiremanLicenseVerified: false,
    bankAccountVerified: true
  },
  {
    id: 'p_003',
    partnerName: 'Shivshankar Elevator Drives Ltd',
    partnerPhone: '+91 94220 99881',
    email: 'orders@shivshankardrives.com',
    roles: ['supplier'],
    primaryRole: 'supplier',
    activeStatus: 'active',
    tier: 'tier_4_master',
    territoryOrSpecialty: 'VFD Drives & Control Panels',
    zone: 'Maharashtra State',
    rating: 4.95,
    completedJobsCount: 42,
    activeJobsCount: 0,
    activeLeadsCount: 0,
    activePosCount: 4,
    joinedDate: '2023-08-01',
    lastActive: '2026-08-13',
    kycVerified: true,
    bankAccountVerified: true
  },
  {
    id: 'p_004',
    partnerName: 'Rajesh Ramesh Patil',
    partnerPhone: '+91 97654 32100',
    email: 'rajesh.patil@aiec.in',
    roles: ['technician', 'surveyor'], // Spans multiple roles over time
    primaryRole: 'technician',
    activeStatus: 'active',
    tier: 'tier_2_silver',
    territoryOrSpecialty: 'PCMC & Bhosari Belt',
    zone: 'PCMC',
    rating: 4.6,
    completedJobsCount: 19,
    activeJobsCount: 1,
    activeLeadsCount: 1,
    activePosCount: 0,
    joinedDate: '2024-09-20',
    lastActive: '2026-08-11',
    kycVerified: true,
    wiremanLicenseVerified: true,
    bankAccountVerified: true
  },
  {
    id: 'p_005',
    partnerName: 'Milind Ganesh Kulkarni',
    partnerPhone: '+91 98231 11223',
    email: 'milind.kulkarni@aiec.in',
    roles: ['sales_rep'],
    primaryRole: 'sales_rep',
    activeStatus: 'active',
    tier: 'tier_3_gold',
    territoryOrSpecialty: 'Hadapsar & Kharadi Commercial',
    zone: 'Hadapsar',
    rating: 4.8,
    completedJobsCount: 31,
    activeJobsCount: 0,
    activeLeadsCount: 5,
    activePosCount: 0,
    joinedDate: '2024-02-01',
    lastActive: '2026-08-13',
    kycVerified: true,
    bankAccountVerified: true
  },
  {
    id: 'p_006',
    partnerName: 'Anand Shinde',
    partnerPhone: '+91 98902 44332',
    email: 'anand.shinde@aiec.in',
    roles: ['technician'],
    primaryRole: 'technician',
    activeStatus: 'deactivated',
    tier: 'tier_1_bronze',
    territoryOrSpecialty: 'Pune South / Katraj',
    zone: 'Pune South',
    rating: 3.8,
    completedJobsCount: 6,
    activeJobsCount: 0,
    activeLeadsCount: 0,
    activePosCount: 0,
    joinedDate: '2025-05-10',
    lastActive: '2026-06-01',
    kycVerified: true,
    wiremanLicenseVerified: false,
    bankAccountVerified: true
  }
];

export const initialPartnerExitRecords: PartnerDeactivationExitRecord[] = [
  {
    id: 'exit_2026_01',
    partnerId: 'p_006',
    partnerName: 'Anand Shinde',
    partnerPhone: '+91 98902 44332',
    roles: ['technician'],
    exitType: 'voluntary',
    exitReason: 'Relocating to hometown in Satara due to family business.',
    involuntaryFlag: false,
    immediateAccessRevocation: false,
    reassignmentActions: [
      {
        id: 're_01',
        type: 'job',
        itemId: 'JOB-2026-104',
        itemTitle: 'Kothrud Commercial Lift #2 Maintenance',
        currentRole: 'technician',
        assignedToPartnerId: 'p_001',
        assignedToPartnerName: 'Sanjay Tukaram Deshmukh',
        handoffNotes: 'Reassigned guide rail alignment check to Sanjay. Handoff notes recorded.',
        status: 'reassigned'
      }
    ],
    finalSettlement: {
      pendingCommissionsAmount: 8500,
      retentionHoldDeduction: 0,
      damageDeductions: 500,
      netSettlementAmount: 8000,
      calculationBreakdownNote: 'Final AMC milestone payout ₹8,500 minus ₹500 safety harness kit return fee.',
      isDisputed: false,
      settlementStatus: 'paid_and_settled',
      payoutTransactionRef: 'UPI/20260715/998123',
      settledAt: '2026-07-15T14:30:00Z'
    },
    exitInterviewFeedback: {
      satisfactionScore: 4,
      reasonsForLeaving: 'Personal relocation to family farm in Satara.',
      suggestionsNote: 'AIEC digital SOP app is excellent. Would rejoin if expanding to Satara.',
      wouldRecommendAiec: true
    },
    accessRevokedTimestamp: '2026-07-15T15:00:00Z',
    status: 'fully_deactivated',
    createdDate: '2026-07-12'
  }
];

export const initialTrainingModules: TrainingModule[] = [
  {
    id: 'tm_001',
    moduleTitle: 'AIEC Digital SOP & Field App Onboarding',
    moduleTitleHi: 'AIEC डिजिटल एसओपी और फ़ील्ड ऐप ऑनबोर्डिंग',
    moduleTitleMr: 'AIEC डिजिटल SOP आणि फील्ड ॲप ऑनबोर्डिंग',
    topic: 'onboarding_basics',
    requiredForRoles: ['surveyor', 'technician', 'supplier', 'sales_rep'],
    isSafetyCritical: false,
    version: 'v2.4 (2026 Updated)',
    estimatedMinutes: 20,
    downloadableContentAvailable: true,
    lessons: [
      {
        id: 'les_101',
        trainingModuleId: 'tm_001',
        lessonTitle: 'Navigating AIEC Mobile App & Offline Check-In',
        lessonTitleHi: 'AIEC मोबाइल ऐप और ऑफलाइन चेक-इन का उपयोग',
        lessonTitleMr: 'AIEC मोबाईल ॲप आणि ऑफलाईन चेक-इन वापरणे',
        description: 'How to report on-site attendance, check job dispatch notifications, and operate without cell service.',
        durationMinutes: 8,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
        referenceSheetTitle: 'AIEC Field App Quick Reference Sheet',
        referenceSheetContent: `1. Tap "Check-In" within 50m of elevator shaft GPS location.\n2. In offline mode, all photo evidence is cached locally on device.\n3. Sync automatically triggers upon regaining 4G/WiFi connectivity.\n4. Contact Field Support Hotline: +91 20 6712 9900 for app lockouts.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v2.4',
        knowledgeChecks: [
          {
            id: 'kc_101_1',
            timestampSeconds: 120,
            question: 'What happens when you take evidence photos in offline mode during a shaft inspection?',
            questionHi: 'शाफ्ट निरीक्षण के दौरान ऑफलाइन मोड में फोटो लेने पर क्या होता है?',
            questionMr: 'शाफ्ट तपासणीदरम्यान ऑफलाईन मोडमध्ये फोटो काढल्यास काय होते?',
            options: [
              'Photos are discarded and lost permanently',
              'Photos are stored locally on device and auto-uploaded when network connects',
              'The app crashes and locks the job',
              'You must restart your phone'
            ],
            optionsHi: [
              'फोटो हटा दिए जाते हैं',
              'फोटो डिवाइस में सेव रहते हैं और नेटवर्क मिलने पर ऑटो-अपलोड हो जाते हैं',
              'ऐप क्रैश हो जाता है',
              'फ़ोन रीस्टार्ट करना पड़ता है'
            ],
            optionsMr: [
              'फोटो डिलीट होतात',
              'फोटो डिव्हाइसवर सुरक्षित राहतात आणि नेटवर्क आल्यावर आपोआप अपलोड होतात',
              'ॲप क्रॅश होते',
              'फोन रीस्टार्ट करावा लागतो'
            ],
            correctOptionIndex: 1,
            explanation: 'AIEC mobile app features offline caching so field data is never lost due to bad reception.'
          }
        ]
      },
      {
        id: 'les_102',
        trainingModuleId: 'tm_001',
        lessonTitle: 'E-Signatures & Customer Milestone Sign-Offs',
        description: 'Protocols for capturing client sign-offs during site readiness and final completion walk-throughs.',
        durationMinutes: 12,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600',
        referenceSheetTitle: 'Milestone Sign-Off Checklist',
        referenceSheetContent: `• Ensure client reviews shaft survey parameters before signing.\n• Obtain digital signature on screen.\n• Provide physical paper copy if requested by building secretary.\n• Timestamp and photo geotag are appended to digital certificate.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v2.4',
        knowledgeChecks: [
          {
            id: 'kc_102_1',
            timestampSeconds: 180,
            question: 'Whose digital signature is required before material unboxing on-site?',
            options: [
              'Only the delivery truck driver',
              'Building Secretary / Authorized Site Representative & AIEC Technician',
              'No signature is required',
              'Elevator Inspector General'
            ],
            correctOptionIndex: 1,
            explanation: 'Both the site representative and AIEC lead technician must sign off to confirm material receipt.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm_002',
    moduleTitle: 'Elevator Pit & High-Voltage Electrical Safety Standard (Mandatory)',
    moduleTitleHi: 'लिफ्ट पिट और हाई-वोल्टेज इलेक्ट्रिकल सुरक्षा मानक (अनिवार्य)',
    moduleTitleMr: 'लिफ्ट खड्डा व हाय-व्होल्टेज इलेक्ट्रिकल सुरक्षा मानक (अनिवार्य)',
    topic: 'safety_procedures',
    requiredForRoles: ['technician', 'surveyor'],
    isSafetyCritical: true,
    version: 'v3.1 (IS 14665 Compliance)',
    estimatedMinutes: 35,
    downloadableContentAvailable: true,
    lessons: [
      {
        id: 'les_201',
        trainingModuleId: 'tm_002',
        lessonTitle: 'LOTO (Lockout / Tagout) & Main Power Isolation',
        description: 'Step-by-step procedure to isolate 415V 3-phase power supply before pit entry or panel inspection.',
        durationMinutes: 15,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
        referenceSheetTitle: 'LOTO Standard Safety SOP',
        referenceSheetContent: `1. Notify building manager of power shutdown.\n2. Open main breaker in machine room.\n3. Apply padlock and warning tag "DANGER - WORK IN PROGRESS".\n4. Verify zero voltage using calibrated multimeter across all 3 phases (R-Y-B).\n5. Test line side vs load side.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v3.1',
        knowledgeChecks: [
          {
            id: 'kc_201_1',
            timestampSeconds: 210,
            question: 'How do you confirm electrical power is fully isolated after applying LOTO lock?',
            options: [
              'Assume it is off if the indicator light goes out',
              'Test all 3 phases with a calibrated multimeter to confirm zero voltage',
              'Touch wires quickly with bare hand',
              'Ask the security guard'
            ],
            correctOptionIndex: 1,
            explanation: 'Zero voltage verification with a calibrated multimeter across all phases is mandatory under IS 14665 standards.'
          }
        ]
      },
      {
        id: 'les_202',
        trainingModuleId: 'tm_002',
        lessonTitle: 'Pit Ladder Entry, Stop Switch & Harness Anchoring',
        description: 'Safe pit entry procedures, checking pit stop switch, and securing fall protection harness.',
        durationMinutes: 20,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
        referenceSheetTitle: 'Pit Entry Safety Checklist',
        referenceSheetContent: `• Test pit emergency stop button BEFORE descending ladder.\n• Keep pit light ON at all times.\n• Wear full-body safety harness hooked to certified pit lifeline.\n• Inspect pit buffer springs and oil level.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v3.1',
        knowledgeChecks: [
          {
            id: 'kc_202_1',
            timestampSeconds: 300,
            question: 'What is the FIRST action when entering an elevator pit?',
            options: [
              'Clean debris from pit floor',
              'Press pit emergency stop switch to prevent elevator movement',
              'Turn off the pit light',
              'Remove safety helmet'
            ],
            correctOptionIndex: 1,
            explanation: 'Activating the pit emergency stop switch immediately prevents accidental car movement from above.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm_003',
    moduleTitle: 'Precision Shaft Dimensional Surveying & Plumb Line Setup',
    moduleTitleHi: 'शाफ्ट सटीक आयाम सर्वेक्षण और प्लंब लाइन सेटअप',
    moduleTitleMr: 'शाफ्ट तंतोतंत मोजमाप सर्वेक्षण व प्लंब लाईन सेटअप',
    topic: 'product_knowledge',
    requiredForRoles: ['surveyor'],
    isSafetyCritical: false,
    sequenceLockDependency: 'tm_002',
    sequenceLockDependencyTitle: 'Elevator Pit & High-Voltage Electrical Safety Standard (Mandatory)',
    version: 'v1.8',
    estimatedMinutes: 25,
    downloadableContentAvailable: true,
    lessons: [
      {
        id: 'les_301',
        trainingModuleId: 'tm_003',
        lessonTitle: 'Laser Measurement & Shaft Plumb Error Verification',
        description: 'Using 3D laser meters to capture pit depth, overhead clearance, and guide rail bracket plumb alignment.',
        durationMinutes: 15,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600',
        referenceSheetTitle: 'Shaft Survey Measurement SOP',
        referenceSheetContent: `• Measure shaft width (X) and depth (Y) at pit, middle floor, and top floor.\n• Check vertical tilt angle (maximum allowable deviation: +/- 15mm over 30m rise).\n• Record machine room floor beam thickness and hook loading capacity.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v1.8',
        knowledgeChecks: [
          {
            id: 'kc_301_1',
            timestampSeconds: 240,
            question: 'What is the maximum allowable shaft plumb deviation over a 30m total rise?',
            options: [
              '50 mm',
              '15 mm',
              '100 mm',
              '0 mm (Must be absolute zero)'
            ],
            correctOptionIndex: 1,
            explanation: 'Maximum allowable deviation is +/- 15mm across a 30m rise for smooth elevator guide rail tracking.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm_004',
    moduleTitle: 'Gearless PM Motor & VFD Drive Tuning Standard',
    moduleTitleHi: 'गियरलेस पीएम मोटर और वीएफडी ड्राइव ट्यूनिंग मानक',
    moduleTitleMr: 'गिअरलेस पीएम मोटर व व्हीएफडी ड्राईव्ह ट्यूनिंग मानक',
    topic: 'product_knowledge',
    requiredForRoles: ['technician'],
    isSafetyCritical: false,
    sequenceLockDependency: 'tm_002',
    sequenceLockDependencyTitle: 'Elevator Pit & High-Voltage Electrical Safety Standard (Mandatory)',
    version: 'v2.1',
    estimatedMinutes: 30,
    downloadableContentAvailable: true,
    lessons: [
      {
        id: 'les_401',
        trainingModuleId: 'tm_004',
        lessonTitle: 'Permanent Magnet Synchronous Motor Auto-Tuning & Encoder Calibration',
        description: 'Connecting VFD keypad, running static auto-tune on PMSM motor, and calibrating absolute rotary encoder.',
        durationMinutes: 18,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoywatches.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600',
        referenceSheetTitle: 'VFD PMSM Auto-Tune Quick Sheet',
        referenceSheetContent: `1. Ensure main mechanical brake is engaged.\n2. Input motor nameplate data (kW, Amps, RPM, Poles).\n3. Set Parameter P0.02 = 1 (Static Auto-Tune).\n4. Press RUN on VFD keypad and monitor current draw.\n5. Save encoder offset angle into drive flash memory.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v2.1',
        knowledgeChecks: [
          {
            id: 'kc_401_1',
            timestampSeconds: 280,
            question: 'Must the mechanical brake remain closed during static motor auto-tuning?',
            options: [
              'Yes, mechanical brake must remain closed during static auto-tuning',
              'No, brake must be manually opened',
              'It does not matter',
              'Remove the motor ropes first'
            ],
            correctOptionIndex: 0,
            explanation: 'Static auto-tuning tests stator resistance and inductance with the rotor locked by mechanical brake.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm_005',
    moduleTitle: 'OEM Component Packaging, QC & Dispatch SOP',
    moduleTitleHi: 'ओईएम घटक पैकेजिंग, क्यूसी और प्रेषण एसओपी',
    moduleTitleMr: 'ओईएम घटक पॅकेजिंग, क्यूसी आणि पाठवणी SOP',
    topic: 'product_knowledge',
    requiredForRoles: ['supplier'],
    isSafetyCritical: false,
    version: 'v1.5',
    estimatedMinutes: 20,
    downloadableContentAvailable: true,
    lessons: [
      {
        id: 'les_501',
        trainingModuleId: 'tm_005',
        lessonTitle: 'Crating, Anti-Rust VCI Foil Wrapping & Dispatch Documentation',
        description: 'Factory packaging standards for guide rails, drive panels, and car frames to prevent transport damage.',
        durationMinutes: 12,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
        referenceSheetTitle: 'OEM Packaging Inspection SOP',
        referenceSheetContent: `• Wrap electronic panels in VCI moisture-barrier vacuum bags.\n• Anchor guide rails in wooden crates with steel strapping.\n• Attach QR Code dispatch tags to each crate.\n• Upload factory pre-dispatch QC photos to AIEC supplier portal.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v1.5',
        knowledgeChecks: [
          {
            id: 'kc_501_1',
            timestampSeconds: 150,
            question: 'Why is VCI vacuum foil wrapping required for elevator control panels during monsoon shipping?',
            options: [
              'To make the package look attractive',
              'To prevent moisture ingress, PCB oxidation, and corrosion during transit',
              'To save shipping weight',
              'It is optional'
            ],
            correctOptionIndex: 1,
            explanation: 'VCI (Vapor Corrosion Inhibitor) protects sensitive electronic controllers from high humidity during transit.'
          }
        ]
      }
    ]
  },
  {
    id: 'tm_006',
    moduleTitle: 'Client Communication & Escalation Protocols',
    moduleTitleHi: 'ग्राहक संचार और एस्केलेशन प्रोटोकॉल',
    moduleTitleMr: 'ग्राहक संवाद व एस्केलेशन प्रोटोकॉल',
    topic: 'customer_interaction',
    requiredForRoles: ['surveyor', 'technician', 'sales_rep'],
    isSafetyCritical: false,
    version: 'v2.0',
    estimatedMinutes: 15,
    downloadableContentAvailable: true,
    lessons: [
      {
        id: 'les_601',
        trainingModuleId: 'tm_006',
        lessonTitle: 'Professional On-Site Conduct & Handling Site Delays',
        description: 'Communication guidelines when building work or power unavailability delays installation progress.',
        durationMinutes: 10,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600',
        referenceSheetTitle: 'Client Courtesy Protocol',
        referenceSheetContent: `• Wear full AIEC uniform with ID badge visible at all times.\n• Maintain clean workspace; clear wire trimmings daily.\n• Log site delay reports directly in app with timestamped photo.\n• Never debate pricing or contract scope with building residents; direct to Project Manager.`,
        languageTracks: ['en', 'hi', 'mr'],
        version: 'v2.0',
        knowledgeChecks: [
          {
            id: 'kc_601_1',
            timestampSeconds: 120,
            question: 'What is the correct protocol if a resident complains about noise during work hours?',
            options: [
              'Argue back and tell them it is necessary',
              'Politely listen, inform them of agreed work hours, and report to AIEC Project Manager',
              'Immediately leave the site',
              'Ignore the resident completely'
            ],
            correctOptionIndex: 1,
            explanation: 'Polite listening while directing scope or policy questions to the Project Manager upholds AIEC professional standards.'
          }
        ]
      }
    ]
  }
];

export const initialPartnerModuleProgress: PartnerModuleProgress[] = [
  {
    partnerId: 'p_001', // Sanjay Tukaram Deshmukh (Technician)
    moduleId: 'tm_001',
    status: 'completed',
    completionPercent: 100,
    lastAccessedAt: '2026-08-01',
    lessonProgress: {
      'les_101': { lessonId: 'les_101', playbackProgressSeconds: 480, completed: true, knowledgeCheckResponses: { 'kc_101_1': 1 }, completedAt: '2026-08-01' },
      'les_102': { lessonId: 'les_102', playbackProgressSeconds: 720, completed: true, knowledgeCheckResponses: { 'kc_102_1': 1 }, completedAt: '2026-08-01' }
    }
  },
  {
    partnerId: 'p_001',
    moduleId: 'tm_002',
    status: 'completed',
    completionPercent: 100,
    lastAccessedAt: '2026-08-05',
    lessonProgress: {
      'les_201': { lessonId: 'les_201', playbackProgressSeconds: 900, completed: true, knowledgeCheckResponses: { 'kc_201_1': 1 }, completedAt: '2026-08-04' },
      'les_202': { lessonId: 'les_202', playbackProgressSeconds: 1200, completed: true, knowledgeCheckResponses: { 'kc_202_1': 1 }, completedAt: '2026-08-05' }
    }
  },
  {
    partnerId: 'p_001',
    moduleId: 'tm_004',
    status: 'in_progress',
    completionPercent: 50,
    lastAccessedAt: '2026-08-12',
    lessonProgress: {
      'les_401': { lessonId: 'les_401', playbackProgressSeconds: 300, completed: false, knowledgeCheckResponses: {}, completedAt: undefined }
    }
  },
  {
    partnerId: 'p_002', // Vikramaditya Rao (Surveyor)
    moduleId: 'tm_001',
    status: 'completed',
    completionPercent: 100,
    lastAccessedAt: '2026-07-20',
    lessonProgress: {
      'les_101': { lessonId: 'les_101', playbackProgressSeconds: 480, completed: true, knowledgeCheckResponses: { 'kc_101_1': 1 }, completedAt: '2026-07-20' },
      'les_102': { lessonId: 'les_102', playbackProgressSeconds: 720, completed: true, knowledgeCheckResponses: { 'kc_102_1': 1 }, completedAt: '2026-07-20' }
    }
  },
  {
    partnerId: 'p_002',
    moduleId: 'tm_002',
    status: 'in_progress',
    completionPercent: 50,
    lastAccessedAt: '2026-08-10',
    lessonProgress: {
      'les_201': { lessonId: 'les_201', playbackProgressSeconds: 900, completed: true, knowledgeCheckResponses: { 'kc_201_1': 1 }, completedAt: '2026-08-10' },
      'les_202': { lessonId: 'les_202', playbackProgressSeconds: 0, completed: false, knowledgeCheckResponses: {} }
    }
  }
];

export const initialSopDocuments: SopDocument[] = [
  {
    id: 'sop_001',
    sopCode: 'SOP-ELEV-SAFETY-01',
    title: 'IS 14665 Elevator Shaft & Pit High-Voltage Isolation SOP',
    titleHi: 'IS 14665 लिफ्ट शाफ्ट और पिट हाई-वोल्टेज पृथक्करण एसओपी',
    titleMr: 'IS 14665 लिफ्ट शाफ्ट आणि खड्डा हाय-व्होल्टेज विलगीकरण SOP',
    category: 'safety',
    currentVersion: 'v3.1',
    effectiveDate: '2026-01-15',
    lastReviewedBy: 'Mr. Prashant Vasant Wable (Chief Inspector)',
    downloadAvailableFlag: true,
    isBookmarked: true,
    isDownloadedOffline: true,
    summary: 'Standard Operating Procedure governing 415V 3-phase power isolation, LOTO padlocking, zero-voltage testing, and pit harness anchoring before shaft entry.',
    sections: [
      {
        sectionTitle: '1. Machine Room Isolation & LOTO Padlock',
        content: 'Identify main circuit breaker supplying 415V AC 3-phase power to elevator controller. Switch off breaker, apply red safety padlock with personal warning tag stating "DANGER - WORK IN PROGRESS". Keep key in technician safety pouch.',
        keyCheckpoints: [
          'Verify zero voltage across all 3 phases (R-Y, Y-B, B-R) using calibrated multimeter.',
          'Verify line side vs load side isolation.'
        ]
      },
      {
        sectionTitle: '2. Pit Emergency Stop & Pit Ladder Entry',
        content: 'Open lowest landing door with emergency key. Reach inside pit to press emergency red stop button BEFORE placing foot on pit ladder. Turn on pit illumination switch.',
        keyCheckpoints: [
          'Verify pit stop button latches securely.',
          'Ensure double-lifeline fall protection harness is anchored to overhead beam.'
        ]
      }
    ],
    versionHistory: [
      { version: 'v3.1', releaseDate: '2026-01-15', summaryOfChanges: 'Updated for IS 14665:2025 compliance with mandatory calibrated multimeter verification.', author: 'AIEC Safety Cell' },
      { version: 'v3.0', releaseDate: '2025-06-01', summaryOfChanges: 'Initial release for digital mobile check-in.', author: 'Engineering Dept' }
    ]
  },
  {
    id: 'sop_002',
    sopCode: 'SOP-ELEV-INST-04',
    title: 'Gearless PMSM Motor & VFD Drive Tuning Procedure',
    titleHi: 'गियरलेस पीएमएसएम मोटर और वीएफडी ड्राइव ट्यूनिंग प्रक्रिया',
    titleMr: 'गिअरलेस PMSM मोटर व व्हीएफडी ड्राईव्ह ट्यूनिंग प्रक्रिया',
    category: 'installation',
    currentVersion: 'v2.1',
    effectiveDate: '2026-03-10',
    lastReviewedBy: 'Technician Lead Sanjay Deshmukh',
    downloadAvailableFlag: true,
    isBookmarked: false,
    isDownloadedOffline: false,
    summary: 'Technical SOP detailing static motor auto-tuning, absolute rotary encoder offset calculation, and ride quality curve optimization on Monarch / Inovance drives.',
    sections: [
      {
        sectionTitle: '1. PMSM Motor Nameplate Data Entry',
        content: 'In VFD keypad menu, input motor rated capacity (kW), rated voltage, rated current (Amps), rated frequency (Hz), and number of magnetic poles (e.g., 16 or 20 poles).',
        keyCheckpoints: ['Cross-check drive capacity matches motor Amps with 1.2x headroom margin.']
      },
      {
        sectionTitle: '2. Static Auto-Tuning Execution',
        content: 'Ensure mechanical brakes remain closed. Set VFD parameter P0.02 = 1. Initiate RUN command. Drive injects high-frequency current to measure stator inductance.',
        keyCheckpoints: ['Observe zero rotor rotation during test.', 'Record calculated encoder initial angle in drive flash.']
      }
    ],
    versionHistory: [
      { version: 'v2.1', releaseDate: '2026-03-10', summaryOfChanges: 'Added Monarch NICE3000+ encoder offset calibration notes.', author: 'R&D Division' }
    ]
  },
  {
    id: 'sop_003',
    sopCode: 'SOP-ELEV-SURV-02',
    title: 'Shaft 3D Laser Dimensional & Plumb Deviation Survey',
    titleHi: 'शाफ्ट 3डी लेजर आयाम और प्लंब विचलन सर्वेक्षण',
    titleMr: 'शाफ्ट 3D लेझर मोजमाप आणि प्लंब विचलन सर्वेक्षण',
    category: 'shaft_survey',
    currentVersion: 'v1.8',
    effectiveDate: '2026-02-01',
    lastReviewedBy: 'Senior Surveyor Vikramaditya Rao',
    downloadAvailableFlag: true,
    isBookmarked: fontIsBookmarked('sop_003'),
    isDownloadedOffline: true,
    summary: 'Surveyor SOP for capturing pit depth, overhead clearance, wall plumb deviation, and bracket spacing using 3D laser meters and digital plumb tools.',
    sections: [
      {
        sectionTitle: '1. 3D Laser Grid Setup',
        content: 'Position self-leveling green 3D laser at center of shaft floor. Measure distances X1, X2, Y1, Y2 from shaft center to wall faces at pit level, mid-floor, and machine room slab.',
        keyCheckpoints: [
          'Max allowable plumb tilt deviation: +/- 15mm across 30m rise.',
          'Verify minimum pit depth (1500mm standard).'
        ]
      }
    ],
    versionHistory: [
      { version: 'v1.8', releaseDate: '2026-02-01', summaryOfChanges: 'Included automatic mobile app geotag verification.', author: 'Survey Cell' }
    ]
  },
  {
    id: 'sop_004',
    sopCode: 'SOP-ELEV-DELIV-01',
    title: 'OEM Component Unboxing, VCI Moisture Check & Material Receipt',
    titleHi: 'ओईएम घटक अनबॉक्सिंग, वीसीआई नमी जांच और सामग्री प्राप्ति',
    titleMr: 'ओईएम घटक अनबॉक्सिंग, VCI ओलावा तपासणी व साहित्य पावती',
    category: 'delivery',
    currentVersion: 'v1.5',
    effectiveDate: '2026-04-20',
    lastReviewedBy: 'Logistics Head Anil Kulkarni',
    downloadAvailableFlag: true,
    isBookmarked: false,
    isDownloadedOffline: false,
    summary: 'SOP for receiving guide rail crates, inspecting control panel VCI anti-rust foil bags, and recording digital material received confirmations.',
    sections: [
      {
        sectionTitle: '1. Unboxing & Moisture Inspection',
        content: 'Inspect VCI vacuum bags around main drive panel for punctures or humidity condensation. Verify guide rail straightness with 1m straightedge.',
        keyCheckpoints: ['Capture 4-angle unboxing photos via app.', 'Report any rust or transit dents within 2 hours.']
      }
    ],
    versionHistory: [
      { version: 'v1.5', releaseDate: '2026-04-20', summaryOfChanges: 'Updated claim window from 24h to 2h.', author: 'Supply Chain Dept' }
    ]
  }
];

function fontIsBookmarked(id: string): boolean {
  return id === 'sop_003';
}

export const initialCertificationAssessments: CertificationAssessment[] = [
  {
    id: 'assess_001',
    moduleId: 'tm_002',
    badgeIdToAward: 'badge_safety_master',
    title: 'IS 14665 Elevator Electrical Safety & LOTO Certification Assessment',
    titleHi: 'IS 14665 लिफ्ट इलेक्ट्रिकल सुरक्षा और एलओटीओ प्रमाणन मूल्यांकन',
    titleMr: 'IS 14665 लिफ्ट इलेक्ट्रिकल सुरक्षा व LOTO प्रमाणपत्र मूल्यांकन',
    passThresholdPercent: 80,
    timeLimitMinutes: 15,
    retakeCooldownHours: 4,
    isSafetyCritical: true,
    questions: [
      {
        id: 'q_01',
        questionText: 'According to IS 14665 standards, what is the mandatory step immediately after opening the main power breaker under LOTO protocols?',
        questionTextHi: 'IS 14665 मानकों के अनुसार, LOTO प्रोटोकॉल के तहत मुख्य पावर ब्रेकर खोलने के तुरंत बाद अनिवार्य कदम क्या है?',
        questionTextMr: 'IS 14665 मानकांनुसार, LOTO मानकांखाली मुख्य पॉवर ब्रेकर उघडल्यानंतर लगेचच कोणती अनिवार्य पायरी आहे?',
        options: [
          'Assume power is disconnected and touch busbars',
          'Apply a red LOTO padlock and verify zero voltage across all 3 phases with a calibrated multimeter',
          'Turn on the elevator cab light',
          'Inform the security guard'
        ],
        optionsHi: [
          'मान लें कि बिजली बंद है',
          'लाल LOTO ताला लगाएं और कैलिब्रेटेड मल्टीमीटर से तीनों चरणों में शून्य वोल्टेज की पुष्टि करें',
          'कैब लाइट चालू करें',
          'सुरक्षा गार्ड को बताएं'
        ],
        optionsMr: [
          'वीज बंद आहे असे गृहीत धरा',
          'लाल LOTO कुलूप लावा आणि कॅलिब्रेटेड मल्टिमीटरने तिन्ही टप्प्यांमध्ये शून्य व्होल्टेजची खात्री करा',
          'कॅब लाईट सुरू करा',
          'सुरक्षा रक्षकाला सांगा'
        ],
        correctOptionIndex: 1,
        explanation: 'Applying LOTO lock + zero voltage testing with a calibrated multimeter is the mandatory standard.'
      },
      {
        id: 'q_02',
        questionText: 'What is the required rating for the full-body safety harness lifeline used during elevator pit entry?',
        questionTextHi: 'लिफ्ट पिट में प्रवेश के दौरान उपयोग किए जाने वाले सेफ्टी हार्नेस लाइफलाइन की आवश्यक रेटिंग क्या है?',
        questionTextMr: 'लिफ्ट खड्ड्यात प्रवेश करताना वापरल्या जाणाऱ्या सेफ्टी हार्नेस लाईफलाईनचे आवश्यक रेटिंग काय आहे?',
        options: [
          '100 kg test line',
          'Certified for minimum 15 kN (approx 1500 kg) breaking strength',
          'Standard nylon rope',
          'No harness required'
        ],
        correctOptionIndex: 1,
        explanation: 'Industrial fall arrest harnesses must comply with EN 361 / IS 3521 supporting 15 kN breaking load.'
      },
      {
        id: 'q_03',
        questionText: 'Before entering an elevator pit from the lowest floor, which switch MUST be activated first?',
        options: [
          'Machine room light switch',
          'Pit Emergency Red Stop Switch',
          'Fan switch',
          'Intercom switch'
        ],
        correctOptionIndex: 1,
        explanation: 'Pressing the pit red stop switch immediately disables car movement from control logic.'
      },
      {
        id: 'q_04',
        questionText: 'What is the maximum allowable voltage between neutral and earth in a machine room power distribution panel?',
        options: [
          'Less than 2.0 V AC',
          '50 V AC',
          '110 V AC',
          'No limit'
        ],
        correctOptionIndex: 0,
        explanation: 'Neutral-to-earth voltage must be < 2.0V AC to prevent electronic VFD noise and shock hazards.'
      },
      {
        id: 'q_05',
        questionText: 'In case of an electrical fire in the control panel, which fire extinguisher class MUST be used?',
        options: [
          'Water extinguisher (Class A)',
          'Carbon Dioxide (CO2) or Clean Agent / Dry Chemical Powder (Class C/E)',
          'Foam extinguisher',
          'Bucket of sand'
        ],
        correctOptionIndex: 1,
        explanation: 'CO2 or Dry Chemical Powder extinguishers are non-conductive and mandatory for electrical fires.'
      }
    ]
  },
  {
    id: 'assess_002',
    moduleId: 'tm_004',
    badgeIdToAward: 'badge_vfd_master',
    title: 'PMSM Gearless Motor & VFD Drive Tuning Specialist Certification',
    titleHi: 'पीएमएसएम गियरलेस मोटर और वीएफडी ड्राइव ट्यूनिंग विशेषज्ञ प्रमाणन',
    titleMr: 'PMSM गिअरलेस मोटर व व्हीएफडी ड्राईव्ह ट्यूनिंग तज्ज्ञ प्रमाणपत्र',
    passThresholdPercent: 80,
    timeLimitMinutes: 20,
    retakeCooldownHours: 2,
    isSafetyCritical: false,
    questions: [
      {
        id: 'q_201',
        questionText: 'During PMSM static auto-tuning, why must the mechanical brake remain securely closed?',
        options: [
          'To lock the rotor so drive measures stator inductance accurately without mechanical displacement',
          'To save battery life',
          'To prevent motor noise',
          'Brake should actually be opened'
        ],
        correctOptionIndex: 0,
        explanation: 'Static tuning injects high frequency test pulses without rotating the motor shaft.'
      },
      {
        id: 'q_202',
        questionText: 'Which encoder type is mandatory for gearless PMSM motor positioning in high-speed elevators?',
        options: [
          'Simple incremental 1024 PPR encoder',
          'Absolute EnDat or SinCos Encoder with initial angle calibration',
          'Optical limit switch',
          'Proximity sensor'
        ],
        correctOptionIndex: 1,
        explanation: 'PMSM gearless motors require absolute rotary encoders (EnDat/SinCos/UVW) for precise pole angle control.'
      }
    ]
  }
];

export const initialAssessmentAttempts: AssessmentAttemptResult[] = [
  {
    id: 'att_101',
    assessmentId: 'assess_001',
    partnerId: 'p_001',
    attemptNumber: 1,
    scoreAchievedPercent: 100,
    passed: true,
    answers: { 'q_01': 1, 'q_02': 1, 'q_03': 1, 'q_04': 0, 'q_05': 1 },
    completedAt: '2026-08-05T14:30:00Z'
  }
];

export const initialCertificationBadges: CertificationBadge[] = [
  {
    id: 'badge_safety_master',
    badgeCode: 'CERT-SAFE-01',
    badgeName: 'IS 14665 High-Voltage Safety Master',
    badgeNameHi: 'IS 14665 हाई-वोल्टेज सुरक्षा मास्टर',
    badgeNameMr: 'IS 14665 हाय-व्होल्टेज सुरक्षा मास्टर',
    category: 'safety',
    iconName: 'ShieldCheck',
    unlockedSkillTag: 'is_14665_high_voltage_certified',
    isTimeLimited: true,
    validityMonths: 12,
    description: 'Certified in 415V LOTO electrical safety, zero-voltage testing, and elevator pit emergency protocols under IS 14665.'
  },
  {
    id: 'badge_vfd_master',
    badgeCode: 'CERT-VFD-02',
    badgeName: 'PMSM Gearless & VFD Drive Tuning Specialist',
    badgeNameHi: 'पीएमएसएम गियरलेस और वीएफडी ड्राइव ट्यूनिंग विशेषज्ञ',
    badgeNameMr: 'PMSM गिअरलेस व व्हीएफडी ड्राईव्ह ट्यूनिंग तज्ज्ञ',
    category: 'technical',
    iconName: 'Cpu',
    unlockedSkillTag: 'vfd_auto_tune_master',
    isTimeLimited: false,
    description: 'Mastered PMSM static auto-tuning, absolute rotary encoder offset calibration, and Monarch drive setup.'
  },
  {
    id: 'badge_laser_surveyor',
    badgeCode: 'CERT-SURV-03',
    badgeName: '3D Laser Shaft Survey Certified',
    badgeNameHi: '3डी लेजर शाफ्ट सर्वेक्षण प्रमाणित',
    badgeNameMr: '3D लेझर शाफ्ट सर्वेक्षण प्रमाणित',
    category: 'survey',
    iconName: 'Compass',
    unlockedSkillTag: '3d_laser_survey_certified',
    isTimeLimited: false,
    description: 'Expertise in precision shaft plumb measurement, machine room overhead clearance, and laser grid alignment.'
  },
  {
    id: 'badge_quality_oem',
    badgeCode: 'CERT-OEM-04',
    badgeName: 'OEM VCI Packaging & Quality Assurance Inspector',
    badgeNameHi: 'ओईएम वीसीआई पैकेजिंग और गुणवत्ता आश्वासन निरीक्षक',
    badgeNameMr: 'ओईएम VCI पॅकेजिंग आणि गुणवत्ता खात्री निरीक्षक',
    category: 'quality',
    iconName: 'Award',
    unlockedSkillTag: 'oem_vci_qc_certified',
    isTimeLimited: false,
    description: 'Certified for anti-rust VCI moisture check, component unboxing QA, and digital receipt verification.'
  }
];

export const initialPartnerBadgeRecords: PartnerBadgeRecord[] = [
  {
    id: 'pbr_001',
    partnerId: 'p_001', // Sanjay Tukaram Deshmukh
    partnerName: 'Sanjay Tukaram Deshmukh',
    badgeId: 'badge_safety_master',
    issueDate: '2026-08-05',
    expiryDate: '2027-08-05',
    renewalStatus: 'active',
    certificateNumber: 'AIEC-CERT-982145'
  },
  {
    id: 'pbr_002',
    partnerId: 'p_002', // Vikramaditya Rao
    partnerName: 'Vikramaditya Rao',
    badgeId: 'badge_laser_surveyor',
    issueDate: '2026-07-20',
    expiryDate: undefined,
    renewalStatus: 'active',
    certificateNumber: 'AIEC-CERT-773190'
  }
];

export const initialSkillCapabilities: SkillCapabilityCategory[] = [
  {
    id: 'skill_pmsm_drive',
    skillName: 'Gearless PMSM & Monarch 3000+ Tuning',
    skillNameHi: 'गियरलेस पीएमएसएम और मोनाक 3000+ ट्यूनिंग',
    skillNameMr: 'गिअरलेस PMSM व मोनार्क 3000+ ट्यूनिंग',
    driveTypeTag: 'pmsm_gearless',
    qualifiedTechniciansCount: 14,
    pipelineDemandCount: 26,
    demandVsSupplyRatio: 1.86,
    trendDirection: 'critical_gap',
    recommendedTrainingModuleId: 'tm_004',
    category: 'drive_tech'
  },
  {
    id: 'skill_pit_safety',
    skillName: 'IS 14665 Pit Safety & Lockout-Tagout',
    skillNameHi: 'IS 14665 पिट सुरक्षा और लॉकआउट-टैगआउट',
    skillNameMr: 'IS 14665 खड्डा सुरक्षा आणि लॉकआउट-टॅगआउट',
    driveTypeTag: 'safety_standard',
    qualifiedTechniciansCount: 42,
    pipelineDemandCount: 45,
    demandVsSupplyRatio: 1.07,
    trendDirection: 'improving',
    recommendedTrainingModuleId: 'tm_002',
    category: 'safety'
  },
  {
    id: 'skill_laser_survey',
    skillName: '3D Laser Shaft Surveying & Plumb Checking',
    skillNameHi: '3डी लेजर शाफ्ट सर्वेक्षण और प्लंब चेकिंग',
    skillNameMr: '3D लेझर शाफ्ट सर्व्हेक्षण आणि प्लंब तपासणी',
    driveTypeTag: 'laser_3d_survey',
    qualifiedTechniciansCount: 18,
    pipelineDemandCount: 22,
    demandVsSupplyRatio: 1.22,
    trendDirection: 'stable',
    recommendedTrainingModuleId: 'tm_003',
    category: 'survey'
  },
  {
    id: 'skill_ard_rescue',
    skillName: 'Automatic Rescue Device (ARD) Calibration',
    skillNameHi: 'ऑटोमैटिक रेस्क्यू डिवाइस (एआरडी) कैलिब्रेशन',
    skillNameMr: 'ऑटोमॅटिक रेस्क्यू डिव्हाइस (ARD) कॅलिब्रेशन',
    driveTypeTag: 'ard_emergency',
    qualifiedTechniciansCount: 8,
    pipelineDemandCount: 24,
    demandVsSupplyRatio: 3.0,
    trendDirection: 'critical_gap',
    recommendedTrainingModuleId: 'tm_001',
    category: 'electronics'
  },
  {
    id: 'skill_legacy_geared',
    skillName: 'Legacy Worm-Gear Machine Overhaul (Phasing Out)',
    skillNameHi: 'लेगेसी वर्म-गियर मशीन ओवरहाल (समाप्त किया जा रहा है)',
    skillNameMr: 'लेगेसी वर्म-गिअर मशीन ओव्हरहॉल (टप्प्याटप्प्याने बंद)',
    driveTypeTag: 'legacy_geared',
    qualifiedTechniciansCount: 12,
    pipelineDemandCount: 3,
    demandVsSupplyRatio: 0.25,
    trendDirection: 'declining',
    isDecliningPriority: true,
    category: 'structural'
  }
];

export const initialTechnicianSkillMatrixRows: TechnicianSkillMatrixRow[] = [
  {
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    role: 'technician',
    territory: 'Mumbai South & Thane',
    mobileNumber: '+91 98200 11223',
    skillProficiencies: {
      skill_pmsm_drive: 'expert',
      skill_pit_safety: 'expert',
      skill_laser_survey: 'certified',
      skill_ard_rescue: 'gap',
      skill_legacy_geared: 'expert'
    }
  },
  {
    partnerId: 'p_002',
    partnerName: 'Vikramaditya Rao',
    role: 'surveyor',
    territory: 'Pune Metropolitan',
    mobileNumber: '+91 98450 33445',
    skillProficiencies: {
      skill_pmsm_drive: 'certified',
      skill_pit_safety: 'expert',
      skill_laser_survey: 'expert',
      skill_ard_rescue: 'certified',
      skill_legacy_geared: 'exempt'
    }
  },
  {
    partnerId: 'p_003',
    partnerName: 'Ramesh Balaji Kadam',
    role: 'technician',
    territory: 'Nashik Industrial Zone',
    mobileNumber: '+91 97650 88123',
    skillProficiencies: {
      skill_pmsm_drive: 'gap',
      skill_pit_safety: 'certified',
      skill_laser_survey: 'gap',
      skill_ard_rescue: 'gap',
      skill_legacy_geared: 'expert'
    }
  },
  {
    partnerId: 'p_004',
    partnerName: 'Anand Vasant Patil',
    role: 'technician',
    territory: 'Kolhapur & Sangli',
    mobileNumber: '+91 98221 44556',
    skillProficiencies: {
      skill_pmsm_drive: 'in_training',
      skill_pit_safety: 'expert',
      skill_laser_survey: 'certified',
      skill_ard_rescue: 'certified',
      skill_legacy_geared: 'certified'
    }
  }
];

export const initialPartnerComplianceRecords: PartnerComplianceRecord[] = [
  {
    id: 'pcr_001',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    role: 'technician',
    territory: 'Mumbai South & Thane',
    complianceStatus: 'fully_compliant',
    nonComplianceReason: 'none',
    isSafetyCritical: true,
    cohortGroupId: 'cohort_2026_q1'
  },
  {
    id: 'pcr_002',
    partnerId: 'p_003',
    partnerName: 'Ramesh Balaji Kadam',
    role: 'technician',
    territory: 'Nashik Industrial Zone',
    complianceStatus: 'non_compliant',
    nonComplianceReason: 'failed_needs_coaching',
    uncompletedModuleTitle: 'Gearless PM Motor & VFD Drive Tuning Standard',
    uncompletedModuleId: 'tm_004',
    isSafetyCritical: false,
    dueDate: '2026-08-10',
    cohortGroupId: 'cohort_2026_q2'
  },
  {
    id: 'pcr_003',
    partnerId: 'p_005',
    partnerName: 'Ganesh Pandurang Shinde',
    role: 'technician',
    territory: 'Mumbai Suburban',
    complianceStatus: 'non_compliant',
    nonComplianceReason: 'refresher_lapsed',
    uncompletedModuleTitle: 'Elevator Pit & High-Voltage Electrical Safety Standard',
    uncompletedModuleId: 'tm_002',
    isSafetyCritical: true,
    dueDate: '2026-08-01',
    lastReminderSentAt: '2026-08-11T10:00:00Z',
    cohortGroupId: 'cohort_2026_q1'
  },
  {
    id: 'pcr_004',
    partnerId: 'p_006',
    partnerName: 'Pradeep Krishna Kamble',
    role: 'surveyor',
    territory: 'Pune Metropolitan',
    complianceStatus: 'non_compliant',
    nonComplianceReason: 'never_started',
    uncompletedModuleTitle: '3D Laser Shaft Survey & Structural Alignment',
    uncompletedModuleId: 'tm_003',
    isSafetyCritical: false,
    dueDate: '2026-08-20',
    cohortGroupId: 'cohort_2026_q2'
  }
];

export const initialComplianceTrendMetrics: ComplianceTrendMetric[] = [
  { month: 'Mar 2026', complianceRatePercent: 72, totalActiveTechnicians: 38, compliantCount: 27 },
  { month: 'Apr 2026', complianceRatePercent: 79, totalActiveTechnicians: 40, compliantCount: 31 },
  { month: 'May 2026', complianceRatePercent: 83, totalActiveTechnicians: 42, compliantCount: 35 },
  { month: 'Jun 2026', complianceRatePercent: 88, totalActiveTechnicians: 45, compliantCount: 40 },
  { month: 'Jul 2026', complianceRatePercent: 91, totalActiveTechnicians: 48, compliantCount: 44 },
  { month: 'Aug 2026', complianceRatePercent: 94, totalActiveTechnicians: 50, compliantCount: 47 }
];

export const initialSopRolloutNotifications: SopRolloutNotification[] = [
  {
    id: 'srn_001',
    sopDocumentId: 'sop_is14665_pit_01',
    sopCode: 'SOP-SAF-001',
    sopTitle: 'Elevator Pit Safety & Lockout-Tagout Procedure v3.1',
    sopTitleHi: 'एलिवेटर पिट सुरक्षा और लॉकआउट-टैगआउट प्रक्रिया v3.1',
    sopTitleMr: 'एलिव्हेटर खड्डा सुरक्षा आणि लॉकआउट-टॅगआउट प्रक्रिया v3.1',
    versionNumber: 'v3.1',
    effectiveDate: '2026-08-15',
    affectedPartnerRoles: ['technician', 'quality_inspector'],
    summaryOfChange: 'Added mandatory double-locking car safety prop verification and updated pit emergency stop button voltage isolation check.',
    summaryOfChangeHi: 'अनिवार्य डबल-लॉकिंग कार सेफ्टी प्रोप सत्यापन जोड़ा गया और पिट इमरजेंसी स्टॉप बटन वोल्टेज आइसोलेशन जांच अपडेट की गई।',
    summaryOfChangeMr: 'अनिवार्य डबल-लॉकिंग कार सेफ्टी प्रॉप पडताळणी समाविष्ट केली आणि खड्डा आपत्कालीन स्टॉप बटण व्होल्टेज अलगीकरण तपासणी अपडेट केली.',
    quizIdOnChangedPortion: 'assess_002',
    isUrgentExpedited: true,
    status: 'published',
    createdDate: '2026-08-08',
    acknowledgedCount: 38,
    totalAffectedPartners: 45
  },
  {
    id: 'srn_002',
    sopDocumentId: 'sop_pmsm_vfd_02',
    sopCode: 'SOP-TEC-002',
    sopTitle: 'Gearless PM Motor & VFD Drive Auto-Tuning Standard v2.1',
    sopTitleHi: 'गियरलेस पीएम मोटर और वीएफडी ड्राइव ऑटो-ट्यूनिंग मानक v2.1',
    sopTitleMr: 'गिअरलेस पीएम मोटर व व्हीएफडी ड्राईव्ह ऑटो-ट्यूनिंग मानक v2.1',
    versionNumber: 'v2.1',
    effectiveDate: '2026-08-20',
    affectedPartnerRoles: ['technician'],
    summaryOfChange: 'Updated rotary encoder zero-offset parameter sequence for Monarch 3000+ controllers.',
    summaryOfChangeHi: 'मोनाक 3000+ कंट्रोलर्स के लिए रोटरी एनकोडर ज़ीरो-ऑफसेट पैरामीटर अनुक्रम अपडेट किया गया।',
    summaryOfChangeMr: 'मोनार्क 3000+ कंट्रोलर्ससाठी रोटरी एन्कोडर शून्य-ऑफसेट पॅरामीटर क्रम अपडेट केला.',
    quizIdOnChangedPortion: 'assess_001',
    isUrgentExpedited: false,
    status: 'published',
    createdDate: '2026-08-10',
    acknowledgedCount: 22,
    totalAffectedPartners: 35
  }
];

export const initialPartnerRolloutAcknowledgments: PartnerRolloutAcknowledgment[] = [
  {
    id: 'pra_001',
    rolloutId: 'srn_001',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerRole: 'technician',
    territory: 'Mumbai South & Thane',
    status: 'quiz_passed',
    acknowledgedAt: '2026-08-09T14:30:00Z',
    quizScorePercent: 100
  },
  {
    id: 'pra_002',
    rolloutId: 'srn_001',
    partnerId: 'p_003',
    partnerName: 'Ramesh Balaji Kadam',
    partnerRole: 'technician',
    territory: 'Nashik Industrial Zone',
    status: 'pending'
  },
  {
    id: 'pra_003',
    rolloutId: 'srn_001',
    partnerId: 'p_005',
    partnerName: 'Ganesh Pandurang Shinde',
    partnerRole: 'technician',
    territory: 'Mumbai Suburban',
    status: 'acknowledged',
    acknowledgedAt: '2026-08-11T09:15:00Z'
  }
];

export const initialTrainingModuleFeedback: TrainingModuleFeedback[] = [
  {
    id: 'tfb_001',
    trainingModuleId: 'tm_002',
    trainingModuleTitle: 'Elevator Pit & High-Voltage Electrical Safety Standard',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerRole: 'technician',
    isAnonymous: false,
    clarityRating: 5,
    relevanceRating: 5,
    commentText: 'Very clear explanation of zero-voltage multimeter checks. The video on pit stop switch latching was extremely helpful on site in Thane.',
    isCriticalSafetyIssue: false,
    status: 'submitted',
    createdAt: '2026-08-06T11:20:00Z',
    moderationFlag: 'clean'
  },
  {
    id: 'tfb_002',
    trainingModuleId: 'tm_002',
    trainingModuleTitle: 'Elevator Pit & High-Voltage Electrical Safety Standard',
    partnerId: 'p_003',
    partnerName: 'Anonymous Technician',
    partnerRole: 'technician',
    isAnonymous: true,
    clarityRating: 2,
    relevanceRating: 4,
    commentText: 'Diagram for 3-phase R-Y-B multimeter probes shows outdated analog meter instead of digital CAT III 1000V meter. Needs urgent correction!',
    isCriticalSafetyIssue: true, // Serious content error flagged with elevated urgency
    disputedQuestionId: 'kc_201_1',
    disputedQuestionText: 'How do you confirm electrical power is fully isolated after applying LOTO lock?',
    status: 'under_review',
    createdAt: '2026-08-09T16:45:00Z',
    moderationFlag: 'clean'
  },
  {
    id: 'tfb_003',
    trainingModuleId: 'tm_004',
    trainingModuleTitle: 'Gearless PM Motor & VFD Drive Tuning Standard',
    partnerId: 'p_002',
    partnerName: 'Vikramaditya Rao',
    partnerRole: 'surveyor',
    isAnonymous: false,
    clarityRating: 4,
    relevanceRating: 5,
    commentText: 'Encoders section is great, but please add Marathi audio narration track for Monarch NICE3000+ auto-tune step 3.',
    isCriticalSafetyIssue: false,
    status: 'addressed_in_revision',
    createdAt: '2026-08-10T14:10:00Z',
    moderationFlag: 'clean'
  },
  {
    id: 'tfb_004',
    trainingModuleId: 'tm_003',
    trainingModuleTitle: 'Precision Shaft Dimensional Surveying & Plumb Line Setup',
    partnerId: 'p_006',
    partnerName: 'Anonymous Partner',
    partnerRole: 'surveyor',
    isAnonymous: true,
    clarityRating: 3,
    relevanceRating: 3,
    commentText: '3D laser calibration distance matrix table is hard to read on smaller mobile screen widths.',
    isCriticalSafetyIssue: false,
    status: 'submitted',
    createdAt: '2026-08-12T09:30:00Z',
    moderationFlag: 'clean'
  }
];

export const initialCommissionRules: CommissionRule[] = [
  {
    id: 'crule_001',
    ruleName: 'Surveyor Field Lead Capture Bonus',
    triggerEvent: 'surveyor_lead_capture',
    triggerEventLabel: 'Verified Site Lead Capture',
    calculationType: 'fixed_amount',
    baseRateOrAmount: 1500,
    applicablePartnerTier: 'all',
    tierBonusMultiplier: 1.25,
    ruleVersion: 'v2.1',
    isActive: true,
    stackingRule: 'stacks_with_others',
    effectiveFromDate: '2026-01-01',
    advanceNoticeSent: true,
    noticeNotes: 'Increased base lead bonus from ₹1,000 to ₹1,500 for Q3 2026 expansion.',
    updatedBy: 'Mr. Prashant Vasant Wable',
    updatedAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'crule_002',
    ruleName: 'Commercial Deal Conversion Commission',
    triggerEvent: 'deal_conversion',
    triggerEventLabel: 'Deal Won & Advance Deposit Cleared',
    calculationType: 'percentage_of_value',
    baseRateOrAmount: 2.5,
    applicablePartnerTier: 'all',
    tierBonusMultiplier: 1.4,
    ruleVersion: 'v3.0',
    isActive: true,
    stackingRule: 'higher_takes_precedence',
    effectiveFromDate: '2026-03-15',
    advanceNoticeSent: true,
    noticeNotes: 'Tier multiplier revised to incentivize higher partner retention.',
    updatedBy: 'Mr. Prashant Vasant Wable',
    updatedAt: '2026-07-10T14:30:00Z'
  },
  {
    id: 'crule_003',
    ruleName: 'Technician Installation Stage Completion',
    triggerEvent: 'technician_job_completion',
    triggerEventLabel: 'SOP Stage Signoff & Mechanical Acceptance',
    calculationType: 'fixed_amount',
    baseRateOrAmount: 8500,
    applicablePartnerTier: 'all',
    tierBonusMultiplier: 1.2,
    ruleVersion: 'v1.4',
    isActive: true,
    stackingRule: 'stacks_with_others',
    effectiveFromDate: '2026-02-01',
    advanceNoticeSent: true,
    noticeNotes: 'Requires 100% safety checklist photo evidence upload.',
    updatedBy: 'Mr. Prashant Vasant Wable',
    updatedAt: '2026-06-20T11:15:00Z'
  },
  {
    id: 'crule_004',
    ruleName: 'QC Safety Inspector Audit Fee',
    triggerEvent: 'qc_inspection_passed',
    triggerEventLabel: 'Zero-Defect QC Audit Certificate Issued',
    calculationType: 'fixed_amount',
    baseRateOrAmount: 3500,
    applicablePartnerTier: 'all',
    tierBonusMultiplier: 1.0,
    ruleVersion: 'v2.0',
    isActive: true,
    stackingRule: 'stacks_with_others',
    effectiveFromDate: '2026-04-01',
    advanceNoticeSent: true,
    noticeNotes: 'Paid immediately upon customer sign-off certificate creation.',
    updatedBy: 'Mr. Prashant Vasant Wable',
    updatedAt: '2026-07-15T09:00:00Z'
  },
  {
    id: 'crule_005',
    ruleName: 'Partner Referral Network Bonus',
    triggerEvent: 'referral_bonus',
    triggerEventLabel: 'Referred Partner First Job Completion',
    calculationType: 'fixed_amount',
    baseRateOrAmount: 5000,
    applicablePartnerTier: 'all',
    tierBonusMultiplier: 1.15,
    ruleVersion: 'v1.1',
    isActive: true,
    stackingRule: 'mutually_exclusive',
    effectiveFromDate: '2026-05-01',
    advanceNoticeSent: true,
    noticeNotes: 'Applies after referred partner completes probation period.',
    updatedBy: 'Mr. Prashant Vasant Wable',
    updatedAt: '2026-08-01T16:00:00Z'
  }
];

export const initialCommissionRuleHistory: CommissionRuleVersionHistory[] = [
  {
    id: 'crh_101',
    ruleId: 'crule_001',
    ruleName: 'Surveyor Field Lead Capture Bonus',
    ruleVersion: 'v2.1',
    baseRateOrAmount: 1500,
    calculationType: 'fixed_amount',
    changedBy: 'Mr. Prashant Vasant Wable',
    changedAt: '2026-07-01T10:00:00Z',
    changeReason: 'Upgraded base lead bonus from ₹1,000 to ₹1,500 for Thane/Navi Mumbai growth drive.'
  },
  {
    id: 'crh_102',
    ruleId: 'crule_001',
    ruleName: 'Surveyor Field Lead Capture Bonus',
    ruleVersion: 'v2.0',
    baseRateOrAmount: 1000,
    calculationType: 'fixed_amount',
    changedBy: 'Mr. Prashant Vasant Wable',
    changedAt: '2026-01-01T09:00:00Z',
    changeReason: 'Initial rule standardization across Maharashtra territories.'
  },
  {
    id: 'crh_103',
    ruleId: 'crule_002',
    ruleName: 'Commercial Deal Conversion Commission',
    ruleVersion: 'v3.0',
    baseRateOrAmount: 2.5,
    calculationType: 'percentage_of_value',
    changedBy: 'Mr. Prashant Vasant Wable',
    changedAt: '2026-07-10T14:30:00Z',
    changeReason: 'Updated tier multiplier matrix to reward Gold and Platinum conversion specialists.'
  }
];

export const initialCommissionPayoutEntries: CommissionPayoutEntry[] = [
  {
    id: 'payout_501',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerRole: 'technician',
    partnerTier: 'gold',
    triggerType: 'technician_job_completion',
    triggerTypeLabel: 'SOP Stage Signoff & Mechanical Acceptance',
    referenceDocNo: 'JOB-2026-THN-882',
    dealOrJobValue: 1250000,
    amount: 10200,
    status: 'pending_approval',
    appliedRuleId: 'crule_003',
    appliedRuleVersion: 'v1.4',
    earnedAt: '2026-08-12T14:20:00Z',
    notes: 'Stage 2 elevator guide rail installation completed with zero snags.'
  },
  {
    id: 'payout_502',
    partnerId: 'p_002',
    partnerName: 'Vikramaditya Rao',
    partnerRole: 'surveyor',
    partnerTier: 'platinum',
    triggerType: 'deal_conversion',
    triggerTypeLabel: 'Deal Won & Advance Deposit Cleared',
    referenceDocNo: 'DEAL-2026-PUN-341',
    dealOrJobValue: 4800000,
    amount: 168000,
    status: 'pending_approval',
    appliedRuleId: 'crule_002',
    appliedRuleVersion: 'v3.0',
    earnedAt: '2026-08-11T18:45:00Z',
    notes: 'Kothrud Commercial Complex 6-Passenger MRL Deal Won.'
  },
  {
    id: 'payout_503',
    partnerId: 'p_003',
    partnerName: 'Rameshwar Patil',
    partnerRole: 'surveyor',
    partnerTier: 'silver',
    triggerType: 'surveyor_lead_capture',
    triggerTypeLabel: 'Verified Site Lead Capture',
    referenceDocNo: 'LEAD-2026-NSK-109',
    dealOrJobValue: 2200000,
    amount: 1725,
    status: 'approved_pending_payout',
    appliedRuleId: 'crule_001',
    appliedRuleVersion: 'v2.1',
    earnedAt: '2026-08-09T10:15:00Z',
    approvedAt: '2026-08-10T09:30:00Z',
    payoutBatchId: 'BATCH-2026-08-A',
    notes: 'Nashik Industrial Park Shaft Dimensions Survey verified.'
  },
  {
    id: 'payout_504',
    partnerId: 'p_004',
    partnerName: 'Amit S. Kulkarni',
    partnerRole: 'technician',
    partnerTier: 'gold',
    triggerType: 'qc_inspection_passed',
    triggerTypeLabel: 'Zero-Defect QC Audit Certificate Issued',
    referenceDocNo: 'QC-2026-AUR-099',
    dealOrJobValue: 1800000,
    amount: 3500,
    status: 'paid',
    appliedRuleId: 'crule_004',
    appliedRuleVersion: 'v2.0',
    earnedAt: '2026-08-04T16:00:00Z',
    approvedAt: '2026-08-05T10:00:00Z',
    paidAt: '2026-08-07T12:00:00Z',
    payoutBatchId: 'BATCH-2026-08-PREV',
    notes: 'Electrical safety & high-voltage insulation audit passed first attempt.'
  },
  {
    id: 'payout_505',
    partnerId: 'p_005',
    partnerName: 'Ganesh More',
    partnerRole: 'technician',
    partnerTier: 'bronze',
    triggerType: 'referral_bonus',
    triggerTypeLabel: 'Referred Partner First Job Completion',
    referenceDocNo: 'REF-PARTNER-882',
    dealOrJobValue: 0,
    amount: 5000,
    status: 'held_dispute',
    appliedRuleId: 'crule_005',
    appliedRuleVersion: 'v1.1',
    earnedAt: '2026-08-02T11:00:00Z',
    notes: 'Held for verification of probation period attendance records.'
  }
];

export const initialAutomatedDisbursements: AutomatedDisbursementRecord[] = [
  {
    id: 'disb_901',
    payoutEntryIds: ['payout_503'],
    partnerId: 'p_003',
    partnerName: 'Rameshwar Patil',
    partnerRole: 'surveyor',
    bankAccountMasked: 'XXXX-XXXX-8821',
    ifscCode: 'HDFC0001242',
    upiId: 'rameshwar.patil@okicici',
    disbursementMethod: 'upi_instant',
    amount: 1725,
    status: 'completed',
    batchId: 'BATCH-2026-08-A',
    initiatedAt: '2026-08-10T09:35:00Z',
    completedAt: '2026-08-10T09:35:12Z',
    retryCount: 0
  },
  {
    id: 'disb_902',
    payoutEntryIds: ['payout_504'],
    partnerId: 'p_004',
    partnerName: 'Amit S. Kulkarni',
    partnerRole: 'technician',
    bankAccountMasked: 'XXXX-XXXX-4109',
    ifscCode: 'ICIC0000211',
    upiId: 'amit.kulkarni@okhdfcbank',
    disbursementMethod: 'bank_neft',
    amount: 3500,
    status: 'completed',
    batchId: 'BATCH-2026-08-PREV',
    initiatedAt: '2026-08-07T11:55:00Z',
    completedAt: '2026-08-07T12:00:00Z',
    retryCount: 0
  },
  {
    id: 'disb_903',
    payoutEntryIds: ['payout_508_fail'],
    partnerId: 'p_007',
    partnerName: 'Rajendra Bhosale',
    partnerRole: 'technician',
    bankAccountMasked: 'XXXX-XXXX-1102',
    ifscCode: 'SBIN0004012',
    upiId: 'rajendra.bhosale@sbi',
    disbursementMethod: 'bank_neft',
    amount: 8500,
    status: 'failed',
    failureReason: 'Bank Server Error: Account number / IFSC mismatch (Customer updated account details recently)',
    batchId: 'BATCH-2026-08-FAILED-CHECK',
    initiatedAt: '2026-08-12T08:00:00Z',
    retryCount: 1
  }
];

export const initialCompetitionContests: CompetitionContest[] = [
  {
    id: 'contest_001',
    title: 'Monarch MRL Elevator Installation Sprint 2026',
    description: 'Q3 Maharashtra High-Speed MRL Installation Quality & Speed Competition',
    category: 'technician',
    metricType: 'zero_defect_jobs',
    metricUnit: 'Jobs Completed',
    rewardPool: '₹2,50,000 Cash + Gold Ascension Shield',
    firstPrize: '₹1,25,000 + Diamond Badge + Mahindra Thar Mileage Fuel Card',
    secondPrize: '₹75,000 + Platinum Badge + Tool Kit Set',
    thirdPrize: '₹50,000 + Gold Badge',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    isActive: true,
    participantsCount: 42
  },
  {
    id: 'contest_002',
    title: 'Thane & Navi Mumbai Commercial Lead Drive',
    description: 'Surveyor Lead Generation & Rapid Site Dimension Survey Championship',
    category: 'surveyor',
    metricType: 'lead_count',
    metricUnit: 'Verified Leads',
    rewardPool: '₹1,50,000 Cash + Lead Master Trophy',
    firstPrize: '₹80,000 + Hero Splendor Bike Voucher',
    secondPrize: '₹45,000 + Samsung Galaxy Tablet',
    thirdPrize: '₹25,000 + Smartwatch',
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    isActive: true,
    participantsCount: 28
  },
  {
    id: 'contest_003_past',
    title: 'Monsoon Zero-Breakdown Emergency Response Challenge',
    description: 'Jul 2026 Rapid Response & Rain-proof Electrical Wiring Audit Drive',
    category: 'technician',
    metricType: 'speed_score',
    metricUnit: 'Min Avg Response',
    rewardPool: '₹1,00,000 Cash Pool',
    firstPrize: '₹50,000 + Rain Proof Tech Kit',
    secondPrize: '₹30,000',
    thirdPrize: '₹20,000',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    isActive: false,
    participantsCount: 35
  }
];

export const initialUnifiedBadges: UnifiedBadgeMilestone[] = [
  {
    id: 'ub_001',
    badgeCode: 'MRL_ZERO_DEFECT_MASTER',
    badgeName: 'Monarch MRL Zero-Defect Master',
    badgeNameHi: 'मोनार्क एमआरएल शून्य-त्रुटि मास्टर',
    badgeNameMr: 'मोनार्क एमआरएल शून्य-दोष मास्टर',
    category: 'quality',
    rarityTier: 'legendary',
    rarityPercent: 2.8,
    iconName: 'Award',
    description: 'Completed 25 consecutive Monarch Gearless MRL Elevator installations with 100% first-pass QC certificate pass without a single snag item.',
    isEarned: true,
    earnedDate: '2026-06-15',
    certificateNumber: 'CERT-BADGE-2026-MRL-09',
    currentProgress: 25,
    targetProgress: 25,
    unitLabel: 'Zero-Defect Installations',
    earningCriteriaVersion: 'v2026.1'
  },
  {
    id: 'ub_002',
    badgeCode: 'HIGH_VOLTAGE_SAFETY_GUARDIAN',
    badgeName: 'High-Voltage Safety Guardian',
    badgeNameHi: 'उच्च वोल्टेज सुरक्षा संरक्षक',
    badgeNameMr: 'हाय-व्होल्टेज सुरक्षा रक्षक',
    category: 'safety',
    rarityTier: 'epic',
    rarityPercent: 6.4,
    iconName: 'ShieldCheck',
    description: 'Completed 100% OSHA-compliant electrical insulation testing, earth pit resistance audits (<2 ohms), and LOTO protocols across 50 project sites.',
    isEarned: true,
    earnedDate: '2026-05-10',
    certificateNumber: 'CERT-BADGE-2026-SAF-44',
    currentProgress: 50,
    targetProgress: 50,
    unitLabel: 'Audited Sites',
    earningCriteriaVersion: 'v2025.4'
  },
  {
    id: 'ub_003',
    badgeCode: 'SITE_SURVEY_PRECISION_EXPERT',
    badgeName: '3D Shaft Survey Precision Champion',
    badgeNameHi: '3D शाफ्ट सर्वेक्षण सटीकता चैंपियन',
    badgeNameMr: '3D शाफ्ट सर्व्हे अचूकता चॅम्पियन',
    category: 'performance',
    rarityTier: 'epic',
    rarityPercent: 7.9,
    iconName: 'Compass',
    description: 'Achieved zero dimension variance (<2mm) across 40 complex high-rise elevator shaft laser surveys with 3D plumb-line verification.',
    isEarned: true,
    earnedDate: '2026-07-02',
    certificateNumber: 'CERT-BADGE-2026-SUR-11',
    currentProgress: 40,
    targetProgress: 40,
    unitLabel: 'Verified Surveys',
    earningCriteriaVersion: 'v2026.1'
  },
  {
    id: 'ub_004',
    badgeCode: 'TENURE_CENTURION_PARTNER',
    badgeName: 'AIEC Centurion Partner (100 Projects)',
    badgeNameHi: 'एआईईसी सेंचुरियन पार्टनर (100 प्रोजेक्ट्स)',
    badgeNameMr: 'एआयईसी सेंच्युरियन पार्टनर (100 प्रोजेक्ट्स)',
    category: 'tenure',
    rarityTier: 'legendary',
    rarityPercent: 1.5,
    iconName: 'Medal',
    description: 'Successfully completed 100 total verified elevator installation or maintenance contracts as an accredited AIEC Partner.',
    isEarned: false,
    currentProgress: 84,
    targetProgress: 100,
    unitLabel: 'Projects Completed',
    earningCriteriaVersion: 'v2026.1'
  },
  {
    id: 'ub_005',
    badgeCode: 'ADVANCED_HYDRAULIC_CERTIFIED',
    badgeName: 'Advanced Hydraulic & Heavy Duty Lift Specialist',
    badgeNameHi: 'उन्नत हाइड्रोलिक एवं हेवी ड्यूटी लिफ्ट विशेषज्ञ',
    badgeNameMr: 'ॲडव्हान्स्ड हायड्रॉलिक आणि हेवी ड्युटी लिफ्ट तज्ज्ञ',
    category: 'training',
    rarityTier: 'rare',
    rarityPercent: 14.2,
    iconName: 'Cpu',
    description: 'Passed theory and practical hands-on evaluation for 2.5T+ heavy duty goods lift valves, emergency lowering devices, and oil pressure calibration.',
    isEarned: false,
    currentProgress: 3,
    targetProgress: 5,
    unitLabel: 'Passed Practical Tests',
    earningCriteriaVersion: 'v2026.2'
  },
  {
    id: 'ub_006',
    badgeCode: 'RAPID_DISBURSEMENT_RECORD',
    badgeName: 'Top Tier Commission Earner',
    badgeNameHi: 'शीर्ष श्रेणी कमीशन अर्जक',
    badgeNameMr: 'टॉप टियर कमिशन मिळवणारा',
    category: 'performance',
    rarityTier: 'rare',
    rarityPercent: 12.0,
    iconName: 'TrendingUp',
    description: 'Earned over ₹5,00,000 in total stage payouts and leaderboard rewards within a single financial year.',
    isEarned: true,
    earnedDate: '2026-07-28',
    certificateNumber: 'CERT-BADGE-2026-EARN-88',
    currentProgress: 500000,
    targetProgress: 500000,
    unitLabel: '₹ Earned',
    earningCriteriaVersion: 'v2026.1'
  },
  {
    id: 'ub_007',
    badgeCode: 'DISASTER_EMERGENCY_HERO',
    badgeName: 'Elevator Trapped Passenger Express Rescue Hero',
    badgeNameHi: 'एलीवेटर ट्रैप्ड पैसेंजर एक्सप्रेस रेस्क्यू हीरो',
    badgeNameMr: 'एलिव्हेटर अडकलेले प्रवासी एक्सप्रेस सुटका हिरो',
    category: 'safety',
    rarityTier: 'rare',
    rarityPercent: 11.5,
    iconName: 'Zap',
    description: 'Responded to emergency SOS callouts within 15 minutes and safely evacuated trapped passengers with zero injury.',
    isEarned: false,
    currentProgress: 3,
    targetProgress: 5,
    unitLabel: 'Successful SOS Rescues',
    earningCriteriaVersion: 'v2026.1'
  }
];

export const initialLeaderboardEntries: LeaderboardEntry[] = [
  {
    id: 'lead_1',
    contestId: 'contest_001',
    rank: 1,
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerRole: 'technician',
    partnerTier: 'gold',
    scoreValue: 14,
    scoreUnit: 'Zero-Defect Jobs',
    gapToNextRank: 0,
    trend: 'same',
    lastUpdated: '2026-08-13T18:00:00Z'
  },
  {
    id: 'lead_2',
    contestId: 'contest_001',
    rank: 2,
    partnerId: 'p_004',
    partnerName: 'Amit S. Kulkarni',
    partnerRole: 'technician',
    partnerTier: 'gold',
    scoreValue: 12,
    scoreUnit: 'Zero-Defect Jobs',
    gapToNextRank: 2,
    trend: 'up',
    lastUpdated: '2026-08-13T17:30:00Z'
  },
  {
    id: 'lead_3',
    contestId: 'contest_001',
    rank: 3,
    partnerId: 'p_007',
    partnerName: 'Rajendra Bhosale',
    partnerRole: 'technician',
    partnerTier: 'platinum',
    scoreValue: 11,
    scoreUnit: 'Zero-Defect Jobs',
    gapToNextRank: 1,
    trend: 'down',
    lastUpdated: '2026-08-13T16:00:00Z'
  },
  {
    id: 'lead_4',
    contestId: 'contest_001',
    rank: 4,
    partnerId: 'p_005',
    partnerName: 'Ganesh More',
    partnerRole: 'technician',
    partnerTier: 'bronze',
    scoreValue: 8,
    scoreUnit: 'Zero-Defect Jobs',
    gapToNextRank: 3,
    trend: 'up',
    lastUpdated: '2026-08-13T12:00:00Z'
  },
  {
    id: 'lead_5',
    contestId: 'contest_002',
    rank: 1,
    partnerId: 'p_002',
    partnerName: 'Vikramaditya Rao',
    partnerRole: 'surveyor',
    partnerTier: 'platinum',
    scoreValue: 29,
    scoreUnit: 'Verified Leads',
    gapToNextRank: 0,
    trend: 'same',
    lastUpdated: '2026-08-13T19:00:00Z'
  },
  {
    id: 'lead_6',
    contestId: 'contest_002',
    rank: 2,
    partnerId: 'p_003',
    partnerName: 'Rameshwar Patil',
    partnerRole: 'surveyor',
    partnerTier: 'silver',
    scoreValue: 24,
    scoreUnit: 'Verified Leads',
    gapToNextRank: 5,
    trend: 'up',
    lastUpdated: '2026-08-13T18:15:00Z'
  }
];

export const initialTdsStatements: TdsStatementRecord[] = [
  {
    id: 'tds_2026_q1',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerPan: 'ABCDE1234F',
    finYear: 'FY 2026-27',
    quarterLabel: 'Q1 (Apr 2026 - Jun 2026)',
    applicableSection: 'Sec 194H (Commission / Stage Payment)',
    applicableRatePercent: 5.0,
    grossPayoutAmount: 185000,
    tdsDeductedAmount: 9250,
    exemptionThreshold: 15000,
    isBelowThreshold: false,
    form16aCertificateNo: 'FORM16A-2026-Q1-00921',
    issuedDate: '2026-07-15',
    aiEcTanNumber: 'PNEA12345B',
    status: 'filed_certificate_issued'
  },
  {
    id: 'tds_2026_q2',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerPan: 'ABCDE1234F',
    finYear: 'FY 2026-27',
    quarterLabel: 'Q2 (Jul 2026 - Sep 2026)',
    applicableSection: 'Sec 194H (Commission / Stage Payment)',
    applicableRatePercent: 5.0,
    grossPayoutAmount: 142000,
    tdsDeductedAmount: 7100,
    exemptionThreshold: 15000,
    isBelowThreshold: false,
    form16aCertificateNo: 'FORM16A-2026-Q2-PENDING',
    issuedDate: undefined,
    aiEcTanNumber: 'PNEA12345B',
    status: 'pending_quarterly_filing'
  },
  {
    id: 'tds_2026_q1_p005',
    partnerId: 'p_005',
    partnerName: 'Ganesh More',
    partnerPan: 'PQRS5678K',
    finYear: 'FY 2026-27',
    quarterLabel: 'Q1 (Apr 2026 - Jun 2026)',
    applicableSection: 'Sec 194C (Contractor Payment)',
    applicableRatePercent: 1.0,
    grossPayoutAmount: 12000,
    tdsDeductedAmount: 0,
    exemptionThreshold: 30000,
    isBelowThreshold: true,
    aiEcTanNumber: 'PNEA12345B',
    status: 'threshold_exempt'
  }
];

export const initialPayoutDisputes: PayoutDisputeRecord[] = [
  {
    id: 'pdis_001',
    payoutEntryId: 'pay_001',
    payoutReferenceNo: 'PAY-STAGE-2026-081',
    partnerId: 'p_001',
    partnerName: 'Sanjay Tukaram Deshmukh',
    partnerRole: 'technician',
    disputeSubject: 'Missing Tier-3 Gold Commission Bonus on MRL Installation',
    partnerQueryText: 'The stage completion payout for Job #J-108 included base installation fee ₹12,000, but omitted the Gold Tier 10% bonus (₹1,200). Please review.',
    disputedAmount: 1200,
    status: 'under_investigation',
    slaDeadline: '2026-08-15T18:00:00Z',
    isSlaBreached: false,
    createdAt: '2026-08-13T10:15:00Z',
    auditMessages: [
      {
        senderName: 'Sanjay Tukaram Deshmukh',
        senderRole: 'technician',
        timestamp: '2026-08-13T10:15:00Z',
        messageText: 'Tier-3 bonus not credited automatically in payout ledger.'
      },
      {
        senderName: 'Accounts Admin (Prashant Wable)',
        senderRole: 'admin',
        timestamp: '2026-08-13T14:30:00Z',
        messageText: 'Verifying tier assignment rule version v2026.2 for Pune East territory.'
      }
    ]
  },
  {
    id: 'pdis_002',
    payoutEntryId: 'pay_002',
    payoutReferenceNo: 'PAY-STAGE-2026-077',
    partnerId: 'p_002',
    partnerName: 'Vikramaditya Rao',
    partnerRole: 'surveyor',
    disputeSubject: 'Survey Lead Commission Calculation Rate Query',
    partnerQueryText: 'Site survey lead #L-304 was converted to a commercial elevator deal worth ₹28L. Tier rate was calculated at 1.5% instead of 2.0% as per new August promo.',
    disputedAmount: 14000,
    status: 'adjustment_approved',
    slaDeadline: '2026-08-12T12:00:00Z',
    resolutionType: 'adjustment_approved',
    resolutionNotes: 'Verified deal conversion timestamp post-August rule release. Approved correcting credit of ₹14,000 via Rule CR-002-v2026.',
    correctiveAdjustmentAmount: 14000,
    isSystemicRuleIssue: true,
    createdAt: '2026-08-10T09:00:00Z',
    resolvedAt: '2026-08-11T11:20:00Z',
    auditMessages: [
      {
        senderName: 'Vikramaditya Rao',
        senderRole: 'surveyor',
        timestamp: '2026-08-10T09:00:00Z',
        messageText: 'Rate mismatch on lead conversion.'
      },
      {
        senderName: 'Prashant Wable',
        senderRole: 'admin',
        timestamp: '2026-08-11T11:20:00Z',
        messageText: 'Adjustment approved. Corrective payout entry PAY-ADJ-2026-01 generated.'
      }
    ]
  }
];

export const initialCustomerProjects: CustomerProjectSummary[] = [
  {
    id: 'proj_royal_001',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    projectName: 'Royal Heights Tower A',
    siteAddress: 'Plot 42, Baner-Pashan Link Rd, Baner, Pune, MH 411045',
    buildingType: 'Residential Tower (12 Floors)',
    elevatorType: 'AIEC Gearless MRL 8-Passenger 1.5m/s (Duplex Controller)',
    projectMode: 'active_installation',
    currentStageCode: 'STAGE_04_MECH_CABIN',
    currentStageName: 'Car Frame & Cabin Assembly',
    overallProgressPercent: 65,
    statusTone: 'normal',
    statusMessage: 'On schedule for Pre-Commissioning Quality & Safety Inspection on Aug 24.',
    nextMilestoneName: 'Electrical Wiring & Traveling Cable Drop',
    nextMilestoneDueDate: '2026-08-20',
    nextPaymentDueAmount: 180000,
    nextPaymentDueDate: '2026-08-25',
    nextPaymentTitle: 'Stage 3 Dispatch & Wiring Milestone Payment',
    unreadNotificationCount: 2,
    assignedLeadManagerName: 'Sanjay Tukaram Deshmukh (Senior Site Project Lead)',
    assignedLeadManagerPhone: '+91 98220 11223',
    contractDocUrl: 'AIEC_CONTRACT_ROYAL_HEIGHTS_A.pdf',
    quotationDocUrl: 'AIEC_QUOTATION_ROYAL_HEIGHTS_A.pdf',
    installationMilestones: [
      {
        id: 'ms_01',
        stageCode: 'STAGE_01',
        stageName: 'Civil Shaft Inspection & Pit Readiness',
        description: 'Verification of shaft plumbness, pit waterproofing, and overhead headroom clearance.',
        status: 'completed',
        estimatedDate: '2026-07-10',
        actualDate: '2026-07-10',
        completedByTechName: 'Sanjay Tukaram Deshmukh',
        photoHighlights: [
          {
            title: 'Civil Pit Shaft Clearance Approved',
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80',
            caption: 'Plumb line check passed with 1.2mm tolerance across 12 floors.',
            geotag: '18.5590° N, 73.7868° E',
            date: '2026-07-10'
          }
        ],
        technicalDetails: [
          'Pit depth verified: 1500mm',
          'Overhead headroom: 4500mm',
          'Power supply line 3-Phase 415V 50Hz isolated'
        ],
        linkedDocTitle: 'Pit Readiness Signoff Certificate.pdf'
      },
      {
        id: 'ms_02',
        stageCode: 'STAGE_02',
        stageName: 'Material Delivery & Unloading',
        description: 'Unloading gearless traction motor, car frame, guide rails, and landing doors.',
        status: 'completed',
        estimatedDate: '2026-07-22',
        actualDate: '2026-07-21',
        completedByTechName: 'Delivery Logistics Partner #4',
        photoHighlights: [
          {
            title: 'Gearless Machine & Guide Rails Unloaded',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            caption: 'All 24 T-section guide rails unpacked and moisture-sealed.',
            geotag: '18.5590° N, 73.7868° E',
            date: '2026-07-21'
          }
        ],
        technicalDetails: [
          'Material verification 100% matched PO #PO-AIEC-2026-88',
          'Zero shipping damage logged'
        ],
        linkedDocTitle: 'Material Delivery Confirmation.pdf'
      },
      {
        id: 'ms_03',
        stageCode: 'STAGE_03',
        stageName: 'Guide Rail Fastening & Bracket Alignment',
        description: 'Precision laser alignment of car and counterweight guide rails across 12 floors.',
        status: 'completed',
        estimatedDate: '2026-08-02',
        actualDate: '2026-08-03',
        completedByTechName: 'Ganesh More',
        photoHighlights: [
          {
            title: 'Laser Alignment of Car Brackets',
            url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
            caption: 'Guide rail gauge fixed at 1100mm ± 0.5mm.',
            geotag: '18.5590° N, 73.7868° E',
            date: '2026-08-03'
          }
        ],
        technicalDetails: [
          'Bracket pitch: 2000mm',
          'Anchor bolts torque tested to 85 Nm'
        ],
        linkedDocTitle: 'Mechanical Alignment Log.pdf'
      },
      {
        id: 'ms_04',
        stageCode: 'STAGE_04',
        stageName: 'Car Frame & Cabin Assembly',
        description: 'Assembly of safety gear, sling, cabin panels, and stainless steel mirror finish COP.',
        status: 'in_progress',
        estimatedDate: '2026-08-18',
        completedByTechName: 'Sanjay Tukaram Deshmukh',
        photoHighlights: [
          {
            title: 'Stainless Steel Cabin Frame Assembly',
            url: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=800&q=80',
            caption: 'Gold accent handrails and anti-skid granite floor installed.',
            geotag: '18.5590° N, 73.7868° E',
            date: '2026-08-12'
          }
        ],
        technicalDetails: [
          'Instantaneous safety gear fitted',
          'Car buffer springs positioned'
        ]
      },
      {
        id: 'ms_05',
        stageCode: 'STAGE_05',
        stageName: 'Control Panel Wiring & Traveling Cable Drop',
        description: 'VFD inverter controller wiring, door operator setup, and magnetic reed switches.',
        status: 'upcoming',
        estimatedDate: '2026-08-24',
        technicalDetails: [
          'VVVF drive parameter calibration',
          'Emergency battery lowering device (ARD) wiring'
        ]
      },
      {
        id: 'ms_06',
        stageCode: 'STAGE_06',
        stageName: 'PWD Lift Inspector Safety Clearance',
        description: 'Full load test, overspeed governor tripping check, and government license issuance.',
        status: 'upcoming',
        estimatedDate: '2026-09-02',
        technicalDetails: [
          '125% rated load test',
          'PWD Lift Inspector inspection report'
        ]
      },
      {
        id: 'ms_07',
        stageCode: 'STAGE_07',
        stageName: 'Final Customer Handover & Key Ceremony',
        description: 'Walkthrough demonstration, emergency phone test, and warranty AMC certificate handover.',
        status: 'upcoming',
        estimatedDate: '2026-09-08'
      }
    ]
  },
  {
    id: 'proj_skyline_002',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    projectName: 'Skyline Commercial Hub Lift #2',
    siteAddress: 'Viman Nagar Main Rd, Pune, MH 411014',
    buildingType: 'Commercial Complex (8 Floors)',
    elevatorType: 'AIEC Panoramic Glass Gearless 13-Passenger 1.75m/s',
    projectMode: 'ongoing_amc',
    currentStageCode: 'HANDOVER_COMPLETE',
    currentStageName: 'Active Gold Shield AMC Coverage',
    overallProgressPercent: 100,
    statusTone: 'normal',
    statusMessage: 'Fully operational & covered under AIEC Gold Shield 24x7 AMC contract.',
    nextMilestoneName: 'Quarterly Routine Service & Safety Audit',
    nextMilestoneDueDate: '2026-09-05',
    nextPaymentDueAmount: 0,
    nextPaymentDueDate: '2027-01-15',
    nextPaymentTitle: 'Annual AMC Renewal (1st Year Free Warranty)',
    unreadNotificationCount: 0,
    assignedLeadManagerName: 'Vikram Shinde (AMC Service Operations Lead)',
    assignedLeadManagerPhone: '+91 98220 44556',
    amcInfo: {
      planName: 'AIEC Gold Shield 24x7 Comprehensive AMC',
      contractEndDate: '2027-03-31',
      nextRoutineServiceDate: '2026-09-05',
      lastServiceDate: '2026-06-02',
      breakdownTicketsCount: 0
    },
    installationMilestones: [
      {
        id: 'sky_01',
        stageCode: 'STAGE_07',
        stageName: 'Final Customer Handover & License Handover',
        description: 'Elevator commissioned and handed over to society committee.',
        status: 'completed',
        estimatedDate: '2026-03-15',
        actualDate: '2026-03-14',
        completedByTechName: 'Sanjay Tukaram Deshmukh',
        linkedDocTitle: 'Handover Completion Certificate.pdf'
      }
    ]
  }
];

export const initialCustomerVaultDocuments: CustomerVaultDocument[] = [
  {
    id: 'doc_v101',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    documentTitle: 'AIEC Master Supply & Technical Contract (Signed)',
    category: 'contract',
    fileSize: '3.4 MB',
    issueDate: '2026-06-15',
    validUntilDate: '2027-06-15',
    downloadUrl: '/docs/AIEC_CONTRACT_ROYAL_HEIGHTS_A.pdf',
    versionTag: 'v1.0 Signed',
    verificationHash: 'SHA256: 8f9b...a120'
  },
  {
    id: 'doc_v102',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    documentTitle: 'AIEC Technical Quotation & Shaft Plan Specs',
    category: 'quotation',
    fileSize: '1.8 MB',
    issueDate: '2026-06-02',
    downloadUrl: '/docs/AIEC_QUOTATION_ROYAL_HEIGHTS_A.pdf',
    isSuperseded: true,
    supersededByDocTitle: 'AIEC Master Supply & Technical Contract (Signed)',
    versionTag: 'v1.0 Historical',
    verificationHash: 'SHA256: 4e2c...f902'
  },
  {
    id: 'doc_v103',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    documentTitle: 'Tax Invoice #INV-AIEC-2026-402 (Stage 1 & 2)',
    category: 'invoice_receipt',
    fileSize: '840 KB',
    issueDate: '2026-07-22',
    downloadUrl: '/docs/INV_AIEC_2026_402.pdf',
    versionTag: 'v1.0 Official GST',
    verificationHash: 'SHA256: 9b12...09e1'
  },
  {
    id: 'doc_v104',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    documentTitle: 'Civil Pit & Shaft Readiness Signoff Certificate',
    category: 'compliance_license',
    fileSize: '1.2 MB',
    issueDate: '2026-07-10',
    downloadUrl: '/docs/CIVIL_PIT_READINESS_ROYAL_A.pdf',
    versionTag: 'v1.0 Field Signoff',
    verificationHash: 'SHA256: 12ab...77ef'
  },
  {
    id: 'doc_v105',
    customerId: 'p_001',
    projectId: 'proj_skyline_002',
    projectName: 'Skyline Commercial Hub Lift #2',
    documentTitle: 'PWD Government Lift License & Safety Certificate',
    category: 'compliance_license',
    fileSize: '2.1 MB',
    issueDate: '2026-03-14',
    validUntilDate: '2027-03-13',
    downloadUrl: '/docs/PWD_LICENSE_SKYLINE_002.pdf',
    versionTag: 'v1.0 License',
    verificationHash: 'SHA256: 33aa...88dd'
  },
  {
    id: 'doc_v106',
    customerId: 'p_001',
    projectId: 'proj_skyline_002',
    projectName: 'Skyline Commercial Hub Lift #2',
    documentTitle: 'AIEC Gold Shield 24x7 AMC Agreement',
    category: 'warranty_amc',
    fileSize: '2.9 MB',
    issueDate: '2026-03-15',
    validUntilDate: '2027-03-14',
    downloadUrl: '/docs/AMC_GOLD_SHIELD_SKYLINE.pdf',
    versionTag: 'v1.0 Active Warranty',
    verificationHash: 'SHA256: 55ee...11ff'
  }
];

export const initialCustomerPaymentInstallments: CustomerPaymentInstallment[] = [
  {
    id: 'pay_inst_01',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    stageCode: 'STAGE_01',
    stageTitle: 'Advance Booking & Engineering Drawing Approval',
    milestoneTrigger: 'Upon contract signing & layout approval',
    percentageShare: 20,
    amount: 240000,
    dueDate: '2026-06-20',
    status: 'paid',
    paidDate: '2026-06-18',
    paymentMethod: 'UPI / HDFC Bank Transfer',
    transactionRef: 'TXN-HDFC-99882201',
    receiptDocTitle: 'Receipt #RCT-AIEC-2026-101.pdf',
    loanOptionEligible: false
  },
  {
    id: 'pay_inst_02',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    stageCode: 'STAGE_02',
    stageTitle: 'Factory Dispatch & Material Arrival at Site',
    milestoneTrigger: 'Gearless traction motor & guide rails unloaded at site',
    percentageShare: 40,
    amount: 480000,
    dueDate: '2026-07-25',
    status: 'paid',
    paidDate: '2026-07-22',
    paymentMethod: 'NEFT Direct Transfer',
    transactionRef: 'NEFT-AXIS-77881122',
    receiptDocTitle: 'Receipt #RCT-AIEC-2026-204.pdf',
    loanOptionEligible: false
  },
  {
    id: 'pay_inst_03',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    stageCode: 'STAGE_03',
    stageTitle: 'Mechanical Assembly & Cabin Wiring Completion',
    milestoneTrigger: 'Guide rails laser aligned & cabin sling mounted',
    percentageShare: 25,
    amount: 300000,
    dueDate: '2026-08-25',
    status: 'due',
    loanOptionEligible: true
  },
  {
    id: 'pay_inst_04',
    customerId: 'p_001',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    stageCode: 'STAGE_04',
    stageTitle: 'PWD Inspection & Final Handover Ceremony',
    milestoneTrigger: 'PWD safety license issued & keys handed to owner',
    percentageShare: 15,
    amount: 180000,
    dueDate: '2026-09-10',
    status: 'upcoming',
    loanOptionEligible: true
  }
];

export const initialCustomerSupportTickets: CustomerSupportTicket[] = [
  {
    id: 'tkt_cust_801',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    customerPhone: '+91 98220 11223',
    projectId: 'proj_skyline_002',
    projectName: 'Skyline Commercial Hub Lift #2',
    category: 'routine_service',
    urgency: 'normal',
    subject: 'Request for quarterly AMC preventive maintenance check',
    description: 'Please schedule our upcoming quarterly maintenance visit before August 28th as society committee audit is planned.',
    status: 'in_progress',
    estimatedResponseTime: 'Within 4 Hours',
    createdAt: '2026-08-12 10:30 AM',
    assignedTechName: 'Vikram Shinde (Service Lead)',
    assignedTechPhone: '+91 98220 44556',
    activityLog: [
      {
        timestamp: '2026-08-12 10:30 AM',
        author: 'Shri Rajeshwar Patil',
        role: 'Customer',
        message: 'Ticket created via Customer Portal.'
      },
      {
        timestamp: '2026-08-12 11:15 AM',
        author: 'Vikram Shinde',
        role: 'Service Operations Lead',
        message: 'Routine maintenance visit confirmed for August 20th morning slot (10:00 AM).'
      }
    ]
  },
  {
    id: 'tkt_cust_802',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    customerPhone: '+91 98220 11223',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A',
    category: 'billing_payment',
    urgency: 'low',
    subject: 'Request for updated GST Tax Invoice copy for Stage 2',
    description: 'We need the GST Tax invoice with our society GSTIN updated on document header.',
    status: 'resolved',
    estimatedResponseTime: 'Within 24 Hours',
    createdAt: '2026-07-24 02:15 PM',
    assignedTechName: 'Accountant Staff',
    activityLog: [
      {
        timestamp: '2026-07-24 02:15 PM',
        author: 'Shri Rajeshwar Patil',
        role: 'Customer',
        message: 'Request submitted for GST update.'
      },
      {
        timestamp: '2026-07-24 04:00 PM',
        author: 'AIEC Billing Team',
        role: 'Finance',
        message: 'Updated Tax Invoice re-issued and uploaded to Document Vault.'
      }
    ]
  }
];

export const initialCustomerSupportChatThreads: CustomerSupportChatThread[] = [
  {
    id: 'chat_thread_cust_001',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    customerPhone: '+91 98220 11223',
    projectId: 'proj_royal_001',
    projectName: 'Royal Heights Tower A Elevator Installation',
    status: 'human_assigned',
    assignedAgentName: 'Prashant Wable (MD & Support Desk)',
    assignedAgentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    contextSnapshot: {
      projectStage: 'Stage 4: Car Frame & Cabin Assembly',
      amcStatus: 'Pending Handover Registration',
      pendingDueAmount: 300000,
      openTicketsCount: 1
    },
    messages: [
      {
        id: 'msg_01',
        sender: 'bot',
        senderName: 'AIEC Assistant Bot 🤖',
        messageText: 'Namaste Shri Rajeshwar Patil! Welcome to AIEC Customer Care. How may I assist you today with Royal Heights Tower A?',
        timestamp: '10:00 AM'
      },
      {
        id: 'msg_02',
        sender: 'customer',
        senderName: 'Shri Rajeshwar Patil',
        messageText: 'Hello, when will the guide rail laser alignment inspection report be uploaded to my Document Vault?',
        timestamp: '10:02 AM'
      },
      {
        id: 'msg_03',
        sender: 'bot',
        senderName: 'AIEC Assistant Bot 🤖',
        messageText: 'Let me fetch your site log... Your site engineer Vikram Shinde completed Stage 3 laser alignment yesterday at 4:30 PM. Connecting you to Prashant Wable for document release signoff.',
        timestamp: '10:02 AM'
      },
      {
        id: 'msg_04',
        sender: 'human_agent',
        senderName: 'Prashant Wable',
        messageText: 'Namaste Rajeshwar ji! I have personally verified the laser alignment tolerance graph (+/- 0.5mm precision). The signed QC report is now available in your Vault.',
        timestamp: '10:05 AM'
      }
    ]
  }
];

export const initialCustomerFeedbackEntries: CustomerFeedbackEntry[] = [
  {
    id: 'fb_001',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    projectId: 'proj_skyline_002',
    projectName: 'Skyline Commercial Hub Lift #2',
    interactionContext: 'post_service_visit',
    overallScore: 5,
    ratings: {
      installationQuality: 5,
      communication: 5,
      timeliness: 4,
      valueForMoney: 5
    },
    commentText: 'Excellent preventive maintenance by technician Vikram Shinde. Elevator running smoothly without noise.',
    flaggedTechName: 'Vikram Shinde',
    adminOutreachRequired: false,
    createdAt: '2026-07-28'
  }
];

export const initialCustomerReferrals: CustomerReferralEntry[] = [
  {
    id: 'ref_101',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    referralCode: 'AIEC-RAJESHWAR-108',
    referredName: 'Mr. Suresh Deshmukh',
    referredPhone: '+91 98901 22334',
    referredCity: 'Chinchwad, Pune',
    referredProjectName: 'Deshmukh Commercial Complex (3 Elevator Shafts)',
    status: 'converted',
    estimatedCommissionReward: 15000,
    paidCommissionReward: 15000,
    createdAt: '2026-06-10',
    convertedAt: '2026-07-02'
  },
  {
    id: 'ref_102',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    referralCode: 'AIEC-RAJESHWAR-108',
    referredName: 'Mrs. Sunita Kulkarni',
    referredPhone: '+91 97654 33221',
    referredCity: 'Kothrud, Pune',
    referredProjectName: 'Kulkarni Residency Bungalow Lift',
    status: 'survey_completed',
    estimatedCommissionReward: 8000,
    paidCommissionReward: 0,
    createdAt: '2026-07-25'
  },
  {
    id: 'ref_103',
    customerId: 'p_001',
    customerName: 'Shri Rajeshwar Patil',
    referralCode: 'AIEC-RAJESHWAR-108',
    referredName: 'Pravin Builders (Shri Pravin Kakade)',
    referredPhone: '+91 94220 55667',
    referredCity: 'Baner, Pune',
    referredProjectName: 'Baner Grand Commercial Hub',
    status: 'invited',
    estimatedCommissionReward: 25000,
    paidCommissionReward: 0,
    createdAt: '2026-08-11'
  }
];

export const initialCustomerNotifications: CustomerInAppNotification[] = [
  {
    id: 'notif_201',
    customerId: 'p_001',
    title: 'Stage 4 QC Passed - Cabin Assembly',
    message: 'Your elevator cabin assembly at Royal Heights Tower A passed 32-point mechanical vibration QC test with zero defect flags.',
    category: 'milestone_update',
    readStatus: false,
    timestamp: 'Today, 09:30 AM',
    relatedScreenDeeplink: 'ProjectStatusTracker',
    isTransactional: true
  },
  {
    id: 'notif_202',
    customerId: 'p_001',
    title: 'Stage Payment Receipt Download Ready',
    message: 'Tax Invoice & Payment Receipt for Stage 3 (₹3,000,000) generated and stored safely in your Document Vault.',
    category: 'payment_reminder',
    readStatus: false,
    timestamp: 'Yesterday, 04:15 PM',
    relatedScreenDeeplink: 'CustomerPaymentInstallments',
    isTransactional: true
  },
  {
    id: 'notif_203',
    customerId: 'p_001',
    title: 'Scheduled AMC Preventive Visit Tomorrow',
    message: 'Senior Technician Vikram Shinde is scheduled for routine preventive lubrication and safety brake test tomorrow at 10:00 AM.',
    category: 'amc_renewal',
    readStatus: true,
    timestamp: '12 Aug 2026',
    relatedScreenDeeplink: 'CustomerAmcBooking',
    isTransactional: true
  },
  {
    id: 'notif_204',
    customerId: 'p_001',
    title: 'Referral Reward Credited: ₹15,000',
    message: 'Congratulations! Your referral for Mr. Suresh Deshmukh converted into an active installation project. ₹15,000 reward credited!',
    category: 'promotional',
    readStatus: true,
    timestamp: '05 Aug 2026',
    relatedScreenDeeplink: 'CustomerReferralProgram',
    isTransactional: false
  }
];

export const initialCustomerNotificationPreferences: CustomerNotificationPreferences = {
  customerId: 'p_001',
  whatsappEnabled: true,
  smsEnabled: true,
  pushEnabled: true,
  emailEnabled: true,
  allowPromotional: true,
  allowMilestones: true,
  allowPaymentReminders: true
};

export const initialAutomationRuleCategorySummaries: AutomationRuleCategorySummary[] = [
  {
    id: 'arc_101',
    categoryName: 'Communication Sequences',
    categoryKey: 'communication_sequences',
    activeRulesCount: 12,
    healthStatus: 'healthy',
    executionsToday: 148,
    successRatePercent: 99.3,
    isPausedGlobally: false,
    lastTriggeredAt: '2 mins ago',
    description: 'Drip WhatsApp, SMS & Email drip campaigns for lead followups, site visit confirmations, and contract milestones.'
  },
  {
    id: 'arc_102',
    categoryName: 'Payment Reminders & Escalations',
    categoryKey: 'payment_reminders',
    activeRulesCount: 8,
    healthStatus: 'healthy',
    executionsToday: 62,
    successRatePercent: 100,
    isPausedGlobally: false,
    lastTriggeredAt: '12 mins ago',
    description: 'Automated milestone due date alerts, overdue penalty notices, and finance manager escalation triggers.'
  },
  {
    id: 'arc_103',
    categoryName: 'Auto-PO & Procurement Triggers',
    categoryKey: 'auto_po_triggers',
    activeRulesCount: 6,
    healthStatus: 'healthy',
    executionsToday: 24,
    successRatePercent: 96.5,
    isPausedGlobally: false,
    lastTriggeredAt: '45 mins ago',
    description: 'Automated Purchase Order creation upon stage 2 approval, safety buffer reorders, and supplier SLA alerts.'
  },
  {
    id: 'arc_104',
    categoryName: 'Training & Refresher SOPs',
    categoryKey: 'training_refreshers',
    activeRulesCount: 5,
    healthStatus: 'healthy',
    executionsToday: 35,
    successRatePercent: 98.0,
    isPausedGlobally: false,
    lastTriggeredAt: '1 hour ago',
    description: 'Technician quarterly safety re-certification prompts, failed SOP quiz retakes, and badge renewal alerts.'
  },
  {
    id: 'arc_105',
    categoryName: 'Sales Contest & Leaderboards',
    categoryKey: 'contest_lifecycle',
    activeRulesCount: 3,
    healthStatus: 'healthy',
    executionsToday: 89,
    successRatePercent: 100,
    isPausedGlobally: false,
    lastTriggeredAt: '18 mins ago',
    description: 'Real-time sales deal points computation, leaderboard ranking updates, and milestone badge broadcasts.'
  },
  {
    id: 'arc_106',
    categoryName: 'Custom Workflow Triggers',
    categoryKey: 'custom_workflows',
    activeRulesCount: 7,
    healthStatus: 'healthy',
    executionsToday: 51,
    successRatePercent: 97.8,
    isPausedGlobally: false,
    lastTriggeredAt: '5 mins ago',
    description: 'Admin-defined if-this-then-that automation scenarios for stale leads, site delay warnings, and AMC renewals.'
  }
];

export const initialAutomationRuleActivityLogs: AutomationRuleActivityLog[] = [
  {
    id: 'act_901',
    ruleCategoryKey: 'custom_workflows',
    ruleName: '10-Day Stale High-Value Lead Alert',
    triggerEvent: 'Lead untouched for >10 days AND contract > ₹15L',
    actionTaken: 'Sent urgent WhatsApp & reassigned to Senior Sales Manager',
    targetEntity: 'Lead #L-8902 (Royal Heights Builder)',
    status: 'success',
    timestamp: 'Today, 10:22 AM',
    latencyMs: 142
  },
  {
    id: 'act_902',
    ruleCategoryKey: 'payment_reminders',
    ruleName: 'Stage 3 Milestone Due Date Warning',
    triggerEvent: 'Payment due in 3 days (₹3,000,000)',
    actionTaken: 'Generated GST payment slip & sent customer reminder',
    targetEntity: 'Payment #P-302 (Skyline Hub)',
    status: 'success',
    timestamp: 'Today, 09:45 AM',
    latencyMs: 98
  },
  {
    id: 'act_903',
    ruleCategoryKey: 'auto_po_triggers',
    ruleName: 'Safety Gear Low Stock Auto-PO',
    triggerEvent: 'Harness inventory dropped below minimum buffer (5 units)',
    actionTaken: 'Auto-drafted PO #PO-8821 to Apex Safety Solutions',
    targetEntity: 'Supplier Apex Safety',
    status: 'success',
    timestamp: 'Today, 08:30 AM',
    latencyMs: 310
  },
  {
    id: 'act_904',
    ruleCategoryKey: 'communication_sequences',
    ruleName: 'Post Site-Survey Feedback Drip',
    triggerEvent: 'Surveyor submitted site report with 100% readiness',
    actionTaken: 'Dispatched digital layout CAD & survey summary link',
    targetEntity: 'Customer Shri Rajeshwar Patil',
    status: 'success',
    timestamp: 'Yesterday, 06:15 PM',
    latencyMs: 120
  },
  {
    id: 'act_905',
    ruleCategoryKey: 'training_refreshers',
    ruleName: 'Elevator Brake SOP Quarterly Quiz Prompt',
    triggerEvent: 'Technician certification expires in 7 days',
    actionTaken: 'Triggered in-app module assignment & push notification',
    targetEntity: 'Tech Vikram Shinde',
    status: 'success',
    timestamp: 'Yesterday, 04:00 PM',
    latencyMs: 85
  }
];

export const initialCustomWorkflowTriggerRules: CustomWorkflowTriggerRule[] = [
  {
    id: 'cwr_501',
    name: '10-Day Stale High-Value Lead Alert',
    description: 'Triggers when a high-value quotation (>₹15L) sits without customer contact for over 10 days.',
    triggerEvent: 'lead_inactive_10_days',
    conditions: [
      { field: 'deal_value', operator: 'greater_than', value: '1500000' },
      { field: 'days_since_last_contact', operator: 'greater_than', value: '10' }
    ],
    actions: [
      { type: 'notify_admin', details: 'Send priority SMS to MD Prashant Wable' },
      { type: 'create_escalation', details: 'Create CRM ticket assigned to Lead Sales Manager' }
    ],
    status: 'active',
    executionsCount: 28,
    lastExecutedAt: 'Today, 10:22 AM',
    createdAt: '2026-05-10'
  },
  {
    id: 'cwr_502',
    name: 'Site Readiness Delay Auto-Escalation',
    description: 'Triggers when civil shaft dimensions are unverified 5 days past promised readiness date.',
    triggerEvent: 'site_delay_flagged',
    conditions: [
      { field: 'shaft_readiness_status', operator: 'equals', value: 'pending_verification' },
      { field: 'delay_days', operator: 'greater_than', value: '5' }
    ],
    actions: [
      { type: 'send_whatsapp', details: 'Send gentle site preparation reminder checklist to builder' },
      { type: 'notify_admin', details: 'Log delay warning on Master Executive Dashboard' }
    ],
    status: 'active',
    executionsCount: 14,
    lastExecutedAt: 'Yesterday, 02:15 PM',
    createdAt: '2026-06-01'
  },
  {
    id: 'cwr_503',
    name: 'AMC Expiry 15-Day Renewal Auto-Discount',
    description: 'Sends automated early renewal WhatsApp with 5% loyalty discount when AMC coverage expires in 15 days.',
    triggerEvent: 'amc_due_within_15_days',
    conditions: [
      { field: 'days_to_amc_expiry', operator: 'equals', value: '15' },
      { field: 'customer_rating', operator: 'greater_than', value: '4' }
    ],
    actions: [
      { type: 'send_whatsapp', details: 'Send Gold Shield AMC early renewal link with 5% discount code' }
    ],
    status: 'active',
    executionsCount: 42,
    lastExecutedAt: '12 Aug 2026',
    createdAt: '2026-06-15'
  }
];

export const initialInternalNotificationTemplates: InternalNotificationTemplate[] = [
  {
    id: 'int_tpl_001',
    notificationTypeId: 'nt_sos_alert',
    title: 'Technician Emergency SOS Alert',
    category: 'sos_alert',
    urgencyTag: 'critical',
    recipientRoles: ['admin'],
    channels: {
      inAppPush: true,
      sms: true,
      email: true,
      whatsapp: true
    },
    templateContent: '[CRITICAL SOS] Emergency triggered by {{technicianName}} at Site {{siteName}} (Job {{jobId}}). Location: {{locationCoordinates}}. Immediate action required!',
    monthlyTriggerCount: 3,
    isActive: true,
    lastUpdated: '2026-08-01'
  },
  {
    id: 'int_tpl_002',
    notificationTypeId: 'nt_payout_failure',
    title: 'Automated Commission Payout Disbursement Failure',
    category: 'payout_failure',
    urgencyTag: 'high',
    recipientRoles: ['admin'],
    channels: {
      inAppPush: true,
      sms: false,
      email: true,
      whatsapp: true
    },
    templateContent: '[PAYOUT ALERT] Disbursement failed for Partner {{partnerName}} (Payout ID: {{payoutId}}, Amount: ₹{{amount}}). Reason: {{bankFailureReason}}. Please review in Finance Control Unit.',
    monthlyTriggerCount: 12,
    isActive: true,
    lastUpdated: '2026-07-28'
  },
  {
    id: 'int_tpl_003',
    notificationTypeId: 'nt_delivery_delay',
    title: 'Supplier Material Shipment Delay Warning',
    category: 'delivery_delay',
    urgencyTag: 'high',
    recipientRoles: ['admin'],
    channels: {
      inAppPush: true,
      sms: false,
      email: true,
      whatsapp: false
    },
    templateContent: '[DELIVERY DELAY] PO {{poNumber}} from Supplier {{supplierName}} is delayed by {{delayDays}} days. Impacted Site: {{siteName}}. New ETA: {{revisedEta}}.',
    monthlyTriggerCount: 28,
    isActive: true,
    lastUpdated: '2026-08-05'
  },
  {
    id: 'int_tpl_004',
    notificationTypeId: 'nt_new_lead',
    title: 'High-Value Enterprise Lead Inflow',
    category: 'new_lead',
    urgencyTag: 'normal',
    recipientRoles: ['admin'],
    channels: {
      inAppPush: true,
      sms: false,
      email: false,
      whatsapp: true
    },
    templateContent: '[NEW LEAD] High-value inquiry received: {{leadName}} ({{city}}). Estimated value: ₹{{estimatedValue}} L. Assigned to Senior Sales Manager.',
    monthlyTriggerCount: 65,
    isActive: true,
    lastUpdated: '2026-08-10'
  },
  {
    id: 'int_tpl_005',
    notificationTypeId: 'nt_site_issue',
    title: 'Civil Shaft Dimension Misalignment Flagged',
    category: 'site_issue',
    urgencyTag: 'high',
    recipientRoles: ['admin'],
    channels: {
      inAppPush: true,
      sms: false,
      email: true,
      whatsapp: true
    },
    templateContent: '[SITE ISSUE] Mechanical inspector flagged shaft dimensional mismatch at Site {{siteName}}. Structural modification required before rail installation.',
    monthlyTriggerCount: 8,
    isActive: true,
    lastUpdated: '2026-08-11'
  }
];

export const initialEscalationChainConfigs: EscalationChainConfig[] = [
  {
    id: 'esc_cfg_001',
    scenarioKey: 'sos_unacknowledged',
    scenarioName: 'Unacknowledged Safety SOS Emergency',
    description: 'Triggered when a technician field SOS remains unacknowledged by Admin within 3 minutes.',
    initialTriggerDelayMins: 3,
    tiers: [
      {
        tierLevel: 1,
        roleOrContactName: 'Primary Admin (Mr. Prashant Vasant Wable)',
        phoneEmail: '+91 98765 43210',
        channels: ['in_app', 'sms', 'call', 'whatsapp'],
        delayMinsAfterPrevious: 0
      },
      {
        tierLevel: 2,
        roleOrContactName: 'Field Safety Operations Manager',
        phoneEmail: '+91 98111 22233',
        channels: ['call', 'sms', 'whatsapp'],
        delayMinsAfterPrevious: 5
      },
      {
        tierLevel: 3,
        roleOrContactName: 'Regional MD Backup Hotline (24x7)',
        phoneEmail: '+91 99999 00000',
        channels: ['call'],
        delayMinsAfterPrevious: 10
      }
    ],
    backupContact: {
      name: 'Er. Rajesh V. Patil (Safety Officer)',
      roleTitle: 'Chief Technical Director',
      phone: '+91 98220 11223',
      email: 'rajesh.patil@aiec-elevators.com',
      isSecondaryFallbackActive: true
    },
    lastDrillTestDate: '2026-08-01',
    lastDrillStatus: 'passed'
  },
  {
    id: 'esc_cfg_002',
    scenarioKey: 'critical_exception',
    scenarioName: 'Unresolved Critical Exception & Quality Failure',
    description: 'Triggered when a Stage-3 QC electrical failure or safety hazard goes unresolved for > 2 hours.',
    initialTriggerDelayMins: 120,
    tiers: [
      {
        tierLevel: 1,
        roleOrContactName: 'Lead Installation Inspector',
        phoneEmail: '+91 98333 44455',
        channels: ['in_app', 'whatsapp'],
        delayMinsAfterPrevious: 0
      },
      {
        tierLevel: 2,
        roleOrContactName: 'Primary Admin (Mr. Prashant Vasant Wable)',
        phoneEmail: '+91 98765 43210',
        channels: ['in_app', 'sms', 'whatsapp'],
        delayMinsAfterPrevious: 30
      }
    ],
    backupContact: {
      name: 'Sunil Deshmukh (Quality Audit Lead)',
      roleTitle: 'Quality Assurance Manager',
      phone: '+91 98444 55566',
      email: 'sunil.deshmukh@aiec-elevators.com',
      isSecondaryFallbackActive: true
    },
    lastDrillTestDate: '2026-07-15',
    lastDrillStatus: 'passed'
  },
  {
    id: 'esc_cfg_003',
    scenarioKey: 'payout_dispute',
    scenarioName: 'Unresolved Partner Payout Dispute',
    description: 'Triggered when a partner commission payment dispute remains unreviewed for > 24 hours.',
    initialTriggerDelayMins: 1440,
    tiers: [
      {
        tierLevel: 1,
        roleOrContactName: 'Finance Disbursement Specialist',
        phoneEmail: '+91 98555 66677',
        channels: ['in_app', 'email'],
        delayMinsAfterPrevious: 0
      },
      {
        tierLevel: 2,
        roleOrContactName: 'Primary Admin (Mr. Prashant Vasant Wable)',
        phoneEmail: '+91 98765 43210',
        channels: ['in_app', 'whatsapp'],
        delayMinsAfterPrevious: 120
      }
    ],
    backupContact: {
      name: 'Anjali Sharma (Accounts Head)',
      roleTitle: 'Finance Controller',
      phone: '+91 98666 77788',
      email: 'accounts@aiec-elevators.com',
      isSecondaryFallbackActive: false
    },
    lastDrillTestDate: '2026-06-20',
    lastDrillStatus: 'failed_gap_detected'
  }
];

export const initialSlaProcessItems: SlaProcessItem[] = [
  {
    id: 'sla_proc_101',
    slaCategory: 'customer_reply',
    processName: 'Customer Inquiry Response Time',
    relatedRecordId: 'TKT-8801 (Shri Rajeshwar Patil)',
    targetDurationHours: 2,
    currentElapsedHours: 3.5,
    breachStatus: 'breached',
    isPausedFairly: false,
    responsibleRole: 'Customer Support Lead',
    lastUpdated: '10 mins ago'
  },
  {
    id: 'sla_proc_102',
    slaCategory: 'payment_dispute',
    processName: 'Customer Invoice Dispute Resolution',
    relatedRecordId: 'DISP-302 (Skyline Commercial Hub)',
    targetDurationHours: 24,
    currentElapsedHours: 18,
    breachStatus: 'warning',
    isPausedFairly: true,
    pauseReason: 'Waiting for customer bank statement submission',
    responsibleRole: 'Finance Manager',
    lastUpdated: '25 mins ago'
  },
  {
    id: 'sla_proc_103',
    slaCategory: 'payout_dispute',
    processName: 'Partner Commission Dispute Verification',
    relatedRecordId: 'PD-409 (Technician Suresh More)',
    targetDurationHours: 12,
    currentElapsedHours: 4,
    breachStatus: 'on_track',
    isPausedFairly: false,
    responsibleRole: 'Partner Ops Admin',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'sla_proc_104',
    slaCategory: 'delivery_delay',
    processName: 'Supplier Dispatch Acknowledgment',
    relatedRecordId: 'PO-8821 (Apex Safety Gear)',
    targetDurationHours: 6,
    currentElapsedHours: 8.2,
    breachStatus: 'breached',
    isPausedFairly: false,
    responsibleRole: 'Procurement Specialist',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'sla_proc_105',
    slaCategory: 'technician_checkin',
    processName: 'Field Site Check-In Verification',
    relatedRecordId: 'JOB-7702 (Amanora Tower B)',
    targetDurationHours: 1,
    currentElapsedHours: 0.4,
    breachStatus: 'on_track',
    isPausedFairly: false,
    responsibleRole: 'Field Coordinator',
    lastUpdated: '15 mins ago'
  }
];

export const initialSlaCategoryTrends: SlaCategoryTrend[] = [
  {
    categoryKey: 'customer_reply',
    categoryName: 'Customer Inquiry Response',
    complianceRatePercent: 94.2,
    trendDirection: 'improving',
    avgResolutionTimeHours: 1.4,
    totalActiveTracked: 18,
    totalBreaches30Days: 4
  },
  {
    categoryKey: 'payment_dispute',
    categoryName: 'Payment & Invoice Dispute Resolution',
    complianceRatePercent: 88.5,
    trendDirection: 'declining',
    avgResolutionTimeHours: 19.8,
    totalActiveTracked: 6,
    totalBreaches30Days: 7
  },
  {
    categoryKey: 'payout_dispute',
    categoryName: 'Partner Payout Dispute Verification',
    complianceRatePercent: 98.0,
    trendDirection: 'stable',
    avgResolutionTimeHours: 5.2,
    totalActiveTracked: 4,
    totalBreaches30Days: 1
  },
  {
    categoryKey: 'delivery_delay',
    categoryName: 'Supplier Dispatch Acknowledgment',
    complianceRatePercent: 82.1,
    trendDirection: 'declining',
    avgResolutionTimeHours: 7.8,
    totalActiveTracked: 12,
    totalBreaches30Days: 11
  },
  {
    categoryKey: 'technician_checkin',
    categoryName: 'Field Site Check-In Verification',
    complianceRatePercent: 99.1,
    trendDirection: 'improving',
    avgResolutionTimeHours: 0.3,
    totalActiveTracked: 24,
    totalBreaches30Days: 2
  }
];

export const initialCustomerAmcBookings: CustomerAmcBooking[] = [
  {
    id: 'amc_bkg_101',
    customerId: 'cust_2026_01',
    customerName: 'Shri Rajeshwar Patil',
    customerPhone: '+91 98220 11223',
    projectName: 'Patil Villa Residence',
    siteCity: 'Pune',
    liftModelName: 'Imperial Gearless MRL 6-Pass',
    planName: 'Comprehensive Gold Care AMC',
    annualFeeAmount: 48000,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    paymentStatus: 'paid',
    status: 'active',
    breakdownVisitsIncluded: 6,
    breakdownVisitsUsed: 1
  }
];

export const initialIntegrationTechnicalHealth: IntegrationTechnicalHealth[] = [
  {
    id: 'integ_razorpay',
    integrationName: 'Razorpay / HDFC Payment Gateway',
    providerCategory: 'payment_gateway',
    technicalStatus: 'operational',
    providerReportedStatus: 'operational',
    providerStatusUrl: 'https://status.razorpay.com',
    uptimePct: 99.98,
    recentErrorRate: 0.01,
    aiecObservedErrorRate: 0.01,
    lastIncidentTimestamp: '2026-07-12 14:20 IST',
    activeIncidentsCount: 0
  },
  {
    id: 'integ_whatsapp',
    integrationName: 'WhatsApp Business API (Gupshup / Meta)',
    providerCategory: 'whatsapp_api',
    technicalStatus: 'degraded',
    providerReportedStatus: 'operational',
    providerStatusUrl: 'https://status.gupshup.io',
    uptimePct: 98.45,
    recentErrorRate: 0.08,
    aiecObservedErrorRate: 4.85, // AIEC observed high failure rate due to template bottleneck!
    lastIncidentTimestamp: '2026-08-14 02:15 IST',
    activeIncidentsCount: 1
  },
  {
    id: 'integ_maps',
    integrationName: 'Google Maps & Geolocation API',
    providerCategory: 'maps_geolocation',
    technicalStatus: 'operational',
    providerReportedStatus: 'operational',
    providerStatusUrl: 'https://status.cloud.google.com/maps-platform',
    uptimePct: 99.99,
    recentErrorRate: 0.00,
    aiecObservedErrorRate: 0.00,
    lastIncidentTimestamp: '2026-05-30 09:00 IST',
    activeIncidentsCount: 0
  },
  {
    id: 'integ_loan_partner',
    integrationName: 'Tata Capital / Bajaj Finance Loan API',
    providerCategory: 'loan_partner_api',
    technicalStatus: 'operational',
    providerReportedStatus: 'operational',
    providerStatusUrl: 'https://developer.tatacapital.com/status',
    uptimePct: 99.50,
    recentErrorRate: 0.30,
    aiecObservedErrorRate: 0.35,
    lastIncidentTimestamp: '2026-08-02 11:45 IST',
    activeIncidentsCount: 0
  },
  {
    id: 'integ_sms',
    integrationName: 'ValueFirst DLT SMS Gateway',
    providerCategory: 'sms_gateway',
    technicalStatus: 'operational',
    providerReportedStatus: 'operational',
    providerStatusUrl: 'https://status.valuefirst.com',
    uptimePct: 99.80,
    recentErrorRate: 0.12,
    aiecObservedErrorRate: 0.15,
    lastIncidentTimestamp: '2026-07-29 18:30 IST',
    activeIncidentsCount: 0
  }
];

export const initialTechnicalIncidentLogs: TechnicalIncidentLog[] = [
  {
    id: 'inc_901',
    integrationName: 'WhatsApp Business API (Gupshup / Meta)',
    title: 'Meta WhatsApp Template Webhook Rate Limit Spike',
    severity: 'warning',
    timestamp: '2026-08-14 02:15 IST',
    status: 'investigating',
    summary: 'Third-party status page shows Operational, but AIEC observed a 4.85% delivery webhook timeout rate for dispatching automated AMC renewal notices. 14 requests queued.',
    queuedRequestsReprocessingNeeded: true
  },
  {
    id: 'inc_890',
    integrationName: 'Razorpay / HDFC Payment Gateway',
    title: 'HDFC Netbanking Intermittent Timed-Out Callbacks',
    severity: 'info',
    timestamp: '2026-07-12 14:20 IST',
    status: 'resolved',
    summary: 'Bank server maintenance led to delayed webhook callbacks for 3 customer milestone token payments. Auto-synced after 20 minutes.',
    queuedRequestsReprocessingNeeded: false
  }
];

export const initialAutomatedActionAuditEntries: AutomatedActionAuditEntry[] = [
  {
    auditEntryId: 'aud_10089',
    automationSource: 'WorkflowTriggerBuilder #WT-101',
    ruleId: 'rule_po_auto_01',
    ruleName: 'Auto-Draft Shaft Material PO',
    triggeringCondition: 'Deal Stage changed to "Contract Signed & Advance Token Received"',
    actionTaken: 'Auto-drafted Purchase Order #PO-2026-8809 for Supplier Apex Elevator Components (Value: ₹3,45,000)',
    affectedRecordId: 'DEAL-7701 (Patil Villa Residence)',
    category: 'po_drafted',
    timestamp: '2026-08-14 02:30 IST',
    payloadDetails: '{\n  "poNumber": "PO-2026-8809",\n  "supplierId": "sup_apex_01",\n  "advancePercent": 30,\n  "itemsCount": 12\n}',
    executionStatus: 'success',
    wasManualOverride: false
  },
  {
    auditEntryId: 'aud_10088',
    automationSource: 'WorkflowTriggerBuilder #WT-104',
    ruleId: 'rule_amc_whatsapp_02',
    ruleName: 'Send AMC Renewal Notice on WhatsApp',
    triggeringCondition: 'AMC Contract expiry within 30 days',
    actionTaken: 'Dispatched automated WhatsApp notification with UPI payment link to Shri Rajeshwar Patil (+91 98220 11223)',
    affectedRecordId: 'AMC-BKG-101',
    category: 'message_sent',
    timestamp: '2026-08-14 01:15 IST',
    payloadDetails: '{\n  "recipient": "+91 98220 11223",\n  "template": "amc_renewal_gold",\n  "amount": 48000\n}',
    executionStatus: 'success',
    wasManualOverride: false
  },
  {
    auditEntryId: 'aud_10087',
    automationSource: 'MasterAutomationRulesDashboard #M-003',
    ruleId: 'rule_payout_disburse_01',
    ruleName: 'Disburse Weekly Partner Commission',
    triggeringCondition: 'Weekly Payout Batch Cron Execution on Friday 00:00 IST',
    actionTaken: 'Initiated net disbursement of ₹68,400 to 4 verified partners via Razorpay Route API',
    affectedRecordId: 'BATCH-2026-W32',
    category: 'payout_initiated',
    timestamp: '2026-08-14 00:01 IST',
    payloadDetails: '{\n  "batchId": "BATCH-2026-W32",\n  "totalAmount": 68400,\n  "partnersCount": 4\n}',
    executionStatus: 'success',
    wasManualOverride: false
  },
  {
    auditEntryId: 'aud_10086',
    automationSource: 'Manual Override Console',
    ruleId: 'override_force_payout_902',
    ruleName: 'Manual Force Payout Override',
    triggeringCondition: 'Admin forced payout override due to manual GST document verification offline',
    actionTaken: 'Force-approved commission payout entry #COMM-7712 (₹14,500) for Technician Suresh More',
    affectedRecordId: 'COMM-7712',
    category: 'manual_override',
    timestamp: '2026-08-13 18:45 IST',
    payloadDetails: '{\n  "adminId": "admin_prashant",\n  "mandatoryReason": "Physical GST clearance certificate submitted directly by partner via WhatsApp."\n}',
    executionStatus: 'overridden',
    wasManualOverride: true,
    overrideReason: 'Physical GST clearance certificate submitted directly by partner via WhatsApp.'
  }
];

export const initialManualOverrideLogEntries: ManualOverrideLogEntry[] = [
  {
    overrideId: 'ovr_902',
    targetRecordId: 'COMM-7712 (Suresh More)',
    targetModule: 'partner_payouts',
    overrideAction: 'Force Approve Commission Payout',
    mandatoryReason: 'Physical GST clearance certificate submitted directly by partner via WhatsApp.',
    adminId: 'admin_prashant',
    adminName: 'Mr. Prashant Vasant Wable',
    previousState: 'hold_pending_gst_verification',
    forcedNextState: 'approved_pending_payout',
    timestamp: '2026-08-13 18:45 IST',
    isSafetyCriticalBlocked: false,
    downstreamEffectsPreview: [
      'Commission status updated to Approved in Partner Ledger.',
      'Notification dispatched to Partner Suresh More.',
      'Auto-added to upcoming Friday Disbursement Batch.'
    ]
  },
  {
    overrideId: 'ovr_901',
    targetRecordId: 'DEAL-6602 (Skyline Commercial Hub)',
    targetModule: 'crm_leads',
    overrideAction: 'Advance CRM Pipeline Stage to Site Survey Scheduled',
    mandatoryReason: 'Architect confirmed site survey window verbally over phone call.',
    adminId: 'admin_prashant',
    adminName: 'Mr. Prashant Vasant Wable',
    previousState: 'new_lead_inflow',
    forcedNextState: 'site_survey_scheduled',
    timestamp: '2026-08-12 11:20 IST',
    isSafetyCriticalBlocked: false,
    downstreamEffectsPreview: [
      'Surveyor Lead Auto-Assignment triggered.',
      'Calendar slot reserved in Field Surveyor Schedule.'
    ]
  }
];

export const initialApiIntegrationConfigs: ApiIntegrationConfig[] = [
  {
    id: 'api_razorpay',
    integrationName: 'Razorpay PG & Disbursement Route API',
    providerCategory: 'payment_gateway',
    connectionStatus: 'connected',
    lastSyncTimestamp: '2026-08-14 04:50 IST',
    credentialLastRotated: '2026-06-15',
    sandboxModeEnabled: false,
    maskedApiKey: 'rzp_live_891****a901',
    maskedSecretKey: '••••••••••••••••34d2',
    webhookEndpointUrl: 'https://api.aiec.in/webhooks/razorpay/v1',
    environmentLabel: 'Production',
    syncHealthPct: 99.98
  },
  {
    id: 'api_whatsapp',
    integrationName: 'Meta WhatsApp Business API (Gupshup BSP)',
    providerCategory: 'whatsapp_api',
    connectionStatus: 'degraded',
    lastSyncTimestamp: '2026-08-14 02:15 IST',
    credentialLastRotated: '2026-05-20',
    sandboxModeEnabled: false,
    maskedApiKey: 'gupshup_live_waba_773****881',
    maskedSecretKey: '••••••••••••••••77a1',
    webhookEndpointUrl: 'https://api.aiec.in/webhooks/whatsapp/inbound',
    environmentLabel: 'Production',
    syncHealthPct: 95.15
  },
  {
    id: 'api_maps',
    integrationName: 'Google Maps & Places Geolocation API',
    providerCategory: 'maps_geolocation',
    connectionStatus: 'connected',
    lastSyncTimestamp: '2026-08-14 05:00 IST',
    credentialLastRotated: '2026-07-01',
    sandboxModeEnabled: false,
    maskedApiKey: 'AIzaSyA891****x9021',
    maskedSecretKey: '••••••••••••••••90bc',
    webhookEndpointUrl: 'N/A (Client SDK Direct)',
    environmentLabel: 'Production',
    syncHealthPct: 99.99
  },
  {
    id: 'api_tatacapital',
    integrationName: 'Tata Capital Commercial Lift Loan API',
    providerCategory: 'loan_partner_api',
    connectionStatus: 'testing',
    lastSyncTimestamp: '2026-08-13 16:30 IST',
    credentialLastRotated: '2026-08-01',
    sandboxModeEnabled: true,
    maskedApiKey: 'tata_sandbox_key_112****902',
    maskedSecretKey: '••••••••••••••••55b1',
    webhookEndpointUrl: 'https://sandbox.aiec.in/webhooks/loans/tatacapital',
    environmentLabel: 'Sandbox/Test Mode',
    syncHealthPct: 100.00
  },
  {
    id: 'api_valuefirst_sms',
    integrationName: 'ValueFirst DLT Bulk SMS Gateway',
    providerCategory: 'sms_gateway',
    connectionStatus: 'connected',
    lastSyncTimestamp: '2026-08-14 03:00 IST',
    credentialLastRotated: '2026-04-10',
    sandboxModeEnabled: false,
    maskedApiKey: 'vf_dlt_live_9921****',
    maskedSecretKey: '••••••••••••••••11ff',
    webhookEndpointUrl: 'https://api.aiec.in/webhooks/sms/dltdelivery',
    environmentLabel: 'Production',
    syncHealthPct: 99.80
  }
];

export const initialAutomationTestScenarios: AutomationTestScenario[] = [
  {
    testScenarioId: 'scen_101',
    scenarioTitle: 'High-Value Lead Intake & Architect Priority Routing',
    scenarioCategory: 'crm_lead_intake',
    sampleDataDescription: 'Commercial 10-Passenger MRL Glass Lift Inquiry (Budget ₹22 Lakhs) with Architect referral tag.',
    samplePayloadJson: '{\n  "leadName": "Shri Aniket Deshmukh",\n  "city": "Pune",\n  "liftType": "Commercial Glass MRL 10-Pass",\n  "estimatedBudget": 2200000,\n  "hasArchitectReferral": true\n}',
    testedRuleReference: 'WorkflowTriggerBuilder #WT-101',
    testedRuleName: 'High-Value Lead Priority Assignment',
    expectedOutcome: 'Tag as Urgent VIP, Auto-Assign Senior Sales Lead within 5 mins, Send WhatsApp Brochure.',
    simulatedOutcome: 'Tag as Urgent VIP, Auto-Assign Senior Sales Lead within 5 mins, Send WhatsApp Brochure.',
    expectedVsActualMatch: true,
    promotionStatus: 'promoted_to_production',
    lastTestedAt: '2026-08-10 14:30 IST',
    testRunLog: [
      '[14:30:01] Simulated payload ingested.',
      '[14:30:02] WT-101 condition evaluated: Budget >= ₹15L (MATCH).',
      '[14:30:02] Expected action sequence matched 100% with simulated dry-run.'
    ]
  },
  {
    testScenarioId: 'scen_102',
    scenarioTitle: 'Overdue Installation Milestone Payment Escalation',
    scenarioCategory: 'overdue_payment',
    sampleDataDescription: 'Milestone 2 (Shaft Readiness & Material Dispatch) payment delayed by 7 days past due date.',
    samplePayloadJson: '{\n  "customerName": "Rohan Builders",\n  "invoiceNumber": "INV-2026-9081",\n  "dueAmount": 350000,\n  "daysOverdue": 7\n}',
    testedRuleReference: 'WorkflowTriggerBuilder #WT-108',
    testedRuleName: '7-Day Payment Delay Escalation to Regional Lead',
    expectedOutcome: 'Dispatch polite WhatsApp reminder + UPI link, freeze material dispatch, assign escalation item to Regional Sales Manager.',
    simulatedOutcome: 'Dispatch polite WhatsApp reminder + UPI link, freeze material dispatch, assign escalation item to Regional Sales Manager.',
    expectedVsActualMatch: true,
    promotionStatus: 'tested_passed',
    lastTestedAt: '2026-08-13 11:15 IST',
    testRunLog: [
      '[11:15:00] Ingested overdue invoice payload.',
      '[11:15:01] Evaluated WT-108 rule logic against simulated state.',
      '[11:15:01] Match confirmed. Ready for production promotion.'
    ]
  }
];

export const initialCompanyProfileConfig: CompanyProfileConfig = {
  companyName: 'ALL INDIA ELEVATORS COMPANY (AIEC)',
  ownerName: 'Mr. Prashant Vasant Wable',
  tagline: 'Engineering Vertical Mobility Across India with Safety & Precision',
  gstin: '27AAAAA0000A1Z5',
  registeredAddress: 'Plot 42, AIEC Elevators Industrial Complex, Bhosari MIDC, Pune, Maharashtra 411026, India',
  supportPhone: '+91 98765 43210',
  supportEmail: 'contact@aiecelevators.in',
  websiteUrl: 'https://www.aiecelevators.in',
  logoAssetUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=150&auto=format&fit=crop&q=80',
  brandPrimaryColor: '#B8873D',
  brandSecondaryColor: '#0E4B3D',
  activeThemeMode: 'alabaster_light',
  versionHistory: [
    {
      versionId: 'v1.0.0',
      updatedAt: '2026-01-15',
      updatedBy: 'Mr. Prashant Vasant Wable',
      companyName: 'ALL INDIA ELEVATORS COMPANY (AIEC)',
      ownerName: 'Mr. Prashant Vasant Wable',
      gstin: '27AAAAA0000A1Z5',
      registeredAddress: 'Plot 42, AIEC Elevators Industrial Complex, Bhosari MIDC, Pune, Maharashtra 411026, India',
      logoAssetUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=150&auto=format&fit=crop&q=80',
      changeSummary: 'Initial company profile and Alabaster & Ascension brand identity lock.'
    }
  ]
};

export const initialRolePermissionConfigs: RolePermissionConfig[] = [
  {
    roleId: 'admin',
    roleName: 'System Admin (Owner)',
    roleDescription: 'Full unconstrained platform control, financial approvals, automation rules, and security governance.',
    isSystemProtectedRole: true,
    userCount: 1,
    modulePermissions: [
      { moduleId: 'crm', moduleName: 'CRM & Pipeline', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'quotations', moduleName: 'Quotations & Contracts', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'field_jobs', moduleName: 'Installation & Field Jobs', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'qc_inspections', moduleName: 'QC Mechanical & Electrical Safety', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'payouts', moduleName: 'Partner Commissions & Payouts', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'procurement', moduleName: 'PO & Supplier Procurement', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'automations', moduleName: 'Automation Engine & Rules', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true },
      { moduleId: 'settings', moduleName: 'Settings & Security Governance', canRead: true, canWrite: true, canApprove: true, canOverride: true, canExport: true }
    ],
    updatedAt: '2026-08-01',
    updatedBy: 'Mr. Prashant Vasant Wable'
  },
  {
    roleId: 'surveyor',
    roleName: 'Site Surveyor / Sales Engineer',
    roleDescription: 'Site measurement intake, lead stage updating, site readiness checks, and basic quotation creation.',
    isSystemProtectedRole: false,
    userCount: 8,
    modulePermissions: [
      { moduleId: 'crm', moduleName: 'CRM & Pipeline', canRead: true, canWrite: true, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'quotations', moduleName: 'Quotations & Contracts', canRead: true, canWrite: true, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'field_jobs', moduleName: 'Installation & Field Jobs', canRead: true, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'qc_inspections', moduleName: 'QC Mechanical & Electrical Safety', canRead: true, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'payouts', moduleName: 'Partner Commissions & Payouts', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'procurement', moduleName: 'PO & Supplier Procurement', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'automations', moduleName: 'Automation Engine & Rules', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'settings', moduleName: 'Settings & Security Governance', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false }
    ],
    updatedAt: '2026-07-20',
    updatedBy: 'Mr. Prashant Vasant Wable'
  },
  {
    roleId: 'technician',
    roleName: 'Field Elevator Technician',
    roleDescription: 'SOP step check-ins, evidence upload, snag logging, material usage recording, and customer walkthroughs.',
    isSystemProtectedRole: false,
    userCount: 24,
    modulePermissions: [
      { moduleId: 'crm', moduleName: 'CRM & Pipeline', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'quotations', moduleName: 'Quotations & Contracts', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'field_jobs', moduleName: 'Installation & Field Jobs', canRead: true, canWrite: true, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'qc_inspections', moduleName: 'QC Mechanical & Electrical Safety', canRead: true, canWrite: true, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'payouts', moduleName: 'Partner Commissions & Payouts', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'procurement', moduleName: 'PO & Supplier Procurement', canRead: true, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'automations', moduleName: 'Automation Engine & Rules', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'settings', moduleName: 'Settings & Security Governance', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false }
    ],
    updatedAt: '2026-07-22',
    updatedBy: 'Mr. Prashant Vasant Wable'
  },
  {
    roleId: 'qc_inspector',
    roleName: 'QC Safety Inspector',
    roleDescription: 'Independent safety audits, electrical insulation test sign-off, mechanical brake tests, and defect clearance.',
    isSystemProtectedRole: false,
    userCount: 5,
    modulePermissions: [
      { moduleId: 'crm', moduleName: 'CRM & Pipeline', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'quotations', moduleName: 'Quotations & Contracts', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'field_jobs', moduleName: 'Installation & Field Jobs', canRead: true, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'qc_inspections', moduleName: 'QC Mechanical & Electrical Safety', canRead: true, canWrite: true, canApprove: true, canOverride: false, canExport: true },
      { moduleId: 'payouts', moduleName: 'Partner Commissions & Payouts', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'procurement', moduleName: 'PO & Supplier Procurement', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'automations', moduleName: 'Automation Engine & Rules', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'settings', moduleName: 'Settings & Security Governance', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false }
    ],
    updatedAt: '2026-08-05',
    updatedBy: 'Mr. Prashant Vasant Wable'
  },
  {
    roleId: 'customer',
    roleName: 'Elevator Owner / Customer',
    roleDescription: 'Project progress tracking, vault document downloads, AMC service bookings, and support tickets.',
    isSystemProtectedRole: true,
    userCount: 142,
    modulePermissions: [
      { moduleId: 'crm', moduleName: 'CRM & Pipeline', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'quotations', moduleName: 'Quotations & Contracts', canRead: true, canWrite: false, canApprove: true, canOverride: false, canExport: true },
      { moduleId: 'field_jobs', moduleName: 'Installation & Field Jobs', canRead: true, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'qc_inspections', moduleName: 'QC Mechanical & Electrical Safety', canRead: true, canWrite: false, canApprove: false, canOverride: false, canExport: true },
      { moduleId: 'payouts', moduleName: 'Partner Commissions & Payouts', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'procurement', moduleName: 'PO & Supplier Procurement', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'automations', moduleName: 'Automation Engine & Rules', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false },
      { moduleId: 'settings', moduleName: 'Settings & Security Governance', canRead: false, canWrite: false, canApprove: false, canOverride: false, canExport: false }
    ],
    updatedAt: '2026-06-01',
    updatedBy: 'Mr. Prashant Vasant Wable'
  }
];

export const initialUserPermissionOverrides: UserPermissionOverride[] = [
  {
    overrideId: 'ovr_101',
    userId: 'tech_vikram',
    userName: 'Vikram Salunkhe (Senior Tech Lead)',
    userRole: 'technician',
    grantedModuleId: 'qc_inspections',
    grantedAction: 'canApprove',
    mandatoryReason: 'Temporary authorization during Senior Inspector medical leave to avoid handover delays in Pune North district.',
    grantedBy: 'Mr. Prashant Vasant Wable',
    grantedAt: '2026-08-01',
    expiresAt: '2026-08-30',
    isActive: true
  }
];

export const initialPermissionChangeAuditEntries: PermissionChangeAuditEntry[] = [
  {
    auditId: 'perm_audit_901',
    timestamp: '2026-08-01 10:15 IST',
    changedByAdmin: 'Mr. Prashant Vasant Wable',
    targetRoleOrUser: 'User: Vikram Salunkhe (tech_vikram)',
    changeType: 'user_override_granted',
    description: 'Granted temporary QC Inspection approval authority to Senior Technician Vikram Salunkhe.',
    previousPermissionState: 'canApprove = false',
    newPermissionState: 'canApprove = true (Expires 2026-08-30)'
  },
  {
    auditId: 'perm_audit_902',
    timestamp: '2026-08-05 14:00 IST',
    changedByAdmin: 'Mr. Prashant Vasant Wable',
    targetRoleOrUser: 'Role: QC Safety Inspector (qc_inspector)',
    changeType: 'role_permission_updated',
    description: 'Updated QC Inspector role permissions to allow direct export of compliance certificates.',
    previousPermissionState: 'canExport = false',
    newPermissionState: 'canExport = true'
  }
];

// Single-Person Monitor Seed Data
export const initialMonitorSignals: MonitorSignalConfig[] = [
  {
    signalId: 'sig_101',
    title: 'Active High-Priority Pipeline Deals',
    category: 'business_health',
    currentValue: '₹4.82 Cr',
    targetValue: '₹4.00 Cr',
    trendDirection: 'up',
    trendPercentage: '+14.2%',
    status: 'healthy',
    isConfiguredActive: true,
    targetScreenTab: 'CRM',
    lastUpdated: 'Today 04:30 IST',
    description: 'Total weighted value of qualified elevator installation proposals.'
  },
  {
    signalId: 'sig_102',
    title: 'Automated Bot Execution Health',
    category: 'automation_health',
    currentValue: '99.94%',
    targetValue: '99.50%',
    trendDirection: 'stable',
    trendPercentage: '0.0%',
    status: 'healthy',
    isConfiguredActive: true,
    targetScreenTab: 'SystemHealthBotMonitoring',
    lastUpdated: '10 mins ago',
    description: 'Cron scheduler uptime and microservice worker success rate.'
  },
  {
    signalId: 'sig_103',
    title: 'Customer Payment Collection Runway',
    category: 'financial_health',
    currentValue: '₹1.18 Cr Overdue',
    targetValue: '₹0.50 Cr',
    trendDirection: 'up',
    trendPercentage: '+8.5%',
    status: 'warning',
    isConfiguredActive: true,
    targetScreenTab: 'Invoices',
    lastUpdated: 'Today 01:00 IST',
    description: 'Milestone payment invoices overdue past SLA 7-day grace period.'
  },
  {
    signalId: 'sig_104',
    title: 'Field Safety & QC Compliance',
    category: 'workforce_health',
    currentValue: '98.2%',
    targetValue: '98.0%',
    trendDirection: 'up',
    trendPercentage: '+1.1%',
    status: 'healthy',
    isConfiguredActive: true,
    targetScreenTab: 'QcInspections',
    lastUpdated: 'Today 05:00 IST',
    description: 'Percentage of field sites passing mechanical and electrical safety checks.'
  },
  {
    signalId: 'sig_105',
    title: 'Supplier Shaft Material SLA Delays',
    category: 'critical_alerts',
    currentValue: '2 Sites Delayed',
    targetValue: '0 Sites',
    trendDirection: 'down',
    trendPercentage: '-50.0%',
    status: 'warning',
    isConfiguredActive: true,
    targetScreenTab: 'EscalationMatrixConfig',
    lastUpdated: 'Today 02:15 IST',
    description: 'Shaft frame assembly delivery delays exceeding promised SLA.'
  }
];

export const initialDailyMonitorCheckLogs: DailyMonitorCheckLog[] = [
  {
    checkLogId: 'chk_801',
    timestamp: '2026-08-14 04:45 IST',
    checkedByAdmin: 'Mr. Prashant Vasant Wable',
    note: 'Morning master health check completed. All automated bots green, 2 supplier delay alerts monitored.',
    allClearAcknowledged: true,
    criticalSignalsCountAtCheck: 0
  },
  {
    checkLogId: 'chk_800',
    timestamp: '2026-08-13 05:10 IST',
    checkedByAdmin: 'Mr. Prashant Vasant Wable',
    note: 'System operational. Verified milestone collections and field technician check-ins.',
    allClearAcknowledged: true,
    criticalSignalsCountAtCheck: 0
  }
];

export const initialBackupMonitorContacts: BackupMonitorContact[] = [
  {
    backupId: 'bak_01',
    name: 'Rajesh Sharma',
    role: 'General Operations Manager',
    phone: '+91 98220 11223',
    email: 'operations@aiecelevators.in',
    isEmergencyViewGranted: false,
    grantedUntil: undefined,
    notes: 'Designated emergency backup monitor during primary Admin leave.'
  }
];

// Data Privacy Seed Data
export const initialDataSubjectConsentRecords: DataSubjectConsentRecord[] = [
  {
    subjectId: 'sub_401',
    subjectName: 'Pravin Deshmukh (Chinchwad Residency)',
    subjectType: 'customer',
    marketingOptIn: true,
    gpsTrackingConsent: false,
    documentProcessingConsent: true,
    thirdPartySharingConsent: false,
    consentTimestamp: '2026-06-12 11:20 IST',
    ipAddress: '103.21.124.88'
  },
  {
    subjectId: 'sub_402',
    subjectName: 'Vikram Salunkhe (Senior Technician)',
    subjectType: 'partner_technician',
    marketingOptIn: false,
    gpsTrackingConsent: true,
    documentProcessingConsent: true,
    thirdPartySharingConsent: false,
    consentTimestamp: '2026-01-10 09:00 IST',
    ipAddress: '49.36.192.12'
  }
];

export const initialDataSubjectRequests: DataSubjectRequest[] = [
  {
    requestId: 'dsr_101',
    subjectName: 'Anil Kumar (Former Technician Applicant)',
    subjectEmail: 'anil.kumar.test@gmail.com',
    subjectPhone: '+91 98111 22334',
    requestType: 'data_erasure_deletion',
    status: 'under_review',
    requestDetails: 'Requesting full deletion of uploaded Aadhaar, PAN, and recruitment application records post-rejection.',
    receivedAt: '2026-08-10',
    responseDueDate: '2026-09-09'
  },
  {
    requestId: 'dsr_102',
    subjectName: 'Pravin Deshmukh (Customer)',
    subjectEmail: 'pdeshmukh@chinchwadres.in',
    subjectPhone: '+91 98234 56789',
    requestType: 'data_access',
    status: 'completed',
    requestDetails: 'Requested copy of stored elevator design specifications, payment receipts, and inspection reports.',
    receivedAt: '2026-07-15',
    responseDueDate: '2026-08-14',
    resolvedAt: '2026-07-18'
  }
];

export const initialDataRetentionCategoryConfigs: DataRetentionCategoryConfig[] = [
  {
    categoryId: 'ret_fin_tax',
    categoryName: 'Tax Invoices & Financial Transactions',
    retentionPeriodMonths: 96, // 8 Years mandatory
    legalBasis: 'Indian Goods & Services Tax (GST) Act & Income Tax Act compliance',
    autoPurgeEnabled: false,
    totalRecordsAffected: 1842
  },
  {
    categoryId: 'ret_applicant',
    categoryName: 'Rejected Recruitment Applicants',
    retentionPeriodMonths: 6,
    legalBasis: 'DPDP Act Minimization principle for non-selected candidates',
    autoPurgeEnabled: true,
    totalRecordsAffected: 45
  },
  {
    categoryId: 'ret_gps_telemetry',
    categoryName: 'Technician GPS Tracking Trails',
    retentionPeriodMonths: 12,
    legalBasis: 'Operational safety & reimbursement verification',
    autoPurgeEnabled: true,
    totalRecordsAffected: 12400
  }
];

export const initialPrivacyPolicyVersionRecords: PrivacyPolicyVersionRecord[] = [
  {
    versionId: 'priv_v2.1',
    versionTag: 'DPDP 2023 Compliant v2.1',
    effectiveDate: '2026-01-01',
    publishedBy: 'Mr. Prashant Vasant Wable',
    changesSummary: 'Updated data minimization clauses, explicit GPS tracking consent for field technicians, and SAR turnaround SLA.',
    documentUrl: 'https://aiecelevators.in/privacy-policy-v2.1.pdf'
  }
];

// Security & Session Seed Data
export const initialRoleTwoFactorPolicies: RoleTwoFactorPolicy[] = [
  {
    roleId: 'admin',
    roleName: 'System Admin (Owner)',
    enforcementMode: 'mandatory',
    method: 'authenticator_app',
    userCount: 1,
    compliantUserCount: 1
  },
  {
    roleId: 'surveyor',
    roleName: 'Site Surveyor / Sales Engineer',
    enforcementMode: 'optional',
    method: 'sms_otp',
    userCount: 8,
    compliantUserCount: 6
  },
  {
    roleId: 'technician',
    roleName: 'Field Elevator Technician',
    enforcementMode: 'optional',
    method: 'sms_otp',
    userCount: 24,
    compliantUserCount: 18
  },
  {
    roleId: 'qc_inspector',
    roleName: 'QC Safety Inspector',
    enforcementMode: 'mandatory',
    method: 'authenticator_app',
    userCount: 5,
    compliantUserCount: 5
  }
];

export const initialActiveUserSessions: ActiveUserSession[] = [
  {
    sessionId: 'sess_admin_991',
    userId: 'admin_prashant',
    userName: 'Mr. Prashant Vasant Wable',
    userRole: 'admin',
    deviceModel: 'MacBook Pro 16" / Chrome',
    browserOs: 'macOS Sonoma / Chrome 127',
    ipAddress: '103.110.170.24',
    locationCity: 'Pune, Maharashtra, India',
    loginTimestamp: '2026-08-14 04:00 IST',
    lastActiveTimestamp: 'Just now',
    isCurrentSession: true,
    isSuspiciousLocation: false
  },
  {
    sessionId: 'sess_tech_772',
    userId: 'tech_vikram',
    userName: 'Vikram Salunkhe',
    userRole: 'technician',
    deviceModel: 'Samsung Galaxy A54 5G',
    browserOs: 'Android 14 / Mobile Chrome',
    ipAddress: '49.36.192.88',
    locationCity: 'Pimpri-Chinchwad, Pune',
    loginTimestamp: '2026-08-14 06:15 IST',
    lastActiveTimestamp: '5 mins ago',
    isCurrentSession: false,
    isSuspiciousLocation: false
  },
  {
    sessionId: 'sess_flagged_303',
    userId: 'surv_amit',
    userName: 'Amit Kulkarni',
    userRole: 'surveyor',
    deviceModel: 'Unknown Windows Device',
    browserOs: 'Windows 11 / Firefox',
    ipAddress: '185.220.101.5',
    locationCity: 'Frankfurt, Germany (VPN/Proxy Detected)',
    loginTimestamp: '2026-08-13 23:40 IST',
    lastActiveTimestamp: '2 hours ago',
    isCurrentSession: false,
    isSuspiciousLocation: true
  }
];

export const initialSecurityEventLogs: SecurityEventLog[] = [
  {
    eventId: 'sec_evt_501',
    timestamp: '2026-08-13 23:40 IST',
    userId: 'surv_amit',
    userName: 'Amit Kulkarni (surveyor)',
    eventType: 'unusual_location',
    severity: 'critical',
    ipAddress: '185.220.101.5',
    details: 'Login attempt from suspicious foreign IP address in Frankfurt, Germany.',
    resolvedStatus: 'unresolved'
  },
  {
    eventId: 'sec_evt_502',
    timestamp: '2026-08-12 14:20 IST',
    userId: 'tech_sanjay',
    userName: 'Sanjay Patil',
    eventType: 'failed_login',
    severity: 'warning',
    ipAddress: '49.36.190.11',
    details: '3 consecutive incorrect password attempts on Android app.',
    resolvedStatus: 'investigated_cleared'
  }
];

export const initialPasswordPolicyConfig: PasswordPolicyConfig = {
  minLength: 12,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  mandatoryRotationDays: 90,
  maxFailedAttemptsBeforeLockout: 5
};

// Seed Data for Backup & Data Export (Prompt 196)
export const initialBackupRuns: DatabaseBackupRunRecord[] = [
  {
    backupRunId: 'bk_20260814_0300',
    timestamp: '2026-08-14 03:00 IST',
    status: 'completed_success',
    backupSizeBytes: '1.42 GB',
    storageLocation: 'Google Cloud Storage (asia-south1 Vault - Encrypted AES-256)',
    type: 'automated_daily',
    checksumHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    backupRunId: 'bk_20260813_0300',
    timestamp: '2026-08-13 03:00 IST',
    status: 'completed_success',
    backupSizeBytes: '1.39 GB',
    storageLocation: 'Google Cloud Storage (asia-south1 Vault)',
    type: 'automated_daily',
    checksumHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284ddd200126d9069e'
  },
  {
    backupRunId: 'bk_20260812_1830',
    timestamp: '2026-08-12 18:30 IST',
    status: 'failed_infrastructure',
    backupSizeBytes: '0 KB',
    storageLocation: 'Google Cloud Storage (asia-south1 Vault)',
    type: 'manual_snapshot',
    checksumHash: 'FAILED_TIMEOUT',
    errorMessage: 'Storage bucket write timeout during snapshot sync. System auto-alerted Admin.'
  },
  {
    backupRunId: 'bk_20260812_0300',
    timestamp: '2026-08-12 03:00 IST',
    status: 'completed_success',
    backupSizeBytes: '1.35 GB',
    storageLocation: 'Google Cloud Storage (asia-south1 Vault)',
    type: 'automated_daily',
    checksumHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
  }
];

export const initialExportJobs: DataExportJobRecord[] = [
  {
    exportJobId: 'exp_job_901',
    requestedBy: 'Mr. Prashant Vasant Wable (Admin)',
    category: 'accounting_gst',
    format: 'csv_spreadsheet',
    status: 'ready_for_download',
    progressPercent: 100,
    fileSizeBytes: '14.8 MB',
    downloadUrl: 'https://aiec-vault.storage.googleapis.com/exports/aiec_gst_tds_q1_2026.csv',
    requestedAt: '2026-08-13 11:30 IST',
    expiresAt: '2026-08-20 11:30 IST'
  },
  {
    exportJobId: 'exp_job_902',
    requestedBy: 'Mr. Prashant Vasant Wable (Admin)',
    category: 'full_database',
    format: 'json_structured',
    status: 'processing',
    progressPercent: 68,
    fileSizeBytes: '320 MB (estimated)',
    requestedAt: '2026-08-14 05:10 IST',
    expiresAt: '2026-08-21 05:10 IST'
  },
  {
    exportJobId: 'exp_job_903',
    requestedBy: 'Audit Officer (External CA)',
    category: 'site_qc_inspections',
    format: 'pdf_archive',
    status: 'ready_for_download',
    progressPercent: 100,
    fileSizeBytes: '42.1 MB',
    downloadUrl: 'https://aiec-vault.storage.googleapis.com/exports/site_qc_audit_archive_2026.pdf',
    requestedAt: '2026-08-10 16:00 IST',
    expiresAt: '2026-08-17 16:00 IST'
  }
];

export const initialDisasterRestorePoint: DisasterRestorePointInfo = {
  lastRestorePointTimestamp: '2026-08-14 03:00 IST (3 Hours Ago)',
  rpoMinutes: 15,
  rtoMinutes: 45,
  autoBackupScheduleCron: '0 3 * * * (Daily at 03:00 IST)',
  totalBackupsRetained: 90,
  isDisasterRecoveryTested: true,
  lastDrTestDate: '2026-07-15 IST'
};

// Seed Data for Subscription/Billing (SaaS Ops) (Prompt 197)
export const initialSaaSUsageServices: SaaSUsageServiceConfig[] = [
  {
    serviceId: 'srv_gcp_cloudrun',
    serviceName: 'Google Cloud Run & Firestore DB',
    category: 'cloud_hosting',
    currentTier: 'Scale-Up Business (Multi-Region Failover)',
    monthlyCostInr: 18500,
    monthlyUsageMetric: '1.82M API Requests / 5.0M Quota (36.4%)',
    usagePercent: 36,
    renewalDate: '2026-09-01 IST',
    paymentStatus: 'active_auto_debit',
    costOptimizationAdvice: 'Usage is optimal. Provisioned concurrency auto-scales during peak daytime dispatch hours.'
  },
  {
    serviceId: 'srv_meta_whatsapp',
    serviceName: 'WhatsApp Business API (Meta Direct Cloud API)',
    category: 'messaging_api',
    currentTier: 'Enterprise Utility + Marketing Messages',
    monthlyCostInr: 12400,
    monthlyUsageMetric: '24,800 Messages / 30,000 Tier 2 Limit (82.6%)',
    usagePercent: 83,
    renewalDate: '2026-08-28 IST',
    paymentStatus: 'card_expiring_soon',
    costOptimizationAdvice: 'High usage driven by automated QC completion certificates & quotation dispatches. Card expires in 14 days.'
  },
  {
    serviceId: 'srv_textlocal_sms',
    serviceName: 'SMS OTP & Safety Alert Gateway (DLT Approved)',
    category: 'messaging_api',
    currentTier: 'Transactional DLT Approved 100k Bulk',
    monthlyCostInr: 4200,
    monthlyUsageMetric: '11,200 SMS Sent / 50,000 Balance (22.4%)',
    usagePercent: 22,
    renewalDate: '2026-10-15 IST',
    paymentStatus: 'active_auto_debit',
    costOptimizationAdvice: 'DLT headers valid. Pre-paid balance sufficient for 3+ months at current technician login pace.'
  },
  {
    serviceId: 'srv_razorpay_gateway',
    serviceName: 'Razorpay Payment Gateway (UPI / NEFT / Cards)',
    category: 'payment_gateway',
    currentTier: 'Custom Enterprise Rate (1.1% UPI / 1.8% Card)',
    monthlyCostInr: 28600,
    monthlyUsageMetric: '₹28.4L Online Collections Processed',
    usagePercent: 57,
    renewalDate: '2026-12-31 IST',
    paymentStatus: 'active_auto_debit',
    costOptimizationAdvice: 'Consider enabling Smart Routing for NEFT/RTGS payments > ₹5L to cap flat fee at ₹15 per transaction.'
  },
  {
    serviceId: 'srv_gemini_ai',
    serviceName: 'Google AI Studio & Gemini 2.5 Flash API',
    category: 'ai_studio_gemini',
    currentTier: 'Pay-As-You-Go Corporate Token Tier',
    monthlyCostInr: 8900,
    monthlyUsageMetric: '4.2M Input Tokens / 1.1M Output Tokens',
    usagePercent: 42,
    renewalDate: '2026-09-05 IST',
    paymentStatus: 'active_auto_debit',
    costOptimizationAdvice: 'Used for automated contract generation, smart quote synthesis, and defect snag report parsing.'
  }
];

export const initialSaaSBillingInvoices: SaaSBillingInvoiceRecord[] = [
  {
    invoiceId: 'inv_saas_2026_07_gcp',
    serviceName: 'Google Cloud Run & Firestore DB',
    billingPeriod: 'July 2026',
    amountInr: 18500,
    gstinNumber: '27AAAAA0000A1Z5',
    taxInvoiceUrl: 'https://aiec-vault.storage.googleapis.com/invoices/gcp_july_2026.pdf',
    paymentStatus: 'paid',
    paidAt: '2026-08-02 IST'
  },
  {
    invoiceId: 'inv_saas_2026_07_wa',
    serviceName: 'WhatsApp Business API (Meta)',
    billingPeriod: 'July 2026',
    amountInr: 12400,
    gstinNumber: '9919USA29003OS7',
    taxInvoiceUrl: 'https://aiec-vault.storage.googleapis.com/invoices/meta_wa_july_2026.pdf',
    paymentStatus: 'paid',
    paidAt: '2026-08-01 IST'
  },
  {
    invoiceId: 'inv_saas_2026_07_rzp',
    serviceName: 'Razorpay Payment Gateway',
    billingPeriod: 'July 2026',
    amountInr: 28600,
    gstinNumber: '27AAACR3842R1ZF',
    taxInvoiceUrl: 'https://aiec-vault.storage.googleapis.com/invoices/razorpay_july_2026.pdf',
    paymentStatus: 'paid',
    paidAt: '2026-08-03 IST'
  }
];

// Seed Data for Legal/Contract Templates Repository (Prompt 198)
export const initialLegalTemplates: LegalContractTemplateRecord[] = [
  {
    templateId: 'tmpl_cust_inst_v4',
    title: 'Customer Elevator Supply & Installation Agreement',
    category: 'customer_installation',
    currentVersion: 'v4.2 (BIS 14665 & Maharashtra Lift Rules 2017)',
    effectiveDate: '2026-01-01 IST',
    lastLegalReviewDate: '2026-05-10 IST',
    reviewedByCounsel: 'Adv. M. V. Kulkarni & Associates (High Court Bombay)',
    applicableStates: ['Maharashtra', 'Gujarat', 'Karnataka', 'Goa'],
    isActiveDefault: true,
    bodyTextSnippet: 'This Agreement is made by and between All India Elevators Company (AIEC) and the Purchaser for the supply, erection, testing, and commissioning of elevator equipment as per BIS 14665 standard...'
  },
  {
    templateId: 'tmpl_amc_serv_v3',
    title: 'Comprehensive & Non-Comprehensive AMC Service Contract',
    category: 'amc_service',
    currentVersion: 'v3.1 (24/7 Breakdown SLA & Emergency Rescue Clause)',
    effectiveDate: '2025-11-15 IST',
    lastLegalReviewDate: '2026-04-20 IST',
    reviewedByCounsel: 'Adv. M. V. Kulkarni & Associates',
    applicableStates: ['Maharashtra', 'Gujarat', 'Karnataka', 'Goa', 'Madhya Pradesh'],
    isActiveDefault: true,
    bodyTextSnippet: 'Annual Maintenance Contract for scheduled preventive maintenance (12 visits/yr), breakdown response within 60 minutes for urban zones, and guaranteed genuine OEM spare parts replacement...'
  },
  {
    templateId: 'tmpl_supp_sla_v2',
    title: 'Supplier Parts Quality & Delivery SLA Master Agreement',
    category: 'supplier_sla',
    currentVersion: 'v2.4 (3-Way Matching & Defect Penalty Terms)',
    effectiveDate: '2026-02-01 IST',
    lastLegalReviewDate: '2026-06-01 IST',
    reviewedByCounsel: 'Adv. S. R. Deshmukh (Corporate Legal)',
    applicableStates: ['All India (Central GST Act Compliant)'],
    isActiveDefault: true,
    bodyTextSnippet: 'Master Terms governing component suppliers including Monofram, Bharat Gear, Otis OEM spares. Mandates 100% material test certificate, 18-month warranty, and GST 3-way match compliance...'
  },
  {
    templateId: 'tmpl_partner_onb_v5',
    title: 'Partner Technician Onboarding & Safety Liability Deed',
    category: 'partner_onboarding',
    currentVersion: 'v5.0 (Workplace Safety & Payout Escrow Terms)',
    effectiveDate: '2026-03-10 IST',
    lastLegalReviewDate: '2026-05-25 IST',
    reviewedByCounsel: 'Adv. M. V. Kulkarni & Associates',
    applicableStates: ['Maharashtra', 'Gujarat', 'Karnataka'],
    isActiveDefault: true,
    bodyTextSnippet: 'Terms governing independent certified elevator installation partners, mandatory PPE adherence, zero-negligence safety indemnity, and automated commission payout schedule via AIEC portal...'
  }
];

export const initialStateLiftActClauses: StateLiftActClauseItem[] = [
  {
    clauseId: 'clause_mah_lift_sec8',
    stateName: 'Maharashtra Lift Act 1939 (Amended 2017)',
    actReferenceSection: 'Section 8 & Rule 11 (Inspector Licensing & Commissioning)',
    clauseTitle: 'Mandatory Lift Inspector Working License & Load Test Certificate',
    mandatoryRequirement: 'Prior to commercial passenger operations, PWD Lift Inspectorate license A-1 must be issued following 1.25x full-load safety gear drop test.',
    clauseText: 'No elevator shall be brought into regular use unless a license under Section 8 is granted by the Chief Electrical Inspector to Government of Maharashtra following full load testing...',
    lastUpdated: '2026-04-12 IST'
  },
  {
    clauseId: 'clause_guj_lift_sec5',
    stateName: 'Gujarat Lifts and Escalators Act 2000',
    actReferenceSection: 'Section 5 (Notice of Completion & Initial Inspection)',
    clauseTitle: 'State Inspector Notice of Erection Completion',
    mandatoryRequirement: 'Written notice within 14 days of mechanical completion to Inspector of Lifts, Gandhinagar zone.',
    clauseText: 'The owner or contractor shall give notice in Form B to the Inspector before commencing operations, accompanied by insulation resistance and earth pit test records...',
    lastUpdated: '2026-02-28 IST'
  },
  {
    clauseId: 'clause_kar_lift_rule4',
    stateName: 'Karnataka Lift Rules 1976 (Amended 2021)',
    actReferenceSection: 'Rule 4 & Schedule C (Emergency Alarm & ARD Specification)',
    clauseTitle: 'Mandatory Automatic Rescue Device (ARD) and Intercom System',
    mandatoryRequirement: 'Battery-operated ARD capable of bringing elevator car to nearest floor within 60 seconds of main power failure.',
    clauseText: 'Every passenger lift installed in Karnataka state must be fitted with an Automatic Rescue Device (ARD) conforming to IS 14665, equipped with twin battery back-up...',
    lastUpdated: '2026-03-05 IST'
  }
];

export const initialLegalReviewLogs: LegalReviewAuditLog[] = [
  {
    reviewId: 'rev_log_101',
    templateId: 'tmpl_cust_inst_v4',
    reviewDate: '2026-05-10 IST',
    counselName: 'Adv. M. V. Kulkarni (High Court Bombay)',
    reviewStatus: 'approved_unconditional',
    comments: 'Reviewed against updated Maharashtra Lift Rules 2017 and BIS 14665 (Part 3). Clause 14 amended to reflect digital signature validity under IT Act 2000.'
  },
  {
    reviewId: 'rev_log_102',
    templateId: 'tmpl_supp_sla_v2',
    reviewDate: '2026-06-01 IST',
    counselName: 'Adv. S. R. Deshmukh',
    reviewStatus: 'approved_unconditional',
    comments: 'Verified 3-way match tax dispute indemnity clause and GST e-invoicing mandatory requirements.'
  }
];























