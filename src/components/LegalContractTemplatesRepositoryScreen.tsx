import React, { useState } from 'react';
import { 
  FileText, Shield, Scale, MapPin, CheckCircle2, AlertCircle, Clock, 
  Search, Plus, Filter, ChevronRight, Edit3, Eye, ArrowLeft, Download, 
  Check, History, BookOpen, Layers, Sparkles
} from 'lucide-react';
import { 
  LegalContractTemplateRecord, 
  StateLiftActClauseItem, 
  LegalReviewAuditLog 
} from '../types';
import { 
  initialLegalTemplates, 
  initialStateLiftActClauses, 
  initialLegalReviewLogs 
} from '../lib/db';

interface LegalContractTemplatesRepositoryScreenProps {
  userRole?: string;
  currentLanguage?: 'en' | 'mr' | 'hi';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const LegalContractTemplatesRepositoryScreen: React.FC<LegalContractTemplatesRepositoryScreenProps> = ({
  userRole = 'admin',
  currentLanguage = 'en',
  currentUserId = 'admin_prashant',
  onBack,
  onNavigateTab
}) => {
  // State
  const [templates, setTemplates] = useState<LegalContractTemplateRecord[]>(initialLegalTemplates);
  const [liftClauses, setLiftClauses] = useState<StateLiftActClauseItem[]>(initialStateLiftActClauses);
  const [reviewLogs, setReviewLogs] = useState<LegalReviewAuditLog[]>(initialLegalReviewLogs);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'templates' | 'lift_acts' | 'reviews'>('templates');

  // Modals / Detail Views
  const [selectedTemplate, setSelectedTemplate] = useState<LegalContractTemplateRecord | null>(null);
  const [showAddClauseModal, setShowAddClauseModal] = useState(false);
  const [newStateName, setNewStateName] = useState('Madhya Pradesh Lift Rules');
  const [newActSection, setNewActSection] = useState('Section 6 (Inspection License)');
  const [newClauseTitle, setNewClauseTitle] = useState('Mandatory Lift Inspector Annual Certificate');
  const [newMandatoryReq, setNewMandatoryReq] = useState('Annual load testing and insulation certificate filed prior to renewal.');
  const [newClauseText, setNewClauseText] = useState('The licensee shall cause the lift installation to be inspected annually by the Inspector of Lifts...');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Translations
  const t = {
    en: {
      title: "Legal & Contract Templates Repository",
      subtitle: "Master governed legal documents, version control, and State Lift Act clause library",
      templatesTab: "Master Legal Templates",
      liftActsTab: "State Lift Act Clause Library",
      reviewsTab: "Counsel Audit Log",
      
      searchPlaceholder: "Search templates, clauses, or BIS references...",
      addClauseBtn: "+ Add State Lift Act Clause",
      categoryAll: "All Document Types",
      stateAll: "All Jurisdictions",
      
      versionTag: "Current Version",
      effectiveDate: "Effective Date",
      reviewedBy: "Legal Counsel Reviewer",
      applicableStates: "Enforceable In",
      previewSnippet: "Contract Legal Boilerplate Snippet",
      
      addClauseModalTitle: "Register New State Lift Act Requirement",
      addClauseModalSub: "Expand AIEC legally governed clauses for new expansion states in India.",
      
      backToMaster: "Back to Settings Master"
    },
    mr: {
      title: "कायदेशीर आणि कंत्राट टेम्पलेट्स भांडार",
      subtitle: "मुख्य कायदेशीर दस्तऐवज, आवृत्ती नियंत्रण आणि राज्य लिफ्ट कायदा कलम ग्रंथालय",
      templatesTab: "मुख्य कायदेशीर टेम्पलेट्स",
      liftActsTab: "राज्य लिफ्ट कायदा कलमे",
      reviewsTab: "वकील ऑडिट लॉग",
      
      searchPlaceholder: "टेम्पलेट्स, कलमे किंवा BIS संदर्भ शोधा...",
      addClauseBtn: "+ राज्य लिफ्ट कायदा कलम जोडा",
      categoryAll: "सर्व दस्तऐवज प्रकार",
      stateAll: "सर्व राज्ये",
      
      versionTag: "सध्याची आवृत्ती",
      effectiveDate: "प्रभावी तारीख",
      reviewedBy: "कायदेशीर सल्लागार",
      applicableStates: "लागू असलेली राज्ये",
      previewSnippet: "कंत्राट मसुदा मजकूर",
      
      addClauseModalTitle: "नवीन राज्य लिफ्ट कायदा कलम नोंदवा",
      addClauseModalSub: "भारतातील नवीन राज्यांमधील विस्तारासाठी कायदेशीर कलमे जोडा.",
      
      backToMaster: "मुख्य सेटिंग्जवर जा"
    },
    hi: {
      title: "कानूनी एवं अनुबंध टेम्प्लेट रिपॉजिटरी",
      subtitle: "मास्टर कानूनी दस्तावेज, संस्करण नियंत्रण और राज्य लिफ्ट अधिनियम खंड पुस्तकालय",
      templatesTab: "मास्टर कानूनी टेम्प्लेट्स",
      liftActsTab: "राज्य लिफ्ट अधिनियम खंड",
      reviewsTab: "वकील ऑडिट लॉग",
      
      searchPlaceholder: "टेम्प्लेट्स, खंड या बीआईएस संदर्भ खोजें...",
      addClauseBtn: "+ राज्य लिफ्ट अधिनियम खंड जोड़ें",
      categoryAll: "सभी दस्तावेज प्रकार",
      stateAll: "सभी राज्य",
      
      versionTag: "वर्तमान संस्करण",
      effectiveDate: "प्रभावी तिथि",
      reviewedBy: "कानूनी सलाहकार",
      applicableStates: "लागू राज्य",
      previewSnippet: "अनुबंध का कानूनी प्रारूप",
      
      addClauseModalTitle: "नया राज्य लिफ्ट अधिनियम खंड दर्ज करें",
      addClauseModalSub: "भारत के नए राज्यों में विस्तार हेतु कानूनी खंड जोड़ें।",
      
      backToMaster: "मुख्य सेटिंग्स पर लौटें"
    }
  }[currentLanguage] || {
    title: "Legal & Contract Templates Repository",
    subtitle: "Master governed legal documents, version control, and State Lift Act clause library",
    templatesTab: "Master Legal Templates",
    liftActsTab: "State Lift Act Clause Library",
    reviewsTab: "Counsel Audit Log",
    searchPlaceholder: "Search templates, clauses, or BIS references...",
    addClauseBtn: "+ Add State Lift Act Clause",
    categoryAll: "All Document Types",
    stateAll: "All Jurisdictions",
    versionTag: "Current Version",
    effectiveDate: "Effective Date",
    reviewedBy: "Legal Counsel Reviewer",
    applicableStates: "Enforceable In",
    previewSnippet: "Contract Legal Boilerplate Snippet",
    addClauseModalTitle: "Register New State Lift Act Requirement",
    addClauseModalSub: "Expand AIEC legally governed clauses for new expansion states in India.",
    backToMaster: "Back to Settings Master"
  };

  // Filter logic
  const filteredTemplates = templates.filter(tmpl => {
    const matchesSearch = tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.bodyTextSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesState = selectedStateFilter === 'all' || tmpl.applicableStates.some(s => s.toLowerCase().includes(selectedStateFilter.toLowerCase()));
    return matchesSearch && matchesCategory && matchesState;
  });

  const filteredClauses = liftClauses.filter(c => 
    c.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.clauseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.actReferenceSection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add Clause Submit
  const handleAddClauseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 10) + ' IST';
    const newClause: StateLiftActClauseItem = {
      clauseId: `clause_${Date.now().toString().slice(-5)}`,
      stateName: newStateName,
      actReferenceSection: newActSection,
      clauseTitle: newClauseTitle,
      mandatoryRequirement: newMandatoryReq,
      clauseText: newClauseText,
      lastUpdated: nowStr
    };

    setLiftClauses([newClause, ...liftClauses]);
    setShowAddClauseModal(false);
    setActiveTab('lift_acts');
    setSuccessMsg(currentLanguage === 'mr' ? 'नवीन राज्य लिफ्ट कायदा कलम यशस्वीरीत्या जोडले गेले!' : currentLanguage === 'hi' ? 'नया राज्य लिफ्ट अधिनियम खंड सफलतापूर्वक जोड़ा गया!' : 'New State Lift Act clause registered & synchronized for contract generator!');
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div className="min-h-screen pb-24 text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-colors duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-[var(--color-bg)]/90 border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors"
                title={t.backToMaster}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  {t.title}
                </h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddClauseModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addClauseBtn}</span>
              <span className="sm:hidden">Add Clause</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start space-x-3 text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Search & Tabs Controls */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
            >
              <option value="all">{t.categoryAll}</option>
              <option value="customer_installation">Customer Erection & Installation</option>
              <option value="amc_service">AMC Maintenance Contracts</option>
              <option value="supplier_sla">Supplier Quality SLA</option>
              <option value="partner_onboarding">Partner Technician Onboarding</option>
            </select>

            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
            >
              <option value="all">{t.stateAll}</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'templates'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {t.templatesTab} ({filteredTemplates.length})
            </button>

