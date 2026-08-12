import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, FileText, ChevronRight, Landmark,
  Calendar, FileEdit, ArrowRight, Settings, Sliders, DollarSign, Hammer,
  Check, X, RefreshCw, Send, Printer, ExternalLink, HelpCircle
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Translations for Deal Terms Finalization Screen
const localizations = {
  en: {
    title: "Deal Terms Finalization",
    subtitle: "Choke point to lock in final elevator parameters, payment milestones, and legal terms before generating the contract.",
    specsTitle: "Agreed Elevator Specifications",
    paymentScheduleTitle: "Locked Payment Stage Schedule",
    specialTermsTitle: "Special Covenants & Conditions",
    staffConfirmLabel: "Step 1: Admin / Sales Confirmation",
    customerConfirmLabel: "Step 2: Customer / Client Confirmation",
    staffConfirmBtn: "Staff Confirm Terms Accuracy",
    customerConfirmBtn: "Sign & Accept Deal Terms",
    staffConfirmedMsg: "AIEC Technical Staff has confirmed accuracy on {date}.",
    customerConfirmedMsg: "Client Karan Malhotra has confirmed and signed on {date}.",
    lockedSuccessMsg: "Deal terms fully finalized! Generating certified legal contract. Proceeding to Payments setup.",
    editBeforeLockBtn: "Edit / Revise Configuration",
    gstLabel: "GST & Tax Registration Identification",
    gstPlaceholder: "e.g. 27AAAAA1111A1Z1 (Maharashtra GSTIN)",
    paymentSLAWarning: "This payment stage plan is non-adjustable after locking and will drive all future installment billing.",
    installationMilestoneTitle: "Installation Progress Timeline",
    stageDeposit: "Booking Advance (10%)",
    stageManufacturing: "Manufacturing Commences (40%)",
    stageDelivery: "Delivery on Site (30%)",
    stageErection: "Erection & Mechanical Setup (15%)",
    stageHandover: "Final License & Handover (5%)",
    stageStatus: "Stage Weight",
    stageAmount: "Milestone Value (INR)",
    toastStaffConfirmed: "Staff approval logged. Awaiting client signature.",
    toastClientConfirmed: "Deal terms sealed successfully! Legal contract version drafted and ready for download.",
    toastRouteEdit: "Redirecting back to upstream Quotation Configuration...",
    gstErrorMsg: "Please enter a valid 15-character GSTIN for corporate compliance.",
    complianceDND: "Under the AIEC Legal Protocol, both-party confirmations establish a binding commercial draft.",
    viewingAs: "View Screen As:"
  },
  hi: {
    title: "सौदा शर्तों को अंतिम रूप देना",
    subtitle: "अनुबंध तैयार करने से पहले अंतिम लिफ्ट मापदंडों, भुगतान मील के पत्थर और कानूनी शर्तों को लॉक करने का प्रवेश द्वार।",
    specsTitle: "सहमति लिफ्ट विनिर्देश",
    paymentScheduleTitle: "लॉक किया गया भुगतान चरण कार्यक्रम",
    specialTermsTitle: "विशेष नियम और शर्तें",
    staffConfirmLabel: "चरण 1: व्यवस्थापक / बिक्री पुष्टि",
    customerConfirmLabel: "चरण 2: ग्राहक / क्लाइंट पुष्टि",
    staffConfirmBtn: "कर्मचारी शर्तों की सटीकता की पुष्टि करें",
    customerConfirmBtn: "हस्ताक्षर करें और शर्तों को स्वीकार करें",
    staffConfirmedMsg: "AIEC तकनीकी कर्मचारियों ने {date} को सटीकता की पुष्टि की है।",
    customerConfirmedMsg: "क्लाइंट करण मल्होत्रा ​​ने {date} को पुष्टि और हस्ताक्षर किए हैं।",
    lockedSuccessMsg: "सौदा शर्तें पूरी तरह से तय! प्रमाणित कानूनी अनुबंध तैयार किया जा रहा है।",
    editBeforeLockBtn: "विनिर्देशों को संशोधित करें",
    gstLabel: "जीएसटी और कर पंजीकरण पहचान",
    gstPlaceholder: "उदा. 27AAAAA1111A1Z1 (महाराष्ट्र जीएसटीआईएन)",
    paymentSLAWarning: "यह भुगतान योजना लॉक होने के बाद गैर-समायोज्य है और भविष्य के सभी किस्त बिलिंग को नियंत्रित करेगी।",
    installationMilestoneTitle: "स्थापना प्रगति समयरेखा",
    stageDeposit: "बुकिंग एडवांस (10%)",
    stageManufacturing: "विनिर्माण प्रारंभ (40%)",
    stageDelivery: "साइट पर वितरण (30%)",
    stageErection: "खड़ा करना और यांत्रिक सेटअप (15%)",
    stageHandover: "अंतिम लाइसेंस और सौंपना (5%)",
    stageStatus: "चरण वजन",
    stageAmount: "मील का पत्थर मूल्य (INR)",
    toastStaffConfirmed: "कर्मचारी की मंजूरी दर्ज की गई। ग्राहक के हस्ताक्षर की प्रतीक्षा है।",
    toastClientConfirmed: "सौदा शर्तें सफलतापूर्वक सील! अनुबंध संस्करण डाउनलोड के लिए तैयार है।",
    toastRouteEdit: "अपस्ट्रीम कोटेशन विनिर्देशों पर पुनर्निर्देशित किया जा रहा है...",
    gstErrorMsg: "कॉर्पोरेट अनुपालन के लिए कृपया एक वैध 15-वर्ण का जीएसटीआईएन दर्ज करें।",
    complianceDND: "AIEC कानूनी प्रोटोकॉल के तहत, दोनों पक्षों की पुष्टि एक बाध्यकारी वाणिज्यिक मसौदा स्थापित करती है।",
    viewingAs: "स्क्रीन दृश्य भूमिका:"
  },
  mr: {
    title: "करार अटी निश्चिती",
    subtitle: "अंतिम करारनामा तयार करण्यापूर्वी लिफ्टचे तांत्रिक निकष, पेमेंट टप्पे आणि कायदेशीर अटी सुरक्षित करण्यासाठी अंतिम प्रवेशद्वार.",
    specsTitle: "निश्चित लिफ्ट तपशील (Specifications)",
    paymentScheduleTitle: "पेमेंट टप्पे वेळापत्रक",
    specialTermsTitle: "विशेष अटी आणि शर्ती",
    staffConfirmLabel: "टप्पा १: प्रशासक किंवा सेल्स प्रतिनिधी मंजुरी",
    customerConfirmLabel: "टप्पा २: ग्राहकाची स्वाक्षरी आणि मंजुरी",
    staffConfirmBtn: "तांत्रिक अटींच्या अचूकतेची खात्री करा",
    customerConfirmBtn: "करार अटी मान्य करा आणि स्वाक्षरी करा",
    staffConfirmedMsg: "AIEC तांत्रिक टीमने {date} रोजी मंजुरी दिली आहे.",
    customerConfirmedMsg: "ग्राहक करण मल्होत्रा ​​यांनी {date} रोजी स्वाक्षरी केली आहे.",
    lockedSuccessMsg: "अटी यशस्वीरित्या लॉक झाल्या! स्वयंचलित कायदेशीर करारनामा तयार केला गेला आहे.",
    editBeforeLockBtn: "विनिर्देश सुधारित करा",
    gstLabel: "जीएसटी आणि कर नोंदणी क्रमांक",
    gstPlaceholder: "उदा. 27AAAAA1111A1Z1 (महाराष्ट्र GSTIN)",
    paymentSLAWarning: "हे पेमेंट वेळापत्रक लॉक केल्यानंतर बदलता येणार नाही आणि यावरूनच पुढील सर्व हप्ते आकारले जातील.",
    installationMilestoneTitle: "लिफ्ट बसविण्याचे टप्पे समयरेखा",
    stageDeposit: "बुकिंग आगाऊ रक्कम (१०%)",
    stageManufacturing: "उत्पादन सुरू करणे (४०%)",
    stageDelivery: "साइटवर लिफ्ट साहित्य पोहोचवणे (३०%)",
    stageErection: "यांत्रिक उभारणी (१५%)",
    stageHandover: "परवाना आणि हस्तांतरण (५%)",
    stageStatus: "टप्पा भार",
    stageAmount: "टप्पा मूल्य (INR)",
    toastStaffConfirmed: "स्टाफ मंजुरी नोंदवली गेली. ग्राहकांच्या स्वाक्षरीची प्रतीक्षा आहे.",
    toastClientConfirmed: "करार अंतिम झाला! करारनामा डाऊनलोडसाठी उपलब्ध आहे.",
    toastRouteEdit: "मागील कोटेशन निर्मिती टप्प्यावर परत नेले जात आहे...",
    gstErrorMsg: "कृपया अचूक १५-अंकी कॉर्पोरेट जीएसटी क्रमांक प्रविष्ट करा.",
    complianceDND: "AIEC कायदेशीर करारानुसार, दोन्ही पक्षांच्या सहमतीने हा व्यावसायिक दस्तऐवज अंतिम मानला जाईल.",
    viewingAs: "स्क्रीन दृश्य भूमिका:"
  }
};

