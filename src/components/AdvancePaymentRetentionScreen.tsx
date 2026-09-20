import React, { useState, useEffect } from 'react';
import { User, AdvanceExposureRecord, RetentionHoldRecord } from '../types';
import { DbManager } from '../lib/db';
import { 
  ShieldAlert, Clock, CheckCircle2, XCircle, AlertTriangle, 
  Layers, ArrowUpRight, DollarSign, Building2, CheckSquare, 
  Square, RefreshCw, FileText, Lock, Unlock, Download, ChevronRight
} from 'lucide-react';
import { Card, Button } from './Common';

interface AdvancePaymentRetentionScreenProps {
  user: User;
  onNavigateToMilestoneRelease?: (poId?: string) => void;
  onNavigateToDisputeResolution?: () => void;
}

export const AdvancePaymentRetentionScreen: React.FC<AdvancePaymentRetentionScreenProps> = ({
  user,
  onNavigateToMilestoneRelease,
  onNavigateToDisputeResolution
}) => {
  const [activeTab, setActiveTab] = useState<'retentions' | 'advances'>('retentions');
  const [advances, setAdvances] = useState<AdvanceExposureRecord[]>([]);
  const [retentions, setRetentions] = useState<RetentionHoldRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Bulk retention release selection
  const [selectedRetentionIds, setSelectedRetentionIds] = useState<string[]>([]);
  const [bulkActionMsg, setBulkActionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const advList = DbManager.getAdvanceExposures();
      const retList = DbManager.getRetentionHolds();
      setAdvances(advList);
      setRetentions(retList);
      setLoading(false);
    }, 300);
  };

  const totalAdvanceExposureINR = advances.reduce((acc, a) => acc + a.advanceAmountINR, 0);
  const totalRetentionHoldINR = retentions.reduce((acc, r) => acc + r.retentionAmountINR, 0);
  const readyReleaseRetentionINR = retentions
    .filter(r => r.readinessStatus === 'ready_for_release' && !r.hasOpenDispute && !r.hasOpenDamageReport)
    .reduce((acc, r) => acc + r.retentionAmountINR, 0);

  const toggleSelectRetention = (id: string, canSelect: boolean) => {
    if (!canSelect) return;
    setSelectedRetentionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllEligibleRetentions = () => {
    const eligible = retentions
      .filter(r => r.readinessStatus === 'ready_for_release' && !r.hasOpenDispute && !r.hasOpenDamageReport)
      .map(r => r.id);
    setSelectedRetentionIds(eligible);
  };

  const handleBulkRelease = () => {
    if (selectedRetentionIds.length === 0) return;

    // Filter retentions to release
    const eligibleToRelease = retentions.filter(r => 
      selectedRetentionIds.includes(r.id) && 
      r.readinessStatus === 'ready_for_release' && 
      !r.hasOpenDispute && 
      !r.hasOpenDamageReport
    );

    if (eligibleToRelease.length === 0) {
      alert("No selected items are eligible for bulk release.");
      return;
    }

    const releasedTotal = eligibleToRelease.reduce((acc, r) => acc + r.retentionAmountINR, 0);

    // Update retention statuses in storage
    eligibleToRelease.forEach(r => {
      const updated: RetentionHoldRecord = {
        ...r,
        readinessStatus: 'ready_for_release',
        expectedReleaseDate: 'Released Today'
      };
      DbManager.updateRetentionHold(updated);

      // Log to Payment History
      DbManager.addPaymentHistory({
        id: 'hist_ret_rel_' + Date.now() + '_' + Math.floor(Math.random() * 100),
        paymentId: 'pay_ret_' + r.poId,
        poId: r.poId,
        poNumber: r.poNumber,
        supplierId: r.supplierId,
        supplierName: r.supplierName,
        paymentType: 'retention',
        milestoneTitle: '10% Handover & Performance Retention Final Release',
        amountINR: r.retentionAmountINR,
        paymentDate: new Date().toISOString(),
        utrNumber: 'UTI_RET_' + Math.floor(100000 + Math.random() * 900000),
        paymentMethod: 'NEFT',
        linkedInvoiceNo: 'RET_REL_' + r.poNumber,
        status: 'completed',
        reconciliationStatus: 'reconciled'
      });
    });

    setBulkActionMsg(`Batch Retention Release executed for ${eligibleToRelease.length} QC-passed installations (Total: ₹${releasedTotal.toLocaleString('en-IN')}).`);
    setSelectedRetentionIds([]);
    loadData();
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-black/10 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-black/5 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-black/5 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-antiquegold/10 text-antiquegold">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                Advances & Retentions Risk Exposure
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Pre-delivery advance exposure tracking & QC-linked 10% retention holdback releases
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            title="Refresh Exposure"
            className="p-2.5 rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Action Toast */}
      {bulkActionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{bulkActionMsg}</span>
          </div>
          <button 
            onClick={() => setBulkActionMsg(null)}
            className="text-xs text-emerald-700 underline font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Outstanding Advances */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Total Outstanding Advances
          </span>
          <div className="text-2xl font-mono font-bold text-amber-600">
            ₹{totalAdvanceExposureINR.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Money disbursed upfront prior to site delivery. ({advances.length} active dispatches)
          </p>
        </Card>

        {/* Card 2: Total Held Retentions */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Total Held Retention Reserve
          </span>
          <div className="text-2xl font-mono font-bold text-antiquegold">
            ₹{totalRetentionHoldINR.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            10% quality guarantees withheld across {retentions.length} active elevator jobs.
          </p>
        </Card>

        {/* Card 3: Ready for Release */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            QC-Passed Ready to Release
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-600">
            ₹{readyReleaseRetentionINR.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Passed site inspection with 0 open damage reports or vendor disputes.
          </p>
        </Card>
      </div>

      {/* View Selector Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('retentions')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'retentions'
              ? 'border-antiquegold text-antiquegold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Lock className="w-4 h-4" />
          10% Retention Reserves ({retentions.length})
        </button>

        <button
          onClick={() => setActiveTab('advances')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'advances'
              ? 'border-antiquegold text-antiquegold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Advance Capital Exposures ({advances.length})
        </button>
      </div>

      {/* TAB 1: RETENTION HOLDS */}
      {activeTab === 'retentions' && (
        <Card className="p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
                Quality & Handover Linked Retentions
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Money released only when site handover clears Quality Assurance with zero open disputes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={selectAllEligibleRetentions}
                className="px-3 py-1.5 text-xs rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)]"
              >
                Select All QC-Passed
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {retentions.map((ret) => {
              const isEligible = ret.readinessStatus === 'ready_for_release' && !ret.hasOpenDispute && !ret.hasOpenDamageReport;
              const isSelected = selectedRetentionIds.includes(ret.id);
              const isBlocked = ret.readinessStatus === 'blocked_by_rework' || ret.hasOpenDispute;

              return (
                <div
                  key={ret.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isBlocked 
                      ? 'border-red-500/40 bg-red-500/5' 
                      : isSelected 
                        ? 'border-antiquegold bg-antiquegold/10' 
                        : 'border-[var(--color-border)] bg-black/5 dark:bg-white/5 hover:border-antiquegold/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Select Checkbox & Basic Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleSelectRetention(ret.id, isEligible)}
                        disabled={!isEligible}
                        className={`mt-1 p-1 rounded transition-colors ${
                          !isEligible 
                            ? 'text-gray-400 cursor-not-allowed opacity-50' 
                            : isSelected 
                              ? 'text-antiquegold' 
                              : 'text-[var(--color-text-secondary)] hover:text-antiquegold'
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-antiquegold">
                            {ret.poNumber}
                          </span>
                          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                            {ret.supplierName}
                          </h3>
                          {ret.qcInspectionPass ? (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> QC Inspection Pass
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> QC Failed / Rework
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Job: <strong className="text-[var(--color-text-primary)]">{ret.linkedJobTitle}</strong>
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] pt-1">
                          <span>Hold Date: <strong>{ret.holdStartDate}</strong></span>
                          <span>Expected Release: <strong>{ret.expectedReleaseDate}</strong></span>
                        </div>

                        {/* Block Reason Warning */}
                        {ret.hasOpenDispute && (
                          <div className="text-xs text-red-600 font-semibold flex items-center gap-1 pt-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Retention On Hold: Open Supplier Dispute in progress.
                            {onNavigateToDisputeResolution && (
                              <button 
                                onClick={onNavigateToDisputeResolution}
                                className="underline ml-1 font-bold text-red-700"
                              >
                                View Dispute
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount & Direct Trigger Button */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[var(--color-border)] pt-3 md:pt-0">
                      <div className="text-left md:text-right font-mono">
                        <span className="text-xs text-[var(--color-text-secondary)] block font-sans uppercase tracking-wider">
                          Retention Hold (10%)
                        </span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">
                          ₹{ret.retentionAmountINR.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        {isEligible ? (
                          <Button
                            onClick={() => {
                              toggleSelectRetention(ret.id, true);
                              handleBulkRelease();
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Release Hold
                          </Button>
                        ) : (
                          <Button
                            disabled
                            variant="outline"
                            className="px-3 py-1.5 text-xs rounded-xl opacity-60 cursor-not-allowed"
                          >
                            Hold Active
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 2: ADVANCE EXPOSURES */}
      {activeTab === 'advances' && (
        <Card className="p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Advance Capital Exposure & Delivery Aging Monitor
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Tracks upfront order deposit disbursements against expected parts delivery dates
            </p>
          </div>

          <div className="space-y-3">
            {advances.map((adv) => {
              const isOverdue = adv.agingStatus === 'critical_overdue_escalation';

              return (
                <div
                  key={adv.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isOverdue 
                      ? 'border-red-500/40 bg-red-500/5' 
                      : 'border-[var(--color-border)] bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-antiquegold">
                          {adv.poNumber}
                        </span>
                        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                          {adv.supplierName}
                        </h3>
                        {isOverdue ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Overdue ({adv.daysOutstanding} Days Exposure)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> In Transit ({adv.daysOutstanding} Days)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Job: <strong className="text-[var(--color-text-primary)]">{adv.linkedJobTitle}</strong>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] pt-1">
                        <span>Disbursed: <strong>{adv.disbursementDate}</strong></span>
                        <span>•</span>
                        <span>Expected Site Delivery: <strong>{adv.expectedDeliveryDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[var(--color-border)] pt-3 md:pt-0">
                      <div className="text-left md:text-right font-mono">
                        <span className="text-xs text-[var(--color-text-secondary)] block font-sans uppercase tracking-wider">
                          Advance Capital Disbursed
                        </span>
                        <span className="text-xl font-bold text-amber-600">
                          ₹{adv.advanceAmountINR.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {onNavigateToMilestoneRelease && (
                        <Button
                          variant="outline"
                          onClick={() => onNavigateToMilestoneRelease(adv.poId)}
                          className="px-3 py-2 text-xs rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-antiquegold flex items-center gap-1"
                        >
                          View PO Chain <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Sticky Bottom Action Bar for Bulk Retention Release */}
      {activeTab === 'retentions' && selectedRetentionIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[var(--color-text-secondary)]">
              <span>Selected for Release: <strong className="text-[var(--color-text-primary)]">{selectedRetentionIds.length} items</strong></span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setSelectedRetentionIds([])}
                className="px-4 py-2.5 rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold"
              >
                Clear Selection
              </Button>
              <Button
                onClick={handleBulkRelease}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Execute Bulk 10% Retention Release
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
