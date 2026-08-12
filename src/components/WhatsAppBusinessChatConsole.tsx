import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, User, Bot, Shield, Check, CheckCheck, Clock, Search, Filter,
  Phone, Send, AlertTriangle, Play, Pause, Paperclip, MoreVertical, ShieldAlert,
  Image, FileText, Mic, RefreshCw, AlertOctagon, HelpCircle, CheckCircle, UserCheck, Eye, EyeOff
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

// Localizations for WhatsApp Business Console
const localizations = {
  en: {
    title: "WhatsApp Business Chat Console",
    subtitle: "Unified client communication timeline. Seamlessly transition between Automated Sequences and Human agent interventions.",
    searchPlaceholder: "Search conversations by name, site, or keyword...",
    assignAgent: "Assign Conversation",
    filterType: "Thread Status",
    allThreads: "All Chats",
    unassignedOnly: "Unassigned",
    pausedOnly: "Bot Paused (Human Active)",
    allLabels: "All Active",
    quickReplies: "Governance Templates",
    composerPlaceholder: "Type a live WhatsApp reply... (Sends as human & pauses active sequences)",
    optOutBanner: "Lead has opted out of WhatsApp communication. Sends are blocked.",
    apiOutageWarning: "WhatsApp Business API status: Latency degraded (Average send 14s).",
    businessHoursNotice: "Message received outside Pune corporate hours. Auto-responder queued.",
    botTag: "Automated Bot",
    humanTag: "Staff Agent",
    clientTag: "Prospect Client",
    claimBtn: "Claim Conversation",
    unclaimBtn: "Release Claim",
    sequenceStateActive: "Automated Sequence Active",
    sequenceStatePaused: "Automated Sequence Paused (Cooldown Window Active)",
    totalProgressLabel: "Total Queue Dispatched Today",
    currentProgressLabel: "Active Client Response SLA",
    noChatsFound: "No active client threads match your search parameters.",
    optOutTrigger: "STOP / Opt-Out Detected! Compliance hold immediately enforced globally.",
    simulateCustomerReply: "Simulate Incoming Client Message",
    simulateReplyPlaceholder: "Type customer reply (e.g., 'STOP' or 'send quote')...",
    rateLimitAlert: "API Rate limit warning: 92/100 messages sent this hour.",
    sendMediaBtn: "Attach Proposal/PDF"
  },
  hi: {
    title: "व्हाट्सएप बिजनेस चैट कंसोल",
    subtitle: "एकीकृत ग्राहक संचार समयरेखा। स्वचालित अनुक्रमों और मानव एजेंट हस्तक्षेपों के बीच सहज संक्रमण।",
    searchPlaceholder: "नाम, साइट या कीवर्ड द्वारा बातचीत खोजें...",
    assignAgent: "बातचीत सौंपें",
    filterType: "थ्रेड स्थिति",
    allThreads: "सभी चैट",
    unassignedOnly: "सौंपे बिना",
    pausedOnly: "बॉट रोकें (मानव सक्रिय)",
    allLabels: "सभी सक्रिय",
    quickReplies: "गवर्नेंस टेम्प्लेट",
    composerPlaceholder: "लाइव व्हाट्सएप उत्तर टाइप करें... (स्वचालित अनुक्रम रोक दिया जाएगा)",
    optOutBanner: "लीड ने व्हाट्सएप संचार से ऑप्ट-आउट किया है। प्रेषण अवरुद्ध हैं।",
    apiOutageWarning: "व्हाट्सएप बिजनेस एपीआई स्थिति: विलंबता कम हुई (औसत प्रेषण 14s)।",
    businessHoursNotice: "पुणे कॉर्पोरेट समय के बाहर संदेश प्राप्त हुआ। ऑटो-रिस्पॉन्डर कतार में है।",
    botTag: "स्वचालित बॉट",
    humanTag: "स्टाफ एजेंट",
    clientTag: "संभावित ग्राहक",
    claimBtn: "बातचीत का दावा करें",
    unclaimBtn: "दावा छोड़ें",
    sequenceStateActive: "स्वचालित अनुक्रम सक्रिय",
    sequenceStatePaused: "स्वचालित अनुक्रम रुका हुआ है (कूलडाउन सक्रिय)",
    totalProgressLabel: "आज कुल प्रेषण कतार",
    currentProgressLabel: "सक्रिय ग्राहक प्रतिक्रिया एसएलए",
    noChatsFound: "कोई भी सक्रिय क्लाइंट थ्रेड आपके खोज मापदंडों से मेल नहीं खाता।",
    optOutTrigger: "STOP / ऑप्ट-आउट का पता चला! अनुपालन तुरंत वैश्विक स्तर पर लागू किया गया।",
    simulateCustomerReply: "आने वाले ग्राहक संदेश का अनुकरण करें",
    simulateReplyPlaceholder: "ग्राहक का उत्तर टाइप करें (जैसे, 'STOP' या 'कोट भेजें')...",
    rateLimitAlert: "एपीआई दर सीमा चेतावनी: इस घंटे में 92/100 संदेश भेजे गए।",
    sendMediaBtn: "प्रस्ताव/पीडीएफ संलग्न करें"
  },
  mr: {
    title: "व्हॉट्सॲप बिझनेस चॅट कन्सोल",
    subtitle: "एकत्रित ग्राहक संवाद टाइमलाईन. स्वयंचलित अनुक्रम आणि मानवी एजंटमधील सुलभ बदल.",
    searchPlaceholder: "नाव, साइट किंवा कीवर्डद्वारे चॅट्स शोधा...",
    assignAgent: "संभाषण नियुक्त करा",
    filterType: "थ्रेड स्थिती",
    allThreads: "सर्व चॅट्स",
    unassignedOnly: "नियुक्त नसलेले",
    pausedOnly: "बॉट थांबवला (मानव सक्रिय)",
    allLabels: "सर्व सक्रिय",
    quickReplies: "गव्हर्नन्स टेम्पलेट्स",
    composerPlaceholder: "थेट व्हॉट्सॲप संदेश टाईप करा... (स्वयंचलित अनुक्रम तात्पुरता थांबवला जाईल)",
    optOutBanner: "ग्राहकाने व्हॉट्सॲप संवादातून नकार दिला आहे. संदेश पाठवणे अवरोधित केले आहे.",
    apiOutageWarning: "व्हॉट्सॲप बिझनेस एपीआय स्थिती: उशीर वाढला आहे (सरासरी वेळ १४ सेकंद).",
    businessHoursNotice: "पुणे कॉर्पोरेट वेळेव्यतिरिक्त मेसेज प्राप्त झाला. ऑटो-रिस्पॉन्डर सक्रिय.",
    botTag: "स्वयंचलित बॉट",
    humanTag: "स्टाफ एजंट",
    clientTag: "संभाव्य ग्राहक",
    claimBtn: "संभाषण ताब्यात घ्या",
    unclaimBtn: "ताबा सोडा",
    sequenceStateActive: "स्वयंचलित अनुक्रम सुरू",
    sequenceStatePaused: "स्वयंचलित अनुक्रम थांबवला (कूलडाउन कालावधी सुरू)",
    totalProgressLabel: "आज पाठवलेली एकूण चॅट्स",
    currentProgressLabel: "सक्रिय ग्राहक प्रतिसाद एसएलए",
    noChatsFound: "तुमच्या फिल्टरशी जुळणारे चॅट्स आढळले नाहीत.",
    optOutTrigger: "STOP / ऑप्ट-आऊट आढळला! नियम तत्काळ लागू करण्यात आले आहेत.",
    simulateCustomerReply: "ग्राहक प्रतिसादाचे अनुकरण करा",
    simulateReplyPlaceholder: "ग्राहकाचा मेसेज टाका (उदा. 'STOP' किंवा 'कोट पाठवा')...",
    rateLimitAlert: "एपीआई मर्यादा चेतावणी: या तासात ९२/१०० मेसेज पाठवले.",
    sendMediaBtn: "प्रस्ताव/पीडीएफ जोडा"
  }
};

