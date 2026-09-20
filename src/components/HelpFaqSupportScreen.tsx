import React, { useState } from 'react';
import { 
  HelpCircle, Search, ThumbsUp, ThumbsDown, MessageSquare, PhoneCall, 
  Send, Plus, Filter, CheckCircle2, ChevronRight, ChevronDown, User, 
  BookOpen, AlertCircle, Sparkles, Shield, ArrowLeft, RefreshCw, MessageCircle, Tag
} from 'lucide-react';
import { useLanguage } from '../lib/language';
import { HelpArticleItem, SupportTicketOrChatEscalation, HelpTopicSuggestion } from '../types';

interface HelpFaqSupportScreenProps {
  userRole?: string;
  currentLanguage?: string;
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

const INITIAL_HELP_ARTICLES: HelpArticleItem[] = [
  {
    id: 'kb_001',
    title: 'How do Surveyors capture elevator dimensions & generate instant quotes?',
    category: 'leads_crm',
    relevantRoles: ['surveyor', 'admin', 'partner'],
    content: '1. Open the Lead Survey module.\n2. Enter shaft dimensions (pit depth, headroom, shaft width, travel height).\n3. Select elevator spec (MRL Gearless / Hydraulic, Passenger / Hospital / Goods).\n4. Click "Generate Instant Quote" — the app auto-calculates motor KW, structural steel, and GST breaking down pricing instantly.',
    version: 'v2.4 (Aug 2026)',
    lastReviewedDate: '2026-08-01',
    helpfulCount: 42,
    notHelpfulCount: 1,
    tags: ['survey', 'quote', 'shaft', 'pricing', 'mrl']
  },
  {
    id: 'kb_002',
    title: 'Customer AMC Renewal & WhatsApp Invoice Download Process',
    category: 'amc_breakdown',
    relevantRoles: ['customer', 'admin', 'technician'],
    content: '1. Log into Customer Dashboard -> Contracts & AMC.\n2. Review your active AMC plan (Comprehensive / Non-Comprehensive).\n3. Click "Pay Renewal via Razorpay UPI / Card".\n4. Once payment is successful, a GST Tax Invoice and Warranty Card are automatically sent to your registered WhatsApp number.',
    version: 'v2.1 (Jul 2026)',
    lastReviewedDate: '2026-07-28',
    helpfulCount: 88,
    notHelpfulCount: 2,
    tags: ['amc', 'payment', 'whatsapp', 'invoice', 'gst']
  },
  {
    id: 'kb_003',
    title: 'Technician On-Site Check-In & Safety SOP Verification',
    category: 'installation_sop',
    relevantRoles: ['technician', 'qc_inspector', 'admin'],
    content: '1. Enable GPS on your phone before arriving at site.\n2. Tap "Check-In On-Site" when within 100 meters of the building coordinates.\n3. Complete the Safety Gear Checklist (Harness, Helmet, Lockout-Tagout).\n4. Upload step-by-step photos for guide rail alignment and motor positioning before proceeding to electrical wiring.',
    version: 'v3.0 (Aug 2026)',
    lastReviewedDate: '2026-08-10',
    helpfulCount: 64,
    notHelpfulCount: 0,
    tags: ['safety', 'checkin', 'sop', 'technician', 'gps']
  },
  {
    id: 'kb_004',
    title: 'GST Input Tax Credit (ITC) & Supplier Invoice 3-Way Matching',
    category: 'payments_gst',
    relevantRoles: ['supplier', 'admin'],
    content: '1. Go to Supplier Portal -> Invoices & Payments.\n2. Upload your GST e-Invoice JSON / PDF.\n3. The AIEC system automatically runs 3-Way Matching against Purchase Order (PO) and Site Material Received Note (MRN).\n4. Matched invoices are queued for 15-day automated RTGS/NEFT payout.',
    version: 'v2.0 (Jun 2026)',
    lastReviewedDate: '2026-06-15',
    helpfulCount: 31,
    notHelpfulCount: 1,
    tags: ['gst', 'supplier', 'invoice', '3way-match', 'payout']
  },
  {
    id: 'kb_005',
    title: 'Maharashtra Lift Act 2017 License Approval Timeline & Documents',
    category: 'system_portal',
    relevantRoles: ['admin', 'customer', 'partner', 'surveyor'],
    content: 'Under Maharashtra Lift Rules, PWD License approval requires:\n- Approved Elevator Shaft Architectural Layout Plan.\n- Electrical Load Sanction from MSEDCL/BEST.\n- Manufacturer Safety Certificate & Rope Inspection Test Report.\nSubmission takes 7 working days, with PWD Inspector physical inspection scheduled in Week 2.',
    version: 'v1.8 (May 2026)',
    lastReviewedDate: '2026-05-20',
    helpfulCount: 110,
    notHelpfulCount: 3,
    tags: ['lift-act', 'pwd', 'license', 'compliance', 'maharashtra']
  },
  {
    id: 'kb_006',
    title: '24/7 Emergency Lift Breakdown Escalation & Passenger Rescue Protocol',
    category: 'amc_breakdown',
    relevantRoles: ['customer', 'technician', 'admin', 'surveyor', 'partner', 'supplier'],
    content: 'In case of trapped passengers or critical breakdown:\n1. Tap the RED "Emergency SOS Hotline" button in the app top bar.\n2. Call Control Room Hotline: +91 1800-267-3538 (Zero Waiting Time).\n3. Nearest mobile service van within 5 km radius is dispatched via auto-GPS routing.\n4. Technician estimated arrival time (ETA) is live-shared on WhatsApp.',
    version: 'v3.1 (Aug 2026)',
    lastReviewedDate: '2026-08-12',
    helpfulCount: 195,
    notHelpfulCount: 0,
    tags: ['emergency', 'sos', 'breakdown', 'hotline', 'rescue']
  }
];

const INITIAL_SUPPORT_TICKETS: SupportTicketOrChatEscalation[] = [
  {
    id: 'TCK-2026-881',
    userId: 'usr_curr',
    userName: 'Prashant Wable',
    userRole: 'admin',
    subject: 'Query regarding Maharashtra Lift Act 2017 form filling for Kothrud Site',
    category: 'Compliance & Legal',
    status: 'in_progress',
    createdAt: '2026-08-14 09:15',
    messages: [
      {
        sender: 'Prashant Wable',
        timestamp: '09:15 AM',
        text: 'Hello, need quick clarification on Form A submission for PWD Inspector visit at Kothrud commercial site.'
      },
      {
        sender: 'AIEC Desk Specialist (Adv. Kulkarni)',
        timestamp: '09:30 AM',
        text: 'Namaste Prashant Ji! Form A has been pre-filled with the motor serial number and wiring diagram. Uploaded in your Legal Documents section.',
        isAdminResponse: true
      }
    ]
  }
];

export const HelpFaqSupportScreen: React.FC<HelpFaqSupportScreenProps> = ({
  userRole = 'admin',
  currentLanguage = 'en',
  currentUserId = 'usr_admin_01',
  onBack,
  onNavigateTab
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'faq' | 'tickets' | 'suggest'>('faq');
  
  // Filtering & Search
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(userRole || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Articles Data & Feedback state
  const [articles, setArticles] = useState<HelpArticleItem[]>(INITIAL_HELP_ARTICLES);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('kb_001');
  const [votedArticles, setVotedArticles] = useState<Record<string, 'up' | 'down'>>({});

  // Tickets / Live Support state
  const [tickets, setTickets] = useState<SupportTicketOrChatEscalation[]>(INITIAL_SUPPORT_TICKETS);
  const [activeTicketId, setActiveTicketId] = useState<string>('TCK-2026-881');
  const [newReplyMessage, setNewReplyMessage] = useState<string>('');
  
  // New Ticket Modal / State
  const [showNewTicketModal, setShowNewTicketModal] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<string>('General Support');
  const [ticketInitialDesc, setTicketInitialDesc] = useState<string>('');

  // Topic Suggestion state
  const [suggestions, setSuggestions] = useState<HelpTopicSuggestion[]>([
    {
      id: 'sug_101',
      suggestedByRole: 'surveyor',
      suggestedTopicTitle: 'Hydraulic Piston Leakage Troubleshooting Guide',
      description: 'Requesting an article on quick pressure valve test steps during preliminary site visits.',
      status: 'pending_review',
      submittedAt: '2026-08-13'
    }
  ]);
  const [newTopicTitle, setNewTopicTitle] = useState<string>('');
  const [newTopicDesc, setNewTopicDesc] = useState<string>('');
  const [suggestionSubmittedMsg, setSuggestionSubmittedMsg] = useState<boolean>(false);

  // Filter articles logic
  const filteredArticles = articles.filter(art => {
    // Role filter
    if (selectedRoleFilter !== 'all' && !art.relevantRoles.includes(selectedRoleFilter as any)) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && art.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchContent = art.content.toLowerCase().includes(q);
      const matchTags = art.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const handleVote = (articleId: string, type: 'up' | 'down') => {
    if (votedArticles[articleId]) return; // already voted
    setVotedArticles(prev => ({ ...prev, [articleId]: type }));
    setArticles(prev => prev.map(art => {
      if (art.id === articleId) {
        return {
          ...art,
          helpfulCount: type === 'up' ? art.helpfulCount + 1 : art.helpfulCount,
          notHelpfulCount: type === 'down' ? art.notHelpfulCount + 1 : art.notHelpfulCount
        };
      }
      return art;
    }));
  };

  const handleSendReply = () => {
    if (!newReplyMessage.trim()) return;
    setTickets(prev => prev.map(tck => {
      if (tck.id === activeTicketId) {
        return {
          ...tck,
          messages: [
            ...tck.messages,
            {
              sender: 'You',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: newReplyMessage
            }
          ]
        };
      }
      return tck;
    }));
    setNewReplyMessage('');

    // Simulate auto-support acknowledgment
    setTimeout(() => {
      setTickets(prev => prev.map(tck => {
        if (tck.id === activeTicketId) {
          return {
            ...tck,
            messages: [
              ...tck.messages,
              {
                sender: 'AIEC Support Desk (Automated Sync)',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: 'Thank you! Your message was received by our senior escalation supervisor.',
                isAdminResponse: true
              }
            ]
          };
        }
        return tck;
      }));
    }, 1200);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketInitialDesc.trim()) return;
    const newId = `TCK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: SupportTicketOrChatEscalation = {
      id: newId,
      userId: currentUserId,
      userName: userRole === 'admin' ? 'Prashant Wable' : 'User (' + userRole + ')',
      userRole,
      subject: ticketSubject,
      category: ticketCategory,
      status: 'open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [
        {
          sender: 'You',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: ticketInitialDesc
        }
      ]
    };
    setTickets([newRecord, ...tickets]);
    setActiveTicketId(newId);
    setShowNewTicketModal(false);
    setTicketSubject('');
    setTicketInitialDesc('');
    setActiveSubTab('tickets');
  };

  const handleSuggestTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicDesc.trim()) return;
    const newSug: HelpTopicSuggestion = {
      id: `sug_${Date.now().toString().slice(-4)}`,
      suggestedByRole: userRole,
      suggestedTopicTitle: newTopicTitle,
      description: newTopicDesc,
      status: 'pending_review',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    setSuggestions([newSug, ...suggestions]);
    setNewTopicTitle('');
    setNewTopicDesc('');
    setSuggestionSubmittedMsg(true);
    setTimeout(() => setSuggestionSubmittedMsg(false), 4000);
  };

  const selectedTicket = tickets.find(tck => tck.id === activeTicketId);

  return (
    <div className="min-w-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-12">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-secondary)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-[var(--color-accent-primary)]" />
                <h1 className="text-xl font-bold font-serif text-[var(--color-text-primary)]">
                  Help, FAQ & Support Desk
                </h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-sans">
                Role-aware Knowledge Base, Emergency Escalation & Ticket Desk
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a 
              href="tel:18002673538"
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>SOS Hotline 1800-267-3538</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            onClick={() => setActiveSubTab('faq')}
            className={`flex items-center space-x-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'faq'
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Knowledge Base FAQs</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-mono">
              {filteredArticles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center space-x-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'tickets'
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chat & Support Tickets</span>
            {tickets.some(t => t.status === 'open' || t.status === 'in_progress') && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('suggest')}
            className={`flex items-center space-x-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeSubTab === 'suggest'
                ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Suggest New Topic</span>
          </button>
        </div>

        {/* SUBTAB 1: KNOWLEDGE BASE FAQS */}
        {activeSubTab === 'faq' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm mb-6 space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search help articles by topic, keyword (e.g., shaft, AMC, GST, Maharashtra Lift Act)..."
                  className="w-full pl-11 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)]/60">
                {/* Role Filter */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Filter Content by Role</span>
                  </label>
                  <select
                    value={selectedRoleFilter}
                    onChange={e => setSelectedRoleFilter(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none"
                  >
                    <option value="all">All Roles (Universal View)</option>
                    <option value="admin">Admin / Management</option>
                    <option value="surveyor">Surveyor / Sales</option>
                    <option value="technician">Technician / Installer</option>
                    <option value="customer">Customer / Building Owner</option>
                    <option value="supplier">Supplier / Vendor</option>
                    <option value="partner">Franchise Partner</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 flex items-center space-x-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Topic Category</span>
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="leads_crm">Leads & CRM</option>
                    <option value="installation_sop">Installation & Safety SOP</option>
                    <option value="amc_breakdown">AMC & Breakdown Response</option>
                    <option value="payments_gst">Payments & GST Billing</option>
                    <option value="system_portal">System Compliance & Regulations</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Banner */}
            <div className="bg-gradient-to-r from-red-900/10 via-amber-900/10 to-transparent border border-red-500/20 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-red-600/10 text-red-600">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                    Need Immediate Emergency Rescue or Breakdown Dispatch?
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Our 24/7 Control Room handles trapped passenger emergencies with top priority.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewTicketModal(true);
                  setTicketSubject('EMERGENCY: Elevator Breakdown / Trapped Passenger');
                  setTicketCategory('Emergency Breakdown');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
              >
                Escalate Emergency Ticket
              </button>
            </div>

            {/* Articles List */}
            {filteredArticles.length === 0 ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 text-center">
                <HelpCircle className="w-12 h-12 mx-auto text-[var(--color-text-secondary)] mb-3 opacity-50" />
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                  No matching help articles found
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4 max-w-md mx-auto">
                  Try adjusting your search query or role filter. You can also submit a new topic request or talk to support directly.
                </p>
                <button
                  onClick={() => setActiveSubTab('suggest')}
                  className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg text-xs font-medium hover:bg-[var(--color-accent-primary)]/90 transition-colors"
                >
                  Suggest This Topic
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map(art => {
                  const isExpanded = expandedArticleId === art.id;
                  const voted = votedArticles[art.id];

                  return (
                    <div 
                      key={art.id}
                      className={`bg-[var(--color-surface)] border rounded-xl transition-all overflow-hidden ${
                        isExpanded 
                          ? 'border-[var(--color-accent-primary)] shadow-md ring-1 ring-[var(--color-accent-primary)]/20' 
                          : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedArticleId(isExpanded ? null : art.id)}
                        className="w-full text-left p-4 flex items-start justify-between space-x-3 focus:outline-none"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-semibold uppercase">
                              {art.category.replace('_', ' ')}
                            </span>
                            {art.relevantRoles.map(r => (
                              <span key={r} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                {r}
                              </span>
                            ))}
                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                              {art.version}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-serif leading-snug">
                            {art.title}
                          </h3>
                        </div>
                        <div className="p-1 rounded-md text-[var(--color-text-secondary)]">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)]/60 bg-[var(--color-bg)]/30 space-y-4">
                          <div className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line font-sans pl-2 border-l-2 border-[var(--color-accent-primary)]">
                            {art.content}
                          </div>

                          <div className="flex items-center space-x-2 flex-wrap text-xs text-[var(--color-text-secondary)]">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Tags:</span>
                            {art.tags.map(tag => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Helpfulness Rating Section */}
                          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/40 text-xs">
                            <span className="text-[var(--color-text-secondary)]">
                              Was this article helpful?
                            </span>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleVote(art.id, 'up')}
                                disabled={!!voted}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                                  voted === 'up'
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-accent-primary)]/10 text-[var(--color-text-secondary)]'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Yes ({art.helpfulCount})</span>
                              </button>

                              <button
                                onClick={() => handleVote(art.id, 'down')}
                                disabled={!!voted}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                                  voted === 'down'
                                    ? 'bg-red-500/10 border-red-500 text-red-600 font-bold'
                                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-red-500/10 text-[var(--color-text-secondary)]'
                                }`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>No ({art.notHelpfulCount})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: LIVE CHAT & SUPPORT TICKETS */}
        {activeSubTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-serif">
                  Your Support Tickets ({tickets.length})
                </h3>
                <button
                  onClick={() => setShowNewTicketModal(true)}
                  className="px-3 py-1.5 bg-[var(--color-accent-primary)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--color-accent-primary)]/90 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Ticket</span>
                </button>
              </div>

              <div className="space-y-2">
                {tickets.map(tck => {
                  const isSelected = tck.id === activeTicketId;
                  return (
                    <div
                      key={tck.id}
                      onClick={() => setActiveTicketId(tck.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[var(--color-surface)] border-[var(--color-accent-primary)] shadow-md ring-1 ring-[var(--color-accent-primary)]/20'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-[var(--color-accent-primary)] font-bold">
                          {tck.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          tck.status === 'open' ? 'bg-amber-500/10 text-amber-600' :
                          tck.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {tck.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)] line-clamp-1 mb-1">
                        {tck.subject}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                        <span>{tck.category}</span>
                        <span>{tck.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Ticket Chat Thread */}
            <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm flex flex-col h-[520px]">
              {selectedTicket ? (
                <>
                  {/* Thread Header */}
                  <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/40">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[var(--color-accent-primary)]">
                          {selectedTicket.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] font-medium">
                          {selectedTicket.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-1">
                        {selectedTicket.subject}
                      </h3>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-[var(--color-text-secondary)] block">Created</span>
                      <span className="font-mono font-medium">{selectedTicket.createdAt}</span>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--color-bg)]/20">
                    {selectedTicket.messages.map((msg, idx) => {
                      const isMe = !msg.isAdminResponse;
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center space-x-1 text-[10px] text-[var(--color-text-secondary)] mb-1 px-1">
                            <span className="font-semibold">{msg.sender}</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div
                            className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[var(--color-accent-primary)] text-white rounded-tr-none'
                                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-none shadow-sm'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Input Bar */}
                  <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center space-x-2">
                    <input
                      type="text"
                      value={newReplyMessage}
                      onChange={e => setNewReplyMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                      placeholder="Type message to AIEC Support Desk..."
                      className="flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                    />
                    <button
                      onClick={handleSendReply}
                      className="p-2.5 bg-[var(--color-accent-primary)] text-white rounded-lg hover:bg-[var(--color-accent-primary)]/90 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-[var(--color-text-secondary)]">
                  <p className="text-xs">Select a support ticket to view the live conversation thread.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: SUGGEST NEW HELP TOPIC */}
        {activeSubTab === 'suggest' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-serif">
                    Identify Knowledge Gap / Suggest FAQ Topic
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Help us expand the AIEC knowledge base. Submitted topics are reviewed by legal, technical, and engineering leads.
                  </p>
                </div>
              </div>

              {suggestionSubmittedMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 font-semibold mb-4 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Topic suggestion submitted successfully! Thank you for contributing to AIEC documentation.</span>
                </div>
              )}

              <form onSubmit={handleSuggestTopic} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Suggested Topic Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopicTitle}
                    onChange={e => setNewTopicTitle(e.target.value)}
                    placeholder="e.g. Regenerative VFD Drive Energy Savings Calculation Formula"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Detailed Explanation of What Should Be Covered
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newTopicDesc}
                    onChange={e => setNewTopicDesc(e.target.value)}
                    placeholder="Explain the specific scenario or question users face in the field..."
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-lg hover:bg-[var(--color-accent-primary)]/90 transition-colors shadow-sm"
                  >
                    Submit Topic Suggestion
                  </button>
                </div>
              </form>
            </div>

            {/* List of Recent Suggestions */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl">
              <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-3">
                Community Topic Suggestions Queue ({suggestions.length})
              </h4>
              <div className="space-y-2">
                {suggestions.map(sug => (
                  <div key={sug.id} className="p-3 bg-[var(--color-bg)]/40 border border-[var(--color-border)] rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[var(--color-text-primary)]">{sug.suggestedTopicTitle}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">
                        {sug.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mb-1">{sug.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)]">
                      <span>Role: {sug.suggestedByRole}</span>
                      <span>Submitted: {sug.submittedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW TICKET MODAL */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] font-serif">
                Open New Escalation Ticket
              </h3>
              <button 
                onClick={() => setShowNewTicketModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="General Support">General Support</option>
                  <option value="Emergency Breakdown">Emergency Breakdown</option>
                  <option value="Compliance & Legal">Compliance & Legal</option>
                  <option value="Billing & Razorpay">Billing & Payments</option>
                  <option value="Technical & App Bug">Technical & App Bug</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  placeholder="e.g. Need clarification on PWD Inspection date..."
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketInitialDesc}
                  onChange={e => setTicketInitialDesc(e.target.value)}
                  placeholder="Describe your issue or query..."
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg text-xs font-bold hover:bg-[var(--color-accent-primary)]/90"
                >
                  Create & Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpFaqSupportScreen;
