import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Download, ArrowLeft, Sparkles, 
  CheckCircle2, AlertTriangle, ShieldCheck, Clock, Layers, 
  Send, FileSpreadsheet, DollarSign, GitMerge, Sliders, Eye, RefreshCw
} from 'lucide-react';
import { UserRole, AutomatedActionAuditEntry } from '../types';
import { DbManager } from '../lib/db';

interface AuditLogAutomatedActionsScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const AuditLogAutomatedActionsScreen: React.FC<AuditLogAutomatedActionsScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId,
  onBack,
  onNavigateTab
}) => {
  const [logs, setLogs] = useState<AutomatedActionAuditEntry[]>(() => 
    DbManager.getAutomatedActionAuditEntries()
  );

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState<AutomatedActionAuditEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AIEC_Automated_Actions_Audit_Log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Compliance audit log exported successfully as JSON!');
  };

  const filteredLogs = logs.filter(log => {
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSearch = 
      log.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.affectedRecordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.automationSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionTaken.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: AutomatedActionAuditEntry['category']) => {
    switch (category) {
      case 'po_drafted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> PO DRAFTED</span>;
      case 'message_sent':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center gap-1"><Send className="w-3 h-3" /> MSG DISPATCHED</span>;
      case 'payout_initiated':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1"><DollarSign className="w-3 h-3" /> PAYOUT AUTO-INIT</span>;
      case 'manual_override':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"><Sliders className="w-3 h-3" /> MANUAL OVERRIDE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20 flex items-center gap-1"><GitMerge className="w-3 h-3" /> {category.replace('_', ' ').toUpperCase()}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
                {currentLanguage === 'hi' ? 'स्वचालित कार्यों का ऑडिट लॉग' : currentLanguage === 'mr' ? 'स्वयंचलित कृतींचे ऑडिट लॉग' : 'Audit Log of Automated Actions'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Immutable, append-only record of every consequential action executed by AIEC automation rules
              </p>
            </div>
          </div>

          <button
            onClick={handleExportAuditLogs}
            className="px-3.5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 hover:opacity-90 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Audit Ledger</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Informational Callout */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm flex items-start space-x-3 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)] block font-serif text-sm mb-0.5">
              Airtight Compliance & Zero-Risk Accountability
            </strong>
            Every system-initiated message, PO generation, and payout release is permanently logged here. This append-only record provides 100% reconstructable evidence for customer disputes or partner audit reviews.
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by rule name, record ID, or action description..."
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-1">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" /> Category:
            </span>
            {['all', 'po_drafted', 'message_sent', 'payout_initiated', 'manual_override', 'stage_transitioned'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
                }`}
              >
                {cat === 'all' ? 'All Log Entries' : cat.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary */}
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-mono px-1">
          <span>Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> immutable audit entries</span>
          <span>Append-Only Ledger Active</span>
        </div>

        {/* Audit Log Rows List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-3">
              <FileText className="w-10 h-10 text-[var(--color-text-secondary)] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[var(--color-text-primary)]">No matching automated audit entries found</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Try clearing your search term or adjusting category filters.</p>
            </div>
          ) : (
            filteredLogs.map(entry => (
              <div 
                key={entry.auditEntryId}
                className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xs space-y-3 transition-all hover:border-[var(--color-accent-primary)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2.5">
                  <div className="flex items-center space-x-2">
                    {getCategoryBadge(entry.category)}
                    <strong className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                      {entry.ruleName}
                    </strong>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono text-[var(--color-text-secondary)]">
                    <span>Audit ID: <strong className="text-[var(--color-accent-primary)]">{entry.auditEntryId}</strong></span>
                    <span>{entry.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[var(--color-text-secondary)]">
                    <span>Source: <strong className="text-[var(--color-text-primary)] font-mono">{entry.automationSource}</strong></span>
                    <span>Record ID: <strong className="text-[var(--color-accent-primary)] font-mono">{entry.affectedRecordId}</strong></span>
                  </div>

                  <p className="text-[var(--color-text-primary)] font-medium leading-relaxed bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                    {entry.actionTaken}
                  </p>

                  {entry.wasManualOverride && entry.overrideReason && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-mono">
                      <strong>Manual Override Justification:</strong> {entry.overrideReason}
                    </div>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-[var(--color-text-secondary)] font-mono">
                    Triggering Condition: {entry.triggeringCondition}
                  </span>

                  <button
                    onClick={() => setSelectedLogDetail(entry)}
                    className="text-[var(--color-accent-primary)] font-bold flex items-center gap-1 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Payload JSON</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Payload JSON Detail Modal */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Audit Entry Payload: {selectedLogDetail.auditEntryId}
            </h3>

            <div className="space-y-2 text-xs">
              <p className="text-[var(--color-text-secondary)]">
                Rule: <strong className="text-[var(--color-text-primary)]">{selectedLogDetail.ruleName}</strong>
              </p>
              <pre className="bg-black text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-[var(--color-border)]">
                {selectedLogDetail.payloadDetails}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Close Payload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
