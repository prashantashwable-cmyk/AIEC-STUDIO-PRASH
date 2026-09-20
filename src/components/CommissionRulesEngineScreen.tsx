import React, { useState } from 'react';
import { 
  ArrowLeft, Settings, Calculator, History, Send, CheckCircle2, 
  AlertCircle, ChevronRight, RefreshCw, Shield, Layers, Award, 
  Plus, Edit3, Eye, Sliders, DollarSign, ArrowUpRight, Lock, Bell, Sparkles
} from 'lucide-react';
import { Card, Button } from './Common';
import { DbManager } from '../lib/db';
import { 
  CommissionRule, 
  CommissionRuleVersionHistory, 
  UserRole 
} from '../types';

interface CommissionRulesEngineScreenProps {
  onBack: () => void;
  onNavigateToPayoutTracker?: () => void;
  userRole?: UserRole;
  currentLanguage?: 'en' | 'hi' | 'mr';
}

export const CommissionRulesEngineScreen: React.FC<CommissionRulesEngineScreenProps> = ({
  onBack,
  onNavigateToPayoutTracker,
  userRole = 'admin',
  currentLanguage = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'simulator' | 'history'>('rules');

  // Rules & History Data State
  const [rules, setRules] = useState<CommissionRule[]>(() => DbManager.getCommissionRules());
  const [history, setHistory] = useState<CommissionRuleVersionHistory[]>(() => DbManager.getCommissionRuleHistory());

  // Rule Editing Modal State
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [changeReason, setChangeReason] = useState<string>('');
  const [sendAdvanceNotice, setSendAdvanceNotice] = useState<boolean>(true);
  const [noticeText, setNoticeText] = useState<string>('');

  // Simulation Tool State
  const [simDealValue, setSimDealValue] = useState<number>(3500000); // Default ₹35,000,000 (35 Lakhs)
  const [simSurveyorTier, setSimSurveyorTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'>('gold');
  const [simTechnicianTier, setSimTechnicianTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'>('platinum');
  const [simQcTier, setSimQcTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'>('silver');

  // UI Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setRules(DbManager.getCommissionRules());
    setHistory(DbManager.getCommissionRuleHistory());
  };

  // Tier Multipliers Mapping
  const tierMultipliers: Record<string, number> = {
    bronze: 1.0,
    silver: 1.15,
    gold: 1.25,
    platinum: 1.4,
    diamond: 1.5
  };

  // Toggle Rule Active
  const handleToggleActive = (rule: CommissionRule) => {
    const updated = {
      ...rule,
      isActive: !rule.isActive,
      updatedBy: 'Mr. Prashant Vasant Wable'
    };
    DbManager.saveCommissionRule(updated, `Toggled rule ${updated.isActive ? 'active' : 'inactive'}`);
    refreshData();
    showToast(`Rule "${rule.ruleName}" is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
  };

  // Open Edit Modal
  const handleOpenEdit = (rule: CommissionRule) => {
    setEditingRule({ ...rule });
    setChangeReason('');
    setNoticeText(`Notice to Partners: ${rule.ruleName} configuration updated effective immediately.`);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    // Increment minor version
    const versionParts = editingRule.ruleVersion.replace('v', '').split('.');
    const major = versionParts[0] || '1';
    const minor = parseInt(versionParts[1] || '0') + 1;
    const newVersion = `v${major}.${minor}`;

    const updated: CommissionRule = {
      ...editingRule,
      ruleVersion: newVersion,
      advanceNoticeSent: sendAdvanceNotice,
      noticeNotes: sendAdvanceNotice ? noticeText : undefined,
      updatedBy: 'Mr. Prashant Vasant Wable'
    };

    DbManager.saveCommissionRule(updated, changeReason || `Updated rule parameter to version ${newVersion}`);
    refreshData();
    setEditingRule(null);
    showToast(`Rule updated to ${newVersion}! ${sendAdvanceNotice ? 'Advance notice dispatched to workforce.' : ''}`);
  };

  // Calculate Simulation Results
  const simLeadRule = rules.find(r => r.triggerEvent === 'surveyor_lead_capture' && r.isActive);
  const simConversionRule = rules.find(r => r.triggerEvent === 'deal_conversion' && r.isActive);
  const simTechRule = rules.find(r => r.triggerEvent === 'technician_job_completion' && r.isActive);
  const simQcRule = rules.find(r => r.triggerEvent === 'qc_inspection_passed' && r.isActive);

  const surveyorLeadBonus = simLeadRule 
    ? simLeadRule.baseRateOrAmount * (tierMultipliers[simSurveyorTier] || 1.0)
    : 0;

  const surveyorConversionCommission = simConversionRule
    ? (simDealValue * (simConversionRule.baseRateOrAmount / 100)) * (tierMultipliers[simSurveyorTier] || 1.0)
    : 0;

  const technicianStagePayout = simTechRule
    ? simTechRule.baseRateOrAmount * (tierMultipliers[simTechnicianTier] || 1.0)
    : 0;

  const qcAuditFee = simQcRule
    ? simQcRule.baseRateOrAmount * (tierMultipliers[simQcTier] || 1.0)
    : 0;

  const totalSimPayout = surveyorLeadBonus + surveyorConversionCommission + (technicianStagePayout * 3) + qcAuditFee;
  const simPayoutPercentOfDeal = simDealValue > 0 ? ((totalSimPayout / simDealValue) * 100).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Commission Rules Engine Configuration
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Central root for stage completion earnings, tier multipliers, simulation & version history
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateToPayoutTracker && (
                <Button 
                  onClick={onNavigateToPayoutTracker}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs py-2 px-3 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Stage-Wise Payout Tracker</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 mt-6 space-x-6">
            <button
              onClick={() => setActiveTab('rules')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'rules'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Active Commission Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Payout Simulation Engine
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-amber-500 text-amber-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Audit & Version History ({history.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: ACTIVE COMMISSION RULES LIST */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Single True Source of Truth:</span> All surveyor lead bonuses, deal conversion payouts, technician stage signoffs, and QC inspection fees across the entire platform read directly from this engine. Rule updates apply prospectively to future trigger events only.
              </div>
            </div>

            {/* Rules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map(rule => (
                <Card key={rule.id} className={`bg-white border rounded-xl overflow-hidden p-6 transition-all shadow-sm ${
                  !rule.isActive ? 'opacity-60 bg-slate-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {rule.ruleVersion}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{rule.ruleName}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Trigger: <span className="font-semibold text-slate-700">{rule.triggerEventLabel}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          rule.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Calculation Logic Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">Base Calculation Rate:</span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {rule.calculationType === 'fixed_amount' 
                          ? `₹${rule.baseRateOrAmount.toLocaleString('en-IN')}` 
                          : `${rule.baseRateOrAmount}% of Deal Value`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">Tier Multiplier Matrix:</span>
                      <span className="font-medium text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                        Gold ({rule.tierBonusMultiplier}x) / Platinum ({((rule.tierBonusMultiplier || 1) * 1.15).toFixed(2)}x)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">Stacking Rule:</span>
                      <span className="font-mono text-slate-700 capitalize">
                        {rule.stackingRule.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                    <div>
                      Effective: <span className="font-semibold text-slate-700">{rule.effectiveFromDate}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(rule)}
                      className="text-xs py-1 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border-slate-300 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Configure Parameters
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PAYOUT SIMULATION ENGINE */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Controls Panel */}
            <Card className="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-600" />
                  Deal Payout Scenario Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Test hypothetical elevator project parameters to evaluate total workforce payouts and margin impact.
                </p>
              </div>

              {/* Deal Value Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Hypothetical Project / Elevator Contract Value (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="50000"
                    value={simDealValue}
                    onChange={(e) => setSimDealValue(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">E.g., 6-Passenger Passenger Elevator in Pune Commercial Complex</p>
              </div>

              {/* Surveyor Tier Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Lead Surveyor Tier
                </label>
                <select
                  value={simSurveyorTier}
                  onChange={(e) => setSimSurveyorTier(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="bronze">Bronze Tier (1.0x Base)</option>
                  <option value="silver">Silver Tier (1.15x Base)</option>
                  <option value="gold">Gold Tier (1.25x Base)</option>
                  <option value="platinum">Platinum Tier (1.4x Base)</option>
                  <option value="diamond">Diamond Tier (1.5x Base)</option>
                </select>
              </div>

              {/* Technician Tier Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lead Installation Technician Tier
                </label>
                <select
                  value={simTechnicianTier}
                  onChange={(e) => setSimTechnicianTier(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="bronze">Bronze Technician (1.0x Stage Rate)</option>
                  <option value="silver">Silver Technician (1.15x Stage Rate)</option>
                  <option value="gold">Gold Technician (1.2x Stage Rate)</option>
                  <option value="platinum">Platinum Technician (1.4x Stage Rate)</option>
                  <option value="diamond">Diamond Technician (1.5x Stage Rate)</option>
                </select>
              </div>

              {/* QC Inspector Tier Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  QC Safety Inspector Tier
                </label>
                <select
                  value={simQcTier}
                  onChange={(e) => setSimQcTier(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="bronze">Bronze Inspector</option>
                  <option value="silver">Silver Inspector</option>
                  <option value="gold">Gold Inspector</option>
                  <option value="platinum">Platinum Inspector</option>
                </select>
              </div>
            </Card>

            {/* Output Calculation Results Panel */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="border-b border-slate-200 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Calculated Workforce Payout Breakdown</h4>
                    <p className="text-xs text-slate-500">Based on active engine rules and selected partner tiers</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    {simPayoutPercentOfDeal}% of Deal Value
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Lead Capture Payout */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-semibold text-slate-800">1. Surveyor Site Lead Capture Bonus</span>
                      <p className="text-xs text-slate-500">Tier multiplier ({simSurveyorTier.toUpperCase()}): {tierMultipliers[simSurveyorTier]}x</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900">₹{surveyorLeadBonus.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Deal Conversion Payout */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-semibold text-slate-800">2. Surveyor Deal Conversion Commission</span>
                      <p className="text-xs text-slate-500">2.5% base * {tierMultipliers[simSurveyorTier]}x multiplier on ₹{simDealValue.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900">₹{surveyorConversionCommission.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Technician Installation Stages */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-semibold text-slate-800">3. Technician Installation Stage Payouts (3 Stages)</span>
                      <p className="text-xs text-slate-500">₹8,500 base * {tierMultipliers[simTechnicianTier]}x * 3 stage signoffs</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900">₹{(technicianStagePayout * 3).toLocaleString('en-IN')}</span>
                  </div>

                  {/* QC Safety Inspection */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-semibold text-slate-800">4. Zero-Defect QC Audit Certificate Fee</span>
                      <p className="text-xs text-slate-500">Safety inspection signoff fee</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-900">₹{qcAuditFee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Total Summary Row */}
                <div className="mt-6 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Combined Commission Spend</span>
                    <p className="text-xs text-amber-400 mt-0.5">Retains healthy project gross profit margin</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-bold text-white">₹{totalSimPayout.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT & VERSION HISTORY */}
        {activeTab === 'history' && (
          <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Commission Rule Configuration Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">Auditable history of every rule modification, version tag, and change justification</p>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {history.map(item => (
                <div key={item.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {item.ruleVersion}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-base">{item.ruleName}</h4>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 font-medium">
                        "{item.changeReason}"
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>Modified by: <strong className="text-slate-700">{item.changedBy}</strong></span>
                        <span>•</span>
                        <span>Timestamp: <strong className="text-slate-700">{new Date(item.changedAt).toLocaleString()}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-500 block">Base Setting</span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {item.calculationType === 'fixed_amount' ? `₹${item.baseRateOrAmount.toLocaleString('en-IN')}` : `${item.baseRateOrAmount}%`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>

      {/* EDIT CONFIGURATION MODAL */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-white max-w-xl w-full p-6 rounded-2xl shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                Configure Rule Parameters
              </h3>
              <button 
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.ruleName}
                  onChange={(e) => setEditingRule({ ...editingRule, ruleName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calculation Method</label>
                  <select
                    value={editingRule.calculationType}
                    onChange={(e) => setEditingRule({ ...editingRule, calculationType: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                    <option value="percentage_of_value">Percentage of Value (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Rate / Amount</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRule.baseRateOrAmount}
                    onChange={(e) => setEditingRule({ ...editingRule, baseRateOrAmount: Number(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tier Bonus Multiplier (Gold Tier Base)</label>
                <input
                  type="number"
                  step="0.05"
                  value={editingRule.tierBonusMultiplier}
                  onChange={(e) => setEditingRule({ ...editingRule, tierBonusMultiplier: Number(e.target.value) || 1.0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Change Justification (Required for Audit Log)</label>
                <input
                  type="text"
                  placeholder="Reason for modifying rate or multiplier..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Advance Notice Toggle */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={sendAdvanceNotice}
                    onChange={(e) => setSendAdvanceNotice(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Dispatch Advance Notice Broadcast to Workforce</span>
                </label>

                {sendAdvanceNotice && (
                  <textarea
                    rows={2}
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRule(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                >
                  Save & Bump Version
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};