            <button
              onClick={() => setActiveTab('lift_acts')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'lift_acts'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {t.liftActsTab} ({filteredClauses.length})
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {t.reviewsTab} ({reviewLogs.length})
            </button>
          </div>
        </div>

        {/* TAB 1: MASTER TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {filteredTemplates.map(tmpl => (
              <div 
                key={tmpl.templateId}
                className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] mt-0.5 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                          {tmpl.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {tmpl.currentVersion}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {t.reviewedBy}: <strong className="text-[var(--color-text-primary)]">{tmpl.reviewedByCounsel}</strong> (Reviewed: {tmpl.lastLegalReviewDate})
                      </p>

                      {/* State Pills */}
                      <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-1">
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-medium mr-1">{t.applicableStates}:</span>
                        {tmpl.applicableStates.map((st, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text-primary)]">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[var(--color-border)] shrink-0">
                    <button
                      onClick={() => setSelectedTemplate(tmpl)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)] transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                      <span>Preview Text</span>
                    </button>
                  </div>
                </div>

                {/* Boilerplate Text Snippet Box */}
                <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-accent-primary)] block mb-1">
                    {t.previewSnippet}
                  </span>
                  "{tmpl.bodyTextSnippet}"
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: STATE LIFT ACT CLAUSES */}
        {activeTab === 'lift_acts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                State Lift Act Mandates & Inspection Rules
              </h3>
              <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                Auto-Selected by Site Pin Code
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredClauses.map(clause => (
                <div 
                  key={clause.clauseId}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                        {clause.stateName}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-secondary)]">
                      {clause.actReferenceSection}
                    </span>
                  </div>

                  <h5 className="font-semibold text-xs text-[var(--color-text-primary)]">
                    {clause.clauseTitle}
                  </h5>

                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    Mandatory: {clause.mandatoryRequirement}
                  </p>

                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed">
                    "{clause.clauseText}"
                  </div>

                  <div className="text-[11px] text-[var(--color-text-secondary)] font-mono text-right">
                    Last Verified against State Gazette: {clause.lastUpdated}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COUNSEL REVIEW LOGS */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
              Legal Counsel Review & Compliance Audit Trail
            </h3>

            <div className="space-y-3">
              {reviewLogs.map(log => (
                <div 
                  key={log.reviewId}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-[var(--color-text-primary)]">
                        {log.counselName}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Approved Unconditional
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {log.comments}
                  </p>

                  <div className="text-[11px] text-[var(--color-text-secondary)] font-mono flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-[var(--color-accent-primary)]" />
                    <span>Review Timestamp: {log.reviewDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TEMPLATE PREVIEW MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                  {selectedTemplate.title}
                </h3>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                  Version: {selectedTemplate.currentVersion}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTemplate(null)}
                className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[var(--color-bg)] text-xs text-[var(--color-text-secondary)] space-y-1">
                <div>Counsel Review: <strong className="text-[var(--color-text-primary)]">{selectedTemplate.reviewedByCounsel}</strong></div>
                <div>Last Review Date: <strong className="text-[var(--color-text-primary)]">{selectedTemplate.lastLegalReviewDate}</strong></div>
                <div>Jurisdictions: <strong className="text-[var(--color-text-primary)]">{selectedTemplate.applicableStates.join(', ')}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {selectedTemplate.bodyTextSnippet}
                {"\n\n[STANDARD AIEC DISPUTE RESOLUTION CLAUSE]\nAll disputes arising out of this contract shall be submitted to sole arbitration in Mumbai under the Arbitration and Conciliation Act, 1996. Courts in Pune / Mumbai shall have exclusive jurisdiction."}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl bg-[var(--color-accent-primary)] text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STATE LIFT ACT CLAUSE MODAL */}
      {showAddClauseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <form onSubmit={handleAddClauseSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                  {t.addClauseModalTitle}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddClauseModal(false)}
                className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)]">
              {t.addClauseModalSub}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">State / Act Name</label>
                <input
                  type="text"
                  required
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Act Section / Rule Reference</label>
                <input
                  type="text"
                  required
                  value={newActSection}
                  onChange={(e) => setNewActSection(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Clause Title</label>
                <input
                  type="text"
                  required
                  value={newClauseTitle}
                  onChange={(e) => setNewClauseTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Mandatory Operational Requirement Summary</label>
                <input
                  type="text"
                  required
                  value={newMandatoryReq}
                  onChange={(e) => setNewMandatoryReq(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block mb-1">Legal Clause Draft Text</label>
                <textarea
                  rows={3}
                  required
                  value={newClauseText}
                  onChange={(e) => setNewClauseText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setShowAddClauseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white text-xs font-semibold shadow"
              >
                Save & Register Clause
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
