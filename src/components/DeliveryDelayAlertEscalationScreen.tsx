import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, MessageSquare, Phone, Send, ShieldAlert, 
  ChevronRight, RefreshCw, CheckCircle2, Filter, Search, Users,
  Building, Truck, FileText, ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { 
  DeliveryDelayAlert, User as UserType, SupplierCommunicationThread 
} from '../types';

interface Props {
  user: UserType;
  onNavigateToThread?: (threadId: string) => void;
}

export const DeliveryDelayAlertEscalationScreen: React.FC<Props> = ({
  user,
  onNavigateToThread
}) => {
  const [alerts, setAlerts] = useState<DeliveryDelayAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [causeFilter, setCauseFilter] = useState<string>('all');
  
  // Selected alert for action modal
  const [activeAlertForNotify, setActiveAlertForNotify] = useState<DeliveryDelayAlert | null>(null);
  const [customMsg, setCustomMsg] = useState('');
  
  // Selected alert for root cause editing
  const [activeAlertForCause, setActiveAlertForCause] = useState<DeliveryDelayAlert | null>(null);
  
  // Batch broadcast modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchCause, setBatchCause] = useState('transit_logistics');
  const [batchMsg, setBatchMsg] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getDeliveryDelayAlerts();
    setAlerts(list);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendCustomerNotification = () => {
    if (!activeAlertForNotify) return;

    const newLogEntry = {
      sentAt: new Date().toISOString(),
      channel: 'whatsapp' as const,
      message: customMsg || `AIEC Delivery Update: Your shipment for ${activeAlertForNotify.customerName} has been revised to ${activeAlertForNotify.currentEta}. We remain fully committed to your scheduled installation!`
    };

    const updated: DeliveryDelayAlert = {
      ...activeAlertForNotify,
      customerNotifiedFlag: true,
      customerNotificationLog: [...(activeAlertForNotify.customerNotificationLog || []), newLogEntry],
      status: 'customer_notified',
      updatedAt: new Date().toISOString()
    };

    DbManager.updateDeliveryDelayAlert(updated);
    loadData();
    setActiveAlertForNotify(null);
    showToast(`Proactive WhatsApp update dispatched to ${activeAlertForNotify.customerName}`);
  };

  const handleUpdateRootCause = (newCause: DeliveryDelayAlert['rootCauseTag'], isExternal: boolean) => {
    if (!activeAlertForCause) return;

    const updated: DeliveryDelayAlert = {
      ...activeAlertForCause,
      rootCauseTag: newCause,
      isExternalDisruption: isExternal,
      updatedAt: new Date().toISOString()
    };

    DbManager.updateDeliveryDelayAlert(updated);
    
    // Also feed back into Supplier Performance Scorecard if not external
    if (!isExternal) {
      const scorecards = DbManager.getSupplierScorecards();
      const sc = scorecards.find(s => s.supplierId === activeAlertForCause.supplierId);
      if (sc) {
        sc.deliveryScore = Math.max(70, (sc.deliveryScore || 90) - 2);
        DbManager.updateSupplierScorecard(sc);
      }
    }

    loadData();
    setActiveAlertForCause(null);
    showToast(`Root cause updated to ${newCause.replace('_', ' ')} & fed to SRM analytics`);
  };

  const handleEscalateToSrm = (alertItem: DeliveryDelayAlert) => {
    const updated: DeliveryDelayAlert = {
      ...alertItem,
      status: 'escalated_to_srm',
      severity: 'critical',
      updatedAt: new Date().toISOString()
    };

    DbManager.updateDeliveryDelayAlert(updated);

    // Ensure supplier thread exists / add escalation message
    const threads = DbManager.getSupplierThreads();
    let thread = threads.find(t => t.supplierId === alertItem.supplierId || t.relatedPoId === alertItem.poId);

    if (thread) {
      DbManager.addMessageToThread(thread.id, {
        id: `msg_esc_${Date.now()}`,
        senderRole: 'system_log',
        senderName: 'Mr. Prashant Vasant Wable (Admin)',
        text: `CRITICAL ESCALATION (PO ${alertItem.poId}): Delivery is ${alertItem.etaGapDays} days behind schedule. Immediate status update required for ${alertItem.customerName}.`,
        timestamp: new Date().toISOString()
      });
    }

    loadData();
    showToast(`Delay escalated to Mr. Prashant Vasant Wable & Supplier Thread created`);
  };

  const handleResolveAlert = (alertItem: DeliveryDelayAlert) => {
    const updated: DeliveryDelayAlert = {
      ...alertItem,
      status: 'resolved_auto_cleared',
      updatedAt: new Date().toISOString()
    };

    DbManager.updateDeliveryDelayAlert(updated);
    loadData();
    showToast(`Alert cleared — Shipment status reconciled`);
  };

  const handleBatchBroadcast = () => {
    const affectedAlerts = alerts.filter(a => a.status !== 'resolved_auto_cleared');
    affectedAlerts.forEach(a => {
      const updated: DeliveryDelayAlert = {
        ...a,
        customerNotifiedFlag: true,
        rootCauseTag: batchCause as any,
        isExternalDisruption: true,
        customerNotificationLog: [
          ...(a.customerNotificationLog || []),
          {
            sentAt: new Date().toISOString(),
            channel: 'whatsapp',
            message: batchMsg || `AIEC Shared Alert: Heavy rainfall and transit restrictions in Pune region have caused a 3-4 day delivery adjustment across ongoing shipments. Your installation date is protected.`
          }
        ],
        status: 'customer_notified'
      };
      DbManager.updateDeliveryDelayAlert(updated);
    });

    loadData();
    setShowBatchModal(false);
    showToast(`Broadcast sent to all ${affectedAlerts.length} delayed customer accounts!`);
  };

  // Filtering
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesCause = causeFilter === 'all' || a.rootCauseTag === causeFilter;

    return matchesSearch && matchesSeverity && matchesCause;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved_auto_cleared').length;

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
              SOP Step #5 • Logistics Exception Control
            </span>
            <span className="text-xs text-charcoal/60">Module 11</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Delivery Delay Alerts & Escalation Queue
          </h1>
          <p className="text-sm text-charcoal/70">
            Proactive delay management queue prioritizing customer-impactful shipment gaps before customer complaints occur.
          </p>
        </div>

        <button
          onClick={() => {
            setBatchMsg('AIEC Shared Alert: Highway traffic/weather restrictions in Maharashtra logistics corridor have caused a minor 3-day transit delay across all active shipments.');
            setShowBatchModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-antiquegold text-white text-xs font-bold shadow-sm hover:bg-antiquegold/90 transition flex items-center space-x-2 self-start md:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Batch Proactive Broadcast</span>
        </button>
      </div>

      {/* KPI Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-red-800 flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Critical Installation Risks</span>
          </span>
          <span className="text-2xl font-mono font-bold text-red-900 block">{criticalCount} POs</span>
          <p className="text-[11px] text-charcoal/60">Delays impacting committed install dates</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-royalemerald flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4 text-royalemerald" />
            <span>Customer Proactively Notified</span>
          </span>
          <span className="text-2xl font-mono font-bold text-royalemerald block">
            {alerts.filter(a => a.customerNotifiedFlag).length} / {alerts.length}
          </span>
          <p className="text-[11px] text-charcoal/60">Transparency rating protecting brand trust</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-antiquegold flex items-center space-x-1">
            <Truck className="w-4 h-4 text-antiquegold" />
            <span>Average Transit Gap</span>
          </span>
          <span className="text-2xl font-mono font-bold text-charcoal block">
            {alerts.length > 0 ? (alerts.reduce((acc, a) => acc + a.etaGapDays, 0) / alerts.length).toFixed(1) : 0} Days
          </span>
          <p className="text-[11px] text-charcoal/60">Tracked vs promised supplier delivery</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, Customer, or Supplier..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal focus:ring-1 focus:ring-antiquegold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-antiquegold" />
            <span className="text-xs font-semibold text-charcoal/70">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-charcoal"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-charcoal/70">Root Cause:</span>
            <select
              value={causeFilter}
              onChange={(e) => setCauseFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-charcoal"
            >
              <option value="all">All Causes</option>
              <option value="supplier_production">Supplier Factory</option>
              <option value="transit_logistics">Logistics Transit</option>
              <option value="customs_doc">Customs/Docs</option>
              <option value="external_force_majeure">Force Majeure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delay Queue List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alertItem) => {
            let sevBadge = 'bg-amber-100 text-amber-900 border-amber-300';
            if (alertItem.severity === 'critical') sevBadge = 'bg-red-100 text-red-900 border-red-300 font-bold';
            if (alertItem.severity === 'medium') sevBadge = 'bg-blue-100 text-blue-900 border-blue-300';

            return (
              <div 
                key={alertItem.id}
                className="bg-white rounded-2xl p-5 border border-antiquegold/20 shadow-sm space-y-4 hover:shadow-md transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs border uppercase tracking-wider ${sevBadge}`}>
                      {alertItem.severity} Severity
                    </span>
                    <span className="font-mono font-bold text-charcoal text-sm">{alertItem.poId}</span>
                    <span className="text-xs text-charcoal/60">Supplier: {alertItem.supplierName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {alertItem.customerNotifiedFlag ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>Customer Notified</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Action Required</span>
                      </span>
                    )}

                    <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg">
                      +{alertItem.etaGapDays} Days Gap
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-charcoal/60 block mb-0.5">Customer & Site Project</span>
                    <span className="font-bold text-charcoal text-sm block">{alertItem.customerName}</span>
                    <span className="text-charcoal/70">{alertItem.customerPhone}</span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block mb-0.5">Timeline Gap Analysis</span>
                    <p className="text-charcoal">
                      Original ETA: <span className="font-semibold line-through text-gray-400">{alertItem.originalEta}</span>
                    </p>
                    <p className="font-bold text-red-700">Revised ETA: {alertItem.currentEta}</p>
                    <p className="text-[11px] text-charcoal/60 mt-0.5">
                      Committed Install: <span className="font-semibold">{alertItem.committedInstallDate}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block mb-0.5">Root Cause Attribution</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-charcoal font-semibold border border-gray-200 capitalize">
                        {alertItem.rootCauseTag.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setActiveAlertForCause(alertItem)}
                        className="text-antiquegold text-[11px] underline hover:text-antiquegold/80"
                      >
                        Edit Tag
                      </button>
                    </div>
                    {alertItem.isExternalDisruption && (
                      <span className="text-[10px] text-blue-700 block mt-1 font-medium">
                        * External Factor (Excluded from Supplier Penalty)
                      </span>
                    )}
                  </div>
                </div>

                {/* WhatsApp Notification Log */}
                {alertItem.customerNotificationLog && alertItem.customerNotificationLog.length > 0 && (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-bold text-emerald-900 flex items-center space-x-1">
                      <Send className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Proactive Notification History:</span>
                    </span>
                    {alertItem.customerNotificationLog.map((log, lIdx) => (
                      <p key={lIdx} className="text-emerald-800 text-[11px]">
                        [{new Date(log.sentAt).toLocaleDateString()}] "{log.message}"
                      </p>
                    ))}
                  </div>
                )}

                {/* Quick Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center space-x-2">
                    {/* Contact Supplier */}
                    <button
                      onClick={() => {
                        if (onNavigateToThread && alertItem.supplierThreadId) {
                          onNavigateToThread(alertItem.supplierThreadId);
                        } else {
                          showToast(`Opening direct thread for Supplier ${alertItem.supplierName}...`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl border border-antiquegold/40 text-charcoal text-xs font-semibold hover:bg-antiquegold/10 transition flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-antiquegold" />
                      <span>Contact Supplier</span>
                    </button>

                    {/* Proactively Notify Customer */}
                    <button
                      onClick={() => {
                        setActiveAlertForNotify(alertItem);
                        setCustomMsg(`Dear ${alertItem.customerName}, your elevator shipment is now projected for arrival on ${alertItem.currentEta} due to ${alertItem.rootCauseTag.replace('_', ' ')}. Your planned installation date (${alertItem.committedInstallDate}) remains protected!`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-royalemerald/10 text-royalemerald hover:bg-royalemerald/20 text-xs font-semibold transition flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Notify Customer</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Escalate to SRM */}
                    <button
                      onClick={() => handleEscalateToSrm(alertItem)}
                      className="px-3 py-1.5 rounded-xl bg-red-100 text-red-900 hover:bg-red-200 text-xs font-semibold border border-red-300 transition flex items-center space-x-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                      <span>Escalate SRM</span>
                    </button>

                    {/* Auto-Clear / Resolve */}
                    <button
                      onClick={() => handleResolveAlert(alertItem)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-semibold transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve & Clear</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-antiquegold/20">
            <CheckCircle2 className="w-12 h-12 text-royalemerald mx-auto" />
            <h3 className="text-lg font-serif font-bold text-charcoal">Zero Delivery Delay Alerts Pending</h3>
            <p className="text-sm text-charcoal/60">
              All active purchase order shipments are running on schedule according to supplier ETAs!
            </p>
          </div>
        )}
      </div>

      {/* Notify Customer Modal */}
      {activeAlertForNotify && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <Send className="w-5 h-5 text-royalemerald" />
                <span>Proactive Customer Update (WhatsApp/SMS)</span>
              </h3>
              <button onClick={() => setActiveAlertForNotify(null)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal/70">
                Dispatches an honest, transparent revised delivery timeline to <strong className="text-charcoal">{activeAlertForNotify.customerName}</strong> ({activeAlertForNotify.customerPhone}).
              </p>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Message Template Preview</label>
                <textarea
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-charcoal focus:ring-1 focus:ring-royalemerald"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveAlertForNotify(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCustomerNotification}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4 text-antiquegold" />
                <span>Dispatch WhatsApp Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Root Cause Edit Modal */}
      {activeAlertForCause && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal">Tag Delay Root Cause</h3>
              <button onClick={() => setActiveAlertForCause(null)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal/70">
                Attributing root cause feeds directly into Supplier Performance Scorecards and future contract evaluations.
              </p>

              <div className="space-y-2">
                {[
                  { tag: 'supplier_production', label: 'Supplier Factory Production Delay', ext: false },
                  { tag: 'transit_logistics', label: 'Logistics Courier / Highway Transit Issue', ext: false },
                  { tag: 'customs_doc', label: 'Customs & Documentation Clearance', ext: false },
                  { tag: 'external_force_majeure', label: 'External Force Majeure (Flood/Landslide)', ext: true },
                  { tag: 'site_unready', label: 'Site Unreadiness / Civil Delay', ext: true }
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => handleUpdateRootCause(item.tag as any, item.ext)}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-antiquegold hover:bg-antiquegold/5 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-charcoal block">{item.label}</span>
                      <span className="text-[10px] text-gray-500">
                        {item.ext ? 'External Cause (No Supplier Scorecard Penalty)' : 'Internal Cause (Penalizes Supplier On-Time Score)'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-antiquegold" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Broadcast Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-antiquegold" />
                <span>Batch Proactive Customer Broadcast</span>
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal/70">
                Send a single unified update to all active delayed accounts (e.g. for widespread highway landslides, regional weather, or logistics disruptions).
              </p>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Shared Cause Tag</label>
                <select
                  value={batchCause}
                  onChange={(e) => setBatchCause(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                >
                  <option value="external_force_majeure">Regional Weather / Flood / Landslide</option>
                  <option value="transit_logistics">State Highway Transporter Strike</option>
                  <option value="customs_doc">Port Clearance / Import Tax Delay</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Broadcast Message Content</label>
                <textarea
                  value={batchMsg}
                  onChange={(e) => setBatchMsg(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-charcoal focus:ring-1 focus:ring-antiquegold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchBroadcast}
                className="px-5 py-2 bg-antiquegold text-white rounded-xl text-xs font-bold shadow-md hover:bg-antiquegold/90 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast to All Delayed Accounts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
