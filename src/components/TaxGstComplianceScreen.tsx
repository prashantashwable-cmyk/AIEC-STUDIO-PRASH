import React, { useState, useEffect } from 'react';
import { User, TaxGstComplianceRecord, SupplierGstinStatusRecord } from '../types';
import { DbManager } from '../lib/db';
import { 
  FileCheck, AlertTriangle, Download, RefreshCw, CheckCircle2, 
  XCircle, ArrowUpRight, ArrowDownRight, ShieldAlert, Building2, 
  Send, HelpCircle, FileSpreadsheet, ChevronRight, Filter
} from 'lucide-react';
import { Card, Button } from './Common';

interface TaxGstComplianceScreenProps {
  user: User;
  onNavigateToInvoiceMatching?: () => void;
  onNavigateToDisputeResolution?: () => void;
}

export const TaxGstComplianceScreen: React.FC<TaxGstComplianceScreenProps> = ({
  user,
  onNavigateToInvoiceMatching,
  onNavigateToDisputeResolution
}) => {
  const [data, setData] = useState<TaxGstComplianceRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q2 FY 2026-27 (Jul-Sep 2026)');
  const [filterStatus, setFilterStatus] = useState<'all' | 'at_risk' | 'verified'>('all');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [reminderSentMap, setReminderSentMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const compliance = DbManager.getTaxGstCompliance();
      setData(compliance);
      setLoading(false);
    }, 300);
  };

  const handleSendReminder = (supplierId: string, supplierName: string) => {
    setReminderSentMap(prev => ({ ...prev, [supplierId]: true }));
    alert(`GST Compliance Urgent Reminder sent via WhatsApp & Email to ${supplierName}.\nRequesting GSTR-3B filing acknowledgment to safeguard AIEC Input Tax Credit.`);
  };

  const handleHandoverToAccountant = () => {
    if (!data) return;
    const exportedAt = new Date().toLocaleString('en-IN');
    const updated = { ...data, accountantSummaryExportedAt: exportedAt };
    DbManager.updateTaxGstCompliance(updated);
    setData(updated);
    setExportNotice(`GST Reconciliation Package exported for CA filing at ${exportedAt}. Summary downloaded as CSV.`);
    
    // Simulate CSV trigger
    const csvHeader = "Supplier Name,GSTIN,Registered State,Status,Eligible Credit (INR),Jeopardized Credit (INR)\n";
    const csvRows = data.supplierGstinStatuses.map(s => 
      `"${s.supplierName}","${s.gstin}","${s.registeredState}","${s.filingStatus}",${s.eligibleInputCreditINR},${s.jeopardizedCreditINR}`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIEC_GST_Reconciliation_${data.period.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    a.click();
  };

  if (loading || !data) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-black/10 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-black/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-black/5 rounded-2xl"></div>
      </div>
    );
  }

  const filteredSuppliers = data.supplierGstinStatuses.filter(s => {
    if (filterStatus === 'at_risk') return s.complianceAlertFlag || s.filingStatus === 'lapsed_compliance_risk';
    if (filterStatus === 'verified') return s.filingStatus === 'active_verified';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-antiquegold/10 text-antiquegold">
              <FileCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                Tax & GST Compliance Reconciliation
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Input Tax Credit (ITC) reconciliation & vendor GSTIN filing risk monitor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-antiquegold"
          >
            <option value="Q2 FY 2026-27 (Jul-Sep 2026)">Q2 FY 2026-27 (Current)</option>
            <option value="Q1 FY 2026-27 (Apr-Jun 2026)">Q1 FY 2026-27 (Past)</option>
            <option value="Jul 2026">July 2026 (Monthly)</option>
          </select>
          <Button
            variant="outline"
            onClick={loadData}
            title="Refresh GST Data"
            className="p-2.5 rounded-xl text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-antiquegold/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Export Notification */}
      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button 
            onClick={() => setExportNotice(null)}
            className="text-xs text-emerald-700 underline font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Critical Lapsed GSTIN Warning Banner */}
      {data.atRiskInputCreditINR > 0 && (
        <Card className="p-4 sm:p-5 bg-red-500/10 border border-red-500/30 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-600 rounded-xl mt-0.5 sm:mt-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-red-700 dark:text-red-400">
                    Vendor Compliance Risk: ₹{data.atRiskInputCreditINR.toLocaleString('en-IN')} Input Credit At Risk
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white">GSTN Alert</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-3xl">
                  Indian GST law disallows Input Tax Credit if a vendor fails to file their GSTR-3B. Delta Control Systems has not filed July returns, placing ₹67,118 at risk of disallowance.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setFilterStatus('at_risk')}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 whitespace-nowrap shadow-sm"
            >
              Inspect Risk Vendor
            </Button>
          </div>
        </Card>
      )}

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Input GST Credit */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Available Input Credit (ITC)
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
            ₹{data.inputGstCreditAvailableINR.toLocaleString('en-IN')}
          </div>
          <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>CGST + SGST (Intra):</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                ₹{(data.cgstInputINR + data.sgstInputINR).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IGST (Inter-state):</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                ₹{data.igstInputINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Output GST Liability */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Output GST Charged
            </span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">
            ₹{data.outputGstChargedINR.toLocaleString('en-IN')}
          </div>
          <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>CGST (9%):</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                ₹{data.cgstOutputINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%):</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                ₹{data.sgstOutputINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Net Cash GST Payable */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Net Tax Liability
            </span>
            <span className="p-1.5 rounded-lg bg-antiquegold/10 text-antiquegold">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-antiquegold">
            ₹{data.netGstLiabilityINR.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Output Charged minus Input ITC set-off. Net cash outflow to Govt Treasury.
          </p>
        </Card>

        {/* Card 4: Supplier Filing Health */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Supplier GSTIN Health
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">
            {data.supplierGstinStatuses.filter(s => s.filingStatus === 'active_verified').length} / {data.supplierGstinStatuses.length}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>3 Active Verified</span>
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block ml-2"></span>
            <span className="text-red-600 font-semibold">1 Lapsed Risk</span>
          </div>
        </Card>
      </div>

      {/* Main Table / List Section */}
      <Card className="p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
              Supplier GSTIN Verification & Input Credit Breakdown
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Reconciled against 14 procurement tax invoices uploaded during 3-Way Invoice Matching
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className="px-3 py-1.5 text-xs rounded-xl"
            >
              All Vendors ({data.supplierGstinStatuses.length})
            </Button>
            <Button
              variant={filterStatus === 'at_risk' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('at_risk')}
              className="px-3 py-1.5 text-xs rounded-xl border-red-500/30 text-red-600"
            >
              At-Risk ({data.supplierGstinStatuses.filter(s => s.complianceAlertFlag).length})
            </Button>
            <Button
              variant={filterStatus === 'verified' ? 'primary' : 'outline'}
              onClick={() => setFilterStatus('verified')}
              className="px-3 py-1.5 text-xs rounded-xl"
            >
              Verified ({data.supplierGstinStatuses.filter(s => s.filingStatus === 'active_verified').length})
            </Button>
          </div>
        </div>

        {/* Vendor List */}
        <div className="space-y-3">
          {filteredSuppliers.map((supplier) => {
            const isLapsed = supplier.filingStatus === 'lapsed_compliance_risk';
            const reminderSent = reminderSentMap[supplier.supplierId];

            return (
              <div 
                key={supplier.supplierId}
                className={`p-4 rounded-xl border transition-all ${
                  isLapsed 
                    ? 'border-red-500/40 bg-red-500/5' 
                    : 'border-[var(--color-border)] bg-black/5 dark:bg-white/5 hover:border-antiquegold/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Vendor Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-antiquegold" />
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                        {supplier.supplierName}
                      </h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--color-text-secondary)]">
                        GSTIN: {supplier.gstin}
                      </span>
                      {isLapsed ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-700 dark:text-red-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Lapsed Filing
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> GSTN Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                      <span>State: <strong className="text-[var(--color-text-primary)]">{supplier.registeredState}</strong></span>
                      <span>•</span>
                      <span>Last Return: <strong className="text-[var(--color-text-primary)]">{supplier.lastFilingPeriod}</strong></span>
                    </div>

                    {supplier.alertNote && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        {supplier.alertNote}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Numbers & Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[var(--color-border)] pt-3 md:pt-0">
                    <div className="text-left sm:text-right font-mono">
                      {isLapsed ? (
                        <div>
                          <span className="text-xs text-red-600 dark:text-red-400 block font-sans uppercase tracking-wider">
                            Jeopardized ITC
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            ₹{supplier.jeopardizedCreditINR.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-[var(--color-text-secondary)] block font-sans uppercase tracking-wider">
                            Eligible ITC
                          </span>
                          <span className="text-lg font-bold text-emerald-600">
                            ₹{supplier.eligibleInputCreditINR.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isLapsed ? (
                        <Button
                          onClick={() => handleSendReminder(supplier.supplierId, supplier.supplierName)}
                          disabled={reminderSent}
                          className="px-3 py-2 text-xs bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {reminderSent ? 'Notice Sent ✓' : 'Send WhatsApp Notice'}
                        </Button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          ITC Safe ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cross-State vs Within-State Tax Rule Breakdown */}
      <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3">
        <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-antiquegold" />
          Statutory Audit Rules & Tax Treatment Note
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--color-text-secondary)]">
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
            <h4 className="font-bold text-[var(--color-text-primary)]">1. Intra-State Purchases (CGST + SGST)</h4>
            <p>
              Suppliers registered in Maharashtra (State Code 27) supply CGST 9% + SGST 9%. This input credit directly offsets output CGST and SGST liability collected from lift buyers in Maharashtra.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
            <h4 className="font-bold text-[var(--color-text-primary)]">2. Inter-State Purchases (IGST)</h4>
            <p>
              Suppliers outside Maharashtra (e.g., Bharat Traction Motors, Gujarat - State Code 24) supply IGST 18%. Integrated GST credit can be set off against output CGST or SGST per GST council priority rules.
            </p>
          </div>
        </div>
      </Card>

      {/* Sticky Bottom Action Bar for Accountant Handover */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[var(--color-text-secondary)] hidden sm:block">
            <span>Period Status: <strong className="text-[var(--color-text-primary)]">Reconciliation Ready</strong></span>
            {data.accountantSummaryExportedAt && (
              <span className="ml-3 text-emerald-600">• Exported on {data.accountantSummaryExportedAt}</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onNavigateToInvoiceMatching}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold"
            >
              Back to Invoice Matching
            </Button>
            <Button
              onClick={handleHandoverToAccountant}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-antiquegold text-white rounded-xl text-xs font-bold hover:bg-antiquegold/90 shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Handover GST Summary to Accountant / CA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
