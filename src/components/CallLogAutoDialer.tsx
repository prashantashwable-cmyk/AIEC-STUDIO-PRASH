import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone, PhoneCall, PhoneForwarded, PhoneMissed, PhoneOff, Check, Play, Square, AlertCircle,
  Clock, Search, Filter, ShieldAlert, Volume2, VolumeX, Save, FileText, CheckCircle2,
  TrendingUp, AlertTriangle, RefreshCw, Smartphone, ChevronRight, User, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

// Translations
const localizations = {
  en: {
    title: "CRM Auto-Dialer & Call Logs",
    subtitle: "Accelerate outbound elevator lead engagement. Experience zero-friction dialer queues, instant disposition sync, and compliant session logging.",
    searchPlaceholder: "Search calls by prospect, site, or phone...",
    filterStatus: "Call Queue Status",
    allCalls: "All Lead Calls",
    scheduledOnly: "Scheduled Queue",
    completedOnly: "Completed Logs",
    dialerStatusActive: "Auto-Dialer Queue Active",
    dialerStatusPaused: "Dialer Queue Paused",
    dispositionTitle: "Post-Call Disposition",
    dispositionDesc: "Select an outcome to automatically advance the lead's CRM pipeline stage.",
    recordingsConsent: "Recording Authorized & Consented",
    noConsentWarning: "Call Recording Disabled: Customer consent not registered.",
    redialPrompt: "Auto-Redial Cooldown Active. Scheduled suggestion in progress.",
    pocketDialAlert: "Connected < 3 seconds? Mark as pocket-dial to ignore cooldown threshold.",
    unloggedWarning: "Warning: Disposition pending! Please log call outcome to resume dialer queue.",
    manualLogBtn: "Manual Call Entry",
    dialBtn: "Launch Call",
    durationLabel: "Duration",
    connectedInterested: "Connected - Interested 🟢",
    connectedNotInterested: "Connected - Not Interested 🟡",
    noAnswer: "No Answer 🔴",
    wrongNumber: "Wrong Number 🚨",
    pocketDialLabel: "Pocket Dial / Quick Drop",
    notesPlaceholder: "Enter conversation details, lift specification changes, site preparation notes...",
    recordingLabel: "Review Call Recording",
    reDialInSeconds: "Redial recommended in",
    totalProgressLabel: "Dialer Queue Clearance",
    currentProgressLabel: "Daily Sales Connect SLA",
    emptyQueue: "Call queue completed! Outstanding lead callback count is zero.",
    manualDialTitle: "Manual Dialer Bypass Mode",
    activeCallPanel: "Active Calling Matrix",
    offlineFallback: "Telecom Integration Offline (Manual Logging Enabled)",
    crmNudgeLabel: "Auto-advanced lead to stage",
    lastEdited: "Modified by Sales Desk on"
  },
  hi: {
    title: "सीआरएम ऑटो-डायलिर और कॉल लॉग्स",
    subtitle: "आउटबाउंड लिफ्ट लीड जुड़ाव को तेज करें। तत्काल स्थिति सिंक और अनुपालन सत्र लॉगिंग का अनुभव करें।",
    searchPlaceholder: "संभावित ग्राहक, साइट या फोन द्वारा खोजें...",
    filterStatus: "कॉल कतार स्थिति",
    allCalls: "सभी लीड कॉल",
    scheduledOnly: "शेड्यूल की गई कतार",
    completedOnly: "पूर्ण लॉग्स",
    dialerStatusActive: "ऑटो-डायलिर कतार सक्रिय",
    dialerStatusPaused: "ऑटो-डायलिर कतार रुकी हुई है",
    dispositionTitle: "कॉल के बाद की स्थिति",
    dispositionDesc: "लीड के सीआरएम पाइपलाइन चरण को स्वचालित रूप से आगे बढ़ाने के लिए एक परिणाम चुनें।",
    recordingsConsent: "रिकॉर्डिंग अधिकृत और सहमत",
    noConsentWarning: "कॉल रिकॉर्डिंग अक्षम: ग्राहक की सहमति दर्ज नहीं है।",
    redialPrompt: "ऑटो-रीडायल कूलडाउन सक्रिय। निर्धारित सुझाव प्रगति पर है।",
    pocketDialAlert: "कनेक्टेड < 3 सेकंड? कूलडाउन सीमा को अनदेखा करने के लिए पॉकेट-डायल के रूप में चिह्नित करें।",
    unloggedWarning: "चेतावनी: स्थिति लंबित! डायलिर कतार फिर से शुरू करने के लिए कॉल परिणाम लॉग करें।",
    manualLogBtn: "मैनुअल कॉल प्रविष्टि",
    dialBtn: "कॉल शुरू करें",
    durationLabel: "अवधि",
    connectedInterested: "कनेक्टेड - रुचि है 🟢",
    connectedNotInterested: "कनेक्टेड - रुचि नहीं है 🟡",
    noAnswer: "उत्तर नहीं मिला 🔴",
    wrongNumber: "गलत नंबर 🚨",
    pocketDialLabel: "पॉकेट डायल / त्वरित ड्रॉप",
    notesPlaceholder: "बातचीत का विवरण, लिफ्ट विनिर्देश परिवर्तन दर्ज करें...",
    recordingLabel: "कॉल रिकॉर्डिंग की समीक्षा करें",
    reDialInSeconds: "पुनः डायल करने की सिफारिश की गई है",
    totalProgressLabel: "डायलिर कतार निकासी",
    currentProgressLabel: "दैनिक बिक्री कनेक्ट एसएलए",
    emptyQueue: "कॉल कतार पूरी हो गई! उत्कृष्ट लीड कॉलबैक संख्या शून्य है।",
    manualDialTitle: "मैनुअल डायलर बाईपास मोड",
    activeCallPanel: "सक्रिय कॉलिंग मैट्रिक्स",
    offlineFallback: "दूरसंचार एकीकरण ऑफ़लाइन (मैनुअल लॉगिंग सक्षम)",
    crmNudgeLabel: "लीड को स्वचालित रूप से अगले चरण में भेजा गया",
    lastEdited: "सेल्स डेस्क द्वारा अंतिम बार संशोधित"
  },
  mr: {
    title: "सीआरएम ऑटो-डायल आणि कॉल लॉग्स",
    subtitle: "आउटबाउंड लिफ्ट लीड संपर्क वेगवान करा. तात्काळ स्थिती सिंक आणि अनुपालन कॉल लॉगिंगचा अनुभव घ्या.",
    searchPlaceholder: "संभाव्य ग्राहक, साईट किंवा फोनद्वारे शोधा...",
    filterStatus: "कॉल रांगेची स्थिती",
    allCalls: "सर्व लीड कॉल्स",
    scheduledOnly: "नियोजित कॉल्स रांग",
    completedOnly: "पूर्ण झालेले कॉल्स",
    dialerStatusActive: "ऑटो-डायलर रांग सक्रिय",
    dialerStatusPaused: "ऑटो-डायलर रांग थांबली आहे",
    dispositionTitle: "कॉल नंतरची प्रक्रिया (Disposition)",
    dispositionDesc: "लीडचा सीआरएम स्टेज स्वयंचलितपणे बदलण्यासाठी योग्य पर्याय निवडा.",
    recordingsConsent: "रेकॉर्डिंगसाठी ग्राहकाची सहमती मंजूर",
    noConsentWarning: "कॉल रेकॉर्डिंग बंद: ग्राहकाची सहमती मिळालेली नाही.",
    redialPrompt: "ऑटो-रीडायल कूलडाउन सुरू. निर्धारित सुचवलेला वेळ प्रगतीपथावर आहे.",
    pocketDialAlert: "कॉल < ३ सेकंदात कट झाला? कूलडाउन मर्यादा टाळण्यासाठी पॉकेट-डायल म्हणून नोंदवा.",
    unloggedWarning: "चेतावणी: कॉलची निष्पत्ती नोंदवणे बाकी आहे! डायल सुरू ठेवण्यासाठी आधी ही नोंद पूर्ण करा.",
    manualLogBtn: "मॅन्युअल कॉल नोंद",
    dialBtn: "कॉल सुरू करा",
    durationLabel: "कालावधी",
    connectedInterested: "कनेक्टेड - इच्छुक आहेत 🟢",
    connectedNotInterested: "कनेक्टेड - इच्छुक नाहीत 🟡",
    noAnswer: "उत्तर नाही 🔴",
    wrongNumber: "चुकीचा नंबर 🚨",
    pocketDialLabel: "पॉकेट डायल / क्विक ड्रॉप",
    notesPlaceholder: "संभाषणाचा तपशील, लिफ्ट स्पेसिफिकेशन्स बदल किंवा साईटची पूर्वतयारी नोंदवा...",
    recordingLabel: "कॉल रेकॉर्डिंगचे पुनरावलोकन करा",
    reDialInSeconds: "पुनः डायल करण्याची शिफारस",
    totalProgressLabel: "डायलर रांग साफ करणे",
    currentProgressLabel: "दैनिक विक्री कनेक्ट एसएलए",
    emptyQueue: "कॉल रांग पूर्ण झाली! उर्वरित कॉलबॅक संख्या शून्य आहे.",
    manualDialTitle: "मॅन्युअल डायलर बायपास मोड",
    activeCallPanel: "सक्रिय कॉलिंग मॅट्रिक्स",
    offlineFallback: "टेलिकॉम नेटवर्क ऑफलाइन (मॅन्युअल नोंद सुरू)",
    crmNudgeLabel: "लीडला स्वयंचलितपणे पुढील टप्प्यात पाठवले",
    lastEdited: "विक्री डेस्कद्वारे सुधारित"
  }
};

