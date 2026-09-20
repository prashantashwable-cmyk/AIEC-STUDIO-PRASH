import React, { useState } from 'react';
import { 
  Trophy, Award, Crown, TrendingUp, TrendingDown, Minus, 
  Clock, Zap, ShieldAlert, ArrowLeft, Star, ChevronRight, 
  Sparkles, CheckCircle2, User, Gift, Target, Info
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { CompetitionContest, LeaderboardEntry, UserRole } from '../types';

interface RewardsLeaderboardScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onNavigateToPayoutTracker?: () => void;
  onBack?: () => void;
}

export const RewardsLeaderboardScreen: React.FC<RewardsLeaderboardScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_004', // default to technician Amit Kulkarni for demo if needed
  onNavigateToPayoutTracker,
  onBack
}) => {
  const [contests] = useState<CompetitionContest[]>(() => DbManager.getCompetitionContests());
  const [selectedContestId, setSelectedContestId] = useState<string>(() => contests[0]?.id || 'contest_001');
  const [leaderboardEntries] = useState<LeaderboardEntry[]>(() => DbManager.getLeaderboardEntries());

  const activeContest = contests.find(c => c.id === selectedContestId) || contests[0];
  const contestLeaderboard = leaderboardEntries
    .filter(e => e.contestId === selectedContestId)
    .sort((a, b) => a.rank - b.rank);

  // Find logged-in user's entry
  const currentUserEntry = contestLeaderboard.find(e => e.partnerId === currentUserId) || contestLeaderboard[1]; // fallback to #2 Amit for preview

  // Top 3 Podium
  const top1 = contestLeaderboard.find(e => e.rank === 1);
  const top2 = contestLeaderboard.find(e => e.rank === 2);
  const top3 = contestLeaderboard.find(e => e.rank === 3);
  const remainingList = contestLeaderboard.filter(e => e.rank > 3);

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getTierBadge = (tier: string) => {
    switch(tier) {
      case 'diamond': return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300';
      case 'gold': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300';
      case 'silver': return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
      default: return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-black/5"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentLanguage === 'hi' ? 'पुरस्कार व प्रतिस्पर्धा लीडरबोर्ड' : currentLanguage === 'mr' ? 'बक्षीस व स्पर्धा लीडरबोर्ड' : 'Incentive & Rewards Leaderboard'}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">Module 17 • Prompt 165</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-[var(--color-text-primary)] mt-1">
                {currentLanguage === 'hi' ? 'प्रतिस्पर्धा रैंकिंग' : currentLanguage === 'mr' ? 'स्पर्धा रँकिंग' : 'Performance Championship'}
              </h1>
            </div>
          </div>

          {onNavigateToPayoutTracker && (
            <button
              onClick={onNavigateToPayoutTracker}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-black/5 flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              {currentLanguage === 'hi' ? 'स्टेज पेआउट ट्रैकर' : currentLanguage === 'mr' ? 'टप्पा पेआउट ट्रॅकर' : 'Payout Tracker'}
            </button>
          )}
        </div>
      </div>

      {/* Contest Selector Bar */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {contests.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedContestId(c.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedContestId === c.id
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{c.title}</span>
          </button>
        ))}
      </div>

      {/* Active Contest Hero Card */}
      {activeContest && (
        <div className="max-w-5xl mx-auto mb-6 p-6 rounded-3xl bg-gradient-to-br from-amber-950/20 via-[var(--color-surface)] to-emerald-950/20 border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Active Championship
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Ends in 12 days ({activeContest.endDate})
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                {activeContest.title}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xl">
                {activeContest.description}
              </p>

              {/* Prize Pool Breakdown */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="text-[10px] text-[var(--color-text-secondary)] block">Total Reward Pool</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400 font-bold">{activeContest.rewardPool}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs">
                  <span className="text-[10px] text-[var(--color-text-secondary)] block">1st Prize</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeContest.firstPrize}</span>
                </div>
              </div>
            </div>

            {/* Total Participants counter */}
            <div className="p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-center min-w-[140px]">
              <div className="text-xs text-[var(--color-text-secondary)] font-medium">Contenders</div>
              <div className="text-3xl font-bold font-mono text-[var(--color-accent-primary)] mt-1">
                {activeContest.participantsCount}
              </div>
              <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Active Partners</div>
            </div>
          </div>
        </div>
      )}

      {/* Logged-in User Standings Highlight Bar (PINNED) */}
      {currentUserEntry && (
        <div className="max-w-5xl mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-2 border-amber-500/40 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-serif font-bold text-xl flex items-center justify-center shadow-md">
                #{currentUserEntry.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Your Current Championship Rank
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold">
                    {currentUserEntry.partnerName}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5 flex items-center gap-2">
                  <span>Score: <strong className="font-mono text-amber-600 dark:text-amber-400">{currentUserEntry.scoreValue} {currentUserEntry.scoreUnit}</strong></span>
                  {getTrendIcon(currentUserEntry.trend)}
                </div>
              </div>
            </div>

            {/* Gap to next rank progress */}
            <div className="flex-1 max-w-xs bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--color-text-secondary)] font-medium">Distance to Rank #{currentUserEntry.rank - 1}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {currentUserEntry.gapToNextRank > 0 ? `+${currentUserEntry.gapToNextRank} needed` : 'Holding #1 Peak!'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: currentUserEntry.gapToNextRank > 0 ? `${Math.max(15, 100 - (currentUserEntry.gapToNextRank * 15))}%` : '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Visual */}
      <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Rank 2 Podium */}
        {top2 && (
          <div className="order-2 md:order-1 p-5 rounded-3xl bg-[var(--color-surface)] border border-slate-300 dark:border-slate-700 shadow-md text-center relative">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-lg mx-auto mb-2 flex items-center justify-center border border-slate-400">
              2
            </div>
            <Award className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{top2.partnerName}</h3>
            <div className={`text-[10px] inline-block px-2 py-0.5 rounded-full mt-1 uppercase font-bold border ${getTierBadge(top2.partnerTier)}`}>
              {top2.partnerTier} Tier
            </div>
            <div className="mt-3 text-lg font-bold font-mono text-[var(--color-accent-primary)]">
              {top2.scoreValue} <span className="text-xs font-normal text-[var(--color-text-secondary)]">{top2.scoreUnit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">Silver Ascension Trophy</div>
          </div>
        )}

        {/* Rank 1 Podium (Tallest & Central) */}
        {top1 && (
          <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 via-[var(--color-surface)] to-[var(--color-surface)] border-2 border-amber-500 shadow-xl text-center relative md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Crown className="w-3 h-3" /> Championship Leader
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-500 text-white font-bold text-2xl mx-auto my-2 flex items-center justify-center shadow-lg ring-4 ring-amber-500/20">
              1
            </div>
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-1 animate-bounce" />
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">{top1.partnerName}</h3>
            <div className={`text-[10px] inline-block px-2 py-0.5 rounded-full mt-1 uppercase font-bold border ${getTierBadge(top1.partnerTier)}`}>
              {top1.partnerTier} Tier
            </div>
            <div className="mt-3 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {top1.scoreValue} <span className="text-xs font-normal text-[var(--color-text-secondary)]">{top1.scoreUnit}</span>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
              Grand Winner • {activeContest?.firstPrize}
            </div>
          </div>
        )}

        {/* Rank 3 Podium */}
        {top3 && (
          <div className="order-3 p-5 rounded-3xl bg-[var(--color-surface)] border border-amber-700/30 shadow-md text-center relative">
            <div className="w-10 h-10 rounded-full bg-amber-800/20 text-amber-700 dark:text-amber-400 font-bold text-lg mx-auto mb-2 flex items-center justify-center border border-amber-700/40">
              3
            </div>
            <Award className="w-6 h-6 text-amber-700 mx-auto mb-1" />
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{top3.partnerName}</h3>
            <div className={`text-[10px] inline-block px-2 py-0.5 rounded-full mt-1 uppercase font-bold border ${getTierBadge(top3.partnerTier)}`}>
              {top3.partnerTier} Tier
            </div>
            <div className="mt-3 text-lg font-bold font-mono text-[var(--color-accent-primary)]">
              {top3.scoreValue} <span className="text-xs font-normal text-[var(--color-text-secondary)]">{top3.scoreUnit}</span>
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">Bronze Ascension Shield</div>
          </div>
        )}
      </div>

      {/* Remaining Leaderboard List */}
      <div className="max-w-5xl mx-auto space-y-3">
        <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-between">
          <span>Full Championship Standings</span>
          <span>Verified QC &amp; Deal Conversion Score</span>
        </h3>

        {remainingList.map((entry) => {
          const isCurrentUser = entry.partnerId === currentUserId;

          return (
            <div 
              key={entry.id}
              className={`p-4 rounded-2xl bg-[var(--color-surface)] border transition-all ${
                isCurrentUser 
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm' 
                  : 'border-[var(--color-border)] hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] font-mono font-bold text-sm flex items-center justify-center text-[var(--color-text-secondary)]">
                    #{entry.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                        {entry.partnerName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                          YOU
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${getTierBadge(entry.partnerTier)}`}>
                        {entry.partnerTier}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-2">
                      <span>{entry.partnerRole}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Trend: {getTrendIcon(entry.trend)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[var(--color-accent-primary)]">
                    {entry.scoreValue} <span className="text-xs font-normal text-[var(--color-text-secondary)]">{entry.scoreUnit}</span>
                  </div>
                  {entry.gapToNextRank > 0 && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                      -{entry.gapToNextRank} from #{entry.rank - 1}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Recalculation Disclaimer Footer */}
      <div className="max-w-5xl mx-auto mt-8 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Championship Integrity &amp; Transparency:</strong> Scores are calculated directly from verified site dimension surveys, client deal conversion contracts, and zero-defect QC electrical audit passes. Recalculated live every day at 18:00 IST.
        </div>
      </div>
    </div>
  );
};
