import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Landmark, Compass, DollarSign, Users, Award, 
  Send, RefreshCw, AlertTriangle, ShieldCheck, FileText, Calendar, 
  ArrowRight, Sparkles, MapPin, Phone, MessageSquare, ChevronRight, Lock
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

// Localizations for Deal Closure Confirmation Screen
const localizations = {
  en: {
    title: "Deal Closed & Verified",
    subtitle: "Celebrate your partnership with AIEC. Downstream logistics, manufacturer ordering, and commission ledgers have been executed.",
    celebrateTitle: "Congratulations, Prashantji!",
    celebrateDesc: "Your contract is legally active and signed by both parties. Welcome to the elite tier of safety-certified custom vertical transportation.",
    clientChecklistTitle: "Your Live Ascension Journey",
    clientChecklistDesc: "The live progression of your custom elevator deployment. Track progress anytime using your customer access console.",
    commissionTitle: "Sales & Commission Ledger Trigger",
    commissionDesc: "The automated rewards split generated instantly from the contract lock. These values are committed directly to the central finance block.",
    dealValueLabel: "Closed Deal Value",
    surveyorRewardLabel: "Surveyor Commission (1.5%)",
    salesRewardLabel: "Sales Executive Commission (2.5%)",
    financeStatusLabel: "Accounting Pipeline Status",
    microserviceLogsTitle: "Logistics Automation Dispatch Tracker",
    microserviceLogsDesc: "The status of downstream background automated tasks triggered at signature completion.",
    paymentScheduleStatus: "Payment Stage Schedule generated successfully. 30% advance payment link dispatched to client's WhatsApp.",
    supplierPoStatus: "Supplier PO generated and sent to high-speed Pune manufacturing facility.",
    crmLockStatus: "CRM Stage transitioned to Closed Won. Kanban board card locked to prevent post-close edits.",
    pointOfContactTitle: "Your Assigned Project Lead",
    pointOfContactDesc: "Your dedicated engineering manager who will coordinate site preparation and delivery schedule.",
    pocName: "Shri. Ramesh Gaikwad",
    pocRole: "Senior Installation Superintendent, Pune West Division",
    pocContactBtn: "Call Project Lead",
    voidDealBtn: "Void & Revert Closed Deal (Audit Required)",
    toastVoidSuccess: "Audit logged. Deal successfully reversed and transitioned back to active negotiation.",
    toastVoidConfirm: "Are you sure you want to void this locked commercial contract? This will reverse commissions.",
    toastTriggerSuccess: "Downstream triggers successfully synchronized and re-dispatched.",
    milestone1: "E-Contract Authenticated",
    milestone2: "Payment Link Sent (30% Adv)",
    milestone3: "Pune Factory Order Enqueued",
    milestone4: "Site Shaft Verification Visit",
    milestone5: "Fulfillment Kickoff"
  },
  hi: {
    title: "सौदा बंद और सत्यापित",
    subtitle: "AIEC के साथ अपनी साझेदारी का जश्न मनाएं। लॉजिस्टिक्स, निर्माता ऑर्डर और कमीशन लेजर स्वचालित रूप से चालू हो गए हैं।",
    celebrateTitle: "बधाई हो, प्रशांतजी!",
    celebrateDesc: "आपका अनुबंध कानूनी रूप से सक्रिय है और दोनों पक्षों द्वारा हस्ताक्षरित है। सुरक्षा-प्रमाणित कस्टम लिफ्ट स्थापना के एलीट क्लब में आपका स्वागत है।",
    clientChecklistTitle: "आपकी लाइव एसेन्शन यात्रा",
    clientChecklistDesc: "आपके कस्टम लिफ्ट स्थापना की लाइव प्रगति। ग्राहक एक्सेस कंसोल का उपयोग करके कभी भी प्रगति को ट्रैक करें।",
    commissionTitle: "बिक्री और कमीशन लेजर ट्रिगर",
    commissionDesc: "अनुबंध लॉक होने पर तुरंत उत्पन्न हुआ स्वचालित इनाम विभाजन। ये मूल्य सीधे केंद्रीय वित्त ब्लॉक में दर्ज होते हैं।",
    dealValueLabel: "बंद सौदा मूल्य",
    surveyorRewardLabel: "सर्वेक्षक कमीशन (1.5%)",
    salesRewardLabel: "बिक्री कार्यकारी कमीशन (2.5%)",
    financeStatusLabel: "लेखांकन पाइपलाइन स्थिति",
    microserviceLogsTitle: "रसद स्वचालन प्रेषण ट्रैकर",
    microserviceLogsDesc: "हस्ताक्षर पूरा होने पर सक्रिय किए गए पृष्ठभूमि रसद कार्यों की लाइव स्थिति।",
    paymentScheduleStatus: "भुगतान चरण अनुसूची सफलतापूर्वक तैयार। 30% अग्रिम भुगतान लिंक व्हाट्सएप पर भेजा गया।",
    supplierPoStatus: "आपूर्तिकर्ता पीओ तैयार और पुणे विनिर्माण संयंत्र को प्रेषित किया गया।",
    crmLockStatus: "CRM स्टेज को 'क्लोज्ड वॉन' में बदला गया। अनधिकृत बदलाव रोकने के लिए कानबन कार्ड लॉक किया गया।",
    pointOfContactTitle: "आपका आवंटित प्रोजेक्ट लीड",
    pointOfContactDesc: "आपके समर्पित इंजीनियरिंग मैनेजर जो साइट की तैयारी और डिलीवरी शेड्यूल का समन्वय करेंगे।",
    pocName: "श्री रमेश गायकवाड़",
    pocRole: "वरिष्ठ स्थापना अधीक्षक, पुणे पश्चिम प्रभाग",
    pocContactBtn: "प्रोजेक्ट लीड को कॉल करें",
    voidDealBtn: "सौदा रद्द करें और वापस लें (ऑडिट आवश्यक)",
    toastVoidSuccess: "ऑडिट दर्ज। सौदा सफलतापूर्वक रद्द कर दिया गया और बातचीत में वापस आ गया।",
    toastVoidConfirm: "क्या आप वाकई इस लॉक किए गए व्यावसायिक अनुबंध को रद्द करना चाहते हैं? इससे कमीशन वापस हो जाएगा।",
    toastTriggerSuccess: "रसद ट्रिगर सफलतापूर्वक पुन: सिंक्रनाइज़ किए गए।",
    milestone1: "अनुबंध प्रमाणित",
    milestone2: "अग्रिम भुगतान लिंक प्रेषित",
    milestone3: "पुणे फैक्ट्री ऑर्डर संलग्न",
    milestone4: "साइट शाफ्ट सत्यापन",
    milestone5: "स्थापना रसद प्रारंभ"
  },
  mr: {
    title: "सौदा यशस्वीरीत्या पूर्ण",
    subtitle: "AIEC सोबतच्या भागीदारीचा आनंद साजरा करा. उत्पादन ऑर्डर, कमिशन वाटप आणि पेमेंट शेड्युल प्रक्रिया पूर्ण झाली आहे.",
    celebrateTitle: "अभिनंदन, प्रशांतजी!",
    celebrateDesc: "आपला करारनामा कायदेशीररित्या सक्रिय झाला असून दोन्ही बाजूंनी स्वाक्षरी केली आहे. सुरक्षित आणि खात्रीशीर लिफ्ट स्थापनेच्या प्रक्रियेत आपले स्वागत आहे.",
    clientChecklistTitle: "तुमचा लाइव्ह प्रगती प्रवास",
    clientChecklistDesc: "तुमच्या लिफ्ट इन्स्टॉलेशनचा लाइव्ह प्रवास. तुमच्या कस्टमर कन्सोलद्वारे तुम्ही कधीही हा ट्रॅक करू शकता.",
    commissionTitle: "विक्री आणि कमिशन वाटप लेजर",
    commissionDesc: "करार निश्चित झाल्यावर कमिशन वाटप स्वयंचलितपणे तयार होते. हे मूल्य थेट मुख्य फायनान्स रेकॉर्डमध्ये जोडले जाते.",
    dealValueLabel: "एकूण सौदा मूल्य",
    surveyorRewardLabel: "सर्वेक्षक कमिशन (१.५%)",
    salesRewardLabel: "विक्री प्रतिनिधी कमिशन (२.५%)",
    financeStatusLabel: "फायनान्स विभाग प्रगती",
    microserviceLogsTitle: "ऑटोमेशन आणि लॉजिस्टिक्स ट्रॅकर",
    microserviceLogsDesc: "करार अंतिम स्वाक्षरी झाल्यावर खालील स्वयंचलित प्रक्रिया त्वरित कार्यान्वित झाल्या आहेत.",
    paymentScheduleStatus: "पेमेंट शेड्युल यशस्वीरीत्या तयार केले आहे. ३०% ॲडव्हान्स भरण्यासाठीची लिंक ग्राहकाच्या व्हॉट्सॲपवर पाठवली आहे.",
    supplierPoStatus: "सप्लायर मॅन्युफॅक्चरिंग ऑर्डर पुणे येथील प्लांटमध्ये पाठवण्यात आली आहे.",
    crmLockStatus: "CRM स्टेज 'Closed Won' वर बदलण्यात आले आहे. करारात बदल होऊ नये म्हणून कानबन बोर्ड मधील कार्ड लॉक केले आहे.",
    pointOfContactTitle: "तुमचे नियुक्त केलेले प्रोजेक्ट लीड",
    pointOfContactDesc: "तुमचे समर्पित इंजिनिअरिंग व्यवस्थापक जे जागेची पाहणी आणि लिफ्ट डिलिव्हरी शेड्युल सांभाळतील.",
    pocName: "श्री. रमेश गायकवाड",
    pocRole: "वरिष्ठ इन्स्टॉलेशन प्रमुख, पुणे पश्चिम विभाग",
    pocContactBtn: "प्रोजेक्ट लीडला कॉल करा",
    voidDealBtn: "सौदा रद्द व पूर्ववत करा (ऑडिट आवश्यक)",
    toastVoidSuccess: "ऑडिट नोंदवले गेले. करार यशस्वीरीत्या रद्द केला असून वाटाघाटी टप्प्यावर परत नेण्यात आला आहे.",
    toastVoidConfirm: "तुम्हाला नक्की हा व्यावसायिक करार रद्द करायचा आहे का? यामुळे कमिशन देखील रद्द होईल.",
    toastTriggerSuccess: "बॅकएंड ऑटोमेशन प्रक्रिया पुन्हा पाठवली गेली.",
    milestone1: "करारनामा स्वाक्षरी पूर्ण",
    milestone2: "ॲडव्हान्स पेमेंट लिंक प्रेषित",
    milestone3: "पुणे मॅन्युफॅक्चरिंग ऑर्डर",
    milestone4: "जागेची अंतिम मोजमाप पाहणी",
    milestone5: "इन्स्टॉलेशन प्रक्रिया प्रारंभ"
  }
};

