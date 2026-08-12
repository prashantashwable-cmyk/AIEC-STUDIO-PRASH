import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Play, RotateCw, AlertTriangle, CheckCircle2, 
  XCircle, Send, Search, Filter, ShieldAlert, Cpu, 
  MessageSquare, DollarSign, Calculator, HelpCircle, ArrowUpRight,
  Sparkles, RefreshCw, FileText, Ban, Layers, Check, ExternalLink
} from 'lucide-react';
import { Card, Button } from './Common';
import { useLanguage } from '../lib/language';
import { User } from '../types';

interface AutomationComponent {
  id: string;
  name: string;
  displayNameEn: string;
  displayNameHi: string;
  displayNameMr: string;
  status: 'Healthy' | 'Degraded' | 'Down';
  uptime30d: number;
  totalRuns: number;
  successCount: number;
  failCount: number;
  lastRunTime: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface FailureLog {
  id: string;
  automationId: string;
  automationName: string;
  recordId: string;
  recordType: 'Lead' | 'Deal' | 'Invoice' | 'Supplier' | 'Technician';
  reason: string;
  timestamp: string;
  retryCount: number;
  status: 'Failed' | 'Retrying' | 'Resolved' | 'Stuck Loop' | 'Manual Required';
}

const initialAutomations: AutomationComponent[] = [
  {
    id: 'auto_quotation',
    name: 'Auto-Quotation Engine',
    displayNameEn: 'Auto-Quotation Engine',
    displayNameHi: 'स्वचालित कोटेशन इंजन',
    displayNameMr: 'स्वयंचलित कोटेशन इंजिन',
    status: 'Healthy',
    uptime30d: 99.8,
    totalRuns: 2840,
    successCount: 2835,
    failCount: 5,
    lastRunTime: '2 mins ago',
    icon: Calculator,
    description: 'Generates automated elevator customization quotations based on height, passenger load, speed, and premium finishes.'
  },
  {
    id: 'auto_negotiation',
    name: 'AI Auto-Negotiation Bot',
    displayNameEn: 'AI Auto-Negotiation Bot',
    displayNameHi: 'एआई बातचीत सहायक',
    displayNameMr: 'एआई चर्चा रोबोट',
    status: 'Healthy',
    uptime30d: 98.6,
    totalRuns: 1450,
    successCount: 1420,
    failCount: 30,
    lastRunTime: '5 mins ago',
    icon: Sparkles,
    description: 'Handles client bargaining strategies using Mr. Prashant’s pre-approved margin tables and discounts automatically.'
  },
  {
    id: 'whatsapp_sequences',
    name: 'WhatsApp/SMS Broadcast Sequences',
    displayNameEn: 'WhatsApp/SMS Broadcast Sequences',
    displayNameHi: 'व्हाट्सएप/एसएमएस सूचना चक्र',
    displayNameMr: 'व्हाट्सएप/एसएमएस प्रसार शृंखला',
    status: 'Degraded',
    uptime30d: 94.2,
    totalRuns: 12400,
    successCount: 11650,
    failCount: 750,
    lastRunTime: 'Just Now',
    icon: MessageSquare,
    description: 'Sends automated updates on elevator installation stages, technician dispatch logs, and regulatory checklist approvals.'
  },
  {
    id: 'payment_reminders',
    name: 'Auto-Payment Reminders',
    displayNameEn: 'Auto-Payment Reminders',
    displayNameHi: 'स्वचालित भुगतान अनुस्मारक',
    displayNameMr: 'स्वयंचलित पेमेंट स्मरणपत्र',
    status: 'Healthy',
    uptime30d: 99.9,
    totalRuns: 4320,
    successCount: 4318,
    failCount: 2,
    lastRunTime: '15 mins ago',
    icon: DollarSign,
    description: 'Triggers polite invoice notifications, WhatsApp links, and UPI payment intents for outstanding structural installment slabs.'
  },
  {
    id: 'payout_engine',
    name: 'Auto-Payout Ledger Engine',
    displayNameEn: 'Auto-Payout Ledger Engine',
    displayNameHi: 'स्वचालित भुगतान खाता बही',
    displayNameMr: 'स्वयंचलित वेतन आणि पेआउट इंजिन',
    status: 'Healthy',
    uptime30d: 100.0,
    totalRuns: 640,
    successCount: 640,
    failCount: 0,
    lastRunTime: '1 hour ago',
    icon: Layers,
    description: 'Transfers vendor funds, surveyor site visit incentives, and technician milestone payments automatically upon QC signoff.'
  }
];

const initialFailures: FailureLog[] = [
  {
    id: 'FL-2026-904',
    automationId: 'whatsapp_sequences',
    automationName: 'WhatsApp/SMS Sequences',
    recordId: 'LD-8041 (Kothrud Residency)',
    recordType: 'Lead',
    reason: 'WhatsApp Business API rate-limited: High volume broadcast traffic detected in Pune West zone.',
    timestamp: '2026-07-09T05:42:00Z',
    retryCount: 1,
    status: 'Failed'
  },
  {
    id: 'FL-2026-905',
    automationId: 'auto_quotation',
    automationName: 'Auto-Quotation Engine',
    recordId: 'DL-5032 (Viman Nagar Slabs)',
    recordType: 'Deal',
    reason: 'Quotation engine missing a required cost input: Stainless steel hair-line finish rate undefined for July.',
    timestamp: '2026-07-09T05:30:00Z',
    retryCount: 0,
    status: 'Failed'
  },
  {
    id: 'FL-2026-906',
    automationId: 'whatsapp_sequences',
    automationName: 'WhatsApp/SMS Sequences',
    recordId: 'INV-4022 (Bhosari Industry Complex)',
    recordType: 'Invoice',
    reason: 'Stuck retry loop: Number formatted incorrectly with double country code (+91+919875...).',
    timestamp: '2026-07-09T05:15:00Z',
    retryCount: 5,
    status: 'Stuck Loop'
  }
];

export const AutomationHealthMonitor: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // State
  const [automations, setAutomations] = useState<AutomationComponent[]>(initialAutomations);
  const [failures, setFailures] = useState<FailureLog[]>(initialFailures);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [selectedFailure, setSelectedFailure] = useState<FailureLog | null>(null);

