import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Sparkles, Star, Users, CheckCircle, FileText, Landmark,
  TrendingUp, Send, RefreshCw, MessageSquare, ShieldAlert, ArrowRight,
  UserCheck, DollarSign, Briefcase, ChevronRight, Lock, Check, Gift
} from 'lucide-react';
import { Card, Button, Badge, AscensionLine } from './Common';
import { useLanguage } from '../lib/language';

interface StaffContribution {
  id: string;
  name: string;
  role: 'surveyor' | 'sales_rep' | 'manager';
  contributionText: string;
  baseReward: number;
  bonusReward: number;
  contestPoints: number;
  avatarInitials: string;
}

// Localizations for Deal Won Celebration & Next Steps Screen
const localizations = {
  en: {
    title: "Victory Celebration & Ledger",
    subtitle: "Internal Win Space: Honor the elite team synergy that sealed the latest high-value contract. Verify commissions and submit project insights.",
    heroGreeting: "SADA SEVA! WE WON THE DEAL!",
    heroDesc: "A new custom 6-Passenger Panoramic Elevator deal has been officially countersigned and closed. Great execution, team!",
    dealDetailsTitle: "Deal Metadata Block",
    commissionLedgerTitle: "Involved Staff Rewards & Commissions",
    commissionLedgerDesc: "Splits generated based on multi-role contribution criteria. Committed to central ledger.",
    feedbackTitle: "Project Retrospective & Insights",
    feedbackDesc: "What did we learn from this customer interaction? Your honest feedback helps tune the Auto-Negotiator bot.",
    feedbackPlaceholder: "Share pricing, safety objections, or customer remarks to train our local AI templates...",
    submitFeedbackBtn: "Lock Retro Insights",
    acknowledgeBtn: "Acknowledge & Sync Ledger",
    contestTitle: "Active Sales Contest Leaderboard",
    contestDesc: "Earn double points for all custom residential shaft closings this month.",
    downstreamTitle: "Automated Downstream Records",
    downstreamDesc: "Click to audit or manage the synchronized post-signature operations.",
    viewPoBtn: "Verify Supplier PO",
    viewPaymentBtn: "Review Payment Schedule",
    feedbackSavedToast: "Thank you! Insights captured and routed to Prashantji's Admin log.",
    acknowledgeToast: "Ledger authenticated and posted to the commission accounts successfully.",
    roleSurveyor: "Site Surveyor",
    roleSales: "Sales Executive",
    roleManager: "Regional Manager",
    confidentialWarn: "INTERNAL INTEL • STAKEHOLDER REMUNERATION AND COMMISSIONS LEDGER",
    contestTarget: "Contest Progress (Pune Region)"
  },
  hi: {
    title: "जीत का जश्न और बहीखाता",
    subtitle: "आंतरिक जीत स्थान: उस उत्कृष्ट टीम तालमेल का सम्मान करें जिसने नवीनतम उच्च-मूल्य अनुबंध को सुरक्षित किया।",
    heroGreeting: "सदा सेवा! हमने डील जीत ली है!",
    heroDesc: "एक नया कस्टम 6-यात्री पैनोरमिक लिफ्ट सौदा आधिकारिक रूप से हस्ताक्षरित और बंद हो गया है। बहुत बढ़िया, टीम!",
    dealDetailsTitle: "सौदा मेटाडेटा ब्लॉक",
    commissionLedgerTitle: "शामिल कर्मचारियों के पुरस्कार और कमीशन",
    commissionLedgerDesc: "मल्टी-रोल योगदान मानदंडों के आधार पर कमीशन विभाजन। केंद्रीय बहीखाते में दर्ज किया गया।",
    feedbackTitle: "परियोजना समीक्षा और अंतर्दृष्टि",
    feedbackDesc: "हमने इस ग्राहक बातचीत से क्या सीखा? आपकी ईमानदार प्रतिक्रिया ऑटो-नेगोशिएटर बॉट को बेहतर बनाने में मदद करती है।",
    feedbackPlaceholder: "हमारे स्थानीय एआई टेम्पलेट्स को प्रशिक्षित करने के लिए मूल्य निर्धारण, सुरक्षा आपत्तियों या ग्राहक टिप्पणियों को साझा करें...",
    submitFeedbackBtn: "समीक्षा अंतर्दृष्टि लॉक करें",
    acknowledgeBtn: "बहीखाता स्वीकार और सिंक करें",
    contestTitle: "सक्रिय बिक्री प्रतियोगिता लीडरबोर्ड",
    contestDesc: "इस महीने सभी कस्टम आवासीय शाफ्ट क्लोजिंग के लिए दोहरे अंक अर्जित करें।",
    downstreamTitle: "स्वचालित डाउनस्ट्रीम रिकॉर्ड",
    downstreamDesc: "हस्ताक्षर के बाद की स्वचालित संचालन प्रक्रियाओं को देखने के लिए क्लिक करें।",
    viewPoBtn: "आपूर्तिकर्ता पीओ सत्यापित करें",
    viewPaymentBtn: "भुगतान अनुसूची की समीक्षा करें",
    feedbackSavedToast: "धन्यवाद! अंतर्दृष्टि दर्ज की गई और प्रशांतजी के एडमिन लॉग में भेज दी गई।",
    acknowledgeToast: "बहीखाता सफलतापूर्वक प्रमाणित किया गया और कमीशन खातों में पोस्ट किया गया।",
    roleSurveyor: "साइट सर्वेक्षक",
    roleSales: "बिक्री कार्यकारी",
    roleManager: "क्षेत्रीय प्रबंधक",
    confidentialWarn: "आंतरिक सूचना • हितधारक पारिश्रमिक और कमीशन बहीखाता",
    contestTarget: "प्रतियोगिता प्रगति (पुणे क्षेत्र)"
  },
  mr: {
    title: "यशस्वी करार सोहळा आणि वाटप",
    subtitle: "आंतरिक टीम सेलिब्रेशन: आपण मिळवलेल्या नवीन ६.८५ लाख रुपयांच्या करारातील सर्व भागीदारांचे कमिशन आणि योगदान तपासा.",
    heroGreeting: "सदा सेवा! सौदा पूर्ण झाला!",
    heroDesc: "एक नवीन सानुकूल ६-प्रवासी पॅनोरॅमिक लिफ्ट करार अधिकृतपणे स्वाक्षरी करून यशस्वीरीत्या पूर्ण झाला आहे.",
    dealDetailsTitle: "सौदा तपशील",
    commissionLedgerTitle: "सहभागी कर्मचारी कमिशन आणि बक्षिसे",
    commissionLedgerDesc: "कामाच्या विभागणीनुसार स्वयंचलित कमिशन वाटप. मुख्य कमिशन खात्यात जमा केले गेले आहे.",
    feedbackTitle: "सौदा पूर्वलक्ष्यी आढावा",
    feedbackDesc: "या करारादरम्यान ग्राहकांकडून काय नवीन अनुभव आला? हे ऑटो-नेगोशिएटर बॉटला अधिक सक्षम करण्यासाठी उपयुक्त ठरेल.",
    feedbackPlaceholder: "किंमत, सुरक्षिततेचे आक्षेप किंवा इतर प्रतिक्रिया येथे लिहा जेणेकरून आपले AI मॉडेल सुधारण्यास मदत होईल...",
    submitFeedbackBtn: "अभिप्राय जतन करा",
    acknowledgeBtn: "कमिशन मंजूर करा",
    contestTitle: "चालू सेल्स स्पर्धा लीडरबोर्ड",
    contestDesc: "या महिन्यात प्रत्येक घरगुती लिफ्ट करारावर डबल पॉईंट्स मिळवा.",
    downstreamTitle: "स्वयंचलित लॉजिस्टिक्स लिंक्स",
    downstreamDesc: "करारानंतर सुरू झालेल्या उत्पादन किंवा पेमेंट संबंधित प्रक्रियांवर लक्ष ठेवा.",
    viewPoBtn: "सप्लायर मॅन्युफॅक्चरिंग PO पहा",
    viewPaymentBtn: "पेमेंट शेड्युल तपासा",
    feedbackSavedToast: "धन्यवाद! तुमचा अभिप्राय प्रशांतजींच्या एडमिन डॅशबोर्डवर पाठवण्यात आला आहे.",
    acknowledgeToast: "कमिशन वाटप यशस्वीरीत्या मंजूर करून ट्रान्सफर करण्यात आले आहे.",
    roleSurveyor: "जागा सर्वेक्षक",
    roleSales: "सेल्स प्रतिनिधी",
    roleManager: "प्रादेशिक व्यवस्थापक",
    confidentialWarn: "केवळ अंतर्गत वापरासाठी • कर्मचारी कमिशन आणि मानधन वाटप तक्ता",
    contestTarget: "सेल्स स्पर्धा प्रगती (पुणे विभाग)"
  }
};

