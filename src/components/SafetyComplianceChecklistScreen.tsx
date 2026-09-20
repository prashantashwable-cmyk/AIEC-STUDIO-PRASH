import React, { useState, useEffect } from 'react';
import { User, TechnicianJob, SafetyComplianceItem } from '../types';
import { DbManager } from '../lib/db';
import { 
  ShieldCheck, ShieldAlert, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
  FileText, Lock, RefreshCw, Sparkles, Building, ChevronDown, ChevronUp, 
  Plus, Shield, Eye, Download, Printer, UserCheck
} from 'lucide-react';
import { Card, Button } from './Common';

interface SafetyComplianceChecklistScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onOpenEvidenceCapture?: (jobId: string, stepId: string) => void;
}

export const SafetyComplianceChecklistScreen: React.FC<SafetyComplianceChecklistScreenProps> = ({
  user,
  jobId,
  onBack,
  onOpenEvidenceCapture
}) => {
  const [job, setJob] = useState<TechnicianJob | null>(null);
  const [safetyItems, setSafetyItems] = useState<SafetyComplianceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Failure modal state
  const [failingItem, setFailingItem] = useState<SafetyComplianceItem | null>(null);
  const [failureReasonInput, setFailureReasonInput] = useState('');

  // Admin Override modal state
  const [overrideItem, setOverrideItem] = useState<SafetyComplianceItem | null>(null);
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Add custom state item modal
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<SafetyComplianceItem['category']>('Over-Speed Governor & Safety Gear');
  const [customStd, setCustomStd] = useState('State Lift Act Local Mandate');

  // Readiness Summary modal
  const [showReadinessSummary, setShowReadinessSummary] = useState(false);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const foundJob = DbManager.getTechnicianJobById(jobId);
      const items = DbManager.getSafetyComplianceItems(jobId);
      setJob(foundJob || null);
      setSafetyItems(items);
      setIsLoading(false);
    }, 300);
  };

  const handlePassItem = (item: SafetyComplianceItem) => {
    const updated: SafetyComplianceItem = {
      ...item,
      status: 'passed',
      failureReason: undefined,
      testedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      testedByTechName: user.name || 'Technician'
    };
    DbManager.updateSafetyComplianceItem(updated);
    loadData();
  };

  const handleConfirmFail = () => {
    if (!failingItem || !failureReasonInput.trim()) return;

    const updated: SafetyComplianceItem = {
      ...failingItem,
      status: 'failed',
      failureReason: failureReasonInput.trim(),
      retestCount: (failingItem.retestCount || 0) + 1,
      testedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      testedByTechName: user.name || 'Technician'
    };
    DbManager.updateSafetyComplianceItem(updated);

    setFailingItem(null);
    setFailureReasonInput('');
    loadData();
  };

  const handleConfirmAdminOverride = () => {
    if (!overrideItem || !overrideReasonInput.trim()) return;

    const updated: SafetyComplianceItem = {
      ...overrideItem,
      status: 'passed',
      overrideReason: overrideReasonInput.trim(),
      overrideByAdmin: user.name || 'Admin Engineer',
      testedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };
    DbManager.updateSafetyComplianceItem(updated);

    setOverrideItem(null);
    setOverrideReasonInput('');
    loadData();
  };

  const handleAddCustomItem = () => {
    if (!customTitle.trim()) return;

    const newItem: SafetyComplianceItem = {
      id: 'safe_custom_' + Date.now(),
      jobId,
      category: customCategory,
      title: customTitle.trim(),
      description: 'State-specific custom safety compliance item added per local Lift Inspectorate requirements.',
      indianStandardRef: customStd,
      isGovernmentInspectorRequired: true,
      status: 'pending'
    };

    DbManager.updateSafetyComplianceItem(newItem);
    setShowAddCustomModal(false);
    setCustomTitle('');
    loadData();
  };

  if (isLoading || !job) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  const passedCount = safetyItems.filter(i => i.status === 'passed').length;
  const failedCount = safetyItems.filter(i => i.status === 'failed').length;
  const pendingCount = safetyItems.filter(i => i.status === 'pending').length;
  const progressPercent = Math.round((passedCount / (safetyItems.length || 1)) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to SOP Hub
        </button>

        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <Button
              variant="outline"
              onClick={() => setShowAddCustomModal(true)}
              className="text-xs py-1.5 px-3 flex items-center gap-1 border-antiquegold/40 text-antiquegold"
            >
              <Plus className="w-3.5 h-3.5" /> Add State Rule
            </Button>
          )}
          <Button
            onClick={() => setShowReadinessSummary(true)}
            className="bg-antiquegold text-white font-bold text-xs py-1.5 px-3 flex items-center gap-1 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> Lift License Summary
          </Button>
        </div>
      </div>

      {/* Hero Header Card with Ascension Line */}
      <Card className="p-5 border border-amber-500/30 bg-[var(--color-surface)] rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div>
            <div className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-antiquegold" /> IS 14665 & State Lift Inspectorate Compliance
            </div>
            <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-0.5">
              Safety Compliance Checklist
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Site: <strong className="text-[var(--color-text-primary)]">{job.customerName}</strong> ({job.siteCity}) • Lift Inspectorate Verification
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-[var(--color-text-secondary)] font-mono block">Safety Audit Status</span>
            <span className={`text-2xl font-serif font-bold font-mono ${failedCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {passedCount} / {safetyItems.length} <span className="text-sm font-normal">Passed</span>
            </span>
          </div>
        </div>

        {/* Ascension Line Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[var(--color-text-secondary)]">Safety Verification Barometer:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{progressPercent}% Clear</span>
          </div>
          <div className="relative w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                failedCount > 0 
                  ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-antiquegold to-emerald-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Failed Lockout Warning */}
        {failedCount > 0 && (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
            <div>
              <strong className="block">QUALITY CHECK SIGN-OFF BLOCKED: {failedCount} Safety Failure(s)</strong>
              <span>All failed safety items must undergo a successful retest or qualified Admin override before handover.</span>
            </div>
          </div>
        )}
      </Card>

      {/* Safety Compliance Item List */}
      <div className="space-y-3">
        {safetyItems.map((item, idx) => {
          const isPassed = item.status === 'passed';
          const isFailed = item.status === 'failed';

          return (
            <Card
              key={item.id}
              className={`p-4 border rounded-2xl transition-all ${
                isPassed
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isFailed
                  ? 'border-red-500/40 bg-red-500/5 shadow-md'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-antiquegold font-mono">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-black/10 dark:bg-white/10 text-[var(--color-text-secondary)]">
                      {item.indianStandardRef}
                    </span>
                    {item.isGovernmentInspectorRequired && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">
                        Govt Inspector Item
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {idx + 1}. {item.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>

                  {/* Failure reason callout */}
                  {isFailed && (
                    <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">FAILED TEST (Attempt #{item.retestCount || 1}):</span>
                        <span className="font-mono text-[10px]">Tested by: {item.testedByTechName}</span>
                      </div>
                      <p>{item.failureReason}</p>
                    </div>
                  )}

                  {/* Admin Override callout */}
                  {item.overrideReason && (
                    <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-antiquegold" /> Admin / Qualified Engineer Override Applied
                      </span>
                      <p>Approved By: <strong>{item.overrideByAdmin}</strong> — "{item.overrideReason}"</p>
                    </div>
                  )}
                </div>

                {/* Status Badge or Pass/Fail Controls */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {isPassed ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                    </span>
                  ) : isFailed ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> FAILED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-black/10 dark:bg-white/10 text-[var(--color-text-secondary)]">
                      PENDING TEST
                    </span>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {!isPassed && (
                      <Button
                        onClick={() => handlePassItem(item)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Pass
                      </Button>
                    )}

                    {!isFailed && !isPassed && (
                      <Button
                        onClick={() => setFailingItem(item)}
                        variant="outline"
                        className="border-red-500/40 text-red-600 hover:bg-red-500/10 font-bold text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Fail
                      </Button>
                    )}

                    {isFailed && (
                      <Button
                        onClick={() => handlePassItem(item)}
                        className="bg-antiquegold text-white font-bold text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Log Retest Pass
                      </Button>
                    )}

                    {isFailed && user.role === 'admin' && (
                      <Button
                        onClick={() => setOverrideItem(item)}
                        variant="outline"
                        className="border-amber-500 text-amber-700 dark:text-amber-300 text-xs py-1 px-2 flex items-center gap-1"
                      >
                        Override
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Failure Input Modal */}
      {failingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-5 h-5" /> Log Safety Compliance Failure
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Item: <strong className="text-[var(--color-text-primary)]">{failingItem.title}</strong>
            </p>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">
                Failure Observation / Reason (Mandatory):
              </label>
              <textarea
                value={failureReasonInput}
                onChange={(e) => setFailureReasonInput(e.target.value)}
                placeholder="Describe exact defect or measured discrepancy (e.g. governor tripping speed exceeded threshold by 12%)..."
                rows={3}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFailingItem(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmFail}
                disabled={!failureReasonInput.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Log Safety Failure
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Admin Override Modal */}
      {overrideItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2 text-amber-600">
              <UserCheck className="w-5 h-5" /> Qualified Admin Engineering Override
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Overriding safety failure for: <strong className="text-[var(--color-text-primary)]">{overrideItem.title}</strong>
            </p>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">
                Engineering Override Rationale / Audit Log:
              </label>
              <textarea
                value={overrideReasonInput}
                onChange={(e) => setOverrideReasonInput(e.target.value)}
                placeholder="Enter technical justification (e.g., minor tolerance re-calibrated and verified with secondary gauge)..."
                rows={3}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOverrideItem(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAdminOverride}
                disabled={!overrideReasonInput.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Confirm Admin Override
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Custom State Rule Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Plus className="w-5 h-5 text-antiquegold" /> Add State-Specific Lift Act Rule
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Safety Item Title:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="E.g., Maharashtra Lift Act 2017 Auxiliary Earthing Switch Test"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Safety Category:</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                >
                  <option value="Over-Speed Governor & Safety Gear">Over-Speed Governor & Safety Gear</option>
                  <option value="Buffers & Pit Equipment">Buffers & Pit Equipment</option>
                  <option value="Emergency Alarm & ARD">Emergency Alarm & ARD</option>
                  <option value="IR Door Curtain & Interlocks">IR Door Curtain & Interlocks</option>
                  <option value="Load Weighing & Overload Sensor">Load Weighing & Overload Sensor</option>
                  <option value="No-Load & Full-Load Trial Run">No-Load & Full-Load Trial Run</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[var(--color-text-primary)] block mb-1">Standard / Act Reference:</label>
                <input
                  type="text"
                  value={customStd}
                  onChange={(e) => setCustomStd(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2 text-xs text-[var(--color-text-primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddCustomModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleAddCustomItem} disabled={!customTitle.trim()} className="bg-antiquegold text-white text-xs">
                Add Rule to Checklist
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pre-Inspection Readiness Summary Modal */}
      {showReadinessSummary && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-2xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-antiquegold uppercase">State Lift Inspectorate Application Prep</span>
                <h3 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
                  Internal Pre-Inspection Readiness Summary
                </h3>
              </div>
              <button onClick={() => setShowReadinessSummary(false)} className="text-xs font-bold text-[var(--color-text-secondary)]">
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] grid grid-cols-2 gap-2 font-mono">
                <div>Customer: <strong>{job.customerName}</strong></div>
                <div>Location: <strong>{job.siteCity}</strong></div>
                <div>Model: <strong>{job.elevatorSpec.modelName}</strong></div>
                <div>Readiness Score: <strong className="text-emerald-600">{progressPercent}%</strong></div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[var(--color-text-primary)]">IS 14665 Safety Audit Checklist Breakdown:</h4>
                <div className="space-y-1">
                  {safetyItems.map(s => (
                    <div key={s.id} className="p-2 bg-[var(--color-bg)] rounded border border-[var(--color-border)] flex items-center justify-between">
                      <span>{s.title}</span>
                      <span className={`font-mono font-bold ${s.status === 'passed' ? 'text-emerald-600' : s.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-[var(--color-text-secondary)] italic">
                This document certifies internal pre-commissioning testing conducted by AIEC engineers per IS 14665 standards, prior to state Lift Inspectorate final verification.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <Button variant="outline" onClick={() => window.print()} className="text-xs flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" /> Print Summary
              </Button>
              <Button onClick={() => setShowReadinessSummary(false)} className="bg-antiquegold text-white text-xs">
                Close Summary
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};