interface Message {
  id: string;
  senderType: 'client' | 'bot' | 'human';
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | 'audio';
  mediaName?: string;
}

interface ChatConversation {
  id: string;
  clientName: string;
  buildingName: string;
  phone: string;
  assignedAgent: string;
  isSequenceActive: boolean;
  isOptedOut: boolean;
  lastMessageText: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: Message[];
}

const QUICK_REPLY_TEMPLATES = [
  { code: "AIEC_WELCOME", text: "Hello {{client_name}}! 🛗 Thank you for choosing All India Elevators. We registered your inquiry for {{building_name}}." },
  { code: "AIEC_SURVEY_SCHED", text: "Hi {{client_name}}, our senior engineer has approved the shaft outline. Can we schedule a site inspection?" },
  { code: "AIEC_QUOTE_FOLLOW", text: "Dear {{client_name}}, we submitted custom elevator layout. Let us know if you need any adjustments to the quote." }
];

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv_001",
    clientName: "Prashant Vasant Wable",
    buildingName: "Pratik Heights, Kothrud",
    phone: "+91 98230 11234",
    assignedAgent: "Amit Sharma (Sales)",
    isSequenceActive: true,
    isOptedOut: false,
    lastMessageText: "Can you send the architectural civil drawing for the elevator shaft size?",
    lastTimestamp: "10:32 AM",
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        senderType: "bot",
        senderName: "AIEC Lead Bot",
        text: "Hello Prashant Vasant Wable! 🛗 Thank you for contacting All India Elevators. We've initiated your proposal planning for Pratik Heights, Kothrud.",
        timestamp: "09:00 AM",
        status: "read"
      },
      {
        id: "m2",
        senderType: "client",
        senderName: "Prashant Vasant Wable",
        text: "Thanks, what is the standard dimension required for a 6 passenger lift?",
        timestamp: "09:15 AM",
        status: "read"
      },
      {
        id: "m3",
        senderType: "human",
        senderName: "Amit Sharma (Sales)",
        text: "Generally, for a 6 passenger lift we require clear shaft sizes of 1600mm width by 1600mm depth. Let me attach our premium technical catalog PDF for you.",
        timestamp: "09:40 AM",
        status: "read",
        mediaUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
        mediaType: "pdf",
        mediaName: "AIEC_Standard_Shaft_Dimensions.pdf"
      },
      {
        id: "m4",
        senderType: "client",
        senderName: "Prashant Vasant Wable",
        text: "Got it. Can you send the architectural civil drawing for the elevator shaft size?",
        timestamp: "10:32 AM",
        status: "delivered"
      }
    ]
  },
  {
    id: "conv_002",
    clientName: "Nilesh Kakade",
    buildingName: "Kakade Warehouse, Hadapsar",
    phone: "+91 91580 88223",
    assignedAgent: "",
    isSequenceActive: true,
    isOptedOut: false,
    lastMessageText: "Is safety gear certificate of Type-Testing included?",
    lastTimestamp: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m5",
        senderType: "bot",
        senderName: "AIEC Lead Bot",
        text: "Greetings! Your quote for Kakade Warehouse has been compiled. Total project estimation: ₹11,20,000.",
        timestamp: "Yesterday 02:15 PM",
        status: "read"
      },
      {
        id: "m6",
        senderType: "client",
        senderName: "Nilesh Kakade",
        text: "Is safety gear certificate of Type-Testing included?",
        timestamp: "Yesterday 03:00 PM",
        status: "read"
      }
    ]
  },
  {
    id: "conv_003",
    clientName: "Sanjay Deshmukh",
    buildingName: "Deshmukh Villa, Kothrud",
    phone: "+91 97300 44991",
    assignedAgent: "Prashant Wable (Owner)",
    isSequenceActive: false,
    isOptedOut: true,
    lastMessageText: "STOP",
    lastTimestamp: "3 Days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m7",
        senderType: "bot",
        senderName: "AIEC Lead Bot",
        text: "Reminder: Stage-2 Advance of ₹3,00,000 is outstanding for dispatching guide rails.",
        timestamp: "3 Days ago 11:00 AM",
        status: "delivered"
      },
      {
        id: "m8",
        senderType: "client",
        senderName: "Sanjay Deshmukh",
        text: "STOP",
        timestamp: "3 Days ago 11:05 AM",
        status: "read"
      }
    ]
  }
];

