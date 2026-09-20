import React, { useState } from 'react';
import { 
  Building2, Phone, Shield, ArrowRight, FileText, CheckCircle2, 
  Clock, AlertTriangle, ChevronRight, DollarSign, Wrench, Download, 
  MessageSquare, User, Calendar, Sparkles, AlertCircle, HelpCircle, 
  Layers, ChevronDown, Bell, ExternalLink, RefreshCw, ShieldCheck, Heart
} from 'lucide-react';
import { UserRole, CustomerProjectSummary } from '../types';
import { DbManager } from '../lib/db';

interface CustomerHomeDashboardScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerHomeDashboardScreen: React.FC<CustomerHomeDashboardScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onNavigateTab
}) => {
  const [projects, setProjects] = useState<CustomerProjectSummary[]>(() => 
    DbManager.getCustomerProjects(currentUserId)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => 
    projects.length > 0 ? projects[0].id : 'proj_royal_001'
  );

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Helper for trilingual labels
  const getGreeting = () => {
    if (currentLanguage === 'hi') {
      return `नमस्ते, ${activeProject ? activeProject.customerName : 'आदरणीय ग्राहक'}`;
    }
    if (currentLanguage === 'mr') {
      return `नमस्कार, ${activeProject ? activeProject.customerName : 'सन्माननीय ग्राहक'}`;
    }
    return `Welcome back, ${activeProject ? activeProject.customerName : 'Valued Customer'}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Top Header / Brand Banner */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-primary)]/15 border border-[var(--color-accent-primary)]/30 flex items-center justify-center text-[var(--color-accent-primary)] font-serif font-bold text-lg">
              AIEC
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                {getGreeting()}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' 
                  ? 'आपकी लिफ्ट परियोजना एवं सेवा डैशबोर्ड' 
                  : currentLanguage === 'mr' 
                  ? 'आपला लिफ्ट प्रकल्प व सेवा प्लॅटफॉर्म' 
                  : 'Your Elevator Project & Service Portal'}
              </p>
            </div>
          </div>

          {/* Project Switcher Dropdown if Multiple Projects */}
          {projects.length > 1 && (
            <div className="flex items-center space-x-2 bg-[var(--color-bg)] p-1.5 rounded-xl border border-[var(--color-border)] self-start sm:self-auto">
              <Building2 className="w-4 h-4 text-[var(--color-accent-primary)] ml-1" />
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--color-text-primary)] focus:outline-none cursor-pointer pr-2"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.projectMode === 'active_installation' ? 'Installation' : 'AMC Active'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Project Header Banner */}
        {activeProject && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-4">
            {/* Background Decorative Ascension Line Watermark */}
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-5 pointer-events-none bg-gradient-to-l from-[var(--color-accent-primary)] to-transparent" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    activeProject.projectMode === 'active_installation'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
                  }`}>
                    {activeProject.projectMode === 'active_installation'
                      ? (currentLanguage === 'hi' ? 'सक्रिय स्थापना प्रगति पर' : 'Active Installation Project')
                      : (currentLanguage === 'hi' ? 'गोल्ड शील्ड एएमसी सक्रिय' : 'Handover Complete • Gold AMC Active')}
                  </span>

                  <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                    Ref: {activeProject.id}
                  </span>
                </div>

                <h2 className="font-serif font-bold text-xl text-[var(--color-text-primary)] mt-2">
                  {activeProject.projectName}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                  {activeProject.siteAddress} • {activeProject.elevatorType}
                </p>
              </div>

              {/* Unread Notifications & Lead Contact Shortcut */}
              <div className="flex items-center space-x-3 self-start md:self-auto">
                <a
                  href={`tel:${activeProject.assignedLeadManagerPhone.replace(/\s+/g, '')}`}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30 rounded-xl text-xs font-bold hover:bg-[var(--color-accent-primary)] hover:text-white transition-all shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Project Lead</span>
                </a>
              </div>
            </div>

            {/* Mode Specific Dynamic Framing */}
            {activeProject.projectMode === 'active_installation' ? (
              <div className="space-y-3 pt-3 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Current Stage: <strong className="text-[var(--color-accent-primary)]">{activeProject.currentStageName}</strong>
                  </span>
                  <span className="font-mono font-bold text-[var(--color-accent-primary)]">
                    {activeProject.overallProgressPercent}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-full transition-all duration-500"
                    style={{ width: `${activeProject.overallProgressPercent}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)] pt-1">
                  <span>
                    Next Milestone: <strong className="text-[var(--color-text-primary)]">{activeProject.nextMilestoneName}</strong> (Target: {activeProject.nextMilestoneDueDate})
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ {activeProject.statusMessage}
                  </span>
                </div>
              </div>
            ) : (
              /* Post-Handover AMC Framing */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--color-border)] text-xs font-mono">
                <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                  <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">AMC Coverage Plan</span>
                  <span className="font-bold text-[var(--color-text-primary)]">{activeProject.amcInfo?.planName}</span>
                </div>
                <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                  <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">Next Routine Service</span>
                  <span className="font-bold text-[var(--color-accent-primary)]">{activeProject.amcInfo?.nextRoutineServiceDate}</span>
                </div>
                <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                  <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">Open Breakdown Tickets</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Zero Active Issues</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Milestone & Upcoming Payment Quick Cards (Active Installation Mode) */}
        {activeProject?.projectMode === 'active_installation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upcoming Milestone Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Upcoming Milestone
                </span>
                <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
                  Due: {activeProject.nextMilestoneDueDate}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                {activeProject.nextMilestoneName}
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Site technicians are currently executing wiring drops, traveling cable suspension, and VVVF drive calibrations.
              </p>

              <button
                onClick={() => onNavigateTab && onNavigateTab('ProjectStatusTracker')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-[var(--color-accent-primary)] hover:underline pt-1"
              >
                <span>Track Full Timeline & Photos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Next Payment Due Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Stage Payment Schedule
                </span>
                <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
                  Due: {activeProject.nextPaymentDueDate}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                  {activeProject.nextPaymentTitle}
                </h3>
                <span className="font-mono text-lg font-bold text-[var(--color-accent-primary)]">
                  ₹{activeProject.nextPaymentDueAmount.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)]">
                Linked to Stage 3 signoff. Secure UPI, NEFT, or Loan EMI payments supported.
              </p>

              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => onNavigateTab && onNavigateTab('OnlinePaymentCheckout')}
                  className="px-4 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
                >
                  Pay Now Online
                </button>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('PaymentReceiptHistory')}
                  className="px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Payment History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Tiles Grid */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] px-1 flex items-center justify-between">
            <span>Quick Services & Documentation</span>
            <span className="text-xs text-[var(--color-text-secondary)] font-normal">All customer controls in one place</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Tile 1: Project Tracker */}
            <button
              onClick={() => onNavigateTab && onNavigateTab('ProjectStatusTracker')}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">
                  {currentLanguage === 'hi' ? 'प्रगति ट्रैकर' : 'Project Tracker'}
                </h4>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
                  Live stage milestones & site photos
                </p>
              </div>
            </button>

            {/* Tile 2: Payments & Invoices */}
            <button
              onClick={() => onNavigateTab && onNavigateTab('PaymentReceiptHistory')}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] group-hover:text-white transition-colors">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">
                  {currentLanguage === 'hi' ? 'भुगतान एवं रसीदें' : 'Payments & Invoices'}
                </h4>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
                  Stage installments & tax invoices
                </p>
              </div>
            </button>

            {/* Tile 3: Documents Repository */}
            <button
              onClick={() => onNavigateTab && onNavigateTab('SopDocumentRepository')}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">
                  {currentLanguage === 'hi' ? 'अनुबंध एवं दस्तावेज़' : 'Contract & Docs'}
                </h4>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
                  Quotation, contract & PWD license
                </p>
              </div>
            </button>

            {/* Tile 4: Service & Support */}
            <button
              onClick={() => onNavigateTab && onNavigateTab('CustomerHandoverWalkthrough')}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] p-4 rounded-2xl text-left shadow-sm hover:shadow-md transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] group-hover:text-white transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">
                  {activeProject?.projectMode === 'ongoing_amc' ? 'Book AMC Service' : 'Handover & Support'}
                </h4>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
                  Routine maintenance & technical support
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Executive Guarantee & Emergency Support Box */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent-primary)] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                  Direct Owner Assurance • Mr. Prashant Vasant Wable
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                  "At All India Elevators Company, every shaft alignment, electrical component, and safety inspection is personally backed by our commitment to zero compromise on safety."
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto whitespace-nowrap">
              <a
                href="tel:+919876543210"
                className="px-3.5 py-2 bg-[var(--color-accent-secondary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>24x7 Helpline</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
