import React, { useState, useEffect } from 'react';
import {
  User,
  TrainingModule,
  TrainingLesson,
  PartnerModuleProgress
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  BookOpen,
  Search,
  Filter,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Play,
  ShieldAlert,
  Award,
  Sparkles,
  Download,
  Languages,
  ChevronRight,
  ArrowLeft,
  Wrench,
  Compass,
  Package,
  TrendingUp,
  AlertCircle,
  BarChart2,
  FileText,
  RefreshCw,
  FolderCheck,
  BrainCircuit,
  Zap,
  MessageSquare
} from 'lucide-react';

interface TrainingModuleLibraryScreenProps {
  user: User;
  partnerId?: string;
  onOpenLesson?: (moduleId: string, lessonId: string) => void;
  onNavigateToSopRepo?: () => void;
  onNavigateToBadges?: () => void;
  onNavigateToSkillMatrix?: () => void;
  onNavigateToComplianceTracker?: () => void;
  onNavigateToSopRollout?: () => void;
  onNavigateToFeedback?: () => void;
  onBack?: () => void;
}

export const TrainingModuleLibraryScreen: React.FC<TrainingModuleLibraryScreenProps> = ({
  user,
  partnerId,
  onOpenLesson,
  onNavigateToSopRepo,
  onNavigateToBadges,
  onNavigateToSkillMatrix,
  onNavigateToComplianceTracker,
  onNavigateToSopRollout,
  onNavigateToFeedback,
  onBack
}) => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [partnerRole, setPartnerRole] = useState<'surveyor' | 'technician' | 'supplier' | 'sales_rep'>('technician');
  const [partnerRoles, setPartnerRoles] = useState<string[]>(['technician']);
  const [progressMap, setProgressMap] = useState<Record<string, PartnerModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [filterRole, setFilterRole] = useState<string>('my_role'); // 'my_role' | 'all' | 'technician' | 'surveyor' | 'supplier'

  useEffect(() => {
    loadData();
  }, [partnerId, user]);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const allModules = DbManager.getTrainingModules();
      setModules(allModules);

      // Determine active target partner ID and roles
      let targetId = partnerId || user.id;
      let roles: string[] = [];

      const masterPartner = DbManager.getMasterPartners().find(p => p.id === targetId || p.partnerPhone === user.phone);
      if (masterPartner) {
        roles = masterPartner.roles;
        setPartnerRole(masterPartner.primaryRole);
      } else if (user.role === 'surveyor' || user.role === 'technician' || user.role === 'supplier') {
        roles = [user.role];
        setPartnerRole(user.role);
      } else {
        roles = ['technician'];
        setPartnerRole('technician');
      }
      setPartnerRoles(roles);

      // Load partner module progress
      const progressList = DbManager.getPartnerModuleProgressList(masterPartner?.id || 'p_001');
      const pMap: Record<string, PartnerModuleProgress> = {};
      progressList.forEach(p => {
        pMap[p.moduleId] = p;
      });
      setProgressMap(pMap);

      setLoading(false);
    }, 200);
  };

  // Helper to get localized title
  const getLocalizedTitle = (mod: TrainingModule) => {
    if (selectedLanguage === 'hi' && mod.moduleTitleHi) return mod.moduleTitleHi;
    if (selectedLanguage === 'mr' && mod.moduleTitleMr) return mod.moduleTitleMr;
    return mod.moduleTitle;
  };

  // Check if a module is locked due to sequence dependency
  const isModuleLocked = (mod: TrainingModule): { locked: boolean; requiredModuleTitle?: string } => {
    if (!mod.sequenceLockDependency) return { locked: false };

    const requiredProgress = progressMap[mod.sequenceLockDependency];
    const isRequiredCompleted = requiredProgress && requiredProgress.status === 'completed';

    if (!isRequiredCompleted) {
      const reqMod = modules.find(m => m.id === mod.sequenceLockDependency);
      return {
        locked: true,
        requiredModuleTitle: reqMod ? reqMod.moduleTitle : mod.sequenceLockDependencyTitle || 'Prerequisite Module'
      };
    }
    return { locked: false };
  };

  // Check if module is required for user's roles
  const isModuleRequiredForPartner = (mod: TrainingModule) => {
    return mod.requiredForRoles.some(r => partnerRoles.includes(r));
  };

  // Calculate overall required curriculum completion percentage
  const requiredModules = modules.filter(m => isModuleRequiredForPartner(m));
  const completedRequiredCount = requiredModules.filter(m => progressMap[m.id]?.status === 'completed').length;
  const overallCompletionPercent = requiredModules.length > 0
    ? Math.round((completedRequiredCount / requiredModules.length) * 100)
    : 0;

  // Filtered modules
  const filteredModules = modules.filter(mod => {
    // Role filter
    if (filterRole === 'my_role' && !isModuleRequiredForPartner(mod)) {
      return false;
    } else if (filterRole !== 'my_role' && filterRole !== 'all' && !mod.requiredForRoles.includes(filterRole as any)) {
      return false;
    }

    // Topic filter
    if (selectedTopic !== 'all' && mod.topic !== selectedTopic) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mod.moduleTitle.toLowerCase().includes(q) || (mod.moduleTitleHi || '').toLowerCase().includes(q);
      const matchTopic = mod.topic.toLowerCase().includes(q);
      const matchLesson = mod.lessons.some(l => l.lessonTitle.toLowerCase().includes(q));
      if (!matchTitle && !matchTopic && !matchLesson) return false;
    }

    return true;
  });

  const getTopicLabel = (topic: string) => {
    switch (topic) {
      case 'onboarding_basics': return 'Onboarding & Platform';
      case 'safety_procedures': return 'Safety & IS Standards';
      case 'product_knowledge': return 'Technical & Product Knowledge';
      case 'customer_interaction': return 'Client Communication';
      default: return topic;
    }
  };

  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case 'safety_procedures': return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'onboarding_basics': return <BookOpen className="w-4 h-4 text-[var(--color-accent-primary)]" />;
      case 'product_knowledge': return <Wrench className="w-4 h-4 text-[var(--color-accent-secondary)]" />;
      case 'customer_interaction': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">
      
      {/* Header Banner */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1 mb-2 cursor-pointer"
              >
                ← Back
              </button>
            )}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">
                AIEC Training & SOP Library
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                SOP Module 16
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Role-curated technical standards, safety protocols & IS 14665 elevator compliance.
            </p>
          </div>

          {/* Navigation Controls & Language Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToSopRepo && (
              <Button
                variant="outline"
                onClick={onNavigateToSopRepo}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span>SOP Repo</span>
              </Button>
            )}

            {onNavigateToBadges && (
              <Button
                variant="outline"
                onClick={onNavigateToBadges}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span>Badges</span>
              </Button>
            )}

            {onNavigateToSkillMatrix && user.role === 'admin' && (
              <Button
                variant="outline"
                onClick={onNavigateToSkillMatrix}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1.5"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span>Skill Matrix</span>
              </Button>
            )}

            {onNavigateToComplianceTracker && user.role === 'admin' && (
              <Button
                variant="outline"
                onClick={onNavigateToComplianceTracker}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
                <span>Compliance</span>
              </Button>
            )}

            {onNavigateToSopRollout && (
              <Button
                variant="outline"
                onClick={onNavigateToSopRollout}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span>SOP Rollout</span>
              </Button>
            )}

            {onNavigateToFeedback && (
              <Button
                variant="outline"
                onClick={onNavigateToFeedback}
                className="text-xs px-2.5 py-1.5 h-auto flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
                <span>Quality Feedback</span>
              </Button>
            )}

            <div className="flex items-center gap-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-0.5 text-xs">
              <Languages className="w-3.5 h-3.5 ml-1 text-[var(--color-accent-secondary)] shrink-0" />
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'mr', label: 'मराठी' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code as any)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedLanguage === lang.code
                      ? 'bg-[var(--color-accent-primary)] text-white shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 space-y-6">

        {/* Overall Curriculum Progress Banner with "Ascension Line" Motif */}
        <Card className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] tracking-wider block">
                Required Curriculum Progress • Role: <strong className="text-[var(--color-text-primary)] uppercase">{partnerRoles.join(', ')}</strong>
              </span>
              <h2 className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">
                {completedRequiredCount} of {requiredModules.length} Mandatory Modules Certified
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold text-[var(--color-accent-primary)] font-mono">
                {overallCompletionPercent}%
              </span>
              {overallCompletionPercent === 100 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                  <Award className="w-4 h-4" /> Fully Certified
                </span>
              )}
            </div>
          </div>

          {/* Ascension Line Vertical/Horizontal Progress Rail */}
          <div className="relative pt-1">
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
              <div
                style={{ width: `${overallCompletionPercent}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] transition-all duration-500"
              />
            </div>
          </div>
        </Card>

        {/* Sticky Filter & Search Control Panel */}
        <Card className="p-4 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-3 sticky top-2 z-20">
          
          {/* Topic Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--color-border)]">
            {[
              { id: 'all', label: 'All Topics', count: modules.length },
              { id: 'safety_procedures', label: 'Safety & IS 14665', count: modules.filter(m => m.topic === 'safety_procedures').length },
              { id: 'onboarding_basics', label: 'Onboarding & App', count: modules.filter(m => m.topic === 'onboarding_basics').length },
              { id: 'product_knowledge', label: 'Technical & Drives', count: modules.filter(m => m.topic === 'product_knowledge').length },
              { id: 'customer_interaction', label: 'Client Courtesy', count: modules.filter(m => m.topic === 'customer_interaction').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTopic(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedTopic === tab.id
                    ? 'bg-[var(--color-accent-primary)] text-white shadow-sm'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${selectedTopic === tab.id ? 'bg-white/20 text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Role Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search modules, safety checks, or VFD auto-tune..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              />
            </div>

            <div className="sm:col-span-5">
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              >
                <option value="my_role">Modules Required For My Role ({partnerRoles.join(', ')})</option>
                <option value="all">All Network Modules</option>
                <option value="technician">Technician Curriculum</option>
                <option value="surveyor">Surveyor Curriculum</option>
                <option value="supplier">Supplier Curriculum</option>
              </select>
            </div>
          </div>

        </Card>

        {/* Modules List View */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <Card key={n} className="p-5 border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : filteredModules.length > 0 ? (
          <div className="space-y-4">
            {filteredModules.map(mod => {
              const { locked, requiredModuleTitle } = isModuleLocked(mod);
              const pRecord = progressMap[mod.id];
              const isCompleted = pRecord?.status === 'completed';
              const isInProgress = pRecord?.status === 'in_progress';
              const isRequired = isModuleRequiredForPartner(mod);

              return (
                <Card
                  key={mod.id}
                  className={`p-5 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-primary)] transition-all shadow-sm ${
                    locked ? 'opacity-80 bg-[var(--color-bg)]/40' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Module Metadata & Title */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {getTopicIcon(mod.topic)}
                        <span className="font-semibold text-[var(--color-text-secondary)]">
                          {getTopicLabel(mod.topic)}
                        </span>
                        
                        {mod.isSafetyCritical && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Safety Gated
                          </span>
                        )}

                        {isRequired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                            Required Module
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg)] border border-[var(--color-border)]">
                            Elective / Secondary
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                          {mod.version}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                        {getLocalizedTitle(mod)}
                      </h3>

                      {/* Required Roles Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-[var(--color-text-secondary)]">Applies To:</span>
                        {mod.requiredForRoles.map(r => (
                          <span key={r} className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[var(--color-bg)] border border-[var(--color-border)] uppercase">
                            {r}
                          </span>
                        ))}
                      </div>

                      {/* Locked Dependency Warning */}
                      {locked && (
                        <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>Module Locked:</strong> Complete <em>"{requiredModuleTitle}"</em> first to unlock.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Progress & Action Button */}
                    <div className="flex flex-col items-start md:items-end gap-3 shrink-0 border-t md:border-t-0 border-[var(--color-border)] pt-3 md:pt-0">
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{mod.estimatedMinutes} mins</span>
                        </span>

                        <span className="text-[var(--color-text-secondary)]">•</span>

                        <span className="font-semibold">
                          {mod.lessons.length} Lessons
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : isInProgress ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> In Progress ({pRecord?.completionPercent || 50}%)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-gray-500/10 text-gray-600 border border-gray-500/20">
                            Not Started
                          </span>
                        )}
                      </div>

                      {/* Play / View Button */}
                      <Button
                        disabled={locked}
                        onClick={() => {
                          if (onOpenLesson && mod.lessons.length > 0) {
                            onOpenLesson(mod.id, mod.lessons[0].id);
                          }
                        }}
                        className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          locked
                            ? 'bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed opacity-60'
                            : isCompleted
                            ? 'bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                            : 'bg-[var(--color-accent-primary)] text-white shadow-md hover:bg-[var(--color-accent-secondary)]'
                        }`}
                      >
                        {locked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isCompleted ? 'Review Module' : isInProgress ? 'Resume Lesson' : 'Start Module'}</span>
                          </>
                        )}
                      </Button>

                    </div>

                  </div>

                  {/* Lessons Quick List inside Card */}
                  {!locked && mod.lessons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {mod.lessons.map(les => {
                        const lesProgress = pRecord?.lessonProgress?.[les.id];
                        const isLesDone = lesProgress?.completed;

                        return (
                          <button
                            key={les.id}
                            onClick={() => onOpenLesson && onOpenLesson(mod.id, les.id)}
                            className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent-primary)] flex items-center justify-between text-left transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {isLesDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-[var(--color-accent-primary)] shrink-0" />
                              )}
                              <span className="font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-primary)]">
                                {les.lessonTitle}
                              </span>
                            </div>

                            <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0 font-mono">
                              {les.durationMinutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center border-[var(--color-border)] bg-[var(--color-surface)]">
            <BookOpen className="w-12 h-12 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">No Training Modules Found</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Try adjusting your search terms or role filters.
            </p>
          </Card>
        )}

      </div>
    </div>
  );
};
