import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, QcMechanicalCheckItem, QcMechanicalReport, TechnicianJob, InstallationEvidenceItem 
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import { 
  CheckCircle2, AlertTriangle, Camera, Upload, Eye, FileText, ChevronLeft, 
  ShieldCheck, Wrench, RefreshCw, AlertCircle, Sparkles, Check, X, Info, 
  ArrowRight, ShieldAlert, Award, FileSpreadsheet, Lock, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../lib/language';

interface QualityChecklistMechanicalScreenProps {
  user: User;
  jobId?: string;
  onBack?: () => void;
  onNavigateToRework?: (jobId: string, itemKey: string) => void;
  onNavigateToElectricalQc?: (jobId: string) => void;
}

export const QualityChecklistMechanicalScreen: React.FC<QualityChecklistMechanicalScreenProps> = ({
  user,
  jobId = 'job_2026_101',
  onBack,
  onNavigateToRework,
  onNavigateToElectricalQc
}) => {
  const { t } = useLanguage();
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId);
  const [activeJob, setActiveJob] = useState<TechnicianJob | undefined>(undefined);
  const [items, setItems] = useState<QcMechanicalCheckItem[]>([]);
  const [report, setReport] = useState<QcMechanicalReport | undefined>(undefined);

  // Active modal or detail view for comparison / evidence capture
  const [selectedItemForCompare, setSelectedItemForCompare] = useState<QcMechanicalCheckItem | null>(null);
  const [exceptionModalItem, setExceptionModalItem] = useState<QcMechanicalCheckItem | null>(null);
  const [exceptionNoteInput, setExceptionNoteInput] = useState<string>('');
  
  // Evidence upload simulation
  const [evidenceCapturingKey, setEvidenceCapturingKey] = useState<string | null>(null);
  const [showSignOffModal, setShowSignOffModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    const job = DbManager.getTechnicianJobById(selectedJobId);
    if (job) {
      setActiveJob(job);
      const list = DbManager.getMechanicalChecklist(job.id);
      setItems(list);
      const rep = DbManager.getMechanicalReport(job.id);
      setReport(rep);
    }
  }, [selectedJobId]);

  // Show transient toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Item result handler
  const handleItemResultChange = (
    itemKey: string, 
    newResult: 'passed' | 'failed' | 'pass_with_exception' | 'pending',
    note?: string
  ) => {
    const updated = items.map(item => {
      if (item.itemKey === itemKey) {
        return {
          ...item,
          result: newResult,
          exceptionNotes: note ? note : item.exceptionNotes,
          inspectedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
        };
      }
      return item;
    });

    setItems(updated);
    
    // Persist to DB
    const itemToSave = updated.find(i => i.itemKey === itemKey);
    if (itemToSave) {
      DbManager.updateMechanicalCheckItem(itemToSave);
    }

    if (report) {
      const updatedReport: QcMechanicalReport = {
        ...report,
        items: updated,
        passedCount: updated.filter(i => i.result === 'passed').length,
        exceptionsCount: updated.filter(i => i.result === 'pass_with_exception').length,
        failedCount: updated.filter(i => i.result === 'failed').length,
        overallStatus: updated.some(i => i.result === 'failed') ? 'failed_rework_needed' : 
                       updated.every(i => i.result === 'passed' || i.result === 'pass_with_exception') ? 'passed' : 'pending'
      };
      setReport(updatedReport);
      DbManager.saveMechanicalReport(updatedReport);
    }

    triggerToast(`Item status updated to ${newResult.toUpperCase()}`);
  };

  // Attach evidence
  const handleAttachEvidence = (itemKey: string) => {
    setEvidenceCapturingKey(itemKey);
    setTimeout(() => {
      const sampleMedia = [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
      ];
      const randomMedia = sampleMedia[Math.floor(Math.random() * sampleMedia.length)];

      const updated = items.map(item => {
        if (item.itemKey === itemKey) {
          return {
            ...item,
            inspectorEvidenceUrls: [...item.inspectorEvidenceUrls, randomMedia]
          };
        }
        return item;
      });

      setItems(updated);
      const itemToSave = updated.find(i => i.itemKey === itemKey);
      if (itemToSave) DbManager.updateMechanicalCheckItem(itemToSave);

      setEvidenceCapturingKey(null);
      triggerToast('Inspection photo evidence captured & linked!');
    }, 1200);
  };

  // Completion & Progress calculations
  const totalCount = items.length;
  const passedCount = items.filter(i => i.result === 'passed').length;
  const exceptionCount = items.filter(i => i.result === 'pass_with_exception').length;
  const failedCount = items.filter(i => i.result === 'failed').length;
  const completedCount = passedCount + exceptionCount + failedCount;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  const isSignOffEligible = completedCount === totalCount && failedCount === 0;

  return (
    <div className="min-h-screen bg-alabaster pb-28 text-charcoal">
      {/* Top Header */}
      <div className="bg-white border-b border-[rgba(184,135,61,0.2)] sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-alabaster transition-colors border border-[rgba(184,135,61,0.15)] text-charcoal"
              >
                <ChevronLeft className="w-5 h-5 text-antiquegold" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-royalemerald" />
                <h1 className="font-serif text-lg font-bold text-charcoal">Quality Checklist — Mechanical</h1>
              </div>
              <p className="text-xs text-warmgray">Module 14 • Field Inspection • Government Standard Trial Run</p>
            </div>
          </div>

          {toastMessage && (
            <span className="text-xs bg-royalemerald/10 text-royalemerald px-2.5 py-1 rounded-full font-medium animate-pulse">
              {toastMessage}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-5">
        {/* Job Header & Progress Card */}
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-warmgray">Inspecting Job ID: {selectedJobId}</span>
              <h2 className="font-serif text-base font-bold text-charcoal mt-0.5">
                {activeJob?.elevatorSpec.buildingName || 'Kothrud Commercial Tower Elevator'}
              </h2>
              <p className="text-xs text-warmgray">
                {activeJob?.elevatorSpec.driveType.toUpperCase()} Elevator • {activeJob?.elevatorSpec.floorsCount} Stops • {activeJob?.elevatorSpec.capacityKg}kg
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20">
                QC Progress: {progressPercent}%
              </span>
            </div>
          </div>

          {/* Ascension Line Motif Progress Rail */}
          <div className="relative pt-2">
            <div className="flex justify-between text-[11px] font-semibold text-warmgray mb-1">
              <span>Mechanical Alignment SOP</span>
              <span>{completedCount} / {totalCount} Items Inspected</span>
            </div>
            <div className="h-2 w-full bg-alabaster rounded-full overflow-hidden border border-[rgba(184,135,61,0.2)]">
              <div 
                className="h-full bg-gradient-to-r from-antiquegold to-royalemerald transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Key KPI Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 bg-royalemerald/5 border border-royalemerald/15 rounded-xl">
              <p className="text-warmgray text-[10px]">Passes</p>
              <p className="font-bold text-royalemerald font-mono text-sm">{passedCount}</p>
            </div>
            <div className="p-2 bg-antiquegold/10 border border-antiquegold/20 rounded-xl">
              <p className="text-warmgray text-[10px]">Exceptions</p>
              <p className="font-bold text-antiquegold font-mono text-sm">{exceptionCount}</p>
            </div>
            <div className={`p-2 rounded-xl border ${failedCount > 0 ? 'bg-error/10 border-error/20' : 'bg-alabaster border-[rgba(184,135,61,0.15)]'}`}>
              <p className="text-warmgray text-[10px]">Fails (Rework)</p>
              <p className={`font-bold font-mono text-sm ${failedCount > 0 ? 'text-error' : 'text-charcoal'}`}>{failedCount}</p>
            </div>
          </div>
        </Card>

        {/* Section: Mechanical Inspection Items Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-sm font-bold text-charcoal">Mechanical Quality Check Items</h3>
            <span className="text-xs text-warmgray">Aligned with IS 14665 Standard</span>
          </div>

          {items.map((item, index) => {
            const isPassed = item.result === 'passed';
            const isFailed = item.result === 'failed';
            const isException = item.result === 'pass_with_exception';
            const isPending = item.result === 'pending';

            return (
              <Card 
                key={item.id}
                className={`p-4 space-y-3.5 transition-all border ${
                  isPassed ? 'border-royalemerald/30 bg-white' :
                  isFailed ? 'border-error/40 bg-error/5' :
                  isException ? 'border-antiquegold/40 bg-antiquegold/5' :
                  'border-[rgba(184,135,61,0.15)] bg-white'
                }`}
              >
                {/* Item Top Title & Badge */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-alabaster border border-[rgba(184,135,61,0.3)] flex items-center justify-center font-mono text-xs font-bold text-charcoal shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-charcoal leading-snug">{item.title}</h4>
                      <span className="inline-block text-[10px] font-semibold text-antiquegold bg-antiquegold/10 px-2 py-0.5 rounded mt-1">
                        Category: {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    isPassed ? 'bg-royalemerald/15 text-royalemerald border border-royalemerald/30' :
                    isFailed ? 'bg-error/15 text-error border border-error/30' :
                    isException ? 'bg-antiquegold/15 text-antiquegold border border-antiquegold/30' :
                    'bg-warmgray/10 text-warmgray border border-warmgray/20'
                  }`}>
                    {isPassed ? 'Passed' : isFailed ? 'Failed (Rework)' : isException ? 'Pass w/ Exception' : 'Pending Check'}
                  </span>
                </div>

                {/* Concrete Standard Reference Box */}
                <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-charcoal">
                    <ShieldCheck className="w-4 h-4 text-royalemerald" />
                    <span>Reference Standard & Tolerance</span>
                  </div>
                  <p className="text-warmgray leading-relaxed font-mono text-[11px]">
                    {item.toleranceStandard}
                  </p>
                </div>

                {/* Evidence Comparison Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[rgba(184,135,61,0.1)] text-xs">
                  {/* Compare Button */}
                  <button
                    onClick={() => setSelectedItemForCompare(item)}
                    className="flex items-center gap-1.5 text-antiquegold font-medium hover:underline text-xs bg-antiquegold/5 px-2.5 py-1 rounded-lg border border-antiquegold/20"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Compare Install Evidence</span>
                  </button>

                  {/* Inspector Evidence Capture */}
                  <div className="flex items-center gap-2">
                    {item.inspectorEvidenceUrls.length > 0 ? (
                      <span className="text-royalemerald font-medium flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {item.inspectorEvidenceUrls.length} Photo Linked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAttachEvidence(item.itemKey)}
                        disabled={evidenceCapturingKey === item.itemKey}
                        className="flex items-center gap-1 text-xs bg-alabaster border border-[rgba(184,135,61,0.25)] hover:border-antiquegold text-charcoal px-2.5 py-1 rounded-lg font-medium"
                      >
                        <Camera className="w-3.5 h-3.5 text-antiquegold" />
                        <span>{evidenceCapturingKey === item.itemKey ? 'Capturing...' : 'Capture Photo'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Exception Notes display */}
                {isException && item.exceptionNotes && (
                  <div className="p-2.5 bg-antiquegold/10 border border-antiquegold/25 rounded-lg text-xs text-charcoal space-y-0.5">
                    <span className="font-bold text-antiquegold">Documented Exception Note:</span>
                    <p className="text-warmgray italic">"{item.exceptionNotes}"</p>
                  </div>
                )}

                {/* Pass / Fail / Exception Control Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => handleItemResultChange(item.itemKey, 'passed')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isPassed 
                        ? 'bg-royalemerald text-white shadow-sm ring-2 ring-royalemerald/30' 
                        : 'bg-royalemerald/10 text-royalemerald hover:bg-royalemerald/20 border border-royalemerald/20'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Pass
                  </button>

                  <button
                    onClick={() => {
                      setExceptionModalItem(item);
                      setExceptionNoteInput(item.exceptionNotes || '');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      isException 
                        ? 'bg-antiquegold text-white shadow-sm ring-2 ring-antiquegold/30' 
                        : 'bg-antiquegold/10 text-antiquegold hover:bg-antiquegold/20 border border-antiquegold/20'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" /> Pass w/ Note
                  </button>

                  <button
                    onClick={() => {
                      handleItemResultChange(item.itemKey, 'failed');
                      if (onNavigateToRework) {
                        onNavigateToRework(activeJob?.id || 'job_2026_101', item.itemKey);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isFailed 
                        ? 'bg-error text-white shadow-sm ring-2 ring-error/30' 
                        : 'bg-error/10 text-error hover:bg-error/20 border border-error/20'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" /> Fail (Rework)
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgba(184,135,61,0.2)] p-4 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-charcoal">
              Mechanical Sign-off Status
            </p>
            <p className="text-[11px] text-warmgray">
              {failedCount > 0 ? `${failedCount} Item(s) require rework before sign-off` : `${passedCount + exceptionCount} / ${totalCount} Items Approved`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToElectricalQc && (
              <Button
                variant="secondary"
                onClick={() => onNavigateToElectricalQc(activeJob?.id || 'job_2026_101')}
                className="text-xs px-3 py-2.5"
              >
                Go to Electrical QC
              </Button>
            )}

            <Button
              variant="primary"
              disabled={!isSignOffEligible}
              onClick={() => setShowSignOffModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 font-bold text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign Off Mechanical Quality
            </Button>
          </div>
        </div>
      </div>

      {/* Evidence Comparison Modal */}
      <AnimatePresence>
        {selectedItemForCompare && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 border border-antiquegold shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[rgba(184,135,61,0.15)] pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-antiquegold" />
                  <h3 className="font-serif text-sm font-bold text-charcoal">Installation Evidence Cross-Check</h3>
                </div>
                <button
                  onClick={() => setSelectedItemForCompare(null)}
                  className="p-1 rounded-lg hover:bg-alabaster text-warmgray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-charcoal">{selectedItemForCompare.title}</span>
                  <p className="text-warmgray mt-0.5">{selectedItemForCompare.toleranceStandard}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Original Install Evidence */}
                  <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-2">
                    <span className="font-bold text-antiquegold block">Install Time Reference Photo</span>
                    {selectedItemForCompare.installEvidenceRefUrl ? (
                      <img
                        src={selectedItemForCompare.installEvidenceRefUrl}
                        alt="Install Ref"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <p className="text-warmgray italic">No photo attached during original installation step.</p>
                    )}
                  </div>

                  {/* Inspector Captured Photo */}
                  <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-2">
                    <span className="font-bold text-royalemerald block">QC Inspector Live Verification</span>
                    {selectedItemForCompare.inspectorEvidenceUrls.length > 0 ? (
                      <img
                        src={selectedItemForCompare.inspectorEvidenceUrls[0]}
                        alt="QC Live"
                        className="w-full h-32 object-cover rounded-lg border border-royalemerald/30"
                      />
                    ) : (
                      <div className="h-32 bg-white rounded-lg border border-dashed flex flex-col items-center justify-center text-warmgray p-2 text-center">
                        <Camera className="w-6 h-6 mb-1 text-warmgray" />
                        <span>No live inspection photo taken yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => setSelectedItemForCompare(null)}
                className="w-full text-xs"
              >
                Close Comparison
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exception Note Entry Modal */}
      <AnimatePresence>
        {exceptionModalItem && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-antiquegold shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[rgba(184,135,61,0.15)] pb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-antiquegold" />
                  <h3 className="font-serif text-sm font-bold text-charcoal">Document Exception / Minor Imperfection</h3>
                </div>
                <button
                  onClick={() => setExceptionModalItem(null)}
                  className="p-1 rounded-lg hover:bg-alabaster text-warmgray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-warmgray leading-relaxed">
                  For minor cosmetic-adjacent issues (e.g. slightly noisy door operator or non-critical cosmetic scuff), enter a clear note for Admin review before marking as "Pass with Exception".
                </p>

                <textarea
                  rows={3}
                  placeholder="Enter exception note (e.g. Landing door operator motor has slight acoustic hum; functionally locks and operates smoothly)."
                  value={exceptionNoteInput}
                  onChange={(e) => setExceptionNoteInput(e.target.value)}
                  className="w-full bg-alabaster border border-[rgba(184,135,61,0.3)] rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setExceptionModalItem(null)}
                  className="w-1/2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleItemResultChange(exceptionModalItem.itemKey, 'pass_with_exception', exceptionNoteInput);
                    setExceptionModalItem(null);
                  }}
                  className="w-1/2 text-xs"
                >
                  Confirm Exception
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Off Confirmation Modal */}
      <AnimatePresence>
        {showSignOffModal && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-antiquegold shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-royalemerald/10 border border-royalemerald/20 rounded-full flex items-center justify-center mx-auto text-royalemerald">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-charcoal">Mechanical Quality Sign-off Approved!</h3>
                <p className="text-xs text-warmgray">
                  Mechanical quality checklist verified. Formal audit certificate logged to permanent job history.
                </p>
              </div>

              <div className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-warmgray">Audited Items:</span>
                  <span className="font-bold text-charcoal">{totalCount} Total</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">Passed Items:</span>
                  <span className="font-bold text-royalemerald">{passedCount} Passed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warmgray">Passed w/ Exceptions:</span>
                  <span className="font-bold text-antiquegold">{exceptionCount} Noted</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {onNavigateToElectricalQc && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowSignOffModal(false);
                      onNavigateToElectricalQc(activeJob?.id || 'job_2026_101');
                    }}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Proceed to Electrical & Safety QC Checklist
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setShowSignOffModal(false)}
                  className="w-full text-xs"
                >
                  Close & View Summary
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
