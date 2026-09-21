import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Camera,
  Upload,
  ShieldAlert,
  Wrench,
  PackagePlus,
  ArrowUpRight,
  Send,
  RefreshCw,
  FileText,
  AlertOctagon,
  Calendar
} from 'lucide-react';
import { User, ReworkAssignmentRecord, DefectSnagRecord, Job, TechnicianJob } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';

const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1 ${className}`}>
    {children}
  </span>
);

interface ReworkAssignmentScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onNavigateToSnagList?: (jobId: string) => void;
  onNavigateToPartsRequest?: (jobId: string, snagId: string) => void;
}

export const ReworkAssignmentScreen: React.FC<ReworkAssignmentScreenProps> = ({
  user,
  jobId,
  onBack,
  onNavigateToSnagList,
  onNavigateToPartsRequest
}) => {
  const [job, setJob] = useState<Job | null>(null);
  const [reworkRecords, setReworkRecords] = useState<ReworkAssignmentRecord[]>([]);
  const [snags, setSnags] = useState<DefectSnagRecord[]>([]);
  const [selectedRework, setSelectedRework] = useState<ReworkAssignmentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my_assignments' | 'pending_reverification'>('all');

  // Technician re-fix state
  const [fixNotes, setFixNotes] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [partsNeededFlag, setPartsNeededFlag] = useState(false);
  const [partNotes, setPartNotes] = useState('');
  const [escalateFlag, setEscalateFlag] = useState(false);
  const [escalationNote, setEscalateNote] = useState('');

  // Reassignment state (Admin)
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newTechId, setNewTechId] = useState('');
  const [techniciansList, setTechniciansList] = useState<User[]>([]);

  // Action status message
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    const j = DbManager.getJobById(jobId) || DbManager.getJobs()[0];
    setJob(j);

    const allReworks = DbManager.getReworkAssignments().filter(r => r.jobId === (j?.id || jobId));
    setReworkRecords(allReworks);

    const allSnags = DbManager.getDefectSnags().filter(s => s.jobId === (j?.id || jobId));
    setSnags(allSnags);

    const techs = DbManager.getTechnicians();
    setTechniciansList(techs);

    if (allReworks.length > 0 && !selectedRework) {
      setSelectedRework(allReworks[0]);
      setFixNotes(allReworks[0].technicianFixNotes || '');
      setEvidencePhotos(allReworks[0].reworkCompletionEvidenceUrls || []);
    }
  };

  const handleSelectRework = (item: ReworkAssignmentRecord) => {
    setSelectedRework(item);
    setFixNotes(item.technicianFixNotes || '');
    setEvidencePhotos(item.reworkCompletionEvidenceUrls || []);
    setPartsNeededFlag(item.replacementPartsNeeded || false);
    setPartNotes(item.partOrderRef || '');
    setEscalateFlag(item.escalatedBiggerIssue || false);
    setEscalateNote(item.escalationNote || '');
  };

  const handleAddSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
    ];
    const newPic = samples[evidencePhotos.length % samples.length];
    setEvidencePhotos([...evidencePhotos, newPic]);
  };

  const handleMarkFixComplete = () => {
    if (!selectedRework) return;
    if (!fixNotes.trim()) {
      alert('Please enter details of the fix applied by the technician.');
      return;
    }
    if (evidencePhotos.length === 0) {
      alert('At least one photo of completion evidence is required for QC re-verification.');
      return;
    }

    const updated: ReworkAssignmentRecord = {
      ...selectedRework,
      technicianFixNotes: fixNotes,
      reworkCompletionEvidenceUrls: evidencePhotos,
      status: 'pending_qc_reverification',
      replacementPartsNeeded: partsNeededFlag,
      partOrderRef: partsNeededFlag ? partNotes : undefined,
      escalatedBiggerIssue: escalateFlag,
      escalationNote: escalateFlag ? escalationNote : undefined,
      updatedAt: new Date().toISOString()
    };

    DbManager.updateReworkAssignment(updated);

    // Synchronize linked snag status to 'pending_qc_reverification'
    const linkedSnag = snags.find(s => s.id === selectedRework.linkedSnagId);
    if (linkedSnag) {
      const updatedSnag: DefectSnagRecord = {
        ...linkedSnag,
        resolutionStatus: 'pending_qc_reverification',
        reworkNotes: fixNotes
      };
      DbManager.updateDefectSnag(updatedSnag);
    }

    setActionSuccessMsg(`Rework marked complete! Returned to Defect/Snag List as "Pending QC Re-Verification".`);
    setTimeout(() => setActionSuccessMsg(null), 5000);
    loadData();
  };

  const handleConfirmReassign = () => {
    if (!selectedRework || !newTechId) return;
    const targetTech = techniciansList.find(t => t.id === newTechId);
    const techName = targetTech ? `${targetTech.firstName} ${targetTech.lastName}` : newTechId;

    const updated: ReworkAssignmentRecord = {
      ...selectedRework,
      assignedTechnicianId: newTechId,
      assignedTechnicianName: techName,
      updatedAt: new Date().toISOString()
    };

    DbManager.updateReworkAssignment(updated);

    // Also update linked snag
    const linkedSnag = snags.find(s => s.id === selectedRework.linkedSnagId);
    if (linkedSnag) {
      DbManager.updateDefectSnag({
        ...linkedSnag,
        assignedTechnicianId: newTechId,
        assignedTechnicianName: techName
      });
    }

    setShowReassignModal(false);
    setActionSuccessMsg(`Rework reassigned to ${techName} with full historical context preserved.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    loadData();
  };

  const filteredReworks = reworkRecords.filter(r => {
    if (activeTab === 'my_assignments') {
      return r.assignedTechnicianId === user.id || user.role === 'admin';
    }
    if (activeTab === 'pending_reverification') {
      return r.status === 'pending_qc_reverification';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-primary)]">
                  Module 14 — QC & Handover
                </span>
                <span className="text-[var(--color-border)]">•</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">Job #{job?.jobNumber || jobId}</span>
              </div>
              <h1 className="text-lg font-bold font-serif text-[var(--color-text-primary)]">
                Rework Assignment & Fix Execution
              </h1>
            </div>
          </div>

          {onNavigateToSnagList && (
            <Button
              variant="outline"
              onClick={() => onNavigateToSnagList(jobId)}
              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-[var(--color-accent-primary)]" />
              Snag List
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner Alert */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{actionSuccessMsg}</p>
          </div>
        )}

        {/* Ascension Line Process Tracker */}
        <Card className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono uppercase text-[var(--color-text-secondary)]">SOP Workflow</span>
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Rework Cycle & QC Loop</h2>
            </div>
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <RefreshCw className="w-3 h-3 animate-spin" /> Independent QC Re-check Enforced
            </Badge>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-accent-primary)]/30">
            <div className="relative flex items-center gap-3">
              <div className="absolute -left-6 w-3 h-3 rounded-full bg-[var(--color-accent-primary)] ring-4 ring-[var(--color-surface)]" />
              <p className="text-xs font-medium text-[var(--color-text-primary)]">
                1. Snag Logged by QC Inspector with Evidence
              </p>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="absolute -left-6 w-3 h-3 rounded-full bg-[var(--color-accent-primary)] ring-4 ring-[var(--color-surface)] animate-pulse" />
              <p className="text-xs font-medium text-[var(--color-accent-primary)] font-semibold">
                2. Technician Fix Execution & Post-Fix Evidence Capture
              </p>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="absolute -left-6 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-[var(--color-surface)]" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                3. Mandatory Auto-Return to Snag List as "Pending Re-Verification"
              </p>
            </div>
          </div>
        </Card>

        {/* Filter Tabs */}
        <div className="flex border-b border-[var(--color-border)] gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'all'
                ? 'text-[var(--color-accent-primary)] font-bold border-b-2 border-[var(--color-accent-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            All Rework Tasks ({reworkRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('my_assignments')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'my_assignments'
                ? 'text-[var(--color-accent-primary)] font-bold border-b-2 border-[var(--color-accent-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            My Assignments
          </button>
          <button
            onClick={() => setActiveTab('pending_reverification')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'pending_reverification'
                ? 'text-[var(--color-accent-primary)] font-bold border-b-2 border-[var(--color-accent-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Pending Re-Verification
          </button>
        </div>

        {/* Main Content: Left Task List, Right Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Task List */}
          <div className="md:col-span-5 space-y-3">
            <span className="text-xs font-mono uppercase text-[var(--color-text-secondary)]">Active Snag Rework Items</span>

            {filteredReworks.length === 0 ? (
              <Card className="p-6 text-center text-[var(--color-text-secondary)]">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium">No active rework tasks found in this view.</p>
              </Card>
            ) : (
              filteredReworks.map(item => {
                const isSelected = selectedRework?.id === item.id;
                const isUrgent = item.dueUrgency === 'immediate_urgent';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectRework(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[var(--color-surface)] border-[var(--color-accent-primary)] shadow-md ring-1 ring-[var(--color-accent-primary)]'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)]">
                        {item.snagCode}
                      </span>
                      {isUrgent ? (
                        <Badge className="bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30">
                          <AlertOctagon className="w-3 h-3" /> Safety-Critical Urgent
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Due {item.dueDate}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1 mb-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1 min-w-0">
                        <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent-primary)] shrink-0" />
                        <span className="truncate max-w-[140px] min-w-0">{item.assignedTechnicianName}</span>
                      </div>
                      <span className={`capitalize font-medium ${
                        item.status === 'pending_qc_reverification' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detail & Fix Execution */}
          <div className="md:col-span-7 space-y-5">
            {selectedRework ? (
              <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-6">
                {/* Task Header */}
                <div className="border-b border-[var(--color-border)] pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)]">
                      {selectedRework.snagCode}
                    </span>
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' && (
                        <Button
                          variant="outline"
                          onClick={() => setShowReassignModal(true)}
                          className="text-xs py-1 px-2.5 flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                          Reassign Tech
                        </Button>
                      )}
                      <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 uppercase text-[10px]">
                        {selectedRework.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>

                  <h2 className="text-base font-bold font-serif text-[var(--color-text-primary)]">
                    {selectedRework.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)] pt-1">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                      <span>Assigned: <strong className="text-[var(--color-text-primary)]">{selectedRework.assignedTechnicianName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                      <span>Target: <strong className="text-[var(--color-text-primary)]">{selectedRework.dueDate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Original QC Finding & Photo Attachment */}
                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                      Original QC Finding & Evidence
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {selectedRework.qcOriginalNote}
                  </p>

                  {selectedRework.qcOriginalEvidenceUrls.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      {selectedRework.qcOriginalEvidenceUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="QC Snag Evidence"
                          className="w-16 h-16 rounded-lg object-cover border border-[var(--color-border)]"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Technician Fix Action Form */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Technician Action Log & Evidence
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      Fix Applied / Correction Details *
                    </label>
                    <textarea
                      value={fixNotes}
                      onChange={e => setFixNotes(e.target.value)}
                      rows={3}
                      placeholder="Describe exact physical/electrical adjustments made (e.g. re-torqued terminal connections, replaced battery charger board, adjusted door belt alignment)..."
                      className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]"
                    />
                  </div>

                  {/* Evidence Capture Gallery */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        Post-Fix Evidence Photos *
                      </label>
                      <Button
                        variant="outline"
                        onClick={handleAddSamplePhoto}
                        className="text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                        Capture Photo
                      </Button>
                    </div>

                    {evidencePhotos.length === 0 ? (
                      <div
                        onClick={handleAddSamplePhoto}
                        className="p-4 rounded-xl border border-dashed border-[var(--color-border)] text-center cursor-pointer hover:border-[var(--color-accent-primary)] transition-colors"
                      >
                        <Upload className="w-6 h-6 text-[var(--color-text-secondary)] mx-auto mb-1" />
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Tap to simulate camera capture of post-fix evidence
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {evidencePhotos.map((photo, i) => (
                          <div key={i} className="relative group shrink-0">
                            <img
                              src={photo}
                              alt="Fix Evidence"
                              className="w-20 h-20 rounded-xl object-cover border border-[var(--color-border)]"
                            />
                            <button
                              onClick={() => setEvidencePhotos(evidencePhotos.filter((_, idx) => idx !== i))}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edge Case 1: Missing / Replacement Parts Flow */}
                  <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-primary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partsNeededFlag}
                        onChange={e => setPartsNeededFlag(e.target.checked)}
                        className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                      />
                      <span>This rework requires a new replacement part not originally delivered</span>
                    </label>

                    {partsNeededFlag && (
                      <div className="pt-2 space-y-2">
                        <input
                          type="text"
                          value={partNotes}
                          onChange={e => setPartNotes(e.target.value)}
                          placeholder="Part name / specs (e.g. ARD 24V 18Ah Sealed Lead-Acid Battery Pack)..."
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                        />
                        {onNavigateToPartsRequest && (
                          <button
                            onClick={() => onNavigateToPartsRequest(jobId, selectedRework.linkedSnagId)}
                            className="text-xs text-[var(--color-accent-primary)] font-semibold flex items-center gap-1 hover:underline"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            Raise Damaged / Missing Parts Order & PR →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edge Case 3: Serious Underlying Issue Escalation */}
                  <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-primary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={escalateFlag}
                        onChange={e => setEscalateFlag(e.target.checked)}
                        className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                      />
                      <span>Escalate: Fix attempts uncovered a larger underlying mechanical/electrical issue</span>
                    </label>

                    {escalateFlag && (
                      <textarea
                        value={escalationNote}
                        onChange={e => setEscalateNote(e.target.value)}
                        rows={2}
                        placeholder="Explain underlying issue escalation for Chief QC Inspector review..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                      />
                    )}
                  </div>
                </div>

                {/* Primary Action CTA */}
                <div className="pt-2">
                  <Button
                    onClick={handleMarkFixComplete}
                    className="w-full py-3 bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/90 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    Mark Rework Complete & Return to QC for Re-Verification
                  </Button>
                  <p className="text-[11px] text-[var(--color-text-secondary)] text-center mt-2">
                    Enforces independent inspector re-check. Underlying snag status will update to "Pending Re-Verification".
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-[var(--color-text-secondary)]">
                <Wrench className="w-10 h-10 text-[var(--color-border)] mx-auto mb-2" />
                <p className="text-sm">Select a rework task on the left to view details and execute fix.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reassign Tech Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold font-serif text-[var(--color-text-primary)]">
                Reassign Rework Task
              </h3>
              <button
                onClick={() => setShowReassignModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Assign this snag rework task to a different qualified technician. All original QC evidence, notes, and history remain preserved.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Select Technician
              </label>
              <select
                value={newTechId}
                onChange={e => setNewTechId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
              >
                <option value="">-- Choose Qualified Technician --</option>
                {techniciansList.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.firstName} {tech.lastName} ({tech.specialization || 'Lift Installer'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowReassignModal(false)}
                className="w-1/2 py-2 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReassign}
                disabled={!newTechId}
                className="w-1/2 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-semibold"
              >
                Confirm Reassign
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
