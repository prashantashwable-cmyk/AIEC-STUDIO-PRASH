import React, { useState } from 'react';
import { 
  Clock, ArrowLeft, CheckCircle2, ChevronRight, FileText, Image as ImageIcon, 
  Building2, Phone, Calendar, AlertTriangle, Info, ChevronDown, ChevronUp, 
  Download, ShieldCheck, Sparkles, ExternalLink, RefreshCw, Eye
} from 'lucide-react';
import { UserRole, CustomerProjectSummary } from '../types';
import { DbManager } from '../lib/db';

interface ProjectStatusTrackerScreenProps {
  userRole: UserRole;
  currentLanguage: 'en' | 'hi' | 'mr';
  currentUserId?: string;
  projectId?: string;
  onBack?: () => void;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const ProjectStatusTrackerScreen: React.FC<ProjectStatusTrackerScreenProps> = ({
  userRole,
  currentLanguage,
  currentUserId = 'p_001',
  projectId,
  onBack,
  onNavigateTab
}) => {
  const [projects] = useState<CustomerProjectSummary[]>(() => 
    DbManager.getCustomerProjects(currentUserId)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId || (projects[0]?.id || 'proj_royal_001')
  );
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>('ms_04');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [activePhotoModalUrl, setActivePhotoModalUrl] = useState<{ url: string; title: string; caption: string } | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const toggleMilestoneExpand = (id: string) => {
    setExpandedMilestoneId(prev => prev === id ? null : id);
  };

  const getStageBadge = (status: 'completed' | 'in_progress' | 'upcoming' | 'delayed') => {
    switch (status) {
      case 'completed':
        return {
          label: currentLanguage === 'hi' ? 'पूर्ण' : currentLanguage === 'mr' ? 'पूर्ण' : 'Completed',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700'
        };
      case 'in_progress':
        return {
          label: currentLanguage === 'hi' ? 'प्रगति पर' : currentLanguage === 'mr' ? 'प्रगतीपथावर' : 'In Progress',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
        };
      case 'upcoming':
        return {
          label: currentLanguage === 'hi' ? 'आगामी' : currentLanguage === 'mr' ? 'पुढील' : 'Upcoming',
          bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
        };
      case 'delayed':
        return {
          label: currentLanguage === 'hi' ? 'विलंबित' : currentLanguage === 'mr' ? 'विलंबित' : 'Delayed (Hold)',
          bg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700'
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
                <Clock className="w-6 h-6 text-[var(--color-accent-primary)]" />
                {currentLanguage === 'hi' ? 'स्थापना प्रगति टाइमलाइन' : currentLanguage === 'mr' ? 'प्रकल्प प्रगती वेळापत्रक' : 'Installation Progress Tracker'}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {currentLanguage === 'hi' ? 'वास्तविक समय स्टेज मील के पत्थर एवं फोटो साक्ष्य' : 'Real-time stage milestones, photo evidence & inspection signoffs'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                showTechnicalDetails
                  ? 'bg-[var(--color-accent-primary)] text-white border-transparent'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {showTechnicalDetails ? 'Simplified View' : '+ Technical Specs'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Project Summary Banner */}
        {activeProject && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/30 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-accent-primary)] block">
                  SITE PROJECT: {activeProject.projectName}
                </span>
                <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)] mt-1">
                  {activeProject.elevatorType}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                  {activeProject.siteAddress}
                </p>
              </div>

              <div className="flex items-center space-x-3 self-start md:self-auto">
                <a
                  href={`tel:${activeProject.assignedLeadManagerPhone.replace(/\s+/g, '')}`}
                  className="px-3.5 py-2 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-95 flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Site Manager</span>
                </a>
              </div>
            </div>

            {/* Overall Progress Rail */}
            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Overall Project Completion</span>
                <span className="text-[var(--color-accent-primary)]">{activeProject.overallProgressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${activeProject.overallProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Milestone Timeline — Ascension Line Motif */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--color-accent-primary)]" />
              SOP Milestone Stages ({activeProject?.installationMilestones.length || 0})
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)]">
              Audited by Senior Project Engineer
            </span>
          </div>

          {/* Vertical Ascension Line Container */}
          <div className="relative pl-8 space-y-8">
            
