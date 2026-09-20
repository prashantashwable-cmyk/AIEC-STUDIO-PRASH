import React, { useState, useEffect } from 'react';
import { User, ProductionStatusRecord, StageEvidenceUpload, ProductionStageHistory } from '../types';
import { DbManager } from '../lib/db';
import { Card } from './Common';
import { 
  Factory, Shield, Clock, AlertTriangle, CheckCircle2, ChevronRight, 
  Search, Filter, Upload, FileText, Camera, AlertCircle, RefreshCw, 
  Layers, ArrowRight, ArrowLeft, RotateCcw, Building, MapPin, Eye, ExternalLink, Plus
} from 'lucide-react';

interface ManufacturerProductionStatusProps {
  user: User;
  onNavigateToPO?: (poId: string) => void;
  onNavigateToTracking?: () => void;
}

const STAGES: { name: ProductionStatusRecord['productionStage']; label: string; desc: string; defaultPct: number }[] = [
  { name: 'Raw Material Sourced', label: '1. Raw Material Sourced', desc: 'Metals, windings, raw components acquired', defaultPct: 25 },
  { name: 'Custom Fabrication', label: '2. Custom Fabrication', desc: 'CNC machining, welding, precision bending', defaultPct: 60 },
  { name: 'Quality & Testing', label: '3. Quality & Testing', desc: 'Electrical safety, insulation, load test', defaultPct: 85 },
  { name: 'Packaging & Dispatch', label: '4. Packaging & Dispatch', desc: 'Protective wrapping, wooden crating, GRN ready', defaultPct: 100 }
];

