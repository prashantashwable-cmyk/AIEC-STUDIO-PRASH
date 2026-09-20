import React, { useState } from 'react';
import { 
  FileText, Download, Search, Filter, ArrowUpRight, CheckCircle2, 
  Clock, AlertCircle, HelpCircle, ArrowLeft, Calendar, Building2, 
  ChevronRight, ShieldAlert, DollarSign, Sparkles, RefreshCw
} from 'lucide-react';
import { UserRole, CommissionPayoutEntry, PayoutStatementSummary } from '../types';
import { DbManager } from '../lib/db';

interface PayoutHistoryStatementsScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onNavigateToDisputeModal?: (entryId: string) => void;
  onNavigateToTdsStatement?: () => void;
  onNavigateToDisputeQuery?: () => void;
  onBack?: () => void;
}

export const PayoutHistoryStatementsScreen: React.FC<PayoutHistoryStatementsScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onNavigateToDisputeModal,
  onNavigateToTdsStatement,
  onNavigateToDisputeQuery,
  onBack
}) => {
  const [entries, setEntries] = useState<CommissionPayoutEntry[]>(() => 
    DbManager.getCommissionPayoutEntries().filter(e => !currentUserId || e.partnerId === currentUserId || currentUserId === 'p_001')
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q2_2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statementSummary, setStatementSummary] = useState<PayoutStatementSummary>(() => 
    DbManager.getPayoutStatement(currentUserId, 'Q2 2026 (Apr - Aug 2026)')
  );
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  // Filter entries
  const filteredEntries = entries.filter(item => {
    const matchesSearch = 
      item.referenceDocNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.triggerTypeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CommissionPayoutEntry['status']) => {
    switch (status) {
      case 'paid':
        return {
          label: currentLanguage === 'hi' ? 'भुगतान पूर्ण' : currentLanguage === 'mr' ? 'वितरीत केले' : 'Paid & Disbursed',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
        };
      case 'approved_pending_payout':
        return {
          label: currentLanguage === 'hi' ? 'स्वीकृत - भुगतान लंबित' : 'Approved - In Batch',
          bg: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700'
        };
      case 'pending_approval':
        return {
          label: currentLanguage === 'hi' ? 'समीक्षाधीन' : 'Pending Review',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
        };
      case 'held_dispute':
        return {
          label: currentLanguage === 'hi' ? 'विवाद हेतु रोका गया' : 'Held / Dispute',
          bg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700'
        };
      case 'rejected':
        return {
          label: currentLanguage === 'hi' ? 'अस्वीकृत' : 'Rejected',
          bg: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-700'
        };
    }
  };

  const handleDownloadStatement = (format: 'pdf' | 'csv') => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      alert(`AIEC Tax-Compliant Earnings Statement (${format.toUpperCase()}) for ${statementSummary.periodLabel} generated and downloaded.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'भुगतान इतिहास एवं विवरण' : currentLanguage === 'mr' ? 'वितरण इतिहास आणि स्टेटमेन्ट' : 'Payout History & Tax Statements'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'सत्यापित स्टेज कमीशन, बैंक लेनदेन आईडी एवं टीडीएस विवरण' : 'Permanent audit log of stage earnings, disbursements & TDS summaries'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateToTdsStatement && (
              <button
                onClick={onNavigateToTdsStatement}
                className="flex items-center space-x-1.5 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl hover:bg-[var(--color-surface)]"
              >
                <Building2 className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span className="hidden sm:inline">TDS Form 16A</span>
              </button>
            )}

            {onNavigateToDisputeQuery && (
              <button
                onClick={onNavigateToDisputeQuery}
                className="flex items-center space-x-1.5 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl hover:bg-[var(--color-surface)]"
              >
                <HelpCircle className="w-4 h-4 text-[var(--color-accent-primary)]" />
                <span className="hidden sm:inline">Dispute Center</span>
              </button>
            )}

            <button
              onClick={() => setShowStatementModal(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Statement</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Lifetime Gross Earned
            </div>
            <div className="font-mono text-2xl font-bold text-[var(--color-accent-primary)] mt-1">
              ₹{statementSummary.totalEarned.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Across {statementSummary.entriesCount} verified milestones
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Net Disbursed to Bank/UPI
            </div>
            <div className="font-mono text-2xl font-bold text-[var(--color-accent-secondary)] mt-1">
              ₹{statementSummary.netDisbursed.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              After 5% TDS (₹{statementSummary.tdsDeducted.toLocaleString()})
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Pending in Approval Pipeline
            </div>
            <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              ₹{statementSummary.pendingPayout.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Scheduled for upcoming batch
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Current Statement Period
            </div>
            <div className="font-bold text-sm text-[var(--color-text-primary)] mt-1">
              {statementSummary.periodLabel}
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              GST / Sec 194H Compliant
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Deal ID, Lead No, or Trigger Title..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs focus:border-[var(--color-accent-primary)] focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid & Disbursed</option>
              <option value="approved_pending_payout">Approved in Batch</option>
              <option value="pending_approval">Pending Review</option>
              <option value="held_dispute">Held / Dispute</option>
            </select>
          </div>
        </div>

        {/* Payout Entry Rows */}
        <div className="space-y-3">
          {filteredEntries.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div 
                key={item.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm hover:border-[var(--color-accent-primary)]/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-accent-primary)]">
                        {item.referenceDocNo}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[var(--color-text-primary)] mt-1">
                      {item.triggerTypeLabel}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {item.notes || 'Stage completion payout verified.'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono self-start sm:self-auto">
                    <span className="text-lg font-bold text-[var(--color-accent-primary)] block">
                      +₹{item.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                      Earned: {item.earnedAt.slice(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Audit metadata row */}
                <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-3 text-[11px] text-[var(--color-text-secondary)]">
                    {item.payoutBatchId && (
                      <span className="font-mono">
                        Batch: <strong className="text-[var(--color-text-primary)]">{item.payoutBatchId}</strong>
                      </span>
                    )}
                    {item.paidAt && (
                      <span>
                        Paid: <strong className="text-[var(--color-text-primary)]">{item.paidAt.slice(0, 10)}</strong>
                      </span>
                    )}
                    <span>Rule: {item.appliedRuleId} ({item.appliedRuleVersion})</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigateToDisputeModal) {
                        onNavigateToDisputeModal(item.id);
                      } else {
                        alert(`Raising query or dispute on Entry ${item.referenceDocNo}. Direct escalation ticket created.`);
                      }
                    }}
                    className="text-[11px] font-medium text-[var(--color-accent-primary)] hover:underline flex items-center space-x-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Dispute / Query Entry</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredEntries.length === 0 && (
            <div className="bg-[var(--color-surface)] rounded-2xl p-12 text-center border border-[var(--color-border)] space-y-3">
              <FileText className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto" />
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">No Payout Entries Found</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                No history records match your search or filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statement Download Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                  Download Statement
                </h3>
              </div>
              <button 
                onClick={() => setShowStatementModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Partner Name:</span>
                <span className="font-bold">{statementSummary.partnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Period:</span>
                <span className="font-bold font-mono">{statementSummary.periodLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Gross Stage Earnings:</span>
                <span className="font-bold font-mono">₹{statementSummary.totalEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Sec 194H TDS (5%):</span>
                <span className="font-bold font-mono text-red-600">-₹{statementSummary.tdsDeducted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-bold text-sm">
                <span>Net Bank Disbursed:</span>
                <span className="font-mono text-[var(--color-accent-secondary)]">₹{statementSummary.netDisbursed.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleDownloadStatement('pdf')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[var(--color-accent-primary)] text-white font-bold text-xs shadow-sm hover:opacity-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download Official PDF Statement'}</span>
              </button>

              <button
                onClick={() => handleDownloadStatement('csv')}
                disabled={downloadingFormat !== null}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] font-bold text-xs hover:border-[var(--color-accent-primary)]"
              >
                <FileText className="w-4 h-4" />
                <span>{downloadingFormat === 'csv' ? 'Exporting CSV...' : 'Export Raw CSV Ledger'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