export const DealClosureConfirmation: React.FC<{ user: any; onBackToStart?: () => void }> = ({ user, onBackToStart }) => {
  const { language } = useLanguage();
  const [activePersona, setActivePersona] = useState<'customer' | 'staff'>('customer');
  const [toastMsg, setToastMsg] = useState('');
  
  // Simulated deal variables
  const dealValue = 685000; // 6.85 Lakhs INR
  const surveyorCommission = dealValue * 0.015;
  const salesCommission = dealValue * 0.025;

  // Custom states
  const [rebuildingTriggers, setRebuildingTriggers] = useState(false);
  const [dealVoided, setDealVoided] = useState(false);

  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Re-run downstream automation triggers
  const handleReRunAutomation = () => {
    setRebuildingTriggers(true);
    setTimeout(() => {
      setRebuildingTriggers(false);
      triggerToast(t.toastTriggerSuccess);
    }, 1200);
  };

  // Void Deal function (audit request)
  const handleVoidDeal = () => {
    const confirmation = window.confirm(t.toastVoidConfirm);
    if (confirmation) {
      setDealVoided(true);
      triggerToast(t.toastVoidSuccess);
    }
  };

  const clientMilestoneSteps = [
    { id: '1', label: t.milestone1, completed: true, active: false },
    { id: '2', label: t.milestone2, completed: true, active: false },
    { id: '3', label: t.milestone3, completed: true, active: true },
    { id: '4', label: t.milestone4, completed: false, active: false },
    { id: '5', label: t.milestone5, completed: false, active: false }
  ];

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

      {/* Progress Indicator Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Negotiation & Closing Progress (Screen 7 of 10)</span>
            <span>70.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 77 of 200)</span>
            <span>38.5%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '38.5%' }} />
          </div>
        </div>
      </div>

      {/* Header section with status badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-royalemerald font-mono font-extrabold bg-royalemerald/10 px-2.5 py-1 rounded-md">
            MODULE 8 • DEAL CLOSED WON
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-royalemerald" />
            <span>{t.title}</span>
            <Badge status="closed_won" className="ml-2" />
          </h1>
          <p className="text-xs text-warmgray font-semibold max-w-2xl mt-0.5 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* View mode selector */}
        <div className="bg-white p-1 rounded-xl border border-border flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-mono font-bold text-warmgray px-2 uppercase">Viewing Mode:</span>
          <button
            onClick={() => setActivePersona('customer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'customer' 
                ? 'bg-royalemerald text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'ग्राहक' : language === 'mr' ? 'ग्राहक' : 'Customer'}
          </button>
          <button
            onClick={() => setActivePersona('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePersona === 'staff' 
                ? 'bg-antiquegold text-white' 
                : 'text-charcoal hover:bg-alabaster'
            }`}
          >
            {language === 'hi' ? 'स्टाफ / एडमिन' : language === 'mr' ? 'स्टाफ / एडमिन' : 'Staff / Admin'}
          </button>
        </div>
      </div>

      {/* Main Grid: Celebratory Layout or Reversal path */}
      {dealVoided ? (
        <Card className="p-8 bg-red-50/10 border-2 border-dashed border-red-200 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-error mx-auto animate-bounce" />
          <h3 className="font-serif text-lg font-black text-charcoal">Deal Contract Voided</h3>
          <p className="text-xs text-warmgray font-semibold max-w-lg mx-auto">
            This e-signed agreement has been marked as VOID for administrative corrections. Commission payouts, Pune factory order triggers, and WhatsApp invoicing cycles have been safely rolled back.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setDealVoided(false);
              triggerToast("Agreement restored successfully.");
            }}
            className="mx-auto"
          >
            <span>Restore Active Contract State</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Hero Card & Ascension checklist block (Customer target) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Celebration Greeting Banner */}
            <Card className="p-6 bg-white text-left relative overflow-hidden border border-royalemerald/20 shadow-diffuse">
              {/* Abstract decorative accent circle */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-royalemerald/5 rounded-full pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-antiquegold/5 rounded-full pointer-events-none" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-royalemerald bg-royalemerald/10 px-2 py-0.5 rounded">
                    CONGRATS!
                  </span>
                  <span className="text-xs text-antiquegold font-bold">★ AIEC Executive Circle</span>
                </div>

                <h2 className="font-serif text-xl md:text-2xl font-black text-charcoal">
                  {t.celebrateTitle}
                </h2>
                <p className="text-xs text-warmgray font-semibold leading-relaxed">
                  {t.celebrateDesc}
                </p>

                <div className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] grid grid-cols-3 gap-2">
                  <div className="text-left">
                    <span className="text-[8px] font-mono text-warmgray uppercase block">Deal ID</span>
                    <strong className="text-[11px] text-charcoal font-bold font-mono">#AIEC-9201-WL</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] font-mono text-warmgray uppercase block">Lakhs Total</span>
                    <strong className="text-[11px] text-charcoal font-bold font-mono">₹6.85 Lakhs</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] font-mono text-warmgray uppercase block">Closed Date</span>
                    <strong className="text-[11px] text-charcoal font-bold font-mono">Today, 07:19 AM</strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Journey Timeline Checklist */}
            <Card className="p-6 bg-white text-left space-y-6">
              <div>
                <h3 className="font-serif text-sm font-black text-charcoal">{t.clientChecklistTitle}</h3>
                <p className="text-[10px] text-warmgray font-semibold">{t.clientChecklistDesc}</p>
              </div>

              {/* Horizontal layout of milestone checklist */}
              <div className="bg-alabaster/40 p-4 rounded-xl border border-border">
                <AscensionLine 
                  steps={clientMilestoneSteps} 
                  orientation="horizontal" 
                />
              </div>

              {/* Detail milestone description list */}
              <div className="space-y-3.5 pt-2">
                <div className="flex gap-3 text-xs leading-normal font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-royalemerald text-[10px] shrink-0 font-bold">1</div>
                  <div>
                    <strong className="text-charcoal block">E-Contract Executed (Done)</strong>
                    <span className="text-[10px] text-warmgray block">Cryptographically bound via OTP verification + drawn signature. Locked & immutable.</span>
                  </div>
                </div>

                <div className="flex gap-3 text-xs leading-normal font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-royalemerald text-[10px] shrink-0 font-bold">2</div>
                  <div>
                    <strong className="text-charcoal block">Pune Factory Order Transmitted (Enqueued)</strong>
                    <span className="text-[10px] text-warmgray block">Specifications dispatched to fabrication warehouse for pre-assembly and custom cabin paneling.</span>
                  </div>
                </div>

                <div className="flex gap-3 text-xs leading-normal font-semibold">
                  <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-[10px] shrink-0 font-bold">3</div>
                  <div>
                    <strong className="text-charcoal block">Shaft Site-Preparation Visit (Scheduled)</strong>
                    <span className="text-[10px] text-warmgray block">Expected in 4 days. Ramesh Gaikwad will visit your villa to confirm custom civil masonry tolerances before dispatch.</span>
                  </div>
                </div>
              </div>

            </Card>

          </div>

          {/* Right Column: Internal commission and automated backend log tracking */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Project Lead POC Card */}
            <Card className="p-5 bg-white text-left space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-antiquegold" />
                <h4 className="font-serif text-xs font-black text-charcoal uppercase tracking-wider">{t.pointOfContactTitle}</h4>
              </div>
              
              <p className="text-[10px] text-warmgray font-semibold">
                {t.pointOfContactDesc}
              </p>

              <div className="p-3 bg-alabaster rounded-xl border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-antiquegold/10 border border-antiquegold/20 flex items-center justify-center text-antiquegold text-sm font-bold shrink-0">
                  RG
                </div>
                <div>
                  <strong className="text-xs text-charcoal block font-bold">{t.pocName}</strong>
                  <span className="text-[9px] text-warmgray block">{t.pocRole}</span>
                </div>
              </div>

              <button
                onClick={() => triggerToast(`Dialing Project Manager Ramesh Gaikwad at +91 94220 19028...`)}
                className="w-full py-2 bg-royalemerald text-white hover:bg-emerald-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t.pocContactBtn}</span>
              </button>
            </Card>

            {/* Sales & Commission Split Card (Internal/Admin focused) */}
            <Card className="p-5 bg-white space-y-4 border-l-4 border-l-antiquegold">
              <div className="flex justify-between items-center pb-2 border-b border-[#e5dfd4]/40">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-antiquegold" />
                  <h4 className="font-serif text-xs font-black text-charcoal uppercase tracking-wider">{t.commissionTitle}</h4>
                </div>
                <Badge status="paid" />
              </div>

              <p className="text-[10px] text-warmgray font-semibold leading-normal">
                {t.commissionDesc}
              </p>

              <div className="space-y-2.5 text-xs font-semibold leading-tight">
                <div className="flex justify-between">
                  <span className="text-warmgray">{t.dealValueLabel}</span>
                  <span className="font-mono text-charcoal">₹{dealValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">{t.surveyorRewardLabel}</span>
                  <span className="font-mono text-royalemerald">₹{surveyorCommission.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">{t.salesRewardLabel}</span>
                  <span className="font-mono text-royalemerald">₹{salesCommission.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-[#e5dfd4]/40 flex justify-between text-[10px] font-bold">
                  <span className="text-charcoal">{t.financeStatusLabel}</span>
                  <span className="text-royalemerald font-mono uppercase">DISPATCHED TO FINANCE SYSTEM ✅</span>
                </div>
              </div>
            </Card>

            {/* Microservice Logistics log panel */}
            <Card className="p-5 bg-white space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className={`w-4 h-4 text-antiquegold ${rebuildingTriggers ? 'animate-spin' : ''}`} />
                  <h4 className="font-serif text-xs font-black text-charcoal uppercase tracking-wider">{t.microserviceLogsTitle}</h4>
                </div>

                <button
                  onClick={handleReRunAutomation}
                  disabled={rebuildingTriggers}
                  className="p-1 hover:bg-alabaster rounded text-warmgray hover:text-charcoal border border-neutral-200 transition-all cursor-pointer"
                  title="Re-synchronize background jobs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[10px] text-warmgray font-semibold">
                {t.microserviceLogsDesc}
              </p>

              <div className="bg-[#faf9f6] p-3 rounded-xl border border-dashed border-[#e5dfd4] space-y-2.5 text-[10px] font-mono leading-normal font-semibold">
                <div className="text-charcoal flex items-start gap-1.5">
                  <span className="text-royalemerald shrink-0">●</span>
                  <span>{t.paymentScheduleStatus}</span>
                </div>
                <div className="text-charcoal flex items-start gap-1.5">
                  <span className="text-royalemerald shrink-0">●</span>
                  <span>{t.supplierPoStatus}</span>
                </div>
                <div className="text-charcoal flex items-start gap-1.5">
                  <span className="text-royalemerald shrink-0">●</span>
                  <span>{t.crmLockStatus}</span>
                </div>
              </div>
            </Card>

            {/* Admin Audit Control (Void Deal) */}
            {activePersona === 'staff' && (
              <Card className="p-4 bg-red-50/10 border border-red-200/50 rounded-xl">
                <button
                  onClick={handleVoidDeal}
                  className="w-full py-2.5 bg-error text-white hover:bg-red-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t.voidDealBtn}</span>
                </button>
              </Card>
            )}

          </div>

        </div>
      )}

      {/* Primary Action bar sticky fallback */}
      <div className="p-4 bg-white rounded-2xl border border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
        <div className="space-y-0.5">
          <strong className="text-xs text-charcoal block font-bold">Closed Agreement Completed Successfully</strong>
          <span className="text-[10px] text-warmgray block font-semibold">Ready to move onto the overall CRM dashboard tracking or site verification scheduling.</span>
        </div>
        
        {onBackToStart && (
          <Button
            variant="outline"
            onClick={onBackToStart}
            className="py-2.5 px-6 text-xs font-bold w-full sm:w-auto shrink-0"
          >
            <span>Back to Digital Contract List</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

    </div>
  );
};
