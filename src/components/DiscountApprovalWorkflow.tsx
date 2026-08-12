import React, { useState, useMemo } from 'react';
import { 
  Percent, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, User, ArrowRight, 
  Clock, ShieldCheck, Flame, RefreshCw, Send, Check, MessageSquare, Info, 
  Plus, ChevronDown, ChevronUp, AlertCircle, Sparkles, HelpCircle, Lock, Eye
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

interface DiscountRequest {
  id: string;
  quoteId: string;
  salesperson: string;
  customerName: string;
  originalPrice: number;
  requestedDiscountPct: number;
  resultingMarginPct: number;
  urgencyLevel: 'standard' | 'high' | 'critical';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  rejectionReason?: string;
  dateRequested: string;
  isRepeatedAttempt?: boolean;
  requiresRevalidation?: boolean;
}

export const DiscountApprovalWorkflow: React.FC<{ 
  user: any; 
  onNavigateToPreview?: () => void;
}> = ({ user, onNavigateToPreview }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  
  // Simulated initial requests state
  const [requests, setRequests] = useState<DiscountRequest[]>([
    {
      id: 'dr-1',
      quoteId: 'AIEC-QT-1092',
      salesperson: 'Amit Shah (Pune Central)',
      customerName: 'Karan Malhotra (Penthouse)',
      originalPrice: 1250000,
      requestedDiscountPct: 12, // 12% is above Sales delegation limit of 5%
      resultingMarginPct: 18, // Normal baseline is 30% margin
      urgencyLevel: 'high',
      reason: 'Competitor Schindler offered a lower pricing. Client is ready to sign today if matched.',
      status: 'pending',
      dateRequested: '2026-07-11',
      isRepeatedAttempt: false,
      requiresRevalidation: false
    },
    {
      id: 'dr-2',
      quoteId: 'AIEC-QT-1095',
      salesperson: 'Prakash Kadam (Mumbai Metro)',
      customerName: 'Shree Krishna Developers',
      originalPrice: 2840000,
      requestedDiscountPct: 18, // Deep discount, pushes margin to 12% (floor is 15%)
      resultingMarginPct: 12,
      urgencyLevel: 'critical',
      reason: 'Bulk deal for 3 identical lifts. Needs urgent approval as owner is traveling tonight.',
      status: 'pending',
      dateRequested: '2026-07-10',
      isRepeatedAttempt: true, // Marked because he submitted this twice
      requiresRevalidation: true // Cost changed due to steel price index revision today
    },
    {
      id: 'dr-3',
      quoteId: 'AIEC-QT-1081',
      salesperson: 'Amit Shah (Pune Central)',
      customerName: 'Dr. Anurag Deshpande',
      originalPrice: 950000,
      requestedDiscountPct: 4, // Below 5%, was auto-approved/approved quickly
      resultingMarginPct: 26,
      urgencyLevel: 'standard',
      reason: 'Goodwill gesture for senior citizen medical emergency lift.',
      status: 'approved',
      approverId: 'Prashant Wable (Admin)',
      dateRequested: '2026-07-09',
      isRepeatedAttempt: false,
      requiresRevalidation: false
    },
    {
      id: 'dr-4',
      quoteId: 'AIEC-QT-1077',
      salesperson: 'Prakash Kadam (Mumbai Metro)',
      customerName: 'Vikas Co-op Society',
      originalPrice: 1540000,
      requestedDiscountPct: 15,
      resultingMarginPct: 15,
      urgencyLevel: 'high',
      reason: 'Unreasonable pressure from local society committee.',
      status: 'rejected',
      approverId: 'Prashant Wable (Admin)',
      rejectionReason: 'Margin drops precisely below our corporate safety minimum. Offer the AMC voucher instead.',
      dateRequested: '2026-07-08',
      isRepeatedAttempt: false,
      requiresRevalidation: false
    }
  ]);

  // Form submission state
  const [newDiscountPct, setNewDiscountPct] = useState<number>(8);
  const [newReason, setNewReason] = useState('Client requested competitive matching discount to close deal.');
  const [newUrgency, setNewUrgency] = useState<'standard' | 'high' | 'critical'>('high');
  const [newCustomer, setNewCustomer] = useState('Supreme Heights Apartment (Kothrud)');
  const [newPrice, setNewPrice] = useState<number>(1450000);

  // Fallback state logic when Admin is offline/delayed
  const [adminOfflineMode, setAdminOfflineMode] = useState<boolean>(false);

  // Counter proposal input state per request id
  const [counterValues, setCounterValues] = useState<Record<string, number>>({});

  // Multilingual translations
  const t = useMemo(() => {
    const translations = {
      en: {
        title: "Discount & Approval Control Room",
        subtitle: "Review, evaluate, and authorize custom discount requests that exceed automated safety floor rules. Track real-time margin thresholds.",
        badgeTitle: "ESCROW CONTRACT CONTROL • MODULE 7 OF 20",
        formTitle: "Submit New Discount Authorization Request",
        formDesc: "All pricing options exceeding 5% delegation limits are automatically routed here for senior executive approval.",
        priceLabel: "Quotation Baseline Value",
        discountPct: "Requested Discount Percentage",
        marginPct: "Resulting Margin Level",
        urgency: "Request Urgency Tier",
        justification: "Strategic Deal Justification",
        submitRequestBtn: "Escalate to Approvals",
        approveBtn: "Authorize Discount",
        rejectBtn: "Reject Request",
        rejectionPlaceholder: "Provide a mandatory constructive reason...",
        counterBtn: "Propose Counter Discount",
        auditTitle: "Discount Authorization Log & Archive",
        offlineNoticeTitle: "Admin Offline Safeguard Fallback Activated",
        offlineNoticeDesc: "To ensure deal momentum during extended offline periods, a secondary policy is active: minor discounts (under 7%) will auto-approve after 4 hours, and high-urgency quotes have custom auto-decline protections.",
        revalidateAlert: "Warning: Baseline raw material indexes have been revised since this quote was formulated. Please re-validate the baseline cost parameters before approval.",
        repeatedAlert: "Repeated Submission Warning: This specific salesperson has escalated this quote repeatedly. Admin review of client negotiations is advised.",
        authorizedLimit: "Your Sales Authorized Limit: 5.0% • Current Requested: ",
        errorMarginFloor: "Margin Floor Redline Crossed (15%)!",
        successToast: "Discount request successfully submitted to Prashant Wable's active queue.",
        approvedToast: "Quotation successfully approved! A new official immutable quotation version was generated.",
        rejectedToast: "Quotation request successfully rejected with written justification.",
        counterToast: "Counter suggestion registered. Notice dispatched to Sales operator.",
        pendingQueueTitle: "Active Escalations Queue",
        emptyQueue: "No pending discount requests found in this sector.",
        standard: "Standard Delivery",
        high: "High Urgency",
        critical: "Critical Escalation 🔥",
        viewActiveQuote: "View Active Proposal Spec"
      },
      hi: {
        title: "छूट और अनुमोदन नियंत्रण कक्ष",
        subtitle: "कस्टम छूट अनुरोधों की समीक्षा और मूल्यांकन करें जो स्वचालित सुरक्षा नियमों से अधिक हैं।",
        badgeTitle: "अनुबंध सुरक्षा नियंत्रण • मॉड्यूल 7 का 20",
        formTitle: "नया छूट प्राधिकरण अनुरोध सबमिट करें",
        formDesc: "5% से अधिक के सभी मूल्य निर्धारण विकल्प वरिष्ठ कार्यकारी अनुमोदन के लिए स्वचालित रूप से यहां भेजे जाते हैं।",
        priceLabel: "कोटेशन बेसलाइन मूल्य",
        discountPct: "अनुरोधित छूट प्रतिशत",
        marginPct: "परिणामी मार्जिन स्तर",
        urgency: "अनुरोध तात्कालिकता स्तर",
        justification: "रणनीतिक सौदे का औचित्य",
        submitRequestBtn: "अनुमोदन के लिए भेजें",
        approveBtn: "छूट अधिकृत करें",
        rejectBtn: "अनुरोध अस्वीकार करें",
        rejectionPlaceholder: "एक अनिवार्य रचनात्मक कारण प्रदान करें...",
        counterBtn: "जवाबी छूट का प्रस्ताव रखें",
        auditTitle: "छूट प्राधिकरण लॉग और पुरालेख",
        offlineNoticeTitle: "एडमिन ऑफ़लाइन सुरक्षा फ़ालबैक सक्रिय",
        offlineNoticeDesc: "लंबे समय तक ऑफ़लाइन रहने के दौरान काम जारी रखने के लिए: मामूली छूट (7% से कम) 4 घंटे के बाद स्वतः स्वीकृत हो जाएगी।",
        revalidateAlert: "चेतावनी: इस कोट को तैयार करने के बाद से बुनियादी कच्चे माल की कीमतों में संशोधन किया गया है।",
        repeatedAlert: "बार-बार सबमिशन की चेतावनी: इस विक्रेता ने इस उद्धरण को बार-बार भेजा है।",
        authorizedLimit: "आपकी बिक्री अधिकृत सीमा: 5.0% • वर्तमान अनुरोधित: ",
        errorMarginFloor: "मार्जिन फ्लोर रेडलाइन पार (15%)!",
        successToast: "छूट अनुरोध सफलतापूर्वक प्रशांत वाबले की सक्रिय कतार में सबमिट किया गया।",
        approvedToast: "कोटेशन सफलतापूर्वक स्वीकृत! एक नया आधिकारिक संस्करण तैयार किया गया।",
        rejectedToast: "लिखित औचित्य के साथ कोटेशन अनुरोध सफलतापूर्वक खारिज कर दिया गया।",
        counterToast: "जवाबी सुझाव दर्ज किया गया। सेल्स ऑपरेटर को सूचित कर दिया गया है।",
        pendingQueueTitle: "सक्रिय एस्केलेशन कतार",
        emptyQueue: "इस क्षेत्र में कोई लंबित छूट अनुरोध नहीं मिला।",
        standard: "मानक वितरण",
        high: "उच्च तात्कालिकता",
        critical: "गंभीर एस्केलेशन 🔥",
        viewActiveQuote: "सक्रिय प्रस्ताव विशिष्टता देखें"
      },
      mr: {
        title: "सवलत आणि मंजुरी नियंत्रण कक्ष",
        subtitle: "स्वयंचलित सुरक्षा नियमांपेक्षा अधिक असलेल्या सवलतीच्या विनंत्यांचे पुनरावलोकन करा आणि मंजुरी द्या.",
        badgeTitle: "सुरक्षितता नियंत्रण • मॉड्युल ७ ऑफ २०",
        formTitle: "सवलत मंजुरीसाठी नवीन अर्ज पाठवा",
        formDesc: "५% मर्यादेपेक्षा जास्त असलेल्या सर्व सवलतींच्या विनंत्या स्वयंचलितपणे अंतिम मंजुरीसाठी वरिष्ठ अधिकाऱ्यांकडे पाठवल्या जातात.",
        priceLabel: "लिफ्टचा मूळ प्रस्ताव दर",
        discountPct: "मागणी केलेली सवलत टक्केवारी",
        marginPct: "सवलतीनंतर उरणारा नफा (Margin)",
        urgency: "काम किती तातडीचे आहे?",
        justification: "सवलत देण्याचे ठोस कारण",
        submitRequestBtn: "मंजुरीसाठी सादर करा",
        approveBtn: "सवलत मंजूर करा",
        rejectBtn: "विनंती नाकारा",
        rejectionPlaceholder: "नकार देण्याचे महत्त्वाचे कारण लिहा...",
        counterBtn: "पर्यायी सवलत सुचवा",
        auditTitle: "सवलत मंजुरीचा इतिहास आणि नोंदी",
        offlineNoticeTitle: "अ‍ॅडमिन अनुपस्थित असतानाचा स्वयंचलित नियम सक्रिय",
        offlineNoticeDesc: "महत्त्वाचे ग्राहक थांबू नयेत म्हणून: ७% पेक्षा कमी सवलत अर्ज ४ तासांनंतर स्वयंचलितपणे मंजूर होतील.",
        revalidateAlert: "चेतावनी: या लिफ्टच्या दरांमध्ये अलीकडेच सुधारणा झाली आहे, कृपया मंजुरीपूर्वी नवीन कच्चा माल खर्च तपासा.",
        repeatedAlert: "वारंवार सादरीकरण चेतावणी: या सेल्स प्रतिनिधीने एकाच ग्राहकासाठी अनेकदा अर्ज पाठवला आहे.",
        authorizedLimit: "प्रतिनिधी मर्यादा: ५.०% • सध्या मागणी केलेले: ",
        errorMarginFloor: "नफ्याची अंतिम मर्यादा ओलांडली (15%)!",
        successToast: "सवलत विनंती यशस्वीरित्या प्रशांत वाबळे यांच्या खात्याकडे पाठवली गेली.",
        approvedToast: "सवलत मंजूर झाली आहे! नवीन प्रस्ताव ग्राहकासाठी तयार झाला आहे.",
        rejectedToast: "सवलत नाकारण्यात आली आहे आणि सेल्स प्रतिनिधीला कळवले गेले आहे.",
        counterToast: "पर्यायी सवलत नोंदवली गेली. सेल्स ऑपरेटरला संदेश पाठवला आहे.",
        pendingQueueTitle: "प्रलंबित सवलत अर्ज",
        emptyQueue: "सध्या एकही प्रलंबित सवलत अर्ज उपलब्ध नाही.",
        standard: "सर्वसाधारण वेळ",
        high: "तातडीचे काम",
        critical: "अतिशय तातडीचे काम 🔥",
        viewActiveQuote: "सक्रिय प्रस्ताव तपशील पहा"
      }
    };
    return translations[language] || translations.en;
  }, [language]);

  // Derived calculations for Margin impact
  // Normal baseline margin on full price is 30%.
  // Every 1% discount reduces margin by exactly 1%.
  const currentCalculatedMargin = useMemo(() => {
    return Math.max(0, 30 - newDiscountPct);
  }, [newDiscountPct]);

  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDiscountPct <= 0) return;

    const newReq: DiscountRequest = {
      id: `dr-${requests.length + 1}`,
      quoteId: `AIEC-QT-${1000 + Math.floor(Math.random() * 900)}`,
      salesperson: user?.name || 'Amit Shah (Pune Central)',
      customerName: newCustomer,
      originalPrice: newPrice,
      requestedDiscountPct: newDiscountPct,
      resultingMarginPct: currentCalculatedMargin,
      urgencyLevel: newUrgency,
      reason: newReason,
      status: 'pending',
      dateRequested: new Date().toISOString().split('T')[0],
      isRepeatedAttempt: false,
      requiresRevalidation: false
    };

    setRequests(prev => [newReq, ...prev]);
    setNewCustomer('');
    setNewReason('');
    setNewDiscountPct(8);
    triggerToast(t.successToast);
  };

  const handleApproveRequest = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'approved',
          approverId: user?.name || 'Prashant Wable (Admin)'
        };
      }
      return req;
    }));
    triggerToast(t.approvedToast);
  };

  const handleRejectRequest = (id: string, rejectionReason: string) => {
    if (!rejectionReason.trim()) {
      triggerToast("Written justification is mandatory for rejecting corporate discounts.");
      return;
    }
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'rejected',
          approverId: user?.name || 'Prashant Wable (Admin)',
          rejectionReason
        };
      }
      return req;
    }));
    triggerToast(t.rejectedToast);
  };

  const handleSuggestCounter = (id: string, counterPct: number) => {
    if (counterPct <= 0 || counterPct >= 30) {
      triggerToast("Counter discount percentage is not within standard parameters.");
      return;
    }
    // Update request with counter-recommendation details and resolve/approve with counter value
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'approved',
          requestedDiscountPct: counterPct,
          resultingMarginPct: 30 - counterPct,
          approverId: `${user?.name || 'Prashant Wable'} (Counter Proposal)`,
          reason: `${req.reason} [Counter-Proposed by Admin at ${counterPct}%]`
        };
      }
      return req;
    }));
    triggerToast(t.counterToast);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Filter lists
  const pendingRequests = useMemo(() => requests.filter(r => r.status === 'pending'), [requests]);
  const auditRequests = useMemo(() => requests.filter(r => r.status !== 'pending'), [requests]);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notice Banner */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 7 of 10)</span>
            <span>70.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 67 of 200)</span>
            <span>33.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '33.5%' }} />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            {t.badgeTitle}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1 flex items-center gap-2">
            <Percent className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Offline Fallback toggle */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[rgba(184,135,61,0.2)]">
          <div className="text-right">
            <span className="text-[10px] font-bold text-charcoal block">Admin Offline Fallback</span>
            <span className="text-[8px] text-warmgray font-mono">Auto-approvals trigger logic</span>
          </div>
          <button 
            onClick={() => {
              setAdminOfflineMode(!adminOfflineMode);
              triggerToast(adminOfflineMode ? "Admin safeguard offline policy disabled." : "Offline safeguard policy successfully engaged.");
            }}
            className="text-antiquegold"
          >
            <div className={`w-12 h-6 rounded-full p-0.5 transition-all duration-300 ${adminOfflineMode ? 'bg-royalemerald' : 'bg-neutral-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform ${adminOfflineMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Admin Offline Alert state banner */}
      {adminOfflineMode && (
        <div className="p-4 bg-amber-50 border border-antiquegold/30 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-antiquegold shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">{t.offlineNoticeTitle}</h4>
            <p className="text-[11px] text-warmgray font-semibold leading-relaxed">
              {t.offlineNoticeDesc}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Submit request form */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4] pb-3">
              <h3 className="font-serif text-base font-black text-charcoal">{t.formTitle}</h3>
              <p className="text-[10px] text-warmgray font-semibold mt-0.5">{t.formDesc}</p>
            </div>

            <form onSubmit={handleSubmitNewRequest} className="space-y-4 text-xs font-semibold">
              
              <div className="space-y-1">
                <label className="text-warmgray font-mono text-[9px] uppercase">Select Target Proposal Client</label>
                <input 
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="e.g. Supreme Heights Apartment"
                  className="w-full p-3 rounded-xl bg-alabaster border border-[#e5dfd4] text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-warmgray font-mono text-[9px] uppercase">{t.priceLabel}</label>
                  <input 
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-3 rounded-xl bg-alabaster border border-[#e5dfd4] text-charcoal font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-warmgray font-mono text-[9px] uppercase">{t.urgency}</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-alabaster border border-[#e5dfd4] text-charcoal"
                  >
                    <option value="standard">{t.standard}</option>
                    <option value="high">{t.high}</option>
                    <option value="critical">{t.critical}</option>
                  </select>
                </div>
              </div>

              {/* Slider for discount percentage */}
              <div className="space-y-2 p-4 bg-alabaster rounded-2xl border border-[#e5dfd4]/40">
                <div className="flex justify-between items-baseline font-mono text-[10px] text-charcoal">
                  <span>{t.discountPct}</span>
                  <span className="text-antiquegold font-black text-sm">{newDiscountPct}%</span>
                </div>

                <input 
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={newDiscountPct}
                  onChange={(e) => setNewDiscountPct(parseInt(e.target.value))}
                  className="w-full accent-antiquegold"
                />

                <div className="flex justify-between text-[9px] text-warmgray font-semibold mt-1">
                  <span>{t.authorizedLimit} 5.0%</span>
                  {newDiscountPct > 5 ? (
                    <span className="text-[#B23B3B] font-bold">EXCEEDS SALES LIMIT (Escalating)</span>
                  ) : (
                    <span className="text-royalemerald font-bold">Auto-approved</span>
                  )}
                </div>
              </div>

              {/* Resulting Margin box */}
              <div className={`p-4 rounded-2xl border transition-all ${
                currentCalculatedMargin < 15 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-emerald-50/50 border-emerald-100'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-warmgray block uppercase">{t.marginPct}</span>
                    <span className="font-serif text-lg font-black text-charcoal mt-1 block">
                      {currentCalculatedMargin}%
                    </span>
                  </div>
                  {currentCalculatedMargin < 15 && (
                    <span className="bg-red-100 text-red-700 text-[8px] uppercase tracking-wider font-mono font-bold px-2 py-1 rounded">
                      {t.errorMarginFloor}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-warmgray mt-1 font-medium leading-normal">
                  Standard baseline corporate margin is 30.0%. Safety threshold floor is set to 15.0%.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-warmgray font-mono text-[9px] uppercase">{t.justification}</label>
                <textarea 
                  required
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-alabaster border border-[#e5dfd4] text-charcoal"
                  placeholder="Provide precise customer situation details..."
                />
              </div>

              <Button
                type="submit"
                variant={newDiscountPct > 15 ? "danger" : "primary"}
                fullWidth
                className="text-xs font-bold py-3.5"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{t.submitRequestBtn}</span>
              </Button>

            </form>
          </Card>

        </div>

        {/* Right column: Active Approval Queue & Audits */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active pending queue */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-serif text-lg font-black text-charcoal flex items-center gap-2">
                <span>{t.pendingQueueTitle}</span>
                <span className="bg-antiquegold text-white font-mono text-xs font-black px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              </h2>
            </div>

            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center bg-white space-y-3">
                <ShieldCheck className="w-12 h-12 text-royalemerald mx-auto opacity-75" />
                <h4 className="font-serif text-sm font-bold text-charcoal">{t.emptyQueue}</h4>
                <p className="text-xs text-warmgray font-medium">All escalated discount requests have been successfully reviewed and resolved.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => {
                  const isCritical = req.urgencyLevel === 'critical';
                  const isHigh = req.urgencyLevel === 'high';
                  
                  return (
                    <Card 
                      key={req.id}
                      className={`p-6 bg-white relative overflow-hidden border ${
                        isCritical 
                          ? 'border-2 border-red-500 shadow-md' 
                          : req.isRepeatedAttempt 
                            ? 'border-2 border-antiquegold' 
                            : 'border-[rgba(184,135,61,0.15)]'
                      }`}
                    >
                      {/* Critical badge glow */}
                      {isCritical && (
                        <div className="absolute top-0 right-0 left-0 bg-red-600 text-white text-[9px] uppercase font-mono tracking-widest text-center py-1 font-extrabold">
                          CRITICAL HIGH-VALUE ESCALATION • IMMEDIATE DISPATCH
                        </div>
                      )}

                      <div className="space-y-4 pt-3">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-[#e5dfd4]/40 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-antiquegold block font-extrabold">{req.quoteId}</span>
                            <h3 className="font-serif text-base font-black text-charcoal mt-0.5">{req.customerName}</h3>
                            <span className="text-[10px] text-warmgray font-semibold block mt-0.5">Escalated by {req.salesperson} on {req.dateRequested}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {req.isRepeatedAttempt && (
                              <span className="bg-amber-100 text-amber-800 font-mono text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border border-amber-200">
                                REPEATED SUBMISSION
                              </span>
                            )}
                            <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                              req.urgencyLevel === 'critical' 
                                ? 'bg-red-100 text-red-700' 
                                : req.urgencyLevel === 'high' 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {req.urgencyLevel === 'critical' ? t.critical : req.urgencyLevel === 'high' ? t.high : t.standard}
                            </span>
                          </div>
                        </div>

                        {/* Edge Case Alert warnings */}
                        {req.requiresRevalidation && (
                          <div className="p-3 bg-amber-50 border border-antiquegold/30 rounded-xl flex items-start gap-2 text-[10px]">
                            <AlertCircle className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
                            <p className="text-warmgray font-semibold leading-relaxed">
                              {t.revalidateAlert}
                            </p>
                          </div>
                        )}

                        {req.isRepeatedAttempt && (
                          <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex items-start gap-2 text-[10px]">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-warmgray font-semibold leading-relaxed">
                              {t.repeatedAlert}
                            </p>
                          </div>
                        )}

                        {/* Calculations summary row */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                            <span className="text-[8px] font-mono text-warmgray block uppercase">Baseline Rate</span>
                            <span className="font-serif text-sm font-black text-charcoal">₹{req.originalPrice.toLocaleString()}</span>
                          </div>
                          <div className="p-2.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                            <span className="text-[8px] font-mono text-warmgray block uppercase">Discount Requested</span>
                            <span className="font-serif text-sm font-black text-charcoal text-[#B23B3B]">{req.requestedDiscountPct}%</span>
                          </div>
                          <div className="p-2.5 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                            <span className="text-[8px] font-mono text-warmgray block uppercase">Resulting Margin</span>
                            <span className={`font-serif text-sm font-black ${req.resultingMarginPct < 15 ? 'text-red-700 font-extrabold' : 'text-royalemerald'}`}>
                              {req.resultingMarginPct}%
                            </span>
                          </div>
                        </div>

                        {/* Written Justification justification */}
                        <div className="p-3.5 bg-alabaster/50 rounded-xl border border-[#e5dfd4]/30">
                          <span className="text-[8px] font-mono text-warmgray uppercase block mb-1">Sales Justification Reason:</span>
                          <p className="text-xs text-charcoal font-semibold italic">
                            "{req.reason}"
                          </p>
                        </div>

                        {/* Interactive counters/approvals workspace */}
                        <div className="space-y-3 pt-2 border-t border-[#e5dfd4]/40">
                          
                          {/* Counter proposal inputs row */}
                          <div className="flex flex-col sm:flex-row items-center gap-3 bg-alabaster p-3 rounded-xl border border-[#e5dfd4]/30 text-xs">
                            <div className="w-full sm:w-1/2">
                              <span className="text-[9px] font-mono text-warmgray block uppercase">Adjust Counter proposal (%)</span>
                              <input 
                                type="number" 
                                min="1"
                                max="15"
                                value={counterValues[req.id] || 6}
                                onChange={(e) => setCounterValues({
                                  ...counterValues,
                                  [req.id]: Math.min(25, Math.max(1, parseInt(e.target.value) || 0))
                                })}
                                className="w-full bg-white border border-[#e5dfd4] rounded p-1.5 mt-0.5 font-bold"
                              />
                            </div>
                            <button
                              onClick={() => handleSuggestCounter(req.id, counterValues[req.id] || 6)}
                              className="w-full sm:w-1/2 py-2 px-3 bg-white border border-antiquegold text-antiquegold hover:bg-antiquegold/10 rounded-lg text-[11px] font-mono uppercase font-black tracking-wider flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{t.counterBtn}</span>
                            </button>
                          </div>

                          {/* Action decision buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => {
                                const rej = prompt("Please provide a mandatory justification for rejecting this discount escalation:") || "";
                                if (rej) handleRejectRequest(req.id, rej);
                              }}
                              className="w-full sm:w-1/3 py-2 px-3 bg-red-50 text-[#B23B3B] border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>{t.rejectBtn}</span>
                            </button>

                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="w-full sm:w-2/3 py-2.5 px-4 bg-royalemerald hover:bg-[#0b3c31] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{t.approveBtn}</span>
                            </button>
                          </div>

                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit Trail List Section */}
          <div className="space-y-4">
            <h2 className="font-serif text-base font-black text-charcoal">{t.auditTitle}</h2>
            
            <div className="space-y-3">
              {auditRequests.map((req) => {
                const isApproved = req.status === 'approved';
                return (
                  <Card key={req.id} className="p-4 bg-alabaster/30 border border-[#e5dfd4]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-warmgray">{req.quoteId}</span>
                        <strong className="text-charcoal">{req.customerName}</strong>
                      </div>
                      <p className="text-warmgray text-[11px]">
                        Requested discount: <strong className="text-charcoal">{req.requestedDiscountPct}%</strong> • Approved by: <span className="italic text-charcoal">{req.approverId || 'Admin'}</span>
                      </p>
                      {req.rejectionReason && (
                        <p className="text-[10px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-100 mt-1">
                          Rejection justification: "{req.rejectionReason}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${
                        isApproved ? 'bg-emerald-100 text-royalemerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>

                      {onNavigateToPreview && (
                        <button 
                          onClick={onNavigateToPreview}
                          className="p-1.5 hover:bg-white rounded border border-[#e5dfd4]/40"
                          title="View proposal preview page"
                        >
                          <Eye className="w-4 h-4 text-antiquegold" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
