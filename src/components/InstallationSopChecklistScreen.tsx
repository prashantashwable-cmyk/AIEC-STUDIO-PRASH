import React, { useState, useEffect } from 'react';
import { User, TechnicianJob, InstallationSopStep, InstallationEvidenceItem } from '../types';
import { DbManager } from '../lib/db';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Camera, Video, 
  ArrowLeft, Clock, RefreshCw, FileText, Lock, ChevronDown, ChevronUp, 
  HelpCircle, Upload, CheckSquare, Sparkles, Layers, Shield
} from 'lucide-react';
import { Card, Button } from './Common';

interface InstallationSopChecklistScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onOpenEvidenceCapture: (jobId: string, stepId: string) => void;
  onOpenCheckInScreen?: (jobId: string) => void;
}

export const InstallationSopChecklistScreen: React.FC<InstallationSopChecklistScreenProps> = ({
  user,
  jobId,
  onBack,
  onOpenEvidenceCapture,
  onOpenCheckInScreen
}) => {
  const [job, setJob] = useState<TechnicianJob | null>(null);
  const [steps, setSteps] = useState<InstallationSopStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [naModalStep, setNaModalStep] = useState<InstallationSopStep | null>(null);
  const [naReasonInput, setNaReasonInput] = useState('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const foundJob = DbManager.getTechnicianJobById(jobId);
      const stepList = DbManager.getInstallationSopSteps(jobId);
      setJob(foundJob || null);
      setSteps(stepList);
      if (stepList.length > 0) {
        // Expand the first pending step by default
        const firstPending = stepList.find(s => s.status === 'pending');
        if (firstPending) setExpandedStepId(firstPending.id);
        else setExpandedStepId(stepList[0].id);
      }
      setIsLoading(false);
    }, 300);
  };

  const handleMarkCompleted = (step: InstallationSopStep) => {
    // Safety critical check: require evidence if safety critical
    if (step.isSafetyCritical && (!step.evidenceList || step.evidenceList.length === 0)) {
      alert(`SAFETY CRITICAL REQUIREMENT: Step "${step.title}" requires photo/video evidence proof before sign-off. Please upload evidence first.`);
      onOpenEvidenceCapture(jobId, step.id);
      return;
    }

    const updated: InstallationSopStep = {
      ...step,
      status: 'completed',
      completedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      completedByTechName: user.name || 'Technician'
    };

    DbManager.updateInstallationSopStep(updated);
    loadData();
  };

  const handleConfirmNa = () => {
    if (!naModalStep || !naReasonInput.trim()) return;

    const updated: InstallationSopStep = {
      ...naModalStep,
      status: 'na_confirmed',
      naReason: naReasonInput.trim(),
      completedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      completedByTechName: user.name || 'Technician'
    };

    DbManager.updateInstallationSopStep(updated);
    setNaModalStep(null);
    setNaReasonInput('');
    loadData();
  };

  if (isLoading || !job) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const completedCount = steps.filter(s => s.status === 'completed' || s.status === 'na_confirmed').length;
  const progressPercent = Math.round((completedCount / (steps.length || 1)) * 100);
  const safetyCriticalPending = steps.filter(s => s.isSafetyCritical && s.status === 'pending');

  const filteredSteps = selectedPhaseFilter === 'all' 
    ? steps 
    : steps.filter(s => s.phase === selectedPhaseFilter);

  const phases = Array.from(new Set(steps.map(s => s.phase)));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Context
        </button>

        <div className="flex items-center gap-2">
          {onOpenCheckInScreen && (
            <Button
              variant="outline"
              onClick={() => onOpenCheckInScreen(jobId)}
              className="text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-antiquegold" /> Site Check-In / Out
            </Button>
          )}
          <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            {progressPercent}% SOP DONE
          </span>
        </div>
      </div>

      {/* Hero Ascension Line Progress Card */}
      <Card className="p-5 border border-[var(--color-accent-primary)]/30 bg-[var(--color-surface)] rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div>
            <div className="text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-antiquegold" /> Indian Safety BIS / IS 14665 Compliant SOP
            </div>
            <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-0.5">
              {job.customerName} — Installation Checklist
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Model: <strong className="text-[var(--color-text-primary)]">{job.elevatorSpec.modelName}</strong> ({job.elevatorSpec.stops} Stops)
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-[var(--color-text-secondary)] font-mono block">Completed Steps</span>
            <span className="text-2xl font-serif font-bold font-mono text-antiquegold">
              {completedCount} <span className="text-sm text-[var(--color-text-secondary)]">/ {steps.length}</span>
            </span>
          </div>
        </div>

        {/* Visual Ascension Line Motif */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-secondary)]">Ascension Line Stage Progress:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">{progressPercent}% Verified</span>
          </div>
          <div className="relative w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
            <div 
              className="h-full bg-gradient-to-r from-antiquegold via-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Safety Warning if critical steps pending */}
        {safetyCriticalPending.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Shield className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>{safetyCriticalPending.length} Safety-Critical Steps</strong> require photo/video proof before final sign-off.
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Phase Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedPhaseFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
            selectedPhaseFilter === 'all'
              ? 'bg-antiquegold text-white'
              : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          All Phases ({steps.length})
        </button>
        {phases.map(ph => (
          <button
            key={ph}
            onClick={() => setSelectedPhaseFilter(ph)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              selectedPhaseFilter === ph
                ? 'bg-antiquegold text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {ph}
          </button>
        ))}
      </div>

      {/* Checklist Items Accordion Cards */}
      <div className="space-y-3">
        {filteredSteps.map((step) => {
          const isExpanded = expandedStepId === step.id;
          const isDone = step.status === 'completed';
          const isNa = step.status === 'na_confirmed';
          const hasEvidence = step.evidenceList && step.evidenceList.length > 0;

          return (
            <Card
              key={step.id}
              className={`p-4 border rounded-2xl transition-all ${
                isDone 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : isNa 
                  ? 'border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 opacity-80' 
                  : step.isSafetyCritical
                  ? 'border-amber-500/40 bg-[var(--color-surface)] shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 cursor-pointer flex-1" onClick={() => setExpandedStepId(isExpanded ? null : step.id)}>
                  {/* Step status icon indicator */}
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isNa ? (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-antiquegold/60 flex items-center justify-center text-[10px] font-bold text-antiquegold font-mono">
                        {step.stepNumber}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] font-mono">
                        {step.phase}
                      </span>

                      {step.isSafetyCritical && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Safety Critical
                        </span>
                      )}

                      {step.requiresPhotoEvidence && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-antiquegold/10 text-antiquegold flex items-center gap-0.5">
                          <Camera className="w-2.5 h-2.5" /> Photo Required
                        </span>
                      )}

                      {step.requiresVideoEvidence && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" /> Video Required
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-1">
                      {step.stepNumber}. {step.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                  className="p-1 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Accordion Detail Body */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-3 text-xs">
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {step.description}
                  </p>

                  {/* Attached Evidence Preview */}
                  {hasEvidence && (
                    <div className="space-y-2 bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                      <span className="font-bold text-[var(--color-text-primary)] block">Attached Proof of Completion:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {step.evidenceList.map((ev) => (
                          <div key={ev.id} className="relative group rounded-lg overflow-hidden border border-[var(--color-border)] bg-black/20 aspect-video">
                            <img 
                              src={ev.mediaUrl} 
                              alt={ev.sopStepTitle} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 p-1 flex flex-col justify-between text-[9px] text-white">
                              <span className="font-mono bg-black/60 px-1 py-0.5 rounded self-start">{ev.evidenceType.toUpperCase()}</span>
                              <span className="truncate">{ev.caption || 'Verified Evidence'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NA Reason Display */}
                  {isNa && step.naReason && (
                    <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)]">
                      <span className="font-bold text-[var(--color-text-primary)]">Not Applicable Reason: </span>
                      {step.naReason}
                    </div>
                  )}

                  {/* Action Bar inside expanded step */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onOpenEvidenceCapture(jobId, step.id)}
                        className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-antiquegold" />
                        {hasEvidence ? `Add More Evidence (${step.evidenceList.length})` : 'Capture Photo / Video'}
                      </Button>

                      {!isDone && !isNa && (
                        <button
                          onClick={() => setNaModalStep(step)}
                          className="text-xs text-[var(--color-text-secondary)] hover:underline"
                        >
                          Mark N/A
                        </button>
                      )}
                    </div>

                    {!isDone && (
                      <Button
                        onClick={() => handleMarkCompleted(step)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-4 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sign-off Step
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* N/A Reason Modal */}
      {naModalStep && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
              Confirm Step Not Applicable
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Step: <strong className="text-[var(--color-text-primary)]">{naModalStep.title}</strong>
            </p>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">
                Provide Justification / Reason:
              </label>
              <textarea
                value={naReasonInput}
                onChange={(e) => setNaReasonInput(e.target.value)}
                placeholder="E.g., Component excluded in custom client package layout..."
                rows={3}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-antiquegold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setNaModalStep(null)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handleConfirmNa} disabled={!naReasonInput.trim()} className="bg-antiquegold text-white text-xs">
                Confirm N/A Exemption
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
