import React, { useState, useEffect } from 'react';
import { User, TechnicianJob, TechnicianIssueReport } from '../types';
import { DbManager } from '../lib/db';
import { 
  AlertTriangle, ShieldAlert, ArrowLeft, Camera, Send, CheckCircle2, 
  Clock, FileText, Link as LinkIcon, RefreshCw, Sparkles, Layers, MessageSquare
} from 'lucide-react';
import { Card, Button } from './Common';

interface IssueBlockerReportingScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
}

export const IssueBlockerReportingScreen: React.FC<IssueBlockerReportingScreenProps> = ({
  user,
  jobId,
  onBack
}) => {
  const [job, setJob] = useState<TechnicianJob | null>(null);
  const [reports, setReports] = useState<TechnicianIssueReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New report form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TechnicianIssueReport['issueCategory']>('missing_defective_parts');
  const [severity, setSeverity] = useState<TechnicianIssueReport['severity']>('blocking_paused');
  const [description, setDescription] = useState('');
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve Modal State
  const [resolvingReport, setResolvingReport] = useState<TechnicianIssueReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const foundJob = DbManager.getTechnicianJobById(jobId);
      const list = DbManager.getTechnicianIssueReports(jobId);
      setJob(foundJob || null);
      setReports(list);
      setIsLoading(false);
    }, 300);
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  ];

  const handleAttachPhoto = () => {
    const photo = samplePhotos[attachedPhotos.length % samplePhotos.length];
    setAttachedPhotos([...attachedPhotos, photo]);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newReport: TechnicianIssueReport = {
        id: 'issue_' + Date.now(),
        jobId,
        title: title.trim(),
        issueCategory: category,
        severity,
        description: description.trim(),
        evidenceUrls: attachedPhotos,
        reportedByTechId: user.id || 'tech_001',
        reportedByTechName: user.name || 'Ramesh Patil',
        reportedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
        status: severity === 'critical_safety' ? 'escalated_to_admin' : 'open_investigating'
      };

      DbManager.addTechnicianIssueReport(newReport);

      // If blocking, pause job in db
      if (severity === 'blocking_paused' || severity === 'critical_safety') {
        const j = DbManager.getTechnicianJobById(jobId);
        if (j) {
          j.status = 'conflict_flagged';
          DbManager.updateTechnicianJob(j);
        }
      }

      setIsSubmitting(false);
      setTitle('');
      setDescription('');
      setAttachedPhotos([]);
      loadData();
    }, 300);
  };

  const handleConfirmResolve = () => {
    if (!resolvingReport || !resolutionNotes.trim()) return;

    const updated: TechnicianIssueReport = {
      ...resolvingReport,
      status: 'resolved_resumed',
      resolutionNotes: resolutionNotes.trim()
    };

    DbManager.updateTechnicianIssueReport(updated);

    // If no remaining blocking reports, unblock job
    const remainingOpen = DbManager.getTechnicianIssueReports(jobId).filter(
      r => r.id !== resolvingReport.id && (r.severity === 'blocking_paused' || r.severity === 'critical_safety') && r.status !== 'resolved_resumed'
    );

    if (remainingOpen.length === 0) {
      const j = DbManager.getTechnicianJobById(jobId);
      if (j) {
        j.status = 'in_progress';
        DbManager.updateTechnicianJob(j);
      }
    }

    setResolvingReport(null);
    setResolutionNotes('');
    loadData();
  };

  if (isLoading || !job) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  const openBlockers = reports.filter(r => r.status !== 'resolved_resumed');

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

        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-black/10 dark:bg-white/10 text-[var(--color-text-primary)]">
          FIELD ISSUE LOG
        </span>
      </div>

      {/* Screen Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Technician Field Escape Hatch
        </div>
        <h1 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
          Issue & Blocker Reporting
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Report parts defects, site unpreparedness, or safety hazards directly to Admin Desk
        </p>
      </div>

      {/* Active Blocker Alert Banner */}
      {openBlockers.length > 0 && (
        <Card className="p-4 border border-amber-500/40 bg-amber-500/10 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong>{openBlockers.length} Open Field Issue(s) Recorded</strong>
              <span className="block text-[11px] opacity-90">Admin Control Room has been notified for assistance.</span>
            </div>
          </div>
        </Card>
      )}

      {/* Report Filing Form */}
      <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4 shadow-sm">
        <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-antiquegold" /> Log New Field Issue or Delay
        </h2>

        <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                Issue Summary / Title: *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Missing door sensor cable or scaffolding unanchored..."
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-antiquegold"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
                Issue Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value="missing_defective_parts">Missing or Defective Parts</option>
                <option value="site_unpreparedness">Site Civil / Electrical Unpreparedness</option>
                <option value="customer_client_delay">Customer / Client Access Delay</option>
                <option value="safety_hazard">Site Safety Hazard</option>
                <option value="sop_template_gap">SOP Template / Drawing Ambiguity</option>
              </select>
            </div>
          </div>

          {/* Severity Radio Buttons */}
          <div>
            <label className="font-semibold text-[var(--color-text-primary)] block mb-1.5">
              Severity & Urgency Level:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('minor_noted')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  severity === 'minor_noted'
                    ? 'border-antiquegold bg-antiquegold/10 text-antiquegold'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                }`}
              >
                <span className="font-bold">Minor Issue</span>
                <span className="text-[10px] opacity-80 mt-1">Logged for record; work continues</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('blocking_paused')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  severity === 'blocking_paused'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                }`}
              >
                <span className="font-bold">Blocking Problem</span>
                <span className="text-[10px] opacity-80 mt-1">Work paused; notifies Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('critical_safety')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  severity === 'critical_safety'
                    ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                }`}
              >
                <span className="font-bold">Critical Safety Hazard</span>
                <span className="text-[10px] opacity-80 mt-1">Immediate escalation alert</span>
              </button>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="font-semibold text-[var(--color-text-primary)] block mb-1">
              Detailed Field Description: *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what was found, location in shaft/site, and immediate corrective action required..."
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-antiquegold"
            />
          </div>

          {/* Photo Attachments */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[var(--color-text-primary)]">
                Attach Evidence Photos ({attachedPhotos.length}):
              </label>
              <button
                type="button"
                onClick={handleAttachPhoto}
                className="text-xs font-bold text-antiquegold flex items-center gap-1 hover:underline"
              >
                <Camera className="w-3.5 h-3.5" /> + Add Photo
              </button>
            </div>

            {attachedPhotos.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {attachedPhotos.map((url, i) => (
                  <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0">
                    <img src={url} alt="Attached" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="w-full bg-antiquegold text-white font-bold text-xs py-3 flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" /> SUBMIT ISSUE REPORT TO ADMIN DESK
          </Button>
        </form>
      </Card>

      {/* History Log of Filed Issue Reports */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-antiquegold" /> Recorded Job Issues ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <p className="text-xs text-[var(--color-text-secondary)] italic">No field issues or blockers reported for this job yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const isResolved = r.status === 'resolved_resumed';

              return (
                <Card
                  key={r.id}
                  className={`p-4 border rounded-2xl space-y-2.5 ${
                    isResolved
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : r.severity === 'critical_safety'
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                        <span className="font-bold text-antiquegold uppercase">{r.issueCategory.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{r.reportedAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                        {r.title}
                      </h3>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : r.severity === 'critical_safety'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      {isResolved ? 'RESOLVED & RESUMED' : r.severity.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {r.description}
                  </p>

                  {/* Resolution Notes if resolved */}
                  {isResolved && r.resolutionNotes && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold">Resolution Note: </span>
                      {r.resolutionNotes}
                    </div>
                  )}

                  {/* Action Bar */}
                  {!isResolved && (
                    <div className="pt-2 border-t border-[var(--color-border)] flex justify-end">
                      <Button
                        onClick={() => setResolvingReport(r)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-3 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved & Resume
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {resolvingReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Confirm Issue Resolution
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Issue: <strong className="text-[var(--color-text-primary)]">{resolvingReport.title}</strong>
            </p>

            <div>
              <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">
                Resolution Action Taken: *
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain how issue was resolved or component replaced..."
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setResolvingReport(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmResolve}
                disabled={!resolutionNotes.trim()}
                className="bg-emerald-600 text-white text-xs font-bold"
              >
                Confirm Resolution
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};