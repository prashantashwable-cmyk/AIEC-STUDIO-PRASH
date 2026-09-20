import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Award, AlertCircle, CheckCircle, Plus, Edit2, 
  Trash2, RefreshCw, Layers, DollarSign, Calendar, Lock, Unlock, FileText, 
  ChevronRight, Building2, HelpCircle, Save, X, ArrowUpRight
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SupplierPaymentTermsConfig, Supplier, SupplierScorecardDetail } from '../types';

export const SupplierPaymentTermsConfigScreen: React.FC = () => {
  const [configs, setConfigs] = useState<SupplierPaymentTermsConfig[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [scorecards, setScorecards] = useState<SupplierScorecardDetail[]>([]);

  const [activeTab, setActiveTab] = useState<'tier_defaults' | 'custom_overrides'>('tier_defaults');
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);

  // Modal State for Editing / Creating
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Partial<SupplierPaymentTermsConfig>>({
    termType: 'net_30',
    milestoneSplit: { advancePct: 20, dispatchDeliveryPct: 70, retentionPct: 10 },
    retentionPct: 10,
    autoReleaseRetentionDaysAfterHandover: 14,
    advanceRequiredFlag: false,
    creditLimitINR: 2500000,
    isCustomOverride: false,
    graduationScoreThreshold: 90,
    notes: ''
  });

  const loadData = () => {
    const cfgData = DbManager.getSupplierPaymentTermsConfigs();
    const suppData = DbManager.getSuppliers();
    const scoreData = DbManager.getSupplierScorecards();
    setConfigs(cfgData);
    setSuppliers(suppData);
    setScorecards(scoreData);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('aiec_db_update', loadData);
    return () => window.removeEventListener('aiec_db_update', loadData);
  }, []);

  const tierDefaults = configs.filter(c => !c.isCustomOverride);
  const customOverrides = configs.filter(c => c.isCustomOverride);

  const handleOpenNewOverrideModal = () => {
    setEditingConfig({
      id: `terms_override_${Date.now()}`,
      supplierId: suppliers[0]?.id || '',
      supplierName: suppliers[0]?.name || '',
      tierLevel: 'tier_2_approved',
      termType: 'milestone_split',
      milestoneSplit: { advancePct: 20, dispatchDeliveryPct: 70, retentionPct: 10 },
      retentionPct: 10,
      autoReleaseRetentionDaysAfterHandover: 14,
      advanceRequiredFlag: false,
      creditLimitINR: 2000000,
      isCustomOverride: true,
      graduationScoreThreshold: 85,
      lastUpdatedBy: 'Mr. Prashant Vasant Wable (Admin)',
      updatedAt: new Date().toISOString(),
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (config: SupplierPaymentTermsConfig) => {
    setEditingConfig({ ...config });
    setShowModal(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig.id) return;

    let targetSupplierName = editingConfig.supplierName;
    if (editingConfig.isCustomOverride && editingConfig.supplierId) {
      const s = suppliers.find(sup => sup.id === editingConfig.supplierId);
      if (s) targetSupplierName = s.name;
    }

    const updatedRecord: SupplierPaymentTermsConfig = {
      id: editingConfig.id,
      supplierId: editingConfig.supplierId,
      supplierName: targetSupplierName,
      tierLevel: editingConfig.tierLevel,
      termType: editingConfig.termType || 'net_30',
      milestoneSplit: editingConfig.milestoneSplit || { advancePct: 20, dispatchDeliveryPct: 70, retentionPct: 10 },
      retentionPct: editingConfig.retentionPct ?? 10,
      autoReleaseRetentionDaysAfterHandover: editingConfig.autoReleaseRetentionDaysAfterHandover ?? 14,
      advanceRequiredFlag: !!editingConfig.advanceRequiredFlag,
      creditLimitINR: editingConfig.creditLimitINR ?? 2000000,
      isCustomOverride: !!editingConfig.isCustomOverride,
      graduationScoreThreshold: editingConfig.graduationScoreThreshold ?? 85,
      lastUpdatedBy: 'Mr. Prashant Vasant Wable (Admin)',
      updatedAt: new Date().toISOString(),
      notes: editingConfig.notes || ''
    };

    if (configs.some(c => c.id === updatedRecord.id)) {
      DbManager.updateSupplierPaymentTermsConfig(updatedRecord);
    } else {
      DbManager.addSupplierPaymentTermsConfig(updatedRecord);
    }

    setShowModal(false);
  };

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'tier_1_preferred':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">Tier 1 Preferred</span>;
      case 'tier_2_approved':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">Tier 2 Approved</span>;
      case 'tier_3_probationary':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">Tier 3 Probationary</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">Standard Tier</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Financial Governance & Tiering
            </span>
            <span className="text-slate-400 text-xs">Prompt 100 Implementation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Payment Terms Configuration</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Configure binding commercial terms, milestone advance/dispatch splits, installation retention holds, credit limit ceilings, and tier graduation thresholds.
          </p>
        </div>
        <button
          onClick={handleOpenNewOverrideModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-indigo-600/20 transition flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Custom Negotiated Override
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveTab('tier_defaults')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'tier_defaults'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" /> System Tier Defaults ({tierDefaults.length})
        </button>
        <button
          onClick={() => setActiveTab('custom_overrides')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'custom_overrides'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" /> Custom Supplier Overrides ({customOverrides.length})
        </button>
      </div>

      {/* Tab 1: System Tier Defaults */}
      {activeTab === 'tier_defaults' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tierDefaults.map(cfg => (
            <div key={cfg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  {getTierBadge(cfg.tierLevel)}
                  <button
                    onClick={() => handleOpenEditModal(cfg)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Tier Policy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 capitalize mb-1">
                  {cfg.termType.replace('_', ' ')} Term Policy
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  {cfg.notes}
                </p>

                {/* Commercial Term Matrix */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Milestone Split (Adv / Dispatch / Ret)</span>
                    <span className="font-bold font-mono text-slate-900">
                      {cfg.milestoneSplit.advancePct}% / {cfg.milestoneSplit.dispatchDeliveryPct}% / {cfg.milestoneSplit.retentionPct}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>QC Installation Retention Hold</span>
                    <span className="font-bold text-emerald-700">{cfg.retentionPct}%</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Auto-Release Retention</span>
                    <span className="font-bold text-slate-900">{cfg.autoReleaseRetentionDaysAfterHandover} Days post-handover</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Advance Payment Mandate</span>
                    <span className={`font-bold ${cfg.advanceRequiredFlag ? 'text-amber-700' : 'text-slate-500'}`}>
                      {cfg.advanceRequiredFlag ? 'Required Upfront' : 'Waived'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Max Open Credit Limit</span>
                    <span className="font-bold font-mono text-indigo-700">{formatCurrency(cfg.creditLimitINR)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                    <span>Graduation Score Threshold</span>
                    <span className="font-bold text-slate-900">{cfg.graduationScoreThreshold}/100</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between items-center">
                <span>Updated by {cfg.lastUpdatedBy}</span>
                <span>{new Date(cfg.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Custom Supplier Overrides */}
      {activeTab === 'custom_overrides' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Custom Negotiated Payment Overrides</h3>
              <p className="text-xs text-slate-500">
                Supplier-specific contracts that override standard system tier defaults.
              </p>
            </div>
            <button
              onClick={handleOpenNewOverrideModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Override
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Supplier Name</th>
                  <th className="p-3.5">Tier & Terms</th>
                  <th className="p-3.5">Milestone Split</th>
                  <th className="p-3.5">Retention Hold</th>
                  <th className="p-3.5">Credit Ceiling</th>
                  <th className="p-3.5">Scorecard Perf</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customOverrides.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                      No custom supplier payment overrides defined yet.
                    </td>
                  </tr>
                ) : (
                  customOverrides.map(cfg => {
                    const sc = scorecards.find(s => s.supplierId === cfg.supplierId);
                    return (
                      <tr key={cfg.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{cfg.supplierName}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-1">
                            {getTierBadge(cfg.tierLevel)}
                            <div className="text-[11px] font-mono text-slate-600 capitalize">
                              {cfg.termType.replace('_', ' ')}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-medium text-slate-800">
                          {cfg.milestoneSplit.advancePct}% / {cfg.milestoneSplit.dispatchDeliveryPct}% / {cfg.milestoneSplit.retentionPct}%
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-800 font-medium">
                            {cfg.retentionPct}% hold
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Auto-release in {cfg.autoReleaseRetentionDaysAfterHandover}d
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-indigo-700">
                          {formatCurrency(cfg.creditLimitINR)}
                        </td>

                        <td className="p-3.5">
                          {sc ? (
                            <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 text-xs">
                              {sc.overallCompositeScorePct}/100 Score
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unevaluated</span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenEditModal(cfg)}
                            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Payment Terms Config */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                {editingConfig.isCustomOverride ? 'Custom Negotiated Override Config' : 'Edit System Tier Policy'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              {editingConfig.isCustomOverride && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Supplier *</label>
                  <select
                    required
                    value={editingConfig.supplierId || ''}
                    onChange={e => {
                      const s = suppliers.find(sup => sup.id === e.target.value);
                      setEditingConfig({
                        ...editingConfig,
                        supplierId: e.target.value,
                        supplierName: s ? s.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Tier</label>
                  <select
                    value={editingConfig.tierLevel || 'tier_2_approved'}
                    onChange={e => setEditingConfig({ ...editingConfig, tierLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="tier_1_preferred">Tier 1 Preferred</option>
                    <option value="tier_2_approved">Tier 2 Approved</option>
                    <option value="tier_3_probationary">Tier 3 Probationary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Term Type</label>
                  <select
                    value={editingConfig.termType || 'net_30'}
                    onChange={e => setEditingConfig({ ...editingConfig, termType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="net_15">Net-15 Days</option>
                    <option value="net_30">Net-30 Days</option>
                    <option value="net_45">Net-45 Days</option>
                    <option value="milestone_split">Milestone Stage Split</option>
                    <option value="advance_required">Advance Required (Upfront)</option>
                  </select>
                </div>
              </div>

              {/* Milestone Split Percentage Breakdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Milestone Payment Split (%)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Advance %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingConfig.milestoneSplit?.advancePct ?? 20}
                      onChange={e => {
                        const adv = Number(e.target.value);
                        const ret = editingConfig.milestoneSplit?.retentionPct ?? 10;
                        setEditingConfig({
                          ...editingConfig,
                          milestoneSplit: {
                            advancePct: adv,
                            dispatchDeliveryPct: Math.max(0, 100 - adv - ret),
                            retentionPct: ret
                          }
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Dispatch %</label>
                    <input
                      type="number"
                      disabled
                      value={editingConfig.milestoneSplit?.dispatchDeliveryPct ?? 70}
                      className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Retention %</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={editingConfig.milestoneSplit?.retentionPct ?? 10}
                      onChange={e => {
                        const ret = Number(e.target.value);
                        const adv = editingConfig.milestoneSplit?.advancePct ?? 20;
                        setEditingConfig({
                          ...editingConfig,
                          retentionPct: ret,
                          milestoneSplit: {
                            advancePct: adv,
                            dispatchDeliveryPct: Math.max(0, 100 - adv - ret),
                            retentionPct: ret
                          }
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Auto-Release Retention Days</label>
                  <input
                    type="number"
                    value={editingConfig.autoReleaseRetentionDaysAfterHandover ?? 14}
                    onChange={e => setEditingConfig({ ...editingConfig, autoReleaseRetentionDaysAfterHandover: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Days after site handover before retention auto-clears.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit Ceiling (₹)</label>
                  <input
                    type="number"
                    step={100000}
                    value={editingConfig.creditLimitINR ?? 2500000}
                    onChange={e => setEditingConfig({ ...editingConfig, creditLimitINR: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maximum open PO liability allowed.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Score Threshold (0-100)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={editingConfig.graduationScoreThreshold ?? 90}
                  onChange={e => setEditingConfig({ ...editingConfig, graduationScoreThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes & Reasons</label>
                <textarea
                  rows={2}
                  placeholder="Note special commercial justifications, director approvals, or OEM arrangements..."
                  value={editingConfig.notes || ''}
                  onChange={e => setEditingConfig({ ...editingConfig, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Terms Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
