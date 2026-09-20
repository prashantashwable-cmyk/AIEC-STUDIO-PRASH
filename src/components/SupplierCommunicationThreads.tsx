import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Search, Filter, Plus, PhoneCall, Mail, AlertTriangle, 
  CheckCircle, FileText, Paperclip, Send, Clock, Award, ChevronRight, 
  Building2, ShoppingBag, ShieldAlert, X, Eye, ExternalLink, Flag, RefreshCw
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SupplierCommunicationThread, SupplierChatMessage, Supplier, PurchaseOrder, OrderRatingEntry } from '../types';

export const SupplierCommunicationThreads: React.FC = () => {
  const [threads, setThreads] = useState<SupplierCommunicationThread[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Input state
  const [messageText, setMessageText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<{ fileName: string; fileType: 'pdf' | 'doc' | 'image' | 'po_link'; fileSize: string } | null>(null);

  // Modals
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showLogCallModal, setShowLogCallModal] = useState(false);
  const [showScorecardFlagModal, setShowScorecardFlagModal] = useState(false);

  // New Thread Form State
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newPoId, setNewPoId] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  // Log Call Form State
  const [callType, setCallType] = useState<'phone_call' | 'email' | 'whatsapp'>('phone_call');
  const [callSummary, setCallSummary] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  // Scorecard Flag State
  const [scorecardNote, setScorecardNote] = useState('');

  const loadData = () => {
    const threadData = DbManager.getSupplierThreads();
    const suppData = DbManager.getSuppliers();
    const poData = DbManager.getPurchaseOrders();
    setThreads(threadData);
    setSuppliers(suppData);
    setPurchaseOrders(poData);

    if (threadData.length > 0 && !selectedThreadId) {
      setSelectedThreadId(threadData[0].id);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('aiec_db_update', loadData);
    return () => window.removeEventListener('aiec_db_update', loadData);
  }, []);

  const activeThread = threads.find(t => t.id === selectedThreadId);

  // Filtered threads
  const filteredThreads = threads.filter(t => {
    const matchesSearch = t.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.relatedPoId && t.relatedPoId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter || (statusFilter === 'unresponsive' && t.unresponsiveFlag);
    const matchesSupplier = supplierFilter === 'all' || t.supplierId === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedAttachment) return;
    if (!selectedThreadId) return;

    const newMsg: SupplierChatMessage = {
      id: `msg_${Date.now()}`,
      senderRole: 'admin',
      senderName: 'Mr. Prashant Vasant Wable (Admin)',
      timestamp: new Date().toISOString(),
      text: messageText,
      attachments: selectedAttachment ? [{
        id: `att_${Date.now()}`,
        fileName: selectedAttachment.fileName,
        fileType: selectedAttachment.fileType,
        fileUrl: '#',
        fileSize: selectedAttachment.fileSize
      }] : undefined,
      isRead: true
    };

    DbManager.addMessageToThread(selectedThreadId, newMsg);
    setMessageText('');
    setSelectedAttachment(null);
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierId || !newTopicTitle || !newInitialMsg) return;

    const supp = suppliers.find(s => s.id === newSupplierId);
    const newThread: SupplierCommunicationThread = {
      id: `thread_${Date.now()}`,
      supplierId: newSupplierId,
      supplierName: supp ? supp.name : 'Unknown Supplier',
      relatedPoId: newPoId || undefined,
      topicTitle: newTopicTitle,
      status: 'active',
      unresponsiveFlag: false,
      unresponsiveWindowHours: 24,
      lastResponseTimestamp: new Date().toISOString(),
      lastMessageText: newInitialMsg,
      unreadCount: 0,
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          senderRole: 'admin',
          senderName: 'Mr. Prashant Vasant Wable (Admin)',
          timestamp: new Date().toISOString(),
          text: newInitialMsg,
          isRead: true
        }
      ]
    };

    DbManager.addSupplierThread(newThread);
    setSelectedThreadId(newThread.id);
    setShowNewThreadModal(false);
    setNewSupplierId('');
    setNewPoId('');
    setNewTopicTitle('');
    setNewInitialMsg('');
  };

  const handleLogExternalCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSummary.trim() || !selectedThreadId) return;

    const typeLabel = callType === 'phone_call' ? '📞 Phone Call Logged' : callType === 'email' ? '✉️ External Email Logged' : '💬 WhatsApp Dispatch Note';

    const logMsg: SupplierChatMessage = {
      id: `msg_ext_${Date.now()}`,
      senderRole: 'admin',
      senderName: 'Mr. Prashant Vasant Wable',
      timestamp: new Date().toISOString(),
      text: `${typeLabel} (${contactPerson || 'Supplier Representative'}):\n${callSummary}`,
      isExternalLog: true,
      externalType: callType,
      isRead: true
    };

    DbManager.addMessageToThread(selectedThreadId, logMsg);
    setShowLogCallModal(false);
    setCallSummary('');
    setContactPerson('');
  };

  const handleFlagForScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !activeThread) return;

    const flagMsg: SupplierChatMessage = {
      id: `msg_flag_${Date.now()}`,
      senderRole: 'system_log',
      senderName: 'Supplier Performance Auditor',
      timestamp: new Date().toISOString(),
      text: `⚠️ Scorecard Exception Flagged by Admin:\n${scorecardNote || 'Responsiveness & delay miscommitment logged into Supplier Rating Scorecard history.'}`,
      flaggedForScorecard: true,
      scorecardNote: scorecardNote,
      isRead: true
    };

    DbManager.addMessageToThread(selectedThreadId, flagMsg);

    // Also update scorecard in db if available
    const scorecards = DbManager.getSupplierScorecards();
    const existing = scorecards.find(s => s.supplierId === activeThread.supplierId);
    if (existing) {
      const newRating: OrderRatingEntry = {
        id: `rate_${Date.now()}`,
        orderId: activeThread.relatedPoId || 'PO-MISC',
        supplierId: activeThread.supplierId,
        supplierName: activeThread.supplierName,
        overallRating: 3.0,
        deliveryTimelinessDays: 2,
        qualityDefectLogged: true,
        defectNotes: `Thread Exception: ${scorecardNote || 'Delayed response beyond 24h SLA.'}`,
        attributedTo: 'supplier_part',
        completedDate: new Date().toISOString().split('T')[0],
        disputeStatus: 'none'
      };

      const updatedHistory = [...existing.ratingsHistory, newRating];

      DbManager.updateSupplierScorecard({
        ...existing,
        responsivenessScore: Math.max(50, existing.responsivenessScore - 10),
        overallScore: Math.max(60, existing.overallScore - 5),
        ratingsHistory: updatedHistory
      });
    }

    setShowScorecardFlagModal(false);
    setScorecardNote('');
  };

  const handleResolveThread = () => {
    if (!activeThread) return;
    const updated: SupplierCommunicationThread = {
      ...activeThread,
      status: activeThread.status === 'resolved' ? 'active' : 'resolved',
      unresponsiveFlag: false
    };
    DbManager.updateSupplierThread(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Supplier Operations Hub
            </span>
            <span className="text-slate-400 text-xs">Prompt 099 Implementation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Supplier Communication Threads</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Centralized dispatch chat, external call/email logging, SLA delay monitoring, and automatic scorecard exception tagging.
          </p>
        </div>
        <button
          onClick={() => setShowNewThreadModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-600/20 transition flex items-center gap-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Start Supplier Thread
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search threads by supplier name, topic, or PO ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Threads</option>
            <option value="unresponsive">⚠️ Unresponsive (&gt;24h)</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={supplierFilter}
            onChange={e => setSupplierFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Thread List (1/3), Right Thread Conversation View (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Thread List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Threads ({filteredThreads.length})
            </span>
            <span className="text-xs text-slate-400">Sorted by last activity</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No matching supplier threads found.
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = thread.id === selectedThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-4 cursor-pointer transition relative hover:bg-slate-50/80 ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {thread.supplierName}
                      </span>
                      {thread.relatedPoId && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          {thread.relatedPoId}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-1 mb-1">
                      {thread.topicTitle}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-sans">
                      {thread.lastMessageText}
                    </p>

                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(thread.lastResponseTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-1">
                        {thread.unresponsiveFlag && (
                          <span className="bg-amber-100 text-amber-800 font-medium px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px]">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Unresponsive (&gt;24h)
                          </span>
                        )}
                        {thread.status === 'resolved' && (
                          <span className="bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded text-[10px]">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Thread View */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {activeThread ? (
            <>
              {/* Active Thread Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">{activeThread.supplierName}</span>
                    {activeThread.relatedPoId && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-mono px-2 py-0.5 rounded font-semibold border border-emerald-200 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-emerald-600" /> {activeThread.relatedPoId}
                      </span>
                    )}
                    {activeThread.unresponsiveFlag && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-semibold border border-amber-300 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> SLA Response Stalled (&gt;24h)
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{activeThread.topicTitle}</h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowLogCallModal(true)}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-indigo-600" /> Log Call / Email
                  </button>

                  <button
                    onClick={() => setShowScorecardFlagModal(true)}
                    className="bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-600" /> Scorecard Exception
                  </button>

                  <button
                    onClick={handleResolveThread}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition ${
                      activeThread.status === 'resolved' 
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {activeThread.status === 'resolved' ? 'Re-open Thread' : 'Mark Resolved'}
                  </button>
                </div>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
                {activeThread.messages.map(msg => {
                  if (msg.senderRole === 'system_log') {
                    return (
                      <div key={msg.id} className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2 shadow-sm">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between font-semibold mb-1">
                            <span>{msg.senderName}</span>
                            <span className="text-[10px] text-amber-700 font-normal">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="whitespace-pre-line">{msg.text}</p>
                          {msg.scorecardNote && (
                            <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 font-mono text-[11px] text-amber-800">
                              Note: {msg.scorecardNote}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const isAdmin = msg.senderRole === 'admin';
                  const isBot = msg.senderRole === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700">{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm ${
                          isAdmin
                            ? 'bg-emerald-700 text-white rounded-tr-none'
                            : isBot
                            ? 'bg-blue-50 border border-blue-200 text-slate-800 rounded-tl-none font-mono'
                            : msg.isExternalLog
                            ? 'bg-indigo-50 border border-indigo-200 text-slate-800 rounded-tl-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2.5 space-y-1.5 pt-2 border-t border-white/20">
                            {msg.attachments.map(att => (
                              <a
                                key={att.id}
                                href={att.fileUrl}
                                onClick={e => e.preventDefault()}
                                className={`flex items-center justify-between gap-2 p-2 rounded-lg text-xs font-medium transition ${
                                  isAdmin 
                                    ? 'bg-emerald-800/80 hover:bg-emerald-900 text-white' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{att.fileName}</span>
                                </div>
                                <span className="text-[10px] opacity-75 shrink-0">{att.fileSize || 'Doc'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
                {selectedAttachment && (
                  <div className="mb-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                      Attached: {selectedAttachment.fileName} ({selectedAttachment.fileSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachment(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAttachment({
                        fileName: `Drawing_Signoff_Doc_${Math.floor(Math.random() * 900 + 100)}.pdf`,
                        fileType: 'pdf',
                        fileSize: '1.4 MB'
                      })}
                      className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                      title="Attach Technical Drawing or PDF"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Type dispatch update, drawing confirmation, or question..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">Select a supplier thread to view conversation</p>
              <p className="text-xs text-slate-400 mt-1">Or click 'Start Supplier Thread' to initiate a new thread.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Create New Thread */}
      {showNewThreadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Start New Supplier Thread
              </h3>
              <button onClick={() => setShowNewThreadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Supplier *</label>
                <select
                  required
                  value={newSupplierId}
                  onChange={e => setNewSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Related Purchase Order (Optional)</label>
                <select
                  value={newPoId}
                  onChange={e => setNewPoId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">None / General Inquiry</option>
                  {purchaseOrders.map(p => (
                    <option key={p.id} value={p.id}>{p.id} ({p.customerName} - {p.supplierName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Stator Frame Drawing Signoff & Dispatch Confirmation"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail your request or inquiry to the supplier..."
                  value={newInitialMsg}
                  onChange={e => setNewInitialMsg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewThreadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition"
                >
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Log Phone Call / External Email */}
      {showLogCallModal && activeThread && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-600" /> Log External Call / Email
              </h3>
              <button onClick={() => setShowLogCallModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogExternalCall} className="p-5 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCallType('phone_call')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                      callType === 'phone_call' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Phone Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallType('email')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                      callType === 'email' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Direct Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallType('whatsapp')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                      callType === 'whatsapp' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Representative Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Suresh Patil (Factory Manager)"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Commitments Made *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record verbal dispatch promises, material delays, or technical clarifications discussed..."
                  value={callSummary}
                  onChange={e => setCallSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogCallModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition"
                >
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Flag Scorecard Exception */}
      {showScorecardFlagModal && activeThread && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-amber-100 bg-amber-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-600" /> Flag Scorecard Exception
              </h3>
              <button onClick={() => setShowScorecardFlagModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFlagForScorecard} className="p-5 space-y-4 text-sm">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                Flagging this thread directly updates <strong>{activeThread.supplierName}</strong>'s Responsiveness Score in the Supplier Rating Scorecard module.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Note & Reason *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe delay, lack of response, or verbal miscommitment to record in the audit log..."
                  value={scorecardNote}
                  onChange={e => setScorecardNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScorecardFlagModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-500 transition"
                >
                  Apply Scorecard Penalty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
