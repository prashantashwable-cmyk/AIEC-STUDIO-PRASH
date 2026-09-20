import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, Plus, Trash2, Camera, ShieldAlert, CheckCircle2, MessageSquare, 
  DollarSign, Clock, FileText, ArrowRight, UserCheck, AlertTriangle, Send, 
  Sparkles, Layers
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { DamagedMissingPartsReport, DamagedItemDetail, PurchaseOrder, User as UserType } from '../types';

interface Props {
  user: UserType;
  selectedPoId?: string;
  onNavigateToThread?: (threadId: string) => void;
}

export const DamagedMissingPartsReportScreen: React.FC<Props> = ({
  user,
  selectedPoId,
  onNavigateToThread
}) => {
  const [reports, setReports] = useState<DamagedMissingPartsReport[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [activePoId, setActivePoId] = useState<string>(selectedPoId || 'PO-2026-0870');

  // Form creation state
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [itemsList, setItemsList] = useState<DamagedItemDetail[]>([
    {
      id: 'item_1',
      itemName: 'High-Tensile Guide Rail T89/B (1 Pair)',
      partNumber: 'SE-GR-T89',
      expectedQty: 10,
      actualQty: 9,
      discrepancyType: 'missing',
      conditionDescription: 'Outer bundle straps unbroken, but carton contained 9 pairs instead of 10 pairs.',
      photos: ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=300']
    }
  ]);

  const [urgencyFlag, setUrgencyFlag] = useState(true);
  const [techNotes, setTechNotes] = useState('');
  const [faultAttribution, setFaultAttribution] = useState<'supplier_factory_fault' | 'transit_courier_damage' | 'site_handling_ambiguous' | 'under_investigation'>('supplier_factory_fault');
  const [scheduleImpactDays, setScheduleImpactDays] = useState(2);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const reps = DbManager.getDamagedPartsReports();
    setReports(reps);

    const pos = DbManager.getPurchaseOrders();
    setPurchaseOrders(pos);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddItemRow = () => {
    const newItem: DamagedItemDetail = {
      id: `item_${Date.now()}`,
      itemName: '',
      partNumber: '',
      expectedQty: 1,
      actualQty: 0,
      discrepancyType: 'damaged',
      conditionDescription: '',
      photos: []
    };
    setItemsList([...itemsList, newItem]);
  };

  const handleRemoveItemRow = (id: string) => {
    setItemsList(itemsList.filter(i => i.id !== id));
  };

  const handleUpdateItemRow = (id: string, field: keyof DamagedItemDetail, value: any) => {
    setItemsList(itemsList.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleCreateReport = () => {
    const targetPo = purchaseOrders.find(p => p.id === activePoId) || purchaseOrders[0];

    const newReport: DamagedMissingPartsReport = {
      id: `rep_${Date.now()}`,
      poId: targetPo ? targetPo.id : activePoId,
      supplierId: targetPo ? targetPo.supplierId : 'sun_elevators',
      supplierName: targetPo ? targetPo.supplierName : 'Sun Elevators Manufacturing Pvt Ltd',
      customerName: 'Pratibha Enclave Phase 2 (Viman Nagar)',
      customerPhone: '+91 98220 12345',
      destinationDealId: 'deal_viman_870',
      siteAddress: 'A-Wing, Viman Nagar Central, Pune - 411014',
      affectedItems: itemsList,
      urgencyFlag,
      techNotes: techNotes || 'Technician unboxing discrepancy logged.',
      faultAttribution,
      resolutionStatus: 'replacement_requested',
      scheduleImpactDays,
      adminReviewStatus: 'routed_to_supplier_thread',
      linkedSupplierThreadId: `thread_${targetPo ? targetPo.supplierId : 'sun'}_${targetPo ? targetPo.id : '870'}`,
      reportedByTechName: user.name || 'Rajesh Patel',
      reportedByTechPhone: user.phone || '+91 98765 43212',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DbManager.addDamagedPartsReport(newReport);
    loadData();
    setShowNewReportModal(false);
    showToast(`Discrepancy Report ${newReport.id} filed and routed to Supplier Chat Thread!`);
  };

  // Admin Actions
  const handleHoldPaymentMilestone = (rep: DamagedMissingPartsReport) => {
    const updated: DamagedMissingPartsReport = {
      ...rep,
      adminReviewStatus: 'payment_held',
      updatedAt: new Date().toISOString()
    };
    DbManager.updateDamagedPartsReport(updated);
    loadData();
    showToast(`Supplier payment milestone for PO ${rep.poId} placed on FINANCIAL HOLD.`);
  };

  const handleApproveClaim = (rep: DamagedMissingPartsReport) => {
    const updated: DamagedMissingPartsReport = {
      ...rep,
      adminReviewStatus: 'claim_approved',
      resolutionStatus: 'replacement_shipped',
      updatedAt: new Date().toISOString()
    };
    DbManager.updateDamagedPartsReport(updated);
    loadData();
    showToast(`Discrepancy claim approved for PO ${rep.poId}. Expedited replacement replacement dispatched.`);
  };

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
              SOP Step #8 • Discrepancy & Claims Control
            </span>
            <span className="text-xs text-charcoal/60">Module 11</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Damaged / Missing Parts Report
          </h1>
          <p className="text-sm text-charcoal/70">
            Field technician unboxing discrepancy logging with instant supplier thread routing & payment holds.
          </p>
        </div>

        <button
          onClick={() => setShowNewReportModal(true)}
          className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md transition flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-antiquegold" />
          <span>File Discrepancy Report</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((rep) => {
            let statusBadge = 'bg-amber-100 text-amber-900 border-amber-300';
            if (rep.resolutionStatus === 'replacement_shipped') statusBadge = 'bg-blue-100 text-blue-900 border-blue-300';
            if (rep.resolutionStatus === 'resolved') statusBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300';

            return (
              <div 
                key={rep.id} 
                className="bg-white rounded-2xl p-5 border border-antiquegold/30 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-antiquegold/10 text-antiquegold border border-antiquegold/30">
                        {rep.poId}
                      </span>
                      <span className="text-xs font-bold text-charcoal">{rep.customerName}</span>
                    </div>
                    <span className="text-[11px] text-charcoal/60 block mt-0.5">
                      Supplier: <strong className="text-charcoal">{rep.supplierName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {rep.urgencyFlag && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-900 border border-red-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>RUSH REPLACEMENT</span>
                      </span>
                    )}

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${statusBadge}`}>
                      {rep.resolutionStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Affected Items Table / List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-charcoal/70 uppercase tracking-wider">
                    Affected Components ({rep.affectedItems.length})
                  </h4>

                  {rep.affectedItems.map((item, iIdx) => (
                    <div key={iIdx} className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal">{item.itemName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                          {item.discrepancyType}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px] text-charcoal/70">
                        <span>Expected: <strong>{item.expectedQty}</strong></span>
                        <span>Received: <strong className="text-red-700">{item.actualQty}</strong></span>
                        {item.partNumber && <span>Part #: {item.partNumber}</span>}
                      </div>

                      <p className="text-[11px] text-charcoal/80 bg-white p-2 rounded border border-gray-100">
                        {item.conditionDescription}
                      </p>

                      {item.photos && item.photos.length > 0 && (
                        <div className="flex items-center space-x-2 pt-1">
                          {item.photos.map((p, photoIdx) => (
                            <img
                              key={photoIdx}
                              src={p}
                              alt="Evidence"
                              className="w-14 h-14 object-cover rounded-lg border border-gray-300"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Attribution & Impact Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-alabaster p-3 rounded-xl border border-antiquegold/20 text-xs">
                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Fault Attribution</span>
                    <span className="font-bold text-charcoal capitalize block">
                      {rep.faultAttribution.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Est. Project Delay Impact</span>
                    <span className="font-mono font-bold text-amber-700 block">
                      +{rep.scheduleImpactDays} Calendar Days
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Reported By Technician</span>
                    <span className="font-semibold text-charcoal block">{rep.reportedByTechName}</span>
                  </div>
                </div>

                {/* Admin Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-charcoal/70">Admin Status:</span>
                    <span className="text-xs font-mono font-bold bg-gray-100 text-charcoal px-2 py-0.5 rounded border">
                      {rep.adminReviewStatus}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleHoldPaymentMilestone(rep)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                      <span>Hold Payment Milestone</span>
                    </button>

                    <button
                      onClick={() => handleApproveClaim(rep)}
                      className="px-3 py-1.5 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-antiquegold" />
                      <span>Approve Replacement Claim</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-antiquegold/20">
            <AlertOctagon className="w-12 h-12 text-antiquegold mx-auto opacity-50" />
            <h3 className="text-lg font-serif font-bold text-charcoal">No Discrepancies Filed</h3>
            <p className="text-xs text-charcoal/60">
              All physical deliveries match purchase orders with zero damaged or missing components.
            </p>
          </div>
        )}
      </div>

      {/* New Discrepancy Report Modal */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <span>File Damaged or Missing Parts Report</span>
              </h3>
              <button onClick={() => setShowNewReportModal(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Purchase Order */}
              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Select Purchase Order</label>
                <select
                  value={activePoId}
                  onChange={(e) => setActivePoId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.id} • {po.supplierName} (Total ₹{po.totalAmountINR.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-charcoal">Discrepancy Items ({itemsList.length})</label>
                  <button
                    onClick={handleAddItemRow}
                    className="text-xs text-antiquegold font-bold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {itemsList.map((item, idx) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal text-xs">Item #{idx + 1}</span>
                      {itemsList.length > 1 && (
                        <button onClick={() => handleRemoveItemRow(item.id)} className="text-red-600 text-xs">
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleUpdateItemRow(item.id, 'itemName', e.target.value)}
                        placeholder="Item Description (e.g. Guide Rail T89)"
                        className="bg-white border rounded-lg p-2 text-xs"
                      />
                      <input
                        type="text"
                        value={item.partNumber || ''}
                        onChange={(e) => handleUpdateItemRow(item.id, 'partNumber', e.target.value)}
                        placeholder="Part Number (optional)"
                        className="bg-white border rounded-lg p-2 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Expected Qty</span>
                        <input
                          type="number"
                          value={item.expectedQty}
                          onChange={(e) => handleUpdateItemRow(item.id, 'expectedQty', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border rounded-lg p-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Received Qty</span>
                        <input
                          type="number"
                          value={item.actualQty}
                          onChange={(e) => handleUpdateItemRow(item.id, 'actualQty', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border rounded-lg p-1.5 text-xs font-mono text-red-600 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Issue Type</span>
                        <select
                          value={item.discrepancyType}
                          onChange={(e) => handleUpdateItemRow(item.id, 'discrepancyType', e.target.value)}
                          className="w-full bg-white border rounded-lg p-1.5 text-xs"
                        >
                          <option value="missing">Missing</option>
                          <option value="damaged">Damaged</option>
                          <option value="wrong_spec">Wrong Spec</option>
                          <option value="incomplete_assembly">Incomplete</option>
                        </select>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={item.conditionDescription}
                      onChange={(e) => handleUpdateItemRow(item.id, 'conditionDescription', e.target.value)}
                      placeholder="Condition notes / damage description..."
                      className="w-full bg-white border rounded-lg p-2 text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Attribution and Rush toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-charcoal/80 mb-1 block">Fault Attribution</label>
                  <select
                    value={faultAttribution}
                    onChange={(e) => setFaultAttribution(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                  >
                    <option value="supplier_factory_fault">Supplier Factory Packing Fault</option>
                    <option value="transit_courier_damage">Transit Courier Rough Handling</option>
                    <option value="site_handling_ambiguous">Site Handling Ambiguous</option>
                    <option value="under_investigation">Under Investigation</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    checked={urgencyFlag}
                    onChange={(e) => setUrgencyFlag(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span className="font-bold text-red-700">Flag as Rush / Expedited Replacement</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                onClick={() => setShowNewReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReport}
                className="px-5 py-2 bg-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-800 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4 text-antiquegold" />
                <span>Submit & Route to Supplier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
