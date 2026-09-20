import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Send,
  RefreshCw,
  Zap,
  PhoneCall,
  Mail,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Building,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, Button } from './Common';

const Badge = ({ children, className = '', variant }: { children: React.ReactNode; className?: string; variant?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1 border ${className}`}>
    {children}
  </span>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full px-3 py-2 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)] ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`block text-xs font-semibold text-[var(--color-text-secondary)] mb-1 ${className}`}>
    {children}
  </label>
);

import {
  User,
  WarrantyAmcRegistrationRecord,
  AsInstalledComponentWarranty,
  RenewalReminderItem
} from '../types';
import { DbManager } from '../lib/db';

interface WarrantyAmcRegistrationScreenProps {
  user: User;
  jobId: string;
  onBack: () => void;
  onNavigateToCertificate: (jobId: string) => void;
  onNavigateToWalkthrough?: (jobId: string) => void;
}

export const WarrantyAmcRegistrationScreen: React.FC<WarrantyAmcRegistrationScreenProps> = ({
  user,
  jobId,
  onBack,
  onNavigateToCertificate,
  onNavigateToWalkthrough
}) => {
  // Load existing or initialize
  const existingRecord = DbManager.getWarrantyAmcByJobId(jobId);

  const defaultAsInstalledMaterials: AsInstalledComponentWarranty[] = [
    {
      componentName: 'Fuji-Yaskawa VFD Inverter Drive 7.5kW (V3.2)',
      serialNumber: 'INV-FJ-2026-0982',
      isSubstitution: true,
      originalPartName: 'Yaskawa L1000A Inverter 7.5kW',
      warrantyCoverageDetails: 'Full 24-Month Manufacturer Warranty covering drive power modules & firmware'
    },
    {
      componentName: 'Monadrive Gearless PMSM Traction Machine 1.0 m/s',
      serialNumber: 'TRM-MN-8841-A',
      isSubstitution: false,
      warrantyCoverageDetails: '36-Month Mechanical & Motor Winding Manufacturer Warranty'
    },
    {
      componentName: 'Monarch NICE3000+ Integrated Elevator Controller',
      serialNumber: 'CTRL-MN-2026-112',
      isSubstitution: false,
      warrantyCoverageDetails: '24-Month Microprocessor Board Warranty'
    },
    {
      componentName: 'Exide 24V Sealed Lead-Acid ARD Battery Bank',
      serialNumber: 'BAT-EX-2026-5541',
      isSubstitution: false,
      warrantyCoverageDetails: '12-Month Battery Replacement Warranty'
    }
  ];

  const defaultReminders: RenewalReminderItem[] = [
    { reminderDate: '2026-11-15', channel: 'whatsapp', reminderType: 'first_quarterly_service', status: 'scheduled' },
    { reminderDate: '2027-06-15', channel: 'whatsapp', reminderType: 'renewal_60_days', status: 'scheduled' },
    { reminderDate: '2027-07-15', channel: 'email', reminderType: 'renewal_30_days', status: 'scheduled' },
    { reminderDate: '2027-08-07', channel: 'call', reminderType: 'renewal_7_days', status: 'scheduled' }
  ];

  const [customerName, setCustomerName] = useState<string>(
    existingRecord?.customerName || 'Kothrud Landmark Housing Society'
  );
  const [siteAddress, setSiteAddress] = useState<string>(
    existingRecord?.siteAddress || 'Plot 42, Mayur Colony, Kothrud, Pune - 411038'
  );
  const [mfgPartsMonths, setMfgPartsMonths] = useState<number>(
    existingRecord?.manufacturerPartsWarrantyMonths || 24
  );
  const [aiecLaborMonths, setAiecLaborMonths] = useState<number>(
    existingRecord?.aiecLaborWarrantyMonths || 12
  );

  const [amcTier, setAmcTier] = useState<
    'silver_basic' | 'gold_comprehensive' | 'platinum_priority' | 'opted_out_declined'
  >(existingRecord?.amcTierSelected || 'gold_comprehensive');

  const amcPrices: Record<string, number> = {
    silver_basic: 18000,
    gold_comprehensive: 35000,
    platinum_priority: 52000,
    opted_out_declined: 0
  };

  const [amcPrice, setAmcPrice] = useState<number>(
    existingRecord?.amcPricePerYear || amcPrices[amcTier]
  );
  const [customizationNotes, setCustomizationNotes] = useState<string>(
    existingRecord?.amcCustomizationNotes ||
      'Includes 4 scheduled quarterly preventive visits, 24x7 emergency breakdown dispatch, and free normal wear-and-tear component replacements.'
  );

  const [declinedSequenceActive, setDeclinedSequenceActive] = useState<boolean>(
    existingRecord?.declinedReengagementSequenceActive || false
  );

  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'warranty' | 'amc' | 'schedule'>('warranty');

  const handleSelectTier = (tier: 'silver_basic' | 'gold_comprehensive' | 'platinum_priority' | 'opted_out_declined') => {
    setAmcTier(tier);
    setAmcPrice(amcPrices[tier]);
    if (tier === 'opted_out_declined') {
      setDeclinedSequenceActive(true);
    } else {
      setDeclinedSequenceActive(false);
    }
  };

  const handleSaveRegistration = () => {
    const updatedRecord: WarrantyAmcRegistrationRecord = {
      id: existingRecord?.id || `war_${Date.now()}`,
      jobId,
      customerName,
      siteAddress,
      installationDate: existingRecord?.installationDate || '2026-08-15',
      manufacturerPartsWarrantyMonths: mfgPartsMonths,
      aiecLaborWarrantyMonths: aiecLaborMonths,
      asInstalledMaterialList: existingRecord?.asInstalledMaterialList || defaultAsInstalledMaterials,
      amcTierSelected: amcTier,
      amcPricePerYear: amcPrice,
      amcCustomizationNotes: customizationNotes,
      amcCoverageScope:
        amcTier === 'silver_basic'
          ? ['4 Quarterly Preventive Maintenance Visits', 'Emergency Breakdown Callouts (Billed at standard rate)', 'Annual Safety Audit']
          : amcTier === 'platinum_priority'
          ? [
              '6 Bi-monthly Preventive Servicing Visits',
              '24x7 Priority 30-Minute Breakdown Dispatch',
              '100% Free Replacement of Controller PCBs, VFD, Inverter & Motors',
              'Annual PWD Government Inspection Preparation & Certification Support'
            ]
          : [
              '4 Quarterly Preventive Maintenance Servicing Visits',
              '24x7 Free Emergency Breakdown Callouts',
              'Free Replacement of Contactors, Relays & Fuses',
              'Door Operator Adjustment & Sill Lubrication',
              'Annual Safety Brake & ARD Load Calibration Check'
            ],
      amcStartDate: '2026-08-15',
      amcEndDate: '2027-08-14',
      renewalReminderSchedule: defaultReminders,
      declinedReengagementSequenceActive: amcTier === 'opted_out_declined' ? declinedSequenceActive : false,
      registeredAt: new Date().toLocaleString(),
      registeredBy: user.name
    };

    DbManager.updateWarrantyAmcRegistration(updatedRecord);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onNavigateToCertificate(jobId);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h1 className="font-serif text-lg font-bold">Warranty & AMC Registration</h1>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Job #{jobId} • {customerName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]">
            Module 14 • Step 9
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex gap-2">
        <Button
          size="sm"
          variant={activeTabSection === 'warranty' ? 'default' : 'outline'}
          onClick={() => setActiveTabSection('warranty')}
          className="flex-1 text-xs"
        >
          <Award className="w-3.5 h-3.5 mr-1.5" />
          1. Coverage & Log
        </Button>
        <Button
          size="sm"
          variant={activeTabSection === 'amc' ? 'default' : 'outline'}
          onClick={() => setActiveTabSection('amc')}
          className="flex-1 text-xs"
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          2. AMC Enrollment
        </Button>
        <Button
          size="sm"
          variant={activeTabSection === 'schedule' ? 'default' : 'outline'}
          onClick={() => setActiveTabSection('schedule')}
          className="flex-1 text-xs"
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          3. Reminders
        </Button>
      </div>

      <div className="p-4 space-y-6 max-w-3xl mx-auto">
        {showSavedToast && (
          <div className="bg-[var(--color-accent-secondary)] text-white p-3 rounded-lg text-sm flex items-center gap-2 shadow-lg animate-pulse">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            Warranty & AMC Registration details saved! Generating Handover Certificate...
          </div>
        )}

        {/* SECTION 1: WARRANTY COVERAGE TERMS & AS-INSTALLED LOG */}
        {activeTabSection === 'warranty' && (
          <div className="space-y-6">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-serif font-semibold text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Base AIEC Warranty Guarantee
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Auto-configured from quotation tier & site handover date
                  </p>
                </div>
                <Badge className="bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border-0">
                  Active Guarantee
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>Manufacturer Parts Warranty</span>
                    <Badge variant="outline" className="text-[10px]">Tier A</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-[var(--color-accent-primary)]">{mfgPartsMonths}</span>
                    <span className="text-sm font-medium">Months Coverage</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Covers drive electronics, motor windings, controller boards, & ARD units.
                  </p>
                </div>

                <div className="bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>AIEC Installation Labor Warranty</span>
                    <Badge variant="outline" className="text-[10px]">Service SOP</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-bold text-[var(--color-accent-secondary)]">{aiecLaborMonths}</span>
                    <span className="text-sm font-medium">Months Quality Assurance</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Free labor for mechanical alignment, leveling calibration & wiring checks.
                  </p>
                </div>
              </div>
            </Card>

            {/* As-Installed Material Usage Log with Substitutions */}
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <div>
                  <h3 className="font-serif font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--color-accent-secondary)]" />
                    As-Installed Component Warranty Ledger
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Cross-referenced with Installation Module Material Usage Log
                  </p>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  {defaultAsInstalledMaterials.length} Key Components
                </Badge>
              </div>

              <div className="space-y-3">
                {defaultAsInstalledMaterials.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                      item.isSubstitution
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                            {item.componentName}
                          </span>
                          {item.isSubstitution && (
                            <Badge className="bg-amber-500 text-white text-[10px] py-0 px-1.5 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Documented Substitution
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                          S/N: {item.serialNumber || 'SN-PENDING-LOG'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {item.isSubstitution ? 'Custom Spec' : 'Standard Spec'}
                      </Badge>
                    </div>

                    {item.isSubstitution && (
                      <div className="p-2 rounded bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <strong>Substitution Record:</strong> Originally planned as <em>{item.originalPartName}</em>.
                          Warranty claim rules automatically apply to this <strong>actually installed Fuji-Yaskawa unit</strong>.
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-[var(--color-text-secondary)] bg-[var(--color-surface)] p-2 rounded border border-[var(--color-border)] flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--color-accent-secondary)] shrink-0" />
                      <span>{item.warrantyCoverageDetails}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 2: AMC ENROLLMENT OPTIONS & PRICING RULES */}
        {activeTabSection === 'amc' && (
          <div className="space-y-6">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-serif font-semibold text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Annual Maintenance Contract (AMC) Enrollment
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Pricing governs from central Pricing & Margin Configuration settings
                  </p>
                </div>
                <Badge className="bg-[var(--color-accent-secondary)] text-white">
                  Recurring Revenue
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Silver Plan */}
                <div
                  onClick={() => handleSelectTier('silver_basic')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 relative ${
                    amcTier === 'silver_basic'
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 shadow-md'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">Silver Basic</Badge>
                    {amcTier === 'silver_basic' && <Check className="w-4 h-4 text-[var(--color-accent-primary)]" />}
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold">₹18,000</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">/year</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[var(--color-text-secondary)]">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> 4 Quarterly Visits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Standard Breakdown Calls</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Oil & Grease Replenish</li>
                  </ul>
                </div>

                {/* Gold Plan (Recommended) */}
                <div
                  onClick={() => handleSelectTier('gold_comprehensive')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 relative ${
                    amcTier === 'gold_comprehensive'
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 shadow-lg ring-1 ring-[var(--color-accent-primary)]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-gray-400'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-accent-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[var(--color-accent-primary)] text-white text-xs">Gold Comprehensive</Badge>
                    {amcTier === 'gold_comprehensive' && <Check className="w-4 h-4 text-[var(--color-accent-primary)]" />}
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold">₹35,000</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">/year</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[var(--color-text-primary)]">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 4 Quarterly Servicing Visits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 24x7 Free Emergency Dispatch</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Free Relays, Fuses, Contactors</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Door Alignment & Sill Care</li>
                  </ul>
                </div>

                {/* Platinum Plan */}
                <div
                  onClick={() => handleSelectTier('platinum_priority')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-3 relative ${
                    amcTier === 'platinum_priority'
                      ? 'border-[var(--color-accent-secondary)] bg-[var(--color-accent-secondary)]/5 shadow-md'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs border-[var(--color-accent-secondary)] text-[var(--color-accent-secondary)]">Platinum 24x7</Badge>
                    {amcTier === 'platinum_priority' && <Check className="w-4 h-4 text-[var(--color-accent-secondary)]" />}
                  </div>
                  <div>
                    <span className="font-mono text-2xl font-bold">₹52,000</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">/year</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[var(--color-text-secondary)]">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> 6 Bi-monthly Service Visits</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Priority 30-Min Breakdown SLA</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> 100% Parts & PCB Coverage</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> PWD Govt Audit Filing Support</li>
                  </ul>
                </div>
              </div>

              {/* Decline Option */}
              <div
                onClick={() => handleSelectTier('opted_out_declined')}
                className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                  amcTier === 'opted_out_declined'
                    ? 'border-red-500 bg-red-500/10 text-red-900 dark:text-red-200'
                    : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <div>
                    <span className="font-semibold">Customer Opted Out / Declined AMC at Handover</span>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      Standard warranty applies. Triggers automatic re-engagement campaign via Communication Engine.
                    </p>
                  </div>
                </div>
                {amcTier === 'opted_out_declined' && <Badge className="bg-red-600 text-white">Declined</Badge>}
              </div>

              {/* Edge Case: Custom Intensity & Price Override */}
              {amcTier !== 'opted_out_declined' && (
                <div className="p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Site Customization & Custom Usage Terms</span>
                    <Badge variant="outline" className="text-[10px]">Commercial / High Duty</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Annual AMC Agreed Price (₹)</Label>
                      <Input
                        type="number"
                        value={amcPrice}
                        onChange={(e) => setAmcPrice(Number(e.target.value))}
                        className="font-mono text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Contract Duration</Label>
                      <Input
                        value="1 Year (Auto-Renewing)"
                        readOnly
                        className="text-xs bg-[var(--color-surface)] mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Custom Coverage & Site Notes</Label>
                    <textarea
                      value={customizationNotes}
                      onChange={(e) => setCustomizationNotes(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Edge Case: Re-engagement Campaign for Declined AMC */}
              {amcTier === 'opted_out_declined' && (
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-semibold text-sm">Automated Post-Handover AMC Nurture Sequence</h4>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Prevents permanent loss of recurring revenue opportunity
                      </p>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 text-[var(--color-text-secondary)]">
                    <p>
                      When a customer declines AMC at handover, AIEC schedules a 30-day and 60-day friendly WhatsApp & Email check-in presenting AMC enrollment benefits after initial smooth elevator usage.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <span className="text-xs font-medium">Re-engagement Nurture Flow:</span>
                    <Button
                      size="sm"
                      variant={declinedSequenceActive ? 'default' : 'outline'}
                      onClick={() => setDeclinedSequenceActive(!declinedSequenceActive)}
                      className="text-xs"
                    >
                      {declinedSequenceActive ? 'Sequence Active (30/60 Days)' : 'Enable Nurture Campaign'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* SECTION 3: AUTOMATIC RENEWAL & PREVENTIVE REMINDER SCHEDULE */}
        {activeTabSection === 'schedule' && (
          <div className="space-y-6">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-serif font-semibold text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--color-accent-primary)]" />
                    Automated Renewal & Maintenance Cadence
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Triggered automatically from registration timestamp
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  4 Scheduled Actions
                </Badge>
              </div>

              <div className="space-y-3">
                {defaultReminders.map((rem, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-primary)]/10 flex items-center justify-center text-[var(--color-accent-primary)] font-bold font-mono">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm capitalize">
                          {rem.reminderType.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
                          <span className="font-mono">{rem.reminderDate}</span>
                          <span>•</span>
                          <span className="capitalize flex items-center gap-1">
                            {rem.channel === 'whatsapp' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                            {rem.channel === 'email' && <Mail className="w-3 h-3 text-blue-600" />}
                            {rem.channel === 'call' && <PhoneCall className="w-3 h-3 text-amber-600" />}
                            {rem.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                      {rem.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SUMMARY BAR & ACTION FOOTER */}
        <Card className="p-4 bg-[var(--color-surface)] border-[var(--color-accent-primary)]/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">Selected Warranty Package:</span>
            <span className="font-semibold">{mfgPartsMonths}M Parts / {aiecLaborMonths}M AIEC Labor</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-secondary)]">AMC Registration Status:</span>
            <span className="font-semibold capitalize text-[var(--color-accent-primary)]">
              {amcTier.replace(/_/g, ' ')} ({amcTier === 'opted_out_declined' ? '₹0' : `₹${amcPrice.toLocaleString()}/yr`})
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--color-border)] flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 text-xs"
            >
              Back
            </Button>
            <Button
              onClick={handleSaveRegistration}
              className="flex-[2] bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              Save & Generate Handover Certificate
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
