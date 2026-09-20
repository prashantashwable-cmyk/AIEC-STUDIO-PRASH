import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, 
  ArrowLeft, Camera, Upload, RefreshCw, FileText, Zap, Flame, 
  Activity, Clock, Lock, Cpu, LockKeyhole, ChevronRight, Award,
  Info, History, Check, AlertOctagon, HelpCircle
} from 'lucide-react';
import { User, QcElectricalSafetyCheckItem, QcElectricalReport, QcElectricalTrialRunData } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1 ${className}`}>
    {children}
  </span>
);

interface QualityChecklistElectricalScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onNavigateToComplianceCert: (jobId: string) => void;
  onNavigateToSnagList: (jobId: string) => void;
}

export const QualityChecklistElectricalScreen: React.FC<QualityChecklistElectricalScreenProps> = ({
  user,
  jobId,
  onBack,
  onNavigateToComplianceCert,
  onNavigateToSnagList
}) => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [items, setItems] = useState<QcElectricalSafetyCheckItem[]>([]);
  const [report, setReport] = useState<QcElectricalReport | null>(null);
  const [job, setJob] = useState<any>(null);
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<QcElectricalSafetyCheckItem | null>(null);

  // Form states for active item inspection
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState<string>('');
  const [failReasonInput, setFailReasonInput] = useState<string>('');
  const [isIntermittent, setIsIntermittent] = useState<boolean>(false);

  // Trial run measurement inputs
  const [trialVoltage, setTrialVoltage] = useState<number>(415);
  const [trialCurrent, setTrialCurrent] = useState<number>(18.2);
  const [trialSpeed, setTrialSpeed] = useState<number>(1.0);
  const [trialArdTime, setTrialArdTime] = useState<number>(24);
  const [trialLeveling, setTrialLeveling] = useState<number>(1.5);
  const [trialVibration, setTrialVibration] = useState<number>(48);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = () => {
    const list = DbManager.getElectricalChecklist(jobId);
    setItems(list);
    const rpt = DbManager.getElectricalReport(jobId);
    setReport(rpt);
    const j = DbManager.getTechnicianJobById(jobId);
    setJob(j);
  };

  const labels = {
    en: {
      title: "Quality Checklist — Electrical & Safety",
      sub: "Government-Aligned BIS/IS Safety & Pre-Commissioning Trial Run Verification",
      hardBlockBanner: "SAFETY HARD-BLOCK ACTIVE: Unresolved safety-critical failure exists. Progression to Compliance Certification & Handover is strictly locked.",
      allPassedBanner: "100% SAFETY CRITICAL PASS: All electrical, governor, ARD & trial run items verified under IS 14665 standards.",
      progressTitle: "Safety Inspection Ascension Rail",
      standardsNote: "Strict Zero-Liability Principle: No soft-pass or exception path permitted for electrical/safety items.",
      noSoftPassNote: "Every safety item requires 100% uncompromising Pass. Any failure requires root cause fix and recorded retest.",
      trialRunTitle: "Continuous Trial Run Parameters (No-Load & 100% Contract Payload)",
      ardTitle: "Automatic Rescue Device (ARD) Emergency Test",
      recordPass: "Verify & Pass",
      recordFail: "Mark Safety Failure (Hard Block)",
      addPhoto: "Capture Field Proof Photo",
      retestHistoryBtn: "View Audit Trail & Retest History",
      issueSnag: "Log Defect in Snag List",
      proceedToCert: "Issue AIEC Compliance Certificate (IS 14665)",
      intermittentWarning: "Intermittent / inconsistent behavior MUST be logged as FAIL under safety protocol.",
      retestNotice: "Full history of previous failures & subsequent retests will be permanently retained in compliance audit record."
    },
    hi: {
      title: "गुणवत्ता चेकलिस्ट — इलेक्ट्रिकल एवं सुरक्षा",
      sub: "सरकारी मानक बीआईएस/आईएस सुरक्षा एवं ट्रायल रन परीक्षण",
      hardBlockBanner: "सुरक्षा हार्ड-ब्लॉक सक्रिय: सुरक्षा विफलता लंबित है। हैंडओवर लॉक है।",
      allPassedBanner: "100% सुरक्षा पास: सभी आईएस 14665 मानकों के तहत सत्यापित।",
      progressTitle: "सुरक्षा निरीक्षण प्रोग्रेस रेल",
      standardsNote: "शून्य-देयता सिद्धांत: इलेक्ट्रिकल/सुरक्षा में कोई छूट/सॉफ्ट-पास की अनुमति नहीं है।",
      noSoftPassNote: "प्रत्येक सुरक्षा आइटम के लिए 100% पास अनिवार्य है।",
      trialRunTitle: "निरंतर ट्रायल रन पैरामीटर",
      ardTitle: "स्वचालित बचाव उपकरण (ARD) परीक्षण",
      recordPass: "सत्यापित करें और पास करें",
      recordFail: "सुरक्षा विफलता चिह्नित करें",
      addPhoto: "फोटो कैप्चर करें",
      retestHistoryBtn: "ऑडिट इतिहास देखें",
      issueSnag: "स्नैग सूची में दोष दर्ज करें",
      proceedToCert: "अनुपालन प्रमाण पत्र जारी करें",
      intermittentWarning: "अनियमित/अस्थिर व्यवहार को विफलता के रूप में लॉग किया जाना चाहिए।",
      retestNotice: "पिछली विफलता और रीटेस्ट का पूर्ण इतिहास सुरक्षित रखा जाएगा।"
    },
    mr: {
      title: "गुणवत्ता तपासणी — इलेक्ट्रिकल व सुरक्षा",
      sub: "शासकीय BIS/IS मानकांनुसार सुरक्षा व चाचणी धाव पडताळणी",
      hardBlockBanner: "सुरक्षा हार्ड-ब्लॉक सक्रिय: गंभीर त्रुटी उपस्थित. हँडओव्हर पूर्णपणे लॉक.",
      allPassedBanner: "100% सुरक्षा यशस्वी: सर्व आयएस 14665 निकष पूर्ण.",
      progressTitle: "सुरक्षा तपासणी प्रगती रेषा",
      standardsNote: "झिरो-लायबिलिटी तत्व: इलेक्ट्रिकल/सुरक्षा मध्ये कोणतीही सूट उपलब्ध नाही.",
      noSoftPassNote: "प्रत्येक सुरक्षेचा घटक १००% योग्य असणे बंधनकारक आहे.",
      trialRunTitle: "सतत चाचणी रन पॅरामीटर्स",
      ardTitle: "ऑटोमॅटिक रेस्क्यू डिव्हाइस (ARD) चाचणी",
      recordPass: "प्रमाणित करा व पास करा",
      recordFail: "सुरक्षा त्रुटी नोंदवा (ब्लॉक)",
      addPhoto: "फोटो घ्या",
      retestHistoryBtn: "ऑडिट इतिहास पहा",
      issueSnag: "स्नॅग यादीमध्ये त्रुटी नोंदवा",
      proceedToCert: "अनुपालन प्रमाणपत्र जारी करा",
      intermittentWarning: "अस्थिर किंवा अधूनमधून येणाऱ्या दोषांना अपयश मानणे अनिवार्य आहे.",
      retestNotice: "मागील अपयश व नंतरच्या रीटेस्टची संपूर्ण नोंद कायमस्वरूपी जतन केली जाईल."
    }
  }[language];

  const passedCount = items.filter(i => i.result === 'passed').length;
  const failedCount = items.filter(i => i.result === 'failed').length;
  const totalCount = items.length;
  const percentComplete = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const hasHardBlock = failedCount > 0 || passedCount < totalCount;

  const handleUpdateItem = (itemKey: QcElectricalSafetyCheckItem['itemKey'], newResult: 'passed' | 'failed') => {
    const existing = items.find(i => i.itemKey === itemKey);
    if (!existing) return;

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const updatedHistory = [...(existing.retestHistory || [])];

    if (existing.result === 'failed' && newResult === 'passed') {
      // Retest passed after a fail
      updatedHistory.push({
        attemptNumber: updatedHistory.length + 1,
        result: 'passed',
        dateAt: `${timestamp} IST`,
        note: `Retest Passed after fix. Note: ${failReasonInput || 'Corrected defect verified.'}`,
        evidenceUrl: evidencePhotoUrl || existing.inspectorEvidenceUrls[0]
      });
    } else if (newResult === 'failed') {
      updatedHistory.push({
        attemptNumber: updatedHistory.length + 1,
        result: 'failed',
        dateAt: `${timestamp} IST`,
        note: `Failed: ${failReasonInput || (isIntermittent ? 'Intermittent behavior detected during trial' : 'Safety standard threshold missed')}`,
        evidenceUrl: evidencePhotoUrl
      });
    } else if (updatedHistory.length === 0) {
      updatedHistory.push({
        attemptNumber: 1,
        result: newResult,
        dateAt: `${timestamp} IST`,
        note: newResult === 'passed' ? 'Initial inspection passed.' : failReasonInput,
        evidenceUrl: evidencePhotoUrl
      });
    }

    const trialData: QcElectricalTrialRunData | undefined = (itemKey === 'no_load_full_load_trial_run' || itemKey === 'ard_simulated_power_failure') ? {
      loadCondition: itemKey === 'no_load_full_load_trial_run' ? 'full_load_100' : 'no_load',
      voltageVolts: trialVoltage,
      currentAmps: trialCurrent,
      speedMps: trialSpeed,
      ardResponseTimeSeconds: trialArdTime,
      levelingAccuracyMm: trialLeveling,
      vibrationDb: trialVibration,
      passed: newResult === 'passed' && trialArdTime <= 30
    } : existing.trialRunData;

    // Strict ARD logic rule: if ARD response time > 30s, force fail
    let finalResult = newResult;
    if (itemKey === 'ard_simulated_power_failure' && trialArdTime > 30) {
      finalResult = 'failed';
    }

    const updatedItem: QcElectricalSafetyCheckItem = {
      ...existing,
      result: finalResult,
      hardBlockActive: finalResult === 'failed',
      failReason: finalResult === 'failed' ? (failReasonInput || (trialArdTime > 30 ? 'ARD rescue time exceeded 30s limit' : 'Safety compliance failure')) : undefined,
      intermittentIssueFlag: isIntermittent,
      inspectorEvidenceUrls: evidencePhotoUrl ? [...existing.inspectorEvidenceUrls, evidencePhotoUrl] : existing.inspectorEvidenceUrls,
      trialRunData: trialData,
      retestHistory: updatedHistory,
      inspectedAt: `${timestamp} IST`
    };

    DbManager.updateElectricalCheckItem(updatedItem);

    // Automatically create a snag in Snag List if failed
    if (finalResult === 'failed') {
      DbManager.saveSnagItem({
        id: `snag_${jobId}_${itemKey}_${Date.now()}`,
        jobId,
        snagCode: `SNAG-SAFETY-${Math.floor(100 + Math.random() * 900)}`,
        title: `Safety Critical Failure: ${existing.title}`,
        description: `Failed item during Electrical & Safety QC: ${existing.bisStandardRef}. Note: ${failReasonInput || 'Requires immediate engineering rework.'}`,
        sourceChecklist: 'electrical_safety',
        sourceChecklistItemKey: itemKey,
        severity: 'safety_critical',
        assignedTechnicianId: job?.leadTechnicianId || 'tech_001',
        assignedTechnicianName: job?.leadTechnicianName || 'Anil Gaikwad',
        resolutionStatus: 'open',
        hardBlockHandoverFlag: true,
        photos: evidencePhotoUrl ? [evidencePhotoUrl] : [],
        createdAt: `${timestamp} IST`
      });
    }

    // Refresh UI & state
    const newItems = DbManager.getElectricalChecklist(jobId);
    setItems(newItems);
    const updatedReport = DbManager.getElectricalReport(jobId);
    setReport(updatedReport);

    setActiveItemKey(null);
    setEvidencePhotoUrl('');
    setFailReasonInput('');
    setIsIntermittent(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 sm:p-6 rounded-2xl border border-gold/15 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="p-2 h-10 w-10 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-antiquegold" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gold/30 text-antiquegold text-xs font-mono">
                Job #{jobId}
              </Badge>
              <Badge className="bg-red-900/20 text-red-700 dark:text-red-300 border-red-500/30 text-xs">
                Zero Liability Safety Checklist
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mt-1">
              {labels.title}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              {labels.sub}
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-xl border border-gold/20 self-start sm:self-auto">
          {(['en', 'hi', 'mr'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                language === lang ? 'bg-antiquegold text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>
      </div>

      {/* Hard Block / All Passed Notification Banner */}
      {failedCount > 0 ? (
        <Card className="p-4 sm:p-5 bg-red-950/20 border-red-500/40 border-l-4 border-l-red-600 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                <span>{labels.hardBlockBanner}</span>
              </h3>
              <p className="text-xs text-red-600/90 dark:text-red-300/80">
                {failedCount} safety-critical item(s) failed. Under AIEC safety policies, no Admin override is permitted until a documented re-test passes.
              </p>
            </div>
          </div>
        </Card>
      ) : percentComplete === 100 ? (
        <Card className="p-4 sm:p-5 bg-emerald-950/20 border-emerald-500/40 border-l-4 border-l-emerald-600 rounded-2xl">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {labels.allPassedBanner}
              </h3>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
                Full electrical, ARD, governor, and continuous trial-run tests passed without exceptions. You can now issue the formal AIEC Compliance Certificate.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Progress & Ascension Line Card */}
      <Card className="p-5 sm:p-6 bg-surface border-gold/20 shadow-sm rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-antiquegold font-semibold">
              {labels.progressTitle}
            </span>
            <h2 className="text-lg font-serif font-bold text-text-primary mt-0.5">
              Safety Verification Scorecard ({passedCount}/{totalCount} Passed)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-antiquegold">{percentComplete}%</div>
              <div className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Verified</div>
            </div>
          </div>
        </div>

        {/* Progress Rail Bar */}
        <div className="w-full bg-surface-hover h-3 rounded-full overflow-hidden border border-gold/15 p-0.5 relative">
          <div 
            className="bg-gradient-to-r from-antiquegold to-royalemerald h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <div className="mt-4 pt-3 border-t border-gold/10 flex flex-wrap items-center justify-between text-xs text-text-secondary gap-2">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            {labels.standardsNote}
          </span>
          <span className="font-mono text-antiquegold">
            {failedCount > 0 ? `${failedCount} Hard Block(s)` : '0 Hard Blocks'}
          </span>
        </div>
      </Card>

      {/* Checklist Items Accordion / Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-secondary flex items-center gap-2">
            <Zap className="w-4 h-4 text-antiquegold" />
            Mandatory Electrical & Safety Test Items (IS 14665 / IS 15259)
          </h3>
          <span className="text-xs font-mono text-antiquegold">
            {labels.noSoftPassNote}
          </span>
        </div>

        {items.map((item, idx) => {
          const isPassed = item.result === 'passed';
          const isFailed = item.result === 'failed';
          const isExpanded = activeItemKey === item.itemKey;
          const hasRetests = item.retestHistory && item.retestHistory.length > 0;

          return (
            <Card 
              key={item.id} 
              className={`p-4 sm:p-5 transition-all rounded-2xl border ${
                isFailed 
                  ? 'bg-red-950/10 border-red-500/40 shadow-sm' 
                  : isPassed 
                    ? 'bg-surface border-emerald-500/30' 
                    : 'bg-surface border-gold/20 hover:border-gold/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Ascension Line step circle icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                    isPassed 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : isFailed 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-surface-hover text-antiquegold border border-gold/30'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4" /> : isFailed ? <XCircle className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-gold/30 text-antiquegold text-[10px] font-mono">
                        {item.category}
                      </Badge>
                      <span className="text-[11px] font-mono text-text-secondary">
                        {item.bisStandardRef}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                      {item.title}
                    </h4>

                    {/* Result Badge & Inspector Info */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {isPassed ? (
                        <Badge className="bg-emerald-700/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          VERIFIED PASS
                        </Badge>
                      ) : isFailed ? (
                        <Badge className="bg-red-700/20 text-red-700 dark:text-red-300 border-red-500/30 text-xs flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          SAFETY FAIL — HARD BLOCK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs">
                          PENDING INSPECTION
                        </Badge>
                      )}

                      {hasRetests && (
                        <button
                          onClick={() => setShowHistoryModal(item)}
                          className="text-[11px] font-mono text-antiquegold hover:underline flex items-center gap-1 bg-antiquegold/10 px-2 py-0.5 rounded-md"
                        >
                          <History className="w-3 h-3" />
                          {item.retestHistory.length} Record(s) in History
                        </button>
                      )}
                    </div>

                    {isFailed && item.failReason && (
                      <div className="mt-2 text-xs text-red-700 dark:text-red-300 bg-red-900/20 p-2.5 rounded-xl border border-red-500/30 font-mono">
                        <strong>Fail Cause:</strong> {item.failReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspect Toggle Button */}
                <Button
                  variant={isExpanded ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveItemKey(isExpanded ? null : item.itemKey)}
                  className="shrink-0 border-gold/30 hover:border-gold/60 text-xs font-mono"
                >
                  {isExpanded ? 'Close' : 'Perform Test'}
                </Button>
              </div>

              {/* Inspection Action Form Drawer */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gold/15 space-y-4 bg-surface-hover/50 p-4 rounded-xl">
                  {/* ARD & Trial Run Measurements Form if applicable */}
                  {(item.itemKey === 'ard_simulated_power_failure' || item.itemKey === 'no_load_full_load_trial_run') && (
                    <div className="space-y-3 bg-surface p-3.5 rounded-xl border border-gold/20">
                      <h5 className="text-xs font-bold text-antiquegold uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-royalemerald" />
                        {item.itemKey === 'ard_simulated_power_failure' ? labels.ardTitle : labels.trialRunTitle}
                      </h5>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-text-secondary font-mono">Supply Voltage (V)</label>
                          <input
                            type="number"
                            value={trialVoltage}
                            onChange={e => setTrialVoltage(Number(e.target.value))}
                            className="w-full bg-surface border border-gold/30 rounded-lg p-2 font-mono text-text-primary text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-text-secondary font-mono">Current Draw (A)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={trialCurrent}
                            onChange={e => setTrialCurrent(Number(e.target.value))}
                            className="w-full bg-surface border border-gold/30 rounded-lg p-2 font-mono text-text-primary text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-text-secondary font-mono">Contract Speed (m/s)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={trialSpeed}
                            onChange={e => setTrialSpeed(Number(e.target.value))}
                            className="w-full bg-surface border border-gold/30 rounded-lg p-2 font-mono text-text-primary text-xs mt-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-text-secondary font-mono">ARD Rescue Time (Sec)</label>
                          <input
                            type="number"
                            value={trialArdTime}
                            onChange={e => setTrialArdTime(Number(e.target.value))}
                            className={`w-full bg-surface border rounded-lg p-2 font-mono text-xs mt-0.5 ${
                              trialArdTime > 30 ? 'border-red-500 text-red-600 font-bold' : 'border-gold/30 text-text-primary'
                            }`}
                          />
                          {trialArdTime > 30 && (
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-mono block mt-0.5">
                              Exceeds 30s limit! Auto-fails test.
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] text-text-secondary font-mono">Floor Leveling (mm)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={trialLeveling}
                            onChange={e => setTrialLeveling(Number(e.target.value))}
                            className="w-full bg-surface border border-gold/30 rounded-lg p-2 font-mono text-text-primary text-xs mt-0.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-text-secondary font-mono">In-Cabin Noise (dB)</label>
                          <input
                            type="number"
                            value={trialVibration}
                            onChange={e => setTrialVibration(Number(e.target.value))}
                            className="w-full bg-surface border border-gold/30 rounded-lg p-2 font-mono text-text-primary text-xs mt-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Field Proof Photo Capture */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1 font-mono">
                      {labels.addPhoto}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste or upload inspection evidence photo URL..."
                        value={evidencePhotoUrl}
                        onChange={e => setEvidencePhotoUrl(e.target.value)}
                        className="flex-1 bg-surface border border-gold/30 rounded-xl p-2.5 text-xs font-mono text-text-primary"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEvidencePhotoUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80')}
                        className="border-gold/30 text-xs font-mono shrink-0"
                      >
                        <Camera className="w-3.5 h-3.5 mr-1 text-antiquegold" />
                        Sample Photo
                      </Button>
                    </div>
                  </div>

                  {/* Intermittent issue checkbox */}
                  <div className="flex items-center gap-2 p-2.5 bg-amber-950/10 border border-amber-500/20 rounded-xl">
                    <input
                      type="checkbox"
                      id={`intermittent_${item.itemKey}`}
                      checked={isIntermittent}
                      onChange={e => setIsIntermittent(e.target.checked)}
                      className="rounded border-gold/40 text-antiquegold focus:ring-antiquegold"
                    />
                    <label htmlFor={`intermittent_${item.itemKey}`} className="text-xs text-amber-800 dark:text-amber-300 font-medium cursor-pointer">
                      {labels.intermittentWarning}
                    </label>
                  </div>

                  {/* Failure reason notes if marking fail */}
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1 font-mono">
                      Inspection Notes / Failure Cause (if applicable)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify measured values, tripped breakers, or root cause details..."
                      value={failReasonInput}
                      onChange={e => setFailReasonInput(e.target.value)}
                      className="w-full bg-surface border border-gold/30 rounded-xl p-2.5 text-xs text-text-primary"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      type="button"
                      onClick={() => handleUpdateItem(item.itemKey, 'passed')}
                      disabled={trialArdTime > 30}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl py-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {labels.recordPass}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleUpdateItem(item.itemKey, 'failed')}
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white text-xs font-medium rounded-xl py-2.5"
                    >
                      <ShieldAlert className="w-4 h-4 mr-1.5" />
                      {labels.recordFail}
                    </Button>
                  </div>

                  <p className="text-[10px] text-text-secondary italic font-mono text-center">
                    {labels.retestNotice}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Retest History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 bg-surface border-gold/30 rounded-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3">
              <div>
                <Badge variant="outline" className="text-xs text-antiquegold border-gold/30">
                  Permanent Audit History
                </Badge>
                <h3 className="text-base font-bold font-serif text-text-primary mt-1">
                  {showHistoryModal.title}
                </h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowHistoryModal(null)}>
                ✕
              </Button>
            </div>

            <p className="text-xs text-text-secondary">
              AIEC compliance policy mandates retaining all initial failure events alongside passing re-tests to preserve a transparent, honest safety audit record.
            </p>

            <div className="space-y-3">
              {showHistoryModal.retestHistory.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl border border-gold/20 bg-surface-hover text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-text-primary">Attempt #{rec.attemptNumber}</span>
                    <Badge className={rec.result === 'passed' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}>
                      {rec.result.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-text-secondary text-[11px] font-mono">{rec.dateAt}</div>
                  {rec.note && <p className="text-text-primary mt-1">{rec.note}</p>}
                </div>
              ))}
            </div>

            <Button onClick={() => setShowHistoryModal(null)} className="w-full bg-antiquegold text-white text-xs py-2 rounded-xl">
              Close Audit Record
            </Button>
          </Card>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-gold/20 shadow-lg z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-text-secondary font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-antiquegold" />
            <span>
              {failedCount > 0 
                ? `${failedCount} Safety Hard Block(s) Active` 
                : `${passedCount}/${totalCount} Verified Safe`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onNavigateToSnagList(jobId)}
              className="flex-1 sm:flex-initial border-gold/30 text-xs font-mono text-text-primary"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-antiquegold" />
              {labels.issueSnag}
            </Button>

            <Button
              disabled={hasHardBlock}
              onClick={() => onNavigateToComplianceCert(jobId)}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-antiquegold to-royalemerald text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              {labels.proceedToCert}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
