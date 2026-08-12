import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Clock, User as UserIcon, PlusCircle, Download, Tag, 
  ChevronRight, Phone, ArrowRight, MapPin, AlertCircle, CheckCircle2, 
  TrendingUp, Send, FileText, Globe, Building, ChevronDown, Calendar, 
  AlertTriangle, Users, Check, RefreshCw, Layers, ShieldCheck, X, Trash2, Mail
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { User, Lead, LeadStage } from '../types';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { LeadDetail } from './LeadDetail';

// Define localized messages inside the component
const localizations = {
  en: {
    title: "Lead Inbox & Master List",
    subtitle: "Consolidated CRM Node • Opportunity Management Backbone",
    searchPlaceholder: "Search contact name or builder company...",
    filterStage: "All Stages",
    filterOwner: "All Owners",
    filterTerritory: "All Territories",
    filterSource: "All Sources",
    sortBy: "Sort By",
    sortStaleFirst: "Stale Leads First ⚠️",
    sortNewestFirst: "Newest Captured",
    sortOldestFirst: "Oldest Captured",
    unassigned: "UNASSIGNED ⚠️",
    unassignedAction: "Assign Owner",
    staleWarning: "Stale for {days} days",
    lastActive: "Last updated {time}",
    bulkActions: "Bulk Operations",
    bulkReassign: "Bulk Reassign Surveyor",
    bulkTag: "Bulk Append Tag/Note",
    bulkExport: "Bulk Export Selected",
    selectedCount: "{count} leads selected",
    sidePanelTitle: "Lead Investigation",
    details: "Details",
    activityHistory: "CRM Audit Trail",
    contactInfo: "Contact Parameters",
    buildingInfo: "Structure & Site Specs",
    quickActions: "Direct Actions",
    callLead: "Call Contact",
    whatsappLead: "WhatsApp Clearance",
    changeStage: "Transition Stage",
    noLeadsFound: "No elevator leads match the current filters.",
    clearFilters: "Reset CRM Filters",
    assignPrompt: "Select partner to delegate...",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    justNow: "just now",
    exportProgress: "Exporting leads, please wait...",
    exportSuccess: "Successfully generated elevator_leads_export.csv",
    saveSuccess: "Lead parameters updated successfully!",
    applyTagTitle: "Enter Tag or Note to Append",
    applyTagBtn: "Apply Tag",
    sourceWebsite: "Self-Service QR Code",
    sourceWhatsApp: "Inbound WhatsApp Broker",
    sourceColdCall: "Physical Field Scouting",
    sourceReference: "Architect Reference",
    sourceAd: "Digital Display Ads",
    sourceField: "Frontline Field Surveyor",
    stageCaptured: "Lead Logged",
    stageAssigned: "Surveyor Assigned",
    stageContacted: "Contact Established",
    stageSurveyDone: "Site Survey Done",
    stageQuoted: "Commercial Quote",
    stageNegotiating: "Price Negotiation",
    stageWon: "Deal Signed (Won) 🏆",
    stageLost: "Dead Node (Lost) ❌",
    stageTitle: "Elevator Progress Node",
    ownerLabel: "Account Owner",
    sourceLabel: "Inbound Source",
    dateLabel: "Captured On",
    territoryLabel: "Sales Territory",
    noActivityLogs: "No audit trails logged yet.",
    itemsPerPage: "Leads per page",
    pageInfo: "Page {current} of {total}",
    loading: "Loading...",
    close: "Close"
  },
  mr: {
    title: "लीड इनबॉक्स आणि मास्टर लिस्ट",
    subtitle: "एकत्रित सीआरएम नोड • ऑल इंडिया एलिव्हेटर्स व्यवस्थापन",
    searchPlaceholder: "नाव किंवा बिल्डर कंपनीने शोधा...",
    filterStage: "सर्व टप्पे",
    filterOwner: "सर्व मालक",
    filterTerritory: "सर्व क्षेत्रे",
    filterSource: "सर्व स्रोत",
    sortBy: "क्रमवारी",
    sortStaleFirst: "शिळे लीड्स प्रथम ⚠️",
    sortNewestFirst: "नवीनतम नोंदणी",
    sortOldestFirst: "जुनी नोंदणी",
    unassigned: "असोपवलेले ⚠️",
    unassignedAction: "मालक सोपवा",
    staleWarning: "{days} दिवसांपासून प्रलंबित",
    lastActive: "अद्यतनित {time}",
    bulkActions: "एकत्रित कृती",
    bulkReassign: "एकत्रित मालक सोपवा",
    bulkTag: "एकत्रित टीप जोडा",
    bulkExport: "एकत्रित निर्यात करा",
    selectedCount: "{count} लीड्स निवडले",
    sidePanelTitle: "लीड तपशील तपासणी",
    details: "तपशील",
    activityHistory: "सीआरएम ऑडिट ट्रेल",
    contactInfo: "संपर्क माहिती",
    buildingInfo: "बांधकाम आणि जागा तपशील",
    quickActions: "थेट कृती",
    callLead: "कॉल करा",
    whatsappLead: "व्हॉट्सॲपवर पाठवा",
    changeStage: "टप्पा बदला",
    noLeadsFound: "निवडलेल्या फिल्टरनुसार कोणतेही लीड्स आढळले नाहीत.",
    clearFilters: "फिल्टर्स रीसेट करा",
    assignPrompt: "प्रतिनिधी निवडा...",
    days: "दिवस",
    hours: "तास",
    minutes: "मिनिटे",
    justNow: "आत्ताच",
    exportProgress: "निर्यात सुरू आहे, कृपया थांबा...",
    exportSuccess: "elevator_leads_export.csv यशस्वीरित्या तयार झाले",
    saveSuccess: "माहिती यशस्वीरित्या जतन केली!",
    applyTagTitle: "टीप किंवा टॅग प्रविष्ट करा",
    applyTagBtn: "टीप जोडा",
    sourceWebsite: "स्वयं-सेवा क्यूआर कोड",
    sourceWhatsApp: "थेट व्हॉट्सॲप ब्रोकर",
    sourceColdCall: "फील्ड सर्वेक्षण",
    sourceReference: "आर्किटेक्ट संदर्भ",
    sourceAd: "डिजिटल जाहिरात",
    sourceField: "फील्ड सर्वेक्षक",
    stageCaptured: "नोंदणी झाली",
    stageAssigned: "सर्वेक्षक नियुक्त",
    stageContacted: "संपर्क प्रस्थापित",
    stageSurveyDone: "साइट सर्वेक्षण पूर्ण",
    stageQuoted: "कोटेशन दिले",
    stageNegotiating: "किंमत वाटाघाटी",
    stageWon: "करार मंजूर (विजय) 🏆",
    stageLost: "बंद (नुकसान) ❌",
    stageTitle: "लिफ्ट प्रगती नोड",
    ownerLabel: "खाते मालक",
    sourceLabel: "नोंदणी स्रोत",
    dateLabel: "नोंदणी तारीख",
    territoryLabel: "विक्री क्षेत्र",
    noActivityLogs: "अद्याप कोणताही ऑडिट ट्रेल नाही.",
    itemsPerPage: "पृष्ठावरील लीड्स",
    pageInfo: "पृष्ठ {current} पैकी {total}",
    loading: "लोड होत आहे...",
    close: "बंद करा"
  },
  hi: {
    title: "लीड इनबॉक्स और मास्टर लिस्ट",
    subtitle: "समेकित सीआरएम नोड • ऑल इंडिया एलिवेटर्स प्रबंधन",
    searchPlaceholder: "नाम या बिल्डर कंपनी से खोजें...",
    filterStage: "सभी चरण",
    filterOwner: "सभी स्वामी",
    filterTerritory: "सभी क्षेत्र",
    filterSource: "सभी स्रोत",
    sortBy: "क्रमबद्ध करें",
    sortStaleFirst: "बासी लीड्स पहले ⚠️",
    sortNewestFirst: "नवीनतम पंजीकरण",
    sortOldestFirst: "सबसे पुराना पंजीकरण",
    unassigned: "अनआबंटित ⚠️",
    unassignedAction: "स्वामी आबंटित करें",
    staleWarning: "{days} दिनों से निष्क्रिय",
    lastActive: "अपडेट किया गया {time}",
    bulkActions: "थोक संचालन",
    bulkReassign: "थोक स्वामी आबंटन",
    bulkTag: "थोक नोट जोड़ें",
    bulkExport: "थोक निर्यात",
    selectedCount: "{count} लीड चयनित",
    sidePanelTitle: "लीड अन्वेषण पैनल",
    details: "विवरण",
    activityHistory: "सीआरएम ऑडिट ट्रेल",
    contactInfo: "संपर्क पैरामीटर",
    buildingInfo: "भवन और साइट विनिर्देश",
    quickActions: "सीधी कार्रवाई",
    callLead: "कॉल शुरू करें",
    whatsappLead: "व्हाट्सएप क्लियरेंस",
    changeStage: "चरण बदलें",
    noLeadsFound: "चयनित फिल्टर के अनुसार कोई लीड नहीं मिली।",
    clearFilters: "फिल्टर रीसेट करें",
    assignPrompt: "प्रतिनिधि का चयन करें...",
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट",
    justNow: "अभी-अभी",
    exportProgress: "निर्यात हो रहा है, कृपया प्रतीक्षा करें...",
    exportSuccess: "elevator_leads_export.csv सफलतापूर्वक उत्पन्न हुई",
    saveSuccess: "पैरामीटर सफलतापूर्वक अपडेट किए गए!",
    applyTagTitle: "नोट या टैग दर्ज करें",
    applyTagBtn: "नोट लागू करें",
    sourceWebsite: "स्वयं-सेवा क्यूआर कोड",
    sourceWhatsApp: "व्हाट्सएप ब्रोकर",
    sourceColdCall: "फील्ड सर्वेक्षण",
    sourceReference: "आर्किटेक्ट संदर्भ",
    sourceAd: "डिजिटल विज्ञापन",
    sourceField: "फील्ड सर्वेक्षक",
    stageCaptured: "लीड लॉग हुई",
    stageAssigned: "सर्वेक्षक आबंटित",
    stageContacted: "संपर्क स्थापित",
    stageSurveyDone: "साइट सर्वेक्षण पूर्ण",
    stageQuoted: "कोटेशन प्रेषित",
    stageNegotiating: "मूल्य बातचीत",
    stageWon: "सौदा जीता (Won) 🏆",
    stageLost: "बंद (Lost) ❌",
    stageTitle: "लिफ्ट प्रगति नोड",
    ownerLabel: "खाता स्वामी",
    sourceLabel: "पंजीकरण स्रोत",
    dateLabel: "पंजीकरण तिथि",
    territoryLabel: "बिक्री क्षेत्र",
    noActivityLogs: "अभी तक कोई ऑडिट ट्रेल लॉग नहीं है।",
    itemsPerPage: "पृष्ठ प्रति लीड्स",
    pageInfo: "पृष्ठ {current} का {total}",
    loading: "लोड हो रहा है...",
    close: "बंद करें"
  }
};

