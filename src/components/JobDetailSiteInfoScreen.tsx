import React, { useState, useEffect } from 'react';
import { User, TechnicianJob } from '../types';
import { DbManager } from '../lib/db';
import { 
  ArrowLeft, MapPin, Navigation, Phone, Mail, UserCheck, Shield, 
  CheckCircle2, XCircle, Clock, FileText, Wrench, Layers, AlertTriangle, 
  RefreshCw, ChevronRight, Lock, ExternalLink, Cpu, Users
} from 'lucide-react';
import { Card, Button } from './Common';

interface JobDetailSiteInfoScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onStartSopChecklist: (jobId: string) => void;
}

export const JobDetailSiteInfoScreen: React.FC<JobDetailSiteInfoScreenProps> = ({
  user,
  jobId,
  onBack,
  onStartSopChecklist
}) => {
  const [job, setJob] = useState<TechnicianJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'materials' | 'team' | 'notes'>('specs');
  const [specRefreshedNotice, setSpecRefreshedNotice] = useState(false);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const found = DbManager.getTechnicianJobById(jobId);
      setJob(found || null);
      setIsLoading(false);
    }, 300);
  };

  const handleRefreshSpec = () => {
    setSpecRefreshedNotice(true);
    setTimeout(() => {
      loadJobData();
      setSpecRefreshedNotice(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
          Installation Job Record Not Found
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Job ID <span className="font-mono">{jobId}</span> is not available or has been reassigned.
        </p>
        <Button onClick={onBack} variant="outline" className="text-xs">
          Return to My Jobs
        </Button>
      </div>
    );
  }

  const mapsNavigationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.siteAddress)}`;
  const readyMaterialsCount = job.materialsStatus.filter(m => m.isReadyOnSite).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto pb-28">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Jobs
        </button>

        <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-black/10 dark:bg-white/10 text-[var(--color-text-primary)]">
          JOB #{job.id.toUpperCase()}
        </span>
      </div>

      {/* Hero Site Context Card */}
      <Card className="p-5 border border-[var(--color-accent-primary)]/30 bg-[var(--color-surface)] rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-antiquegold/20 text-antiquegold border border-antiquegold/30">
                PO: {job.poNumber}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-antiquegold" /> {job.scheduledDate} ({job.scheduledTimeSlot})
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
              {job.customerName}
            </h1>

            <div className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <MapPin className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
              <span>{job.siteAddress}</span>
            </div>
          </div>

          {/* Site Navigation & Contact Action Group */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <a
              href={mapsNavigationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" /> Launch GPS Navigation
            </a>
            <a
              href={`tel:${job.customerPhone}`}
              className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call {job.customerPhone}
            </a>
          </div>
        </div>

        {/* Ascension Line SOP Stage Banner */}
        <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--color-text-secondary)] font-medium">Installation Progression:</span>
            <span className="font-bold text-antiquegold font-mono">{job.sopProgressPercent}% SOP Verified</span>
          </div>
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-antiquegold to-emerald-600 rounded-full transition-all"
              style={{ width: `${job.sopProgressPercent}%` }}
            />
          </div>
          <div className="text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-between">
            <span>Stage: {job.sopStage}</span>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Est. Time: {job.estimatedHours} Hours</span>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--color-border)] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('specs')}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
            activeTab === 'specs'
              ? 'border-antiquegold text-antiquegold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Elevator Specs (Locked)
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
            activeTab === 'materials'
              ? 'border-antiquegold text-antiquegold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Site Materials ({readyMaterialsCount}/{job.materialsStatus.length})
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
            activeTab === 'team'
              ? 'border-antiquegold text-antiquegold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Assigned Team ({job.assignedTeam.length})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-2.5 px-3 text-xs font-bold transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-antiquegold text-antiquegold'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Survey & Sales Notes
        </button>
      </div>

      {/* Tab 1: Elevator Specs (Locked Quotation Contract) */}
      {activeTab === 'specs' && (
        <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Lock className="w-4 h-4 text-antiquegold" /> Contract Engineering Specifications
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Contract Reference: <span className="font-mono font-semibold">{job.elevatorSpec.lockedQuotationRef}</span>
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleRefreshSpec}
              className="text-xs py-1 px-2.5 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${specRefreshedNotice ? 'animate-spin' : ''}`} />
              {specRefreshedNotice ? 'Synced' : 'Verify Fresh Spec'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Model Name:</span>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">{job.elevatorSpec.modelName}</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Capacity & Passengers:</span>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">{job.elevatorSpec.capacityKg} kg ({job.elevatorSpec.passengers} Persons)</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Stops & Speed:</span>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">{job.elevatorSpec.stops} Stops / {job.elevatorSpec.speedMs} m/s</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Drive System:</span>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">{job.elevatorSpec.driveType}</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Automatic Door Type:</span>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">{job.elevatorSpec.doorType}</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Cabin Interior Finish:</span>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">{job.elevatorSpec.cabinFinish}</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Pit Depth:</span>
              <span className="font-bold text-sm font-mono text-[var(--color-text-primary)]">{job.elevatorSpec.pitDepthMm} mm</span>
            </div>

            <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)] block">Overhead Height:</span>
              <span className="font-bold text-sm font-mono text-[var(--color-text-primary)]">{job.elevatorSpec.overheadMm} mm</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Materials Readiness Checklist */}
      {activeTab === 'materials' && (
        <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
                Site Materials & Verification Checklist
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Pulls directly from Site Delivery & Material Received Sign-offs
              </p>
            </div>

            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              {readyMaterialsCount} of {job.materialsStatus.length} Delivered
            </span>
          </div>

          <div className="space-y-3">
            {job.materialsStatus.map((mat) => (
              <div 
                key={mat.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  mat.isReadyOnSite 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-amber-500/5 border-amber-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[var(--color-text-secondary)]">{mat.componentCategory}</span>
                    {mat.deliveredAt && (
                      <span className="text-[10px] text-[var(--color-text-secondary)]">• Delivered {mat.deliveredAt}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[var(--color-text-primary)] mt-0.5">
                    {mat.itemName} (Qty: {mat.quantity})
                  </h3>
                </div>

                <div className="shrink-0">
                  {mat.isReadyOnSite ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed On Site
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> In Transit / Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Team Members */}
      {activeTab === 'team' && (
        <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
          <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
            Assigned Installation Crew
          </h2>

          <div className="space-y-3">
            {job.assignedTeam.map((m) => (
              <div key={m.techId} className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-antiquegold/20 flex items-center justify-center font-bold text-antiquegold text-sm">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{m.name}</h3>
                      {m.isLead && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-antiquegold text-white">LEAD</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] capitalize">{m.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <a 
                  href={`tel:${m.phone}`}
                  className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Survey & Sales Notes */}
      {activeTab === 'notes' && (
        <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
          <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)]">
            Pre-Installation Site Notes
          </h2>

          {job.surveyNotes.length === 0 ? (
            <p className="text-xs text-[var(--color-text-secondary)] italic">No special notes recorded during sales or site survey.</p>
          ) : (
            <div className="space-y-3">
              {job.surveyNotes.map((note) => (
                <div 
                  key={note.id}
                  className={`p-3.5 rounded-xl border ${
                    note.isOutdated 
                      ? 'bg-black/5 dark:bg-white/5 border-[var(--color-border)] opacity-60' 
                      : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {note.authorName} ({note.authorRole})
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                      {note.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-primary)]">
                    {note.noteText}
                  </p>
                  {note.isOutdated && (
                    <span className="mt-2 inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded">
                      Annotated: Historical Note (Pre-Construction)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Sticky Bottom Bar for SOP Checklist Launcher */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block text-xs">
            <span className="text-[var(--color-text-secondary)] block">Current SOP Stage:</span>
            <span className="font-bold text-[var(--color-text-primary)]">{job.sopStage}</span>
          </div>

          <Button
            onClick={() => onStartSopChecklist(job.id)}
            className="w-full sm:w-auto bg-antiquegold text-white hover:bg-antiquegold/90 font-bold text-xs py-3 px-6 flex items-center justify-center gap-2 shadow-lg"
          >
            Launch Installation SOP Checklist <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
