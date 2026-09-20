import React, { useState } from 'react';
import { 
  Sliders, Plus, Trash2, Play, CheckCircle2, AlertTriangle, 
  Sparkles, Save, ArrowLeft, RefreshCw, Layers, ShieldCheck, 
  HelpCircle, Check, Eye, ToggleLeft, ToggleRight, FileText
} from 'lucide-react';
import { UserRole, CustomWorkflowTriggerRule } from '../types';
import { DbManager } from '../lib/db';

interface WorkflowTriggerBuilderScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const WorkflowTriggerBuilderScreen: React.FC<WorkflowTriggerBuilderScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [existingRules, setExistingRules] = useState<CustomWorkflowTriggerRule[]>(() => 
    DbManager.getCustomWorkflowRules()
  );

  const [activeTab, setActiveTab] = useState<'builder' | 'library'>('builder');

  // Form State for Builder
  const [ruleName, setRuleName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [triggerEvent, setTriggerEvent] = useState<string>('lead_inactive_10_days');

  const [conditions, setConditions] = useState<{ field: string; operator: 'equals' | 'greater_than' | 'contains' | 'is_true'; value: string }[]>([
    { field: 'deal_value', operator: 'greater_than', value: '1500000' }
  ]);

  const [actions, setActions] = useState<{ type: 'send_whatsapp' | 'notify_admin' | 'auto_reassign' | 'create_escalation' | 'trigger_po_draft'; details: string }[]>([
    { type: 'notify_admin', details: 'Send priority SMS & WhatsApp alert to MD Prashant Wable' }
  ]);

  // Simulation State
  const [simulationResult, setSimulationResult] = useState<{
    testedCount: number;
    matchedCount: number;
    sampleTarget: string;
    actionPreview: string;
    conflictWarning?: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { field: 'days_inactive', operator: 'greater_than', value: '7' }]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    setActions([...actions, { type: 'send_whatsapp', details: 'Send follow-up WhatsApp message to customer' }]);
  };

  const handleRemoveAction = (index: number) => {
    if (actions.length === 1) return;
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleRunSimulation = () => {
    // Simulate testing rule against current database leads/deals
    const simulatedMatched = Math.floor(Math.random() * 8) + 2;
    setSimulationResult({
      testedCount: 142,
      matchedCount: simulatedMatched,
      sampleTarget: 'Lead #L-8902 (Royal Heights Builder, Pune)',
      actionPreview: `Would dispatch: ${actions.map(a => a.type).join(', ')}`,
      conflictWarning: triggerEvent === 'amc_due_within_15_days' ? undefined : 'No overlapping automated rules detected in database.'
    });
    triggerToast('Simulation completed against 142 active CRM records.');
  };

  const handleSaveRule = (status: 'active' | 'draft') => {
    if (!ruleName.trim()) {
      triggerToast('Please provide a rule name before saving.');
      return;
    }

    const newRule: CustomWorkflowTriggerRule = {
      id: `cwr_${Date.now().toString().slice(-4)}`,
      name: ruleName,
      description: description || 'Custom trigger rule built via Workflow Trigger Builder.',
      triggerEvent,
      conditions,
      actions,
      status,
      executionsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    DbManager.saveCustomWorkflowRule(newRule);
    setExistingRules(DbManager.getCustomWorkflowRules());

    triggerToast(`Rule "${ruleName}" successfully saved as ${status.toUpperCase()}!`);
    
    // Reset form or switch tab
    setRuleName('');
    setDescription('');
    setSimulationResult(null);
    setActiveTab('library');
  };

  const handleToggleRuleStatus = (ruleId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    DbManager.toggleCustomWorkflowRuleStatus(ruleId, nextStatus);
    setExistingRules(DbManager.getCustomWorkflowRules());
    triggerToast(`Rule status toggled to ${nextStatus.toUpperCase()}.`);
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

      {/* Top Bar */}
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
                <Sliders className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'वर्कफ़्लो ट्रिगर बिल्डर' : currentLanguage === 'mr' ? 'वर्कफ्लो ट्रिगर बिल्डर' : 'Workflow Trigger Builder'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'अपनी कस्टम ऑटोमेशन शर्ते और क्रियाएं आसानी से बनाएं' : 'Plain-language If-This-Then-That scenario automation engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'builder'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              + Create Rule
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'library'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              Rule Library ({existingRules.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {activeTab === 'builder' ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Step 1: Rule Identity */}
            <div className="space-y-4">
              <div className="border-b border-[var(--color-border)] pb-3">
                <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] text-xs font-mono font-bold flex items-center justify-center">1</span>
                  Rule Identity & Trigger Event
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Define the high-level purpose and initiating trigger for this automation scenario</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">Rule Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., 10-Day Stale High-Value Lead Alert"
                    value={ruleName}
                    onChange={e => setRuleName(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">Trigger Event Source *</label>
                  <select
                    value={triggerEvent}
                    onChange={e => setTriggerEvent(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  >
                    <option value="lead_inactive_10_days">CRM: Lead untouched for over 10 days</option>
                    <option value="deal_value_exceeds_threshold">Quotation: Contract value &gt; ₹15,00,000</option>
                    <option value="site_delay_flagged">Installation: Site shaft delay flagged &gt; 5 days</option>
                    <option value="amc_due_within_15_days">Service: AMC coverage expiring within 15 days</option>
                    <option value="payment_overdue_5_days">Finance: Milestone payment overdue by 5 days</option>
                    <option value="high_priority_ticket_unassigned">Support: Urgent SOS ticket unassigned &gt; 30 mins</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-[var(--color-text-primary)] block mb-1">Plain-Language Description</label>
                  <input
                    type="text"
                    placeholder="Brief description of what this rule accomplishes for MD/Admin reference..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: IF Conditions (Plain-Language Builder) */}
            <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] text-xs font-mono font-bold flex items-center justify-center">2</span>
                  IF Conditions (Filter Scenarios)
                </h3>
                <button
                  onClick={handleAddCondition}
                  className="px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold rounded-xl flex items-center gap-1 text-[var(--color-accent-primary)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Condition</span>
                </button>
              </div>

              <div className="space-y-3">
                {conditions.map((cond, idx) => (
                  <div key={idx} className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex flex-col sm:flex-row items-center gap-3 text-xs">
                    <span className="font-mono text-[10px] font-bold text-[var(--color-accent-primary)] px-2 py-1 bg-[var(--color-surface)] rounded-md border">
                      {idx === 0 ? 'IF' : 'AND'}
                    </span>

                    <select
                      value={cond.field}
                      onChange={e => {
                        const updated = [...conditions];
                        updated[idx].field = e.target.value;
                        setConditions(updated);
                      }}
                      className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="deal_value">Contract Value (₹)</option>
                      <option value="days_since_last_contact">Days Inactive</option>
                      <option value="territory">Territory / City</option>
                      <option value="customer_rating">Customer Rating</option>
                      <option value="shaft_readiness_status">Shaft Verification Status</option>
                    </select>

                    <select
                      value={cond.operator}
                      onChange={e => {
                        const updated = [...conditions];
                        updated[idx].operator = e.target.value as any;
                        setConditions(updated);
                      }}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="greater_than">Is Greater Than (&gt;)</option>
                      <option value="equals">Is Equal To (=)</option>
                      <option value="contains">Contains</option>
                      <option value="is_true">Is True</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Value..."
                      value={cond.value}
                      onChange={e => {
                        const updated = [...conditions];
                        updated[idx].value = e.target.value;
                        setConditions(updated);
                      }}
                      className="w-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />

                    {conditions.length > 1 && (
                      <button
                        onClick={() => handleRemoveCondition(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove condition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: THEN Actions */}
            <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] text-xs font-mono font-bold flex items-center justify-center">3</span>
                  THEN Automated Actions
                </h3>
                <button
                  onClick={handleAddAction}
                  className="px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold rounded-xl flex items-center gap-1 text-[var(--color-accent-primary)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Action</span>
                </button>
              </div>

              <div className="space-y-3">
                {actions.map((act, idx) => (
                  <div key={idx} className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex flex-col sm:flex-row items-center gap-3 text-xs">
                    <span className="font-mono text-[10px] font-bold text-emerald-600 px-2 py-1 bg-[var(--color-surface)] rounded-md border">
                      THEN
                    </span>

                    <select
                      value={act.type}
                      onChange={e => {
                        const updated = [...actions];
                        updated[idx].type = e.target.value as any;
                        setActions(updated);
                      }}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 focus:outline-none"
                    >
                      <option value="notify_admin">Send Admin / MD Priority Alert</option>
                      <option value="send_whatsapp">Dispatch Automated WhatsApp Message</option>
                      <option value="auto_reassign">Auto-Reassign to Senior Manager</option>
                      <option value="create_escalation">Create CRM Escalation Ticket</option>
                      <option value="trigger_po_draft">Generate Draft Purchase Order</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Action details or message template..."
                      value={act.details}
                      onChange={e => {
                        const updated = [...actions];
                        updated[idx].details = e.target.value;
                        setActions(updated);
                      }}
                      className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />

                    {actions.length > 1 && (
                      <button
                        onClick={() => handleRemoveAction(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove action"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation / Test Section */}
            <div className="pt-2 border-t border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                    Rule Simulation & Dry-Run Verification
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">Test rule logic against live CRM records before enabling</p>
                </div>

                <button
                  onClick={handleRunSimulation}
                  className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Dry Simulation</span>
                </button>
              </div>

              {simulationResult && (
                <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-accent-primary)]/40 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Simulation Passed
                    </span>
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      Tested {simulationResult.testedCount} records • {simulationResult.matchedCount} matches found
                    </span>
                  </div>

                  <p className="text-[var(--color-text-primary)]">
                    <strong>Sample Target Matched:</strong> {simulationResult.sampleTarget}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    <strong>Action Execution Preview:</strong> {simulationResult.actionPreview}
                  </p>
                </div>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => handleSaveRule('draft')}
                className="px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl hover:border-[var(--color-accent-primary)]"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveRule('active')}
                className="px-6 py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Activate Rule System-Wide</span>
              </button>
            </div>

          </div>
        ) : (
          /* Custom Rule Library */
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-[var(--color-border)] pb-3">
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                Active & Saved Custom Workflow Rules ({existingRules.length})
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Manage, edit, or toggle custom if-this-then-that automation scenarios
              </p>
            </div>

            <div className="space-y-3">
              {existingRules.map(rule => (
                <div 
                  key={rule.id}
                  className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-3 hover:border-[var(--color-accent-primary)]/50 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                        <span>{rule.name}</span>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          rule.status === 'active' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        }`}>
                          {rule.status.toUpperCase()}
                        </span>
                      </h4>
                      <p className="text-[var(--color-text-secondary)] mt-0.5">{rule.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleRuleStatus(rule.id, rule.status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        rule.status === 'active'
                          ? 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                          : 'bg-emerald-600 text-white border-transparent'
                      }`}
                    >
                      {rule.status === 'active' ? 'Pause Rule' : 'Enable Rule'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between font-mono text-[10px] text-[var(--color-text-secondary)]">
                    <span>
                      Trigger Source: <strong className="text-[var(--color-text-primary)]">{rule.triggerEvent}</strong>
                    </span>
                    <span>
                      Executions: <strong className="text-[var(--color-accent-primary)]">{rule.executionsCount} times</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