export const ManufacturerProductionStatus: React.FC<ManufacturerProductionStatusProps> = ({
  user,
  onNavigateToPO,
  onNavigateToTracking
}) => {
  const [records, setRecords] = useState<ProductionStatusRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');
  const [stalledOnlyFilter, setStalledOnlyFilter] = useState(false);

  // Selected Record Modal / Action
  const [activeRecord, setActiveRecord] = useState<ProductionStatusRecord | null>(null);
  const [updateStage, setUpdateStage] = useState<ProductionStatusRecord['productionStage']>('Custom Fabrication');
  const [updatePct, setUpdatePct] = useState<number>(65);
  const [updateNote, setUpdateNote] = useState('');
  const [isStalled, setIsStalled] = useState(false);
  const [stallReason, setStallReason] = useState('');
  const [isRegression, setIsRegression] = useState(false);
  
  // New Evidence Upload State
  const [newDocName, setNewDocName] = useState('');
  const [newDocNote, setNewDocNote] = useState('');

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    let recs = DbManager.getProductionRecords();
    if (user.role === 'supplier') {
      recs = recs.filter(r => r.supplierId === user.supplierId || r.supplierName.toLowerCase().includes(user.name.toLowerCase()));
    }
    setRecords(recs);
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.batchNumber && r.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = selectedStageFilter === 'All' || r.productionStage === selectedStageFilter;
    const matchesStalled = !stalledOnlyFilter || r.stalledFlag;
    return matchesSearch && matchesStage && matchesStalled;
  });

  const handleOpenUpdateModal = (rec: ProductionStatusRecord) => {
    setActiveRecord(rec);
    setUpdateStage(rec.productionStage);
    setUpdatePct(rec.completionPercentage);
    setUpdateNote('');
    setIsStalled(rec.stalledFlag);
    setStallReason(rec.stalledReason || '');
    setIsRegression(false);
    setNewDocName('');
    setNewDocNote('');
  };

  const handleSaveProductionUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecord) return;

    const nowIso = new Date().toISOString();
    
    // Check if new evidence document was provided
    const existingUploads = activeRecord.stageEvidenceUploads || [];
    let updatedUploads = [...existingUploads];
    if (newDocName.trim()) {
      updatedUploads.unshift({
        id: `up_${Date.now()}`,
        stageName: updateStage,
        fileName: newDocName.trim(),
        fileUrl: '#',
        uploadedAt: nowIso,
        uploadedBy: `${user.name} (${user.role.toUpperCase()})`,
        note: newDocNote || 'Milestone evidence uploaded'
      });
    }

    const newHistoryEntry: ProductionStageHistory = {
      stageName: updateStage,
      timestamp: nowIso,
      updatedBy: `${user.name} (${user.role.toUpperCase()})`,
      note: updateNote || (isRegression ? 'Quality defect rework logged' : `Stage updated to ${updateStage}`),
      completionPercentage: updatePct,
      isRegression: isRegression
    };

    const updatedRecord: ProductionStatusRecord = {
      ...activeRecord,
      productionStage: updateStage,
      completionPercentage: updatePct,
      stalledFlag: isStalled,
      stalledReason: isStalled ? stallReason : undefined,
      stalledSinceDays: isStalled ? (activeRecord.stalledSinceDays ? activeRecord.stalledSinceDays + 1 : 1) : undefined,
      stageEvidenceUploads: updatedUploads,
      stageHistory: [newHistoryEntry, ...(activeRecord.stageHistory || [])],
      updatedAt: nowIso
    };

    DbManager.updateProductionRecord(updatedRecord);

    // Also update PO status in DbManager if stage is Packaging & Dispatch
    if (updateStage === 'Packaging & Dispatch' && updatePct >= 100) {
      const pos = DbManager.getPurchaseOrders();
      const targetPo = pos.find(p => p.id === activeRecord.poId);
      if (targetPo && targetPo.status !== 'Ready to Ship' && targetPo.status !== 'Shipped' && targetPo.status !== 'Delivered') {
        DbManager.updatePurchaseOrder({
          ...targetPo,
          status: 'Ready to Ship',
          actualStatusUpdateTimestamp: nowIso
        });
      }
    }

    setActiveRecord(null);
  };

  const totalActiveJobs = records.length;
  const totalStalledJobs = records.filter(r => r.stalledFlag).length;
  const avgCompletionPct = records.length > 0 
    ? Math.round(records.reduce((sum, r) => sum + r.completionPercentage, 0) / records.length) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-2xl border border-gold/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-antiquegold bg-antiquegold/10 px-2.5 py-1 rounded-full border border-antiquegold/20">
              Module 10 • Screen 6
            </span>
            <span className="text-xs font-semibold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20 flex items-center gap-1">
              <Factory className="w-3.5 h-3.5" /> Manufacturer Precision Tracker
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal mt-2">
            Manufacturer Production Status
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Deep stage-by-stage component fabrication tracking with milestone evidence uploads and automated stall escalation.
          </p>
        </div>

        {onNavigateToTracking && (
          <button
            onClick={onNavigateToTracking}
            className="px-4 py-2.5 rounded-xl border border-gold/30 bg-surface hover:bg-gold/10 text-charcoal text-sm font-semibold transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-antiquegold" />
            Order Fulfillment Board
          </button>
        )}
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-gold/15 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-antiquegold/10 text-antiquegold">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-charcoal/60 font-medium">Active Production Runs</div>
            <div className="text-xl font-mono font-bold text-charcoal">{totalActiveJobs}</div>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-gold/15 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-royalemerald/10 text-royalemerald">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-charcoal/60 font-medium">Avg Completion</div>
            <div className="text-xl font-mono font-bold text-royalemerald">{avgCompletionPct}%</div>
          </div>
        </Card>

        <Card className={`p-4 bg-surface border flex items-center gap-3 ${
          totalStalledJobs > 0 ? 'border-red-500/40 bg-red-500/5' : 'border-gold/15'
        }`}>
          <div className={`p-3 rounded-xl ${
            totalStalledJobs > 0 ? 'bg-red-500/20 text-red-600' : 'bg-gold/10 text-antiquegold'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-charcoal/60 font-medium">Stalled / Escalated</div>
            <div className={`text-xl font-mono font-bold ${totalStalledJobs > 0 ? 'text-red-600' : 'text-charcoal'}`}>
              {totalStalledJobs}
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-gold/15 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-royalemerald/10 text-royalemerald">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-charcoal/60 font-medium">Shared Batches</div>
            <div className="text-xl font-mono font-bold text-charcoal">
              {records.filter(r => r.batchNumber).length}
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-surface border-gold/15 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by PO #, Component Name, Batch #, or Manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-gold/20 rounded-xl pl-9 pr-4 py-2 text-sm text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-antiquegold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-antiquegold shrink-0" />
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="bg-background border border-gold/20 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
              >
                <option value="All">All Production Stages</option>
                <option value="Raw Material Sourced">1. Raw Material Sourced</option>
                <option value="Custom Fabrication">2. Custom Fabrication</option>
                <option value="Quality & Testing">3. Quality & Testing</option>
                <option value="Packaging & Dispatch">4. Packaging & Dispatch</option>
                <option value="Rework Required">Rework Required</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={stalledOnlyFilter}
                onChange={(e) => setStalledOnlyFilter(e.target.checked)}
                className="rounded text-antiquegold focus:ring-antiquegold"
              />
              <span className="text-red-600 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Stalled Only ({totalStalledJobs})
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full border border-dashed border-gold/20 rounded-2xl p-8 text-center text-charcoal/50 bg-surface">
            <Factory className="w-8 h-8 text-antiquegold mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-sm">No manufacturing production runs found</p>
            <p className="text-xs text-charcoal/40 mt-1">Adjust search parameters or check filter criteria.</p>
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const currentStageIdx = STAGES.findIndex(s => s.name === rec.productionStage);

            return (
              <Card 
                key={rec.id} 
                className={`p-5 bg-surface border shadow-sm transition-all hover:border-gold/30 space-y-4 ${
                  rec.stalledFlag ? 'border-red-500/40 bg-red-500/5' : 'border-gold/15'
                }`}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start gap-2 border-b border-gold/15 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-antiquegold bg-antiquegold/10 px-2 py-0.5 rounded">
                        {rec.poId}
                      </span>
                      {rec.batchNumber && (
                        <span className="font-mono text-[10px] text-royalemerald bg-royalemerald/10 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Batch: {rec.batchNumber}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-charcoal mt-1 line-clamp-1">
                      {rec.componentName}
                    </h3>
                    <p className="text-xs text-charcoal/60 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-antiquegold shrink-0" />
                      {rec.supplierName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {rec.stalledFlag ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Stalled ({rec.stalledSinceDays || 1}d)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-royalemerald/10 text-royalemerald text-[11px] font-bold border border-royalemerald/20">
                        {rec.productionStage}
                      </span>
                    )}
                    <span className="text-[10px] text-charcoal/50 block font-mono mt-1">
                      Target: {rec.estimatedCompletionDate}
                    </span>
                  </div>
                </div>

                {/* Stall Reason Warning Box if active */}
                {rec.stalledFlag && rec.stalledReason && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Production Exception / Exception Flagged:</span>
                      <p>{rec.stalledReason}</p>
                    </div>
                  </div>
                )}

                {/* Progress Bar & Percentage */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-charcoal/70">Fabrication Completion</span>
                    <span className="font-mono font-bold text-antiquegold">{rec.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gold/15 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        rec.stalledFlag ? 'bg-red-500' : 'bg-antiquegold'
                      }`}
                      style={{ width: `${rec.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Ascension Line Stage Milestones */}
                <div className="space-y-2 border-t border-gold/15 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60 block">
                    Fabrication Ascension Line Stages:
                  </span>

                  <div className="relative pl-6 space-y-3">
                    {/* The Ascension Line Rail */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gold/20" />
                    <div 
                      className="absolute left-2.5 top-2 w-0.5 bg-antiquegold transition-all duration-500"
                      style={{ height: `${Math.min(100, Math.max(0, (currentStageIdx / (STAGES.length - 1)) * 100))}%` }}
                    />

                    {STAGES.map((stg, sIdx) => {
                      const isComplete = currentStageIdx > sIdx || (currentStageIdx === sIdx && rec.completionPercentage >= 100);
                      const isCurrent = currentStageIdx === sIdx && rec.completionPercentage < 100;

                      return (
                        <div key={stg.name} className="relative flex items-start justify-between text-xs">
                          {/* Node Icon */}
                          <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                            isComplete 
                              ? 'bg-royalemerald text-white border-royalemerald' 
                              : isCurrent 
                                ? 'bg-antiquegold text-white border-antiquegold ring-2 ring-antiquegold/20 animate-pulse'
                                : 'bg-surface text-charcoal/40 border-gold/30'
                          }`}>
                            {isComplete ? <CheckCircle2 className="w-3 h-3" /> : (sIdx + 1)}
                          </div>

                          <div>
                            <span className={`font-semibold ${isCurrent ? 'text-antiquegold font-bold' : 'text-charcoal/80'}`}>
                              {stg.label}
                            </span>
                            <span className="text-[10px] text-charcoal/50 block">{stg.desc}</span>
                          </div>

                          <div className="text-right font-mono text-[10px]">
                            {isComplete && <span className="text-royalemerald font-bold">Completed</span>}
                            {isCurrent && <span className="text-antiquegold font-bold">{rec.completionPercentage}%</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone Evidence Uploads Summary */}
                <div className="border-t border-gold/15 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-antiquegold" />
                      Milestone Quality Documents ({rec.stageEvidenceUploads?.length || 0}):
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(!rec.stageEvidenceUploads || rec.stageEvidenceUploads.length === 0) ? (
                      <span className="text-[11px] text-charcoal/40 italic">No quality certificates uploaded yet.</span>
                    ) : (
                      rec.stageEvidenceUploads.map((up) => (
                        <div key={up.id} className="p-2 bg-background rounded-xl border border-gold/15 text-[11px] flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-royalemerald shrink-0" />
                          <div className="truncate max-w-[160px]">
                            <span className="font-bold text-charcoal block truncate">{up.fileName}</span>
                            <span className="text-[9px] text-charcoal/50 font-mono">{up.stageName} • {up.uploadedBy}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-gold/15 flex items-center justify-between gap-2">
                  {onNavigateToPO && (
                    <button
                      onClick={() => onNavigateToPO(rec.poId)}
                      className="text-xs text-antiquegold hover:underline font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Full Purchase Order
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenUpdateModal(rec)}
                    className="px-4 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5 ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Update Stage & Evidence
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Update Production Stage Modal */}
      {activeRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="p-6 max-w-xl w-full bg-surface border-gold/30 shadow-xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  Update Component Production Stage
                </h3>
                <p className="text-xs text-charcoal/60 font-mono">
                  {activeRecord.poId} • {activeRecord.componentName}
                </p>
              </div>
              <button onClick={() => setActiveRecord(null)} className="text-charcoal/50 hover:text-charcoal p-1">
                <AlertCircle className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSaveProductionUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Production Milestone Stage</label>
                <select
                  value={updateStage}
                  onChange={(e) => {
                    const stg = e.target.value as any;
                    setUpdateStage(stg);
                    const defaultPct = STAGES.find(s => s.name === stg)?.defaultPct || updatePct;
                    setUpdatePct(defaultPct);
                  }}
                  className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
                >
                  <option value="Raw Material Sourced">1. Raw Material Sourced</option>
                  <option value="Custom Fabrication">2. Custom Fabrication</option>
                  <option value="Quality & Testing">3. Quality & Testing</option>
                  <option value="Packaging & Dispatch">4. Packaging & Dispatch</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Stage Completion Percentage:</span>
                  <span className="font-mono font-bold text-antiquegold">{updatePct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updatePct}
                  onChange={(e) => setUpdatePct(parseInt(e.target.value))}
                  className="w-full accent-antiquegold cursor-pointer"
                />
              </div>

              {/* Toggle Rework Regression */}
              <div className="p-3 bg-background rounded-xl border border-gold/15 space-y-2">
                <label className="flex items-center gap-2 font-bold text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRegression}
                    onChange={(e) => setIsRegression(e.target.checked)}
                    className="rounded text-antiquegold focus:ring-antiquegold"
                  />
                  <span className="text-amber-700 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Quality Defect Rework Regression
                  </span>
                </label>
                {isRegression && (
                  <p className="text-[11px] text-amber-700">
                    This update reflects a stage regression due to internal quality inspection failure requiring component rework.
                  </p>
                )}
              </div>

              {/* Toggle Stall Exception Flag */}
              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 space-y-2">
                <label className="flex items-center gap-2 font-bold text-red-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStalled}
                    onChange={(e) => setIsStalled(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Flag Production Stall Exception
                  </span>
                </label>

                {isStalled && (
                  <div>
                    <label className="block text-[11px] font-semibold text-red-800 mb-1">Stall / Bottleneck Reason:</label>
                    <input
                      type="text"
                      placeholder="e.g. Copper winding wire shortage from regional distributor..."
                      value={stallReason}
                      onChange={(e) => setStallReason(e.target.value)}
                      className="w-full bg-background border border-red-500/30 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              {/* Milestone Quality Document Attachment */}
              <div className="border-t border-gold/15 pt-3 space-y-2">
                <label className="block font-semibold text-charcoal/80">
                  Attach Quality Certificate / Inspection Evidence:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Document Name (e.g. Insulation_Test_Cert_08.pdf)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                  <input
                    type="text"
                    placeholder="Inspector Remarks / Test Reading"
                    value={newDocNote}
                    onChange={(e) => setNewDocNote(e.target.value)}
                    className="bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Stage Progress Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Stator winding complete; proceeding to high-voltage insulation test..."
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setActiveRecord(null)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Save Production Update
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
