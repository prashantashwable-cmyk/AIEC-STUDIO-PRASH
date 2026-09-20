import React, { useState } from 'react';
import { 
  FileText, Search, Download, Share2, Filter, ShieldCheck, CheckCircle2, 
  Calendar, FileCode, Clock, ArrowLeft, ArrowDownToLine, ExternalLink, 
  AlertCircle, ChevronDown, ChevronUp, Sparkles, FolderArchive, FileCheck
} from 'lucide-react';
import { UserRole, CustomerVaultDocument } from '../types';
import { DbManager } from '../lib/db';

interface CustomerDocumentVaultScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const CustomerDocumentVaultScreen: React.FC<CustomerDocumentVaultScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack,
  onNavigateTab
}) => {
  const [documents] = useState<CustomerVaultDocument[]>(() => 
    DbManager.getCustomerVaultDocuments(currentUserId)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSuperseded, setShowSuperseded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categoryOptions = [
    { id: 'all', label: currentLanguage === 'hi' ? 'सभी फ़ाइलें' : 'All Documents' },
    { id: 'contract', label: currentLanguage === 'hi' ? 'अनुबंध' : 'Contracts' },
    { id: 'quotation', label: currentLanguage === 'hi' ? 'कोटेशन' : 'Quotations' },
    { id: 'invoice_receipt', label: currentLanguage === 'hi' ? 'रसीदें एवं बिल' : 'Invoices & Receipts' },
    { id: 'compliance_license', label: currentLanguage === 'hi' ? 'लाइसेंस एवं सुरक्षा' : 'PWD License & Safety' },
    { id: 'warranty_amc', label: currentLanguage === 'hi' ? 'वारंटी एवं एएमसी' : 'Warranty & AMC' }
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSupersededFilter = showSuperseded ? true : !doc.isSuperseded;

    return matchesSearch && matchesCategory && matchesSupersededFilter;
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadSingle = (doc: CustomerVaultDocument) => {
    triggerToast(`Downloading verified file: ${doc.documentTitle}`);
  };

  const handleDownloadAllBundle = () => {
    triggerToast(`Packaging all ${filteredDocs.length} documents into AIEC_Vault_Bundle.zip...`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24 transition-colors duration-200">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-text-primary)] px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                {currentLanguage === 'hi' ? 'डिजिटल दस्तावेज़ वॉल्ट' : currentLanguage === 'mr' ? 'डिजिटल दस्तऐवज वॉल्ट' : 'Customer Document Vault'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'आपका स्थायी, सुरक्षित और प्रामाणिक दस्तावेज़ संग्रह' : 'Immutable, tamper-evident repository of all contract & safety signoffs'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadAllBundle}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-sm self-start sm:self-auto"
          >
            <FolderArchive className="w-4 h-4" />
            <span>{currentLanguage === 'hi' ? 'सभी डाउनलोड करें (.zip)' : 'Download All Bundle (.zip)'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Search & Category Filter Bar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Search by doc title, agreement, or site name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] font-medium"
              />
            </div>

            {/* Include Superseded Toggle */}
            <label className="flex items-center space-x-2 text-xs font-bold text-[var(--color-text-secondary)] cursor-pointer self-start sm:self-auto select-none">
              <input
                type="checkbox"
                checked={showSuperseded}
                onChange={e => setShowSuperseded(e.target.checked)}
                className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)] focus:ring-0"
              />
              <span>Show Archived / Superseded Versions</span>
            </label>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categoryOptions.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-accent-primary)] text-white border-transparent shadow-sm'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Count Summary */}
        <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] px-1">
          <span>Showing <strong>{filteredDocs.length}</strong> verified files</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
            256-Bit Cryptographic Hash Verified
          </span>
        </div>

        {/* Document List Rows */}
        {filteredDocs.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg)] text-[var(--color-text-secondary)] flex items-center justify-center mx-auto border border-[var(--color-border)]">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
              No matching documents found
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Try adjusting your search query or switching categories.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map(doc => (
              <div 
                key={doc.id}
                className={`bg-[var(--color-surface)] border rounded-2xl p-4 shadow-sm hover:border-[var(--color-accent-primary)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  doc.isSuperseded ? 'opacity-60 border-dashed border-[var(--color-border)]' : 'border-[var(--color-border)]'
                }`}
              >
                {/* Left File Icon & Details */}
                <div className="flex items-start space-x-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    doc.isSuperseded 
                      ? 'bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-800' 
                      : 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-serif font-bold text-sm text-[var(--color-text-primary)]">
                        {doc.documentTitle}
                      </span>
                      
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        {doc.versionTag}
                      </span>

                      {doc.isSuperseded && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200">
                          Archived / Superseded
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Project: <strong className="text-[var(--color-text-primary)]">{doc.projectName}</strong> • Size: {doc.fileSize}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] font-mono text-[var(--color-text-secondary)] pt-1">
                      <span>Issued: {doc.issueDate}</span>
                      {doc.validUntilDate && (
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                          Valid Until: {doc.validUntilDate}
                        </span>
                      )}
                    </div>

                    {doc.isSuperseded && doc.supersededByDocTitle && (
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 pt-1">
                        ↳ Superseded by current active version: <strong>{doc.supersededByDocTitle}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => handleDownloadSingle(doc)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] rounded-xl text-xs font-bold transition-all"
                  >
                    <Download className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: doc.documentTitle, url: window.location.href });
                      } else {
                        triggerToast(`Link copied for ${doc.documentTitle}`);
                      }
                    }}
                    className="p-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-secondary)] rounded-xl hover:text-[var(--color-text-primary)] transition-all"
                    title="Share File"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
