import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, ArrowLeft, ShieldCheck, Clock, AlertTriangle, Edit3, 
  Layers, Lock, Sliders, History, FileText, Check, Save, ShieldAlert,
  ArrowRight, Building2, UserCheck, AlertCircle
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SupplierPaymentRecord, PaymentMilestoneItem, PaymentOverrideRecord, User as UserType } from '../types';

interface Props {
  user: UserType;
  paymentId: string;
  onBack: () => void;
  onNavigateToDiscrepancyReport?: (reportId: string) => void;
}

export const MilestonePaymentReleaseScreen: React.FC<Props> = ({ 
  user, 
  paymentId, 
  onBack,
  onNavigateToDiscrepancyReport
}) => {
  const [payment, setPayment] = useState<SupplierPaymentRecord | null>(null);

  // Edit split modal state
  const [editingMilestone, setEditingMilestone] = useState<PaymentMilestoneItem | null>(null);
  const [newPercentage, setNewPercentage] = useState<number>(0);
  const [overrideReasonText, setOverrideReasonText] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [paymentId]);

  const loadData = () => {
    const list = DbManager.getSupplierPayments();
    const found = list.find(p => p.id === paymentId) || list[0];
    setPayment(found ? JSON.parse(JSON.stringify(found)) : null);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!payment) {
    return (
      <div className="p-8 text-center text-charcoal">
        <p>Loading payment milestone record...</p>
      </div>
    );
  }

  // Handle Split Percentage Adjustment
  const handleSaveSplitAdjustment = () => {
    if (!editingMilestone || !overrideReasonText.trim() || !payment) return;

    const oldPct = editingMilestone.percentage;
    const oldAmt = editingMilestone.amountINR;
    const newAmt = Math.round((payment.totalPoAmountINR * newPercentage) / 100);

    const overrideRecord: PaymentOverrideRecord = {
      id: `ov_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: user.name,
      actionType: 'split_percentage_adjustment',
      previousValue: `${oldPct}% (₹${oldAmt.toLocaleString('en-IN')})`,
      newValue: `${newPercentage}% (₹${newAmt.toLocaleString('en-IN')})`,
      reason: overrideReasonText
    };

    // Update milestone in chain
    const updatedMilestones = payment.milestoneChain.map(m => {
      if (m.id === editingMilestone.id) {
        return {
          ...m,
          percentage: newPercentage,
          amountINR: newAmt,
          isOverride: true,
          overrideReason: overrideReasonText,
          overrideBy: user.name
        };
      }
      return m;
    });

    const updatedPayment: SupplierPaymentRecord = {
      ...payment,
      milestoneChain: updatedMilestones,
      dueAmountINR: updatedMilestones[payment.currentMilestoneIndex]?.amountINR || payment.dueAmountINR,
      overrideLog: [overrideRecord, ...payment.overrideLog],
      updatedAt: new Date().toISOString()
    };

    DbManager.updateSupplierPayment(updatedPayment);
    setPayment(updatedPayment);
    setEditingMilestone(null);
    setOverrideReasonText('');
    showToast(`Milestone split adjusted to ${newPercentage}%. Override logged.`);
  };

  // Hold retention portion specifically
  const handleHoldRetentionOnly = (retentionMs: PaymentMilestoneItem) => {
    if (!payment) return;

    const overrideRecord: PaymentOverrideRecord = {
      id: `ov_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: user.name,
      actionType: 'milestone_hold',
      previousValue: retentionMs.status,
      newValue: 'held',
      reason: 'Hold placed specifically on final retention holdback pending site inspection dispute resolution.'
    };

    const updatedChain = payment.milestoneChain.map(m => {
      if (m.id === retentionMs.id) {
        return { ...m, status: 'held' as const, isOverride: true, overrideReason: overrideRecord.reason, overrideBy: user.name };
      }
      return m;
    });

    const updatedPayment: SupplierPaymentRecord = {
      ...payment,
      milestoneChain: updatedChain,
      overrideLog: [overrideRecord, ...payment.overrideLog],
      updatedAt: new Date().toISOString()
    };

    DbManager.updateSupplierPayment(updatedPayment);
    setPayment(updatedPayment);
    showToast(`Retention portion (₹${retentionMs.amountINR.toLocaleString('en-IN')}) placed on hold.`);
  };

  // Calculate totals
  const totalPercentage = payment.milestoneChain.reduce((sum, m) => sum + m.percentage, 0);

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Back Button & Header */}
      <div className="space-y-3 border-b border-antiquegold/20 pb-4">
        <button
          onClick={onBack}
          className="text-xs font-bold text-antiquegold hover:underline flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payment Approval Queue</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
                SOP Step #2 • Milestone-Linked Release Chain
              </span>
              <span className="font-mono text-xs text-charcoal/60">{payment.poNumber}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
              Milestone Release Detail: {payment.supplierName}
            </h1>
          </div>

          <div className="text-right bg-white p-3 rounded-xl border border-antiquegold/20 shadow-sm shrink-0">
            <span className="text-xs text-charcoal/60 block">Total PO Value</span>
            <span className="font-mono font-bold text-royalemerald text-xl">
              ₹{payment.totalPoAmountINR.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Discrepancy Banner if open */}
      {payment.hasOpenDiscrepancyFlag && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-300 text-red-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">Open Discrepancy / Damaged Part Notice</span>
              <p className="text-red-800">{payment.linkedDiscrepancySummary}</p>
              <span className="text-[11px] text-red-700 font-semibold block mt-1">
                SOP Rule: You may hold the final retention portion while allowing earlier delivery milestones to release normally.
              </span>
            </div>
          </div>

          {payment.linkedDiscrepancyReportId && onNavigateToDiscrepancyReport && (
            <button
              onClick={() => onNavigateToDiscrepancyReport(payment.linkedDiscrepancyReportId!)}
              className="px-3.5 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold transition text-xs shrink-0"
            >
              Inspect Quality Discrepancy ➔
            </button>
          )}
        </div>
      )}

      {/* Milestone Chain Visual Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-antiquegold/20 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
            <Layers className="w-5 h-5 text-royalemerald" />
            <span>Milestone Chain & Split Breakdown</span>
          </h2>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
            totalPercentage === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            Split Balance: {totalPercentage}%
          </span>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="space-y-4 relative">
          {payment.milestoneChain.map((ms, index) => {
            const isCurrent = index === payment.currentMilestoneIndex;
            const isReleased = ms.status === 'released' || ms.status === 'approved';
            const isTriggered = ms.status === 'triggered';
            const isHeld = ms.status === 'held';

            return (
              <div
                key={ms.id}
                className={`p-4 rounded-xl border transition space-y-3 ${
                  isCurrent 
                    ? 'border-royalemerald bg-emerald-50/20 ring-1 ring-royalemerald/30 shadow-sm'
                    : isHeld
                    ? 'border-red-300 bg-red-50/10'
                    : isReleased
                    ? 'border-gray-200 bg-gray-50/50 opacity-90'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isReleased
                        ? 'bg-royalemerald text-white'
                        : isTriggered
                        ? 'bg-amber-500 text-white animate-pulse'
                        : isHeld
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-charcoal text-sm">{ms.milestoneTitle}</h3>
                        {ms.isOverride && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                            Admin Override
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] bg-royalemerald text-white px-2 py-0.5 rounded-full font-bold">
                            Current Active Step
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal/60 mt-0.5">
                        Split Percentage: <span className="font-bold font-mono text-charcoal">{ms.percentage}%</span> • Amount: <span className="font-mono font-bold text-royalemerald">₹{ms.amountINR.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Edit Action */}
                  <div className="flex items-center space-x-2">
                    {isReleased && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-royalemerald" />
                        <span>Released</span>
                      </span>
                    )}

                    {isTriggered && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Milestone Fired (Due Now)</span>
                      </span>
                    )}

                    {isHeld && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>Hold Active</span>
                      </span>
                    )}

                    {ms.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Pending Future Event
                      </span>
                    )}

                    {/* Edit Split Button for upcoming / active milestones */}
                    {ms.status !== 'released' && (
                      <button
                        onClick={() => {
                          setEditingMilestone(ms);
                          setNewPercentage(ms.percentage);
                        }}
                        className="p-1.5 hover:bg-antiquegold/10 text-antiquegold rounded-lg transition"
                        title="Adjust Split Percentage Exception"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Evidence & Trigger Details */}
                <div className="bg-alabaster rounded-lg p-3 text-xs border border-antiquegold/10 space-y-1">
                  <div className="flex items-center justify-between text-charcoal/70">
                    <span>
                      Trigger Mechanism: <strong>{ms.triggeredByEvent || 'Awaiting system event firing'}</strong>
                    </span>
                    {ms.triggeredAt && (
                      <span className="font-mono text-[11px]">
                        Timestamp: {new Date(ms.triggeredAt).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {ms.triggerEvidenceRef && (
                    <p className="text-royalemerald font-semibold italic text-[11px]">
                      Evidence Ref: {ms.triggerEvidenceRef}
                    </p>
                  )}

                  {ms.overrideReason && (
                    <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] mt-1">
                      <strong>Admin Override Note:</strong> {ms.overrideReason} (by {ms.overrideBy})
                    </div>
                  )}
                </div>

                {/* Specific Retention Hold Button if applicable */}
                {ms.milestoneKey === 'retention_elapsed' && ms.status !== 'held' && ms.status !== 'released' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleHoldRetentionOnly(ms)}
                      className="text-xs font-bold text-red-700 hover:text-red-900 border border-red-300 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                    >
                      Hold Retention Portion Specifically (10%)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Override Log Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-antiquegold/20 shadow-sm space-y-4">
        <h2 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2 border-b pb-3">
          <History className="w-5 h-5 text-antiquegold" />
          <span>Admin Exception & Override Log</span>
        </h2>

        {payment.overrideLog && payment.overrideLog.length > 0 ? (
          <div className="divide-y divide-gray-100 space-y-3">
            {payment.overrideLog.map((log) => (
              <div key={log.id} className="pt-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-charcoal flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-royalemerald" />
                    <span>{log.adminName}</span>
                    <span className="text-charcoal/60">• Action: {log.actionType}</span>
                  </span>
                  <span className="font-mono text-charcoal/60 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-charcoal/80">
                  Changed from <span className="font-mono font-semibold">{log.previousValue}</span> to <span className="font-mono font-semibold text-royalemerald">{log.newValue}</span>
                </p>
                <p className="text-charcoal/60 italic">Reason: "{log.reason}"</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-charcoal/60 italic py-2">
            No manual overrides or percentage adjustments have been performed on this payment. All milestones reflect original SOP terms.
          </p>
        )}
      </div>

      {/* Edit Milestone Split Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-antiquegold" />
                <span>Adjust Milestone Split %</span>
              </h3>
              <button onClick={() => setEditingMilestone(null)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal/80">
                Adjusting percentage for <strong>{editingMilestone.milestoneTitle}</strong> (Total PO: ₹{payment.totalPoAmountINR.toLocaleString('en-IN')}).
              </p>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">New Split Percentage (%)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(Number(e.target.value))}
                    className="w-28 bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm font-mono font-bold text-royalemerald"
                  />
                  <span className="text-xs text-charcoal/70">
                    = ₹{Math.round((payment.totalPoAmountINR * newPercentage) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Mandatory Exception Reason</label>
                <textarea
                  value={overrideReasonText}
                  onChange={(e) => setOverrideReasonText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Approved custom advance override due to urgent factory raw material sourcing..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                onClick={() => setEditingMilestone(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSplitAdjustment}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1"
              >
                <Save className="w-4 h-4 text-antiquegold" />
                <span>Save Adjustment & Log Override</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
