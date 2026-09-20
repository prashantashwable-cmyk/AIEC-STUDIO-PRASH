import React, { useState } from 'react';
import { 
  Database, Download, HardDrive, RefreshCw, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, FileSpreadsheet, FileCode, FileText, Filter, 
  Lock, ArrowLeft, Play, Sparkles, Layers, History, Server, Check, HelpCircle
} from 'lucide-react';
import { 
  DatabaseBackupRunRecord, 
  DataExportJobRecord, 
  DisasterRestorePointInfo 
} from '../types';
import { 
  initialBackupRuns, 
  initialExportJobs, 
  initialDisasterRestorePoint 
} from '../lib/db';

interface BackupDataExportScreenProps {
  userRole?: string;
  currentLanguage?: 'en' | 'mr' | 'hi';
  currentUserId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const BackupDataExportScreen: React.FC<BackupDataExportScreenProps> = ({
  userRole = 'admin',
  currentLanguage = 'en',
  currentUserId = 'admin_prashant',
  onBack,
  onNavigateTab
}) => {
  // State
  const [backupRuns, setBackupRuns] = useState<DatabaseBackupRunRecord[]>(initialBackupRuns);
  const [exportJobs, setExportJobs] = useState<DataExportJobRecord[]>(initialExportJobs);
  const [restorePointInfo, setRestorePointInfo] = useState<DisasterRestorePointInfo>(initialDisasterRestorePoint);
  
  // Interactive Modal / Form state for new export
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCategory, setExportCategory] = useState<'full_database' | 'accounting_gst' | 'customer_leads' | 'site_qc_inspections'>('accounting_gst');
  const [exportFormat, setExportFormat] = useState<'csv_spreadsheet' | 'json_structured' | 'pdf_archive'>('csv_spreadsheet');
  const [maskPiiData, setMaskPiiData] = useState(true);
  const [dateRange, setDateRange] = useState('q1_2026');
  const [isExportingBg, setIsExportingBg] = useState(false);
  const [isTriggeringSnapshot, setIsTriggeringSnapshot] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Filter & Search
  const [activeHistoryTab, setActiveHistoryTab] = useState<'backups' | 'exports'>('backups');

