import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Clock, ShieldAlert, DollarSign, MapPin, 
  Truck, Building2, AlertTriangle, CheckCircle2, BarChart2, Filter, 
  Sparkles, Layers, Info, Calendar, RefreshCw, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { DeliveryAnalyticsSummary, User as UserType } from '../types';

interface Props {
  user: UserType;
  onNavigateToSrm?: () => void;
}

export const DeliveryAnalyticsScreen: React.FC<Props> = ({ user, onNavigateToSrm }) => {
  const [summary, setSummary] = useState<DeliveryAnalyticsSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('90days');
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'breakdowns' | 'costs' | 'macro'>('benchmarks');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = DbManager.getDeliveryAnalyticsSummary();
    setSummary(data);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!summary) {
    return (
      <div className="min-h-screen bg-alabaster text-charcoal p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-charcoal/60 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-antiquegold" />
          <span>Loading Delivery Analytics Intelligence...</span>
        </div>
      </div>
    );
  }

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
              SOP Step #10 • Final Module Checkpoint
            </span>
            <span className="text-xs text-charcoal/60">Module 11: Logistics Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-charcoal mt-1">
            Delivery Analytics & Risk Intelligence
          </h1>
          <p className="text-sm text-charcoal/70">
            Logistics SLA trends, regional transit times for sales quoting, damage root-cause & issue cost attribution.
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center space-x-2 self-start md:self-auto bg-white p-1 rounded-xl border border-antiquegold/30 shadow-sm text-xs">
          <Calendar className="w-4 h-4 text-antiquegold ml-2" />
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              showToast(`Refreshed metrics for period: ${e.target.value}`);
            }}
            className="bg-transparent font-semibold text-charcoal p-1.5 focus:outline-none"
          >
            <option value="90days">Last 90 Days (May - Aug 2026)</option>
            <option value="ytd">Year to Date 2026</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: On-Time Rate */}
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-2 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-semibold">On-Time Delivery SLA</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
              <TrendingUp className="w-4 h-4 text-royalemerald" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-royalemerald">
              {summary.overallOnTimeRatePct}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <span>+{summary.onTimeTrendPct}%</span>
            </span>
          </div>
          <p className="text-[11px] text-charcoal/60">Combined supplier & courier SLA performance</p>
        </div>

        {/* KPI 2: Regional Transit Avg */}
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-2 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-semibold">Avg Regional Transit</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
              <Clock className="w-4 h-4 text-antiquegold" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-charcoal">
              {summary.avgTransitDaysOverall} Days
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <span>{summary.avgTransitTrendDays} days</span>
            </span>
          </div>
          <p className="text-[11px] text-charcoal/60">Average duration from dispatch to site unload</p>
        </div>

        {/* KPI 3: Discrepancy Rate */}
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-2 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-semibold">Damage / Discrepancy Rate</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-800">
              <ShieldAlert className="w-4 h-4 text-blue-700" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-charcoal">
              {summary.discrepancyRatePct}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
              <span>{summary.discrepancyTrendPct}%</span>
            </span>
          </div>
          <p className="text-[11px] text-charcoal/60">Percentage of shipments with reported flaws</p>
        </div>

        {/* KPI 4: Issue Cost Impact */}
        <div className="bg-white rounded-2xl p-4 border border-antiquegold/20 shadow-sm space-y-2 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal/60 font-semibold">Logistics Issue Cost</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-800">
              <DollarSign className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-mono font-bold text-red-700">
              ₹{summary.totalLogisticsIssueCostINR.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-charcoal/60 font-semibold">
              3 Incidents
            </span>
          </div>
          <p className="text-[11px] text-charcoal/60">Rework, replacement & rush courier expenses</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-antiquegold/30 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'benchmarks'
              ? 'border-antiquegold text-royalemerald font-bold'
              : 'border-transparent text-charcoal/60 hover:text-charcoal'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Regional Sales Benchmarks ({summary.regionalBenchmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdowns')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'breakdowns'
              ? 'border-antiquegold text-royalemerald font-bold'
              : 'border-transparent text-charcoal/60 hover:text-charcoal'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Supplier vs Partner SLA</span>
        </button>

        <button
          onClick={() => setActiveTab('costs')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'costs'
              ? 'border-antiquegold text-royalemerald font-bold'
              : 'border-transparent text-charcoal/60 hover:text-charcoal'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Cost of Issues Impact</span>
        </button>

        <button
          onClick={() => setActiveTab('macro')}
          className={`pb-2.5 flex items-center space-x-1.5 border-b-2 transition ${
            activeTab === 'macro'
              ? 'border-antiquegold text-royalemerald font-bold'
              : 'border-transparent text-charcoal/60 hover:text-charcoal'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Macro Force Majeure ({summary.macroDisruptions.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Regional Sales Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
            <Info className="w-5 h-5 text-antiquegold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-charcoal">Sales & Quoting Calibration Guidance</h4>
              <p className="mt-0.5 text-charcoal/80">
                Use these historical transit benchmarks when estimating installation start dates during the customer sales negotiation stage (Deal Closure Module). Quoting exact realistic windows prevents client friction while maintaining AIEC&apos;s zero-risk promise.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-antiquegold/20 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-charcoal">Regional Transit Time Matrix</h3>
              <span className="text-xs text-charcoal/60 font-mono">Sample Size: 128 Delivered Elevator Kits</span>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {summary.regionalBenchmarks.map((bench) => (
                <div key={bench.regionCode} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-alabaster/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-charcoal text-sm">{bench.regionName}</span>
                      {bench.isEmergingData ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                          EMERGING LANE (Low Sample Size)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          HIGH CONFIDENCE
                        </span>
                      )}
                    </div>
                    <span className="text-charcoal/60 text-[11px] block">
                      Region Code: <span className="font-mono text-charcoal">{bench.regionCode}</span> • Based on {bench.sampleSize} completed deliveries
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-charcoal/60 text-[11px] block">Avg Transit Time</span>
                      <span className="font-mono font-bold text-royalemerald text-base">{bench.avgDays} Days</span>
                    </div>

                    <div className="bg-royalemerald/10 border border-royalemerald/30 p-2.5 rounded-xl text-right">
                      <span className="text-royalemerald font-bold text-[11px] block">Recommended Quote Buffer</span>
                      <span className="font-mono font-bold text-charcoal text-xs">{bench.recommendationQuoteWindow}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Supplier vs Freight Partner Performance */}
      {activeTab === 'breakdowns' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-antiquegold/20 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal">
                  Root Cause Delay Attribution (Supplier Factory vs Transit Partner)
                </h3>
                <p className="text-xs text-charcoal/60">
                  Separating factory production delays from courier transit issues to apply fair SLA penalty withholdings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Suppliers Column */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider flex items-center space-x-1.5 border-b pb-2">
                  <Building2 className="w-4 h-4 text-antiquegold" />
                  <span>Component Suppliers Factory SLA</span>
                </h4>

                {summary.entityBreakdowns
                  .filter(e => e.type === 'supplier')
                  .map((e) => (
                    <div key={e.id} className="p-3 bg-alabaster rounded-xl border border-antiquegold/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal text-xs">{e.name}</span>
                        <span className="font-mono font-bold text-royalemerald text-xs">{e.onTimePct}% On-Time</span>
                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-royalemerald h-2 rounded-full" 
                          style={{ width: `${e.onTimePct}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-charcoal/70 font-mono">
                        <span>Avg Delay: +{e.delayDaysAvg} days</span>
                        <span>Damage: {e.damageIncidentRatePct}%</span>
                        <span>{e.totalShipments} Shipments</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Logistics Partners Column */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-charcoal uppercase tracking-wider flex items-center space-x-1.5 border-b pb-2">
                  <Truck className="w-4 h-4 text-antiquegold" />
                  <span>3rd-Party Freight Couriers SLA</span>
                </h4>

                {summary.entityBreakdowns
                  .filter(e => e.type === 'logistics_partner')
                  .map((e) => (
                    <div key={e.id} className="p-3 bg-alabaster rounded-xl border border-antiquegold/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal text-xs">{e.name}</span>
                        <span className="font-mono font-bold text-antiquegold text-xs">{e.onTimePct}% On-Time</span>
                      </div>

                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-antiquegold h-2 rounded-full" 
                          style={{ width: `${e.onTimePct}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-charcoal/70 font-mono">
                        <span>Avg Delay: +{e.delayDaysAvg} days</span>
                        <span>Damage: {e.damageIncidentRatePct}%</span>
                        <span>{e.totalShipments} Trips</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Cost of Issues Impact */}
      {activeTab === 'costs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-antiquegold/20 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-charcoal">
                  Aggregated Logistics Issue Cost Breakdown
                </h3>
                <p className="text-xs text-charcoal/60">
                  Financial impact of damaged goods, replacement parts, and rush freight. Strictly attributes costs once to prevent double-counting.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-charcoal/60 block">Total Issue Expense</span>
                <span className="font-mono font-bold text-red-700 text-lg">
                  ₹{summary.totalLogisticsIssueCostINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {summary.costImpacts.map((cost, cIdx) => (
                <div key={cIdx} className="p-4 bg-alabaster rounded-xl border border-antiquegold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-charcoal text-sm">{cost.category}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300">
                        {cost.incidentCount} Incident{cost.incidentCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/70">{cost.description}</p>
                  </div>

                  <span className="font-mono font-bold text-red-700 text-base self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border">
                    ₹{cost.costINR.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Supplier Retention Offset Coverage</span>
              </span>
              <span className="font-mono font-bold text-emerald-800">100% Retained from Supplier Milestones</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Macro Force Majeure Disruptions */}
      {activeTab === 'macro' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-antiquegold/20 shadow-sm p-4 space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-serif font-bold text-base text-charcoal">
                Macro Environmental Disruptions & Force Majeure Log
              </h3>
              <p className="text-xs text-charcoal/60">
                Annotated regional weather landslides or road closures that justify SLA delay waivers for suppliers & logistics partners.
              </p>
            </div>

            <div className="space-y-3">
              {summary.macroDisruptions.map((macro) => (
                <div key={macro.id} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-sm flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>{macro.eventName}</span>
                    </span>

                    <span className="font-mono font-bold text-xs bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                      +{macro.impactDays} Days SLA Waiver
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-amber-900/80 font-mono">
                    <span>Period: {macro.period}</span>
                    <span>•</span>
                    <span>Region: {macro.region}</span>
                  </div>

                  <p className="text-xs text-charcoal/80 pt-1 border-t border-amber-200/60">
                    {macro.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
