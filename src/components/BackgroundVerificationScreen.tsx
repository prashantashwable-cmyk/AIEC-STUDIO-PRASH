import React, { useState, useEffect } from 'react';
import {
  User,
  RecruitmentApplicantRecord,
  ApplicantVerificationCheck
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  Upload,
  PhoneCall,
  Lock,
  Check,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface BackgroundVerificationScreenProps {
  user: User;
  applicantId?: string;
  onNavigateToOffer?: (applicantId: string) => void;
  onBack?: () => void;
}

export const BackgroundVerificationScreen: React.FC<BackgroundVerificationScreenProps> = ({
  user,
  applicantId,
  onNavigateToOffer,
  onBack
}) => {
  const [applicant, setApplicant] = useState<RecruitmentApplicantRecord | null>(null);
  const [allApplicants, setAllApplicants] = useState<RecruitmentApplicantRecord[]>([]);

  // Verification Item Edit State
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);
  const [itemStatus, setItemStatus] = useState<ApplicantVerificationCheck['status']>('passed');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [conditionalDeadline, setConditionalDeadline] = useState('2026-08-30');
  const [showEditModal, setShowEditModal] = useState(false);

  // Default role-aware verification checklists
  const defaultChecklists: Record<string, ApplicantVerificationCheck[]> = {
    technician: [
      {
        id: 'v_tech_1',
        itemKey: 'aadhaar_id',
        label: 'Aadhaar Identity Verification',
        requiredForRoles: ['technician'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'UIDAI API Gateway',
        verifiedAt: new Date().toISOString()
      },
      {
        id: 'v_tech_2',
        itemKey: 'wireman_license',
        label: 'Wireman / ITI Electrical License',
        requiredForRoles: ['technician'],
        method: 'manual_admin',
        status: 'pending',
        notes: 'Needs admin check against state PWD license portal.'
      },
      {
        id: 'v_tech_3',
        itemKey: 'reference_check',
        label: 'Site Supervisor Reference Check',
        requiredForRoles: ['technician'],
        method: 'manual_admin',
        status: 'passed',
        verifiedBy: 'Mr. Prashant Vasant Wable'
      },
      {
        id: 'v_tech_4',
        itemKey: 'safety_cert',
        label: 'Elevator Safety & Harness Orientation',
        requiredForRoles: ['technician'],
        method: 'field_agent',
        status: 'conditional_approval',
        conditionalDeadline: '2026-08-25',
        notes: 'Pending completion of 2-hour field orientation module.'
      }
    ],
    surveyor: [
      {
        id: 'v_surv_1',
        itemKey: 'aadhaar_id',
        label: 'Aadhaar Identity Verification',
        requiredForRoles: ['surveyor'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'UIDAI API Gateway'
      },
      {
        id: 'v_surv_2',
        itemKey: 'reference_check',
        label: 'Civil Engineering Reference Check',
        requiredForRoles: ['surveyor'],
        method: 'manual_admin',
        status: 'pending'
      }
    ],
    supplier: [
      {
        id: 'v_supp_1',
        itemKey: 'gstin_proof',
        label: 'GSTIN & Factory Registration Check',
        requiredForRoles: ['supplier'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'GST Portal API'
      },
      {
        id: 'v_supp_2',
        itemKey: 'bank_mandate',
        label: 'Cancelled Cheque / Bank Mandate',
        requiredForRoles: ['supplier'],
        method: 'manual_admin',
        status: 'passed',
        verifiedBy: 'Mr. Prashant Vasant Wable'
      }
    ],
    sales_rep: [
      {
        id: 'v_sales_1',
        itemKey: 'aadhaar_id',
        label: 'Aadhaar Identity Verification',
        requiredForRoles: ['sales_rep'],
        method: 'third_party_api',
        status: 'passed',
        verifiedBy: 'UIDAI API Gateway'
      }
    ]
  };

  useEffect(() => {
    const list = DbManager.getRecruitmentApplicants();
    setAllApplicants(list);

    const targetId = applicantId || (list.length > 0 ? list[0].id : '');
    const found = list.find(a => a.id === targetId);
    if (found) {
      if (!found.verificationChecks || found.verificationChecks.length === 0) {
        const defaultList = defaultChecklists[found.primaryRole] || defaultChecklists.technician;
        const initializedApp = { ...found, verificationChecks: defaultList };
        DbManager.saveRecruitmentApplicant(initializedApp);
        setApplicant(initializedApp);
      } else {
        setApplicant(found);
      }
    }
  }, [applicantId]);

  const handleSelectApplicant = (app: RecruitmentApplicantRecord) => {
    if (!app.verificationChecks || app.verificationChecks.length === 0) {
      const defaultList = defaultChecklists[app.primaryRole] || defaultChecklists.technician;
      const initializedApp = { ...app, verificationChecks: defaultList };
      DbManager.saveRecruitmentApplicant(initializedApp);
      setApplicant(initializedApp);
    } else {
      setApplicant(app);
    }
  };

  const handleOpenEditItem = (check: ApplicantVerificationCheck) => {
    setSelectedCheckId(check.id);
    setItemStatus(check.status);
    setVerificationNotes(check.notes || '');
    if (check.conditionalDeadline) setConditionalDeadline(check.conditionalDeadline);
    setShowEditModal(true);
  };

  const handleSaveItemVerification = () => {
    if (!applicant || !selectedCheckId) return;

    const updatedChecks = (applicant.verificationChecks || []).map(check => {
      if (check.id === selectedCheckId) {
        return {
          ...check,
          status: itemStatus,
          notes: verificationNotes,
          conditionalDeadline: itemStatus === 'conditional_approval' ? conditionalDeadline : undefined,
          verifiedBy: 'Mr. Prashant Vasant Wable',
          verifiedAt: new Date().toISOString()
        };
      }
      return check;
    });

    const updatedApp: RecruitmentApplicantRecord = {
      ...applicant,
      verificationChecks: updatedChecks,
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updatedApp);
    setApplicant(updatedApp);
    setShowEditModal(false);
  };

  // Check if all required items are resolved (passed or conditional_approval)
  const isFullyGateCleared = applicant?.verificationChecks?.every(
    c => c.status === 'passed' || c.status === 'conditional_approval'
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2"
              >
                ← Back to Recruitment Landing
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                Background & Document Verification Gate
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20">
                Structural Risk Gate
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Role-aware vetting for IDs, trade wireman licenses, GSTIN, and safety certifications before final onboarding.
            </p>
          </div>

          {applicant && (
            <div className="text-right">
              <div className="text-xs text-[var(--color-text-secondary)]">Verification Gate</div>
              <div className={`text-sm font-bold ${isFullyGateCleared ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isFullyGateCleared ? '✓ All Checks Cleared' : '⚠️ Pending Checks'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        
        {/* Candidate Selector Bar */}
        <Card className="p-4 mb-6 border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase shrink-0">Candidates Queue:</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {allApplicants.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleSelectApplicant(app)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    applicant?.id === app.id
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                  }`}
                >
                  {app.applicantName} ({app.primaryRole[0].toUpperCase()})
                </button>
              ))}
            </div>
          </div>
        </Card>

        {applicant ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: Candidate Overview & Gate Readiness */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                      {applicant.applicantName}
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Role: <strong className="uppercase text-[var(--color-accent-primary)]">{applicant.primaryRole}</strong>
                    </p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-[var(--color-accent-secondary)]" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Phone:</span>
                    <strong className="block text-[var(--color-text-primary)]">{applicant.applicantPhone}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Address:</span>
                    <strong className="block text-[var(--color-text-primary)]">{applicant.fullAddress || 'Address on file'}</strong>
                  </div>
                </div>

                {/* Readiness Banner */}
                <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                  isFullyGateCleared
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {isFullyGateCleared ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                    <span>{isFullyGateCleared ? 'Offer Gate Unlocked' : 'Offer Gate Locked'}</span>
                  </div>
                  <p className="text-[11px]">
                    {isFullyGateCleared
                      ? 'All required background items for this role have been verified. You may proceed to issue the formal offer & onboarding agreement.'
                      : 'At least one required verification item is pending resolution. Complete verification before issuing an offer.'}
                  </p>
                </div>

                {isFullyGateCleared && (
                  <Button
                    onClick={() => onNavigateToOffer && onNavigateToOffer(applicant.id)}
                    className="w-full bg-[var(--color-accent-primary)] text-white text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Proceed to Onboarding Offer</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            </div>

            {/* RIGHT: Role-Aware Checklist */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      <span>Required Verification Items</span>
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Role specific checks for <strong className="uppercase">{applicant.primaryRole}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(applicant.verificationChecks || []).map(check => {
                    const isPassed = check.status === 'passed';
                    const isConditional = check.status === 'conditional_approval';
                    const isFailed = check.status === 'failed';

                    return (
                      <div
                        key={check.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isPassed
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : isConditional
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : isFailed
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-[var(--color-text-primary)]">{check.label}</h3>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                {check.method.replace('_', ' ')}
                              </span>
                            </div>

                            {check.verifiedBy && (
                              <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                                Verified by <strong>{check.verifiedBy}</strong>
                              </div>
                            )}

                            {check.notes && (
                              <p className="text-[11px] text-[var(--color-text-secondary)] italic mt-1">
                                "{check.notes}"
                              </p>
                            )}

                            {isConditional && check.conditionalDeadline && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                <Clock className="w-3 h-3" />
                                <span>Conditional Deadline: {check.conditionalDeadline}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleOpenEditItem(check)}
                            className={`text-xs px-3 py-1 font-semibold shrink-0 ${
                              isPassed
                                ? 'bg-emerald-600 text-white'
                                : isConditional
                                ? 'bg-amber-600 text-white'
                                : 'bg-[var(--color-accent-primary)] text-white'
                            }`}
                          >
                            {isPassed ? '✓ Verified' : isConditional ? 'Conditional' : 'Review Check'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

          </div>
        ) : (
          <Card className="p-12 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
            <UserIcon className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Candidate Selected</h3>
          </Card>
        )}
      </div>

      {/* Edit Verification Status Modal */}
      {showEditModal && selectedCheckId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span>Update Verification Item</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-xs text-[var(--color-text-secondary)]">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                Verification Result
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'passed', label: '✓ Pass & Clear', color: 'text-emerald-600' },
                  { id: 'conditional_approval', label: '⚠️ Conditional Pass', color: 'text-amber-600' },
                  { id: 'failed', label: '✕ Fail / Discrepancy', color: 'text-rose-600' },
                  { id: 'pending', label: '⏳ Pending', color: 'text-gray-500' }
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setItemStatus(st.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      itemStatus === st.id
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] ring-1 ring-[var(--color-accent-primary)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {itemStatus === 'conditional_approval' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Conditional Document Deadline
                </label>
                <input
                  type="date"
                  value={conditionalDeadline}
                  onChange={e => setConditionalDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Admin Notes / Verification Log
              </label>
              <textarea
                rows={3}
                placeholder="Record document license numbers, API response refs, or supervisor call notes..."
                value={verificationNotes}
                onChange={e => setVerificationNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                Cancel
              </Button>
              <Button onClick={handleSaveItemVerification} className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-bold">
                Save Verification Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
