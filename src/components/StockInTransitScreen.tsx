import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, AlertTriangle, Calendar, DollarSign, Filter, Search, 
  ArrowRight, Building, CheckCircle2, RefreshCw, AlertCircle, Sparkles, 
  Layers, MapPin, Compass, ShieldAlert, CornerUpRight
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { StockInTransitItem, User as UserType } from '../types';

interface Props {
  user: UserType;
  onNavigateToPo?: (poId: string) => void;
  onNavigateToDeal?: (dealId: string) => void;
}

export const StockInTransitScreen: React.FC<Props> = ({
  user,
  onNavigateToPo,
  onNavigateToDeal
}) => {
  const [items, setItems] = useState<StockInTransitItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state for rerouting orphaned shipment
  const [activeOrphanForReroute, setActiveOrphanForReroute] = useState<StockInTransitItem | null>(null);
  const [targetDealInput, setTargetDealInput] = useState('');

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = DbManager.getStockInTransitItems();
    setItems(data);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRerouteOrphan = () => {
    if (!activeOrphanForReroute || !targetDealInput.trim()) return;

    const updated: StockInTransitItem = {
      ...activeOrphanForReroute,
      orphanedFlag: false,
      destinationCustomerName: `Rerouted Account (${targetDealInput})`,
      destinationSiteAddress: 'Rerouted Site Storage Yard / Active Site',
      updatedAt: new Date().toISOString()
    };

    DbManager.updateStockInTransitItem(updated);
    loadData();
    setActiveOrphanForReroute(null);
    setTargetDealInput('');
    showToast(`Shipment ${updated.poId} successfully rerouted to Deal ${targetDealInput}`);
  };

  // Calculations
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.componentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.destinationCustomerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.carrierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.componentCategory === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || item.supplierId === supplierFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSupplier && matchesStatus;
  });

  const totalInTransitValue = items.reduce((acc, i) => acc + i.inTransitValue, 0);
  const orphanedCount = items.filter(i => i.orphanedFlag).length;
  const delayedCount = items.filter(i => i.status === 'delayed').length;
  const macroWarnings = items.filter(i => i.macroDelayWarning);

  // Capacity planning calculation
  const arrivingMotors = items.filter(i => i.componentCategory === 'traction_machine' && i.status !== 'delivered').length;
  const arrivingCabins = items.filter(i => i.componentCategory === 'cabin_panels' && i.status !== 'delivered').length;
  const arrivingControlPanels = items.filter(i => i.componentCategory === 'control_panels' && i.status !== 'delivered').length;

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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              SOP Step #6 • Asset-Light Transit Control
            </span>
            <span className="text-xs text-charcoal/60">Module 11</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Inventory / Stock-in-Transit Dashboard
          </h1>
          <p className="text-sm text-charcoal/70">
            Real-time aggregate valuation & capacity planning across all customer-bound component shipments.
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-2xl border border-antiquegold/30 shadow-sm flex items-center space-x-3 self-start md:self-auto">
          <DollarSign className="w-5 h-5 text-antiquegold" />
          <div>
            <span className="text-[10px] text-charcoal/60 block font-semibold uppercase">Total In-Transit Capital</span>
            <span className="font-mono font-bold text-royalemerald text-base">
              ₹{totalInTransitValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Macro Pattern Bottleneck Warning Banner if exists */}
      {macroWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Macro Supply Market Pattern Alert Detected</span>
          </div>
          {macroWarnings.map((mw, idx) => (
            <p key={idx} className="text-xs text-amber-800">
              {mw.macroDelayWarning}
            </p>
          ))}
        </div>
      )}

      {/* Orphaned Shipment High-Priority Action Banner */}
      {orphanedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Orphaned Shipment Alert ({orphanedCount} Item Needing Reroute)</span>
            </div>
            <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono font-bold">
              Cancelled Destination Deal
            </span>
          </div>
          <p className="text-xs text-red-800">
            A purchase order shipment is currently in transit toward a cancelled or on-hold project deal. Reroute to another active site to avoid unnecessary return freight costs.
          </p>
        </div>
      )}

      {/* KPI & Capacity Planning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Shipments */}
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-antiquegold" />
              <span>Active Shipments</span>
            </span>
            <span className="text-xs font-mono font-bold text-royalemerald bg-emerald-50 px-2 py-0.5 rounded">
              {items.length} In-Motion
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-mono font-bold text-charcoal">{items.length}</span>
            <span className="text-xs text-charcoal/60">{delayedCount} Delayed</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-royalemerald h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (items.length / 10) * 100)}%` }} 
            />
          </div>
        </div>

        {/* Capacity Planning Readiness */}
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-2 md:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-charcoal flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-royalemerald" />
              <span>Upcoming Installation Slot Capacity (Next 2 Weeks)</span>
            </span>
            <span className="text-[10px] text-charcoal/60 font-medium">Based on Arriving Stock</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
              <span className="text-lg font-mono font-bold text-royalemerald block">{arrivingMotors}</span>
              <span className="text-[10px] text-charcoal/70 block">Motor Kits</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
              <span className="text-lg font-mono font-bold text-antiquegold block">{arrivingCabins}</span>
              <span className="text-[10px] text-charcoal/70 block">Cabins</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
              <span className="text-lg font-mono font-bold text-charcoal block">{arrivingControlPanels}</span>
              <span className="text-[10px] text-charcoal/70 block">Control Panels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, Carrier, Customer..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal focus:ring-1 focus:ring-antiquegold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-antiquegold" />
            <span className="text-xs font-semibold text-charcoal/70">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-charcoal"
            >
              <option value="all">All Categories</option>
              <option value="traction_machine">Traction Motors</option>
              <option value="control_panels">Control Panels</option>
              <option value="cabin_panels">Cabins & Frames</option>
              <option value="door_headers">Door Headers</option>
              <option value="guide_rails">Guide Rails</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-charcoal/70">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-charcoal"
            >
              <option value="all">All Statuses</option>
              <option value="in_transit">In Transit</option>
              <option value="delayed">Delayed</option>
              <option value="approaching_site">Approaching Site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock In Transit Item List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            let statusBadge = 'bg-blue-100 text-blue-900 border-blue-300';
            if (item.status === 'delayed') statusBadge = 'bg-red-100 text-red-900 border-red-300 font-bold';
            if (item.status === 'approaching_site') statusBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm space-y-3 transition hover:shadow-md ${
                  item.orphanedFlag ? 'border-red-300 bg-red-50/20' : 'border-antiquegold/20'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-antiquegold/10 text-antiquegold border border-antiquegold/30">
                      {item.poId}
                    </span>
                    <span className="text-xs font-bold text-charcoal">{item.componentName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.orphanedFlag && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-bold border border-red-300">
                        ORPHANED
                      </span>
                    )}

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] border capitalize ${statusBadge}`}>
                      {item.status.replace('_', ' ')}
                    </span>

                    <span className="font-mono font-bold text-royalemerald text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">
                      ₹{item.inTransitValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-charcoal/60 block mb-0.5">Destination Site & Account</span>
                    <span className="font-bold text-charcoal block">{item.destinationCustomerName}</span>
                    <span className="text-charcoal/70 text-[11px]">{item.destinationSiteAddress}</span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block mb-0.5">Carrier Logistics</span>
                    <span className="font-semibold text-charcoal block">{item.carrierName}</span>
                    <span className="font-mono text-[11px] text-charcoal/70">AWB: {item.trackingNumber}</span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block mb-0.5">Expected Arrival Window</span>
                    <span className="font-bold text-antiquegold flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.expectedArrivalWindow}</span>
                    </span>
                    <span className="text-charcoal/60 text-[11px] block mt-0.5">
                      Supplier: {item.supplierName}
                    </span>
                  </div>
                </div>

                {/* Orphaned Action Bar */}
                {item.orphanedFlag ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-xs text-red-800 font-medium">
                      {item.orphanedReason}
                    </span>
                    <button
                      onClick={() => {
                        setActiveOrphanForReroute(item);
                        setTargetDealInput('');
                      }}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 self-end sm:self-auto"
                    >
                      <CornerUpRight className="w-3.5 h-3.5 text-white" />
                      <span>Reroute Shipment</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    {onNavigateToPo && (
                      <button
                        onClick={() => onNavigateToPo(item.poId)}
                        className="px-3 py-1 rounded-lg border border-antiquegold/30 text-charcoal text-[11px] font-semibold hover:bg-antiquegold/10 transition flex items-center space-x-1"
                      >
                        <span>View Purchase Order</span>
                        <ArrowRight className="w-3 h-3 text-antiquegold" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-antiquegold/20">
            <Package className="w-12 h-12 text-antiquegold mx-auto opacity-50" />
            <h3 className="text-lg font-serif font-bold text-charcoal">No Stock in Transit Found</h3>
            <p className="text-xs text-charcoal/60">
              No shipments currently match the selected search query or category filter.
            </p>
          </div>
        )}
      </div>

      {/* Reroute Orphaned Shipment Modal */}
      {activeOrphanForReroute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <CornerUpRight className="w-5 h-5 text-antiquegold" />
                <span>Reroute Orphaned Shipment</span>
              </h3>
              <button onClick={() => setActiveOrphanForReroute(null)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal/70">
                Reassign PO <strong className="text-charcoal">{activeOrphanForReroute.poId}</strong> ({activeOrphanForReroute.componentName}) to an active customer deal to prevent site delivery bounce.
              </p>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Target Deal ID / Customer Project Name</label>
                <input
                  type="text"
                  value={targetDealInput}
                  onChange={(e) => setTargetDealInput(e.target.value)}
                  placeholder="e.g. deal_kothrud_101 or Kothrud Residency Phase 2"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal focus:ring-1 focus:ring-antiquegold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveOrphanForReroute(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleRerouteOrphan}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-antiquegold" />
                <span>Confirm Reroute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
