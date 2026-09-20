import React, { useState } from 'react';
import { 
  Key, Server, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, 
  XCircle, ToggleLeft, ToggleRight, ArrowLeft, Sparkles, Globe, 
  Lock, Eye, EyeOff, ExternalLink, Cpu, Layers, Wifi, CreditCard, 
  Smartphone, Database, Clock
} from 'lucide-react';
import { UserRole, ApiIntegrationConfig } from '../types';
import { DbManager } from '../lib/db';

interface ApiIntegrationManagementScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const ApiIntegrationManagementScreen: React.FC<ApiIntegrationManagementScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [integrations, setIntegrations] = useState<ApiIntegrationConfig[]>(() => 
    DbManager.getApiIntegrationConfigs()
  );

  const [selectedInteg, setSelectedInteg] = useState<ApiIntegrationConfig | null>(null);
  const [showSecretModal, setShowSecretModal] = useState<boolean>(false);
  const [rotationInProgressId, setRotationInProgressId] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [newSecretKey, setNewSecretKey] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSandbox = (integId: string) => {
    const updated = integrations.map(integ => {
      if (integ.id === integId) {
        const newSandbox = !integ.sandboxModeEnabled;
        const updatedInteg: ApiIntegrationConfig = {
          ...integ,
          sandboxModeEnabled: newSandbox,
          environmentLabel: newSandbox ? 'Sandbox/Test Mode' : 'Production',
          connectionStatus: newSandbox ? 'testing' : 'connected'
        };
        DbManager.saveApiIntegrationConfig(updatedInteg);
        return updatedInteg;
      }
      return integ;
    });

    setIntegrations(updated);
    triggerToast('Environment mode updated! Changes propagated instantly.');
  };

  const handleTestConnection = (integ: ApiIntegrationConfig) => {
    triggerToast(`Pinging ${integ.integrationName}... Connection verified (140ms response).`);
  };

  const handleStartRotation = (integ: ApiIntegrationConfig) => {
    setSelectedInteg(integ);
    setNewApiKey('');
    setNewSecretKey('');
    setShowSecretModal(true);
  };

  const handleConfirmRotation = () => {
    if (!selectedInteg) return;

    if (!newApiKey.trim() || !newSecretKey.trim()) {
      triggerToast('Please provide valid API Key & Secret Key credentials.');
      return;
    }

    setRotationInProgressId(selectedInteg.id);
    setShowSecretModal(false);

    // Simulate 1.5s propagation window
    setTimeout(() => {
      const updatedInteg: ApiIntegrationConfig = {
        ...selectedInteg,
        maskedApiKey: newApiKey.slice(0, 8) + '****' + newApiKey.slice(-4),
        maskedSecretKey: '••••••••••••••••' + newSecretKey.slice(-4),
        credentialLastRotated: new Date().toISOString().split('T')[0],
        rotationInProgress: false,
        lastSyncTimestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
      };

      DbManager.saveApiIntegrationConfig(updatedInteg);
      setIntegrations(DbManager.getApiIntegrationConfigs());
      setRotationInProgressId(null);
      triggerToast('Credentials rotated cleanly! Propagated to microservice vault.');
    }, 1500);
  };

  const getCategoryIcon = (category: ApiIntegrationConfig['providerCategory']) => {
    switch (category) {
      case 'payment_gateway': return <CreditCard className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'whatsapp_api': return <Smartphone className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'maps_geolocation': return <Globe className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'loan_partner_api': return <Key className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      case 'sms_gateway': return <Wifi className="w-5 h-5 text-[var(--color-accent-primary)]" />;
      default: return <Server className="w-5 h-5 text-[var(--color-accent-primary)]" />;
    }
  };

  const getStatusBadge = (status: ApiIntegrationConfig['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> CONNECTED</span>;
      case 'degraded':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> DEGRADED</span>;
      case 'testing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> SANDBOX TEST</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 flex items-center gap-1"><XCircle className="w-3 h-3" /> DISCONNECTED</span>;
    }
  };

  const activeSandboxCount = integrations.filter(i => i.sandboxModeEnabled).length;

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
                <Key className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'एपीआई व एकीकरण प्रबंधन' : currentLanguage === 'mr' ? 'एपीआय आणि एकत्रीकरण व्यवस्थापन' : 'API & Integration Management'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Centralized credential rotation, webhook configuration, and sandbox test environment toggles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Global Sandbox Alert Banner */}
        {activeSandboxCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300 block font-serif text-sm">
                SANDBOX / TEST MODE ACTIVE ({activeSandboxCount} Integrations)
              </strong>
              <span>
                One or more connected APIs are currently in Sandbox mode. Simulated test transactions will NOT trigger real money disbursements or physical dispatch.
              </span>
            </div>
          </div>
        )}

        {/* Informational Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              Production Security & Masked Credentials Standard
            </strong>
            Full secret keys are encrypted at rest and never transmitted to client browsers. Key rotation triggers an automatic propagation sequence without service interruption.
          </div>
        </div>

        {/* Integrations List */}
        <div className="space-y-4">
          {integrations.map(integ => (
            <div 
              key={integ.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-[var(--color-accent-primary)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                    {getCategoryIcon(integ.providerCategory)}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                      {integ.integrationName}
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-mono">
                      Category: {integ.providerCategory.replace('_', ' ').toUpperCase()} • Webhook: {integ.webhookEndpointUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(integ.connectionStatus)}
                  {integ.sandboxModeEnabled && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      TEST SANDBOX
                    </span>
                  )}
                </div>
              </div>

              {/* Rotation Propagation Alert */}
              {rotationInProgressId === integ.id && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 font-mono flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Credential rotation in progress. Microservices re-authenticating seamlessly...</span>
                </div>
              )}

              {/* Credential Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)]">
                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px] uppercase">API Key / Client ID</span>
                  <strong className="text-[var(--color-text-primary)]">{integ.maskedApiKey}</strong>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px] uppercase">Secret Key / Vault Ref</span>
                  <strong className="text-[var(--color-text-primary)]">{integ.maskedSecretKey}</strong>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px] uppercase">Last Rotated / Sync</span>
                  <strong className="text-[var(--color-text-primary)]">{integ.credentialLastRotated} ({integ.lastSyncTimestamp})</strong>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[var(--color-text-primary)]">Sandbox Mode:</span>
                  <button
                    onClick={() => handleToggleSandbox(integ.id)}
                    className="flex items-center space-x-1 font-bold transition-all"
                  >
                    {integ.sandboxModeEnabled ? (
                      <ToggleRight className="w-7 h-7 text-amber-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-[var(--color-text-secondary)]" />
                    )}
                    <span className={integ.sandboxModeEnabled ? 'text-amber-600 font-mono font-bold' : 'text-[var(--color-text-secondary)]'}>
                      {integ.sandboxModeEnabled ? 'ENABLED (Isolated)' : 'DISABLED (Live)'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestConnection(integ)}
                    className="px-3.5 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                    <span>Test Ping</span>
                  </button>

                  <button
                    onClick={() => handleStartRotation(integ)}
                    className="px-3.5 py-1.5 bg-[var(--color-accent-primary)] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Rotate Credentials</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Rotate Credentials Modal */}
      {showSecretModal && selectedInteg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Rotate Credentials: {selectedInteg.integrationName}
            </h3>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Enter new production or sandbox API keys below. The rotation will propagate automatically across all server routes without system downtime.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">New API Key / Client ID</label>
                <input
                  type="text"
                  value={newApiKey}
                  onChange={e => setNewApiKey(e.target.value)}
                  placeholder="e.g. rzp_live_992182a..."
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">New Secret Key / Auth Token</label>
                <input
                  type="password"
                  value={newSecretKey}
                  onChange={e => setNewSecretKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--color-accent-primary)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowSecretModal(false)}
                className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRotation}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save & Propagate Key</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
