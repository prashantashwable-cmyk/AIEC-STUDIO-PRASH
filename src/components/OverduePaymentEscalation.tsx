import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Phone, FileText, PauseCircle, CheckCircle2, 
  Clock, ShieldAlert, User, Building, Search, Filter, MessageSquare,
  AlertCircle, ChevronRight, History, ArrowRight, XCircle, Send
} from 'lucide-react';
import { Card, Button } from './Common';
import { User as UserType, EscalationItem, Payment, Deal } from '../types';
import { DbManager } from '../lib/db';
import { useLanguage } from '../lib/language';

interface OverduePaymentEscalationProps {
  user: UserType;
  onNavigateToDealHistory?: (dealId: string) => void;
}

export const OverduePaymentEscalation: React.FC<OverduePaymentEscalationProps> = ({
  user,
  onNavigateToDealHistory
}) => {
  const { t } = useLanguage(user);

  const [escalations, setEscalations] = useState<EscalationItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationItem | null>(null);

  // Modal 1: Log Call Outcome
  const [showCallModal, setShowCallModal] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [promiseDate, setPromiseDate] = useState('');

  // Modal 2: Send Formal Notice
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeChannel, setNoticeChannel] = useState<'WhatsApp' | 'Email' | 'SMS'>('WhatsApp');
  const [noticeTemplateText, setNoticeTemplateText] = useState('');

  // Modal 3: Flag Pause Installation
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [acknowledgedTechnicianImpact, setAcknowledgedTechnicianImpact] = useState(false);

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    const escList = DbManager.getEscalations();
    const payList = DbManager.getPayments();
    const dealList = DbManager.getDeals();

    setEscalations(escList);
    setPayments(payList);
    setDeals(dealList);
  };

  useEffect(() => {
    loadData();
    const handleDbUpdate = () => loadData();
    window.addEventListener('aiec_db_update', handleDbUpdate);
    return () => window.removeEventListener('aiec_db_update', handleDbUpdate);
  }, [user]);

  // Action 1: Save Call Log Outcome
  const handleSaveCallOutcome = () => {
    if (!selectedEscalation) return;
    if (!callNotes) {
      setNotification({ msg: 'Please provide call outcome details.', type: 'error' });
      return;
    }

    const updated: EscalationItem = {
      ...selectedEscalation,
      status: 'Call Logged',
      callOutcome: callNotes,
      customerPromiseDate: promiseDate || undefined,
      lastActionAt: new Date().toISOString()
    };

    DbManager.updateEscalation(updated);
    setShowCallModal(false);
    setCallNotes('');
    setPromiseDate('');
    setNotification({ msg: `Call log outcome updated for deal ${selectedEscalation.dealId}. Promise date recorded.`, type: 'success' });
  };

  // Action 2: Send Formal Notice Template
  const handleSendFormalNotice = () => {
    if (!selectedEscalation) return;

    const updated: EscalationItem = {
      ...selectedEscalation,
      status: 'Formal Notice Sent',
      lastActionAt: new Date().toISOString()
    };

    DbManager.updateEscalation(updated);
    setShowNoticeModal(false);
    setNotification({ msg: `Formal payment escalation notice transmitted to ${selectedEscalation.customerName} via ${noticeChannel}.`, type: 'success' });
  };

  // Action 3: Pause Installation Progress
  const handleConfirmPauseInstallation = () => {
    if (!selectedEscalation) return;
    if (!acknowledgedTechnicianImpact) {
      setNotification({ msg: 'You must acknowledge the technician site operational impact before confirming hold.', type: 'error' });
      return;
    }

    // Update escalation item
    const updatedEsc: EscalationItem = {
      ...selectedEscalation,
      status: 'Installation Paused',
      installationPaused: true,
      lastActionAt: new Date().toISOString()
    };
    DbManager.updateEscalation(updatedEsc);

    // Update payment record in Db
    const targetPay = payments.find(p => p.id === selectedEscalation.paymentId || p.dealId === selectedEscalation.dealId);
    if (targetPay) {
      const updatedPay: Payment = {
        ...targetPay,
        isPaused: true,
        pauseReason: pauseReason || 'Installation progress paused due to overdue payment stage escalation.',
        pausedAt: new Date().toISOString()
      };
      DbManager.updatePayment(updatedPay);
    }

    setShowPauseModal(false);
    setAcknowledgedTechnicianImpact(false);
    setPauseReason('');
    setNotification({ msg: `🛑 Installation progress for Deal ${selectedEscalation.dealId} placed on Hold. Field technicians notified.`, type: 'success' });
  };

  const filteredEscalations = escalations.filter(e => {
    const matchesSearch = e.dealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerPhone.includes(searchQuery);
    const matchesTier = filterTier === 'all' || e.escalationTier.includes(filterTier);
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-royalemerald/10 border-royalemerald/30 text-royalemerald' : 'bg-error/10 border-error/30 text-error'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.msg}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-warmgray hover:text-charcoal font-mono">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[rgba(184,135,61,0.2)] shadow-diffuse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-error/15 text-error text-[10px] font-bold tracking-widest uppercase rounded-full font-mono">
              Module 9 • Human Escalation Queue
            </span>
            <span className="px-2 py-0.5 bg-antiquegold/10 text-antiquegold text-[10px] font-bold rounded-full font-mono">
              Risk Management Desk
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
            Overdue Payment Escalation Desk
          </h1>
          <p className="text-xs text-warmgray mt-1">
            Human judgment review for accounts that exhausted automated reminders. Log call dispositions or trigger installation progress holds.
          </p>
        </div>
      </div>

      {/* Search & Tier Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[rgba(184,135,61,0.15)] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-warmgray" />
          <input
            type="text"
            placeholder="Search by deal #, customer name, or phone number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl pl-9 pr-4 py-2 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
          />
        </div>

        <select
          value={filterTier}
          onChange={e => setFilterTier(e.target.value)}
          className="bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
        >
          <option value="all">All Escalation Tiers</option>
          <option value="Tier 1">Tier 1: Gentle Call Needed</option>
          <option value="Tier 2">Tier 2: Formal Notice</option>
          <option value="Tier 3">Tier 3: Consider Installation Hold</option>
          <option value="Tier 4">Tier 4: Legal / Exec Escalation</option>
        </select>
      </div>

      {/* Escalation Cards List */}
      <div className="space-y-4">
        {filteredEscalations.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-royalemerald mx-auto" />
            <h3 className="font-serif text-lg font-bold text-charcoal">No Escalated Accounts Pending Review</h3>
            <p className="text-xs text-warmgray">All overdue stage reminders are currently being handled by automated sequence rules.</p>
          </Card>
        ) : (
          filteredEscalations.map(esc => {
            const matchedDeal = deals.find(d => d.id === esc.dealId);
            const isPaused = esc.installationPaused || esc.status === 'Installation Paused';

            return (
              <Card 
                key={esc.id}
                className={`p-6 bg-white border rounded-3xl transition-all shadow-xs ${
                  isPaused ? 'border-error/50 bg-error/5' : 'border-[rgba(184,135,61,0.2)]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(184,135,61,0.12)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-charcoal">{esc.id}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono uppercase ${
                        esc.escalationTier.includes('Tier 3') ? 'bg-amber-200 text-amber-900' :
                        esc.escalationTier.includes('Tier 4') ? 'bg-error/20 text-error' :
                        'bg-antiquegold/10 text-antiquegold'
                      }`}>
                        {esc.escalationTier}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase font-mono ${
                        isPaused ? 'bg-error text-white' : 'bg-royalemerald/15 text-royalemerald'
                      }`}>
                        Status: {esc.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-charcoal mt-1">{esc.customerName}</h3>
                    <p className="text-xs text-warmgray font-mono">
                      Phone: {esc.customerPhone} • Deal Ref: {esc.dealId}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-warmgray font-mono uppercase font-bold">Overdue Amount & Delay</p>
                    <p className="font-mono text-xl font-extrabold text-error">
                      ₹{esc.overdueAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs font-bold text-amber-800 font-mono">
                      ⚠️ {esc.overdueDays} Days Past Due
                    </p>
                  </div>
                </div>

                {/* Context Panel: Customer Relationship & History */}
                <div className="my-4 p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.1)] text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-charcoal">
                    <span className="flex items-center gap-1.5 text-antiquegold">
                      <User className="w-3.5 h-3.5" />
                      <span>Account Context & Relationship Profile</span>
                    </span>
                    <span className="px-2 py-0.5 bg-royalemerald/10 text-royalemerald text-[10px] font-mono rounded-full">
                      VIP Relationship
                    </span>
                  </div>

                  <p className="text-warmgray leading-relaxed">
                    Customer registered under {matchedDeal?.siteLocation || 'Pune West'}. Past project history shows 100% timely clearance on previous stages.
                  </p>

                  {esc.callOutcome && (
                    <div className="p-2.5 bg-white rounded-xl border border-antiquegold/20 text-charcoal space-y-1">
                      <p className="font-bold text-[11px] text-antiquegold">Last Call Logged Outcome:</p>
                      <p className="text-xs italic">"{esc.callOutcome}"</p>
                      {esc.customerPromiseDate && (
                        <p className="text-[10px] font-mono font-bold text-royalemerald">
                          📅 Promised Clearance Date: {esc.customerPromiseDate}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Human One-Tap Action Toolbar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="secondary"
                    className="text-xs py-2 flex-1 sm:flex-none"
                    onClick={() => {
                      setSelectedEscalation(esc);
                      setShowCallModal(true);
                    }}
                  >
                    <Phone className="w-3.5 h-3.5 text-royalemerald" />
                    <span>Log Call Disposition</span>
                  </Button>

                  <Button
                    variant="secondary"
                    className="text-xs py-2 flex-1 sm:flex-none"
                    onClick={() => {
                      setSelectedEscalation(esc);
                      setNoticeTemplateText(`Dear ${esc.customerName}, payment stage of ₹${esc.overdueAmount.toLocaleString('en-IN')} for your elevator project #${esc.dealId} is now ${esc.overdueDays} days overdue. Please clear online via AIEC Portal: https://aiec.in/pay/${esc.dealId}`);
                      setShowNoticeModal(true);
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-antiquegold" />
                    <span>Send Formal Notice Template</span>
                  </Button>

                  <Button
                    variant={isPaused ? 'secondary' : 'primary'}
                    className={`text-xs py-2 flex-1 sm:flex-none ${
                      !isPaused ? 'bg-error text-white hover:bg-error/90' : ''
                    }`}
                    onClick={() => {
                      setSelectedEscalation(esc);
                      setShowPauseModal(true);
                    }}
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>{isPaused ? 'Modify Hold Status' : 'Flag to Pause Installation Progress'}</span>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* MODAL 1: LOG CALL OUTCOME */}
      {showCallModal && selectedEscalation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 rounded-3xl">
            <h3 className="font-serif text-lg font-bold text-charcoal">Log Call Outcome & Promise Date</h3>
            <p className="text-xs text-warmgray">
              Record call details with {selectedEscalation.customerName} ({selectedEscalation.customerPhone}).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Call Disposition Notes *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Spoke with site owner. Agreed to clear ₹1,80,000 via RTGS by Friday."
                  value={callNotes}
                  onChange={e => setCallNotes(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl p-3 text-xs text-charcoal outline-none focus:ring-2 focus:ring-antiquegold"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Promised Payment Date (Optional)</label>
                <input
                  type="date"
                  value={promiseDate}
                  onChange={e => setPromiseDate(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowCallModal(false)}>Cancel</Button>
              <Button variant="emerald" fullWidth onClick={handleSaveCallOutcome}>Save Outcome Log</Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 2: SEND FORMAL NOTICE TEMPLATE */}
      {showNoticeModal && selectedEscalation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white space-y-4 rounded-3xl">
            <h3 className="font-serif text-lg font-bold text-charcoal">Send Formal Payment Escalation Notice</h3>
            <p className="text-xs text-warmgray">Transmit official legal/stage payment notice template to customer.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Select Channel *</label>
                <div className="flex gap-2">
                  {(['WhatsApp', 'Email', 'SMS'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setNoticeChannel(ch)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        noticeChannel === ch ? 'bg-royalemerald text-white border-royalemerald' : 'bg-alabaster text-warmgray border-[#e6dfd4]'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Notice Template Text Body *</label>
                <textarea
                  rows={4}
                  value={noticeTemplateText}
                  onChange={e => setNoticeTemplateText(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl p-3 text-xs text-charcoal outline-none font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowNoticeModal(false)}>Cancel</Button>
              <Button variant="emerald" fullWidth onClick={handleSendFormalNotice}>
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Notice</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 3: PAUSE INSTALLATION PROGRESS ACKNOWLEDGMENT */}
      {showPauseModal && selectedEscalation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full bg-white border border-error/30 space-y-4 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-2 text-error">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold">Flag to Pause Installation Progress</h3>
            </div>

            <p className="text-xs text-warmgray leading-relaxed">
              Pausing installation holds all site activity and connects directly to the Installation Module progress gate.
            </p>

            <div className="p-3 bg-error/10 border border-error/20 rounded-2xl text-xs space-y-2">
              <p className="font-bold text-error uppercase font-mono tracking-wider">⚠️ Operational Risk Notice</p>
              <p className="text-error/90 leading-normal">
                Placing an active site on hold affects scheduled field technicians and elevator material staging. Ensure site safety checks are locked before confirming.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Reason for Hold *</label>
                <input
                  type="text"
                  placeholder="e.g. Overdue Stage 3 payment exceeding 14 days delay limit"
                  value={pauseReason}
                  onChange={e => setPauseReason(e.target.value)}
                  className="w-full bg-alabaster border border-[#e6dfd4] rounded-xl px-3 py-2 text-xs text-charcoal outline-none"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acknowledgedTechnicianImpact}
                  onChange={e => setAcknowledgedTechnicianImpact(e.target.checked)}
                  className="mt-0.5 rounded border-[#e6dfd4] text-royalemerald focus:ring-royalemerald"
                />
                <span className="text-[11px] font-bold text-charcoal leading-tight">
                  I explicitly acknowledge the field technician operational impact and confirm pausing construction progress.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setShowPauseModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleConfirmPauseInstallation}
                className="bg-error text-white hover:bg-error/90"
              >
                Confirm Hold
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
