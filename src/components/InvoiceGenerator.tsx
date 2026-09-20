import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, CheckCircle2, AlertTriangle, 
  Search, Filter, Shield, Eye, Building2, User, RefreshCw,
  Clock, Hash, DollarSign, Calendar, ChevronRight, ArrowLeft,
  FileCheck, ShieldCheck, CornerDownRight, XCircle, Sparkles, Send
} from 'lucide-react';
import { Card, Button } from './Common';
import { User as UserType, Invoice, Payment, Deal } from '../types';
import { DbManager } from '../lib/db';
import { useLanguage } from '../lib/language';

interface InvoiceGeneratorProps {
  user: UserType;
  selectedDealId?: string;
  onNavigateToReceipts?: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ 
  user, 
  selectedDealId,
  onNavigateToReceipts 
}) => {
  const { t, language } = useLanguage(user);
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  
  const [activeTab, setActiveTab] = useState<'list' | 'preview' | 'generate'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Generation Form State
  const [genDealId, setGenDealId] = useState<string>('');
  const [genPaymentId, setGenPaymentId] = useState<string>('');
  const [genType, setGenType] = useState<'Stage Invoice' | 'Consolidated Final Invoice'>('Stage Invoice');
  const [customerGstin, setCustomerGstin] = useState<string>('');

  // Modification / Credit Note State
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [creditNoteReason, setCreditNoteReason] = useState('');
  const [creditNoteAmount, setCreditNoteAmount] = useState<number>(0);
  
  // Superseding Invoice Modal
  const [showReissueModal, setShowReissueModal] = useState(false);
  const [reissueCustomerName, setReissueCustomerName] = useState('');
  const [reissueGstin, setReissueGstin] = useState('');
  const [reissueReason, setReissueReason] = useState('');

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    const invList = DbManager.getInvoices();
    const payList = DbManager.getPayments();
    const dealList = DbManager.getDeals();

    // Filter by customer if customer role
    if (user.role === 'customer') {
      const userDeals = dealList.filter(d => d.customerPhone === user.phone || d.customerName.toLowerCase().includes(user.name.toLowerCase()));
      const userDealIds = userDeals.map(d => d.id);
      const filteredInvoices = invList.filter(i => userDealIds.includes(i.dealId));
      setInvoices(filteredInvoices);
      setDeals(userDeals);
    } else {
      setInvoices(invList);
      setDeals(dealList);
    }
    
    setPayments(payList);

    if (selectedDealId) {
      setGenDealId(selectedDealId);
    } else if (dealList.length > 0) {
      setGenDealId(dealList[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, [user]);

  // Handle invoice generation
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDeal = deals.find(d => d.id === genDealId);
    if (!targetDeal) {
      setNotification({ msg: 'Please select a valid deal.', type: 'error' });
      return;
    }

    let taxable = 0;
    let gst = 0;
    let total = 0;
    let stageName = 'Full Deal Summary';

    if (genType === 'Stage Invoice') {
      const targetPayment = payments.find(p => p.id === genPaymentId);
      if (!targetPayment) {
        setNotification({ msg: 'Please select a payment stage record.', type: 'error' });
        return;
      }
      total = targetPayment.paidAmount || targetPayment.amount;
      taxable = Math.round(total / 1.18);
      gst = total - taxable;
      stageName = targetPayment.stage;
    } else {
      // Consolidated
      const dealPayments = payments.filter(p => p.dealId === genDealId && p.status === 'paid');
      if (dealPayments.length === 0) {
        total = targetDeal.agreedPrice || 375000;
      } else {
        total = dealPayments.reduce((sum, p) => sum + (p.paidAmount || p.amount), 0);
      }
      taxable = Math.round(total / 1.18);
      gst = total - taxable;
    }

    const newInvoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newInvoice: Invoice = {
      id: newInvoiceId,
      dealId: genDealId,
      paymentId: genType === 'Stage Invoice' ? genPaymentId : undefined,
      customerName: targetDeal.customerName,
      customerGstin: customerGstin || targetDeal.customerGstin || 'Unregistered / Retail B2C',
      type: genType,
      stageName,
      taxableValue: taxable,
      gstRate: 18,
      gstAmount: gst,
      totalAmount: total,
      issuedAt: new Date().toISOString()
    };

    DbManager.addInvoice(newInvoice);
    setSelectedInvoice(newInvoice);
    setActiveTab('preview');
    setNotification({ msg: `GST Invoice ${newInvoiceId} successfully generated from verified payment record!`, type: 'success' });
  };

  // Credit Note Creation
  const handleCreateCreditNote = () => {
    if (!selectedInvoice) return;
    if (!creditNoteReason || creditNoteAmount <= 0) {
      setNotification({ msg: 'Please specify reason and a valid credit amount.', type: 'error' });
      return;
    }

    const cnId = `CN-2026-${Math.floor(100 + Math.random() * 900)}`;
    const taxableCN = Math.round(creditNoteAmount / 1.18);
    const gstCN = creditNoteAmount - taxableCN;

    const creditNote: Invoice = {
      id: cnId,
      dealId: selectedInvoice.dealId,
      paymentId: selectedInvoice.paymentId,
      customerName: selectedInvoice.customerName,
      customerGstin: selectedInvoice.customerGstin,
      type: 'Credit Note',
      stageName: `Credit Note against ${selectedInvoice.id} (${creditNoteReason})`,
      taxableValue: taxableCN,
      gstRate: 18,
      gstAmount: gstCN,
      totalAmount: creditNoteAmount,
      issuedAt: new Date().toISOString(),
      originalInvoiceId: selectedInvoice.id
    };

    DbManager.addInvoice(creditNote);
    setShowCreditNoteModal(false);
    setCreditNoteReason('');
    setSelectedInvoice(creditNote);
    setNotification({ msg: `Credit Note ${cnId} successfully issued and linked to Invoice ${selectedInvoice.id}.`, type: 'success' });
  };

  // Reissue Superseding Invoice
  const handleReissueInvoice = () => {
    if (!selectedInvoice) return;
    if (!reissueReason) {
      setNotification({ msg: 'Reason for reissuing is required for GST audit.', type: 'error' });
      return;
    }

    // Mark current as voided
    const updatedOriginal: Invoice = {
      ...selectedInvoice,
      isVoided: true
    };
    DbManager.updateInvoice(updatedOriginal);

    const superId = `INV-2026-REV-${Math.floor(100 + Math.random() * 900)}`;
    const supersedingInvoice: Invoice = {
      id: superId,
      dealId: selectedInvoice.dealId,
      paymentId: selectedInvoice.paymentId,
      customerName: reissueCustomerName || selectedInvoice.customerName,
      customerGstin: reissueGstin || selectedInvoice.customerGstin,
      type: 'Superseding Invoice',
      stageName: `${selectedInvoice.stageName} (Corrected)`,
      taxableValue: selectedInvoice.taxableValue,
      gstRate: 18,
      gstAmount: selectedInvoice.gstAmount,
      totalAmount: selectedInvoice.totalAmount,
      issuedAt: new Date().toISOString(),
      originalInvoiceId: selectedInvoice.id
    };

    DbManager.addInvoice(supersedingInvoice);
    setShowReissueModal(false);
    setSelectedInvoice(supersedingInvoice);
    setNotification({ msg: `Superseding Invoice ${superId} generated. Original ${selectedInvoice.id} marked as Voided.`, type: 'success' });
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.dealId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-royalemerald/10 border-royalemerald/30 text-royalemerald' : 'bg-error/10 border-error/30 text-error'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-warmgray hover:text-charcoal font-mono">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.2)] shadow-diffuse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-antiquegold/10 text-antiquegold text-[10px] font-bold tracking-widest uppercase rounded-full font-mono">
              Module 9 • GST Invoice Engine
            </span>
            <span className="px-2 py-0.5 bg-royalemerald/10 text-royalemerald text-[10px] font-bold rounded-full font-mono">
              100% Tax Compliant
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
            Tax Invoice & Credit Note Generator
          </h1>
          <p className="text-xs text-warmgray mt-1">
            Auto-reconciled GST-compliant billing derived directly from stage milestone payments with immutable audit protection.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant={activeTab === 'list' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('list')}
            className="text-xs py-2 flex-1 md:flex-none"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoices Ledger</span>
          </Button>

          {user.role === 'admin' && (
            <Button
              variant={activeTab === 'generate' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('generate')}
              className="text-xs py-2 flex-1 md:flex-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Issue New GST Invoice</span>
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: INVOICES LEDGER LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-warmgray" />
              <input
                type="text"
                placeholder="Search by invoice #, customer name, deal ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl pl-9 pr-4 py-2 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-warmgray shrink-0" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              >
                <option value="all">All Invoice Types</option>
                <option value="Stage Invoice">Stage Invoices</option>
                <option value="Consolidated Final Invoice">Consolidated Final</option>
                <option value="Credit Note">Credit Notes</option>
                <option value="Superseding Invoice">Superseding / Reissued</option>
              </select>
            </div>
          </div>

          {/* Invoices List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInvoices.length === 0 ? (
              <Card className="p-8 text-center col-span-full space-y-3">
                <FileText className="w-10 h-10 text-warmgray mx-auto" />
                <h3 className="font-serif text-lg font-bold text-charcoal">No Tax Invoices Found</h3>
                <p className="text-xs text-warmgray">No invoice records match your active search or filter constraints.</p>
              </Card>
            ) : (
              filteredInvoices.map(inv => (
                <Card 
                  key={inv.id}
                  className={`p-5 transition-all hover:border-antiquegold/50 relative overflow-hidden ${
                    inv.isVoided ? 'opacity-60 bg-gray-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-charcoal">{inv.id}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider font-mono ${
                          inv.type === 'Credit Note' ? 'bg-amber-100 text-amber-800' :
                          inv.type === 'Superseding Invoice' ? 'bg-purple-100 text-purple-800' :
                          inv.type === 'Consolidated Final Invoice' ? 'bg-royalemerald/15 text-royalemerald' :
                          'bg-antiquegold/10 text-antiquegold'
                        }`}>
                          {inv.type}
                        </span>
                        {inv.isVoided && (
                          <span className="px-2 py-0.5 bg-error/15 text-error text-[9px] font-bold rounded-full font-mono uppercase">
                            VOIDED / SUPERSEDED
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-charcoal mt-1">{inv.customerName}</h4>
                      <p className="text-[10px] text-warmgray font-mono">GSTIN: {inv.customerGstin || 'Unregistered'}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-base font-extrabold text-charcoal">
                        {inv.type === 'Credit Note' ? '-' : ''}₹{inv.totalAmount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-warmgray font-mono">
                        GST (18%): ₹{inv.gstAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] text-xs space-y-1 mb-4">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-warmgray">Milestone / Scope:</span>
                      <span className="font-bold text-charcoal">{inv.stageName || 'Milestone Stage'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-warmgray">Taxable Value:</span>
                      <span className="font-mono text-charcoal">₹{inv.taxableValue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-warmgray">Issued Date:</span>
                      <span className="font-mono text-charcoal">{new Date(inv.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-1 py-1.5 text-xs"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setActiveTab('preview');
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Download PDF</span>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVOICE PREVIEW & OFFICIAL PDF PRINTABLE TEMPLATE */}
      {activeTab === 'preview' && selectedInvoice && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => setActiveTab('list')} className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Invoice Ledger</span>
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => window.print()} className="text-xs">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </Button>
              <Button variant="primary" onClick={() => window.print()} className="text-xs">
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF</span>
              </Button>
            </div>
          </div>

          {/* Tax Invoice Official Paper Template */}
          <Card className="p-6 md:p-10 bg-white border border-[rgba(184,135,61,0.25)] shadow-2xl rounded-3xl max-w-4xl mx-auto space-y-6 relative overflow-hidden print:shadow-none print:border-none print:m-0">
            {/* Header / Brand Details */}
            <div className="border-b border-[rgba(184,135,61,0.2)] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-royalemerald text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                    AIEC
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-charcoal">ALL INDIA ELEVATORS COMPANY</h2>
                    <p className="text-[10px] text-antiquegold font-mono font-bold uppercase tracking-wider">Elevator Engineering & Safety Infrastructure</p>
                  </div>
                </div>
                <p className="text-[10px] text-warmgray pt-2">
                  Headquarters: AIEC Tower, Senapati Bapat Road, Pune, MH 411016 • Phone: +91 98765 43210
                </p>
                <p className="text-[10px] text-charcoal font-mono font-bold">
                  AIEC GSTIN: <span className="text-royalemerald">27AAACA1234F1Z9</span> • PAN: AAACA1234F
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 bg-alabaster p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shrink-0">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono ${
                  selectedInvoice.type === 'Credit Note' ? 'bg-amber-200 text-amber-900' : 'bg-royalemerald/15 text-royalemerald'
                }`}>
                  {selectedInvoice.type === 'Credit Note' ? 'TAX CREDIT NOTE' : 'OFFICIAL TAX INVOICE'}
                </span>
                <p className="font-mono text-base font-extrabold text-charcoal">{selectedInvoice.id}</p>
                <p className="text-[10px] text-warmgray font-mono">
                  Date: {new Date(selectedInvoice.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[10px] text-warmgray font-mono">Deal Ref: {selectedInvoice.dealId}</p>
              </div>
            </div>

            {/* Billed To / Billed From Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-alabaster/60 rounded-2xl border border-[rgba(184,135,61,0.1)] text-xs">
              <div className="space-y-1">
                <p className="text-[10px] text-warmgray uppercase tracking-wider font-mono font-bold">BILLED TO CUSTOMER:</p>
                <p className="font-bold text-sm text-charcoal">{selectedInvoice.customerName}</p>
                <p className="text-warmgray">Registered Site & Billing Address</p>
                <p className="font-mono font-bold text-charcoal pt-1">
                  Customer GSTIN: <span className="text-royalemerald">{selectedInvoice.customerGstin || 'Retail / Unregistered B2C'}</span>
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <p className="text-[10px] text-warmgray uppercase tracking-wider font-mono font-bold">PLACE OF SUPPLY:</p>
                <p className="font-bold text-charcoal">Maharashtra (State Code 27)</p>
                <p className="text-warmgray">GST Rate Applied: CGST (9%) + SGST (9%) = 18%</p>
                <p className="text-[10px] text-royalemerald font-mono font-bold pt-1">Status: Paid & Reconciled</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-[rgba(184,135,61,0.15)] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-alabaster border-b border-[rgba(184,135,61,0.15)] text-[10px] uppercase tracking-wider font-mono text-warmgray">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description / Milestone Stage</th>
                    <th className="p-3 text-right">SAC Code</th>
                    <th className="p-3 text-right">Taxable Value (₹)</th>
                    <th className="p-3 text-right">GST (18%) (₹)</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(184,135,61,0.1)] font-sans">
                  <tr>
                    <td className="p-3 font-mono">01</td>
                    <td className="p-3">
                      <p className="font-bold text-charcoal">{selectedInvoice.stageName || 'Elevator Installation Milestone Stage'}</p>
                      <p className="text-[10px] text-warmgray">Supply and erection of passenger elevator components per contractual SOP schedule.</p>
                    </td>
                    <td className="p-3 text-right font-mono text-warmgray">995468</td>
                    <td className="p-3 text-right font-mono text-charcoal">₹{selectedInvoice.taxableValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono text-charcoal">₹{selectedInvoice.gstAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-mono font-bold text-charcoal">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Calculation Breakdown Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
              <div className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] text-[11px] space-y-1 max-w-xs">
                <p className="font-bold text-charcoal flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-royalemerald" />
                  <span>GST Compliance Ledger Verification</span>
                </p>
                <p className="text-warmgray leading-relaxed">
                  Calculated using statutory GST SAC Code 995468 (Specialized Building Construction Services). Non-editable immutable digital document.
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-warmgray">
                  <span>Taxable Value:</span>
                  <span>₹{selectedInvoice.taxableValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-warmgray">
                  <span>CGST (9%):</span>
                  <span>₹{(selectedInvoice.gstAmount / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-warmgray">
                  <span>SGST (9%):</span>
                  <span>₹{(selectedInvoice.gstAmount / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-[rgba(184,135,61,0.2)] pt-2 flex justify-between font-bold text-sm text-charcoal">
                  <span>Invoice Grand Total:</span>
                  <span className="text-royalemerald">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Stamp & Authorized Signatory */}
            <div className="border-t border-[rgba(184,135,61,0.15)] pt-6 flex justify-between items-end text-xs">
              <div className="space-y-1">
                <p className="text-[10px] text-warmgray uppercase tracking-wider font-mono">SYSTEM QR AUTHENTICATION</p>
                <div className="w-20 h-20 bg-alabaster border border-[rgba(184,135,61,0.2)] rounded-xl flex items-center justify-center p-2 text-center text-[9px] font-mono text-warmgray">
                  [GST QR VERIFIED]
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-[10px] text-warmgray uppercase tracking-wider font-mono">FOR ALL INDIA ELEVATORS COMPANY</p>
                <div className="h-10 border-b border-dashed border-charcoal/30 flex items-end justify-end pb-1 font-serif text-xs italic font-bold text-royalemerald">
                  Mr. Prashant Vasant Wable
                </div>
                <p className="font-bold text-charcoal">Authorized Managing Director</p>
              </div>
            </div>

            {/* Admin Management Actions for Invoice Corrections & Credit Notes */}
            {user.role === 'admin' && !selectedInvoice.isVoided && (
              <div className="pt-6 border-t border-[rgba(184,135,61,0.2)] flex flex-wrap gap-3 print:hidden">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCreditNoteModal(true)} 
                  className="text-xs"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-amber-700" />
                  <span>Issue Credit Note (Partial Refund / Discount)</span>
                </Button>

                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setReissueCustomerName(selectedInvoice.customerName);
                    setReissueGstin(selectedInvoice.customerGstin || '');
                    setShowReissueModal(true);
                  }} 
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-700" />
                  <span>Reissue Superseding Invoice (Name/GSTIN Fix)</span>
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: GENERATE INVOICE FORM (ADMIN) */}
      {activeTab === 'generate' && user.role === 'admin' && (
        <Card className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-antiquegold" />
              <h2 className="font-serif text-xl font-bold text-charcoal">Auto-Generate GST Tax Invoice</h2>
            </div>
            <p className="text-xs text-warmgray">
              Invoice amounts are derived strictly from confirmed payment schedule stage records to prevent numerical drift.
            </p>
          </div>

          <form onSubmit={handleGenerateInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Select Customer Deal *</label>
              <select
                value={genDealId}
                onChange={e => setGenDealId(e.target.value)}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              >
                {deals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.id} • {d.customerName} ({d.siteLocation}) — ₹{d.agreedPrice?.toLocaleString('en-IN') || '3,75,000'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Invoice Generation Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGenType('Stage Invoice')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    genType === 'Stage Invoice'
                      ? 'bg-antiquegold/10 border-antiquegold text-charcoal ring-1 ring-antiquegold'
                      : 'bg-white border-[#e6dfd4] text-warmgray'
                  }`}
                >
                  <p className="font-bold text-charcoal">Stage Invoice</p>
                  <p className="text-[10px] text-warmgray mt-0.5">Bill for a specific milestone stage (e.g. 30% Advance)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setGenType('Consolidated Final Invoice')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    genType === 'Consolidated Final Invoice'
                      ? 'bg-royalemerald/10 border-royalemerald text-charcoal ring-1 ring-royalemerald'
                      : 'bg-white border-[#e6dfd4] text-warmgray'
                  }`}
                >
                  <p className="font-bold text-charcoal">Consolidated Final</p>
                  <p className="text-[10px] text-warmgray mt-0.5">Consolidated summary covering total deal valuation</p>
                </button>
              </div>
            </div>

            {genType === 'Stage Invoice' && (
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Select Payment Stage Record *</label>
                <select
                  value={genPaymentId}
                  onChange={e => setGenPaymentId(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
                >
                  <option value="">-- Choose Payment Stage --</option>
                  {payments.filter(p => p.dealId === genDealId).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.stage} — ₹{p.amount.toLocaleString('en-IN')} [{p.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Customer Business GSTIN (Optional for B2B ITC)</label>
              <input
                type="text"
                placeholder="e.g. 27AABCD1234F1Z1"
                value={customerGstin}
                onChange={e => setCustomerGstin(e.target.value.toUpperCase())}
                className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-4 py-2.5 text-xs font-mono text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
              />
              <p className="text-[10px] text-warmgray mt-1">
                If provided, invoice enables customer to claim Input Tax Credit under statutory GST Rules.
              </p>
            </div>

            <Button variant="emerald" fullWidth type="submit" className="py-3">
              <FileCheck className="w-4 h-4" />
              <span>Generate GST Compliant Invoice</span>
            </Button>
          </form>
        </Card>
      )}

      {/* MODAL 1: CREDIT NOTE CREATION */}
      {showCreditNoteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal">Issue GST Credit Note</h3>
            <p className="text-xs text-warmgray">
              Linked to original invoice <span className="font-mono font-bold text-charcoal">{selectedInvoice.id}</span>. Used for partial refunds, post-invoice discounts, or rate corrections.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Reason for Credit Note *</label>
                <input
                  type="text"
                  placeholder="e.g. Rate adjustment, component credit, or partial refund"
                  value={creditNoteReason}
                  onChange={e => setCreditNoteReason(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Credit Amount Incl. GST (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={creditNoteAmount || ''}
                  onChange={e => setCreditNoteAmount(Number(e.target.value))}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-mono text-charcoal outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowCreditNoteModal(false)}>Cancel</Button>
              <Button variant="emerald" fullWidth onClick={handleCreateCreditNote}>Issue Credit Note</Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 2: REISSUE SUPERSEDING INVOICE */}
      {showReissueModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal">Reissue Superseding Invoice</h3>
            <p className="text-xs text-warmgray">
              Original invoice <span className="font-mono font-bold text-charcoal">{selectedInvoice.id}</span> will be marked as <span className="text-error font-bold">VOIDED</span> in audit trails.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Corrected Customer Name</label>
                <input
                  type="text"
                  value={reissueCustomerName}
                  onChange={e => setReissueCustomerName(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Corrected GSTIN</label>
                <input
                  type="text"
                  value={reissueGstin}
                  onChange={e => setReissueGstin(e.target.value.toUpperCase())}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 font-mono text-xs text-charcoal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Reason for Reissuing (GST Audit Log) *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Spelling correction in customer trade name discovered post-issuance"
                  value={reissueReason}
                  onChange={e => setReissueReason(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl p-2.5 text-xs text-charcoal outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowReissueModal(false)}>Cancel</Button>
              <Button variant="emerald" fullWidth onClick={handleReissueInvoice}>Void & Reissue</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