interface CallRecord {
  id: string;
  leadName: string;
  buildingName: string;
  phone: string;
  status: 'scheduled' | 'completed' | 'no-answer';
  timestamp: string;
  duration?: string; // e.g. "02:15"
  outcome?: string; // disposition outcome
  consentApproved: boolean;
  notes?: string;
  recordingUrl?: string;
  redialAfter?: string; // timestamp for redial recommendation
  attemptsCount: number;
}

const INITIAL_CALLS: CallRecord[] = [
  {
    id: "call_001",
    leadName: "Prashant Vasant Wable",
    buildingName: "Wable Arcade, Hadapsar",
    phone: "+91 98230 11234",
    status: "scheduled",
    timestamp: "Today, 11:30 AM",
    consentApproved: true,
    attemptsCount: 1
  },
  {
    id: "call_002",
    leadName: "Nilesh Kakade",
    buildingName: "Kakade Warehouse, Pune",
    phone: "+91 91580 88223",
    status: "completed",
    timestamp: "Today, 10:15 AM",
    duration: "02:45",
    outcome: "Connected - Interested",
    consentApproved: true,
    notes: "Client requested quotation for 10-Passenger heavy freight elevator with automatic doors.",
    recordingUrl: "https://example.com/audio/rec_002.mp3",
    attemptsCount: 1
  },
  {
    id: "call_003",
    leadName: "Sanjay Deshmukh",
    buildingName: "Deshmukh Bunglow, Kothrud",
    phone: "+91 97300 44991",
    status: "no-answer",
    timestamp: "Today, 09:30 AM",
    consentApproved: false,
    attemptsCount: 2,
    redialAfter: "In 15 Minutes"
  },
  {
    id: "call_004",
    leadName: "Rajendra Patil",
    buildingName: "Patil Residency, Pune",
    phone: "+91 88880 12345",
    status: "scheduled",
    timestamp: "Today, 02:00 PM",
    consentApproved: true,
    attemptsCount: 0
  },
  {
    id: "call_005",
    leadName: "Anil Shinde",
    buildingName: "Shinde Plaza, Satara Road",
    phone: "+91 77770 98765",
    status: "completed",
    timestamp: "Yesterday, 04:30 PM",
    duration: "01:12",
    outcome: "Connected - Not Interested",
    consentApproved: false,
    notes: "Budget exceeded client expectation for home elevator model.",
    attemptsCount: 1
  }
];

