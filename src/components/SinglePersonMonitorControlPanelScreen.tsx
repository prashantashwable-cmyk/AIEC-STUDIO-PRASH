import React, { useState } from 'react';
import { 
  Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, Sliders, Calendar, UserCheck, RefreshCw, ArrowLeft, 
  Sparkles, ExternalLink, ShieldAlert, Clock, Eye, Layers
} from 'lucide-react';
import { UserRole, MonitorSignalConfig, DailyMonitorCheckLog, BackupMonitorContact } from '../types';
import { DbManager } from '../lib/db';

interface SinglePersonMonitorControlPanelScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const SinglePersonMonitorControlPanelScreen: React.FC<SinglePersonMonitorControlPanelScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [signals, setSignals] = useState<MonitorSignalConfig[]>(() => 
    DbManager.getMonitorSignals()
  );

  const [checkLogs, setCheckLogs] = useState<DailyMonitorCheckLog[]>(() => 
    DbManager.getDailyMonitorCheckLogs()
  );

  const [backups, setBackups] = useState<BackupMonitorContact[]>(() => 
    DbManager.getBackupMonitorContacts()
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'configure_signals' | 'backup_governance'>('overview');
  const [checkNote, setCheckNote] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePerformDailyCheck = () => {
    const criticalCount = signals.filter(s => s.isConfiguredActive && s.status === 'critical').length;

    const newLog: DailyMonitorCheckLog = {
      checkLogId: `chk_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      checkedByAdmin: 'Mr. Prashant Vasant Wable',
      note: checkNote.trim() || 'Daily master system health check acknowledged. All active signals verified.',
      allClearAcknowledged: true,
      criticalSignalsCountAtCheck: criticalCount
    };

    DbManager.addDailyMonitorCheckLog(newLog);
    setCheckLogs(DbManager.getDailyMonitorCheckLogs());
    setCheckNote('');
    triggerToast('Morning All-Clear master check logged successfully!');
  };

  const handleToggleSignalConfig = (signalId: string) => {
    const updated = signals.map(sig => {
      if (sig.signalId === signalId) {
        const nextActive = !sig.isConfiguredActive;
        const updatedSig = { ...sig, isConfiguredActive: nextActive };
        DbManager.saveMonitorSignal(updatedSig);
        return updatedSig;
      }
      return sig;
    });

    setSignals(updated);
    triggerToast('Monitor signal preference updated.');
  };

  const handleToggleEmergencyBackup = (backupId: string) => {
    const updated = backups.map(b => {
      if (b.backupId === backupId) {
        const nextState = !b.isEmergencyViewGranted;
        const updatedBackup = { 
          ...b, 
          isEmergencyViewGranted: nextState,
          grantedUntil: nextState ? '2026-08-31' : undefined
        };
        DbManager.saveBackupMonitorContact(updatedBackup);
        return updatedBackup;
      }
      return b;
    });

    setBackups(updated);
    triggerToast('Backup monitor emergency access updated.');
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSignals(DbManager.getMonitorSignals());
      setIsRefreshing(false);
      triggerToast('Refreshed real-time signals across all system modules.');
    }, 600);
  };

  const activeSignals = signals.filter(s => s.isConfiguredActive);
  const criticalCount = activeSignals.filter(s => s.status === 'critical').length;
  const warningCount = activeSignals.filter(s => s.status === 'warning').length;
  const lastCheck = checkLogs[0];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
                <Activity className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'एकल-व्यक्ति मॉनिटर नियंत्रण कक्ष' : currentLanguage === 'mr' ? 'एक-व्यक्ति मॉनिटर नियंत्रण पॅनेल' : 'Single-Person Monitor Control Panel'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Synthesized morning-check dashboard — Run by System, Monitored by One Person
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] rounded-xl text-xs font-bold flex items-center gap-1.5"
            title="Refresh signals"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--color-accent-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Signals</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Master Status & 1-Tap All Clear Banner */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full animate-pulse ${
                  criticalCount > 0 ? 'bg-red-500' : warningCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
                <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                  {criticalCount > 0 ? 'CRITICAL EXCEPTION REQUIRING ATTENTION' : warningCount > 0 ? 'SYSTEM OPERATIONAL WITH MONITORED WARNINGS' : 'ALL SYSTEMS OPTIMAL & HEALTHY'}
                </h2>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Synthesizing real-time telemetry from CRM, Field Engineering, Financial Collections, and Automation Bots.
              </p>
            </div>

            {/* Quick Summary Pill Badges */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold">
                {activeSignals.filter(s => s.status === 'healthy').length} Healthy
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold">
                {warningCount} Warning
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 font-bold">
                {criticalCount} Critical
              </span>
            </div>
          </div>

          {/* 1-Tap Daily Check Acknowledgment Bar */}
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="text-[var(--color-text-primary)] block">Daily Master Check Acknowledgment</strong>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                  Last check: {lastCheck ? `${lastCheck.timestamp} by ${lastCheck.checkedByAdmin}` : 'Not checked today'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <input
                type="text"
                value={checkNote}
                onChange={e => setCheckNote(e.target.value)}
                placeholder="Optional morning check note..."
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[var(--color-accent-primary)] w-full sm:w-64"
              />
              <button
                onClick={handlePerformDailyCheck}
                className="px-4 py-2 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl shadow-md whitespace-nowrap hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Log All Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[var(--color-border)] space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Master Signals Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('configure_signals')}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'configure_signals' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Active Signals ({activeSignals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup_governance')}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'backup_governance' 
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' 
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Emergency Backup Monitor</span>
          </button>
        </div>

        {/* Tab 1: Master Signals Grid */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSignals.map(sig => {
                const isHealthy = sig.status === 'healthy';
                const isWarning = sig.status === 'warning';

                return (
                  <div
                    key={sig.signalId}
                    onClick={() => onNavigateTab && onNavigateTab(sig.targetScreenTab)}
                    className={`bg-[var(--color-surface)] border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 relative group ${
                      isWarning ? 'border-amber-500/40' : !isHealthy ? 'border-red-500/50' : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono uppercase text-[var(--color-text-secondary)] tracking-wider">
                        {sig.category.replace('_', ' ')}
                      </span>
                      <ExternalLink className="w-4 h-4 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] mb-1">
                        {sig.title}
                      </h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="font-serif text-2xl font-bold text-[var(--color-text-primary)] font-mono">
                          {sig.currentValue}
                        </span>
                        <span className={`text-xs font-mono font-bold flex items-center ${
                          sig.trendDirection === 'up' ? 'text-emerald-700 dark:text-emerald-300' : sig.trendDirection === 'down' ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500'
                        }`}>
                          {sig.trendDirection === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {sig.trendPercentage}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                      {sig.description}
                    </p>

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] font-mono text-[var(--color-text-secondary)]">
                      <span>Target: {sig.targetValue}</span>
                      <span className="text-[var(--color-accent-primary)] font-bold">Drill-Through &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Check History Log */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
                <Clock className="w-4 h-4 text-[var(--color-accent-primary)]" />
                Historical All-Clear Check Logs
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {checkLogs.map(log => (
                  <div 
                    key={log.checkLogId}
                    className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-start justify-between gap-3 font-mono"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-[var(--color-text-primary)]">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] font-sans text-[var(--color-text-secondary)] mt-1">
                        {log.note}
                      </p>
                    </div>

                    <span className="text-[10px] text-[var(--color-text-secondary)] whitespace-nowrap">
                      {log.checkedByAdmin}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Configure Active Signals */}
        {activeTab === 'configure_signals' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Configure Monitored Signals for Business Growth Phase
            </h3>

            <div className="space-y-3">
              {signals.map(sig => (
                <div 
                  key={sig.signalId}
                  className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase text-[var(--color-accent-primary)] font-bold">
                        {sig.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                        {sig.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      {sig.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleSignalConfig(sig.signalId)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                      sig.isConfiguredActive 
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                        : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    }`}
                  >
                    {sig.isConfiguredActive ? 'Active in Morning Monitor' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Emergency Backup Monitor */}
        {activeTab === 'backup_governance' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Emergency Backup Monitor Delegation
            </h3>

            <p className="text-xs text-[var(--color-text-secondary)]">
              Grant temporary read-only monitoring visibility to a designated deputy during primary Admin leave or medical absence.
            </p>

            <div className="space-y-3">
              {backups.map(bak => (
                <div 
                  key={bak.backupId}
                  className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{bak.name}</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">{bak.role} • {bak.phone} • {bak.email}</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{bak.notes}</p>
                  </div>

                  <button
                    onClick={() => handleToggleEmergencyBackup(bak.backupId)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                      bak.isEmergencyViewGranted 
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30' 
                        : 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                    }`}
                  >
                    {bak.isEmergencyViewGranted ? `Emergency Access Active (Until ${bak.grantedUntil})` : 'Grant Emergency View'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