// Interface for Audit Trail entries
export interface LeadAuditLog {
  id: string;
  leadId: string;
  leadName: string;
  action: 'reassignment' | 'status_change' | 'tag_added' | 'created';
  fromValue?: string;
  toValue?: string;
  actor: string;
  timestamp: string;
  note?: string;
}

// Stage configuration for colors
export const STAGE_CONFIG: Record<LeadStage, { labelKey: string; color: string; bgClass: string; textClass: string; borderClass: string }> = {
  captured: { labelKey: 'stageCaptured', color: '#0E4B3D', bgClass: 'bg-royalemerald/10', textClass: 'text-royalemerald', borderClass: 'border-royalemerald/20' },
  assigned: { labelKey: 'stageAssigned', color: '#2563EB', bgClass: 'bg-blue-500/10', textClass: 'text-blue-600', borderClass: 'border-blue-500/20' },
  contacted: { labelKey: 'stageContacted', color: '#4F46E5', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-600', borderClass: 'border-indigo-500/20' },
  survey_done: { labelKey: 'stageSurveyDone', color: '#D97706', bgClass: 'bg-amber-500/10', textClass: 'text-amber-600', borderClass: 'border-amber-500/20' },
  quoted: { labelKey: 'stageQuoted', color: '#B8873D', bgClass: 'bg-antiquegold/10', textClass: 'text-antiquegold', borderClass: 'border-antiquegold/20' },
  negotiating: { labelKey: 'stageNegotiating', color: '#8B5CF6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-600', borderClass: 'border-purple-500/20' },
  closed_won: { labelKey: 'stageWon', color: '#10B981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-600', borderClass: 'border-emerald-500/20' },
  closed_lost: { labelKey: 'stageLost', color: '#EF4444', bgClass: 'bg-red-500/10', textClass: 'text-red-600', borderClass: 'border-red-500/20' }
};

// Available sources
const SOURCE_POOL = ['website_qr', 'whatsapp_broker', 'cold_scout', 'architect_ref', 'digital_ad', 'surveyor_log'];

export const LeadInbox: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const activeLang: 'en' | 'mr' | 'hi' = (language === 'mr' || language === 'hi' || language === 'en') ? language : 'en';
  const t = localizations[activeLang];

  // Core database states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<LeadAuditLog[]>([]);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedOwner, setSelectedOwner] = useState<string>('All');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'stale' | 'newest' | 'oldest'>('stale');

  // Multi-select & Bulk operations
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkReassignId, setBulkReassignId] = useState<string>('');
  const [bulkTagText, setBulkTagText] = useState<string>('');
  const [isBulkReassigning, setIsBulkReassigning] = useState(false);
  const [isBulkTagging, setIsBulkTagging] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Quick-view side panel
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [viewingLeadDetailId, setViewingLeadDetailId] = useState<string | null>(null);

  // Simulator/Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  // Sync state with database
  const refreshDatabase = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Fetch leads
      let dbLeads = DbManager.getLeads();
      
      // Inject some source & last_activity_timestamp values if they don't exist to satisfy CRM structure
      const enhanced = dbLeads.map((l, index) => {
        const sourceVal = (l as any).source || SOURCE_POOL[index % SOURCE_POOL.length];
        const activityTimestamp = l.updatedAt || new Date(Date.now() - index * 2 * 24 * 3600 * 1000).toISOString();
        return {
          ...l,
          source: sourceVal,
          updatedAt: activityTimestamp
        } as Lead;
      });

      setLeads(enhanced);

      // Fetch active surveyors & admins who can be owners
      const dbUsers = DbManager.getUsers();
      const eligibleOwners = dbUsers.filter(u => u.role === 'surveyor' || u.role === 'admin');
      setSurveyors(eligibleOwners);

      // Fetch territories
      const dbTerritories = DbManager.getTerritories();
      setTerritories(dbTerritories);

      // Fetch audit logs
      const savedLogs = localStorage.getItem('aiec_lead_audit_logs');
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      } else {
        // Seed some initial logs matching our active leads
        const seedLogs: LeadAuditLog[] = [
          {
            id: 'log_seed_1',
            leadId: 'lead_1',
            leadName: 'Rohan Deshmukh',
            action: 'created',
            actor: 'System',
            timestamp: '2026-07-01T10:00:00Z',
            note: 'Lead captured via QR Code Portal'
          },
          {
            id: 'log_seed_2',
            leadId: 'lead_1',
            leadName: 'Rohan Deshmukh',
            action: 'reassignment',
            fromValue: 'Unassigned',
            toValue: 'Amit Sharma',
            actor: 'Mr. Prashant Vasant Wable',
            timestamp: '2026-07-02T11:00:00Z',
            note: 'Delegated based on Kothrud territory rules'
          },
          {
            id: 'log_seed_3',
            leadId: 'lead_2',
            leadName: 'Suresh Patil',
            action: 'created',
            actor: 'System',
            timestamp: '2026-07-06T11:15:00Z',
            note: 'Lead captured via cold scouting'
          }
        ];
        localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(seedLogs));
        setAuditLogs(seedLogs);
      }

      setIsLoading(false);
    }, 450);
  };

  useEffect(() => {
    refreshDatabase();
    
    // Listen to updates from other screens
    window.addEventListener('aiec_db_update', refreshDatabase);
    return () => {
      window.removeEventListener('aiec_db_update', refreshDatabase);
    };
  }, []);

  // Show auto-fading toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Human friendly time formatting helper (Lakh / Western digit aware)
  const getRelativeTimeString = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 6000);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return `${diffMins} ${t.minutes}`;
    if (diffHrs < 24) return `${diffHrs} ${t.hours}`;
    return `${diffDays} ${t.days}`;
  };

  // Helper to resolve surveyor name safely
  const getSurveyorName = (surveyorId?: string) => {
    if (!surveyorId) return null;
    const s = surveyors.find(user => user.id === surveyorId);
    return s ? s.name : surveyorId;
  };

  // Get active territory of a lead based on coordinate mapping or assigned territory
  const getLeadTerritory = (lead: Lead) => {
    // Attempt match with known coordinates
    if (lead.buildingInfo.latitude && lead.buildingInfo.longitude) {
      const lat = lead.buildingInfo.latitude;
      const lng = lead.buildingInfo.longitude;
      // Find the closest territory
      let bestTerritory = "Unassigned";
      let minDistance = Infinity;

      territories.forEach(terr => {
        if (terr.polygonCoordinates && terr.polygonCoordinates.length > 0) {
          const centerLat = terr.polygonCoordinates[0].lat;
          const centerLng = terr.polygonCoordinates[0].lng;
          const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
          if (dist < minDistance) {
            minDistance = dist;
            bestTerritory = terr.name;
          }
        }
      });
      return bestTerritory;
    }
    return "Unassigned";
  };

  // Localized string mapper for source key
  const getLocalizedSource = (source?: string) => {
    if (!source) return t.sourceField;
    switch (source) {
      case 'website_qr': return t.sourceWebsite;
      case 'whatsapp_broker': return t.sourceWhatsApp;
      case 'cold_scout': return t.sourceColdCall;
      case 'architect_ref': return t.sourceReference;
      case 'digital_ad': return t.sourceAd;
      case 'surveyor_log': return t.sourceField;
      default: return source;
    }
  };

  // Search filter and multi-field logic matching contact name & company name
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // 1. Query matching
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => {
        const clientName = lead.contactInfo.name?.toLowerCase() || '';
        const companyName = lead.contactInfo.companyName?.toLowerCase() || '';
        const address = lead.buildingInfo.address?.toLowerCase() || '';
        return clientName.includes(query) || companyName.includes(query) || address.includes(query);
      });
    }

    // 2. Stage filtering
    if (selectedStage !== 'All') {
      result = result.filter(lead => lead.stage === selectedStage);
    }

    // 3. Owner filtering
    if (selectedOwner !== 'All') {
      if (selectedOwner === 'unassigned') {
        result = result.filter(lead => !lead.surveyorId);
      } else {
        result = result.filter(lead => lead.surveyorId === selectedOwner);
      }
    }

    // 4. Territory filtering
    if (selectedTerritory !== 'All') {
      result = result.filter(lead => getLeadTerritory(lead) === selectedTerritory);
    }

    // 5. Source filtering
    if (selectedSource !== 'All') {
      result = result.filter(lead => (lead as any).source === selectedSource);
    }

    // 6. Sorting (Default stale leads first)
    result.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();

      if (sortOrder === 'stale') {
        // Stale first means oldest updatedAt/activity first (no recent activity)
        return timeA - timeB;
      } else if (sortOrder === 'newest') {
        return timeB - timeA;
      } else {
        return timeA - timeB;
      }
    });

    return result;
  }, [leads, searchQuery, selectedStage, selectedOwner, selectedTerritory, selectedSource, sortOrder, territories]);

  // Paginated results based on proper pagination limits
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [processedLeads, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedLeads.length / itemsPerPage) || 1;

  // Sync page limits
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStage, selectedOwner, selectedTerritory, selectedSource, itemsPerPage]);

  // Handle single row checkbox toggle
  const handleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Toggle select all on current paginated view
  const handleSelectAllCurrentPage = () => {
    const currentIds = paginatedLeads.map(l => l.id);
    const allSelected = currentIds.every(id => selectedLeadIds.includes(id));

    if (allSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedLeadIds, ...currentIds]));
      setSelectedLeadIds(combined);
    }
  };

  // Direct Reassign inside table/side panel
  const handleDirectReassign = (leadId: string, targetSurveyorId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const oldOwnerName = getSurveyorName(lead.surveyorId) || "Unassigned";
    const newOwnerName = getSurveyorName(targetSurveyorId) || "Unassigned";

    const updatedLead: Lead = {
      ...lead,
      surveyorId: targetSurveyorId,
      updatedAt: new Date().toISOString()
    };

    // Log individual audit trail entry
    const newAuditLog: LeadAuditLog = {
      id: `audit_${Date.now()}_${leadId}`,
      leadId,
      leadName: lead.contactInfo.name,
      action: 'reassignment',
      fromValue: oldOwnerName,
      toValue: newOwnerName,
      actor: user.name,
      timestamp: new Date().toISOString(),
      note: `Delegated directly to ${newOwnerName}`
    };

    const nextLogs = [newAuditLog, ...auditLogs];
    localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(nextLogs));
    setAuditLogs(nextLogs);

    DbManager.updateLead(updatedLead);
    triggerToast(`Lead delegated to ${newOwnerName} successfully.`);
    refreshDatabase();

    if (activeLead && activeLead.id === leadId) {
      setActiveLead(updatedLead);
    }
  };

  // Direct Stage Transition
  const handleDirectStageTransition = (leadId: string, nextStage: LeadStage) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const oldStage = lead.stage;
    const updatedLead: Lead = {
      ...lead,
      stage: nextStage,
      updatedAt: new Date().toISOString()
    };

    const newAuditLog: LeadAuditLog = {
      id: `audit_${Date.now()}_stage_${leadId}`,
      leadId,
      leadName: lead.contactInfo.name,
      action: 'status_change',
      fromValue: oldStage,
      toValue: nextStage,
      actor: user.name,
      timestamp: new Date().toISOString(),
      note: `Stage transitioned from ${oldStage} to ${nextStage}`
    };

    const nextLogs = [newAuditLog, ...auditLogs];
    localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(nextLogs));
    setAuditLogs(nextLogs);

    DbManager.updateLead(updatedLead);
    triggerToast(`Stage updated to ${nextStage.toUpperCase().replace('_', ' ')}.`);
    refreshDatabase();

    if (activeLead && activeLead.id === leadId) {
      setActiveLead(updatedLead);
    }
  };

  // Bulk Reassign operation
  const handleBulkReassign = () => {
    if (selectedLeadIds.length === 0 || !bulkReassignId) return;

    setIsBulkReassigning(true);
    const newOwnerName = getSurveyorName(bulkReassignId) || "Unassigned";

    setTimeout(() => {
      const nextLogs = [...auditLogs];

      selectedLeadIds.forEach(id => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          const oldOwnerName = getSurveyorName(lead.surveyorId) || "Unassigned";
          
          const updated: Lead = {
            ...lead,
            surveyorId: bulkReassignId,
            updatedAt: new Date().toISOString()
          };
          DbManager.updateLead(updated);

          // LOG AUDIT TRAIL ENTRY PER LEAD AFFECTED INDIVIDUALLY
          const individualLog: LeadAuditLog = {
            id: `audit_${Date.now()}_bulk_${id}`,
            leadId: id,
            leadName: lead.contactInfo.name,
            action: 'reassignment',
            fromValue: oldOwnerName,
            toValue: newOwnerName,
            actor: user.name,
            timestamp: new Date().toISOString(),
            note: `Bulk delegation node adjustment: transferred from ${oldOwnerName} to ${newOwnerName}`
          };

          nextLogs.unshift(individualLog);
        }
      });

      localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(nextLogs));
      setAuditLogs(nextLogs);

      triggerToast(`Successfully reassigned ${selectedLeadIds.length} leads to ${newOwnerName}.`);
      setSelectedLeadIds([]);
      setBulkReassignId('');
      setIsBulkReassigning(false);
      refreshDatabase();
    }, 600);
  };

  // Bulk Tag operation
  const handleBulkTag = () => {
    if (selectedLeadIds.length === 0 || !bulkTagText.trim()) return;

    setIsBulkTagging(true);

    setTimeout(() => {
      const nextLogs = [...auditLogs];

      selectedLeadIds.forEach(id => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          // Add custom tag/note as note field in audit trail
          const individualLog: LeadAuditLog = {
            id: `audit_${Date.now()}_tag_${id}`,
            leadId: id,
            leadName: lead.contactInfo.name,
            action: 'tag_added',
            actor: user.name,
            timestamp: new Date().toISOString(),
            note: bulkTagText
          };
          nextLogs.unshift(individualLog);
        }
      });

      localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(nextLogs));
      setAuditLogs(nextLogs);

      triggerToast(`Successfully appended tag/note to ${selectedLeadIds.length} leads.`);
      setSelectedLeadIds([]);
      setBulkTagText('');
      setIsBulkTagging(false);
      refreshDatabase();
    }, 500);
  };

  // Bulk Export Simulation with progress bar and detailed logs
  const handleBulkExport = () => {
    if (selectedLeadIds.length === 0) return;

    setExportProgress(10);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExportProgress(null);
            triggerToast(t.exportSuccess);
            
            // Build raw CSV content
            const exportLeads = leads.filter(l => selectedLeadIds.includes(l.id));
            const csvRows = [
              ['Lead ID', 'Contact Name', 'Phone', 'Stage', 'Owner', 'Territory', 'Source', 'Floors', 'Address', 'Capture Date', 'Last Activity'],
              ...exportLeads.map(l => [
                l.id,
                l.contactInfo.name,
                l.contactInfo.phone,
                l.stage,
                getSurveyorName(l.surveyorId) || 'Unassigned',
                getLeadTerritory(l),
                l.source || 'Unknown',
                l.buildingInfo.floors,
                `"${l.buildingInfo.address.replace(/"/g, '""')}"`,
                l.createdAt,
                l.updatedAt
              ])
            ];

            const csvContent = "data:text/csv;charset=utf-8," 
              + csvRows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `aiec_elevator_leads_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setSelectedLeadIds([]);
          }, 300);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // Simulated VoIP Trigger
  const handleVoipCall = (phone: string, name: string) => {
    triggerToast(`Dialing securely via VoIP routing node to ${name} (${phone}). Recording initialized...`);
  };

  // Simulated WhatsApp dispatch
  const handleWhatsAppNudge = (phone: string, name: string) => {
    triggerToast(`Initiating automated WhatsApp outreach sequence for ${name}. Digital prospectus sent!`);
  };

  // Get active audit history for selected quick view lead
  const activeLeadLogs = useMemo(() => {
    if (!activeLead) return [];
    return auditLogs.filter(log => log.leadId === activeLead.id);
  }, [activeLead, auditLogs]);

  // Stages array to draw the customized Ascension Line indicators
  const ascensionStages: { stage: LeadStage; key: string }[] = [
    { stage: 'captured', key: 'stageCaptured' },
    { stage: 'assigned', key: 'stageAssigned' },
    { stage: 'contacted', key: 'stageContacted' },
    { stage: 'survey_done', key: 'stageSurveyDone' },
    { stage: 'quoted', key: 'stageQuoted' },
    { stage: 'negotiating', key: 'stageNegotiating' },
    { stage: 'closed_won', key: 'stageWon' }
  ];

  // Map stage to its step index on the elevator track
  const getStageIndex = (current: LeadStage) => {
    return ascensionStages.findIndex(s => s.stage === current);
  };

  if (viewingLeadDetailId) {
    return (
      <LeadDetail 
        leadId={viewingLeadDetailId} 
        onBack={() => {
          setViewingLeadDetailId(null);
          refreshDatabase();
        }} 
        currentUser={user} 
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* ---------------------------------------------------------
          HEADER BLOCK
          --------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[rgba(184,135,61,0.15)] shadow-diffuse relative overflow-hidden">
        {/* Subtle decorative golden elevator shaft watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-antiquegold/5 to-transparent pointer-events-none" />
        
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-royalemerald animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-royalemerald font-extrabold">CRM Portal Dashboard</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">{t.title}</h2>
          <p className="text-xs text-warmgray">{t.subtitle}</p>
        </div>

        {/* Diagnostic / Simulation indicators */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <Button 
            variant="outline" 
            className="py-2 px-3 text-xs border-antiquegold/35 text-antiquegold bg-white"
            onClick={() => window.dispatchEvent(new CustomEvent('aiec_switch_tab', { detail: 'LeadPipeline' }))}
          >
            📋 Kanban Board
          </Button>
          <Button 
            variant="outline" 
            className="py-2 px-3 text-xs border-antiquegold/35 text-antiquegold bg-white"
            onClick={() => window.dispatchEvent(new CustomEvent('aiec_switch_tab', { detail: 'LeadAssignment' }))}
          >
            👤 Assignment Hub
          </Button>
          <Button 
            variant="outline" 
            className="py-2 px-3 text-xs border-antiquegold/35 text-antiquegold bg-white"
            onClick={() => window.dispatchEvent(new CustomEvent('aiec_switch_tab', { detail: 'LeadMerge' }))}
          >
            ⛓️ Merge Studio
          </Button>
          <Button 
            variant="outline" 
            className="py-2 px-3 text-xs border-antiquegold/35 text-antiquegold bg-white animate-pulse"
            onClick={() => window.dispatchEvent(new CustomEvent('aiec_switch_tab', { detail: 'LeadScoring' }))}
          >
            📈 Lead Scoring
          </Button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] text-[10px] font-mono font-bold text-warmgray">
            <Clock className="w-3.5 h-3.5 text-antiquegold" />
            <span>Database Nodes: {processedLeads.length}</span>
          </div>
          <Button variant="secondary" className="py-2.5 px-3 bg-white hover:bg-alabaster text-charcoal border-[rgba(184,135,61,0.15)] shadow-xs" onClick={refreshDatabase}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          STICKY SEARCH & FILTER CONTROL DECK
          --------------------------------------------------------- */}
      <Card className="p-5 space-y-4">
        
        {/* Row 1: Search & Sort */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Multi-field search box */}
          <div className="lg:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warmgray/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10.5 pr-4 py-3 bg-alabaster/40 hover:bg-alabaster/60 border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold placeholder-warmgray/60 focus:bg-white focus:ring-1 focus:ring-antiquegold focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warmgray hover:text-charcoal font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort selection */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-warmgray whitespace-nowrap">{t.sortBy}:</span>
            <div className="relative flex-1">
              <select
                value={sortOrder}
                onChange={(e: any) => setSortOrder(e.target.value)}
                className="w-full px-3.5 py-3 bg-white border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-bold font-sans appearance-none focus:ring-1 focus:ring-antiquegold focus:outline-none cursor-pointer"
              >
                <option value="stale">{t.sortStaleFirst}</option>
                <option value="newest">{t.sortNewestFirst}</option>
                <option value="oldest">{t.sortOldestFirst}</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Row 2: Secondary Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-dashed border-[#e6dfd4]">
          
          {/* Stage Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase font-extrabold text-warmgray tracking-widest">{t.stageTitle}</label>
            <div className="relative">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2.5 bg-alabaster rounded-xl text-xs font-bold appearance-none cursor-pointer border border-transparent hover:border-antiquegold/10 focus:bg-white focus:ring-1 focus:ring-antiquegold"
              >
                <option value="All">{t.filterStage}</option>
                {Object.keys(STAGE_CONFIG).map((stage) => (
                  <option key={stage} value={stage}>
                    {t[STAGE_CONFIG[stage as LeadStage].labelKey as keyof typeof t] || stage}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warmgray pointer-events-none" />
            </div>
          </div>

          {/* Owner Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase font-extrabold text-warmgray tracking-widest">{t.ownerLabel}</label>
            <div className="relative">
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className="w-full px-3 py-2.5 bg-alabaster rounded-xl text-xs font-bold appearance-none cursor-pointer border border-transparent hover:border-antiquegold/10 focus:bg-white focus:ring-1 focus:ring-antiquegold"
              >
                <option value="All">{t.filterOwner}</option>
                <option value="unassigned">{t.unassigned.split(' ')[0]}</option>
                {surveyors.map(surv => (
                  <option key={surv.id} value={surv.id}>{surv.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warmgray pointer-events-none" />
            </div>
          </div>

          {/* Territory Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase font-extrabold text-warmgray tracking-widest">{t.territoryLabel}</label>
            <div className="relative">
              <select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                className="w-full px-3 py-2.5 bg-alabaster rounded-xl text-xs font-bold appearance-none cursor-pointer border border-transparent hover:border-antiquegold/10 focus:bg-white focus:ring-1 focus:ring-antiquegold"
              >
                <option value="All">{t.filterTerritory}</option>
                {Array.from(new Set(territories.map(t => t.name))).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warmgray pointer-events-none" />
            </div>
          </div>

          {/* Source Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase font-extrabold text-warmgray tracking-widest">{t.sourceLabel}</label>
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2.5 bg-alabaster rounded-xl text-xs font-bold appearance-none cursor-pointer border border-transparent hover:border-antiquegold/10 focus:bg-white focus:ring-1 focus:ring-antiquegold"
              >
                <option value="All">{t.filterSource}</option>
                {SOURCE_POOL.map(src => (
                  <option key={src} value={src}>{getLocalizedSource(src)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warmgray pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Clear active filters helper */}
        {(selectedStage !== 'All' || selectedOwner !== 'All' || selectedTerritory !== 'All' || selectedSource !== 'All' || searchQuery !== '') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSelectedStage('All');
                setSelectedOwner('All');
                setSelectedTerritory('All');
                setSelectedSource('All');
                setSearchQuery('');
              }}
              className="text-xs font-extrabold text-antiquegold hover:text-charcoal transition-all flex items-center gap-1 cursor-pointer"
            >
              ✕ {t.clearFilters}
            </button>
          </div>
        )}

      </Card>

      {/* ---------------------------------------------------------
          MAIN LIST GRID (HIGH VOLUME PAGINATION COMPATIBLE)
          --------------------------------------------------------- */}
      <Card className="overflow-hidden">
        
        {/* Table/List View Header */}
        <div className="bg-[#F8F6F1]/75 border-b border-[rgba(184,135,61,0.12)] p-4 flex items-center justify-between text-[10px] font-mono uppercase font-extrabold tracking-widest text-warmgray">
          <div className="flex items-center gap-4">
            <input 
              type="checkbox" 
              checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.includes(l.id))}
              onChange={handleSelectAllCurrentPage}
              className="w-4 h-4 rounded cursor-pointer accent-antiquegold"
            />
            <span>{t.details}</span>
          </div>
          <div className="hidden md:flex gap-16 items-center">
            <span className="w-24 text-center">{t.territoryLabel}</span>
            <span className="w-32 text-center">{t.ownerLabel}</span>
            <span className="w-28 text-center">{t.stageTitle}</span>
          </div>
        </div>

        {/* Repeating List Rows */}
        <div className="divide-y divide-[rgba(184,135,61,0.1)]">
          {isLoading ? (
            // Loading Skeletons
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-24 hidden md:block" />
              </div>
            ))
          ) : paginatedLeads.length === 0 ? (
            // Zero Empty State with elegant design
            <div className="p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-antiquegold/10 text-antiquegold rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-charcoal">{t.noLeadsFound}</h4>
                <p className="text-xs text-warmgray max-w-sm mx-auto">Try adjusting your filters, or registering a new lead node on the CRM control deck.</p>
              </div>
              <Button variant="outline" className="mx-auto" onClick={() => {
                setSelectedStage('All');
                setSelectedOwner('All');
                setSelectedTerritory('All');
                setSelectedSource('All');
                setSearchQuery('');
              }}>
                {t.clearFilters}
              </Button>
            </div>
          ) : (
            // Populated list items
            paginatedLeads.map((lead) => {
              const isSelected = selectedLeadIds.includes(lead.id);
              const isStale = (Date.now() - new Date(lead.updatedAt || lead.createdAt).getTime()) > 3 * 24 * 3600 * 1000;
              const daysStale = Math.max(1, Math.floor((Date.now() - new Date(lead.updatedAt || lead.createdAt).getTime()) / (24 * 3600 * 1000)));
              const ownerName = getSurveyorName(lead.surveyorId);
              const leadTerritory = getLeadTerritory(lead);
              const stageInfo = STAGE_CONFIG[lead.stage] || STAGE_CONFIG.captured;

              return (
                <div 
                  key={lead.id}
                  className={`p-4 flex items-center justify-between hover:bg-alabaster/30 transition-all cursor-pointer ${isSelected ? 'bg-antiquegold/[0.02]' : ''}`}
                  onClick={() => {
                    setActiveLead(lead);
                    setIsSidePanelOpen(true);
                  }}
                >
                  
                  {/* Left Side: Avatar, primary contact, stale warning */}
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    {/* Checkbox */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectLead(lead.id)}
                        className="w-4 h-4 rounded cursor-pointer accent-antiquegold"
                      />
                    </div>

                    {/* Leading Icon indicating Building Type */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${lead.buildingInfo.type === 'commercial' ? 'bg-royalemerald/10 text-royalemerald border-royalemerald/20' : 'bg-antiquegold/10 text-antiquegold border-antiquegold/20'}`}>
                      {lead.buildingInfo.type === 'commercial' ? <Building className="w-5 h-5 stroke-[1.5]" /> : <Layers className="w-5 h-5 stroke-[1.5]" />}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-sm font-bold text-charcoal truncate">{lead.contactInfo.name}</span>
                        {lead.contactInfo.companyName && (
                          <span className="text-[10px] font-mono text-warmgray bg-alabaster border border-[#e6dfd4] px-1.5 py-0.5 rounded-md truncate max-w-[150px]">
                            🏢 {lead.contactInfo.companyName}
                          </span>
                        )}
                        {isStale && (
                          <span className="text-[9px] font-extrabold uppercase font-mono px-1.5 py-0.5 bg-error/10 text-error rounded-md flex items-center gap-1 shrink-0 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-error shrink-0" />
                            {t.staleWarning.replace('{days}', String(daysStale))}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-warmgray flex-wrap font-sans">
                        <span className="font-semibold">{lead.buildingInfo.floors} Floors</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{lead.buildingInfo.address}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-antiquegold/85">{getRelativeTimeString(lead.updatedAt || lead.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side metadata columns */}
                  <div className="flex items-center gap-8 shrink-0">
                    <div className="hidden md:flex gap-16 items-center text-xs font-semibold text-charcoal">
                      
                      {/* Territory */}
                      <span className="w-24 text-center truncate font-mono text-[10px] text-warmgray">{leadTerritory}</span>
                      
                      {/* Assigned Owner Column with warnings */}
                      <div className="w-32 flex justify-center text-center" onClick={(e) => e.stopPropagation()}>
                        {ownerName ? (
                          <span className="truncate max-w-[110px] font-sans text-xs font-semibold flex items-center gap-1.5 text-charcoal">
                            <UserIcon className="w-3.5 h-3.5 text-antiquegold" />
                            {ownerName}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveLead(lead);
                              setIsSidePanelOpen(true);
                            }}
                            className="px-2 py-1 bg-warning/10 text-warning hover:bg-warning/20 rounded-lg text-[9px] font-mono font-bold tracking-wider uppercase border border-warning/20 animate-pulse cursor-pointer shrink-0"
                          >
                            {t.unassigned.split(' ')[0]} ⚠️
                          </button>
                        )}
                      </div>

                      {/* Stage Tag */}
                      <div className="w-28 flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stageInfo.bgClass} ${stageInfo.textClass} ${stageInfo.borderClass}`}>
                          {t[stageInfo.labelKey as keyof typeof t]}
                        </span>
                      </div>

                    </div>

                    {/* Chevron trigger for side panel */}
                    <div className="p-1 text-warmgray hover:text-charcoal transition-all">
                      <ChevronRight className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Pagination bar */}
        {processedLeads.length > 0 && (
          <div className="bg-[#F8F6F1]/40 p-4 border-t border-[rgba(184,135,61,0.12)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            
            {/* Page size dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-warmgray font-semibold">{t.itemsPerPage}:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[rgba(184,135,61,0.15)] rounded-lg px-2 py-1 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-antiquegold cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination numbers */}
            <div className="flex items-center gap-2">
              <span className="text-warmgray font-semibold font-mono">
                {t.pageInfo.replace('{current}', String(currentPage)).replace('{total}', String(totalPages))}
              </span>
              <div className="flex gap-1">
                <Button 
                  variant="secondary" 
                  className="py-1 px-3 text-xs" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  ◀
                </Button>
                <Button 
                  variant="secondary" 
                  className="py-1 px-3 text-xs" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  ▶
                </Button>
              </div>
            </div>

          </div>
        )}

      </Card>

      {/* ---------------------------------------------------------
          FLOATING BULK SELECTION ACTIONS BAR
          --------------------------------------------------------- */}
      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 md:left-24 md:right-24 z-40 bg-charcoal text-white rounded-2xl border border-antiquegold/25 p-4 shadow-xl flex flex-col lg:flex-row justify-between items-center gap-4"
          >
            
            {/* Counts */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-antiquegold text-charcoal font-bold text-xs flex items-center justify-center font-mono">
                {selectedLeadIds.length}
              </div>
              <span className="text-xs font-bold font-sans">
                {t.selectedCount.replace('{count}', String(selectedLeadIds.length))}
              </span>
            </div>

            {/* Bulk actions deck */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              
              {/* Bulk Reassign selection */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                <select
                  value={bulkReassignId}
                  onChange={(e) => setBulkReassignId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white font-sans focus:outline-none max-w-[130px] cursor-pointer"
                >
                  <option value="" className="text-charcoal">{t.assignPrompt}</option>
                  {surveyors.map(s => (
                    <option key={s.id} value={s.id} className="text-charcoal">{s.name}</option>
                  ))}
                </select>
                <Button 
                  variant="primary" 
                  className="py-1.5 px-3 text-[10px] font-extrabold uppercase bg-antiquegold text-white" 
                  onClick={handleBulkReassign}
                  disabled={!bulkReassignId || isBulkReassigning}
                >
                  {isBulkReassigning ? t.loading : t.bulkReassign.split(' ')[1]}
                </Button>
              </div>

              {/* Bulk Tag Input */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                <input
                  type="text"
                  placeholder={t.applyTagTitle}
                  value={bulkTagText}
                  onChange={(e) => setBulkTagText(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white font-sans focus:outline-none max-w-[120px] placeholder-white/50 px-1"
                />
                <Button 
                  variant="secondary" 
                  className="py-1.5 px-3 text-[10px] font-extrabold uppercase bg-white/10 hover:bg-white/25 text-white border-none" 
                  onClick={handleBulkTag}
                  disabled={!bulkTagText.trim() || isBulkTagging}
                >
                  {isBulkTagging ? t.loading : t.applyTagBtn.split(' ')[0]}
                </Button>
              </div>

              {/* Bulk Export Button */}
              <Button 
                variant="emerald" 
                className="py-2.5 px-4 text-xs font-bold" 
                onClick={handleBulkExport}
                disabled={exportProgress !== null}
              >
                <Download className="w-4 h-4" />
                <span>{t.bulkExport.split(' ')[1]}</span>
              </Button>

              {/* Clear selection */}
              <button 
                onClick={() => setSelectedLeadIds([])}
                className="text-white/70 hover:text-white p-2 text-xs font-bold cursor-pointer"
              >
                ✕ Clear
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------
          QUICK-VIEW SIDE INVESTIGATION PANEL (Slide-over drawer)
          --------------------------------------------------------- */}
      <AnimatePresence>
        {isSidePanelOpen && activeLead && (
          <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex justify-end">
            
            {/* Backdrop cover click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSidePanelOpen(false)} />

            {/* Slide over Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-white border-l border-antiquegold/15 h-full flex flex-col justify-between shadow-2xl z-10 text-left"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-[rgba(184,135,61,0.12)] bg-[#F8F6F1]/70 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-antiquegold font-extrabold">{t.sidePanelTitle}</span>
                  <h3 className="font-serif text-lg font-bold text-charcoal mt-1 truncate max-w-[320px]">{activeLead.contactInfo.name}</h3>
                </div>
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="w-8 h-8 rounded-full bg-alabaster border border-[rgba(184,135,61,0.12)] flex items-center justify-center text-warmgray hover:text-charcoal font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable specs */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* 360° Detail Screen Redirect CTA */}
                <div className="p-4 bg-antiquegold/10 border border-antiquegold/25 rounded-2xl flex flex-col gap-2.5 text-center">
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-xs font-serif font-extrabold text-charcoal">Full 360° Timeline Screen</h4>
                    <p className="text-[10px] text-warmgray leading-relaxed">Inspect original site survey dimensions, track append-only correspondence timelines, and upload CAD/architect files.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    className="py-2 text-xs font-bold" 
                    onClick={() => {
                      setViewingLeadDetailId(activeLead.id);
                      setIsSidePanelOpen(false);
                    }}
                  >
                    🔍 View Full Detail & Timeline
                  </Button>
                </div>

                {/* Visual Elevator Track signature: The Ascension Line Vertical Progress */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray">{t.stageTitle} (Ascension line)</h4>
                  
                  <div className="p-4 bg-alabaster/40 rounded-2xl border border-[rgba(184,135,61,0.08)] relative">
                    
                    {/* Golden progress line matching the vertical indicator model */}
                    <div className="relative pl-8 py-1 space-y-3.5">
                      
                      {/* Ascension Rail */}
                      <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-[rgba(184,135,61,0.12)] flex flex-col justify-between py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-antiquegold -ml-0.5" />
                        <div className="w-1.5 h-1.5 rounded-full bg-antiquegold -ml-0.5" />
                      </div>

                      {/* Moving glowing fill based on current stage */}
                      {(() => {
                        const totalStages = ascensionStages.length;
                        const currentIdx = getStageIndex(activeLead.stage);
                        const fillPercent = totalStages > 1 ? (Math.max(0, currentIdx) / (totalStages - 1)) * 100 : 0;
                        return (
                          <div 
                            className="absolute left-[11px] top-4 w-0.5 bg-antiquegold rounded-full transition-all duration-500"
                            style={{ height: `calc(${fillPercent}% - 8px)` }}
                          />
                        );
                      })()}

                      {/* Render step nodes */}
                      {ascensionStages.map((step, idx) => {
                        const isDone = getStageIndex(activeLead.stage) >= idx;
                        const isActive = activeLead.stage === step.stage;

                        return (
                          <div key={step.stage} className="flex items-center gap-3">
                            {/* Step bullet node */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 -ml-[29px] transition-all duration-300 border ${
                              isDone 
                                ? 'bg-antiquegold border-antiquegold text-white shadow-sm' 
                                : 'bg-white border-[#e5dfd4] text-warmgray'
                            }`}>
                              {isDone ? (
                                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                              ) : (
                                <span className="text-[9px] font-mono font-bold">{idx + 1}</span>
                              )}
                            </div>

                            {/* Label */}
                            <span className={`text-[11px] font-bold ${isActive ? 'text-antiquegold scale-105' : isDone ? 'text-charcoal' : 'text-warmgray/70'}`}>
                              {t[step.key as keyof typeof t]}
                            </span>
                          </div>
                        );
                      })}

                    </div>

                  </div>
                </div>

                {/* Section 1: Contact Details */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray">{t.contactInfo}</h4>
                  
                  <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.12)] divide-y divide-[#e6dfd4]/40 p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs pb-2.5">
                      <span className="text-warmgray font-semibold">Contact Name</span>
                      <span className="font-bold text-charcoal">{activeLead.contactInfo.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2.5">
                      <span className="text-warmgray font-semibold">Contact Phone</span>
                      <span className="font-mono font-bold text-charcoal">{activeLead.contactInfo.phone}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-2.5">
                      <span className="text-warmgray font-semibold">Email</span>
                      <span className="font-bold text-charcoal text-right truncate max-w-[180px]">{activeLead.contactInfo.email || "No email"}</span>
                    </div>
                    {activeLead.contactInfo.companyName && (
                      <div className="flex justify-between items-center text-xs py-2.5">
                        <span className="text-warmgray font-semibold">Builder Group</span>
                        <span className="font-bold text-royalemerald font-sans">{activeLead.contactInfo.companyName}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs pt-2.5">
                      <span className="text-warmgray font-semibold">{t.sourceLabel}</span>
                      <span className="font-bold text-antiquegold font-sans text-xs bg-antiquegold/10 px-2 py-0.5 rounded-lg">
                        {getLocalizedSource((activeLead as any).source)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Building cleared parameters */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray">{t.buildingInfo}</h4>
                  
                  <div className="bg-white rounded-2xl border border-[rgba(184,135,61,0.12)] p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 pb-2.5 border-b border-[#e6dfd4]/40 text-xs">
                      <div>
                        <span className="text-warmgray font-semibold block text-[10px] uppercase">Floors Scope</span>
                        <span className="font-serif text-sm font-bold text-charcoal">{activeLead.buildingInfo.floors} Floors</span>
                      </div>
                      <div>
                        <span className="text-warmgray font-semibold block text-[10px] uppercase">Shaft Type</span>
                        <span className="font-mono text-xs font-bold text-charcoal capitalize">{activeLead.buildingInfo.type}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-warmgray font-semibold block text-[10px] uppercase mb-1">Site Map coordinates</span>
                      <div className="p-2 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] flex justify-between items-center font-mono text-[10px] text-warmgray">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-antiquegold" />
                          {activeLead.buildingInfo.latitude?.toFixed(5) || '18.52'}, {activeLead.buildingInfo.longitude?.toFixed(5) || '73.85'}
                        </span>
                        <span className="text-xs text-charcoal font-bold bg-white border border-[#e6dfd4] px-1.5 py-0.5 rounded">
                          {getLeadTerritory(activeLead)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-warmgray font-semibold block text-[10px] uppercase">Building Site Address</span>
                      <span className="text-xs text-charcoal font-medium mt-1 block leading-relaxed">{activeLead.buildingInfo.address}</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: CRM Audit Log Feed */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray">{t.activityHistory}</h4>
                    <span className="text-[10px] font-mono text-antiquegold bg-antiquegold/10 px-2 py-0.5 rounded-lg font-bold">
                      {activeLeadLogs.length} logs
                    </span>
                  </div>

                  <div className="bg-alabaster/40 rounded-2xl border border-[rgba(184,135,61,0.08)] p-4 max-h-[220px] overflow-y-auto space-y-3 divide-y divide-[#e6dfd4]/35">
                    {activeLeadLogs.length === 0 ? (
                      <p className="text-xs text-warmgray text-center py-4">{t.noActivityLogs}</p>
                    ) : (
                      activeLeadLogs.map((log, idx) => (
                        <div key={log.id} className={`text-xs ${idx > 0 ? 'pt-3' : ''}`}>
                          <div className="flex justify-between text-[10px] text-warmgray mb-1 font-mono">
                            <span className="font-bold text-charcoal">{log.actor}</span>
                            <span>{getRelativeTimeString(log.timestamp)}</span>
                          </div>
                          <p className="font-semibold text-charcoal">{log.note}</p>
                          {log.fromValue && log.toValue && (
                            <span className="text-[10px] text-antiquegold block mt-0.5 font-mono">
                              {log.fromValue} ➜ {log.toValue}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 4: Direct Fast actions */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-warmgray">{t.quickActions}</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="secondary" 
                      className="py-2 px-3 text-xs" 
                      onClick={() => handleVoipCall(activeLead.contactInfo.phone, activeLead.contactInfo.name)}
                    >
                      <Phone className="w-4 h-4 text-antiquegold" />
                      <span>{t.callLead}</span>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="py-2 px-3 text-xs" 
                      onClick={() => handleWhatsAppNudge(activeLead.contactInfo.phone, activeLead.contactInfo.name)}
                    >
                      <Send className="w-4 h-4 text-royalemerald" />
                      <span>{t.whatsappLead}</span>
                    </Button>
                  </div>
                </div>

                {/* Section 5: Delegate / Stage management inside quickview */}
                <div className="space-y-4 pt-3 border-t border-dashed border-[#e6dfd4]">
                  
                  {/* Delegate Owner */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-warmgray block">{t.bulkReassign}</span>
                    <div className="relative">
                      <select
                        value={activeLead.surveyorId || ""}
                        onChange={(e) => handleDirectReassign(activeLead.id, e.target.value)}
                        className="w-full px-3 py-2 bg-alabaster rounded-xl text-xs font-bold appearance-none cursor-pointer border border-[rgba(184,135,61,0.12)] hover:border-antiquegold/30 focus:bg-white focus:ring-1 focus:ring-antiquegold"
                      >
                        <option value="">{t.assignPrompt}</option>
                        {surveyors.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray pointer-events-none" />
                    </div>
                  </div>

                  {/* Transition CRM Stage */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-warmgray block">{t.changeStage}</span>
                    <div className="relative">
                      <select
                        value={activeLead.stage}
                        onChange={(e) => handleDirectStageTransition(activeLead.id, e.target.value as LeadStage)}
                        className="w-full px-3 py-2 bg-alabaster rounded-xl text-xs font-bold appearance-none cursor-pointer border border-[rgba(184,135,61,0.12)] hover:border-antiquegold/30 focus:bg-white focus:ring-1 focus:ring-antiquegold"
                      >
                        {Object.keys(STAGE_CONFIG).map((stage) => (
                          <option key={stage} value={stage}>
                            {t[STAGE_CONFIG[stage as LeadStage].labelKey as keyof typeof t] || stage.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray pointer-events-none" />
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom footer button */}
              <div className="p-4 border-t border-[rgba(184,135,61,0.12)] bg-[#F8F6F1]/40">
                <Button variant="primary" fullWidth onClick={() => setIsSidePanelOpen(false)}>
                  ✕ {t.close}
                </Button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------
          FLOATING IN-PROGRESS PROCESS OR DIALOG ALERTS
          --------------------------------------------------------- */}
      <AnimatePresence>
        {exportProgress !== null && (
          <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl border border-antiquegold/20 p-6 space-y-4 shadow-xl text-center">
              <Download className="w-10 h-10 text-antiquegold mx-auto animate-bounce" />
              <div className="space-y-2">
                <h4 className="font-serif text-base font-bold text-charcoal">{t.exportProgress}</h4>
                
                {/* Custom animated bar */}
                <div className="w-full bg-alabaster h-2.5 rounded-full overflow-hidden border border-[#e5dfd4]">
                  <div 
                    className="h-full bg-antiquegold rounded-full transition-all duration-150" 
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>

                <span className="font-mono text-xs font-extrabold text-antiquegold mt-1 block">{exportProgress}%</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Fading bottom system status toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-50 bg-charcoal text-white rounded-xl p-3.5 shadow-xl border border-antiquegold/20 text-xs font-bold flex items-center gap-2.5 max-w-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
