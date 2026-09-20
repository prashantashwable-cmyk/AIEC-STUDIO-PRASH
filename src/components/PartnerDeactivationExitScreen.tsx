import React, { useState, useEffect } from 'react';
import {
  User,
  MasterPartnerDirectoryRecord,
  PartnerDeactivationExitRecord,
  PartnerReassignmentAction,
  PartnerFinalSettlement,
  PartnerExitInterviewFeedback
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  UserX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  FileText,
  DollarSign,
  HelpCircle,
  RefreshCw,
  Edit3,
  Lock,
  Send,
  MessageSquare,
  Sparkles,
  Info,
  Building,
  PhoneCall,
  Check,
  ArrowLeft
} from 'lucide-react';

interface PartnerDeactivationExitScreenProps {
  user: User;
  partnerId?: string;
  onNavigateToDirectory?: () => void;
  onBack?: () => void;
}

export const PartnerDeactivationExitScreen: React.FC<PartnerDeactivationExitScreenProps> = ({
  user,
  partnerId,
  onNavigateToDirectory,
  onBack
}) => {
  const [partner, setPartner] = useState<MasterPartnerDirectoryRecord | null>(null);
  const [activePartnersPool, setActivePartnersPool] = useState<MasterPartnerDirectoryRecord[]>([]);
  const [exitRecord, setExitRecord] = useState<PartnerDeactivationExitRecord | null>(null);

  // Exit Form Input State
  const [exitType, setExitType] = useState<PartnerDeactivationExitRecord['exitType']>('voluntary');
  const [exitReason, setExitReason] = useState('');
  const [immediateRevocation, setImmediateRevocation] = useState(false);

  // In-flight Reassignments State
  const [reassignmentActions, setReassignmentActions] = useState<PartnerReassignmentAction[]>([]);
  const [selectedReplacementPartnerId, setSelectedReplacementPartnerId] = useState<Record<string, string>>({});
  const [handoffNotesMap, setHandoffNotesMap] = useState<Record<string, string>>({});

  // Final Settlement State
  const [pendingCommissions, setPendingCommissions] = useState<number>(8500);
  const [retentionHold, setRetentionHold] = useState<number>(0);
  const [damageDeductions, setDamageDeductions] = useState<number>(500);
  const [breakdownNote, setBreakdownNote] = useState('Final milestone payout minus ₹500 safety kit return charge.');
  const [isDisputed, setIsDisputed] = useState(false);
  const [disputeNote, setDisputeNote] = useState('');
  const [payoutRef, setPayoutRef] = useState('');

  // Exit Interview State
  const [satisfactionScore, setSatisfactionScore] = useState<number>(4);
  const [suggestionsNote, setSuggestionsNote] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const list = DbManager.getMasterPartners();
    const activePool = list.filter(p => p.activeStatus === 'active');
    setActivePartnersPool(activePool);

    const targetId = partnerId || (list.length > 0 ? list[0].id : '');
    const foundPartner = list.find(p => p.id === targetId);

    if (foundPartner) {
      setPartner(foundPartner);

      // Check existing exit record
      let existingExit = DbManager.getPartnerExitRecordByPartnerId(foundPartner.id);
      if (!existingExit) {
        // Initialize mock in-flight items based on partner's active counts
        const mockActions: PartnerReassignmentAction[] = [];
        if (foundPartner.activeJobsCount > 0) {
          mockActions.push({
            id: `re_${Date.now()}_1`,
            type: 'job',
            itemId: 'JOB-2026-108',
            itemTitle: `${foundPartner.territoryOrSpecialty} Elevator Installation #2`,
            currentRole: foundPartner.primaryRole,
            status: 'pending'
          });
        }
        if (foundPartner.activeLeadsCount > 0) {
          mockActions.push({
            id: `re_${Date.now()}_2`,
            type: 'lead',
            itemId: 'LEAD-2026-044',
            itemTitle: `Commercial Elevator Shaft Survey Inquiry`,
            currentRole: foundPartner.primaryRole,
            status: 'pending'
          });
        }

        existingExit = {
          id: `exit_${Date.now()}`,
          partnerId: foundPartner.id,
          partnerName: foundPartner.partnerName,
          partnerPhone: foundPartner.partnerPhone,
          roles: foundPartner.roles,
          exitType: 'voluntary',
          exitReason: 'Relocating / voluntary exit',
          involuntaryFlag: false,
          immediateAccessRevocation: false,
          reassignmentActions: mockActions,
          finalSettlement: {
            pendingCommissionsAmount: 8500,
            retentionHoldDeduction: 0,
            damageDeductions: 500,
            netSettlementAmount: 8000,
            calculationBreakdownNote: 'Final milestone payout minus ₹500 safety kit return fee.',
            isDisputed: false,
            settlementStatus: 'calculated'
          },
          status: 'exit_initiated',
          createdDate: new Date().toISOString().split('T')[0]
        };
        DbManager.savePartnerExitRecord(existingExit);
      }

      setExitRecord(existingExit);
      setExitType(existingExit.exitType);
      setExitReason(existingExit.exitReason);
      setImmediateRevocation(existingExit.immediateAccessRevocation);
      setReassignmentActions(existingExit.reassignmentActions || []);

      if (existingExit.finalSettlement) {
        setPendingCommissions(existingExit.finalSettlement.pendingCommissionsAmount);
        setRetentionHold(existingExit.finalSettlement.retentionHoldDeduction);
        setDamageDeductions(existingExit.finalSettlement.damageDeductions);
        setBreakdownNote(existingExit.finalSettlement.calculationBreakdownNote);
        setIsDisputed(existingExit.finalSettlement.isDisputed);
        setDisputeNote(existingExit.finalSettlement.disputeNote || '');
        setPayoutRef(existingExit.finalSettlement.payoutTransactionRef || '');
      }

      if (existingExit.exitInterviewFeedback) {
        setSatisfactionScore(existingExit.exitInterviewFeedback.satisfactionScore || 4);
        setSuggestionsNote(existingExit.exitInterviewFeedback.suggestionsNote || '');
        setWouldRecommend(existingExit.exitInterviewFeedback.wouldRecommendAiec ?? true);
      }
    }
  }, [partnerId]);

  const handleReassignItem = (actionId: string) => {
    const replacementId = selectedReplacementPartnerId[actionId];
    if (!replacementId) {
      alert('Please select an active partner to reassign this item to.');
      return;
    }

    const replacementPartner = activePartnersPool.find(p => p.id === replacementId);
    const notes = handoffNotesMap[actionId] || 'Reassigned during partner offboarding exit flow.';

    const updatedActions = reassignmentActions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          assignedToPartnerId: replacementId,
          assignedToPartnerName: replacementPartner?.partnerName || 'Replacement Partner',
          handoffNotes: notes,
          status: 'reassigned' as const
        };
      }
      return act;
    });

    setReassignmentActions(updatedActions);
  };

  const handleInvoluntaryExitToggle = (type: PartnerDeactivationExitRecord['exitType']) => {
    setExitType(type);
    if (type === 'safety_violation' || type === 'performance_deactivation') {
      setImmediateRevocation(true);
    } else {
      setImmediateRevocation(false);
    }
  };

  const calculateNetSettlement = () => {
    return Math.max(0, pendingCommissions - retentionHold - damageDeductions);
  };

  const handleFinalizeOffboarding = () => {
    if (!partner || !exitRecord) return;

    // Check if any in-flight items are still pending
    const hasPendingReassignments = reassignmentActions.some(a => a.status === 'pending');
    if (hasPendingReassignments && !immediateRevocation) {
      alert('Please reassign all in-flight jobs and leads before completing voluntary offboarding.');
      return;
    }

    setIsSubmitting(true);
    const netAmount = calculateNetSettlement();

    setTimeout(() => {
      const updatedExitRecord: PartnerDeactivationExitRecord = {
        ...exitRecord,
        exitType: exitType,
        exitReason: exitReason || 'Offboarding process completed',
        involuntaryFlag: exitType === 'safety_violation' || exitType === 'performance_deactivation',
        immediateAccessRevocation: immediateRevocation,
        reassignmentActions: reassignmentActions,
        finalSettlement: {
          pendingCommissionsAmount: pendingCommissions,
          retentionHoldDeduction: retentionHold,
          damageDeductions: damageDeductions,
          netSettlementAmount: netAmount,
          calculationBreakdownNote: breakdownNote,
          isDisputed: isDisputed,
          disputeNote: disputeNote,
          settlementStatus: 'paid_and_settled',
          payoutTransactionRef: payoutRef || `UPI/${Date.now()}/SETTLE`,
          settledAt: new Date().toISOString()
        },
        exitInterviewFeedback: {
          satisfactionScore: satisfactionScore,
          reasonsForLeaving: exitReason,
          suggestionsNote: suggestionsNote,
          wouldRecommendAiec: wouldRecommend
        },
        accessRevokedTimestamp: new Date().toISOString(),
        status: 'fully_deactivated'
      };

      DbManager.savePartnerExitRecord(updatedExitRecord);
      setExitRecord(updatedExitRecord);

      // Deactivate partner in directory
      const updatedPartner: MasterPartnerDirectoryRecord = {
        ...partner,
        activeStatus: 'deactivated',
        activeJobsCount: 0,
        activeLeadsCount: 0,
        activePosCount: 0,
        lastActive: new Date().toISOString().split('T')[0]
      };
      DbManager.saveMasterPartner(updatedPartner);
      setPartner(updatedPartner);
      setIsSubmitting(false);
    }, 800);
  };

  const isFullyDeactivated = exitRecord?.status === 'fully_deactivated';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Top Navigation Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2 cursor-pointer"
              >
                ← Back to Partner Directory
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                Partner Offboarding & Exit Screen
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20">
                Formal Exit Flow
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Work handoff, final commission ledger reconciliation, dispute handling, and access revocation.
            </p>
          </div>

          {onNavigateToDirectory && (
            <Button
              onClick={onNavigateToDirectory}
              className="px-3.5 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface)]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>Partner Directory</span>
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        {partner && exitRecord ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Exit Reason, Reassignments & Settlement */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Partner Summary Banner */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[var(--color-text-primary)]">{partner.partnerName}</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    ID: {partner.id} • Phone: {partner.partnerPhone} • Zone: <strong>{partner.zone}</strong>
                  </p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    isFullyDeactivated
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {isFullyDeactivated ? 'Fully Offboarded' : 'Exit Flow Active'}
                  </span>
                </div>
              </Card>

              {/* Step 1: Exit Classification & Reason */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                  <UserX className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    1. Exit Classification & Reason
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'voluntary', label: 'Voluntary Resignation' },
                    { id: 'performance_deactivation', label: 'Performance Offboard' },
                    { id: 'safety_violation', label: 'Safety Violation (Immediate)' },
                    { id: 'administrative', label: 'Administrative / Inactive' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isFullyDeactivated}
                      onClick={() => handleInvoluntaryExitToggle(t.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        exitType === t.id
                          ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {exitType === 'safety_violation' && (
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Immediate Safety Revocation Rule:</strong>
                      <span>Because this exit is classified under severe safety violations (e.g. bypass of safety circuit), access is revoked immediately prior to final settlement resolution.</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Offboarding Justification & Details
                  </label>
                  <textarea
                    rows={3}
                    disabled={isFullyDeactivated}
                    value={exitReason}
                    onChange={e => setExitReason(e.target.value)}
                    placeholder="e.g., Relocating to Satara due to family business..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  />
                </div>
              </Card>

              {/* Step 2: In-Flight Job & Lead Reassignment */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[var(--color-accent-primary)]" />
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      2. In-Flight Work Handoff & Reassignment
                    </h3>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                    {reassignmentActions.filter(a => a.status === 'reassigned').length} / {reassignmentActions.length} Reassigned
                  </span>
                </div>

                {reassignmentActions.length > 0 ? (
                  <div className="space-y-3">
                    {reassignmentActions.map(act => (
                      <div key={act.id} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-[var(--color-text-primary)]">
                            [{act.type.toUpperCase()}] {act.itemTitle} ({act.itemId})
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            act.status === 'reassigned' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          }`}>
                            {act.status}
                          </span>
                        </div>

                        {act.status === 'reassigned' ? (
                          <div className="text-[11px] text-[var(--color-text-secondary)] space-y-0.5 bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                            <div>Assigned To: <strong>{act.assignedToPartnerName}</strong></div>
                            <div>Handoff Notes: <em>"{act.handoffNotes}"</em></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                            <div className="sm:col-span-5">
                              <select
                                value={selectedReplacementPartnerId[act.id] || ''}
                                onChange={e => setSelectedReplacementPartnerId({ ...selectedReplacementPartnerId, [act.id]: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                              >
                                <option value="">Select Replacement Partner</option>
                                {activePartnersPool.filter(p => p.id !== partner.id).map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.partnerName} ({p.primaryRole} - {p.zone})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-5">
                              <input
                                type="text"
                                placeholder="Handoff notes for replacement..."
                                value={handoffNotesMap[act.id] || ''}
                                onChange={e => setHandoffNotesMap({ ...handoffNotesMap, [act.id]: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <Button
                                onClick={() => handleReassignItem(act.id)}
                                className="w-full py-1.5 text-xs bg-[var(--color-accent-primary)] text-white font-bold cursor-pointer"
                              >
                                Reassign
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>No active in-flight jobs or leads require reassignment.</span>
                  </div>
                )}
              </Card>

              {/* Step 3: Final Commission & Settlement Calculation */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      3. Final Settlement & Ledger Reconciliation
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">
                    Ledger Reconciled
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                      Pending Milestone Commissions (₹)
                    </label>
                    <input
                      type="number"
                      disabled={isFullyDeactivated}
                      value={pendingCommissions}
                      onChange={e => setPendingCommissions(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] font-mono font-bold text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                      Retention Hold Deduction (₹)
                    </label>
                    <input
                      type="number"
                      disabled={isFullyDeactivated}
                      value={retentionHold}
                      onChange={e => setRetentionHold(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] font-mono font-bold text-[var(--color-text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                      Damage / Kit Deductions (₹)
                    </label>
                    <input
                      type="number"
                      disabled={isFullyDeactivated}
                      value={damageDeductions}
                      onChange={e => setDamageDeductions(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>

                {/* Net Settlement Banner */}
                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-accent-primary)]/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)] block">Net Final Settlement Payout</span>
                    <span className="text-2xl font-serif font-bold text-[var(--color-accent-primary)]">
                      ₹{calculateNetSettlement().toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-[var(--color-text-secondary)] block">Payout Transaction Ref:</span>
                    <span className="font-mono font-bold text-[var(--color-text-primary)]">
                      {exitRecord.finalSettlement?.payoutTransactionRef || 'UPI/PENDING'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Settlement Calculation Notes
                  </label>
                  <input
                    type="text"
                    disabled={isFullyDeactivated}
                    value={breakdownNote}
                    onChange={e => setBreakdownNote(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  />
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: Exit Interview, Access Revocation & Final Execution */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Access Revocation Card */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>Access Revocation</span>
                  </h3>
                </div>

                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isFullyDeactivated
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {isFullyDeactivated ? <Lock className="w-4 h-4 text-rose-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                    <span>{isFullyDeactivated ? 'Credentials Fully Revoked' : 'Access Active Until Offboarding'}</span>
                  </div>
                  <p className="text-[11px]">
                    {isFullyDeactivated
                      ? `Access revoked at ${exitRecord.accessRevokedTimestamp}. App login and lead dispatch disabled.`
                      : 'Credentials will be revoked upon clicking "Finalize Offboarding & Disburse Settlement".'}
                  </p>
                </div>
              </Card>

              {/* Exit Interview Feedback */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    <span>Exit Feedback & Attrition Insights</span>
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                      Partner Satisfaction Rating (1 - 5)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          disabled={isFullyDeactivated}
                          onClick={() => setSatisfactionScore(star)}
                          className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                            satisfactionScore === star
                              ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                              : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                          }`}
                        >
                          {star}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-secondary)] mb-1">
                      Suggestions / System Feedback
                    </label>
                    <textarea
                      rows={3}
                      disabled={isFullyDeactivated}
                      value={suggestionsNote}
                      onChange={e => setSuggestionsNote(e.target.value)}
                      placeholder="Feedback on SOP guidelines, payouts, or field tools..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      disabled={isFullyDeactivated}
                      checked={wouldRecommend}
                      onChange={e => setWouldRecommend(e.target.checked)}
                      className="rounded text-[var(--color-accent-primary)] focus:ring-0"
                    />
                    <span className="text-xs text-[var(--color-text-primary)] font-medium">
                      Would recommend AIEC network to peer technicians
                    </span>
                  </label>
                </div>
              </Card>

              {/* Final Action Button */}
              {!isFullyDeactivated ? (
                <Button
                  disabled={isSubmitting}
                  onClick={handleFinalizeOffboarding}
                  className="w-full py-3.5 text-xs font-bold bg-rose-600 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-rose-700 transition-all"
                >
                  {isSubmitting ? (
                    <span>Processing Offboarding...</span>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      <span>Finalize Offboarding & Disburse Settlement</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                  <strong className="block font-bold">Offboarding Complete & Settled</strong>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">Partner profile deactivated and final payment recorded.</p>
                </div>
              )}

            </div>

          </div>
        ) : (
          <Card className="p-12 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
            <UserX className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Partner Selected For Offboarding</h3>
          </Card>
        )}
      </div>
    </div>
  );
};
