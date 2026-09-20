import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Landmark,
  Calculator,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  FileText,
  UserCheck,
  Percent,
  Check,
  Building,
  Briefcase
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';
import { User, LoanApplication, LoanPartner, Deal } from '../types';

interface LoanEmiApplicationProps {
  user: User;
  dealId?: string;
  onNavigateToCheckout?: () => void;
  onNavigateToStatus?: () => void;
}

const localizations = {
  en: {
    title: "AIEC Elevator Loan & EMI Portal",
    subtitle: "Convert remaining project milestones into affordable monthly EMIs with Instant Partner Financing.",
    step1: "1. Eligibility & Amount",
    step2: "2. Partner & EMI Plan",
    step3: "3. KYC & Business Details",
    step4: "4. Review & Apply",
    selectDeal: "Select Elevator Project Deal",
    monthlyIncomeRange: "Monthly Business / Family Income",
    requestedAmount: "Loan Financed Amount (₹)",
    tenurePref: "Preferred Tenure (Months)",
    precheckSuccess: "Eligibility Pre-Check Passed!",
    precheckSuccessDesc: "Your profile meets our financing partners' initial threshold for up to ₹15,00,000.",
    precheckLow: "Low Eligibility Warning",
    precheckLowDesc: "Your selected income range is lower than standard partner criteria, but you may still submit a full application with co-applicant collateral.",
    choosePartner: "Select Financing Partner",
    cashVsEmiComparison: "Cash vs EMI Transparency Comparison",
    directCashCost: "AIEC Direct Cash Price",
    totalEmiCost: "Total EMI Repayment Cost",
    interestDelta: "Interest Cost Difference",
    monthlyEmiLabel: "Monthly EMI Amount",
    partnerApprovalRate: "Partner Approval Rate",
    partnerDisbursementSpeed: "Avg Disbursement Speed",
    enterPan: "Business / Personal PAN Card",
    enterAadhaar: "Aadhaar / Address Proof Number",
    enterGst: "GSTIN (Optional for Business Discount)",
    submitAppBtn: "Submit Official Loan Application",
    appSubmittedSuccess: "Loan Application Submitted Successfully!",
    appSubmittedSubtitle: "Application ID: ",
    appSubmittedDesc: "Our financing partner will complete document audit within 24-48 hours. Upon disbursement, AIEC receives payment immediately and your elevator work continues uninterrupted.",
    trackerTitle: "Your In-Flight EMI Application Tracker",
    disbursementGuaranteedNotice: "Note: On disbursement, AIEC receives full payment one-time and your project is marked 100% cleared."
  },
  hi: {
    title: "एआईईसी लिफ्ट ऋण और ईएमआई पोर्टल",
    subtitle: "तत्काल पार्टनर फाइनेंसिंग के साथ शेष परियोजना मील के पत्थर को सस्ती मासिक ईएमआई में बदलें।",
    step1: "1. पात्रता और राशि",
    step2: "2. पार्टनर और ईएमआई प्लान",
    step3: "3. केवाईसी विवरण",
    step4: "4. समीक्षा और आवेदन",
    selectDeal: "लिफ्ट प्रोजेक्ट डील चुनें",
    monthlyIncomeRange: "मासिक व्यवसाय / पारिवारिक आय",
    requestedAmount: "ऋण वित्त पोषित राशि (₹)",
    tenurePref: "पसंदीदा अवधि (महीने)",
    precheckSuccess: "पात्रता प्री-चेक पास हो गया!",
    precheckSuccessDesc: "आपका प्रोफ़ाइल ₹15,00,000 तक के लिए हमारे फाइनेंसिंग पार्टनर्स की प्रारंभिक सीमा को पूरा करता है।",
    precheckLow: "कम पात्रता चेतावनी",
    precheckLowDesc: "आपकी चुनी गई आय सीमा मानक मानदंड से कम है, लेकिन आप अभी भी सह-आवेदक के साथ आवेदन जमा कर सकते हैं।",
    choosePartner: "फाइनेंसिंग पार्टनर चुनें",
    cashVsEmiComparison: "नकद बनाम ईएमआई पारदर्शिता तुलना",
    directCashCost: "एआईईसी प्रत्यक्ष नकद मूल्य",
    totalEmiCost: "कुल ईएमआई पुनर्भुगतान लागत",
    interestDelta: "ब्याज लागत अंतर",
    monthlyEmiLabel: "मासिक ईएमआई राशि",
    partnerApprovalRate: "पार्टनर स्वीकृति दर",
    partnerDisbursementSpeed: "औसत संवितरण गति",
    enterPan: "व्यवसाय / व्यक्तिगत पैन कार्ड",
    enterAadhaar: "आधार / पता प्रमाण संख्या",
    enterGst: "जीएसटीआईएन (वैकल्पिक)",
    submitAppBtn: "आधिकारिक ऋण आवेदन जमा करें",
    appSubmittedSuccess: "ऋण आवेदन सफलतापूर्वक जमा किया गया!",
    appSubmittedSubtitle: "आवेदन आईडी: ",
    appSubmittedDesc: "हमारा फाइनेंसिंग पार्टनर 24-48 घंटों के भीतर दस्तावेज़ ऑडिट पूरा करेगा। संवितरण पर, एआईईसी को तुरंत भुगतान प्राप्त होता है और आपका काम निर्बाध रूप से जारी रहता है।",
    trackerTitle: "आपका इन-फ्लाइट ईएमआई आवेदन ट्रैकर",
    disbursementGuaranteedNotice: "नोट: संवितरण पर, एआईईसी को एक बार में पूरा भुगतान प्राप्त होता है और आपका प्रोजेक्ट 100% स्वीकृत हो जाता है।"
  },
  mr: {
    title: "एआयईसी लिफ्ट कर्ज आणि ईएमआय पोर्टल",
    subtitle: "पार्टनर फायनान्सिंगसह प्रकल्पाची उर्वरित रक्कम परवडणाऱ्या मासिक ईएमआयमध्ये बदला.",
    step1: "1. पात्रता व रक्कम",
    step2: "2. पार्टनर व ईएमआय प्लॅन",
    step3: "3. केवायसी तपशील",
    step4: "4. पुनरावलोकन व अर्ज",
    selectDeal: "लिफ्ट प्रकल्प डील निवडा",
    monthlyIncomeRange: "मासिक व्यवसाय / कौटुंबिक उत्पन्न",
    requestedAmount: "कर्ज रक्कम (₹)",
    tenurePref: "कालावधी (महिने)",
    precheckSuccess: "पात्रता प्री-चेक पास!",
    precheckSuccessDesc: "तुमचे प्रोफाइल ₹15,00,000 पर्यंतच्या फायनान्सिंगसाठी पात्र आहे.",
    precheckLow: "कमी पात्रता सूचना",
    precheckLowDesc: "तुमचे उत्पन्न निकषांपेक्षा कमी आहे, तरीही तुम्ही सह-अर्जदारासोबत अर्ज करू शकता.",
    choosePartner: "फायनान्सिंग पार्टनर निवडा",
    cashVsEmiComparison: "रोख विरुद्ध ईएमआय पारदर्शकता तुलना",
    directCashCost: "एआयईसी थेट रोख किंमत",
    totalEmiCost: "एकूण ईएमआय परतफेड रक्कम",
    interestDelta: "व्याज फरक",
    monthlyEmiLabel: "मासिक ईएमआय रक्कम",
    partnerApprovalRate: "पार्टनर मंजुरी दर",
    partnerDisbursementSpeed: "सरासरी वितरण वेळ",
    enterPan: "पॅन कार्ड क्रमांक",
    enterAadhaar: "आधार क्रमांक",
    enterGst: "जीएसटी क्रमांक (पर्यायी)",
    submitAppBtn: "अधिकृत कर्ज अर्ज सादर करा",
    appSubmittedSuccess: "कर्ज अर्ज यशस्वीपणे सबमिट झाला!",
    appSubmittedSubtitle: "अर्ज आयडी: ",
    appSubmittedDesc: "आम्हा फायनान्सिंग पार्टनर २४-४८ तासांत पडताळणी पूर्ण करेल. वितरण झाल्यावर एआयईसीला पूर्ण रक्कम लगेच मिळते व तुमचे काम अखंडपणे सुरू राहते.",
    trackerTitle: "तुमचा ईएमआय अर्ज ट्रॅकर",
    disbursementGuaranteedNotice: "टीप: वितरण झाल्यावर एआयईसीला पूर्ण रक्कम एकदाच मिळते व तुमची थकबाकी निरंक होते."
  }
};

