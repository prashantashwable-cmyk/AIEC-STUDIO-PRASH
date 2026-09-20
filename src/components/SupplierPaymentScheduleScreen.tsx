import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Filter, AlertTriangle, ShieldCheck, 
  DollarSign, Building2, Search, ArrowRight, ChevronLeft, ChevronRight, 
  Sparkles, Layers, ListFilter, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { ScheduledPaymentEntry, User as UserType } from '../types';

interface Props {
  user: UserType;
  onNavigateToReleaseDetail: (paymentId: string) => void;
  onNavigateToApprovalQueue?: () => void;
}

export const SupplierPaymentScheduleScreen: React.FC<Props> = ({ 
  user, 
  onNavigateToReleaseDetail,
  onNavigateToApprovalQueue 
}) => {
  const [schedules, setSchedules] = useState<ScheduledPaymentEntry[]>([]);
  const [viewMode, setViewMode] = useState<'agenda' | 'week' | 'month'>('agenda');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected date for calendar day inspection
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-08-12');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = DbManager.getScheduledPayments();
    setSchedules(list);
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = 
      s.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.milestoneTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || s.paymentType === typeFilter;
    const matchesSupplier = supplierFilter === 'all' || s.supplierId === supplierFilter;

    return matchesSearch && matchesType && matchesSupplier;
  });

  // Calculate forward total outflows
  const totalForwardOutflowINR = filteredSchedules.reduce((sum, s) => sum + s.amountINR, 0);
  const thisWeekOutflowINR = filteredSchedules
    .filter(s => new Date(s.expectedDate) <= new Date('2026-08-18'))
    .reduce((sum, s) => sum + s.amountINR, 0);

  // Group schedules by week/month for calendar view
  const activeDayEvents = filteredSchedules.filter(s => s.expectedDate === selectedCalendarDate);

  return (
    <div className="min-h-screen bg-alabaster text-charcoal p-4 md:p-6 pb-28 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-antiquegold/20 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-antiquegold/10 text-antiquegold border border-antiquegold/20">
              SOP Step #4 • Module 12: Supplier Payments
            </span>
            <span className="text-xs text-charcoal/60 font-mono">Cash-Flow Forecast</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Supplier Payment Schedule Screen
          </h1>
          <p className="text-sm text-charcoal/70">
            Forward-looking cash outflow schedule across all active POs and milestone trajectories.
          </p>
        </div>

        {onNavigateToApprovalQueue && (
          <button
            onClick={onNavigateToApprovalQueue}
            className="px-4 py-2.5 bg-royalemerald hover:bg-royalemerald/90 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5 self-start md:self-auto"
          >
            <DollarSign className="w-4 h-4 text-antiquegold" />
            <span>Open Payment Approval Queue</span>
          </button>
        )}
      </div>

      {/* Cash Flow Forecast Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Total Forward Commitment</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-royalemerald">
              ₹{totalForwardOutflowINR.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
              All Active POs
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">7-Day Outflow Target</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-amber-800">
              ₹{thisWeekOutflowINR.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
              Due This Week
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-1">
          <span className="text-xs text-charcoal/60 font-semibold block">Risk Concentration Alert</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-charcoal flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Aug 12 - Aug 14</span>
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
              Heavy Outflow
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar & View Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO # or Supplier..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-charcoal focus:ring-1 focus:ring-antiquegold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Supplier Dropdown Filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl text-xs px-3 py-2 text-charcoal"
          >
            <option value="all">All Suppliers</option>
            <option value="sun_elevators">Sun Elevators Mfg Co</option>
            <option value="delta_controls">Delta Control Systems</option>
            <option value="apex_cabins">Apex Cabin Works</option>
            <option value="bharat_motors">Bharat Traction Motors</option>
          </select>

          {/* Payment Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-xl text-xs px-3 py-2 text-charcoal"
          >
            <option value="all">All Milestone Types</option>
            <option value="advance">50% Advance</option>
            <option value="milestone">40% Delivery Milestone</option>
            <option value="retention">10% Retention Release</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'agenda' ? 'bg-white text-royalemerald shadow-sm font-bold' : 'text-charcoal/60'
              }`}
            >
              Agenda List
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'week' ? 'bg-white text-royalemerald shadow-sm font-bold' : 'text-charcoal/60'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'month' ? 'bg-white text-royalemerald shadow-sm font-bold' : 'text-charcoal/60'
              }`}
            >
              Month Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Main Schedule Content View */}
      {viewMode === 'agenda' ? (
        /* Agenda List View */
        <div className="space-y-4">
          <span className="text-xs font-bold text-charcoal/70 block uppercase tracking-wider">
            Chronological Payment Outflow Agenda ({filteredSchedules.length} Scheduled Entries)
          </span>

          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border transition shadow-sm space-y-3 ${
                  item.riskConcentrationFlag
                    ? 'border-amber-300 bg-amber-50/10'
                    : item.status === 'pushed_delay'
                    ? 'border-blue-300 bg-blue-50/10'
                    : 'border-antiquegold/20 hover:shadow-md'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-royalemerald/10 border border-royalemerald/20 flex items-center justify-center text-royalemerald font-bold">
                      <CalendarIcon className="w-5 h-5 text-royalemerald" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-charcoal text-sm">{item.expectedDate}</span>
                        <span className="text-xs text-charcoal/60">•</span>
                        <h3 className="font-bold text-charcoal text-sm">{item.supplierName}</h3>
                      </div>
                      <p className="text-xs text-charcoal/60 font-mono mt-0.5">
                        PO #: {item.poNumber} {item.linkedJobTitle ? `• Job: ${item.linkedJobTitle}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-charcoal/60 block">Scheduled Commitment</span>
                    <span className="font-mono font-bold text-royalemerald text-lg">
                      ₹{item.amountINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.paymentType === 'advance'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : item.paymentType === 'milestone'
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}>
                      {item.paymentType === 'advance' ? '50% Advance Deposit' : item.paymentType === 'milestone' ? '40% Delivery Milestone' : '10% Retention Release'}
                    </span>

                    <span className="font-semibold text-charcoal">{item.milestoneTitle}</span>
                  </div>

                  {item.riskConcentrationFlag && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      <span>Heavy Outflow Week Concentration</span>
                    </span>
                  )}

                  {item.status === 'pushed_delay' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-700" />
                      <span>Trajectory Delayed</span>
                    </span>
                  )}
                </div>

                {item.delayReason && (
                  <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 text-xs italic">
                    <strong>Transit Delay Impact:</strong> {item.delayReason}
                  </div>
                )}

                <div className="flex items-center justify-end pt-2 border-t border-gray-100 text-xs">
                  <button
                    onClick={() => onNavigateToReleaseDetail(item.paymentId)}
                    className="text-antiquegold hover:underline font-bold flex items-center space-x-1"
                  >
                    <span>View Milestone Release Chain & SOP ➔</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-antiquegold/20">
              <CalendarIcon className="w-12 h-12 text-royalemerald mx-auto opacity-40" />
              <h3 className="font-serif font-bold text-lg text-charcoal">No Scheduled Payments</h3>
              <p className="text-xs text-charcoal/60">No scheduled outflows match your active search filters.</p>
            </div>
          )}
        </div>
      ) : (
        /* Month / Week Interactive Grid View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Grid Box */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-antiquegold/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-royalemerald" />
                <span>August 2026 Outflow Calendar</span>
              </h3>
              <span className="text-xs font-mono text-charcoal/60">5 Scheduled Milestones</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-bold text-charcoal/60 py-1 text-[11px]">{day}</div>
              ))}

              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
                const dayEvents = schedules.filter(s => s.expectedDate === dateStr);
                const hasHeavy = dayEvents.some(s => s.riskConcentrationFlag);
                const isSelected = selectedCalendarDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`p-2 rounded-xl min-h-[54px] border text-left flex flex-col justify-between transition ${
                      isSelected
                        ? 'border-royalemerald bg-emerald-50 ring-2 ring-royalemerald/30 font-bold'
                        : dayEvents.length > 0
                        ? 'border-antiquegold/40 bg-white hover:bg-alabaster'
                        : 'border-gray-100 text-gray-400 bg-gray-50/30'
                    }`}
                  >
                    <span className="font-mono text-xs">{dayNum}</span>

                    {dayEvents.length > 0 && (
                      <div className="space-y-0.5">
                        <span className={`block text-[9px] font-bold font-mono px-1 py-0.5 rounded ${
                          hasHeavy ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          ₹{(dayEvents.reduce((a, b) => a + b.amountINR, 0) / 1000).toFixed(0)}k
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-antiquegold/30 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <span className="text-xs text-charcoal/60 block font-mono">Date Inspector</span>
              <h3 className="font-serif font-bold text-lg text-charcoal">
                Scheduled for {selectedCalendarDate}
              </h3>
            </div>

            {activeDayEvents.length > 0 ? (
              <div className="space-y-3">
                {activeDayEvents.map(ev => (
                  <div key={ev.id} className="p-3 bg-alabaster rounded-xl border border-antiquegold/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal">{ev.supplierName}</span>
                      <span className="font-mono font-bold text-royalemerald">
                        ₹{ev.amountINR.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-charcoal/70">{ev.milestoneTitle}</p>
                    <span className="font-mono text-[10px] text-charcoal/60 block">PO: {ev.poNumber}</span>

                    <button
                      onClick={() => onNavigateToReleaseDetail(ev.paymentId)}
                      className="text-antiquegold font-bold hover:underline text-[11px] block pt-1"
                    >
                      Drill into Release Chain ➔
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-charcoal/60 italic py-6 text-center">
                No supplier payment outflows scheduled for {selectedCalendarDate}.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
