import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, Eye, ArrowRight, RefreshCw, 
  HelpCircle, ClipboardCheck, PhoneCall, AlertCircle, 
  Clock, ShieldCheck, Mail, Send, Sparkles, MessageSquare, CornerUpLeft, Lock
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';

interface QuotationRecord {
  id: string;
  customerName: string;
  buildingName: string;
  location: string;
  finalPrice: number;
  configSummary: string;
  validityDate: string;
  isExpired: boolean;
  status: 'viewed' | 'delivered' | 'accepted' | 'revising' | 'expired';
  version: number;
  openCount: number;
  lastOpened: string;
  leadId: string;
}

export const QuotationPreview: React.FC<{ user: any; onAcceptQuote?: (quote: QuotationRecord) => void }> = ({ user, onAcceptQuote }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'proposal' | 'specifications' | 'terms'>('proposal');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [changeRequestText, setChangeRequestText] = useState('');
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  
  // Simulation for live editing lock
  const [isSalesRevising, setIsSalesRevising] = useState(false);

  // Initial quotation records
  const [quotations, setQuotations] = useState<QuotationRecord[]>([
    {
      id: "QT-2026-9042",
      customerName: "Mr. Ramesh Patil",
      buildingName: "Royal Palace Villa Complex",
      location: "Kothrud, Pune",
      finalPrice: 1148000,
      configSummary: "Bespoke 6-Passenger Gearless Traction Elevating System. Premium Alabaster Cabin Interior Polish, 5 Openings with Automatic Side-Opening Telescopic landing doors. Engineered with Emergency Automatic Rescue Device (ARD) & Phase-II Firefighter Key Controls. Enforced 3-Phase 415V electrical support with 1.0 m/s drive speeds.",
      validityDate: "2026-07-26", // Valid
      isExpired: false,
      status: 'viewed',
      version: 1,
      openCount: 4,
      lastOpened: "2026-07-11 14:12",
      leadId: "lead_srv_001"
    },
    {
      id: "QT-2026-8015",
      customerName: "Prashant Vasant Wable",
      buildingName: "Skyview Heights Co-Op Society",
      location: "Baner Highway, Pune",
      finalPrice: 2845000,
      configSummary: "Heavy Duty 15-Passenger Commercial Grade MRL (Machine Room-Less) Traction Elevator. Luxury Finish stainless steel, 22 stops, 2.0 m/s high speed, Auto Center-Opening premium heavy-use doors.",
      validityDate: "2026-07-05", // Lapsed
      isExpired: true,
      status: 'expired',
      version: 2,
      openCount: 12,
      lastOpened: "2026-07-05 09:30",
      leadId: "lead_srv_004"
    }
  ]);

  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("QT-2026-9042");

  const currentQuote = useMemo(() => {
    return quotations.find(q => q.id === selectedQuoteId) || quotations[0];
  }, [selectedQuoteId, quotations]);

  // Multilingual support
  const t = useMemo(() => {
    const localizations = {
      en: {
        title: "Quotation Portal • Customer Cockpit",
        subtitle: "Official client-facing proposal terminal. Clean visual breakdown containing no internal margins or manufacturing costs.",
        proposalTab: "Executive Proposal",
        specsTab: "Technical Specs",
        termsTab: "Terms & Conditions",
        acceptBtn: "Approve and Finalize Deal",
        requestChangesBtn: "Request Revisions",
        expiredTitle: "This Quotation Has Expired",
        expiredDesc: "Prices locked on this quote were valid until the date shown. Tap below to request an updated proposal from your Sales Advisor.",
        reQuoteBtn: "Request New Price Quote",
        revisionLockTitle: "Sales Revision in Progress",
        revisionLockDesc: "Your account advisor is currently adjusting the configuration or discount parameters. Acceptance is temporarily locked until completed.",
        viewedBadge: "Opened & Tracked",
        deliveredBadge: "Delivered",
        acceptedBadge: "Contract finalized",
        expiredBadge: "Expired",
        revisingBadge: "Being Adjusted",
        contractBasisMsg: "Agreement Binding: On acceptance, this specific layout configuration becomes structurally immutable and transfers to the production engineering ledger.",
        priceLabel: "Total Investment (GST 18% Inclusive)",
        termsLabel: "Terms of Payment & Warranties",
        warrantyDesc: "Includes AIEC premium 1-year comprehensive hardware warranty and 4 quarterly preventive safety checks.",
        paymentDesc: "50% advance for raw manufacturing release, 40% on material delivery at site, 10% on successful government inspector pass certificate.",
        toastAccepted: "Thank you! The quotation has been signed and locked. Transitioning to contract deal finalization.",
        toastChangesSubmitted: "Revision request submitted successfully. Your sales representative will be notified to adjust parameters.",
        trackingLabel: "Customer Audit Activity Log",
        openTimes: "View count by client",
        lastOpenedLabel: "Last Client Interaction",
        changeModalTitle: "Specify Revision Requirements",
        changeModalPlaceholder: "e.g. Please change cabin finish tier from Premium to Luxury, or adjust the stops to 6 stops...",
        cancelBtn: "Cancel",
        submitBtn: "Send Revision Request",
        unlockedAcceptedBadge: "Proposal Locked"
      },
      hi: {
        title: "कोटेशन पोर्टल • ग्राहक कॉकपिट",
        subtitle: "आधिकारिक ग्राहक-सामना प्रस्ताव टर्मिनल। इसमें कोई आंतरिक मार्जिन या विनिर्माण लागत शामिल नहीं है।",
        proposalTab: "मुख्य प्रस्ताव",
        specsTab: "तकनीकी विशिष्टता",
        termsTab: "नियम और शर्तें",
        acceptBtn: "स्वीकार करें और सौदा अंतिम रूप दें",
        requestChangesBtn: "संशोधन का अनुरोध करें",
        expiredTitle: "यह कोटेशन समाप्त हो गया है",
        expiredDesc: "इस उद्धरण पर लॉक की गई कीमतें दिखाई गई तारीख तक वैध थीं। अपने सलाहकार से अपडेटेड प्रस्ताव के लिए अनुरोध करें।",
        reQuoteBtn: "नया मूल्य उद्धरण अनुरोध करें",
        revisionLockTitle: "बिक्री संशोधन जारी है",
        revisionLockDesc: "आपका सलाहकार वर्तमान में कॉन्फ़िगरेशन समायोजित कर रहा है। स्वीकृति अस्थायी रूप से लॉक है।",
        viewedBadge: "देखा और ट्रैक किया गया",
        deliveredBadge: "वितरित",
        acceptedBadge: "सौदा पक्का हुआ",
        expiredBadge: "अवधि समाप्त",
        revisingBadge: "संशोधित किया जा रहा है",
        contractBasisMsg: "अनुबंध बाध्यकारी: स्वीकृति पर, यह विशिष्ट लेआउट विन्यास अपरिवर्तनीय हो जाता है और उत्पादन बहीखाता में स्थानांतरित हो जाता है।",
        priceLabel: "कुल निवेश (जीएसटी 18% शामिल)",
        termsLabel: "भुगतान की शर्तें और वारंटी",
        warrantyDesc: "इसमें AIEC प्रीमियम 1-वर्षीय व्यापक हार्डवेयर वारंटी और 4 त्रैमासिक निवारक सुरक्षा जाँच शामिल हैं।",
        paymentDesc: "कच्चे निर्माण रिलीज के लिए 50% अग्रिम, साइट पर सामग्री वितरण पर 40%, सरकारी निरीक्षक पास प्रमाण पत्र पर 10%।",
        toastAccepted: "धन्यवाद! कोटेशन पर हस्ताक्षर और लॉक कर दिया गया है। अनुबंध को अंतिम रूप देने की ओर बढ़ रहे हैं।",
        toastChangesSubmitted: "संशोधन अनुरोध सफलतापूर्वक प्रस्तुत किया गया। आपके प्रतिनिधि को सूचित किया जाएगा।",
        trackingLabel: "ग्राहक ऑडिट गतिविधि लॉग",
        openTimes: "ग्राहक द्वारा देखने की संख्या",
        lastOpenedLabel: "अंतिम ग्राहक संवाद",
        changeModalTitle: "संशोधन आवश्यकताएँ निर्दिष्ट करें",
        changeModalPlaceholder: "उदा. कृपया केबिन फिनिश को प्रीमियम से लक्ज़री में बदलें, या स्टॉप को 6 स्टॉप पर समायोजित करें...",
        cancelBtn: "रद्द करें",
        submitBtn: "अनुरोध भेजें",
        unlockedAcceptedBadge: "प्रस्ताव लॉक किया गया"
      },
      mr: {
        title: "कोटेशन पोर्टल • ग्राहक कक्ष",
        subtitle: "अधिकृत ग्राहक कोटेशन टर्मिनल. यामध्ये कोणतीही अंतर्गत नफा किंवा मॅन्युफॅक्चरिंग किंमत उघड केली जात नाही.",
        proposalTab: "मुख्य प्रस्ताव",
        specsTab: "तांत्रिक तपशील",
        termsTab: "अटी आणि शर्ती",
        acceptBtn: "मंजूर करा आणि सौदा निश्चित करा",
        requestChangesBtn: "बदलांची विनंती करा",
        expiredTitle: "या कोटेशनची मुदत संपली आहे",
        expiredDesc: "या कोटवरील किमती दाखवलेल्या तारखेपर्यंत लागू होत्या. नवीन प्रस्तावासाठी आपल्या सेल्स सल्लागाराशी संपर्क साधा.",
        reQuoteBtn: "नवीन कोटेशन विनंती करा",
        revisionLockTitle: "विक्री प्रतिनिधीकडून बदल सुरू आहेत",
        revisionLockDesc: "आपला सल्लागार सध्या कोटेशनमध्ये सुधारणा करत आहे. बदल पूर्ण होईपर्यंत मंजुरी प्रक्रिया बंद असेल.",
        viewedBadge: "पाहिले आणि ट्रॅक केले",
        deliveredBadge: "वितरित",
        acceptedBadge: "सौदा निश्चित",
        expiredBadge: "मुदत संपली",
        revisingBadge: "बदल सुरू आहेत",
        contractBasisMsg: "अनुबंध बंधनकारक: मंजुरीनंतर, हे विशिष्ट कॉन्फिगरेशन कराराचा कायदेशीर आधार बनेल आणि उत्पादन डिझाइनमध्ये पाठवले जाईल.",
        priceLabel: "एकूण गुंतवणूक (१८% GST सह)",
        termsLabel: "पेमेंट अटी आणि वॉरंटी",
        warrantyDesc: "यामध्ये AIEC प्रीमियम १-वर्षाची वॉरंटी आणि ४ त्रैमासिक प्रतिबंधात्मक सुरक्षा तपासण्या समाविष्ट आहेत.",
        paymentDesc: "उत्पादन सुरू करण्यासाठी ५०% आगाऊ रक्कम, जागेवर साहित्य पोहचल्यावर ४०%, सरकारी निरीक्षक प्रमाणपत्र मिळाल्यावर १०%.",
        toastAccepted: "धन्यवाद! कोटेशन मंजूर आणि लॉक करण्यात आले आहे. करार अंतिम टप्प्यात जात आहे.",
        toastChangesSubmitted: "बदलांची विनंती यशस्वीरित्या पाठवली गेली आहे. आपल्या प्रतिनिधीला सूचित केले जाईल.",
        trackingLabel: "ग्राहक ऑडिट क्रियाकलाप लॉग",
        openTimes: "ग्राहकांचे पाहण्याचे प्रमाण",
        lastOpenedLabel: "शेवटची ग्राहक प्रतिक्रिया",
        changeModalTitle: "बदलांचे तपशील प्रविष्ट करा",
        changeModalPlaceholder: "उदा. कृपया केबिन फिनिश प्रीमियम ऐवजी लक्झरी करा, किंवा मजले ६ करा...",
        cancelBtn: "रद्द करा",
        submitBtn: "विनंती पाठवा",
        unlockedAcceptedBadge: "कोटेशन लॉक"
      }
    };
    return localizations[language] || localizations.en;
  }, [language]);

  const handleAccept = () => {
    if (currentQuote.isExpired) return;
    if (isSalesRevising) return;

    setQuotations(prev => prev.map(q => {
      if (q.id === currentQuote.id) {
        return { ...q, status: 'accepted' as const };
      }
      return q;
    }));
    
    triggerToast(t.toastAccepted);
    if (onAcceptQuote) {
      setTimeout(() => {
        onAcceptQuote({ ...currentQuote, status: 'accepted' });
      }, 1500);
    }
  };

  const submitChangesRequest = () => {
    if (!changeRequestText.trim()) return;
    setQuotations(prev => prev.map(q => {
      if (q.id === currentQuote.id) {
        return { ...q, status: 'revising' as const, openCount: q.openCount + 1 };
      }
      return q;
    }));
    setShowChangeRequestModal(false);
    setChangeRequestText('');
    triggerToast(t.toastChangesSubmitted);
  };

  const requestNewQuoteExpired = () => {
    setQuotations(prev => prev.map(q => {
      if (q.id === currentQuote.id) {
        return { ...q, isExpired: false, status: 'delivered' as const, validityDate: "2026-07-28" };
      }
      return q;
    }));
    triggerToast("Updated price quotation requested! Validity period has been refreshed to 15 Days.");
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const toggleSalesRevisionSimulation = () => {
    setIsSalesRevising(!isSalesRevising);
    triggerToast(isSalesRevising ? "Sales revision lock released. Customer portal ready." : "Sales revision lock active. Accepting quote disabled for customer.");
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast notifier */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0E4B3D] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dual Progress Bar Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Auto-Quotation Engine Module Progress (Screen 4 of 10)</span>
            <span>40.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '40%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 64 of 200)</span>
            <span>32.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '32%' }} />
          </div>
        </div>
      </div>

      {/* Title block */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            CLIENT VIEWPORT • MODULE 7 • SECURITY COMPLIANCE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-[#2A2723] tracking-tight mt-1">
            {t.title}
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Sales simulation lock controls */}
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={toggleSalesRevisionSimulation}
            variant={isSalesRevising ? "secondary" : "primary"}
            className="text-xs font-bold py-2 px-3.5 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSalesRevising ? 'animate-spin' : ''}`} />
            <span>{isSalesRevising ? "Sales Active Edit (Locked)" : "Simulate Sales Revision Edit"}</span>
          </Button>
        </div>
      </div>

      {/* Select active quotation to preview */}
      <div className="flex gap-2 bg-white p-2 rounded-xl border border-[rgba(184,135,61,0.15)] overflow-x-auto">
        {quotations.map((q) => {
          const isSelected = selectedQuoteId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => setSelectedQuoteId(q.id)}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all shrink-0 font-serif ${
                isSelected 
                  ? 'bg-alabaster border border-antiquegold text-charcoal' 
                  : 'text-warmgray hover:bg-alabaster/40'
              }`}
            >
              {q.buildingName} ({q.id})
            </button>
          );
        })}
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Real Quote Sheet Paper */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-[rgba(184,135,61,0.18)] rounded-2xl shadow-md overflow-hidden relative">
            <div className="h-2 bg-antiquegold w-full" />

            <div className="p-6 md:p-8 space-y-6">
              
              {/* Top Row: Brand & Proposal identity */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#e5dfd4]/40 pb-5">
                <div>
                  <span className="block text-[10px] font-mono tracking-widest text-antiquegold font-black uppercase">
                    ALL INDIA ELEVATORS CO.
                  </span>
                  <h2 className="font-serif text-lg font-bold text-charcoal mt-1">ELEVATING LUXURY SAFETY Standards</h2>
                  <span className="text-[10px] text-warmgray block">Regd Off: Pune, Maharashtra, India</span>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="text-[10px] uppercase font-mono text-warmgray font-bold block">Document Metadata</span>
                  <span className="font-mono text-xs font-black text-charcoal block">{currentQuote.id}</span>
                  <span className="text-royalemerald font-mono font-bold text-xs block">Version: v{currentQuote.version}</span>
                </div>
              </div>

              {/* Proposal Client Info & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-alabaster p-4 rounded-xl border border-[#e5dfd4]/50">
                <div className="space-y-0.5 text-xs">
                  <span className="text-[8px] uppercase font-mono text-warmgray font-bold block">CLIENT PARTY</span>
                  <span className="font-serif font-bold text-charcoal block">{currentQuote.customerName}</span>
                  <span className="text-warmgray block">{currentQuote.buildingName} • {currentQuote.location}</span>
                </div>

                <div className="sm:text-right text-xs space-y-1">
                  <span className="text-[8px] uppercase font-mono text-warmgray font-bold block">PROPOSAL EXPIRY</span>
                  <span className="font-mono text-charcoal block font-bold">Expires: {currentQuote.validityDate}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded inline-block uppercase ${
                    currentQuote.status === 'accepted' ? 'bg-emerald-50 text-royalemerald' :
                    currentQuote.status === 'expired' ? 'bg-red-50 text-[#B23B3B]' : 'bg-amber-50 text-antiquegold'
                  }`}>
                    {currentQuote.status === 'accepted' ? t.acceptedBadge :
                     currentQuote.status === 'expired' ? t.expiredBadge : t.viewedBadge}
                  </span>
                </div>
              </div>

              {/* Tabs selectors inside Paper Quote */}
              <div className="flex border-b border-[#e5dfd4]/50 gap-4 text-xs font-serif">
                <button
                  onClick={() => setActiveTab('proposal')}
                  className={`pb-2.5 font-bold border-b-2 transition-all ${activeTab === 'proposal' ? 'border-antiquegold text-charcoal' : 'border-transparent text-warmgray'}`}
                >
                  {t.proposalTab}
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`pb-2.5 font-bold border-b-2 transition-all ${activeTab === 'specifications' ? 'border-antiquegold text-charcoal' : 'border-transparent text-warmgray'}`}
                >
                  {t.specsTab}
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`pb-2.5 font-bold border-b-2 transition-all ${activeTab === 'terms' ? 'border-antiquegold text-charcoal' : 'border-transparent text-warmgray'}`}
                >
                  {t.termsTab}
                </button>
              </div>

              {/* TAB 1: Proposal Main summary */}
              {activeTab === 'proposal' && (
                <div className="space-y-5">
                  <p className="text-xs text-charcoal leading-relaxed font-semibold">
                    {currentQuote.configSummary}
                  </p>

                  <div className="bg-alabaster p-5 rounded-2xl border border-antiquegold/15 text-center space-y-1.5">
                    <span className="block text-[10px] font-mono text-warmgray uppercase font-bold tracking-widest">{t.priceLabel}</span>
                    <span className="block font-serif text-3xl font-black text-charcoal">
                      ₹{currentQuote.finalPrice.toLocaleString()}
                    </span>
                    <span className="block text-[9px] font-mono text-warmgray">Standard 18% GST calculated & fully synchronized with financial ledger codes.</span>
                  </div>
                </div>
              )}

              {/* TAB 2: Technical specifications details summary */}
              {activeTab === 'specifications' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-2.5 bg-alabaster rounded-lg border border-[#e5dfd4]/30">
                      <span className="block text-[8px] text-warmgray uppercase">DRIVE SYSTEM</span>
                      <span className="block font-bold text-charcoal">Gearless PMSM traction machine</span>
                    </div>
                    <div className="p-2.5 bg-alabaster rounded-lg border border-[#e5dfd4]/30">
                      <span className="block text-[8px] text-warmgray uppercase">CAPACITY LOAD</span>
                      <span className="block font-bold text-charcoal">6 Persons (408 kg rated)</span>
                    </div>
                    <div className="p-2.5 bg-alabaster rounded-lg border border-[#e5dfd4]/30">
                      <span className="block text-[8px] text-warmgray uppercase">STOPS COUNT</span>
                      <span className="block font-bold text-charcoal">5 Openings / Ground to G+4</span>
                    </div>
                    <div className="p-2.5 bg-alabaster rounded-lg border border-[#e5dfd4]/30">
                      <span className="block text-[8px] text-warmgray uppercase">SPEED PATTERN</span>
                      <span className="block font-bold text-charcoal">1.0 m/s VVVF Smooth Drive</span>
                    </div>
                  </div>

                  <div className="p-3 bg-alabaster rounded-xl border border-[#e5dfd4]/40">
                    <span className="text-[10px] font-bold text-charcoal block uppercase font-mono mb-1">Standard Structural Guidelines Handover</span>
                    <p className="text-[10px] text-warmgray font-semibold leading-relaxed">
                      All civil shaft openings, pit waterproofing, 3-Phase standard power supplies, and overhead headroom levels must align precisely with AIEC GA structural drawing layout #AIEC-GA-PUNE-9042 before installer mobilization.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Terms & Warranties */}
              {activeTab === 'terms' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-charcoal">{t.termsLabel}</h4>
                    <p className="text-[11px] text-warmgray font-medium leading-relaxed">{t.paymentDesc}</p>
                  </div>

                  <div className="space-y-1 border-t border-[#e5dfd4]/40 pt-3">
                    <h4 className="font-serif font-bold text-charcoal">Premium Safety Warranty & Maintenance</h4>
                    <p className="text-[11px] text-warmgray font-medium leading-relaxed">{t.warrantyDesc}</p>
                  </div>
                </div>
              )}

              {/* Immutability / acceptance warnings */}
              <div className="border-t border-[#e5dfd4]/40 pt-4 flex items-start gap-3 text-[10px] font-medium text-warmgray leading-relaxed">
                <ShieldCheck className="w-4.5 h-4.5 text-royalemerald shrink-0 mt-0.5" />
                <span>{t.contractBasisMsg}</span>
              </div>

            </div>

            {/* Quote Paper Bottom tagline */}
            <div className="bg-alabaster px-6 py-4 border-t border-[#e5dfd4] text-center">
              <span className="block text-[9px] font-serif font-bold text-charcoal">
                "All India Elevators Company • Craftsmanship Coupled with Absolute Passenger Safety"
              </span>
            </div>

          </div>

        </div>

        {/* Right Side Controls: Portal actions & view tracking */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section: Action portal buttons */}
          <Card className="p-6 bg-white space-y-4 border-2 border-[rgba(184,135,61,0.25)]">
            <div className="border-b border-[#e5dfd4]/60 pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal">Customer Actions</h3>
              <p className="text-[10px] text-warmgray mt-0.5">Approve proposal to initiate raw materials purchase orders.</p>
            </div>

            {/* Expired state warning */}
            {currentQuote.isExpired ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-[#B23B3B]/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B23B3B] uppercase font-mono">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{t.expiredTitle}</span>
                  </div>
                  <p className="text-[10px] text-[#B23B3B] font-semibold leading-relaxed">
                    {t.expiredDesc}
                  </p>
                </div>

                <Button
                  onClick={requestNewQuoteExpired}
                  variant="primary"
                  className="w-full text-xs font-bold py-3 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.reQuoteBtn}</span>
                </Button>
              </div>
            ) : isSalesRevising ? (
              // Sales is actively editing / revising lock edge case
              <div className="p-4 bg-amber-50 border border-antiquegold/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-antiquegold uppercase font-mono">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{t.revisionLockTitle}</span>
                </div>
                <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
                  {t.revisionLockDesc}
                </p>
              </div>
            ) : currentQuote.status === 'accepted' ? (
              // Already accepted immutable contract state
              <div className="p-4 bg-emerald-50 border border-royalemerald/20 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-royalemerald mx-auto" />
                <span className="block text-xs font-bold text-royalemerald uppercase font-mono">{t.unlockedAcceptedBadge}</span>
                <p className="text-[10px] text-royalemerald font-semibold leading-relaxed">
                  This quote has been signed and locked in v{currentQuote.version} on July 11, 2026. Transitioning proposal to construction planning...
                </p>
              </div>
            ) : (
              // Standard active quote decision actions
              <div className="space-y-3">
                <Button
                  onClick={handleAccept}
                  variant="primary"
                  className="w-full text-xs font-bold py-3.5 flex items-center justify-center gap-2"
                >
                  <ClipboardCheck className="w-4.5 h-4.5" />
                  <span>{t.acceptBtn}</span>
                </Button>

                <Button
                  onClick={() => setShowChangeRequestModal(true)}
                  variant="secondary"
                  className="w-full text-xs font-bold py-3.5 flex items-center justify-center gap-2 bg-white border border-[#e5dfd4]"
                >
                  <MessageSquare className="w-4.5 h-4.5 text-warmgray" />
                  <span>{t.requestChangesBtn}</span>
                </Button>
              </div>
            )}

          </Card>

          {/* Section: Send-and-Track Auditing analytics */}
          <Card className="p-6 bg-white space-y-4">
            <div className="border-b border-[#e5dfd4]/60 pb-3">
              <h3 className="font-serif text-sm font-bold text-charcoal">{t.trackingLabel}</h3>
              <p className="text-[10px] text-warmgray mt-0.5">Real-time engagement telemetry audits</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-baseline py-1.5 border-b border-[#e5dfd4]/30">
                <span className="text-warmgray font-semibold">{t.openTimes}:</span>
                <span className="font-mono font-black text-charcoal bg-alabaster px-2.5 py-0.5 rounded-md border border-[#e5dfd4]">
                  {currentQuote.openCount} views
                </span>
              </div>

              <div className="flex justify-between items-baseline py-1.5 border-b border-[#e5dfd4]/30">
                <span className="text-warmgray font-semibold">{t.lastOpenedLabel}:</span>
                <span className="font-mono font-black text-charcoal">
                  {currentQuote.lastOpened}
                </span>
              </div>

              <div className="flex justify-between items-baseline py-1.5">
                <span className="text-warmgray font-semibold">Delivery Medium:</span>
                <span className="text-royalemerald font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> WhatsApp Business Link
                </span>
              </div>
            </div>

          </Card>

        </div>

      </div>

      {/* Revision request input modal popup */}
      {showChangeRequestModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="p-6 bg-white max-w-md w-full space-y-4 border border-antiquegold/20">
            <div className="border-b border-[#e5dfd4] pb-3">
              <h3 className="font-serif text-base font-bold text-charcoal">{t.changeModalTitle}</h3>
              <p className="text-[10px] text-warmgray">Your feedback creates a new locked quotation version to preserve deal audit history.</p>
            </div>

            <textarea
              rows={4}
              placeholder={t.changeModalPlaceholder}
              value={changeRequestText}
              onChange={(e) => setChangeRequestText(e.target.value)}
              className="w-full bg-alabaster border border-[#e5dfd4] rounded-xl p-3 text-xs font-semibold focus:outline-none"
            />

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setShowChangeRequestModal(false)}
                className="py-2 px-4 rounded-lg bg-alabaster border border-[#e5dfd4] text-warmgray"
              >
                {t.cancelBtn}
              </button>
              <Button
                onClick={submitChangesRequest}
                variant="primary"
                className="py-2 px-4"
              >
                {t.submitBtn}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
