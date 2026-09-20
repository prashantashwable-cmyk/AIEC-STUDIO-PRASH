import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldAlert, 
  Search, Filter, User as UserIcon, ArrowLeft, Plus, ChevronRight, 
  Wrench, FileText, Check, ShieldCheck, UserCheck, RefreshCw, 
  Link2, Sparkles, AlertCircle, MessageSquare
} from 'lucide-react';
import { User, DefectSnagRecord } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1 ${className}`}>
    {children}
  </span>
);

interface DefectSnagListScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onNavigateToRework?: (jobId: string, snagId: string) => void;
  onNavigateToElectricalQc?: (jobId: string) => void;
}

export const DefectSnagListScreen: React.FC<DefectSnagListScreenProps> = ({
  user,
  jobId,
  onBack,
  onNavigateToRework,
  onNavigateToElectricalQc
}) => {
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [snags, setSnags] = useState<DefectSnagRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'safety_critical' | 'functional' | 'cosmetic'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [activeSnag, setActiveSnag] = useState<DefectSnagRecord | null>(null);
  const [reworkNoteInput, setReworkNoteInput] = useState<string>('');
  const [waiveReasonInput, setWaiveReasonInput] = useState<string>('');
  const [escalateNoteInput, setEscalateNoteInput] = useState<string>('');
  const [showAddSnagModal, setShowAddSnagModal] = useState<boolean>(false);

  // New Snag Form
  const [newSnagTitle, setNewSnagTitle] = useState<string>('');
  const [newSnagDesc, setNewSnagDesc] = useState<string>('');
  const [newSnagSeverity, setNewSnagSeverity] = useState<'safety_critical' | 'functional' | 'cosmetic'>('functional');

  useEffect(() => {
    loadSnags();
  }, [jobId]);

  const loadSnags = () => {
    const list = DbManager.getSnagsByJobId(jobId);
    setSnags(list);
  };

  const labels = {
    en: {
      title: "Defect & Snag Punch-List",
      sub: "Consolidated QC Findings, Rework Verification & Handover Blockers",
      safetyBlockerNotice: "CRITICAL: Safety-Critical snags hard-block handover. Independent QC re-verification is mandatory for closure.",
      allClosedNotice: "ALL QC SNAGS RESOLVED: Zero open defects. Ready for final compliance sign-off.",
      searchPlaceholder: "Search snag code, title, or technician...",
      filterAll: "All Severities",
      filterSafety: "Safety-Critical",
      filterFunctional: "Functional",
      filterCosmetic: "Cosmetic",
      addSnagBtn: "Add Field Snag Item",
      reverifyBtn: "QC Re-Verify & Close",
      waiveBtn: "Customer Waived (Cosmetic Only)",
      escalateBtn: "Escalate Disagreement to Admin",
      reworkInProgBtn: "Mark Rework in Progress"
    },
    hi: {
      title: "दोष एवं स्नैग पंच-सूची",
      sub: "एकत्रित QC निष्कर्ष, रीवर्क सत्यापन एवं हैंडओवर ब्लॉकर",
      safetyBlockerNotice: "महत्वपूर्ण: सुरक्षा-गंभीर स्नैग हैंडओवर को ब्लॉक करते हैं। स्वतंत्र री-वेरिफिकेशन अनिवार्य है।",
      allClosedNotice: "सभी QC स्नैग हल हो गए हैं। शून्य लंबित दोष।",
      searchPlaceholder: "स्नैग कोड, शीर्षक या तकनीशियन खोजें...",
      filterAll: "सभी श्रेणियां",
      filterSafety: "सुरक्षा-गंभीर",
      filterFunctional: "कार्यात्मक",
      filterCosmetic: "कॉस्मेटिक",
      addSnagBtn: "नया स्नैग जोड़ें",
      reverifyBtn: "QC पुनः सत्यापित करें और बंद करें",
      waiveBtn: "ग्राहक छूट (केवल कॉस्मेटिक)",
      escalateBtn: "एडमिन को एस्केलेट करें",
      reworkInProgBtn: "रीवर्क चालू करें"
    },
    mr: {
      title: "दोष व त्रुटी यादी (Snag List)",
      sub: "एकत्रित QC निष्कर्ष, दुरुस्ती पडताळणी व हँडओव्हर अडथळे",
      safetyBlockerNotice: "महत्त्वाचे: सुरक्षेच्या त्रुटी हँडओव्हर रोखतात. स्वतंत्र QC पुनर-पडताळणी बंधनकारक आहे.",
      allClosedNotice: "सर्व QC त्रुटींचे निवारण झाले आहे. शून्य प्रलंबित दोष.",
      searchPlaceholder: "स्नॅग कोड, नाव किंवा तंत्रज्ञ शोधा...",
      filterAll: "सर्व प्रकार",
      filterSafety: "सुरक्षा-गंभीर",
      filterFunctional: "कार्यात्मक",
      filterCosmetic: "कॉस्मेटिक",
      addSnagBtn: "नवीन स्नॅग जोडा",
      reverifyBtn: "QC पुन्हा तपासा व बंद करा",
      waiveBtn: "ग्राहक संमती (फक्त कॉस्मेटिक)",
      escalateBtn: "प्रशासकाकडे (Admin) पाठवा",
      reworkInProgBtn: "दुरुस्ती सुरू करा"
    }
  }[language];

  // Filtering
  const filteredSnags = snags.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.snagCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.assignedTechnicianName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || s.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || s.resolutionStatus === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const safetyCriticalOpenCount = snags.filter(s => s.severity === 'safety_critical' && s.resolutionStatus !== 'qc_verified_closed' && s.resolutionStatus !== 'customer_waived_cosmetic').length;
  const totalOpenCount = snags.filter(s => s.resolutionStatus !== 'qc_verified_closed' && s.resolutionStatus !== 'customer_waived_cosmetic').length;

  const handleUpdateStatus = (snagId: string, newStatus: DefectSnagRecord['resolutionStatus']) => {
    DbManager.updateSnagStatus(
      snagId, 
      newStatus, 
      reworkNoteInput || (newStatus === 'customer_waived_cosmetic' ? waiveReasonInput : escalateNoteInput), 
      user.name
    );
    loadSnags();
    setActiveSnag(null);
    setReworkNoteInput('');
    setWaiveReasonInput('');
    setEscalateNoteInput('');
  };

  const handleCreateSnag = () => {
    if (!newSnagTitle) return;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const item: DefectSnagRecord = {
      id: `snag_${jobId}_${Date.now()}`,
      jobId,
      snagCode: `SNAG-${Math.floor(100 + Math.random() * 900)}`,
      title: newSnagTitle,
      description: newSnagDesc || 'Walkthrough or field observation snag logged.',
      sourceChecklist: 'customer_walkthrough',
      sourceChecklistItemKey: 'walkthrough_note',
      severity: newSnagSeverity,
      assignedTechnicianId: 'tech_001',
      assignedTechnicianName: 'Ramesh Patil',
      resolutionStatus: 'open',
      hardBlockHandoverFlag: newSnagSeverity === 'safety_critical',
      photos: [],
      createdAt: `${timestamp} IST`
    };

    DbManager.saveSnagItem(item);
    loadSnags();
    setShowAddSnagModal(false);
    setNewSnagTitle('');
    setNewSnagDesc('');
  };

  const getSeverityBadge = (sev: DefectSnagRecord['severity']) => {
    switch (sev) {
      case 'safety_critical':
        return <Badge className="bg-red-700 text-white font-mono text-[10px]"><AlertOctagon className="w-3 h-3 mr-1" />SAFETY CRITICAL</Badge>;
      case 'functional':
        return <Badge className="bg-amber-600 text-white font-mono text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" />FUNCTIONAL</Badge>;
      case 'cosmetic':
        return <Badge className="bg-blue-600 text-white font-mono text-[10px]"><Info className="w-3 h-3 mr-1" />COSMETIC</Badge>;
    }
  };

  const getStatusBadge = (st: DefectSnagRecord['resolutionStatus']) => {
    switch (st) {
      case 'open':
        return <Badge variant="outline" className="border-red-500/40 text-red-600 dark:text-red-400 text-[10px] font-mono">OPEN</Badge>;
      case 'rework_in_progress':
        return <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px] font-mono">REWORK IN PROGRESS</Badge>;
      case 'pending_qc_reverification':
        return <Badge className="bg-amber-500 text-black font-mono text-[10px]">PENDING QC RE-VERIFICATION</Badge>;
      case 'qc_verified_closed':
        return <Badge className="bg-emerald-700 text-white font-mono text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />QC VERIFIED CLOSED</Badge>;
      case 'customer_waived_cosmetic':
        return <Badge className="bg-purple-800 text-white font-mono text-[10px]">CUSTOMER WAIVED</Badge>;
      case 'admin_escalated':
        return <Badge className="bg-rose-800 text-white font-mono text-[10px]">ADMIN ESCALATED</Badge>;
    }
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
              <Badge className="bg-surface-hover text-text-primary border-gold/30 text-xs">
                {totalOpenCount} Open Defect(s)
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

        {/* Action Button & Language switch */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowAddSnagModal(true)}
            className="bg-antiquegold hover:bg-antiquegold/90 text-white text-xs font-medium rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            {labels.addSnagBtn}
          </Button>

          <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-xl border border-gold/20">
            {(['en', 'hi', 'mr'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
                  language === lang ? 'bg-antiquegold text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Warning Banner */}
      {safetyCriticalOpenCount > 0 ? (
        <Card className="p-4 sm:p-5 bg-red-950/20 border-red-500/40 border-l-4 border-l-red-600 rounded-2xl">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
                {safetyCriticalOpenCount} Safety-Critical Snag(s) Hard-Blocking Handover
              </h3>
              <p className="text-xs text-red-600/90 dark:text-red-300/80">
                {labels.safetyBlockerNotice}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-5 bg-emerald-950/20 border-emerald-500/40 border-l-4 border-l-emerald-600 rounded-2xl">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {labels.allClosedNotice}
              </h3>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
                Independent QC re-verification is complete for all findings. Handover hard-block is cleared.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-surface border-gold/20 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-secondary" />
            <input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-hover border border-gold/20 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-text-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'safety_critical', 'functional', 'cosmetic'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all shrink-0 ${
                  severityFilter === sev 
                    ? 'bg-antiquegold text-white border-antiquegold font-bold' 
                    : 'bg-surface border-gold/20 text-text-secondary hover:text-text-primary'
                }`}
              >
                {sev === 'all' ? labels.filterAll : sev === 'safety_critical' ? 'Safety' : sev === 'functional' ? 'Functional' : 'Cosmetic'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Snag List Items */}
      <div className="space-y-3">
        {filteredSnags.length === 0 ? (
          <Card className="p-8 text-center bg-surface border-gold/20 rounded-2xl space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h3 className="text-base font-serif font-bold text-text-primary">No Defects / Snags Found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              No matching defect records found for this filter. All quality inspection requirements are currently satisfied.
            </p>
          </Card>
        ) : (
          filteredSnags.map(snag => (
            <Card 
              key={snag.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                snag.severity === 'safety_critical' && snag.resolutionStatus !== 'qc_verified_closed'
                  ? 'bg-red-950/10 border-red-500/40 shadow-sm'
                  : 'bg-surface border-gold/20 hover:border-gold/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-antiquegold">{snag.snagCode}</span>
                    {getSeverityBadge(snag.severity)}
                    {getStatusBadge(snag.resolutionStatus)}
                  </div>

                  <h3 className="text-sm sm:text-base font-serif font-bold text-text-primary">
                    {snag.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {snag.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-text-secondary pt-1">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-antiquegold" />
                      Tech: <strong className="text-text-primary">{snag.assignedTechnicianName}</strong>
                    </span>
                    <span>Source: {snag.sourceChecklist.toUpperCase()}</span>
                    <span>Logged: {snag.createdAt}</span>
                  </div>

                  {snag.customerWaivedReason && (
                    <div className="mt-2 text-xs bg-purple-950/20 text-purple-700 dark:text-purple-300 p-2.5 rounded-xl border border-purple-500/30">
                      <strong>Customer Waived Reason:</strong> {snag.customerWaivedReason}
                    </div>
                  )}

                  {snag.reverifiedByInspectorName && (
                    <div className="mt-2 text-xs bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 p-2 rounded-xl border border-emerald-500/30 font-mono">
                      QC Verified & Closed by {snag.reverifiedByInspectorName} at {snag.reverifiedAt}
                    </div>
                  )}
                </div>

                {/* Actions Button Drawer Trigger */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSnag(activeSnag?.id === snag.id ? null : snag)}
                  className="shrink-0 border-gold/30 text-xs font-mono"
                >
                  {activeSnag?.id === snag.id ? 'Hide Controls' : 'Manage Snag'}
                </Button>
              </div>

              {/* Action Drawer */}
              {activeSnag?.id === snag.id && (
                <div className="mt-4 pt-4 border-t border-gold/15 space-y-3 bg-surface-hover/60 p-4 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-antiquegold">
                    QC Resolution & Rework Workflow
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {/* Status update options depending on role and severity */}
                    <Button
                      onClick={() => handleUpdateStatus(snag.id, 'rework_in_progress')}
                      variant="outline"
                      size="sm"
                      className="border-gold/30 text-xs font-mono"
                    >
                      <Wrench className="w-3.5 h-3.5 mr-1 text-antiquegold" />
                      {labels.reworkInProgBtn}
                    </Button>

                    <Button
                      onClick={() => handleUpdateStatus(snag.id, 'qc_verified_closed')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {labels.reverifyBtn}
                    </Button>

                    {snag.severity === 'cosmetic' && (
                      <Button
                        onClick={() => handleUpdateStatus(snag.id, 'customer_waived_cosmetic')}
                        className="bg-purple-800 hover:bg-purple-900 text-white text-xs font-mono"
                      >
                        {labels.waiveBtn}
                      </Button>
                    )}

                    <Button
                      onClick={() => handleUpdateStatus(snag.id, 'admin_escalated')}
                      variant="outline"
                      className="border-red-500/40 text-red-600 dark:text-red-400 text-xs font-mono"
                    >
                      <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                      {labels.escalateBtn}
                    </Button>
                  </div>

                  {/* Optional notes input */}
                  <div>
                    <input
                      type="text"
                      placeholder="Add resolution or waiver justification note..."
                      value={reworkNoteInput}
                      onChange={e => setReworkNoteInput(e.target.value)}
                      className="w-full bg-surface border border-gold/30 rounded-xl p-2.5 text-xs text-text-primary font-mono mt-1"
                    />
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add Field Snag Modal */}
      {showAddSnagModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-surface border-gold/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold/15 pb-3">
              <h3 className="text-base font-bold font-serif text-text-primary">
                Add New QC Field Snag / Defect
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowAddSnagModal(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-text-secondary block mb-1">Snag Title / Defect Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Counterweight guide shoe alignment friction sound"
                  value={newSnagTitle}
                  onChange={e => setNewSnagTitle(e.target.value)}
                  className="w-full bg-surface border border-gold/30 rounded-xl p-2.5 text-text-primary"
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Severity Category</label>
                <select
                  value={newSnagSeverity}
                  onChange={e => setNewSnagSeverity(e.target.value as any)}
                  className="w-full bg-surface border border-gold/30 rounded-xl p-2.5 text-text-primary font-mono"
                >
                  <option value="safety_critical">Safety-Critical (Hard-Blocks Handover)</option>
                  <option value="functional">Functional (Operational / Acoustic)</option>
                  <option value="cosmetic">Cosmetic (Minor Visual Note)</option>
                </select>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Detailed Description & Location</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise floor level, part name, or observation notes..."
                  value={newSnagDesc}
                  onChange={e => setNewSnagDesc(e.target.value)}
                  className="w-full bg-surface border border-gold/30 rounded-xl p-2.5 text-text-primary font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddSnagModal(false)} className="flex-1 text-xs font-mono">
                Cancel
              </Button>
              <Button onClick={handleCreateSnag} className="flex-1 bg-antiquegold text-white text-xs font-semibold">
                Log Defect Record
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-gold/20 shadow-lg z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs font-mono text-text-secondary">
            Total Open: <strong className="text-antiquegold">{totalOpenCount}</strong> | Safety Blockers: <strong className="text-red-500">{safetyCriticalOpenCount}</strong>
          </div>

          <Button
            onClick={() => onNavigateToElectricalQc ? onNavigateToElectricalQc(jobId) : onBack()}
            className="bg-antiquegold text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md"
          >
            Return to Electrical & Safety QC
          </Button>
        </div>
      </div>
    </div>
  );
};
