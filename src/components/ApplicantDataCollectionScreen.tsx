import React, { useState, useEffect } from 'react';
import {
  User,
  RecruitmentApplicantRecord,
  ApplicantReferenceContact
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  User as UserIcon,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  Upload,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Save,
  PhoneCall,
  Calendar
} from 'lucide-react';

interface ApplicantDataCollectionScreenProps {
  user: User;
  applicantId: string;
  onBack?: () => void;
  onComplete?: (applicant: RecruitmentApplicantRecord) => void;
}

export const ApplicantDataCollectionScreen: React.FC<ApplicantDataCollectionScreenProps> = ({
  user,
  applicantId,
  onBack,
  onComplete
}) => {
  const [applicant, setApplicant] = useState<RecruitmentApplicantRecord | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [autoSaveMsg, setAutoSaveMsg] = useState<string | null>(null);

  // Form Fields
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [primaryRole, setPrimaryRole] = useState<'surveyor' | 'technician' | 'supplier' | 'sales_rep'>('technician');
  const [dob, setDob] = useState('1995-08-20');
  const [fullAddress, setFullAddress] = useState('');
  const [pincode, setPincode] = useState('411038');
  const [experienceYears, setExperienceYears] = useState(3);
  const [experienceSummary, setExperienceSummary] = useState('');
  const [hasPriorElevatorExperience, setHasPriorElevatorExperience] = useState(true);
  const [territoryPreferences, setTerritoryPreferences] = useState<string[]>(['Pune West', 'PCMC']);
  const [availabilityTimeframe, setAvailabilityTimeframe] = useState<'immediate' | '1_2_weeks' | '1_month'>('immediate');
  
  // Reference contacts
  const [referenceContacts, setReferenceContacts] = useState<ApplicantReferenceContact[]>([
    {
      id: 'ref_1',
      name: 'Santosh Kale',
      phone: '+91 98901 23456',
      relation: 'Former Site Manager',
      verificationStatus: 'unverified'
    }
  ]);

  // Documents
  const [idProofUploaded, setIdProofUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [bankDetailsProvided, setBankDetailsProvided] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Pune/Maharashtra Zones
  const availableTerritories = [
    'Pune West (Kothrud, Bavdhan, Baner)',
    'Pune Central (Shivajinagar, Deccan)',
    'PCMC (Pimpri, Chinchwad, Bhosari)',
    'Chakan & Industrial Hub',
    'Pune East (Hadapsar, Kharadi, Wagholi)',
    'Pune South (Katraj, Dhankawadi, Kondhwa)',
    'Navi Mumbai & Thane Belt'
  ];

  // Load existing applicant or fallback
  useEffect(() => {
    const existing = DbManager.getRecruitmentApplicantById(applicantId);
    if (existing) {
      setApplicant(existing);
      setApplicantName(existing.applicantName || '');
      setApplicantPhone(existing.applicantPhone || '');
      setPrimaryRole(existing.primaryRole || 'technician');
      if (existing.dob) setDob(existing.dob);
      if (existing.fullAddress) setFullAddress(existing.fullAddress);
      if (existing.pincode) setPincode(existing.pincode);
      if (existing.experienceYears !== undefined) setExperienceYears(existing.experienceYears);
      if (existing.experienceSummary) setExperienceSummary(existing.experienceSummary);
      if (existing.hasPriorElevatorExperience !== undefined) setHasPriorElevatorExperience(existing.hasPriorElevatorExperience);
      if (existing.territoryPreferences && existing.territoryPreferences.length > 0) setTerritoryPreferences(existing.territoryPreferences);
      if (existing.availabilityTimeframe) setAvailabilityTimeframe(existing.availabilityTimeframe);
      if (existing.referenceContacts && existing.referenceContacts.length > 0) setReferenceContacts(existing.referenceContacts);
      if (existing.idProofUploaded) setIdProofUploaded(true);
      if (existing.licenseUploaded) setLicenseUploaded(true);
      if (existing.bankDetailsProvided) setBankDetailsProvided(true);
    } else {
      // Create skeleton
      setApplicantName(user.name || 'New Applicant');
      setApplicantPhone(user.phone || '+91 98220 11223');
    }
  }, [applicantId, user]);

  // Draft Auto-Save
  const triggerAutoSave = () => {
    const updated: RecruitmentApplicantRecord = {
      id: applicantId || `app_${Date.now()}`,
      applicantName,
      applicantPhone,
      interestedRoles: applicant ? applicant.interestedRoles : [primaryRole],
      primaryRole,
      applicationSource: applicant?.applicationSource || 'direct_search',
      initialInterestTimestamp: applicant?.initialInterestTimestamp || new Date().toISOString(),
      dob,
      fullAddress,
      pincode,
      experienceYears,
      experienceSummary,
      hasPriorElevatorExperience,
      territoryPreferences,
      availabilityTimeframe,
      referenceContacts,
      idProofUploaded,
      licenseUploaded,
      bankDetailsProvided,
      status: 'draft',
      lastSavedAt: new Date().toISOString()
    };

    DbManager.saveRecruitmentApplicant(updated);
    setAutoSaveMsg(`Draft auto-saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    setTimeout(() => setAutoSaveMsg(null), 3000);
  };

  const handleToggleTerritory = (t: string) => {
    setTerritoryPreferences(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const handleAddReference = () => {
    setReferenceContacts(prev => [
      ...prev,
      {
        id: `ref_${Date.now()}`,
        name: '',
        phone: '',
        relation: 'Colleague / Supervisor',
        verificationStatus: 'unverified'
      }
    ]);
  };

  const handleRemoveReference = (id: string) => {
    setReferenceContacts(prev => prev.filter(r => r.id !== id));
  };

  const handleFinalSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const finalRecord: RecruitmentApplicantRecord = {
        id: applicantId || `app_${Date.now()}`,
        applicantName,
        applicantPhone,
        interestedRoles: applicant ? applicant.interestedRoles : [primaryRole],
        primaryRole,
        applicationSource: applicant?.applicationSource || 'direct_search',
        initialInterestTimestamp: applicant?.initialInterestTimestamp || new Date().toISOString(),
        dob,
        fullAddress,
        pincode,
        experienceYears,
        experienceSummary,
        hasPriorElevatorExperience,
        territoryPreferences,
        availabilityTimeframe,
        referenceContacts,
        idProofUploaded,
        licenseUploaded,
        bankDetailsProvided,
        status: 'submitted',
        lastSavedAt: new Date().toISOString()
      };

      DbManager.saveRecruitmentApplicant(finalRecord);
      setIsSubmitting(false);
      if (onComplete) onComplete(finalRecord);
    }, 800);
  };

  const stepTitles = [
    { num: 1, title: 'Personal Details', icon: UserIcon },
    { num: 2, title: 'Experience & Skills', icon: Briefcase },
    { num: 3, title: 'Territory & Availability', icon: MapPin },
    { num: 4, title: 'References & Documents', icon: FileText },
    { num: 5, title: 'Final Review & Submit', icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] py-6 px-4 sm:px-8 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-serif font-bold text-[var(--color-text-primary)]">
                  Partner Application Data Collection
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                  {primaryRole}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Applicant: <strong className="text-[var(--color-text-primary)]">{applicantName || 'Guest Applicant'}</strong> ({applicantPhone})
              </p>
            </div>
          </div>

          {/* Auto-Save Status */}
          <div className="flex items-center gap-3">
            {autoSaveMsg && (
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                <Check className="w-3 h-3" /> {autoSaveMsg}
              </span>
            )}
            <Button
              onClick={triggerAutoSave}
              className="text-xs px-3 py-1.5 bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              <span>Save Draft</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-6">
        
        {/* Ascension Line Progress Bar */}
        <Card className="p-4 mb-6 border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="relative flex items-center justify-between">
            {/* Gold Rail background */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--color-border)] z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--color-accent-primary)] transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            {stepTitles.map(s => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => {
                    triggerAutoSave();
                    setCurrentStep(s.num as any);
                  }}
                  className={`relative z-10 flex flex-col items-center group cursor-pointer`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isPassed
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : isActive
                      ? 'bg-[var(--color-accent-primary)] text-white ring-4 ring-[var(--color-accent-primary)]/20'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold hidden sm:inline-block ${
                    isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)]'
                  }`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 animate-fadeIn">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
              <UserIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <span>Personal Details & Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Full Name (as per Aadhaar / PAN) *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={applicantPhone}
                  onChange={e => setApplicantPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 411038"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Full Residential Address
              </label>
              <textarea
                rows={2}
                placeholder="House/Flat No, Street, Landmark, Area, City"
                value={fullAddress}
                onChange={e => setFullAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                onClick={() => {
                  triggerAutoSave();
                  setCurrentStep(2);
                }}
                className="bg-[var(--color-accent-primary)] text-white text-xs px-5 py-2.5 font-semibold flex items-center gap-1.5"
              >
                <span>Save & Continue to Experience</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Experience & Skills */}
        {currentStep === 2 && (
          <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 animate-fadeIn">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
              <Briefcase className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <span>Work Experience & Trade Skills</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Total Industry Experience (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={experienceYears}
                  onChange={e => setExperienceYears(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  Prior Elevator Sector Work?
                </label>
                <div className="flex items-center gap-4 mt-1.5">
                  <label className="flex items-center gap-2 text-xs text-[var(--color-text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      checked={hasPriorElevatorExperience}
                      onChange={() => setHasPriorElevatorExperience(true)}
                      className="accent-[var(--color-accent-primary)]"
                    />
                    <span>Yes, direct elevator experience</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--color-text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      checked={!hasPriorElevatorExperience}
                      onChange={() => setHasPriorElevatorExperience(false)}
                      className="accent-[var(--color-accent-primary)]"
                    />
                    <span>No, related mechanical/electrical</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Experience Description & Hands-on Work History
              </label>
              <textarea
                rows={4}
                placeholder="Describe your previous work roles, projects, companies worked with, or informal site experience (e.g. 3 years guide-rail fitting, electrical panel wiring, civil site measurements)..."
                value={experienceSummary}
                onChange={e => setExperienceSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
              />
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                Informal or non-certified hands-on work is welcomed. Be descriptive about tools and equipment you are comfortable handling.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                className="bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs px-4 py-2"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  triggerAutoSave();
                  setCurrentStep(3);
                }}
                className="bg-[var(--color-accent-primary)] text-white text-xs px-5 py-2.5 font-semibold flex items-center gap-1.5"
              >
                <span>Save & Continue to Territory</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Territory & Availability */}
        {currentStep === 3 && (
          <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 animate-fadeIn">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
              <MapPin className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <span>Territory Preference & Work Availability</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                Preferred Operating Zones (Select all that apply) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableTerritories.map(t => {
                  const isChecked = territoryPreferences.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTerritory(t)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] font-semibold'
                          : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      <span>{t}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                Work Availability Timeframe
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'immediate', label: 'Immediate' },
                  { id: '1_2_weeks', label: '1 - 2 Weeks' },
                  { id: '1_month', label: 'Within 1 Month' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvailabilityTimeframe(opt.id as any)}
                    className={`p-3 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      availabilityTimeframe === opt.id
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 font-bold text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs px-4 py-2"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  triggerAutoSave();
                  setCurrentStep(4);
                }}
                className="bg-[var(--color-accent-primary)] text-white text-xs px-5 py-2.5 font-semibold flex items-center gap-1.5"
              >
                <span>Save & Continue to References</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: References & Documents */}
        {currentStep === 4 && (
          <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 animate-fadeIn">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
              <FileText className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <span>References & Verification Documents</span>
            </h2>

            {/* Reference Contacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Reference Contacts (Previous Manager / Colleague)
                </label>
                <button
                  type="button"
                  onClick={handleAddReference}
                  className="text-xs text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Reference
                </button>
              </div>

              <div className="space-y-3">
                {referenceContacts.map((ref, idx) => (
                  <div key={ref.id} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">Reference #{idx + 1}</span>
                      {referenceContacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReference(ref.id)}
                          className="text-xs text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={ref.name}
                        onChange={e => {
                          const val = e.target.value;
                          setReferenceContacts(prev => prev.map(r => r.id === ref.id ? { ...r, name: val } : r));
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={ref.phone}
                        onChange={e => {
                          const val = e.target.value;
                          setReferenceContacts(prev => prev.map(r => r.id === ref.id ? { ...r, phone: val } : r));
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                      />
                      <input
                        type="text"
                        placeholder="Relation e.g. Site Supervisor"
                        value={ref.relation}
                        onChange={e => {
                          const val = e.target.value;
                          setReferenceContacts(prev => prev.map(r => r.id === ref.id ? { ...r, relation: val } : r));
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Checklist */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                Document Readiness (Upload or confirm availability)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: 'Government ID Proof',
                    sub: 'Aadhaar Card or PAN Card',
                    state: idProofUploaded,
                    setState: setIdProofUploaded
                  },
                  {
                    title: 'Trade Cert / Wireman License',
                    sub: 'ITI / Wireman / Civil Diploma (if applicable)',
                    state: licenseUploaded,
                    setState: setLicenseUploaded
                  },
                  {
                    title: 'Bank Account Passbook',
                    sub: 'For direct payout settlements',
                    state: bankDetailsProvided,
                    setState: setBankDetailsProvided
                  }
                ].map((doc, i) => (
                  <div
                    key={i}
                    onClick={() => doc.setState(!doc.state)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      doc.state
                        ? 'border-emerald-500 bg-emerald-500/10 text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{doc.title}</span>
                        {doc.state ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Upload className="w-4 h-4 text-[var(--color-text-secondary)]" />}
                      </div>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">{doc.sub}</p>
                    </div>

                    <div className="mt-3 text-[11px] font-semibold text-right text-[var(--color-accent-primary)]">
                      {doc.state ? 'Uploaded / Ready' : 'Click to Mark Uploaded'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs px-4 py-2"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  triggerAutoSave();
                  setCurrentStep(5);
                }}
                className="bg-[var(--color-accent-primary)] text-white text-xs px-5 py-2.5 font-semibold flex items-center gap-1.5"
              >
                <span>Proceed to Final Review</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: Final Review & Submission */}
        {currentStep === 5 && (
          <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <span>Review & Submit Partner Application</span>
              </h2>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Ready for Review
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
                <div className="font-bold text-[var(--color-text-primary)] text-sm">{applicantName}</div>
                <div className="text-[var(--color-text-secondary)]">Phone: {applicantPhone}</div>
                <div className="text-[var(--color-text-secondary)]">Target Role: <strong className="uppercase text-[var(--color-accent-primary)]">{primaryRole}</strong></div>
                <div className="text-[var(--color-text-secondary)]">Address: {fullAddress || 'Not provided'}, {pincode}</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
                <div className="font-bold text-[var(--color-text-primary)]">Experience Summary</div>
                <div className="text-[var(--color-text-secondary)]">{experienceYears} Years • {hasPriorElevatorExperience ? 'Direct Elevator Sector' : 'General Engineering'}</div>
                <p className="text-[11px] text-[var(--color-text-secondary)] italic line-clamp-2">
                  "{experienceSummary || 'No additional summary provided.'}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
                <div className="font-bold text-[var(--color-text-primary)]">Territories & Availability</div>
                <div className="text-[var(--color-text-secondary)]">Zones: {territoryPreferences.join(', ')}</div>
                <div className="text-[var(--color-text-secondary)]">Availability: <strong className="capitalize">{availabilityTimeframe.replace('_', ' ')}</strong></div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5">
                <div className="font-bold text-[var(--color-text-primary)]">References & Documents</div>
                <div className="text-[var(--color-text-secondary)]">{referenceContacts.length} Reference Contacts Listed</div>
                <div className="text-[var(--color-text-secondary)] flex items-center gap-2">
                  <span>ID: {idProofUploaded ? '✓' : '✗'}</span>
                  <span>License: {licenseUploaded ? '✓' : '✗'}</span>
                  <span>Bank: {bankDetailsProvided ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20 text-xs leading-relaxed text-[var(--color-text-primary)] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Zero Friction Screening SLA</strong>
                Upon submission, your application enters the HQ Partner Review queue. Approved applicants directly receive a mobile login invite to proceed into role-specific onboarding and dispatch allocation.
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs px-4 py-2"
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmission}
                disabled={isSubmitting}
                className="bg-[var(--color-accent-primary)] text-white text-xs px-6 py-3 font-bold flex items-center gap-2 shadow-lg hover:bg-[var(--color-accent-primary)]/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Submitting Profile...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Application for Screening</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
};
