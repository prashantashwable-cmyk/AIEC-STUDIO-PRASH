import React, { useState } from 'react';
import { 
  Award, ShieldCheck, Compass, Medal, Cpu, TrendingUp, Zap, 
  Share2, CheckCircle2, Lock, Sparkles, Copy, ArrowLeft, Download, 
  ExternalLink, ChevronRight, Info, Filter
} from 'lucide-react';
import { UserRole, UnifiedBadgeMilestone } from '../types';
import { DbManager } from '../lib/db';

interface BadgesMilestonesScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onNavigateToLeaderboard?: () => void;
  onNavigateToTraining?: () => void;
  onBack?: () => void;
}

export const BadgesMilestonesScreen: React.FC<BadgesMilestonesScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onNavigateToLeaderboard,
  onNavigateToTraining,
  onBack
}) => {
  const [badges, setBadges] = useState<UnifiedBadgeMilestone[]>(() => 
    DbManager.getUnifiedBadgesForPartner(currentUserId)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shareModalBadge, setShareModalBadge] = useState<UnifiedBadgeMilestone | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedBadgeDetail, setSelectedBadgeDetail] = useState<UnifiedBadgeMilestone | null>(null);

  // Filtered list
  const filteredBadges = badges.filter(b => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'earned') return b.isEarned;
    if (selectedCategory === 'in_progress') return !b.isEarned;
    return b.category === selectedCategory;
  });

  const earnedCount = badges.filter(b => b.isEarned).length;
  const totalCount = badges.length;
  const overallProgressPct = Math.round((earnedCount / totalCount) * 100);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return <Award className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      case 'Compass': return <Compass className="w-6 h-6" />;
      case 'Medal': return <Medal className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getRarityBadgeStyle = (tier: string, percent: number) => {
    switch (tier) {
      case 'legendary':
        return {
          label: `Legendary (${percent}% Partners)`,
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/60',
          gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20'
        };
      case 'epic':
        return {
          label: `Epic (Top ${percent}%)`,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700/60',
          gradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-600/20'
        };
      case 'rare':
        return {
          label: `Rare (${percent}% Achieved)`,
          bg: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700/60',
          gradient: 'from-blue-500/20 via-indigo-500/10 to-blue-600/20'
        };
      default:
        return {
          label: `Milestone (${percent}% Base)`,
          bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
          gradient: 'from-slate-500/10 to-slate-600/10'
        };
    }
  };

  const getLocalizedName = (badge: UnifiedBadgeMilestone) => {
    if (currentLanguage === 'hi' && badge.badgeNameHi) return badge.badgeNameHi;
    if (currentLanguage === 'mr' && badge.badgeNameMr) return badge.badgeNameMr;
    return badge.badgeName;
  };

  const handleCopyShareLink = (badge: UnifiedBadgeMilestone) => {
    const url = `https://aiec.app/portfolio/verify-badge?cert=${badge.certificateNumber || badge.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
                <Award className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'बैज एवं मील के पत्थर' : currentLanguage === 'mr' ? 'बॅजेस आणि टप्पे' : 'Badges & Milestones'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'आपकी प्रमाणित उपलब्धियाँ, सुरक्षा प्रमाणपत्र और सम्मान पदवी' : 'Unified performance, training & safety achievement record'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setShareModalBadge(badges.find(b => b.isEarned) || badges[0])}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 hover:bg-[var(--color-accent-primary)] hover:text-white transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {currentLanguage === 'hi' ? 'पोर्टफोलियो साझा करें' : 'Share Portfolio'}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Banner Summary Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)] border border-[var(--color-accent-primary)]/30 p-6 shadow-md">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[var(--color-accent-primary)]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--color-accent-primary)]/15 border border-[var(--color-accent-primary)]/30 text-[var(--color-accent-primary)] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AIEC Accredited Partner Portfolio</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
                {earnedCount} of {totalCount} Badges Unlocked
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-lg">
                Calculated dynamically from real site audits, QC certification assessments, and verified stage milestones. Earned credentials are permanently honored.
              </p>
            </div>

            {/* Ascending Progress Ring / Rail */}
            <div className="flex items-center space-x-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm min-w-[220px]">
              <div className="relative w-14 h-14 flex items-center justify-center font-mono font-bold text-lg text-[var(--color-accent-primary)]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[var(--color-border)]"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[var(--color-accent-primary)] transition-all duration-700 ease-out"
                    strokeDasharray={`${overallProgressPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute">{overallProgressPct}%</span>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Mastery Level
                </div>
                <div className="text-sm font-semibold text-[var(--color-accent-primary)] mt-0.5">
                  {earnedCount >= 5 ? 'Senior Accredited Expert' : 'Professional Specialist'}
                </div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  {totalCount - earnedCount} badges in reach
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--color-border)]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            onClick={() => setSelectedCategory('earned')}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'earned'
                ? 'bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            Earned ({earnedCount})
          </button>
          <button
            onClick={() => setSelectedCategory('in_progress')}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'in_progress'
                ? 'bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            In Progress ({totalCount - earnedCount})
          </button>
          <button
            onClick={() => setSelectedCategory('quality')}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'quality'
                ? 'bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            QC & Quality
          </button>
          <button
            onClick={() => setSelectedCategory('safety')}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'safety'
                ? 'bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            Safety
          </button>
          <button
            onClick={() => setSelectedCategory('performance')}
            className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'performance'
                ? 'bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            Performance
          </button>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBadges.map((badge) => {
            const rarityInfo = getRarityBadgeStyle(badge.rarityTier, badge.rarityPercent);
            const isCompleted = badge.isEarned;
            const progressPct = Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100));

            return (
              <div 
                key={badge.id}
                className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isCompleted 
                    ? 'bg-[var(--color-surface)] border-[var(--color-accent-primary)]/40 shadow-sm hover:shadow-md' 
                    : 'bg-[var(--color-surface)]/60 border-[var(--color-border)] opacity-85 hover:opacity-100'
                }`}
              >
                {/* Background rarity glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityInfo.gradient} rounded-2xl pointer-events-none opacity-50`} />

                <div className="relative z-10 space-y-4">
                  
                  {/* Top Row: Category & Rarity */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${rarityInfo.bg}`}>
                      {rarityInfo.label}
                    </span>
                    
                    <span className="text-[11px] font-mono text-[var(--color-text-secondary)] uppercase tracking-wider">
                      {badge.category}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start space-x-4">
                    <div className={`p-3.5 rounded-2xl border flex-shrink-0 transition-transform duration-200 ${
                      isCompleted 
                        ? 'bg-[var(--color-accent-primary)]/15 border-[var(--color-accent-primary)]/40 text-[var(--color-accent-primary)] shadow-sm' 
                        : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}>
                      {getBadgeIcon(badge.iconName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-[var(--color-text-primary)] leading-snug">
                          {getLocalizedName(badge)}
                        </h3>
                        {isCompleted && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-secondary)] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Ascension Line Progress Rail for In-Progress or Criteria for Earned */}
                  {!isCompleted ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[var(--color-text-secondary)]">Progress to unlock</span>
                        <span className="font-mono font-bold text-[var(--color-accent-primary)]">
                          {badge.currentProgress.toLocaleString()} / {badge.targetProgress.toLocaleString()} {badge.unitLabel}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--color-bg)]/80 p-2.5 rounded-xl border border-[var(--color-border)] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-[var(--color-text-secondary)] block">Certificate No.</span>
                        <span className="font-mono font-semibold text-[var(--color-accent-primary)]">{badge.certificateNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-[var(--color-text-secondary)] block">Earned Date</span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{badge.earnedDate}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="relative z-10 pt-4 mt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                  {isCompleted ? (
                    <button
                      onClick={() => setShareModalBadge(badge)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[var(--color-accent-primary)]/10 hover:bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] font-semibold text-xs transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Credential Card</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center space-x-1 font-mono text-[11px]">
                        <Info className="w-3.5 h-3.5" />
                        <span>Rule {badge.earningCriteriaVersion || 'v2026'} Locked</span>
                      </span>
                      {badge.category === 'training' && onNavigateToTraining && (
                        <button
                          onClick={onNavigateToTraining}
                          className="text-[var(--color-accent-primary)] font-semibold hover:underline flex items-center space-x-1"
                        >
                          <span>Start Training</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-12 text-center border border-[var(--color-border)] space-y-3">
            <Award className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto" />
            <h3 className="font-bold text-lg text-[var(--color-text-primary)]">No Badges Match Selected Filter</h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto">
              Select another category or view all badges to track your professional milestone path across AIEC.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Shareable Credential Modal */}
      {shareModalBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                  Accredited Credential
                </h3>
              </div>
              <button 
                onClick={() => setShareModalBadge(null)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Visual Credential Card Preview */}
            <div className="bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] border-2 border-[var(--color-accent-primary)] p-6 rounded-2xl text-center space-y-3 relative overflow-hidden shadow-inner">
              <div className="inline-flex p-4 rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30">
                {getBadgeIcon(shareModalBadge.iconName)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-primary)] block">
                  ALL INDIA ELEVATORS COMPANY
                </span>
                <h4 className="font-serif font-bold text-xl text-[var(--color-text-primary)] mt-1">
                  {getLocalizedName(shareModalBadge)}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 px-2">
                  {shareModalBadge.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[var(--color-text-secondary)] block">CERTIFICATE NO.</span>
                  <span className="font-bold text-[var(--color-accent-primary)]">{shareModalBadge.certificateNumber || 'CERT-AIEC-2026'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-secondary)] block">RARITY TIER</span>
                  <span className="font-bold capitalize text-[var(--color-accent-secondary)]">{shareModalBadge.rarityTier} ({shareModalBadge.rarityPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleCopyShareLink(shareModalBadge)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[var(--color-accent-primary)] text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedLink ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
              </button>

              <button
                onClick={() => setShareModalBadge(null)}
                className="w-full py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
