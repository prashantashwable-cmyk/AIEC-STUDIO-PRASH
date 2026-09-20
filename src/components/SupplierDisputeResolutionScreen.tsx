import React, { useState, useEffect } from 'react';
import { User, SupplierDisputeRecord, DisputeAuditEntry } from '../types';
import { DbManager } from '../lib/db';
import { 
  AlertOctagon, CheckCircle2, XCircle, Clock, ShieldAlert, 
  FileText, Scale, MessageSquare, ArrowRight, UserCheck, 
  RotateCcw, Sparkles, Filter, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, Button } from './Common';

interface SupplierDisputeResolutionScreenProps {
  user: User;
  onNavigateToPaymentApproval?: () => void;
  onNavigateToPaymentHistory?: () => void;
}

export const SupplierDisputeResolutionScreen: React.FC<SupplierDisputeResolutionScreenProps> = ({
  user,
  onNavigateToPaymentApproval,
  onNavigateToPaymentHistory
}) => {
  const [disputes, setDisputes] = useState<SupplierDisputeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved' | 'high_risk'>('all');
  
  // Resolution modal state
  const [resolutionMode, setResolutionMode] = useState<'supplier_favor' | 'aiec_upheld' | 'partial' | null>(null);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = () => {
    setLoading(true);
    setTimeout(() => {
      const list = DbManager.getSupplierDisputes();
      setDisputes(list);
      if (list.length > 0 && !selectedDisputeId) {
        setSelectedDisputeId(list[0].id);
      }
      setLoading(false);
    }, 300);
  };

  const selectedDispute = disputes.find(d => d.id === selectedDisputeId);

  const handleResolve = (type: 'supplier_favor' | 'aiec_upheld' | 'partial') => {
    if (!selectedDispute) return;
    
    let finalAmount = 0;
    let statusText: SupplierDisputeRecord['status'] = 'resolved_aiec_upheld';
    let actionLabel = 'Upheld AIEC Original Position';

    if (type === 'supplier_favor') {
      finalAmount = selectedDispute.supplierClaimAmountINR;
      statusText = 'resolved_supplier_favor';
      actionLabel = 'Adjusted in Supplier Favor (Full Claim Approved)';
    } else if (type === 'partial') {
      finalAmount = partialAmount;
      statusText = 'resolved_partial_adjustment';
      actionLabel = `Partial Settlement Approved (₹${partialAmount.toLocaleString('en-IN')})`;
    }

    const auditEntry: DisputeAuditEntry = {
      id: 'aud_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: `${user.name} (${user.role.toUpperCase()})`,
      action: actionLabel,
      notes: resolutionNote || 'Resolution finalized via AIEC Dispute Desk.'
    };

    const updated: SupplierDisputeRecord = {
      ...selectedDispute,
      status: statusText,
      resolutionDecisionNote: resolutionNote || actionLabel,
      resolutionAmountINR: finalAmount,
      resolvedBy: user.name,
      resolvedAt: new Date().toISOString(),
      auditTrail: [auditEntry, ...selectedDispute.auditTrail],
      updatedAt: new Date().toISOString()
    };

    DbManager.updateSupplierDispute(updated);
    
    // Also log to Payment History if financial adjustment occurred
    if (type === 'supplier_favor' || type === 'partial') {
      DbManager.addPaymentHistory({
        id: 'hist_adj_' + Date.now(),
        paymentId: 'pay_adj_' + selectedDispute.poId,
        poId: selectedDispute.poId,
        poNumber: selectedDispute.poNumber,
        supplierId: selectedDispute.supplierId,
        supplierName: selectedDispute.supplierName,
        paymentType: 'milestone',
        milestoneTitle: `Dispute Settlement: ${selectedDispute.disputeTitle}`,
        amountINR: finalAmount,
        paymentDate: new Date().toISOString(),
        utrNumber: 'UTI_SETTLE_' + Math.floor(100000 + Math.random() * 900000),
        paymentMethod: 'NEFT',
        linkedInvoiceNo: 'DISPUTE_SETTLE_' + selectedDispute.id.toUpperCase(),
        status: 'completed',
        reconciliationStatus: 'reconciled',
        adjustmentNote: `Settlement via Dispute #${selectedDispute.id}: ${resolutionNote}`
      });
    }

    loadDisputes();
    setResolutionMode(null);
    setResolutionNote('');
    setActionSuccessMsg(`Dispute #${selectedDispute.id} resolved successfully. Downstream payment ledger updated.`);
  };

  const handleReopen = (dispute: SupplierDisputeRecord) => {
    const auditEntry: DisputeAuditEntry = {
      id: 'aud_reopen_' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: `${user.name} (${user.role.toUpperCase()})`,
      action: 'Dispute Reopened',
      notes: 'Escalation reopened due to new site evidence or vendor appeal.'
    };

    const updated: SupplierDisputeRecord = {
      ...dispute,
      status: 'reopened',
      auditTrail: [auditEntry, ...dispute.auditTrail],
      updatedAt: new Date().toISOString()
    };

    DbManager.updateSupplierDispute(updated);
    loadDisputes();
    setActionSuccessMsg(`Dispute #${dispute.id} reopened for further review.`);
  };

  const filteredDisputes = disputes.filter(d => {
    if (filterStatus === 'open') return d.status === 'open_under_review' || d.status === 'reopened';
    if (filterStatus === 'resolved') return d.status.startsWith('resolved');
    if (filterStatus === 'high_risk') return d.relationshipRiskLevel === 'high_threat_order_halt';
    return true;
  });

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-black/10 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-black/5 rounded-2xl"></div>
          <div className="lg:col-span-2 h-96 bg-black/5 rounded-2xl"></div>
        </div>
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
              <Scale className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                Supplier Dispute Resolution Desk
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Fair, auditable vendor discrepancy settlement & relationship risk management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToPaymentApproval && (
            <Button
              variant="outline"
              onClick={onNavigateToPaymentApproval}
              className="px-3 py-2 text-xs rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)]"
            >
              Approval Queue
            </Button>
          )}
          {onNavigateToPaymentHistory && (
            <Button
              variant="outline"
              onClick={onNavigateToPaymentHistory}
              className="px-3 py-2 text-xs rounded-xl border-[var(--color-border)] text-[var(--color-text-primary)]"
            >
              Payment Ledger
            </Button>
          )}
        </div>
      </div>

      {/* Action Success Toast */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMsg(null)}
            className="text-xs text-emerald-700 underline font-semibold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid Layout: Left Queue / Right Dispute Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dispute Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Dispute Queue ({filteredDisputes.length})
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="px-2.5 py-1 text-xs rounded-lg"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('open')}
                className="px-2.5 py-1 text-xs rounded-lg"
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'high_risk' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('high_risk')}
                className="px-2.5 py-1 text-xs rounded-lg border-red-500/30 text-red-600"
              >
                High Risk
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDisputes.length === 0 ? (
              <Card className="p-8 text-center text-[var(--color-text-secondary)] rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold">No disputes matching this filter</p>
                <p className="text-xs mt-1">All vendor claims are settled and up to date.</p>
              </Card>
            ) : (
              filteredDisputes.map(d => {
                const isSelected = d.id === selectedDisputeId;
                const isOpen = d.status === 'open_under_review' || d.status === 'reopened';
                const isHighRisk = d.relationshipRiskLevel === 'high_threat_order_halt';

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDisputeId(d.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-antiquegold bg-antiquegold/10 shadow-md' 
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-antiquegold/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-antiquegold">
                        {d.poNumber}
                      </span>
                      {isOpen ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white">
                          Action Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          Resolved
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">
                      {d.disputeTitle}
                    </h3>

                    <div className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center justify-between">
                      <span>Vendor: <strong className="text-[var(--color-text-primary)]">{d.supplierName}</strong></span>
                      <span className="font-mono text-red-600 font-bold">
                        ₹{d.supplierClaimAmountINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {isHighRisk && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20">
                        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>High Relationship Risk (Dispatch Halt Threat)</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Dispute Evidence & Resolution Actions */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedDispute ? (
            <Card className="p-12 text-center text-[var(--color-text-secondary)] rounded-2xl">
              <Scale className="w-12 h-12 text-antiquegold/40 mx-auto mb-3" />
              <p className="text-base font-bold">Select a dispute from the queue to inspect</p>
            </Card>
          ) : (
            <>
              {/* Dispute Header Card */}
              <Card className="p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono rounded bg-black/10 dark:bg-white/10 text-[var(--color-text-primary)]">
                        DISPUTE #{selectedDispute.id.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-antiquegold/20 text-antiquegold">
                        {selectedDispute.disputeType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
                      {selectedDispute.disputeTitle}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right font-mono">
                    <span className="text-xs text-[var(--color-text-secondary)] block font-sans">
                      Disputed Value
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{selectedDispute.supplierClaimAmountINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Relationship & Vendor Context Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs">
                  <div>
                    <span className="text-[var(--color-text-secondary)] block">Supplier Partner</span>
                    <strong className="text-[var(--color-text-primary)] text-sm">{selectedDispute.supplierName}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)] block">Performance Scorecard</span>
                    <strong className="text-emerald-600 text-sm">★ {selectedDispute.supplierScorecardRating} / 5.0</strong>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)] block">SLA Resolution Due</span>
                    <strong className="text-antiquegold text-sm">{selectedDispute.slaDueDate}</strong>
                  </div>
                </div>

                {/* Side-by-Side Comparison: Supplier Position vs AIEC Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supplier Side */}
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                      <UserCheck className="w-4 h-4" />
                      Supplier's Stated Position
                    </div>
                    <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                      "{selectedDispute.supplierPosition}"
                    </p>
                    <div className="text-xs font-mono font-bold text-red-600 pt-1">
                      Claimed Settlement: ₹{selectedDispute.supplierClaimAmountINR.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* AIEC Evidence Side */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <FileText className="w-4 h-4" />
                      AIEC Evidence & SOP Clause
                    </div>
                    <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                      "{selectedDispute.aiecPosition}"
                    </p>
                    {selectedDispute.aiecEvidenceDocUrl && (
                      <div className="pt-1">
                        <span className="text-xs font-semibold text-antiquegold flex items-center gap-1 cursor-pointer hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Attachment ({selectedDispute.aiecEvidenceDocUrl})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status or Resolution Controls */}
                {selectedDispute.status.startsWith('resolved') ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          Dispute Resolved
                        </h4>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleReopen(selectedDispute)}
                        className="px-3 py-1 text-xs rounded-lg border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reopen Dispute
                      </Button>
                    </div>
                    <p className="text-xs text-[var(--color-text-primary)] font-medium">
                      Note: {selectedDispute.resolutionDecisionNote}
                    </p>
                    <div className="text-xs text-[var(--color-text-secondary)] font-mono">
                      Resolved By: {selectedDispute.resolvedBy} on {new Date(selectedDispute.resolvedAt!).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-[var(--color-border)] bg-black/5 dark:bg-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <Scale className="w-4 h-4 text-antiquegold" />
                      Admin Resolution Decision Desk
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        onClick={() => setResolutionMode('supplier_favor')}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                          resolutionMode === 'supplier_favor'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-emerald-500'
                        }`}
                      >
                        Adjust in Supplier Favor (Full)
                      </Button>

                      <Button
                        onClick={() => setResolutionMode('aiec_upheld')}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                          resolutionMode === 'aiec_upheld'
                            ? 'bg-antiquegold text-white border-antiquegold'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-antiquegold'
                        }`}
                      >
                        Uphold AIEC Original Position
                      </Button>

                      <Button
                        onClick={() => {
                          setResolutionMode('partial');
                          setPartialAmount(Math.round(selectedDispute.supplierClaimAmountINR / 2));
                        }}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                          resolutionMode === 'partial'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-blue-500'
                        }`}
                      >
                        Partial Adjustment
                      </Button>
                    </div>

                    {resolutionMode && (
                      <div className="space-y-3 pt-2 border-t border-[var(--color-border)] animate-fade-in">
                        {resolutionMode === 'partial' && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                              Partial Settlement Amount (INR)
                            </label>
                            <input
                              type="number"
                              value={partialAmount}
                              onChange={(e) => setPartialAmount(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl font-mono text-sm text-[var(--color-text-primary)]"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                            Mandatory Resolution Decision Reason & Accounting Audit Note
                          </label>
                          <textarea
                            rows={2}
                            value={resolutionNote}
                            onChange={(e) => setResolutionNote(e.target.value)}
                            placeholder="Explain the commercial or technical rationale for this decision..."
                            className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-antiquegold"
                          ></textarea>
                        </div>

                        <Button
                          onClick={() => handleResolve(resolutionMode)}
                          className="w-full py-2.5 bg-antiquegold text-white font-bold text-xs rounded-xl hover:bg-antiquegold/90 shadow-md"
                        >
                          Confirm & Apply Settlement to Accounting Ledger
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Trail Log */}
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
                  <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-antiquegold" />
                    Immutable Audit Log ({selectedDispute.auditTrail.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDispute.auditTrail.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono text-[var(--color-text-secondary)]">
                          <strong className="text-[var(--color-text-primary)]">{log.actor}</strong>
                          <span>{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="font-semibold text-antiquegold">{log.action}</div>
                        <p className="text-[var(--color-text-secondary)]">{log.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
