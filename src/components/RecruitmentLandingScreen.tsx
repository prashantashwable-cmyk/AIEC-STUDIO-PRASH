import React, { useState, useEffect } from 'react';
import {
  User,
  RecruitmentApplicantRecord
} from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import {
  Compass,
  Wrench,
  Truck,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  QrCode,
  Share2,
  PhoneCall,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Briefcase,
  Layers,
  Award,
  Zap,
  Check
} from 'lucide-react';

interface RecruitmentLandingScreenProps {
  user: User;
  onNavigateToDataCollection: (applicantId: string) => void;
  onNavigateToRoleWizard?: (role: string) => void;
  onNavigateToScreening?: () => void;
  onNavigateToInterview?: () => void;
  onNavigateToVerification?: () => void;
  onNavigateToOffer?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToTierAssignment?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToExitScreen?: (partnerId?: string) => void;
  onNavigateToTrainingLibrary?: () => void;
  onBack?: () => void;
}

export const RecruitmentLandingScreen: React.FC<RecruitmentLandingScreenProps> = ({
  user,
  onNavigateToDataCollection,
  onNavigateToRoleWizard,
  onNavigateToScreening,
  onNavigateToInterview,
  onNavigateToVerification,
  onNavigateToOffer,
  onNavigateToDashboard,
  onNavigateToTierAssignment,
  onNavigateToDirectory,
  onNavigateToExitScreen,
  onNavigateToTrainingLibrary,
  onBack
}) => {

  // Primary Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'surveyor' | 'technician' | 'supplier' | 'sales_rep'>('technician');
  const [source, setSource] = useState<RecruitmentApplicantRecord['applicationSource']>('qr_flyer');
  const [sourceDetails, setSourceDetails] = useState('Kothrud Industrial Park Flyer QR');

  // Guided "Help Me Choose" State
  const [showGuidedWizard, setShowGuidedWizard] = useState(false);
  const [guidedAnswerPref, setGuidedAnswerPref] = useState<'field_measurement' | 'assembly' | 'commercial_supply' | 'sales_deals'>('assembly');

  // Multi-interest tracking notice
  const [existingMatchNotice, setExistingMatchNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<RecruitmentApplicantRecord | null>(null);

  // Check phone number on change
  useEffect(() => {
    if (applicantPhone.trim().length >= 10) {
      const existing = DbManager.getRecruitmentApplicants().find(a => a.applicantPhone.replace(/\D/g, '') === applicantPhone.replace(/\D/g, ''));
      if (existing) {
        setExistingMatchNotice(
          `Welcome back ${existing.applicantName}! You previously expressed interest in ${existing.interestedRoles.join(', ')}. Submitting this form will add ${selectedRole.toUpperCase()} to your active application profiles.`
        );
      } else {
        setExistingMatchNotice(null);
      }
    } else {
      setExistingMatchNotice(null);
    }
  }, [applicantPhone, selectedRole]);

  // Handle Initial Application Submission
  const handleSubmitInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || applicantPhone.length < 10) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newApplicantId = `app_${Date.now()}`;
      const record: RecruitmentApplicantRecord = {
        id: newApplicantId,
        applicantName,
        applicantPhone,
        interestedRoles: [selectedRole],
        primaryRole: selectedRole,
        applicationSource: source,
        sourceDetails,
        initialInterestTimestamp: new Date().toISOString(),
        status: 'draft'
      };

      DbManager.saveRecruitmentApplicant(record);
      setIsSubmitting(false);
      setSubmitSuccess(record);
    }, 600);
  };

  // Role comparison metadata
  const roleCards = [
    {
      id: 'technician' as const,
      title: 'Elevator Installation & Service Tech',
      icon: Wrench,
      badge: 'High Demand',
      earnings: '₹35,000 – ₹65,000 / month',
      structure: 'Piece-rate per shaft milestone + performance incentive',
      responsibilities: [
        'Mechanical guide rail alignment & car frame assembly',
        'Fuji/Yaskawa VFD controller wiring & safety limit testing',
        'SOP compliance photo log uploading on mobile app'
      ],
      aiecProvides: ['Safety harness & PPE kit', 'Digital SOP Mobile App', 'Group Accident Insurance', 'Technical Training'],
      partnerProvides: ['Android Smartphone', 'Basic Technician Hand Tool Set', 'Clean Safety Record']
    },
    {
      id: 'surveyor' as const,
      title: 'Precision Shaft Surveyor',
      icon: Compass,
      badge: 'Flexible Hours',
      earnings: '₹25,000 – ₹45,000 / month',
      structure: 'Fixed fee per completed laser site survey + Travel Allowance',
      responsibilities: [
        '3D Laser hoistway depth, pit depth & overhead measurement',
        '3-Phase power supply & wall structure verification',
        'Instant drawing submission via AIEC Surveyor App'
      ],
      aiecProvides: ['Laser Distance Meter', 'Site Measurement App', 'Conveyance Allowance', 'Civil Support'],
      partnerProvides: ['Android Phone with Camera', 'Two-wheeler / Vehicle', 'Punctuality']
    },
    {
      id: 'supplier' as const,
      title: 'Component & OEM Supplier Partner',
      icon: Truck,
      badge: 'B2B Scale',
      earnings: '₹1.5 Lakh – ₹12 Lakh / order',
      structure: 'Purchase Order stage payments + 3-Way Match Settlement',
      responsibilities: [
        'Deliver BIS/CE certified elevator structures, cabins & doors',
        'Barcode stock tracking & dispatch timeline adherence',
        'Real-time delivery confirmation in Supplier Portal'
      ],
      aiecProvides: ['Guaranteed PO Contracts', 'Prompt 3-Way Matching', 'Transparent Scorecards', 'HQ Logistics Support'],
      partnerProvides: ['Valid GSTIN & Manufacturing Unit', 'Quality Compliance Certificates', 'Stock Readiness']
    },
    {
      id: 'sales_rep' as const,
      title: 'Territory Sales Partner',
      icon: Users,
      badge: 'High Commission',
      earnings: '₹50,000 – ₹1.2 Lakh / month',
      structure: 'Base retainer + 3% to 5% commission on closed elevator deals',
      responsibilities: [
        'Architect & builder client consultation for home/commercial lifts',
        'Custom quotation generation using AIEC Quotation Engine',
        'Client handover coordination'
      ],
      aiecProvides: ['3D CAD Renderings', 'Instant Price Engine', 'Sales Collateral', 'HQ Closing Support'],
      partnerProvides: ['Sales Acumen & Local Network', 'Client Follow-up Discipline', 'Professional Demeanor']
    }
  ];

  const handleGuidedRecommendation = () => {
    if (guidedAnswerPref === 'assembly') setSelectedRole('technician');
    else if (guidedAnswerPref === 'field_measurement') setSelectedRole('surveyor');
    else if (guidedAnswerPref === 'commercial_supply') setSelectedRole('supplier');
    else setSelectedRole('sales_rep');
    setShowGuidedWizard(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[var(--color-accent-secondary)] to-[#0A392F] text-white pt-8 pb-12 px-4 sm:px-8 border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1 mb-4 transition-colors"
            >
              ← Back to Dashboard
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[var(--color-accent-primary)] text-xs font-semibold mb-3 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                <span>AIEC Asset-Light Partner Network • Pune & Maharashtra</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                Partner & Worker Recruitment Portal
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-2 max-w-2xl leading-relaxed">
                Join All India Elevators Company as a certified Technician, Site Surveyor, OEM Supplier, or Sales Representative. Transparent earnings, digital SOP tools, and direct mobile dispatch.
              </p>
            </div>

            {/* Live Surge & SLA Ticker */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[260px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-accent-primary)] flex items-center gap-1">
                  <Zap className="w-3 h-3 animate-pulse" /> Live Regional Recruitment Drive
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <div className="text-sm font-semibold text-white">
                Pune, PCMC & Chakan Hub
              </div>
              <p className="text-xs text-white/70 mt-1">
                Active Openings: <span className="font-mono text-white font-bold">18 Techs • 6 Surveyors</span>
              </p>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
                <span>Application SLA:</span>
                <span className="font-semibold text-amber-300">Response within 24 Hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-6">
        {/* Admin Quick Pipeline Shortcuts */}
        {user.role === 'admin' && (
          <Card className="p-3.5 mb-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)]">
              <Sparkles className="w-4 h-4 text-[var(--color-accent-primary)]" />
              <span>Admin Recruitment Pipeline Shortcuts:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {onNavigateToScreening && (
                <Button
                  onClick={onNavigateToScreening}
                  className="px-3 py-1.5 text-xs bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20 font-semibold hover:bg-[var(--color-accent-primary)] hover:text-white"
                >
                  Screening Queue
                </Button>
              )}
              {onNavigateToInterview && (
                <Button
                  onClick={onNavigateToInterview}
                  className="px-3 py-1.5 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold hover:bg-[var(--color-surface)]"
                >
                  Interview Calendar
                </Button>
              )}
              {onNavigateToVerification && (
                <Button
                  onClick={onNavigateToVerification}
                  className="px-3 py-1.5 text-xs bg-[var(--color-accent-secondary)]/10 text-[var(--color-accent-secondary)] border border-[var(--color-accent-secondary)]/20 font-semibold hover:bg-[var(--color-accent-secondary)] hover:text-white shrink-0"
                >
                  Verification Gate
                </Button>
              )}
              {onNavigateToOffer && (
                <Button
                  onClick={onNavigateToOffer}
                  className="px-3 py-1.5 text-xs bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm shrink-0"
                >
                  Offer & Contract
                </Button>
              )}
              {onNavigateToDashboard && (
                <Button
                  onClick={onNavigateToDashboard}
                  className="px-3 py-1.5 text-xs bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold hover:bg-[var(--color-bg)] shrink-0"
                >
                  Funnel Dashboard
                </Button>
              )}
              {onNavigateToTierAssignment && (
                <Button
                  onClick={onNavigateToTierAssignment}
                  className="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold hover:bg-amber-500 hover:text-white shrink-0"
                >
                  Tier Assignment
                </Button>
              )}
              {onNavigateToDirectory && (
                <Button
                  onClick={onNavigateToDirectory}
                  className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold hover:bg-emerald-500 hover:text-white shrink-0"
                >
                  Master Directory
                </Button>
              )}
              {onNavigateToExitScreen && (
                <Button
                  onClick={() => onNavigateToExitScreen()}
                  className="px-3 py-1.5 text-xs bg-rose-500/10 text-rose-600 border border-rose-500/20 font-semibold hover:bg-rose-500 hover:text-white shrink-0"
                >
                  Offboarding / Exit
                </Button>
              )}
              {onNavigateToTrainingLibrary && (
                <Button
                  onClick={onNavigateToTrainingLibrary}
                  className="px-3 py-1.5 text-xs bg-[var(--color-accent-primary)] text-white font-semibold shadow-sm shrink-0 flex items-center gap-1"
                >
                  <span>Training & SOP Library</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              )}

            </div>
          </Card>
        )}

        {/* Main Grid: Form on Left/Top, Roles Breakdown on Right/Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Direct Express Interest Form */}
          <div className="lg:col-span-5">
            <Card className="p-6 border-[var(--color-border)] shadow-lg bg-[var(--color-surface)] sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">Express Interest</h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">Takes less than 1 minute</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuidedWizard(true)}
                  className="text-xs text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 font-semibold"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Help Me Choose
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-5 rounded-xl bg-[var(--color-accent-secondary)]/10 border border-[var(--color-accent-secondary)]/30 text-center animate-fadeIn">
                  <CheckCircle2 className="w-10 h-10 text-[var(--color-accent-secondary)] mx-auto mb-2" />
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    Interest Registered!
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-4 leading-relaxed">
                    Thank you, <span className="font-semibold text-[var(--color-text-primary)]">{submitSuccess.applicantName}</span>. Your application for <span className="font-bold uppercase text-[var(--color-accent-secondary)]">{submitSuccess.primaryRole}</span> has been saved.
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => onNavigateToDataCollection(submitSuccess.id)}
                      className="w-full bg-[var(--color-accent-primary)] text-white font-semibold text-xs py-3 flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>Continue to Full Profile & Documents</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() => setSubmitSuccess(null)}
                      className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] py-1"
                    >
                      Submit for another person / role
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitInterest} className="space-y-4">
                  {existingMatchNotice && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{existingMatchNotice}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Shelar"
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                    />
                  </div>

                  {/* Mobile Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Mobile Number (WhatsApp Enabled) *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+91 98220 12345"
                        value={applicantPhone}
                        onChange={e => setApplicantPhone(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                      />
                      {applicantPhone.trim().length >= 10 && (
                        <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                      )}
                    </div>
                  </div>

                  {/* Interested Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Select Role Interest *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roleCards.map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRole(r.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            selectedRole === r.id
                              ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 ring-1 ring-[var(--color-accent-primary)]'
                              : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface)]'
                          }`}
                        >
                          <r.icon className={`w-4 h-4 mb-2 ${selectedRole === r.id ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
                          <div>
                            <div className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">{r.title.split(' ')[0]}</div>
                            <div className="text-[10px] text-[var(--color-text-secondary)] truncate">{r.badge}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recruitment Source Attribution */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      How did you hear about AIEC?
                    </label>
                    <select
                      value={source}
                      onChange={e => setSource(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                    >
                      <option value="qr_flyer">Print Flyer / QR Code Banner</option>
                      <option value="whatsapp_referral">WhatsApp Referral from AIEC Partner</option>
                      <option value="social_media">Social Media / Digital Ad</option>
                      <option value="field_agent">AIEC Field Scout / Supervisor</option>
                      <option value="direct_search">Direct Web Search / Website</option>
                      <option value="other">Other Source</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Source Details / Referrer Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kothrud QR Poster or Amit Sharma"
                      value={sourceDetails}
                      onChange={e => setSourceDetails(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !applicantName || applicantPhone.length < 10}
                    className="w-full bg-[var(--color-accent-primary)] text-white font-semibold text-xs py-3.5 flex items-center justify-center gap-2 shadow-md hover:bg-[var(--color-accent-primary)]/90 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Registering Application...</span>
                    ) : (
                      <>
                        <span>Submit Initial Interest</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-center text-[var(--color-text-secondary)]">
                    By submitting, you agree to receive SMS/WhatsApp updates regarding your partner application status. No fees are ever charged for AIEC recruitment.
                  </p>
                </form>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: Detailed Role Descriptions & Earnings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <span>Partner Tracks & Earnings Breakdown</span>
              </h2>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                4 Specialized Roles
              </span>
            </div>

            <div className="space-y-4">
              {roleCards.map(r => {
                const isSelected = selectedRole === r.id;
                return (
                  <Card
                    key={r.id}
                    className={`p-5 transition-all border ${
                      isSelected
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-surface)] ring-1 ring-[var(--color-accent-primary)] shadow-md'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
                        }`}>
                          <r.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{r.title}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
                              {r.badge}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[var(--color-accent-secondary)] mt-0.5 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{r.earnings}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => setSelectedRole(r.id)}
                        className={`text-xs px-3 py-1.5 font-semibold ${
                          isSelected
                            ? 'bg-[var(--color-accent-primary)] text-white'
                            : 'bg-[var(--color-bg)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)]/10'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Track'}
                      </Button>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">
                      <strong className="text-[var(--color-text-primary)]">Payout Model:</strong> {r.structure}
                    </p>

                    {/* Responsibilities list */}
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[11px] font-bold text-[var(--color-text-primary)] mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
                          <span>Core Responsibilities</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-[var(--color-text-secondary)]">
                          {r.responsibilities.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[var(--color-accent-primary)]">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-[var(--color-text-primary)] mb-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" />
                          <span>AIEC Provides vs Partner Brings</span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          <p className="text-[var(--color-text-secondary)]">
                            <span className="font-semibold text-[var(--color-accent-secondary)]">AIEC Gives:</span> {r.aiecProvides.join(', ')}
                          </p>
                          <p className="text-[var(--color-text-secondary)]">
                            <span className="font-semibold text-[var(--color-text-primary)]">You Bring:</span> {r.partnerProvides.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Guided "Help Me Choose" Modal Dialog */}
      {showGuidedWizard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  Role Recommendation Wizard
                </h3>
              </div>
              <button
                onClick={() => setShowGuidedWizard(false)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Which type of work best matches your background and daily work preference?
            </p>

            <div className="space-y-2 mb-6">
              {[
                { id: 'assembly', title: 'Hands-on Mechanical & Electrical Shaft Fitting', sub: 'Best for technicians, electricians, fitters' },
                { id: 'field_measurement', title: 'Laser Site Surveying & Dimensional Checks', sub: 'Best for civil diploma holders, site engineers' },
                { id: 'commercial_supply', title: 'Supplying Elevator Components & Sub-assemblies', sub: 'Best for manufacturers, OEM vendors' },
                { id: 'sales_deals', title: 'Consulting Clients & Closing Lift Contracts', sub: 'Best for sales executives, real estate partners' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setGuidedAnswerPref(opt.id as any)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    guidedAnswerPref === opt.id
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--color-text-primary)]">{opt.title}</div>
                    <div className="text-[10px] text-[var(--color-text-secondary)]">{opt.sub}</div>
                  </div>
                  {guidedAnswerPref === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                onClick={() => setShowGuidedWizard(false)}
                className="px-4 py-2 text-xs bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleGuidedRecommendation}
                className="px-4 py-2 text-xs bg-[var(--color-accent-primary)] text-white font-semibold flex items-center gap-1"
              >
                <span>Apply Selected Recommendation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