interface FinalSpec {
  label: string;
  value: string;
}

export const DealTermsFinalization: React.FC<{ user: any }> = ({ user }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [activePersona, setActivePersona] = useState<'staff' | 'customer'>('staff');
  
  // Data State
  const [gstNumber, setGstNumber] = useState('27AAAAA1111A1Z1');
  const [gstError, setGstError] = useState(false);
  const [staffConfirmed, setStaffConfirmed] = useState(false);
  const [customerConfirmed, setCustomerConfirmed] = useState(false);
  const [specialNotes, setSpecialNotes] = useState(
    "1. Free AMC upgrade voucher included (V3 proposal exception bundle).\n2. Shaft structural dimensions to be cleared by customer surveyor prior to July 25, 2026.\n3. Custom gold cabin mirrors inside."
  );

  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  const dealData = useMemo(() => {
    return {
      deal_id: "AIEC-DL-9081",
      customerName: "Karan Malhotra (Penthouse)",
      buildingName: "Pratik Heights, Kothrud",
      final_agreed_price: 1120000,
      specs: [
        { label: "Elevator Model", value: "Aura Premium Gold Lift (VVVF)" },
        { label: "Capacity / Load", value: "6 Passengers (408 kg)" },
        { label: "Floors & Stops", value: "G + 4 Floors (Glass Finish Cabin)" },
        { label: "Speed Target", value: "1.0 m/s with Gearless Traction Motor" },
        { label: "Emergency Backup", value: "ARD (Automatic Rescue Device) 15-Mins Built-in" },
        { label: "Warranty Shield", value: "24-Month Full Structural Shield Warranty" }
      ]
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Stage Payments split calculations
  const paymentStages = useMemo(() => {
    const total = dealData.final_agreed_price;
    return [
      { id: 'stg-1', name: t.stageDeposit, pct: 10, amount: total * 0.1, completed: staffConfirmed, active: !staffConfirmed },
      { id: 'stg-2', name: t.stageManufacturing, pct: 40, amount: total * 0.4, completed: customerConfirmed, active: staffConfirmed && !customerConfirmed },
      { id: 'stg-3', name: t.stageDelivery, pct: 30, amount: total * 0.3, completed: false, active: customerConfirmed },
      { id: 'stg-4', name: t.stageErection, pct: 15, amount: total * 0.15, completed: false, active: false },
      { id: 'stg-5', name: t.stageHandover, pct: 5, amount: total * 0.05, completed: false, active: false }
    ];
  }, [dealData.final_agreed_price, staffConfirmed, customerConfirmed, t]);

  // Action: Staff Accuracy confirmation
  const handleStaffConfirm = () => {
    if (gstNumber.length > 0 && gstNumber.length !== 15) {
      setGstError(true);
      return;
    }
    setGstError(false);
    setStaffConfirmed(true);
    triggerToast(t.toastStaffConfirmed);
  };

  // Action: Customer accepting deal
  const handleCustomerConfirm = () => {
    if (!staffConfirmed) {
      triggerToast("Staff must confirm specs accuracy before client can sign.");
      return;
    }
    setCustomerConfirmed(true);
    triggerToast(t.toastClientConfirmed);
  };

  // Action: Edit configuration routing simulation
  const handleEditRedirect = () => {
    triggerToast(t.toastRouteEdit);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast alert popup */}
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

      {/* Header Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Negotiation & Closing Progress (Screen 4 of 10)</span>
            <span>40.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '40%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 74 of 200)</span>
            <span>37.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '37%' }} />
          </div>
        </div>
      </div>

      {/* Screen Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-antiquegold font-mono font-extrabold bg-antiquegold/10 px-2.5 py-1 rounded-md">
            MODULE 8 • FINAL LEGAL BINDING LOCK
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-antiquegold" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* View Switcher toggle */}
        <div className="bg-white p-1 rounded-xl border border-border flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono font-bold text-warmgray px-2 uppercase">{t.viewingAs}</span>
          <button
            onClick={() => setActivePersona('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'staff' 
                ? 'bg-royalemerald text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'स्टाफ' : language === 'mr' ? 'स्टाफ' : 'Staff'}
          </button>
          <button
            onClick={() => setActivePersona('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'customer' 
                ? 'bg-antiquegold text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'ग्राहक' : language === 'mr' ? 'ग्राहक' : 'Customer'}
          </button>
        </div>
      </div>

      {/* Hero Header with key identifying info */}
      <div className="bg-white rounded-2xl border border-border shadow-diffuse overflow-hidden text-left">
        <div className="bg-alabaster/40 p-5 border-b border-[#e5dfd4]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-antiquegold font-extrabold uppercase bg-antiquegold/10 px-2 py-0.5 rounded">
                DEAL: {dealData.deal_id}
              </span>
              <Badge status={customerConfirmed ? "accepted" : "quoted"} className="text-[9px] uppercase" />
            </div>
            <strong className="text-charcoal font-serif text-xl block">{dealData.customerName}</strong>
            <span className="text-xs text-warmgray font-bold block">{dealData.buildingName}</span>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="text-[9px] font-mono text-warmgray uppercase font-bold">TOTAL CONTRACT VALUE</span>
            <span className="text-2xl font-serif font-black text-royalemerald">
              ₹{dealData.final_agreed_price.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] font-mono text-warmgray font-bold">Inclusive of all local transport GST</span>
          </div>
        </div>

        {/* Global Lock Status banner */}
        {staffConfirmed && customerConfirmed ? (
          <div className="p-4 bg-emerald-50 text-royalemerald text-xs font-bold border-t border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{t.lockedSuccessMsg}</p>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 text-[#B8873D] text-xs font-bold border-t border-antiquegold/15 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              {!staffConfirmed && "Awaiting technical review from staff."}
              {staffConfirmed && !customerConfirmed && "Staff reviewed. Awaiting customer confirmation signature."}
            </p>
          </div>
        )}
      </div>

      {/* Main split information panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side column: Specifications & payment stage breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Agreed Lift Specs */}
          <Card className="p-5 bg-white text-left space-y-4">
            <div className="border-b border-[#e5dfd4]/40 pb-3 flex justify-between items-center">
              <h3 className="font-serif text-base font-black text-charcoal flex items-center gap-2">
                <Sliders className="w-5 h-5 text-antiquegold" />
                <span>{t.specsTitle}</span>
              </h3>

              {!staffConfirmed && (
                <button
                  onClick={handleEditRedirect}
                  className="text-[10px] font-bold text-antiquegold hover:underline uppercase flex items-center gap-1 cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>{t.editBeforeLockBtn}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              {dealData.specs.map((spec, index) => (
                <div key={index} className="p-3 bg-alabaster rounded-xl border border-neutral-100 space-y-1">
                  <span className="text-[9px] font-mono text-warmgray uppercase block">{spec.label}</span>
                  <span className="text-charcoal font-bold block">{spec.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Milestone Stages */}
          <Card className="p-5 bg-white text-left space-y-4">
            <div>
              <h3 className="font-serif text-base font-black text-charcoal flex items-center gap-2 mb-1">
                <Landmark className="w-5 h-5 text-royalemerald" />
                <span>{t.paymentScheduleTitle}</span>
              </h3>
              <p className="text-[10px] text-warmgray font-semibold leading-normal">
                {t.paymentSLAWarning}
              </p>
            </div>

            {/* List with row anatomy */}
            <div className="space-y-3">
              {paymentStages.map((stage, idx) => {
                return (
                  <div 
                    key={stage.id} 
                    className={`p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                      stage.completed 
                        ? 'bg-emerald-50/50 border-emerald-200 text-royalemerald' 
                        : stage.active 
                          ? 'bg-amber-50/20 border-antiquegold/30' 
                          : 'bg-alabaster border-neutral-100 text-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Leading index count */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                        stage.completed 
                          ? 'bg-royalemerald text-white' 
                          : 'bg-neutral-200 text-neutral-600'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <strong className="text-xs font-bold block">{stage.name}</strong>
                        <span className="text-[9px] font-mono text-warmgray block uppercase">
                          {t.stageStatus}: {stage.pct}% weight
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold block">
                        ₹{stage.amount.toLocaleString('en-IN')}
                      </span>
                      {stage.completed ? (
                        <span className="text-[8px] font-bold text-success uppercase block">✓ Signed</span>
                      ) : stage.active ? (
                        <span className="text-[8px] font-bold text-antiquegold uppercase block animate-pulse">Awaiting Lock</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>

        {/* Right side column: Special notes, GST parameter and two-party sign-off gates */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Special Covenants covenants notes */}
          <Card className="p-5 bg-white space-y-3.5">
            <h3 className="font-serif text-sm font-black text-charcoal border-b border-[#e5dfd4]/40 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-antiquegold" />
              <span>{t.specialTermsTitle}</span>
            </h3>

            <div className="space-y-4">
              {/* Optional GSTIN for corporate clients */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">
                  {t.gstLabel}
                </label>
                <input 
                  type="text"
                  value={gstNumber}
                  onChange={(e) => {
                    setGstNumber(e.target.value);
                    if (e.target.value.length === 15 || e.target.value.length === 0) {
                      setGstError(false);
                    }
                  }}
                  disabled={staffConfirmed}
                  placeholder={t.gstPlaceholder}
                  className={`w-full p-2.5 bg-alabaster border rounded-xl text-charcoal font-mono text-xs focus:outline-none ${
                    gstError ? 'border-error' : 'border-[#e5dfd4] focus:border-antiquegold'
                  }`}
                />
                {gstError && (
                  <span className="text-[9px] text-[#B23B3B] font-bold block mt-1">
                    {t.gstErrorMsg}
                  </span>
                )}
              </div>

              {/* Editable memo notes (disabled if confirmed) */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-mono text-warmgray uppercase block font-bold">
                  Ad Hoc Covenants Draft
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  disabled={staffConfirmed}
                  rows={4}
                  className="w-full p-2.5 bg-alabaster border border-[#e5dfd4] rounded-xl text-charcoal text-xs leading-relaxed focus:outline-none focus:border-antiquegold"
                />
              </div>
            </div>
          </Card>

          {/* Confirmations & Signatures Workflow widgets */}
          <Card className="p-5 bg-white space-y-5">
            
            {/* Step 1: Staff Approval */}
            <div className="p-4 bg-alabaster rounded-2xl border border-border space-y-3">
              <span className="text-[9px] font-mono text-warmgray font-bold uppercase tracking-wider block">
                {t.staffConfirmLabel}
              </span>

              {staffConfirmed ? (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-royalemerald text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-success" />
                  <span>{t.staffConfirmedMsg.replace('{date}', 'Today')}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-warmgray leading-normal font-semibold">
                    Admin verifies specifications, GST compliance, and milestone pricing weights matching safety ceilings.
                  </p>
                  <Button
                    variant="emerald"
                    fullWidth
                    onClick={handleStaffConfirm}
                    disabled={activePersona !== 'staff'}
                    className="py-2.5 text-xs font-bold"
                  >
                    <span>{t.staffConfirmBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  {activePersona !== 'staff' && (
                    <span className="text-[8px] text-[#B23B3B] block font-bold uppercase text-center">
                      Only AIEC internal operators can unlock this step.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Customer Acceptance */}
            <div className="p-4 bg-alabaster rounded-2xl border border-border space-y-3">
              <span className="text-[9px] font-mono text-warmgray font-bold uppercase tracking-wider block">
                {t.customerConfirmLabel}
              </span>

              {customerConfirmed ? (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-royalemerald text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-success" />
                  <span>{t.customerConfirmedMsg.replace('{date}', 'Today')}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-warmgray leading-normal font-semibold">
                    Client reviews and completes final digital hand-off signature inside their secured portal link.
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCustomerConfirm}
                    disabled={!staffConfirmed || activePersona !== 'customer'}
                    className="py-2.5 text-xs font-bold"
                  >
                    <span>{t.customerConfirmBtn}</span>
                    <FileText className="w-4 h-4" />
                  </Button>
                  {!staffConfirmed && (
                    <span className="text-[8px] text-[#B8873D] block font-bold uppercase text-center">
                      Waiting for technical staff approval.
                    </span>
                  )}
                  {staffConfirmed && activePersona !== 'customer' && (
                    <span className="text-[8px] text-[#B8873D] block font-bold uppercase text-center">
                      Awaiting client signature inside portal. Simulate Customer to sign.
                    </span>
                  )}
                </div>
              )}
            </div>

          </Card>

        </div>

      </div>

      {/* ISO regulatory disclaimer bottom strip */}
      <div className="p-4 bg-alabaster rounded-2xl border border-border text-center text-[10px] font-mono text-warmgray font-bold">
        🛡️ {t.complianceDND}
      </div>

    </div>
  );
};
