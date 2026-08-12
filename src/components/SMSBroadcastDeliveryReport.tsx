import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Calendar, Users, ShieldCheck, DollarSign, Clock, AlertTriangle, CheckCircle,
  HelpCircle, Trash2, Ban, RefreshCw, BarChart2, MessageSquare, AlertCircle, ChevronRight,
  Sparkles, Smartphone, Shield, ArrowUpRight, ArrowDownRight, Info, BookOpen, Search
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

// Translations
const localizations = {
  en: {
    title: "SMS Broadcast & Delivery Engine",
    subtitle: "Launch bulk compliance-checked notifications, greetings, or campaign alerts. Estimate costs transparently and view live TRAI carrier delivery reports.",
    searchPlaceholder: "Search past broadcasts...",
    tabNew: "Compose Broadcast",
    tabHistory: "Broadcast Logs & Analytics",
    currentProgressLabel: "Campaign Composition Progress",
    totalProgressLabel: "Total Regional Blast Coverage",
    recipientCountLabel: "Eligible Contacts (Excluding DND/Opt-Out)",
    costEstimateLabel: "Calculated Cost (TRAI Premium Rate)",
    traiDndWarning: "TRAI Compliance: Promotional SMS strictly prohibited between 9:00 PM and 9:00 AM. Please schedule accordingly.",
    largeSendWarning: "Extreme Volume Warning: Selected segment exceeds 500 contacts. Multiple-approval safeguard recommended.",
    messageBodyLabel: "SMS Text Body (GSM 7-bit, 160 chars limit per unit)",
    charactersRemaining: "chars remaining",
    smsUnitsCount: "SMS Units",
    segmentFilterTitle: "Intelligent Segment Builder",
    selectStage: "Filter by CRM Stage",
    selectTerritory: "Filter by Territory",
    selectSource: "Filter by Lead Source",
    allOption: "All (No Filter)",
    scheduleLabel: "Dispatch Schedule Time",
    sendImmediate: "Dispatch Instantly",
    scheduleLater: "Schedule Future Window",
    scheduleTimeLabel: "Specify Date & Time",
    btnConfirmSend: "Authorize and Queue Broadcast",
    btnCancelBroadcast: "Cancel Pending Dispatch",
    successMsg: "Broadcast successfully validated, cost authorized, and queued in the TRAI dispatcher.",
    cancelSuccessMsg: "Scheduled broadcast successfully aborted. Funds returned to credit balance.",
    invalidDndExcluded: "DND-registered numbers automatically filtered out to ensure compliance.",
    rateLimitAlert: "Daily broadcast ceiling: 12,450/15,000 sent.",
    emptyBroadcasts: "No historical bulk broadcasts found.",
    deliveredCount: "Delivered Successfully",
    pendingCount: "Awaiting Carrier DLR",
    failedCount: "Failed / Blocked",
    carrierBlockReason: "Carrier block (DND active)",
    invalidNumberReason: "Invalid subscriber routing",
    unsubscribedReason: "User opted-out (STOP received)",
    pullToRefresh: "Pull to Refresh Logs",
    skeletonLoading: "Refreshing TRAI Carrier Status Logs...",
    costDisclaimer: "Billed at ₹0.18 per standard domestic unit."
  },
  hi: {
    title: "एसएमएस प्रसारण और वितरण इंजन",
    subtitle: "थोक अनुपालन-जांच अधिसूचनाएं, शुभकामनाएं या अभियान अलर्ट शुरू करें। पारदर्शी रूप से लागत का अनुमान लगाएं और लाइव टीआरएआई वाहक वितरण रिपोर्ट देखें।",
    searchPlaceholder: "पुराने प्रसारण खोजें...",
    tabNew: "नया संदेश लिखें",
    tabHistory: "प्रसारण लॉग और विश्लेषण",
    currentProgressLabel: "अभियान रचना प्रगति",
    totalProgressLabel: "कुल क्षेत्रीय संदेश कवरेज",
    recipientCountLabel: "योग्य संपर्क (DND/ऑप्ट-आउट को छोड़कर)",
    costEstimateLabel: "अनुमानित लागत (TRAI प्रीमियम दर)",
    traiDndWarning: "TRAI अनुपालन: रात 9:00 बजे से सुबह 9:00 बजे के बीच प्रचारक एसएमएस कड़ाई से प्रतिबंधित हैं। तदनुसार शेड्यूल करें।",
    largeSendWarning: "अत्यधिक वॉल्यूम चेतावनी: चयनित सेगमेंट 500 संपर्कों से अधिक है। बहु-अनुमोदन सुरक्षा उपाय की सिफारिश की जाती है।",
    messageBodyLabel: "एसएमएस टेक्स्ट बॉडी (जीएसएम 7-बिट, प्रति इकाई 160 वर्ण सीमा)",
    charactersRemaining: "वर्ण शेष",
    smsUnitsCount: "एसएमएस इकाइयां",
    segmentFilterTitle: "बुद्धिमान सेगमेंट बिल्डर",
    selectStage: "CRM चरण द्वारा फ़िल्टर करें",
    selectTerritory: "क्षेत्र द्वारा फ़िल्टर करें",
    selectSource: "लीड स्रोत द्वारा फ़िल्टर करें",
    allOption: "सभी (कोई फ़िल्टर नहीं)",
    scheduleLabel: "भेजने का समय",
    sendImmediate: "तुरंत भेजें",
    scheduleLater: "भविष्य के लिए शेड्यूल करें",
    scheduleTimeLabel: "दिनांक और समय निर्दिष्ट करें",
    btnConfirmSend: "प्रसारण अधिकृत करें और कतारबद्ध करें",
    btnCancelBroadcast: "लंबित प्रेषण रद्द करें",
    successMsg: "प्रसारण सफलतापूर्वक सत्यापित, लागत अधिकृत, और टीआरएआई डिस्पैचर में कतारबद्ध।",
    cancelSuccessMsg: "निर्धारित प्रसारण सफलतापूर्वक निरस्त कर दिया गया। फंड क्रेडिट बैलेंस में वापस कर दिया गया।",
    invalidDndExcluded: "अनुपालन सुनिश्चित करने के लिए डीएनडी-पंजीकृत नंबर स्वचालित रूप से हटा दिए गए।",
    rateLimitAlert: "दैनिक सीमा: 12,450/15,000 भेजे गए।",
    emptyBroadcasts: "कोई पिछला थोक प्रसारण नहीं मिला।",
    deliveredCount: "सफलतापूर्वक वितरित",
    pendingCount: "वाहक उत्तर की प्रतीक्षा",
    failedCount: "विफल / अवरुद्ध",
    carrierBlockReason: "कैरियर ब्लॉक (डीएनडी सक्रिय)",
    invalidNumberReason: "अमान्य ग्राहक रूटिंग",
    unsubscribedReason: "उपयोगकर्ता ने ऑप्ट-आउट किया (STOP प्राप्त)",
    pullToRefresh: "लॉग रिफ्रेश करने के लिए खींचे",
    skeletonLoading: "कैरियर लॉग रीफ्रेश हो रहे हैं...",
    costDisclaimer: "मानक घरेलू प्रति इकाई ₹0.18 पर बिल किया गया।"
  },
  mr: {
    title: "एसएमएस ब्रॉडकास्ट आणि डिलिव्हरी इंजिन",
    subtitle: "थोक अनुपालन-तपासणी अधिसूचना, शुभेच्छा किंवा मोहीम अलर्ट पाठवा. पारदर्शकपणे खर्चाचा अंदाज घ्या आणि थेट टीआरएआय डिलिव्हरी रिपोर्ट्स पहा.",
    searchPlaceholder: "मागील ब्रॉडकास्ट शोधा...",
    tabNew: "नवीन मेसेज लिहा",
    tabHistory: "ब्रॉडकास्ट लॉग आणि विश्लेषण",
    currentProgressLabel: "मोहीम रचना प्रगती",
    totalProgressLabel: "एकूण प्रादेशिक संदेश कव्हरेज",
    recipientCountLabel: "पात्र संपर्क (DND/ऑप्ट-आऊट वगळून)",
    costEstimateLabel: "अंदाजित खर्च (TRAI प्रीमियम दर)",
    traiDndWarning: "TRAI अनुपालन: रात्री ९:०० ते सकाळी ९:०० या वेळेत जाहिरात एसएमएस पाठवण्यास सक्त मनाई आहे. त्यानुसार नियोजन करा.",
    largeSendWarning: "अति-मोठी संख्या चेतावणी: निवडलेला गट ५०० संपर्कांपेक्षा जास्त आहे. दोन-स्तरीय मंजुरीची शिफारस केली जाते.",
    messageBodyLabel: "एसएमएस मजकूर (GSM 7-बिट, प्रति युनिट १६० वर्ण मर्यादा)",
    charactersRemaining: "वर्ण शिल्लक",
    smsUnitsCount: "एसएमएस युनिट्स",
    segmentFilterTitle: "इंटेलिजेंट सेगमेंट बिल्डर",
    selectStage: "CRM टप्प्यानुसार फिल्टर",
    selectTerritory: "प्रदेशानुसार फिल्टर",
    selectSource: "लीड स्त्रोतानुसार फिल्टर",
    allOption: "सर्व (फिल्टर नाही)",
    scheduleLabel: "पाठवण्याची नियोजित वेळ",
    sendImmediate: "त्वरित पाठवा",
    scheduleLater: "भविष्यासाठी शेड्यूल करा",
    scheduleTimeLabel: "दिनांक आणि वेळ निवडा",
    btnConfirmSend: "ब्रॉडकास्ट अधिकृत आणि कतारबद्ध करा",
    btnCancelBroadcast: "नियोजित ब्रॉडकास्ट रद्द करा",
    successMsg: "ब्रॉडकास्ट यशस्वीरित्या सत्यापित, खर्च मंजूर आणि टीआरएआय डिस्पॅचरमध्ये कतारबद्ध केले.",
    cancelSuccessMsg: "नियोजित ब्रॉडकास्ट रद्द केले. निधी क्रेडिट शिल्लकमध्ये परत जमा केला.",
    invalidDndExcluded: "अनुपालन राखण्यासाठी डीएनडी-नोंदणीकृत नंबर स्वयंचलितपणे वगळले आहेत.",
    rateLimitAlert: "दैनिक मर्यादा: १२,४५०/१५,००० पाठवले.",
    emptyBroadcasts: "मागील ब्रॉडकास्ट इतिहास आढळला नाही.",
    deliveredCount: "यशस्वीरित्या वितरित",
    pendingCount: "वाहक उत्तराची प्रतीक्षा",
    failedCount: "अयशस्वी / अवरोधित",
    carrierBlockReason: "कॅरियर ब्लॉक (डीएनडी सक्रिय)",
    invalidNumberReason: "अमान्य ग्राहक मार्ग",
    unsubscribedReason: "वापरकर्त्याने नकार दिला (STOP प्राप्त)",
    pullToRefresh: "लॉग पुन्हा लोड करण्यासाठी ओढा",
    skeletonLoading: "कॅरियर लॉग रीफ्रेश होत आहेत...",
    costDisclaimer: "प्रमाणित घरगुती प्रति युनिट ₹०.१८ वर बिल केले."
  }
};

