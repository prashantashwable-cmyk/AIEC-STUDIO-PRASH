import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, Cpu, Compass, Box, Clock, Calendar, AlertTriangle, 
  CheckCircle2, ArrowLeft, ChevronRight, Share2, Download, Trophy, 
  Sparkles, ExternalLink, RefreshCw, X, User as UserIcon, Lock
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { CertificationBadge, PartnerBadgeRecord, UserRole } from '../types';
import { Card, Button } from './Common';

interface CertificationBadgeProgressScreenProps {
  partnerId?: string;
  partnerName?: string;
  userRole?: UserRole;
  currentLanguage?: 'en' | 'hi' | 'mr';
  onNavigateToQuiz?: (assessmentId: string) => void;
  onNavigateToSopRepo?: () => void;
  onBack?: () => void;
}

export const CertificationBadgeProgressScreen: React.FC<CertificationBadgeProgressScreenProps> = ({
  partnerId = 'p_001',
  partnerName = 'Sanjay Tukaram Deshmukh',
  userRole = 'technician',
  currentLanguage = 'en',
  onNavigateToQuiz,
  onNavigateToSopRepo,
  onBack
}) => {
  const [allBadges, setAllBadges] = useState<CertificationBadge[]>([]);
  const [partnerBadgeRecords, setPartnerBadgeRecords] = useState<PartnerBadgeRecord[]>([]);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState<{
    badge: CertificationBadge;
    record?: PartnerBadgeRecord;
  } | null>(null);

  useEffect(() => {
    loadBadgeData();
  }, [partnerId]);

  const loadBadgeData = () => {
    const badges = DbManager.getCertificationBadges();
    const records = DbManager.getPartnerBadgeRecords(partnerId);
    setAllBadges(badges);
    setPartnerBadgeRecords(records);
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'Cpu': return Cpu;
      case 'Compass': return Compass;
      default: return Award;
    }
  };

  const getLocalizedBadgeName = (badge: CertificationBadge) => {
    if (currentLanguage === 'hi' && badge.badgeNameHi) return badge.badgeNameHi;
    if (currentLanguage === 'mr' && badge.badgeNameMr) return badge.badgeNameMr;
    return badge.badgeName;
  };

  // Mock Leaderboard Data
  const leaderboardData = [
    { rank: 1, name: 'Sanjay Tukaram Deshmukh', role: 'Sr. Elevator Technician', badgesCount: 4, score: 980, isCurrentUser: partnerId === 'p_001' },
    { rank: 2, name: 'Vikramaditya Rao', role: 'Lead Shaft Surveyor', badgesCount: 3, score: 890, isCurrentUser: partnerId === 'p_002' },
    { rank: 3, name: 'Anil Kulkarni', role: 'OEM Delivery Supervisor', badgesCount: 2, score: 760, isCurrentUser: false },
    { rank: 4, name: 'Rajesh Patil', role: 'QC Inspector', badgesCount: 2, score: 710, isCurrentUser: false },
    { rank: 5, name: 'Mahesh Pawar', role: 'Elevator Installer', badgesCount: 1, score: 540, isCurrentUser: false },
  ];

  const earnedCount = partnerBadgeRecords.length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h1 className="font-serif text-base font-bold">
                  {currentLanguage === 'hi' ? 'प्रमाणन बैज और प्रगति' : currentLanguage === 'mr' ? 'प्रमाणपत्र बॅज व प्रगती' : 'Certifications & Badges'}
                </h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                {partnerName} • Certified Skill Tiers
              </p>
            </div>
          </div>

          {onNavigateToSopRepo && (
            <Button
              variant="outline"
              onClick={onNavigateToSopRepo}
              className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span className="hidden sm:inline">SOP Library</span>
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
        {/* Top Motivational Summary Header Card */}
        <Card className="p-5 bg-gradient-to-br from-[var(--color-surface)] via-amber-500/5 to-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                MASTER SKILL TIER LEVEL 2
              </span>
              <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                {earnedCount} of {allBadges.length} Active Badges Unlocked
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Every badge directly unlocks high-value job eligibility tags in the AIEC dispatch engine.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 shrink-0 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1" />
              <span className="font-mono font-bold text-xs">RANK #1</span>
            </div>
          </div>

          {/* Expiring Soon Alert Callout if any */}
          {partnerBadgeRecords.some(r => r.renewalStatus === 'expiring_soon' || r.renewalStatus === 'expired') && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>One or more safety certifications require an annual refresher test.</span>
              </div>
              {onNavigateToQuiz && (
                <Button
                  onClick={() => onNavigateToQuiz('assess_001')}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1 font-semibold shrink-0"
                >
                  Renew Now
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* EARNED & AVAILABLE CERTIFICATION BADGES GRID */}
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] flex items-center justify-between">
            <span>Certification Badges & Skill Eligibility</span>
            <span className="font-mono text-xs text-[var(--color-accent-primary)] font-semibold">
              {earnedCount}/{allBadges.length} Unlocked
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allBadges.map(badge => {
              const record = partnerBadgeRecords.find(r => r.badgeId === badge.id);
              const isEarned = !!record;
              const IconComp = getBadgeIcon(badge.iconName);
              const localizedName = getLocalizedBadgeName(badge);

              return (
                <Card
                  key={badge.id}
                  onClick={() => isEarned && setSelectedCertificateModal({ badge, record })}
                  className={`p-4 border rounded-2xl transition-all relative overflow-hidden ${
                    isEarned 
                      ? 'bg-[var(--color-surface)] border-[var(--color-accent-primary)]/40 shadow-2xs hover:shadow-xs cursor-pointer group' 
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] opacity-70'
                  }`}
                >
                  {/* Background Watermark Accent */}
                  {isEarned && (
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-[var(--color-accent-primary)] pointer-events-none">
                      <IconComp className="w-24 h-24" />
                    </div>
                  )}

                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`p-3 rounded-2xl shrink-0 border transition-all ${
                      isEarned 
                        ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/20 group-hover:scale-105' 
                        : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}>
                      {isEarned ? <IconComp className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-bold text-[var(--color-accent-primary)]">
                          {badge.badgeCode}
                        </span>
                        {isEarned ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                            Locked
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)] leading-tight">
                        {localizedName}
                      </h4>

                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 pt-0.5">
                        {badge.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[var(--color-text-secondary)]">
                          Skill: <code className="text-[var(--color-accent-secondary)]">{badge.unlockedSkillTag}</code>
                        </span>
                      </div>

                      {isEarned && record && (
                        <div className="pt-2 border-t border-[var(--color-border)] mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-secondary)]">
                          <span>Issued: {record.issueDate}</span>
                          <span className="text-[var(--color-accent-primary)] font-semibold flex items-center gap-1 group-hover:underline">
                            View Cert <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}

                      {!isEarned && onNavigateToQuiz && (
                        <div className="pt-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToQuiz('assess_002');
                            }}
                            variant="outline"
                            className="w-full text-xs py-1 h-auto font-semibold border-[var(--color-accent-primary)]/40 text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10"
                          >
                            Take Assessment to Unlock
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* REGIONAL PARTNER LEADERBOARD */}
        <Card className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div>
              <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Regional Partner Skill Leaderboard
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Recognizing technical expertise, SOP compliance, and active badge achievements across Maharashtra.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--color-accent-primary)]">
              Q3 2026 Standings
            </span>
          </div>

          <div className="space-y-2">
            {leaderboardData.map(entry => (
              <div
                key={entry.rank}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  entry.isCurrentUser 
                    ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] ring-1 ring-[var(--color-accent-primary)]/30' 
                    : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-serif font-bold text-lg w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    entry.rank === 1 
                      ? 'bg-amber-500 text-white' 
                      : entry.rank === 2 
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : entry.rank === 3 
                          ? 'bg-amber-700 text-white' 
                          : 'text-[var(--color-text-secondary)] font-mono text-sm'
                  }`}>
                    {entry.rank}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[var(--color-text-primary)]">
                        {entry.name}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--color-accent-primary)] text-white font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-secondary)] block">
                      {entry.role}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="text-xs font-bold text-[var(--color-accent-primary)] block">
                    {entry.badgesCount} Badges
                  </span>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    {entry.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CERTIFICATE PREVIEW MODAL */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden space-y-4 p-6 relative">
            <button 
              onClick={() => setSelectedCertificateModal(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official AIEC Gold Certificate Frame */}
            <div className="p-6 border-4 border-double border-amber-500/40 rounded-xl bg-gradient-to-b from-amber-500/5 via-[var(--color-surface)] to-amber-500/5 text-center space-y-3 relative">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 block">
                ALL INDIA ELEVATORS COMPANY (AIEC)
              </span>

              <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)] uppercase tracking-wide">
                Certificate of Proficiency
              </h2>

              <p className="text-xs text-[var(--color-text-secondary)]">
                This is to officially certify that
              </p>

              <h3 className="font-serif font-bold text-base text-[var(--color-accent-primary)] border-b border-amber-500/30 pb-2 max-w-xs mx-auto">
                {partnerName}
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] pt-1">
                has successfully passed the formal assessment and is credentialed in
              </p>

              <p className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                {getLocalizedBadgeName(selectedCertificateModal.badge)}
              </p>

              {selectedCertificateModal.record && (
                <div className="pt-3 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
                  <span>Cert #: {selectedCertificateModal.record.certificateNumber}</span>
                  <span>Issued: {selectedCertificateModal.record.issueDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedCertificateModal(null)}
                className="text-xs px-3 py-1.5"
              >
                Close
              </Button>
              <Button
                onClick={() => alert('Certificate PDF downloaded for offline field verification.')}
                className="bg-[var(--color-accent-primary)] text-white text-xs px-4 py-1.5 font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Certificate</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
