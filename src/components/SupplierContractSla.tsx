import React, { useState, useEffect } from 'react';
import { User, SupplierContractSlaRecord, ContractAmendment, Supplier } from '../types';
import { DbManager } from '../lib/db';
import { Card } from './Common';
import { 
  FileText, Shield, Clock, AlertTriangle, CheckCircle2, Calendar, 
  Plus, Edit3, Upload, ExternalLink, RefreshCw, AlertCircle, Building, 
  FileCheck, ShieldAlert, ArrowRight, Lock, Check
} from 'lucide-react';

interface SupplierContractSlaProps {
  user: User;
  onNavigateToPOGenerator?: () => void;
  onNavigateToScorecard?: () => void;
}

export const SupplierContractSla: React.FC<SupplierContractSlaProps> = ({
  user,
  onNavigateToPOGenerator,
  onNavigateToScorecard
}) => {
  const [contracts, setContracts] = useState<SupplierContractSlaRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');

  // New Contract / Edit Contract Modal State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<SupplierContractSlaRecord | null>(null);

  // Form inputs
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formContractTitle, setFormContractTitle] = useState('');
  const [formPaymentTermsDays, setFormPaymentTermsDays] = useState(30);
  const [formPaymentTermsDesc, setFormPaymentTermsDesc] = useState('');
  const [formDeliverySlaDays, setFormDeliverySlaDays] = useState(14);
  const [formQualityStandards, setFormQualityStandards] = useState('');
  const [formWarrantyTerms, setFormWarrantyTerms] = useState('');
  const [formStartDate, setFormStartDate] = useState('2025-09-01');
  const [formExpiryDate, setFormExpiryDate] = useState('2026-08-31');

  // Amendment Modal
  const [isAmendmentModalOpen, setIsAmendmentModalOpen] = useState(false);
  const [amendTitle, setAmendTitle] = useState('');
  const [amendEffectiveDate, setAmendEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [amendSummary, setAmendSummary] = useState('');

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    const list = DbManager.getSupplierContracts();
    const sups = DbManager.getSuppliers();
    setContracts(list);
    setSuppliers(sups);

    if (user.role === 'supplier') {
      const match = list.find(c => c.supplierId === user.supplierId || c.supplierName.toLowerCase().includes(user.name.toLowerCase()));
      if (match) setSelectedContractId(match.id);
      else if (list.length > 0) setSelectedContractId(list[0].id);
    } else {
      if (!selectedContractId && list.length > 0) {
        setSelectedContractId(list[0].id);
      }
    }
  };

  const activeContract = contracts.find(c => c.id === selectedContractId) || contracts[0];

  const handleOpenNewModal = () => {
    setEditingContract(null);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormContractTitle('Master OEM Component & SLA Agreement 2026');
    setFormPaymentTermsDays(30);
    setFormPaymentTermsDesc('20% advance on PO dispatch, 80% Net-30 upon site GRN delivery verification');
    setFormDeliverySlaDays(14);
    setFormQualityStandards('IS 14671 Compliant, ISO 9001 Factory QC, Pre-Dispatch Motor Testing');
    setFormWarrantyTerms('24-Month direct OEM manufacturer warranty pass-through. AIEC acts strictly as orchestrator without direct equipment liability.');
    setFormStartDate('2026-01-01');
    setFormExpiryDate('2027-01-01');
    setIsContractModalOpen(true);
  };

  const handleOpenEditModal = (contract: SupplierContractSlaRecord) => {
    setEditingContract(contract);
    setFormSupplierId(contract.supplierId);
    setFormContractTitle(contract.contractTitle);
    setFormPaymentTermsDays(contract.paymentTermsDays);
    setFormPaymentTermsDesc(contract.paymentTermsDescription);
    setFormDeliverySlaDays(contract.deliverySlaDays);
    setFormQualityStandards(contract.qualityStandardsExpected.join(', '));
    setFormWarrantyTerms(contract.noLiabilityWarrantyTerms);
    setFormStartDate(contract.agreementStartDate);
    setFormExpiryDate(contract.agreementExpiryDate);
    setIsContractModalOpen(true);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === formSupplierId);
    const supName = sup ? sup.name : 'Unknown Supplier';

    const qualityArr = formQualityStandards.split(',').map(s => s.trim()).filter(Boolean);

    // Auto calculate status based on expiry date
    const expiryMs = new Date(formExpiryDate).getTime();
    const nowMs = Date.now();
    const daysUntilExpiry = (expiryMs - nowMs) / (1000 * 60 * 60 * 24);

    let calculatedStatus: SupplierContractSlaRecord['status'] = 'active';
    if (daysUntilExpiry < 0) {
      calculatedStatus = 'lapsed';
    } else if (daysUntilExpiry < 30) {
      calculatedStatus = 'renewal_due';
    }

    if (editingContract) {
      const updated: SupplierContractSlaRecord = {
        ...editingContract,
        supplierId: formSupplierId,
        supplierName: supName,
        contractTitle: formContractTitle,
        status: calculatedStatus,
        paymentTermsDays: formPaymentTermsDays,
        paymentTermsDescription: formPaymentTermsDesc,
        deliverySlaDays: formDeliverySlaDays,
        qualityStandardsExpected: qualityArr,
        noLiabilityWarrantyTerms: formWarrantyTerms,
        agreementStartDate: formStartDate,
        agreementExpiryDate: formExpiryDate
      };
      DbManager.updateSupplierContract(updated);
    } else {
      const created: SupplierContractSlaRecord = {
        id: `contract_${Date.now()}`,
        supplierId: formSupplierId,
        supplierName: supName,
        contractTitle: formContractTitle,
        status: calculatedStatus,
        paymentTermsDays: formPaymentTermsDays,
        paymentTermsDescription: formPaymentTermsDesc,
        deliverySlaDays: formDeliverySlaDays,
        qualityStandardsExpected: qualityArr,
        noLiabilityWarrantyTerms: formWarrantyTerms,
        agreementStartDate: formStartDate,
        agreementExpiryDate: formExpiryDate,
        amendmentHistory: [],
        agreementDocumentUrl: '#',
        lastRenewedAt: new Date().toISOString()
      };
      DbManager.addSupplierContract(created);
    }

    setIsContractModalOpen(false);
  };

  const handleSaveAmendment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContract) return;

    const newAmend: ContractAmendment = {
      id: `amend_${Date.now()}`,
      title: amendTitle.trim(),
      effectiveDate: amendEffectiveDate,
      summary: amendSummary.trim(),
      documentUrl: '#',
      uploadedAt: new Date().toISOString(),
      uploadedBy: `${user.name} (${user.role.toUpperCase()})`
    };

    const updatedContract: SupplierContractSlaRecord = {
      ...activeContract,
      amendmentHistory: [newAmend, ...(activeContract.amendmentHistory || [])]
    };

    DbManager.updateSupplierContract(updatedContract);
    setIsAmendmentModalOpen(false);
    setAmendTitle('');
    setAmendSummary('');
  };

  const handleRenewAgreement = (contract: SupplierContractSlaRecord) => {
    const currentExpiry = new Date(contract.agreementExpiryDate);
    // Extend expiry by 1 year
    currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
    const newExpiryStr = currentExpiry.toISOString().split('T')[0];

    const updated: SupplierContractSlaRecord = {
      ...contract,
      status: 'active',
      agreementExpiryDate: newExpiryStr,
      lastRenewedAt: new Date().toISOString()
    };

    DbManager.updateSupplierContract(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-2xl border border-gold/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-antiquegold bg-antiquegold/10 px-2.5 py-1 rounded-full border border-antiquegold/20">
              Module 10 • Screen 8
            </span>
            <span className="text-xs font-semibold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Commercial & Operational SLA Governance
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal mt-2">
            Supplier Contract & SLA Management
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Binding commercial terms, delivery lead times, payment schedules, and OEM warranty pass-through protection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {user.role === 'admin' && (
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2.5 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Agreement Record
            </button>
          )}

          {user.role === 'admin' && (
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="bg-background border border-gold/20 rounded-xl px-3 py-2.5 text-xs font-bold text-charcoal focus:outline-none focus:border-antiquegold"
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.supplierName} ({c.status.toUpperCase()})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {activeContract ? (
        <>
          {/* Main Contract Card Header */}
          <Card className="p-6 bg-surface border-gold/20 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gold/15 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-antiquegold">
                    {activeContract.id}
                  </span>
                  {activeContract.status === 'active' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-royalemerald/10 text-royalemerald text-xs font-bold border border-royalemerald/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active SLA Agreement
                    </span>
                  )}
                  {activeContract.status === 'renewal_due' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold border border-amber-500/20 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" /> Renewal Due Soon
                    </span>
                  )}
                  {activeContract.status === 'lapsed' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 text-xs font-bold border border-red-500/20 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Agreement Lapsed (PO Lock)
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-serif font-bold text-charcoal mt-1">
                  {activeContract.contractTitle}
                </h2>
                <p className="text-xs text-charcoal/60 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                  Supplier: <span className="font-bold text-charcoal">{activeContract.supplierName}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {user.role === 'admin' && activeContract.status !== 'active' && (
                  <button
                    onClick={() => handleRenewAgreement(activeContract)}
                    className="px-4 py-2 rounded-xl bg-royalemerald text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Extend Agreement (+1 Year)
                  </button>
                )}

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleOpenEditModal(activeContract)}
                    className="px-3 py-2 rounded-xl border border-gold/20 hover:bg-gold/10 text-charcoal text-xs font-semibold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-antiquegold" />
                  </button>
                )}
              </div>
            </div>

            {/* Lapsed Warning Banner */}
            {activeContract.status === 'lapsed' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-800 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block">Agreement Lapsed - New PO Issuance Blocked</span>
                  <p className="mt-0.5">
                    This commercial agreement expired on {activeContract.agreementExpiryDate}. Under AIEC operational rules, new Purchase Orders cannot be issued until a renewed agreement is saved on file. Existing in-flight POs will continue execution under prior terms.
                  </p>
                </div>
              </div>
            )}

            {/* Key Term Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-xl border border-gold/15">
                <span className="text-xs text-charcoal/60 font-semibold block">Delivery SLA Window</span>
                <div className="text-2xl font-mono font-bold text-royalemerald mt-1">
                  {activeContract.deliverySlaDays} Days
                </div>
                <span className="text-[11px] text-charcoal/50 block mt-1">
                  Enforces Delay Risk flags in PO board
                </span>
              </div>

              <div className="p-4 bg-background rounded-xl border border-gold/15">
                <span className="text-xs text-charcoal/60 font-semibold block">Payment Terms Credit</span>
                <div className="text-2xl font-mono font-bold text-antiquegold mt-1">
                  Net {activeContract.paymentTermsDays} Days
                </div>
                <span className="text-[11px] text-charcoal/50 block mt-1">
                  Governs due-date in payment approval
                </span>
              </div>

              <div className="p-4 bg-background rounded-xl border border-gold/15">
                <span className="text-xs text-charcoal/60 font-semibold block">Agreement Validity</span>
                <div className="text-sm font-mono font-bold text-charcoal mt-1">
                  {activeContract.agreementStartDate} to {activeContract.agreementExpiryDate}
                </div>
                <span className="text-[11px] text-charcoal/50 block mt-1">
                  Auto-reminder 30 days before expiry
                </span>
              </div>
            </div>

            {/* Commercial Payment Schedule Description */}
            <div className="p-4 bg-background rounded-xl border border-gold/15 text-xs space-y-1">
              <span className="font-bold text-charcoal uppercase tracking-wider text-[10px] text-antiquegold block">
                Binding Commercial Payment Terms:
              </span>
              <p className="text-charcoal/80 text-sm font-medium">{activeContract.paymentTermsDescription}</p>
            </div>

            {/* Quality Standards Expected */}
            <div className="p-4 bg-background rounded-xl border border-gold/15 text-xs space-y-2">
              <span className="font-bold text-charcoal uppercase tracking-wider text-[10px] text-royalemerald block">
                Mandatory Technical & Quality Standards Expected:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeContract.qualityStandardsExpected.map((std, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-surface rounded-lg border border-gold/10">
                    <CheckCircle2 className="w-4 h-4 text-royalemerald shrink-0" />
                    <span className="font-semibold text-charcoal">{std}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* No-Liability Warranty Pass-Through Protection Clause */}
            <div className="p-4 bg-royalemerald/5 rounded-xl border border-royalemerald/20 text-xs space-y-1">
              <span className="font-bold text-royalemerald uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> AIEC No-Liability OEM Warranty Clause:
              </span>
              <p className="text-charcoal/80 leading-relaxed font-medium">
                {activeContract.noLiabilityWarrantyTerms}
              </p>
            </div>
          </Card>

          {/* Amendments History Timeline */}
          <Card className="p-6 bg-surface border-gold/15 space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  Contract Amendment & Renegotiation Audit Log
                </h3>
                <p className="text-xs text-charcoal/60">
                  Historical record of agreed modifications to SLA windows, pricing structures, or warranty terms.
                </p>
              </div>

              {user.role === 'admin' && (
                <button
                  onClick={() => setIsAmendmentModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Amendment
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(!activeContract.amendmentHistory || activeContract.amendmentHistory.length === 0) ? (
                <p className="text-xs text-charcoal/50 italic py-4 text-center">
                  No subsequent contract amendments recorded. Original master agreement terms remain active.
                </p>
              ) : (
                activeContract.amendmentHistory.map((am) => (
                  <div key={am.id} className="p-4 bg-background rounded-2xl border border-gold/15 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-sm text-charcoal">{am.title}</span>
                      <span className="font-mono text-xs text-royalemerald font-semibold">
                        Effective: {am.effectiveDate}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal/80">{am.summary}</p>

                    <div className="text-[10px] font-mono text-charcoal/50 pt-1 border-t border-gold/10 flex justify-between items-center">
                      <span>Logged by: {am.uploadedBy}</span>
                      <span>Recorded on: {new Date(am.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center text-charcoal/50 bg-surface">
          <FileText className="w-10 h-10 text-antiquegold mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm">No contract SLA record selected</p>
        </Card>
      )}

      {/* Contract Add/Edit Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="p-6 max-w-2xl w-full bg-surface border-gold/30 shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <h3 className="text-base font-serif font-bold text-charcoal">
                {editingContract ? 'Edit Supplier Contract & SLA' : 'Create New Supplier Contract & SLA'}
              </h3>
              <button onClick={() => setIsContractModalOpen(false)} className="text-charcoal/50 hover:text-charcoal p-1">
                <AlertCircle className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Target Supplier</label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Contract Title</label>
                  <input
                    type="text"
                    required
                    value={formContractTitle}
                    onChange={(e) => setFormContractTitle(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Delivery SLA Threshold (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDeliverySlaDays}
                    onChange={(e) => setFormDeliverySlaDays(parseInt(e.target.value))}
                    className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                  <span className="text-[10px] text-charcoal/50">Used by Delay Risk Detector</span>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Payment Credit Terms (Days)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPaymentTermsDays}
                    onChange={(e) => setFormPaymentTermsDays(parseInt(e.target.value))}
                    className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                  <span className="text-[10px] text-charcoal/50">e.g. 30 for Net 30</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Detailed Payment Schedule Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% advance on PO dispatch, 80% Net-30 upon site delivery verification"
                  value={formPaymentTermsDesc}
                  onChange={(e) => setFormPaymentTermsDesc(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Agreement Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Agreement Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Quality Standards Expected (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="IS 14671 Elevator Standard, ISO 9001 Factory Quality, Pre-Dispatch Motor Insulation Test"
                  value={formQualityStandards}
                  onChange={(e) => setFormQualityStandards(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">No-Liability OEM Warranty Pass-Through Clause</label>
                <textarea
                  rows={3}
                  value={formWarrantyTerms}
                  onChange={(e) => setFormWarrantyTerms(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold shadow-sm"
                >
                  Save Agreement Record
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Contract Amendment Modal */}
      {isAmendmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-surface border-gold/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <h3 className="text-base font-serif font-bold text-charcoal">
                Record Contract Amendment
              </h3>
              <button onClick={() => setIsAmendmentModalOpen(false)} className="text-charcoal/50 hover:text-charcoal p-1">
                <AlertCircle className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSaveAmendment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Amendment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Time Window Reduction (18d -> 14d)"
                  value={amendTitle}
                  onChange={(e) => setAmendTitle(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Effective Date</label>
                <input
                  type="date"
                  required
                  value={amendEffectiveDate}
                  onChange={(e) => setAmendEffectiveDate(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Summary of Modification</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Agreed 14-day SLA window upon commissioning of new Chakan Factory Line 2..."
                  value={amendSummary}
                  onChange={(e) => setAmendSummary(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setIsAmendmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold shadow-sm"
                >
                  Log Amendment
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
