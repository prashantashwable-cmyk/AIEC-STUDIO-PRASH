import React, { useState, useEffect } from 'react';
import { 
  Truck, ShieldCheck, MapPin, DollarSign, Star, AlertCircle, Plus, 
  Search, Filter, CheckCircle2, Phone, Mail, Navigation, RefreshCw, 
  Layers, ArrowRight, ShieldAlert, Sparkles, Send, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { DeliveryPartner, RateCardEntry, PurchaseOrder, User as UserType } from '../types';

interface Props {
  user: UserType;
  onNavigateToPo?: (poId: string) => void;
}

export const DeliveryPartnerManagementScreen: React.FC<Props> = ({ user, onNavigateToPo }) => {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [trackingFilter, setTrackingFilter] = useState<string>('all');

  // Expanded Rate Cards state
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>('partner_vrl');

  // Direct Booking Modal state
  const [bookingPartner, setBookingPartner] = useState<DeliveryPartner | null>(null);
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [selectedLaneId, setSelectedLaneId] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Onboard New Partner Modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCode, setNewPartnerCode] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerAreas, setNewPartnerAreas] = useState('MH_Pune, MH_Mumbai');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getDeliveryPartners();
    setPartners(list);

    const pos = DbManager.getPurchaseOrders();
    setPurchaseOrders(pos);
    if (pos.length > 0) {
      setSelectedPoId(pos[0].id);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBookDelivery = () => {
    if (!bookingPartner || !selectedPoId) return;

    const targetPo = purchaseOrders.find(p => p.id === selectedPoId);

    showToast(`Delivery Leg for PO ${selectedPoId} booked with ${bookingPartner.name}. Dispatch notice sent!`);
    setBookingPartner(null);
  };

  const handleOnboardPartner = () => {
    if (!newPartnerName.trim() || !newPartnerCode.trim()) return;

    const areasArray = newPartnerAreas.split(',').map(a => a.trim()).filter(Boolean);

    const newP: DeliveryPartner = {
      id: `partner_${Date.now()}`,
      name: newPartnerName,
      code: newPartnerCode.toUpperCase(),
      contactPhone: newPartnerPhone || '+91 98000 00000',
      contactEmail: newPartnerEmail || 'dispatch@partner.in',
      serviceAreas: areasArray.length > 0 ? areasArray : ['MH_Pune'],
      liveTrackingSupportedFlag: false,
      apiIntegrationStatus: 'manual_only',
      onTimeRatePct: 100.0,
      damagedTripRatePct: 0.0,
      avgDelayDays: 0.0,
      completedTripsCount: 0,
      rating: 3.5, // Neutral rating for unproven
      isUnprovenPartner: true,
      rateCard: [
        { id: `rc_${Date.now()}`, lane: 'Pune Local Transit', vehicleType: '14ft Truck', baseRateINR: 3500, estTransitHours: 4 }
      ],
      isActive: true,
      notes: 'New unproven delivery partner onboarded with neutral 3.5 baseline rating.',
      updatedAt: new Date().toISOString()
    };

    DbManager.addDeliveryPartner(newP);
    loadData();
    setShowOnboardModal(false);
    setNewPartnerName('');
    setNewPartnerCode('');
    showToast(`New logistics partner ${newP.name} onboarded with neutral 3.5 performance baseline.`);
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegionFilter === 'all' || p.serviceAreas.includes(selectedRegionFilter);
    const matchesTracking = trackingFilter === 'all' || p.apiIntegrationStatus === trackingFilter;

    return matchesSearch && matchesRegion && matchesTracking;
  });

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-5xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-royalemerald text-white px-4 py-3 rounded-xl shadow-lg border border-antiquegold/30 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-antiquegold" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              SOP Step #9 • 3rd-Party Freight Governance
            </span>
            <span className="text-xs text-charcoal/60">Module 11</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Delivery Partner Management
          </h1>
          <p className="text-sm text-charcoal/70">
            Transport courier directory, rate cards per lane, live tracking integration statuses & PO dispatch booking.
          </p>
        </div>

        <button
          onClick={() => setShowOnboardModal(true)}
          className="px-4 py-2.5 rounded-xl bg-royalemerald hover:bg-royalemerald/90 text-white text-xs font-bold shadow-md transition flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-antiquegold" />
          <span>Onboard Freight Partner</span>
        </button>
      </div>

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Active Freight Partners</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-royalemerald">{partners.length}</span>
            <span className="text-[11px] text-charcoal/60">Across 4 Transit Corridors</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Average On-Time Transit</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-antiquegold">92.6%</span>
            <span className="text-[11px] text-emerald-700 font-bold">⭐ 4.6 Partner Avg</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Live GPS Telemetry</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-mono font-bold text-charcoal">
              {partners.filter(p => p.liveTrackingSupportedFlag).length} / {partners.length}
            </span>
            <span className="text-[11px] text-blue-800 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
              GPS Webhook Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Carrier, Code or Lane..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal focus:ring-1 focus:ring-antiquegold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-antiquegold" />
            <span className="text-xs font-semibold text-charcoal/70">Region:</span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-charcoal"
            >
              <option value="all">All Regions</option>
              <option value="MH_Pune">Pune Metro</option>
              <option value="MH_Mumbai">Mumbai MMR</option>
              <option value="GJ_Ahmedabad">Gujarat Hub</option>
              <option value="KA_Bangalore">Bangalore South</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-charcoal/70">Tracking:</span>
            <select
              value={trackingFilter}
              onChange={(e) => setTrackingFilter(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-charcoal"
            >
              <option value="all">All Modes</option>
              <option value="active_live">Live GPS API</option>
              <option value="degraded_milestone_fallback">Milestone Fallback</option>
              <option value="manual_only">Manual SMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partner List */}
      <div className="space-y-4">
        {filteredPartners.length > 0 ? (
          filteredPartners.map((partner) => {
            const isExpanded = expandedPartnerId === partner.id;

            let integrationBadge = 'bg-blue-100 text-blue-900 border-blue-300';
            let integrationLabel = 'Live GPS API';
            if (partner.apiIntegrationStatus === 'degraded_milestone_fallback') {
              integrationBadge = 'bg-amber-100 text-amber-900 border-amber-300';
              integrationLabel = 'GPS Degraded • Milestone Fallback';
            } else if (partner.apiIntegrationStatus === 'manual_only') {
              integrationBadge = 'bg-gray-100 text-gray-800 border-gray-300';
              integrationLabel = 'Manual Milestone SMS';
            }

            return (
              <div
                key={partner.id}
                className="bg-white rounded-2xl p-5 border border-antiquegold/30 shadow-sm space-y-4 transition hover:shadow-md"
              >
                {/* Primary Row Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-royalemerald/10 border border-royalemerald/20 flex items-center justify-center text-royalemerald font-bold font-serif text-lg">
                      <Truck className="w-5 h-5 text-royalemerald" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-charcoal text-base">{partner.name}</h3>
                        <span className="text-xs font-mono font-bold bg-gray-100 text-charcoal px-2 py-0.5 rounded border">
                          {partner.code}
                        </span>
                        {partner.isUnprovenPartner && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            UNPROVEN NEW PARTNER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-charcoal/60 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-antiquegold" />
                          <span>{partner.contactPhone}</span>
                        </span>
                        <span>•</span>
                        <span>{partner.contactEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${integrationBadge}`}>
                      {integrationLabel}
                    </span>

                    <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-mono font-bold text-xs text-amber-900">{partner.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-alabaster p-3 rounded-xl border border-antiquegold/20 text-xs">
                  <div>
                    <span className="text-charcoal/60 block text-[11px]">On-Time Rate</span>
                    <span className="font-mono font-bold text-royalemerald text-sm">
                      {partner.onTimeRatePct.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Damaged Trip Rate</span>
                    <span className="font-mono font-bold text-charcoal text-sm">
                      {partner.damagedTripRatePct.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Average Delay</span>
                    <span className="font-mono font-bold text-charcoal text-sm">
                      +{partner.avgDelayDays} Days
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal/60 block text-[11px]">Completed Trips</span>
                    <span className="font-mono font-bold text-charcoal text-sm">
                      {partner.completedTripsCount}
                    </span>
                  </div>
                </div>

                {/* Service Area Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-charcoal/60 font-semibold">Service Coverage:</span>
                    {partner.serviceAreas.map((area, aIdx) => (
                      <span key={aIdx} className="px-2 py-0.5 rounded-lg bg-gray-100 text-charcoal text-[11px] font-mono border">
                        {area}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedPartnerId(isExpanded ? null : partner.id)}
                    className="text-xs text-antiquegold font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>{isExpanded ? 'Hide Rate Card Lanes' : `View Rate Card (${partner.rateCard.length} Lanes)`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Rate Card Table */}
                {isExpanded && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-xs pt-3">
                    <h4 className="font-bold text-charcoal flex items-center space-x-1.5 border-b pb-1.5">
                      <DollarSign className="w-4 h-4 text-antiquegold" />
                      <span>Standard Delivery Lane Rate Card</span>
                    </h4>

                    <div className="divide-y divide-gray-200">
                      {partner.rateCard.map((rc) => (
                        <div key={rc.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-charcoal block">{rc.lane}</span>
                            <span className="text-[11px] text-charcoal/60">{rc.vehicleType} • ~{rc.estTransitHours} Hours Transit</span>
                          </div>

                          <div className="flex items-center space-x-3 self-end sm:self-auto">
                            <span className="font-mono font-bold text-royalemerald text-xs bg-white px-2.5 py-1 rounded border">
                              ₹{rc.baseRateINR.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-charcoal/60">
                    {partner.notes}
                  </span>

                  <button
                    onClick={() => setBookingPartner(partner)}
                    className="px-4 py-2 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-antiquegold" />
                    <span>Book Delivery Leg for PO</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-antiquegold/20">
            <Truck className="w-12 h-12 text-antiquegold mx-auto opacity-50" />
            <h3 className="text-lg font-serif font-bold text-charcoal">No Freight Partners Found</h3>
            <p className="text-xs text-charcoal/60">
              No logistics partners match the active region or tracking filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Direct Booking Modal */}
      {bookingPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-antiquegold" />
                  <span>Book Delivery Leg • {bookingPartner.name}</span>
                </h3>
                <span className="text-xs text-charcoal/60">Carrier Code: {bookingPartner.code}</span>
              </div>
              <button onClick={() => setBookingPartner(null)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Select Purchase Order */}
              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Select Target Purchase Order</label>
                <select
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.id} • {po.supplierName} (₹{po.totalAmountINR.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Rate Card Lane */}
              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Select Delivery Lane & Vehicle Type</label>
                <select
                  value={selectedLaneId}
                  onChange={(e) => setSelectedLaneId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                >
                  <option value="">Select Lane Rate Card...</option>
                  {bookingPartner.rateCard.map(rc => (
                    <option key={rc.id} value={rc.id}>
                      {rc.lane} • {rc.vehicleType} (₹{rc.baseRateINR.toLocaleString('en-IN')} - ~{rc.estTransitHours}hrs)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Special Dispatch / Handling Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Ensure tarpaulins cover laser SS film; Call site engineer 2 hours prior to arrival..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <span className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>SOP Integration Confirmation</span>
                </span>
                <p>
                  Booking this leg automatically generates a live tracking record and notifies the site engineer with courier dispatch details.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t">
              <button
                onClick={() => setBookingPartner(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleBookDelivery}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4 text-antiquegold" />
                <span>Confirm Booking & Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard New Partner Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-antiquegold">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-charcoal flex items-center space-x-2">
                <Plus className="w-5 h-5 text-antiquegold" />
                <span>Onboard Logistics Partner</span>
              </h3>
              <button onClick={() => setShowOnboardModal(false)} className="text-gray-400 hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Transporter / Agency Name</label>
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="e.g. Express Cargo Logistics India"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-charcoal/80 mb-1 block">Carrier Code</label>
                  <input
                    type="text"
                    value={newPartnerCode}
                    onChange={(e) => setNewPartnerCode(e.target.value)}
                    placeholder="e.g. EXP-IND"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal/80 mb-1 block">Contact Phone</label>
                  <input
                    type="text"
                    value={newPartnerPhone}
                    onChange={(e) => setNewPartnerPhone(e.target.value)}
                    placeholder="+91 98220 00000"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal/80 mb-1 block">Service Area Codes (Comma separated)</label>
                <input
                  type="text"
                  value={newPartnerAreas}
                  onChange={(e) => setNewPartnerAreas(e.target.value)}
                  placeholder="MH_Pune, MH_Mumbai, GJ_Ahmedabad"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-charcoal"
                />
              </div>

              <p className="text-[11px] text-charcoal/60 bg-gray-50 p-2.5 rounded-lg border">
                Unproven partners are assigned a neutral <strong>3.5 rating</strong> and manual SMS tracking until their first 5 completed trips build real performance data.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setShowOnboardModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={handleOnboardPartner}
                className="px-5 py-2 bg-royalemerald text-white rounded-xl text-xs font-bold shadow-md hover:bg-royalemerald/90 flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-antiquegold" />
                <span>Save Freight Partner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
