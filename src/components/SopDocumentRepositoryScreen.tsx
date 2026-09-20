import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Bookmark, Download, CheckCircle2, AlertCircle, 
  ChevronRight, ArrowLeft, ShieldCheck, Cpu, Compass, Box, Clock, 
  ExternalLink, Sparkles, RefreshCw, X, Layers, Share2, Check, Globe
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SopDocument, UserRole } from '../types';
import { Card, Button } from './Common';

interface SopDocumentRepositoryScreenProps {
  userRole?: UserRole;
  currentLanguage?: 'en' | 'hi' | 'mr';
  onNavigateToQuiz?: (assessmentId: string) => void;
  onNavigateToTrainingLibrary?: () => void;
  onBack?: () => void;
}

export const SopDocumentRepositoryScreen: React.FC<SopDocumentRepositoryScreenProps> = ({
  userRole = 'technician',
  currentLanguage = 'en',
  onNavigateToQuiz,
  onNavigateToTrainingLibrary,
  onBack
}) => {
  const [documents, setDocuments] = useState<SopDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'bookmarked' | 'offline'>('all');
  const [selectedDoc, setSelectedDoc] = useState<SopDocument | null>(null);
  const [docModalTab, setDocModalTab] = useState<'content' | 'version_history'>('content');
  const [isRefreshingSync, setIsRefreshingSync] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = DbManager.getSopDocuments();
    setDocuments(docs);
  };

  const handleToggleBookmark = (docId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    DbManager.toggleSopBookmark(docId);
    loadDocuments();
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const handleToggleOfflineDownload = (docId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    DbManager.toggleSopOfflineDownload(docId);
    loadDocuments();
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(prev => prev ? { ...prev, isDownloadedOffline: !prev.isDownloadedOffline } : null);
    }
  };

  const handleRefreshAllSync = () => {
    setIsRefreshingSync(true);
    setTimeout(() => {
      setIsRefreshingSync(false);
      loadDocuments();
    }, 800);
  };

  const getLocalizedTitle = (doc: SopDocument) => {
    if (currentLanguage === 'hi' && doc.titleHi) return doc.titleHi;
    if (currentLanguage === 'mr' && doc.titleMr) return doc.titleMr;
    return doc.title;
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const title = getLocalizedTitle(doc).toLowerCase();
    const code = doc.sopCode.toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    let matchesTab = true;
    if (activeFilterTab === 'bookmarked') matchesTab = !!doc.isBookmarked;
    if (activeFilterTab === 'offline') matchesTab = !!doc.isDownloadedOffline;

    return matchesSearch && matchesCategory && matchesTab;
  });

  const categories = [
    { id: 'all', label: 'All SOPs', icon: Layers },
    { id: 'safety', label: 'Safety & LOTO', icon: ShieldCheck },
    { id: 'installation', label: 'Installation & VFD', icon: Cpu },
    { id: 'shaft_survey', label: 'Shaft & 3D Survey', icon: Compass },
    { id: 'delivery', label: 'OEM Delivery & Unboxing', icon: Box },
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'safety': return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
      case 'installation': return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'shaft_survey': return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300';
      case 'delivery': return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h1 className="font-serif text-lg font-bold">
                  {currentLanguage === 'hi' ? 'एसओपी दस्तावेज़ रिपॉजिटरी' : currentLanguage === 'mr' ? 'SOP दस्तऐवज भांडार' : 'SOP Document Repository'}
                </h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Governed standard operating procedures & field technical reference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAllSync}
              className={`p-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-1.5 hover:bg-[var(--color-bg)] ${isRefreshingSync ? 'animate-spin text-[var(--color-accent-primary)]' : ''}`}
              title="Sync Version Standard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onNavigateToTrainingLibrary && (
              <Button
                variant="outline"
                onClick={onNavigateToTrainingLibrary}
                className="text-xs px-2.5 py-1.5 h-auto hidden sm:flex items-center gap-1"
              >
                <span>Training Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Banner Card - Single Source of SOP Truth */}
        <Card className="p-4 bg-gradient-to-r from-[var(--color-surface)] via-amber-500/5 to-[var(--color-surface)] border border-[var(--color-accent-primary)]/20 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold font-serif text-[var(--color-text-primary)]">
                  Governed Single Source of SOP Truth
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Version Sync
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Every SOP here powers the active step-by-step logic in the Installation and Delivery checklists. Offline downloads remain accessible on remote sites without mobile connectivity.
              </p>
            </div>
          </div>
        </Card>

        {/* Search & Sticky Filter Section */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={currentLanguage === 'hi' ? 'एसओपी कोड, शीर्षक या कीवर्ड खोजें...' : currentLanguage === 'mr' ? 'SOP कोड, शीर्षक किंवा कीवर्ड शोधा...' : 'Search SOP code, title, or keyword...'}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] text-[var(--color-text-primary)] shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs (All / Bookmarked / Offline) */}
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${activeFilterTab === 'all' ? 'bg-[var(--color-accent-primary)] text-white shadow-xs' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'}`}
            >
              All SOP Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveFilterTab('bookmarked')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors ${activeFilterTab === 'bookmarked' ? 'bg-[var(--color-accent-primary)] text-white shadow-xs' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'}`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current text-amber-400" />
              Bookmarks ({documents.filter(d => d.isBookmarked).length})
            </button>
            <button
              onClick={() => setActiveFilterTab('offline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors ${activeFilterTab === 'offline' ? 'bg-[var(--color-accent-primary)] text-white shadow-xs' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'}`}
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Offline Ready ({documents.filter(d => d.isDownloadedOffline).length})
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border shrink-0 flex items-center gap-1.5 transition-all ${
                    isSelected 
                      ? 'bg-[var(--color-accent-secondary)] text-white border-transparent font-semibold shadow-2xs' 
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document List View */}
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <Card className="p-8 text-center space-y-3 bg-[var(--color-surface)] border-[var(--color-border)]">
              <FileText className="w-10 h-10 mx-auto text-[var(--color-text-secondary)] opacity-50" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                No SOP Documents Found
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                No standard operating procedure matches your search or active filter tab. Try clearing filters or search terms.
              </p>
              <Button
                variant="outline"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setActiveFilterTab('all'); }}
                className="text-xs px-3 py-1.5"
              >
                Reset All Filters
              </Button>
            </Card>
          ) : (
            filteredDocs.map(doc => {
              const localizedTitle = getLocalizedTitle(doc);
              return (
                <Card 
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50 transition-all cursor-pointer shadow-2xs hover:shadow-xs group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-accent-primary)]">
                          {doc.sopCode}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${getCategoryColor(doc.category)}`}>
                          {doc.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {doc.currentVersion}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors leading-snug">
                        {localizedTitle}
                      </h3>

                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                        {doc.summary}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-[var(--color-text-secondary)] pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[var(--color-accent-primary)]" />
                          Effective: {doc.effectiveDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {doc.sections.length} Sections
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Icons */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleBookmark(doc.id, e)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            doc.isBookmarked 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                              : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-amber-500'
                          }`}
                          title={doc.isBookmarked ? 'Remove Bookmark' : 'Bookmark SOP'}
                        >
                          <Bookmark className={`w-4 h-4 ${doc.isBookmarked ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => handleToggleOfflineDownload(doc.id, e)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            doc.isDownloadedOffline 
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' 
                              : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-blue-500'
                          }`}
                          title={doc.isDownloadedOffline ? 'Downloaded for Offline' : 'Download Offline'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      {doc.isDownloadedOffline && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Offline Ready
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Reader Modal / Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-primary)]">
                    {selectedDoc.sopCode}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${getCategoryColor(selectedDoc.category)}`}>
                    {selectedDoc.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800">
                    Current Version: {selectedDoc.currentVersion}
                  </span>
                </div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-[var(--color-text-primary)] leading-tight">
                  {getLocalizedTitle(selectedDoc)}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-mono">
                  Effective Date: {selectedDoc.effectiveDate} • Reviewed by: {selectedDoc.lastReviewedBy}
                </p>
              </div>

              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
              <button
                onClick={() => setDocModalTab('content')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  docModalTab === 'content'
                    ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                SOP Standard Content
              </button>
              <button
                onClick={() => setDocModalTab('version_history')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  docModalTab === 'version_history'
                    ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Version History ({selectedDoc.versionHistory.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {docModalTab === 'content' ? (
                <>
                  {/* Summary Box */}
                  <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)]">
                    <span className="font-semibold text-[var(--color-accent-primary)] block mb-1">
                      Operational Purpose & Scope:
                    </span>
                    {selectedDoc.summary}
                  </div>

                  {/* Offline / Version Currency Notice */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Matching enforced checklist step standard ({selectedDoc.currentVersion})</span>
                    </div>
                    {selectedDoc.isDownloadedOffline && (
                      <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                        Cached Offline
                      </span>
                    )}
                  </div>

                  {/* SOP Sections */}
                  <div className="space-y-4">
                    {selectedDoc.sections.map((sec, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
                        <h4 className="font-serif font-bold text-sm text-[var(--color-accent-primary)]">
                          {sec.sectionTitle}
                        </h4>
                        <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                          {sec.content}
                        </p>
                        {sec.keyCheckpoints && sec.keyCheckpoints.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                            <span className="text-[11px] font-semibold text-[var(--color-accent-secondary)] flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Key Safety Checkpoints:
                            </span>
                            <ul className="list-disc list-inside text-xs text-[var(--color-text-secondary)] space-y-1 pl-1">
                              {sec.keyCheckpoints.map((ck, cidx) => (
                                <li key={cidx}>{ck}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    All revision logs for this standard operating procedure template, matching enforced checklist step standards across versions:
                  </p>
                  {selectedDoc.versionHistory.map((vh, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[var(--color-accent-primary)]">
                          {vh.version} {idx === 0 && <span className="text-[10px] text-emerald-500 ml-1 font-semibold">(Current Standard)</span>}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                          Released: {vh.releaseDate}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-primary)]">
                        {vh.summaryOfChanges}
                      </p>
                      <span className="text-[10px] text-[var(--color-text-secondary)] block pt-1">
                        Author: {vh.author}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleBookmark(selectedDoc.id)}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                    selectedDoc.isBookmarked 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${selectedDoc.isBookmarked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{selectedDoc.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>

                <button
                  onClick={() => handleToggleOfflineDownload(selectedDoc.id)}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                    selectedDoc.isDownloadedOffline 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' 
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{selectedDoc.isDownloadedOffline ? 'Offline Stored' : 'Save Offline'}</span>
                </button>
              </div>

              {onNavigateToQuiz && (
                <Button
                  onClick={() => {
                    const docId = selectedDoc.id;
                    setSelectedDoc(null);
                    onNavigateToQuiz('assess_001');
                  }}
                  className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white text-xs px-4 py-2 font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Take Certification Test</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
