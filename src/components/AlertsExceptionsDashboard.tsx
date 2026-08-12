import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, ShieldAlert, Clock, UserCheck, Eye, Search, 
  Filter, CheckCircle2, ChevronRight, Share2, BellOff, Trash2, 
  RefreshCw, Info, AlertCircle, FileSpreadsheet, Send, MessageSquare, 
  Check, Phone, Mail, Award, ArrowUpRight, Ban, Settings, HardHat
} from 'lucide-react';
import { Card, Button } from './Common';
import { useLanguage } from '../lib/language';
import { User } from '../types';

interface ExceptionItem {
  id: string;
  category: 'Duplicate Lead' | 'Automation Failure' | 'Overdue Payment' | 'Supplier Dispute' | 'Insurance Expired' | 'QC Snag' | 'SOS Alert';
  priority: 'Critical' | 'High' | 'Normal';
  title: string;
  description: string;
  relatedRecordId: string;
  ageHours: number;
  assignedTo?: string;
  linkedExceptionId?: string;
  snoozedUntil?: string; // ISO string
  isResolvedElsewhere?: boolean;
}

const initialExceptions: ExceptionItem[] = [
  {
    id: 'EXC-101',
    category: 'SOS Alert',
    priority: 'Critical',
    title: 'Technician Emergency SOS',
    description: 'Amol G. Bhosale triggered panic alert at Kothrud Residence elevator shaft during load test.',
    relatedRecordId: 'TECH-702 (Amol Bhosale)',
    ageHours: 0.2,
    assignedTo: 'Unassigned'
  },
  {
    id: 'EXC-102',
    category: 'Automation Failure',
    priority: 'Critical',
    title: 'Quotation Engine cost-input missing',
    description: 'Stainless steel hair-line finish rate undefined for July pricing sheet. Auto-retries paused.',
    relatedRecordId: 'DL-5032 (Viman Nagar)',
    ageHours: 1.5,
    assignedTo: 'System Admin',
    linkedExceptionId: 'FL-2026-905' // Linked to automated failure logs
  },
  {
    id: 'EXC-103',
    category: 'Supplier Dispute',
    priority: 'High',
    title: 'Disputed Motor Shipment invoice mismatch',
    description: 'Pune West supplier Bhartia Steel disputes ₹3,80,000 committed payout vs ₹4,10,000 demand.',
    relatedRecordId: 'SPL-301 (Bhartia Steel)',
    ageHours: 4,
    assignedTo: 'Supplier Manager'
  },
  {
    id: 'EXC-104',
    category: 'Overdue Payment',
    priority: 'High',
    title: '90+ Days Milestone Overdue Escalation',
    description: 'Kothrud Elite Housing Soc. has not responded to 5 automated payment reminder WhatsApp cycles.',
    relatedRecordId: 'INV-4022 (Kothrud Meadows)',
    ageHours: 92,
    assignedTo: 'Collections Lead'
  },
  {
    id: 'EXC-105',
    category: 'Duplicate Lead',
    priority: 'Normal',
    title: 'Duplicate CRM Lead flagged',
    description: 'Same phone number registered twice in Pune North zone within 48 hours under different initials.',
    relatedRecordId: 'LD-9081 (Shinde Estates)',
    ageHours: 12,
    assignedTo: 'CRM Team'
  },
  {
    id: 'EXC-106',
    category: 'Insurance Expired',
    priority: 'Normal',
    title: 'Shaft Surveyor Insurance expiring',
    description: 'Pune East certified third-party surveyor safety policy expires in 3 days. Verification blocked.',
    relatedRecordId: 'SURV-409 (Ramesh Patil)',
    ageHours: 24,
    assignedTo: 'Compliance Lead'
  },
  {
    id: 'EXC-107',
    category: 'QC Snag',
    priority: 'High',
    title: 'Unresolved safety rope tension snag',
    description: 'Ascension floor-indicative tension audit flagged 3% slack variance during pre-commissioning.',
    relatedRecordId: 'PROJ-904 (Bhosari Industry)',
    ageHours: 18,
    assignedTo: 'Installation Head'
  }
];

const teamLeads = [
  { id: 'lead_crm', name: 'Nikhil Wable (CRM Lead)' },
  { id: 'lead_ops', name: 'Amol G. Bhosale (Installation Head)' },
  { id: 'lead_finance', name: 'Sujata Shinde (Finance Accountant)' },
  { id: 'lead_compliance', name: 'Adv. Sameer Deshmukh (Legal)' }
];

