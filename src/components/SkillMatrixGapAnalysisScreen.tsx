import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Zap,
  Tag,
  EyeOff,
  UserPlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { DbManager } from '../lib/db';
import { SkillCapabilityCategory, TechnicianSkillMatrixRow, UserRole } from '../types';
import { Card, Button } from './Common';

interface SkillMatrixGapAnalysisScreenProps {
  userRole?: UserRole;
  currentLanguage?: 'en' | 'hi' | 'mr';
  onNavigateToTrainingModule?: (moduleId: string) => void;
  onNavigateToComplianceTracker?: () => void;
  onNavigateToSopRollout?: () => void;
  onBack?: () => void;
}

export const SkillMatrixGapAnalysisScreen: React.FC<SkillMatrixGapAnalysisScreenProps> = ({
  userRole = 'admin',
  currentLanguage = 'en',
  onNavigateToTrainingModule,
  onNavigateToComplianceTracker,
  onNavigateToSopRollout,
  onBack
}) => {
  const [skills, setSkills] = useState<SkillCapabilityCategory[]>([]);
  const [matrixRows, setMatrixRows] = useState<TechnicianSkillMatrixRow[]>([]);
  const [selectedTerritory, setSelectedTerritory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [selectedPartnersForTraining, setSelectedPartnersForTraining] = useState<string[]>([]);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sList = DbManager.getSkillCapabilities();
    const mRows = DbManager.getTechnicianSkillMatrix();
    setSkills(sList);
    setMatrixRows(mRows);
  };

  const handleToggleDeclining = (skillId: string) => {
    const updated = DbManager.toggleSkillDecliningPriority(skillId);
    setSkills([...updated]);
  };

  const handleAssignBatchTraining = (skill: SkillCapabilityCategory) => {
    if (!skill.recommendedTrainingModuleId) return;
    // Find all partners with 'gap' for this skill
    const targetPartners = matrixRows
      .filter(r => r.skillProficiencies[skill.id] === 'gap')
      .map(r => r.partnerId);

    const idsToAssign = selectedPartnersForTraining.length > 0 ? selectedPartnersForTraining : targetPartners;

    if (idsToAssign.length === 0) {
      setAssignSuccessMsg(`No partners currently identified with a gap for ${skill.skillName}`);
      setTimeout(() => setAssignSuccessMsg(''), 4000);
      return;
    }

    DbManager.assignTrainingForSkillGap(idsToAssign, skill.recommendedTrainingModuleId);
    setAssignSuccessMsg(`Successfully assigned Module ${skill.recommendedTrainingModuleId} to ${idsToAssign.length} technician(s)!`);
    setSelectedPartnersForTraining([]);
    setTimeout(() => setAssignSuccessMsg(''), 4000);
  };

  const handleSelectPartnerRow = (pId: string) => {
    if (selectedPartnersForTraining.includes(pId)) {
      setSelectedPartnersForTraining(selectedPartnersForTraining.filter(id => id !== pId));
    } else {
      setSelectedPartnersForTraining([...selectedPartnersForTraining, pId]);
    }
  };

  // Filtered rows
  const filteredMatrixRows = matrixRows.filter(row => {
    const matchesTerritory = selectedTerritory === 'all' || row.territory.toLowerCase().includes(selectedTerritory.toLowerCase());
    const matchesSearch = row.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.territory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkillFilter === 'all' || row.skillProficiencies[selectedSkillFilter] === 'gap';
    return matchesTerritory && matchesSearch && matchesSkill;
  });

  const getProficiencyBadge = (status?: string) => {
    switch (status) {
      case 'expert':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/30">EXPERT</span>;
      case 'certified':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30">CERTIFIED</span>;
      case 'in_training':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">IN TRAINING</span>;
      case 'gap':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/30">GAP DETECTED</span>;
      case 'exempt':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20">EXEMPT</span>;
      default:
        return <span className="text-xs text-[var(--color-text-secondary)]">—</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]/20 transition-all text-[var(--color-text-secondary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-[var(--color-accent-primary)]" />
              <h1 className="text-xl md:text-2xl font-bold font-serif">Skill Matrix & Gap Analysis</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                Strategic Workforce Planning
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Synthesizing technician capability, drive-type certifications & deal pipeline demands across Maharashtra.
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToComplianceTracker && (
            <Button
              variant="outline"
              onClick={onNavigateToComplianceTracker}
              className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
              <span>Compliance Tracker</span>
            </Button>
          )}
          {onNavigateToSopRollout && (
            <Button
              variant="outline"
              onClick={onNavigateToSopRollout}
              className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>SOP Rollout</span>
            </Button>
          )}
        </div>
      </div>

      {assignSuccessMsg && (
        <div className="p-3 bg-[var(--color-accent-secondary)]/15 border border-[var(--color-accent-secondary)]/30 rounded-xl text-xs font-semibold text-[var(--color-accent-secondary)] flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{assignSuccessMsg}</span>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Technicians Evaluated</span>
            <Users className="w-4 h-4 text-[var(--color-accent-primary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{matrixRows.length * 12}</span>
            <span className="text-[10px] text-[var(--color-accent-secondary)] font-semibold">Active in Field</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Across 4 major zones in MH</p>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Critical Skill Gaps</span>
            <AlertTriangle className="w-4 h-4 text-[var(--color-error)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[var(--color-error)]">
              {skills.filter(s => s.trendDirection === 'critical_gap' && !s.isDecliningPriority).length}
            </span>
            <span className="text-[10px] text-[var(--color-error)] font-semibold">Demand Exceeds Supply</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">PMSM Gearless & ARD Emergency</p>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Avg Demand/Supply Ratio</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-accent-secondary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[var(--color-accent-primary)]">1.67x</span>
            <span className="text-[10px] text-[var(--color-accent-secondary)] font-semibold">+0.2x vs Q2</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">Based on active deal pipeline</p>
        </Card>

        <Card className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Declining Techs Phased</span>
            <EyeOff className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-500">
              {skills.filter(s => s.isDecliningPriority).length}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">Low Pipeline Priority</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">e.g. Legacy Worm-Gear Machines</p>
        </Card>
      </div>

      {/* Demand vs Supply Capability Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <h2 className="text-base font-bold font-serif">Drive & Technology Capability vs. Pipeline Demand</h2>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">Quotation Engine Data Integration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map(skill => {
            const isCritical = skill.trendDirection === 'critical_gap' && !skill.isDecliningPriority;
            return (
              <Card
                key={skill.id}
                className={`p-4 bg-[var(--color-surface)] border rounded-2xl transition-all relative overflow-hidden ${
                  isCritical
                    ? 'border-[var(--color-error)]/40 shadow-sm'
                    : skill.isDecliningPriority
                    ? 'border-dashed border-[var(--color-border)] opacity-75'
                    : 'border-[var(--color-border)]'
                }`}
              >
                {/* The Ascension Line Accent */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[var(--color-accent-primary)] opacity-40" />

                <div className="flex items-start justify-between gap-2 pl-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {currentLanguage === 'hi' && skill.skillNameHi ? skill.skillNameHi : currentLanguage === 'mr' && skill.skillNameMr ? skill.skillNameMr : skill.skillName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono uppercase bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        Tag: {skill.driveTypeTag}
                      </span>
                      {skill.isDecliningPriority && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-500/10 px-1.5 py-0.5 rounded">
                          Declining Priority
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDeclining(skill.id)}
                    title={skill.isDecliningPriority ? 'Re-activate as active skill' : 'Mark as declining priority (legacy)'}
                    className="p-1 rounded-lg text-gray-400 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-all cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 pl-2 grid grid-cols-2 gap-2 text-xs border-t border-[var(--color-border)]/50 pt-3">
                  <div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Qualified Techs</span>
                    <p className="text-lg font-bold font-mono text-[var(--color-accent-secondary)]">
                      {skill.qualifiedTechniciansCount} <span className="text-[10px] font-normal text-[var(--color-text-secondary)]">certified</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-text-secondary)]">Pipeline Demand</span>
                    <p className="text-lg font-bold font-mono text-[var(--color-accent-primary)]">
                      {skill.pipelineDemandCount} <span className="text-[10px] font-normal text-[var(--color-text-secondary)]">deals</span>
                    </p>
                  </div>
                </div>

                {/* Demand-vs-Supply Gauge bar */}
                <div className="mt-3 pl-2 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[var(--color-text-secondary)]">Demand-to-Supply Ratio:</span>
                    <span className={`font-mono font-bold ${isCritical ? 'text-[var(--color-error)]' : 'text-[var(--color-accent-primary)]'}`}>
                      {skill.demandVsSupplyRatio.toFixed(2)}x
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]/40">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCritical ? 'bg-[var(--color-error)]' : 'bg-[var(--color-accent-primary)]'
                      }`}
                      style={{ width: `${Math.min(100, (skill.qualifiedTechniciansCount / (skill.pipelineDemandCount || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action footer */}
                <div className="mt-4 pl-2 pt-2 border-t border-[var(--color-border)]/50 flex items-center justify-between">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    isCritical ? 'bg-[var(--color-error)]/10 text-[var(--color-error)]' : 'bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)]'
                  }`}>
                    {skill.trendDirection.replace('_', ' ')}
                  </span>

                  {skill.recommendedTrainingModuleId && !skill.isDecliningPriority && (
                    <Button
                      variant="primary"
                      onClick={() => handleAssignBatchTraining(skill)}
                      className="text-xs px-2.5 py-1 h-auto flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Assign Training</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Complementary Recruitment Advice Notice */}
      <Card className="p-4 bg-[var(--color-accent-primary)]/5 border border-[var(--color-accent-primary)]/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
              Strategic Workforce Planning Insight
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)]">
              When a skill gap ratio exceeds 2.0x (e.g. ARD Rescue & PMSM Tuning), training existing technicians alone may not meet near-term project delivery schedules. Consider combining training assignments with recruitment targeting in the Territory Aggregation Dashboard.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <Button
            variant="outline"
            onClick={() => alert('Redirecting to Territory Need & Recruitment Aggregation...')}
            className="text-xs px-3 py-1.5 h-auto flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
            <span>Recruitment Focus</span>
          </Button>
        </div>
      </Card>

      {/* Technician Skill Matrix Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-serif">Technician Skill & Qualification Matrix</h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Individual partner capabilities against key operational standards.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Search technician or zone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-accent-primary)] w-48"
              />
            </div>

            <select
              value={selectedTerritory}
              onChange={e => setSelectedTerritory(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
            >
              <option value="all">All Territories</option>
              <option value="mumbai">Mumbai & Thane</option>
              <option value="pune">Pune Metropolitan</option>
              <option value="nashik">Nashik Zone</option>
              <option value="kolhapur">Kolhapur & Sangli</option>
            </select>

            <select
              value={selectedSkillFilter}
              onChange={e => setSelectedSkillFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-accent-primary)]"
            >
              <option value="all">All Skill Gaps</option>
              {skills.map(s => (
                <option key={s.id} value={s.id}>Gap in {s.skillName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <Card className="overflow-x-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedPartnersForTraining.length === filteredMatrixRows.length && filteredMatrixRows.length > 0}
                    onChange={() => {
                      if (selectedPartnersForTraining.length === filteredMatrixRows.length) {
                        setSelectedPartnersForTraining([]);
                      } else {
                        setSelectedPartnersForTraining(filteredMatrixRows.map(r => r.partnerId));
                      }
                    }}
                    className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)]"
                  />
                </th>
                <th className="p-3">Technician / Partner</th>
                <th className="p-3">Territory</th>
                {skills.map(s => (
                  <th key={s.id} className="p-3 text-center">
                    <div className="font-semibold">{s.driveTypeTag}</div>
                    <div className="text-[9px] font-normal text-[var(--color-text-secondary)] truncate max-w-[100px]">{s.skillName}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 text-xs">
              {filteredMatrixRows.length === 0 ? (
                <tr>
                  <td colSpan={3 + skills.length} className="p-8 text-center text-[var(--color-text-secondary)]">
                    No technicians found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMatrixRows.map(row => {
                  const isSelected = selectedPartnersForTraining.includes(row.partnerId);
                  return (
                    <tr
                      key={row.partnerId}
                      className={`hover:bg-[var(--color-bg)]/40 transition-colors ${
                        isSelected ? 'bg-[var(--color-accent-primary)]/5' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectPartnerRow(row.partnerId)}
                          className="rounded border-[var(--color-border)] text-[var(--color-accent-primary)] cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-semibold">
                        <div>{row.partnerName}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] font-normal">{row.mobileNumber}</div>
                      </td>
                      <td className="p-3 text-[var(--color-text-secondary)]">{row.territory}</td>
                      {skills.map(s => (
                        <td key={s.id} className="p-3 text-center">
                          {getProficiencyBadge(row.skillProficiencies[s.id])}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
