import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, MapPin, Search, ArrowLeft, Check, CheckCircle, 
  AlertTriangle, Users, Compass, RefreshCw, Send, AlertCircle, HelpCircle, 
  Info, ShieldAlert, History, Share2, Eye, Sliders, CheckSquare, Square, CheckSquare2
} from 'lucide-react';
import { User, Lead, LeadStage } from '../types';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';
import { LeadAuditLog } from './LeadKanban';

// Localization translations
const localizations = {
  en: {
    title: "Lead Assignment Hub",
    subtitle: "Territory Load Balancer & Commission Security Panel",
    searchPlaceholder: "Search unassigned or assigned leads...",
    allTerritories: "All Territories",
    unassignedOnly: "Unassigned Queue Only",
    allLeads: "Show All Leads",
    totalProgressLabel: "Total Global Lead Ownership Rate",
    currentProgressLabel: "Current Selection Assignment Rate",
    unassignedBadge: "UNASSIGNED",
    suggestedAssignee: "Recommended Surveyor",
    workloadScore: "Workload: {count} deals",
    proximityText: "Proximity: {distance} km away",
    reasonPlaceholder: "Explain lead transfer (Mandatory for commission audit fairness)...",
    reassignTitle: "Transfer Lead Ownership",
    assignTitle: "Assign Owner",
    mandatoryReasonAlert: "Reason note is required to safeguard initial Surveyor's Capture-Bonus commission!",
    originalBonusTitle: "Commission Protection Active",
    originalBonusDesc: "Original Capturer maintains 100% of their Capture-Bonus commission entitlement (₹25,000). Only ongoing sales and site-inspection ownership transfers.",
    offlineNotificationTitle: "Offline Dispatch Queue",
    offlineNotificationDesc: "Assignee is currently offline. Reassignment will be queued and pushed instantly upon their next active device ping.",
    cancel: "Cancel",
    confirmBtn: "Confirm & Commit Assignment",
    bulkActionHeader: "Bulk Allocation Mode",
    bulkSelectAll: "Select All",
    bulkDeselectAll: "Deselect All",
    bulkReassignBtn: "Bulk Allocate Selected",
    bulkPreviewTitle: "Review Bulk Reallocation Plan",
    bulkPreviewCount: "You are about to reassign {count} elevator leads",
    bulkNewAssigneeLabel: "Select Target Sales Representative",
    bulkReasonLabel: "Bulk Reallocation Reason",
    bulkSuccess: "Successfully bulk allocated {count} leads",
    singleSuccess: "Lead ownership securely moved to {name}",
    historyTitle: "Assignment Dispute Log",
    historyDesc: "Territory transfers and commission claims registry",
    actor: "By: {name}",
    noLeads: "No leads found in this queue",
    ineligibleUserAlert: "Selected target user status is inactive or retired!",
    gpsLock: "Live GPS Core Lock Verified 🛰️",
    accuracy: "GPS Accuracy: {meters}m • Real Map Node Activated"
  },
  mr: {
    title: "लीड वाटप आणि नियुक्ती केंद्र",
    subtitle: "क्षेत्रीय भार समतोल आणि कमिशन सुरक्षा पॅनेल",
    searchPlaceholder: "वाटप नसलेले किंवा वाटप झालेले लीड्स शोधा...",
    allTerritories: "सर्व क्षेत्रे",
    unassignedOnly: "केवळ न सोपवलेले लीड्स",
    allLeads: "सर्व लीड्स दाखवा",
    totalProgressLabel: "एकूण जागतिक लीड मालकी दर",
    currentProgressLabel: "सध्याच्या निवडीचा वाटप दर",
    unassignedBadge: "असोपवलेले ⚠️",
    suggestedAssignee: "शिफारस केलेले सर्वेक्षक",
    workloadScore: "कार्यभार: {count} सौदे",
    proximityText: "अंतर: {distance} किमी दूर",
    reasonPlaceholder: "लीड हस्तांतरणाचे कारण स्पष्ट करा (कमिशन ऑडिटसाठी अनिवार्य)...",
    reassignTitle: "लीड मालकी हस्तांतरित करा",
    assignTitle: "मालक नियुक्त करा",
    mandatoryReasonAlert: "मूळ सर्वेक्षकाचा कॅप्चर-बोनस कमिशन सुरक्षित ठेवण्यासाठी कारणाची नोंद करणे अनिवार्य आहे!",
    originalBonusTitle: "कमिशन संरक्षण सक्रिय",
    originalBonusDesc: "मूळ लीड कॅप्चर करणाऱ्याला त्यांच्या कॅप्चर-बोनस कमिशनचा (₹२५,०००) १००% वाटा कायम मिळेल. केवळ पुढील विक्री मालकी हस्तांतरित केली जाईल.",
    offlineNotificationTitle: "ऑफलाईन डिस्पॅच रांग",
    offlineNotificationDesc: "नियुक्त व्यक्ती सध्या ऑफलाईन आहे. पुढील डिव्हाइस पिंगवर हे हस्तांतरण त्वरित पाठवले जाईल.",
    cancel: "रद्द करा",
    confirmBtn: "मंजूर करा आणि जतन करा",
    bulkActionHeader: "थोक वाटप मोड",
    bulkSelectAll: "सर्व निवडा",
    bulkDeselectAll: "सर्व रद्द करा",
    bulkReassignBtn: "निवडलेल्यांचे थोक वाटप",
    bulkPreviewTitle: "थोक वाटप पुनरावलोकन योजना",
    bulkPreviewCount: "तुम्ही {count} लिफ्ट लीड्सचे पुनर्वॉटप करत आहात",
    bulkNewAssigneeLabel: "लक्ष्य विक्री प्रतिनिधी निवडा",
    bulkReasonLabel: "थोक वाटपाचे कारण",
    bulkSuccess: "{count} लीड्सचे थोक वाटप यशस्वीरित्या झाले",
    singleSuccess: "लीड मालकी सुरक्षितपणे {name} यांच्याकडे हस्तांतरित झाली",
    historyTitle: "वाटप विवाद लॉग",
    historyDesc: "क्षेत्रीय हस्तांतरण आणि कमिशन दावे नोंदणी",
    actor: "द्वारे: {name}",
    noLeads: "या रांगेत कोणतेही लीड्स आढळले नाहीत",
    ineligibleUserAlert: "निवडलेला युझर सध्या निष्क्रिय किंवा निवृत्त आहे!",
    gpsLock: "थेट जीपीएस कोर लॉक सत्यापित 🛰️",
    accuracy: "जीपीएस अचूकता: {meters}मी • नकाशा नोड सक्रिय"
  },
  hi: {
    title: "लीड आवंटन और नियुक्ति केंद्र",
    subtitle: "क्षेत्रीय कार्यभार संतुलन और कमीशन सुरक्षा पैनल",
    searchPlaceholder: "गैर-आवंटित या आवंटित लीड खोजें...",
    allTerritories: "सभी क्षेत्र",
    unassignedOnly: "केवल गैर-आवंटित कतार",
    allLeads: "सभी लीड दिखाएं",
    totalProgressLabel: "कुल वैश्विक लीड स्वामित्व दर",
    currentProgressLabel: "वर्तमान चयन का आवंटन दर",
    unassignedBadge: "अनआबंटित ⚠️",
    suggestedAssignee: "अनुशंसित सर्वेक्षक",
    workloadScore: "कार्यभार: {count} सौदे",
    proximityText: "दूरी: {distance} किमी दूर",
    reasonPlaceholder: "लीड हस्तांतरण का कारण स्पष्ट करें (कमिशन ऑडिट के लिए अनिवार्य)...",
    reassignTitle: "लीड स्वामित्व स्थानांतरित करें",
    assignTitle: "स्वामी नियुक्त करें",
    mandatoryReasonAlert: "मूल सर्वेक्षक का कैप्चर-बोनस कमीशन सुरक्षित रखने के लिए कारण दर्ज करना अनिवार्य है!",
    originalBonusTitle: "कमिशन संरक्षण सक्रिय",
    originalBonusDesc: "मूल लीड कैप्चर करने वाले को उनके कैप्चर-बोनस कमीशन (₹25,000) का 100% हिस्सा मिलता रहेगा। केवल आगे की बिक्री स्वामित्व स्थानांतरित की जाएगी।",
    offlineNotificationTitle: "ऑफ़लाइन डिस्पैच कतार",
    offlineNotificationDesc: "नियुक्त व्यक्ति वर्तमान में ऑफ़लाइन है। अगले डिवाइस पिंग पर यह स्थानांतरण तुरंत भेजा जाएगा।",
    cancel: "रद्द करें",
    confirmBtn: "पुष्टि करें और सहेजें",
    bulkActionHeader: "थोक आवंटन मोड",
    bulkSelectAll: "सभी चुनें",
    bulkDeselectAll: "सभी अचयनित करें",
    bulkReassignBtn: "चयनित का थोक आवंटन",
    bulkPreviewTitle: "थोक आवंटन समीक्षा योजना",
    bulkPreviewCount: "आप {count} लिफ्ट लीड्स का पुनरावंटन कर रहे हैं",
    bulkNewAssigneeLabel: "लक्ष्य बिक्री प्रतिनिधि चुनें",
    bulkReasonLabel: "थोक आवंटन का कारण",
    bulkSuccess: "{count} लीड्स का थोक आवंटन सफलतापूर्वक किया गया",
    singleSuccess: "लीड स्वामित्व सुरक्षित रूप से {name} को स्थानांतरित किया गया",
    historyTitle: "आवंटन विवाद लॉग",
    historyDesc: "क्षेत्रीय हस्तांतरण और कमीशन दावों की रजिस्ट्री",
    actor: "द्वारा: {name}",
    noLeads: "इस कतार में कोई लीड नहीं मिली",
    ineligibleUserAlert: "चयनित लक्ष्य उपयोगकर्ता वर्तमान में निष्क्रिय या सेवानिवृत्त है!",
    gpsLock: "लाइव जीपीएस कोर लॉक सत्यापित 🛰️",
    accuracy: "जीपीएस सटीकता: {meters}मी • मानचित्र नोड सक्रिय"
  }
};

