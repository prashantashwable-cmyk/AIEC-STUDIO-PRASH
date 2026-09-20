import React, { useState, useEffect } from 'react';
import { User, AutoPoTriggerRule, Supplier } from '../types';
import { DbManager } from '../lib/db';
import { Card } from './Common';
import { 
  Settings, Sliders, Shield, Play, CheckCircle2, AlertTriangle, 
  Cpu, DollarSign, Clock, Award, MapPin, Save, RefreshCw, Info,
  Sparkles, Layers, ToggleLeft, ToggleRight, ArrowRight
} from 'lucide-react';

interface AutoPoTriggerRulesProps {
  user: User;
  onNavigateToPOs?: () => void;
}

const SAMPLE_CONFIGS = [
  { id: 'cfg_1', name: 'Standard 6-Pax Gearless Traction Elevator', driveType: 'Traction Drives', basePrice: 480000 },
  { id: 'cfg_2', name: '4-Pax Home Hydraulic Elevator Power Pack', driveType: 'Hydraulic Cylinders', basePrice: 320000 },
  { id: 'cfg_3', name: '8-Pax Commercial MRL Gearless Machine & Controller', driveType: 'Traction Drives', basePrice: 650000 },
  { id: 'cfg_4', name: 'Pneumatic Vacuum Cylinder & Turbine System', driveType: 'Vacuum Pneumatic Systems', basePrice: 450000 }
];

