import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Landmark,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PhoneCall,
  Search,
  Filter,
  RefreshCw,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  Check
} from 'lucide-react';
import { Card, Button, Badge } from './Common';
import { useLanguage } from '../lib/language';
import { DbManager } from '../lib/db';
import { User, LoanApplication, LoanPartner, Payment } from '../types';

interface LoanPartnerIntegrationProps {
  user: User;
  onNavigateToCollection?: () => void;
  onNavigateToEscalation?: () => void;
}

const localizations = {
  en: {
    title: "Loan Partner Integration & Reconciliation",
    subtitle: "Admin control desk tracking in-flight EMI applications, partner performance, and bank disbursement reconciliations.",
    kpiTotalDisbursed: "Total Disbursed Volume",
    kpiAvgDisbursementDays: "Avg Disbursement Time",
    kpiApprovalRate: "Overall Partner Approval Rate",
    kpiActiveInFlight: "Active In-Flight Loans",
    searchPlaceholder: "Search by Customer, Deal ID, PAN, or Partner...",
    filterStatusAll: "All Statuses",
    filterStatusUnderReview: "Under Review",
    filterStatusApproved: "Approved (Pending Disb)",
    filterStatusDisbursed: "Disbursed",
    filterStatusDelayed: "Delayed / Risk Flagged",
    colAppId: "Application ID & Deal",
    colCustomer: "Customer & Site",
    colPartner: "Financing Partner",
    colAmount: "Amount & EMI",
    colStatus: "Partner Status",
    colActions: "Reconciliation Action",
    btnConfirmDisbursement: "Confirm Disbursement Receipt",
    btnEscalate: "Escalate to Partner Nodal Desk",
    btnRevert: "Revert to Cash Schedule",
    delayedRiskAlert: "DISBURSEMENT DELAYED (> 3 DAYS)",
    delayedRiskDesc: "Approved by partner credit desk but bank transfer to AIEC is overdue. Follow up with Nodal Desk.",
    disbursementModalTitle: "Reconcile & Confirm Bank Disbursement",
    disbursementModalDesc: "Logging this disbursement will immediately mark AIEC's corresponding deal payment schedule as PAID IN FULL.",
    actualReceivedLabel: "Actual Net Amount Received in AIEC Account (₹)",
    txnRefLabel: "Bank UTR / Transaction Reference No",
    disbursementDateLabel: "Disbursement Date",
    confirmSubmitBtn: "Confirm & Mark Payment Schedule Paid",
    reconciledSuccess: "Disbursement Reconciled & Payment Schedule Updated!",
    partnerDeskTitle: "Partner Performance & Nodal Escalations",
    escalateContactTitle: "Direct Nodal Desk Contacts"
  },
  hi: {
    title: "ऋण भागीदार एकीकरण और समाधान",
    subtitle: "इन-फ्लाइट ईएमआई आवेदनों, पार्टनर प्रदर्शन और बैंक संवितरण समाधान पर नज़र रखने वाला एडमिन कंट्रोल डेस्क।",
    kpiTotalDisbursed: "कुल संवितरित राशि",
    kpiAvgDisbursementDays: "औसत संवितरण समय",
    kpiApprovalRate: "समग्र भागीदार स्वीकृति दर",
    kpiActiveInFlight: "सक्रिय इन-फ्लाइट ऋण",
    searchPlaceholder: "ग्राहक, डील आईडी, पैन या पार्टनर खोजें...",
    filterStatusAll: "सभी स्थितियां",
    filterStatusUnderReview: "समीक्षाधीन",
    filterStatusApproved: "स्वीकृत (संवितरण लंबित)",
    filterStatusDisbursed: "संवितरित",
    filterStatusDelayed: "विलंबित / जोखिम झंडा",
    colAppId: "आवेदन आईडी और डील",
    colCustomer: "ग्राहक और साइट",
    colPartner: "फाइनेंसिंग पार्टनर",
    colAmount: "राशि और ईएमआई",
    colStatus: "पार्टनर स्थिति",
    colActions: "समाधान कार्रवाई",
    btnConfirmDisbursement: "संवितरण रसीद की पुष्टि करें",
    btnEscalate: "नोडल डेस्क को एस्केलेट करें",
    btnRevert: "नकद अनुसूची में वापस लौटें",
    delayedRiskAlert: "संवितरण में देरी (> 3 दिन)",
    delayedRiskDesc: "पार्टनर क्रेडिट डेस्क द्वारा स्वीकृत लेकिन एआईईसी को बैंक ट्रांसफर बाकी है।",
    disbursementModalTitle: "बैंक संवितरण का मिलान और पुष्टि करें",
    disbursementModalDesc: "इस संवितरण को दर्ज करने से एआईईसी का संबंधित भुगतान अनुसूची तुरंत पूर्ण भुगतान के रूप में चिह्नित हो जाएगा।",
    actualReceivedLabel: "एआईईसी खाते में प्राप्त वास्तविक शुद्ध राशि (₹)",
    txnRefLabel: "बैंक यूटीआर / ट्रांजैक्शन संदर्भ संख्या",
    disbursementDateLabel: "संवितरण तिथि",
    confirmSubmitBtn: "पुष्टि करें और भुगतान अनुसूची को चुकता करें",
    reconciledSuccess: "संवितरण का मिलान हुआ और भुगतान अनुसूची अपडेट की गई!",
    partnerDeskTitle: "पार्टनर प्रदर्शन और नोडल एस्केलेशन",
    escalateContactTitle: "प्रत्यक्ष नोडल डेस्क संपर्क"
  },
  mr: {
    title: "कर्ज पार्टनर एकत्रीकरण व सलोखा डेस्क",
    subtitle: "ईएमआई अर्ज, पार्टनर कामगिरी आणि बँक वितरण पडताळणी करणारा ॲडमिन डेस्क.",
    kpiTotalDisbursed: "एकूण वितरित रक्कम",
    kpiAvgDisbursementDays: "सरासरी वितरण वेळ",
    kpiApprovalRate: "एकूण मंजूर दर",
    kpiActiveInFlight: "प्रक्रियेतील कर्जे",
    searchPlaceholder: "ग्राहक, डील आयडी, किंवा पार्टनर शोधा...",
    filterStatusAll: "सर्व स्थिती",
    filterStatusUnderReview: "पडताळणी सुरू",
    filterStatusApproved: "मंजूर (वितरण बाकी)",
    filterStatusDisbursed: "वितरित",
    filterStatusDelayed: "विंलबित / जोखीम",
    colAppId: "अर्ज आयडी व डील",
    colCustomer: "ग्राहक व साइट",
    colPartner: "फायनान्सिंग पार्टनर",
    colAmount: "रक्कम व ईएमआई",
    colStatus: "पार्टनर स्थिती",
    colActions: "सलोखा कारवाई",
    btnConfirmDisbursement: "वितरण पावतीची खात्री करा",
    btnEscalate: "नोडल डेस्कला तक्रार करा",
    btnRevert: "रोख वेळापत्रकावर परत आणा",
    delayedRiskAlert: "वितरणात विलंब (> ३ दिवस)",
    delayedRiskDesc: "मंजूर झाले परंतु एआयईसी बँकेत जमा झालेले नाही. पाठपुरावा करा.",
    disbursementModalTitle: "बँक वितरणाची पडताळणी करा",
    disbursementModalDesc: "या नोंदीमुळे संबंधित पेमेंट वेळापत्रक स्वयंचलितपणे पूर्ण भरलेले म्हणून चिन्हांकित होईल.",
    actualReceivedLabel: "एआयईसी खात्यात जमा झालेली रक्कम (₹)",
    txnRefLabel: "बँक यूटीआर / व्यवहार क्रमांक",
    disbursementDateLabel: "वितरण तारीख",
    confirmSubmitBtn: "खात्री करा व भरणा चिन्हांकित करा",
    reconciledSuccess: "वितरण सलोखा पूर्ण आणि वेळापत्रक अद्ययावत!",
    partnerDeskTitle: "पार्टनर कामगिरी व संपर्क",
    escalateContactTitle: "थेट नोडल संपर्क"
  }
};