interface BroadcastLog {
  id: string;
  name: string;
  messageText: string;
  filterSegment: {
    stage?: string;
    territory?: string;
    source?: string;
  };
  scheduledTime: string;
  status: 'queued' | 'processing' | 'completed' | 'cancelled';
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    invalidNo: number;
    carrierBlock: number;
    optOutBlock: number;
  };
  cost: number;
}

const SAMPLE_LEADS_COUNT = 680;

const INITIAL_BROADCASTS: BroadcastLog[] = [
  {
    id: "br_001",
    name: "Ganesh Chaturthi Premium Lift Offer",
    messageText: "Greetings from All India Elevators! 🛗 Celebrate this Ganesh Chaturthi with an exclusive 10% privilege discount on all glass villa elevators. Code: GANESH10.",
    filterSegment: { stage: "contacted", territory: "Pune West" },
    scheduledTime: "Completed - 2 Days ago",
    status: "completed",
    stats: {
      sent: 250,
      delivered: 238,
      failed: 12,
      invalidNo: 2,
      carrierBlock: 8,
      optOutBlock: 2
    },
    cost: 45.00
  },
  {
    id: "br_002",
    name: "Monsoon Installation Safety Pre-checks Update",
    messageText: "Dear Client, please ensure civil shaft weather protection is completed before rain. Read our critical site SOP guide at: https://aiec.in/sop-safety",
    filterSegment: { stage: "site_ready" },
    scheduledTime: "Completed - 1 Week ago",
    status: "completed",
    stats: {
      sent: 84,
      delivered: 81,
      failed: 3,
      invalidNo: 0,
      carrierBlock: 1,
      optOutBlock: 2
    },
    cost: 15.12
  },
  {
    id: "br_003",
    name: "Pune Commercial Elevators Seminar Invite",
    messageText: "Join Prashant Wable at the Pune Infrastructure & Elevators Safety Meet. Date: 15th July, 4 PM. Reply YES to confirm luxury seat pass registration.",
    filterSegment: { source: "google_search" },
    scheduledTime: "Scheduled - 12th July, 10:00 AM",
    status: "queued",
    stats: {
      sent: 412,
      delivered: 0,
      failed: 0,
      invalidNo: 0,
      carrierBlock: 0,
      optOutBlock: 0
    },
    cost: 74.16
  }
];

