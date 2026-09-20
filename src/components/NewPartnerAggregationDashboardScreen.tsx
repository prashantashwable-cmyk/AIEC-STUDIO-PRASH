import React, { useState, useEffect } from 'react';
import { User, RecruitmentApplicantRecord, TerritoryNeedCoverageData } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Users,
  Filter,
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserPlus,
  RefreshCw,
  Search,
  Layers,
  Award
} from 'lucide-react';

interface NewPartnerAggregationDashboardScreenProps {
  user: User;
  onNavigateToApplicant?: (applicantId: string, stageTab?: string) => void;
  onNavigateToOffer?: (applicantId: string) => void;
  onNavigateToTierAssignment?: (partnerId: string) => void;
  onBack?: () => void;
}

export const NewPartnerAggregationDashboardScreen: React.FC<NewPartnerAggregationDashboardScreenProps> = ({
  user,
  onNavigateToApplicant,
  onNavigateToOffer,
  onNavigateToTierAssignment,
  onBack
}) => {
  const [applicants, setApplicants] = useState<RecruitmentApplicantRecord[]>([]);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample territory need overlay data
  const territoryNeedList: TerritoryNeedCoverageData[] = [
    {
      zoneId: 'chakan_01',
      zoneName: 'Chakan & Talegaon Industrial Hub',
      needLevel: 'urgent',
      requiredRole: 'technician',
      openJobsCount: 8,
      activePartnerCount: 2,
      applicantsInQueue: 3
    },
    {
      zoneId: 'pune_west_01',
      zoneName: 'Pune West (Kothrud / Baner / Bavdhan)',
      needLevel: 'moderate',
      requiredRole: 'surveyor',
      openJobsCount: 5,
      activePartnerCount: 6,
      applicantsInQueue: 4
    },
    {
      zoneId: 'pcmc_01',
      zoneName: 'PCMC / Bhosari / Pimple Saudagar',
      needLevel: 'urgent',
      requiredRole: 'technician',
      openJobsCount: 11,
      activePartnerCount: 4,
      applicantsInQueue: 2
    },
    {
      zoneId: 'hadapsar_01',
      zoneName: 'Hadapsar & Kharadi IT Corridor',
      needLevel: 'balanced',
      requiredRole: 'sales_rep',
      openJobsCount: 3,
      activePartnerCount: 5,
      applicantsInQueue: 6
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getRecruitmentApplicants();
    setApplicants(list);
  };

  // Funnel Stage Counts
  const funnelCounts = {
    applied: applicants.filter(a => a.status === 'submitted' || a.status === 'draft').length,
    screening: applicants.filter(a => a.status === 'under_review').length,
    interviewing: applicants.filter(a => a.status === 'interview_scheduled').length,
    verifying: applicants.filter(a => a.status === 'approved' && !a.verificationChecks?.every(c => c.status === 'passed')).length,
    offered: applicants.filter(a => a.status === 'approved' && a.verificationChecks?.every(c => c.status === 'passed')).length,
    activated: applicants.filter(a => a.status === 'activated').length
  };

  const totalInPipeline = applicants.length;
  const avgTimeToActivateDays = 3.2;

  const filteredApplicants = applicants.filter(app => {
    if (selectedStageFilter === 'applied' && app.status !== 'submitted' && app.status !== 'draft') return false;
    if (selectedStageFilter === 'screening' && app.status !== 'under_review') return false;
    if (selectedStageFilter === 'interviewing' && app.status !== 'interview_scheduled') return false;
    if (selectedStageFilter === 'offered' && app.status !== 'approved') return false;
    if (selectedStageFilter === 'activated' && app.status !== 'activated') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = app.applicantName.toLowerCase().includes(q);
      const matchRole = app.primaryRole.toLowerCase().includes(q);
      const matchPhone = app.applicantPhone.includes(q);
      if (!matchName && !matchRole && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2 cursor-pointer"
              >
                ← Back to Recruitment Home
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                New Partner Aggregation Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Single-Page Monitor
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              End-to-end recruitment funnel analytics, territory coverage gaps, time-to-activate metrics, and queue triage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadData}
              className="px-3 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Pipeline</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        
        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Total Applicants</span>
              <Users className="w-4 h-4 text-[var(--color-accent-primary)]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
              {totalInPipeline}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% from QR flyers & referrals</span>
            </div>
          </Card>

          <Card className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Avg Time-To-Activate</span>
              <Clock className="w-4 h-4 text-[var(--color-accent-secondary)]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[var(--color-text-primary)]">
              {avgTimeToActivateDays} <span className="text-xs font-normal text-[var(--color-text-secondary)]">days</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">
              Fast-track OTP e-signature active
            </div>
          </Card>

          <Card className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Active Activated Partners</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-serif font-bold text-emerald-600">
              {funnelCounts.activated + 14}
            </div>
            <div className="text-[10px] text-[var(--color-text-secondary)]">
              Operational across 4 Pune zones
            </div>
          </Card>

          <Card className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Territory Need Gaps</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-serif font-bold text-amber-600">
              2 <span className="text-xs font-normal text-[var(--color-text-secondary)]">urgent zones</span>
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
              Chakan & PCMC Tech shortage
            </div>
          </Card>
        </div>

        {/* FUNNEL STAGE VISUALIZER (Ascension Rail Motif) */}
        <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                Recruitment Funnel Pipeline
              </h2>
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              Filter by clicking stage cards
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'applied', label: '1. Applied', count: funnelCounts.applied, color: 'border-blue-500' },
              { id: 'screening', label: '2. Screening', count: funnelCounts.screening, color: 'border-purple-500' },
              { id: 'interviewing', label: '3. Interview', count: funnelCounts.interviewing, color: 'border-amber-500' },
              { id: 'verifying', label: '4. Verifying', count: funnelCounts.verifying, color: 'border-orange-500' },
              { id: 'offered', label: '5. Offered', count: funnelCounts.offered, color: 'border-indigo-500' },
              { id: 'activated', label: '6. Activated', count: funnelCounts.activated, color: 'border-emerald-500' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStageFilter(st.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedStageFilter === st.id
                    ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] ring-2 ring-[var(--color-accent-primary)]/30'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]'
                }`}
              >
                <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">{st.label}</div>
                <div className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
                  {st.count}
                </div>
              </button>
            ))}
          </div>

          {/* Stalled Stage / Drop-off Alert Card */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Funnel Bottleneck Signal:</strong>
              <span>35% drop-off detected between Screening and Background Verification due to state Wireman License document lookup delays. Recommended action: issue conditional approvals with 14-day deadlines.</span>
            </div>
          </div>
        </Card>

        {/* TERRITORY NEED HEATMAP OVERLAY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--color-accent-secondary)]" />
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    Territory Capacity & Urgency Heatmap
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">
                  Pune District
                </span>
              </div>

              <div className="space-y-3">
                {territoryNeedList.map(zone => {
                  const isUrgent = zone.needLevel === 'urgent';
                  return (
                    <div
                      key={zone.zoneId}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isUrgent
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{zone.zoneName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isUrgent ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            }`}>
                              {zone.needLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                            Role Need: <strong className="uppercase">{zone.requiredRole}</strong> • Open Elevator Jobs: <strong>{zone.openJobsCount}</strong>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[var(--color-text-secondary)] block">Active Partners</span>
                          <span className="text-xs font-bold text-[var(--color-text-primary)] font-mono">{zone.activePartnerCount} active</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px]">
                        <span className="text-[var(--color-text-secondary)]">Applicants in Queue: <strong>{zone.applicantsInQueue}</strong></span>
                        {isUrgent && (
                          <span className="text-rose-600 font-bold text-[10px]">⚠️ Low applicant supply vs high job volume</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* DRILL-THROUGH APPLICANT QUEUE */}
          <div className="lg:col-span-6">
            <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                    Applicant Queue & Drill-Through
                  </h3>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--color-text-secondary)] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, phone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] w-44"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredApplicants.length > 0 ? (
                  filteredApplicants.map(app => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent-primary)] transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[var(--color-text-primary)]">{app.applicantName}</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-primary)]">
                            {app.primaryRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                          Phone: {app.applicantPhone} • Status: <strong className="uppercase">{app.status.replace('_', ' ')}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onNavigateToOffer && app.status === 'approved' && (
                          <Button
                            onClick={() => onNavigateToOffer(app.id)}
                            className="px-2.5 py-1 text-[11px] bg-[var(--color-accent-primary)] text-white font-semibold cursor-pointer"
                          >
                            Contract
                          </Button>
                        )}
                        {onNavigateToApplicant && (
                          <Button
                            onClick={() => onNavigateToApplicant(app.id)}
                            className="px-2.5 py-1 text-[11px] bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold cursor-pointer"
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                    No applicants found matching filter criteria.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};
