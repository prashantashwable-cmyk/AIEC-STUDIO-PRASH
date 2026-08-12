import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, AlertCircle, 
  Search, Filter, ChevronRight, Info, HelpCircle, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, ShieldAlert, Users, Layers,
  Briefcase, Landmark, RefreshCw, Eye, EyeOff, Globe
} from 'lucide-react';
import { Card, Button } from './Common';
import { useLanguage } from '../lib/language';
import { User } from '../types';

interface ReceivableItem {
  id: string;
  clientName: string;
  projectName: string;
  elevatorModel: string;
  paymentStage: string;
  amountINR: number;
  dueDate: string;
  daysOverdue: number;
  originalCurrency?: string;
  originalAmount?: number;
  isDisputed: boolean;
  disputeReason?: string;
}

interface OutflowItem {
  id: string;
  beneficiaryName: string;
  type: 'Supplier' | 'Technician' | 'Regulatory Fee';
  amountINR: number;
  dueDate: string;
  committedDate: string;
  elevatorProject: string;
}

const initialReceivables: ReceivableItem[] = [
  {
    id: 'REC-901',
    clientName: 'Wable Realtors & Developers',
    projectName: 'Shree Sai Heights Phase 1',
    elevatorModel: 'Aero-V3 Cabin Duplex',
    paymentStage: 'Motor Room Slabs Completion (3rd Stage)',
    amountINR: 450000,
    dueDate: '2026-06-25',
    daysOverdue: 14,
    isDisputed: false
  },
  {
    id: 'REC-902',
    clientName: 'Siddharth NRI Estates',
    projectName: 'Prashant Platinum Villa',
    elevatorModel: 'Ascent-Gold Panaromic',
    paymentStage: 'Initial Custom Engineering Signoff',
    amountINR: 1200000, // Large one-off receivable
    dueDate: '2026-07-01',
    daysOverdue: 8,
    originalCurrency: 'USD',
    originalAmount: 14400,
    isDisputed: false
  },
  {
    id: 'REC-903',
    clientName: 'Kothrud Elite Housing Soc.',
    projectName: 'Sai Meadows Tower B',
    elevatorModel: 'EcoGlide 6-Passenger',
    paymentStage: 'Shaft Handover Verification',
    amountINR: 320000,
    dueDate: '2026-04-10',
    daysOverdue: 90, // Will feed to 90+ bucket & Escalations
    isDisputed: false
  },
  {
    id: 'REC-904',
    clientName: 'Pune Metro Transit Authority',
    projectName: 'Swargate Interchange Hub',
    elevatorModel: 'HeavyDuty-V8 Escalator',
    paymentStage: 'Government Inspection Clearance',
    amountINR: 950000,
    dueDate: '2026-05-15',
    daysOverdue: 55,
    isDisputed: true,
    disputeReason: 'Awaiting secondary structural load test seal from PWD Pune surveyor.'
  },
  {
    id: 'REC-905',
    clientName: 'Phaltan Sugar Factory Admin',
    projectName: 'Industrial Cargo Tower 2',
    elevatorModel: 'Ascent-Freight 2000Kg',
    paymentStage: 'Cabin Assembly Arrival Slabs',
    amountINR: 280000,
    dueDate: '2026-06-05',
    daysOverdue: 34,
    isDisputed: false
  }
];

const initialOutflows: OutflowItem[] = [
  {
    id: 'OUT-401',
    beneficiaryName: 'Bhartia Steel & Motors Ltd.',
    type: 'Supplier',
    amountINR: 380000,
    dueDate: '2026-07-12',
    committedDate: '2026-07-05',
    elevatorProject: 'Sai Meadows Tower B'
  },
  {
    id: 'OUT-402',
    beneficiaryName: 'Wable & Son’s Heavy Castings',
    type: 'Supplier',
    amountINR: 250000,
    dueDate: '2026-07-16',
    committedDate: '2026-07-06',
    elevatorProject: 'Swargate Interchange Hub'
  },
  {
    id: 'OUT-403',
    beneficiaryName: 'Technician Amol G. Bhosale',
    type: 'Technician',
    amountINR: 45000,
    dueDate: '2026-07-11',
    committedDate: '2026-07-07',
    elevatorProject: 'Shree Sai Heights Phase 1'
  },
  {
    id: 'OUT-404',
    beneficiaryName: 'Pune Municipal Fire Authority',
    type: 'Regulatory Fee',
    amountINR: 12000,
    dueDate: '2026-07-14',
    committedDate: '2026-07-08',
    elevatorProject: 'Prashant Platinum Villa'
  }
];