export const LoanEmiApplication: React.FC<LoanEmiApplicationProps> = ({
  user,
  dealId,
  onNavigateToCheckout,
  onNavigateToStatus
}) => {
  const { language } = useLanguage();
  const t = localizations[language as keyof typeof localizations] || localizations.en;

  const [wizardStep, setWizardStep] = useState<number>(1);
  const [partners, setPartners] = useState<LoanPartner[]>([]);
  const [existingApps, setExistingApps] = useState<LoanApplication[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  // Application Form State
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [incomeRange, setIncomeRange] = useState<string>('₹2,00,000 - ₹5,00,000');
  const [requestedAmount, setRequestedAmount] = useState<number>(375000);
  const [selectedTenure, setSelectedTenure] = useState<number>(12);
  const [selectedPartner, setSelectedPartner] = useState<LoanPartner | null>(null);

  // KYC Details
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [aadhaarNumber, setAadhaarNumber] = useState<string>('9876 5432 1098');
  const [gstin, setGstin] = useState<string>('27AABCA1234F1ZM');

  const [createdAppId, setCreatedAppId] = useState<string | null>(null);

  useEffect(() => {
    const loadedPartners = DbManager.getLoanPartners();
    setPartners(loadedPartners);
    if (loadedPartners.length > 0) setSelectedPartner(loadedPartners[0]);

    const loadedApps = DbManager.getLoanApplications();
    setExistingApps(loadedApps);

    const loadedDeals = DbManager.getDeals();
    setDeals(loadedDeals);

    if (dealId) {
      setSelectedDealId(dealId);
      const matchedDeal = loadedDeals.find(d => d.id === dealId);
      if (matchedDeal) setRequestedAmount(matchedDeal.agreedPrice || (matchedDeal as any).totalAmount || 375000);
    } else if (loadedDeals.length > 0) {
      setSelectedDealId(loadedDeals[0].id);
      setRequestedAmount(loadedDeals[0].agreedPrice || (loadedDeals as any)[0].totalAmount || 375000);
    }
  }, [dealId]);

  // EMI Calculator Helper
  const calculateEmi = (principal: number, annualRate: number, tenureMonths: number) => {
    const r = annualRate / 12 / 100;
    const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
    return Math.round(emi);
  };

  const currentEmi = selectedPartner ? calculateEmi(requestedAmount, selectedPartner.interestRate, selectedTenure) : 0;
  const totalRepayment = currentEmi * selectedTenure;
  const interestDelta = totalRepayment - requestedAmount;

  const handleNextStep = () => {
    if (wizardStep < 4) setWizardStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) setWizardStep(prev => prev - 1);
  };

  const handleSubmitApplication = () => {
    if (!selectedPartner) return;

    const selectedDeal = deals.find(d => d.id === selectedDealId);
    const newApp: LoanApplication = {
      id: `loan_app_${Date.now().toString().slice(-5)}`,
      dealId: selectedDealId || 'deal_1',
      customerId: user.id,
      customerName: selectedDeal?.customerName || user.name,
      customerPhone: selectedDeal?.phone || user.phone || '+91 98220 00000',
      requestedAmount,
      tenureMonths: selectedTenure,
      partnerId: selectedPartner.id,
      partnerName: selectedPartner.name,
      interestRateAnnual: selectedPartner.interestRate,
      monthlyEmiAmount: currentEmi,
      totalRepaymentAmount: totalRepayment,
      monthlyIncomeRange: incomeRange,
      status: 'Submitted',
      partnerStatusNote: 'Document verification initiated automatically via partner API.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DbManager.addLoanApplication(newApp);
    setCreatedAppId(newApp.id);
    setExistingApps(DbManager.getLoanApplications());
    setWizardStep(5); // Completion step
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-diffuse space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
            MODULE 9 • FINANCING
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-royalemerald/10 text-royalemerald border border-royalemerald/20">
            BAJAJ • HDFC • TATA
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
          <Landmark className="w-6 h-6 text-antiquegold" />
          {t.title}
        </h1>
        <p className="text-xs text-warmgray max-w-2xl">{t.subtitle}</p>
      </div>

      {/* ASCENSION LINE STEP WIZARD BAR */}
      <Card className="p-4 bg-alabaster border border-[rgba(184,135,61,0.2)]">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-warmgray mb-3">
          <span className={wizardStep >= 1 ? "text-antiquegold" : ""}>{t.step1}</span>
          <span className={wizardStep >= 2 ? "text-antiquegold" : ""}>{t.step2}</span>
          <span className={wizardStep >= 3 ? "text-antiquegold" : ""}>{t.step3}</span>
          <span className={wizardStep >= 4 ? "text-antiquegold" : ""}>{t.step4}</span>
        </div>

        {/* Ascension Line Horizontal Progress */}
        <div className="relative h-2 bg-[#e6dfd4] rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-antiquegold to-royalemerald"
            initial={{ width: '0%' }}
            animate={{ width: `${(wizardStep / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Card>

      {/* STEP 1: ELIGIBILITY & AMOUNT */}
      {wizardStep === 1 && (
        <Card className="p-6 space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
            <Calculator className="w-5 h-5 text-antiquegold" />
            1. Eligibility Pre-Check & Amount Selection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-warmgray uppercase block">
                {t.selectDeal}
              </label>
              <select
                value={selectedDealId}
                onChange={e => {
                  setSelectedDealId(e.target.value);
                  const d = deals.find(item => item.id === e.target.value);
                  if (d) setRequestedAmount(d.agreedPrice || (d as any).totalAmount || 375000);
                }}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              >
                {deals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.id} • {(d as any).customerName || 'Elevator Project'} — ₹{(d.agreedPrice || (d as any).totalAmount || 375000).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-warmgray uppercase block">
                {t.monthlyIncomeRange}
              </label>
              <select
                value={incomeRange}
                onChange={e => setIncomeRange(e.target.value)}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              >
                <option value="Under ₹1,00,000">Under ₹1,00,000 / month</option>
                <option value="₹1,00,000 - ₹2,00,000">₹1,00,000 - ₹2,00,000 / month</option>
                <option value="₹2,00,000 - ₹5,00,000">₹2,00,000 - ₹5,00,000 / month</option>
                <option value="₹5,00,000 - ₹10,00,000">₹5,00,000 - ₹10,00,000 / month</option>
                <option value="₹10,00,000+">₹10,00,000+ / month (High Commercial)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-warmgray uppercase block">
                {t.requestedAmount}
              </label>
              <span className="font-mono text-base font-bold text-royalemerald">
                ₹ {requestedAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={100000}
              max={2500000}
              step={25000}
              value={requestedAmount}
              onChange={e => setRequestedAmount(Number(e.target.value))}
              className="w-full accent-antiquegold cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-warmgray uppercase block">
              {t.tenurePref}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 12, 24, 36].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedTenure(m)}
                  className={`py-2.5 rounded-xl border font-mono text-xs font-bold transition-all ${
                    selectedTenure === m
                      ? 'bg-antiquegold/10 border-antiquegold text-antiquegold ring-2 ring-antiquegold/20'
                      : 'bg-white border-[#e6dfd4] text-warmgray hover:bg-alabaster'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>

          {/* Pre-check feedback card */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-emerald-950">{t.precheckSuccess}</h4>
              <p className="text-[11px] text-emerald-800">{t.precheckSuccessDesc}</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleNextStep}
              className="bg-royalemerald text-white text-xs px-6 py-2.5 flex items-center gap-1.5"
            >
              <span>{t.step2}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: PARTNER & EMI TRANSPARENCY */}
      {wizardStep === 2 && (
        <Card className="p-6 space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
            <Landmark className="w-5 h-5 text-antiquegold" />
            2. Choose Partner & Transparency Comparison
          </h3>

          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-warmgray uppercase block">
              {t.choosePartner}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {partners.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPartner(p)}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                    selectedPartner?.id === p.id
                      ? 'bg-antiquegold/10 border-antiquegold ring-2 ring-antiquegold/30'
                      : 'bg-white border-[#e6dfd4] hover:bg-alabaster'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-charcoal">{p.name}</span>
                    <Badge variant="emerald" className="text-[9px]">
                      {p.interestRate}% p.a.
                    </Badge>
                  </div>
                  <div className="text-[10px] font-mono text-warmgray space-y-1 pt-1 border-t border-[#e6dfd4]">
                    <p>{t.partnerApprovalRate}: <strong className="text-emerald-800">{p.approvalRatePercentage}%</strong></p>
                    <p>{t.partnerDisbursementSpeed}: <strong className="text-charcoal">{p.avgDisbursementDays} days</strong></p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cash vs EMI Comparison Block */}
          {selectedPartner && (
            <div className="p-5 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.2)] space-y-4">
              <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-2">
                <Percent className="w-4 h-4 text-antiquegold" />
                {t.cashVsEmiComparison}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#e6dfd4]">
                  <span className="text-[10px] text-warmgray uppercase block">{t.directCashCost}</span>
                  <span className="text-base font-bold text-charcoal">₹ {requestedAmount.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-emerald-700 block mt-0.5">0% interest / fees</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-antiquegold/30">
                  <span className="text-[10px] text-warmgray uppercase block">{t.monthlyEmiLabel}</span>
                  <span className="text-base font-bold text-antiquegold">₹ {currentEmi.toLocaleString('en-IN')} / mo</span>
                  <span className="text-[9px] text-warmgray block mt-0.5">For {selectedTenure} months</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#e6dfd4]">
                  <span className="text-[10px] text-warmgray uppercase block">{t.totalEmiCost}</span>
                  <span className="text-base font-bold text-charcoal">₹ {totalRepayment.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-amber-700 block mt-0.5">
                    +{t.interestDelta}: ₹ {interestDelta.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={handlePrevStep} className="text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleNextStep}
              className="bg-royalemerald text-white text-xs px-6 py-2.5 flex items-center gap-1.5"
            >
              <span>{t.step3}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: KYC & BUSINESS DETAILS */}
      {wizardStep === 3 && (
        <Card className="p-6 space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-antiquegold" />
            3. KYC & Business Verification
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-warmgray uppercase block">{t.enterPan}</label>
              <input
                type="text"
                value={panNumber}
                onChange={e => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-warmgray uppercase block">{t.enterAadhaar}</label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={e => setAadhaarNumber(e.target.value)}
                placeholder="9876 5432 1098"
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-warmgray uppercase block">{t.enterGst}</label>
              <input
                type="text"
                value={gstin}
                onChange={e => setGstin(e.target.value.toUpperCase())}
                placeholder="27AABCA1234F1ZM"
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              />
            </div>
          </div>

          <div className="p-3 bg-alabaster rounded-xl text-[11px] text-warmgray flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-royalemerald shrink-0" />
            <span>Encrypted transmission directly to partner audit desk. No CIBIL hard hit during pre-assessment.</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={handlePrevStep} className="text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleNextStep}
              className="bg-royalemerald text-white text-xs px-6 py-2.5 flex items-center gap-1.5"
            >
              <span>{t.step4}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {wizardStep === 4 && (
        <Card className="p-6 space-y-6">
          <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
            <FileText className="w-5 h-5 text-antiquegold" />
            4. Application Review & Authorization
          </h3>

          <div className="p-5 bg-alabaster rounded-2xl border border-[#e6dfd4] space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-[#e6dfd4] pb-2">
              <span className="text-warmgray">SELECTED PARTNER:</span>
              <span className="font-bold text-royalemerald">{selectedPartner?.name}</span>
            </div>
            <div className="flex justify-between border-b border-[#e6dfd4] pb-2">
              <span className="text-warmgray">LOAN AMOUNT:</span>
              <span className="font-bold text-charcoal">₹ {requestedAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-b border-[#e6dfd4] pb-2">
              <span className="text-warmgray">TENURE & EMI:</span>
              <span className="font-bold text-antiquegold">₹ {currentEmi.toLocaleString('en-IN')} x {selectedTenure} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warmgray">PAN / GSTIN:</span>
              <span className="font-bold text-charcoal">{panNumber} • {gstin}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 border border-emerald-200">
            {t.disbursementGuaranteedNotice}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={handlePrevStep} className="text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitApplication}
              className="bg-antiquegold hover:bg-amber-700 text-white font-serif font-bold text-sm px-8 py-3"
            >
              {t.submitAppBtn}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: APPLICATION SUBMITTED CONFIRMATION */}
      {wizardStep === 5 && (
        <Card className="p-8 text-center space-y-6 bg-white border border-antiquegold/30">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-charcoal">{t.appSubmittedSuccess}</h3>
            <p className="text-xs font-mono text-antiquegold">{t.appSubmittedSubtitle} {createdAppId}</p>
            <p className="text-xs text-warmgray max-w-lg mx-auto pt-2">{t.appSubmittedDesc}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateToStatus && (
              <Button
                variant="primary"
                onClick={onNavigateToStatus}
                className="bg-royalemerald text-white text-xs px-6 py-2.5"
              >
                View Admin / Partner Status Tracker
              </Button>
            )}
            {onNavigateToCheckout && (
              <Button
                variant="secondary"
                onClick={onNavigateToCheckout}
                className="text-xs px-6 py-2.5"
              >
                Back to Online Checkout
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* EXISTING IN-FLIGHT APPLICATIONS TRACKER */}
      {existingApps.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
            <Clock className="w-5 h-5 text-antiquegold" />
            {t.trackerTitle}
          </h3>

          <div className="space-y-3">
            {existingApps.map(app => (
              <div
                key={app.id}
                className="p-4 bg-alabaster rounded-2xl border border-[#e6dfd4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-charcoal">{app.id}</span>
                    <span className="text-warmgray">• {app.partnerName}</span>
                  </div>
                  <p className="text-warmgray">
                    Amount: <strong className="text-royalemerald font-mono">₹{app.requestedAmount.toLocaleString('en-IN')}</strong> ({app.tenureMonths} mos @ ₹{app.monthlyEmiAmount.toLocaleString('en-IN')}/mo)
                  </p>
                  {app.partnerStatusNote && (
                    <p className="text-[11px] text-amber-800 italic">"{app.partnerStatusNote}"</p>
                  )}
                </div>

                <div>
                  {app.status === 'Disbursed' ? (
                    <Badge variant="emerald" className="px-3 py-1 text-xs">
                      DISBURSED (AIEC PAID)
                    </Badge>
                  ) : app.status === 'Approved' ? (
                    <Badge variant="gold" className="px-3 py-1 text-xs">
                      APPROVED / PENDING DISBURSEMENT
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="px-3 py-1 text-xs">
                      {app.status.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