export const LoanPartnerIntegration: React.FC<LoanPartnerIntegrationProps> = ({
  user,
  onNavigateToCollection,
  onNavigateToEscalation
}) => {
  const { language } = useLanguage();
  const t = localizations[language as keyof typeof localizations] || localizations.en;

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [partners, setPartners] = useState<LoanPartner[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Reconciliation Modal
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [actualReceived, setActualReceived] = useState<number>(0);
  const [utrRef, setUtrRef] = useState<string>('');
  const [disbursementDate, setDisbursementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setApplications(DbManager.getLoanApplications());
    setPartners(DbManager.getLoanPartners());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.dealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.partnerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'UNDER_REVIEW') return app.status === 'Under Review';
    if (statusFilter === 'APPROVED') return app.status === 'Approved';
    if (statusFilter === 'DISBURSED') return app.status === 'Disbursed';
    if (statusFilter === 'DELAYED') return app.isDisbursementDelayed || app.status === 'Approved';

    return true;
  });

  // KPI Calculations
  const totalDisbursedVolume = applications
    .filter(a => a.status === 'Disbursed')
    .reduce((sum, a) => sum + (a.disbursementAmountReceived || a.requestedAmount), 0);

  const activeInFlightCount = applications.filter(a => a.status === 'Under Review' || a.status === 'Approved').length;

  const handleOpenDisbursementModal = (app: LoanApplication) => {
    setSelectedApp(app);
    setActualReceived(app.requestedAmount);
    setUtrRef(`UTR-DISB-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setShowModal(true);
  };

  const handleConfirmDisbursement = () => {
    if (!selectedApp) return;

    // 1. Update Loan Application State
    const updatedApp: LoanApplication = {
      ...selectedApp,
      status: 'Disbursed',
      disbursementAmountReceived: actualReceived,
      disbursementDate: disbursementDate,
      disbursementTxnRef: utrRef,
      isDisbursementDelayed: false,
      partnerStatusNote: 'Funds received in AIEC Bank Account. Deal payment schedule cleared.',
      updatedAt: new Date().toISOString()
    };

    DbManager.updateLoanApplication(updatedApp);

    // 2. Auto-clear corresponding Payments for this deal
    const allPayments = DbManager.getPayments();
    const dealPayments = allPayments.filter(p => p.dealId === selectedApp.dealId && p.status !== 'paid');

    dealPayments.forEach(p => {
      DbManager.updatePayment({
        ...p,
        status: 'paid',
        paidAmount: p.amount,
        paidAt: new Date().toISOString(),
        paymentMethod: 'Bank Transfer',
        referenceNo: utrRef,
        isDisputed: false,
        isPaused: false
      });
    });

    setShowModal(false);
    setSelectedApp(null);
    setToastMessage(t.reconciledSuccess);
    setTimeout(() => setToastMessage(null), 4000);
    loadData();
  };

  const handleRevertToCash = (app: LoanApplication) => {
    if (confirm(`Are you sure you want to cancel loan application ${app.id} and revert deal ${app.dealId} to direct cash payment?`)) {
      const revertedApp: LoanApplication = {
        ...app,
        status: 'Cancelled',
        partnerStatusNote: 'Cancelled by Admin. Reverted to standard milestone payment schedule.',
        updatedAt: new Date().toISOString()
      };
      DbManager.updateLoanApplication(revertedApp);
      loadData();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-800 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:text-emerald-300">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.15)] shadow-diffuse flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              MODULE 9 • ADMIN RECONCILIATION
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-royalemerald/10 text-royalemerald border border-royalemerald/20">
              LIVE BANK DISBURSEMENT
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            <Landmark className="w-6 h-6 text-royalemerald" />
            {t.title}
          </h1>
          <p className="text-xs text-warmgray max-w-xl">{t.subtitle}</p>
        </div>

        {onNavigateToCollection && (
          <Button
            variant="secondary"
            onClick={onNavigateToCollection}
            className="text-xs bg-alabaster border-[#e6dfd4] hover:bg-white flex items-center gap-1.5 shrink-0"
          >
            <DollarSign className="w-4 h-4 text-royalemerald" />
            <span>View Payment Collection Dashboard</span>
          </Button>
        )}
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 space-y-1 border-l-4 border-l-royalemerald">
          <span className="text-[10px] font-mono uppercase text-warmgray block">{t.kpiTotalDisbursed}</span>
          <span className="font-mono text-xl font-bold text-royalemerald">
            ₹ {totalDisbursedVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-warmgray block">Reconciled to AIEC Bank</span>
        </Card>

        <Card className="p-4 space-y-1 border-l-4 border-l-antiquegold">
          <span className="text-[10px] font-mono uppercase text-warmgray block">{t.kpiAvgDisbursementDays}</span>
          <span className="font-mono text-xl font-bold text-charcoal">1.8 Days</span>
          <span className="text-[10px] text-emerald-700 font-bold block">Fastest: Bajaj EMI (1.5d)</span>
        </Card>

        <Card className="p-4 space-y-1 border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-mono uppercase text-warmgray block">{t.kpiApprovalRate}</span>
          <span className="font-mono text-xl font-bold text-emerald-800">90.2%</span>
          <span className="text-[10px] text-warmgray block">Across 3 Partner Desks</span>
        </Card>

        <Card className="p-4 space-y-1 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-mono uppercase text-warmgray block">{t.kpiActiveInFlight}</span>
          <span className="font-mono text-xl font-bold text-amber-800">{activeInFlightCount} Loans</span>
          <span className="text-[10px] text-warmgray block">Pending bank transfer</span>
        </Card>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-alabaster border border-[rgba(184,135,61,0.2)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warmgray absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-white border border-[#e6dfd4] rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: t.filterStatusAll },
            { id: 'UNDER_REVIEW', label: t.filterStatusUnderReview },
            { id: 'APPROVED', label: t.filterStatusApproved },
            { id: 'DISBURSED', label: t.filterStatusDisbursed },
            { id: 'DELAYED', label: t.filterStatusDelayed }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-royalemerald text-white shadow-sm'
                  : 'bg-white border border-[#e6dfd4] text-warmgray hover:bg-alabaster'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      {/* APPLICATIONS TABLE / LIST */}
      <Card className="p-0 overflow-hidden border border-[rgba(184,135,61,0.15)] shadow-diffuse">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-alabaster border-b border-[#e6dfd4] font-mono text-[10px] text-warmgray uppercase">
                <th className="p-4">{t.colAppId}</th>
                <th className="p-4">{t.colCustomer}</th>
                <th className="p-4">{t.colPartner}</th>
                <th className="p-4">{t.colAmount}</th>
                <th className="p-4">{t.colStatus}</th>
                <th className="p-4 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6dfd4] text-xs font-sans">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-alabaster/60 transition-colors">
                  {/* APP ID & DEAL */}
                  <td className="p-4 font-mono">
                    <span className="font-bold text-charcoal block">{app.id}</span>
                    <span className="text-[10px] text-warmgray block">Deal: {app.dealId}</span>
                  </td>

                  {/* CUSTOMER & SITE */}
                  <td className="p-4">
                    <span className="font-bold text-charcoal block">{app.customerName}</span>
                    <span className="text-[10px] text-warmgray font-mono block">{app.customerPhone}</span>
                  </td>

                  {/* PARTNER */}
                  <td className="p-4 font-mono">
                    <span className="font-bold text-royalemerald block">{app.partnerName}</span>
                    <span className="text-[10px] text-warmgray block">{app.interestRateAnnual}% p.a.</span>
                  </td>

                  {/* AMOUNT & EMI */}
                  <td className="p-4 font-mono">
                    <span className="font-bold text-charcoal block">₹ {app.requestedAmount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-antiquegold block">
                      ₹ {app.monthlyEmiAmount.toLocaleString('en-IN')}/mo x {app.tenureMonths}m
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="p-4 space-y-1">
                    {app.status === 'Disbursed' ? (
                      <Badge variant="emerald" className="text-[10px] px-2.5 py-0.5">
                        DISBURSED TO AIEC
                      </Badge>
                    ) : app.status === 'Approved' ? (
                      <Badge variant="gold" className="text-[10px] px-2.5 py-0.5">
                        APPROVED BY BANK
                      </Badge>
                    ) : app.status === 'Cancelled' ? (
                      <Badge variant="neutral" className="text-[10px] px-2.5 py-0.5">
                        CANCELLED
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px] px-2.5 py-0.5">
                        UNDER REVIEW
                      </Badge>
                    )}

                    {/* Delay Alert Badge */}
                    {app.isDisbursementDelayed && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                        <span>DELAYED (&gt; 3 DAYS)</span>
                      </div>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 text-right space-y-1.5">
                    {app.status === 'Approved' && (
                      <Button
                        variant="primary"
                        onClick={() => handleOpenDisbursementModal(app)}
                        className="bg-royalemerald hover:bg-emerald-900 text-white text-[11px] px-3 py-1.5 flex items-center justify-end gap-1 ml-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.btnConfirmDisbursement}</span>
                      </Button>
                    )}

                    {app.status === 'Disbursed' && (
                      <span className="font-mono text-[10px] text-emerald-800 font-bold block">
                        UTR: {app.disbursementTxnRef || 'CONFIRMED'}
                      </span>
                    )}

                    {(app.status === 'Under Review' || app.status === 'Approved') && (
                      <div className="flex items-center justify-end gap-2">
                        {onNavigateToEscalation && (
                          <button
                            onClick={onNavigateToEscalation}
                            className="text-[10px] text-amber-700 hover:underline flex items-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3" />
                            <span>Escalate Desk</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRevertToCash(app)}
                          className="text-[10px] text-red-600 hover:underline"
                        >
                          Revert
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-warmgray text-xs font-mono">
                    No loan applications found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PARTNER NODAL DESK CONTACTS & ESCALATION CARD */}
      <Card className="p-6 space-y-4 bg-alabaster border border-[rgba(184,135,61,0.2)]">
        <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-antiquegold" />
          {t.escalateContactTitle}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {partners.map(p => (
            <div key={p.id} className="p-4 bg-white rounded-2xl border border-[#e6dfd4] space-y-2">
              <span className="font-bold text-charcoal block text-sm">{p.name}</span>
              <div className="space-y-1 text-warmgray text-[11px]">
                <p><span className="text-charcoal font-bold">Nodal Officer:</span> {p.escalationContactName}</p>
                <p><span className="text-charcoal font-bold">Phone:</span> {p.escalationContactPhone}</p>
                <p><span className="text-charcoal font-bold">Email:</span> {p.escalationContactEmail}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => alert(`Dialing Nodal Desk for ${p.name}: ${p.escalationContactPhone}`)}
                className="w-full py-1.5 text-[11px] bg-alabaster border-[#e6dfd4] flex items-center justify-center gap-1 mt-2"
              >
                <PhoneCall className="w-3 h-3 text-royalemerald" />
                <span>Call Nodal Desk</span>
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* RECONCILIATION DISBURSEMENT MODAL */}
      <AnimatePresence>
        {showModal && selectedApp && (
          <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-3xl p-6 space-y-5 border border-[rgba(184,135,61,0.2)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3">
                <h3 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-royalemerald" />
                  {t.disbursementModalTitle}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-warmgray hover:text-charcoal p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-warmgray">{t.disbursementModalDesc}</p>

              <div className="p-4 bg-alabaster rounded-2xl border border-[#e6dfd4] space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-warmgray">CUSTOMER:</span>
                  <span className="font-bold text-charcoal">{selectedApp.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">DEAL REF:</span>
                  <span className="font-bold text-charcoal">{selectedApp.dealId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">FINANCING PARTNER:</span>
                  <span className="font-bold text-royalemerald">{selectedApp.partnerName}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-warmgray uppercase block">
                    {t.actualReceivedLabel}
                  </label>
                  <input
                    type="number"
                    value={actualReceived}
                    onChange={e => setActualReceived(Number(e.target.value))}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
                  />
                  {actualReceived < selectedApp.requestedAmount && (
                    <span className="text-[10px] text-amber-700 font-mono block">
                      Gap Shortfall: ₹{(selectedApp.requestedAmount - actualReceived).toLocaleString('en-IN')} (Partner deduction)
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-warmgray uppercase block">
                    {t.txnRefLabel}
                  </label>
                  <input
                    type="text"
                    value={utrRef}
                    onChange={e => setUtrRef(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-warmgray uppercase block">
                    {t.disbursementDateLabel}
                  </label>
                  <input
                    type="date"
                    value={disbursementDate}
                    onChange={e => setDisbursementDate(e.target.value)}
                    className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#e6dfd4]">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1 text-xs">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmDisbursement}
                  className="flex-1 text-xs bg-royalemerald hover:bg-emerald-900 text-white font-bold py-2.5"
                >
                  {t.confirmSubmitBtn}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
