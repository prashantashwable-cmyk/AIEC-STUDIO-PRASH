import React, { useState, useEffect } from 'react';
import {
  User,
  RecruitmentApplicantRecord,
  ApplicantScreeningScore
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Search,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  Briefcase,
  User as UserIcon,
  PhoneCall,
  Check,
  Edit3,
  Send,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Layers,
  ChevronRight,
  MessageSquare,
  Award,
  Clock
} from 'lucide-react';

interface ApplicantScreeningScreenProps {
  user: User;
  onNavigateToInterview?: (applicantId: string) => void;
  onNavigateToVerification?: (applicantId: string) => void;
  onBack?: () => void;
}

export const ApplicantScreeningScreen: React.FC<ApplicantScreeningScreenProps> = ({
  user,
  onNavigateToInterview,
  onNavigateToVerification,
  onBack
}) => {
  const [applicants, setApplicants] = useState<RecruitmentApplicantRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [selectedApplicant, setSelectedApplicant] = useState<RecruitmentApplicantRecord | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectMsg, setBulkRejectMsg] = useState(
    'Thank you for your interest in joining All India Elevators Company (AIEC). We have reviewed your application for our current drive. At this moment, we have moved forward with applicants whose profiles more closely match our immediate regional requirements. We will retain your profile in our candidate pool for future openings.'
  );

  // Manual Score Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideScore, setOverrideScore] = useState<number>(85);
  const [overrideReason, setOverrideReason] = useState('');

  // Decision Notes
  const [decisionNote, setDecisionNote] = useState('');

  // Reload data
  const loadData = () => {
    const list = DbManager.getRecruitmentApplicants();
    // Compute or verify score for applicants without explicit score object
    const scoredList = list.map(app => {
      if (!app.screeningScore) {
        const comp = (app.dob ? 10 : 0) + (app.fullAddress ? 10 : 0) + (app.referenceContacts && app.referenceContacts.length > 0 ? 10 : 0);
        const exp = Math.min(35, (app.experienceYears || 0) * 6 + (app.hasPriorElevatorExperience ? 10 : 0));
        const terr = app.territoryPreferences?.some(t => t.includes('PCMC') || t.includes('Chakan') || t.includes('West')) ? 30 : 20;
        const total = comp + exp + terr;
        const scoreObj: ApplicantScreeningScore = {
          totalScore: total,
          completenessScore: comp,
          experienceScore: exp,
          territoryNeedScore: terr,
          scoreBreakdownSummary: `Auto-computed score (${total}/100) based on profile details, ${app.experienceYears || 0} years experience, and territory priority.`
        };
        return { ...app, screeningScore: scoreObj };
      }
      return app;
    });
    setApplicants(scoredList);
    if (!selectedApplicant && scoredList.length > 0) {
      setSelectedApplicant(scoredList[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtering & Sorting (highest score first)
  const filteredApplicants = applicants
    .filter(a => {
      const matchSearch =
        a.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.applicantPhone.includes(searchTerm) ||
        (a.territoryPreferences && a.territoryPreferences.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchRole = roleFilter === 'all' || a.primaryRole === roleFilter;
      const score = a.screeningScore?.overriddenScore ?? a.screeningScore?.totalScore ?? 0;
      const matchScore = score >= minScoreFilter;
      return matchSearch && matchRole && matchScore;
    })
    .sort((a, b) => {
      const scoreA = a.screeningScore?.overriddenScore ?? a.screeningScore?.totalScore ?? 0;
      const scoreB = b.screeningScore?.overriddenScore ?? b.screeningScore?.totalScore ?? 0;
      return scoreB - scoreA;
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredApplicants.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Status Action Handler
  const handleUpdateStatus = (
    applicantId: string,
    newStatus: RecruitmentApplicantRecord['status'],
    note?: string
  ) => {
    const target = DbManager.getRecruitmentApplicantById(applicantId);
    if (!target) return;

    const updated: RecruitmentApplicantRecord = {
      ...target,
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? note : target.rejectionReason,
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updated);
    loadData();
    if (selectedApplicant?.id === applicantId) {
      setSelectedApplicant(updated);
    }
  };

  // Score Override Handler
  const handleApplyOverride = () => {
    if (!selectedApplicant || !overrideReason.trim()) return;

    const updatedScore: ApplicantScreeningScore = {
      ...selectedApplicant.screeningScore!,
      overriddenByAdmin: true,
      overriddenScore: overrideScore,
      overrideReason
    };

    const updated: RecruitmentApplicantRecord = {
      ...selectedApplicant,
      screeningScore: updatedScore,
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updated);
    setShowOverrideModal(false);
    setOverrideReason('');
    loadData();
    setSelectedApplicant(updated);
  };

  // Bulk Rejection Handler
  const handleExecuteBulkReject = () => {
    selectedIds.forEach(id => {
      const app = DbManager.getRecruitmentApplicantById(id);
      if (app) {
        DbManager.saveRecruitmentApplicant({
          ...app,
          status: 'rejected',
          rejectionReason: bulkRejectMsg,
          lastSavedAt: new Date().toISOString()
        });
      }
    });
    setSelectedIds([]);
    setShowBulkRejectModal(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Top Navigation & Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2"
              >
                ← Back to Dashboard
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                Applicant Screening & Automated Scoring Queue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Admin Triage
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Automated ranking based on completeness, elevator experience, and regional territory urgency in Pune.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                onClick={() => setShowBulkRejectModal(true)}
                className="bg-rose-600/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs px-3 py-2 font-semibold flex items-center gap-1.5 hover:bg-rose-600/20"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Bulk Polite Reject ({selectedIds.length})</span>
              </Button>
            )}

            <div className="text-right pl-4 border-l border-[var(--color-border)]">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
                Scored Candidates
              </div>
              <div className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
                {filteredApplicants.length} Active Applicants
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6">
        
        {/* Search, Filter & Scoring Tuning Controls */}
        <Card className="p-4 mb-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, phone, zone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Roles' },
                { id: 'technician', label: 'Technician' },
                { id: 'surveyor', label: 'Surveyor' },
                { id: 'supplier', label: 'Supplier' },
                { id: 'sales_rep', label: 'Sales' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    roleFilter === r.id
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Min Score Threshold */}
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-[var(--color-text-secondary)] font-medium">Min Score:</span>
              <select
                value={minScoreFilter}
                onChange={e => setMinScoreFilter(Number(e.target.value))}
                className="px-2 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none font-mono"
              >
                <option value={0}>0+ (All)</option>
                <option value={50}>50+ Score</option>
                <option value={75}>75+ Score (High Priority)</option>
                <option value={90}>90+ Score (Top Tier)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Master-Detail Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Candidate List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === filteredApplicants.length}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)]"
                />
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Select All</span>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">Sorted by AI Score</span>
            </div>

            {filteredApplicants.length === 0 ? (
              <Card className="p-8 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
                <UserIcon className="w-10 h-10 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">No Applicants Found</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Adjust your search keyword or score threshold filter.
                </p>
              </Card>
            ) : (
              filteredApplicants.map(app => {
                const scoreObj = app.screeningScore;
                const displayScore = scoreObj?.overriddenScore ?? scoreObj?.totalScore ?? 0;
                const isSelected = selectedApplicant?.id === app.id;
                const isChecked = selectedIds.includes(app.id);

                return (
                  <Card
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    className={`p-4 border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-surface)] ring-1 ring-[var(--color-accent-primary)] shadow-md'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            e.stopPropagation();
                            handleToggleSelectOne(app.id);
                          }}
                          className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{app.applicantName}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                              {app.primaryRole}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            {app.applicantPhone} • {app.experienceYears || 0} yrs exp
                          </div>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold text-center shrink-0 ${
                        displayScore >= 85
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : displayScore >= 70
                          ? 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      }`}>
                        {displayScore} / 100
                        {scoreObj?.overriddenByAdmin && <span className="block text-[8px] uppercase tracking-wider text-amber-600 font-semibold">Overridden</span>}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-[var(--color-accent-primary)] shrink-0" />
                        {app.territoryPreferences ? app.territoryPreferences.slice(0, 2).join(', ') : 'No zone preference'}
                      </span>
                      <span className="font-semibold capitalize text-[var(--color-accent-secondary)]">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* RIGHT: Detailed Screening Breakdown & Decision Actions */}
          <div className="lg:col-span-7">
            {selectedApplicant ? (
              <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 sticky top-6 shadow-lg">
                {/* Header Profile Info */}
                <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
                        {selectedApplicant.applicantName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                        {selectedApplicant.primaryRole}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      Source: <strong className="capitalize">{selectedApplicant.applicationSource.replace('_', ' ')}</strong> ({selectedApplicant.sourceDetails || 'Direct'})
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[var(--color-text-secondary)] font-medium">Status</div>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20">
                      {selectedApplicant.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Card */}
                {selectedApplicant.screeningScore && (
                  <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
                        <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                          Automated Score Breakdown
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setOverrideScore(selectedApplicant.screeningScore?.overriddenScore ?? selectedApplicant.screeningScore?.totalScore ?? 85);
                          setShowOverrideModal(true);
                        }}
                        className="text-xs text-[var(--color-accent-primary)] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Manual Score Override
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <div className="text-[10px] text-[var(--color-text-secondary)]">Completeness</div>
                        <div className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
                          {selectedApplicant.screeningScore.completenessScore} / 30
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <div className="text-[10px] text-[var(--color-text-secondary)]">Experience</div>
                        <div className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
                          {selectedApplicant.screeningScore.experienceScore} / 35
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <div className="text-[10px] text-[var(--color-text-secondary)]">Territory Need</div>
                        <div className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
                          {selectedApplicant.screeningScore.territoryNeedScore} / 35
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                      "{selectedApplicant.screeningScore.scoreBreakdownSummary}"
                    </p>

                    {selectedApplicant.screeningScore.overriddenByAdmin && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                        <strong>Admin Override Applied:</strong> {selectedApplicant.screeningScore.overrideReason}
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Overview Details */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider text-[11px]">
                    Application Snapshot
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <span className="text-[var(--color-text-secondary)]">Phone:</span>
                      <strong className="block text-[var(--color-text-primary)]">{selectedApplicant.applicantPhone}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                      <span className="text-[var(--color-text-secondary)]">Availability:</span>
                      <strong className="block text-[var(--color-text-primary)] capitalize">{selectedApplicant.availabilityTimeframe?.replace('_', ' ') || 'Immediate'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] col-span-2">
                      <span className="text-[var(--color-text-secondary)]">Preferred Zones:</span>
                      <strong className="block text-[var(--color-text-primary)]">{selectedApplicant.territoryPreferences?.join(', ') || 'All Pune'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] col-span-2">
                      <span className="text-[var(--color-text-secondary)]">Work Experience Summary:</span>
                      <p className="text-[var(--color-text-primary)] mt-0.5 italic">
                        "{selectedApplicant.experienceSummary || 'No detailed text provided.'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Screening Action Bar */}
                <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                  <h4 className="font-bold text-[var(--color-text-primary)] text-xs">Admin Triage Actions</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        handleUpdateStatus(selectedApplicant.id, 'interview_scheduled');
                        if (onNavigateToInterview) onNavigateToInterview(selectedApplicant.id);
                      }}
                      className="bg-[var(--color-accent-primary)] text-white text-xs py-2.5 font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Schedule Interview</span>
                    </Button>

                    <Button
                      onClick={() => {
                        handleUpdateStatus(selectedApplicant.id, 'under_review');
                        if (onNavigateToVerification) onNavigateToVerification(selectedApplicant.id);
                      }}
                      className="bg-[var(--color-accent-secondary)] text-white text-xs py-2.5 font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Direct Background Check</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected', 'Does not meet minimum requirements for active regional drive')}
                      className="w-full bg-rose-600/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs py-2 font-semibold hover:bg-rose-600/20"
                    >
                      Reject Application
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
                <UserIcon className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Select an Applicant</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Choose a candidate from the left queue to review automated scores and trigger next steps.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Score Override Modal */}
      {showOverrideModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span>Override Screening Score</span>
              </h3>
              <button onClick={() => setShowOverrideModal(false)} className="text-xs text-[var(--color-text-secondary)]">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                New Manual Score (0 - 100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={overrideScore}
                onChange={e => setOverrideScore(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Documented Reason for Override *
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Holds rare Mitsubishi elevator VFD certification not captured in standard score..."
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowOverrideModal(false)} className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                Cancel
              </Button>
              <Button onClick={handleApplyOverride} disabled={!overrideReason.trim()} className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-bold">
                Save Score Override
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Bulk Polite Rejection ({selectedIds.length} Applicants)</span>
              </h3>
              <button onClick={() => setShowBulkRejectModal(false)} className="text-xs text-[var(--color-text-secondary)]">✕</button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              This action sends a polite, brand-protective WhatsApp/SMS notification to the selected candidates and updates their status to Rejected.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Notification Template
              </label>
              <textarea
                rows={4}
                value={bulkRejectMsg}
                onChange={e => setBulkRejectMsg(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={() => setShowBulkRejectModal(false)} className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                Cancel
              </Button>
              <Button onClick={handleExecuteBulkReject} className="px-4 py-2 text-xs bg-rose-600 text-white font-bold">
                Confirm Bulk Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
