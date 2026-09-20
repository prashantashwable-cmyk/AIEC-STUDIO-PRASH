import React, { useState } from 'react';
import { 
  Zap, PauseCircle, PlayCircle, ShieldCheck, Activity, AlertTriangle, 
  CheckCircle2, Clock, RefreshCw, ArrowLeft, ChevronRight, Sliders, 
  MessageSquare, CreditCard, ShoppingBag, GraduationCap, Award, Wrench, Sparkles, Filter
} from 'lucide-react';
import { UserRole, AutomationRuleCategorySummary, AutomationRuleActivityLog } from '../types';
import { DbManager } from '../lib/db';

interface MasterAutomationRulesDashboardScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const MasterAutomationRulesDashboardScreen: React.FC<MasterAutomationRulesDashboardScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [categories, setCategories] = useState<AutomationRuleCategorySummary[]>(() => 
    DbManager.getAutomationCategorySummaries()
  );

  const [activityLogs, setActivityLogs] = useState<AutomationRuleActivityLog[]>(() => 
    DbManager.getAutomationActivityLogs()
  );

  const [logFilterCategory, setLogFilterCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCategories(DbManager.getAutomationCategorySummaries());
      setActivityLogs(DbManager.getAutomationActivityLogs());
      setIsRefreshing(false);
      triggerToast('Automation rules telemetry refreshed!');
    }, 600);
  };

  const handleToggleGlobalPause = (categoryKey: string, categoryName: string) => {
    const updated = DbManager.toggleGlobalPauseAutomationCategory(categoryKey);
    setCategories(updated);
    const target = updated.find(c => c.categoryKey === categoryKey);
    const isPaused = target?.isPausedGlobally;

    // Log the action
    const newLog: AutomationRuleActivityLog = {
      id: `act_${Date.now().toString().slice(-4)}`,
      ruleCategoryKey: categoryKey,
      ruleName: `Global Safety ${isPaused ? 'PAUSE' : 'RESUME'} Triggered`,
      triggerEvent: `Admin Emergency Override on ${categoryName}`,
      actionTaken: isPaused ? 'Halted all outbound automated triggers' : 'Resumed automated sequence triggers',
      targetEntity: 'System-Wide Automation Bus',
      status: isPaused ? 'paused_skipped' : 'success',
      timestamp: 'Just now',
      latencyMs: 45
    };
    DbManager.addAutomationActivityLog(newLog);
    setActivityLogs(DbManager.getAutomationActivityLogs());

    triggerToast(`${categoryName} is now ${isPaused ? 'PAUSED globally' : 'ACTIVE & running'}.`);
  };

  const totalActiveRules = categories.reduce((sum, c) => sum + (c.isPausedGlobally ? 0 : c.activeRulesCount), 0);
  const totalExecutionsToday = categories.reduce((sum, c) => sum + c.executionsToday, 0);
  const pausedCategoriesCount = categories.filter(c => c.isPausedGlobally).length;

  const filteredLogs = activityLogs.filter(log => {
    if (logFilterCategory === 'all') return true;
    return log.ruleCategoryKey === logFilterCategory;
  });

  const getCategoryIcon = (key: AutomationRuleCategorySummary['categoryKey']) => {
    switch (key) {
      case 'communication_sequences': return <MessageSquare className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'payment_reminders': return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'auto_po_triggers': return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'training_refreshers': return <GraduationCap className="w-5 h-5 text-purple-600" />;
      case 'contest_lifecycle': return <Award className="w-5 h-5 text-amber-600" />;
      case 'custom_workflows': return <Wrench className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      default: return <Zap className="w-5 h-5 text-[var(--color-accent-primary)]" />;
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

      {/* Top Navigation Bar */}
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
                <Zap className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'मास्टर ऑटोमेशन नियम डैशबोर्ड' : currentLanguage === 'mr' ? 'मास्टर ऑटोमेशन नियम डॅशबोर्ड' : 'Master Automation Rules Dashboard'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? '1-पर्सन कंट्रोल: पूरे बिजनेस के स्वचालित सिस्टम की स्वास्थ्य स्थिति' : 'Unified cross-module control room • 1-Person Monitoring Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 text-[var(--color-accent-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('WorkflowTriggerBuilder')}
                className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4" />
                <span>+ Build Custom Rule</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Top Executive KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">System Automation Health</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">99.1%</span>
              <span className="text-[10px] text-emerald-600 font-bold">100% Operational</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Zero system-wide crash flags</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Active Trigger Rules</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[var(--color-accent-primary)]">{totalActiveRules}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">across 6 modules</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Self-executing workflow scenarios</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Executions Today</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">{totalExecutionsToday}</span>
              <span className="text-[10px] text-emerald-600 font-bold">+18% vs avg</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Automated actions dispatched</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Global Safety Overrides</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-mono font-bold ${pausedCategoriesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {pausedCategoriesCount > 0 ? `${pausedCategoriesCount} Paused` : 'All Active'}
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Emergency kill-switch status</p>
          </div>
        </div>

        {/* Rule Category Grid (Dashboard Pattern: 2 col mobile, 3-4 col desktop) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                Cross-Module Automation Health & Emergency Pause Controls
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Toggle emergency pause switches to instantly freeze specific category automated triggers system-wide
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const isPaused = cat.isPausedGlobally;

              return (
                <div 
                  key={cat.id}
                  className={`bg-[var(--color-surface)] border rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${
                    isPaused ? 'border-amber-500/50 bg-amber-500/5' : 'border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xs">
                        {getCategoryIcon(cat.categoryKey)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                          {cat.categoryName}
                        </h3>
                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                          {cat.activeRulesCount} Active Rules
                        </span>
                      </div>
                    </div>

                    {/* Health Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isPaused ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {isPaused ? 'PAUSED' : 'HEALTHY'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-secondary)] block">Today Executions</span>
                      <strong className="text-xs text-[var(--color-text-primary)]">{cat.executionsToday} ({cat.successRatePercent}% ok)</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[var(--color-text-secondary)] block">Last Triggered</span>
                      <strong className="text-xs text-[var(--color-text-primary)]">{cat.lastTriggeredAt}</strong>
                    </div>
                  </div>

                  {/* Emergency Toggle Action */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleGlobalPause(cat.categoryKey, cat.categoryName)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                        isPaused 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                      <span>{isPaused ? 'Resume Category Trigger Bus' : 'Emergency Pause Category'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-module Quick Navigation Grid */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--color-accent-primary)]" />
            Module 19 Sub-Systems & Governance Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('WorkflowTriggerBuilder')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 2</span>
                  <span>Trigger Builder</span>
                </button>
                <button
                  onClick={() => onNavigateTab('NotificationTemplatesChannels')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 3</span>
                  <span>Templates & Channels</span>
                </button>
                <button
                  onClick={() => onNavigateTab('EscalationMatrixConfig')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 4</span>
                  <span>Escalation Matrix</span>
                </button>
                <button
                  onClick={() => onNavigateTab('SlaTimerBreachAlert')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 5</span>
                  <span>SLA Breach Alerts</span>
                </button>
                <button
                  onClick={() => onNavigateTab('SystemHealthBotMonitoring')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 6</span>
                  <span>System & Bot Health</span>
                </button>
                <button
                  onClick={() => onNavigateTab('AuditLogAutomatedActions')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 7</span>
                  <span>Automated Action Audit</span>
                </button>
                <button
                  onClick={() => onNavigateTab('ManualOverrideConsole')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 8</span>
                  <span>Manual Override Console</span>
                </button>
                <button
                  onClick={() => onNavigateTab('ApiIntegrationManagement')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 9</span>
                  <span>API & Integrations</span>
                </button>
                <button
                  onClick={() => onNavigateTab('AutomationTestingSandbox')}
                  className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl font-bold text-[var(--color-text-primary)] text-left space-y-1 transition-all"
                >
                  <span className="text-[var(--color-accent-primary)] block text-[10px] uppercase font-mono">Screen 10</span>
                  <span>Testing & Sandbox</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Real-time System-Wide Automation Activity Log */}

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--color-accent-primary)]" />
                Recent System Automation Activity Log
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Live audit telemetry of rules triggered, actions executed, and target entity responses
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setLogFilterCategory('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  logFilterCategory === 'all'
                    ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                }`}
              >
                All Logs
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setLogFilterCategory(c.categoryKey)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap ${
                    logFilterCategory === c.categoryKey
                      ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                  }`}
                >
                  {c.categoryName.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-text-secondary)] font-bold">
                No activity logs found for selected category.
              </div>
            ) : (
              filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[var(--color-accent-primary)]/40 transition-all text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                        log.status === 'paused_skipped' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-red-500/10 text-red-700 dark:text-red-300'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                      <strong className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{log.ruleName}</strong>
                    </div>

                    <p className="text-[var(--color-text-secondary)]">
                      <strong>Trigger:</strong> {log.triggerEvent} ➔ <strong>Action:</strong> {log.actionTaken}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono text-[10px] text-[var(--color-text-secondary)] space-y-0.5">
                    <strong className="text-xs text-[var(--color-accent-primary)] block font-mono">{log.targetEntity}</strong>
                    <span>{log.timestamp} • {log.latencyMs}ms latency</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Safety Policy Note */}
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0" />
          <span>
            Master Automation Rules Dashboard enforces safe isolated execution. Global pauses instantly prevent outbound message buses from firing while preserving state.
          </span>
        </div>

      </div>
    </div>
  );
};
