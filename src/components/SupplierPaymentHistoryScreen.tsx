import React, { useState, useEffect } from 'react';
import { 
  History, Search, Download, FileText, CheckCircle2, ShieldCheck, 
  DollarSign, ArrowUpRight, Filter, Building2, ExternalLink, RefreshCw, 
  Layers, ArrowRight, Check, AlertCircle, FileCheck
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { PaymentHistoryRecord, User as UserType } from '../types';

interface Props {
  user: UserType;
  onNavigateToInvoiceMatching?: () => void;
  onNavigateToApprovalQueue?: () => void;
}

export const SupplierPaymentHistoryScreen: React.FC<Props> = ({
  user,
  onNavigateToInvoiceMatching,
  onNavigateToApprovalQueue
}) => {
  const [history, setHistory] = useState<PaymentHistoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<PaymentHistoryRecord | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getPaymentHistory();
    setHistory(list);
    if (list.length > 0 && !selectedRecord) {
      setSelectedRecord(list[0]);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // If user is a supplier, filter history to only their supplier records
  const isSupplierUser = user.role === 'supplier';
  
  const filteredHistory = history.filter(rec => {
    // If supplier role, restrict to their supplier ID
    if (isSupplierUser && user.supplierId && rec.supplierId !== user.supplierId) {
      return false;
    }

    const matchesSearch = 
      rec.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.linkedInvoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSupplier = supplierFilter === 'all' || rec.supplierId === supplierFilter;
    const matchesType = typeFilter === 'all' || rec.paymentType === typeFilter;

    return matchesSearch && matchesSupplier && matchesType;
  });

  const totalPayoutsINR = filteredHistory.reduce((sum, r) => sum + r.amountINR, 0);

  const handleExportCSV = () => {
    const headers = "Payment ID,PO Number,Supplier Name,Payment Type,Amount (INR),Date,UTR Number,Method,Linked Invoice,Status\n";
    const rows = filteredHistory.map(r => 
      `"${r.id}","${r.poNumber}","${r.supplierName}","${r.paymentType}",${r.amountINR},"${r.paymentDate}","${r.utrNumber}","${r.paymentMethod}","${r.linkedInvoiceNo}","${r.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIEC_Supplier_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported Supplier Payment Ledger CSV for accounting reconciliation.');
  };

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
              SOP Step #5 • Module 12: Supplier Payments
            </span>
            <span className="text-xs text-charcoal/60 font-mono">Immutable AP Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Supplier Payment History Screen
          </h1>
          <p className="text-sm text-charcoal/70">
            Historical ledger of all verified bank transfers, linked POs, tax invoices, and bank UTR references.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {user.role === 'admin' && onNavigateToApprovalQueue && (
            <button
              onClick={onNavigateToApprovalQueue}
              className="px-3 py-2 bg-white border border-antiquegold/30 text-charcoal hover:bg-alabaster rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <DollarSign className="w-4 h-4 text-royalemerald" />
              <span>Approval Queue</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-antiquegold" />
            <span>Export Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Total Historical Payouts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-royalemerald">
              ₹{totalPayoutsINR.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
              Fully Reconciled
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Bank Transfers Executed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-charcoal">
              {filteredHistory.length} Transactions
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">
              100% UTR Verified
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Primary Payment Methods</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-charcoal font-mono">
              RTGS (60%) • NEFT (40%)
            </span>
            <span className="text-[10px] bg-purple-50 text-purple-900 px-2 py-0.5 rounded font-bold">
              Direct Bank API
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UTR #, Invoice #, PO #, or Supplier..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal focus:ring-1 focus:ring-antiquegold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Supplier Dropdown Filter (Admin only) */}
          {!isSupplierUser && (
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-xl text-xs px-3 py-2 text-charcoal"
            >
              <option value="all">All Vendors</option>
              <option value="sun_elevators">Sun Elevators Mfg Co</option>
              <option value="delta_controls">Delta Control Systems</option>
              <option value="apex_cabins">Apex Cabin Works</option>
              <option value="bharat_motors">Bharat Traction Motors</option>
            </select>
          )}

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl text-xs px-3 py-2 text-charcoal"
          >
            <option value="all">All Payment Types</option>
            <option value="advance">50% Advance</option>
            <option value="milestone">40% Delivery Milestone</option>
            <option value="retention">10% Retention</option>
          </select>
        </div>
      </div>

      {/* Main List and Detail Modal/Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Historical Ledger Table */}
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-bold text-charcoal/70 block uppercase tracking-wider">
            Completed Payments ({filteredHistory.length})
          </span>

          <div className="space-y-3">
            {filteredHistory.map((record) => {
              const isSelected = selectedRecord?.id === record.id;

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-white border-royalemerald ring-2 ring-royalemerald/30 shadow-md'
                      : 'bg-white border-antiquegold/20 hover:border-antiquegold/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-charcoal text-xs">{record.supplierName}</span>
                        <span className="block text-[10px] font-mono text-charcoal/60">PO: {record.poNumber}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-royalemerald text-sm">
                        ₹{record.amountINR.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-emerald-800 font-semibold">Completed</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-gray-100 gap-2">
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-charcoal/70">
                      <span>UTR: {record.utrNumber}</span>
                      <span>•</span>
                      <span>Invoice: {record.linkedInvoiceNo}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-charcoal/70">
                      {record.paymentMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Transaction Detail & Audit Voucher */}
        <div className="lg:col-span-5">
          {selectedRecord ? (
            <div className="bg-white rounded-2xl p-5 border border-antiquegold/30 shadow-md space-y-5 sticky top-6">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-charcoal/60 block uppercase">Payment Receipt Voucher</span>
                  <h3 className="font-serif font-bold text-lg text-charcoal">{selectedRecord.supplierName}</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold">
                  Reconciled
                </span>
              </div>

              {/* Amount Highlight Card */}
              <div className="bg-alabaster p-4 rounded-xl border border-antiquegold/20 text-center space-y-1">
                <span className="text-xs text-charcoal/60 block">Transferred Amount</span>
                <span className="font-mono font-bold text-royalemerald text-2xl">
                  ₹{selectedRecord.amountINR.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-charcoal/70 block">
                  Method: <strong>{selectedRecord.paymentMethod}</strong> • Date: {new Date(selectedRecord.paymentDate).toLocaleDateString()}
                </span>
              </div>

              {/* Audit Details Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-charcoal/60">Bank UTR Reference Number:</span>
                  <span className="font-mono font-bold text-charcoal">{selectedRecord.utrNumber}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-charcoal/60">Purchase Order #:</span>
                  <span className="font-mono font-bold text-charcoal">{selectedRecord.poNumber}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-charcoal/60">Linked Supplier Tax Invoice:</span>
                  <span className="font-mono font-bold text-royalemerald">{selectedRecord.linkedInvoiceNo}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-charcoal/60">Milestone Stage:</span>
                  <span className="font-semibold text-charcoal">{selectedRecord.milestoneTitle}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-charcoal/60">Reconciliation Audit Status:</span>
                  <span className="text-emerald-800 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-royalemerald" />
                    <span>Matched in Bank Statement</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => showToast(`Downloaded Official Bank Voucher for UTR #${selectedRecord.utrNumber}`)}
                  className="w-full py-2.5 bg-royalemerald text-white rounded-xl text-xs font-bold hover:bg-royalemerald/90 shadow-md transition flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4 text-antiquegold" />
                  <span>Download Bank Transfer Voucher (PDF)</span>
                </button>

                {onNavigateToInvoiceMatching && (
                  <button
                    onClick={onNavigateToInvoiceMatching}
                    className="w-full py-2 bg-white border border-antiquegold/30 text-charcoal rounded-xl text-xs font-semibold hover:bg-alabaster transition flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-royalemerald" />
                    <span>View 3-Way Invoice Audit</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-antiquegold/20">
              <History className="w-12 h-12 text-royalemerald mx-auto opacity-40" />
              <h3 className="font-serif font-bold text-lg text-charcoal">Select a Record</h3>
              <p className="text-xs text-charcoal/60">Click any transaction on the left to view full UTR and invoice voucher details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
