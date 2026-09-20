import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck, Shield, CheckCircle2, UserCheck, Lock, Download, 
  Printer, ArrowLeft, AlertCircle, Phone, DollarSign, Calendar,
  Share2, Eye, Sparkles, Clock, FileText, Check
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { 
  MaterialReceivedConfirmation, SiteDeliveryChecklist, 
  DiscrepancyReport, User as UserType, ConfirmingParty 
} from '../types';

interface Props {
  user: UserType;
  selectedPoId?: string;
  onBackToChecklist?: () => void;
  onNavigateToPayment?: (poId: string) => void;
}

export const MaterialReceivedConfirmationScreen: React.FC<Props> = ({
  user,
  selectedPoId,
  onBackToChecklist,
  onNavigateToPayment
}) => {
  const [confirmations, setConfirmations] = useState<MaterialReceivedConfirmation[]>([]);
  const [activeConfirmation, setActiveConfirmation] = useState<MaterialReceivedConfirmation | null>(null);
  const [checklist, setChecklist] = useState<SiteDeliveryChecklist | null>(null);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyReport[]>([]);

  // Signature state
  const [isCustomerPresent, setIsCustomerPresent] = useState(true);
  const [techSignName, setTechSignName] = useState(user.name || 'Rajesh Patel');
  const [custSignName, setCustSignName] = useState('Mr. Vivek Ranade (Secretary)');
  const [custPhone, setCustPhone] = useState('+91 98220 12345');
  const [techNote, setTechNote] = useState('');
  
  // Drawn signature mock
  const [techSigned, setTechSigned] = useState(false);
  const [custSigned, setCustSigned] = useState(false);

  // Document modal view
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedPoId]);

  const loadData = () => {
    const confList = DbManager.getMaterialConfirmations();
    setConfirmations(confList);

    let matchConf = confList.find(c => c.poId === selectedPoId);
    if (!matchConf && confList.length > 0) {
      matchConf = confList[0];
    }

    if (matchConf) {
      setActiveConfirmation(matchConf);
      setIsCustomerPresent(matchConf.customerPresentFlag);
      
      const techParty = matchConf.confirmingParties.find(p => p.role === 'technician');
      if (techParty) {
        setTechSignName(techParty.name);
        setTechSigned(true);
      }
      const custParty = matchConf.confirmingParties.find(p => p.role === 'customer' || p.role === 'site_engineer');
      if (custParty) {
        setCustSignName(custParty.name);
        setCustPhone(custParty.phone);
        setCustSigned(true);
      }

      // Load associated checklist and discrepancy reports
      const checklists = DbManager.getSiteDeliveryChecklists();
      const chk = checklists.find(c => c.id === matchConf.checklistId || c.poId === matchConf.poId);
      if (chk) setChecklist(chk);

      const discList = DbManager.getDiscrepancyReports().filter(d => d.poId === matchConf.poId);
      setDiscrepancies(discList);
    } else if (selectedPoId) {
      // Build draft confirmation from checklist
      const checklists = DbManager.getSiteDeliveryChecklists();
      const chk = checklists.find(c => c.poId === selectedPoId);
      if (chk) {
        setChecklist(chk);
        const discList = DbManager.getDiscrepancyReports().filter(d => d.poId === selectedPoId);
        setDiscrepancies(discList);

        const newConf: MaterialReceivedConfirmation = {
          id: `conf_${selectedPoId}_${Date.now().toString().slice(-4)}`,
          poId: chk.poId,
          checklistId: chk.id,
          customerName: chk.customerName,
          siteAddress: chk.siteAddress,
          deliverySummary: `Verified ${chk.items.length} line items on site (${chk.deliveryType} delivery).`,
          totalItemsChecked: chk.items.length,
          totalQtyReceived: chk.items.reduce((acc, i) => acc + i.receivedQty, 0),
          discrepancySummary: discList.length > 0 ? discList.map(d => d.issueSummary).join(' | ') : undefined,
          linkedDiscrepancies: discList.map(d => d.id),
          confirmingParties: [],
          customerPresentFlag: true,
          documentRefCode: `AIEC-MDR-2026-${chk.poId.slice(-4)}`,
          paymentStageDueTriggered: false,
          paymentStageName: '30% Due on Material Delivery Confirmation',
          amountDueNow: 345000,
          status: 'queued_offline',
          timestamp: new Date().toISOString()
        };
        setActiveConfirmation(newConf);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSignAndLock = () => {
    if (!activeConfirmation) return;

    if (!techSigned) {
      alert('Technician signature is required to formally lock confirmation.');
      return;
    }

    const parties: ConfirmingParty[] = [
      {
        role: 'technician',
        name: techSignName,
        phone: user.phone || '+91 98765 43212',
        signedAt: new Date().toISOString(),
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 30 Q 30 10 50 30 T 90 30 T 130 30 T 180 20" stroke="%230E4B3D" stroke-width="3" fill="none"/></svg>'
      }
    ];

    if (isCustomerPresent && custSigned) {
      parties.push({
        role: 'customer',
        name: custSignName,
        phone: custPhone,
        signedAt: new Date().toISOString(),
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M 10 40 Q 40 10 80 35 T 140 20 T 190 40" stroke="%23B8873D" stroke-width="3" fill="none"/></svg>'
      });
    }

    const locked: MaterialReceivedConfirmation = {
      ...activeConfirmation,
      confirmingParties: parties,
      customerPresentFlag: isCustomerPresent,
      technicianOnlyNote: !isCustomerPresent ? techNote : undefined,
      status: 'signed_and_locked',
      paymentStageDueTriggered: true,
      timestamp: new Date().toISOString()
    };

    DbManager.addMaterialConfirmation(locked);
    setActiveConfirmation(locked);

    // Also update payments table trigger if exists
    const payments = DbManager.getPayments();
    const targetPayment = payments.find(p => p.dealId?.includes(activeConfirmation.poId) || p.customerName?.includes(activeConfirmation.customerName));
    if (targetPayment) {
      targetPayment.status = 'pending';
      targetPayment.dueDate = new Date().toISOString().split('T')[0];
      DbManager.updatePayment(targetPayment);
    }

    showToast('Material Received Confirmation locked & timestamped! Payment stage due date triggered.');
  };

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              SOP Step #4 • Formal Delivery Sign-Off
            </span>
            <span className="text-xs text-charcoal/60">Module 11</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Material Received Confirmation (MDR)
          </h1>
          <p className="text-sm text-charcoal/70">
            Immutable sign-off document linking physical delivery verification directly to customer milestone payments.
          </p>
        </div>

        {/* Action button */}
        {onBackToChecklist && (
          <button
            onClick={onBackToChecklist}
            className="px-3.5 py-2 rounded-xl border border-antiquegold/40 text-charcoal text-xs font-semibold hover:bg-antiquegold/10 transition flex items-center space-x-1.5 self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-antiquegold" />
            <span>Back to Inspection Checklist</span>
          </button>
        )}
      </div>

      {activeConfirmation ? (
        <>
          {/* Main Document Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-antiquegold/30 shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-antiquegold/5 rounded-bl-full pointer-events-none" />

            {/* Document Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-antiquegold uppercase tracking-widest block">
                  OFFICIAL RECEIPT REF: {activeConfirmation.documentRefCode}
                </span>
                <h2 className="text-xl font-serif font-bold text-charcoal mt-0.5">
                  {activeConfirmation.customerName}
                </h2>
                <p className="text-xs text-charcoal/60">{activeConfirmation.siteAddress}</p>
              </div>

              <div className="flex items-center space-x-2">
                {activeConfirmation.status === 'signed_and_locked' ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>LOCKED & TIMESTAMPED</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>AWAITING SIGNATURES</span>
                  </span>
                )}

                <button
                  onClick={() => setShowDocPreview(true)}
                  className="p-2 text-antiquegold hover:bg-antiquegold/10 rounded-xl transition"
                  title="View PDF Document Preview"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Checked Items Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="space-y-1">
                <span className="text-xs text-charcoal/60">PO Reference</span>
                <p className="font-mono font-bold text-charcoal text-sm">{activeConfirmation.poId}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-charcoal/60">Inspected Items Count</span>
                <p className="font-bold text-royalemerald text-sm">
                  {activeConfirmation.totalItemsChecked} Line Items ({activeConfirmation.totalQtyReceived} Units)
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-charcoal/60">Discrepancy Status</span>
                <p className={`text-xs font-bold ${discrepancies.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                  {discrepancies.length > 0 ? `${discrepancies.length} Open Report Logged` : 'Clean Delivery (0 Discrepancies)'}
                </p>
              </div>
            </div>

            {/* Discrepancies Transparency Box */}
            {discrepancies.length > 0 && (
              <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Linked Discrepancy Note (Transparent Record)</span>
                </div>
                {discrepancies.map(d => (
                  <div key={d.id} className="text-xs text-red-800 space-y-1">
                    <p className="font-semibold">{d.issueSummary}</p>
                    <p className="text-[11px] text-red-700">Resolution Status: {d.resolutionNote || 'Under investigation with supplier.'}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Trigger Notification Card */}
            <div className="bg-gradient-to-r from-royalemerald/10 to-antiquegold/10 border border-royalemerald/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-royalemerald uppercase tracking-wider block">
                  Payment Stage Trigger
                </span>
                <h4 className="text-sm font-bold text-charcoal">{activeConfirmation.paymentStageName}</h4>
                <p className="text-xs text-charcoal/70">
                  Signing this confirmation triggers the due-date clock for ₹{activeConfirmation.amountDueNow.toLocaleString('en-IN')}.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-royalemerald text-lg block">
                  ₹{activeConfirmation.amountDueNow.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-charcoal/60">Due on Material Confirmation</span>
              </div>
            </div>

            {/* Customer Attendance Toggle */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-charcoal">Customer On-Site Attendance</h3>
                  <p className="text-xs text-charcoal/60">
                    If customer or site representative is absent, technician signs on AIEC's behalf.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsCustomerPresent(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isCustomerPresent 
                        ? 'bg-royalemerald text-white shadow-sm' 
                        : 'bg-gray-100 text-charcoal/60 hover:bg-gray-200'
                    }`}
                  >
                    Customer Present
                  </button>
                  <button
                    onClick={() => setIsCustomerPresent(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      !isCustomerPresent 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-charcoal/60 hover:bg-gray-200'
                    }`}
                  >
                    Tech-Only (Absent)
                  </button>
                </div>
              </div>

              {!isCustomerPresent && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
                  <p className="font-bold text-amber-900">Note for Customer-Absent Confirmation:</p>
                  <textarea
                    value={techNote}
                    onChange={(e) => setTechNote(e.target.value)}
                    placeholder="Enter reason for customer absence (e.g., Gatekeeper provided key, customer out of station, photo shared on WhatsApp)..."
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-charcoal focus:ring-1 focus:ring-antiquegold"
                    rows={2}
                  />
                  <p className="text-[11px] text-amber-800">
                    * This confirmation document will be posted directly to the customer portal for asynchronous review.
                  </p>
                </div>
              )}
            </div>

            {/* Dual Signature Capture Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              {/* Technician Signature Box */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-royalemerald" />
                    <span>AIEC Lead Technician Sign-Off</span>
                  </span>
                  {techSigned && (
                    <span className="text-[10px] font-bold text-royalemerald bg-emerald-100 px-2 py-0.5 rounded-md">
                      SIGNED
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={techSignName}
                  onChange={(e) => setTechSignName(e.target.value)}
                  placeholder="Technician Full Name"
                  className="w-full text-xs bg-white border border-gray-300 rounded-xl p-2 text-charcoal"
                />

                {/* Simulated Signature Canvas Box */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center relative overflow-hidden">
                  {techSigned ? (
                    <div className="text-center space-y-1">
                      <svg width="180" height="40" className="mx-auto">
                        <path d="M 10 25 Q 30 10 50 25 T 90 25 T 130 25 T 170 15" stroke="#0E4B3D" strokeWidth="3" fill="none" />
                      </svg>
                      <span className="text-[10px] text-charcoal/50 block font-mono">
                        Digital Hash Verified • {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setTechSigned(true)}
                      className="px-4 py-2 bg-royalemerald/10 text-royalemerald hover:bg-royalemerald/20 text-xs font-bold rounded-xl transition"
                    >
                      Tap to Sign Canvas (Technician)
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Signature Box */}
              <div className={`rounded-2xl p-4 border space-y-3 ${
                isCustomerPresent ? 'bg-gray-50 border-gray-200' : 'bg-gray-100/50 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-antiquegold" />
                    <span>Customer / Site Rep Sign-Off</span>
                  </span>
                  {custSigned && isCustomerPresent && (
                    <span className="text-[10px] font-bold text-antiquegold bg-amber-100 px-2 py-0.5 rounded-md">
                      SIGNED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={custSignName}
                    disabled={!isCustomerPresent}
                    onChange={(e) => setCustSignName(e.target.value)}
                    placeholder="Customer Contact Name"
                    className="text-xs bg-white border border-gray-300 rounded-xl p-2 text-charcoal disabled:opacity-50"
                  />
                  <input
                    type="text"
                    value={custPhone}
                    disabled={!isCustomerPresent}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="text-xs bg-white border border-gray-300 rounded-xl p-2 text-charcoal disabled:opacity-50"
                  />
                </div>

                {/* Simulated Signature Canvas Box */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center relative overflow-hidden">
                  {!isCustomerPresent ? (
                    <span className="text-xs text-gray-400 font-medium">
                      (Customer absent — Sign-off bypassed)
                    </span>
                  ) : custSigned ? (
                    <div className="text-center space-y-1">
                      <svg width="180" height="40" className="mx-auto">
                        <path d="M 10 30 Q 40 10 80 25 T 140 15 T 175 30" stroke="#B8873D" strokeWidth="3" fill="none" />
                      </svg>
                      <span className="text-[10px] text-charcoal/50 block font-mono">
                        Customer Signature Verified • {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCustSigned(true)}
                      className="px-4 py-2 bg-antiquegold/10 text-antiquegold hover:bg-antiquegold/20 text-xs font-bold rounded-xl transition"
                    >
                      Tap to Sign Canvas (Customer)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Locked Confirmation Parties List */}
          {activeConfirmation.status === 'signed_and_locked' && (
            <div className="bg-white rounded-2xl p-5 border border-antiquegold/20 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Signatories & Audit Trail</span>
              </h3>
              <div className="divide-y divide-gray-100 text-xs">
                {activeConfirmation.confirmingParties.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal capitalize">{p.name} ({p.role})</span>
                      <p className="text-[11px] text-charcoal/60">{p.phone}</p>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      Signed: {new Date(p.signedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Lock / Export Sticky Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-antiquegold/30 p-4 z-40">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setShowDocPreview(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-antiquegold/40 text-charcoal text-xs font-semibold hover:bg-antiquegold/10 transition flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4 text-antiquegold" />
                <span>View Full PDF Receipt</span>
              </button>

              {activeConfirmation.status === 'signed_and_locked' ? (
                <button
                  onClick={() => {
                    if (onNavigateToPayment) onNavigateToPayment(activeConfirmation.poId);
                    else showToast('Redirecting to Payment Checkout...');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-royalemerald hover:bg-royalemerald/90 text-white text-sm font-bold shadow-md transition flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-5 h-5 text-antiquegold" />
                  <span>Proceed to Digital Checkout (₹{activeConfirmation.amountDueNow.toLocaleString('en-IN')})</span>
                </button>
              ) : (
                <button
                  onClick={handleSignAndLock}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white text-sm font-bold shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Lock className="w-5 h-5" />
                  <span>Formally Lock & Timestamp Receipt</span>
                </button>
              )}
            </div>
          </div>

          {/* PDF Receipt Modal */}
          {showDocPreview && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-antiquegold">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-antiquegold" />
                    <h3 className="font-serif font-bold text-lg text-charcoal">All India Elevators Company (AIEC)</h3>
                  </div>
                  <button
                    onClick={() => setShowDocPreview(false)}
                    className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="border border-gray-200 p-6 rounded-xl space-y-4 text-xs font-sans text-charcoal">
                  <div className="text-center border-b pb-4">
                    <h4 className="font-bold text-base text-royalemerald">MATERIAL DELIVERY CONFIRMATION RECEIPT</h4>
                    <p className="font-mono text-xs text-charcoal/70">Ref: {activeConfirmation.documentRefCode}</p>
                    <p className="text-[11px] text-gray-500">Timestamp: {activeConfirmation.timestamp}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold block text-gray-500">CLIENT DETAILS</span>
                      <p className="font-semibold">{activeConfirmation.customerName}</p>
                      <p>{activeConfirmation.siteAddress}</p>
                    </div>
                    <div>
                      <span className="font-bold block text-gray-500">SHIPMENT REF</span>
                      <p className="font-mono font-semibold">{activeConfirmation.poId}</p>
                      <p>Total Items Checked: {activeConfirmation.totalItemsChecked}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-bold block mb-1">INSPECTION SUMMARY</span>
                    <p>{activeConfirmation.deliverySummary}</p>
                    {activeConfirmation.discrepancySummary && (
                      <p className="text-red-700 font-semibold mt-1">
                        Discrepancies: {activeConfirmation.discrepancySummary}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <span className="text-[10px] text-gray-500 block mb-1">AIEC LEAD TECHNICIAN</span>
                      <p className="font-semibold">{techSignName}</p>
                      <p className="text-[10px] text-emerald-700">Digital Signoff Verified</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-gray-500 block mb-1">CUSTOMER / SITE REP</span>
                      <p className="font-semibold">{isCustomerPresent ? custSignName : 'Bypassed (Absent)'}</p>
                      <p className="text-[10px] text-antiquegold">{isCustomerPresent ? 'Digital Signoff Verified' : techNote}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => {
                      showToast('Receipt PDF exported to downloads');
                      setShowDocPreview(false);
                    }}
                    className="px-4 py-2 bg-royalemerald text-white font-bold text-xs rounded-xl flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-antiquegold/20">
          <FileCheck className="w-12 h-12 text-antiquegold mx-auto opacity-50" />
          <h3 className="text-lg font-serif font-bold text-charcoal">No Material Confirmation Pending</h3>
          <p className="text-sm text-charcoal/60">
            Please complete a site delivery inspection checklist first to generate a formal confirmation.
          </p>
        </div>
      )}
    </div>
  );
};
