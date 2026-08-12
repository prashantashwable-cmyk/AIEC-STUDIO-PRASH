import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, X, ShieldAlert, Clock, AlertTriangle, Search, Filter, HelpCircle,
  TrendingDown, TrendingUp, DollarSign, Award, Percent, Layers, Briefcase, 
  Sparkles, Sliders, CheckCircle2, ChevronRight, RefreshCw, FileText, Gift
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Localization translations for Counter-Offer Approval Screen
const localizations = {
  en: {
    title: "Counter-Offer Approvals",
    subtitle: "Admin command queue for borderline customer counter-offers outside bot auto-clearance limits.",
    searchPlaceholder: "Search by client or building project...",
    standardPrice: "Standard Baseline Price",
    customerAsk: "Customer Counter-Offer",
    marginImpact: "Project Margin Impact",
    slaRemaining: "SLA Decision Window",
    approveBtn: "Approve Deal Price",
    rejectBtn: "Reject Proposal",
    counterBtn: "Propose Custom Counter",
    bundleLabel: "Include Non-Price Concession Bundle",
    bundleSelect: "Select Concession Bundle",
    bundleNone: "No bundled extras (Pure Price Cut)",
    bundleAmc: "1-Year Premium AMC Extension (Worth ₹42,000)",
    bundleVvvf: "Ultra-Smooth VVVF Drive Gearless Upgrade (Worth ₹65,000)",
    bundleInterior: "Imperial Gold Cabin Mirror Interior Finish (Worth ₹35,000)",
    decisionStatus: "Decision Status",
    waitingTime: "Time Elapsed",
    emptyTitle: "No Borderline Offers in Queue",
    emptyDesc: "All negotiations are executing smoothly within bot autonomous safety margins.",
    filterAll: "All Borderline Offers",
    filterCritical: "Critical (<1h SLA)",
    filterBundled: "Contingent Bundles",
    customCounterLabel: "Enter Custom Counter Price (₹)",
    customCounterPlaceholder: "e.g. 1150000",
    submitCounter: "Send Custom Offer",
    toastApproved: "Deal price approved. Syncing with WhatsApp live thread and building final contract draft.",
    toastRejected: "Customer offer rejected. Bot instructed to politely notify client and halt further concessions.",
    toastCountered: "Custom counter-offer of ₹{price} sent. WhatsApp thread updated.",
    complianceDisclaimer: "All decisions are logged under ISO-9001:2015 safety parameters for Prashant Vasant Wable.",
    escalatedLabel: "Escalated to Alerts Dashboard"
  },
  hi: {
    title: "काउंटर-ऑफर स्वीकृतियां",
    subtitle: "स्वायत्त बॉट सीमा से बाहर के सीमांत ग्राहक प्रस्तावों के लिए व्यवस्थापक निर्णय कतार।",
    searchPlaceholder: "ग्राहक या बिल्डिंग प्रोजेक्ट द्वारा खोजें...",
    standardPrice: "मानक आधार मूल्य",
    customerAsk: "ग्राहक का काउंटर-प्रस्ताव",
    marginImpact: "परियोजना मार्जिन प्रभाव",
    slaRemaining: "SLA निर्णय समय सीमा",
    approveBtn: "सौदा मूल्य स्वीकृत करें",
    rejectBtn: "प्रस्ताव अस्वीकार करें",
    counterBtn: "कस्टम काउंटर भेजें",
    bundleLabel: "गैर-मूल्य रियायत बंडल जोड़ें",
    bundleSelect: "रियायत बंडल चुनें",
    bundleNone: "कोई अतिरिक्त बंडल नहीं (शुद्ध मूल्य कटौती)",
    bundleAmc: "1-वर्ष प्रीमियम AMC एक्सटेंशन (कीमत ₹42,000)",
    bundleVvvf: "अल्ट्रा-स्मूथ VVVF गियरलेस ड्राइव अपग्रेड (कीमत ₹65,000)",
    bundleInterior: "इंपीरियल गोल्ड केबिन मिरर इंटीरियर फिनिश (कीमत ₹35,000)",
    decisionStatus: "निर्णय स्थिति",
    waitingTime: "बीता हुआ समय",
    emptyTitle: "कतार में कोई काउंटर-ऑफर नहीं",
    emptyDesc: "सभी बातचीत बॉट स्वायत्त सुरक्षा मार्जिन के भीतर सुचारू रूप से चल रही हैं।",
    filterAll: "सभी प्रस्ताव",
    filterCritical: "महत्वपूर्ण (<1h SLA)",
    filterBundled: "आकस्मिक बंडल",
    customCounterLabel: "कस्टम काउंटर मूल्य दर्ज करें (₹)",
    customCounterPlaceholder: "उदा. 1150000",
    submitCounter: "कस्टम प्रस्ताव भेजें",
    toastApproved: "सौदा मूल्य स्वीकृत। व्हाट्सएप थ्रेड और अंतिम अनुबंध ड्राफ्ट अपडेट किया गया।",
    toastRejected: "प्रस्ताव अस्वीकृत। बॉट को ग्राहक को विनम्रतापूर्वक सूचित करने का निर्देश दिया गया।",
    toastCountered: "₹{price} का कस्टम काउंटर भेजा गया। व्हाट्सएप थ्रेड अपडेट हुआ।",
    complianceDisclaimer: "प्रशांत वसंत वाबले के लिए सभी निर्णय ISO-9001:2015 सुरक्षा मानकों के तहत लॉग किए जाते हैं।",
    escalatedLabel: "अलर्ट डैशबोर्ड पर स्थानांतरित"
  },
  mr: {
    title: "काऊंटर-ऑफर मंजुरी कक्ष",
    subtitle: "स्वयंचलित बॉट मर्यादेबाहेर असलेल्या ग्राहकांच्या काउंटर-ऑफरसाठी प्रशासक निर्णय कतार.",
    searchPlaceholder: "ग्राहक किंवा इमारतीच्या नावाने शोधा...",
    standardPrice: "मानक आधारभूत किंमत",
    customerAsk: "ग्राहकाची काउंटर-ऑफर",
    marginImpact: "प्रकल्प नफा (Margin) परिणाम",
    slaRemaining: "SLA निर्णय वेळ मर्यादा",
    approveBtn: "किंमत मंजूर करा",
    rejectBtn: "प्रस्ताव फेटाळा",
    counterBtn: "नवीन ऑफर पाठवा",
    bundleLabel: "अतिरिक्त गैर-किंमत सवलत बंडल समाविष्ट करा",
    bundleSelect: "सवलत बंडल निवडा",
    bundleNone: "काहीही नाही (केवळ किंमत सवलत)",
    bundleAmc: "१-वर्ष प्रीमियम AMC वाढवून द्या (मूल्य ₹४२,०००)",
    bundleVvvf: "अल्ट्रा-स्मूथ VVVF गियरलेस ड्राइव्ह अपग्रेड (मूल्य ₹६५,०००)",
    bundleInterior: "इंपीरियल गोल्ड केबिन मिरर इंटिरियर फिनिश (मूल्य ₹३५,०००)",
    decisionStatus: "निर्णय स्थिती",
    waitingTime: "झालेला विलंब",
    emptyTitle: "प्रलंबित काउंटर-ऑफर नाहीत",
    emptyDesc: "सर्व बोलणी बॉटच्या स्वयंचलित सुरक्षा मर्यादेत सुरक्षितपणे सुरू आहेत.",
    filterAll: "सर्व काउंटर-ऑफर",
    filterCritical: "अति-तातडीचे (<१ तास SLA)",
    filterBundled: "सवलत बंडलसह",
    customCounterLabel: "नवीन ऑफर किंमत प्रविष्ट करा (₹)",
    customCounterPlaceholder: "उदा. ११५००००",
    submitCounter: "नवीन ऑफर पाठवा",
    toastApproved: "सौदा किंमत मंजूर झाली. व्हॉट्सॲप थेट चॅट आणि अंतिम करारनामा जुळवला जात आहे.",
    toastRejected: "ग्राहकाचा प्रस्ताव नाकारला. बॉटला विनम्र नकार पाठविण्याचा आदेश दिला आहे.",
    toastCountered: "₹{price} ची नवीन ऑफर ग्राहकाला पाठवली गेली.",
    complianceDisclaimer: "सर्व निर्णय प्रशांत वसंत वाबले यांच्या नेतृत्वाखाली ISO-9001:2015 सुरक्षा मानकांनुसार नोंदवले जातात.",
    escalatedLabel: "अलर्ट डॅशबोर्डवर वर्ग"
  }
};

