import React, { useState, useEffect } from 'react';
import { User, SupplierPaymentAnalyticsRecord } from '../types';
import { DbManager } from '../lib/db';
import { 
  BarChart3, TrendingUp, Clock, AlertTriangle, ShieldCheck, 
  Layers, ArrowUpRight, ArrowDownRight, RefreshCw, Filter, 
  Building2, Percent, HelpCircle, Download, ChevronRight, Scale
} from 'lucide-react';
import { Card, Button } from './Common';

interface SupplierPaymentAnalyticsScreenProps {
  user: User;
  onNavigateToDisputeResolution?: () => void;
  onNavigateToSupplierDirectory?: () => void;
}

export const SupplierPaymentAnalyticsScreen: React.FC<SupplierPaymentAnalyticsScreenProps> = ({
  user,
  onNavigateToDisputeResolution,
  onNavigateToSupplierDirectory
}) => {
  const [data, setData] = useState<SupplierPaymentAnalyticsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showSpikeContext, setShowSpikeContext] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const analytics = DbManager.getSupplierPaymentAnalytics();
      setData(analytics);
      setIsLoading(false);
    }, 400);
  };

  if (isLoading || !data) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-2">
              <div className="h-4 bg-[var(--color-border)] opacity-30 rounded w-1/2"></div>
              <div className="h-8 bg-[var(--color-border)] opacity-30 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl"></div>
      </div>
    );
  }

  const filteredSuppliers = data.spendBySupplier.filter(s => {
    if (selectedCategoryFilter === 'all') return true;
    return s.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
  });

  const totalCategorySpend = data.spendByCategory.reduce((acc, c) => acc + c.spendINR, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" /> Supplier Payment Analytics & Operational Insights
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
            Outflow & Vendor Intelligence
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {data.period} • Capital velocity, retention balances, and supplier risk scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "Supplier,Category,Spend_INR,Share_%,Avg_Days_To_Pay,Dispute_Rate_%\n"
                + data.spendBySupplier.map(e => `"${e.supplierName}","${e.category}",${e.spendINR},${e.sharePercent},${e.avgDaysToPay},${e.disputeRatePercent}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `AIEC_Supplier_Spend_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Spend */}
        <Card className="p-4 border border-[var(--color-accent-primary)]/20 bg-[var(--color-surface)] rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Total Supplier Outflow
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-[var(--color-text-primary)] mt-1">
            ₹{(data.totalSpendINR / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{data.spendTrendPercent}% vs prev period</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            Prev: ₹{(data.previousPeriodSpendINR / 100000).toFixed(2)}L
          </p>
        </Card>

        {/* Metric 2: Avg Days-to-Payment */}
        <Card className="p-4 border border-[var(--color-accent-primary)]/20 bg-[var(--color-surface)] rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-between">
            <span>Avg Days to Pay</span>
            <Clock className="w-3.5 h-3.5 text-antiquegold" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-[var(--color-text-primary)] mt-1">
            {data.avgDaysToDisbursement} Days
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-0.8d faster milestone payout</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            Target SLA: &lt; 5.0 Business Days
          </p>
        </Card>

        {/* Metric 3: Active Retention Reserves */}
        <Card className="p-4 border border-[var(--color-accent-primary)]/20 bg-[var(--color-surface)] rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Retention Capital Held
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-antiquegold mt-1">
            ₹{(data.retentionHeldTotalINR / 100000).toFixed(2)}L
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-secondary)] mt-2">
            <span>Released: ₹{(data.retentionReleasedTotalINR / 100000).toFixed(2)}L</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            10% quality warranty guarantee reserve
          </p>
        </Card>

        {/* Metric 4: Dispute Rate */}
        <Card className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-between">
            <span>Vendor Dispute Rate</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold font-mono text-red-700 dark:text-red-400 mt-1">
            4.2% Avg
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-red-700 dark:text-red-400 mt-2">
            <span>1 Vendor High Risk Flagged</span>
          </div>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            Delta Control Systems (12.8%)
          </p>
        </Card>
      </div>

      {/* Bulk Order Context Callout */}
      {showSpikeContext && (
        <Card className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Spend Spike Context: Q2 Bulk Commercial Orders
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-3xl">
                  The +13.88% spend surge in Q2 is attributed to 3 simultaneous commercial high-rise projects (Greenfield Heights 12-Stop VVVF gearless packages). This is a planned material acquisition expansion, not an operational budget overrun.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowSpikeContext(false)}
              className="text-xs text-[var(--color-text-secondary)] hover:underline"
            >
              Dismiss
            </button>
          </div>
        </Card>
      )}

      {/* Main Grid: Supplier Table & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Supplier Performance & Spend Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
                  Supplier Spend & Dispute Performance
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Disbursement timelines, dispute frequency, and risk status by vendor
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-antiquegold"
                >
                  <option value="all">All Component Categories</option>
                  <option value="Traction">Traction Machines</option>
                  <option value="Cabin">Cabins & Frames</option>
                  <option value="Controller">VVVF Controllers</option>
                  <option value="Rails">Guide Rails</option>
                  <option value="Door">Automatic Doors</option>
                </select>
              </div>
            </div>

            {/* Vendor List */}
            <div className="space-y-3">
              {filteredSuppliers.map((sup) => (
                <div 
                  key={sup.supplierId}
                  className={`p-4 rounded-xl border transition-all ${
                    sup.relationshipRiskFlag 
                      ? 'bg-red-500/5 border-red-500/30' 
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-antiquegold/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-antiquegold" />
                        <span className="font-bold text-sm text-[var(--color-text-primary)]">
                          {sup.supplierName}
                        </span>
                        {sup.relationshipRiskFlag && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Risk Alert
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {sup.category} • {sup.sharePercent}% of total supplier spend
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-base font-bold font-mono text-[var(--color-text-primary)]">
                        ₹{(sup.spendINR / 100000).toFixed(2)} Lakhs
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)]">
                        Avg Pay: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{sup.avgDaysToPay} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Dispute Rate: </span>
                      <span className={`font-semibold font-mono ${sup.disputeRatePercent > 10 ? 'text-red-600 dark:text-red-400' : 'text-[var(--color-text-primary)]'}`}>
                        {sup.disputeRatePercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-secondary)]">Dispute Resolution: </span>
                      <span className="font-semibold font-mono text-[var(--color-text-primary)]">
                        {sup.avgDisputeResolveDays} Days
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 text-right">
                      {sup.relationshipRiskFlag ? (
                        <button 
                          onClick={onNavigateToDisputeResolution}
                          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 justify-end ml-auto"
                        >
                          <Scale className="w-3 h-3" /> Review Disputes <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 justify-end">
                          <ShieldCheck className="w-3.5 h-3.5" /> Healthy Relationship
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Risk Warning Detail */}
                  {sup.relationshipRiskFlag && sup.riskReason && (
                    <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-700 dark:text-red-300">
                      <span className="font-bold">Operational Guidance: </span>
                      {sup.riskReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Retention Trends */}
          <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
            <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
              Retention Fund Dynamics (6 Month Trend)
            </h2>
            <div className="space-y-3">
              {data.retentionTrend.map((m) => (
                <div key={m.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-text-primary)]">{m.month}</span>
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      Held: ₹{(m.heldINR / 1000).toFixed(0)}k | Released: ₹{(m.releasedINR / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[var(--color-bg)] rounded-full overflow-hidden flex">
                    <div 
                      className="bg-antiquegold transition-all"
                      style={{ width: `${(m.heldINR / (m.heldINR + m.releasedINR)) * 100}%` }}
                      title="Held"
                    />
                    <div 
                      className="bg-emerald-600 transition-all"
                      style={{ width: `${(m.releasedINR / (m.heldINR + m.releasedINR)) * 100}%` }}
                      title="Released"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-antiquegold rounded-sm"></span>
                <span>Active Retention Reserve (Held)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span>
                <span>QC Warranty Disbursed (Released)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Category Breakdown & Efficiency Metrics (1 col) */}
        <div className="space-y-6">
          {/* Spend by Category */}
          <Card className="p-5 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-antiquegold" /> Category Spend Breakdown
            </h2>

            <div className="space-y-4">
              {data.spendByCategory.map((cat) => {
                const percent = Math.round((cat.spendINR / totalCategorySpend) * 100);
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[180px] min-w-0">
                        {cat.category}
                      </span>
                      <span className="font-mono font-bold text-[var(--color-text-primary)] shrink-0">
                        ₹{(cat.spendINR / 100000).toFixed(1)}L ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-antiquegold rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--color-text-secondary)]">
                      {cat.count} completed purchase orders
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Operational Self-Check Efficiency Box */}
          <Card className="p-5 border border-[var(--color-accent-primary)]/30 bg-[var(--color-surface)] rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Automation Efficiency Check
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              AIEC's automated 3-way matching and milestone release ensures supplier disbursements occur without administrative friction.
            </p>
            <div className="p-3 bg-[var(--color-bg)] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Trigger-to-Payout Speed:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">4.2 Days (Fast)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Zero-Touch Automation Rate:</span>
                <span className="font-bold text-[var(--color-text-primary)]">92.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Manual Audit Interventions:</span>
                <span className="font-bold text-[var(--color-text-primary)]">7.6%</span>
              </div>
            </div>

            {onNavigateToSupplierDirectory && (
              <Button 
                variant="outline" 
                onClick={onNavigateToSupplierDirectory}
                className="w-full text-xs flex items-center justify-center gap-1.5 mt-2"
              >
                Manage Vendor Directory <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
