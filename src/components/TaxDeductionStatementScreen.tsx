import React, { useState } from 'react';
import { 
  Building2, Download, FileCheck2, Filter, Info, ShieldCheck, 
  ArrowLeft, Search, Calendar, FileText, CheckCircle2, AlertCircle, 
  Sparkles, ExternalLink, RefreshCw, Printer, UserCheck
} from 'lucide-react';
import { UserRole, TdsStatementRecord } from '../types';
import { DbManager } from '../lib/db';

interface TaxDeductionStatementScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  onBack?: () => void;
}

export const TaxDeductionStatementScreen: React.FC<TaxDeductionStatementScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  onBack
}) => {
  const [statements, setStatements] = useState<TdsStatementRecord[]>(() => 
    DbManager.getTdsStatements(userRole === 'admin' ? undefined : currentUserId)
  );
  const [selectedFinYear, setSelectedFinYear] = useState('FY 2026-27');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [showForm26QModal, setShowForm26QModal] = useState(false);

  const isAdmin = userRole === 'admin';

  // Filter list
  const filteredStatements = statements.filter(stmt => {
    const matchesQuarter = selectedQuarter === 'all' || stmt.quarterLabel.includes(selectedQuarter);
    const matchesSearch = 
      stmt.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stmt.partnerPan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stmt.form16aCertificateNo && stmt.form16aCertificateNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesQuarter && matchesSearch;
  });

  // Aggregates
  const totalGrossPayout = filteredStatements.reduce((sum, s) => sum + s.grossPayoutAmount, 0);
  const totalTdsDeducted = filteredStatements.reduce((sum, s) => sum + s.tdsDeductedAmount, 0);
  const totalCertificatesIssued = filteredStatements.filter(s => s.status === 'filed_certificate_issued').length;

  const handleDownloadForm16A = (statement: TdsStatementRecord) => {
    setDownloadingCertId(statement.id);
    setTimeout(() => {
      setDownloadingCertId(null);
      alert(`Downloaded Form 16A TDS Certificate (${statement.form16aCertificateNo}) for ${statement.partnerName} - ${statement.quarterLabel}. Valid for Income Tax filing.`);
    }, 1200);
  };

  const getStatusBadge = (status: TdsStatementRecord['status']) => {
    switch (status) {
      case 'filed_certificate_issued':
        return {
          label: currentLanguage === 'hi' ? '26Q फ़ाइल्ड • प्रमाण-पत्र उपलब्ध' : currentLanguage === 'mr' ? 'प्रमाणपत्र उपलब्ध' : 'Form 16A Issued',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
        };
      case 'pending_quarterly_filing':
        return {
          label: currentLanguage === 'hi' ? 'तिमाही फाइलिंग लंबित' : 'Pending 26Q Return',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
        };
      case 'threshold_exempt':
        return {
          label: currentLanguage === 'hi' ? 'सीमा से नीचे (शून्य टीडीएस)' : 'Exempt (< Threshold)',
          bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
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
                <FileCheck2 className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'टीडीएस (स्रोत पर कर कटौती) विवरण' : currentLanguage === 'mr' ? 'टीडीएस कपात विवरण' : 'Tax Deduction (TDS) Statement'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isAdmin 
                  ? 'AIEC Form 26Q return summary & partner withholding ledger' 
                  : 'Official Form 16A withholding certificates & Sec 194H / 194C statements'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowForm26QModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Form 26Q Export</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Compliance Status Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)] block">
                DEDUCTOR TAN: PNEA12345B • ALL INDIA ELEVATORS CO.
              </span>
              <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
                {selectedFinYear} Income Tax Withholding Ledger
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Calculated strictly on gross stage payouts under Income Tax Act Sec 194H (5% Commission) and Sec 194C (1% Contractor).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                TAN Active & Compliant
              </span>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--color-border)]">
            <div className="bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Gross Payout Paid</span>
              <span className="font-mono text-xl font-bold text-[var(--color-text-primary)]">
                ₹{totalGrossPayout.toLocaleString()}
              </span>
            </div>

            <div className="bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Total TDS Deducted</span>
              <span className="font-mono text-xl font-bold text-[var(--color-accent-primary)]">
                ₹{totalTdsDeducted.toLocaleString()}
              </span>
            </div>

            <div className="bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)]">
              <span className="text-[11px] text-[var(--color-text-secondary)] block">Form 16A Certificates Issued</span>
              <span className="font-mono text-xl font-bold text-[var(--color-accent-secondary)]">
                {totalCertificatesIssued} Quarter(s)
              </span>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedQuarter('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedQuarter === 'all'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              All Quarters
            </button>
            <button
              onClick={() => setSelectedQuarter('Q1')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedQuarter === 'Q1'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Q1 (Apr - Jun)
            </button>
            <button
              onClick={() => setSelectedQuarter('Q2')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedQuarter === 'Q2'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Q2 (Jul - Sep)
            </button>
          </div>

          {isAdmin && (
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Partner, PAN or Form 16A..."
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs focus:border-[var(--color-accent-primary)] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* TDS Statement Cards List */}
        <div className="space-y-4">
          {filteredStatements.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div 
                key={item.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:border-[var(--color-accent-primary)]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)]">
                        PAN: {item.partnerPan}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)] mt-1.5">
                      {item.partnerName} • {item.quarterLabel}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Applicable Section: <strong className="text-[var(--color-text-primary)]">{item.applicableSection}</strong> ({item.applicableRatePercent}% Rate)
                    </p>
                  </div>

                  {item.status === 'filed_certificate_issued' && (
                    <button
                      onClick={() => handleDownloadForm16A(item)}
                      disabled={downloadingCertId === item.id}
                      className="flex items-center space-x-2 px-3.5 py-2 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white border border-[var(--color-accent-primary)]/30 rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingCertId === item.id ? 'Generating...' : 'Form 16A Certificate'}</span>
                    </button>
                  )}
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-xs font-mono">
                  <div>
                    <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">Gross Payout</span>
                    <span className="font-bold text-[var(--color-text-primary)]">₹{item.grossPayoutAmount.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">TDS Deducted</span>
                    <span className="font-bold text-[var(--color-accent-primary)]">₹{item.tdsDeductedAmount.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">Exemption Threshold</span>
                    <span className="font-bold text-[var(--color-text-secondary)]">₹{item.exemptionThreshold.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-sans text-[var(--color-text-secondary)] block">Form 16A Ref No.</span>
                    <span className="font-bold text-[var(--color-accent-secondary)] truncate block">
                      {item.form16aCertificateNo || 'Pending File'}
                    </span>
                  </div>
                </div>

                {/* Exemption Note if applicable */}
                {item.isBelowThreshold && (
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Gross payout for this period is below the statutory TDS exemption threshold (₹{item.exemptionThreshold.toLocaleString()}). Zero TDS was withheld in accordance with Income Tax rules.
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredStatements.length === 0 && (
            <div className="bg-[var(--color-surface)] rounded-2xl p-12 text-center border border-[var(--color-border)] space-y-3">
              <FileCheck2 className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto" />
              <h3 className="font-bold text-lg text-[var(--color-text-primary)]">No TDS Statements Found</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                No withholding records match your query for {selectedFinYear}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Form 26Q Export Modal */}
      {showForm26QModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
                  Form 26Q Return File
                </h3>
              </div>
              <button 
                onClick={() => setShowForm26QModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Generate the NSDL-formatted Form 26Q text ledger export for AIEC's quarterly TDS return submission to the Income Tax Department (Deductor TAN: <strong>PNEA12345B</strong>).
            </p>

            <div className="bg-[var(--color-bg)] p-3.5 rounded-xl border border-[var(--color-border)] text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span>Return Quarter:</span>
                <span className="font-bold">Q1 FY 2026-27</span>
              </div>
              <div className="flex justify-between">
                <span>Deductees Count:</span>
                <span className="font-bold">34 Partners</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax Deposited:</span>
                <span className="font-bold text-[var(--color-accent-primary)]">₹16,350</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Exported Form26Q_Q1_FY2026.fvu return file for NSDL validator software.');
                setShowForm26QModal(false);
              }}
              className="w-full py-2.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95"
            >
              Download NSDL FVU Text File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
