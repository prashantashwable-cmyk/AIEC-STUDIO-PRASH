import React, { useState } from 'react';
import { 
  Wrench, ArrowLeft, AlertTriangle, Phone, CheckCircle2, Clock, 
  Send, Paperclip, MessageSquare, ShieldCheck, Sparkles, User, 
  ChevronRight, AlertCircle, FileText, X, Image as ImageIcon
} from 'lucide-react';
import { UserRole, CustomerSupportTicket, CustomerProjectSummary } from '../types';
import { DbManager } from '../lib/db';

interface CustomerSupportTicketScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerSupportTicketScreen: React.FC<CustomerSupportTicketScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [projects] = useState<CustomerProjectSummary[]>(() => 
    DbManager.getCustomerProjects(currentUserId)
  );
  const [tickets, setTickets] = useState<CustomerSupportTicket[]>(() => 
    DbManager.getCustomerSupportTickets(currentUserId)
  );
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'proj_royal_001'
  );
  const [category, setCategory] = useState<CustomerSupportTicket['category']>('routine_service');
  const [urgency, setUrgency] = useState<CustomerSupportTicket['urgency']>('normal');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; url: string; type: 'image' | 'video' | 'pdf' }[]>([]);
  
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<CustomerSupportTicket | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categoryOptions = [
    { id: 'emergency_safety', label: 'Emergency / Safety Concern', est: 'Instant Response (<15 Mins)', isEmergency: true },
    { id: 'breakdown_malfunction', label: 'Elevator Breakdown / Not Moving', est: 'Within 2 Hours', isEmergency: false },
    { id: 'noise_vibration', label: 'Unusual Noise / Jerky Movement', est: 'Within 4 Hours', isEmergency: false },
    { id: 'routine_service', label: 'AMC Maintenance / Service Visit', est: 'Within 24 Hours', isEmergency: false },
    { id: 'billing_payment', label: 'Billing / Invoice Query', est: 'Within 24 Hours', isEmergency: false },
    { id: 'general_inquiry', label: 'General Inquiry / Upgrade', est: 'Within 24 Hours', isEmergency: false }
  ];

  const handleCategoryChange = (catId: CustomerSupportTicket['category']) => {
    setCategory(catId);
    if (catId === 'emergency_safety') {
      setUrgency('critical_emergency');
    } else if (catId === 'breakdown_malfunction') {
      setUrgency('high');
    } else {
      setUrgency('normal');
    }
  };

  const handleSimulateAttachment = () => {
    const mockFile = {
      name: `site_issue_photo_${Date.now().toString().slice(-4)}.jpg`,
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      type: 'image' as const
    };
    setAttachedFiles(prev => [...prev, mockFile]);
    triggerToast('Photo attached successfully');
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      triggerToast('Please provide a subject and description');
      return;
    }

    const selectedCatObj = categoryOptions.find(c => c.id === category);

    const newTicket: CustomerSupportTicket = {
      id: `tkt_cust_${Date.now().toString().slice(-4)}`,
      customerId: currentUserId,
      customerName: activeProject ? activeProject.customerName : 'Shri Rajeshwar Patil',
      customerPhone: '+91 98220 11223',
      projectId: selectedProjectId,
      projectName: activeProject ? activeProject.projectName : 'Royal Heights Tower A',
      category: category,
      urgency: urgency,
      subject: subject,
      description: description,
      status: 'submitted',
      estimatedResponseTime: selectedCatObj ? selectedCatObj.est : 'Within 24 Hours',
      createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      attachments: attachedFiles,
      activityLog: [
        {
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          author: activeProject ? activeProject.customerName : 'Customer',
          role: 'Customer',
          message: 'Support ticket submitted via Customer Portal.'
        }
      ]
    };

    DbManager.saveCustomerSupportTicket(newTicket);
    setTickets(DbManager.getCustomerSupportTickets(currentUserId));
    
    // Reset Form
    setSubject('');
    setDescription('');
    setAttachedFiles([]);
    setActiveTab('list');
    setSelectedTicketForDetail(newTicket);

    triggerToast(`Ticket #${newTicket.id} logged successfully! Our team has been notified.`);
  };

  const handleAddReplyToTicket = () => {
    if (!selectedTicketForDetail || !newMessageText.trim()) return;

    const updatedLog = [
      ...selectedTicketForDetail.activityLog,
      {
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        author: selectedTicketForDetail.customerName,
        role: 'Customer',
        message: newMessageText.trim()
      }
    ];

    const updatedTicket: CustomerSupportTicket = {
      ...selectedTicketForDetail,
      activityLog: updatedLog
    };

    DbManager.saveCustomerSupportTicket(updatedTicket);
    setTickets(DbManager.getCustomerSupportTickets(currentUserId));
    setSelectedTicketForDetail(updatedTicket);
    setNewMessageText('');
    triggerToast('Reply sent to technical dispatch team.');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

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
                <Wrench className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'सेवा एवं सहायता डेस्क' : currentLanguage === 'mr' ? 'सेवा आणि मदत केंद्र' : 'Service & Support Desk'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'रखरखाव अनुरोध, ब्रेकडाउन और सहायता सहायता' : 'Raise service concerns, request AMC visits or report issues'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'create'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              + Raise Ticket
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'list'
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              My Tickets ({tickets.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* CRITICAL SAFETY EMERGENCY SOS HIGHLIGHT */}
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                Is this a Passengers Trapped or Emergency Situation?
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Do not wait for a online ticket response. Call our 24x7 Emergency SOS Rescue Team immediately.
              </p>
            </div>
          </div>

          <a
            href="tel:+919876543210"
            className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all shadow-md whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call 24x7 SOS: +91 98765 43210</span>
          </a>
        </div>

        {/* CREATE TICKET VIEW */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmitTicket} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--color-accent-primary)]" />
              New Service Request Form
            </h2>

            {/* Select Project */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                Select Elevator Site Project
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} — {p.siteAddress}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                Issue Category & Expected Response SLA
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categoryOptions.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                      category === cat.id
                        ? 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)] shadow-sm'
                        : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                    }`}
                  >
                    <span className="font-bold text-xs text-[var(--color-text-primary)] block">
                      {cat.label}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--color-accent-primary)] block">
                      ⏱ {cat.est}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                Subject Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Unusual noise during floor descent or routine AMC check booking"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
                required
              />
            </div>

            {/* Detailed Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-text-primary)]">
                Detailed Description & Location Details
              </label>
              <textarea
                rows={4}
                placeholder="Describe what happened, floor number, error code on elevator display panel, or preferred time slot for service..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
                required
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  Attach Photos or Video Evidence (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleSimulateAttachment}
                  className="px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-accent-primary)] rounded-lg text-xs font-bold hover:border-[var(--color-accent-primary)] flex items-center gap-1"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>+ Add Site Photo</span>
                </button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pt-1">
                  {attachedFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs">
                      <ImageIcon className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      <span className="font-mono text-[11px] truncate max-w-[120px]">{f.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="text-[var(--color-text-secondary)] hover:text-rose-500 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky/Primary Submit Button */}
            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket to Service Dispatch</span>
              </button>
            </div>
          </form>
        )}

        {/* TICKET LIST VIEW */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            
            {/* Selected Ticket Thread Modal / Drawer if open */}
            {selectedTicketForDetail && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)] rounded-2xl p-6 shadow-md space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
                      TICKET #{selectedTicketForDetail.id} • SLA: {selectedTicketForDetail.estimatedResponseTime}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mt-0.5">
                      {selectedTicketForDetail.subject}
                    </h3>
                  </div>

                  <button 
                    onClick={() => setSelectedTicketForDetail(null)}
                    className="p-1.5 rounded-xl hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] font-bold text-sm"
                  >
                    ✕ Close Thread
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {selectedTicketForDetail.activityLog.map((log, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl border space-y-1 text-xs ${
                        log.role === 'Customer'
                          ? 'bg-[var(--color-bg)] border-[var(--color-border)] ml-6'
                          : 'bg-[var(--color-accent-primary)]/10 border-[var(--color-accent-primary)]/30 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[var(--color-text-primary)]">{log.author} ({log.role})</span>
                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{log.timestamp}</span>
                      </div>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">{log.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <div className="pt-2 border-t border-[var(--color-border)] flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type reply to technical lead..."
                    value={newMessageText}
                    onChange={e => setNewMessageText(e.target.value)}
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                  <button
                    onClick={handleAddReplyToTicket}
                    className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* List of Tickets */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <span>Support Ticket History ({tickets.length})</span>
                <span className="text-xs font-normal text-[var(--color-text-secondary)]">Click to view thread</span>
              </h3>

              {tickets.length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)] py-6 text-center">
                  No active support tickets. Click "+ Raise Ticket" above if you require service assistance.
                </p>
              ) : (
                <div className="space-y-3">
                  {tickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketForDetail(t)}
                      className="bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] p-4 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-primary)]">
                            #{t.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'resolved' 
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' 
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                          }`}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                          {t.subject}
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                          {t.description}
                        </p>
                        <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block">
                          Logged: {t.createdAt} • Site: {t.projectName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center text-xs font-bold text-[var(--color-accent-primary)]">
                        <span>View Discussion Thread</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