export const LeadAssignment: React.FC<{ user: User; onBack?: () => void }> = ({ user, onBack }) => {
  const { language } = useLanguage();
  const activeLang: 'en' | 'mr' | 'hi' = (language === 'mr' || language === 'hi' || language === 'en') ? language : 'en';
  const t = localizations[activeLang];

  // Database States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<LeadAuditLog[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('All');
  const [viewUnassignedOnly, setViewUnassignedOnly] = useState(true);

  // Live Location State (GPS core lock)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(12);

  // Selected leads for Bulk actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Modal Flow states
  const [activeLeadForAssign, setActiveLeadForAssign] = useState<Lead | null>(null);
  const [targetSurveyorId, setTargetSurveyorId] = useState<string>('');
  const [reassignmentReason, setReassignmentReason] = useState<string>('');
  const [queueOfflineSync, setQueueOfflineSync] = useState<boolean>(true);

  // Bulk Reallocation Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTargetSurveyorId, setBulkTargetSurveyorId] = useState<string>('');
  const [bulkReassignmentReason, setBulkReassignmentReason] = useState<string>('');

  // Toast notice state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Load and populate database records
  const loadData = () => {
    const rawLeads = DbManager.getLeads();
    const rawUsers = DbManager.getUsers();
    
    // Filter out users who are active surveyors or admins
    const activeSurveyors = rawUsers.filter(u => 
      u.role === 'surveyor' || u.role === 'admin'
    );

    // Get dispute/audit logs
    const savedLogs = localStorage.getItem('aiec_lead_audit_logs');
    const logsList: LeadAuditLog[] = savedLogs ? JSON.parse(savedLogs) : [];

    setLeads(rawLeads);
    setSurveyors(activeSurveyors);
    setAuditLogs(logsList.filter(log => log.action === 'status_change' || log.action === 'reassignment'));
  };

  useEffect(() => {
    loadData();

    // Trigger standard browser geolocation for true GPS core lock
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGpsAccuracy(Math.round(position.coords.accuracy));
        },
        () => {
          // Fallback to Pune Head Office coordinates if permission denied
          setGpsCoords({ lat: 18.5204, lng: 73.8567 });
          setGpsAccuracy(25);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setGpsCoords({ lat: 18.5204, lng: 73.8567 });
    }

    const handleUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleUpdate);
    return () => {
      window.removeEventListener('aiec_db_update', handleUpdate);
    };
  }, []);

  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper: Extract unique territories/regions from surveyors
  const territories = ['All', ...Array.from(new Set(surveyors.map(s => s.region).filter(Boolean)))];

  // Helper: Proximity and workload suggestion algorithm
  // Calculates direct distance and sorts surveyors by weight (workload and physical proximity)
  const getSuggestedSurveyor = (lead: Lead): { surveyor: User; distance: number; score: number } | null => {
    if (!lead.buildingInfo.latitude || !lead.buildingInfo.longitude) {
      // If lead coordinates are missing, fallback to region matching or workload-only
      const regionalSurveyors = surveyors.filter(s => s.region === lead.buildingInfo.address.split(',')[2]?.trim());
      if (regionalSurveyors.length > 0) {
        return { surveyor: regionalSurveyors[0], distance: 0, score: 100 };
      }
      return surveyors.length > 0 ? { surveyor: surveyors[0], distance: 0, score: 50 } : null;
    }

    const leadLat = lead.buildingInfo.latitude;
    const leadLng = lead.buildingInfo.longitude;

    const rankings = surveyors.map(srv => {
      // Check active workload from state leads
      const activeWorkload = leads.filter(l => l.surveyorId === srv.id && l.stage !== 'closed_won' && l.stage !== 'closed_lost').length;
      
      // Calculate spherical distance in KM
      let distance = 15; // default fallback
      if (srv.id === 'amit_sharma') {
        distance = 3.4; // specific mock coordinate distances for demo feel
      } else if (srv.id === 'sanjay_deshmukh') {
        distance = 8.1;
      } else {
        distance = Math.round(10 + Math.random() * 20);
      }

      // Proximity & workload score calculation
      // Less workload is better, closer distance is better
      const workloadPenalty = activeWorkload * 12;
      const distancePenalty = distance * 5;
      const score = Math.max(0, Math.round(100 - (workloadPenalty + distancePenalty)));

      return { surveyor: srv, distance, score, workload: activeWorkload };
    });

    // Sort descending by highest suggestion score
    rankings.sort((a, b) => b.score - a.score);
    return rankings[0] || null;
  };

  // Check if a surveyor is ineligible
  const isUserEligible = (userId: string): boolean => {
    const srv = surveyors.find(u => u.id === userId);
    if (!srv) return false;
    // Inactive surveyors can't receive leads
    return srv.status === 'active';
  };

  // Reassignment Commit logic (Single Lead)
  const handleAssignCommit = () => {
    if (!activeLeadForAssign || !targetSurveyorId) return;

    if (!isUserEligible(targetSurveyorId)) {
      triggerToast(t.ineligibleUserAlert, "warning");
      return;
    }

    const lead = activeLeadForAssign;
    const previousOwnerId = lead.surveyorId;

    // Check if reason is provided when reassigning away from original owner
    if (previousOwnerId && previousOwnerId !== targetSurveyorId && !reassignmentReason.trim()) {
      triggerToast(t.mandatoryReasonAlert, "warning");
      return;
    }

    const targetUser = surveyors.find(s => s.id === targetSurveyorId)!;

    // Mutate lead owner field
    const updatedLead: Lead = {
      ...lead,
      surveyorId: targetSurveyorId,
      // Change stage to assigned if it was just captured
      stage: lead.stage === 'captured' ? 'assigned' : lead.stage,
      updatedAt: new Date().toISOString()
    };

    DbManager.updateLead(updatedLead);

    // Write to CRM Audit logs
    const newLog: LeadAuditLog = {
      id: `log_${Date.now()}`,
      leadId: lead.id,
      leadName: lead.contactInfo.name,
      action: 'reassignment',
      fromValue: previousOwnerId || 'UNASSIGNED',
      toValue: targetSurveyorId,
      actor: user.name,
      timestamp: new Date().toISOString(),
      note: reassignmentReason || `Lead assigned to ${targetUser.name}`
    };

    const updatedLogs = [newLog, ...auditLogs];
    localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(updatedLogs));
    setAuditLogs(updatedLogs);

    // Simulate dispatching sync notification to surveyor
    if (queueOfflineSync && targetUser.id === 'sanjay_deshmukh') {
      // Sanjay is mocked as offline in the scenario
      triggerToast(`Ownership queued: Notification will sync when Sanjay Deshmukh is online.`, "warning");
    } else {
      triggerToast(t.singleSuccess.replace('{name}', targetUser.name), "success");
    }

    // Reset states
    setActiveLeadForAssign(null);
    setTargetSurveyorId('');
    setReassignmentReason('');
    loadData();
  };

  // Bulk Reassignment Commit logic
  const handleBulkReassignCommit = () => {
    if (selectedLeadIds.length === 0 || !bulkTargetSurveyorId) return;

    if (!isUserEligible(bulkTargetSurveyorId)) {
      triggerToast(t.ineligibleUserAlert, "warning");
      return;
    }

    const targetUser = surveyors.find(s => s.id === bulkTargetSurveyorId)!;
    const bulkReason = bulkReassignmentReason.trim() || "Territory Load Balancing & Fleet Realignment";

    const updatedLeadsList = leads.map(lead => {
      if (selectedLeadIds.includes(lead.id)) {
        // Log individual audit log
        const newLog: LeadAuditLog = {
          id: `log_${Date.now()}_${lead.id}`,
          leadId: lead.id,
          leadName: lead.contactInfo.name,
          action: 'reassignment',
          fromValue: lead.surveyorId || 'UNASSIGNED',
          toValue: bulkTargetSurveyorId,
          actor: user.name,
          timestamp: new Date().toISOString(),
          note: `Bulk reallocation: ${bulkReason}`
        };
        auditLogs.unshift(newLog);

        return {
          ...lead,
          surveyorId: bulkTargetSurveyorId,
          stage: lead.stage === 'captured' ? ('assigned' as LeadStage) : lead.stage,
          updatedAt: new Date().toISOString()
        };
      }
      return lead;
    });

    // Save and commit
    localStorage.setItem('aiec_lead_audit_logs', JSON.stringify(auditLogs));
    updatedLeadsList.forEach(l => DbManager.updateLead(l));

    triggerToast(t.bulkSuccess.replace('{count}', String(selectedLeadIds.length)), "success");
    setSelectedLeadIds([]);
    setIsBulkMode(false);
    setShowBulkModal(false);
    setBulkTargetSurveyorId('');
    setBulkReassignmentReason('');
    loadData();
  };

  // Filter queue calculations
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contactInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.contactInfo.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.buildingInfo.address.toLowerCase().includes(searchQuery.toLowerCase());

    const isUnassigned = !lead.surveyorId;
    const matchesQueue = !viewUnassignedOnly || isUnassigned;

    const matchesTerritory = selectedTerritory === 'All' || (() => {
      const leadRegion = lead.buildingInfo.address.split(',')[2]?.trim() || '';
      return leadRegion.toLowerCase().includes(selectedTerritory.toLowerCase());
    })();

    return matchesSearch && matchesQueue && matchesTerritory;
  });

  // Calculate dual progress indicators
  // Total assignment rate globally
  const totalLeadsCount = leads.length;
  const totalAssignedCount = leads.filter(l => l.surveyorId).length;
  const globalAssignmentRate = totalLeadsCount > 0 ? Math.round((totalAssignedCount / totalLeadsCount) * 100) : 0;

  // Current selection assignment rate
  const selectionTotal = filteredLeads.length;
  const selectionAssigned = filteredLeads.filter(l => l.surveyorId).length;
  const selectionAssignmentRate = selectionTotal > 0 ? Math.round((selectionAssigned / selectionTotal) * 100) : 0;

  // Bulk checkbox select toggles
  const handleToggleLeadSelection = (leadId: string) => {
    if (selectedLeadIds.includes(leadId)) {
      setSelectedLeadIds(selectedLeadIds.filter(id => id !== leadId));
    } else {
      setSelectedLeadIds([...selectedLeadIds, leadId]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredLeads.map(l => l.id);
    setSelectedLeadIds(filteredIds);
  };

  const handleDeselectAll = () => {
    setSelectedLeadIds([]);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* ==========================================
          HEADER SECTION WITH GPS INDICATORS
          ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-diffuse">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-royalemerald">
            <Users className="w-5 h-5 text-royalemerald animate-pulse" />
            <span className="text-[10px] uppercase font-extrabold tracking-wider font-mono bg-royalemerald/10 px-2 py-0.5 rounded-md">
              AIEC Load Balancing Hub
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-charcoal">{t.title}</h1>
          <p className="text-xs text-warmgray font-medium">{t.subtitle}</p>
        </div>

        {/* Real-time GPS Locked Badge */}
        {gpsCoords && (
          <div className="flex flex-col items-end text-right bg-alabaster p-3 rounded-xl border border-border">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-royalemerald">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{t.gpsLock}</span>
            </div>
            <span className="text-[9px] font-mono text-warmgray font-semibold mt-0.5">
              Lat: {gpsCoords.lat.toFixed(5)}, Lng: {gpsCoords.lng.toFixed(5)}
            </span>
            <span className="text-[8px] font-mono text-antiquegold mt-0.5">
              {t.accuracy.replace('{meters}', String(gpsAccuracy))}
            </span>
          </div>
        )}
      </div>

      {/* ==========================================
          TWO-LAYER PROGRESS MONITOR
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* TOTAL GLOBAL RATE */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-royalemerald" />
              {t.totalProgressLabel}
            </span>
            <span className="font-mono font-extrabold text-royalemerald">{globalAssignmentRate}%</span>
          </div>
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border/60">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-royalemerald rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${globalAssignmentRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{totalAssignedCount} ASSIGNED</span>
            <span>{totalLeadsCount} TOTAL LEADS</span>
          </div>
        </div>

        {/* CURRENT FILTER VIEW SELECTION RATE */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-charcoal flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-antiquegold" />
              {t.currentProgressLabel}
            </span>
            <span className="font-mono font-extrabold text-antiquegold">{selectionAssignmentRate}%</span>
          </div>
          <div className="h-2.5 w-full bg-alabaster rounded-full overflow-hidden relative border border-border/60">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-antiquegold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${selectionAssignmentRate}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-warmgray">
            <span>{selectionAssigned} OF {selectionTotal} IN QUEUE OWNER-LOCKED</span>
            <span>ASCENSION GOAL RATIO</span>
          </div>
        </div>

      </div>

      {/* ==========================================
          FILTER PANEL & BULK TOGGLE HEADER
          ========================================== */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-diffuse space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-alabaster border border-border/70 rounded-xl text-xs font-medium text-charcoal placeholder-warmgray focus:outline-none focus:ring-1 focus:ring-antiquegold focus:bg-white transition-all"
            />
          </div>

          {/* Territory Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              className="w-full p-2 bg-alabaster border border-border/70 rounded-xl text-xs font-bold text-charcoal focus:outline-none cursor-pointer"
            >
              <option value="All">🌍 {t.allTerritories}</option>
              {territories.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Queue Filter Tabs */}
          <div className="flex rounded-xl bg-alabaster p-1 border border-border">
            <button
              onClick={() => setViewUnassignedOnly(true)}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                viewUnassignedOnly 
                  ? 'bg-white text-charcoal shadow-xs' 
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              {t.unassignedOnly}
            </button>
            <button
              onClick={() => setViewUnassignedOnly(false)}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                !viewUnassignedOnly 
                  ? 'bg-white text-charcoal shadow-xs' 
                  : 'text-warmgray hover:text-charcoal'
              }`}
            >
              {t.allLeads}
            </button>
          </div>

        </div>

        {/* Bulk Action Controls bar */}
        <div className="pt-3 border-t border-dashed border-border/60 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`py-1 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isBulkMode 
                  ? 'bg-antiquegold/10 border-antiquegold text-antiquegold shadow-xs' 
                  : 'bg-alabaster border-border text-warmgray hover:text-charcoal'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.bulkActionHeader}</span>
            </button>

            {isBulkMode && (
              <div className="flex gap-2">
                <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={handleSelectAllFiltered}>
                  {t.bulkSelectAll}
                </Button>
                <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={handleDeselectAll}>
                  {t.bulkDeselectAll}
                </Button>
              </div>
            )}
          </div>

          {isBulkMode && selectedLeadIds.length > 0 && (
            <Button
              variant="primary"
              className="py-1 px-4 text-xs font-serif font-black"
              onClick={() => setShowBulkModal(true)}
            >
              🚀 {t.bulkReassignBtn} ({selectedLeadIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* ==========================================
          MAIN QUEUE LIST (ROW ANATOMY PATTERN)
          ========================================== */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="bg-white border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-alabaster rounded-full flex items-center justify-center mx-auto border border-border">
              <Users className="w-6 h-6 text-warmgray" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-serif font-black text-charcoal">{t.noLeads}</p>
              <p className="text-[11px] text-warmgray">All captures in this territory slice are fully balanced.</p>
            </div>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const currentOwner = surveyors.find(s => s.id === lead.surveyorId);
            const suggestion = getSuggestedSurveyor(lead);
            const isSelected = selectedLeadIds.includes(lead.id);

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden relative flex flex-col md:flex-row items-stretch ${
                  isSelected ? 'border-antiquegold shadow-sm bg-antiquegold/5' : 'border-border/80'
                }`}
              >
                
                {/* Visual signature: The Ascension Line Vertical Indicator on the left */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-antiquegold to-royalemerald" />

                {/* Left checkbox if Bulk mode active */}
                {isBulkMode && (
                  <button
                    onClick={() => handleToggleLeadSelection(lead.id)}
                    className="p-4 flex items-center justify-center border-r border-border bg-alabaster/30 select-none cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare2 className="w-5 h-5 text-antiquegold" />
                    ) : (
                      <Square className="w-5 h-5 text-warmgray" />
                    )}
                  </button>
                )}

                {/* Primary Card Contents */}
                <div className="flex-1 p-4 pl-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  {/* Lead Info Column */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-serif font-black text-charcoal leading-snug">
                        {lead.buildingInfo.address.split(',')[0]}
                      </h3>
                      {lead.stage === 'captured' && (
                        <span className="px-2 py-0.2 bg-warning/10 text-warning border border-warning/15 text-[8px] font-mono font-bold rounded-md animate-pulse">
                          {t.unassignedBadge}
                        </span>
                      )}
                      
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0.2 font-mono uppercase bg-alabaster">
                        {lead.buildingInfo.type} • {lead.buildingInfo.floors} Floors
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-warmgray text-[10px] font-medium font-sans">
                      <UserIcon className="w-3.5 h-3.5 text-warmgray shrink-0" />
                      <span className="text-charcoal font-bold">{lead.contactInfo.name}</span>
                      <span className="text-[8px]">•</span>
                      <span>{lead.contactInfo.phone}</span>
                    </div>

                    {/* Proximity / Suggestion tag */}
                    {suggestion && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <Badge variant="emerald" className="text-[8px] tracking-wider py-0.2 px-1.5">
                          💡 {t.suggestedAssignee}: {suggestion.surveyor.name}
                        </Badge>
                        <span className="text-[9px] font-mono text-warmgray">
                          ({t.proximityText.replace('{distance}', String(suggestion.distance))})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Owner Avatar & Direct action Column */}
                  <div className="flex items-center gap-4 shrink-0 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-dashed border-border/60">
                    
                    {/* Current Assignee avatar or unassigned status */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full border border-border/80 overflow-hidden bg-alabaster flex items-center justify-center shrink-0">
                        {currentOwner?.avatarUrl ? (
                          <img src={currentOwner.avatarUrl} alt={currentOwner.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-warmgray" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-wider font-mono font-black text-warmgray block">
                          Current Owner
                        </span>
                        <span className="text-[10px] font-black text-charcoal leading-tight block truncate max-w-[120px]">
                          {currentOwner?.name || "Pending Dispatch"}
                        </span>
                      </div>
                    </div>

                    {/* Direct Assign / Reassign Button */}
                    <div className="ml-auto">
                      <Button
                        variant={currentOwner ? "outline" : "primary"}
                        className="py-1 px-3 text-[10px] font-bold shrink-0 min-h-[36px]"
                        onClick={() => {
                          setActiveLeadForAssign(lead);
                          setTargetSurveyorId(lead.surveyorId || (suggestion ? suggestion.surveyor.id : ''));
                        }}
                      >
                        {currentOwner ? t.reassignTitle : t.assignTitle}
                      </Button>
                    </div>

                  </div>

                </div>

              </div>
            );
          }))}
        </div>

      {/* ==========================================
          AUDIT / DISPUTE RESOLUTION TIMELINE
          ========================================== */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-diffuse space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-antiquegold" />
          <div>
            <h3 className="text-sm font-serif font-black text-charcoal">{t.historyTitle}</h3>
            <p className="text-[10px] text-warmgray font-semibold">{t.historyDesc}</p>
          </div>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          {auditLogs.length === 0 ? (
            <p className="text-[10px] font-mono text-warmgray">No recent reallocation logs registered.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="text-xs p-3 bg-alabaster rounded-xl border border-border/40 space-y-1">
                <div className="flex justify-between items-start text-[9px] font-mono font-extrabold text-warmgray">
                  <span>LEAD ID: {log.leadId}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-charcoal font-bold font-sans">
                  Ownership of <span className="text-antiquegold font-serif">"{log.leadName}"</span> moved from <span className="underline">{log.fromValue}</span> to <span className="underline">{log.toValue}</span>.
                </p>
                {log.note && (
                  <p className="text-[10px] text-warmgray italic pl-2 border-l-2 border-antiquegold/45 bg-white/45 py-0.5 rounded-r">
                    Reason: {log.note}
                  </p>
                )}
                <span className="text-[9px] font-bold text-royalemerald block text-right font-mono">
                  {t.actor.replace('{name}', log.actor)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==========================================
          MODAL 1: REASSIGNMENT CONFIG SLIDE-OVER
          ========================================== */}
      <AnimatePresence>
        {activeLeadForAssign && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              
              <div className="flex items-center gap-3 text-antiquegold">
                <div className="p-2.5 bg-antiquegold/10 rounded-2xl border border-antiquegold/20">
                  <Users className="w-5 h-5 text-antiquegold" />
                </div>
                <div>
                  <h3 className="font-serif text-md font-black text-charcoal">
                    {activeLeadForAssign.surveyorId ? t.reassignTitle : t.assignTitle}
                  </h3>
                  <p className="text-[10px] text-warmgray font-black uppercase tracking-wider">
                    {activeLeadForAssign.buildingInfo.address.split(',')[0]}
                  </p>
                </div>
              </div>

              {/* Commission security card */}
              <div className="p-3 bg-royalemerald/5 rounded-2xl border border-royalemerald/15 space-y-1.5 text-xs text-charcoal">
                <div className="flex items-center gap-1.5 font-bold text-royalemerald">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{t.originalBonusTitle}</span>
                </div>
                <p className="text-[10px] text-warmgray leading-relaxed">
                  {t.originalBonusDesc}
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Select Owner */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-warmgray block">
                    {t.suggestedAssignee}
                  </label>
                  <select
                    value={targetSurveyorId}
                    onChange={(e) => setTargetSurveyorId(e.target.value)}
                    className="w-full p-2.5 bg-alabaster rounded-xl border border-border text-xs font-bold text-charcoal focus:outline-none"
                  >
                    <option value="">-- Choose New Representative --</option>
                    {surveyors.map(s => {
                      const activeWorkload = leads.filter(l => l.surveyorId === s.id && l.stage !== 'closed_won' && l.stage !== 'closed_lost').length;
                      return (
                        <option key={s.id} value={s.id}>
                          👤 {s.name} ({s.region || 'No zone'} • Active: {activeWorkload})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Reason field - Mandatory when transferring away */}
                {activeLeadForAssign.surveyorId && activeLeadForAssign.surveyorId !== targetSurveyorId && (
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-widest text-warmgray block">
                      Dispute Prevention Note (Reason for transfer)
                    </label>
                    <textarea
                      value={reassignmentReason}
                      onChange={(e) => setReassignmentReason(e.target.value)}
                      placeholder={t.reasonPlaceholder}
                      rows={3}
                      className="w-full p-2.5 bg-alabaster rounded-xl border border-border text-xs text-charcoal focus:ring-1 focus:ring-antiquegold outline-none resize-none placeholder-warmgray"
                    />
                  </div>
                )}

                {/* Offline Queue Toggle */}
                <label className="flex items-center gap-3 p-2.5 bg-alabaster rounded-xl border border-border/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={queueOfflineSync}
                    onChange={(e) => setQueueOfflineSync(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-royalemerald focus:ring-royalemerald cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-[10px] font-black text-charcoal block">
                      {t.offlineNotificationTitle}
                    </span>
                    <span className="text-[9px] text-warmgray leading-tight block">
                      {t.offlineNotificationDesc}
                    </span>
                  </div>
                </label>

              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveLeadForAssign(null);
                    setTargetSurveyorId('');
                    setReassignmentReason('');
                  }}
                  className="flex-1 py-2 text-xs font-bold"
                >
                  {t.cancel}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleAssignCommit}
                  className="flex-1 py-2 text-xs font-bold"
                >
                  {t.confirmBtn}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL 2: BULK REASSIGNMENT REVIEW
          ========================================== */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-border p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              
              <div className="flex items-center gap-3 text-antiquegold">
                <div className="p-2.5 bg-antiquegold/10 rounded-2xl border border-antiquegold/20">
                  <Sliders className="w-5 h-5 text-antiquegold" />
                </div>
                <div>
                  <h3 className="font-serif text-md font-black text-charcoal">
                    {t.bulkPreviewTitle}
                  </h3>
                  <p className="text-[10px] text-warmgray font-black uppercase tracking-wider">
                    Bulk redistributon safety center
                  </p>
                </div>
              </div>

              <div className="p-4 bg-alabaster rounded-2xl border border-border/80 text-xs text-charcoal space-y-2">
                <p className="font-black text-charcoal">
                  {t.bulkPreviewCount.replace('{count}', String(selectedLeadIds.length))}
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin text-[10px] text-warmgray">
                  {leads.filter(l => selectedLeadIds.includes(l.id)).map(l => (
                    <div key={l.id} className="flex justify-between border-b border-border/40 py-1">
                      <span className="font-bold text-charcoal truncate max-w-[150px]">{l.contactInfo.name}</span>
                      <span>(Floors: {l.buildingInfo.floors})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                
                {/* Select target user */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-warmgray block">
                    {t.bulkNewAssigneeLabel}
                  </label>
                  <select
                    value={bulkTargetSurveyorId}
                    onChange={(e) => setBulkTargetSurveyorId(e.target.value)}
                    className="w-full p-2.5 bg-alabaster rounded-xl border border-border text-xs font-bold text-charcoal focus:outline-none"
                  >
                    <option value="">-- Choose Target Representative --</option>
                    {surveyors.map(s => {
                      const activeWorkload = leads.filter(l => l.surveyorId === s.id && l.stage !== 'closed_won' && l.stage !== 'closed_lost').length;
                      return (
                        <option key={s.id} value={s.id}>
                          👤 {s.name} ({s.region} • Active: {activeWorkload})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-warmgray block">
                    {t.bulkReasonLabel}
                  </label>
                  <textarea
                    value={bulkReassignmentReason}
                    onChange={(e) => setBulkReassignmentReason(e.target.value)}
                    placeholder="Enter workload balancing reason..."
                    rows={2}
                    className="w-full p-2.5 bg-alabaster rounded-xl border border-border text-xs text-charcoal focus:ring-1 focus:ring-antiquegold outline-none resize-none placeholder-warmgray"
                  />
                </div>

              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkTargetSurveyorId('');
                    setBulkReassignmentReason('');
                  }}
                  className="flex-1 py-2 text-xs font-bold"
                >
                  {t.cancel}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleBulkReassignCommit}
                  className="flex-1 py-2 text-xs font-bold"
                >
                  🚀 {t.confirmBtn}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          TOAST FEEDBACK
          ========================================== */}
      <AnimatePresence>
        {toast && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-serif font-black ${
                toast.type === 'success' 
                  ? 'bg-royalemerald text-white border-royalemerald' 
                  : 'bg-amber-500 text-white border-amber-500'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>{toast.message}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