// Cash flow history timeline for dynamic chart visualization
const cashflowHistory = [
  { label: 'Jan', cashIn: 1800000, supplierOut: 600000, technicianOut: 150000 },
  { label: 'Feb', cashIn: 2100000, supplierOut: 750000, technicianOut: 180000 },
  { label: 'Mar', cashIn: 1400000, supplierOut: 800000, technicianOut: 210000 },
  { label: 'Apr', cashIn: 2400000, supplierOut: 900000, technicianOut: 160000 },
  { label: 'May', cashIn: 2900000, supplierOut: 1100000, technicianOut: 250000 },
  { label: 'Jun', cashIn: 3200000, supplierOut: 1400000, technicianOut: 290000 },
];

export const FinancialCashFlowReceivables: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // States
  const [receivables, setReceivables] = useState<ReceivableItem[]>(initialReceivables);
  const [outflows, setOutflows] = useState<OutflowItem[]>(initialOutflows);
  const [selectedReceivable, setSelectedReceivable] = useState<ReceivableItem | null>(null);
  const [excludeOutliers, setExcludeOutliers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAgingBucket, setActiveAgingBucket] = useState<string>('All');

  // Translations
  const translations = {
    en: {
      title: "Financial Cash Flow & Receivables",
      subtitle: "Strategic overview of collections, aging invoices, upcoming commitments and liquidity",
      totalInvoiced: "Total Outstanding",
      cashInflow: "Total Cash-In (Jan-Jun)",
      cashOutflow: "Total Committed Outflows",
      medianTypical: "Median Receivable (Typical Case)",
      excludingSkew: "Excluding Large Siddharth NRI Villa (₹12 Lakhs)",
      includingSkew: "Including all outstanding bookings",
      agingTitle: "Receivables Aging Breakdown",
      agingSubtitle: "Calculated strictly from individual payment milestone due dates",
      upcomingTitle: "Upcoming Scheduled Outflows (Next 7-30 Days)",
      upcomingSubtitle: "Payouts committed automatically upon quality checklist validation approvals",
      nriAlert: "NRI Currency Normalization",
      nriAlertDesc: "Siddharth NRI Estates paid $14,400 USD. Normalized at fixed Reserve Bank of India custom rate of ₹83.33/USD.",
      disputedBadge: "Disputed / Audited",
      disputedWarning: "Disputed payments are isolated from simple aging calculations to secure accurate net cash planning.",
      timelineTitle: "Cash-In vs. Cash-Out Monthly Timeline",
      timelineIn: "Client Cash Received",
      timelineOut: "Supplier Payouts",
      timelineTech: "Technician & Field SOP Incentives",
      netCashTrend: "Cumulative Net Cash Trend (Liquidity Runway)",
      bucketCurrent: "Current (0-30 days)",
      bucket30: "30-60 days",
      bucket60: "60-90 days",
      bucket90: "90+ days",
      disputedBucket: "Disputed/Audit",
      drilldownHeader: "Receivable Ledger & Recovery Panel",
      closeLedger: "Minimize Ledger Drawer",
      escalateNote: "90+ day receivables automatically feed into the Overdue Payment Escalation center.",
      milestoneStatus: "Ascension Progress Rail",
      typicalValue: "Typical Order Median",
      outflowsTotal: "Committed Slabs Total",
      currentProgressLabel: "Current Month Collection Progress",
      totalProgressLabel: "Total Annual Collections Target Progress"
    },
    hi: {
      title: "वित्तीय प्रवाह और प्राप्य राशि",
      subtitle: "वसूली, लंबित चालान, आगामी प्रतिबद्धताओं और तरलता का रणनीतिक विश्लेषण",
      totalInvoiced: "कुल बकाया राशि",
      cashInflow: "कुल प्राप्त नकदी (जनवरी-जून)",
      cashOutflow: "कुल प्रतिबद्ध बहिर्वाह",
      medianTypical: "औसत प्राप्य (सामान्य केस)",
      excludingSkew: "सिद्धार्थ एनआरआई विला को छोड़कर (₹12 लाख)",
      includingSkew: "सभी बकाया बुकिंग शामिल हैं",
      agingTitle: "प्राप्य राशि का उम्र-वार विश्लेषण",
      agingSubtitle: "व्यक्तिगत भुगतान मील के पत्थर की नियत तारीखों से गणना की गई",
      upcomingTitle: "आगामी अनुसूचित बहिर्वाह (अगले 7-30 दिन)",
      upcomingSubtitle: "गुणवत्ता नियंत्रण सत्यापन अनुमोदन पर स्वचालित रूप से प्रतिबद्ध भुगतान",
      nriAlert: "एनआरआई मुद्रा सामान्यीकरण",
      nriAlertDesc: "सिद्धार्थ एनआरआई एस्टेट्स ने $14,400 USD का भुगतान किया। भारतीय रिजर्व बैंक की निश्चित दर ₹83.33/USD पर सामान्यीकृत।",
      disputedBadge: "विवादित / ऑडिट",
      disputedWarning: "सटीक शुद्ध नकदी योजना सुनिश्चित करने के लिए विवादित भुगतानों को उम्र-वार गणना से अलग रखा गया है।",
      timelineTitle: "मासिक नकदी प्रवाह समय-सीमा",
      timelineIn: "प्राप्त ग्राहक नकद",
      timelineOut: "आपूर्तिकर्ता भुगतान",
      timelineTech: "तकनीशियन और फील्ड प्रोत्साहन",
      netCashTrend: "संचयी शुद्ध नकदी प्रवृत्ति",
      bucketCurrent: "चालू (0-30 दिन)",
      bucket30: "30-60 दिन",
      bucket60: "60-90 दिन",
      bucket90: "90+ दिन",
      disputedBucket: "विवादित/ऑडिट",
      drilldownHeader: "प्राप्य बही और वसूली पैनल",
      closeLedger: "विवरण बंद करें",
      escalateNote: "90+ दिन की प्राप्य राशियाँ स्वचालित रूप से अतिदेय भुगतान विभाग को भेजी जाती हैं।",
      milestoneStatus: "आरोहण प्रगति रेल (Ascension Rail)",
      typicalValue: "विशिष्ट ऑर्डर माध्यिका",
      outflowsTotal: "कुल प्रतिबद्ध भुगतान",
      currentProgressLabel: "चालू माह वसूली प्रगति",
      totalProgressLabel: "कुल वार्षिक वसूली लक्ष्य प्रगति"
    },
    mr: {
      title: "वित्तीय रोख प्रवाह आणि येणे बाकी",
      subtitle: "वसुली, थकीत चलने, आगामी देणी आणि उपलब्ध निधीचे व्यवस्थापन",
      totalInvoiced: "एकूण येणे बाकी",
      cashInflow: "एकूण जमा रक्कम (जाने-जून)",
      cashOutflow: "एकूण देय असलेली रक्कम",
      medianTypical: "सरासरी प्रलंबित रक्कम (सामान्य केस)",
      excludingSkew: "सिद्धार्थ एनआरआई विला वगळून (₹१२ लाख)",
      includingSkew: "सर्व थकीत बुकिंग समाविष्ट",
      agingTitle: "थकीत येणे रकमेचे कालखंड विश्लेषण",
      agingSubtitle: "मैलस्टोन पेमेंटच्या नेमक्या तारखेनुसार काढलेले वय",
      upcomingTitle: "आगामी नियोजित देणी (पुढील ७-३० दिवस)",
      upcomingSubtitle: "गुणवत्ता चाचणी पूर्ण झाल्यावर आपोआप देय होणारी रक्कम",
      nriAlert: "NRI परकीय चलन सामान्यीकरण",
      nriAlertDesc: "सिद्धार्थ एनआरआई इस्टेट्सने $14,400 USD पेमेंट केले. आरबीआयच्या नियमानुसार ₹८३.३३/USD दराने रूपांतरित केले.",
      disputedBadge: "वादग्रस्त / ऑडिट",
      disputedWarning: "अचूक नियोजनासाठी वादग्रस्त पेमेंट वेगळे दाखवण्यात आले आहे.",
      timelineTitle: "मासिक आवक आणि जावक वेळेचा आलेख",
      timelineIn: "ग्राहकांकडून आलेली रक्कम",
      timelineOut: "विक्रेता पेआउट्स",
      timelineTech: "तंत्रज्ञ आणि फील्ड प्रोत्साहन",
      netCashTrend: "एकूण निव्वळ रोख प्रवाह कल",
      bucketCurrent: "सध्याचे (०-३० दिवस)",
      bucket30: "३०-६० दिवस",
      bucket60: "६०-९० दिवस",
      bucket90: "९०+ दिवस",
      disputedBucket: "वादग्रस्त/ऑडिट",
      drilldownHeader: "येणे बाकी बही आणि वसुली पॅनेल",
      closeLedger: "तपशील लपवा",
      escalateNote: "९०+ दिवसांहून अधिक थकीत रक्कम स्वयंचलितपणे पेमेंट वसुली विभागाकडे वर्ग केली जाते.",
      milestoneStatus: "आरोहण प्रगती निर्देशांक (Ascension Rail)",
      typicalValue: "सामान्य ऑर्डर मध्यक",
      outflowsTotal: "एकूण नियोजित खर्च",
      currentProgressLabel: "चालू महिन्यातील वसुली प्रगती",
      totalProgressLabel: "एकूण वार्षिक वसुली लक्ष्य प्रगती"
    }
  };

  const t = translations[language as 'en' | 'mr' | 'hi'] || translations.en;

  // Custom filters
  const toggleOutliers = () => {
    setExcludeOutliers(!excludeOutliers);
  };

  // Calculations
  const activeReceivables = excludeOutliers 
    ? receivables.filter(r => r.id !== 'REC-902') // Sid NRI is the outlier
    : receivables;

  // Total Outstanding computation
  const totalOutstanding = activeReceivables
    .filter(r => !r.isDisputed)
    .reduce((sum, r) => sum + r.amountINR, 0);

  // Dispute isolated cash
  const disputedTotal = receivables
    .filter(r => r.isDisputed)
    .reduce((sum, r) => sum + r.amountINR, 0);

  // Upstream math based on actuals
  const totalCommittedOutflows = outflows.reduce((sum, o) => sum + o.amountINR, 0);

  // Group by Aging Bucket (excluding disputed)
  const agingBuckets = {
    current: activeReceivables.filter(r => !r.isDisputed && r.daysOverdue <= 30),
    over30: activeReceivables.filter(r => !r.isDisputed && r.daysOverdue > 30 && r.daysOverdue <= 60),
    over60: activeReceivables.filter(r => !r.isDisputed && r.daysOverdue > 60 && r.daysOverdue <= 90),
    over90: activeReceivables.filter(r => !r.isDisputed && r.daysOverdue > 90)
  };

  const agingSums = {
    current: agingBuckets.current.reduce((sum, r) => sum + r.amountINR, 0),
    over30: agingBuckets.over30.reduce((sum, r) => sum + r.amountINR, 0),
    over60: agingBuckets.over60.reduce((sum, r) => sum + r.amountINR, 0),
    over90: agingBuckets.over90.reduce((sum, r) => sum + r.amountINR, 0)
  };

  // Filter list by selected bucket or search query
  const filteredList = receivables.filter(r => {
    const matchesSearch = r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.paymentStage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeAgingBucket === 'All') return matchesSearch;
    if (activeAgingBucket === 'Current') return matchesSearch && !r.isDisputed && r.daysOverdue <= 30;
    if (activeAgingBucket === '30') return matchesSearch && !r.isDisputed && r.daysOverdue > 30 && r.daysOverdue <= 60;
    if (activeAgingBucket === '60') return matchesSearch && !r.isDisputed && r.daysOverdue > 60 && r.daysOverdue <= 90;
    if (activeAgingBucket === '90') return matchesSearch && !r.isDisputed && r.daysOverdue > 90;
    if (activeAgingBucket === 'Disputed') return matchesSearch && r.isDisputed;
    return matchesSearch;
  });

  // Target collection progress calculations for current % and total % progress bars (AS PER USER INSTRUCTION)
  const currentMonthTarget = 2500000;
  const currentMonthCollected = 1950000;
  const currentProgressPercent = Math.round((currentMonthCollected / currentMonthTarget) * 100);

  const annualTarget = 30000000;
  const annualCollectedTotal = 21500000;
  const totalProgressPercent = Math.round((annualCollectedTotal / annualTarget) * 100);

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* SCREEN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-antiquegold rounded-full block" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal leading-none">
              {t.title}
            </h1>
          </div>
          <p className="text-xs text-warmgray font-medium">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold border border-royalemerald/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5" />
            INR BASE ACTIVE
          </span>
          <Button variant="secondary" onClick={toggleOutliers} className="!py-1.5 !px-3 hover:scale-[1.02] flex items-center gap-1 text-xs">
            {excludeOutliers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {excludeOutliers ? t.includingSkew : t.excludingSkew}
          </Button>
        </div>
      </div>

      {/* ADDITIONAL USER INSTRUCTION: Show current % progress bar & total % progress bar */}
      <Card className="p-5 bg-white relative overflow-hidden border-royalemerald/20">
        <div className="absolute right-0 top-0 w-32 h-32 bg-royalemerald/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-royalemerald" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            COLLECTION TARGET TRACKING METRICS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current % Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray flex items-center gap-1">
                {t.currentProgressLabel} (₹19.5L / ₹25L Target)
              </span>
              <span className="font-mono text-sm font-bold text-royalemerald">
                {currentProgressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentProgressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-royalemerald h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </motion.div>
            </div>
          </div>

          {/* Total % Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray flex items-center gap-1">
                {t.totalProgressLabel} (₹2.15Cr / ₹3.0Cr Target)
              </span>
              <span className="font-mono text-sm font-bold text-antiquegold">
                {totalProgressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalProgressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-antiquegold h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* DYNAMIC KPI SUMMARY CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Invoiced Outstanding */}
        <Card className="p-5 bg-white relative overflow-hidden">
          <div className="absolute -right-3 -top-3 p-4 bg-antiquegold/5 rounded-full">
            <DollarSign className="w-8 h-8 text-antiquegold opacity-20" />
          </div>
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.totalInvoiced}</p>
          <p className="font-serif text-2xl font-bold text-charcoal font-mono mt-1">
            ₹{(totalOutstanding / 100000).toFixed(2)} Lakhs
          </p>
          <div className="flex items-center gap-1 text-[10px] text-royalemerald font-bold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{excludeOutliers ? t.excludingSkew : t.includingSkew}</span>
          </div>
        </Card>

        {/* Total Disputed Suspended Cash */}
        <Card className="p-5 bg-white relative overflow-hidden border-error/20">
          <div className="absolute -right-3 -top-3 p-4 bg-error/5 rounded-full">
            <ShieldAlert className="w-8 h-8 text-error opacity-20" />
          </div>
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">Disputed & Audited</p>
          <p className="font-serif text-2xl font-bold text-error font-mono mt-1">
            ₹{(disputedTotal / 100000).toFixed(2)} Lakhs
          </p>
          <div className="flex items-center gap-1 text-[10px] text-error font-bold mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>1 major transit project delayed</span>
          </div>
        </Card>

        {/* Cash Inflow 6 Months */}
        <Card className="p-5 bg-white relative overflow-hidden">
          <div className="absolute -right-3 -top-3 p-4 bg-royalemerald/5 rounded-full">
            <TrendingUp className="w-8 h-8 text-royalemerald opacity-20" />
          </div>
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.cashInflow}</p>
          <p className="font-serif text-2xl font-bold text-charcoal font-mono mt-1">
            ₹1.38 Crore
          </p>
          <div className="flex items-center gap-1 text-[10px] text-royalemerald font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Steady 8.4% MoM rise</span>
          </div>
        </Card>

        {/* Median Typical Ticket Size */}
        <Card className="p-5 bg-white relative overflow-hidden">
          <div className="absolute -right-3 -top-3 p-4 bg-antiquegold/5 rounded-full">
            <Layers className="w-8 h-8 text-antiquegold opacity-20" />
          </div>
          <p className="text-[10px] text-warmgray font-bold uppercase tracking-wider">{t.medianTypical}</p>
          <p className="font-serif text-2xl font-bold text-charcoal font-mono mt-1">
            ₹3.35 Lakhs
          </p>
          <div className="flex items-center gap-1 text-[10px] text-warmgray font-bold mt-2">
            <span>{t.typicalValue} (Excl. Outliers)</span>
          </div>
        </Card>
      </div>

      {/* CURRENCY ALERT SYSTEM (FOR NRI MULTI-CURRENCY DRILLDOWN) */}
      {!excludeOutliers && (
        <Card className="p-4 bg-alabaster border-antiquegold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex gap-2.5 text-antiquegold">
            <Globe className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide">
                {t.nriAlert}
              </h4>
              <p className="text-[11px] text-charcoal font-medium mt-0.5 leading-relaxed">
                {t.nriAlertDesc}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-antiquegold text-white px-2.5 py-1 rounded-lg shrink-0 font-bold">
            RBI CUSTOM RATE: 83.33
          </span>
        </Card>
      )}

      {/* INTERACTIVE TIMELINE CHART: CASH-IN VS CASH-OUT */}
      <Card className="p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
              {t.timelineTitle}
            </h3>
            <p className="text-[10px] text-warmgray font-semibold">
              Reconciled from installation billing SOPs & supplier ledger lines
            </p>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-charcoal">
              <span className="w-2.5 h-2.5 bg-royalemerald rounded-sm" />
              <span>{t.timelineIn}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-charcoal">
              <span className="w-2.5 h-2.5 bg-antiquegold rounded-sm" />
              <span>{t.timelineOut}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-charcoal">
              <span className="w-2.5 h-2.5 bg-[#B23B3B] rounded-sm" />
              <span>{t.timelineTech}</span>
            </div>
          </div>
        </div>

        {/* CUSTOM SVGs OR VISUAL CHART CARDS (Pure custom grid columns representing bar elements) */}
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-48 bg-[#FAF9F5] border border-[rgba(184,135,61,0.08)] rounded-2xl p-4 relative">
            
            {/* Guide Gridlines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-[rgba(184,135,61,0.05)] border-dashed pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-[rgba(184,135,61,0.05)] border-dashed pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-[rgba(184,135,61,0.05)] border-dashed pointer-events-none" />

            {cashflowHistory.map((month, idx) => {
              // Standard scale divider
              const maxVal = 3500000;
              const barInH = (month.cashIn / maxVal) * 100;
              const barOutH = (month.supplierOut / maxVal) * 100;
              const barTechH = (month.technicianOut / maxVal) * 100;

              return (
                <div key={idx} className="flex flex-col h-full justify-end items-center relative">
                  
                  {/* Visual stacked bars container */}
                  <div className="w-full flex justify-center gap-1 items-end h-full max-w-[48px]">
                    
                    {/* Inflow bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${barInH}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="w-3 bg-royalemerald rounded-t-xs hover:opacity-80 transition-opacity"
                      title={`Cash In: ₹${(month.cashIn/100000).toFixed(1)}L`}
                    />

                    {/* Outflow bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${barOutH}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="w-3 bg-antiquegold rounded-t-xs hover:opacity-80 transition-opacity"
                      title={`Supplier Out: ₹${(month.supplierOut/100000).toFixed(1)}L`}
                    />

                    {/* Technician bar */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${barTechH}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="w-3 bg-[#B23B3B] rounded-t-xs hover:opacity-80 transition-opacity"
                      title={`Tech Incentives: ₹${(month.technicianOut/100000).toFixed(1)}L`}
                    />
                  </div>

                  <span className="text-[9px] font-bold text-warmgray mt-2 block">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* NET CASH RUNWAY LIQUIDITY CHART */}
          <div className="bg-[#FAF9F5] border border-[rgba(184,135,61,0.08)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-royalemerald bg-royalemerald/10 border border-royalemerald/15 px-2 py-0.5 rounded-md">
                LIQUIDITY REPORT
              </span>
              <h4 className="text-xs font-bold text-charcoal mt-1">
                {t.netCashTrend}
              </h4>
              <p className="text-[10px] text-warmgray">
                Projected available runway based on current collection velocity and committed supplies.
              </p>
            </div>

            <div className="flex gap-4 font-mono text-center shrink-0">
              <div className="p-3 bg-white rounded-xl border border-[rgba(184,135,61,0.08)] min-w-[120px]">
                <p className="text-[8px] text-warmgray font-bold">NET LIQUID RUNWAY</p>
                <p className="text-xs font-bold text-royalemerald mt-0.5">₹58.40 Lakhs</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[rgba(184,135,61,0.08)] min-w-[120px]">
                <p className="text-[8px] text-warmgray font-bold">RECOVERY SPEED</p>
                <p className="text-xs font-bold text-charcoal mt-0.5">18.5 Days</p>
              </div>
            </div>
          </div>

        </div>
      </Card>

      {/* RECEIVABLES AGING BREAKDOWN SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
              {t.agingTitle}
            </h3>
            <p className="text-[10px] text-warmgray font-semibold">
              {t.agingSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-alabaster p-1 rounded-xl border border-[rgba(184,135,61,0.08)]">
            {[
              { id: 'All', label: 'All Invoices' },
              { id: 'Current', label: 'Current' },
              { id: '30', label: '30-60d' },
              { id: '60', label: '60-90d' },
              { id: '90', label: '90+ Days' },
              { id: 'Disputed', label: 'Disputed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveAgingBucket(tab.id)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  activeAgingBucket === tab.id 
                    ? 'bg-white text-antiquegold shadow-xs' 
                    : 'text-warmgray hover:text-charcoal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* AGING BUCKET GRAPHIC & CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => setActiveAgingBucket('Current')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeAgingBucket === 'Current' ? 'border-royalemerald ring-1 ring-royalemerald/20 bg-royalemerald/[0.01]' : 'border-[rgba(184,135,61,0.15)] hover:border-royalemerald/40'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-warmgray uppercase">
              <span>{t.bucketCurrent}</span>
              <span className="w-2 h-2 rounded-full bg-royalemerald" />
            </div>
            <p className="font-serif text-xl font-bold text-charcoal font-mono mt-1">
              ₹{(agingSums.current / 100000).toFixed(2)} L
            </p>
            <p className="text-[9px] text-warmgray mt-2">{agingBuckets.current.length} milestone payments</p>
          </div>

          <div 
            onClick={() => setActiveAgingBucket('30')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeAgingBucket === '30' ? 'border-antiquegold ring-1 ring-antiquegold/20 bg-antiquegold/[0.01]' : 'border-[rgba(184,135,61,0.15)] hover:border-antiquegold/40'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-warmgray uppercase">
              <span>{t.bucket30}</span>
              <span className="w-2 h-2 rounded-full bg-antiquegold" />
            </div>
            <p className="font-serif text-xl font-bold text-charcoal font-mono mt-1">
              ₹{(agingSums.over30 / 100000).toFixed(2)} L
            </p>
            <p className="text-[9px] text-warmgray mt-2">{agingBuckets.over30.length} milestone payments</p>
          </div>

          <div 
            onClick={() => setActiveAgingBucket('60')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeAgingBucket === '60' ? 'border-[#B23B3B] ring-1 ring-[#B23B3B]/20 bg-[#B23B3B]/[0.01]' : 'border-[rgba(184,135,61,0.15)] hover:border-[#B23B3B]/40'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-warmgray uppercase">
              <span>{t.bucket60}</span>
              <span className="w-2 h-2 rounded-full bg-[#B23B3B]" />
            </div>
            <p className="font-serif text-xl font-bold text-charcoal font-mono mt-1">
              ₹{(agingSums.over60 / 100000).toFixed(2)} L
            </p>
            <p className="text-[9px] text-warmgray mt-2">{agingBuckets.over60.length} milestone payments</p>
          </div>

          <div 
            onClick={() => setActiveAgingBucket('90')}
            className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
              activeAgingBucket === '90' ? 'border-error ring-1 ring-error/20 bg-error/[0.01]' : 'border-[rgba(184,135,61,0.15)] hover:border-error/40'
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-bold text-error uppercase">
              <span>{t.bucket90}</span>
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            </div>
            <p className="font-serif text-xl font-bold text-error font-mono mt-1">
              ₹{(agingSums.over90 / 100000).toFixed(2)} L
            </p>
            <p className="text-[9px] text-error font-bold mt-2">Automatic Escalation Triggered</p>
          </div>
        </div>
      </div>

      {/* FILTERED INVOICE LIST & DETAILED DRILLDOWN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE FILTERED INVOICES (Col span 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
            <input 
              type="text"
              placeholder={isDevanagari ? 'क्लाइंट, प्रोजेक्ट या स्टेज द्वारा खोजें...' : 'Search clients, projects, or billing milestones...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs border border-[rgba(184,135,61,0.15)] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray"
            />
          </div>

          <div className="space-y-3">
            {filteredList.map((item) => {
              const isSelected = selectedReceivable?.id === item.id;
              
              return (
                <Card 
                  key={item.id}
                  onClick={() => setSelectedReceivable(item)}
                  className={`p-4 cursor-pointer transition-all duration-200 relative ${
                    isSelected 
                      ? 'border-antiquegold bg-[#FAF9F5] ring-1 ring-antiquegold/20' 
                      : 'hover:bg-alabaster'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[9px] font-bold text-warmgray">
                          {item.id}
                        </span>
                        {item.isDisputed && (
                          <span className="bg-error/10 text-error text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                            {t.disputedBadge}
                          </span>
                        )}
                        {item.daysOverdue > 90 && (
                          <span className="bg-error/10 text-error text-[8px] px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                            🚨 ESCALATED 90D+
                          </span>
                        )}
                        {item.daysOverdue <= 30 && (
                          <span className="bg-royalemerald/10 text-royalemerald text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                            STABLE 30D
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-charcoal leading-tight truncate">
                        {item.clientName}
                      </h4>
                      <p className="text-[10px] text-warmgray truncate font-medium">
                        {item.projectName} • <span className="font-mono text-antiquegold font-semibold">{item.elevatorModel}</span>
                      </p>
                      <p className="text-[10px] text-charcoal font-semibold">
                        SOP Stage: <span className="text-[#B8873D]">{item.paymentStage}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-bold text-charcoal">
                        ₹{(item.amountINR / 100000).toFixed(2)} Lakhs
                      </p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
                        item.daysOverdue > 90 ? 'bg-error/10 text-error' : item.daysOverdue > 30 ? 'bg-antiquegold/10 text-antiquegold' : 'bg-royalemerald/10 text-royalemerald'
                      }`}>
                        {item.daysOverdue} Days Overdue
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DRILLDOWN DRAWER OR UPCOMING COMMITMENTS (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <AnimatePresence mode="wait">
            {selectedReceivable ? (
              <motion.div
                key={selectedReceivable.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-5 border-antiquegold bg-white space-y-4">
                  <div className="flex justify-between items-center border-b border-[rgba(184,135,61,0.1)] pb-2">
                    <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
                      {t.drilldownHeader}
                    </h3>
                    <button 
                      onClick={() => setSelectedReceivable(null)} 
                      className="text-warmgray hover:text-charcoal p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">CLIENT / CONTRACT NAME</p>
                      <p className="font-serif font-bold text-charcoal text-sm mt-0.5">
                        {selectedReceivable.clientName}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">PROJECT SPECIFICATION</p>
                      <p className="font-semibold text-charcoal">
                        {selectedReceivable.projectName} ({selectedReceivable.elevatorModel})
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase">ACTIVE BILLING STAGE</p>
                      <p className="font-mono text-antiquegold font-bold">
                        {selectedReceivable.paymentStage}
                      </p>
                    </div>

                    {selectedReceivable.originalCurrency && (
                      <div className="p-3 bg-[#FAF9F5] border border-antiquegold/20 rounded-xl space-y-1">
                        <p className="text-[9px] text-warmgray font-bold uppercase">ORIGINAL TRANSACTION (NRI)</p>
                        <p className="font-mono text-charcoal font-bold">
                          ${selectedReceivable.originalAmount?.toLocaleString()} USD
                        </p>
                      </div>
                    )}

                    {selectedReceivable.isDisputed && (
                      <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[10px] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <ShieldAlert className="w-4 h-4" />
                          <span>{t.disputedBadge}</span>
                        </div>
                        <p className="font-medium text-charcoal mt-1 leading-relaxed">
                          {selectedReceivable.disputeReason}
                        </p>
                        <p className="text-[9px] text-error font-bold italic mt-1">
                          {t.disputedWarning}
                        </p>
                      </div>
                    )}

                    {selectedReceivable.daysOverdue > 90 && (
                      <div className="p-3 rounded-xl bg-error/5 border border-error/10 text-error text-[10px] font-bold">
                        {t.escalateNote}
                      </div>
                    )}

                    {/* Ascension Line Visual representation of milestone tracking */}
                    <div>
                      <p className="text-[9px] text-warmgray font-bold uppercase mb-2">{t.milestoneStatus}</p>
                      <div className="relative pl-5 py-1">
                        <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-alabaster border-l border-[rgba(184,135,61,0.2)]" />
                        <div className="absolute left-[7px] top-0 w-0.5 bg-antiquegold h-2/3" />

                        <div className="space-y-4">
                          <div className="flex items-start gap-2 text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full bg-royalemerald border-2 border-white flex items-center justify-center text-white shrink-0 z-10">
                              ✓
                            </div>
                            <div>
                              <p className="font-bold text-charcoal">Engineering Blueprint Signed</p>
                              <p className="text-[8px] text-warmgray mt-0.5">SOP validated by lead Pune surveyor.</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-[10px]">
                            <div className="w-3.5 h-3.5 rounded-full bg-antiquegold border-2 border-white flex items-center justify-center text-white shrink-0 z-10 animate-pulse">
                              ➔
                            </div>
                            <div>
                              <p className="font-bold text-charcoal">{selectedReceivable.paymentStage}</p>
                              <p className="text-[8px] text-warmgray mt-0.5">Awaiting billing resolution. Due date was {selectedReceivable.dueDate}.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[rgba(184,135,61,0.08)]">
                      <Button variant="secondary" onClick={() => setSelectedReceivable(null)} className="w-full text-xs">
                        {t.closeLedger}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* UPCOMING SCHEDULED OUTFLOWS SECTION */}
          <Card className="p-5 space-y-4 bg-white">
            <div>
              <h3 className="text-xs font-extrabold text-charcoal uppercase tracking-wider font-mono">
                {t.upcomingTitle}
              </h3>
              <p className="text-[10px] text-warmgray font-semibold">
                {t.upcomingSubtitle}
              </p>
            </div>

            <div className="space-y-3">
              {outflows.map((outflow) => (
                <div key={outflow.id} className="p-3 rounded-xl bg-alabaster border border-[rgba(184,135,61,0.08)] flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[8px] text-warmgray font-bold">{outflow.id}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                        outflow.type === 'Supplier' ? 'bg-antiquegold/10 text-antiquegold' : 'bg-royalemerald/10 text-royalemerald'
                      }`}>
                        {outflow.type}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-charcoal truncate mt-1">
                      {outflow.beneficiaryName}
                    </p>
                    <p className="text-[10px] text-warmgray truncate">
                      Project: <span className="font-mono font-medium">{outflow.elevatorProject}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-bold text-charcoal">
                      ₹{(outflow.amountINR / 100000).toFixed(2)} L
                    </p>
                    <span className="text-[9px] text-warmgray font-mono block mt-1">
                      Due {new Date(outflow.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[rgba(184,135,61,0.08)] flex justify-between items-center text-[10px] text-warmgray">
              <span>{t.outflowsTotal}:</span>
              <span className="font-mono font-bold text-charcoal">₹{(totalCommittedOutflows / 100000).toFixed(2)} Lakhs</span>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};
