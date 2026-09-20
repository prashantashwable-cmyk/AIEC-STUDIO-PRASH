import React, { useState } from 'react';
import { 
  Sliders, ShieldAlert, AlertTriangle, CheckCircle2, ArrowLeft, 
  Sparkles, Save, ShieldCheck, HelpCircle, Lock, Eye, RefreshCw, FileText
} from 'lucide-react';
import { UserRole, ManualOverrideLogEntry } from '../types';
import { DbManager } from '../lib/db';

interface ManualOverrideConsoleScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const ManualOverrideConsoleScreen: React.FC<ManualOverrideConsoleScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [overrideLogs, setOverrideLogs] = useState<ManualOverrideLogEntry[]>(() => 
    DbManager.getManualOverrideLogEntries()
  );

  // Form State for Executing New Override
  const [targetModule, setTargetModule] = useState<'crm_leads' | 'partner_payouts' | 'qc_inspection' | 'po_procurement' | 'sla_timers'>('partner_payouts');
  const [targetRecordId, setTargetRecordId] = useState<string>('COMM-7715 (Partner Ramesh Shinde)');
  const [selectedAction, setSelectedAction] = useState<string>('force_approve_payout');
  const [mandatoryReason, setMandatoryReason] = useState<string>('');
  
  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSafetyBlockedError, setIsSafetyBlockedError] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check if chosen action is a safety-critical non-overridable rule
  const isSafetyCriticalAction = selectedAction === 'bypass_qc_electrical_safety' || selectedAction === 'override_elevator_brake_test';

  const handleInitiateOverride = () => {
    if (!mandatoryReason.trim()) {
      triggerToast('Mandatory reason required! Please justify this manual override.');
      return;
    }

    if (isSafetyCriticalAction) {
      setIsSafetyBlockedError(true);
      return;
    }

    setIsSafetyBlockedError(false);
    setShowConfirmModal(true);
  };

  const handleConfirmExecuteOverride = () => {
    const newEntry: ManualOverrideLogEntry = {
      overrideId: `ovr_${Date.now()}`,
      targetRecordId: targetRecordId,
      targetModule: targetModule,
      overrideAction: selectedAction.replace(/_/g, ' ').toUpperCase(),
      mandatoryReason: mandatoryReason,
      adminId: currentUserId || 'admin_prashant',
      adminName: 'Mr. Prashant Vasant Wable',
      previousState: 'held_by_automation_rule',
      forcedNextState: 'forced_approved_by_admin',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      isSafetyCriticalBlocked: false,
      downstreamEffectsPreview: [
        `Override state committed for ${targetRecordId}.`,
        `Append-only audit log entry created.`,
        `Downstream notification dispatched to impacted parties.`
      ]
    };

    DbManager.saveManualOverrideLogEntry(newEntry);
    setOverrideLogs(DbManager.getManualOverrideLogEntries());

    setShowConfirmModal(false);
    setMandatoryReason('');
    triggerToast('Manual override executed and recorded in audit ledger!');
  };

  const getModuleActions = () => {
    switch (targetModule) {
      case 'crm_leads':
        return [
          { id: 'advance_lead_stage', label: 'Advance CRM Lead Pipeline Stage' },
          { id: 'reassign_lead_surveyor', label: 'Force Reassign Lead to Field Surveyor' }
        ];
      case 'partner_payouts':
        return [
          { id: 'force_approve_payout', label: 'Force Approve Commission Payout (Bypass Hold)' },
          { id: 'unblock_tds_hold', label: 'Unblock TDS Certificate Verification Hold' }
        ];
      case 'qc_inspection':
        return [
          { id: 'bypass_qc_electrical_safety', label: '🛑 Bypass Electrical Safety Checklist Failure (NON-OVERRIDABLE)' },
          { id: 'override_elevator_brake_test', label: '🛑 Override Elevator Mechanical Brake Test Failure (NON-OVERRIDABLE)' },
          { id: 'waive_minor_snag_defect', label: 'Waive Non-Critical Cosmetic Defect Snag' }
        ];
      case 'po_procurement':
        return [
          { id: 'force_po_release', label: 'Force Dispatch PO (Bypass Supplier Margin Floor)' }
        ];
      default:
        return [
          { id: 'reset_sla_timer', label: 'Fairly Reset SLA Response Timer' }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
                <Sliders className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'मैनुअल ओवरराइड कंसोल' : currentLanguage === 'mr' ? 'मॅन्युअल ओव्हरराइड कन्सोल' : 'Manual Override Console'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Admin intervention terminal for genuine operational exceptions with mandatory justification logging
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Informational Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldAlert className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              High-Risk Action Protocol & Absolute Safety Guardrails
            </strong>
            Manual overrides allow single-person monitoring to handle unexpected real-world edge cases. Every override requires explicit justification and is logged in the permanent audit ledger. Safety-critical QC checks remain structurally non-overridable.
          </div>
        </div>

        {/* Safety Blocked Refusal Error Alert */}
        {isSafetyBlockedError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-red-700 dark:text-red-300 animate-fadeIn">
            <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-serif text-sm text-red-800 dark:text-red-200">
                OVERRIDE REFUSED BY SYSTEM SAFETY GUARDRAIL
              </strong>
              <span>
                Electrical & Mechanical safety inspection checks cannot be bypassed under any circumstances. Physical safety compliance rules are hardcoded as non-overridable to preserve AIEC zero-risk passenger safety standards.
              </span>
            </div>
          </div>
        )}

        {/* Override Execution Form Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--color-accent-primary)]" />
            Execute Operational Process Override
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-[var(--color-text-primary)] block mb-1">Target Functional Module</label>
              <select
                value={targetModule}
                onChange={e => {
                  const mod = e.target.value as any;
                  setTargetModule(mod);
                  setIsSafetyBlockedError(false);
                }}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
              >
                <option value="partner_payouts">Partner Commission Payouts</option>
                <option value="crm_leads">CRM Lead & Deal Pipeline</option>
                <option value="qc_inspection">QC Inspection & Safety</option>
                <option value="po_procurement">Supplier Purchase Orders</option>
                <option value="sla_timers">SLA Timers & Customer Support</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[var(--color-text-primary)] block mb-1">Target Record ID / Name</label>
              <input
                type="text"
                value={targetRecordId}
                onChange={e => setTargetRecordId(e.target.value)}
                placeholder="e.g. COMM-7712, DEAL-8801, PO-9902"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-bold text-[var(--color-text-primary)] block">Select Override Action</label>
            <div className="space-y-2">
              {getModuleActions().map(act => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    setSelectedAction(act.id);
                    setIsSafetyBlockedError(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    selectedAction === act.id
                      ? act.id.includes('bypass') || act.id.includes('override_elevator')
                        ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500'
                        : 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)] shadow-xs'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                  }`}
                >
                  <span>{act.label}</span>
                  {selectedAction === act.id && <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-primary)]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[var(--color-text-primary)] block">
              Mandatory Overriding Justification / Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={mandatoryReason}
              onChange={e => setMandatoryReason(e.target.value)}
              placeholder="Explain why this manual intervention is necessary (e.g. physical GST certificate verified offline via WhatsApp, verbal architect confirmation)..."
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
            />
          </div>

          <button
            onClick={handleInitiateOverride}
            className="w-full py-3 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Review & Execute Override</span>
          </button>
        </div>

        {/* Historical Manual Overrides Audit Trail */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Recent Manual Override History ({overrideLogs.length})
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Every manual override is logged as a distinct, heavily tagged entry in the immutable audit ledger
            </p>
          </div>

          <div className="space-y-3">
            {overrideLogs.map(log => (
              <div 
                key={log.overrideId}
                className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[var(--color-border)] pb-2 font-mono">
                  <span className="font-bold text-[var(--color-text-primary)]">
                    Override ID: {log.overrideId} • Target: <strong className="text-[var(--color-accent-primary)]">{log.targetRecordId}</strong>
                  </span>
                  <span className="text-[var(--color-text-secondary)] text-[10px]">{log.timestamp}</span>
                </div>

                <div className="flex items-center justify-between font-bold">
                  <span className="text-[var(--color-text-primary)]">{log.overrideAction}</span>
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">Executed by: {log.adminName}</span>
                </div>

                <p className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-secondary)] italic">
                  "{log.mandatoryReason}"
                </p>

                <div className="pt-1 text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Logged to Audit Trail & Downstream Effects Applied
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation & Downstream Impact Warning Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Confirm Manual Operational Override
            </h3>

            <div className="space-y-3 text-xs text-[var(--color-text-secondary)]">
              <p>
                You are about to execute a manual override on record <strong className="text-[var(--color-text-primary)]">{targetRecordId}</strong>.
              </p>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
                <strong className="block font-bold">Preview of Expected Downstream Effects:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Current state bypassed and updated to forced override state.</li>
                  <li>Permanent entry recorded in Audit Log of Automated Actions.</li>
                  <li>Downstream system workflow triggers will proceed immediately.</li>
                </ul>
              </div>

              <div className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl font-mono text-[11px]">
                <strong>Reason Logged:</strong> "{mandatoryReason}"
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExecuteOverride}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Execute Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
