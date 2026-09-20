import React, { useState } from 'react';
import { 
  HelpCircle, ShieldAlert, CheckCircle2, Clock, MessageSquare, 
  ArrowLeft, AlertTriangle, Send, Sparkles, AlertCircle, FileText, 
  ChevronRight, RefreshCw, UserCheck, Scale, Check
} from 'lucide-react';
import { UserRole, PayoutDisputeRecord, CommissionPayoutEntry } from '../types';
import { DbManager } from '../lib/db';

interface PayoutDisputeQueryScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  selectedPayoutEntryId?: string;
  onBack?: () => void;
  onNavigateToRulesEngine?: () => void;
}

export const PayoutDisputeQueryScreen: React.FC<PayoutDisputeQueryScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  selectedPayoutEntryId,
  onBack,
  onNavigateToRulesEngine
}) => {
  const [disputes, setDisputes] = useState<PayoutDisputeRecord[]>(() => 
    DbManager.getPayoutDisputes(userRole === 'admin' ? undefined : currentUserId)
  );
  const [selectedDispute, setSelectedDispute] = useState<PayoutDisputeRecord | null>(() => 
    disputes.length > 0 ? disputes[0] : null
  );
  const [showNewDisputeModal, setShowNewDisputeModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // New Dispute Form State
  const [payoutEntries] = useState<CommissionPayoutEntry[]>(() => 
    DbManager.getCommissionPayoutEntries().filter(e => !currentUserId || e.partnerId === currentUserId || currentUserId === 'p_001')
  );
  const [newFormEntryId, setNewFormEntryId] = useState(selectedPayoutEntryId || (payoutEntries[0]?.id || 'pay_001'));
  const [newFormSubject, setNewFormSubject] = useState('');
  const [newFormQueryText, setNewFormQueryText] = useState('');
  const [newFormDisputedAmount, setNewFormDisputedAmount] = useState<number>(1000);

  // Admin Resolution Form State
  const [resolutionType, setResolutionType] = useState<'adjustment_approved' | 'explanation_provided' | 'escalated' | 'dismissed'>('adjustment_approved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [correctiveAmount, setCorrectiveAmount] = useState<number>(selectedDispute?.disputedAmount || 0);
  const [isSystemicFlag, setIsSystemicFlag] = useState(false);

  // Response message box state for existing dispute
  const [chatInputMessage, setChatInputMessage] = useState('');

  const isAdmin = userRole === 'admin';

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = payoutEntries.find(p => p.id === newFormEntryId);
    const newRecord: PayoutDisputeRecord = {
      id: `pdis_${Date.now()}`,
      payoutEntryId: newFormEntryId,
      payoutReferenceNo: entry ? entry.referenceDocNo : 'PAY-REF-NEW',
      partnerId: currentUserId,
      partnerName: 'Sanjay Tukaram Deshmukh',
      partnerRole: 'technician',
      disputeSubject: newFormSubject,
      partnerQueryText: newFormQueryText,
      disputedAmount: Number(newFormDisputedAmount),
      status: 'open_pending_review',
      slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      isSlaBreached: false,
      createdAt: new Date().toISOString(),
      auditMessages: [
        {
          senderName: 'Sanjay Tukaram Deshmukh',
          senderRole: 'technician',
          timestamp: new Date().toISOString(),
          messageText: newFormQueryText
        }
      ]
    };

    DbManager.savePayoutDispute(newRecord);
    const updated = DbManager.getPayoutDisputes(isAdmin ? undefined : currentUserId);
    setDisputes(updated);
    setSelectedDispute(newRecord);
    setShowNewDisputeModal(false);
    setNewFormSubject('');
    setNewFormQueryText('');
  };

  const handleAdminResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDispute) {
      DbManager.resolvePayoutDispute(
        selectedDispute.id,
        resolutionType,
        resolutionNotes,
        correctiveAmount,
        isSystemicFlag,
        'Mr. Prashant Vasant Wable (Admin)'
      );

      const updated = DbManager.getPayoutDisputes(isAdmin ? undefined : currentUserId);
      setDisputes(updated);
      const reselected = updated.find(d => d.id === selectedDispute.id) || null;
      setSelectedDispute(reselected);
      setShowResolutionModal(false);
      setResolutionNotes('');
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDispute && chatInputMessage.trim()) {
      selectedDispute.auditMessages.push({
        senderName: isAdmin ? 'Prashant Wable (Admin)' : selectedDispute.partnerName,
        senderRole: userRole,
        timestamp: new Date().toISOString(),
        messageText: chatInputMessage
      });
      DbManager.savePayoutDispute(selectedDispute);
      setDisputes(DbManager.getPayoutDisputes(isAdmin ? undefined : currentUserId));
      setChatInputMessage('');
    }
  };

  const getStatusBadge = (status: PayoutDisputeRecord['status']) => {
    switch (status) {
      case 'open_pending_review':
        return {
          label: currentLanguage === 'hi' ? 'समीक्षा हेतु लंबित' : 'Pending Review',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
        };
      case 'under_investigation':
        return {
          label: currentLanguage === 'hi' ? 'जांच जारी' : 'Under Investigation',
          bg: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700'
        };
      case 'adjustment_approved':
        return {
          label: currentLanguage === 'hi' ? 'समायोजन स्वीकृत' : 'Adjustment Credit Approved',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
        };
      case 'explanation_provided':
        return {
          label: currentLanguage === 'hi' ? 'स्पष्टीकरण प्रदान किया गया' : 'Explanation Resolved',
          bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
        };
      case 'escalated':
        return {
          label: currentLanguage === 'hi' ? 'उच्च स्तर पर प्रेषित' : 'Escalated to Leadership',
          bg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      {/* Top Header */}
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
                <HelpCircle className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'भुगतान प्रश्न एवं विवाद समाधान' : currentLanguage === 'mr' ? 'कमिशन व वाटप तक्रार केंद्र' : 'Payout Dispute & Query Resolution'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'कमीशन या स्टेज भुगतान संबंधी प्रश्न दर्ज करें एवं 48-घंटे की एसएलए के साथ समाधान प्राप्त करें' : 'Governed SLA dispute channel with automated correcting adjustment pipeline'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewDisputeModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 transition-opacity"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Raise New Query</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* SLA Governance Banner */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-start space-x-3">
            <Scale className="w-5 h-5 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-sm text-[var(--color-text-primary)]">
                Transparent Partner Fair-Pay Governance
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                Every payout query is bound by a 48-hour resolution SLA. Approved adjustments generate formal, audited credit entries directly inside the Commission Rules Engine pipeline to maintain absolute financial integrity.
              </p>
            </div>
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Dispute List Sidebar */}
          <div className="space-y-3">
            <h2 className="font-bold text-sm text-[var(--color-text-primary)] px-1">
              Active Disputes ({disputes.length})
            </h2>

            <div className="space-y-2">
              {disputes.map((d) => {
                const badge = getStatusBadge(d.status);
                const isSelected = selectedDispute?.id === d.id;

                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDispute(d)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'bg-[var(--color-surface)] border-[var(--color-accent-primary)] shadow-sm' 
                        : 'bg-[var(--color-surface)]/60 border-[var(--color-border)] hover:border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--color-text-secondary)]">
                        {d.payoutReferenceNo}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-[var(--color-text-primary)] mt-2 line-clamp-1">
                      {d.disputeSubject}
                    </h3>
                    
                    <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      <span>{d.partnerName}</span>
                      <span className="font-mono font-bold text-[var(--color-accent-primary)]">
                        ₹{d.disputedAmount.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}

              {disputes.length === 0 && (
                <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
                  No active disputes found.
                </div>
              )}
            </div>
          </div>

          {/* Dispute Details & Resolution Panel */}
          <div className="md:col-span-2 space-y-4">
            {selectedDispute ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Dispute Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(selectedDispute.status).bg}`}>
                        {getStatusBadge(selectedDispute.status).label}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-accent-primary)]">
                        Ref: {selectedDispute.payoutReferenceNo}
                      </span>
                    </div>

                    <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mt-2">
                      {selectedDispute.disputeSubject}
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Raised by <strong>{selectedDispute.partnerName}</strong> ({selectedDispute.partnerRole}) on {selectedDispute.createdAt.slice(0, 10)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono self-start sm:self-auto">
                    <span className="text-xs text-[var(--color-text-secondary)] block">Disputed Amount</span>
                    <span className="text-xl font-bold text-[var(--color-accent-primary)]">
                      ₹{selectedDispute.disputedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Systemic Rule Alert if tagged */}
                {selectedDispute.isSystemicRuleIssue && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Systemic Commission Rule Flag Tagged</span>
                        <span>This dispute identified a broader rule calculation issue across Pune territory.</span>
                      </div>
                    </div>
                    {onNavigateToRulesEngine && (
                      <button
                        onClick={onNavigateToRulesEngine}
                        className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold whitespace-nowrap hover:bg-amber-700"
                      >
                        Review Rule Engine
                      </button>
                    )}
                  </div>
                )}

                {/* Audit History Timeline using Ascension Line motif */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Audit Trail & Case History
                  </h3>

                  <div className="relative pl-6 space-y-4">
                    {/* Vertical Ascension Line */}
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[var(--color-accent-primary)]/40" />

                    {selectedDispute.auditMessages.map((msg, idx) => (
                      <div key={idx} className="relative bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)] text-xs space-y-1">
                        <div className="absolute -left-[21px] top-4 w-2.5 h-2.5 rounded-full bg-[var(--color-accent-primary)] border-2 border-[var(--color-surface)]" />
                        
                        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                          <span className="font-bold text-[var(--color-text-primary)]">{msg.senderName} ({msg.senderRole})</span>
                          <span className="font-mono">{msg.timestamp.slice(0, 16).replace('T', ' ')}</span>
                        </div>

                        <p className="text-[var(--color-text-primary)] leading-relaxed">
                          {msg.messageText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Action Buttons or Chat Box */}
                <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                  {isAdmin && selectedDispute.status !== 'adjustment_approved' && (
                    <button
                      onClick={() => {
                        setCorrectiveAmount(selectedDispute.disputedAmount);
                        setShowResolutionModal(true);
                      }}
                      className="w-full py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                    >
                      Resolve & Issue Decision
                    </button>
                  )}

                  {/* Add Message Input */}
                  <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2">
                    <input 
                      type="text"
                      value={chatInputMessage}
                      onChange={e => setChatInputMessage(e.target.value)}
                      placeholder="Type message or additional query details..."
                      className="flex-1 p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs focus:border-[var(--color-accent-primary)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!chatInputMessage.trim()}
                      className="p-2.5 bg-[var(--color-accent-primary)] text-white rounded-xl disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-xs text-[var(--color-text-secondary)]">
                Select a dispute from the left panel to inspect the audit log.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise New Query Modal */}
      {showNewDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-accent-primary)]" />
                Submit Payout Query / Dispute
              </h3>
              <button 
                onClick={() => setShowNewDisputeModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDispute} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Select Payout Entry
                </label>
                <select
                  value={newFormEntryId}
                  onChange={e => setNewFormEntryId(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                >
                  {payoutEntries.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.referenceDocNo} • {e.triggerTypeLabel} (₹{e.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Subject / Summary of Issue
                </label>
                <input 
                  type="text"
                  required
                  value={newFormSubject}
                  onChange={e => setNewFormSubject(e.target.value)}
                  placeholder="e.g. Gold Tier Commission Bonus missing from stage payment"
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Disputed Amount (₹)
                </label>
                <input 
                  type="number"
                  required
                  value={newFormDisputedAmount}
                  onChange={e => setNewFormDisputedAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Detailed Explanation & Site Context
                </label>
                <textarea 
                  rows={3}
                  required
                  value={newFormQueryText}
                  onChange={e => setNewFormQueryText(e.target.value)}
                  placeholder="Provide job number, completion dates, or specific rule discrepancies..."
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:border-[var(--color-accent-primary)] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setShowNewDisputeModal(false)}
                  className="px-4 py-2 text-[var(--color-text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                >
                  Submit Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Resolution Modal */}
      {showResolutionModal && selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                Admin Dispute Decision
              </h3>
              <button 
                onClick={() => setShowResolutionModal(false)}
                className="text-[var(--color-text-secondary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Decision Outcome
                </label>
                <select
                  value={resolutionType}
                  onChange={e => setResolutionType(e.target.value as any)}
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none font-bold"
                >
                  <option value="adjustment_approved">Adjustment Approved (Issue Corrective Credit)</option>
                  <option value="explanation_provided">Explanation Provided (No Amount Change)</option>
                  <option value="escalated">Escalate to Senior Operations</option>
                  <option value="dismissed">Dismiss Dispute</option>
                </select>
              </div>

              {resolutionType === 'adjustment_approved' && (
                <div>
                  <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                    Corrective Adjustment Amount (₹)
                  </label>
                  <input 
                    type="number"
                    required
                    value={correctiveAmount}
                    onChange={e => setCorrectiveAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl font-mono focus:outline-none font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[var(--color-text-primary)] mb-1">
                  Resolution Notes & Audit Rationale
                </label>
                <textarea 
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Document calculation verification, rule checks, and payout batch triggers..."
                  className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input 
                  type="checkbox"
                  id="systemic"
                  checked={isSystemicFlag}
                  onChange={e => setIsSystemicFlag(e.target.checked)}
                  className="rounded text-[var(--color-accent-primary)] focus:ring-0"
                />
                <label htmlFor="systemic" className="text-xs text-[var(--color-text-primary)] font-semibold">
                  Flag as Systemic Commission Rule Issue for Engine Review
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setShowResolutionModal(false)}
                  className="px-4 py-2 text-[var(--color-text-secondary)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                >
                  Execute Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