export const DealWonCelebration: React.FC<{ user: any; onBackToStart?: () => void }> = ({ user, onBackToStart }) => {
  const { language } = useLanguage();
  const [toastMsg, setToastMsg] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const t = useMemo(() => {
    return localizations[language as 'en' | 'hi' | 'mr'] || localizations.en;
  }, [language]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Multiple contributors involved in Pune West Villa installation deal
  const staffContributions: StaffContribution[] = [
    {
      id: "staff-1",
      name: "Sanjay Deshmukh",
      role: "surveyor",
      contributionText: "Captured precise shaft masonry measurements with LiDAR scanner within 2 hours of inquiry. Confirmed zero structural column deviations.",
      baseReward: 10275, // 1.5% of 6.85L
      bonusReward: 1500, // Speed dispatch bonus
      contestPoints: 150,
      avatarInitials: "SD"
    },
    {
      id: "staff-2",
      name: "Anand Shinde",
      role: "sales_rep",
      contributionText: "Managed active WhatsApp negotiation thread. Effectively addressed brand safety concerns by sharing BIS IS-14665 standard certificates.",
      baseReward: 17125, // 2.5% of 6.85L
      bonusReward: 3000, // Same-month conversion bonus
      contestPoints: 250,
      avatarInitials: "AS"
    },
    {
      id: "staff-3",
      name: "Ramesh Gaikwad",
      role: "manager",
      contributionText: "Supervised and authorized dry diamond-core shaft drilling schedule for elite residential compliance clearance.",
      baseReward: 5000, // Standard oversight override
      bonusReward: 1000,
      contestPoints: 50,
      avatarInitials: "RG"
    }
  ];

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      triggerToast("Please write a small reflection note first.");
      return;
    }
    setFeedbackSubmitted(true);
    triggerToast(t.feedbackSavedToast);
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    triggerToast(t.acknowledgeToast);
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-royalemerald text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-antiquegold/25 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-white" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Module 8: Closing Celebration (Screen 10 of 10)</span>
            <span>100.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-royalemerald rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-bold text-charcoal mb-1">
            <span>Overall Platform Build Progress (Screen 80 of 200)</span>
            <span>40.0%</span>
          </div>
          <div className="h-2.5 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
            <div className="h-full bg-antiquegold rounded-full" style={{ width: '40%' }} />
          </div>
        </div>
      </div>

      {/* Confidential Notice Warning */}
      <div className="p-3 bg-red-50 text-error rounded-xl border border-red-200/50 flex items-center gap-2.5 text-[10px] font-mono font-extrabold tracking-wider">
        <Lock className="w-4 h-4 text-error shrink-0" />
        <span>⚠️ {t.confidentialWarn}</span>
      </div>

      {/* High-Impact Celebratory Banner with confetti stars */}
      <Card className="p-8 bg-royalemerald text-white relative overflow-hidden rounded-3xl border-2 border-antiquegold shadow-2xl">
        {/* Confetti sparkle overlays */}
        <div className="absolute right-0 top-0 w-36 h-36 bg-antiquegold/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="space-y-4 relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-extrabold uppercase bg-antiquegold text-charcoal px-3 py-1 rounded-md tracking-widest inline-block">
                🏆 CHAMPION STATUS ACHIEVED
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-black tracking-tight text-white mt-1.5 flex items-center justify-center sm:justify-start gap-2.5">
                <Sparkles className="w-8 h-8 text-antiquegold animate-pulse" />
                <span>{t.heroGreeting}</span>
              </h2>
            </div>

            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/25 shrink-0 text-center sm:text-right">
              <span className="text-[9px] font-mono text-white/70 uppercase block">Total Contract Value</span>
              <span className="text-xl font-mono text-antiquegold font-extrabold">₹6,85,000</span>
            </div>
          </div>

          <p className="text-xs text-white/80 leading-relaxed font-semibold max-w-3xl">
            {t.heroDesc}
          </p>

          <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-mono font-bold text-white/90">
            <span className="flex items-center gap-1">
              🏢 Property: <strong className="text-white">Deshmukh Villa, Pune West</strong>
            </span>
            <span className="flex items-center gap-1">
              📐 Model: <strong className="text-white">Ascension Elite (Panoramic Glass)</strong>
            </span>
            <span className="flex items-center gap-1">
              📦 Order Status: <strong className="text-antiquegold">Pune Factory Enqueued ✅</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Main Attribution and Commission section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Team commission Splits and Contests */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Commission & Attribution list */}
          <Card className="p-6 bg-white space-y-4">
            <div>
              <h3 className="font-serif text-sm font-black text-charcoal">{t.commissionLedgerTitle}</h3>
              <p className="text-[10px] text-warmgray font-semibold">{t.commissionLedgerDesc}</p>
            </div>

            <div className="space-y-4 pt-2">
              {staffContributions.map((staff) => (
                <div key={staff.id} className="p-4 bg-alabaster rounded-2xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-royalemerald/10 border border-royalemerald/25 flex items-center justify-center text-royalemerald font-mono font-bold shrink-0 text-sm">
                      {staff.avatarInitials}
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-charcoal font-bold">{staff.name}</strong>
                        <span className="text-[8px] font-mono font-extrabold uppercase bg-royalemerald/15 text-royalemerald px-1.5 py-0.5 rounded">
                          {staff.role === 'surveyor' ? t.roleSurveyor : staff.role === 'sales_rep' ? t.roleSales : t.roleManager}
                        </span>
                      </div>
                      <p className="text-[10px] text-warmgray font-semibold leading-normal max-w-md">
                        {staff.contributionText}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 sm:gap-1 text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e5dfd4] shrink-0 font-mono text-[10px]">
                    <div>
                      <span className="text-[8px] text-warmgray uppercase block sm:inline">Base: </span>
                      <strong className="text-charcoal font-bold">₹{staff.baseReward.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-warmgray uppercase block sm:inline">Bonus: </span>
                      <strong className="text-royalemerald font-bold">+₹{staff.bonusReward.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-warmgray uppercase block sm:inline">Contest: </span>
                      <strong className="text-antiquegold font-extrabold">+{staff.contestPoints} pts</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Project Retrospective feedback input */}
          <Card className="p-6 bg-white space-y-4">
            <div>
              <h3 className="font-serif text-sm font-black text-charcoal">{t.feedbackTitle}</h3>
              <p className="text-[10px] text-warmgray font-semibold">{t.feedbackDesc}</p>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50/20 border border-emerald-200 rounded-xl text-xs text-royalemerald font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>Your retrospect insights have been submitted. Thank you for contributing to our sales intelligence pool!</span>
              </div>
            ) : (
              <form onSubmit={handleSaveFeedback} className="space-y-4">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={t.feedbackPlaceholder}
                  rows={3}
                  className="w-full p-3 bg-alabaster border border-[#e5dfd4] rounded-xl text-xs text-charcoal font-semibold focus:outline-none focus:border-antiquegold transition-all"
                  required
                />
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="emerald"
                    className="py-2 text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.submitFeedbackBtn}</span>
                  </Button>
                </div>
              </form>
            )}
          </Card>

        </div>

        {/* Right Column: Contest Progress leaderboard and Downstream actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Contest Status progress */}
          <Card className="p-5 bg-white space-y-4 border-t-4 border-t-antiquegold">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-antiquegold" />
              <div>
                <h4 className="font-serif text-xs font-black text-charcoal uppercase tracking-wider">{t.contestTitle}</h4>
                <span className="text-[9px] text-warmgray font-semibold block leading-tight">{t.contestDesc}</span>
              </div>
            </div>

            {/* Progress bar visual */}
            <div className="space-y-2 pt-2 text-xs font-semibold">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-charcoal">{t.contestTarget}</span>
                <span className="font-mono text-royalemerald">1,850 / 2,000 pts</span>
              </div>
              <div className="h-2 bg-alabaster rounded-full overflow-hidden border border-[#e5dfd4]">
                <div className="h-full bg-royalemerald rounded-full" style={{ width: '92.5%' }} />
              </div>
              <p className="text-[9px] text-warmgray leading-normal">
                ★ <strong className="text-charcoal">Only 150 points left</strong> to unlock the regional reward pool payout of ₹25,000 for Sanjay and Anand!
              </p>
            </div>
          </Card>

          {/* Links to Downstream artifacts */}
          <Card className="p-5 bg-white space-y-4">
            <div>
              <h4 className="font-serif text-xs font-black text-charcoal uppercase tracking-wider">{t.downstreamTitle}</h4>
              <p className="text-[10px] text-warmgray font-semibold">{t.downstreamDesc}</p>
            </div>

            <div className="space-y-2 text-xs font-bold">
              <button
                onClick={() => triggerToast("Opening Pune Assembly Factory PO #PO-AIEC-9201 for materials purchase inspection.")}
                className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[#e5dfd4] rounded-xl flex items-center justify-between text-charcoal font-semibold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-royalemerald" />
                  <span>{t.viewPoBtn}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-warmgray" />
              </button>

              <button
                onClick={() => triggerToast("Directing to automated WhatsApp billing link generator and advance payment log.")}
                className="w-full p-3 bg-alabaster hover:bg-[#edeae2] border border-[#e5dfd4] rounded-xl flex items-center justify-between text-charcoal font-semibold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-royalemerald" />
                  <span>{t.viewPaymentBtn}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-warmgray" />
              </button>
            </div>
          </Card>

          {/* Acknowledge Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAcknowledge}
              disabled={acknowledged}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                acknowledged 
                  ? 'bg-neutral-200 text-neutral-500 border border-neutral-300 cursor-not-allowed' 
                  : 'bg-royalemerald hover:bg-emerald-950 text-white border-b-4 border-b-emerald-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{acknowledged ? "Ledger Shared & Confirmed" : t.acknowledgeBtn}</span>
            </button>

            {onBackToStart && (
              <button
                onClick={onBackToStart}
                className="w-full py-2.5 bg-white hover:bg-alabaster border border-[#e5dfd4] rounded-2xl text-xs font-bold text-charcoal flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Back to Contract Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