  // Manual configuration inputs (for loop threshold & fallback alerts)
  const [retryMaxLimit, setRetryMaxLimit] = useState<number>(5);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  
  // Simulation for dynamic logs
  const [runningManualSteps, setRunningManualSteps] = useState<Record<string, boolean>>({});

  const translations = {
    en: {
      title: "Automation Health Monitor",
      subtitle: "System control board for automated elevator pricing, client negotiation, and automated alerts",
      healthTitle: "Active System Pipelines",
      uptime: "30d Uptime",
      successRate: "Success Rate",
      runs: "Total Operations",
      failureQueue: "Action Required & Exception Logs",
      failuresSubtitle: "Automated processes awaiting manual intervention, validation override, or API retry",
      record: "Affected Case",
      reason: "Reason for Exception",
      status: "Pipeline Status",
      retryBtn: "Trigger API Retry",
      manualBtn: "Run Process Manually",
      manualDesc: "Resolve with dynamic values",
      stuckLoopWarning: "Loop Detected! Auto-retries suspended for safety.",
      configTitle: "Loop Prevention & Threshold Constraints",
      maxRetryLabel: "Max Automated Retry Failures before Suspension",
      maxRetryDesc: "System halts auto-retrying and alerts Admin immediately to prevent spamming clients.",
      healthyText: "Healthy",
      degradedText: "Degraded Outage",
      downText: "Down / Offline",
      systemHealthIndex: "Overall Core Telemetry Sync",
      processedTargets: "Completed Actions Goal Progress",
      telemetryReset: "Recalibrate Systems",
      exceptionLogs: "Admin Override Audit Trails",
      emptyQueue: "Excellent! All exceptions fully resolved. Monitor in standby.",
      outageNotice: "Pune Telemetry Warning",
      outageDesc: "WhatsApp degradation is due to regional SMS infrastructure maintenance. Failures will auto-retry via secondary fallback carrier.",
      detailsTitle: "Exception Remediation Panel",
      closeDetails: "Minimize Details",
      alertOverview: "Exceptions & Logs",
      loopPrevented: "Suspended / Stuck Loop"
    },
    hi: {
      title: "स्वचालन स्वास्थ्य मॉनिटर",
      subtitle: "स्वचालित मूल्य निर्धारण, बातचीत और सूचना प्रणालियों का नियंत्रण बोर्ड",
      healthTitle: "सक्रिय सिस्टम पाइपलाइन",
      uptime: "30 दिन की उपलब्धता",
      successRate: "सफलता दर",
      runs: "कुल संचालन",
      failureQueue: "कार्रवाई आवश्यक और अपवाद लॉग",
      failuresSubtitle: "मैन्युअल हस्तक्षेप, सत्यापन ओवरराइड या एपीआई रीट्राई की प्रतीक्षा में प्रक्रियाएं",
      record: "प्रभावित रिकॉर्ड",
      reason: "अपवाद का कारण",
      status: "पाइपलाइन स्थिति",
      retryBtn: "एपीआई पुनः प्रयास करें",
      manualBtn: "मैन्युअल रूप से चलाएं",
      manualDesc: "सक्रिय मानों के साथ समाधान करें",
      stuckLoopWarning: "अवरोध लूप पाया गया! सुरक्षा के लिए पुनः प्रयास निलंबित।",
      configTitle: "लूप रोकथाम और सीमा प्रतिबंध",
      maxRetryLabel: "निलंबन से पहले अधिकतम स्वचालित पुनः प्रयास",
      maxRetryDesc: "ग्राहकों को स्पैम से बचाने के लिए सिस्टम स्वचालित रूप से पुनः प्रयास करना बंद कर देता है।",
      healthyText: "स्वस्थ",
      degradedText: "कमजोर प्रदर्शन",
      downText: "ऑफलाइन",
      systemHealthIndex: "समग्र सिस्टम स्वास्थ्य सूचकांक",
      processedTargets: "पूर्ण प्रक्रियाओं का लक्ष्य",
      telemetryReset: "सिस्टम रीकैलिब्रेट करें",
      exceptionLogs: "प्रशासकीय लॉग और कार्रवाई विवरण",
      emptyQueue: "शानदार! सभी अपवाद हल कर दिए गए हैं।",
      outageNotice: "व्हाट्सएप कनेक्टिविटी चेतावनी",
      outageDesc: "व्हाट्सएप सेवा में मंदी क्षेत्रीय बुनियादी ढांचे के रख-रखाव के कारण है। वैकल्पिक प्रदाता चालू है।",
      detailsTitle: "त्रुटि निवारण विवरण",
      closeDetails: "विवरण बंद करें",
      alertOverview: "अपवाद और अलर्ट",
      loopPrevented: "निलंबित लूप"
    },
    mr: {
      title: "स्वयंचलित प्रणाली नियंत्रण फलक",
      subtitle: "स्वयंचलित लिफ्ट किंमत, ग्राहक वाटाघाटी आणि पेमेंट स्मरणपत्रांची आरोग्य स्थिती",
      healthTitle: "सक्रिय सिस्टम पाइपलाइन्स",
      uptime: "३० दिवसांची कार्यक्षमता",
      successRate: "यशस्वी दर",
      runs: "एकूण प्रक्रिया",
      failureQueue: "कार्रवाई आवश्यक आणि अपवाद लॉग",
      failuresSubtitle: "मॅन्युअल हस्तक्षेप, वैधता ओव्हरराइड किंवा API पुन्हा प्रयत्न करण्यासाठी प्रलंबित",
      record: "प्रभावित केस",
      reason: "अपवादाचे कारण",
      status: "पाइपलाइन स्थिती",
      retryBtn: "API पुन्हा प्रयत्न करा",
      manualBtn: "मॅन्युअल प्रक्रिया चालवा",
      manualDesc: "नवीन व्हॅल्यूसह सोडवा",
      stuckLoopWarning: "लूप शोधला! सुरक्षेसाठी स्वयंचलित पुन्हा प्रयत्न स्थगित.",
      configTitle: "लूप प्रतिबंध आणि मर्यादा नियम",
      maxRetryLabel: "स्वयंचलित रीट्राई मर्यादा",
      maxRetryDesc: "ग्राहकांना वारंवार संदेश जाण्यापासून रोखण्यासाठी मर्यादा गाठताच ऑटो-रीट्राई थांबते.",
      healthyText: "कार्यक्षम",
      degradedText: "अंशत: खंडित",
      downText: "बंद / ऑफलाईन",
      systemHealthIndex: "एकूण प्रणाली आरोग्य निर्देशांक",
      processedTargets: "यशस्वी लक्ष्यांची प्रगती",
      telemetryReset: "प्रणाली रीकैलिब्रेट करा",
      exceptionLogs: "प्रशासकीय ओव्हरराइड ऑडिट लॉग",
      emptyQueue: "उत्कृष्ट! सर्व समस्यांचे निवारण झाले आहे.",
      outageNotice: "पुणे कनेक्टिव्हिटी समस्या",
      outageDesc: "प्रादेशिक नेटवर्क देखभालीमुळे व्हॉट्सॲप संथ आहे. बॅकअप चॅनेल कार्यरत आहे.",
      detailsTitle: "त्रुटि निवारण तपशील",
      closeDetails: "तपशील लपवा",
      alertOverview: "अपवाद आणि अलर्ट",
      loopPrevented: "स्थगित लूप"
    }
  };

