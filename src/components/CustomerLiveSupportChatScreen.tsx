import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, ArrowLeft, Send, Bot, User, ShieldCheck, Phone, 
  Sparkles, CheckCircle2, Info, ChevronRight, UserCheck, RefreshCw, 
  Clock, AlertTriangle, FileText, ExternalLink
} from 'lucide-react';
import { UserRole, CustomerSupportChatThread, CustomerSupportChatMessage } from '../types';
import { DbManager } from '../lib/db';

interface CustomerLiveSupportChatScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerLiveSupportChatScreen: React.FC<CustomerLiveSupportChatScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [thread, setThread] = useState<CustomerSupportChatThread>(() => 
    DbManager.getCustomerSupportChatThread(currentUserId)
  );
  const [inputText, setInputText] = useState<string>('');
  const [showContextPanel, setShowContextPanel] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickReplyChips = [
    { label: 'Check AMC Renewal Date', action: 'amc' },
    { label: 'Request Site Engineer Visit', action: 'visit' },
    { label: 'Download Payment Receipt', action: 'receipt' },
    { label: 'Request Call with Prashant Wable', action: 'human' }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: CustomerSupportChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'customer',
      senderName: thread.customerName,
      messageText: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...thread.messages, userMsg];
    let updatedStatus = thread.status;
    let updatedAgentName = thread.assignedAgentName;

    setInputText('');

    // Simulated Auto-Bot Logic or Human Handoff
    if (text.toLowerCase().includes('human') || text.toLowerCase().includes('prashant') || text.toLowerCase().includes('call')) {
      updatedStatus = 'human_assigned';
      updatedAgentName = 'Prashant Wable (MD & Support Lead)';

      const botHandoffMsg: CustomerSupportChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'bot',
        senderName: 'AIEC Assistant Bot 🤖',
        messageText: 'I have transferred your chat with full site context to Mr. Prashant Wable (MD). He has been notified on his admin app.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      updatedMessages.push(botHandoffMsg);

      const humanReplyMsg: CustomerSupportChatMessage = {
        id: `msg_${Date.now() + 2}`,
        sender: 'human_agent',
        senderName: 'Prashant Wable',
        messageText: 'Namaste Rajeshwar ji! I am reviewing your site records for Royal Heights Tower A now. How can I help you today?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setTimeout(() => {
        const finalThread = {
          ...thread,
          status: updatedStatus,
          assignedAgentName: updatedAgentName,
          messages: [...updatedMessages, humanReplyMsg]
        };
        setThread(finalThread);
        DbManager.saveCustomerSupportChatThread(finalThread);
      }, 1200);

    } else if (text.toLowerCase().includes('amc')) {
      const botMsg: CustomerSupportChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'bot',
        senderName: 'AIEC Assistant Bot 🤖',
        messageText: `Your current AMC Status is: Active (Gold Shield 24x7). Valid until March 14, 2027. Would you like to schedule your quarterly routine checkup?`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      updatedMessages.push(botMsg);
    } else {
      const defaultBotMsg: CustomerSupportChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'bot',
        senderName: 'AIEC Assistant Bot 🤖',
        messageText: 'Thank you! Our AIEC Support Desk has received your inquiry. I have attached your site stage and AMC details for our team.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      updatedMessages.push(defaultBotMsg);
    }

    const newThread: CustomerSupportChatThread = {
      ...thread,
      status: updatedStatus,
      assignedAgentName: updatedAgentName,
      messages: updatedMessages
    };

    setThread(newThread);
    DbManager.saveCustomerSupportChatThread(newThread);
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

      {/* Top Bar Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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

            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)] flex items-center justify-center text-[var(--color-accent-primary)]">
                  {thread.status === 'human_assigned' ? (
                    <UserCheck className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)] absolute bottom-0 right-0" />
              </div>

              <div>
                <h1 className="font-serif text-sm font-bold flex items-center gap-1.5">
                  <span>{thread.assignedAgentName || 'AIEC Support Assistant'}</span>
                  <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                </h1>
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  Site: <strong className="text-[var(--color-text-primary)]">{thread.projectName}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-bold flex items-center gap-1 transition-all"
              title="Toggle Site Context Panel"
            >
              <Info className="w-4 h-4 text-[var(--color-accent-primary)]" />
              <span className="hidden sm:inline">Site Context</span>
            </button>

            <a
              href="tel:+919876543210"
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
              title="Direct Phone Call"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Chat Thread Container */}
        <div className={`${showContextPanel ? 'md:col-span-2' : 'md:col-span-3'} space-y-4 flex flex-col h-[calc(100vh-180px)]`}>
          
          {/* Messages Scroll Area */}
          <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 overflow-y-auto space-y-4 shadow-sm">
            
            {/* Context Badge Banner */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-center text-xs text-[var(--color-text-secondary)] space-y-1 font-mono">
              <span className="text-[var(--color-accent-primary)] font-bold block">
                🔒 VERIFIED CUSTOMER CHAT THREAD
              </span>
              <span>All conversation history is logged and shared with Mr. Prashant Wable (MD)</span>
            </div>

            {/* Message Bubbles */}
            {thread.messages.map(msg => {
              const isCustomer = msg.sender === 'customer';
              const isBot = msg.sender === 'bot';

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center space-x-1.5 px-1 text-[10px] font-mono text-[var(--color-text-secondary)]">
                    {!isCustomer && isBot && <Bot className="w-3 h-3 text-[var(--color-accent-primary)]" />}
                    {!isCustomer && !isBot && <UserCheck className="w-3 h-3 text-emerald-600" />}
                    <span className="font-bold">{msg.senderName}</span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isCustomer
                        ? 'bg-[var(--color-accent-primary)] text-white rounded-tr-none shadow-sm font-medium'
                        : isBot
                        ? 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-none'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-[var(--color-text-primary)] rounded-tl-none font-medium'
                    }`}
                  >
                    {msg.messageText}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Reply Chips Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {quickReplyChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.label)}
                className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] text-xs font-bold rounded-xl whitespace-nowrap shadow-sm transition-all hover:scale-105"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input & Composer Bar */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2 shadow-sm flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your question or request human agent assistance..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-[var(--color-bg)] border-none rounded-xl px-4 py-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none font-medium"
            />

            <button
              onClick={() => handleSendMessage()}
              className="p-3 bg-[var(--color-accent-primary)] text-white rounded-xl hover:opacity-95 transition-all shadow-md"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side Customer & Site Context Snapshot */}
        {showContextPanel && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-serif font-bold text-sm text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2.5 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[var(--color-accent-primary)]" />
                Automated Customer Context
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px] uppercase font-mono">Customer Name</span>
                  <strong className="text-[var(--color-text-primary)] text-sm">{thread.customerName}</strong>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px] uppercase font-mono">Current Site Stage</span>
                  <span className="font-bold text-[var(--color-accent-primary)]">{thread.contextSnapshot.projectStage}</span>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block text-[10px] uppercase font-mono">AMC Warranty Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{thread.contextSnapshot.amcStatus}</span>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Pending Payment:</span>
                  <span className="font-mono font-bold text-[var(--color-accent-primary)]">₹{thread.contextSnapshot.pendingDueAmount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Open Support Tickets:</span>
                  <span className="font-mono font-bold">{thread.contextSnapshot.openTicketsCount} Active</span>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('ProjectStatusTracker')}
                  className="w-full text-left px-3 py-2 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-between transition-all"
                >
                  <span>View Project Status Tracker</span>
                  <ChevronRight className="w-4 h-4 text-[var(--color-accent-primary)]" />
                </button>

                <button
                  onClick={() => onNavigateTab && onNavigateTab('CustomerPaymentInstallments')}
                  className="w-full text-left px-3 py-2 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-between transition-all"
                >
                  <span>View Stage Payments</span>
                  <ChevronRight className="w-4 h-4 text-[var(--color-accent-primary)]" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