  // Translations
  const t = {
    en: {
      title: "Database Backup & Data Export Vault",
      subtitle: "Enterprise disaster recovery, disaster restore points, and audit-compliant data dumps",
      restorePointCardTitle: "Disaster Recovery Restore Point",
      lastRestorePoint: "Latest Viable Restore Point",
      rpo: "Recovery Point Objective (RPO)",
      rto: "Recovery Time Objective (RTO)",
      testedOn: "Last Disaster Simulation Test",
      triggerManualBackupBtn: "Trigger Immediate Manual Snapshot",
      backupScheduleConfig: "Automated Schedule",
      backupHistoryTitle: "System Backup Run Ledger",
      exportHistoryTitle: "Data Export & Audit Job Queue",
      createNewExportBtn: "Initiate New Data Export Job",
      backupsTab: "Backup Logs",
      exportsTab: "Export Downloads",
      
      // Export Modal
      modalTitle: "Configure Data Export Job",
      modalSubtitle: "Generate downloadable structured records for accounting (GST/TDS), audit, or offline analysis.",
      categoryLabel: "Data Category",
      formatLabel: "Export File Format",
      piiMaskingLabel: "Enforce Data Minimization & PII Masking",
      piiMaskingDesc: "Mask customer phone numbers and personal addresses for external CA / Auditor compliance",
      rangeLabel: "Select Date Range",
      startExportBtn: "Launch Background Export Task",
      
      statusSuccess: "Completed & Verified",
      statusFailed: "Failed (Auto-Alerted)",
      statusProcessing: "Processing...",
      statusReady: "Ready for Download",
      
      backToMaster: "Back to Settings Master"
    },
    mr: {
      title: "डेटाबेस बॅकअप आणि डेटा एक्सपोर्ट वॉल्ट",
      subtitle: "एंटरप्राइज आपत्ती निवारण, डेटा पुनर्संचयित बिंदू आणि जीएसटी/ऑडिट डेटा फायली",
      restorePointCardTitle: "आपत्ती निवारण रिस्टोर पॉइंट",
      lastRestorePoint: "शेवटचा सुरक्षित रिस्टोर पॉइंट",
      rpo: "रिकव्हरी पॉइंट ऑब्जेक्टिव्ह (RPO)",
      rto: "रिकव्हरी टाइम ऑब्जेक्टिव्ह (RTO)",
      testedOn: "शेवटची आपत्ती चाचणी",
      triggerManualBackupBtn: "त्वरित मॅन्युअल स्नॅपशॉट घ्या",
      backupScheduleConfig: "स्वयंचलित वेळपत्रक",
      backupHistoryTitle: "सिस्टम बॅकअप लॉग नोंदवही",
      exportHistoryTitle: "डेटा एक्सपोर्ट आणि ऑडिट जॉब्स",
      createNewExportBtn: "नवीन डेटा एक्सपोर्ट सुरू करा",
      backupsTab: "बॅकअप लॉग्ज",
      exportsTab: "एक्सपोर्ट डाउनलोड्स",
      
      modalTitle: "डेटा एक्सपोर्ट जॉब कॉन्फिगर करा",
      modalSubtitle: "जीएसटी/टीडीएस, ऑडिट किंवा ऑफलाइन विश्लेषणासाठी डाउनलोड करण्यायोग्य फायली तयार करा.",
      categoryLabel: "डेटा प्रकार",
      formatLabel: "एक्सपोर्ट फॉरमॅट",
      piiMaskingLabel: "डेटा गोपनीयता मास्क लागू करा",
      piiMaskingDesc: "बाहेरील सीए किंवा ऑडिटर्ससाठी वैयक्तिक फोन नंबर व पत्ते मास्क करा",
      rangeLabel: "कालावधी निवडा",
      startExportBtn: "बॅकग्राउंड एक्सपोर्ट टास्क सुरू करा",
      
      statusSuccess: "पूर्ण आणि सत्यापित",
      statusFailed: "अपयशी (अलर्ट पाठवला)",
      statusProcessing: "प्रक्रिया सुरू आहे...",
      statusReady: "डाउनलोडसाठी तयार",
      
      backToMaster: "मुख्य सेटिंग्जवर जा"
    },
    hi: {
      title: "डेटाबेस बैकअप एवं डेटा एक्सपोर्ट वॉल्ट",
      subtitle: "एंटरप्राइज डिजास्टर रिकवरी, रिस्टोर पॉइंट्स और जीएसटी/ऑडिट डेटा एक्सपोर्ट",
      restorePointCardTitle: "डिजास्टर रिकवरी रिस्टोर पॉइंट",
      lastRestorePoint: "नवीनतम सुरक्षित रिस्टोर पॉइंट",
      rpo: "रिकवरी पॉइंट ऑब्जेक्टिव (RPO)",
      rto: "रिकवरी टाइम ऑब्जेक्टिव (RTO)",
      testedOn: "अंतिम आपदा परीक्षण",
      triggerManualBackupBtn: "तुरंत मैनुअल स्नैपशॉट लें",
      backupScheduleConfig: "स्वचालित शेड्यूल",
      backupHistoryTitle: "सिस्टम बैकअप रन लेजर",
      exportHistoryTitle: "डेटा एक्सपोर्ट एवं ऑडिट जॉब क्यू",
      createNewExportBtn: "नया डेटा एक्सपोर्ट शुरू करें",
      backupsTab: "बैकअप लॉग्स",
      exportsTab: "एक्सपोर्ट डाउनलोड्स",
      
      modalTitle: "डेटा एक्सपोर्ट जॉब कॉन्फ़िगर करें",
      modalSubtitle: "जीएसटी/टीडीएस फाइलिंग, ऑडिट या ऑफलाइन विश्लेषण के लिए डाउनलोड योग्य फाइल बनाएं।",
      categoryLabel: "डेटा श्रेणी",
      formatLabel: "एक्सपोर्ट फाइल फॉर्मेट",
      piiMaskingLabel: "डेटा प्राइवेसी PII मास्किंग लागू करें",
      piiMaskingDesc: "बाहरी सीए / ऑडिटर्स के लिए व्यक्तिगत फोन नंबर और पते छिपाएं",
      rangeLabel: "समयावधि चुनें",
      startExportBtn: "बैकग्राउंड एक्सपोर्ट टास्क शुरू करें",
      
      statusSuccess: "सफलतापूर्वक पूर्ण",
      statusFailed: "विफल (ऑटो अलर्ट जारी)",
      statusProcessing: "प्रक्रिया जारी है...",
      statusReady: "डाउनलोड के लिए तैयार",
      
      backToMaster: "मुख्य सेटिंग्स पर लौटें"
    }
  }[currentLanguage] || {
    title: "Database Backup & Data Export Vault",
    subtitle: "Enterprise disaster recovery, disaster restore points, and audit-compliant data dumps",
    restorePointCardTitle: "Disaster Recovery Restore Point",
    lastRestorePoint: "Latest Viable Restore Point",
    rpo: "Recovery Point Objective (RPO)",
    rto: "Recovery Time Objective (RTO)",
    testedOn: "Last Disaster Simulation Test",
    triggerManualBackupBtn: "Trigger Immediate Manual Snapshot",
    backupScheduleConfig: "Automated Schedule",
    backupHistoryTitle: "System Backup Run Ledger",
    exportHistoryTitle: "Data Export & Audit Job Queue",
    createNewExportBtn: "Initiate New Data Export Job",
    backupsTab: "Backup Logs",
    exportsTab: "Export Downloads",
    modalTitle: "Configure Data Export Job",
    modalSubtitle: "Generate downloadable structured records for accounting (GST/TDS), audit, or offline analysis.",
    categoryLabel: "Data Category",
    formatLabel: "Export File Format",
    piiMaskingLabel: "Enforce Data Minimization & PII Masking",
    piiMaskingDesc: "Mask customer phone numbers and personal addresses for external CA / Auditor compliance",
    rangeLabel: "Select Date Range",
    startExportBtn: "Launch Background Export Task",
    statusSuccess: "Completed & Verified",
    statusFailed: "Failed (Auto-Alerted)",
    statusProcessing: "Processing...",
    statusReady: "Ready for Download",
    backToMaster: "Back to Settings Master"
  };

