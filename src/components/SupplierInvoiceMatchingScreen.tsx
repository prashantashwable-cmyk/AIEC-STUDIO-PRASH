import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, FileText, Upload, ShieldCheck, 
  DollarSign, ArrowRight, Eye, RefreshCw, X, Plus, Sparkles, 
  Search, ShieldAlert, FileCheck, Layers, FileX, Check, Lock
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SupplierInvoiceDoc, User as UserType } from '../types';

interface Props {
  user: UserType;
  onNavigateToApprovalQueue?: () => void;
}

export const SupplierInvoiceMatchingScreen: React.FC<Props> = ({ 
  user,
  onNavigateToApprovalQueue 
}) => {
  const [invoices, setInvoices] = useState<SupplierInvoiceDoc[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoiceDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Submit/Upload Invoice Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPoNumber, setNewPoNumber] = useState('PO-2026-8801');
  const [newSupplierName, setNewSupplierName] = useState('Sun Elevators Mfg Co');
  const [newInvoiceNo, setNewInvoiceNo] = useState('');
  const [newInvoiceDate, setNewInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTotalAmount, setNewTotalAmount] = useState<number>(850000);

  // Exception Override Modal
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [exceptionReason, setExceptionReason] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getSupplierInvoices();
    setInvoices(list);
    if (list.length > 0 && !selectedInvoice) {
      setSelectedInvoice(list[0]);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Submit new invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceNo.trim() || !newTotalAmount) return;

    const doc: SupplierInvoiceDoc = {
      id: `inv_${Date.now()}`,
      invoiceNumber: newInvoiceNo,
      supplierId: 'sun_elevators',
      supplierName: newSupplierName,
      poId: 'po_sun_1',
      poNumber: newPoNumber,
      invoiceDate: newInvoiceDate,
      totalInvoicedAmountINR: newTotalAmount,
      taxAmountINR: Math.round(newTotalAmount * 0.18),
      fileUrl: `TAX_INVOICE_${newInvoiceNo}.pdf`,
      status: 'submitted',
      submissionMethod: user.role === 'admin' ? 'admin_upload' : 'supplier_direct',
      lineItems: [
        {
          id: `li_${Date.now()}`,
          itemCode: 'ELEV-SYSTEM-PART',
          description: 'Elevator Component Sub-assembly',
          invoicedQty: 1,
          invoicedUnitPriceINR: Math.round(newTotalAmount / 1.18),
          invoicedTotalINR: Math.round(newTotalAmount / 1.18),
          poQty: 1,
          poUnitPriceINR: Math.round(newTotalAmount / 1.18),
          receivedQty: 1
        }
      ],
      matchResult: {
        poId: 'po_sun_1',
        poTotalINR: newTotalAmount,
        receiptId: 'DEL-8821',
        receiptDate: newInvoiceDate,
        receiptConfirmedQty: 1,
        matchedQtyCheck: 'pass',
        matchedPriceCheck: 'pass',
        matchStatus: 'perfect_match',
        qtyDifference: 0,
        priceDifferenceINR: 0,
        discrepancyNote: 'Newly submitted tax invoice automatically passed 3-way check against PO.'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DbManager.addSupplierInvoice(doc);
    loadData();
    setSelectedInvoice(doc);
    setShowUploadModal(false);
    setNewInvoiceNo('');
    showToast(`Invoice ${doc.invoiceNumber} submitted & matched successfully.`);
  };

  // Approve Mid-Order Price Exception
  const handleApproveException = () => {
    if (!selectedInvoice || !exceptionReason.trim()) return;

    const updated: SupplierInvoiceDoc = {
      ...selectedInvoice,
      status: 'exception_approved',
      approvedExceptionReason: exceptionReason,
      approvedExceptionBy: user.name,
      matchResult: {
        ...selectedInvoice.matchResult!,
        matchedPriceCheck: 'approved_exception',
        matchStatus: 'approved_exception',
        discrepancyNote: `Price variation approved by ${user.name}. Reason: ${exceptionReason}`
      },
      updatedAt: new Date().toISOString()
    };

    DbManager.updateSupplierInvoice(updated);
    loadData();
    setSelectedInvoice(updated);
    setShowExceptionModal(false);
    setExceptionReason('');
    showToast(`Price variation exception approved for ${updated.invoiceNumber}. Unlocked for payment queue.`);
  };

  // Confirm Match & Unlock Payment Line Item
  const handleConfirmMatchUnlock = () => {
    if (!selectedInvoice) return;

    const updated: SupplierInvoiceDoc = {
      ...selectedInvoice,
      status: 'matched',
      updatedAt: new Date().toISOString()
    };

    DbManager.updateSupplierInvoice(updated);
    loadData();
    setSelectedInvoice(updated);
    showToast(`3-Way Match confirmed for ${selectedInvoice.invoiceNumber}! Unlocked in Supplier Payment Queue.`);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'matched' && (inv.status === 'matched' || inv.status === 'exception_approved')) ||
      (statusFilter === 'mismatch' && inv.status === 'mismatch_flagged') ||
      (statusFilter === 'missing' && inv.status === 'missing_doc');

    return matchesSearch && matchesStatus;
  });

  const matchedCount = invoices.filter(i => i.status === 'matched' || i.status === 'exception_approved').length;
  const mismatchCount = invoices.filter(i => i.status === 'mismatch_flagged').length;
  const missingCount = invoices.filter(i => i.status === 'missing_doc').length;

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              SOP Step #3 • Module 12: Supplier Payments
            </span>
            <span className="text-xs text-charcoal/60 font-mono">3-Way AP Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Supplier Invoice Matching Screen
          </h1>
          <p className="text-sm text-charcoal/70">
            Compare Purchase Orders, Supplier Tax Invoices, and Material Delivery Sign-offs side-by-side.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          {onNavigateToApprovalQueue && (
            <button
              onClick={onNavigateToApprovalQueue}
              className="px-3.5 py-2.5 bg-white border border-antiquegold/30 text-charcoal hover:bg-alabaster rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <DollarSign className="w-4 h-4 text-royalemerald" />
              <span>Payment Queue ➔</span>
            </button>
          )}

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Upload className="w-4 h-4 text-antiquegold" />
            <span>Upload Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Verified 3-Way Matches</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-royalemerald">{matchedCount} Cleared</span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Unlocks Payment
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Flagged Discrepancies</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-red-600">{mismatchCount} Mismatch</span>
            <span className="text-[10px] bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200 font-bold">
              Price/Qty Variation
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Missing Invoices</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-amber-700">{missingCount} Pending</span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold">
              Blocked on Doc
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice #, PO #, or Supplier..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal focus:ring-1 focus:ring-antiquegold"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'all' ? 'bg-white text-charcoal shadow-sm font-bold' : 'text-charcoal/60'
            }`}
          >
            All Invoices
          </button>
          <button
            onClick={() => setStatusFilter('matched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'matched' ? 'bg-white text-royalemerald shadow-sm font-bold' : 'text-charcoal/60'
            }`}
          >
            Matched ({matchedCount})
          </button>
          <button
            onClick={() => setStatusFilter('mismatch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'mismatch' ? 'bg-white text-red-700 shadow-sm font-bold' : 'text-charcoal/60'
            }`}
          >
            Mismatches ({mismatchCount})
          </button>
          <button
            onClick={() => setStatusFilter('missing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === 'missing' ? 'bg-white text-amber-700 shadow-sm font-bold' : 'text-charcoal/60'
            }`}
          >
            Missing ({missingCount})
          </button>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid / Mobile Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Invoices */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-charcoal/70 block uppercase tracking-wider">
            Invoices Queue ({filteredInvoices.length})
          </span>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredInvoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;

              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                    isSelected 
                      ? 'bg-white border-royalemerald ring-2 ring-royalemerald/30 shadow-md'
                      : 'bg-white border-antiquegold/20 hover:border-antiquegold/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-charcoal text-xs">{inv.invoiceNumber}</span>
                    {inv.status === 'matched' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        3-Way Matched
                      </span>
                    )}
                    {inv.status === 'exception_approved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Exception Approved
                      </span>
                    )}
                    {inv.status === 'mismatch_flagged' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>Price/Qty Mismatch</span>
                      </span>
                    )}
                    {inv.status === 'missing_doc' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 flex items-center space-x-1">
                        <FileX className="w-3 h-3 text-amber-700" />
                        <span>Invoice Missing</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-charcoal text-xs">{inv.supplierName}</h4>
                    <span className="text-[11px] text-charcoal/60 font-mono">PO: {inv.poNumber}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-charcoal/60">
                      {inv.invoiceDate ? `Date: ${inv.invoiceDate}` : 'Awaiting Submission'}
                    </span>
                    <span className="font-mono font-bold text-royalemerald">
                      ₹{inv.totalInvoicedAmountINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3-Way Matching View Pane */}
        <div className="lg:col-span-7">
          {selectedInvoice ? (
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-antiquegold/30 shadow-md space-y-6">
              {/* Match Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-antiquegold/20 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-royalemerald" />
                    <h2 className="font-serif font-bold text-lg text-charcoal">
                      3-Way Audit: {selectedInvoice.invoiceNumber}
                    </h2>
                  </div>
                  <p className="text-xs text-charcoal/60 mt-0.5">
                    Supplier: <strong className="text-charcoal">{selectedInvoice.supplierName}</strong> • PO: <strong className="font-mono text-charcoal">{selectedInvoice.poNumber}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-charcoal/60 block">Invoiced Total</span>
                  <span className="font-mono font-bold text-royalemerald text-xl">
                    ₹{selectedInvoice.totalInvoicedAmountINR.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Missing Invoice Warning Banner */}
              {selectedInvoice.status === 'missing_doc' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileX className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">Supplier Invoice Missing Documentation</span>
                      <p>
                        Supplier <strong>{selectedInvoice.supplierName}</strong> has not submitted an invoice for <strong>{selectedInvoice.poNumber}</strong>. Payment release is blocked on missing paperwork.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-3.5 py-1.5 bg-amber-700 text-white rounded-xl font-bold text-xs hover:bg-amber-800 transition"
                  >
                    Upload Tax Invoice on Supplier's Behalf
                  </button>
                </div>
              )}

              {/* 3-Way Document Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Document 1: Purchase Order */}
                <div className="bg-alabaster rounded-xl p-3 border border-antiquegold/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                    <span className="font-bold text-charcoal flex items-center space-x-1">
                      <FileCheck className="w-3.5 h-3.5 text-royalemerald" />
                      <span>1. Purchase Order</span>
                    </span>
                    <span className="font-mono text-[10px] text-charcoal/60">{selectedInvoice.poNumber}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Agreed PO Total:</span>
                      <span className="font-mono font-bold text-charcoal">
                        ₹{(selectedInvoice.matchResult?.poTotalINR || selectedInvoice.totalInvoicedAmountINR).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Agreed Qty:</span>
                      <span className="font-mono text-charcoal">1 Unit</span>
                    </div>
                  </div>
                </div>

                {/* Document 2: Material Receipt Sign-off */}
                <div className="bg-alabaster rounded-xl p-3 border border-antiquegold/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                    <span className="font-bold text-charcoal flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-antiquegold" />
                      <span>2. Site Delivery Sign-off</span>
                    </span>
                    <span className="font-mono text-[10px] text-charcoal/60">
                      {selectedInvoice.matchResult?.receiptId || 'DEL-8821'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Confirmed Qty:</span>
                      <span className="font-mono font-bold text-royalemerald">
                        {selectedInvoice.matchResult?.receiptConfirmedQty || 1} Unit Received
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Inspection Sign-off:</span>
                      <span className="text-emerald-800 font-semibold">Verified Unboxed</span>
                    </div>
                  </div>
                </div>

                {/* Document 3: Supplier Tax Invoice */}
                <div className="bg-alabaster rounded-xl p-3 border border-antiquegold/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                    <span className="font-bold text-charcoal flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-royalemerald" />
                      <span>3. Submitted Invoice</span>
                    </span>
                    <span className="font-mono text-[10px] text-charcoal/60">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Invoiced Amount:</span>
                      <span className="font-mono font-bold text-charcoal">
                        ₹{selectedInvoice.totalInvoicedAmountINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">GST Tax Portion:</span>
                      <span className="font-mono text-charcoal/80">
                        ₹{selectedInvoice.taxAmountINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-charcoal block">Line Item Price & Quantity Comparison</span>

                <div className="overflow-x-auto rounded-xl border border-antiquegold/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-alabaster text-charcoal/70 border-b border-antiquegold/20 text-[11px]">
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-center">PO Price</th>
                        <th className="p-2.5 text-center">Invoiced Price</th>
                        <th className="p-2.5 text-center">Received Qty</th>
                        <th className="p-2.5 text-right">Variance Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.lineItems.map((item) => {
                        const priceDiff = item.invoicedUnitPriceINR - item.poUnitPriceINR;
                        const isMismatch = priceDiff !== 0;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="p-2.5 font-semibold text-charcoal">
                              {item.description}
                              <span className="block text-[10px] font-mono text-charcoal/60">{item.itemCode}</span>
                            </td>
                            <td className="p-2.5 text-center font-mono">
                              ₹{item.poUnitPriceINR.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold">
                              ₹{item.invoicedUnitPriceINR.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 text-center font-mono">{item.receivedQty}</td>
                            <td className="p-2.5 text-right font-bold font-mono">
                              {isMismatch ? (
                                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                  +₹{priceDiff.toLocaleString('en-IN')} Variance
                                </span>
                              ) : (
                                <span className="text-royalemerald bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  0.00 (Pass)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Match Verification Note */}
              {selectedInvoice.matchResult?.discrepancyNote && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                  <span className="font-bold text-charcoal block">Matching Audit Summary:</span>
                  <p className="text-charcoal/80 italic">{selectedInvoice.matchResult.discrepancyNote}</p>
                </div>
              )}

              {/* Approved Exception Note if applicable */}
              {selectedInvoice.approvedExceptionReason && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                  <span className="font-bold block">Approved Mid-Order Price Exception:</span>
                  <p className="italic">"{selectedInvoice.approvedExceptionReason}" (Approved by {selectedInvoice.approvedExceptionBy})</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 gap-3 text-xs">
                <span className="text-charcoal/60">
                  Submission Mode: <strong className="text-charcoal capitalize">{selectedInvoice.submissionMethod.replace('_', ' ')}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  {selectedInvoice.status === 'mismatch_flagged' && (
                    <button
                      onClick={() => setShowExceptionModal(true)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Approve Mid-Order Price Exception</span>
                    </button>
                  )}

                  {(selectedInvoice.status === 'submitted' || selectedInvoice.status === 'exception_approved') && (
                    <button
                      onClick={handleConfirmMatchUnlock}
                      className="px-5 py-2 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl font-bold shadow-md transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-antiquegold" />
                      <span>Confirm 3-Way Match & Unlock Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-antiquegold/20">
              <FileText className="w-12 h-12 text-royalemerald mx-auto opacity-40" />
              <h3 className="font-serif font-bold text-lg text-charcoal">Select an Invoice</h3>
              <p className="text-xs text-charcoal/60">Choose an invoice from the left queue to perform 3-way matching.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Supplier Invoice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <Upload className="w-5 h-5 text-royalemerald" />
                <span>Upload Supplier Tax Invoice</span>
              </h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Purchase Order Number</label>
                <select
                  value={newPoNumber}
                  onChange={(e) => setNewPoNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                >
                  <option value="PO-2026-8801">PO-2026-8801 (Sun Elevators Mfg Co)</option>
                  <option value="PO-2026-8802">PO-2026-8802 (Delta Control Systems)</option>
                  <option value="PO-2026-8803">PO-2026-8803 (Apex Cabin Works)</option>
                  <option value="PO-2026-8804">PO-2026-8804 (Bharat Traction Motors)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Tax Invoice Number</label>
                <input
                  type="text"
                  required
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2026-9901"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal/80 mb-1 block">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceDate}
                    onChange={(e) => setNewInvoiceDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal/80 mb-1 block">Total Invoiced Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newTotalAmount}
                    onChange={(e) => setNewTotalAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-alabaster rounded-xl border border-dashed border-antiquegold/40 text-center space-y-1">
                <FileText className="w-6 h-6 text-antiquegold mx-auto" />
                <span className="text-xs font-semibold text-charcoal block">PDF Tax Invoice Document Attached</span>
                <span className="text-[10px] text-charcoal/60">Simulated Upload: TAX_INVOICE_{newInvoiceNo || 'DOC'}.pdf</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90"
              >
                Submit & Run 3-Way Match
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exception Approval Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-antiquegold" />
                <span>Approve Price Variation Exception</span>
              </h3>
              <button onClick={() => setShowExceptionModal(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal/80">
                You are approving a price variation for <strong>{selectedInvoice?.invoiceNumber}</strong> ({selectedInvoice?.supplierName}).
              </p>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Basis / Justification for Accepting Variation</label>
                <textarea
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Approved agreed raw steel price escalation per addendum contract #ADD-092..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                onClick={() => setShowExceptionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveException}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1"
              >
                <Check className="w-4 h-4 text-antiquegold" />
                <span>Confirm Exception Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