export const AlertsExceptionsDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // State Management
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(initialExceptions);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [showResolvedElsewhereNote, setShowResolvedElsewhereNote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Snooze & Delegate modal helpers
  const [delegateModalOpen, setDelegateModalOpen] = useState<boolean>(false);
  const [snoozeModalOpen, setSnoozeModalOpen] = useState<boolean>(false);

  // Translation mapping
  const translations = {
    en: {
      title: "Alerts & Exceptions Dashboard",
      subtitle: "Single point of human-decision overrides for All India Elevators Company automation logs",
      kpiAlertsCount: "Unresolved Exceptions",
      kpiCriticalCount: "Critical Safety / SOS",
      kpiAvgResolution: "Avg Recovery Speed",
      kpiAutoResolved: "Auto-Cleared Remotely",
      resolveBtn: "Resolve Exception",
      snoozeBtn: "Snooze Alert",
      delegateBtn: "Delegate to Team Lead",
      searchPlaceholder: "Search by exception title, related record, or details...",
      catAll: "All Categories",
      catDuplicate: "Duplicate Lead",
      catAutomation: "Automation Failure",
      catPayment: "Overdue Payment",
      catDispute: "Supplier Dispute",
      catInsurance: "Insurance Expired",
      catQC: "QC Snag",
      catSOS: "SOS Alert",
      priorityAll: "All Priorities",
      priorityCritical: "Critical",
      priorityHigh: "High",
      priorityNormal: "Normal",
      emptyStateTitle: "All Clear! Standby Active",
      emptyStateDesc: "No outstanding automation exceptions or safety disputes require manual intervention today.",
      resolvedElsewhere: "Auto-resolved elsewhere by background synchronization cycle.",
      ageLabel: "Age: {h}h ago",
      assignedToLabel: "Assigned To: ",
      linkedToLabel: "Linked: ",
      reassignSuccess: "Successfully delegated to {lead}",
      snoozeSuccess: "Snoozed exception alert for 4 hours.",
      resolveSuccess: "Exception resolved successfully and cleared from live ledger.",
      progressTitle: "SLA EXCEPTION RESOLUTION PROGRESS",
      currentProgressLabel: "Current Active Exceptions Solved Today",
      totalProgressLabel: "Overall MTD SLA Resolution (24h Window)",
      detailsHeading: "Exception Audit Panel",
      closeDetails: "Minimize Panel",
      sosBanner: "CRITICAL SOS ACTIVE - CONTACT TEAM IMMEDIATELY",
      actionCall: "Trigger Voice Call",
      actionWhatsApp: "Dispatch Field Help",
      disputeAlert: "Linked payment dispute isolated from auto-billing cycles."
    },
    hi: {
      title: "अलर्ट और अपवाद नियंत्रण बोर्ड",
      subtitle: "ऑल इंडिया एलिवेटर्स कंपनी स्वचालन अपवादों के लिए मानव-निर्णय का एकमात्र केंद्र",
      kpiAlertsCount: "अनसुलझे अपवाद",
      kpiCriticalCount: "गंभीर सुरक्षा / SOS",
      kpiAvgResolution: "औसत समाधान समय",
      kpiAutoResolved: "दूरस्थ रूप से हल किया गया",
      resolveBtn: "अपवाद का समाधान करें",
      snoozeBtn: "अलर्ट स्नूज़ करें",
      delegateBtn: "टीम लीड को सौंपें",
      searchPlaceholder: "अपवाद शीर्षक, संबंधित रिकॉर्ड या विवरण द्वारा खोजें...",
      catAll: "सभी श्रेणियां",
      catDuplicate: "डुप्लिकेट लीड",
      catAutomation: "स्वचालन विफलता",
      catPayment: "अतिदेय भुगतान",
      catDispute: "आपूर्तिकर्ता विवाद",
      catInsurance: "बीमा समाप्त",
      catQC: "गुणवत्ता नियंत्रण कमी",
      catSOS: "आपातकालीन SOS",
      priorityAll: "सभी प्राथमिकताएं",
      priorityCritical: "अत्यंत गंभीर",
      priorityHigh: "उच्च प्राथमिकता",
      priorityNormal: "सामान्य",
      emptyStateTitle: "शानदार! सभी अपवाद हल हैं",
      emptyStateDesc: "आज किसी भी स्वचालन अपवाद या सुरक्षा विवाद को मैन्युअल हस्तक्षेप की आवश्यकता नहीं है।",
      resolvedElsewhere: "पृष्ठभूमि सिंक द्वारा स्वचालित रूप से हल किया गया।",
      ageLabel: "समय: {h} घंटे पहले",
      assignedToLabel: "सॉपा गया: ",
      linkedToLabel: "जुड़ा हुआ: ",
      reassignSuccess: "सफलतापूर्वक {lead} को कार्य सौंपा गया",
      snoozeSuccess: "अपवाद अलर्ट को 4 घंटे के लिए स्नूज़ किया गया।",
      resolveSuccess: "अपवाद सफलतापूर्वक हल किया गया और बही खाते से हटा दिया गया।",
      progressTitle: "SLA अपवाद समाधान प्रगति",
      currentProgressLabel: "आज हल किए गए सक्रिय अपवाद",
      totalProgressLabel: "समग्र मासिक SLA समाधान दर (24 घंटे का दायरा)",
      detailsHeading: "अपवाद ऑडिट विवरण",
      closeDetails: "विवरण छुपाएं",
      sosBanner: "गंभीर आपातकालीन SOS - तुरंत टीम से संपर्क करें",
      actionCall: "वॉयस कॉल करें",
      actionWhatsApp: "क्षेत्रीय सहायता भेजें",
      disputeAlert: "लिंक्ड भुगतान विवाद को स्वचालन चक्र से बाहर रखा गया है।"
    },
    mr: {
      title: "अलर्ट आणि अपवाद नियंत्रण फलक",
      subtitle: "स्वयंचलित लिफ्ट प्रणालीमधील मानवी-निर्णय ओव्हरराइडचे मुख्य केंद्र",
      kpiAlertsCount: "थकीत अपवाद",
      kpiCriticalCount: "गंभीर सुरक्षा / SOS",
      kpiAvgResolution: "सरासरी निवारण वेळ",
      kpiAutoResolved: "स्वयंचलित दूरस्थ निवारण",
      resolveBtn: "समस्या सोडवा",
      snoozeBtn: "स्नूझ अलर्ट",
      delegateBtn: "टीम प्रमुखाकडे वर्ग करा",
      searchPlaceholder: "अपवाद शीर्षक, संबंधित रेकॉर्ड किंवा तपशीलाद्वारे शोधा...",
      catAll: "सर्व श्रेणी",
      catDuplicate: "डुप्लिकेट लीड",
      catAutomation: "स्वयंचलित बिघाड",
      catPayment: "थकीत पेमेंट",
      catDispute: "विक्रेता वाद",
      catInsurance: "विमा संपुष्टात",
      catQC: "गुणवत्ता नियंत्रण त्रुटी",
      catSOS: "तातडीचा SOS",
      priorityAll: "सर्व प्राधान्यक्रम",
      priorityCritical: "अत्यंत गंभीर",
      priorityHigh: "उच्च प्राधान्य",
      priorityNormal: "सामान्य",
      emptyStateTitle: "उत्कृष्ट! सर्व समस्यांचे निवारण झाले",
      emptyStateDesc: "आज कोणत्याही स्वयंचलित अपवाद किंवा सुरक्षा वादासाठी मॅन्युअल हस्तक्षेपाची गरज नाही.",
      resolvedElsewhere: "बॅकग्राउंड सिंकद्वारे आपोआप सोडवले गेले आहे.",
      ageLabel: "वय: {h} तासांपूर्वी",
      assignedToLabel: "नियोजित व्यक्ती: ",
      linkedToLabel: "लिंक्ड: ",
      reassignSuccess: "यशस्वीरित्या {lead} कडे सोपवले",
      snoozeSuccess: "अपवाद अलर्ट ४ तासांसाठी स्नूझ केला.",
      resolveSuccess: "समस्येचे यशस्वी निवारण करून रेकॉर्डवरून काढले गेले.",
      progressTitle: "SLA अपवाद निवारण प्रगती",
      currentProgressLabel: "आज सोडवलेले सक्रिय अपवाद",
      totalProgressLabel: "एकूण मासिक SLA यश दर (२४ तास मर्यादा)",
      detailsHeading: "अपवाद ऑडिट तपशील",
      closeDetails: "तपशील लपवा",
      sosBanner: "तातडीचा SOS अलर्ट - त्वरित संपर्क साधा",
      actionCall: "थेट फोन करा",
      actionWhatsApp: "मदत रवाना करा",
      disputeAlert: "संबंधित पेमेंट वाद स्वयंचलित बिलिंग मधून वेगळा केला आहे."
    }
  };

  const t = translations[language as 'en' | 'mr' | 'hi'] || translations.en;

  // Simulate remote background resolution (Edge Case: record resolved elsewhere)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate EXC-106 (Insurance expiring) being resolved elsewhere automatically by Compliance Lead
      setExceptions(prev => prev.map(exc => {
        if (exc.id === 'EXC-106') {
          return { ...exc, isResolvedElsewhere: true };
        }
        return exc;
      }));
      setShowResolvedElsewhereNote('EXC-106');
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Poll exceptions refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Direct actions
  const handleResolveException = (id: string) => {
    setExceptions(prev => prev.filter(exc => exc.id !== id));
    if (selectedException?.id === id) {
      setSelectedException(null);
    }
    alert(t.resolveSuccess);
  };

  const handleDelegate = (leadName: string) => {
    if (!selectedException) return;
    setExceptions(prev => prev.map(exc => {
      if (exc.id === selectedException.id) {
        return { ...exc, assignedTo: leadName };
      }
      return exc;
    }));
    setSelectedException(prev => prev ? { ...prev, assignedTo: leadName } : null);
    setDelegateModalOpen(false);
    alert(t.reassignSuccess.replace('{lead}', leadName));
  };

  const handleSnooze = () => {
    if (!selectedException) return;
    const snoozeTime = new Date();
    snoozeTime.setHours(snoozeTime.getHours() + 4);
    
    setExceptions(prev => prev.map(exc => {
      if (exc.id === selectedException.id) {
        return { ...exc, snoozedUntil: snoozeTime.toISOString() };
      }
      return exc;
    }));
    setSelectedException(prev => prev ? { ...prev, snoozedUntil: snoozeTime.toISOString() } : null);
    setSnoozeModalOpen(false);
    alert(t.snoozeSuccess);
  };

  const handleRemoveSnooze = (id: string) => {
    setExceptions(prev => prev.map(exc => {
      if (exc.id === id) {
        const { snoozedUntil, ...rest } = exc;
        return rest as ExceptionItem;
      }
      return exc;
    }));
    if (selectedException?.id === id) {
      setSelectedException(prev => {
        if (!prev) return null;
        const { snoozedUntil, ...rest } = prev;
        return rest as ExceptionItem;
      });
    }
  };

  // Helper colors for categories
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SOS Alert': return 'bg-error/10 text-error border-error/20';
      case 'Automation Failure': return 'bg-antiquegold/10 text-antiquegold border-antiquegold/20';
      case 'Overdue Payment': return 'bg-[#B23B3B]/10 text-[#B23B3B] border-[#B23B3B]/20';
      case 'Supplier Dispute': return 'bg-[#B8873D]/10 text-[#B8873D] border-[#B8873D]/20';
      case 'QC Snag': return 'bg-royalemerald/10 text-royalemerald border-royalemerald/20';
      default: return 'bg-alabaster text-warmgray border-warmgray/20';
    }
  };

  // Sort & Filter Exceptions
  // Priority rule-based: SOS Alert & Overdue past 90 hours is always critical
  const processedExceptions = exceptions.map(exc => {
    if (exc.category === 'SOS Alert' || (exc.category === 'Overdue Payment' && exc.ageHours >= 90)) {
      return { ...exc, priority: 'Critical' as const };
    }
    return exc;
  });

  // Filters
  const filteredExceptions = processedExceptions.filter(exc => {
    const matchesSearch = exc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exc.relatedRecordId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || exc.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || exc.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Default sorting: Critical priority first, then High, then Normal
  const sortedExceptions = [...filteredExceptions].sort((a, b) => {
    const priorityWeight = { 'Critical': 3, 'High': 2, 'Normal': 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  // Counting metrics
  const unresolvedCount = exceptions.filter(e => !e.isResolvedElsewhere).length;
  const criticalCount = exceptions.filter(e => e.priority === 'Critical').length;

  // SLA Exception resolution progress bars as demanded by ADD INSTRUCTION
  const dailyResolvedTarget = 10;
  const dailyResolvedActual = 8;
  const dailyProgressPercent = Math.round((dailyResolvedActual / dailyResolvedTarget) * 100);

  const mtdResolvedTarget = 150;
  const mtdResolvedActual = 142;
  const mtdProgressPercent = Math.round((mtdResolvedActual / mtdResolvedTarget) * 100);

  return (
    <div className="w-full space-y-6 pb-20">

      {/* SCREEN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-antiquegold rounded-full block" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal leading-none">
              {t.title}
            </h1>
          </div>
          <p className="text-xs text-warmgray font-medium">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="secondary" onClick={handleRefresh} className="!py-2 !px-3 hover:scale-[1.02] flex items-center gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Operations Logs
          </Button>
          <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold border border-royalemerald/20 px-2.5 py-1 rounded-lg">
            ⚡ EXCEPTION LEDGER SYNCED
          </span>
        </div>
      </div>

      {/* ADDITIONAL USER INSTRUCTION: Show current % progress bar & total % progress bar */}
      <Card className="p-5 bg-white relative overflow-hidden border-royalemerald/15">
        <div className="absolute right-0 top-0 w-24 h-24 bg-royalemerald/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-royalemerald" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            {t.progressTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Day Resolution Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {t.currentProgressLabel} ({dailyResolvedActual}/{dailyResolvedTarget})
              </span>
              <span className="font-mono text-sm font-bold text-royalemerald">
                {dailyProgressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-royalemerald h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </motion.div>
            </div>
          </div>

          {/* Total Month-to-Date Resolution Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {t.totalProgressLabel} ({mtdResolvedActual}/{mtdResolvedTarget})
              </span>
              <span className="font-mono text-sm font-bold text-antiquegold">
                {mtdProgressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mtdProgressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-antiquegold h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI DASHBOARD SUMMARY ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Unresolved count */}
        <Card className="p-4 bg-white relative overflow-hidden flex flex-col justify-between">
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.kpiAlertsCount}</p>
          <div className="flex justify-between items-end mt-2">
            <span className="font-serif text-3xl font-extrabold text-charcoal font-mono">
              {unresolvedCount}
            </span>
            <span className="text-[10px] bg-antiquegold/10 text-antiquegold px-2 py-0.5 rounded-full font-bold">
              Active Logs
            </span>
          </div>
        </Card>

        {/* Critical Safety / SOS */}
        <Card className="p-4 bg-white relative overflow-hidden border-error/20 flex flex-col justify-between">
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.kpiCriticalCount}</p>
          <div className="flex justify-between items-end mt-2">
            <span className="font-serif text-3xl font-extrabold text-error font-mono">
              {criticalCount}
            </span>
            <span className="text-[9px] bg-error text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
              ACTION REQ
            </span>
          </div>
        </Card>

        {/* Avg Resolution Speed */}
        <Card className="p-4 bg-white relative overflow-hidden flex flex-col justify-between">
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.kpiAvgResolution}</p>
          <div className="flex justify-between items-end mt-2">
            <span className="font-serif text-3xl font-extrabold text-charcoal font-mono">
              1.4 Hrs
            </span>
            <span className="text-[10px] bg-royalemerald/10 text-royalemerald px-2 py-0.5 rounded-full font-bold">
              SLA Met
            </span>
          </div>
        </Card>

        {/* Auto-Cleared Remotely */}
        <Card className="p-4 bg-white relative overflow-hidden flex flex-col justify-between">
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.kpiAutoResolved}</p>
          <div className="flex justify-between items-end mt-2">
            <span className="font-serif text-3xl font-extrabold text-royalemerald font-mono">
              42/45
            </span>
            <span className="text-[10px] bg-alabaster text-warmgray px-2 py-0.5 rounded-full font-bold">
              93.3% Rate
            </span>
          </div>
        </Card>
      </div>

      {/* EDGE CASE: BACKGROUND AUTO-RESOLVED ALERT NOTIFICATION */}
      <AnimatePresence>
        {showResolvedElsewhereNote && exceptions.find(e => e.id === showResolvedElsewhereNote)?.isResolvedElsewhere && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-royalemerald/10 border border-royalemerald/20 flex justify-between items-center"
          >
            <div className="flex gap-2 text-royalemerald">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold">
                Exception <span className="font-mono font-bold">{showResolvedElsewhereNote}</span>: {t.resolvedElsewhere}
              </p>
            </div>
            <button 
              onClick={() => {
                setExceptions(prev => prev.filter(e => e.id !== showResolvedElsewhereNote));
                setShowResolvedElsewhereNote(null);
              }}
              className="text-xs font-extrabold text-royalemerald hover:underline"
            >
              Clear Notice
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH AND FILTERS (Layout Specific Sticky Header style) */}
      <Card className="p-4 bg-white border-antiquegold/10 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F5] text-xs border border-[rgba(184,135,61,0.15)] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 min-w-[160px]">
            <Filter className="w-3.5 h-3.5 text-warmgray shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FAF9F5] text-xs border border-[rgba(184,135,61,0.15)] rounded-xl px-3 py-2.5 text-charcoal font-bold focus:outline-none"
            >
              <option value="All">{t.catAll}</option>
              <option value="SOS Alert">{t.catSOS}</option>
              <option value="Automation Failure">{t.catAutomation}</option>
              <option value="Overdue Payment">{t.catPayment}</option>
              <option value="Supplier Dispute">{t.catDispute}</option>
              <option value="Insurance Expired">{t.catInsurance}</option>
              <option value="QC Snag">{t.catQC}</option>
              <option value="Duplicate Lead">{t.catDuplicate}</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="min-w-[130px]">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-[#FAF9F5] text-xs border border-[rgba(184,135,61,0.15)] rounded-xl px-3 py-2.5 text-charcoal font-bold focus:outline-none"
            >
              <option value="All">{t.priorityAll}</option>
              <option value="Critical">{t.priorityCritical}</option>
              <option value="High">{t.priorityHigh}</option>
              <option value="Normal">{t.priorityNormal}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* CORE CONTENT: TWO COLUMNS (LIST + AUDIT DRAWER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONSOLIDATED LIST (Col span 7) */}
        <div className="lg:col-span-7 space-y-3">
          
          {sortedExceptions.length === 0 ? (
            <Card className="p-10 text-center text-warmgray border-dashed border-2 border-[rgba(184,135,61,0.15)] flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-royalemerald" />
              <h4 className="font-serif font-bold text-lg text-charcoal">{t.emptyStateTitle}</h4>
              <p className="text-xs font-medium max-w-sm">{t.emptyStateDesc}</p>
            </Card>
          ) : (
            sortedExceptions.map((exc) => {
              const isSelected = selectedException?.id === exc.id;
              const isSOS = exc.category === 'SOS Alert';
              const isSnoozed = exc.snoozedUntil && new Date(exc.snoozedUntil) > new Date();

              return (
                <motion.div
                  key={exc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-4 rounded-2xl bg-white border transition-all cursor-pointer overflow-hidden ${
                    isSelected 
                      ? 'border-antiquegold ring-1 ring-antiquegold/20 bg-[#FAF9F5] shadow-xs' 
                      : 'border-[rgba(184,135,61,0.1)] hover:bg-[#FAF9F5]/30'
                  }`}
                  onClick={() => setSelectedException(exc)}
                >
                  {/* Left priority border highlight */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                    exc.priority === 'Critical' ? 'bg-error' : exc.priority === 'High' ? 'bg-antiquegold' : 'bg-royalemerald'
                  }`} />

                  {/* Layout Pattern: Row Anatomy */}
                  <div className="flex justify-between items-start gap-3">
                    
                    {/* Left Icon with tinted bg */}
                    <div className="flex gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${getCategoryColor(exc.category)}`}>
                        {isSOS ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[9px] font-bold text-warmgray">{exc.id}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            exc.priority === 'Critical' ? 'bg-error/10 text-error border-error/20' : exc.priority === 'High' ? 'bg-antiquegold/10 text-antiquegold border-antiquegold/20' : 'bg-royalemerald/10 text-royalemerald border-royalemerald/20'
                          }`}>
                            {exc.priority}
                          </span>
                          {isSnoozed && (
                            <span className="bg-alabaster text-warmgray text-[8px] px-1.5 py-0.5 rounded font-bold border border-warmgray/20 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              SNOOZED
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-charcoal leading-tight">
                          {exc.title}
                        </h4>
                        
                        <p className="text-[11px] text-charcoal leading-relaxed font-medium line-clamp-2">
                          {exc.description}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-warmgray font-semibold">
                            Record: <span className="font-mono text-antiquegold font-bold">{exc.relatedRecordId}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trailing Meta */}
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-mono font-bold text-warmgray block">
                        {t.ageLabel.replace('{h}', exc.ageHours.toFixed(1))}
                      </span>
                      <span className="text-[9px] text-warmgray font-bold block mt-1">
                        {exc.assignedTo || 'Unassigned'}
                      </span>
                    </div>

                  </div>

                  {/* Row manual override buttons inside card */}
                  <div className="mt-4 pt-3 border-t border-[rgba(184,135,61,0.08)] flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {isSnoozed ? (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleRemoveSnooze(exc.id)}
                        className="!py-1.5 !px-3 text-[10px] font-bold"
                      >
                        Un-Snooze
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setSelectedException(exc);
                          setSnoozeModalOpen(true);
                        }}
                        className="!py-1.5 !px-3 text-[10px] font-bold"
                      >
                        Snooze
                      </Button>
                    )}
                    <Button 
                      variant="primary" 
                      onClick={() => handleResolveException(exc.id)}
                      className="!py-1.5 !px-3 text-[10px] font-bold"
                    >
                      {t.resolveBtn}
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: ACTION AUDIT DRAWER (Col span 5) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedException ? (
              <motion.div
                key={selectedException.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-5 border-antiquegold bg-white space-y-4">
                  <div className="flex justify-between items-center border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
                      {t.detailsHeading}
                    </h3>
                    <button 
                      onClick={() => setSelectedException(null)} 
                      className="text-warmgray hover:text-charcoal p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* CRITICAL SOS EMERGENCY HEADER */}
                  {selectedException.category === 'SOS Alert' && (
                    <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-bold flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                        <span>{t.sosBanner}</span>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href="tel:+919876543210" 
                          className="flex-1 bg-error text-white font-bold py-1 px-2.5 rounded-lg text-center flex items-center justify-center gap-1 hover:bg-error/90"
                        >
                          <Phone className="w-3 h-3" />
                          {t.actionCall}
                        </a>
                        <a 
                          href="https://wa.me/919876543210" 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 bg-[#25D366] text-white font-bold py-1 px-2.5 rounded-lg text-center flex items-center justify-center gap-1 hover:bg-[#20ba59]"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {t.actionWhatsApp}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">EXCEPTION ID / CATEGORY</p>
                      <p className="font-serif font-bold text-charcoal text-sm mt-0.5">
                        {selectedException.id} • {selectedException.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">DETAILED EXCEPTION OVERVIEW</p>
                      <p className="font-semibold text-charcoal leading-relaxed bg-alabaster p-3 rounded-xl border border-[rgba(184,135,61,0.08)]">
                        {selectedException.description}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">RELATED SYSTEM RECORD</p>
                      <p className="font-mono text-antiquegold font-bold">
                        {selectedException.relatedRecordId}
                      </p>
                    </div>

                    {selectedException.linkedExceptionId && (
                      <div className="p-3 bg-[#FAF9F5] border border-antiquegold/20 rounded-xl space-y-1">
                        <p className="text-[9px] text-warmgray font-bold uppercase">{t.linkedToLabel}</p>
                        <p className="font-mono text-charcoal font-bold">
                          {selectedException.linkedExceptionId} (Automation Failure Log)
                        </p>
                      </div>
                    )}

                    {selectedException.category === 'Supplier Dispute' && (
                      <div className="p-3 rounded-xl bg-[#B8873D]/10 border border-[#B8873D]/20 text-charcoal text-[10px] font-semibold leading-relaxed">
                        <p className="font-bold text-antiquegold mb-1">DISPUTE PROTOCOL ACTIVE</p>
                        {t.disputeAlert}
                      </div>
                    )}

                    {/* Signature Ascension Line progress indicators inside drilldown drawer */}
                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase mb-2">SLA TIMELINE (ASCENSION LINE)</p>
                      <div className="relative pl-5 py-1">
                        <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-alabaster border-l border-[rgba(184,135,61,0.2)]" />
                        <div className="absolute left-[7px] top-0 w-0.5 bg-antiquegold h-1/2" />

                        <div className="space-y-4">
                          <div className="flex items-start gap-2 text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full bg-royalemerald border-2 border-white flex items-center justify-center text-white shrink-0 z-10">
                              ✓
                            </div>
                            <div>
                              <p className="font-bold text-charcoal">System Exception Captured</p>
                              <p className="text-[8px] text-warmgray mt-0.5">Logged automatically within 200ms of failure.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full bg-antiquegold border-2 border-white flex items-center justify-center text-white shrink-0 z-10 animate-pulse">
                              ➔
                            </div>
                            <div>
                              <p className="font-bold text-charcoal">Awaiting Admin Human Override</p>
                              <p className="text-[8px] text-warmgray mt-0.5">Assigned to: {selectedException.assignedTo || 'System Admin'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-[rgba(184,135,61,0.08)] space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={() => setDelegateModalOpen(true)}
                          className="w-full text-xs font-bold"
                        >
                          {t.delegateBtn}
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => handleResolveException(selectedException.id)}
                          className="w-full text-xs font-bold"
                        >
                          {t.resolveBtn}
                        </Button>
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={() => setSelectedException(null)}
                        className="w-full text-xs font-bold"
                      >
                        {t.closeDetails}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-5 text-center text-warmgray border-dashed border border-[rgba(184,135,61,0.15)] flex flex-col items-center justify-center min-h-[300px]">
                <Info className="w-8 h-8 text-antiquegold/60 mb-2" />
                <p className="text-xs font-bold text-charcoal uppercase tracking-wide">Exception Drilldown Panel</p>
                <p className="text-[11px] max-w-[200px] mt-1 leading-normal">Select any item in the consolidated queue to analyze payload parameters, assign tasks, or trigger overrides.</p>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DELEGATE MODAL */}
      <AnimatePresence>
        {delegateModalOpen && (
          <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-5 border border-antiquegold/20 max-w-sm w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[rgba(184,135,61,0.1)]">
                <h4 className="font-serif font-bold text-charcoal">Delegate Exception Log</h4>
                <button onClick={() => setDelegateModalOpen(false)} className="text-warmgray hover:text-charcoal font-bold">✕</button>
              </div>

              <p className="text-xs text-warmgray leading-relaxed font-semibold">
                SLA accountability routes automatically. Select a verified team leader to delegate resolution:
              </p>

              <div className="space-y-2">
                {teamLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleDelegate(lead.name)}
                    className="w-full text-left p-3 rounded-xl bg-alabaster hover:bg-antiquegold/10 border border-[rgba(184,135,61,0.05)] text-xs font-bold text-charcoal flex justify-between items-center"
                  >
                    <span>{lead.name}</span>
                    <ChevronRight className="w-4 h-4 text-antiquegold" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SNOOZE MODAL */}
      <AnimatePresence>
        {snoozeModalOpen && (
          <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-5 border border-antiquegold/20 max-w-sm w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[rgba(184,135,61,0.1)]">
                <h4 className="font-serif font-bold text-charcoal">Snooze Notification Alert</h4>
                <button onClick={() => setSnoozeModalOpen(false)} className="text-warmgray hover:text-charcoal font-bold">✕</button>
              </div>

              <p className="text-xs text-warmgray leading-relaxed font-semibold">
                Snoozing suppresses SMS alerts and dashboard highlights. Confirm suppress duration:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleSnooze}
                  className="p-3 bg-alabaster hover:bg-antiquegold/10 border border-[rgba(184,135,61,0.08)] rounded-xl text-center text-xs font-bold text-charcoal"
                >
                  Snooze 4 Hours
                </button>
                <button 
                  onClick={() => {
                    const snoozeTime = new Date();
                    snoozeTime.setHours(snoozeTime.getHours() + 24);
                    setExceptions(prev => prev.map(exc => {
                      if (exc.id === selectedException?.id) {
                        return { ...exc, snoozedUntil: snoozeTime.toISOString() };
                      }
                      return exc;
                    }));
                    setSnoozeModalOpen(false);
                    alert("Snoozed alert for 24 hours.");
                  }}
                  className="p-3 bg-alabaster hover:bg-antiquegold/10 border border-[rgba(184,135,61,0.08)] rounded-xl text-center text-xs font-bold text-charcoal"
                >
                  Snooze 24 Hours
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
