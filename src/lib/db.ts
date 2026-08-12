import { User, Lead, Deal, Job, Payment, Supplier, UserRole, Territory, SiteVisit, EmergencyAlert, ReminderRule } from '../types';

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

const initialSuppliers: Supplier[] = [
  {
    id: 'sun_elevators',
    name: 'Sun Elevators Manufacturing',
    status: 'active',
    region: 'Chakan Industrial Area',
    catalog: [
      { itemId: 'cat_1', itemName: 'Traction Machine (Gearless 1m/s)', price: 250000 },
      { itemId: 'cat_2', itemName: 'VVVF Elevator Controller (Integrated)', price: 150000 },
      { itemId: 'cat_3', itemName: 'Premium Stainless Steel Cabin (6 Pax)', price: 180000 },
      { itemId: 'cat_4', itemName: 'Steel Guide Rails (T-Type, Set of 10)', price: 80000 }
    ]
  },
  {
    id: 'apex_drives',
    name: 'Apex Cabin & Mechanicals',
    status: 'active',
    region: 'Bhiwandi Logistic Hub',
    catalog: [
      { itemId: 'cat_5', itemName: 'Cabin Frame & Sling Assembly', price: 95000 },
      { itemId: 'cat_6', itemName: 'Counterweight Blocks (Cast Iron, Set of 24)', price: 60000 },
      { itemId: 'cat_7', itemName: 'Governor Tension Safety Device', price: 45000 }
    ]
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
  }

  static addUser(user: User): void {
    const list = [...this.getUsers(), user];
    this.setStore('users', list);
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

  // Helper to reset the entire database to seeds
  static resetToSeeds(): void {
    localStorage.removeItem('aiec_users');
    localStorage.removeItem('aiec_leads');
    localStorage.removeItem('aiec_deals');
    localStorage.removeItem('aiec_jobs');
    localStorage.removeItem('aiec_payments');
    localStorage.removeItem('aiec_suppliers');
    localStorage.removeItem('aiec_territories');
    localStorage.removeItem('aiec_site_visits');
    localStorage.removeItem('aiec_emergency_alerts');
    localStorage.removeItem('aiec_reminder_rules');
    window.dispatchEvent(new Event('aiec_db_update'));
  }
}

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
