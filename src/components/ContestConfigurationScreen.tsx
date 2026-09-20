import React, { useState } from 'react';
import { 
  Trophy, Plus, Calendar, Target, Award, Users, AlertTriangle, 
  CheckCircle2, Clock, Play, StopCircle, ArrowLeft, Eye, Edit3, 
  Sparkles, Info, ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';
import { UserRole, CompetitionContest, LeaderboardEntry } from '../types';
import { DbManager } from '../lib/db';

interface ContestConfigurationScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  onNavigateToLeaderboard?: () => void;
  onBack?: () => void;
}

export const ContestConfigurationScreen: React.FC<ContestConfigurationScreenProps> = ({
  userRole,
  currentLanguage,
  onNavigateToLeaderboard,
  onBack
}) => {
  const [contests, setContests] = useState<CompetitionContest[]>(() => 
    DbManager.getCompetitionContests()
  );
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'history'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContestForPreview, setSelectedContestForPreview] = useState<CompetitionContest | null>(null);
  const [endEarlyReasonModalContest, setEndEarlyReasonModalContest] = useState<CompetitionContest | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState('');

  // Form State for New Contest
  const [formData, setFormData] = useState<Omit<CompetitionContest, 'id' | 'participantsCount'>>({
    title: '',
    description: '',
    category: 'technician',
    metricType: 'zero_defect_jobs',
    metricUnit: 'Jobs Completed',
    rewardPool: '₹1,00,000 Cash Pool',
    firstPrize: '₹50,000 + Gold Trophy',
    secondPrize: '₹30,000',
    thirdPrize: '₹20,000',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    isActive: true
  });

  const activeContests = contests.filter(c => c.isActive && new Date(c.endDate) >= new Date());
  const scheduledContests = contests.filter(c => c.isActive && new Date(c.startDate) > new Date());
  const historyContests = contests.filter(c => !c.isActive || new Date(c.endDate) < new Date());

  const handleSaveContest = (e: React.FormEvent) => {
    e.preventDefault();
    const newContest: CompetitionContest = {
      ...formData,
      id: `contest_${Date.now()}`,
      participantsCount: 30
    };
    DbManager.saveCompetitionContest(newContest);
    setContests(DbManager.getCompetitionContests());
    setShowCreateModal(false);
  };

  const handleEndEarlySubmit = () => {
    if (endEarlyReasonModalContest && cancelReasonText.trim()) {
      DbManager.endContestEarly(endEarlyReasonModalContest.id, cancelReasonText);
      setContests(DbManager.getCompetitionContests());
      setEndEarlyReasonModalContest(null);
      setCancelReasonText('');
    }
  };

  // Mock live simulation entries
  const previewLeaderboard: LeaderboardEntry[] = [
    {
      id: 'sim_1',
      contestId: selectedContestForPreview?.id || 'sim',
      rank: 1,
      partnerId: 'p_001',
      partnerName: 'Sanjay Tukaram Deshmukh',
      partnerRole: 'technician',
      partnerTier: 'gold',
      scoreValue: 18,
      scoreUnit: selectedContestForPreview?.metricUnit || 'Units',
      gapToNextRank: 0,
      trend: 'up',
      lastUpdated: 'Live Simulation'
    },
    {
      id: 'sim_2',
      contestId: selectedContestForPreview?.id || 'sim',
      rank: 2,
      partnerId: 'p_004',
      partnerName: 'Amit S. Kulkarni',
      partnerRole: 'technician',
      partnerTier: 'gold',
      scoreValue: 15,
      scoreUnit: selectedContestForPreview?.metricUnit || 'Units',
      gapToNextRank: 3,
      trend: 'same',
      lastUpdated: 'Live Simulation'
    },
    {
      id: 'sim_3',
      contestId: selectedContestForPreview?.id || 'sim',
      rank: 3,
      partnerId: 'p_007',
      partnerName: 'Rajendra Bhosale',
      partnerRole: 'technician',
      partnerTier: 'platinum',
      scoreValue: 12,
      scoreUnit: selectedContestForPreview?.metricUnit || 'Units',
      gapToNextRank: 3,
      trend: 'down',
      lastUpdated: 'Live Simulation'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
                <Trophy className="w-6 h-6 text-[var(--color-accent-primary)]" />
                Competition & Contest Control Engine
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Admin tool for defining partner competitions, metrics, lifecycle rules, and payout triggers
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Contest</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Metric Impact Guidance Bar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-sm text-[var(--color-text-primary)]">
                Automated Contest Payout Governance
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                When a contest concludes at midnight on its end date, the Commission Rules Engine automatically triggers reward entries into the Payout Approval Queue. Pre-simulations help detect perverse quality incentives prior to official launch.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[var(--color-border)] pb-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'active'
                ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Active Contests ({activeContests.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'scheduled'
                ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Scheduled ({scheduledContests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Historical Archive ({historyContests.length})
          </button>
        </div>

        {/* List of Contests based on Tab */}
        <div className="space-y-4">
          {((activeTab === 'active' ? activeContests : activeTab === 'scheduled' ? scheduledContests : historyContests)).map((contest) => (
            <div 
              key={contest.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:border-[var(--color-accent-primary)]/40 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      contest.isActive 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {contest.isActive ? 'LIVE CONTEST' : 'CONCLUDED / ARCHIVED'}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)] uppercase">
                      Category: {contest.category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mt-1.5">
                    {contest.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {contest.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-start md:self-auto">
                  <button
                    onClick={() => setSelectedContestForPreview(contest)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                    <span>Live Standings Simulation</span>
                  </button>

                  {contest.isActive && (
                    <button
                      onClick={() => setEndEarlyReasonModalContest(contest)}
                      className="p-2 rounded-xl text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors"
                      title="Conclude / Cancel Contest Early"
                    >
                      <StopCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Contest Rules & Reward Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-xs">
                <div>
                  <span className="text-[11px] text-[var(--color-text-secondary)] block">Scoring Metric</span>
                  <span className="font-semibold text-[var(--color-text-primary)] capitalize">
                    {contest.metricType.replace(/_/g, ' ')} ({contest.metricUnit})
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[var(--color-text-secondary)] block">Total Reward Pool</span>
                  <span className="font-mono font-bold text-[var(--color-accent-primary)]">
                    {contest.rewardPool}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[var(--color-text-secondary)] block">Duration</span>
                  <span className="font-mono text-[var(--color-text-primary)]">
                    {contest.startDate} to {contest.endDate}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-[var(--color-text-secondary)] block">Active Competitors</span>
                  <span className="font-mono font-bold text-[var(--color-text-primary)]">
                    {contest.participantsCount} Partners Enrolled
                  </span>
                </div>
              </div>

              {/* Prize Hierarchy Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="font-semibold text-[var(--color-text-secondary)]">Prizes:</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-medium">
                  🥇 1st: {contest.firstPrize}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-800 dark:text-slate-300 font-medium">
                  🥈 2nd: {contest.secondPrize}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-700/10 border border-amber-700/30 text-amber-900 dark:text-amber-400 font-medium">
                  🥉 3rd: {contest.thirdPrize}
                </span>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {((activeTab === 'active' && activeContests.length === 0) ||
            (activeTab === 'scheduled' && scheduledContests.length === 0) ||
            (activeTab === 'history' && historyContests.length === 0)) && (
            <div className="bg-[var(--color-surface)] rounded-2xl p-12 text-center border border-[var(--color-border)] space-y-3">
              <Trophy className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto" />
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">No Contests Found</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                No contest records match this tab. Create a new campaign to incentivize partners across Maharashtra.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Launch New Contest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Launch New Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--color-accent-primary)]" />
                Configure New Partner Competition
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Contest Title
                </label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Q3 Pune Zero-Defect Lift Installation Drive"
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Description & Operational Objectives
                </label>
                <textarea 
                  rows={2}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Incentivize flawless electrical wiring and 100% first-pass QC audits."
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                    Eligible Partner Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                  >
                    <option value="technician">Technicians (Installation & Service)</option>
                    <option value="surveyor">Surveyors (Site Dimensions & Leads)</option>
                    <option value="all_partners">All Accredited Partners</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                    Competed Metric
                  </label>
                  <select
                    value={formData.metricType}
                    onChange={e => {
                      const val = e.target.value as any;
                      let unit = 'Units';
                      if (val === 'zero_defect_jobs') unit = 'Jobs Completed';
                      if (val === 'lead_count') unit = 'Verified Leads';
                      if (val === 'conversion_value') unit = '₹ Deal Value';
                      if (val === 'speed_score') unit = 'Avg Rescue Minutes';
                      setFormData({ ...formData, metricType: val, metricUnit: unit });
                    }}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                  >
                    <option value="zero_defect_jobs">Zero Defect QC Passed Jobs</option>
                    <option value="lead_count">Verified Site Survey Lead Count</option>
                    <option value="conversion_value">Converted Deal Revenue Value</option>
                    <option value="speed_score">Emergency Response Speed Score</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                    Start Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                    End Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                <span className="block font-bold text-[var(--color-text-primary)]">
                  Reward Hierarchy Structure
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">🥇 1st Prize</label>
                    <input 
                      type="text"
                      required
                      value={formData.firstPrize}
                      onChange={e => setFormData({ ...formData, firstPrize: e.target.value })}
                      className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">🥈 2nd Prize</label>
                    <input 
                      type="text"
                      required
                      value={formData.secondPrize}
                      onChange={e => setFormData({ ...formData, secondPrize: e.target.value })}
                      className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[var(--color-text-secondary)] block mb-1">🥉 3rd Prize</label>
                    <input 
                      type="text"
                      required
                      value={formData.thirdPrize}
                      onChange={e => setFormData({ ...formData, thirdPrize: e.target.value })}
                      className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white text-xs font-bold shadow-sm hover:opacity-95"
                >
                  Confirm & Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulation / Live Standings Preview Modal */}
      {selectedContestForPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  Live Scoring Simulation
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Previewing current database ranks for: {selectedContestForPreview.title}
                </p>
              </div>
              <button 
                onClick={() => setSelectedContestForPreview(null)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {previewLeaderboard.map((entry) => (
                <div 
                  key={entry.id}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] font-bold flex items-center justify-center font-mono">
                      #{entry.rank}
                    </span>
                    <div>
                      <span className="font-bold text-[var(--color-text-primary)] block">{entry.partnerName}</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] uppercase">{entry.partnerRole} • Tier {entry.partnerTier}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-[var(--color-accent-primary)] block text-sm">
                      {entry.scoreValue} {entry.scoreUnit}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">Simulated Standing</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedContestForPreview(null)}
              className="w-full py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl"
            >
              Close Simulation
            </button>
          </div>
        </div>
      )}

      {/* Early Conclusion Modal */}
      {endEarlyReasonModalContest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base">Conclude Contest Early</h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Specify the operational reason for concluding "{endEarlyReasonModalContest.title}" early (e.g. unintended perverse quality incentive or market shift).
            </p>

            <textarea
              rows={3}
              value={cancelReasonText}
              onChange={e => setCancelReasonText(e.target.value)}
              placeholder="e.g. Adjusted contest criteria to prevent rushed site installation steps."
              className="w-full p-2.5 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-red-500 focus:outline-none"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setEndEarlyReasonModalContest(null)}
                className="px-3 py-2 text-xs text-[var(--color-text-secondary)]"
              >
                Back
              </button>
              <button
                onClick={handleEndEarlySubmit}
                disabled={!cancelReasonText.trim()}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl disabled:opacity-50"
              >
                Confirm Early Conclusion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