export const AutoPoTriggerRules: React.FC<AutoPoTriggerRulesProps> = ({ user, onNavigateToPOs }) => {
  const [rules, setRules] = useState<AutoPoTriggerRule[]>([]);
  const [activeRuleId, setActiveRuleId] = useState<string>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Selected Rule Editing States
  const [ruleName, setRuleName] = useState('');
  const [triggerCondition, setTriggerCondition] = useState<'immediately_on_countersignature' | 'after_advance_payment_clears' | 'after_site_readiness_approved'>('immediately_on_countersignature');
  const [priceWeight, setPriceWeight] = useState(40);
  const [deliverySpeedWeight, setDeliverySpeedWeight] = useState(30);
  const [performanceScoreWeight, setPerformanceScoreWeight] = useState(20);
  const [regionProximityWeight, setRegionProximityWeight] = useState(10);
  const [approvalThreshold, setApprovalThreshold] = useState(500000);
  const [requireApprovalIfDiscrepancy, setRequireApprovalIfDiscrepancy] = useState(true);
  const [ruleActiveFlag, setRuleActiveFlag] = useState(true);

  // Simulation tool states
  const [selectedSampleConfigId, setSelectedSampleConfigId] = useState('cfg_1');
  const [simulationResult, setSimulationResult] = useState<AutoPoTriggerRule['lastSimulatedResult'] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    const rData = DbManager.getAutoPoRules();
    const sData = DbManager.getSuppliers();
    setRules(rData);
    setSuppliers(sData);

    if (rData.length > 0) {
      const cur = rData[0];
      setActiveRuleId(cur.id);
      loadRuleToForm(cur);
    }
  };

  const loadRuleToForm = (rule: AutoPoTriggerRule) => {
    setRuleName(rule.ruleName);
    setTriggerCondition(rule.triggerCondition);
    setPriceWeight(rule.weights.priceWeight);
    setDeliverySpeedWeight(rule.weights.deliverySpeedWeight);
    setPerformanceScoreWeight(rule.weights.performanceScoreWeight);
    setRegionProximityWeight(rule.weights.regionProximityWeight);
    setApprovalThreshold(rule.approvalThresholdAmount);
    setRequireApprovalIfDiscrepancy(rule.requireApprovalIfDiscrepancy);
    setRuleActiveFlag(rule.ruleActiveFlag);
    setSimulationResult(rule.lastSimulatedResult || null);
  };

  const currentRule = rules.find(r => r.id === activeRuleId) || rules[0];

  const totalWeight = priceWeight + deliverySpeedWeight + performanceScoreWeight + regionProximityWeight;

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRule) return;

    if (totalWeight !== 100) {
      alert(`Matching weights must total exactly 100%. Current total: ${totalWeight}%`);
      return;
    }

    const updatedRule: AutoPoTriggerRule = {
      ...currentRule,
      ruleName,
      triggerCondition,
      weights: {
        priceWeight,
        deliverySpeedWeight,
        performanceScoreWeight,
        regionProximityWeight
      },
      approvalThresholdAmount: approvalThreshold,
      requireApprovalIfDiscrepancy,
      ruleActiveFlag,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name,
      lastSimulatedResult: simulationResult || undefined
    };

    DbManager.updateAutoPoRule(updatedRule);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const sample = SAMPLE_CONFIGS.find(c => c.id === selectedSampleConfigId) || SAMPLE_CONFIGS[0];
      const activeSuppliers = suppliers.filter(s => s.status === 'active' && s.kycStatus === 'Verified');

      if (activeSuppliers.length === 0) {
        setIsSimulating(false);
        return;
      }

      // Calculate weighted score for each supplier
      const scoredSuppliers = activeSuppliers.map(s => {
        // Find average catalog price or estimate
        const catItem = s.catalog.find(c => c.category === sample.driveType || c.itemName.toLowerCase().includes(sample.driveType.toLowerCase()));
        const price = catItem ? catItem.price : sample.basePrice;
        const leadTime = catItem?.leadTimeDays || 14;

        // Normalize metrics to 0-100 scale
        const priceScore = Math.max(10, 100 - (price / sample.basePrice - 0.8) * 100);
        const speedScore = Math.max(10, 100 - (leadTime - 5) * 4);
        const perfScore = s.performanceScore || 85;
        const regionScore = s.regionServed.toLowerCase().includes('pune') ? 100 : 70;

        const composite = (
          (priceScore * priceWeight) +
          (speedScore * deliverySpeedWeight) +
          (perfScore * performanceScoreWeight) +
          (regionScore * regionProximityWeight)
        ) / 100;

        return {
          supplier: s,
          price,
          leadTime,
          compositeScore: parseFloat(composite.toFixed(1))
        };
      });

      scoredSuppliers.sort((a, b) => b.compositeScore - a.compositeScore);

      const top = scoredSuppliers[0];
      const runnerUp = scoredSuppliers[1];

      // Concentration warning if price weight > 50
      let concentrationWarning: string | undefined = undefined;
      if (priceWeight >= 50) {
        concentrationWarning = `Heavy price weight (${priceWeight}%) consistently favors lower-cost vendors, increasing single-source concentration risk.`;
      }

      const simRes = {
        simulatedAt: new Date().toISOString(),
        sampleConfig: sample.name,
        selectedSupplierId: top.supplier.id,
        selectedSupplierName: top.supplier.name,
        calculatedScore: top.compositeScore,
        runnerUpSupplierName: runnerUp ? runnerUp.supplier.name : 'N/A',
        concentrationWarning
      };

      setSimulationResult(simRes);
      setIsSimulating(false);

      // Save to active rule
      if (currentRule) {
        DbManager.updateAutoPoRule({
          ...currentRule,
          lastSimulatedResult: simRes
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-2xl border border-gold/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-antiquegold bg-antiquegold/10 px-2.5 py-1 rounded-full border border-antiquegold/20">
              Module 10 • Screen 4
            </span>
            <span className="text-xs font-semibold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Autonomous Purchase Order Engine
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal mt-2">
            Auto-PO Trigger & Routing Rules
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Configure deal-closure conditions, multi-variable supplier scoring weights, and financial threshold governance.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {hasSaved && (
            <span className="text-xs font-semibold text-royalemerald bg-royalemerald/10 px-3 py-2 rounded-xl border border-royalemerald/20 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Rule Saved!
            </span>
          )}
          <button
            onClick={handleSaveRule}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Rule Settings
          </button>
        </div>
      </div>

      {/* Rule Selection Bar */}
      <Card className="p-4 bg-surface border-gold/15 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Settings className="w-5 h-5 text-antiquegold" />
          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wide">
              Active Trigger Rule Policy
            </label>
            <select
              value={activeRuleId}
              onChange={(e) => {
                setActiveRuleId(e.target.value);
                const found = rules.find(r => r.id === e.target.value);
                if (found) loadRuleToForm(found);
              }}
              className="mt-0.5 bg-background border border-gold/20 rounded-xl px-3 py-1.5 text-sm font-semibold text-charcoal focus:outline-none focus:border-antiquegold block w-full"
            >
              {rules.map(r => (
                <option key={r.id} value={r.id}>
                  {r.ruleName} ({r.ruleActiveFlag ? 'Active' : 'Disabled'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-charcoal/60">Rule Status:</span>
          <button
            type="button"
            onClick={() => setRuleActiveFlag(!ruleActiveFlag)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              ruleActiveFlag 
                ? 'bg-royalemerald/10 text-royalemerald border-royalemerald/30' 
                : 'bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {ruleActiveFlag ? <ToggleRight className="w-4 h-4 text-royalemerald" /> : <ToggleLeft className="w-4 h-4" />}
            {ruleActiveFlag ? 'Auto-PO Trigger Active' : 'Trigger Disabled'}
          </button>
        </div>
      </Card>

      {/* Main Settings Sections */}
      <form onSubmit={handleSaveRule} className="space-y-6">
        {/* Section 1: Trigger Condition */}
        <Card className="p-6 bg-surface border-gold/15 space-y-4">
          <div className="flex items-center gap-2 border-b border-gold/15 pb-3">
            <Cpu className="w-5 h-5 text-antiquegold" />
            <h2 className="text-base font-serif font-bold text-charcoal">
              1. Deal Closure Trigger Conditions
            </h2>
          </div>

          <p className="text-xs text-charcoal/70">
            Define the exact deal event that triggers the Purchase Order Generator to draft orders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              triggerCondition === 'immediately_on_countersignature'
                ? 'bg-antiquegold/10 border-antiquegold text-charcoal shadow-sm'
                : 'bg-background border-gold/20 hover:border-gold/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Immediate Countersign</span>
                <input
                  type="radio"
                  name="trigger"
                  checked={triggerCondition === 'immediately_on_countersignature'}
                  onChange={() => setTriggerCondition('immediately_on_countersignature')}
                  className="accent-antiquegold"
                />
              </div>
              <p className="text-xs text-charcoal/70 mt-2">
                Draft POs immediately when both customer and AIEC sign the quotation agreement. Fast speed, requires high cash-flow confidence.
              </p>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              triggerCondition === 'after_advance_payment_clears'
                ? 'bg-antiquegold/10 border-antiquegold text-charcoal shadow-sm'
                : 'bg-background border-gold/20 hover:border-gold/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Post Payment Clear</span>
                <input
                  type="radio"
                  name="trigger"
                  checked={triggerCondition === 'after_advance_payment_clears'}
                  onChange={() => setTriggerCondition('after_advance_payment_clears')}
                  className="accent-antiquegold"
                />
              </div>
              <p className="text-xs text-charcoal/70 mt-2">
                Draft POs only once Stage 1 Advance Payment (e.g. 20-30%) clears bank receipt. Recommended balanced risk profile.
              </p>
            </label>

            <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              triggerCondition === 'after_site_readiness_approved'
                ? 'bg-antiquegold/10 border-antiquegold text-charcoal shadow-sm'
                : 'bg-background border-gold/20 hover:border-gold/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Site Readiness Cleared</span>
                <input
                  type="radio"
                  name="trigger"
                  checked={triggerCondition === 'after_site_readiness_approved'}
                  onChange={() => setTriggerCondition('after_site_readiness_approved')}
                  className="accent-antiquegold"
                />
              </div>
              <p className="text-xs text-charcoal/70 mt-2">
                Draft POs only after surveyor approves civil shaft readiness. Conservative profile, prevents early component storage fees.
              </p>
            </label>
          </div>
        </Card>

        {/* Section 2: Multi-Variable Supplier Matching Weights */}
        <Card className="p-6 bg-surface border-gold/15 space-y-4">
          <div className="flex items-center justify-between border-b border-gold/15 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-antiquegold" />
              <h2 className="text-base font-serif font-bold text-charcoal">
                2. Supplier Auto-Routing Preference Weights
              </h2>
            </div>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
              totalWeight === 100 
                ? 'bg-royalemerald/10 text-royalemerald border border-royalemerald/20' 
                : 'bg-red-500/10 text-red-600 border border-red-500/20'
            }`}>
              Total Weight: {totalWeight}% / 100%
            </span>
          </div>

          <p className="text-xs text-charcoal/70">
            Define how the PO Generator ranks and auto-suggests suppliers for closed deal items.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Weight */}
            <div className="bg-background p-4 rounded-xl border border-gold/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-charcoal flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-royalemerald" /> Unit Catalog Price Weight
                </span>
                <span className="font-mono font-bold text-antiquegold">{priceWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={priceWeight}
                onChange={(e) => setPriceWeight(parseInt(e.target.value))}
                className="w-full accent-antiquegold cursor-pointer"
              />
              <p className="text-[11px] text-charcoal/60">
                Favors suppliers publishing lower catalog unit costs for matching equipment categories.
              </p>
            </div>

            {/* Delivery Speed Weight */}
            <div className="bg-background p-4 rounded-xl border border-gold/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-charcoal flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-royalemerald" /> Delivery Speed / Lead Time Weight
                </span>
                <span className="font-mono font-bold text-antiquegold">{deliverySpeedWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={deliverySpeedWeight}
                onChange={(e) => setDeliverySpeedWeight(parseInt(e.target.value))}
                className="w-full accent-antiquegold cursor-pointer"
              />
              <p className="text-[11px] text-charcoal/60">
                Favors vendors offering shorter component manufacturing lead times in days.
              </p>
            </div>

            {/* Performance Score Weight */}
            <div className="bg-background p-4 rounded-xl border border-gold/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-charcoal flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-royalemerald" /> Past SLA & Quality Score Weight
                </span>
                <span className="font-mono font-bold text-antiquegold">{performanceScoreWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={performanceScoreWeight}
                onChange={(e) => setPerformanceScoreWeight(parseInt(e.target.value))}
                className="w-full accent-antiquegold cursor-pointer"
              />
              <p className="text-[11px] text-charcoal/60">
                Favors suppliers with high historical performance scores (&gt;90/100) and low defect rates.
              </p>
            </div>

            {/* Region Proximity Weight */}
            <div className="bg-background p-4 rounded-xl border border-gold/20 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-charcoal flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-royalemerald" /> Regional Logistics Proximity
                </span>
                <span className="font-mono font-bold text-antiquegold">{regionProximityWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={regionProximityWeight}
                onChange={(e) => setRegionProximityWeight(parseInt(e.target.value))}
                className="w-full accent-antiquegold cursor-pointer"
              />
              <p className="text-[11px] text-charcoal/60">
                Favors local Pune/Chakan/Bhiwandi suppliers to minimize transit time & freight fees.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 3: Financial Risk & Approval Thresholds */}
        <Card className="p-6 bg-surface border-gold/15 space-y-4">
          <div className="flex items-center gap-2 border-b border-gold/15 pb-3">
            <Shield className="w-5 h-5 text-antiquegold" />
            <h2 className="text-base font-serif font-bold text-charcoal">
              3. Governance & Admin Manual Approval Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                Mandatory Admin Approval Financial Threshold (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-charcoal/50">₹</span>
                <input
                  type="number"
                  step="25000"
                  min="50000"
                  value={approvalThreshold}
                  onChange={(e) => setApprovalThreshold(parseFloat(e.target.value) || 500000)}
                  className="w-full bg-background border border-gold/20 rounded-xl pl-8 pr-4 py-2 text-sm font-mono font-bold text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>
              <p className="text-[11px] text-charcoal/60 mt-1">
                Any PO drafted above ₹{approvalThreshold.toLocaleString('en-IN')} will be held in 'Draft (Approval Required)' state until manual Admin sign-off.
              </p>
            </div>

            <div className="flex flex-col justify-center bg-background p-4 rounded-xl border border-gold/20">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApprovalIfDiscrepancy}
                  onChange={(e) => setRequireApprovalIfDiscrepancy(e.target.checked)}
                  className="mt-1 rounded text-antiquegold focus:ring-antiquegold accent-antiquegold"
                />
                <div>
                  <span className="text-xs font-bold text-charcoal block">
                    Require Approval on Price Discrepancies
                  </span>
                  <span className="text-[11px] text-charcoal/60 mt-0.5 block">
                    Automatically hold any PO for Admin sign-off if vendor's catalog price exceeds quotation cost baseline assumptions.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </Card>
      </form>

      {/* Section 4: Interactive Simulation Tool */}
      <Card className="p-6 bg-surface border-gold/20 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gold/15 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-antiquegold" />
            <div>
              <h2 className="text-base font-serif font-bold text-charcoal">
                4. Supplier Auto-Routing Simulation Tool
              </h2>
              <p className="text-xs text-charcoal/60">
                Test which vendor your current weighting rules would auto-select for a sample elevator configuration.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || totalWeight !== 100}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-royalemerald hover:bg-royalemerald/90 text-white text-xs font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-charcoal/80 mb-1">
              Select Sample Elevator Requirement
            </label>
            <select
              value={selectedSampleConfigId}
              onChange={(e) => setSelectedSampleConfigId(e.target.value)}
              className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
            >
              {SAMPLE_CONFIGS.map(cfg => (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.name} (Est ₹{cfg.basePrice.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Ascension Line Pipeline Motif for Simulation Progress */}
          <div className="md:col-span-2 flex items-center gap-2 bg-background p-3 rounded-xl border border-gold/15">
            <div className="w-2 bg-antiquegold rounded-full h-10 animate-pulse" />
            <div className="text-xs text-charcoal/80 space-y-0.5">
              <span className="font-bold text-antiquegold block">Ascension Match Engine Status:</span>
              <span className="font-mono text-[11px] text-charcoal/60">
                Evaluating {suppliers.filter(s => s.status === 'active').length} active vendors using {priceWeight}/{deliverySpeedWeight}/{performanceScoreWeight}/{regionProximityWeight} weights...
              </span>
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="bg-background rounded-xl p-4 border border-gold/30 space-y-3 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gold/15 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-antiquegold" />
                <span className="text-xs font-bold text-charcoal">
                  Simulated Selected Sourcing Partner:
                </span>
                <span className="text-sm font-bold text-royalemerald">
                  {simulationResult.selectedSupplierName}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-charcoal/80">
                Composite Score: <span className="text-antiquegold text-sm">{simulationResult.calculatedScore}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-charcoal/80">
                <span className="font-semibold text-charcoal/60">Runner-Up Vendor:</span>
                <span className="font-mono">{simulationResult.runnerUpSupplierName}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal/80">
                <span className="font-semibold text-charcoal/60">Simulation Timestamp:</span>
                <span className="font-mono text-[11px]">{new Date(simulationResult.simulatedAt).toLocaleString()}</span>
              </div>
            </div>

            {simulationResult.concentrationWarning && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Concentration Risk Alert:</strong>
                  <span>{simulationResult.concentrationWarning}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
