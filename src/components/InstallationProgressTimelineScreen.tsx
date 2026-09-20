import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, TechnicianJob, InstallationSopStep, InstallationEvidenceItem } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import { 
  CheckCircle2, Clock, Calendar, Building, MapPin, ChevronLeft, 
  ShieldCheck, Wrench, Eye, Camera, ChevronRight, User as UserIcon, Sparkles
} from 'lucide-react';
import { useLanguage } from '../lib/language';

interface InstallationProgressTimelineScreenProps {
  user: User;
  jobId?: string;
  onBack?: () => void;
  onNavigateToSop?: (jobId: string) => void;
  onNavigateToQcAssignment?: (jobId: string) => void;
}

export const InstallationProgressTimelineScreen: React.FC<InstallationProgressTimelineScreenProps> = ({
  user,
  jobId = 'job_2026_101',
  onBack,
  onNavigateToSop,
  onNavigateToQcAssignment
}) => {
  const { t } = useLanguage();
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId);
  const [activeJob, setActiveJob] = useState<TechnicianJob | undefined>(undefined);
  const [sopSteps, setSopSteps] = useState<InstallationSopStep[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<InstallationEvidenceItem[]>([]);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    const job = DbManager.getTechnicianJobById(selectedJobId);
    if (job) {
      setActiveJob(job);
      const steps = DbManager.getInstallationSopSteps(job.id);
      setSopSteps(steps);
      const ev = DbManager.getInstallationEvidenceByJob(job.id);
      setEvidenceItems(ev);
    }
  }, [selectedJobId]);

  const phases = [
    { name: 'Site & Shaft Prep', weight: 15 },
    { name: 'Guide Rails & Brackets', weight: 25 },
    { name: 'Car Frame & Cabin', weight: 20 },
    { name: 'Wiring & Control Panel', weight: 20 },
    { name: 'Safety Devices (Governor/Buffers/ARD)', weight: 10 },
    { name: 'Final Adjustment & Testing', weight: 10 }
  ];

  const totalSteps = sopSteps.length;
  const completedSteps = sopSteps.filter(s => s.status === 'completed' || s.status === 'na_confirmed').length;
  const overallPercent = Math.round((completedSteps / (totalSteps || 1)) * 100);

  return (
    <div className="min-h-screen bg-alabaster pb-24 text-charcoal">
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
                <Clock className="w-5 h-5 text-royalemerald" />
                <h1 className="font-serif text-lg font-bold text-charcoal">Installation Progress Timeline</h1>
              </div>
              <p className="text-xs text-warmgray">Real-time Stage Milestone & Evidence Tracking</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-royalemerald bg-royalemerald/10 px-2.5 py-1 rounded-full border border-royalemerald/20">
            {overallPercent}% Complete
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-5">
        {/* Job Overview Card */}
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-warmgray">Job #{selectedJobId}</span>
              <h2 className="font-serif text-base font-bold text-charcoal mt-0.5">
                {activeJob?.elevatorSpec.buildingName || 'Kothrud Commercial Tower'}
              </h2>
              <p className="text-xs text-warmgray">
                {activeJob?.elevatorSpec.driveType.toUpperCase()} Elevator • {activeJob?.elevatorSpec.floorsCount} Floors • {activeJob?.elevatorSpec.capacityKg}kg
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-antiquegold/10 text-antiquegold font-bold border border-antiquegold/20">
              {activeJob?.status.toUpperCase()}
            </span>
          </div>

          {/* Overall Progress Rail */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-warmgray">
              <span>Overall Installation Milestone</span>
              <span className="font-mono font-bold text-royalemerald">{completedSteps} / {totalSteps} SOP Tasks Done</span>
            </div>
            <div className="h-2 w-full bg-alabaster rounded-full overflow-hidden border border-[rgba(184,135,61,0.2)]">
              <div 
                className="h-full bg-gradient-to-r from-antiquegold to-royalemerald transition-all duration-500 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Ascension Line Milestone Timeline */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(184,135,61,0.15)] pb-3">
            <h3 className="font-serif text-sm font-bold text-charcoal">Ascension Line Milestone Phases</h3>
            <span className="text-xs text-warmgray">Lead Tech: Ramesh Patil</span>
          </div>

          <div className="relative pl-6 space-y-6">
            {/* The Vertical Gold Ascension Rail */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-antiquegold via-royalemerald to-[rgba(184,135,61,0.2)]" />

            {phases.map((phase, idx) => {
              const phaseSteps = sopSteps.filter(s => s.phase === phase.name);
              const phaseDoneCount = phaseSteps.filter(s => s.status === 'completed' || s.status === 'na_confirmed').length;
              const isPhaseComplete = phaseSteps.length > 0 && phaseDoneCount === phaseSteps.length;
              const isPhaseInProgress = phaseDoneCount > 0 && phaseDoneCount < phaseSteps.length;

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Rail Node Marker */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isPhaseComplete ? 'bg-royalemerald border-royalemerald text-white' :
                    isPhaseInProgress ? 'bg-antiquegold border-antiquegold text-white animate-pulse' :
                    'bg-white border-[rgba(184,135,61,0.3)] text-warmgray'
                  }`}>
                    {isPhaseComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Phase Details Card */}
                  <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.15)] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif text-sm font-bold text-charcoal">{phase.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isPhaseComplete ? 'bg-royalemerald/10 text-royalemerald' :
                        isPhaseInProgress ? 'bg-antiquegold/10 text-antiquegold' :
                        'bg-warmgray/10 text-warmgray'
                      }`}>
                        {isPhaseComplete ? 'Completed' : isPhaseInProgress ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>

                    <p className="text-xs text-warmgray">
                      Phase Weight: {phase.weight}% • Tasks Verified: {phaseDoneCount} / {phaseSteps.length || 0}
                    </p>

                    {/* Step items preview */}
                    <div className="space-y-1.5 pt-1">
                      {phaseSteps.map((s) => (
                        <div key={s.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-[rgba(184,135,61,0.1)]">
                          <span className="text-charcoal font-medium">{s.title}</span>
                          <span className={`text-[10px] font-mono ${s.status === 'completed' ? 'text-royalemerald font-bold' : 'text-warmgray'}`}>
                            {s.status === 'completed' ? 'PASS' : 'PENDING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Evidence Photo Wall Preview */}
        {evidenceItems.length > 0 && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-charcoal">Verified Field Evidence Photos</h3>
              <span className="text-xs text-warmgray">{evidenceItems.length} Attachments</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {evidenceItems.map((ev) => (
                <div 
                  key={ev.id}
                  onClick={() => setSelectedMediaUrl(ev.mediaUrl)}
                  className="relative group rounded-xl overflow-hidden border border-[rgba(184,135,61,0.2)] cursor-pointer"
                >
                  <img src={ev.mediaUrl} alt={ev.sopStepTitle} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 bg-charcoal/70 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded truncate">
                    {ev.sopStepTitle}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Navigation CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[rgba(184,135,61,0.2)] p-4 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => onNavigateToSop && onNavigateToSop(selectedJobId)}
            className="text-xs px-3 py-2.5"
          >
            View Full SOP Checklist
          </Button>

          {user.role === 'admin' && onNavigateToQcAssignment && (
            <Button
              variant="primary"
              onClick={() => onNavigateToQcAssignment(selectedJobId)}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Assign QC Inspector
            </Button>
          )}
        </div>
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {selectedMediaUrl && (
          <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3"
            >
              <img src={selectedMediaUrl} alt="Evidence" className="w-full max-h-96 object-cover rounded-xl border" />
              <Button variant="secondary" onClick={() => setSelectedMediaUrl(null)} className="w-full text-xs">
                Close Preview
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
