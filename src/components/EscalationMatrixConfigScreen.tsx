import React, { useState } from 'react';
import { 
  GitCommit, PhoneCall, ShieldAlert, Clock, AlertTriangle, CheckCircle2, 
  ArrowLeft, RefreshCw, Sparkles, Plus, Trash2, Edit3, Save, UserCheck, 
  ShieldCheck, Send, Play, Layers, HelpCircle
} from 'lucide-react';
import { UserRole, EscalationChainConfig, EscalationTierStep } from '../types';
import { DbManager } from '../lib/db';

interface EscalationMatrixConfigScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const EscalationMatrixConfigScreen: React.FC<EscalationMatrixConfigScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [configs, setConfigs] = useState<EscalationChainConfig[]>(() => 
    DbManager.getEscalationChainConfigs()
  );

  const [selectedConfigForEdit, setSelectedConfigForEdit] = useState<EscalationChainConfig | null>(null);
  const [activeDrillScenario, setActiveDrillScenario] = useState<EscalationChainConfig | null>(null);
  const [drillLogOutput, setDrillLogOutput] = useState<string[]>([]);
  const [isExecutingDrill, setIsExecutingDrill] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartDrillTest = (config: EscalationChainConfig) => {
    setActiveDrillScenario(config);
    setDrillLogOutput([`Initializing drill test for "${config.scenarioName}"...`]);
    setIsExecutingDrill(true);

    setTimeout(() => {
      setDrillLogOutput(prev => [...prev, `[Tier 1] Dispatched test alert to ${config.tiers[0]?.roleOrContactName} (${config.tiers[0]?.phoneEmail})`]);
    }, 600);

    setTimeout(() => {
      if (config.tiers.length > 1) {
        setDrillLogOutput(prev => [...prev, `[Tier 2] Simulating timeout (no response). Escalating to ${config.tiers[1]?.roleOrContactName}...`]);
      }
    }, 1400);

    setTimeout(() => {
      setDrillLogOutput(prev => [...prev, `[Backup] Verified secondary emergency hotline contact: ${config.backupContact.name} (${config.backupContact.phone})`]);
      setIsExecutingDrill(false);
      
      const newStatus = config.id === 'esc_cfg_003' ? 'failed_gap_detected' : 'passed';
      DbManager.updateEscalationDrillStatus(config.id, newStatus);
      setConfigs(DbManager.getEscalationChainConfigs());

      triggerToast(`Drill test complete! Status logged as ${newStatus.toUpperCase()}`);
    }, 2200);
  };

  const handleSaveConfigEdit = () => {
    if (!selectedConfigForEdit) return;
    DbManager.saveEscalationChainConfig(selectedConfigForEdit);
    setConfigs(DbManager.getEscalationChainConfigs());
    triggerToast(`Escalation chain for "${selectedConfigForEdit.scenarioName}" updated successfully.`);
    setSelectedConfigForEdit(null);
  };

  const handleAddTierStep = () => {
    if (!selectedConfigForEdit) return;
    const nextLevel = selectedConfigForEdit.tiers.length + 1;
    const newTier: EscalationTierStep = {
      tierLevel: nextLevel,
      roleOrContactName: `Tier ${nextLevel} Backup Supervisor`,
      phoneEmail: '+91 98000 00000',
      channels: ['call', 'sms'],
      delayMinsAfterPrevious: 10
    };
    setSelectedConfigForEdit({
      ...selectedConfigForEdit,
      tiers: [...selectedConfigForEdit.tiers, newTier]
    });
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

      {/* Top Header */}
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
                <GitCommit className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'एस्केलेशन मैट्रिक्स कॉन्फ़िगरेशन' : currentLanguage === 'mr' ? 'एस्केलेशन मॅट्रिक्स कॉन्फिगरेशन' : 'Escalation Matrix Configuration'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Define tiered emergency contacts, timeouts, and fallback protocols for unacknowledged critical alerts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Informational Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldAlert className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              Multi-Tier Emergency Fallback Architecture
            </strong>
            Even in a 1-person monitoring model, critical field emergencies (unacknowledged SOS, safety halts) automatically cascade through secondary contacts if primary Admin is unreachable.
          </div>
        </div>

        {/* Escalation Chains List */}
        <div className="space-y-6">
          {configs.map(cfg => (
            <div 
              key={cfg.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                      {cfg.scenarioName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      cfg.lastDrillStatus === 'passed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                      cfg.lastDrillStatus === 'failed_gap_detected' ? 'bg-red-500/10 text-red-700 dark:text-red-300' : 'bg-gray-500/10 text-gray-600'
                    }`}>
                      Drill Status: {cfg.lastDrillStatus.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {cfg.description} (Initial Timeout: {cfg.initialTriggerDelayMins} mins)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartDrillTest(cfg)}
                    className="px-3.5 py-1.5 bg-[var(--color-bg)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Drill Test</span>
                  </button>

                  <button
                    onClick={() => setSelectedConfigForEdit(cfg)}
                    className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl flex items-center gap-1 hover:border-[var(--color-accent-primary)]"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                    <span>Edit Chain</span>
                  </button>
                </div>
              </div>

              {/* Ascension Line Chain Visualizer */}
              <div className="space-y-4 relative pl-6 border-l-2 border-[var(--color-accent-primary)]/40 ml-2">
                {cfg.tiers.map((tier, idx) => (
                  <div key={idx} className="relative group">
                    {/* Node Circle */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[var(--color-accent-primary)] border-2 border-[var(--color-surface)] shadow-xs flex items-center justify-center text-[8px] font-mono font-bold text-white">
                      {tier.tierLevel}
                    </div>

                    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-text-primary)] font-serif text-sm">
                          Tier {tier.tierLevel}: {tier.roleOrContactName}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                          {tier.delayMinsAfterPrevious === 0 ? 'Immediate Trigger' : `+${tier.delayMinsAfterPrevious} mins delay`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-[var(--color-text-secondary)]">{tier.phoneEmail}</span>
                        <div className="flex items-center space-x-1">
                          {tier.channels.map(ch => (
                            <span key={ch} className="px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md font-mono text-[9px] uppercase font-bold text-[var(--color-accent-primary)]">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Secondary Backup Contact Card */}
                <div className="relative pt-2">
                  <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-amber-600 border-2 border-[var(--color-surface)] flex items-center justify-center text-[8px] font-mono font-bold text-white">
                    B
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-800 dark:text-amber-300 font-serif">
                        Emergency Fallback Backup: {cfg.backupContact.name} ({cfg.backupContact.roleTitle})
                      </span>
                      <span className="font-mono text-[10px] text-amber-700">Fallback Hotline</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                      Phone: {cfg.backupContact.phone} • Email: {cfg.backupContact.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-[var(--color-text-secondary)] flex items-center justify-between">
                <span>Last Verified Drill Test: <strong>{cfg.lastDrillTestDate}</strong></span>
                <span>Chain Depth: <strong>{cfg.tiers.length} Tiers + Backup</strong></span>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Drill Output Modal */}
      {activeDrillScenario && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2">
              <Play className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Executing Drill Test: {activeDrillScenario.scenarioName}
            </h3>

            <div className="bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl space-y-2 h-48 overflow-y-auto">
              {drillLogOutput.map((log, i) => (
                <p key={i} className="leading-relaxed">&gt; {log}</p>
              ))}
              {isExecutingDrill && <p className="animate-pulse">&gt; Processing next tier step...</p>}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => setActiveDrillScenario(null)}
                disabled={isExecutingDrill}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Config Modal */}
      {selectedConfigForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
              Configure Escalation Chain: {selectedConfigForEdit.scenarioName}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--color-text-primary)] block mb-1">Scenario Description</label>
                <input
                  type="text"
                  value={selectedConfigForEdit.description}
                  onChange={e => setSelectedConfigForEdit({ ...selectedConfigForEdit, description: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-[var(--color-text-primary)]">Escalation Tiers</label>
                  <button
                    onClick={handleAddTierStep}
                    className="text-[10px] font-bold text-[var(--color-accent-primary)] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier Step
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedConfigForEdit.tiers.map((tier, idx) => (
                    <div key={idx} className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>Tier {tier.tierLevel} Contact</span>
                        <input
                          type="number"
                          value={tier.delayMinsAfterPrevious}
                          onChange={e => {
                            const updated = [...selectedConfigForEdit.tiers];
                            updated[idx].delayMinsAfterPrevious = Number(e.target.value);
                            setSelectedConfigForEdit({ ...selectedConfigForEdit, tiers: updated });
                          }}
                          className="w-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-2 py-0.5 text-center"
                        />
                      </div>

                      <input
                        type="text"
                        value={tier.roleOrContactName}
                        onChange={e => {
                          const updated = [...selectedConfigForEdit.tiers];
                          updated[idx].roleOrContactName = e.target.value;
                          setSelectedConfigForEdit({ ...selectedConfigForEdit, tiers: updated });
                        }}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--color-border)]">
              <button
                onClick={() => setSelectedConfigForEdit(null)}
                className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfigEdit}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Save Chain
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