export const WhatsAppBusinessChatConsole: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const t = localizations[language] || localizations.en;

  // Real-time states
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('aiec_whatsapp_threads');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [selectedId, setSelectedId] = useState<string>("conv_001");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [threadFilter, setThreadFilter] = useState<string>("all");
  const [inputText, setInputText] = useState<string>("");
  const [simText, setSimText] = useState<string>("");
  const [showOutageBanner, setShowOutageBanner] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string>("");

  const activeConv = useMemo(() => {
    return conversations.find(c => c.id === selectedId);
  }, [conversations, selectedId]);

  // SLA and dispatch metrics (Dynamic progress indicators)
  const totalDispatchedToday = 48; // Constant sample representing total bulk sequence dispatch
  const completedTarget = 60;
  const totalQueuePercentage = Math.round((totalDispatchedToday / completedTarget) * 100);

  const activeSLAPercentage = useMemo(() => {
    // Current conversational SLA response rate
    const unreadCount = conversations.filter(c => c.unreadCount > 0).length;
    if (unreadCount === 0) return 100;
    const sla = Math.round((1 - (unreadCount / conversations.length)) * 100);
    return Math.max(sla, 20);
  }, [conversations]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Human agent claim/unclaim toggle
  const toggleClaimConversation = () => {
    if (!activeConv) return;
    const nextAgent = activeConv.assignedAgent ? "" : `${user?.name || "Amit Sharma"} (Sales)`;
    const updated = conversations.map(c => {
      if (c.id === selectedId) {
        return { ...c, assignedAgent: nextAgent };
      }
      return c;
    });
    setConversations(updated);
    localStorage.setItem('aiec_whatsapp_threads', JSON.stringify(updated));
    triggerToast(nextAgent ? "You claimed this active conversation thread." : "Conversation unassigned from you.");
  };

  // Switch Active Sequence State
  const toggleSequenceActive = () => {
    if (!activeConv) return;
    const updated = conversations.map(c => {
      if (c.id === selectedId) {
        return { ...c, isSequenceActive: !c.isSequenceActive };
      }
      return c;
    });
    setConversations(updated);
    localStorage.setItem('aiec_whatsapp_threads', JSON.stringify(updated));
    triggerToast(!activeConv.isSequenceActive ? "Sequence engine resumed." : "Sequence engine paused manually.");
  };

  // Inject Governance Template
  const handleInjectTemplate = (templateText: string) => {
    if (!activeConv) return;
    let text = templateText;
    text = text.replace("{{client_name}}", activeConv.clientName);
    text = text.replace("{{building_name}}", activeConv.buildingName);
    setInputText(text);
  };

  // Human Agent Live Reply Submission
  const handleSendHumanMessage = () => {
    if (!inputText.trim() || !activeConv) return;

    if (activeConv.isOptedOut) {
      triggerToast("Blocked: Opted out user!");
      return;
    }

    const newMsg: Message = {
      id: `hmsg_${Date.now()}`,
      senderType: 'human',
      senderName: `${user?.name || 'Amit Sharma'} (Agent)`,
      text: inputText,
      timestamp: "Just Now",
      status: 'sent'
    };

    const updated = conversations.map(c => {
      if (c.id === selectedId) {
        // Business logic: human intervention immediately pauses active automation sequence
        const sequencePausedStatus = false; 
        return {
          ...c,
          isSequenceActive: sequencePausedStatus,
          lastMessageText: inputText,
          lastTimestamp: "Just Now",
          unreadCount: 0,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    setConversations(updated);
    localStorage.setItem('aiec_whatsapp_threads', JSON.stringify(updated));
    setInputText("");
    triggerToast("Live message sent. Sequence engine paused to allow human focus.");

    // Simulate Message transition from Sent to Delivered, then Read
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id === selectedId) {
          const updatedMsgs = c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' as const } : m);
          return { ...c, messages: updatedMsgs };
        }
        return c;
      }));
    }, 1500);

    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id === selectedId) {
          const updatedMsgs = c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' as const } : m);
          return { ...c, messages: updatedMsgs };
        }
        return c;
      }));
    }, 3000);
  };

  // Simulate Customer Incoming Reply
  const handleSimulateCustomerReply = () => {
    if (!simText.trim() || !activeConv) return;

    const lowerText = simText.toLowerCase().trim();
    const isStopWord = lowerText === 'stop' || lowerText === 'stop whatsapp';

    const newMsg: Message = {
      id: `cmsg_${Date.now()}`,
      senderType: 'client',
      senderName: activeConv.clientName,
      text: simText,
      timestamp: "Just Now",
      status: 'read'
    };

    const updated = conversations.map(c => {
      if (c.id === selectedId) {
        const optedOut = isStopWord ? true : c.isOptedOut;
        return {
          ...c,
          isOptedOut: optedOut,
          isSequenceActive: optedOut ? false : c.isSequenceActive,
          lastMessageText: simText,
          lastTimestamp: "Just Now",
          unreadCount: 0,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    setConversations(updated);
    localStorage.setItem('aiec_whatsapp_threads', JSON.stringify(updated));
    setSimText("");

    if (isStopWord) {
      triggerToast(t.optOutTrigger);
    } else {
      triggerToast("Customer simulated incoming message successfully.");
    }
  };

  // Filter client threads
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchesSearch = searchQuery === '' || 
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesFilter = true;
      if (threadFilter === 'unassigned') {
        matchesFilter = c.assignedAgent === '';
      } else if (threadFilter === 'paused') {
        matchesFilter = !c.isSequenceActive && !c.isOptedOut;
      }

      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, threadFilter]);

  // Business hour calculation check
  const isOutsideBusinessHours = useMemo(() => {
    const hours = new Date().getHours();
    return hours < 9 || hours >= 19; // Outside 9 AM - 7 PM Pune operational hours
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      {/* SECTION HEADER & DYNAMIC METRIC PROGRESS BARS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            CRM BUSINESS CONSOLE • MODULE 6
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Dynamic overall progress indicator required by additional instructions */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col justify-center shadow-xs">
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>{t.totalProgressLabel}: {totalQueuePercentage}%</span>
            <span>{totalDispatchedToday}/{completedTarget} Dispatched</span>
          </div>
          <div className="w-56 h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-antiquegold rounded-full transition-all duration-300"
              style={{ width: `${totalQueuePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* SLA BAR PROGRESS BAR - CURRENT SLA COMPLIANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ACTIVE RESPONSE SLA PROGRESS */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-charcoal mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-royalemerald" />
              <span>{t.currentProgressLabel}</span>
            </span>
            <span>{activeSLAPercentage}% Compliant</span>
          </div>
          <div className="w-full h-2 bg-alabaster rounded-full overflow-hidden relative border border-[#e5dfd4]">
            <div
              className="absolute top-0 bottom-0 left-0 bg-royalemerald rounded-full transition-all duration-300"
              style={{ width: `${activeSLAPercentage}%` }}
            />
          </div>
        </div>

        {/* LIVE NETWORK API ALERT STATUS */}
        <div className="bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.12)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8873D] animate-ping" />
            <div>
              <span className="block text-[10px] font-mono font-black text-charcoal uppercase">{t.rateLimitAlert}</span>
              <span className="block text-[9px] text-warmgray font-semibold">92% Hourly Quota Active</span>
            </div>
          </div>
          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-mono">
            API WARN
          </Badge>
        </div>

      </div>

      {/* TOAST SYSTEM ALERTS */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEGRADED API NETWORK OUTAGE BANNER */}
      {showOutageBanner && (
        <Card className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-800 font-bold">
            <AlertTriangle className="w-4 h-4 text-[#B8873D] shrink-0" />
            <span>{t.apiOutageWarning}</span>
          </div>
          <button onClick={() => setShowOutageBanner(false)} className="text-xs text-amber-600 hover:text-amber-800 font-black px-2">
            ✕
          </button>
        </Card>
      )}

      {/* BUSINESS HOURS HOLIDAY QUEUE WARNING */}
      {isOutsideBusinessHours && (
        <Card className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs text-blue-800 font-bold">{t.businessHoursNotice}</span>
        </Card>
      )}

      {/* MASTER THREAD LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT PANEL: ACTIVE CONVERSATIONS DIRECTORY (4 SPAN) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          
          {/* SEARCH & THREAD TYPE FILTERS */}
          <Card className="p-3 bg-white border border-[#e5dfd4]/40 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-alabaster border border-[#e5dfd4] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-antiquegold shrink-0" />
              <select
                value={threadFilter}
                onChange={(e) => setThreadFilter(e.target.value)}
                className="w-full bg-alabaster border border-[#e5dfd4] rounded-lg py-1 px-2 text-[11px] font-bold text-charcoal focus:outline-none"
              >
                <option value="all">💬 {t.allThreads}</option>
                <option value="unassigned">👤 {t.unassignedOnly}</option>
                <option value="paused">🤖 {t.pausedOnly}</option>
              </select>
            </div>
          </Card>

          {/* CHAT DIRECTORY ITEMS */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredConversations.length === 0 ? (
              <Card className="p-8 text-center space-y-2 bg-white border border-dashed border-[#e5dfd4]">
                <HelpCircle className="w-8 h-8 text-warmgray mx-auto" />
                <p className="text-xs text-warmgray font-bold">{t.noChatsFound}</p>
              </Card>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-white relative ${
                      isSelected
                        ? 'border-antiquegold ring-2 ring-antiquegold/10 shadow-xs translate-x-1'
                        : 'border-[#e5dfd4]/40 hover:border-warmgray hover:shadow-2xs'
                    }`}
                  >
                    {/* Badge alert for unread */}
                    {conv.unreadCount > 0 && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-sm font-black text-charcoal truncate max-w-[180px]">
                          {conv.clientName}
                        </h4>
                        <span className="text-[9px] font-mono font-bold text-warmgray">{conv.lastTimestamp}</span>
                      </div>

                      <p className="text-[10px] text-antiquegold font-mono truncate">
                        🏢 {conv.buildingName}
                      </p>

                      <p className="text-[11px] text-warmgray line-clamp-1 font-semibold">
                        {conv.lastMessageText}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-alabaster mt-2 text-[9px] font-mono text-warmgray">
                        <span>👤 {conv.assignedAgent ? "Assigned" : "Unclaimed"}</span>
                        <span className={`font-black ${conv.isSequenceActive ? 'text-royalemerald' : 'text-amber-700'}`}>
                          {conv.isSequenceActive ? "Bot Active" : "Bot Paused"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SIMULATED CLIENT ACTIONS */}
          <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/60 space-y-3">
            <span className="text-[9px] uppercase font-mono font-black text-antiquegold tracking-widest block">
              {t.simulateCustomerReply}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t.simulateReplyPlaceholder}
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e5dfd4] rounded-lg text-xs font-semibold focus:outline-none"
              />
              <Button
                onClick={handleSimulateCustomerReply}
                variant="outline"
                className="py-1 px-3 text-[10px] font-bold border-royalemerald text-royalemerald hover:bg-royalemerald/5 shrink-0"
              >
                Inbound 📲
              </Button>
            </div>
            <p className="text-[9px] text-warmgray font-semibold">
              Type <strong>"STOP"</strong> or <strong>"STOP WHATSAPP"</strong> to test global opt-out workflow compliance rules.
            </p>
          </Card>

        </div>

        {/* RIGHT PANEL: UNIFIED CONVERSATION THREAD AREA (8 SPAN) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs overflow-hidden h-[680px]">
          
          {/* ACTIVE THREAD HEADER */}
          {!activeConv ? (
            <div className="p-16 text-center space-y-4 my-auto">
              <MessageSquare className="w-12 h-12 text-antiquegold mx-auto stroke-1" />
              <h3 className="font-serif text-lg font-bold text-charcoal">Select Client Chat</h3>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-[#e5dfd4]/40 bg-alabaster/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-black text-charcoal">
                      {activeConv.clientName}
                    </h3>
                    <span className="text-xs text-warmgray font-mono">{activeConv.phone}</span>
                  </div>
                  <p className="text-[11px] text-antiquegold font-mono mt-0.5">
                    🏢 SITE: {activeConv.buildingName}
                  </p>
                </div>

                {/* Automation state indicators & Intervention switches */}
                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Sequence toggle */}
                  <button
                    onClick={toggleSequenceActive}
                    className={`px-2.5 py-1 text-[10px] font-mono font-black rounded-lg transition-all border flex items-center gap-1 ${
                      activeConv.isSequenceActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                    title="Click to manually pause or resume sequence"
                  >
                    {activeConv.isSequenceActive ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{activeConv.isSequenceActive ? t.sequenceStateActive : t.sequenceStatePaused}</span>
                  </button>

                  {/* Claim conversation */}
                  <Button
                    onClick={toggleClaimConversation}
                    variant="primary"
                    className="py-1 px-2.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {activeConv.assignedAgent ? t.unclaimBtn : t.claimBtn}
                  </Button>
                </div>
              </div>

              {/* TIMELINE THREAD SCROLLING PORT */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-alabaster/15">
                {activeConv.messages.map((msg, index) => {
                  const isClient = msg.senderType === 'client';
                  const isBot = msg.senderType === 'bot';
                  const isHuman = msg.senderType === 'human';

                  // Dynamic tag text
                  let tagText = t.clientTag;
                  let tagBg = "bg-[#2A2723]/5 text-[#2A2723] border-[#2A2723]/10";
                  let bubbleBg = "bg-[#F8F6F1] border-[#e5dfd4]/50";
                  let alignClass = "justify-start";

                  if (isBot) {
                    tagText = t.botTag;
                    tagBg = "bg-purple-50 text-purple-700 border-purple-200";
                    bubbleBg = "bg-purple-50/20 border-purple-100";
                    alignClass = "justify-start";
                  } else if (isHuman) {
                    tagText = t.humanTag;
                    tagBg = "bg-blue-50 text-blue-700 border-blue-200";
                    bubbleBg = "bg-blue-50/10 border-blue-100";
                    alignClass = "justify-end";
                  }

                  if (isClient) {
                    alignClass = "justify-start";
                  }

                  return (
                    <div key={msg.id || index} className={`flex ${alignClass}`}>
                      <div className={`max-w-[85%] rounded-2xl border p-3.5 space-y-2 relative shadow-2xs ${bubbleBg}`}>
                        
                        {/* Sender metadata tags */}
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-[9px] uppercase font-mono font-black px-2 py-0.5 rounded border ${tagBg}`}>
                            {tagText}
                          </span>
                          <span className="text-[9px] font-mono text-warmgray">{msg.timestamp}</span>
                        </div>

                        {/* Message textual block */}
                        <p className="text-xs text-charcoal font-semibold leading-relaxed">
                          {msg.text}
                        </p>

                        {/* Media attachment display */}
                        {msg.mediaUrl && (
                          <div className="mt-2 p-2 bg-white rounded-xl border border-[#e5dfd4] flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-antiquegold shrink-0" />
                              <div>
                                <span className="block text-[10px] font-bold text-charcoal truncate max-w-[160px]">
                                  {msg.mediaName || "Attachment"}
                                </span>
                                <span className="block text-[8px] uppercase font-mono font-black text-warmgray">
                                  Secure PDF Document • 1.4 MB
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" className="py-0.5 px-2 text-[9px] font-bold">
                              View File
                            </Button>
                          </div>
                        )}

                        {/* Ticks read status indicators for sent messages */}
                        {!isClient && (
                          <div className="flex justify-end pt-1">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-warmgray" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-warmgray" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* STICKY QUICK COMPOSER AND ACCESSORIES BAR */}
              <div className="p-4 border-t border-[#e5dfd4]/40 bg-white space-y-3">
                
                {/* QUICK GOVERNED REPLY TEMPLATES CHIPS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-black text-antiquegold tracking-widest block">
                    {t.quickReplies}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_REPLY_TEMPLATES.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleInjectTemplate(item.text)}
                        className="px-2.5 py-1 bg-alabaster hover:bg-[#edeae2] border border-[#e5dfd4] rounded-lg text-[10px] font-bold text-charcoal transition-all"
                      >
                        ⚡ [{item.code}]
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEXT INPUT COMPOSER FOR HUMAN */}
                {activeConv.isOptedOut ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>{t.optOutBanner}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.composerPlaceholder}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendHumanMessage();
                      }}
                      className="w-full px-3 py-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold"
                    />
                    
                    {/* Attach media simulation */}
                    <button
                      onClick={() => triggerToast("Simulated media attachment selected (Maximum 5MB limit)")}
                      className="p-2.5 bg-alabaster hover:bg-[#edeae2] border border-[#e5dfd4] rounded-xl text-charcoal transition-all"
                      title={t.sendMediaBtn}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleSendHumanMessage}
                      className="p-2.5 bg-royalemerald hover:bg-emerald-800 text-white rounded-xl transition-all flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>

      {/* DYNAMIC SIGNIFICANT LOGICAL MOTIF: THE ASCENSION LINE */}
      <Card className="p-4 bg-alabaster/40 border border-[#e5dfd4]/40">
        <div className="flex items-start gap-3">
          {/* Vertical indicator (The Ascension Line Motif) */}
          <div className="w-1.5 bg-antiquegold h-14 rounded-full shrink-0 relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-royalemerald ring-2 ring-white" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black uppercase text-antiquegold tracking-widest">
              Unified SLA Guardrails
            </span>
            <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
              Every manual response triggers an immediate sequence delay lock. This eliminates awkward overlapping bot messages and leaves control securely in the hands of relationship managers.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
};
