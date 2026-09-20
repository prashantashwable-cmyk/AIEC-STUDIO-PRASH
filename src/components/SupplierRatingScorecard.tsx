import React, { useState, useEffect } from 'react';
import { User, SupplierScorecardDetail, OrderRatingEntry, Supplier } from '../types';
import { DbManager } from '../lib/db';
import { Card } from './Common';
import { 
  Award, Shield, TrendingUp, TrendingDown, Clock, AlertTriangle, 
  CheckCircle2, HelpCircle, MessageSquare, Search, Filter, Edit3, 
  Save, RefreshCw, Star, Info, ArrowUpRight, ArrowDownRight, UserCheck, ChevronRight
} from 'lucide-react';

interface SupplierRatingScorecardProps {
  user: User;
  onNavigateToPO?: (poId: string) => void;
  onNavigateToContracts?: () => void;
}

export const SupplierRatingScorecard: React.FC<SupplierRatingScorecardProps> = ({
  user,
  onNavigateToPO,
  onNavigateToContracts
}) => {
  const [scorecards, setScorecards] = useState<SupplierScorecardDetail[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  
  // Dispute Modal
  const [activeDisputeOrder, setActiveDisputeOrder] = useState<OrderRatingEntry | null>(null);
  const [disputeReasonInput, setDisputeReasonInput] = useState('');
  
  // Admin Context Note Modal
  const [isAdminContextModalOpen, setIsAdminContextModalOpen] = useState(false);
  const [adminContextInput, setAdminContextInput] = useState('');

  // Admin Dispute Resolution Modal
  const [adminResolveOrder, setAdminResolveOrder] = useState<OrderRatingEntry | null>(null);
  const [adminResolveAction, setAdminResolveAction] = useState<'resolved_corrected' | 'resolved_upheld'>('resolved_corrected');
  const [adminAttribution, setAdminAttribution] = useState<'supplier_part' | 'technician_installation_error' | 'transit_damage'>('technician_installation_error');
  const [adminResolveNote, setAdminResolveNote] = useState('');

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, []);

  const loadData = () => {
    const cards = DbManager.getSupplierScorecards();
    const sups = DbManager.getSuppliers();
    setScorecards(cards);
    setSuppliers(sups);

    if (user.role === 'supplier') {
      const match = sups.find(s => s.id === user.supplierId || s.name.toLowerCase().includes(user.name.toLowerCase()));
      if (match) setSelectedSupplierId(match.id);
      else if (cards.length > 0) setSelectedSupplierId(cards[0].supplierId);
    } else {
      if (!selectedSupplierId && cards.length > 0) {
        setSelectedSupplierId(cards[0].supplierId);
      }
    }
  };

  const activeScorecard = scorecards.find(s => s.supplierId === selectedSupplierId) || scorecards[0];

  const handleOpenDisputeModal = (order: OrderRatingEntry) => {
    setActiveDisputeOrder(order);
    setDisputeReasonInput(order.disputeReason || '');
  };

  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDisputeOrder || !activeScorecard) return;

    const nowIso = new Date().toISOString();
    const updatedHistory = activeScorecard.ratingsHistory.map(o => {
      if (o.id === activeDisputeOrder.id) {
        return {
          ...o,
          disputeStatus: 'disputed' as const,
          disputeReason: disputeReasonInput.trim(),
          disputeSubmittedAt: nowIso
        };
      }
      return o;
    });

    const updatedScorecard: SupplierScorecardDetail = {
      ...activeScorecard,
      ratingsHistory: updatedHistory
    };

    DbManager.updateSupplierScorecard(updatedScorecard);
    setActiveDisputeOrder(null);
  };

  const handleOpenAdminResolveModal = (order: OrderRatingEntry) => {
    setAdminResolveOrder(order);
    setAdminResolveAction('resolved_corrected');
    setAdminAttribution(order.attributedTo);
    setAdminResolveNote('');
  };

  const handleSaveAdminResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResolveOrder || !activeScorecard) return;

    const nowIso = new Date().toISOString();
    const updatedHistory = activeScorecard.ratingsHistory.map(o => {
      if (o.id === adminResolveOrder.id) {
        let newRating = o.overallRating;
        if (adminResolveAction === 'resolved_corrected') {
          // If corrected (e.g. technician error), boost order rating back to 5.0 or original high grade
          newRating = 5.0;
        }
        return {
          ...o,
          overallRating: newRating,
          attributedTo: adminAttribution,
          disputeStatus: adminResolveAction,
          disputeAdminNote: adminResolveNote.trim() || `Resolved by Admin (${user.name})`,
          disputeResolvedAt: nowIso
        };
      }
      return o;
    });

    // Recalculate supplier overall score
    const avgOrderRating = updatedHistory.reduce((sum, h) => sum + h.overallRating, 0) / (updatedHistory.length || 1);
    const newOverallScore = Math.round((avgOrderRating / 5.0) * 100);

    const updatedScorecard: SupplierScorecardDetail = {
      ...activeScorecard,
      overallScore: newOverallScore,
      ratingsHistory: updatedHistory
    };

    DbManager.updateSupplierScorecard(updatedScorecard);
    setAdminResolveOrder(null);
  };

  const handleSaveAdminContext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScorecard) return;

    const updatedScorecard: SupplierScorecardDetail = {
      ...activeScorecard,
      adminContextNote: adminContextInput.trim()
    };

    DbManager.updateSupplierScorecard(updatedScorecard);
    setIsAdminContextModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded-2xl border border-gold/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-antiquegold bg-antiquegold/10 px-2.5 py-1 rounded-full border border-antiquegold/20">
              Module 10 • Screen 7
            </span>
            <span className="text-xs font-semibold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Transparent SLA Quality Engine
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal mt-2">
            Supplier Rating & Quality Scorecard
          </h1>
          <p className="text-sm text-charcoal/70 mt-1">
            Transparent performance metrics, objective defect attribution, and reviewable rating dispute resolution.
          </p>
        </div>

        {user.role === 'admin' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-charcoal/60 shrink-0">Select Supplier:</span>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="bg-background border border-gold/20 rounded-xl px-3 py-2 text-xs font-bold text-charcoal focus:outline-none focus:border-antiquegold w-full md:w-auto"
            >
              {scorecards.map(sc => (
                <option key={sc.supplierId} value={sc.supplierId}>
                  {sc.supplierName} ({sc.overallScore} pts)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeScorecard ? (
        <>
          {/* Supplier Hero Performance Header Card */}
          <Card className="p-6 bg-surface border-gold/20 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gold/15 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-charcoal">
                  {activeScorecard.supplierName}
                </h2>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Supplier ID: <span className="font-mono font-semibold">{activeScorecard.supplierId}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-charcoal/60 font-medium block">Composite Performance Score</span>
                  <div className="text-3xl font-mono font-bold text-royalemerald flex items-center gap-1 justify-end">
                    {activeScorecard.overallScore}
                    <span className="text-xs text-charcoal/50">/100</span>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center gap-1 font-semibold text-xs ${
                  activeScorecard.scoreTrend === 'improving' 
                    ? 'bg-royalemerald/10 text-royalemerald border-royalemerald/20' 
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                }`}>
                  {activeScorecard.scoreTrend === 'improving' ? (
                    <>
                      <TrendingUp className="w-4 h-4" /> Improving Trend
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4" /> Stable / Under Observation
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Context Note (e.g. Monsoon disruption context) */}
            {activeScorecard.adminContextNote ? (
              <div className="p-4 rounded-xl bg-antiquegold/10 border border-antiquegold/20 text-xs text-charcoal flex justify-between items-start gap-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-antiquegold block uppercase tracking-wider text-[10px]">
                      Operational Context Note (Admin Verified):
                    </span>
                    <p className="text-charcoal/80 mt-0.5">{activeScorecard.adminContextNote}</p>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setAdminContextInput(activeScorecard.adminContextNote || '');
                      setIsAdminContextModalOpen(true);
                    }}
                    className="text-antiquegold hover:underline font-semibold text-[11px] shrink-0"
                  >
                    Edit Note
                  </button>
                )}
              </div>
            ) : user.role === 'admin' ? (
              <button
                onClick={() => {
                  setAdminContextInput('');
                  setIsAdminContextModalOpen(true);
                }}
                className="text-xs text-antiquegold hover:underline font-semibold flex items-center gap-1"
              >
                + Add Operational Context Note (e.g. Regional monsoon disruption)
              </button>
            ) : null}

            {/* Transparent Score Metric Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3.5 bg-background rounded-xl border border-gold/15">
                <span className="text-[11px] text-charcoal/60 font-semibold block">Delivery SLA Timeliness</span>
                <div className="text-xl font-mono font-bold text-royalemerald mt-1">
                  {activeScorecard.deliveryScore}%
                </div>
                <span className="text-[10px] text-charcoal/50 block mt-0.5">Weight: 35%</span>
              </div>

              <div className="p-3.5 bg-background rounded-xl border border-gold/15">
                <span className="text-[11px] text-charcoal/60 font-semibold block">Material Quality & Defect Rate</span>
                <div className="text-xl font-mono font-bold text-royalemerald mt-1">
                  {activeScorecard.qualityScore}%
                </div>
                <span className="text-[10px] text-charcoal/50 block mt-0.5">Weight: 35%</span>
              </div>

              <div className="p-3.5 bg-background rounded-xl border border-gold/15">
                <span className="text-[11px] text-charcoal/60 font-semibold block">Commercial Price Lock</span>
                <div className="text-xl font-mono font-bold text-royalemerald mt-1">
                  {activeScorecard.commercialScore}%
                </div>
                <span className="text-[10px] text-charcoal/50 block mt-0.5">Weight: 15%</span>
              </div>

              <div className="p-3.5 bg-background rounded-xl border border-gold/15">
                <span className="text-[11px] text-charcoal/60 font-semibold block">Communication Speed</span>
                <div className="text-xl font-mono font-bold text-royalemerald mt-1">
                  {activeScorecard.responsivenessScore}%
                </div>
                <span className="text-[10px] text-charcoal/50 block mt-0.5">Weight: 15%</span>
              </div>
            </div>
          </Card>

          {/* Historical Order Ratings & Dispute History */}
          <Card className="p-6 bg-surface border-gold/15 space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  Historical Order Ratings & Quality Audit Trail
                </h3>
                <p className="text-xs text-charcoal/60">
                  Individual order scores compiled from site reception reports and technician delivery verification logs.
                </p>
              </div>

              {onNavigateToContracts && (
                <button
                  onClick={onNavigateToContracts}
                  className="px-3 py-1.5 rounded-xl border border-gold/20 text-xs font-semibold text-charcoal hover:bg-gold/10 transition flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5 text-antiquegold" /> View SLA Contract
                </button>
              )}
            </div>

            <div className="space-y-3">
              {activeScorecard.ratingsHistory.length === 0 ? (
                <p className="text-xs text-charcoal/50 italic py-4 text-center">No completed orders rated yet.</p>
              ) : (
                activeScorecard.ratingsHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 bg-background rounded-2xl border border-gold/15 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-antiquegold bg-antiquegold/10 px-2.5 py-0.5 rounded-full border border-antiquegold/20">
                          {item.orderId}
                        </span>
                        <span className="text-xs font-semibold text-charcoal/70">
                          Completed: {item.completedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-gold/20 text-xs font-mono font-bold text-antiquegold">
                          <Star className="w-3.5 h-3.5 fill-antiquegold text-antiquegold" />
                          {item.overallRating.toFixed(1)} / 5.0
                        </div>

                        {/* Dispute status pill */}
                        {item.disputeStatus === 'disputed' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 text-[11px] font-bold border border-amber-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Dispute Pending
                          </span>
                        )}
                        {item.disputeStatus === 'resolved_corrected' && (
                          <span className="px-2.5 py-1 rounded-full bg-royalemerald/10 text-royalemerald text-[11px] font-bold border border-royalemerald/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Dispute Upheld (Corrected)
                          </span>
                        )}
                        {item.disputeStatus === 'resolved_upheld' && (
                          <span className="px-2.5 py-1 rounded-full bg-surface text-charcoal/60 text-[11px] font-bold border border-gold/20">
                            Rating Maintained
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-surface rounded-xl border border-gold/10">
                        <span className="text-[10px] text-charcoal/50 font-semibold block">Timeliness Variance:</span>
                        <span className={`font-bold font-mono ${
                          item.deliveryTimelinessDays <= 0 ? 'text-royalemerald' : 'text-amber-700'
                        }`}>
                          {item.deliveryTimelinessDays === 0 
                            ? 'On Time (0 Days Variance)' 
                            : item.deliveryTimelinessDays < 0 
                              ? `${Math.abs(item.deliveryTimelinessDays)} Days Early` 
                              : `${item.deliveryTimelinessDays} Days Delayed`}
                        </span>
                      </div>

                      <div className="p-2.5 bg-surface rounded-xl border border-gold/10">
                        <span className="text-[10px] text-charcoal/50 font-semibold block">Quality / Defect Report:</span>
                        <span className="font-bold">
                          {item.qualityDefectLogged ? (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Defect Logged
                            </span>
                          ) : (
                            <span className="text-royalemerald flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 100% Passed QC
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="p-2.5 bg-surface rounded-xl border border-gold/10">
                        <span className="text-[10px] text-charcoal/50 font-semibold block">Attributed Liability:</span>
                        <span className="font-bold text-charcoal capitalize">
                          {item.attributedTo.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {item.defectNotes && (
                      <div className="text-xs text-charcoal/80 bg-surface p-2.5 rounded-xl border border-gold/10">
                        <span className="font-bold text-antiquegold block">Defect / Observation Log:</span>
                        {item.defectNotes}
                      </div>
                    )}

                    {/* Active Dispute Information Box */}
                    {item.disputeReason && (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-800 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Supplier Dispute Claim:
                          </span>
                          <span className="text-[10px] text-amber-700 font-mono">
                            {item.disputeSubmittedAt ? new Date(item.disputeSubmittedAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-charcoal/80">{item.disputeReason}</p>

                        {item.disputeAdminNote && (
                          <div className="mt-2 pt-2 border-t border-amber-500/20 text-royalemerald font-semibold text-[11px]">
                            <span>Admin Review Decision: </span>
                            <p className="text-charcoal/80 font-normal">{item.disputeAdminNote}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dispute Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                      {user.role === 'supplier' && item.disputeStatus === 'none' && (
                        <button
                          onClick={() => handleOpenDisputeModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-antiquegold/10 text-antiquegold hover:bg-antiquegold/20 font-semibold text-xs transition"
                        >
                          Dispute This Rating
                        </button>
                      )}

                      {user.role === 'admin' && item.disputeStatus === 'disputed' && (
                        <button
                          onClick={() => handleOpenAdminResolveModal(item)}
                          className="px-3 py-1.5 rounded-xl bg-royalemerald text-white hover:bg-royalemerald/90 font-semibold text-xs transition shadow-sm flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Review & Resolve Dispute
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center text-charcoal/50 bg-surface">
          <Award className="w-10 h-10 text-antiquegold mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm">No supplier scorecard record selected</p>
        </Card>
      )}

      {/* Supplier Dispute Rating Modal */}
      {activeDisputeOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-surface border-gold/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  Dispute Order Performance Rating
                </h3>
                <p className="text-xs text-charcoal/60 font-mono">{activeDisputeOrder.orderId}</p>
              </div>
              <button onClick={() => setActiveDisputeOrder(null)} className="text-charcoal/50 hover:text-charcoal p-1">
                <Info className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-4 text-xs">
              <div className="p-3 bg-background rounded-xl border border-gold/15 space-y-1">
                <span className="font-bold text-charcoal block">Current Logged Rating:</span>
                <p className="text-charcoal/70">{activeDisputeOrder.overallRating} / 5.0 Rating • {activeDisputeOrder.defectNotes || 'No defect note'}</p>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">
                  Reason for Dispute (e.g. Technician unloading damage, inaccurate drawing provided):
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why this order defect or delay was not attributable to factory quality..."
                  value={disputeReasonInput}
                  onChange={(e) => setDisputeReasonInput(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setActiveDisputeOrder(null)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold shadow-sm"
                >
                  Submit Dispute for Admin Review
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Admin Dispute Resolution Modal */}
      {adminResolveOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-surface border-gold/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-charcoal">
                  Admin Dispute Review & Resolution
                </h3>
                <p className="text-xs text-charcoal/60 font-mono">{adminResolveOrder.orderId} • {activeScorecard?.supplierName}</p>
              </div>
              <button onClick={() => setAdminResolveOrder(null)} className="text-charcoal/50 hover:text-charcoal p-1">
                <Info className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminResolve} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1">
                <span className="font-bold text-amber-800 block">Supplier Claim:</span>
                <p className="text-charcoal">{adminResolveOrder.disputeReason}</p>
              </div>

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Resolution Action</label>
                <select
                  value={adminResolveAction}
                  onChange={(e) => setAdminResolveAction(e.target.value as any)}
                  className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
                >
                  <option value="resolved_corrected">Uphold Dispute & Correct Supplier Rating (Remove Penalty)</option>
                  <option value="resolved_upheld">Reject Dispute (Maintain Current Rating)</option>
                </select>
              </div>

              {adminResolveAction === 'resolved_corrected' && (
                <div>
                  <label className="block font-semibold text-charcoal/80 mb-1">Re-attribute Defect Cause To:</label>
                  <select
                    value={adminAttribution}
                    onChange={(e) => setAdminAttribution(e.target.value as any)}
                    className="w-full bg-background border border-gold/20 rounded-xl px-3 py-2 text-sm font-semibold text-charcoal focus:outline-none focus:border-antiquegold"
                  >
                    <option value="technician_installation_error">Technician Installation / Site Unloading Error</option>
                    <option value="transit_damage">Freight Courier Transit Damage</option>
                    <option value="supplier_part">Supplier Part Flaw</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-charcoal/80 mb-1">Admin Investigation Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Site inspection confirmed damage occurred during manual offloading by site crew..."
                  value={adminResolveNote}
                  onChange={(e) => setAdminResolveNote(e.target.value)}
                  className="w-full bg-background border border-gold/20 rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setAdminResolveOrder(null)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-royalemerald text-white font-semibold shadow-sm"
                >
                  Save & Apply Score Correction
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Admin Context Note Modal */}
      {isAdminContextModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-lg w-full bg-surface border-gold/30 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <h3 className="text-base font-serif font-bold text-charcoal">
                Operational Context Note
              </h3>
              <button onClick={() => setIsAdminContextModalOpen(false)} className="text-charcoal/50 hover:text-charcoal p-1">
                <Info className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminContext} className="space-y-4 text-xs">
              <p className="text-charcoal/70">
                Context notes are displayed on the supplier scorecard to explain external circumstances (e.g. regional floods, port congestion) without altering the mathematical score.
              </p>

              <textarea
                rows={4}
                placeholder="e.g. Heavy monsoon rains in Chakan region delayed freight transport for 2 days in July 2026..."
                value={adminContextInput}
                onChange={(e) => setAdminContextInput(e.target.value)}
                className="w-full bg-background border border-gold/20 rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:border-antiquegold"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setIsAdminContextModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gold/20 text-charcoal/70 hover:bg-gold/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-antiquegold hover:bg-antiquegold/90 text-white font-semibold shadow-sm"
                >
                  Save Context Note
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
