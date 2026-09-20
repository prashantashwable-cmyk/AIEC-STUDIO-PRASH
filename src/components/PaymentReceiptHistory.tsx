import React, { useState, useEffect } from 'react';
import { 
  History, Download, Search, Filter, CheckCircle2, Clock, 
  DollarSign, FileText, ArrowUpRight, ShieldCheck, ChevronRight,
  CreditCard, Landmark, Calendar, Eye, Share2, Sparkles, Building
} from 'lucide-react';
import { Card, Button } from './Common';
import { User, Payment, Deal, Invoice } from '../types';
import { DbManager } from '../lib/db';
import { useLanguage } from '../lib/language';

interface PaymentReceiptHistoryProps {
  user: User;
  onNavigateToInvoice?: (invoiceId?: string) => void;
  onNavigateToCheckout?: () => void;
}

export const PaymentReceiptHistory: React.FC<PaymentReceiptHistoryProps> = ({
  user,
  onNavigateToInvoice,
  onNavigateToCheckout
}) => {
  const { t } = useLanguage(user);
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [selectedDealId, setSelectedDealId] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const loadData = () => {
    const pList = DbManager.getPayments();
    const dList = DbManager.getDeals();
    const iList = DbManager.getInvoices();

    if (user.role === 'customer') {
      const userDeals = dList.filter(d => d.customerPhone === user.phone || d.customerName.toLowerCase().includes(user.name.toLowerCase()));
      const userDealIds = userDeals.map(d => d.id);
      const userPayments = pList.filter(p => userDealIds.includes(p.dealId));
      setPayments(userPayments);
      setDeals(userDeals);
      if (userDeals.length > 0) setSelectedDealId(userDeals[0].id);
    } else {
      setPayments(pList);
      setDeals(dList);
    }
    
    setInvoices(iList);
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, [user]);

  // Compute total deal price, total paid, and running balance remaining
  const activeDeal = deals.find(d => d.id === selectedDealId) || (deals.length > 0 ? deals[0] : null);
  const relevantPayments = payments.filter(p => selectedDealId === 'all' || p.dealId === selectedDealId);

  const totalAgreedPrice = selectedDealId === 'all' 
    ? deals.reduce((sum, d) => sum + (d.agreedPrice || 375000), 0)
    : (activeDeal?.agreedPrice || 375000);

  const confirmedPaidTotal = relevantPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.paidAmount || p.amount), 0);

  const runningBalanceRemaining = Math.max(0, totalAgreedPrice - confirmedPaidTotal);
  const completionPercentage = Math.min(100, Math.round((confirmedPaidTotal / totalAgreedPrice) * 100)) || 0;

  // Filter payments list
  const filteredPayments = relevantPayments.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.referenceNo || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = selectedMethod === 'all' || p.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  // Export Account Statement
  const handleExportStatement = () => {
    const csvHeader = "Receipt ID,Deal ID,Payment Stage,Amount Paid,Payment Method,Reference UTR,Payment Date,Status\n";
    const csvRows = filteredPayments.map(p => 
      `"RCP-${p.id}","${p.dealId}","${p.stage}","${p.paidAmount || p.amount}","${p.paymentMethod || 'Gateway'}","${p.referenceNo || 'PG-REF-OK'}","${p.paidAt || p.dueDate}","${p.status}"`
    ).join("\n");
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIEC_Statement_${selectedDealId}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.2)] shadow-diffuse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-antiquegold/10 text-antiquegold text-[10px] font-bold tracking-widest uppercase rounded-full font-mono">
              Module 9 • Payment Ledger
            </span>
            <span className="px-2 py-0.5 bg-royalemerald/10 text-royalemerald text-[10px] font-bold rounded-full font-mono">
              Live Balance Tracking
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
            Payment Receipts & Account History
          </h1>
          <p className="text-xs text-warmgray mt-1">
            Permanent record of confirmed stage remittances, running balance statements, and downloadable tax receipts.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" onClick={handleExportStatement} className="text-xs py-2 flex-1 md:flex-none">
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement (CSV)</span>
          </Button>
          {onNavigateToCheckout && user.role === 'customer' && runningBalanceRemaining > 0 && (
            <Button variant="emerald" onClick={onNavigateToCheckout} className="text-xs py-2 flex-1 md:flex-none">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Make Stage Payment</span>
            </Button>
          )}
        </div>
      </div>

      {/* Running Financial Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-white border border-[rgba(184,135,61,0.2)] shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-warmgray uppercase tracking-wider font-mono font-bold">Total Agreed Project Value</p>
              <h3 className="font-mono text-2xl font-extrabold text-charcoal mt-1">
                ₹{totalAgreedPrice.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-antiquegold/10 text-antiquegold flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-warmgray mt-3">
            {selectedDealId === 'all' ? `Combined across ${deals.length} active deals` : `Contract deal #${selectedDealId}`}
          </p>
        </Card>

        <Card className="p-6 bg-white border border-[rgba(184,135,61,0.2)] shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-royalemerald uppercase tracking-wider font-mono font-bold">Total Amount Paid To Date</p>
              <h3 className="font-mono text-2xl font-extrabold text-royalemerald mt-1">
                ₹{confirmedPaidTotal.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-royalemerald/10 text-royalemerald flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-warmgray">Paid Progress</span>
              <span className="font-bold text-royalemerald">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-alabaster h-1.5 rounded-full overflow-hidden border border-[rgba(184,135,61,0.1)]">
              <div className="bg-royalemerald h-full rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-[rgba(184,135,61,0.2)] shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-amber-800 uppercase tracking-wider font-mono font-bold">Running Balance Remaining</p>
              <h3 className="font-mono text-2xl font-extrabold text-amber-900 mt-1">
                ₹{runningBalanceRemaining.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-warmgray mt-3">
            {runningBalanceRemaining === 0 ? '🎉 Project Fully Paid in Full' : 'Pending upcoming milestone stage schedules'}
          </p>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-warmgray" />
          <input
            type="text"
            placeholder="Search by receipt ID, UTR ref, milestone stage..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl pl-9 pr-4 py-2 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
          />
        </div>

        {deals.length > 1 && (
          <select
            value={selectedDealId}
            onChange={e => setSelectedDealId(e.target.value)}
            className="bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
          >
            <option value="all">All Customer Deals ({deals.length})</option>
            {deals.map(d => (
              <option key={d.id} value={d.id}>{d.id} • {d.customerName}</option>
            ))}
          </select>
        )}

        <select
          value={selectedMethod}
          onChange={e => setSelectedMethod(e.target.value)}
          className="bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
        >
          <option value="all">All Payment Methods</option>
          <option value="UPI">UPI (Google Pay / PhonePe)</option>
          <option value="NEFT">NEFT / RTGS</option>
          <option value="Cheque">Cheque</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Ascension Line Chronological Payment Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.18)] shadow-diffuse relative overflow-hidden">
        <h3 className="font-serif text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-antiquegold" />
          <span>Chronological Remittance Audit Ledger</span>
        </h3>

        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Clock className="w-8 h-8 text-warmgray mx-auto" />
            <p className="font-bold text-sm text-charcoal">No Payment Records Match Criteria</p>
            <p className="text-xs text-warmgray">Try resetting search parameters or selecting a different deal.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-8">
            {/* The Ascension Line Vertical Gold Rail Motif */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-antiquegold via-royalemerald to-antiquegold/30" />

            {filteredPayments.map((pay, idx) => {
              const matchedInvoice = invoices.find(i => i.paymentId === pay.id || i.dealId === pay.dealId);
              const isPaid = pay.status === 'paid';

              return (
                <div key={pay.id} className="relative group">
                  {/* Ascension Line Rail Indicator Circle */}
                  <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isPaid ? 'bg-royalemerald border-white text-white shadow-xs' : 'bg-white border-antiquegold text-antiquegold'
                  }`}>
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                  </div>

                  <Card className="p-5 bg-white border border-[rgba(184,135,61,0.15)] rounded-2xl hover:border-antiquegold transition-all shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(184,135,61,0.1)] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-charcoal">RCP-{pay.id}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider font-mono ${
                            isPaid ? 'bg-royalemerald/15 text-royalemerald' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pay.status}
                          </span>
                          <span className="text-[10px] text-warmgray font-mono">• Method: {pay.paymentMethod || 'Digital Gateway'}</span>
                        </div>
                        <h4 className="font-bold text-sm text-charcoal mt-1">{pay.stage}</h4>
                        <p className="text-[10px] text-warmgray font-mono">
                          Deal ID: {pay.dealId} {pay.customerName ? `• ${pay.customerName}` : ''}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-mono text-lg font-extrabold text-charcoal">
                          ₹{(pay.paidAmount || pay.amount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-warmgray font-mono">
                          Date: {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : pay.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)]">
                        <span className="text-[10px] text-warmgray block font-mono">Reference / Bank UTR Number:</span>
                        <span className="font-mono font-bold text-charcoal">{pay.referenceNo || 'PG-REF-AIEC-9981'}</span>
                      </div>

                      <div className="p-2.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-warmgray block font-mono">Linked Tax Invoice:</span>
                          <span className="font-mono font-bold text-royalemerald">{matchedInvoice ? matchedInvoice.id : 'Auto-Generated'}</span>
                        </div>
                        {matchedInvoice && onNavigateToInvoice && (
                          <button 
                            onClick={() => onNavigateToInvoice(matchedInvoice.id)}
                            className="text-[10px] font-bold text-antiquegold hover:underline flex items-center gap-0.5"
                          >
                            <span>View GST Invoice</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="secondary"
                        className="py-1.5 text-xs flex-1"
                        onClick={() => {
                          setSelectedReceiptPayment(pay);
                          setShowReceiptModal(true);
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Official Receipt</span>
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OFFICIAL RECEIPT MODAL */}
      {showReceiptModal && selectedReceiptPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="p-6 md:p-8 max-w-lg w-full bg-white rounded-3xl border border-[rgba(184,135,61,0.25)] shadow-2xl space-y-6 relative overflow-hidden">
            <div className="border-b border-[rgba(184,135,61,0.15)] pb-4 flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 bg-royalemerald/15 text-royalemerald text-[10px] font-bold rounded-full font-mono uppercase">
                  OFFICIAL PAYMENT RECEIPT
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal mt-1">ALL INDIA ELEVATORS CO.</h3>
                <p className="text-[10px] text-warmgray font-mono">GSTIN: 27AAACA1234F1Z9 • Pune, MH</p>
              </div>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-warmgray hover:text-charcoal font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-alabaster p-4 rounded-2xl border border-[rgba(184,135,61,0.1)]">
              <div className="flex justify-between">
                <span className="text-warmgray">Receipt Reference #:</span>
                <span className="font-mono font-bold text-charcoal">RCP-{selectedReceiptPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgray">Deal / Project Ref:</span>
                <span className="font-mono font-bold text-charcoal">{selectedReceiptPayment.dealId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgray">Milestone Payment Stage:</span>
                <span className="font-bold text-charcoal">{selectedReceiptPayment.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgray">Payment Method Tag:</span>
                <span className="font-bold text-royalemerald">{selectedReceiptPayment.paymentMethod || 'Digital Gateway'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warmgray">Bank UTR / Transaction Ref:</span>
                <span className="font-mono font-bold text-charcoal">{selectedReceiptPayment.referenceNo || 'PG-REF-AIEC-9981'}</span>
              </div>
              <div className="flex justify-between border-t border-[rgba(184,135,61,0.15)] pt-2 font-bold text-sm">
                <span className="text-charcoal">Amount Confirmed Received:</span>
                <span className="font-mono text-royalemerald">₹{(selectedReceiptPayment.paidAmount || selectedReceiptPayment.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-warmgray pt-2 border-t border-[rgba(184,135,61,0.1)]">
              <span className="flex items-center gap-1 text-royalemerald font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified System Ledger Signature</span>
              </span>
              <button onClick={() => window.print()} className="font-bold text-antiquegold hover:underline">
                Print Official Receipt PDF
              </button>
            </div>

            <Button variant="secondary" fullWidth onClick={() => setShowReceiptModal(false)}>Close</Button>
          </Card>
        </div>
      )}
    </div>
  );
};