            {/* The Gold Vertical Ascension Rail */}
            <div className="absolute left-3.5 top-3 bottom-3 w-1 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div 
                className="w-full bg-[var(--color-accent-primary)] rounded-full transition-all duration-500"
                style={{ height: `${activeProject?.overallProgressPercent || 50}%` }}
              />
            </div>

            {activeProject?.installationMilestones.map((ms) => {
              const badge = getStageBadge(ms.status);
              const isExpanded = expandedMilestoneId === ms.id;

              return (
                <div key={ms.id} className="relative space-y-3">
                  
                  {/* Ascension Node Indicator */}
                  <div className={`absolute -left-[33px] top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    ms.status === 'completed'
                      ? 'bg-[var(--color-accent-primary)] text-white shadow-md'
                      : ms.status === 'in_progress'
                      ? 'bg-[var(--color-surface)] border-2 border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] animate-pulse'
                      : 'bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}>
                    {ms.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{ms.stageCode.slice(-2)}</span>
                    )}
                  </div>

                  {/* Card Container */}
                  <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm hover:border-[var(--color-accent-primary)]/40 transition-all space-y-3">
                    
                    <div 
                      onClick={() => toggleMilestoneExpand(ms.id)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">
                            {ms.actualDate ? `Done: ${ms.actualDate}` : `Target: ${ms.estimatedDate}`}
                          </span>
                        </div>

                        <h4 className="font-serif font-bold text-base text-[var(--color-text-primary)] mt-1.5">
                          {ms.stageName}
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {ms.description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-auto text-[var(--color-text-secondary)]">
                        <span className="text-xs font-bold text-[var(--color-accent-primary)] hidden sm:inline">
                          {isExpanded ? 'Hide Details' : 'View Highlights'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-[var(--color-border)] space-y-4 animate-fadeIn">
                        
                        {/* Completed Technician Tag */}
                        {ms.completedByTechName && (
                          <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                            <span>Executed by Certified Lead: <strong>{ms.completedByTechName}</strong></span>
                          </div>
                        )}

                        {/* Photo Highlights Gallery */}
                        {ms.photoHighlights && ms.photoHighlights.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-[var(--color-text-secondary)] block uppercase tracking-wider">
                              Site Evidence & Inspection Photos
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {ms.photoHighlights.map((ph, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => setActivePhotoModalUrl(ph)}
                                  className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer hover:border-[var(--color-accent-primary)] transition-all"
                                >
                                  <img 
                                    src={ph.url} 
                                    alt={ph.title} 
                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                  <div className="p-2.5 space-y-1">
                                    <span className="font-bold text-xs text-[var(--color-text-primary)] block line-clamp-1">
                                      {ph.title}
                                    </span>
                                    <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1">
                                      {ph.caption}
                                    </p>
                                    <span className="text-[10px] font-mono text-[var(--color-accent-primary)] block">
                                      {ph.geotag} • {ph.date}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technical Details List (if toggled) */}
                        {showTechnicalDetails && ms.technicalDetails && (
                          <div className="bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)] space-y-2 text-xs">
                            <span className="font-bold text-[var(--color-accent-primary)] block">
                              Technical Engineering Specifications:
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)] font-mono">
                              {ms.technicalDetails.map((td, idx) => (
                                <li key={idx}>{td}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Linked Signoff Document */}
                        {ms.linkedDocTitle && (
                          <div className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-xs">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-[var(--color-accent-primary)]" />
                              <span className="font-bold text-[var(--color-text-primary)]">{ms.linkedDocTitle}</span>
                            </div>
                            <button
                              onClick={() => alert(`Opening official document: ${ms.linkedDocTitle}`)}
                              className="px-2.5 py-1 bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] rounded-lg font-bold hover:bg-[var(--color-accent-primary)] hover:text-white transition-all"
                            >
                              View PDF
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full Photo Preview Modal */}
      {activePhotoModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-primary)]/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[var(--color-text-primary)]">
                {activePhotoModalUrl.title}
              </h3>
              <button 
                onClick={() => setActivePhotoModalUrl(null)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <img 
                src={activePhotoModalUrl.url} 
                alt={activePhotoModalUrl.title}
                className="w-full max-h-80 object-cover rounded-xl border border-[var(--color-border)]" 
              />
              <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                {activePhotoModalUrl.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
