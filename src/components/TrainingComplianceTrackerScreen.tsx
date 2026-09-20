import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  Clock,
  Send,
  Users,
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  ShieldAlert,
  Bell,
  RefreshCw,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { PartnerComplianceRecord, ComplianceTrendMetric, UserRole } from '../types';
import { Card, Button } from './Common';

interface TrainingComplianceTrackerScreenProps {
  userRole?: UserRole;
  currentLanguage?: 'en' | 'hi' | 'mr';
  onNavigateToSkillMatrix?: () => void;
  onNavigateToSopRollout?: () => void;
  onNavigateToModule?: (moduleId: string) => void;
  onBack?: () => void;
}

export const TrainingComplianceTrackerScreen: React.FC<TrainingComplianceTrackerScreenProps> = ({
  userRole = 'admin',
  currentLanguage = 'en',
  onNavigateToSkillMatrix,
  onNavigateToSopRollout,
  onNavigateToModule,
  onBack
}) => {
  const [complianceList, setComplianceList] = useState<PartnerComplianceRecord[]>([]);
  const [trendMetrics, setTrendMetrics] = useState<ComplianceTrendMetric[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState<string>('all');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reminderNotice, setReminderNotice] = useState<string>('');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getPartnerComplianceRecords();
    const trend = DbManager.getComplianceTrendMetrics();
    setComplianceList(list);
    setTrendMetrics(trend);
  };

  const handleBulkReminder = (partnerIds?: string[]) => {
    const targets = partnerIds && partnerIds.length > 0 ? partnerIds : selectedPartnerIds;
    const sentCount = DbManager.sendBulkComplianceReminder(targets);
    setReminderNotice(`Sent automated compliance reminders & SMS notices to ${sentCount} partner(s)!`);
    setSelectedPartnerIds([]);
    loadData();
    setTimeout(() => setReminderNotice(''), 4500);
  };

  const handleToggleSelectPartner = (pId: string) => {
    if (selectedPartnerIds.includes(pId)) {
      setSelectedPartnerIds(selectedPartnerIds.filter(id => id !== pId));
    } else {
      setSelectedPartnerIds([...selectedPartnerIds, pId]);
    }
  };

  // Filtered compliance records
  const filteredRecords = complianceList.filter(rec => {
    const matchesRole = selectedRoleFilter === 'all' || rec.role === selectedRoleFilter;
    const matchesTerritory = selectedTerritoryFilter === 'all' || rec.territory.toLowerCase().includes(selectedTerritoryFilter.toLowerCase());
    const matchesReason = selectedReasonFilter === 'all' || rec.nonComplianceReason === selectedReasonFilter;
    const matchesSearch = rec.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.territory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.uncompletedModuleTitle && rec.uncompletedModuleTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesTerritory && matchesReason && matchesSearch;
  });

  const fullyCompliantCount = complianceList.filter(r => r.complianceStatus === 'fully_compliant').length;
  const overallComplianceRate = Math.round((fullyCompliantCount / (complianceList.length || 1)) * 100);
  const safetyCriticalNonCompliantCount = complianceList.filter(r => r.complianceStatus !== 'fully_compliant' && r.isSafetyCritical).length;

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
              <CheckCircle2 className="w-6 h-6 text-[var(--color-accent-secondary)]" />
              <h1 className="text-xl md:text-2xl font-bold font-serif">Training Compliance Tracker</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20">
                Workforce Governance Oversight
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Consolidated governance tracking across field technicians, surveyors, and quality inspectors.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToSkillMatrix && (
            <Button
              variant="outline"
              onClick={onNavigateToSkillMatrix}
              className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>Skill Matrix</span>
            </Button>
          )}
          {onNavigateToSopRollout && (
            <Button
              variant="outline"
              onClick={onNavigateToSopRollout}
              className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>SOP Rollouts</span>
            </Button>
          )}
        </div>
      </div>

      {reminderNotice && (
        <div className="p-3 bg-[var(--color-accent-secondary)]/15 border border-[var(--color-accent-secondary)]/30 rounded-xl text-xs font-semibold text-[var(--color-accent-secondary)] flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{reminderNotice}</span>
        </div>
      )}

      {/* KPI Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Compliance KPI */}
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Overall Compliance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-secondary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--color-accent-secondary)]">{overallComplianceRate}%</span>
            <span className="text-xs text-[var(--color-accent-secondary)] font-semibold">Active Base</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            {fullyCompliantCount} of {complianceList.length} partners current
          </p>
        </Card>

        {/* Safety Critical Non-Compliance Alert */}
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Safety-Critical Non-Compliant</span>
            <ShieldAlert className="w-4 h-4 text-[var(--color-error)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--color-error)]">{safetyCriticalNonCompliantCount}</span>
            <span className="text-xs text-[var(--color-error)] font-semibold">Urgent Priority</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Lapsed Pit Safety or Lockout-Tagout</p>
        </Card>

        {/* Cohort Expiry Warning */}
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Cohort Batch Expiries</span>
            <Calendar className="w-4 h-4 text-[var(--color-accent-primary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--color-accent-primary)]">8</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold">Q1 Onboarding Batch</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Annual refreshers due before Aug 31</p>
        </Card>

        {/* Historical Compliance Trend */}
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Monthly Trend (6 Mo)</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-accent-secondary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[var(--color-accent-primary)]">94%</span>
            <span className="text-xs text-[var(--color-accent-secondary)] font-semibold">+22% since Mar</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Steadily improving compliance curve</p>
        </Card>
      </div>

      {/* Historical Trend Bar Visualization */}
      <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--color-accent-primary)]" />
            <h3 className="text-xs font-bold font-serif uppercase tracking-wider">6-Month Workforce Compliance Trend</h3>
          </div>
          <span className="text-[11px] text-[var(--color-text-secondary)]">Target: 95%</span>
        </div>

        <div className="grid grid-cols-6 gap-2 pt-2">
          {trendMetrics.map((tm, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] font-mono font-bold text-[var(--color-accent-primary)]">
                {tm.complianceRatePercent}%
              </span>
              <div className="w-full bg-[var(--color-bg)] h-20 rounded-lg overflow-hidden border border-[var(--color-border)] flex items-end p-0.5">
                <div
                  className="w-full bg-[var(--color-accent-secondary)] rounded-sm transition-all duration-500"
                  style={{ height: `${tm.complianceRatePercent}%` }}
                />
              </div>
              <span className="text-[9px] text-[var(--color-text-secondary)]">{tm.month}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Compliance Records List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-serif">Partner Compliance Roster</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Filter non-compliant partners by reason, territory or role for targeted follow-ups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={() => handleBulkReminder()}
              className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {selectedPartnerIds.length > 0 ? `Send Reminder to Selected (${selectedPartnerIds.length})` : 'Send Bulk Reminders'}
              </span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-[var(--color-surface)] p-3 border border-[var(--color-border)] rounded-xl">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Search partner name or module..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
            />
          </div>

          <select
            value={selectedReasonFilter}
            onChange={e => setSelectedReasonFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
          >
            <option value="all">All Compliance Reasons</option>
            <option value="never_started">Never Started</option>
            <option value="failed_needs_coaching">Failed & Needs Coaching</option>
            <option value="refresher_lapsed">Refresher Lapsed</option>
            <option value="none font-bold text-green-600">Fully Compliant</option>
          </select>

          <select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
          >
            <option value="all">All Roles</option>
            <option value="technician">Technicians</option>
            <option value="surveyor">Surveyors</option>
            <option value="quality_inspector">Quality Inspectors</option>
          </select>

          <select
            value={selectedTerritoryFilter}
            onChange={e => setSelectedTerritoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
          >
            <option value="all">All Territories</option>
            <option value="mumbai">Mumbai & Thane</option>
            <option value="pune">Pune Metropolitan</option>
            <option value="nashik">Nashik Zone</option>
          </select>
        </div>

        {/* List Cards */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <Card className="p-8 text-center text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-[var(--color-accent-secondary)] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold">No non-compliant partners found matching these filters!</p>
              <p className="text-xs mt-1">All partners in this subset are fully up to date with required training.</p>
            </Card>
          ) : (
            filteredRecords.map(rec => {
              const isSelected = selectedPartnerIds.includes(rec.partnerId);
              const isCompliant = rec.complianceStatus === 'fully_compliant';

              return (
                <Card
                  key={rec.id}
                  className={`p-4 bg-[var(--color-surface)] border rounded-2xl transition-all ${
                    rec.isSafetyCritical && !isCompliant
                      ? 'border-[var(--color-error)]/40 shadow-sm'
                      : isSelected
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                      : 'border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectPartner(rec.partnerId)}
                        className="mt-1 rounded border-[var(--color-border)] text-[var(--color-accent-primary)] cursor-pointer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{rec.partnerName}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                            {rec.role}
                          </span>
                          <span className="text-xs text-[var(--color-text-secondary)]">• {rec.territory}</span>
                        </div>

                        {!isCompliant ? (
                          <div className="text-xs text-[var(--color-text-secondary)] flex flex-wrap items-center gap-2">
                            <span className="text-[var(--color-error)] font-semibold">
                              Pending: {rec.uncompletedModuleTitle || 'Mandatory Safety Training'}
                            </span>
                            {rec.dueDate && <span>• Due: {rec.dueDate}</span>}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--color-accent-secondary)] font-semibold">
                            All required certifications and safety standards fully current.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {rec.isSafetyCritical && !isCompliant && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          SAFETY CRITICAL
                        </span>
                      )}

                      {!isCompliant && (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                          rec.nonComplianceReason === 'refresher_lapsed'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : rec.nonComplianceReason === 'failed_needs_coaching'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                        }`}>
                          {rec.nonComplianceReason === 'refresher_lapsed'
                            ? 'Refresher Lapsed'
                            : rec.nonComplianceReason === 'failed_needs_coaching'
                            ? 'Failed - Needs Coaching'
                            : 'Never Started'}
                        </span>
                      )}

                      {!isCompliant && rec.uncompletedModuleId && onNavigateToModule && (
                        <Button
                          variant="outline"
                          onClick={() => onNavigateToModule(rec.uncompletedModuleId!)}
                          className="text-xs px-2.5 py-1 h-auto flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3 text-[var(--color-accent-primary)]" />
                          <span>View Standard</span>
                        </Button>
                      )}

                      {!isCompliant && (
                        <Button
                          variant="primary"
                          onClick={() => handleBulkReminder([rec.partnerId])}
                          className="text-xs px-2.5 py-1 h-auto flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Nudge</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