export const SMSBroadcastDeliveryReport: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const t = localizations[language] || localizations.en;

  // Real-time broadcast logs
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>(() => {
    const saved = localStorage.getItem('aiec_sms_broadcasts');
    return saved ? JSON.parse(saved) : INITIAL_BROADCASTS;
  });

  // Pull-to-refresh loader simulation states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);

  // active tab
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  // New broadcast creation state
  const [broadcastName, setBroadcastName] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("Greetings from All India Elevators! 🛗 ");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [territoryFilter, setTerritoryFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");

  // Detailed modal/panel selection for history logs
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string>("br_001");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string>("");

  const activeLog = useMemo(() => {
    return broadcasts.find(b => b.id === selectedBroadcastId);
  }, [broadcasts, selectedBroadcastId]);

  // SLA/Dynamic Progress calculations required by guidelines
  // Current Progress Bar: completeness of draft composition wizard criteria
  const currentCompositionProgress = useMemo(() => {
    let completedSteps = 0;
    if (broadcastName.trim().length > 0) completedSteps += 25;
    if (messageText.trim().length > 15) completedSteps += 25;
    if (stageFilter || territoryFilter || sourceFilter) completedSteps += 25;
    if (scheduleType === 'immediate' || scheduledDateTime) completedSteps += 25;
    return completedSteps;
  }, [broadcastName, messageText, stageFilter, territoryFilter, sourceFilter, scheduleType, scheduledDateTime]);

  // Total Progress Bar: overall historical delivery rate of dispatched segments
  const totalRegionalCoverage = useMemo(() => {
    const completedList = broadcasts.filter(b => b.status === 'completed');
    if (completedList.length === 0) return 100;
    const totalSent = completedList.reduce((acc, curr) => acc + curr.stats.sent, 0);
    const totalDelivered = completedList.reduce((acc, curr) => acc + curr.stats.delivered, 0);
    return Math.round((totalDelivered / totalSent) * 100);
  }, [broadcasts]);

  // Filter Segment Recipient Resolver Sim
  const resolvedRecipientsCount = useMemo(() => {
    let baseCount = SAMPLE_LEADS_COUNT;
    // Apply dummy scale factor depending on filter selections
    if (stageFilter) baseCount = Math.floor(baseCount * 0.35);
    if (territoryFilter) baseCount = Math.floor(baseCount * 0.45);
    if (sourceFilter) baseCount = Math.floor(baseCount * 0.25);
    
    // Automatically deduct dummy DND/Opt-Out registers (Compliance rule)
    const dndExclusionsCount = Math.floor(baseCount * 0.08); // Simulating 8% exclusion rate
    return Math.max(baseCount - dndExclusionsCount, 12);
  }, [stageFilter, territoryFilter, sourceFilter]);

  // Cost Estimation per standard unit (Rule of thumb: standard SMS domestic is INR 0.18 per message unit of 160 chars)
  const singleSMSCharacters = messageText.length;
  const smsUnitsPerMessage = Math.ceil(singleSMSCharacters / 160) || 1;
  const estimatedCost = useMemo(() => {
    const totalSMSParts = resolvedRecipientsCount * smsUnitsPerMessage;
    return Number((totalSMSParts * 0.18).toFixed(2));
  }, [resolvedRecipientsCount, smsUnitsPerMessage]);

  // TRAI regulatory hours check (DND rules in India prohibit promotional SMS between 9 PM and 9 AM)
  const isOutsideTRAIHours = useMemo(() => {
    if (scheduleType === 'immediate') {
      const currentHour = new Date().getHours();
      return currentHour < 9 || currentHour >= 21;
    }
    if (scheduleType === 'scheduled' && scheduledDateTime) {
      const schedHour = new Date(scheduledDateTime).getHours();
      return schedHour < 9 || schedHour >= 21;
    }
    return false;
  }, [scheduleType, scheduledDateTime]);

  // Swipe-to-refresh simulation
  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setShowSkeleton(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setShowSkeleton(false);
      setToastMsg("TRAI Gateway DLR registers updated.");
    }, 1500);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Launch Broadcast Submission (incorporates limits & warnings)
  const handleLaunchBroadcast = () => {
    if (!broadcastName.trim()) {
      triggerToast("Please provide a name for this broadcast campaign.");
      return;
    }
    if (messageText.length < 10) {
      triggerToast("SMS text body is too short to dispatch.");
      return;
    }

    if (isOutsideTRAIHours) {
      triggerToast("Warning: Time-of-day compliance restriction! Re-schedule within permitted 9:00 AM - 9:00 PM TRAI limits.");
      return;
    }

    const newId = `br_new_${Date.now()}`;
    const newLog: BroadcastLog = {
      id: newId,
      name: broadcastName,
      messageText: messageText,
      filterSegment: {
        stage: stageFilter || undefined,
        territory: territoryFilter || undefined,
        source: sourceFilter || undefined
      },
      scheduledTime: scheduleType === 'immediate' ? "Completed - Just Now" : `Scheduled - ${scheduledDateTime}`,
      status: scheduleType === 'immediate' ? "completed" : "queued",
      stats: {
        sent: resolvedRecipientsCount,
        delivered: scheduleType === 'immediate' ? Math.floor(resolvedRecipientsCount * 0.95) : 0,
        failed: scheduleType === 'immediate' ? Math.floor(resolvedRecipientsCount * 0.05) : 0,
        invalidNo: scheduleType === 'immediate' ? Math.floor(resolvedRecipientsCount * 0.01) : 0,
        carrierBlock: scheduleType === 'immediate' ? Math.floor(resolvedRecipientsCount * 0.03) : 0,
        optOutBlock: scheduleType === 'immediate' ? Math.floor(resolvedRecipientsCount * 0.01) : 0
      },
      cost: estimatedCost
    };

    const updated = [newLog, ...broadcasts];
    setBroadcasts(updated);
    localStorage.setItem('aiec_sms_broadcasts', JSON.stringify(updated));

    // Reset editor
    setBroadcastName("");
    setMessageText("Greetings from All India Elevators! 🛗 ");
    setStageFilter("");
    setTerritoryFilter("");
    setSourceFilter("");
    setScheduleType("immediate");
    setScheduledDateTime("");

    triggerToast(t.successMsg);
  };

  // Abort / Cancel scheduled broadcast
  const handleCancelScheduled = (id: string) => {
    const updated = broadcasts.map(b => {
      if (b.id === id) {
        return { ...b, status: 'cancelled' as const };
      }
      return b;
    });
    setBroadcasts(updated);
    localStorage.setItem('aiec_sms_broadcasts', JSON.stringify(updated));
    triggerToast(t.cancelSuccessMsg);
  };

  // Match search filter in history tab
  const filteredHistory = useMemo(() => {
    return broadcasts.filter(b => {
      return b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.messageText.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [broadcasts, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* SECTION HEADER WITH SLA METRIC BLOCKS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            BULK SCHEDULER ENGINE • MODULE 6
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic progress bar required by additional instructions */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>{t.totalProgressLabel}: {totalRegionalCoverage}%</span>
            <span>Historical Success</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full transition-all duration-300"
              style={{ width: `${totalRegionalCoverage}%` }}
            />
          </div>
        </div>
      </div>

      {/* SLA PROGRESS BAR BLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CURRENT STEP COMPOSITION PROGRESS BAR */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-antiquegold" />
              <span>{t.currentProgressLabel}</span>
            </span>
            <span>{currentCompositionProgress}% Ready</span>
          </div>
          <div className="w-full h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full transition-all duration-300"
              style={{ width: `${currentCompositionProgress}%` }}
            />
          </div>
        </div>

        {/* DAILY SMS REGULATORY CEILING CARD */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-royalemerald animate-ping" />
            <div>
              <span className="block text-[10px] font-mono font-black text-charcoal uppercase">{t.rateLimitAlert}</span>
              <span className="block text-[9px] text-warmgray font-semibold">15,000 TRAI Sender Units Maximum</span>
            </div>
          </div>
          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-mono">
            CAP OK
          </Badge>
        </div>

      </div>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGULATORY TIME ZONE WARNING BANNER */}
      {isOutsideTRAIHours && (
        <Card className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B8873D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
              Regulatory compliance warning
            </h4>
            <p className="text-xs text-amber-700 font-semibold">
              {t.traiDndWarning}
            </p>
          </div>
        </Card>
      )}

      {/* VIEW CHANGER TABS */}
      <div className="flex border-b border-[#e5dfd4]/40 gap-2">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-6 py-3.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${
            activeTab === 'compose'
              ? 'border-antiquegold text-charcoal'
              : 'border-transparent text-warmgray hover:text-charcoal'
          }`}
        >
          ✍️ {t.tabNew}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-antiquegold text-charcoal'
              : 'border-transparent text-warmgray hover:text-charcoal'
          }`}
        >
          📊 {t.tabHistory}
        </button>
      </div>

      {/* DYNAMIC TAB INTERACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TAB 1: NEW BROADCAST BUILDER */}
        {activeTab === 'compose' && (
          <>
            {/* LEFT AREA: CONFIGURATION & SEGMENT FIELDS (8 SPAN) */}
            <div className="lg:col-span-8 space-y-6">
              
              <Card className="p-6 bg-white shadow-xs space-y-6">
                
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">{t.segmentFilterTitle}</h3>
                  <p className="text-xs text-warmgray font-semibold mt-0.5">Filter recipient numbers. DND numbers and opted-out leads are excluded automatically.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CRM Stage Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.selectStage}</label>
                    <select
                      value={stageFilter}
                      onChange={(e) => setStageFilter(e.target.value)}
                      className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-3 px-4 text-xs font-bold text-charcoal focus:outline-none"
                    >
                      <option value="">{t.allOption}</option>
                      <option value="captured">Captured (New Leads)</option>
                      <option value="contacted">Contacted (Site Survey)</option>
                      <option value="negotiation">Negotiation (Final Draw)</option>
                      <option value="site_ready">Site Ready</option>
                    </select>
                  </div>

                  {/* Territory Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.selectTerritory}</label>
                    <select
                      value={territoryFilter}
                      onChange={(e) => setTerritoryFilter(e.target.value)}
                      className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-3 px-4 text-xs font-bold text-charcoal focus:outline-none"
                    >
                      <option value="">{t.allOption}</option>
                      <option value="Pune West">Pune West (Kothrud/Baner)</option>
                      <option value="Pune East">Pune East (Hadapsar)</option>
                      <option value="Pimpri Chinchwad">Pimpri Chinchwad (PCMC)</option>
                    </select>
                  </div>

                  {/* Lead Source Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.selectSource}</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-3 px-4 text-xs font-bold text-charcoal focus:outline-none"
                    >
                      <option value="">{t.allOption}</option>
                      <option value="google_search">Google Search Ad</option>
                      <option value="whatsapp_lead">Inbound WhatsApp</option>
                      <option value="reference">Owner Direct Reference</option>
                    </select>
                  </div>
                </div>

                {/* COMPLIANCE EXCLUSION ADVISORY CHIP */}
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between text-[11px] text-[#0E4B3D] font-bold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-royalemerald" />
                    <span>{t.invalidDndExcluded}</span>
                  </div>
                  <Badge className="bg-royalemerald/10 text-royalemerald border-transparent text-[10px] font-mono">
                    COMPLIANT
                  </Badge>
                </div>

              </Card>

              {/* BROADCAST METADATA AND BODY TEXT */}
              <Card className="p-6 bg-white shadow-xs space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">Campaign Broadcast Label</label>
                  <input
                    type="text"
                    value={broadcastName}
                    onChange={(e) => setBroadcastName(e.target.value)}
                    className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-3 px-4 text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-antiquegold"
                    placeholder="e.g. Pune West Site SOP Pre-Survey Reminder..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    <label>{t.messageBodyLabel}</label>
                    <span className="text-[10px] text-warmgray">
                      {160 - (singleSMSCharacters % 160)} {t.charactersRemaining} ({smsUnitsPerMessage} Units)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-4 border border-[#e5dfd4] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                    placeholder="Enter domestic alert template payload here..."
                  />
                  <div className="flex justify-between text-[10px] text-warmgray font-semibold">
                    <span>💡 Tip: Keep it under 160 characters to optimize broadcast credit usage.</span>
                    <span>Total length: {singleSMSCharacters} chars</span>
                  </div>
                </div>

                {/* SCHEDULING TIME PREFERENCE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.scheduleLabel}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-charcoal cursor-pointer">
                        <input
                          type="radio"
                          name="schedule"
                          checked={scheduleType === 'immediate'}
                          onChange={() => setScheduleType('immediate')}
                          className="w-4 h-4 text-antiquegold focus:ring-antiquegold"
                        />
                        <span>{t.sendImmediate}</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-charcoal cursor-pointer">
                        <input
                          type="radio"
                          name="schedule"
                          checked={scheduleType === 'scheduled'}
                          onChange={() => setScheduleType('scheduled')}
                          className="w-4 h-4 text-antiquegold focus:ring-antiquegold"
                        />
                        <span>{t.scheduleLater}</span>
                      </label>
                    </div>
                  </div>

                  {scheduleType === 'scheduled' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.scheduleTimeLabel}</label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl py-2 px-3 text-xs font-bold text-charcoal focus:outline-none"
                      />
                    </div>
                  )}
                </div>

              </Card>

            </div>

            {/* RIGHT AREA: TRANSACTION CHECKOUT SUMMARY AND SAFES (4 SPAN) */}
            <div className="lg:col-span-4 space-y-6">
              
              <Card className="p-6 bg-white border border-[rgba(184,135,61,0.15)] shadow-xs space-y-6 relative overflow-hidden">
                
                {/* Vertical elevator rail element motif */}
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-antiquegold/10 pointer-events-none" />

                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal">Pre-flight Verification</h3>
                  <p className="text-[10px] text-warmgray font-semibold mt-0.5">{t.costDisclaimer}</p>
                </div>

                <div className="space-y-4">
                  {/* RECIPIENT COUNT STAT BLOCK */}
                  <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/50 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-mono font-bold text-warmgray uppercase">{t.recipientCountLabel}</span>
                      <span className="block text-2xl font-serif font-black text-charcoal mt-1">
                        {resolvedRecipientsCount}
                      </span>
                    </div>
                    <Users className="w-8 h-8 text-antiquegold stroke-1" />
                  </div>

                  {/* SMS UNIT MULTIPLIER */}
                  <div className="p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/50 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-mono font-bold text-warmgray uppercase">{t.smsUnitsCount}</span>
                      <span className="block text-2xl font-serif font-black text-charcoal mt-1">
                        {smsUnitsPerMessage} <span className="text-xs font-sans text-warmgray font-bold">parts/msg</span>
                      </span>
                    </div>
                    <MessageSquare className="w-8 h-8 text-royalemerald stroke-1" />
                  </div>

                  {/* COST ESTIMATE METRIC */}
                  <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-mono font-bold text-emerald-800 uppercase">{t.costEstimateLabel}</span>
                      <span className="block text-2xl font-mono font-black text-emerald-900 mt-1">
                        ₹{estimatedCost}
                      </span>
                    </div>
                    <DollarSign className="w-8 h-8 text-royalemerald stroke-1" />
                  </div>
                </div>

                {/* PREVENT LARGE SLIP SAFEGUARD (If resolves > 250 targets) */}
                {resolvedRecipientsCount > 250 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#B8873D] shrink-0" />
                    <span className="text-[10px] text-amber-800 font-bold leading-relaxed">
                      {t.largeSendWarning}
                    </span>
                  </div>
                )}

                {/* ACTION CTA DISPATCH */}
                <Button
                  onClick={handleLaunchBroadcast}
                  variant="primary"
                  className="w-full py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.btnConfirmSend}</span>
                </Button>

              </Card>

              {/* DYNAMIC SIGNIFICANT MOTIF: THE VERTICAL ASCENSION LINE */}
              <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/40">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 bg-antiquegold h-14 rounded-full shrink-0 relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-royalemerald ring-2 ring-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black uppercase text-antiquegold tracking-widest">
                      TRAI & DND Regulations
                    </span>
                    <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
                      AIEC platform automatically checks and blocks numbers present on national Do Not Disturb (DND) registers. This ensures absolute compliance with Indian Telecom regulations.
                    </p>
                  </div>
                </div>
              </Card>

            </div>
          </>
        )}

        {/* TAB 2: HISTORY LOGS & ANALYTICS REPORT */}
        {activeTab === 'history' && (
          <>
            {/* LEFT AREA: HISTORICAL BROADCAST LIST (5 SPAN) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="flex justify-between items-center px-1">
                <span className="text-xs uppercase font-mono font-black text-charcoal tracking-wider">
                  Dispatched Logs ({filteredHistory.length})
                </span>
                {/* Pull-to-refresh button */}
                <button
                  onClick={handlePullToRefresh}
                  disabled={isRefreshing}
                  className="p-1 text-antiquegold hover:bg-alabaster rounded-lg transition-all"
                  title={t.pullToRefresh}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* SEARCH FILTER */}
              <Card className="p-3 bg-white border border-[#e5dfd4]/40 shadow-2xs">
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
              </Card>

              {/* SKELETON REFRESH LOADER */}
              {showSkeleton ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 bg-white border border-[#e5dfd4]/40 rounded-2xl h-24" />
                  ))}
                  <p className="text-center text-[10px] text-warmgray font-mono font-extrabold">{t.skeletonLoading}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {filteredHistory.length === 0 ? (
                    <Card className="p-10 text-center space-y-3 bg-white">
                      <HelpCircle className="w-8 h-8 text-warmgray mx-auto" />
                      <p className="text-xs text-warmgray font-bold">{t.emptyBroadcasts}</p>
                    </Card>
                  ) : (
                    filteredHistory.map((item) => {
                      const isSelected = item.id === selectedBroadcastId;
                      
                      let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      if (item.status === 'queued') statusBadge = "bg-blue-50 text-blue-700 border-blue-100 animate-pulse";
                      if (item.status === 'cancelled') statusBadge = "bg-neutral-100 text-neutral-600 border-neutral-200";

                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedBroadcastId(item.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-white relative ${
                            isSelected
                              ? 'border-antiquegold ring-2 ring-antiquegold/10 shadow-xs translate-x-1'
                              : 'border-[#e5dfd4]/40 hover:border-warmgray'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-serif text-sm font-black text-charcoal line-clamp-1 max-w-[180px]">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-antiquegold font-mono truncate">
                                Target: {item.stats.sent} Contacts
                              </p>
                              <p className="text-[11px] text-warmgray line-clamp-1 font-semibold">
                                {item.messageText}
                              </p>
                            </div>

                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                              <Badge className={`text-[8px] font-mono px-2 py-0.5 font-black uppercase rounded-full ${statusBadge}`}>
                                {item.status.toUpperCase()}
                              </Badge>
                              <span className="text-[9px] font-mono text-warmgray">{item.scheduledTime}</span>
                            </div>
                          </div>

                          {/* Cancellation option if queued */}
                          {item.status === 'queued' && (
                            <div className="mt-3 pt-2 border-t border-[#e5dfd4]/30 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelScheduled(item.id);
                                }}
                                className="text-xs text-error font-bold hover:underline flex items-center gap-0.5 ml-auto"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>{t.btnCancelBroadcast}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>

            {/* RIGHT AREA: PERFORMANCE DASHBOARD METRICS FOR CHOSEN LOG (7 SPAN) */}
            <div className="lg:col-span-7 space-y-6">
              {!activeLog ? (
                <Card className="p-16 text-center space-y-4 bg-white border border-[#e5dfd4]/40">
                  <BarChart2 className="w-12 h-12 text-antiquegold mx-auto stroke-1" />
                  <h3 className="font-serif text-lg font-bold text-charcoal">Select Broadcast to View Report</h3>
                </Card>
              ) : (
                <Card className="p-6 bg-white border border-[rgba(184,135,61,0.15)] shadow-xs space-y-6">
                  
                  <div className="border-b border-[#e5dfd4]/40 pb-4">
                    <span className="text-[9px] uppercase font-mono font-black text-royalemerald bg-royalemerald/10 px-2 py-0.5 rounded">
                      CAMPAIGN METRICS SUMMARY
                    </span>
                    <h3 className="font-serif text-lg font-black text-charcoal mt-1">
                      {activeLog.name}
                    </h3>
                    <p className="text-[11px] text-antiquegold font-mono mt-0.5">
                      DISPATCH TIME: {activeLog.scheduledTime}
                    </p>
                  </div>

                  {/* DISPLAY STANDARD KPI CARDS - IMPORTANT FIGURE TOP-LEFT IN THE GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* DELIVERED SUCCESS - PRIMARY ACCENT COLOURED TEXT */}
                    <div className="p-4 bg-emerald-50/25 border border-emerald-100 rounded-2xl">
                      <span className="block text-[10px] font-mono font-bold text-emerald-800 uppercase">
                        {t.deliveredCount}
                      </span>
                      <span className="block text-2xl font-serif font-black text-emerald-900 mt-1">
                        {activeLog.stats.delivered}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                        ✓ {Math.round((activeLog.stats.delivered / (activeLog.stats.sent || 1)) * 100)}% Success rate
                      </span>
                    </div>

                    {/* FAILED / BLOCKED STATUS */}
                    <div className="p-4 bg-red-50/25 border border-red-100 rounded-2xl">
                      <span className="block text-[10px] font-mono font-bold text-red-800 uppercase">
                        {t.failedCount}
                      </span>
                      <span className="block text-2xl font-serif font-black text-red-950 mt-1">
                        {activeLog.stats.failed}
                      </span>
                      <span className="text-[9px] text-red-700 font-bold block mt-1">
                        ⚠️ {Math.round((activeLog.stats.failed / (activeLog.stats.sent || 1)) * 100)}% Exclusions
                      </span>
                    </div>

                    {/* TOTAL OUTLAY CHARGED */}
                    <div className="p-4 bg-alabaster border border-[#e5dfd4]/60 rounded-2xl">
                      <span className="block text-[10px] font-mono font-bold text-warmgray uppercase">
                        Campaign Cost Billed
                      </span>
                      <span className="block text-2xl font-mono font-black text-charcoal mt-1">
                        ₹{activeLog.cost}
                      </span>
                      <span className="text-[9px] text-warmgray font-bold block mt-1 font-mono">
                        ₹0.18 unit standard
                      </span>
                    </div>

                  </div>

                  {/* MESSAGE CONTENT DISPLAY CARD */}
                  <div className="p-4 bg-alabaster/40 border border-[#e5dfd4]/40 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-mono font-black text-antiquegold tracking-widest block">
                      Rendered Template Payload
                    </span>
                    <p className="text-xs text-charcoal font-semibold leading-relaxed">
                      "{activeLog.messageText}"
                    </p>
                  </div>

                  {/* LIVE OUTCOMES BREAKDOWN */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                        TRAI Carrier Delivery Failure Diagnostics
                      </h4>
                      <p className="text-[10px] text-warmgray font-semibold mt-0.5">Live error diagnostic logs resolved from regional telecom hubs.</p>
                    </div>

                    <div className="space-y-3">
                      
                      {/* Invalid Number breakdown */}
                      <div className="flex justify-between items-center p-3 bg-alabaster rounded-xl text-xs font-semibold">
                        <span className="text-charcoal flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>{t.invalidNumberReason}</span>
                        </span>
                        <span className="font-mono text-charcoal font-black">{activeLog.stats.invalidNo} Contacts</span>
                      </div>

                      {/* Carrier Block (DND) */}
                      <div className="flex justify-between items-center p-3 bg-alabaster rounded-xl text-xs font-semibold">
                        <span className="text-charcoal flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B8873D]" />
                          <span>{t.carrierBlockReason}</span>
                        </span>
                        <span className="font-mono text-charcoal font-black">{activeLog.stats.carrierBlock} Contacts</span>
                      </div>

                      {/* User Opt-out / STOP keywords */}
                      <div className="flex justify-between items-center p-3 bg-alabaster rounded-xl text-xs font-semibold">
                        <span className="text-charcoal flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          <span>{t.unsubscribedReason}</span>
                        </span>
                        <span className="font-mono text-charcoal font-black">{activeLog.stats.optOutBlock} Contacts</span>
                      </div>

                    </div>
                  </div>

                </Card>
              )}

            </div>
          </>
        )}

      </div>

    </div>
  );
};
