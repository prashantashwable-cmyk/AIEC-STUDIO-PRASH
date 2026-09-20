import React, { useState } from 'react';
import { 
  Activity, Server, Wifi, AlertTriangle, CheckCircle2, XCircle, 
  RefreshCw, ExternalLink, ArrowLeft, Sparkles, Filter, ShieldAlert, 
  Clock, Database, Globe, Smartphone, CreditCard, Cpu, Layers, HelpCircle
} from 'lucide-react';
import { UserRole, IntegrationTechnicalHealth, TechnicalIncidentLog } from '../types';
import { DbManager } from '../lib/db';

interface SystemHealthBotMonitoringScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const SystemHealthBotMonitoringScreen: React.FC<SystemHealthBotMonitoringScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [integrations, setIntegrations] = useState<IntegrationTechnicalHealth[]>(() => 
    DbManager.getIntegrationTechnicalHealth()
  );

  const [incidents, setIncidents] = useState<TechnicalIncidentLog[]>(() => 
    DbManager.getTechnicalIncidentLogs()
  );

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [reprocessingIncId, setReprocessingIncId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefreshHealth = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIntegrations(DbManager.getIntegrationTechnicalHealth());
      setIncidents(DbManager.getTechnicalIncidentLogs());
      setIsRefreshing(false);
      triggerToast('Technical health telemetries & API pings updated!');
    }, 600);
  };

  const handleReprocessQueued = (incId: string) => {
    setReprocessingIncId(incId);
    setTimeout(() => {
      const updated = incidents.map(inc => inc.id === incId ? {
        ...inc,
        queuedRequestsReprocessingNeeded: false,
        summary: inc.summary + ' [Queued requests reprocessed successfully at ' + new Date().toLocaleTimeString() + ']'
      } : inc);
      setIncidents(updated);
      setReprocessingIncId(null);
      triggerToast('Queued failed requests reprocessed cleanly!');
    }, 1200);
  };

  // Shared root cause detection
  const degradedCount = integrations.filter(i => i.technicalStatus !== 'operational').length;
  const isSharedRootCauseSuspected = degradedCount >= 2;

  const getCategoryIcon = (category: IntegrationTechnicalHealth['providerCategory']) => {
    switch (category) {
      case 'payment_gateway': return <CreditCard className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'whatsapp_api': return <Smartphone className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'maps_geolocation': return <Globe className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'loan_partner_api': return <Activity className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'sms_gateway': return <Wifi className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      default: return <Server className="w-5 h-5 text-[var(--color-accent-primary)]" />;
    }
  };

  const getStatusBadge = (status: 'operational' | 'degraded' | 'down') => {
    switch (status) {
      case 'operational':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OPERATIONAL</span>;
      case 'degraded':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> DEGRADED</span>;
      case 'down':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 flex items-center gap-1"><XCircle className="w-3 h-3" /> OUTAGE</span>;
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
                <Cpu className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'सिस्टम हेल्थ व बॉट मॉनिटरिंग' : currentLanguage === 'mr' ? 'सिस्टम हेल्थ आणि बॉट देखरेख' : 'System Health & Technical Plumbing'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Technical-level health of underlying API integrations, server uptime, and third-party error rates
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshHealth}
            disabled={isRefreshing}
            className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--color-accent-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Ping APIs</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Informational Scope Boundary Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <Server className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              Technical Observability vs Business Process Automation
            </strong>
            This screen monitors third-party API plumbing (Razorpay, WhatsApp Business, Google Maps, Loan APIs). Business logic performance (e.g. lead scoring accuracy) is tracked separately in the Automation Health Monitor.
          </div>
        </div>

        {/* Shared Root Cause Alert Banner if multiple integrations degraded */}
        {isSharedRootCauseSuspected && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300 block font-serif text-sm">
                Shared Root Cause Pattern Suspected
              </strong>
              Multiple third-party integrations ({degradedCount}) are showing elevated error rates simultaneously. This suggests an internal AIEC network/hosting bottleneck rather than isolated vendor outages.
            </div>
          </div>
        )}

        {/* High-Level Technical KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">System API Uptime</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">99.94%</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">30-day trailing mean</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Integrations Operational</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[var(--color-text-primary)]">
                {integrations.filter(i => i.technicalStatus === 'operational').length} / {integrations.length}
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Core connected services</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Mean API Latency</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-bold text-[var(--color-accent-primary)]">142 ms</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Optimal response threshold</p>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-secondary)] block">Active Incidents</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-mono font-bold ${incidents.filter(i => i.status !== 'resolved').length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {incidents.filter(i => i.status !== 'resolved').length}
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)]">Under investigation</p>
          </div>
        </div>

        {/* Integration Status Grid */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3 flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
              <Server className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Connected Third-Party Services
            </h2>
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              AIEC Telemetry vs Provider Self-Report
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(integ => {
              const isMismatch = integ.aiecObservedErrorRate > 1.0 && integ.providerReportedStatus === 'operational';

              return (
                <div 
                  key={integ.id}
                  className={`p-4 bg-[var(--color-bg)] border rounded-xl space-y-3 transition-all ${
                    integ.technicalStatus === 'degraded' ? 'border-amber-500/50 bg-amber-500/5' :
                    integ.technicalStatus === 'down' ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                        {getCategoryIcon(integ.providerCategory)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-xs text-[var(--color-text-primary)]">
                          {integ.integrationName}
                        </h3>
                        <p className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase">
                          {integ.providerCategory.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {getStatusBadge(integ.technicalStatus)}
                  </div>

                  {/* Discrepancy Highlight */}
                  {isMismatch && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-700 dark:text-red-300 space-y-0.5">
                      <strong className="block font-bold">Observed Error Discrepancy!</strong>
                      <span>Provider claims operational, but AIEC observed {integ.aiecObservedErrorRate}% error rate. Trusting AIEC telemetry.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)] text-[10px] font-mono">
                    <div>
                      <span className="text-[var(--color-text-secondary)] block">Provider Uptime:</span>
                      <strong className="text-[var(--color-text-primary)]">{integ.uptimePct}%</strong>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)] block">AIEC Error Rate:</span>
                      <strong className={integ.aiecObservedErrorRate > 1.0 ? 'text-red-600' : 'text-emerald-600'}>
                        {integ.aiecObservedErrorRate}%
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <span className="text-[var(--color-text-secondary)] font-mono">
                      Last Incident: {integ.lastIncidentTimestamp}
                    </span>
                    <a
                      href={integ.providerStatusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent-primary)] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Status Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Incident Log & Reprocessing Console */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[var(--color-border)] pb-3">
            <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Recent Technical Incident Logs & Queue Recovery
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Track third-party outages and trigger manual queue reprocessing after third-party recovery
            </p>
          </div>

          <div className="space-y-3">
            {incidents.map(inc => (
              <div 
                key={inc.id}
                className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      inc.severity === 'critical' ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                    }`}>
                      {inc.severity.toUpperCase()}
                    </span>
                    <strong className="font-serif font-bold text-sm text-[var(--color-text-primary)]">{inc.title}</strong>
                  </div>

                  <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{inc.timestamp}</span>
                </div>

                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {inc.summary}
                </p>

                {inc.queuedRequestsReprocessingNeeded && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-600 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Action Required: Queued failed requests pending reprocessing
                    </span>

                    <button
                      onClick={() => handleReprocessQueued(inc.id)}
                      disabled={reprocessingIncId === inc.id}
                      className="px-3 py-1.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      {reprocessingIncId === inc.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Reprocess Queued Items</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
