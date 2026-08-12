import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, TrendingUp, Wallet, Hammer, CheckCircle2, DollarSign, 
  AlertCircle, Calendar, ChevronDown, ChevronUp, Search, User as UserIcon, 
  Clock, Smartphone, Filter, ArrowDown, Check, Truck, FileText, 
  Activity, ChevronRight, Bell, Play, Send, Zap, X, ShieldAlert,
  Users, Building, FileSpreadsheet, ArrowUpRight, HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Lead, Job, Payment, Deal } from '../types';
import { Card, Button, Badge, AscensionLine } from './Common';

// Definition of Feed Event Structure
export interface LiveEvent {
  id: string;
  type: 'lead_captured' | 'survey_assigned' | 'survey_completed' | 'quote_sent' | 'deal_won' | 'payment_received' | 'material_dispatched' | 'milestone_completed' | 'partner_onboarded' | 'kyc_verified' | 'safety_acknowledged';
  module: 'Sales' | 'Payments' | 'Installation' | 'Recruitment';
  title: string;
  description: string;
  actorName: string;
  actorRole: 'System' | 'Admin' | 'Surveyor' | 'Technician' | 'Supplier' | 'Customer';
  actorAvatarUrl?: string;
  timestamp: string;
  timeLabel: string;
  relatedRecordId?: string;
  relatedRecordType?: 'lead' | 'deal' | 'job' | 'payment' | 'user';
  importance: 'high' | 'normal' | 'low';
  details?: {
    metaList?: { label: string; value: string; isMono?: boolean }[];
    statusBadgeText?: string;
    statusBadgeColor?: 'success' | 'warning' | 'info' | 'error';
    pipelineSteps?: { label: string; active: boolean; done: boolean }[];
    amountFormatted?: string;
  };
}

