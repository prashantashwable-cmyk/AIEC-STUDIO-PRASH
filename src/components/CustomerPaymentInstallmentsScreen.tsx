import React, { useState } from 'react';
import { 
  DollarSign, ArrowLeft, CheckCircle2, Clock, AlertTriangle, ShieldCheck, 
  CreditCard, Landmark, ChevronRight, FileText, Download, Sparkles, 
  HelpCircle, ExternalLink, RefreshCw, Calculator, Lock
} from 'lucide-react';
import { UserRole, CustomerPaymentInstallment, CustomerProjectSummary } from '../types';
import { DbManager } from '../lib/db';

interface CustomerPaymentInstallmentsScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerPaymentInstallmentsScreen: React.FC<CustomerPaymentInstallmentsScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [projects] = useState<CustomerProjectSummary[]>(() => 
    DbManager.getCustomerProjects(currentUserId)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'proj_royal_001'
  );
  const [installments, setInstallments] = useState<CustomerPaymentInstallment[]>(() => 
    DbManager.getCustomerPaymentInstallments(currentUserId, selectedProjectId)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const totalContractValue = installments.reduce((sum, i) => sum + i.amount, 0);
  const totalPaidAmount = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalDueAmount = installments.filter(i => i.status === 'due').reduce((sum, i) => sum + i.amount, 0);
  const totalUpcomingAmount = installments.filter(i => i.status === 'upcoming').reduce((sum, i) => sum + i.amount, 0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePayNow = (inst: CustomerPaymentInstallment) => {
    if (onNavigateTab) {
      onNavigateTab('OnlinePaymentCheckout', { installmentId: inst.id, amount: inst.amount });
    } else {
      triggerToast(`Redirecting to secure gateway checkout for ₹${inst.amount.toLocaleString()}`);
    }
  };

  const getStatusBadge = (status: CustomerPaymentInstallment['status']) => {
    switch (status) {
      case 'paid':
        return {
          label: currentLanguage === 'hi' ? 'भुगतान पूर्ण' : 'Paid & Confirmed',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
        };
      case 'due':
        return {
          label: currentLanguage === 'hi' ? 'भुगतान देय' : 'Payment Due Now',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
        };
      case 'upcoming':
        return {
          label: currentLanguage === 'hi' ? 'आगामी किश्त' : 'Upcoming Stage',
          bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
        };
      case 'under_reconciliation':
        return {
          label: currentLanguage === 'hi' ? 'सत्यापन जारी' : 'Reconciliation Pending',
          bg: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700'
        };
      case 'disputed':
        return {
          label: currentLanguage === 'hi' ? 'विवादित' : 'Under Review',
          bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'भुगतान एवं किश्तें' : currentLanguage === 'mr' ? 'हप्ते आणि देयके' : 'Payments & Stage Installments'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'चरणबद्ध भुगतान अनुसूची, इतिहास और रसीदें' : 'Milestone schedule, paid receipts & instant online checkout'}
              </p>
            </div>
          </div>

          {/* Project Switcher if Multiple Projects */}
          {projects.length > 1 && (
            <div className="flex items-center space-x-2 bg-[var(--color-bg)] p-1.5 rounded-xl border border-[var(--color-border)] self-start sm:self-auto">
              <select
                value={selectedProjectId}
                onChange={e => {
                  setSelectedProjectId(e.target.value);
                  setInstallments(DbManager.getCustomerPaymentInstallments(currentUserId, e.target.value));
                }}
                className="bg-transparent text-xs font-bold text-[var(--color-text-primary)] focus:outline-none cursor-pointer pr-2"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Total Financial Summary Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)] block">
                PROJECT FINANCIAL STATUS: {activeProject?.projectName}
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
                  Total Value: ₹{totalContractValue.toLocaleString()}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                  (Incl. 18% GST)
                </span>
              </div>
            </div>

            {/* Stage Payment Progress Ring Bar */}
            <div className="flex items-center space-x-4">
              <div className="text-right font-mono">
                <span className="text-xs text-[var(--color-text-secondary)] block">Paid to Date</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{totalPaidAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-[var(--color-border)] hidden sm:block" />
              <div className="text-right font-mono">
                <span className="text-xs text-[var(--color-text-secondary)] block">Remaining</span>
                <span className="text-lg font-bold text-[var(--color-accent-primary)]">
                  ₹{(totalContractValue - totalPaidAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Completion Rail */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span>Installment Payment Progress</span>
              <span className="text-[var(--color-accent-primary)]">
                {Math.round((totalPaidAmount / (totalContractValue || 1)) * 100)}% Settled
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-[var(--color-accent-primary)] rounded-full transition-all duration-500"
                style={{ width: `${Math.round((totalPaidAmount / (totalContractValue || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Due Now Immediate Payment Callout (If Any) */}
        {totalDueAmount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                    Stage 3 Installment Action Required: ₹{totalDueAmount.toLocaleString()}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Mechanical assembly milestone complete. Pay online now to initiate electrical panel dispatch.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const dueInst = installments.find(i => i.status === 'due');
                  if (dueInst) handlePayNow(dueInst);
                }}
                className="px-5 py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Pay ₹{totalDueAmount.toLocaleString()} Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Installment Stage List Rows */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
            <DollarSign className="w-5 h-5 text-[var(--color-accent-primary)]" />
            Stage Payment Schedule ({installments.length})
          </h3>

          <div className="space-y-3">
            {installments.map((inst, index) => {
              const badge = getStatusBadge(inst.status);

              return (
                <div 
                  key={inst.id}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40 rounded-2xl p-4 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-mono font-bold text-xs text-[var(--color-accent-primary)] flex-shrink-0">
                        {inst.percentageShare}%
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
                            {inst.stageCode}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-base text-[var(--color-text-primary)] mt-1">
                          {inst.stageTitle}
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          Trigger: {inst.milestoneTrigger}
                        </p>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center font-mono space-y-1">
                      <span className="text-lg font-bold text-[var(--color-accent-primary)] block">
                        ₹{inst.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] block">
                        {inst.paidDate ? `Paid on ${inst.paidDate}` : `Due by ${inst.dueDate}`}
                      </span>
                    </div>
                  </div>

                  {/* Contextual Action Bar per Installment */}
                  <div className="pt-3 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {inst.status === 'paid' ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                          Ref: {inst.transactionRef} • via {inst.paymentMethod}
                        </span>
                        <button
                          onClick={() => triggerToast(`Downloading tax receipt for ${inst.stageTitle}...`)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-primary)] font-bold rounded-xl hover:border-[var(--color-accent-primary)]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Receipt</span>
                        </button>
                      </div>
                    ) : inst.status === 'due' ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-amber-700 dark:text-amber-300 font-bold">
                          ★ Stage 3 milestone reached & signed off
                        </span>
                        <button
                          onClick={() => handlePayNow(inst)}
                          className="px-4 py-1.5 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl hover:opacity-95 shadow-sm"
                        >
                          Pay ₹{inst.amount.toLocaleString()} Online
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full text-[var(--color-text-secondary)] font-mono">
                        <span>Milestone pending completion</span>
                        {inst.loanOptionEligible && (
                          <span className="text-[var(--color-accent-primary)] font-bold">
                            Eligible for 0% EMI Loan Financing
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proactive Low-Interest Loan Option Box */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Landmark className="w-6 h-6 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                  Explore Elevator Financing & Easy EMI Options
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                  Convert remaining stage installments into flexible 12 to 36-month EMIs through our lending partners (HDFC, Capital First, Axis Bank).
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('LoanApplicationForm');
                else triggerToast('Opening EMI Loan Assistance Portal...');
              }}
              className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculate Loan EMI</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