  // Trigger immediate manual snapshot
  const handleTriggerManualSnapshot = () => {
    setIsTriggeringSnapshot(true);
    setTimeout(() => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST';
      const newRun: DatabaseBackupRunRecord = {
        backupRunId: `bk_manual_${Date.now().toString().slice(-6)}`,
        timestamp: nowStr,
        status: 'completed_success',
        backupSizeBytes: '1.43 GB',
        storageLocation: 'Google Cloud Storage (asia-south1 Vault - Manual Snapshot)',
        type: 'manual_snapshot',
        checksumHash: 'a7c93e4810f63b211abdf3108c5820461b21239e85e4901902402120405820a1'
      };
      setBackupRuns([newRun, ...backupRuns]);
      setRestorePointInfo({
        ...restorePointInfo,
        lastRestorePointTimestamp: `${nowStr} (Just Now)`
      });
      setIsTriggeringSnapshot(false);
      setActionSuccessMessage(currentLanguage === 'mr' ? 'नवीन मॅन्युअल स्नॅपशॉट यशस्वीरीत्या घेण्यात आला!' : currentLanguage === 'hi' ? 'नया मैनुअल स्नैपशॉट सफलतापूर्वक लिया गया!' : 'New manual database snapshot captured & verified successfully!');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    }, 1200);
  };

  // Launch background export
  const handleLaunchExport = () => {
    setIsExportingBg(true);
    setTimeout(() => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' IST';
      const newJob: DataExportJobRecord = {
        exportJobId: `exp_job_${Date.now().toString().slice(-4)}`,
        requestedBy: 'Mr. Prashant Vasant Wable (Admin)',
        category: exportCategory,
        format: exportFormat,
        status: 'processing',
        progressPercent: 15,
        fileSizeBytes: 'Calculating...',
        requestedAt: nowStr,
        expiresAt: '7 Days from Now'
      };
      setExportJobs([newJob, ...exportJobs]);
      setIsExportingBg(false);
      setShowExportModal(false);
      setActiveHistoryTab('exports');
      setActionSuccessMessage(currentLanguage === 'mr' ? 'एक्सपोर्ट जॉब पार्श्वभूमीत सुरू करण्यात आला आहे.' : currentLanguage === 'hi' ? 'एक्सपोर्ट जॉब बैकग्राउंड में शुरू कर दिया गया है।' : 'Export job launched in background task queue. Downloading will be available shortly.');
      
      // Simulate progress to ready
      setTimeout(() => {
        setExportJobs(prev => prev.map(j => j.exportJobId === newJob.exportJobId ? {
          ...j,
          status: 'ready_for_download',
          progressPercent: 100,
          fileSizeBytes: '18.4 MB',
          downloadUrl: 'https://aiec-vault.storage.googleapis.com/exports/aiec_export_verified.csv'
        } : j));
      }, 3500);

      setTimeout(() => setActionSuccessMessage(null), 6000);
    }, 800);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'accounting_gst': return 'Accounting, Invoices & GST/TDS Ledger';
      case 'full_database': return 'Full System Database Snapshot (All Collections)';
      case 'customer_leads': return 'Customer Enquiries, Leads & CRM Pipeline';
      case 'site_qc_inspections': return 'Site QC Inspections & Installation Certificates';
      default: return cat;
    }
  };

  const getFormatLabel = (fmt: string) => {
    switch (fmt) {
      case 'csv_spreadsheet': return 'CSV / Excel Spreadsheet';
      case 'json_structured': return 'JSON Structured Object Dump';
      case 'pdf_archive': return 'PDF Document Archive Zip';
      default: return fmt;
    }
  };

  return (
    <div className="min-h-screen pb-24 text-[var(--color-text-primary)] bg-[var(--color-bg)] transition-colors duration-200">
      {/* Top Sticky Header */}
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
                <Database className="w-5 h-5 text-[var(--color-accent-primary)]" />
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
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md hover:opacity-95 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.createNewExportBtn}</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start space-x-3 text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="font-medium">{actionSuccessMessage}</span>
          </div>
        )}

        {/* Disaster Recovery Restore Point & Readiness Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/20 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-[var(--color-accent-primary)]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>DISASTER RECOVERY READY</span>
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                  AES-256 Vault Sync
                </span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {t.restorePointCardTitle}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {t.lastRestorePoint}: <strong className="text-[var(--color-accent-primary)] font-mono">{restorePointInfo.lastRestorePointTimestamp}</strong>. 
                In a total data disaster scenario, all elevator job histories, GST invoices, and QC records can be restored with zero data corruption.
              </p>

              {/* RPO / RTO Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider block">{t.rpo}</span>
                  <span className="font-mono text-base font-bold text-[var(--color-accent-primary)]">{restorePointInfo.rpoMinutes} Mins</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider block">{t.rto}</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">{restorePointInfo.rtoMinutes} Mins</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider block">{t.backupScheduleConfig}</span>
                  <span className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">{restorePointInfo.autoBackupScheduleCron}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider block">{t.testedOn}</span>
                  <span className="font-mono text-xs font-semibold text-emerald-600">{restorePointInfo.lastDrTestDate}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={handleTriggerManualSnapshot}
                disabled={isTriggeringSnapshot}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 hover:bg-[var(--color-accent-primary)]/10 transition-all disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isTriggeringSnapshot ? 'animate-spin' : ''}`} />
                <span>{isTriggeringSnapshot ? 'Capturing Snapshot...' : t.triggerManualBackupBtn}</span>
              </button>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Auto-alert active for silent backup failures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Failed Backup Alert Exception Card (If any failed in history) */}
        {backupRuns.some(b => b.status === 'failed_infrastructure') && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Backup Exception Detected</h4>
                <p className="text-xs opacity-90">
                  {backupRuns.find(b => b.status === 'failed_infrastructure')?.errorMessage}
                </p>
              </div>
            </div>
            <button
              onClick={handleTriggerManualSnapshot}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0"
            >
              Retry Backup Now
            </button>
          </div>
        )}

        {/* Section Tabs: Backup Logs vs Export Downloads */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveHistoryTab('backups')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors ${
                activeHistoryTab === 'backups'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{t.backupsTab} ({backupRuns.length})</span>
            </button>

            <button
              onClick={() => setActiveHistoryTab('exports')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-colors ${
                activeHistoryTab === 'exports'
                  ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{t.exportsTab} ({exportJobs.length})</span>
            </button>
          </div>

          <span className="text-xs text-[var(--color-text-secondary)] font-mono hidden sm:inline">
            Encrypted Storage Vault
          </span>
        </div>

        {/* TAB 1: Backup Runs History */}
        {activeHistoryTab === 'backups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                {t.backupHistoryTitle}
              </h3>
              <span className="text-xs text-[var(--color-text-secondary)]">
                Retained Backups: <strong className="text-[var(--color-text-primary)] font-mono">{restorePointInfo.totalBackupsRetained} Days</strong>
              </span>
            </div>

            <div className="space-y-3">
              {backupRuns.map((run) => (
                <div 
                  key={run.backupRunId}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl mt-0.5 ${
                      run.status === 'completed_success' 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {run.status === 'completed_success' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">
                          {run.backupRunId}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          run.type === 'automated_daily' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                        }`}>
                          {run.type === 'automated_daily' ? 'Auto Daily' : 'Manual Snapshot'}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Location: <span className="font-mono">{run.storageLocation}</span>
                      </p>

                      {run.errorMessage && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          Error: {run.errorMessage}
                        </p>
                      )}

                      <div className="text-[11px] font-mono text-[var(--color-text-secondary)] mt-1.5 flex items-center space-x-2">
                        <span>SHA256: {run.checksumHash.slice(0, 16)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-6 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--color-border)]">
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[var(--color-accent-primary)] block">
                        {run.backupSizeBytes}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{run.timestamp}</span>
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      run.status === 'completed_success'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                      {run.status === 'completed_success' ? t.statusSuccess : t.statusFailed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Export Jobs Queue */}
        {activeHistoryTab === 'exports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                {t.exportHistoryTitle}
              </h3>
              <button
                onClick={() => setShowExportModal(true)}
                className="text-xs text-[var(--color-accent-primary)] font-semibold hover:underline flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>+ New Export</span>
              </button>
            </div>

            <div className="space-y-3">
              {exportJobs.map((job) => (
                <div 
                  key={job.exportJobId}
                  className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                        {job.format === 'csv_spreadsheet' ? <FileSpreadsheet className="w-4 h-4" /> : job.format === 'json_structured' ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--color-text-primary)]">
                          {getCategoryLabel(job.category)}
                        </h4>
                        <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                          Job ID: {job.exportJobId} • Requested by: {job.requestedBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-secondary)]">
                        {getFormatLabel(job.format)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        job.status === 'ready_for_download'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {job.status === 'ready_for_download' ? t.statusReady : t.statusProcessing}
                      </span>
                    </div>
                  </div>

                  {/* Asynchronous Progress Bar if processing */}
                  {job.status === 'processing' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-[var(--color-text-secondary)]">
                        <span>Generating structured archive...</span>
                        <span>{job.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[var(--color-bg)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
                        <div 
                          className="bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] h-full transition-all duration-500"
                          style={{ width: `${job.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Download Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-2.5 gap-2">
                    <div className="flex items-center space-x-3">
                      <span>File Size: <strong className="font-mono text-[var(--color-text-primary)]">{job.fileSizeBytes}</strong></span>
                      <span>Expires: <strong className="font-mono">{job.expiresAt}</strong></span>
                    </div>

                    {job.downloadUrl && job.status === 'ready_for_download' && (
                      <a
                        href={job.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[var(--color-accent-primary)] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow hover:opacity-90 transition-opacity"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Encrypted File</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EXPORT CONFIGURATION MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                  {t.modalTitle}
                </h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {t.modalSubtitle}
            </p>

            <div className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block">
                  {t.categoryLabel}
                </label>
                <select
                  value={exportCategory}
                  onChange={(e) => setExportCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  <option value="accounting_gst">Accounting, Invoices & GST/TDS Ledger (CA Filing)</option>
                  <option value="full_database">Full System Database Snapshot (All Collections)</option>
                  <option value="customer_leads">Customer Enquiries, Leads & CRM Pipeline</option>
                  <option value="site_qc_inspections">Site QC Inspections & Handover Certificates</option>
                </select>
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block">
                  {t.formatLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('csv_spreadsheet')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      exportFormat === 'csv_spreadsheet'
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>CSV / Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('json_structured')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      exportFormat === 'json_structured'
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>JSON Dump</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('pdf_archive')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      exportFormat === 'pdf_archive'
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>PDF Zip</span>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-primary)] block">
                  {t.rangeLabel}
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                >
                  <option value="q1_2026">FY 2025-26 Q1 (Apr - Jun 2026)</option>
                  <option value="q4_2025">FY 2025-26 Q4 (Jan - Mar 2026)</option>
                  <option value="full_fy_2025_26">Full Financial Year 2025-26</option>
                  <option value="all_time">All Time Historical Records</option>
                </select>
              </div>

              {/* PII Masking Toggle */}
              <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-start space-x-3">
                <input 
                  type="checkbox"
                  id="maskPii"
                  checked={maskPiiData}
                  onChange={(e) => setMaskPiiData(e.target.checked)}
                  className="mt-0.5 rounded text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
                />
                <div>
                  <label htmlFor="maskPii" className="text-xs font-semibold text-[var(--color-text-primary)] cursor-pointer block">
                    {t.piiMaskingLabel}
                  </label>
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mt-0.5">
                    {t.piiMaskingDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchExport}
                disabled={isExportingBg}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white text-xs font-semibold flex items-center space-x-1.5 shadow"
              >
                {isExportingBg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{isExportingBg ? 'Initiating...' : t.startExportBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
