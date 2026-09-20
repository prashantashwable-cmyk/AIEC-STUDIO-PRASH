import React, { useState } from 'react';
import { 
  Timer, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, 
  PauseCircle, ArrowLeft, RefreshCw, Sparkles, Filter, ExternalLink, 
  Clock, ShieldAlert, BarChart3, Activity, ArrowUpRight
} from 'lucide-react';
import { UserRole, SlaProcessItem, SlaCategoryTrend } from '../types';
import { DbManager } from '../lib/db';

interface SlaTimerBreachAlertScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const SlaTimerBreachAlertScreen: React.FC<SlaTimerBreachAlertScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [items, setItems] = useState<SlaProcessItem[]>(() => 
    DbManager.getSlaProcessItems()
  );

  const [trends, setTrends] = useState<SlaCategoryTrend[]>(() => 
    DbManager.getSlaCategoryTrends()
  );

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setItems(DbManager.getSlaProcessItems());
      setTrends(DbManager.getSlaCategoryTrends());
      setIsRefreshing(false);
      triggerToast('SLA timer status & telemetry refreshed.');
    }, 600);
  };

  const filteredItems = items.filter(item => {
    if (statusFilter === 'all') return true;
    return item.breachStatus === statusFilter;
  });

  const totalTracked = items.length;
  const breachedCount = items.filter(i => i.breachStatus === 'breached').length;
  const warningCount = items.filter(i => i.breachStatus === 'warning').length;
  const overallComplianceRate = Math.round(((totalTracked - breachedCount) / totalTracked) * 100);

  const getStatusBadge = (status: SlaProcessItem['breachStatus']) => {
    switch (status) {
      case 'breached':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> SLA BREACHED</span>;
      case 'warning':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"><Clock className="w-3 h-3" /> BREACH RISK WARNING</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ON TRACK</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
                <Timer className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'एसएलए टाइमर व ब्रीच अलर्ट' : currentLanguage === 'mr' ? 'एसएलए टायमर आणि ब्रीच इशारे' : 'SLA Timer & Breach Alert Control'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Cross-module consolidated view of time-sensitive operational response thresholds
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--color-accent-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Timers</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Top-Left KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Overall SLA Compliance</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{overallComplianceRate}%</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center"><TrendingUp className="w-3 h-3" /> +2.1%</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Across all active processes</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Active Breaches</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-mono font-bold ${breachedCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {breachedCount}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">Requires immediate action</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Escalated via Matrix</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Breach Risk Warnings</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-amber-600">{warningCount}</span>
              <span className="text-[10px] text-amber-600 font-bold">&gt;75% time elapsed</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Pre-breach warning zone</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Fairly Paused SLA Clocks</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-blue-600">
                {items.filter(i => i.isPausedFairly).length}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">Client / Bank Pending</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Timer paused under policy</p>
          </div>
        </div>

        {/* Consolidated Active SLA Process Items */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div>
              <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                <Timer className="w-5 h-5 text-[var(--color-accent-primary)]" />
                Live SLA Process Timers ({totalTracked})
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Real-time monitor of time elapsed vs target threshold per operational item
              </p>
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {['all', 'breached', 'warning', 'on_track'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                  }`}
                >
                  {st === 'all' ? 'All Timers' : st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.map(item => {
              const progressPercent = Math.min(Math.round((item.currentElapsedHours / item.targetDurationHours) * 100), 100);

              return (
                <div 
                  key={item.id}
                  className={`p-4 bg-[var(--color-bg)] border rounded-xl space-y-3 transition-all ${
                    item.breachStatus === 'breached' ? 'border-red-500/50 bg-red-500/5' :
                    item.breachStatus === 'warning' ? 'border-amber-500/50 bg-amber-500/5' : 'border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(item.breachStatus)}
                        <strong className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{item.processName}</strong>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-0.5">
                        Record Target: <strong className="text-[var(--color-accent-primary)]">{item.relatedRecordId}</strong> • Assigned: {item.responsibleRole}
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-[var(--color-text-secondary)] block text-[10px]">Elapsed / Target</span>
                      <strong className="text-sm text-[var(--color-text-primary)]">{item.currentElapsedHours}h / {item.targetDurationHours}h</strong>
                    </div>
                  </div>

                  {/* Timer Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          item.breachStatus === 'breached' ? 'bg-red-500' :
                          item.breachStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {item.isPausedFairly && item.pauseReason && (
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono flex items-center gap-1">
                        <PauseCircle className="w-3 h-3" /> Fair Pause: {item.pauseReason}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA Category Compliance Trends Table */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Category-Wise SLA Compliance Trends (30 Days)
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Historical telemetry to help re-evaluate target durations and identify recurring operational bottlenecks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map(t => (
              <div key={t.categoryKey} className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="font-serif text-sm text-[var(--color-text-primary)]">{t.categoryName}</span>
                  <span className={`flex items-center gap-1 font-mono font-bold ${
                    t.trendDirection === 'improving' ? 'text-emerald-600' :
                    t.trendDirection === 'declining' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {t.trendDirection === 'improving' && <TrendingUp className="w-3.5 h-3.5" />}
                    {t.trendDirection === 'declining' && <TrendingDown className="w-3.5 h-3.5" />}
                    {t.complianceRatePercent}% Pass
                  </span>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between font-mono text-[10px] text-[var(--color-text-secondary)]">
                  <span>Avg Resolution: <strong>{t.avgResolutionTimeHours} hrs</strong></span>
                  <span>Active Tracked: <strong>{t.totalActiveTracked}</strong></span>
                  <span>30D Breaches: <strong className="text-red-600">{t.totalBreaches30Days}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