export const CallLogAutoDialer: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const t = localizations[language] || localizations.en;

  // Real-time state store
  const [calls, setCalls] = useState<CallRecord[]>(() => {
    const saved = localStorage.getItem('aiec_crm_calls');
    return saved ? JSON.parse(saved) : INITIAL_CALLS;
  });

  // Dialer Control States
  const [selectedCallId, setSelectedCallId] = useState<string>("call_001");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialingActive, setIsDialingActive] = useState<boolean>(false);
  const [dialingSeconds, setDialingSeconds] = useState<number>(0);
  const [isTelecomOnline, setIsTelecomOnline] = useState<boolean>(true);

  // Active workspace inputs
  const [disposition, setDisposition] = useState<string>("");
  const [callNotes, setCallNotes] = useState<string>("");
  const [isPocketDial, setIsPocketDial] = useState<boolean>(false);
  const [isRecordingMuted, setIsRecordingMuted] = useState<boolean>(false);

  // Alerts
  const [alertText, setAlertText] = useState<string>("");
  const [pendingDispositionWarning, setPendingDispositionWarning] = useState<boolean>(false);

  // Find active call record
  const activeCall = useMemo(() => {
    return calls.find(c => c.id === selectedCallId);
  }, [calls, selectedCallId]);

  // Timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDialingActive) {
      interval = setInterval(() => {
        setDialingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setDialingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isDialingActive]);

  const formattedDialTime = useMemo(() => {
    const mins = Math.floor(dialingSeconds / 60).toString().padStart(2, '0');
    const secs = (dialingSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [dialingSeconds]);

  // SLA calculations for Daily progress bars (Guidelines requirement)
  const completedCallsToday = useMemo(() => {
    return calls.filter(c => c.status === 'completed').length;
  }, [calls]);

  const totalCallsInQueue = calls.length;
  const queuePercentage = Math.round((completedCallsToday / totalCallsInQueue) * 100);

  const salesSlaPercentage = useMemo(() => {
    const connectedOrAttempted = calls.filter(c => c.attemptsCount > 0).length;
    return Math.min(Math.round((connectedOrAttempted / totalCallsInQueue) * 100), 100);
  }, [calls, totalCallsInQueue]);

  const triggerToast = (msg: string) => {
    setAlertText(msg);
    setTimeout(() => setAlertText(''), 4000);
  };

  // Launch simulated phone call
  const handleLaunchCall = () => {
    if (!activeCall) return;
    
    // Stop agent if telecom offline
    if (!isTelecomOnline) {
      triggerToast("Triggered Manual Offline Log bypass. Call dialed via physical handset.");
      setIsDialingActive(true);
      return;
    }

    setIsDialingActive(true);
    setDisposition("");
    setCallNotes("");
    setIsPocketDial(false);
    setPendingDispositionWarning(false);
    triggerToast(`Dialing ${activeCall.leadName} (${activeCall.phone})...`);
  };

  // End active simulated call
  const handleHangUp = () => {
    setIsDialingActive(false);
    setPendingDispositionWarning(true);
    triggerToast("Call disconnected. Outcome disposition selection mandatory to resume queue.");
  };

  // Submit and save disposition outcome (Auto-advancing CRM stage logic)
  const handleSaveCallLog = () => {
    if (!activeCall || !disposition) {
      triggerToast("Outcome selection required!");
      return;
    }

    const durationValue = dialingSeconds > 0 ? formattedDialTime : "00:45";

    // CRM stage auto nudge outcomes
    let crmNudge = "";
    if (disposition === 'Connected - Interested') {
      crmNudge = "advanced to Negotiation Stage (Quotation Draft Scheduled)";
    } else if (disposition === 'Connected - Not Interested') {
      crmNudge = "moved to Lost Leads status (Cool-down filter enabled)";
    } else if (disposition === 'No Answer') {
      crmNudge = "No Answer. Auto-redial scheduling active.";
    }

    const updatedCalls = calls.map(c => {
      if (c.id === selectedCallId) {
        const nextAttempts = c.attemptsCount + 1;
        
        let finalStatus: 'completed' | 'no-answer' | 'scheduled' = 'completed';
        let recommendedRedial = undefined;

        if (disposition === 'No Answer') {
          finalStatus = 'no-answer';
          recommendedRedial = isPocketDial ? "In 5 Minutes" : "In 45 Minutes";
        }

        return {
          ...c,
          status: finalStatus,
          duration: durationValue,
          outcome: disposition,
          notes: callNotes,
          attemptsCount: nextAttempts,
          redialAfter: recommendedRedial,
          recordingUrl: c.consentApproved && !isRecordingMuted ? "https://example.com/audio/rec_live.mp3" : undefined
        };
      }
      return c;
    });

    setCalls(updatedCalls);
    localStorage.setItem('aiec_crm_calls', JSON.stringify(updatedCalls));
    
    setPendingDispositionWarning(false);
    setDisposition("");
    setCallNotes("");
    
    const message = crmNudge ? `Call Logged! Lead ${crmNudge}` : "Call details persisted successfully.";
    triggerToast(message);
  };

  // Quick Action: Swipe / Single tap to trigger manual override
  const triggerManualDialLog = (id: string) => {
    setSelectedCallId(id);
    const target = calls.find(c => c.id === id);
    if (target) {
      setDisposition("Connected - Interested");
      setCallNotes("Manual bypass entry recorded without auto-dialer telecom routing.");
      
      const updated = calls.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'completed' as const,
            duration: "01:00",
            outcome: "Connected - Interested",
            notes: "Manual bypass entry recorded without auto-dialer telecom routing.",
            attemptsCount: c.attemptsCount + 1
          };
        }
        return c;
      });

      setCalls(updated);
      localStorage.setItem('aiec_crm_calls', JSON.stringify(updated));
      triggerToast(`Bypass log written for ${target.leadName}. CRM advanced.`);
    }
  };

  // Match search parameters
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const matchesSearch = searchQuery === '' ||
        c.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);

      let matchesStatus = true;
      if (statusFilter === 'scheduled') {
        matchesStatus = c.status === 'scheduled';
      } else if (statusFilter === 'completed') {
        matchesStatus = c.status === 'completed';
      }

      return matchesSearch && matchesStatus;
    });
  }, [calls, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* SECTION HEADER & DYNAMIC METRIC PROGRESS BARS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            CRM COMMUNICATIONS ENGINE • MODULE 6
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic progress bar requested by guidelines */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>{t.totalProgressLabel}: {queuePercentage}%</span>
            <span>{completedCallsToday}/{totalCallsInQueue} Completed</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full transition-all duration-300"
              style={{ width: `${queuePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* SLA AND NETWORK FALLBACK CONFIGURATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ACTIVE RESPONSE SLA PROGRESS */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-royalemerald" />
              <span>{t.currentProgressLabel}</span>
            </span>
            <span>{salesSlaPercentage}% Engaged</span>
          </div>
          <div className="w-full h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full transition-all duration-300"
              style={{ width: `${salesSlaPercentage}%` }}
            />
          </div>
        </div>

        {/* TELEMETRY TELECOM ONLINE INTERCEPTOR */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${isTelecomOnline ? 'bg-royalemerald animate-pulse' : 'bg-amber-600'}`} />
            <div>
              <span className="block text-[10px] font-mono font-black text-charcoal uppercase">
                {isTelecomOnline ? "CLOUD TELEPHONY SYSTEM ONLINE" : t.offlineFallback}
              </span>
              <span className="block text-[9px] text-warmgray font-semibold">
                {isTelecomOnline ? "Direct Twilio/Exotel WebRTC Channel Active" : "Bypass active. Click launches native physical dialer"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsTelecomOnline(!isTelecomOnline)}
            className="px-3 py-1 bg-alabaster hover:bg-[#edeae2] border border-[#e5dfd4] rounded-lg text-[9px] font-mono font-bold text-charcoal"
          >
            Switch Mode
          </button>
        </div>

      </div>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {alertText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{alertText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MANIFEST AND DIRECTORY INTERACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COMPONENT: QUEUE AND LOGS ROW PATTERNS (5 SPAN) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs uppercase font-mono font-black text-charcoal tracking-wider">
              Call Dispatch Pipeline ({filteredCalls.length})
            </span>
            <span className="text-[10px] font-mono font-bold text-warmgray">Ascension Queue</span>
          </div>

          {/* SEARCH FILTERS */}
          <Card className="p-3 bg-white border border-[#e5dfd4]/40 space-y-3 shadow-2xs">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-alabaster border border-[#e5dfd4] rounded-lg text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-antiquegold shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-alabaster border border-[#e5dfd4] rounded-lg py-1 px-2 text-[11px] font-bold text-charcoal focus:outline-none"
              >
                <option value="all">📞 {t.allCalls}</option>
                <option value="scheduled">⏳ {t.scheduledOnly}</option>
                <option value="completed">✓ {t.completedOnly}</option>
              </select>
            </div>
          </Card>

          {/* LIST PATTERN CONTAINER */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredCalls.length === 0 ? (
              <Card className="p-10 text-center space-y-3 bg-white">
                <HelpCircle className="w-8 h-8 text-warmgray mx-auto" />
                <p className="text-xs text-warmgray font-bold">{t.emptyQueue}</p>
              </Card>
            ) : (
              filteredCalls.map((call) => {
                const isSelected = call.id === selectedCallId;
                
                // Outcomes styling options
                let outcomeColor = "bg-blue-50 text-blue-700 border-blue-100";
                if (call.status === 'no-answer') {
                  outcomeColor = "bg-amber-50 text-amber-700 border-amber-100";
                } else if (call.status === 'completed') {
                  outcomeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                }

                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-white relative ${
                      isSelected
                        ? 'border-antiquegold ring-2 ring-antiquegold/10 shadow-xs translate-x-1'
                        : 'border-[#e5dfd4]/40 hover:border-warmgray hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif text-sm font-black text-charcoal truncate max-w-[160px]">
                            {call.leadName}
                          </h4>
                          {call.attemptsCount > 1 && (
                            <span className="text-[9px] font-mono font-black bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 shrink-0">
                              RETRY #{call.attemptsCount}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-antiquegold font-mono truncate">
                          🏢 {call.buildingName}
                        </p>
                        
                        <span className="block text-[10px] text-warmgray font-semibold">
                          📱 {call.phone}
                        </span>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <Badge className={`text-[9px] font-mono px-2 py-0.5 font-bold uppercase rounded-full ${outcomeColor}`}>
                          {call.status === 'scheduled' ? "SCHEDULED" : call.outcome || "NO ANSWER"}
                        </Badge>
                        <span className="text-[9px] font-mono text-warmgray">{call.timestamp}</span>
                      </div>
                    </div>

                    {/* Quick Swipe/Touch Auto-log shortcut */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e5dfd4]/30 text-[9px] font-mono text-warmgray">
                      <span>Consent: {call.consentApproved ? "✓ Authorized" : "✕ Blocked"}</span>
                      {call.status === 'scheduled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerManualDialLog(call.id);
                          }}
                          className="text-royalemerald font-bold hover:underline flex items-center gap-0.5"
                        >
                          Manual Bypass Log ⚡
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SIGNIFICANT BRAND MOTIF: THE VERTICAL ASCENSION LINE */}
          <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/40 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="w-1.5 bg-antiquegold h-16 rounded-full shrink-0 relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-royalemerald ring-2 ring-white" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-black text-antiquegold uppercase tracking-widest">
                  Compliance & Dialing Safeties
                </span>
                <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
                  Post-call outcomes feed directly back into CRM pipelines. No answer events trigger recommended redial intervals, protecting lead retention.
                </p>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT PANEL: TELEPHONE WORKSPACE & ACTIVE INTERACTION PAD (7 SPAN) */}
        <div className="lg:col-span-7 space-y-6">
          {!activeCall ? (
            <Card className="p-16 text-center space-y-4 bg-white border border-[#e5dfd4]/40 shadow-xs">
              <Phone className="w-12 h-12 text-antiquegold mx-auto stroke-1" />
              <h3 className="font-serif text-lg font-bold text-charcoal">Select Call from Pipeline</h3>
            </Card>
          ) : (
            <div className="space-y-6">
              
              {/* ACTIVE DIAL PANEL */}
              <Card className="p-6 bg-white border border-[rgba(184,135,61,0.15)] shadow-xs relative overflow-hidden space-y-6">
                
                {/* Visual Elevator indicator (Vertical line segment behind active panel) */}
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-antiquegold/10 pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e5dfd4]/40 pb-4 gap-4 relative">
                  <div>
                    <span className="text-[9px] uppercase font-mono font-black text-royalemerald bg-royalemerald/10 px-2 py-0.5 rounded">
                      {activeCall.status.toUpperCase()} QUEUE MEMBER
                    </span>
                    <h3 className="font-serif text-lg font-black text-charcoal mt-1">
                      {activeCall.leadName}
                    </h3>
                    <p className="text-xs text-antiquegold font-mono mt-0.5">
                      🏢 SITE: {activeCall.buildingName}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-charcoal font-mono">{activeCall.phone}</span>
                    <span className="text-[9px] text-warmgray font-mono">Attempts: {activeCall.attemptsCount}</span>
                  </div>
                </div>

                {/* CALL CONNECTIVITY GRAPHIC AND PLAYGROUND BUTTONS */}
                <div className="bg-alabaster/60 p-6 rounded-2xl border border-[#e5dfd4] flex flex-col items-center justify-center text-center space-y-4 relative">
                  
                  {isDialingActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-16 h-16 rounded-full bg-royalemerald text-white flex items-center justify-center shadow-md"
                    >
                      <Volume2 className="w-8 h-8 animate-pulse" />
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-alabaster text-antiquegold border border-antiquegold flex items-center justify-center">
                      <PhoneCall className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="block text-xl font-mono font-black text-charcoal tracking-tight">
                      {isDialingActive ? formattedDialTime : "00:00"}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-warmgray uppercase">
                      {isDialingActive ? "CLOUD CHANNELS LINKED • RECORDING ACTIVE" : "DISCONNECTED • IDLE"}
                    </span>
                  </div>

                  {/* Primary Trigger Actions */}
                  <div className="flex gap-4 pt-2">
                    {!isDialingActive ? (
                      <Button
                        onClick={handleLaunchCall}
                        variant="primary"
                        className="py-2.5 px-6 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{t.dialBtn}</span>
                      </Button>
                    ) : (
                      <button
                        onClick={handleHangUp}
                        className="py-2.5 px-6 font-bold uppercase tracking-wider text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all flex items-center gap-2 shadow"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>Hang Up Call</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* POST-CALL DISPOSITION EDITOR (MANDATORY REQUIREMENT) */}
                {pendingDispositionWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs text-amber-800 font-bold">
                      <AlertTriangle className="w-4 h-4 text-[#B8873D]" />
                      <span>{t.unloggedWarning}</span>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4 pt-4 border-t border-[#e5dfd4]/40">
                  <div>
                    <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-antiquegold" />
                      <span>{t.dispositionTitle}</span>
                    </h4>
                    <p className="text-[10px] text-warmgray font-semibold mt-0.5">{t.dispositionDesc}</p>
                  </div>

                  {/* Options layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setDisposition("Connected - Interested")}
                      className={`p-3 rounded-xl border text-xs font-black transition-all text-left ${
                        disposition === 'Connected - Interested'
                          ? 'bg-emerald-50 border-royalemerald text-emerald-800 ring-1 ring-royalemerald/20'
                          : 'bg-white border-[#e5dfd4] hover:border-warmgray'
                      }`}
                    >
                      {t.connectedInterested}
                    </button>

                    <button
                      onClick={() => setDisposition("Connected - Not Interested")}
                      className={`p-3 rounded-xl border text-xs font-black transition-all text-left ${
                        disposition === 'Connected - Not Interested'
                          ? 'bg-amber-50 border-antiquegold text-amber-800 ring-1 ring-antiquegold/20'
                          : 'bg-white border-[#e5dfd4] hover:border-warmgray'
                      }`}
                    >
                      {t.connectedNotInterested}
                    </button>

                    <button
                      onClick={() => setDisposition("No Answer")}
                      className={`p-3 rounded-xl border text-xs font-black transition-all text-left ${
                        disposition === 'No Answer'
                          ? 'bg-red-50 border-red-300 text-red-800 ring-1 ring-red-50/20'
                          : 'bg-white border-[#e5dfd4] hover:border-warmgray'
                      }`}
                    >
                      {t.noAnswer}
                    </button>

                    <button
                      onClick={() => setDisposition("Wrong Number")}
                      className={`p-3 rounded-xl border text-xs font-black transition-all text-left ${
                        disposition === 'Wrong Number'
                          ? 'bg-neutral-50 border-neutral-400 text-neutral-800'
                          : 'bg-white border-[#e5dfd4] hover:border-warmgray'
                      }`}
                    >
                      {t.wrongNumber}
                    </button>
                  </div>

                  {/* Cooldown Pocket Dial checkbox */}
                  {disposition === 'No Answer' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-2 bg-alabaster rounded-xl border border-[#e5dfd4] text-[10px] text-charcoal font-bold"
                    >
                      <input
                        type="checkbox"
                        id="pocketDial"
                        checked={isPocketDial}
                        onChange={(e) => setIsPocketDial(e.target.checked)}
                        className="w-3.5 h-3.5 text-antiquegold border-[#e5dfd4] rounded"
                      />
                      <label htmlFor="pocketDial" className="cursor-pointer">
                        {t.pocketDialLabel} • connected &lt; 3s? Bypass standard cooldown.
                      </label>
                    </motion.div>
                  )}

                  {/* NOTES AND FALLBACK WRITER */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">Conversation Notes</label>
                    <textarea
                      rows={3}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="w-full p-3 border border-[#e5dfd4] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-antiquegold"
                      placeholder={t.notesPlaceholder}
                    />
                  </div>

                  {/* RECORDING CONSENT SECURITY TOGGLE */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-alabaster/40 p-3.5 rounded-2xl border border-[#e5dfd4]/60">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-royalemerald shrink-0" />
                      <div>
                        <span className="block text-[10px] font-bold text-charcoal">
                          {activeCall.consentApproved ? t.recordingsConsent : t.noConsentWarning}
                        </span>
                        <span className="block text-[8px] uppercase font-mono font-black text-warmgray">
                          GDPR & DOT Call Center Guidelines Enabled
                        </span>
                      </div>
                    </div>

                    {activeCall.consentApproved && (
                      <button
                        onClick={() => setIsRecordingMuted(!isRecordingMuted)}
                        className={`px-3 py-1 text-[9px] font-mono font-black rounded-lg border transition-all ${
                          isRecordingMuted 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isRecordingMuted ? "🔇 Recording Paused" : "🎙️ Recording Active"}
                      </button>
                    )}
                  </div>

                  {/* SAVE LOG ACTION */}
                  <div className="pt-2 text-right">
                    <Button
                      onClick={handleSaveCallLog}
                      variant="outline"
                      className="py-2.5 px-6 font-bold uppercase tracking-widest text-[10px] border-royalemerald text-royalemerald hover:bg-royalemerald/5"
                    >
                      <Save className="w-4 h-4 mr-1.5" /> Save Call Dispatch Details
                    </Button>
                  </div>

                </div>

              </Card>

              {/* OUTCOMES TIMELINE LOG PREVIEW */}
              {activeCall.recordingUrl && (
                <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/60 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-antiquegold" />
                    <div>
                      <span className="block text-[10px] font-bold text-charcoal">{t.recordingLabel}</span>
                      <span className="block text-[8px] uppercase font-mono font-black text-warmgray">
                        QC Safety Audit Code: REC_{activeCall.id.toUpperCase()} • {activeCall.duration || "01:00"} mins
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => triggerToast("Simulated play of historical recording.")}
                    variant="outline"
                    className="py-1 px-3 text-[10px] font-bold"
                  >
                    Listen Stream
                  </Button>
                </Card>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
