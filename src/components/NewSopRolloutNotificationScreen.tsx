import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileText,
  HelpCircle,
  RotateCcw,
  Clock,
  Users,
  Plus,
  ArrowLeft,
  Sparkles,
  Search,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SopRolloutNotification, PartnerRolloutAcknowledgment, UserRole } from '../types';
import { Card, Button } from './Common';

interface NewSopRolloutNotificationScreenProps {
  userRole?: UserRole;
  partnerId?: string;
  currentLanguage?: 'en' | 'hi' | 'mr';
  onNavigateToSopRepo?: () => void;
  onNavigateToQuiz?: (quizId: string) => void;
  onBack?: () => void;
}

export const NewSopRolloutNotificationScreen: React.FC<NewSopRolloutNotificationScreenProps> = ({
  userRole = 'admin',
  partnerId = 'p_001',
  currentLanguage = 'en',
  onNavigateToSopRepo,
  onNavigateToQuiz,
  onBack
}) => {
  const [rollouts, setRollouts] = useState<SopRolloutNotification[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<PartnerRolloutAcknowledgment[]>([]);
  const [selectedRolloutId, setSelectedRolloutId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  // New Rollout Form State
  const [newSopCode, setNewSopCode] = useState<string>('SOP-SAF-003');
  const [newSopTitle, setNewSopTitle] = useState<string>('Overhead Machine Room Electrical Isolation Standard v3.2');
  const [newVersionNumber, setNewVersionNumber] = useState<string>('v3.2');
  const [newEffectiveDate, setNewEffectiveDate] = useState<string>('2026-08-25');
  const [newSummaryOfChange, setNewSummaryOfChange] = useState<string>('Added double-point earth leakage breaker verification and lockout tagout signoff prior to motor testing.');
  const [newIsUrgent, setNewIsUrgent] = useState<boolean>(true);
  const [newAffectedRoles, setNewAffectedRoles] = useState<UserRole[]>(['technician']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getSopRolloutNotifications();
    setRollouts(list);
    if (list.length > 0 && !selectedRolloutId) {
      setSelectedRolloutId(list[0].id);
      setAcknowledgments(DbManager.getPartnerRolloutAcknowledgments(list[0].id));
    } else if (selectedRolloutId) {
      setAcknowledgments(DbManager.getPartnerRolloutAcknowledgments(selectedRolloutId));
    }
  };

  const handleSelectRollout = (rId: string) => {
    setSelectedRolloutId(rId);
    setAcknowledgments(DbManager.getPartnerRolloutAcknowledgments(rId));
  };

  const handleCreateRollout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSopTitle || !newVersionNumber) return;

    DbManager.createSopRolloutNotification({
      sopDocumentId: 'sop_is14665_pit_01',
      sopCode: newSopCode,
      sopTitle: newSopTitle,
      versionNumber: newVersionNumber,
      effectiveDate: newEffectiveDate,
      affectedPartnerRoles: newAffectedRoles,
      summaryOfChange: newSummaryOfChange,
      isUrgentExpedited: newIsUrgent,
      status: 'published'
    });

    setActionSuccessMsg(`Successfully published new SOP Rollout: ${newSopTitle} (${newVersionNumber})`);
    setShowCreateModal(false);
    loadData();
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  const handlePartnerAcknowledge = (rolloutId: string) => {
    DbManager.acknowledgeSopRollout(rolloutId, partnerId, false);
    setActionSuccessMsg('Digital acknowledgment and signature recorded successfully!');
    loadData();
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  const handleRollback = (rolloutId: string) => {
    if (!window.confirm('Are you sure you want to trigger an emergency rollback for this SOP rollout?')) return;
    DbManager.rollbackSopRollout(rolloutId);
    setActionSuccessMsg('SOP Rollout status set to ROLLED BACK. Field technicians notified.');
    loadData();
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  const currentSelectedRollout = rollouts.find(r => r.id === selectedRolloutId) || rollouts[0];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 transition-all text-[var(--color-text-secondary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[var(--color-accent-primary)]" />
              <h1 className="text-xl md:text-2xl font-bold font-serif">New SOP Rollout & Change Broadcast</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Governance Communication
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Communicating technical & safety SOP updates directly to field engineers with mandatory digital sign-off.
            </p>
          </div>
        </div>

        {userRole === 'admin' && (
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="text-xs px-3 py-2 h-auto flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New SOP Rollout</span>
          </Button>
        )}
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-[var(--color-accent-secondary)]/15 border border-[var(--color-accent-secondary)]/30 rounded-xl text-xs font-semibold text-[var(--color-accent-secondary)] flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Active Rollouts vs Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Published SOP Rollouts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-serif uppercase tracking-wider text-[var(--color-text-secondary)]">
              Published SOP Rollouts
            </h2>
            <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)]">
              {rollouts.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {rollouts.map(r => {
              const isSelected = r.id === selectedRolloutId;
              const isRolledBack = r.status === 'rolled_back';

              return (
                <Card
                  key={r.id}
                  onClick={() => handleSelectRollout(r.id)}
                  className={`p-4 bg-[var(--color-surface)] border rounded-2xl cursor-pointer transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-[var(--color-accent-primary)] shadow-sm'
                      : isRolledBack
                      ? 'border-[var(--color-error)]/40 opacity-70'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-accent-primary)]">
                      {r.sopCode} • {r.versionNumber}
                    </span>
                    {r.isUrgentExpedited && !isRolledBack && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30">
                        URGENT SAFETY
                      </span>
                    )}
                    {isRolledBack && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                        ROLLED BACK
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-[var(--color-text-primary)] mt-2 line-clamp-2">
                    {currentLanguage === 'hi' && r.sopTitleHi ? r.sopTitleHi : currentLanguage === 'mr' && r.sopTitleMr ? r.sopTitleMr : r.sopTitle}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                    <span>Effective: {r.effectiveDate}</span>
                    <span className="font-mono font-semibold text-[var(--color-accent-secondary)]">
                      {Math.round((r.acknowledgedCount / (r.totalAffectedPartners || 1)) * 100)}% signed
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 cols): Detailed Inspection & Partner Sign-off */}
        {currentSelectedRollout && (
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-6 relative">
              {/* Ascension Line Motif */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[var(--color-accent-primary)] rounded-l-2xl" />

              <div className="pl-2 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)] uppercase bg-[var(--color-bg)] px-2.5 py-1 rounded-md border border-[var(--color-border)]">
                      {currentSelectedRollout.sopCode} • Version {currentSelectedRollout.versionNumber}
                    </span>
                    {currentSelectedRollout.isUrgentExpedited && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Urgent Expedited Safety Rollout
                      </span>
                    )}
                  </div>

                  {userRole === 'admin' && currentSelectedRollout.status !== 'rolled_back' && (
                    <Button
                      variant="outline"
                      onClick={() => handleRollback(currentSelectedRollout.id)}
                      className="text-xs px-2.5 py-1.5 h-auto text-[var(--color-error)] border-[var(--color-error)]/40 hover:bg-[var(--color-error)]/10"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Emergency Rollback</span>
                    </Button>
                  )}
                </div>

                <h2 className="text-lg md:text-xl font-bold font-serif text-[var(--color-text-primary)]">
                  {currentLanguage === 'hi' && currentSelectedRollout.sopTitleHi
                    ? currentSelectedRollout.sopTitleHi
                    : currentLanguage === 'mr' && currentSelectedRollout.sopTitleMr
                    ? currentSelectedRollout.sopTitleMr
                    : currentSelectedRollout.sopTitle}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)] border-y border-[var(--color-border)]/60 py-2.5">
                  <div>Published Date: <span className="font-semibold text-[var(--color-text-primary)]">{currentSelectedRollout.createdDate}</span></div>
                  <div>Enforcement Effective: <span className="font-semibold text-[var(--color-accent-primary)]">{currentSelectedRollout.effectiveDate}</span></div>
                  <div>Roles Affected: <span className="font-semibold capitalize text-[var(--color-text-primary)]">{currentSelectedRollout.affectedPartnerRoles.join(', ')}</span></div>
                </div>

                {/* Summary of Change */}
                <div className="space-y-1.5 bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)]">
                  <h4 className="text-xs font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
                    Summary of Standard Revision / Changes
                  </h4>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                    {currentLanguage === 'hi' && currentSelectedRollout.summaryOfChangeHi
                      ? currentSelectedRollout.summaryOfChangeHi
                      : currentLanguage === 'mr' && currentSelectedRollout.summaryOfChangeMr
                      ? currentSelectedRollout.summaryOfChangeMr
                      : currentSelectedRollout.summaryOfChange}
                  </p>
                </div>

                {/* Actions & Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {onNavigateToSopRepo && (
                    <Button
                      variant="outline"
                      onClick={onNavigateToSopRepo}
                      className="text-xs px-3 py-2 h-auto flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      <span>Read Full Document in SOP Repo</span>
                      <ExternalLink className="w-3 h-3 text-[var(--color-text-secondary)]" />
                    </Button>
                  )}

                  {currentSelectedRollout.quizIdOnChangedPortion && onNavigateToQuiz && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigateToQuiz(currentSelectedRollout.quizIdOnChangedPortion!)}
                      className="text-xs px-3 py-2 h-auto flex items-center gap-1.5 text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]/30"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Take 2-Min Micro-Quiz on Changed Portion</span>
                    </Button>
                  )}

                  {userRole !== 'admin' && (
                    <Button
                      variant="primary"
                      onClick={() => handlePartnerAcknowledge(currentSelectedRollout.id)}
                      className="text-xs px-4 py-2 h-auto flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Digital Sign & Acknowledge</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Real-Time Acknowledgment Progress Bar (Admin Oversight) */}
              <div className="pl-2 pt-4 border-t border-[var(--color-border)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Workforce Acknowledgment Progress
                  </span>
                  <span className="font-mono font-bold text-[var(--color-accent-secondary)]">
                    {currentSelectedRollout.acknowledgedCount} / {currentSelectedRollout.totalAffectedPartners} Techs ({Math.round((currentSelectedRollout.acknowledgedCount / (currentSelectedRollout.totalAffectedPartners || 1)) * 100)}%)
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-[var(--color-accent-secondary)] transition-all duration-500"
                    style={{ width: `${(currentSelectedRollout.acknowledgedCount / (currentSelectedRollout.totalAffectedPartners || 1)) * 100}%` }}
                  />
                </div>

                {/* Individual Acknowledgment Status Roster */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Field Sign-off Audit Trail</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {acknowledgments.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-secondary)] italic">No acknowledgment records logged yet.</p>
                    ) : (
                      acknowledgments.map(ack => (
                        <div
                          key={ack.id}
                          className="flex items-center justify-between p-2.5 bg-[var(--color-bg)]/60 rounded-xl border border-[var(--color-border)] text-xs"
                        >
                          <div>
                            <span className="font-bold text-[var(--color-text-primary)]">{ack.partnerName}</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] ml-2">({ack.territory})</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {ack.status === 'quiz_passed' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/30 flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Quiz Passed ({ack.quizScorePercent}%)
                              </span>
                            ) : ack.status === 'acknowledged' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30">
                                Signed & Acknowledged
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                Pending Sign-off
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Admin Publish Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="text-base font-bold font-serif">Publish New SOP Rollout Broadcast</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-200">✕</button>
            </div>

            <form onSubmit={handleCreateRollout} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">SOP Code</label>
                <input
                  type="text"
                  value={newSopCode}
                  onChange={e => setNewSopCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">SOP Title</label>
                <input
                  type="text"
                  value={newSopTitle}
                  onChange={e => setNewSopTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Version Number</label>
                  <input
                    type="text"
                    value={newVersionNumber}
                    onChange={e => setNewVersionNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Effective Enforcement Date</label>
                  <input
                    type="date"
                    value={newEffectiveDate}
                    onChange={e => setNewEffectiveDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Summary of Standard Changes</label>
                <textarea
                  value={newSummaryOfChange}
                  onChange={e => setNewSummaryOfChange(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentExpedited"
                  checked={newIsUrgent}
                  onChange={e => setNewIsUrgent(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)] cursor-pointer"
                />
                <label htmlFor="urgentExpedited" className="text-xs font-semibold text-[var(--color-error)] cursor-pointer">
                  Urgent Expedited Safety Rollout (Bypasses normal delay)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)} className="text-xs px-3 py-1.5 h-auto">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="text-xs px-4 py-1.5 h-auto">
                  Publish Rollout
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