export const LiveActivityFeed: React.FC<{ user: User }> = ({ user }) => {
  // Filters
  const [activeModule, setActiveModule] = useState<'All' | 'Sales' | 'Payments' | 'Installation' | 'Recruitment'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('All');
  
  // Interaction States
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [deepLinkedRecord, setDeepLinkedRecord] = useState<{
    type: 'lead' | 'deal' | 'job' | 'payment' | 'user';
    id: string;
    data: any;
  } | null>(null);

  // Pagination & Loading States
  const [itemsToShow, setItemsToShow] = useState(8);
  const [loading, setLoading] = useState(false);
  const [liveNewEventAlert, setLiveNewEventAlert] = useState<string | null>(null);

  // Core Event Database (Simulated persistence)
  const [events, setEvents] = useState<LiveEvent[]>([
    {
      id: 'evt_1',
      type: 'lead_captured',
      module: 'Sales',
      title: 'New Inbound Lead Captured',
      description: 'Customer requested multi-floor residential cabin elevator estimate via QR portal.',
      actorName: 'System (Self-Service)',
      actorRole: 'System',
      timestamp: new Date(Date.now() - 3 * 60000).toISOString(), // 3 mins ago
      timeLabel: '3m ago',
      relatedRecordId: 'lead_2',
      relatedRecordType: 'lead',
      importance: 'high',
      details: {
        metaList: [
          { label: 'Site Name', value: 'Wable Landmark Villa' },
          { label: 'Location', value: 'Senapati Bapat Road, Pune' },
          { label: 'Floors', value: 'G+3 Floors' },
          { label: 'Contact', value: '+91 98450 12211' }
        ],
        statusBadgeText: 'Captured & Verified',
        statusBadgeColor: 'info',
        pipelineSteps: [
          { label: 'Capture', active: false, done: true },
          { label: 'Site Survey', active: true, done: false },
          { label: 'Auto-Quotation', active: false, done: false },
          { label: 'Deal Won', active: false, done: false }
        ]
      }
    },
    {
      id: 'evt_2',
      type: 'quote_sent',
      module: 'Sales',
      title: 'Auto-Quotation Dispatched',
      description: 'Negotiation proposal sent automatically via WhatsApp broker api.',
      actorName: 'AIEC Auto-Broker',
      actorRole: 'System',
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(), // 25 mins ago
      timeLabel: '25m ago',
      relatedRecordId: 'lead_1',
      relatedRecordType: 'lead',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Est. Price Offered', value: '₹12,50,000' },
          { label: 'Template ID', value: 'AIEC-QT-2026-03' },
          { label: 'SLA Speed', value: 'Instant Delivery (<45s)', isMono: true },
          { label: 'WhatsApp Status', value: 'Delivered & Read' }
        ],
        statusBadgeText: 'Quote Dispatched',
        statusBadgeColor: 'success'
      }
    },
    {
      id: 'evt_3',
      type: 'survey_assigned',
      module: 'Sales',
      title: 'Site Survey Assigned to Partner',
      description: 'Surveyor assigned to verify elevator shaft headroom & pit clearances.',
      actorName: 'System Router',
      actorRole: 'System',
      timestamp: new Date(Date.now() - 65 * 60000).toISOString(), // 1.1 hours ago
      timeLabel: '1h ago',
      relatedRecordId: 'lead_2',
      relatedRecordType: 'lead',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Assigned Surveyor', value: 'Amit Sharma' },
          { label: 'Target Site', value: 'Wable Landmark Villa' },
          { label: 'Scheduled Time', value: 'Today, 4:00 PM' }
        ],
        statusBadgeText: 'Assigned',
        statusBadgeColor: 'warning'
      }
    },
    {
      id: 'evt_4',
      type: 'payment_received',
      module: 'Payments',
      title: 'Advance Payment Received',
      description: 'Razorpay webhook confirmed 30% advance for Deshmukh Arcade project.',
      actorName: 'Razorpay Gateway',
      actorRole: 'System',
      timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(), // 3.5 hours ago
      timeLabel: '3h ago',
      relatedRecordId: 'pay_1',
      relatedRecordType: 'payment',
      importance: 'high',
      details: {
        metaList: [
          { label: 'Paid Amount', value: '₹3,75,000' },
          { label: 'Razorpay Ref', value: 'pay_Nsh7S82hS92a', isMono: true },
          { label: 'Status', value: 'Settled to Bank Account' }
        ],
        statusBadgeText: 'Payment Settled',
        statusBadgeColor: 'success',
        amountFormatted: '₹3,75,000'
      }
    },
    {
      id: 'evt_5',
      type: 'milestone_completed',
      module: 'Installation',
      title: 'Guide Rail Alignment Approved',
      description: 'Milestone 2/5 cleared by Technician. Installation quality verified.',
      actorName: 'Rajesh Patel',
      actorRole: 'Technician',
      actorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hours ago
      timeLabel: '5h ago',
      relatedRecordId: 'job_1',
      relatedRecordType: 'job',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Project', value: 'Deshmukh Arcade' },
          { label: 'SOP Component', value: 'Guide Rails Level Checked' },
          { label: 'Selfie Upload Proof', value: 'Image_Guide_Rails.jpg', isMono: true }
        ],
        statusBadgeText: 'Milestone Verified',
        statusBadgeColor: 'success',
        pipelineSteps: [
          { label: 'Civil Well Ready', active: false, done: true },
          { label: 'Guide Rails', active: false, done: true },
          { label: 'Cabin Framework', active: true, done: false },
          { label: 'Machine Motor', active: false, done: false },
          { label: 'Handover & QC', active: false, done: false }
        ]
      }
    },
    {
      id: 'evt_6',
      type: 'material_dispatched',
      module: 'Installation',
      title: 'Custom Cabin & Motors Dispatched',
      description: 'Chakan plant confirmed dispatch of custom-welded structural components.',
      actorName: 'Sun Elevators Factory',
      actorRole: 'Supplier',
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
      timeLabel: '12h ago',
      relatedRecordId: 'job_1',
      relatedRecordType: 'job',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Dispatched Goods', value: 'Traction Drive Motor, Cabin Slats' },
          { label: 'Truck Transit ID', value: 'MH-14-EU-4512', isMono: true },
          { label: 'SLA Window', value: 'Delivering within 24 Hours' }
        ],
        statusBadgeText: 'En Route',
        statusBadgeColor: 'info'
      }
    },
    {
      id: 'evt_7',
      type: 'deal_won',
      module: 'Sales',
      title: 'Deal Closed Won - Deshmukh Arcade',
      description: 'Owner Mr. Prashant Wable approved special final discount. Contract signed.',
      actorName: 'Mr. Prashant Wable',
      actorRole: 'Admin',
      timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), // 26 hours ago
      timeLabel: 'Yesterday',
      relatedRecordId: 'deal_1',
      relatedRecordType: 'deal',
      importance: 'high',
      details: {
        metaList: [
          { label: 'Contract Value', value: '₹12,50,000' },
          { label: 'Floors Scope', value: 'G+5 Floors Traction' },
          { label: 'Sign-off Status', value: 'Electronically Executed' }
        ],
        statusBadgeText: 'Deal Executed',
        statusBadgeColor: 'success'
      }
    },
    {
      id: 'evt_8',
      type: 'kyc_verified',
      module: 'Recruitment',
      title: 'Partner Bank Verification Passed',
      description: 'Razorpay payout link tested with ₹1 Penny Drop. Status: Verified.',
      actorName: 'Razorpay Payouts',
      actorRole: 'System',
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
      timeLabel: '2 days ago',
      relatedRecordId: 'user_amit_sharma',
      relatedRecordType: 'user',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Field Partner', value: 'Amit Sharma (Surveyor)' },
          { label: 'IFSC Code', value: 'HDFC0000104', isMono: true },
          { label: 'Aadhaar Verified', value: 'Yes (DigiLocker link)' }
        ],
        statusBadgeText: 'Payout Activated',
        statusBadgeColor: 'success'
      }
    },
    {
      id: 'evt_9',
      type: 'safety_acknowledged',
      module: 'Recruitment',
      title: 'SOP Safety Induction Signed',
      description: 'Technician completed the digital ISO safety induction course.',
      actorName: 'Kiran Shinde',
      actorRole: 'Technician',
      actorAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), // 3 days ago
      timeLabel: '3 days ago',
      relatedRecordId: 'user_kiran_shinde',
      relatedRecordType: 'user',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Partner Status', value: 'Onboarded & Verified' },
          { label: 'Safety Module', value: 'High-altitude Shaft Anchorage' },
          { label: 'Compliance Grade', value: '100% Perfect Score' }
        ],
        statusBadgeText: 'Safety Ready',
        statusBadgeColor: 'success'
      }
    },
    {
      id: 'evt_10',
      type: 'partner_onboarded',
      module: 'Recruitment',
      title: 'New Supplier Onboarded',
      description: 'Apex Cabin & Mechanical Parts registered for Thane-Mumbai logistics cluster.',
      actorName: 'Apex Parts Depot',
      actorRole: 'Supplier',
      timestamp: new Date(Date.now() - 120 * 3600000).toISOString(), // 5 days ago
      timeLabel: '5 days ago',
      relatedRecordId: 'user_apex',
      relatedRecordType: 'user',
      importance: 'normal',
      details: {
        metaList: [
          { label: 'Company Name', value: 'Apex Mechanical Corp Ltd' },
          { label: 'GSTIN', value: '27AABCA1290K1Z9', isMono: true },
          { label: 'Supplier Territory', value: 'Thane, Mumbai Outskirts' }
        ],
        statusBadgeText: 'Onboarded',
        statusBadgeColor: 'success'
      }
    }
  ]);

  // Unique list of actors / staff members for the filter dropdown
  const uniqueStaffList = useMemo(() => {
    const list = new Set<string>();
    events.forEach(e => {
      if (e.actorName) list.add(e.actorName);
    });
    return Array.from(list);
  }, [events]);

  // Handle Event Ingestion (Real-Time Live Simulator)
  const triggerSimulatedLiveEvent = () => {
    const simulationPool: Omit<LiveEvent, 'id' | 'timestamp' | 'timeLabel'>[] = [
      {
        type: 'lead_captured',
        module: 'Sales',
        title: 'New Inbound Lead via Web Portal',
        description: 'Multi-family developer submitted G+4 residential specifications in Chakan.',
        actorName: 'System (Self-Service)',
        actorRole: 'System',
        importance: 'high',
        details: {
          metaList: [
            { label: 'Site Name', value: 'Chakan Greens Co-op Housing' },
            { label: 'Location', value: 'Chakan Phase III, Pune' },
            { label: 'Drive Requested', value: 'Machine-Room-Less (MRL) Traction' }
          ],
          statusBadgeText: 'Verification Pending',
          statusBadgeColor: 'warning',
          pipelineSteps: [
            { label: 'Capture', active: true, done: false },
            { label: 'Site Survey', active: false, done: false },
            { label: 'Auto-Quotation', active: false, done: false },
            { label: 'Deal Won', active: false, done: false }
          ]
        }
      },
      {
        type: 'milestone_completed',
        module: 'Installation',
        title: 'Elevator Machine Motor Anchored',
        description: 'Technician successfully secured the primary drive traction motor.',
        actorName: 'Rajesh Patel',
        actorRole: 'Technician',
        actorAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        importance: 'high',
        details: {
          metaList: [
            { label: 'Site Location', value: 'Deshmukh Arcade' },
            { label: 'Milestone Step', value: '4/5 Drive Motor Secured' },
            { label: 'Inspection Grade', value: 'A+ Structural Rating' }
          ],
          statusBadgeText: 'Milestone Cleared',
          statusBadgeColor: 'success',
          pipelineSteps: [
            { label: 'Civil Well Ready', active: false, done: true },
            { label: 'Guide Rails', active: false, done: true },
            { label: 'Cabin Framework', active: false, done: true },
            { label: 'Machine Motor', active: false, done: true },
            { label: 'Handover & QC', active: true, done: false }
          ]
        }
      },
      {
        type: 'payment_received',
        module: 'Payments',
        title: 'Material Delivery Payment (40%) Clear',
        description: 'Auto-reminder triggered. Customer cleared the second major stage payout.',
        actorName: 'UPI Automated Payment',
        actorRole: 'System',
        importance: 'high',
        details: {
          metaList: [
            { label: 'Transaction Value', value: '₹5,00,000' },
            { label: 'Payment Method', value: 'GPay UPI Merchant Route' },
            { label: 'Bank Cleared Ref', value: 'TXN-902047H9B4', isMono: true }
          ],
          statusBadgeText: 'Settled to Bank',
          statusBadgeColor: 'success',
          amountFormatted: '₹5,00,000'
        }
      }
    ];

    // Pick a random event to inject
    const randomTemplate = simulationPool[Math.floor(Math.random() * simulationPool.length)];
    const newId = `evt_sim_${Date.now()}`;
    const newEvent: LiveEvent = {
      ...randomTemplate,
      id: newId,
      timestamp: new Date().toISOString(),
      timeLabel: 'Just Now'
    };

    // Inject at the front (reverse-chronological)
    setEvents(prev => [newEvent, ...prev]);
    setLiveNewEventAlert(newEvent.title);

    // Auto close notification after 4 seconds
    setTimeout(() => {
      setLiveNewEventAlert(null);
    }, 4500);
  };

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // 1. Filter by Module
      if (activeModule !== 'All' && e.module !== activeModule) {
        return false;
      }
      // 2. Filter by Actor/Staff Name
      if (selectedStaffFilter !== 'All' && e.actorName !== selectedStaffFilter) {
        return false;
      }
      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesDesc = e.description.toLowerCase().includes(query);
        const matchesActor = e.actorName.toLowerCase().includes(query);
        const matchesRecord = e.relatedRecordId?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesActor || matchesRecord;
      }
      return true;
    });
  }, [events, activeModule, selectedStaffFilter, searchQuery]);

  // Simulated infinite scroll page load
  const loadMoreItems = () => {
    setLoading(true);
    setTimeout(() => {
      setItemsToShow(prev => prev + 4);
      setLoading(false);
    }, 600);
  };

  // Open Deep Link Preview (Interactive sideovers/modals containing actual database record)
  const handleDeepLink = (recordType: 'lead' | 'deal' | 'job' | 'payment' | 'user', recordId: string) => {
    let mockData: any = null;

    if (recordType === 'lead') {
      const dbLeads = DbManager.getLeads();
      mockData = dbLeads.find(l => l.id === recordId) || dbLeads[0];
    } else if (recordType === 'job') {
      const dbJobs = DbManager.getJobs();
      mockData = dbJobs.find(j => j.id === recordId) || dbJobs[0];
    } else if (recordType === 'payment') {
      const dbPayments = DbManager.getPayments();
      mockData = dbPayments.find(p => p.id === recordId) || dbPayments[0];
    } else {
      mockData = {
        id: recordId,
        name: 'Amit Sharma',
        role: 'surveyor',
        phone: '+91 98765 43211',
        region: 'Pune North (Chakan)',
        status: 'active',
        bankAccountNo: '5010023451234',
        bankIfsc: 'HDFC0000104',
        bankVerifiedStatus: 'verified',
        preferredZones: ['Chakan Phase I', 'Dehu Road', 'Alandi']
      };
    }

    setDeepLinkedRecord({
      type: recordType,
      id: recordId,
      data: mockData
    });
  };

  // Icon selector helper
  const getEventIcon = (type: string, module: string) => {
    switch (type) {
      case 'lead_captured':
        return <Sparkles className="w-4 h-4 text-royalemerald" />;
      case 'quote_sent':
        return <FileSpreadsheet className="w-4 h-4 text-antiquegold" />;
      case 'survey_assigned':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-success" />;
      case 'milestone_completed':
        return <CheckCircle2 className="w-4 h-4 text-royalemerald" />;
      case 'material_dispatched':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'deal_won':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'kyc_verified':
        return <ShieldAlert className="w-4 h-4 text-[#8A64D6]" />;
      default:
        return <Activity className="w-4 h-4 text-warmgray" />;
    }
  };

  // Color theme mapper per module
  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'Sales':
        return 'border-[#FFF5C6] bg-[#FFF9E6] text-[#8C6412]';
      case 'Payments':
        return 'border-[#E6F7ED] bg-[#F0FAF4] text-[#124B2C]';
      case 'Installation':
        return 'border-[#E0ECFC] bg-[#F1F6FE] text-[#1D4ED8]';
      case 'Recruitment':
        return 'border-[#F2EFF7] bg-[#F8F5FC] text-[#3F2B66]';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full relative font-sans text-charcoal">
      
      {/* HEADER SECTION WITH TITLE & LIVE EMULATOR TRIGGER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-sm">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-antiquegold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            AIEC Operations Command
          </span>
          <h2 className="font-serif text-2xl font-bold mt-1 text-charcoal">System Activity Timeline</h2>
          <p className="text-xs text-warmgray mt-1 leading-relaxed">
            Real-time feed of structural audits, milestone uploads, auto-quotes, and payment settlements.
          </p>
        </div>
        
        {/* MANUAL SIMULATED LIVE EVENT GENERATOR - To show real-time stream capability */}
        <button
          onClick={triggerSimulatedLiveEvent}
          className="flex items-center gap-2 bg-[#FFF9E6] hover:bg-[#FFF5C6] text-[#8C6412] px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Play className="w-4 h-4 fill-current stroke-[1.5]" />
          <span>Simulate Client Action</span>
        </button>
      </div>

      {/* REAL-TIME LIVE EVENT TOAST BAR */}
      <AnimatePresence>
        {liveNewEventAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-[#E6F7ED] border border-[#2E8F5B]/30 p-4 rounded-xl flex items-center justify-between gap-3 shadow-md text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                <Bell className="w-4.5 h-4.5 animate-bounce" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-success uppercase tracking-widest">REAL-TIME TELEMETRY PUSH</p>
                <p className="text-xs font-extrabold text-[#124B2C]">{liveNewEventAlert}</p>
              </div>
            </div>
            <button 
              onClick={() => setLiveNewEventAlert(null)}
              className="text-[#124B2C]/50 hover:text-[#124B2C]"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. STICKY SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] space-y-3.5 shadow-xs">
        
        {/* Module filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#F8F6F1]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray mr-2">Module:</span>
          {(['All', 'Sales', 'Payments', 'Installation', 'Recruitment'] as const).map(mod => (
            <button
              key={mod}
              onClick={() => setActiveModule(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeModule === mod 
                  ? 'bg-royalemerald text-white shadow-xs' 
                  : 'bg-[#F8F6F1] hover:bg-[#FAF9F5] text-charcoal/70 border border-[#e5dfd4]'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Search Input and Staff Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Search text field */}
          <div className="relative">
            <Search className="w-4 h-4 text-warmgray absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
            <input
              type="text"
              placeholder="Search by lead name, staff, trans ID, key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F1] focus:bg-white rounded-xl border border-[#e5dfd4] focus:border-antiquegold text-xs outline-none focus:ring-1 focus:ring-antiquegold transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray hover:text-charcoal p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actor dropdown selector */}
          <div className="relative flex items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-warmgray absolute left-3 pointer-events-none">Staff:</span>
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="w-full pl-15 pr-8 py-2.5 bg-[#F8F6F1] rounded-xl border border-[#e5dfd4] text-xs font-semibold text-charcoal outline-none cursor-pointer focus:border-antiquegold transition-all appearance-none"
            >
              <option value="All">All Staff / Automated Systems</option>
              {uniqueStaffList.map(actor => (
                <option key={actor} value={actor}>{actor}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-warmgray absolute right-3 pointer-events-none stroke-[1.5]" />
          </div>

        </div>
      </div>

      {/* 3. TIMELINE LIST CONTAINER */}
      <div className="space-y-4">
        
        {/* Empty state visualizer */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[rgba(184,135,61,0.2)] max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FFF9E6] text-antiquegold flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6 stroke-[1.2]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal">No Relevant Timeline Events Found</h3>
              <p className="text-xs text-warmgray mt-1 leading-relaxed">
                There are no actions matching the selected filter query. Clear your search or trigger a simulated event above to pop progress!
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="px-5 py-2 text-xs mx-auto" 
              onClick={() => {
                setActiveModule('All');
                setSearchQuery('');
                setSelectedStaffFilter('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          
          /* Active feed of event items */
          <div className="space-y-3">
            {filteredEvents.slice(0, itemsToShow).map((evt) => {
              const isExpanded = expandedEventId === evt.id;
              
              return (
                <div 
                  key={evt.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden text-left ${
                    isExpanded 
                      ? 'border-antiquegold/40 shadow-md ring-1 ring-antiquegold/5' 
                      : 'border-[rgba(184,135,61,0.08)] hover:border-antiquegold/25 hover:shadow-xs'
                  }`}
                >
                  {/* ROW MAIN HEADER (COLLAPSED BODY VIEW) */}
                  <div 
                    onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                    className="p-4 flex items-start gap-3.5 cursor-pointer select-none"
                  >
                    {/* Circle icon container themed to type */}
                    <div className="w-8 h-8 rounded-full bg-[#F8F6F1] border border-[#e5dfd4] flex items-center justify-center shrink-0">
                      {getEventIcon(evt.type, evt.module)}
                    </div>

                    {/* Left text column info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider border ${getModuleBadgeColor(evt.module)}`}>
                          {evt.module}
                        </span>
                        
                        {evt.importance === 'high' && (
                          <span className="bg-error/5 text-[#B23B3B] border border-error/10 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                            CRITICAL
                          </span>
                        )}

                        <span className="text-[10px] text-warmgray font-medium flex items-center gap-1 ml-auto shrink-0 font-mono">
                          <Clock className="w-3 h-3 stroke-[1.5]" />
                          {evt.timeLabel}
                        </span>
                      </div>

                      <h4 className="font-serif text-sm font-bold text-charcoal mt-1.5 leading-tight">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-warmgray mt-1 truncate">
                        {evt.description}
                      </p>

                      {/* Small actor indicator strip */}
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-charcoal/70 font-semibold">
                        {evt.actorAvatarUrl ? (
                          <img src={evt.actorAvatarUrl} alt={evt.actorName} className="w-4.5 h-4.5 rounded-full object-cover" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full bg-royalemerald/10 text-royalemerald flex items-center justify-center text-[8px] font-bold">
                            {evt.actorRole[0]}
                          </div>
                        )}
                        <span>{evt.actorName}</span>
                        <span className="text-warmgray font-normal">({evt.actorRole})</span>
                      </div>
                    </div>

                    {/* Right caret column */}
                    <div className="self-center text-warmgray/55">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* EXPANDED INNER BODY CONTAINER (STAGGER REVEAL) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#FAF9F5] border-t border-[rgba(184,135,61,0.08)] p-4 sm:p-5 text-xs space-y-4"
                      >
                        {/* Event detailed meta-lists */}
                        {evt.details?.metaList && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-[rgba(184,135,61,0.08)]">
                            {evt.details.metaList.map((meta, idx) => (
                              <div key={idx} className="space-y-0.5">
                                <p className="text-[9px] uppercase font-bold text-warmgray tracking-wider">{meta.label}</p>
                                <p className={`font-semibold text-charcoal text-xs truncate ${meta.isMono ? 'font-mono text-[10px] text-royalemerald bg-[#F8F6F1] px-1 py-0.5 rounded border border-[#e5dfd4]' : ''}`}>
                                  {meta.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive SOP progress vertical line (Ascension Line signature) */}
                        {evt.details?.pipelineSteps && (
                          <div className="space-y-2 bg-white p-4 rounded-xl border border-[rgba(184,135,61,0.08)]">
                            <h5 className="text-[10px] uppercase font-extrabold text-antiquegold tracking-widest flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-antiquegold" />
                              Ascension Pipeline Status
                            </h5>
                            
                            {/* Horizontal visual checklist step map */}
                            <div className="flex justify-between items-center pt-2 gap-2 overflow-x-auto">
                              {evt.details.pipelineSteps.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 shrink-0">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                    step.done ? 'bg-success text-white' :
                                    step.active ? 'bg-antiquegold text-white animate-pulse' :
                                    'bg-[#F8F6F1] border border-[#e5dfd4] text-warmgray'
                                  }`}>
                                    {step.done ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[10px] font-bold ${step.active ? 'text-charcoal' : 'text-warmgray'}`}>
                                    {step.label}
                                  </span>
                                  {idx < (evt.details!.pipelineSteps!.length - 1) && (
                                    <span className="text-warmgray/35 text-[10px]">→</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTAs and Deep Links inside expanded view */}
                        <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
                          <div className="flex gap-1.5">
                            {evt.details?.statusBadgeText && (
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                                evt.details.statusBadgeColor === 'success' ? 'bg-[#E6F7ED] border-[#2E8F5B]/30 text-[#124B2C]' :
                                evt.details.statusBadgeColor === 'warning' ? 'bg-[#FFF9E6] border-[#D4AF37]/30 text-[#8C6412]' :
                                evt.details.statusBadgeColor === 'error' ? 'bg-[#FDF2F2] border-error/20 text-[#B23B3B]' :
                                'bg-[#F1F6FE] border-[#1D4ED8]/20 text-[#1D4ED8]'
                              }`}>
                                Status: {evt.details.statusBadgeText}
                              </span>
                            )}
                            <span className="px-2.5 py-1 bg-white border border-[#e5dfd4] text-warmgray rounded-full text-[9px] font-bold font-mono">
                              ID: {evt.id}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {/* Call to action to verify/act */}
                            {evt.type === 'milestone_completed' && (
                              <button 
                                onClick={() => alert('Verification and quality report generated. PDF archived.')}
                                className="px-3 py-1.5 bg-[#FFF9E6] hover:bg-[#FFF5C6] text-[#8C6412] rounded-lg border border-[#D4AF37]/30 text-[10px] font-bold transition-all"
                              >
                                View Photo Proof
                              </button>
                            )}

                            {evt.relatedRecordId && evt.relatedRecordType && (
                              <button
                                onClick={() => handleDeepLink(evt.relatedRecordType!, evt.relatedRecordId!)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-royalemerald hover:bg-opacity-90 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                              >
                                <span>Inspect Dossier</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more button */}
        {filteredEvents.length > itemsToShow && (
          <button
            onClick={loadMoreItems}
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.12)] text-xs font-bold transition-all flex items-center justify-center gap-2 text-charcoal/70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synchronizing Feed...</span>
              </>
            ) : (
              <>
                <span>Load Older Events</span>
                <ArrowDown className="w-4 h-4 stroke-[1.5]" />
              </>
            )}
          </button>
        )}
      </div>

      {/* =========================================================
          4. DETAILED DEEP-LINK Dossier modal (Fulfills deep link requirement)
          ========================================================= */}
      <AnimatePresence>
        {deepLinkedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F8F6F1] max-w-lg w-full rounded-3xl border border-[rgba(184,135,61,0.22)] shadow-2xl p-6 relative overflow-hidden text-left space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2.5 border-b border-[#e5dfd4]">
                <div>
                  <span className="text-[9px] font-mono font-extrabold uppercase text-antiquegold tracking-widest">
                    SECURE DATABASE ACCESS
                  </span>
                  <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-1.5">
                    <FileText className="w-5 h-5 text-royalemerald" />
                    Record: {deepLinkedRecord.type.toUpperCase()} #{deepLinkedRecord.id}
                  </h3>
                </div>
                <button 
                  onClick={() => setDeepLinkedRecord(null)}
                  className="p-1.5 hover:bg-white rounded-full text-warmgray transition-colors border border-transparent hover:border-[#e5dfd4]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lead dossier */}
              {deepLinkedRecord.type === 'lead' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-[rgba(184,135,61,0.1)] space-y-3">
                    <p className="text-xs font-bold text-charcoal border-b pb-1.5">Contact Profile</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Client Name</span>
                        <p className="font-semibold text-charcoal">{deepLinkedRecord.data?.contactInfo?.name || 'Prashant Wable'}</p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Phone Link</span>
                        <p className="font-semibold text-charcoal">{deepLinkedRecord.data?.contactInfo?.phone || '+91 95733 49855'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[rgba(184,135,61,0.1)] space-y-3">
                    <p className="text-xs font-bold text-charcoal border-b pb-1.5">Structural Requirements</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Total Floors</span>
                        <p className="font-semibold text-charcoal">{deepLinkedRecord.data?.buildingInfo?.floors || '4 Floors'}</p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Construction Type</span>
                        <p className="font-semibold text-charcoal">{deepLinkedRecord.data?.buildingInfo?.type || 'Residential'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-warmgray text-[9px] uppercase font-bold">Geo-Coordinates</span>
                        <p className="font-mono text-[10px] text-royalemerald">
                          Lat: {deepLinkedRecord.data?.buildingInfo?.latitude || '18.5204'} / Lng: {deepLinkedRecord.data?.buildingInfo?.longitude || '73.8567'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Job dossier */}
              {deepLinkedRecord.type === 'job' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-[rgba(184,135,61,0.1)] space-y-3">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <p className="text-xs font-bold text-charcoal">SOP Deployment Milestones</p>
                      <Badge variant="primary">{deepLinkedRecord.data?.status || 'In Progress'}</Badge>
                    </div>
                    
                    {/* Visual Gold elevator rail indicator */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[9px] uppercase font-bold text-warmgray tracking-widest">Ascension Rail Trace</p>
                      <div className="space-y-2 border-l border-antiquegold/40 pl-3 relative ml-1">
                        {(deepLinkedRecord.data?.sopSteps || [
                          { id: '1', label: 'Shaft Civil Well Readiness Completed', completed: true },
                          { id: '2', label: 'Guide Rails Plumb-Line Aligned', completed: true },
                          { id: '3', label: 'Cabin Slats Assembly Mounted', completed: false },
                          { id: '4', label: 'Traction Drive Motor Anchored', completed: false },
                          { id: '5', label: 'Safety Overspeed Governor Verification', completed: false }
                        ]).map((step: any, idx: number) => (
                          <div key={idx} className="relative text-xs">
                            <span className={`absolute -left-[17px] top-1 w-2 h-2 rounded-full border ${step.completed ? 'bg-success border-success' : 'bg-white border-antiquegold'}`} />
                            <span className={step.completed ? 'text-charcoal font-semibold' : 'text-warmgray'}>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment dossier */}
              {deepLinkedRecord.type === 'payment' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-[rgba(184,135,61,0.1)] space-y-3">
                    <p className="text-xs font-bold text-charcoal border-b pb-1.5">Financial Milestone Invoice</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Billed Stage</span>
                        <p className="font-semibold text-charcoal">{deepLinkedRecord.data?.stage || 'Advance (30%)'}</p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Outstanding Value</span>
                        <p className="font-mono text-xs font-bold text-royalemerald">{deepLinkedRecord.data?.amount ? `₹${deepLinkedRecord.data.amount.toLocaleString()}` : '₹3,75,000'}</p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Payment Link Status</span>
                        <p className="font-semibold text-success flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> 
                          {deepLinkedRecord.data?.status || 'Paid & Settled'}
                        </p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Clearing Date</span>
                        <p className="font-semibold text-charcoal">{deepLinkedRecord.data?.paidAt || '2026-07-06'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User dossier */}
              {deepLinkedRecord.type === 'user' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-[rgba(184,135,61,0.1)] space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-royalemerald text-white font-serif text-lg font-bold flex items-center justify-center shrink-0">
                        {deepLinkedRecord.data?.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{deepLinkedRecord.data?.name}</p>
                        <p className="text-[10px] text-warmgray uppercase font-mono font-bold">{deepLinkedRecord.data?.role} • {deepLinkedRecord.data?.region}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t mt-2">
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">Payout Bank Account</span>
                        <p className="font-mono text-xs">{deepLinkedRecord.data?.bankAccountNo || '5010023451234'}</p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">IFSC Route Code</span>
                        <p className="font-mono text-xs">{deepLinkedRecord.data?.bankIfsc || 'HDFC0000104'}</p>
                      </div>
                      <div>
                        <span className="text-warmgray text-[9px] uppercase font-bold">KYC Validation Status</span>
                        <span className="inline-block px-2 py-0.5 bg-success/10 border border-success/20 text-success rounded text-[9px] font-bold">
                          {deepLinkedRecord.data?.bankVerifiedStatus || 'verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer and Close */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDeepLinkedRecord(null);
                    alert(`Opened native dossier view inside system registry.`);
                  }}
                  className="flex-1 py-2 bg-royalemerald hover:bg-opacity-95 text-white rounded-xl text-xs font-bold text-center transition-all shadow-xs"
                >
                  Edit Master Record
                </button>
                <Button 
                  variant="secondary" 
                  className="py-2.5 px-4 text-xs font-bold"
                  onClick={() => setDeepLinkedRecord(null)}
                >
                  Close Archive
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
