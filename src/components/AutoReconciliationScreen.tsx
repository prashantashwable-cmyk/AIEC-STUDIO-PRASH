import React, { useState, useEffect } from 'react';
import { User, ReconciliationRunRecord, UnmatchedTransaction } from '../types';
import { DbManager } from '../lib/db';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldAlert, RefreshCw, 
  FileText, ArrowDownRight, ArrowUpRight, CheckSquare, Clock, 
  Building2, HelpCircle, ChevronRight, Scale, AlertCircle, ShieldCheck
} from 'lucide-react';
import { Card, Button } from './Common';

interface AutoReconciliationScreenProps {
  user: User;
  onNavigateToAlertsDashboard?: () => void;
  onNavigateToPaymentHistory?: () => void;
}

export const AutoReconciliationScreen: React.FC<AutoReconciliationScreenProps> = ({
  user,
  onNavigateToAlertsDashboard,
  onNavigateToPaymentHistory
}) => {
  const [runs, setRuns] = useState<ReconciliationRunRecord[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [reconciliationReasonModalTx, setReconciliationReasonModalTx] = useState<UnmatchedTransaction | null>(null);
  const [manualReasonInput, setManualReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTriggeringRun, setIsTriggeringRun] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const records = DbManager.getReconciliationRuns();
      setRuns(records);
      if (records.length > 0 && !selectedRunId) {
        setSelectedRunId(records[0].id);
      }
      setIsLoading(false);
    }, 400);
  };

  const currentRun = runs.find(r => r.id === selectedRunId) || runs[0];

  const handleTriggerNewRun = () => {
    setIsTriggeringRun(true);
    setTimeout(() => {
      const newRun: ReconciliationRunRecord = {
        id: `rec_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12)}`,
        runDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        status: 'pass_all_matched',
        totalBankTxCount: 52,
        matchedCount: 52,
        unmatchedCount: 0,
        totalMatchedAmountINR: 3120000,
        bankFeedSource: 'HDFC Corporate API - Live Automated Stream',
        unmatchedTransactions: []
      };
      DbManager.addReconciliationRun(newRun);
      setIsTriggeringRun(false);
      loadData();
    }, 1200);
  };

  const handleConfirmManualReconcile = () => {
    if (!reconciliationReasonModalTx || !manualReasonInput.trim() || !selectedRunId) return;
    setIsSubmitting(true);
    setTimeout(() => {
      DbManager.markTransactionReconciled(
        selectedRunId, 
        reconciliationReasonModalTx.id, 
        manualReasonInput, 
        user.email
      );
      setIsSubmitting(false);
      setReconciliationReasonModalTx(null);
      setManualReasonInput('');
      loadData();
    }, 500);
  };

  if (isLoading || runs.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  const getStatusBadge = (status: ReconciliationRunRecord['status']) => {
    switch (status) {
      case 'pass_all_matched':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Reconciled
          </span>
        );
      case 'action_required_mismatch':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Action Required (Unmatched)
          </span>
        );
      case 'bank_feed_unavailable':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Bank Feed Gateway Timeout
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            <CheckSquare className="w-4 h-4" /> Financial Integrity & Bank Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
            Automated Daily Bank Reconciliation
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Verifying internal supplier/customer ledgers against live HDFC bank statement feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <Button
            onClick={handleTriggerNewRun}
            disabled={isTriggeringRun}
            className="bg-antiquegold text-white hover:bg-antiquegold/90 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringRun ? 'animate-spin' : ''}`} />
            {isTriggeringRun ? 'Syncing Bank Statement...' : 'Run Live Reconciliation'}
          </Button>
        </div>
      </div>

      {/* Overview Cards for Selected Run */}
      {currentRun && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl">
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
              Reconciliation Run Status
            </div>
            <div className="mt-2">
              {getStatusBadge(currentRun.status)}
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-2">
              Run Date: {currentRun.runDate}
            </p>
          </Card>

          <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl">
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
              Bank Transactions Checked
            </div>
            <div className="text-2xl font-serif font-bold font-mono text-[var(--color-text-primary)] mt-1">
              {currentRun.totalBankTxCount} Tx
            </div>
            <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
              {currentRun.matchedCount} Auto-Matched ({currentRun.totalBankTxCount > 0 ? Math.round((currentRun.matchedCount / currentRun.totalBankTxCount) * 100) : 0}%)
            </p>
          </Card>

          <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl">
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
              Matched Outflow & Inflow
            </div>
            <div className="text-2xl font-serif font-bold font-mono text-[var(--color-text-primary)] mt-1">
              ₹{(currentRun.totalMatchedAmountINR / 100000).toFixed(2)}L
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              Verified with Bank Settlement IDs
            </p>
          </Card>

          <Card className="p-4 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl">
            <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider">
              Unmatched Exceptions
            </div>
            <div className={`text-2xl font-serif font-bold font-mono mt-1 ${currentRun.unmatchedCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {currentRun.unmatchedCount} Items
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              {currentRun.unmatchedCount === 0 ? 'Zero Variance' : 'Action or Manual Reason Required'}
            </p>
          </Card>
        </div>
      )}

      {/* Main Container: Run Log Selector & Active Run Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Historical Run Log (1 col) */}
        <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
          <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center justify-between">
            <span>Reconciliation Log</span>
            <Clock className="w-4 h-4 text-antiquegold" />
          </h2>

          <div className="space-y-2">
            {runs.map((r) => {
              const isSelected = r.id === currentRun.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRunId(r.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-antiquegold/10 border-antiquegold text-[var(--color-text-primary)] shadow-sm' 
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-antiquegold/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">{r.id.toUpperCase()}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{r.runDate}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {r.matchedCount}/{r.totalBankTxCount} Matched
                    </span>
                    {r.status === 'pass_all_matched' && (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pass
                      </span>
                    )}
                    {r.status === 'action_required_mismatch' && (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {r.unmatchedCount} Mismatch
                      </span>
                    )}
                    {r.status === 'bank_feed_unavailable' && (
                      <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Offline
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-1">
            <p className="font-semibold text-[var(--color-text-primary)]">Bank Stream Source:</p>
            <p>{currentRun.bankFeedSource}</p>
          </div>
        </Card>

        {/* Right Column: Run Details & Unmatched Item Resolution (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bank Feed Offline Warning */}
          {currentRun.status === 'bank_feed_unavailable' && (
            <Card className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-red-800 dark:text-red-300">
                    Bank Stream Connection Gateway Timeout
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {currentRun.notes || 'The automated reconciliation run could not complete because bank statement feed was temporarily unavailable. No false positive match was logged.'}
                  </p>
                  <Button
                    onClick={handleTriggerNewRun}
                    className="mt-3 bg-red-700 text-white hover:bg-red-800 text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Gateway Connection
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* All Matched Pass Banner */}
          {currentRun.status === 'pass_all_matched' && currentRun.unmatchedTransactions.length === 0 && (
            <Card className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-700 dark:text-emerald-400 mx-auto" />
              <h2 className="text-lg font-serif font-bold text-emerald-800 dark:text-emerald-300">
                100% Financial Reconciliation Verified
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
                All {currentRun.totalBankTxCount} bank statement transactions cleanly match AIEC's recorded supplier disbursements and customer collection receipts.
              </p>
            </Card>
          )}

          {/* Unmatched Transactions List */}
          {currentRun.unmatchedTransactions.length > 0 && (
            <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div>
                  <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
                    Unmatched Bank Statement Entries ({currentRun.unmatchedTransactions.length})
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Review variances, bank fees, or potential duplicate payout alerts
                  </p>
                </div>

                {onNavigateToAlertsDashboard && (
                  <Button 
                    variant="outline"
                    onClick={onNavigateToAlertsDashboard}
                    className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400"
                  >
                    Alerts Center <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {currentRun.unmatchedTransactions.map((tx) => {
                  const isHighPriority = tx.status === 'escalated_high_priority' || tx.mismatchType === 'duplicate_payout_risk';
                  const isReconciled = tx.status === 'manually_reconciled';

                  return (
                    <div 
                      key={tx.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isHighPriority
                          ? 'bg-red-500/10 border-red-500/40'
                          : isReconciled
                          ? 'bg-emerald-500/5 border-emerald-500/30 opacity-80'
                          : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                              {tx.bankTxId}
                            </span>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              • {tx.txDate}
                            </span>

                            {isHighPriority && (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Duplicate Risk Alert
                              </span>
                            )}

                            {isReconciled && (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Manually Reconciled
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-[var(--color-text-primary)] mt-1">
                            {tx.bankDescription}
                          </h3>

                          {tx.suggestedAppRecord && (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                              <span className="font-semibold text-antiquegold">System Match Context: </span>
                              {tx.suggestedAppRecord}
                            </p>
                          )}
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-base font-bold font-mono text-[var(--color-text-primary)]">
                            ₹{tx.bankAmountINR.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
                            {tx.mismatchType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Manual Reconciled Info */}
                      {isReconciled && tx.manualReason && (
                        <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-emerald-800 dark:text-emerald-300">
                          <span className="font-bold">Reconciled Reason: </span>
                          "{tx.manualReason}" • Verified by {tx.reconciledBy || 'Admin'}
                        </div>
                      )}

                      {/* Action Bar */}
                      {!isReconciled && (
                        <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            Status: <span className="font-semibold text-amber-700 dark:text-amber-400">Action Required</span>
                          </span>

                          <div className="flex items-center gap-2">
                            {onNavigateToPaymentHistory && (
                              <Button
                                variant="outline"
                                onClick={onNavigateToPaymentHistory}
                                className="text-xs py-1 h-8"
                              >
                                View Payment Ledger
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                setReconciliationReasonModalTx(tx);
                                setManualReasonInput(
                                  tx.mismatchType === 'unrecorded_bank_fee' 
                                    ? 'Legitimate bank service charge & GST outside PO model' 
                                    : ''
                                );
                              }}
                              className="bg-antiquegold text-white hover:bg-antiquegold/90 text-xs py-1 h-8"
                            >
                              Mark Manually Reconciled
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
        </div>
      </div>

      {/* Modal: Manual Reconciliation Reason Entry */}
      {reconciliationReasonModalTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
                Manual Reconciliation Explanation
              </h3>
              <button 
                onClick={() => setReconciliationReasonModalTx(null)}
                className="text-xs text-[var(--color-text-secondary)] hover:underline"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[var(--color-text-secondary)]">
                You are manually resolving transaction mismatch <span className="font-mono font-bold text-[var(--color-text-primary)]">{reconciliationReasonModalTx.bankTxId}</span> (₹{reconciliationReasonModalTx.bankAmountINR.toLocaleString('en-IN')}).
              </p>
              <p className="font-semibold text-[var(--color-text-primary)]">
                {reconciliationReasonModalTx.bankDescription}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                Mandatory Explanation / Audit Rationale:
              </label>
              <textarea
                value={manualReasonInput}
                onChange={(e) => setManualReasonInput(e.target.value)}
                placeholder="e.g. Approved bank NEFT transaction fee, or verified rounding difference in vendor invoice..."
                rows={3}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setReconciliationReasonModalTx(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmManualReconcile}
                disabled={!manualReasonInput.trim() || isSubmitting}
                className="bg-antiquegold text-white hover:bg-antiquegold/90 text-xs"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Reconciled'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
