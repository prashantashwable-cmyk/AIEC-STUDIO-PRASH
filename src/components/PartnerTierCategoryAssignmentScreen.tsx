import React, { useState, useEffect } from 'react';
import {
  User,
  PartnerTierAssignmentRecord,
  RecruitmentApplicantRecord
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  User as UserIcon,
  Check,
  TrendingUp,
  History,
  Lock,
  Edit3,
  HelpCircle,
  FileText
} from 'lucide-react';

interface PartnerTierCategoryAssignmentScreenProps {
  user: User;
  partnerId?: string;
  onBack?: () => void;
  onNavigateToDashboard?: () => void;
}

export const PartnerTierCategoryAssignmentScreen: React.FC<PartnerTierCategoryAssignmentScreenProps> = ({
  user,
  partnerId,
  onBack,
  onNavigateToDashboard
}) => {
  const [partnerTier, setPartnerTier] = useState<PartnerTierAssignmentRecord | null>(null);
  const [allPartners, setAllPartners] = useState<PartnerTierAssignmentRecord[]>([]);

  // Edit / Override Tier State
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PartnerTierAssignmentRecord['assignedTier']>('tier_2_silver');
  const [changeReason, setChangeReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('2026-08-15');

  // Judgment Call Hold state
  const [holdActive, setHoldActive] = useState(false);
  const [holdIncidentReason, setHoldIncidentReason] = useState('');

  // Dispute handling state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeResolutionNote, setDisputeResolutionNote] = useState('');

  useEffect(() => {
    const list = DbManager.getPartnerTierAssignments();
    setAllPartners(list);

    const targetId = partnerId || (list.length > 0 ? list[0].id : '');
    const found = list.find(p => p.id === targetId || p.partnerId === targetId);

    if (found) {
      setPartnerTier(found);
      setSelectedTier(found.assignedTier);
      setHoldActive(found.judgmentCallHold?.holdActive || false);
      setHoldIncidentReason(found.judgmentCallHold?.incidentReason || '');
    } else if (list.length > 0) {
      setPartnerTier(list[0]);
      setSelectedTier(list[0].assignedTier);
    }
  }, [partnerId]);

  const handleSelectPartner = (p: PartnerTierAssignmentRecord) => {
    setPartnerTier(p);
    setSelectedTier(p.assignedTier);
    setHoldActive(p.judgmentCallHold?.holdActive || false);
    setHoldIncidentReason(p.judgmentCallHold?.incidentReason || '');
  };

  const tierDetails = {
    tier_1_bronze: {
      name: 'Tier 1 — Bronze Partner',
      multiplier: 1.0,
      paymentTerms: 'Net-7 Weekly Payout Cycle',
      autonomy: 'Requires mandatory direct supervisor signoff on all jobs',
      color: 'border-amber-600/40 text-amber-700 bg-amber-500/10'
    },
    tier_2_silver: {
      name: 'Tier 2 — Silver Partner',
      multiplier: 1.05,
      paymentTerms: 'Net-3 Bi-Weekly Payout Batch',
      autonomy: 'Standard signoff with sample QC audit (1 in 5 jobs)',
      color: 'border-slate-400 text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
    },
    tier_3_gold: {
      name: 'Tier 3 — Gold Partner',
      multiplier: 1.15,
      paymentTerms: 'Immediate Net-0 Payout on QC Signoff',
      autonomy: 'Independent Signoff up to ₹2,00,000 project value',
      color: 'border-amber-400 text-amber-600 bg-amber-400/10'
    },
    tier_4_master: {
      name: 'Tier 4 — Master Partner',
      multiplier: 1.25,
      paymentTerms: 'Instant Automated Disbursement + Priority Dispatches',
      autonomy: 'Unrestricted Lead Tech & Audit Authority',
      color: 'border-emerald-500 text-emerald-600 bg-emerald-500/10'
    }
  };

  const handleSaveTierChange = () => {
    if (!partnerTier) return;

    const tDet = tierDetails[selectedTier];
    const newHistoryItem = {
      id: `hist_${Date.now()}`,
      fromTier: partnerTier.assignedTier,
      toTier: selectedTier,
      effectiveDate: effectiveDate,
      reason: changeReason || 'Routine performance review tier promotion',
      assignedBy: user.name || 'Admin'
    };

    const updated: PartnerTierAssignmentRecord = {
      ...partnerTier,
      assignedTier: selectedTier,
      tierDefaults: {
        commissionRateMultiplier: tDet.multiplier,
        paymentTerms: tDet.paymentTerms,
        autonomyLevel: tDet.autonomy
      },
      changeHistory: [newHistoryItem, ...(partnerTier.changeHistory || [])],
      effectiveDate: effectiveDate,
      lastUpdated: new Date().toISOString()
    };

    DbManager.savePartnerTierAssignment(updated);
    setPartnerTier(updated);
    setShowTierModal(false);
  };

  const handleToggleJudgmentHold = () => {
    if (!partnerTier) return;
    const nextHoldState = !holdActive;
    setHoldActive(nextHoldState);

    const updated: PartnerTierAssignmentRecord = {
      ...partnerTier,
      judgmentCallHold: {
        holdActive: nextHoldState,
        incidentReason: holdIncidentReason || 'Recent safety or QC incident investigation hold.',
        investigationStatus: nextHoldState ? 'Under Active Admin Review' : 'Resolved & Cleared'
      },
      lastUpdated: new Date().toISOString()
    };

    DbManager.savePartnerTierAssignment(updated);
    setPartnerTier(updated);
  };

  const handleResolveDispute = () => {
    if (!partnerTier) return;

    const updated: PartnerTierAssignmentRecord = {
      ...partnerTier,
      disputeStatus: {
        hasDispute: false,
        partnerNote: partnerTier.disputeStatus?.partnerNote,
        resolutionNote: disputeResolutionNote || 'Admin reviewed criteria and explained tier assignment rationale.'
      },
      lastUpdated: new Date().toISOString()
    };

    DbManager.savePartnerTierAssignment(updated);
    setPartnerTier(updated);
    setShowDisputeModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2 cursor-pointer"
              >
                ← Back to Recruitment Overview
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                Partner Tier & Category Assignment
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Downstream Rules Engine
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Skill & trust tiers determining commission multipliers, payment terms, and job dispatch autonomy.
            </p>
          </div>

          {onNavigateToDashboard && (
            <Button
              onClick={onNavigateToDashboard}
              className="px-3 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Funnel Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        
        {/* Partner Selector Bar */}
        <Card className="p-4 mb-6 border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase shrink-0">Select Partner:</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {allPartners.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPartner(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    partnerTier?.id === p.id
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                  }`}
                >
                  {p.partnerName} ({p.role[0].toUpperCase()})
                </button>
              ))}
            </div>
          </div>
        </Card>

        {partnerTier ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: Current Tier & Downstream Defaults */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                      {partnerTier.partnerName}
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Role: <strong className="uppercase text-[var(--color-accent-primary)]">{partnerTier.role}</strong>
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-[var(--color-accent-primary)]" />
                </div>

                {/* Current Tier Badge */}
                <div className={`p-4 rounded-xl border ${tierDetails[partnerTier.assignedTier].color} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">Assigned Tier</span>
                    <span className="text-[10px] font-mono">Effective: {partnerTier.effectiveDate}</span>
                  </div>
                  <div className="text-lg font-serif font-bold">
                    {tierDetails[partnerTier.assignedTier].name}
                  </div>
                </div>

                {/* Downstream Effects Configuration */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)] block">
                    Downstream System Config
                  </span>

                  <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1">
                    <span className="text-[var(--color-text-secondary)] text-[10px] uppercase font-semibold">Commission Multiplier:</span>
                    <div className="text-sm font-serif font-bold text-[var(--color-accent-primary)]">
                      {partnerTier.tierDefaults.commissionRateMultiplier}x Base Rate
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1">
                    <span className="text-[var(--color-text-secondary)] text-[10px] uppercase font-semibold">Payment Disbursement Terms:</span>
                    <div className="font-semibold text-[var(--color-text-primary)]">
                      {partnerTier.tierDefaults.paymentTerms}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1">
                    <span className="text-[var(--color-text-secondary)] text-[10px] uppercase font-semibold">Dispatch Autonomy Level:</span>
                    <div className="font-semibold text-[var(--color-text-primary)]">
                      {partnerTier.tierDefaults.autonomyLevel}
                    </div>
                  </div>
                </div>

                {/* Admin Hold Banner if active */}
                {holdActive && (
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Judgment Call Promotion Hold Active</span>
                    </div>
                    <p className="text-[11px]">{holdIncidentReason || 'Under active QC investigation.'}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => setShowTierModal(true)}
                    className="w-full py-2.5 text-xs font-bold bg-[var(--color-accent-primary)] text-white shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Update / Promote Tier</span>
                  </Button>

                  <Button
                    onClick={handleToggleJudgmentHold}
                    className={`w-full py-2 text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer ${
                      holdActive
                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        : 'bg-[var(--color-bg)] text-[var(--color-text-primary)] border-[var(--color-border)]'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{holdActive ? 'Clear Incident Hold' : 'Place Incident Hold'}</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* RIGHT: Explicit Criteria Breakdown & Tier Audit History */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Explicit Criteria Matrix */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    <span>Transparent Tier Evaluation Criteria</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">Verified Metrics</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase block">Completed Jobs</span>
                    <span className="text-lg font-serif font-bold text-[var(--color-text-primary)] mt-0.5 block">
                      {partnerTier.criteriaMet.jobsCompletedCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase block">Safety Rating</span>
                    <span className="text-lg font-serif font-bold text-emerald-600 mt-0.5 block">
                      {partnerTier.criteriaMet.safetyRating}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase block">SLA Compliance</span>
                    <span className="text-lg font-serif font-bold text-[var(--color-accent-primary)] mt-0.5 block">
                      {partnerTier.criteriaMet.slaCompliancePercent}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase block">Trade Experience</span>
                    <span className="text-lg font-serif font-bold text-[var(--color-text-primary)] mt-0.5 block">
                      {partnerTier.criteriaMet.yearsInTrade} yrs
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center sm:col-span-2">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase block">Verified Certifications</span>
                    <span className="text-xs font-bold text-[var(--color-text-primary)] mt-1 block">
                      {partnerTier.criteriaMet.certificationsVerifiedCount} Trade Certs Verified
                    </span>
                  </div>
                </div>
              </Card>

              {/* Tier Audit History Trail */}
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <History className="w-4 h-4 text-[var(--color-accent-secondary)]" />
                    <span>Tier Change Audit Log</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {(partnerTier.changeHistory || []).length > 0 ? (
                    partnerTier.changeHistory.map(hist => (
                      <div key={hist.id} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[var(--color-text-primary)]">
                            {hist.fromTier.replace('_', ' ').toUpperCase()} → <strong className="text-[var(--color-accent-primary)]">{hist.toTier.replace('_', ' ').toUpperCase()}</strong>
                          </span>
                          <span className="text-[10px] text-[var(--color-text-secondary)]">{hist.effectiveDate}</span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-secondary)] italic">
                          "{hist.reason}"
                        </p>
                        <div className="text-[10px] text-[var(--color-text-secondary)]">
                          Authorized by: <strong>{hist.assignedBy}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-[var(--color-text-secondary)]">
                      No prior tier modifications logged.
                    </div>
                  )}
                </div>
              </Card>

            </div>

          </div>
        ) : (
          <Card className="p-12 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
            <UserIcon className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Partner Selected</h3>
          </Card>
        )}
      </div>

      {/* Tier Promotion / Edit Modal */}
      {showTierModal && partnerTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span>Update Partner Skill & Trust Tier</span>
              </h3>
              <button onClick={() => setShowTierModal(false)} className="text-xs text-[var(--color-text-secondary)]">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Target Tier Level
              </label>
              <div className="space-y-2">
                {(Object.keys(tierDetails) as Array<keyof typeof tierDetails>).map(tKey => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setSelectedTier(tKey)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedTier === tKey
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 ring-1 ring-[var(--color-accent-primary)] font-bold'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tierDetails[tKey].name}</span>
                      <span className="font-mono text-[var(--color-accent-primary)]">{tierDetails[tKey].multiplier}x</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Reason / Performance Justification
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Completed 25 high-quality installations with 98% safety rating..."
                value={changeReason}
                onChange={e => setChangeReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowTierModal(false)} className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                Cancel
              </Button>
              <Button onClick={handleSaveTierChange} className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-bold">
                Save & Apply Tier Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
