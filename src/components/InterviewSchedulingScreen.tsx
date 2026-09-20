import React, { useState, useEffect } from 'react';
import {
  User,
  RecruitmentApplicantRecord,
  ApplicantInterviewRecord
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Calendar,
  Clock,
  Phone,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Plus,
  RefreshCw,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  XCircle,
  FileText
} from 'lucide-react';

interface InterviewSchedulingScreenProps {
  user: User;
  applicantId?: string;
  onNavigateToVerification?: (applicantId: string) => void;
  onBack?: () => void;
}

export const InterviewSchedulingScreen: React.FC<InterviewSchedulingScreenProps> = ({
  user,
  applicantId,
  onNavigateToVerification,
  onBack
}) => {
  const [applicant, setApplicant] = useState<RecruitmentApplicantRecord | null>(null);
  const [allApplicants, setAllApplicants] = useState<RecruitmentApplicantRecord[]>([]);

  // Selected Date/Slot State
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-14');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:00 AM');
  const [interviewMode, setInterviewMode] = useState<'phone' | 'video' | 'in_person'>('phone');
  const [locationOrLink, setLocationOrLink] = useState('Phone Call (+91 98220 11223)');

  // Post-Interview Notes State
  const [interviewNotes, setInterviewNotes] = useState('');
  const [qualitativeRating, setQualitativeRating] = useState<'excellent' | 'adequate' | 'concerns' | 'unfavorable'>('excellent');
  const [outcome, setOutcome] = useState<'passed' | 'rejected' | 'needs_followup' | 'pending'>('pending');

  // Reschedule Modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Available Admin Slots
  const availableSlots = [
    '09:30 AM',
    '11:00 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM'
  ];

  useEffect(() => {
    const list = DbManager.getRecruitmentApplicants();
    setAllApplicants(list);

    const targetId = applicantId || (list.length > 0 ? list[0].id : '');
    const found = list.find(a => a.id === targetId);
    if (found) {
      setApplicant(found);
      if (found.interviewRecord) {
        setInterviewNotes(found.interviewRecord.notes || '');
        if (found.interviewRecord.qualitativeRating) setQualitativeRating(found.interviewRecord.qualitativeRating);
        if (found.interviewRecord.outcome) setOutcome(found.interviewRecord.outcome);
        if (found.interviewRecord.mode) setInterviewMode(found.interviewRecord.mode);
      }
    }
  }, [applicantId]);

  const handleSelectApplicant = (app: RecruitmentApplicantRecord) => {
    setApplicant(app);
    if (app.interviewRecord) {
      setInterviewNotes(app.interviewRecord.notes || '');
      if (app.interviewRecord.qualitativeRating) setQualitativeRating(app.interviewRecord.qualitativeRating);
      if (app.interviewRecord.outcome) setOutcome(app.interviewRecord.outcome);
      if (app.interviewRecord.mode) setInterviewMode(app.interviewRecord.mode);
    } else {
      setInterviewNotes('');
      setQualitativeRating('excellent');
      setOutcome('pending');
    }
  };

  // Schedule / Save Interview
  const handleConfirmSchedule = () => {
    if (!applicant) return;

    const record: ApplicantInterviewRecord = {
      id: applicant.interviewRecord?.id || `int_${Date.now()}`,
      slotDateTime: `${selectedDate}T${selectedTimeSlot === '11:00 AM' ? '11:00:00Z' : '15:00:00Z'}`,
      mode: interviewMode,
      locationOrLink,
      interviewerName: 'Mr. Prashant Vasant Wable',
      status: 'scheduled',
      notes: interviewNotes,
      qualitativeRating,
      outcome,
      reminderSent: true
    };

    const updated: RecruitmentApplicantRecord = {
      ...applicant,
      interviewRecord: record,
      status: 'interview_scheduled',
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updated);
    setApplicant(updated);
    setAllApplicants(DbManager.getRecruitmentApplicants());
  };

  // Save Interview Assessment & Outcome
  const handleSaveAssessment = (finalOutcome: 'passed' | 'rejected' | 'needs_followup') => {
    if (!applicant || !applicant.interviewRecord) return;

    const updatedRecord: ApplicantInterviewRecord = {
      ...applicant.interviewRecord,
      status: 'completed',
      notes: interviewNotes,
      qualitativeRating,
      outcome: finalOutcome
    };

    const updatedApplicant: RecruitmentApplicantRecord = {
      ...applicant,
      interviewRecord: updatedRecord,
      status: finalOutcome === 'passed' ? 'under_review' : finalOutcome === 'rejected' ? 'rejected' : 'interview_scheduled',
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updatedApplicant);
    setApplicant(updatedApplicant);
    setAllApplicants(DbManager.getRecruitmentApplicants());

    if (finalOutcome === 'passed' && onNavigateToVerification) {
      onNavigateToVerification(applicant.id);
    }
  };

  // Execute Reschedule
  const handleConfirmReschedule = () => {
    if (!applicant || !applicant.interviewRecord) return;

    const updatedRecord: ApplicantInterviewRecord = {
      ...applicant.interviewRecord,
      status: 'rescheduled',
      rescheduleReason,
      slotDateTime: `${selectedDate}T14:00:00Z`,
      reminderSent: true
    };

    const updatedApplicant: RecruitmentApplicantRecord = {
      ...applicant,
      interviewRecord: updatedRecord,
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updatedApplicant);
    setApplicant(updatedApplicant);
    setShowRescheduleModal(false);
    setRescheduleReason('');
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
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2"
              >
                ← Back to Recruitment Landing
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                Interview Scheduling & Qualitative Assessment
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Module 15 • Step 4
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Self-service slots, automated WhatsApp reminders, and qualitative interview note capture.
            </p>
          </div>

          {applicant && (
            <div className="text-right">
              <div className="text-xs text-[var(--color-text-secondary)]">Active Candidate</div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">{applicant.applicantName}</div>
              <span className="text-[10px] font-mono text-[var(--color-accent-secondary)] capitalize">
                Role: {applicant.primaryRole}
              </span>
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
            
            {/* LEFT: Slot Picker & Mode Config */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                  <Calendar className="w-4 h-4 text-[var(--color-accent-primary)]" />
                  <span>Select Date & Time Window</span>
                </h2>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  />
                </div>

                {/* Available Slot Pills */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Admin Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2 rounded-lg border text-center text-xs font-mono transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] font-bold'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interview Mode Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Interview Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'phone', label: 'Phone Call', icon: Phone },
                      { id: 'video', label: 'Video Call', icon: Video },
                      { id: 'in_person', label: 'In-Person', icon: MapPin }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setInterviewMode(m.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          interviewMode === m.id
                            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)]'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        <m.icon className="w-4 h-4 text-[var(--color-accent-primary)]" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location / Meeting Link Details */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Meeting Link or Address Details
                  </label>
                  <input
                    type="text"
                    value={locationOrLink}
                    onChange={e => setLocationOrLink(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  />
                </div>

                <Button
                  onClick={handleConfirmSchedule}
                  className="w-full bg-[var(--color-accent-primary)] text-white text-xs py-3 font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Slot & Trigger Reminder</span>
                </Button>
              </Card>

              {/* Scheduled Status Box */}
              {applicant.interviewRecord && (
                <Card className="p-4 border-emerald-500/30 bg-emerald-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Interview Slot Confirmed</span>
                    </div>
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="text-xs text-[var(--color-accent-primary)] underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reschedule Slot
                    </button>
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Scheduled for <strong>{applicant.interviewRecord.slotDateTime}</strong> via <strong className="capitalize">{applicant.interviewRecord.mode}</strong>. Automated SMS/WhatsApp invite sent.
                  </div>
                </Card>
              )}
            </div>

            {/* RIGHT: Interview Notes Capture & Final Screening Decision */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-md">
                <h2 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                  <FileText className="w-4 h-4 text-[var(--color-accent-primary)]" />
                  <span>Post-Interview Qualitative Notes</span>
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Qualitative Assessment Rating
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'excellent', label: 'Excellent Match', color: 'text-emerald-600' },
                      { id: 'adequate', label: 'Adequate Capability', color: 'text-blue-600' },
                      { id: 'concerns', label: 'Minor Safety Concerns', color: 'text-amber-600' },
                      { id: 'unfavorable', label: 'Unfavorable / Unfit', color: 'text-rose-600' }
                    ].map(q => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setQualitativeRating(q.id as any)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          qualitativeRating === q.id
                            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] ring-1 ring-[var(--color-accent-primary)]'
                            : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        <span className={q.color}>●</span> {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Interviewer Observations & Key Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Record notes on mechanical competence, punctuality, communication style, safety awareness, and tool familiarity..."
                    value={interviewNotes}
                    onChange={e => setInterviewNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                  />
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">Final Interview Outcome</div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleSaveAssessment('passed')}
                      className="bg-emerald-600 text-white text-xs py-2.5 font-bold flex items-center justify-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>Pass → To Verification</span>
                    </Button>

                    <Button
                      onClick={() => handleSaveAssessment('rejected')}
                      className="bg-rose-600 text-white text-xs py-2.5 font-bold flex items-center justify-center gap-1.5 shadow"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Candidate</span>
                    </Button>
                  </div>
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

      {/* Reschedule Modal */}
      {showRescheduleModal && applicant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span>Low-Friction Reschedule</span>
              </h3>
              <button onClick={() => setShowRescheduleModal(false)} className="text-xs text-[var(--color-text-secondary)]">✕</button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Specify the reason for rescheduling. A new invitation link will be dispatched automatically.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Reschedule Reason
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Applicant requested evening slot due to ongoing site duty..."
                value={rescheduleReason}
                onChange={e => setRescheduleReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowRescheduleModal(false)} className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                Cancel
              </Button>
              <Button onClick={handleConfirmReschedule} className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-bold">
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
