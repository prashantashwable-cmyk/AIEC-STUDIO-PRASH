import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Truck, AlertTriangle, CheckCircle2, MessageSquare, 
  Search, Sliders, ChevronRight, ChevronDown, Calendar, 
  TrendingUp, TrendingDown, RefreshCw, FileText, Send, X, 
  Activity, Clock, Coins, Info, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { Card, Button } from './Common';
import { useLanguage } from '../lib/language';
import { User } from '../types';

interface OrderStep {
  label: string;
  completed: boolean;
}

interface CompletedOrder {
  id: string;
  date: string;
  item: string;
  amount: number;
  status: string;
  onTime: boolean;
  defect: boolean;
}

interface InFlightOrder {
  id: string;
  date: string;
  item: string;
  amount: number;
  status: string;
  steps: OrderStep[];
}

interface CriticalIncident {
  date: string;
  msg: string;
  resolved: boolean;
  status: string;
}

interface Dispute {
  id: string;
  date: string;
  metric: string;
  claim: string;
  status: 'pending' | 'approved' | 'rejected';
  originalValue: string;
  suggestedChange: string;
}

interface SupplierExtended {
  id: string;
  name: string;
  onTimeDelivery: number;
  defectRate: number;
  priceCompetitiveness: number;
  responsiveness: number;
  status: 'active' | 'inactive';
  region: string;
  trend: number[];
  incidents: CriticalIncident[];
  disputes: Dispute[];
  completedOrders: CompletedOrder[];
  inFlightOrders: InFlightOrder[];
  isNew?: boolean;
}

const initialSuppliersList: SupplierExtended[] = [
  {
    id: 'sun_elevators',
    name: 'Sun Elevators Manufacturing',
    onTimeDelivery: 96,
    defectRate: 1.2,
    priceCompetitiveness: 92,
    responsiveness: 94,
    status: 'active',
    region: 'Chakan Industrial Area',
    trend: [92, 94, 95, 94, 96, 95],
    incidents: [
      { date: '2026-01-12', msg: 'Delayed shipment of guides rails due to regional port union strike.', resolved: true, status: 'Resolved by Admin' }
    ],
    disputes: [],
    completedOrders: [
      { id: 'PO-2026-0104', date: '2026-06-20', item: 'VVVF Controller Integrated Bundle', amount: 150000, status: 'Delivered', onTime: true, defect: false },
      { id: 'PO-2026-0092', date: '2026-05-15', item: 'Traction Machine (Gearless 1m/s)', amount: 250000, status: 'Delivered', onTime: true, defect: false },
      { id: 'PO-2026-0081', date: '2026-04-10', item: 'Premium Stainless Steel Cabin (6 Pax)', amount: 180000, status: 'Delivered', onTime: true, defect: false }
    ],
    inFlightOrders: [
      {
        id: 'PO-2026-0125',
        date: '2026-07-01',
        item: 'Steel Guide Rails (Set of 10)',
        amount: 80000,
        status: 'Fabrication',
        steps: [
          { label: 'Purchase Order Issued', completed: true },
          { label: 'Fabrication & Casting', completed: true },
          { label: 'Logistics Dispatch', completed: false },
          { label: 'Site Unloading', completed: false },
          { label: 'Final Settlement', completed: false }
        ]
      }
    ]
  },
  {
    id: 'apex_drives',
    name: 'Apex Cabin & Mechanicals',
    onTimeDelivery: 88,
    defectRate: 2.8,
    priceCompetitiveness: 85,
    responsiveness: 82,
    status: 'active',
    region: 'Bhiwandi Logistic Hub',
    trend: [84, 86, 85, 87, 86, 85],
    incidents: [
      { date: '2026-03-03', msg: 'Loose cabin frame locking latch found during site QC inspection.', resolved: true, status: 'Resolved & Replaced next day' }
    ],
    disputes: [
      { 
        id: 'disp_apex_1', 
        date: '2026-03-05', 
        metric: 'Defect/Return Rate', 
        claim: 'The cabin frame latch was slightly loose because of bumpy transit, not welding error. We dispatched a mechanic and replaced it within 24 hours at zero cost to AIEC.', 
        status: 'pending', 
        originalValue: '2.8% defect rate reported', 
        suggestedChange: 'Waive the defect penalty for PO-2026-0056' 
      }
    ],
    completedOrders: [
      { id: 'PO-2026-0077', date: '2026-05-28', item: 'Cabin Frame & Sling Assembly', amount: 95000, status: 'Delivered', onTime: true, defect: false },
      { id: 'PO-2026-0056', date: '2026-03-03', item: 'Counterweight Blocks Cast Iron', amount: 60000, status: 'Delivered', onTime: true, defect: true }
    ],
    inFlightOrders: []
  },
  {
    id: 'shree_shakti',
    name: 'Shree Shakti Steel & Rails',
    onTimeDelivery: 100,
    defectRate: 0.0,
    priceCompetitiveness: 95,
    responsiveness: 98,
    status: 'active',
    region: 'Hadapsar Industrial Estate',
    isNew: true,
    trend: [97],
    incidents: [],
    disputes: [],
    completedOrders: [
      { id: 'PO-2026-0111', date: '2026-06-25', item: 'Steel T-Type Guide Rails', amount: 160000, status: 'Delivered', onTime: true, defect: false }
    ],
    inFlightOrders: []
  },
  {
    id: 'zenith_elec',
    name: 'Zenith Cabin Electronics',
    onTimeDelivery: 64,
    defectRate: 8.5,
    priceCompetitiveness: 70,
    responsiveness: 55,
    status: 'active',
    region: 'Pimpri MIDC Cluster',
    trend: [80, 78, 76, 74, 69, 65], // Dropped below 75 for 2 consecutive months (May: 69, Jun: 65)
    incidents: [
      { date: '2026-05-14', msg: 'Missed sensor controller supply milestone. Delayed Hinjewadi site by 8 working days.', resolved: false, status: 'Unresolved SLA Violation' },
      { date: '2026-06-20', msg: 'Bad capacitor batch in VVVF controller cards. Two boards failed site start checks.', resolved: false, status: 'Pending replacements' }
    ],
    disputes: [
      { 
        id: 'disp_zenith_1', 
        date: '2026-05-16', 
        metric: 'On-Time Delivery Rate', 
        claim: 'Heavy rains flooded Pimpri MIDC zone, cutting power for 4 days. Transporters could not load cargo due to local civic warnings.', 
        status: 'pending', 
        originalValue: '64% On-Time rate', 
        suggestedChange: 'Exemption for mid-May storm delivery delay' 
      }
    ],
    completedOrders: [
      { id: 'PO-2026-0089', date: '2026-05-14', item: 'VVVF Sensor Controller', amount: 120000, status: 'Delivered', onTime: false, defect: false },
      { id: 'PO-2026-0105', date: '2026-06-20', item: 'Elevator PCB Boards Bundle', amount: 140000, status: 'Delivered', onTime: true, defect: true }
    ],
    inFlightOrders: [
      {
        id: 'PO-2026-0128',
        date: '2026-07-05',
        item: 'Electronic Safety Interlocks',
        amount: 75000,
        status: 'Order Placed',
        steps: [
          { label: 'Purchase Order Issued', completed: true },
          { label: 'Fabrication & Casting', completed: false },
          { label: 'Logistics Dispatch', completed: false },
          { label: 'Site Unloading', completed: false },
          { label: 'Final Settlement', completed: false }
        ]
      }
    ]
  }
];