  const t = translations[language as 'en' | 'mr' | 'hi'] || translations.en;

  // Sync / Refresh telemetry simulation
  const handlePollTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate slight dynamic status update or resolution
      setAutomations(prev => prev.map(a => {
        if (a.id === 'whatsapp_sequences') {
          // Keep it degraded or simulate small runs increase
          return { ...a, totalRuns: a.totalRuns + 15, successCount: a.successCount + 12, failCount: a.failCount + 3 };
        }
        return { ...a, totalRuns: a.totalRuns + 8, successCount: a.successCount + 8 };
      }));
      setIsRefreshing(false);
      
      const log = `[${new Date().toLocaleTimeString()}] Live pipeline telemetry polled. Status: 4/5 OK, 1/5 DEGRADED.`;
      setAuditLogs(prev => [log, ...prev]);
    }, 800);
  };

  // One-tap automated retry logic
  const handleTriggerRetry = (failId: string) => {
    setRunningManualSteps(prev => ({ ...prev, [failId]: true }));
    
    setTimeout(() => {
      setFailures(prev => prev.map(f => {
        if (f.id === failId) {
          // If already near max limits, trigger stuck loop state
          const nextRetry = f.retryCount + 1;
          const isStuck = nextRetry >= retryMaxLimit;
          return {
            ...f,
            retryCount: nextRetry,
            status: isStuck ? 'Stuck Loop' : 'Retrying',
            reason: isStuck 
              ? `Auto-retried ${nextRetry} times. Halting execution to prevent transaction abuse.`
              : 'Retrying transaction with original payloads...'
          };
        }
        return f;
      }));

      setRunningManualSteps(prev => ({ ...prev, [failId]: false }));
      
      const log = `[${new Date().toLocaleTimeString()}] API retry initiated for ${failId}. Counter increased.`;
      setAuditLogs(prev => [log, ...prev]);
    }, 1000);
  };

  // Run manually option (Admin fills missing details or overrides)
  const handleRunManually = (failId: string) => {
    setRunningManualSteps(prev => ({ ...prev, [failId]: true }));
    
    setTimeout(() => {
      // Remove or resolve from queue
      setFailures(prev => prev.filter(f => f.id !== failId));
      setRunningManualSteps(prev => ({ ...prev, [failId]: false }));
      if (selectedFailure?.id === failId) {
        setSelectedFailure(null);
      }

      // Add to success counts of the respective automation
      const targetFail = failures.find(f => f.id === failId);
      if (targetFail) {
        setAutomations(prev => prev.map(a => {
          if (a.id === targetFail.automationId) {
            return {
              ...a,
              successCount: a.successCount + 1,
              failCount: Math.max(0, a.failCount - 1)
            };
          }
          return a;
        }));
      }

      const log = `[${new Date().toLocaleTimeString()}] Case ${failId} manually overridden and successfully dispatched.`;
      setAuditLogs(prev => [log, ...prev]);
    }, 1200);
  };

  // Outage or Degraded indicator colors
  const getStatusColor = (status: 'Healthy' | 'Degraded' | 'Down') => {
    if (status === 'Healthy') return 'text-royalemerald bg-royalemerald/10 border-royalemerald/20';
    if (status === 'Degraded') return 'text-[#B8873D] bg-[#B8873D]/10 border-[#B8873D]/20';
    return 'text-error bg-error/10 border-error/20';
  };

  // Filter and Search log filters
  const filteredFailures = failures.filter(f => {
    const matchesSearch = f.recordId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.automationName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Stuck') return matchesSearch && f.status === 'Stuck Loop';
    if (filterStatus === 'Failed') return matchesSearch && f.status === 'Failed';
    return matchesSearch;
  });

  // Calculate dynamic overall metrics for ADD INSTRUCTION: "Show each time current % progress bar & total % progress bar"
  // Let's compute average current health (success rates out of total runs across all engines)
  const totalRunsAll = automations.reduce((acc, a) => acc + a.totalRuns, 0);
  const totalSuccessAll = automations.reduce((acc, a) => acc + a.successCount, 0);
  const currentSyncProgress = Math.round((totalSuccessAll / Math.max(1, totalRunsAll)) * 100);

  // For total 30d average uptime percentage
  const totalUptimePct = Math.round(
    automations.reduce((acc, a) => acc + a.uptime30d, 0) / automations.length
  );

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
          <Button variant="secondary" onClick={handlePollTelemetry} className="!py-2 !px-3 hover:scale-[1.02] flex items-center gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t.telemetryReset}
          </Button>
          <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold border border-royalemerald/20 px-2.5 py-1 rounded-lg">
            📡 TELEMETRY ACTIVE
          </span>
        </div>
      </div>

      {/* ADDITIONAL INSTRUCTION REQUIREMENT: Current % and Total % Progress Bars */}
      <Card className="p-5 overflow-hidden relative bg-white">
        <div className="absolute right-0 top-0 w-24 h-24 bg-antiquegold/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-royalemerald" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            AUTOMATION PIPELINE RELIABILITY INDEX
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Sync Progress (Success Rate % of Active Runs) */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {t.systemHealthIndex}
              </span>
              <span className="font-mono text-sm font-bold text-royalemerald">
                {currentSyncProgress}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3.5 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentSyncProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-royalemerald h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Total Uptime % Over 30 Days */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {t.processedTargets} (30d System Average)
              </span>
              <span className="font-mono text-sm font-bold text-antiquegold">
                {totalUptimePct}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3.5 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalUptimePct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-antiquegold h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* THIRDPARTY DEGRADED ALERT NOTICE */}
      <AnimatePresence>
        {automations.some(a => a.status === 'Degraded') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-[#B8873D]/10 border border-[#B8873D]/20 flex flex-col sm:flex-row items-start gap-3 justify-between"
          >
            <div className="flex gap-2.5 text-[#B8873D]">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">
                  {t.outageNotice}
                </h4>
                <p className="text-[11px] text-charcoal font-semibold mt-0.5 leading-relaxed">
                  {t.outageDesc}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs font-extrabold text-antiquegold hover:underline shrink-0 self-end sm:self-auto"
            >
              {showConfig ? 'Hide Prevention Sliders' : 'Prevent Loops Settings'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVENT LOOPS SETTINGS SLIDER */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-5 bg-[#FAF9F5] border-antiquegold/30 space-y-3">
              <div className="flex items-center gap-2 text-antiquegold">
                <Cpu className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                  {t.configTitle}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-charcoal">
                  <span>{t.maxRetryLabel}</span>
                  <span className="font-mono text-error bg-error/5 border border-error/10 px-2.5 py-0.5 rounded-lg">
                    {retryMaxLimit} Failures
                  </span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="10" 
                  value={retryMaxLimit}
                  onChange={(e) => setRetryMaxLimit(parseInt(e.target.value))}
                  className="w-full accent-error bg-alabaster h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-warmgray">
                  {t.maxRetryDesc}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SYSTEM PIPELINES STATUS BOARD */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
          {t.healthTitle}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((a) => {
            const Icon = a.icon;
            const successRate = Math.round((a.successCount / Math.max(1, a.totalRuns)) * 100);

            return (
              <Card key={a.id} className="p-5 bg-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                {/* Side Status Accent Line */}
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  a.status === 'Healthy' ? 'bg-royalemerald' : a.status === 'Degraded' ? 'bg-antiquegold' : 'bg-error'
                }`} />

                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="p-2 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                      <Icon className="w-5 h-5 text-antiquegold" />
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(a.status)}`}>
                      {a.status === 'Healthy' ? t.healthyText : a.status === 'Degraded' ? t.degradedText : t.downText}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-charcoal leading-tight">
                      {isDevanagari ? (language === 'hi' ? a.displayNameHi : a.displayNameMr) : a.displayNameEn}
                    </h4>
                    <p className="text-[10px] text-warmgray line-clamp-2 mt-1 leading-normal font-medium">
                      {a.description}
                    </p>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[rgba(184,135,61,0.08)] text-center">
                  <div>
                    <p className="text-[8px] text-warmgray font-bold tracking-wider uppercase">{t.uptime}</p>
                    <p className="text-xs font-mono font-bold text-charcoal">{a.uptime30d}%</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-warmgray font-bold tracking-wider uppercase">{t.successRate}</p>
                    <p className="text-xs font-mono font-bold text-royalemerald">{successRate}%</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-warmgray font-bold tracking-wider uppercase">Ops Run</p>
                    <p className="text-xs font-mono font-bold text-charcoal">{a.totalRuns}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* EXCEPTION QUEUE & RETRY ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CRITICAL EXCEPTION LOGS (Col span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
                {t.failureQueue}
              </h3>
              <p className="text-[10px] text-warmgray font-medium">
                {t.failuresSubtitle}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-alabaster p-1 rounded-xl border border-[rgba(184,135,61,0.08)] self-start sm:self-auto">
              {['All', 'Failed', 'Stuck'].map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => setFilterStatus(statusOption)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    filterStatus === statusOption 
                      ? 'bg-white text-antiquegold shadow-xs' 
                      : 'text-warmgray hover:text-charcoal'
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
            <input 
              type="text"
              placeholder={isDevanagari ? 'अपवाद खोजें...' : 'Search records, error reasons, pipelines...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs border border-[rgba(184,135,61,0.15)] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-warmgray hover:text-charcoal">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredFailures.length === 0 ? (
              <Card className="p-8 text-center text-warmgray border-dashed border-2 border-[rgba(184,135,61,0.15)] flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-royalemerald" />
                <p className="text-xs font-bold text-charcoal uppercase tracking-wide">
                  {t.emptyQueue}
                </p>
              </Card>
            ) : (
              filteredFailures.map((fail) => {
                const isSelected = selectedFailure?.id === fail.id;
                const isLoop = fail.status === 'Stuck Loop' || fail.retryCount >= retryMaxLimit;
                const isManualRunning = runningManualSteps[fail.id];

                return (
                  <Card 
                    key={fail.id}
                    onClick={() => setSelectedFailure(fail)}
                    className={`p-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                      isSelected 
                        ? 'border-antiquegold bg-[#FAF9F5] ring-1 ring-antiquegold/20' 
                        : 'hover:bg-alabaster'
                    }`}
                  >
                    {/* Stuck Loop Left Indicator */}
                    {isLoop && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-error" />
                    )}

                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[9px] font-bold text-warmgray">
                            {fail.id}
                          </span>
                          <span className="bg-[#B8873D]/10 text-antiquegold text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                            {fail.automationName}
                          </span>
                          {isLoop && (
                            <span className="bg-error/10 text-error text-[8px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              {t.loopPrevented}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-charcoal">
                          {t.record}: <span className="font-mono text-antiquegold">{fail.recordId}</span>
                        </h4>
                        <p className="text-[11px] text-charcoal font-medium leading-relaxed">
                          {fail.reason}
                        </p>
                      </div>

                      {/* Small Right Arrow */}
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold text-warmgray block">
                          {new Date(fail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <p className="text-[8px] text-warmgray uppercase font-bold tracking-wider mt-1">
                          RETRY: {fail.retryCount}
                        </p>
                      </div>
                    </div>

                    {/* Quick Inline CTA Buttons */}
                    <div className="mt-4 pt-3 border-t border-[rgba(184,135,61,0.08)] flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="secondary" 
                        disabled={isLoop || isManualRunning}
                        onClick={() => handleTriggerRetry(fail.id)}
                        className={`!py-1.5 !px-3 text-[10px] font-bold flex items-center gap-1.5 ${
                          isLoop ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <RotateCw className={`w-3 h-3 ${isManualRunning ? 'animate-spin' : ''}`} />
                        {t.retryBtn}
                      </Button>
                      <Button 
                        variant="primary" 
                        disabled={isManualRunning}
                        onClick={() => handleRunManually(fail.id)}
                        className="!py-1.5 !px-3 text-[10px] font-bold"
                      >
                        {t.manualBtn}
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION DETAILS & AUDIT TRAIL (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* DETAILED DRILLDOWN DRAWER IF SELECTED */}
          <AnimatePresence mode="wait">
            {selectedFailure ? (
              <motion.div
                key={selectedFailure.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-5 border-antiquegold bg-white space-y-4">
                  <div className="flex justify-between items-center border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
                      {t.detailsTitle}
                    </h3>
                    <button 
                      onClick={() => setSelectedFailure(null)} 
                      className="text-warmgray hover:text-charcoal p-1"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">EXCEPTION SOURCE</p>
                      <p className="font-serif font-bold text-charcoal text-sm mt-0.5">
                        {selectedFailure.automationName}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">REASON FOR SYSTEM INTERRUPT</p>
                      <p className="font-semibold text-charcoal bg-alabaster p-2.5 rounded-xl border border-[rgba(184,135,61,0.08)] leading-relaxed text-[11px] mt-1">
                        {selectedFailure.reason}
                      </p>
                    </div>

                    {selectedFailure.status === 'Stuck Loop' && (
                      <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[10px] font-bold flex gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{t.stuckLoopWarning}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2.5 bg-alabaster rounded-xl text-center">
                        <p className="text-[8px] text-warmgray font-bold">AUTOMATION ID</p>
                        <p className="font-mono font-bold text-charcoal truncate mt-0.5">{selectedFailure.automationId}</p>
                      </div>
                      <div className="p-2.5 bg-alabaster rounded-xl text-center">
                        <p className="text-[8px] text-warmgray font-bold">AFFECTED RECORD</p>
                        <p className="font-mono font-bold text-charcoal truncate mt-0.5">{selectedFailure.recordId}</p>
                      </div>
                    </div>

                    {/* Ascension Line - Stylized synchronization visualizer for retry progress */}
                    <div className="pt-2">
                      <p className="text-[9px] text-warmgray font-bold uppercase mb-2">TELEMETRY SYNC PROGRESS (ASCENSION LINE)</p>
                      <div className="relative pl-5 py-1">
                        {/* The continuous gold rail */}
                        <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-[#FAF9F5] border-l border-[rgba(184,135,61,0.2)]" />
                        
                        {/* Dynamic ascending progress line indicator */}
                        <motion.div 
                          className="absolute left-[7px] top-0 w-0.5 bg-antiquegold shadow-[0_0_8px_rgba(184,135,61,0.5)]"
                          initial={{ height: 0 }}
                          animate={{ height: selectedFailure.status === 'Resolved' ? '100%' : '50%' }}
                          transition={{ duration: 0.8 }}
                        />

                        {/* Milestones */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-2 text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full bg-royalemerald border-2 border-white flex items-center justify-center text-white shrink-0 z-10">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <div>
                              <p className="font-bold text-charcoal leading-none">Record Failure Capture</p>
                              <p className="text-[8px] text-warmgray mt-0.5">Caught by core try-catch block successfully.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-[10px]">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shrink-0 z-10 ${
                              selectedFailure.status === 'Resolved' ? 'bg-royalemerald text-white' : 'bg-antiquegold text-white'
                            }`}>
                              {selectedFailure.status === 'Resolved' ? <Check className="w-2.5 h-2.5" /> : <Activity className="w-2 h-2 animate-pulse" />}
                            </div>
                            <div>
                              <p className="font-bold text-charcoal leading-none">Pending Overrides or Action</p>
                              <p className="text-[8px] text-warmgray mt-0.5">Admin approval of cost sheets or manual inputs.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action button in drawer */}
                    <div className="pt-2 border-t border-[rgba(184,135,61,0.08)] flex gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => setSelectedFailure(null)}
                        className="w-full text-xs"
                      >
                        {t.closeDetails}
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={() => handleRunManually(selectedFailure.id)}
                        className="w-full text-xs"
                      >
                        {t.manualBtn}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* DYNAMIC EXCEPTION LOGS & AUDIT TRAILS */}
          <Card className="p-5 space-y-4 bg-white">
            <div className="flex items-center gap-1.5 text-charcoal border-b border-[rgba(184,135,61,0.08)] pb-2">
              <FileText className="w-4.5 h-4.5 text-antiquegold shrink-0" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono">
                {t.exceptionLogs}
              </h3>
            </div>

            <div className="bg-[#FAF9F5] border border-[rgba(184,135,61,0.1)] rounded-2xl p-4 font-mono text-[10px] text-charcoal space-y-2 max-h-[220px] overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-warmgray italic">No overrides initiated in this session. Logs will generate dynamically upon Admin resolution.</p>
              ) : (
                auditLogs.map((log, index) => (
                  <div key={index} className="border-b border-[rgba(184,135,61,0.05)] pb-1.5 last:border-0 last:pb-0">
                    <span className="text-antiquegold font-bold">INFO: </span>
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[rgba(184,135,61,0.08)] flex justify-between items-center text-[10px] text-warmgray">
              <span>SYSTEM: ALL INDIA ELEVATORS CO. v2.4</span>
              <a href="#alerts-dashboard" className="text-antiquegold hover:underline flex items-center gap-0.5">
                Alerts & Exceptions Dashboard <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};