interface CounterOffer {
  id: string;
  quoteId: string;
  customerName: string;
  buildingName: string;
  originalPrice: number;
  customerAskPrice: number;
  marginImpactPct: number; // calculated project margin
  decisionStatus: 'pending' | 'approved' | 'rejected' | 'countered';
  waitingTime: string; // e.g. "45 minutes ago"
  slaRemainingMinutes: number; // SLA countdown
  isContingentOnBundle: boolean;
  contingentBundleType?: string;
  contingentValue?: number;
}

export const CounterOfferApproval: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'bundled'>('all');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>('co-1');
  const [customCounterPrice, setCustomCounterPrice] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<'none' | 'amc' | 'vvvf' | 'interior'>('none');
  const [showCounterInput, setShowCounterInput] = useState(false);

  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  // Seeded Borderline Counter-Offers Queue
  const [offers, setOffers] = useState<CounterOffer[]>([
    {
      id: 'co-1',
      quoteId: 'AIEC-QT-1092',
      customerName: 'Karan Malhotra (Penthouse)',
      buildingName: 'Pratik Heights, Kothrud',
      originalPrice: 1250000,
      customerAskPrice: 1100000, // floor is 1,110,000, asking for 1,100,000
      marginImpactPct: 15.8, // standard is 21%, floor margin is 16.5%. This is 15.8% (borderline!)
      decisionStatus: 'pending',
      waitingTime: '24 mins ago',
      slaRemainingMinutes: 36,
      isContingentOnBundle: false
    },
    {
      id: 'co-2',
      quoteId: 'AIEC-QT-2041',
      customerName: 'Sanjay Deshmukh (President)',
      buildingName: 'Swapnasrushti CHS, Bavdhan',
      originalPrice: 1680000,
      customerAskPrice: 1490000,
      marginImpactPct: 14.2, // standard is 20%, asking for deep discount
      decisionStatus: 'pending',
      waitingTime: '52 mins ago',
      slaRemainingMinutes: 8, // critical SLA!
      isContingentOnBundle: true,
      contingentBundleType: '1-Year Premium AMC Upgrade',
      contingentValue: 42000
    },
    {
      id: 'co-3',
      quoteId: 'AIEC-QT-3088',
      customerName: 'Meera Deshpande',
      buildingName: 'Sai Shradha Residency, Hadapsar',
      originalPrice: 1050000,
      customerAskPrice: 940000,
      marginImpactPct: 16.1, // borderline margin
      decisionStatus: 'pending',
      waitingTime: '2 hours ago',
      slaRemainingMinutes: 120,
      isContingentOnBundle: false
    }
  ]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Filter & search offers
  const filteredOffers = useMemo(() => {
    return offers.filter(item => {
      const matchesSearch = item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.quoteId.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (activeFilter === 'critical') {
        return item.slaRemainingMinutes < 45 && item.decisionStatus === 'pending';
      }
      if (activeFilter === 'bundled') {
        return item.isContingentOnBundle && item.decisionStatus === 'pending';
      }
      return true;
    });
  }, [offers, searchQuery, activeFilter]);

  const activeOffer = useMemo(() => {
    return offers.find(o => o.id === selectedOfferId) || filteredOffers[0] || null;
  }, [offers, selectedOfferId, filteredOffers]);

  // Action: Approve Price
  const handleApprove = (offerId: string) => {
    setOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return { ...o, decisionStatus: 'approved' };
      }
      return o;
    }));
    triggerToast(t.toastApproved);
    setShowCounterInput(false);
  };

  // Action: Reject Offer
  const handleReject = (offerId: string) => {
    setOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return { ...o, decisionStatus: 'rejected' };
      }
      return o;
    }));
    triggerToast(t.toastRejected);
    setShowCounterInput(false);
  };

  // Action: Propose Custom Counter
  const handleSendCustomCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOffer || !customCounterPrice.trim()) return;

    const counterVal = parseInt(customCounterPrice.replace(/[^0-9]/g, ''));
    if (isNaN(counterVal)) return;

    setOffers(prev => prev.map(o => {
      if (o.id === activeOffer.id) {
        return { 
          ...o, 
          decisionStatus: 'countered',
          customerAskPrice: counterVal 
        };
      }
      return o;
    }));

    triggerToast(t.toastCountered.replace('{price}', counterVal.toLocaleString()));
    setCustomCounterPrice('');
    setShowCounterInput(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/25 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Negotiation & Closing Progress (Screen 3 of 10)</span>
            <span>30.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '30%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 73 of 200)</span>
            <span>36.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '36.5%' }} />
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-left space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
          ADMIN TERMINAL • DECISION GATEWAY
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
          <Percent className="w-7 h-7 text-antiquegold" />
          <span>{t.title}</span>
        </h1>
        <p className="text-xs text-warmgray font-semibold max-w-2xl leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Layout split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: Borderline Offers Queue */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Filtering row */}
          <div className="bg-white p-3 rounded-2xl border border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-warmgray w-4 h-4" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-alabaster border border-[#e5dfd4] rounded-xl text-xs text-charcoal focus:outline-none focus:border-antiquegold transition-all font-semibold"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeFilter === 'all' ? 'bg-royalemerald text-white' : 'bg-alabaster text-charcoal hover:bg-[#edeae2]'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => setActiveFilter('critical')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeFilter === 'critical' ? 'bg-red-600 text-white' : 'bg-red-50 text-[#B23B3B] hover:bg-red-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.filterCritical}</span>
              </button>
              <button
                onClick={() => setActiveFilter('bundled')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeFilter === 'bundled' ? 'bg-antiquegold text-white' : 'bg-alabaster text-charcoal hover:bg-[#edeae2]'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{t.filterBundled}</span>
              </button>
            </div>
          </div>

          {/* List queue items */}
          <div className="space-y-3">
            {filteredOffers.length === 0 ? (
              <Card className="p-8 text-center bg-white space-y-3">
                <CheckCircle2 className="w-12 h-12 text-royalemerald mx-auto" />
                <h4 className="font-serif text-base font-black text-charcoal">{t.emptyTitle}</h4>
                <p className="text-xs text-warmgray font-semibold max-w-sm mx-auto leading-relaxed">{t.emptyDesc}</p>
              </Card>
            ) : (
              filteredOffers.map((item) => {
                const isSelected = activeOffer?.id === item.id;
                const isCriticalSLA = item.slaRemainingMinutes < 45;
                const statusColor = item.decisionStatus === 'approved' 
                  ? 'bg-emerald-50 text-[#0E4B3D] border-emerald-200' 
                  : item.decisionStatus === 'rejected' 
                    ? 'bg-red-50 text-[#B23B3B] border-red-200' 
                    : item.decisionStatus === 'countered'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-[#B8873D] border-antiquegold/25';

                return (
                  <motion.div
                    key={item.id}
                    layoutId={`offer-card-${item.id}`}
                    onClick={() => {
                      setSelectedOfferId(item.id);
                      setShowCounterInput(false);
                    }}
                    className={`p-4 rounded-2xl bg-white border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-antiquegold shadow-diffuse ring-1 ring-antiquegold/30' 
                        : 'border-[#e5dfd4]/60 hover:border-antiquegold/45'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-antiquegold uppercase block">
                          {item.quoteId} • {item.buildingName}
                        </span>
                        <strong className="text-charcoal font-serif text-sm block">
                          {item.customerName}
                        </strong>
                      </div>

                      {/* SLA badge indicator */}
                      {item.decisionStatus === 'pending' ? (
                        <div className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold flex items-center gap-1 ${
                          isCriticalSLA ? 'bg-red-50 text-[#B23B3B]' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{item.slaRemainingMinutes}m SLA</span>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${statusColor}`}>
                          {item.decisionStatus}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e5dfd4]/20 pt-3">
                      <div>
                        <span className="text-[8px] font-mono text-warmgray block uppercase">{t.standardPrice}</span>
                        <span className="text-charcoal font-mono font-bold text-xs">₹{item.originalPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-warmgray block uppercase">{t.customerAsk}</span>
                        <span className="text-royalemerald font-mono font-extrabold text-xs">₹{item.customerAskPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Concession bundle flag */}
                    {item.isContingentOnBundle && (
                      <div className="mt-2.5 p-1.5 bg-antiquegold/5 rounded-lg border border-antiquegold/10 flex items-center gap-1.5 text-[9px] text-[#B8873D] font-bold">
                        <Gift className="w-3.5 h-3.5" />
                        <span className="truncate">Contingent: {item.contingentBundleType}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

        </div>

        {/* Right side: Selected Borderline Case Detail & Impact Analysis */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeOffer ? (
              <motion.div
                key={activeOffer.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Hero Header Detail */}
                <Card className="p-5 bg-white space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#e5dfd4]/40 pb-3 gap-2">
                    <div>
                      <span className="text-[9px] font-mono text-warmgray font-bold uppercase">{activeOffer.quoteId} • TRANSACTION CASE</span>
                      <h2 className="font-serif text-lg font-black text-charcoal">{activeOffer.customerName}</h2>
                      <p className="text-xs text-warmgray font-bold">{activeOffer.buildingName}</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-[8px] font-mono text-warmgray uppercase">{t.waitingTime}</span>
                      <span className="text-xs font-mono font-extrabold text-charcoal">{activeOffer.waitingTime}</span>
                    </div>
                  </div>

                  {/* Side-by-side pricing & margin impact analysis */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Standard Price */}
                    <div className="p-3.5 bg-alabaster rounded-xl border border-border">
                      <span className="text-[9px] font-mono text-warmgray uppercase font-bold block mb-1">
                        {t.standardPrice}
                      </span>
                      <span className="text-charcoal font-mono font-extrabold text-base block">
                        ₹{activeOffer.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-warmgray font-semibold block mt-1">
                        Calculated at 21.0% margin
                      </span>
                    </div>

                    {/* Customer Ask Counter-Offer */}
                    <div className="p-3.5 bg-royalemerald/5 rounded-xl border border-royalemerald/15">
                      <span className="text-[9px] font-mono text-royalemerald uppercase font-bold block mb-1">
                        {t.customerAsk}
                      </span>
                      <span className="text-royalemerald font-mono font-extrabold text-base block">
                        ₹{activeOffer.customerAskPrice.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-royalemerald font-bold block mt-1">
                        Requested ₹{(activeOffer.originalPrice - activeOffer.customerAskPrice).toLocaleString()} cut
                      </span>
                    </div>

                    {/* Margin Impact */}
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-antiquegold/25">
                      <span className="text-[9px] font-mono text-antiquegold uppercase font-bold block mb-1">
                        {t.marginImpact}
                      </span>
                      <span className="text-antiquegold font-mono font-extrabold text-base block">
                        {activeOffer.marginImpactPct}%
                      </span>
                      <span className="text-[9px] text-[#B8873D] font-bold block mt-1">
                        {activeOffer.marginImpactPct < 16.5 ? '🚨 Borderline Margin Limit' : '✓ Acceptable Floor'}
                      </span>
                    </div>

                  </div>

                  {/* Detailed explanation of safety rules */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs leading-relaxed text-charcoal font-semibold text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-antiquegold font-bold uppercase">
                      <ShieldAlert className="w-4 h-4 text-antiquegold" />
                      <span>Security Margin Standard (Rule 8.3)</span>
                    </div>
                    <p>
                      The independent AI negotiation bot is prohibited from completing orders generating a final project margin below <strong className="text-charcoal">16.5%</strong>. This case was paused and escalated to your console because the client offered ₹{activeOffer.customerAskPrice.toLocaleString()} (leaving <strong className="text-[#B23B3B]">{activeOffer.marginImpactPct}% margin</strong>).
                    </p>
                  </div>

                  {/* Non-Price Concession bundles */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">
                      {t.bundleLabel}
                    </label>
                    <select
                      value={selectedBundle}
                      onChange={(e: any) => setSelectedBundle(e.target.value)}
                      className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl text-xs text-charcoal focus:outline-none focus:border-antiquegold font-semibold"
                    >
                      <option value="none">{t.bundleNone}</option>
                      <option value="amc">{t.bundleAmc}</option>
                      <option value="vvvf">{t.bundleVvvf}</option>
                      <option value="interior">{t.bundleInterior}</option>
                    </select>
                  </div>

                  {/* Action buttons or Counter price form */}
                  {activeOffer.decisionStatus === 'pending' ? (
                    <div className="space-y-4 pt-2">
                      {!showCounterInput ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          
                          <Button
                            variant="emerald"
                            onClick={() => handleApprove(activeOffer.id)}
                            className="py-2.5 text-xs font-bold"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t.approveBtn}</span>
                          </Button>

                          <button
                            onClick={() => handleReject(activeOffer.id)}
                            className="py-2.5 px-4 bg-red-50 text-[#B23B3B] hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <X className="w-4 h-4" />
                            <span>{t.rejectBtn}</span>
                          </button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCounterInput(true);
                              setCustomCounterPrice((activeOffer.customerAskPrice + 20000).toString());
                            }}
                            className="py-2.5 text-xs font-bold"
                          >
                            <Sliders className="w-4 h-4" />
                            <span>{t.counterBtn}</span>
                          </Button>

                        </div>
                      ) : (
                        <form onSubmit={handleSendCustomCounter} className="p-4 bg-alabaster rounded-xl border border-border text-left space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">
                              {t.customCounterLabel}
                            </label>
                            <button 
                              type="button" 
                              onClick={() => setShowCounterInput(false)}
                              className="text-xs text-warmgray hover:text-charcoal font-bold underline"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 font-mono text-warmgray text-xs">₹</span>
                              <input 
                                type="text"
                                value={customCounterPrice}
                                onChange={(e) => setCustomCounterPrice(e.target.value)}
                                placeholder={t.customCounterPlaceholder}
                                className="w-full pl-6 p-2 bg-white border border-[#e5dfd4] rounded-lg text-charcoal font-mono text-xs"
                                required
                              />
                            </div>
                            <Button
                              type="submit"
                              variant="primary"
                              className="py-2 px-4 text-xs font-bold shrink-0"
                            >
                              <span>{t.submitCounter}</span>
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2.5 text-royalemerald text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                      <div>
                        <span>Decision Applied Successfully ({activeOffer.decisionStatus.toUpperCase()})</span>
                        <span className="block text-[10px] font-medium opacity-80 mt-0.5">The customer was notified on WhatsApp. Proceeding to deal finalization stage.</span>
                      </div>
                    </div>
                  )}

                </Card>

                {/* Consolidated customer activity log */}
                <Card className="p-5 bg-white text-left space-y-4">
                  <h3 className="font-serif text-sm font-black text-charcoal border-b border-[#e5dfd4]/30 pb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-antiquegold" />
                    <span>Customer Interaction History</span>
                  </h3>

                  {/* Vertically Aligned Ascension Line style history */}
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-antiquegold/30" />

                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-royalemerald ring-4 ring-emerald-50" />
                      <div className="text-xs">
                        <span className="font-mono text-[9px] text-warmgray">10:15 AM</span>
                        <p className="text-charcoal font-semibold">Inquired about competitor pricing discounts (~18% discount).</p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-royalemerald ring-4 ring-emerald-50" />
                      <div className="text-xs">
                        <span className="font-mono text-[9px] text-warmgray">10:16 AM</span>
                        <p className="text-charcoal font-semibold">Bot auto-countered at ₹11,80,000 (V2 version locked).</p>
                      </div>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-50" />
                      <div className="text-xs">
                        <span className="font-mono text-[9px] text-warmgray">10:30 AM</span>
                        <p className="text-charcoal font-semibold">Offered ₹11,00,000. Suspended and flagged below 16.5% floor margin.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-12 text-center bg-white space-y-4">
                <ShieldAlert className="w-16 h-16 text-antiquegold mx-auto" />
                <h3 className="font-serif text-lg font-black text-charcoal">Select an Escalated Offer</h3>
                <p className="text-xs text-warmgray max-w-sm mx-auto font-semibold leading-relaxed">
                  No case selected or all available items have been cleared.
                </p>
              </Card>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ISO compliance disclaimer bottom row */}
      <div className="p-4 bg-alabaster rounded-2xl border border-border text-center text-[10px] font-mono text-warmgray font-bold">
        🛡️ {t.complianceDisclaimer}
      </div>

    </div>
  );
};