export const SupplierPerformanceScorecard: React.FC<{ user: User }> = ({ user }) => {
  const { language } = useLanguage();
  const isDevanagari = language === 'hi' || language === 'mr';

  // State Management
  const [suppliers, setSuppliers] = useState<SupplierExtended[]>([]);
  const [wOnTime, setWOnTime] = useState<number>(30);
  const [wDefect, setWDefect] = useState<number>(30);
  const [wPrice, setWPrice] = useState<number>(20);
  const [wResponse, setWResponse] = useState<number>(20);
  const [watchlistThreshold, setWatchlistThreshold] = useState<number>(75);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sun_elevators');
  
  // Interactive audit states
  const [disputeActions, setDisputeActions] = useState<Record<string, { status: string; comment: string }>>({});
  const [messages, setMessages] = useState<Record<string, Array<{ sender: string; text: string; time: string }>>>({});
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [overrideComments, setOverrideComments] = useState<Record<string, string>>({});
  
  // Loading Simulation
  const [loading, setLoading] = useState<boolean>(false);
  
  // Audit log states
  const [auditLog, setAuditLog] = useState<string[]>([]);

  // Local translations dictionary
  const localTranslations = {
    en: {
      screenTitle: "Supplier Performance Scorecard",
      screenSubtitle: "Ranked vendor audit, procurement SLAs, defect rate oversight, and active disputes",
      adjustWeights: "Adjust Scoring Weightage",
      onTimeWeight: "On-Time Delivery Weight",
      defectWeight: "Defect/Return Rate Weight",
      priceWeight: "Price Competitiveness Weight",
      responseWeight: "Responsiveness SLA Weight",
      watchlistThreshold: "Watchlist Quality Threshold",
      watchlistThresholdDesc: "Suppliers with scores below this limit for 2 consecutive months automatically land on the active watchlist.",
      watchlistTitle: "Active Supplier Watchlist",
      watchlistWarning: "Dipping below threshold! Review order logs immediately.",
      watchlistClean: "All active suppliers meeting compliance targets.",
      earlyDataLabel: "EARLY DATA",
      earlyDataDesc: "Limited sample size (only 1 completed order). Score may fluctuate.",
      onTimeLabel: "On-Time Delivery",
      defectLabel: "Defect/Return Rate",
      priceLabel: "Price Competence",
      responseLabel: "SLA Responsiveness",
      overallScore: "Overall Rating",
      viewTrend: "View Trend & Logs",
      orderHistory: "Procurement Ledger (Ascension Line)",
      disputesTitle: "Active Disputes & Overrides",
      disputeDesc: "Supplier contested recent metrics. Admin review required.",
      approveDispute: "Approve SLA Override",
      rejectDispute: "Decline Override",
      disputeReasonPlaceholder: "State reason for adjusting metrics (logged to audit trail)...",
      incidentLabel: "Critical Incidents Inline",
      notSupplierFault: "Not Supplier Fault",
      resolvedByAdmin: "Resolved by Admin",
      contactSupplier: "Message Supplier Representative",
      writeMessage: "Type secure dispatch message...",
      sendBtn: "Send Dispatch",
      successMsg: "Message transmitted securely over dispatch lines.",
      averageDeliveryRate: "Average Delivery SLA Progress",
      totalOrdersCompleted: "Total Supply Targets Achieved",
      earlyDataWarning: "New Supplier (Low Sample)",
      catastrophicIncident: "Catastrophic Resolved Incident",
      overallSupplierHealth: "Overall Procurement Health Dashboard"
    },
    mr: {
      screenTitle: "विक्रेता कामगिरी अहवाल (Scorecard)",
      screenSubtitle: "प्राधान्य विक्रेता ऑडिट, खरेदी SLA, दोष दर आणि सक्रिय वाद निवारण",
      adjustWeights: "गुण भारित गुणोत्तर समायोजित करा",
      onTimeWeight: "वेळेवर पोहोचवण्याचे वजन",
      defectWeight: "दोष/परतावा दर वजन",
      priceWeight: "किंमत स्पर्धात्मकता वजन",
      responseWeight: "SLA प्रतिसाद वेळेचे वजन",
      watchlistThreshold: "वॉचलिस्ट गुणवत्ता थ्रेशोल्ड",
      watchlistThresholdDesc: "सलग २ महिने या मर्यादेपेक्षा कमी गुण असणारे पुरवठादार आपोआप सक्रिय वॉचलिस्टमध्ये जातात.",
      watchlistTitle: "सक्रिय पुरवठादार वॉचलिस्ट",
      watchlistWarning: "मर्यादेपेक्षा कमी कामगिरी! त्वरित ऑर्डर तपासा.",
      watchlistClean: "सर्व पुरवठादार गुणवत्ता मानकांचे पालन करत आहेत.",
      earlyDataLabel: "प्राथमिक डेटा",
      earlyDataDesc: "मर्यादित ऑर्डर संख्या (केवळ १ यशस्वी ऑर्डर). गुण बदलू शकतात.",
      onTimeLabel: "वेळेवर वितरण",
      defectLabel: "दोष/परतावा दर",
      priceLabel: "किंमत गुणवत्ता",
      responseLabel: "प्रतिसाद वेळ (SLA)",
      overallScore: "एकूण कामगिरी",
      viewTrend: "प्रगती आणि लॉग पहा",
      orderHistory: "खरेदी वितरण ट्रॅक (अॅसेंशन लाईन)",
      disputesTitle: "सक्रिय वाद आणि ओव्हरराइड्स",
      disputeDesc: "पुरवठादाराने नोंदवलेल्या हरकती. प्रशासकीय मंजुरी आवश्यक.",
      approveDispute: "SLA ओव्हरराइड मंजूर करा",
      rejectDispute: "ओव्हरराइड नाकारा",
      disputeReasonPlaceholder: "गुणवत्ता बदलण्याचे कारण लिहा (ऑडिट लॉगमध्ये नोंद होईल)...",
      incidentLabel: "गंभीर घटना विश्लेषण",
      notSupplierFault: "पुरवठादाराची चूक नाही",
      resolvedByAdmin: "प्रशासकाकडून निवारण",
      contactSupplier: "पुरवठादार प्रतिनिधीशी संपर्क साधा",
      writeMessage: "वितरण संदेश टाइप करा...",
      sendBtn: "संदेश पाठवा",
      successMsg: "संदेश यशस्वीरित्या पाठवला गेला आहे.",
      averageDeliveryRate: "सरासरी वितरण SLA प्रगती",
      totalOrdersCompleted: "एकूण पुरवठा उद्दिष्टे साध्य",
      earlyDataWarning: "नवीन पुरवठादार (कमी डेटा)",
      catastrophicIncident: "निवारण केलेली मोठी घटना",
      overallSupplierHealth: "एकूण पुरवठादार आरोग्य डॅशबोर्ड"
    },
    hi: {
      screenTitle: "आपूर्तिकर्ता प्रदर्शन स्कोरकार्ड",
      screenSubtitle: "विक्रेता ऑडिट, खरीद SLA, दोष दर और विवादों का प्रशासनिक ब्योरा",
      adjustWeights: "स्कोरिंग वेटेज समायोजित करें",
      onTimeWeight: "समय पर डिलीवरी वेट",
      defectWeight: "दोष/वापसी दर वेट",
      priceWeight: "मूल्य प्रतिस्पर्धात्मकता वेट",
      responseWeight: "SLA जवाबदेही वेट",
      watchlistThreshold: "वॉचलिस्ट गुणवत्ता थ्रेशोल्ड",
      watchlistThresholdDesc: "लगातार 2 महीनों तक इस सीमा से नीचे स्कोर वाले आपूर्तिकर्ता स्वचालित रूप से सक्रिय वॉचलिस्ट में आ जाते हैं।",
      watchlistTitle: "सक्रिय आपूर्तिकर्ता वॉचलिस्ट",
      watchlistWarning: "सीमा से नीचे प्रदर्शन! तुरंत ऑर्डर लॉग जांचें।",
      watchlistClean: "सभी आपूर्तिकर्ता गुणवत्ता मानकों को पूरा कर रहे हैं।",
      earlyDataLabel: "प्रारंभिक डेटा",
      earlyDataDesc: "सीमित ऑर्डर मात्रा (केवल 1 पूरी की गई ऑर्डर)। स्कोर बदल सकता है।",
      onTimeLabel: "समय पर डिलीवरी",
      defectLabel: "दोष/वापसी दर",
      priceLabel: "मूल्य क्षमता",
      responseLabel: "SLA जवाबदेही",
      overallScore: "कुल स्कोर",
      viewTrend: "ट्रेंड और लॉग देखें",
      orderHistory: "खरीद वितरण ट्रैक (असेंशन लाइन)",
      disputesTitle: "सक्रिय विवाद और समाधान",
      disputeDesc: "आपूर्तिकर्ता द्वारा उठाई गई आपत्ति। प्रशासनिक समीक्षा आवश्यक।",
      approveDispute: "SLA ओवरराइड स्वीकृत करें",
      rejectDispute: "ओवरराइड अस्वीकृत करें",
      disputeReasonPlaceholder: "स्कोर बदलने का कारण दर्ज करें (ऑडिट लॉग में दर्ज होगा)...",
      incidentLabel: "महत्वपूर्ण घटनाएं",
      notSupplierFault: "आपूर्तिकर्ता की गलती नहीं",
      resolvedByAdmin: "प्रशासक द्वारा हल",
      contactSupplier: "आपूर्तिकर्ता प्रतिनिधि को संदेश भेजें",
      writeMessage: "संदेश टाइप करें...",
      sendBtn: "संदेश भेजें",
      successMsg: "संदेश सुरक्षित रूप से भेज दिया गया है।",
      averageDeliveryRate: "औसत डिलीवरी SLA प्रगति",
      totalOrdersCompleted: "कुल खरीद लक्ष्य प्राप्त",
      earlyDataWarning: "नया आपूर्तिकर्ता (कम नमूना)",
      catastrophicIncident: "सुलझाई गई गंभीर घटना",
      overallSupplierHealth: "कुल आपूर्तिकर्ता स्वास्थ्य डॅशबोर्ड"
    }
  };

  const currentText = localTranslations[language as 'en' | 'mr' | 'hi'] || localTranslations.en;

  // Initialize data
  useEffect(() => {
    setSuppliers(initialSuppliersList);
    // Initialize dummy messages
    const initialMsgs: Record<string, Array<{ sender: string; text: string; time: string }>> = {
      sun_elevators: [
        { sender: 'Supplier', text: "Hello AIEC Admin, the traction units for the Kothrud project are ready for transport.", time: "10:30 AM" },
        { sender: 'Admin', text: "Excellent, please share the gate pass as soon as the truck leaves Chakan.", time: "11:15 AM" }
      ],
      apex_drives: [
        { sender: 'Supplier', text: "We have dispatched the counterweight replacements for PO-2026-0056.", time: "Yesterday" }
      ],
      zenith_elec: [
        { sender: 'Supplier', text: "We request SLA exclusion due to the heavy power failure from Pune flooding.", time: "May 15" },
        { sender: 'Admin', text: "We are reviewing your dispute request. Provide storm certificate if available.", time: "May 16" }
      ]
    };
    setMessages(initialMsgs);
  }, []);

  // Compute stats based on selected weightage configuration
  const getComputedSupplierScore = (supplier: SupplierExtended) => {
    if (supplier.isNew) {
      return 95; // High early rating
    }
    const sumWeights = wOnTime + wDefect + wPrice + wResponse;
    if (sumWeights === 0) return 0;
    
    const onTimeScore = supplier.onTimeDelivery;
    // Lower defect rate is a higher score: e.g. 1.2% defect rate gives (100 - 1.2 * 5) = 94
    const defectScore = Math.max(0, 100 - (supplier.defectRate * 5));
    const priceScore = supplier.priceCompetitiveness;
    const responseScore = supplier.responsiveness;

    const weighted = (
      (onTimeScore * wOnTime) +
      (defectScore * wDefect) +
      (priceScore * wPrice) +
      (responseScore * wResponse)
    ) / sumWeights;

    return Math.round(weighted);
  };

  // Determine if a supplier has dropped below threshold for two consecutive months
  const isAutoWatchlisted = (supplier: SupplierExtended) => {
    const computedScore = getComputedSupplierScore(supplier);
    if (supplier.isNew) return false;
    
    // Zenith's trend dropped below 75 for 2 consecutive months (e.g. May and Jun)
    // We check if their overall current score AND recent trend is below the admin threshold
    const recentScores = [...supplier.trend.slice(-2)];
    if (recentScores.length >= 2) {
      return recentScores.every(score => score < watchlistThreshold) || computedScore < watchlistThreshold;
    }
    return computedScore < watchlistThreshold;
  };

  const handleDispute = (supplierId: string, disputeId: string, status: 'approved' | 'rejected') => {
    const comment = overrideComments[disputeId] || '';
    setDisputeActions(prev => ({
      ...prev,
      [disputeId]: { status, comment }
    }));

    // Log to internal audit trails
    const logMsg = `[${new Date().toLocaleTimeString()}] Dispute ${disputeId} ${status.toUpperCase()} for ${supplierId}. Admin Reason: "${comment || 'No explanation provided'}"`;
    setAuditLog(prev => [logMsg, ...prev]);

    // If approved, dynamically improve the supplier's metric in active state
    if (status === 'approved') {
      setSuppliers(prevSuppliers => prevSuppliers.map(s => {
        if (s.id === supplierId) {
          return {
            ...s,
            onTimeDelivery: s.id === 'zenith_elec' ? 82 : s.onTimeDelivery, // Simulate resolved/override score
            defectRate: s.id === 'apex_drives' ? 1.0 : s.defectRate, // Override defect rate
            trend: [...s.trend.slice(0, -1), getComputedSupplierScore({ ...s, defectRate: 1.0, onTimeDelivery: 82 })]
          };
        }
        return s;
      }));
    }
  };

  const sendMessage = (supplierId: string) => {
    if (!newMessageText.trim()) return;
    
    setMessages(prev => {
      const existing = prev[supplierId] || [];
      return {
        ...prev,
        [supplierId]: [...existing, { sender: 'Admin', text: newMessageText, time: 'Just Now' }]
      };
    });
    setNewMessageText('');

    setTimeout(() => {
      // Simulate automatic response from supplier
      setMessages(prev => {
        const existing = prev[supplierId] || [];
        return {
          ...prev,
          [supplierId]: [...existing, { sender: 'Supplier', text: "Acknowledged. Dispatch team has logged your query.", time: 'Just Now' }]
        };
      });
    }, 1200);
  };

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting: ranked by computed score desc
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    return getComputedSupplierScore(b) - getComputedSupplierScore(a);
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  const triggerReset = () => {
    setLoading(true);
    setTimeout(() => {
      setSuppliers(initialSuppliersList);
      setWOnTime(30);
      setWDefect(30);
      setWPrice(20);
      setWResponse(20);
      setWatchlistThreshold(75);
      setDisputeActions({});
      setOverrideComments({});
      setAuditLog([]);
      setLoading(false);
    }, 800);
  };

  // Progress calculations for ADDITIONAL INSTRUCTION: "Show each time current % progress bar & total % progress bar"
  const currentAvgSLA = Math.round(
    suppliers.reduce((acc, s) => acc + s.onTimeDelivery, 0) / Math.max(1, suppliers.length)
  );

  const totalProcurementTarget = Math.round(
    (suppliers.reduce((acc, s) => acc + s.completedOrders.length, 0) / 12) * 100 // 12 is the quarterly goal
  );

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* SCREEN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-antiquegold rounded-full block" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal leading-none">
              {currentText.screenTitle}
            </h1>
          </div>
          <p className="text-xs text-warmgray font-medium">
            {currentText.screenSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="secondary" onClick={triggerReset} className="!py-2 !px-3 hover:scale-[1.02] flex items-center gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {language === 'hi' ? 'रीसेट' : language === 'mr' ? 'रीसेट' : 'Reset Scores'}
          </Button>
          <span className="text-[10px] bg-royalemerald/10 text-royalemerald font-bold border border-royalemerald/20 px-2.5 py-1 rounded-lg">
            ✓ SLA AUDITED SECURELY
          </span>
        </div>
      </div>

      {/* ADDITIONAL INSTRUCTION REQUIREMENT: Current % and Total % Progress Bars */}
      <Card className="p-5 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-24 h-24 bg-antiquegold/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-antiquegold" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            {currentText.overallSupplierHealth}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {currentText.averageDeliveryRate}
              </span>
              <span className="font-mono text-sm font-bold text-royalemerald">
                {currentAvgSLA}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3.5 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentAvgSLA}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-royalemerald h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Total Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-warmgray">
                {currentText.totalOrdersCompleted}
              </span>
              <span className="font-mono text-sm font-bold text-antiquegold">
                {totalProcurementTarget}%
              </span>
            </div>
            <div className="w-full bg-[#EFECE6] h-3.5 rounded-full overflow-hidden p-[2px] border border-[rgba(184,135,61,0.1)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalProcurementTarget}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-antiquegold h-full rounded-full shadow-inner relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
              </motion.div>
            </div>
          </div>
        </div>
      </Card>

      {/* CORE WEIGHT ADJUSTMENT SLIDERS */}
      <Card className="p-5 bg-white space-y-4">
        <div className="flex items-center gap-2 border-b border-[rgba(184,135,61,0.1)] pb-2">
          <Sliders className="w-4 h-4 text-antiquegold" />
          <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
            {currentText.adjustWeights}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* On-Time Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-charcoal">
              <span>{currentText.onTimeLabel}</span>
              <span className="font-mono text-antiquegold">{wOnTime}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={wOnTime}
              onChange={(e) => setWOnTime(parseInt(e.target.value))}
              className="w-full accent-antiquegold bg-alabaster h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Defect Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-charcoal">
              <span>{currentText.defectLabel}</span>
              <span className="font-mono text-antiquegold">{wDefect}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={wDefect}
              onChange={(e) => setWDefect(parseInt(e.target.value))}
              className="w-full accent-antiquegold bg-alabaster h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Price Comp Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-charcoal">
              <span>{currentText.priceLabel}</span>
              <span className="font-mono text-antiquegold">{wPrice}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={wPrice}
              onChange={(e) => setWPrice(parseInt(e.target.value))}
              className="w-full accent-antiquegold bg-alabaster h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Responsiveness Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-charcoal">
              <span>{currentText.responseLabel}</span>
              <span className="font-mono text-antiquegold">{wResponse}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={wResponse}
              onChange={(e) => setWResponse(parseInt(e.target.value))}
              className="w-full accent-antiquegold bg-alabaster h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Watchlist Threshold Slider */}
        <div className="pt-3 border-t border-[rgba(184,135,61,0.08)] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-charcoal">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-error shrink-0" />
              {currentText.watchlistThreshold}
            </span>
            <span className="font-mono text-error bg-error/5 border border-error/10 px-2.5 py-0.5 rounded-lg">
              {watchlistThreshold}% Score
            </span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="90" 
            value={watchlistThreshold}
            onChange={(e) => setWatchlistThreshold(parseInt(e.target.value))}
            className="w-full accent-error bg-alabaster h-1.5 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-warmgray italic">
            {currentText.watchlistThresholdDesc}
          </p>
        </div>
      </Card>

      {/* WATCHLIST ALERT BAR */}
      <AnimatePresence>
        {suppliers.some(s => isAutoWatchlisted(s)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-error/10 border border-error/20 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
          >
            <div className="flex items-center gap-2.5 text-error">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wide">
                  {currentText.watchlistTitle}
                </h4>
                <p className="text-[10px] font-semibold text-charcoal">
                  {currentText.watchlistWarning} Zenith Cabin Electronics score is below compliance limits.
                </p>
              </div>
            </div>
            <Button 
              variant="danger" 
              onClick={() => setSelectedSupplierId('zenith_elec')} 
              className="!py-1.5 !px-3 text-[10px] uppercase font-bold shrink-0 self-end sm:self-auto"
            >
              Audit Zenith Orders
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SUPPLIER LIST (Col span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-warmgray" />
            <input 
              type="text"
              placeholder={isDevanagari ? 'खरेदीदार शोधा...' : 'Search supplier name or region...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs border border-[rgba(184,135,61,0.15)] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray font-sans"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-warmgray hover:text-charcoal">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sortedSuppliers.map((supplier) => {
              const score = getComputedSupplierScore(supplier);
              const isSelected = supplier.id === selectedSupplierId;
              const autoWatch = isAutoWatchlisted(supplier);

              return (
                <Card 
                  key={supplier.id}
                  onClick={() => setSelectedSupplierId(supplier.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isSelected 
                      ? 'border-antiquegold bg-[#FAF9F5] shadow-sm ring-1 ring-antiquegold/20' 
                      : 'hover:bg-alabaster'
                  }`}
                >
                  {/* Subtle red indicator for Watchlist */}
                  {autoWatch && (
                    <div className="absolute top-0 right-0 left-0 h-[3px] bg-error" />
                  )}

                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-serif font-bold text-xs text-charcoal truncate">
                          {supplier.name}
                        </h4>
                        {supplier.isNew && (
                          <span className="bg-[#B8873D]/10 text-antiquegold text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                            {currentText.earlyDataLabel}
                          </span>
                        )}
                        {autoWatch && (
                          <span className="bg-error/10 text-error text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                            WATCHLIST
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-warmgray font-medium">
                        {supplier.region}
                      </p>
                    </div>

                    {/* Overall Score */}
                    <div className="text-right">
                      <span className="text-lg font-mono font-extrabold text-charcoal">
                        {score}
                      </span>
                      <p className="text-[8px] text-warmgray uppercase font-bold tracking-wider">
                        SCORE
                      </p>
                    </div>
                  </div>

                  {/* Visual mini progress bar row */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2 border-t border-[rgba(184,135,61,0.08)]">
                    <div className="text-center">
                      <p className="text-[8px] text-warmgray font-bold truncate">DELIVERY</p>
                      <p className="text-[10px] font-mono font-bold text-charcoal">{supplier.onTimeDelivery}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-warmgray font-bold truncate">DEFECT</p>
                      <p className="text-[10px] font-mono font-bold text-charcoal">{supplier.defectRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-warmgray font-bold truncate">PRICE</p>
                      <p className="text-[10px] font-mono font-bold text-charcoal">{supplier.priceCompetitiveness}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-warmgray font-bold truncate">RESPONSE</p>
                      <p className="text-[10px] font-mono font-bold text-charcoal">{supplier.responsiveness}%</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DRILLDOWN LEDGER & REVIEWS (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSupplier.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* SELECTED SUPPLIER HERO CARD */}
              <Card className="p-6 relative overflow-hidden bg-white">
                <div className="absolute right-0 top-0 w-32 h-32 bg-antiquegold/5 rounded-bl-full pointer-events-none" />
                
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase bg-antiquegold/10 text-antiquegold px-2 py-0.5 rounded-lg border border-antiquegold/15">
                      {selectedSupplier.region}
                    </span>
                    <h2 className="font-serif text-xl font-bold text-charcoal mt-1.5">
                      {selectedSupplier.name}
                    </h2>
                    <p className="text-xs text-warmgray mt-0.5">
                      Supplier ID: <span className="font-mono text-[10px] font-bold">{selectedSupplier.id}</span>
                    </p>
                  </div>

                  <div className="bg-[#FAF9F5] border border-[rgba(184,135,61,0.15)] rounded-2xl p-3 text-center shrink-0 min-w-[70px]">
                    <span className="text-2xl font-mono font-extrabold text-charcoal">
                      {getComputedSupplierScore(selectedSupplier)}
                    </span>
                    <p className="text-[8px] text-warmgray font-extrabold uppercase">
                      Composite
                    </p>
                  </div>
                </div>

                {/* Warning details for Watchlist */}
                {isAutoWatchlisted(selectedSupplier) && (
                  <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[10px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Zenith is currently flagged on the active watchlist. Quality audit requested.</span>
                  </div>
                )}

                {/* Warning details for Brand New Supplier */}
                {selectedSupplier.isNew && (
                  <div className="mt-4 p-3 rounded-xl bg-[#B8873D]/10 border border-[rgba(184,135,61,0.2)] text-antiquegold text-[10px] font-semibold flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{currentText.earlyDataWarning}</p>
                      <p className="text-[9px] text-charcoal">{currentText.earlyDataDesc}</p>
                    </div>
                  </div>
                )}

                {/* SLA Inputs Breakdown Table */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono">
                    PROCUREMENT SLA INPUTS BREAKDOWN
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                      <p className="text-[9px] text-warmgray font-bold">ON-TIME DELIVERY RATE</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-mono font-bold text-charcoal">{selectedSupplier.onTimeDelivery}%</span>
                        <span className="text-[8px] text-warmgray">({selectedSupplier.completedOrders.filter(o => o.onTime).length} of {selectedSupplier.completedOrders.length} orders)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                      <p className="text-[9px] text-warmgray font-bold">DEFECT RATE</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-mono font-bold text-charcoal">{selectedSupplier.defectRate}%</span>
                        <span className="text-[8px] text-warmgray">({selectedSupplier.completedOrders.filter(o => o.defect).length} defect returns)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                      <p className="text-[9px] text-warmgray font-bold">PRICE COMPETITIVENESS</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-mono font-bold text-charcoal">{selectedSupplier.priceCompetitiveness}/100</span>
                        <span className="text-[8px] text-warmgray">(Market audit average)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                      <p className="text-[9px] text-warmgray font-bold">RESPONSIVENESS RATING</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-mono font-bold text-charcoal">{selectedSupplier.responsiveness}/100</span>
                        <span className="text-[8px] text-warmgray">(Avg {selectedSupplier.id === 'zenith_elec' ? '14.5' : '2.4'} hrs reply)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trend View (Last Several Months) */}
                <div className="mt-6 pt-4 border-t border-[rgba(184,135,61,0.08)]">
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider font-mono mb-3">
                    6-MONTH PERFORMANCE TREND
                  </h4>
                  <div className="flex items-end justify-between h-20 px-2 pt-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                      // Get a simulated trend score, using default trend or seed trend
                      const score = selectedSupplier.trend[idx] || (selectedSupplier.isNew ? 95 : 85);
                      // Calculate height percentage
                      const heightPct = Math.max(20, Math.min(100, score));
                      const isDipping = score < watchlistThreshold;

                      return (
                        <div key={month} className="flex flex-col items-center flex-1 space-y-1.5">
                          <span className="text-[8px] font-mono font-bold text-charcoal">
                            {score}
                          </span>
                          <div className="w-6 bg-alabaster rounded-t-md h-12 relative overflow-hidden">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 0.8 }}
                              className={`absolute bottom-0 left-0 right-0 rounded-t-md ${
                                isDipping ? 'bg-error/70' : 'bg-antiquegold'
                              }`}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-warmgray">
                            {month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* CRITICAL INCIDENTS INLINE FOR ADMIN JUDGEMENT */}
              {selectedSupplier.incidents.length > 0 && (
                <Card className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-charcoal">
                    <AlertTriangle className="w-4.5 h-4.5 text-antiquegold shrink-0" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono">
                      {currentText.incidentLabel}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedSupplier.incidents.map((inc, i) => (
                      <div key={i} className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-warmgray">{inc.date}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              inc.resolved ? 'bg-royalemerald/15 text-royalemerald' : 'bg-error/15 text-error'
                            }`}>
                              {inc.resolved ? currentText.resolvedByAdmin : 'UNRESOLVED'}
                            </span>
                          </div>
                          <p className="font-semibold text-charcoal">{inc.msg}</p>
                        </div>
                        {inc.resolved && (
                          <span className="text-[9px] bg-royalemerald/10 text-royalemerald font-bold border border-royalemerald/20 px-2.5 py-1 rounded-lg self-start sm:self-auto shrink-0 flex items-center gap-1">
                            ✓ {currentText.notSupplierFault}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* PROCUREMENT HISTORY / ORDERS WITH THE ASCENSION LINE */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-1.5 text-charcoal">
                  <Truck className="w-4.5 h-4.5 text-antiquegold shrink-0" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono">
                    {currentText.orderHistory}
                  </h3>
                </div>

                {/* IN-FLIGHT ORDERS USING THE SIGNATURE ASCENSION LINE */}
                {selectedSupplier.inFlightOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-4">
                    <div className="flex justify-between items-start border-b border-[rgba(184,135,61,0.08)] pb-2">
                      <div>
                        <span className="text-[8px] font-mono font-extrabold bg-[#B8873D]/10 text-antiquegold px-2 py-0.5 rounded-lg border border-antiquegold/15 uppercase">
                          IN-FLIGHT ORDER
                        </span>
                        <h4 className="font-bold text-xs text-charcoal mt-1">
                          {order.item}
                        </h4>
                        <p className="text-[9px] font-mono text-warmgray mt-0.5">Order ID: {order.id} • Registered: {order.date}</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-royalemerald">
                        ₹{order.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Ascension Line Implementation */}
                    <div className="space-y-3 relative pl-6">
                      
                      {/* The vertical gold rail: "The Ascension Line" */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#FAF6EE] border-l border-[rgba(184,135,61,0.12)]">
                        {/* Dynamic Fill progress bar indicator */}
                        <div 
                          className="w-full bg-antiquegold transition-all duration-1000"
                          style={{ 
                            height: `${
                              (order.steps.filter(s => s.completed).length / order.steps.length) * 100
                            }%` 
                          }}
                        />
                      </div>

                      {order.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 relative text-[11px]">
                          {/* Dot marker */}
                          <div 
                            className={`absolute -left-[23px] top-1 w-[12px] h-[12px] rounded-full border-2 transition-all duration-300 z-10 ${
                              step.completed 
                                ? 'bg-antiquegold border-antiquegold shadow-[0_0_6px_rgba(184,135,61,0.4)]' 
                                : 'bg-white border-[rgba(184,135,61,0.25)]'
                            }`}
                          />
                          <div className={`space-y-0.5 ${step.completed ? 'text-charcoal font-bold' : 'text-warmgray font-medium'}`}>
                            <p>{step.label}</p>
                            {step.completed && (
                              <p className="text-[8px] text-royalemerald font-mono font-extrabold">COMPLETED ✓</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* COMPLETED HISTORIC ORDERS TABLE */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-warmgray uppercase tracking-wider font-mono">
                    COMPLETED ORDERS LEDGER
                  </h5>
                  <div className="space-y-2">
                    {selectedSupplier.completedOrders.map((order) => (
                      <div key={order.id} className="p-3 bg-[#FAF9F5] rounded-xl border border-[rgba(184,135,61,0.08)] flex justify-between items-center text-[11px]">
                        <div>
                          <p className="font-bold text-charcoal">{order.item}</p>
                          <p className="text-[9px] font-mono text-warmgray">ID: {order.id} • Delivered: {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-charcoal">₹{order.amount.toLocaleString('en-IN')}</p>
                          <p className="text-[8px] font-mono font-bold text-royalemerald">DELIVERED ✓</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* SUPPLIER DISPUTE PORTAL & OVERRIDES */}
              {selectedSupplier.disputes.length > 0 && (
                <Card className="p-5 bg-white border border-[rgba(184,135,61,0.2)]">
                  <div className="flex items-center gap-1.5 text-charcoal">
                    <ShieldAlert className="w-4.5 h-4.5 text-antiquegold shrink-0" />
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono">
                        {currentText.disputesTitle}
                      </h3>
                      <p className="text-[10px] text-warmgray italic">
                        {currentText.disputeDesc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {selectedSupplier.disputes.map((dispute) => {
                      const action = disputeActions[dispute.id];
                      
                      return (
                        <div key={dispute.id} className="p-4 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-3">
                          <div className="flex justify-between items-start gap-2 text-[11px] border-b border-[rgba(184,135,61,0.08)] pb-2">
                            <div>
                              <p className="font-bold text-charcoal">Metric: {dispute.metric}</p>
                              <p className="text-[9px] font-mono text-warmgray">Filed on: {dispute.date} • original values: {dispute.originalValue}</p>
                            </div>
                            <span className="bg-antiquegold/10 text-antiquegold text-[8px] px-2 py-0.5 rounded font-mono font-bold">
                              PENDING REVIEW
                            </span>
                          </div>

                          <p className="text-[11px] text-charcoal italic bg-white p-2.5 rounded-lg border border-[rgba(184,135,61,0.08)]">
                            "{dispute.claim}"
                          </p>

                          <div className="space-y-1 bg-white p-2.5 rounded-lg border border-[rgba(184,135,61,0.08)]">
                            <p className="text-[8px] font-bold text-warmgray uppercase">SUGGESTED REVISION</p>
                            <p className="text-[10px] font-bold text-royalemerald">{dispute.suggestedChange}</p>
                          </div>

                          {action ? (
                            <div className="p-3 bg-royalemerald/10 border border-royalemerald/20 text-royalemerald rounded-xl text-[11px] font-semibold flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <div>
                                <span className="uppercase font-bold">{action.status}!</span>
                                {action.comment && <p className="text-[9px] text-charcoal italic mt-0.5">Admin comment: "{action.comment}"</p>}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <textarea 
                                placeholder={currentText.disputeReasonPlaceholder}
                                value={overrideComments[dispute.id] || ''}
                                onChange={(e) => setOverrideComments(prev => ({ ...prev, [dispute.id]: e.target.value }))}
                                className="w-full bg-white border border-[rgba(184,135,61,0.15)] rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray font-sans"
                                rows={2}
                              />
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="primary"
                                  onClick={() => handleDispute(selectedSupplier.id, dispute.id, 'approved')}
                                  className="!py-2 text-[10px] uppercase font-bold flex-1"
                                >
                                  {currentText.approveDispute}
                                </Button>
                                <Button 
                                  variant="danger"
                                  onClick={() => handleDispute(selectedSupplier.id, dispute.id, 'rejected')}
                                  className="!py-2 text-[10px] uppercase font-bold flex-1"
                                >
                                  {currentText.rejectDispute}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* SECURE DIRECT CHAT COMMUNICATION THREAD */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[rgba(184,135,61,0.1)] pb-2">
                  <MessageSquare className="w-4.5 h-4.5 text-antiquegold shrink-0" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-charcoal">
                    {currentText.contactSupplier}
                  </h3>
                </div>

                {/* Messages scroll box */}
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {(messages[selectedSupplier.id] || []).map((msg, idx) => {
                    const isAdmin = msg.sender === 'Admin';
                    return (
                      <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`p-2.5 rounded-2xl max-w-[85%] text-[11px] ${
                          isAdmin 
                            ? 'bg-antiquegold text-white rounded-tr-none' 
                            : 'bg-alabaster text-charcoal border border-[rgba(184,135,61,0.1)] rounded-tl-none'
                        }`}>
                          <p>{msg.text}</p>
                          <span className={`text-[8px] block text-right mt-1 font-mono ${
                            isAdmin ? 'text-white/60' : 'text-warmgray'
                          }`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat input box */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={currentText.writeMessage}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage(selectedSupplier.id);
                    }}
                    className="flex-1 bg-alabaster border border-[rgba(184,135,61,0.15)] rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal placeholder-warmgray font-sans"
                  />
                  <Button 
                    variant="emerald"
                    onClick={() => sendMessage(selectedSupplier.id)}
                    className="!py-2 !px-3 font-bold text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {currentText.sendBtn}
                  </Button>
                </div>
              </Card>

              {/* AUDIT LOG TRAIL */}
              {auditLog.length > 0 && (
                <Card className="p-4 space-y-2 bg-[#F8F6F1]/50">
                  <h4 className="text-[9px] font-extrabold text-warmgray uppercase tracking-wider font-mono">
                    ADMIN AUDIT LOG HISTORY TRAIL
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {auditLog.map((log, i) => (
                      <p key={i} className="font-mono text-[9px] text-warmgray">
                        {log}
                      </p>
                    ))}
                  </div>
                </Card>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
