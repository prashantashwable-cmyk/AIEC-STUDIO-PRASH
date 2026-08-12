import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, UserStatus } from '../types';
import { DbManager } from '../lib/db';
import { Card, Button } from './Common';
import { 
  Compass, MapPin, Hammer, Truck, Layers, Shield, 
  ArrowRight, Check, AlertTriangle, Users, History, Info, Sparkles, RefreshCw
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  targetUserName: string;
  targetUserPhone: string;
  previousRole: string;
  newRole: string;
  changeReason?: string;
  actionType: 'approve' | 'reject' | 'change' | 'reapply';
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    adminName: 'Mr. Prashant Vasant Wable',
    targetUserName: 'Amit Sharma',
    targetUserPhone: '+91 98765 43211',
    previousRole: 'Pending Selector',
    newRole: 'surveyor',
    changeReason: 'Passed technical mapping assessment and GPS field trial.',
    actionType: 'approve'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    adminName: 'Mr. Prashant Vasant Wable',
    targetUserName: 'Rajesh Patel',
    targetUserPhone: '+91 98765 43212',
    previousRole: 'Pending Selector',
    newRole: 'technician',
    changeReason: 'Safety clearance certification and mechanical checklist approved.',
    actionType: 'approve'
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    adminName: 'Mr. Prashant Vasant Wable',
    targetUserName: 'Rohan Deshmukh',
    targetUserPhone: '+91 98765 43214',
    previousRole: 'surveyor',
    newRole: 'customer',
    changeReason: 'Switched from surveyor applicant to actual client profile after commercial land acquisition.',
    actionType: 'change'
  }
];

// ---------------------------------------------------------
// 1. ROLE SELECTION ONBOARDING WIZARD COMPONENT
// ---------------------------------------------------------
export const RoleSelectionWizard: React.FC<{
  user: User;
  onComplete: (updatedUser: User) => void;
  onSignOut: () => void;
}> = ({ user, onComplete, onSignOut }) => {
  const [step, setStep] = useState<number>(1); // Step 1: Role Tiles, Step 2: Form, Step 3: Submission Handshake
  const [selectedRole, setSelectedRole] = useState<UserRole | 'pending_selection'>('pending_selection');
  
  // Profile Form fields
  const [fullName, setFullName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [region, setRegion] = useState('Pune Central');
  const [experience, setExperience] = useState('2');
  const [certificationId, setCertificationId] = useState('');
  const [gpsConsent, setGpsConsent] = useState(false);
  
  // Custom Role specific fields
  const [companyName, setCompanyName] = useState('');
  const [manufacturingHub, setManufacturingHub] = useState('Chakan Industrial Area');
  const [proposedFloors, setProposedFloors] = useState(4);
  const [siteAddress, setSiteAddress] = useState('');

  // Admin access secret
  const [adminToken, setAdminToken] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Re-application detector state
  const [isReapplication, setIsReapplication] = useState(false);

  // Validation feedback state
  const [validationError, setValidationError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Read saved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('aiec_onboarding_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.targetUserId === user.id) {
          setSelectedRole(parsed.selectedRole || 'pending_selection');
          setFullName(parsed.fullName || user.name);
          setEmail(parsed.email || user.email || '');
          setRegion(parsed.region || 'Pune Central');
          setExperience(parsed.experience || '2');
          setCertificationId(parsed.certificationId || '');
          setCompanyName(parsed.companyName || '');
          setManufacturingHub(parsed.manufacturingHub || 'Chakan Industrial Area');
          setProposedFloors(parsed.proposedFloors || 4);
          setSiteAddress(parsed.siteAddress || '');
          setGpsConsent(parsed.gpsConsent || false);
          
          if (parsed.isReapplication) {
            setIsReapplication(true);
          }
        }
      } catch (e) {
        console.error('Error reading onboarding draft', e);
      }
    }

    const rejectedKeys = localStorage.getItem('aiec_rejected_partners');
    if (rejectedKeys && rejectedKeys.includes(user.id)) {
      setIsReapplication(true);
    }
  }, [user]);

  // Write draft dynamically to localStorage (Auto-save)
  useEffect(() => {
    if (selectedRole !== 'pending_selection' || fullName || email || siteAddress) {
      const draftObj = {
        targetUserId: user.id,
        selectedRole,
        fullName,
        email,
        region,
        experience,
        certificationId,
        companyName,
        manufacturingHub,
        proposedFloors,
        siteAddress,
        gpsConsent,
        isReapplication
      };
      localStorage.setItem('aiec_onboarding_draft', JSON.stringify(draftObj));
    }
  }, [selectedRole, fullName, email, region, experience, certificationId, companyName, manufacturingHub, proposedFloors, siteAddress, gpsConsent, isReapplication, user]);

  const validateAdminPasscode = () => {
    if (adminToken.trim().toUpperCase() === 'ADMINWABLE') {
      setIsAdminUnlocked(true);
      setSelectedRole('admin');
      setInviteError('');
      triggerToast('Admin authorization verified successfully.');
    } else {
      setInviteError('Invalid referral passcode. Access denied.');
    }
  };

  const handleNextStep = () => {
    if (step === 1 && selectedRole === 'pending_selection') {
      setValidationError('Please select a platform role card to proceed.');
      return;
    }
    setValidationError('');
    setStep((prev) => prev + 1);
  };

  const handleBackStep = () => {
    setValidationError('');
    setStep((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleSubmitApplication = () => {
    // Validate core fields
    if (!fullName.trim() || fullName.trim().length < 3) {
      setValidationError('Please enter a valid legal name (min 3 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setValidationError('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }

    // Role specific form validation
    if (selectedRole === 'surveyor' && !gpsConsent) {
      setValidationError('You must authorize GPS and camera permissions to continue.');
      return;
    }

    if (selectedRole === 'customer' && !siteAddress.trim()) {
      setValidationError('Please specify the construction site address.');
      return;
    }

    if (selectedRole === 'supplier' && !companyName.trim()) {
      setValidationError('Please specify your registered industrial company name.');
      return;
    }

    setValidationError('');

    try {
      // Prepare updated user object with solid state mapping across the data pipeline
      const updatedUser: User = {
        ...user,
        name: fullName,
        email: email,
        role: selectedRole as UserRole,
        region: region,
        // Customers are auto-approved. Others require administrative approval.
        status: selectedRole === 'customer' || selectedRole === 'admin' ? 'active' : 'pending',
        onboardingCompleted: false, // will require role onboarding workflow completion
      };

      // Ensure downstream data models are seeded with initial layout values
      if (selectedRole === 'surveyor') {
        updatedUser.preferredZones = [region];
        updatedUser.twoWheelerOwned = true;
        updatedUser.bankVerifiedStatus = 'pending';
        updatedUser.camera_permission_status = 'granted';
        updatedUser.location_permission_status = 'granted';
      } else if (selectedRole === 'technician') {
        updatedUser.skillTags = ['Elevator Installation', 'Safety SOPs Checklist'];
        updatedUser.insuranceStatus = 'active';
        updatedUser.sopAcknowledgedFlag = true;
        updatedUser.bankVerifiedStatus = 'pending';
      } else if (selectedRole === 'supplier') {
        updatedUser.companyName = companyName;
        updatedUser.gstin = '27GSTIN' + Math.floor(1000 + Math.random() * 9000) + 'A1Z1';
        updatedUser.authorizedSignatoryName = fullName;
        updatedUser.paymentTermsAcceptedFlag = true;
        updatedUser.catalogSeedItems = [
          { name: 'Gearless Traction Machine', price: 250000, sku: 'TRAC-GEAR-01' },
          { name: 'VVVF Variable Speed Controller', price: 150000, sku: 'VVVF-CTRL-01' },
          { name: 'Premium Hairline Steel Cabin (6 Pax)', price: 180000, sku: 'CABIN-PREM-06' }
        ];
        updatedUser.bankVerifiedStatus = 'pending';
      } else if (selectedRole === 'customer') {
        updatedUser.siteAddress = siteAddress;
        updatedUser.onboardingCompleted = true; // customers are auto-complete
        updatedUser.communicationConsentFlags = { sms: true, whatsapp: true, email: true };
      }

      // Save in central DbManager state
      DbManager.updateUser(updatedUser);

      // Handle re-application tracking
      if (isReapplication) {
        const reappliedLog = {
          id: `reapply_${Date.now()}`,
          userId: user.id,
          role: selectedRole,
          timestamp: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('aiec_reapplied_history') || '[]');
        existing.push(reappliedLog);
        localStorage.setItem('aiec_reapplied_history', JSON.stringify(existing));
      }

      // Finalize setup
      localStorage.removeItem('aiec_onboarding_draft');
      if (selectedRole === 'customer' || selectedRole === 'admin') {
        localStorage.setItem('aiec_session_token', `session_${user.id}`);
        onComplete(updatedUser);
      } else {
        setStep(3);
      }
    } catch (e) {
      console.error('Error submitting partner onboarding registration:', e);
      setValidationError('Failed to save registration profile. Please clear local storage or try again.');
    }
  };

  const rolesList = [
    {
      id: 'surveyor' as UserRole,
      title: 'Field Surveyor',
      description: 'Perform on-site lift shaft inspections, map accurate GPS territories & record building details.',
      icon: MapPin,
      badge: 'Operational Approval Required',
      requirements: 'Requires Camera & High-Accuracy GPS permissions'
    },
    {
      id: 'technician' as UserRole,
      title: 'Installation Technician',
      description: 'Complete rigorous safety checklists and elevator SOP milestones floor-by-floor.',
      icon: Hammer,
      badge: 'Safety Clearance Required',
      requirements: 'Requires physical clearance test upload'
    },
    {
      id: 'supplier' as UserRole,
      title: 'Supplier / Manufacturer',
      description: 'List mechanical drive catalogues, supply safety cables & dispatch logistics orders.',
      icon: Truck,
      badge: 'Enterprise Approval Required',
      requirements: 'Requires Chakan industrial park location validation'
    },
    {
      id: 'customer' as UserRole,
      title: 'Elevator Owner / Customer',
      description: 'Monitor lift construction progress, choose cabin gold trims & clear stage invoices.',
      icon: Layers,
      badge: '⚡ Auto-Approved Instantly',
      requirements: 'Instant platform access with no review waiting time'
    }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-4xl w-full mx-auto bg-white rounded-3xl border border-[rgba(184,135,61,0.18)] shadow-diffuse overflow-hidden">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 bg-charcoal/95 text-white border border-[#B8873D]/30 shadow-2xl rounded-2xl flex items-center gap-2.5 max-w-sm"
          >
            <Info className="w-5 h-5 text-antiquegold shrink-0" />
            <p className="text-xs font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: THE GOLDEN PROGRESS ELEVATOR RAIL */}
      <div className="w-full md:w-[35%] bg-[#0E4B3D] text-white p-6 md:p-8 flex flex-col justify-between relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E4B3D] to-[#0A3B30] -z-10" />
        
        {/* Visual elevator cage track */}
        <div className="absolute right-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-transparent via-[#B8873D]/40 to-transparent flex flex-col justify-between items-center py-6">
          <div className="w-2.5 h-2.5 rounded-full bg-[#B8873D]" />
          <motion.div 
            animate={{ y: step === 1 ? -40 : step === 2 ? 0 : 40 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="w-5 h-5 rounded-full bg-[#B8873D] ring-4 ring-[#B8873D]/30 flex items-center justify-center text-[9px] font-bold text-white shadow-md"
          >
            F{step}
          </motion.div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#B8873D]" />
        </div>

        <div className="space-y-6">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/15">
            <Compass className="w-5 h-5 text-antiquegold" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-antiquegold font-extrabold block mb-1">Partner Onboarding</span>
            <h2 className="font-serif text-xl font-bold leading-tight">ASCENSION PROGRESSION</h2>
          </div>

          {/* Vertical progress levels */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step > 1 ? 'bg-antiquegold text-white' : 'border border-[#B8873D] text-antiquegold bg-white/5'
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className={`text-xs font-bold ${step === 1 ? 'text-white' : 'text-white/60'}`}>Choose Role Tile</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step > 2 ? 'bg-antiquegold text-white' : step === 2 ? 'border-2 border-antiquegold text-antiquegold bg-white/5' : 'border border-white/20 text-white/40'
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
              </div>
              <span className={`text-xs font-bold ${step === 2 ? 'text-white' : 'text-white/40'}`}>Profile Registration</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? 'border-2 border-antiquegold text-antiquegold bg-white/5' : 'border border-white/20 text-white/40'
              }`}>
                3
              </div>
              <span className={`text-xs font-bold ${step === 3 ? 'text-white' : 'text-white/40'}`}>HQ Security Audit</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-dashed border-white/15 space-y-2">
          <p className="text-[10px] text-white/60 leading-normal">
            Every operational role registers onto our private Chakan ledger to guarantee physical site security.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
            <span className="text-[9px] font-mono text-success uppercase font-bold">Secure Gate Shield Active</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE FORM VIEW */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white text-left relative overflow-y-auto max-h-[580px] md:max-h-none">
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">Select Your Platform Role</h3>
                <p className="text-xs text-warmgray">Choose your primary operational layout to sync with Mr. Prashant Wable's control suite.</p>
              </div>

              {isReapplication && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-antiquegold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-charcoal font-semibold">
                    Re-Application Detected: Your previously inactive profile is eligible for assignment. Upon HQ verification, your ledger historical notes will auto-sync.
                  </p>
                </div>
              )}

              {/* Roles Selection Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {rolesList.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(item.id);
                        setIsAdminUnlocked(false);
                        setValidationError('');
                      }}
                      className={`w-full p-3 bg-white border rounded-xl flex items-start gap-3.5 text-left transition-all relative hover:shadow-xs cursor-pointer ${
                        isSelected 
                          ? 'border-antiquegold bg-[#B8873D]/5 ring-1 ring-antiquegold' 
                          : 'border-[rgba(184,135,61,0.14)] hover:bg-[#F8F6F1]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-antiquegold text-white' : 'bg-royalemerald/10 text-royalemerald'
                      }`}>
                        <Icon className="w-4.5 h-4.5 stroke-[1.5]" />
                      </div>
                      <div className="space-y-0.5 pr-2 truncate-none flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-charcoal">{item.title}</h4>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-antiquegold/20 text-[#B8873D]' : 'bg-[#0E4B3D]/10 text-[#0E4B3D]'
                          }`}>{item.badge}</span>
                        </div>
                        <p className="text-[10px] text-warmgray leading-tight">{item.description}</p>
                        <p className="text-[9px] text-[#B8873D] font-mono font-medium">{item.requirements}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-antiquegold text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Secret Admin invite box */}
                <div className="p-3 bg-alabaster rounded-xl border border-dashed border-[#e6dfd4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-charcoal flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-antiquegold" /> Admin Invitation Passcode
                    </span>
                    <span className="text-[8px] text-warmgray">Requires Authorized Token</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter secret passcode (e.g. ADMINWABLE)"
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-[rgba(184,135,61,0.15)] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal font-semibold"
                    />
                    <button
                      type="button"
                      onClick={validateAdminPasscode}
                      className="px-3 py-1.5 bg-charcoal text-white hover:bg-[#3d3832] rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                  {inviteError && <p className="text-[9px] text-error font-semibold">{inviteError}</p>}
                  {isAdminUnlocked && (
                    <div className="p-1.5 bg-success/10 border border-success/25 rounded-lg text-[9px] text-success font-semibold flex items-center gap-1">
                      🛡️ Admin Role Unlocked & Selected! (Logged-in as administrative auditor)
                    </div>
                  )}
                </div>
              </div>

              {validationError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-[#e6dfd4]">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-xs text-error hover:underline cursor-pointer font-bold"
                >
                  Sign Out
                </button>
                <Button
                  variant="primary"
                  disabled={selectedRole === 'pending_selection'}
                  onClick={handleNextStep}
                >
                  <span>Continue to Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-mono font-extrabold bg-[#B8873D]/10 text-antiquegold px-2 py-0.5 rounded-full">
                    {selectedRole.toUpperCase()} FORM
                  </span>
                  <span className="text-[10px] text-success animate-pulse font-mono font-bold">● Live Auto-Saving Draft</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal mt-1">Complete Partner Profile Details</h3>
                <p className="text-xs text-warmgray">Fill out operational specifications to authorize direct bank clearance and dispatch rules.</p>
              </div>

              <div className="space-y-3.5">
                {/* Standard fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Keshav Sharma"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-3 py-2 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. amit.sharma@aiec.co.in"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationError('');
                      }}
                      className="w-full px-3 py-2 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-charcoal uppercase tracking-wider">Primary Operational Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F6F1] border border-[rgba(184,135,61,0.15)] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal cursor-pointer"
                  >
                    <option value="Pune Central">Pune Central (Kothrud, Erandwane)</option>
                    <option value="Pune North">Pune North (Pimpri, Chinchwad)</option>
                    <option value="Pune South">Pune South (Hadapsar, Katraj)</option>
                    <option value="Mumbai HQ">Mumbai HQ (South Mumbai Area)</option>
                    <option value="Chakan Area">Chakan Industrial Area (Manufacturing)</option>
                  </select>
                </div>

                {/* ROLE SPECIFIC ONBOARDING SUB-FORMS */}
                {selectedRole === 'surveyor' && (
                  <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.12)] space-y-3">
                    <h4 className="text-xs font-bold text-[#0E4B3D] flex items-center gap-1.5">
                      🗺️ Surveyor Operational Parameters
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Structural Mapping Experience</label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        >
                          <option value="1">1-2 Years mapping</option>
                          <option value="3">3-5 Years mapping</option>
                          <option value="5">5+ Years expert</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">GIS Clearance Certification ID</label>
                        <input
                          type="text"
                          placeholder="e.g. GIS-982-PUNE"
                          value={certificationId}
                          onChange={(e) => setCertificationId(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1.5">
                      <input
                        type="checkbox"
                        id="gps-consent"
                        checked={gpsConsent}
                        onChange={(e) => {
                          setGpsConsent(e.target.checked);
                          setValidationError('');
                        }}
                        className="w-4 h-4 accent-antiquegold rounded cursor-pointer mt-0.5"
                      />
                      <label htmlFor="gps-consent" className="text-[10px] text-warmgray select-none cursor-pointer leading-tight">
                        I authorize high-accuracy camera and GPS telemetry background reporting to guarantee site inspection authenticity.
                      </label>
                    </div>
                  </div>
                )}

                {selectedRole === 'technician' && (
                  <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.12)] space-y-3">
                    <h4 className="text-xs font-bold text-[#0E4B3D] flex items-center gap-1.5">
                      🔧 Mechanical & Safety Clearance
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Safety Experience Level</label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        >
                          <option value="1">Junior Installer (&lt;2 yrs)</option>
                          <option value="3">Certified Safety Specialist (3-5 yrs)</option>
                          <option value="5">Lead Structural Inspector (5+ yrs)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Govt Electrical License No.</label>
                        <input
                          type="text"
                          placeholder="e.g. ELEC-MH-9921"
                          value={certificationId}
                          onChange={(e) => setCertificationId(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'supplier' && (
                  <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.12)] space-y-3">
                    <h4 className="text-xs font-bold text-[#0E4B3D] flex items-center gap-1.5">
                      🏭 Industrial Supply Chain Catalog
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Apex Mechanicals"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            setValidationError('');
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Chakan Warehouse Hub</label>
                        <select
                          value={manufacturingHub}
                          onChange={(e) => setManufacturingHub(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        >
                          <option value="Chakan Industrial Area">Chakan Industrial Area (Pune)</option>
                          <option value="Bhiwandi Logistic Hub">Bhiwandi Logistic Hub (Thane)</option>
                          <option value="MIDC Bhosari">MIDC Bhosari (Pimpri)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === 'customer' && (
                  <div className="p-3.5 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.12)] space-y-3">
                    <h4 className="text-xs font-bold text-antiquegold flex items-center gap-1.5">
                      🏡 Building Specifications (Customer Profile)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Proposed Elevator Floors</label>
                        <input
                          type="number"
                          min={2}
                          max={40}
                          value={proposedFloors}
                          onChange={(e) => setProposedFloors(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-charcoal">Construction Address</label>
                        <input
                          type="text"
                          placeholder="e.g. Plot 15, Baner, Pune"
                          value={siteAddress}
                          onChange={(e) => {
                            setSiteAddress(e.target.value);
                            setValidationError('');
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {validationError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-[#e6dfd4]">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-4 py-2 bg-alabaster hover:bg-[#edeae2] border border-[#e6dfd4] rounded-xl text-xs font-bold text-charcoal cursor-pointer transition-all"
                >
                  Back
                </button>
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!fullName.trim() || !email.trim()}
                  onClick={handleSubmitApplication}
                >
                  {selectedRole === 'customer' ? (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-pulse" /> Complete Setup & Open Dashboard
                    </span>
                  ) : (
                    <span>Submit Approval Request</span>
                  )}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 text-center py-4"
            >
              <div className="w-14 h-14 bg-antiquegold/10 text-antiquegold rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 stroke-[1.5] animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-antiquegold uppercase tracking-widest">
                  STAGE 3: ADMINISTRATIVE HANDSHAKE
                </span>
                <h3 className="font-serif text-lg font-bold text-charcoal">Application Lodged Securely!</h3>
                <p className="text-xs text-warmgray max-w-sm mx-auto leading-normal">
                  Your request to become a certified <strong className="text-charcoal font-bold uppercase">{selectedRole}</strong> has been registered onto the AIEC master ledger.
                </p>
              </div>

              <div className="p-3.5 bg-[#0E4B3D]/5 border border-[#0E4B3D]/12 rounded-2xl text-left space-y-2.5 max-w-sm mx-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E4B3D]">
                  <Info className="w-4 h-4 text-antiquegold shrink-0" />
                  <span>HQ Action Log Details</span>
                </div>
                <div className="space-y-1 text-[10px] text-warmgray font-mono">
                  <div className="flex justify-between">
                    <span>APPLICANT:</span>
                    <span className="text-charcoal font-bold">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LEDGER ID:</span>
                    <span className="text-charcoal font-bold">{user.id.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TERRITORY:</span>
                    <span className="text-charcoal font-bold">{region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className="text-warning font-bold">AWAITING APPROVAL</span>
                  </div>
                </div>
                <div className="border-t border-[#e6dfd4] pt-2">
                  <p className="text-[10px] leading-relaxed text-warmgray">
                    Director <strong>Mr. Prashant Vasant Wable</strong> has been notified on the master admin console. You will gain full layout routing once approved.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-4 py-2 bg-alabaster hover:bg-[#edeae2] border border-[#e6dfd4] rounded-xl text-xs font-bold text-charcoal cursor-pointer transition-all"
                >
                  Sign Out / Use Demo Bypass
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 2. ADMIN ROLE & PARTNER ADMINISTRATION CONSOLE
// ---------------------------------------------------------
export const AdminRoleManagement: React.FC<{
  currentAdmin: User;
}> = ({ currentAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [clashSimulated, setClashSimulated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reassign role state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('surveyor');
  const [changeReason, setChangeReason] = useState<string>('');

  const refreshData = () => {
    try {
      setUsers(DbManager.getUsers());
      
      const storedLogs = localStorage.getItem('aiec_role_audit_log');
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      } else {
        localStorage.setItem('aiec_role_audit_log', JSON.stringify(INITIAL_AUDIT_LOGS));
        setAuditLogs(INITIAL_AUDIT_LOGS);
      }
    } catch (e) {
      console.error('Error refreshing Admin Console data:', e);
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('aiec_db_update', refreshData);
    return () => window.removeEventListener('aiec_db_update', refreshData);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleApprovePartner = (targetUser: User) => {
    try {
      if (clashSimulated) {
        triggerToast(`⚠️ Concurrency clash detected! Admin 'Amit Wable' modified ${targetUser.name}'s state. Merged change, last write wins.`);
      }

      const updated: User = {
        ...targetUser,
        status: 'active'
      };

      const newLog: AuditLogEntry = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminName: currentAdmin.name,
        targetUserName: targetUser.name,
        targetUserPhone: targetUser.phone,
        previousRole: 'Pending Approval (Selector)',
        newRole: targetUser.role,
        changeReason: 'Admin manual approval issued via platform dashboard.',
        actionType: 'approve'
      };

      const currentLogs = [newLog, ...auditLogs];
      localStorage.setItem('aiec_role_audit_log', JSON.stringify(currentLogs));
      setAuditLogs(currentLogs);

      DbManager.updateUser(updated);
      triggerToast(`Approved ${targetUser.name} successfully as a registered ${targetUser.role}!`);
    } catch (e) {
      console.error('Failed to approve partner:', e);
      triggerToast('Error updating partner approval state.');
    }
  };

  const handleRejectPartner = (targetUser: User) => {
    try {
      if (clashSimulated) {
        triggerToast(`⚠️ Concurrency clash detected! Admin 'Amit Wable' modified ${targetUser.name}'s state. Merged change, last write wins.`);
      }

      const updated: User = {
        ...targetUser,
        status: 'inactive'
      };

      const existingRejected = localStorage.getItem('aiec_rejected_partners') || '';
      if (!existingRejected.includes(targetUser.id)) {
        localStorage.setItem('aiec_rejected_partners', `${existingRejected},${targetUser.id}`);
      }

      const newLog: AuditLogEntry = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminName: currentAdmin.name,
        targetUserName: targetUser.name,
        targetUserPhone: targetUser.phone,
        previousRole: 'Pending Approval (Selector)',
        newRole: 'rejected',
        changeReason: 'Safety or territory verification checklist incomplete.',
        actionType: 'reject'
      };

      const currentLogs = [newLog, ...auditLogs];
      localStorage.setItem('aiec_role_audit_log', JSON.stringify(currentLogs));
      setAuditLogs(currentLogs);

      DbManager.updateUser(updated);
      triggerToast(`Partner registration rejected for ${targetUser.name}.`);
    } catch (e) {
      console.error('Failed to reject partner:', e);
      triggerToast('Error updating partner state.');
    }
  };

  const handleOpenReassignForm = (targetUser: User) => {
    setEditingUserId(targetUser.id);
    setNewSelectedRole(targetUser.role);
    setChangeReason('');
  };

  const handleSaveRoleChange = (targetUser: User) => {
    if (!changeReason.trim()) {
      triggerToast('Please state an audit clearance reason for changing this partner\'s role.');
      return;
    }

    try {
      if (clashSimulated) {
        triggerToast(`⚠️ Concurrency clash detected! Admin 'Amit Wable' modified ${targetUser.name}'s state. Merged change, last write wins.`);
      }

      const updated: User = {
        ...targetUser,
        role: newSelectedRole,
        status: 'active'
      };

      const newLog: AuditLogEntry = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminName: currentAdmin.name,
        targetUserName: targetUser.name,
        targetUserPhone: targetUser.phone,
        previousRole: targetUser.role,
        newRole: newSelectedRole,
        changeReason: changeReason,
        actionType: 'change'
      };

      const currentLogs = [newLog, ...auditLogs];
      localStorage.setItem('aiec_role_audit_log', JSON.stringify(currentLogs));
      setAuditLogs(currentLogs);

      DbManager.updateUser(updated);
      setEditingUserId(null);
      triggerToast(`Role for ${targetUser.name} reallocated from ${targetUser.role} to ${newSelectedRole}.`);
    } catch (e) {
      console.error('Failed to update role reallocation:', e);
      triggerToast('Error saving role reallocation details.');
    }
  };

  const pendingPartners = users.filter(u => u.status === 'pending' && u.role !== 'admin');
  const activePartners = users.filter(u => u.status === 'active' && u.role !== 'admin');

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Stream */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 p-4 bg-charcoal/95 text-white border border-[#B8873D]/30 shadow-2xl rounded-2xl flex items-start gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-antiquegold text-white flex items-center justify-center shrink-0">
              🔔
            </div>
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-antiquegold font-extrabold block">Platform Ledger Status Update</span>
              <p className="text-xs leading-normal">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Concurrency Simulation Control Banner */}
      <div className="bg-[#F8F6F1] p-4 rounded-2xl border border-[rgba(184,135,61,0.18)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h4 className="font-serif text-sm font-bold text-charcoal flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-antiquegold" /> Multi-Admin Concurrency Simulator
          </h4>
          <p className="text-xs text-warmgray">Simulate simultaneous operational approvals from another HQ terminal to verify locking.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="checkbox"
            id="clash-sim-toggle"
            checked={clashSimulated}
            onChange={(e) => setClashSimulated(e.target.checked)}
            className="w-4 h-4 accent-antiquegold rounded cursor-pointer"
          />
          <label htmlFor="clash-sim-toggle" className="text-xs text-charcoal font-bold cursor-pointer">
            Simulate 2 Admins Approving Same User
          </label>
        </div>
      </div>

      {/* Dual Section Grid: Directory & Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE & PENDING DIRECTORY */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. PENDING APPLICATIONS */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-antiquegold/10 text-antiquegold flex items-center justify-center font-bold text-xs">
                  {pendingPartners.length}
                </div>
                <h3 className="font-serif text-md font-bold text-charcoal">Pending Platform Role Approvals</h3>
              </div>
              <span className="text-[10px] text-warmgray uppercase tracking-wider font-mono">HQ Queue</span>
            </div>

            {pendingPartners.length === 0 ? (
              <div className="text-center py-8 space-y-2 bg-alabaster/50 rounded-2xl border border-dashed border-[#e6dfd4]">
                <Users className="w-8 h-8 text-warmgray/50 mx-auto" />
                <p className="text-xs text-warmgray font-bold">No pending role requests in queue.</p>
                <p className="text-[10px] text-warmgray">New mobile registrations populate automatically here upon verification.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPartners.map((item) => {
                  const rejectedList = localStorage.getItem('aiec_rejected_partners') || '';
                  const isReApp = rejectedList.includes(item.id);

                  return (
                    <div 
                      key={item.id} 
                      className="p-4 bg-alabaster rounded-2xl border border-[rgba(184,135,61,0.15)] flex flex-col gap-4 text-left hover:shadow-xs transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <img 
                            src={item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-full border border-antiquegold object-cover shrink-0" 
                          />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-charcoal">{item.name}</h4>
                              {isReApp && (
                                <span className="text-[8px] bg-warning/15 text-antiquegold px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider animate-pulse">
                                  Re-Applicant
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-warmgray">{item.phone}</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="text-[9px] bg-[#0E4B3D]/10 text-[#0E4B3D] px-2 py-0.5 rounded-full font-bold uppercase">
                                Role Requested: {item.role}
                              </span>
                              <span className="text-[9px] bg-charcoal/10 text-charcoal px-2 py-0.5 rounded-full font-medium">
                                📍 {item.region || 'Pune HQ'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRejectPartner(item)}
                            className="px-3 py-1.5 border border-error/20 bg-error/5 hover:bg-error/10 text-error text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprovePartner(item)}
                            className="px-3.5 py-1.5 bg-royalemerald hover:bg-[#0c4337] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            Approve Partner
                          </button>
                        </div>
                      </div>

                      {/* Onboarding Surveyor review details */}
                      {item.role === 'surveyor' && (
                        <div className="w-full mt-1 pt-3 border-t border-[#e6dfd4] grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-warmgray bg-white/40 p-3 rounded-xl border border-[rgba(184,135,61,0.06)]">
                          <div className="space-y-1.5">
                            <p className="font-bold text-charcoal flex items-center gap-1.5">
                              🪪 ID Proof Scan Dossier
                            </p>
                            {item.aadhaarOrPanDoc ? (
                              <div className="flex gap-2.5 items-center mt-1">
                                <img src={item.aadhaarOrPanDoc} className="w-20 h-12 object-cover rounded-lg border border-[#e6dfd4] shadow-xs shrink-0" />
                                <div>
                                  <p className="text-[10px] text-charcoal font-mono font-bold">OCR_SCAN_LEDGER_OK</p>
                                  <p className="text-[9px] text-success font-semibold">✓ Signature validated & locked</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-error font-semibold">⚠️ No ID documents uploaded yet</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-charcoal flex items-center gap-1.5">
                              🏦 Payout Settlement Account
                            </p>
                            <div className="font-mono text-[10px] leading-relaxed text-warmgray">
                              <p className="text-charcoal font-bold">{item.name}</p>
                              <p className="text-[9px]">A/C: {item.bankAccountNo ? `••••${item.bankAccountNo.slice(-4)}` : 'Unassigned'} • IFSC: {item.bankIfsc || 'N/A'}</p>
                              <p className="mt-1 font-sans">
                                {item.bankVerifiedStatus === 'verified' ? (
                                  <span className="text-[9px] bg-success/15 border border-success/20 text-success px-2 py-0.5 rounded-full font-bold">
                                    🟢 NPCI PENNY-DROP CLEARED
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-error/15 border border-error/20 text-error px-2 py-0.5 rounded-full font-bold">
                                    🔴 NPCI PENDING VERIFICATION
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-1.5 pt-1">
                            <p className="font-bold text-charcoal">📍 Operational Territories & Travel Capabilities</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {item.preferredZones && item.preferredZones.length > 0 ? (
                                item.preferredZones.map((z) => (
                                  <span key={z} className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-bold">
                                    📍 {z}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] text-[#0E4B3D] bg-royalemerald/10 px-2.5 py-0.5 rounded-full font-bold">📍 {item.region || 'Pune HQ'}</span>
                              )}
                              
                              <span className="text-[9px] bg-alabaster border border-[#e6dfd4] px-2 py-0.5 rounded-full font-bold ml-auto text-charcoal flex items-center gap-1">
                                {item.twoWheelerOwned ? '🏍️ Two-Wheeler Transport Verified' : '❌ Public / Transit Only'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Onboarding Technician review details */}
                      {item.role === 'technician' && (
                        <div className="w-full mt-1 pt-3 border-t border-[#e6dfd4] grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-warmgray bg-white/40 p-3 rounded-xl border border-[rgba(184,135,61,0.06)]">
                          <div className="space-y-1.5">
                            <p className="font-bold text-charcoal flex items-center gap-1.5">
                              📜 Competencies & Trade Licenses
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.skillTags && item.skillTags.length > 0 ? (
                                item.skillTags.map(tag => (
                                  <span key={tag} className="text-[8px] bg-antiquegold/10 text-[#875b1a] border border-[#B8873D]/20 px-1.5 py-0.5 rounded-full font-bold">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] text-[#875b1a] bg-antiquegold/10 px-2 py-0.5 rounded-full font-semibold">🔧 Mechanical Safety SOPs</span>
                              )}
                            </div>
                            {item.certificateDocs && item.certificateDocs.length > 0 && (
                              <div className="flex gap-2.5 items-center mt-1.5 overflow-x-auto py-1">
                                {item.certificateDocs.map((doc, idx) => (
                                  <img key={idx} src={doc} className="w-14 h-10 object-cover rounded border border-[#e6dfd4] shrink-0" />
                                ))}
                                <span className="text-[9px] text-success font-semibold">({item.certificateDocs.length} scanned)</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <p className="font-bold text-charcoal flex items-center gap-1.5">
                              🛡️ Liability Insurance Coverage
                            </p>
                            {item.liabilityInsuranceDoc ? (
                              <div className="flex gap-2.5 items-center mt-1">
                                <img src={item.liabilityInsuranceDoc} className="w-14 h-10 object-cover rounded border border-[#e6dfd4] shrink-0" />
                                <div className="text-[10px] font-mono leading-tight">
                                  <p className="text-charcoal font-bold">Expires: {item.insuranceExpiryDate || 'N/A'}</p>
                                  <p className="mt-1">
                                    {item.insuranceStatus === 'expired' ? (
                                      <span className="text-[8px] bg-error/15 border border-error/25 text-error px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Lapsed</span>
                                    ) : item.insuranceStatus === 'warning' ? (
                                      <span className="text-[8px] bg-error/10 border border-error/20 text-error px-1.5 py-0.5 rounded font-bold uppercase">Expiring soon</span>
                                    ) : (
                                      <span className="text-[8px] bg-success/15 border border-success/20 text-success px-1.5 py-0.5 rounded font-bold uppercase">Active & Valid</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-success font-semibold">🛡️ Standard Corporate Liability Policy Active</p>
                            )}
                          </div>

                          <div className="md:col-span-2 space-y-1.5 pt-1">
                            <p className="font-bold text-charcoal">📍 Preferred Dispatch Areas & Safety Commitment</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {item.preferredZones && item.preferredZones.length > 0 ? (
                                item.preferredZones.map((z) => (
                                  <span key={z} className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-bold">
                                    📍 {z}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] text-[#0E4B3D] bg-royalemerald/10 px-2.5 py-0.5 rounded-full font-bold">📍 {item.region || 'Pune HQ'}</span>
                              )}
                              
                              <span className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-bold ml-auto flex items-center gap-1">
                                {item.sopAcknowledgedFlag ? '✓ Safe-Shaft SOP Fully Committed' : '✓ SOP Standard Compliant'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Onboarding Supplier review details */}
                      {item.role === 'supplier' && (
                        <div className="w-full mt-1 pt-3 border-t border-[#e6dfd4] grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-warmgray bg-white/40 p-3 rounded-xl border border-[rgba(184,135,61,0.06)] text-left">
                          <div className="space-y-1">
                            <p className="font-bold text-charcoal flex items-center gap-1.5">
                              🛡️ Statutory Corporate KYC ID
                            </p>
                            <div className="font-mono text-[10px] leading-relaxed text-warmgray">
                              <p className="text-charcoal font-bold">GSTIN: {item.gstin || '27GSTIN8821A1'}</p>
                              <p>Company: {item.companyName || 'Apex Drives Chakan'}</p>
                              <p>Signatory: {item.authorizedSignatoryName || item.name}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="font-bold text-charcoal flex items-center gap-1.5">
                              🏦 Payout Settlement Account
                            </p>
                            <div className="font-mono text-[10px] leading-relaxed text-warmgray">
                              <p className="text-charcoal font-bold">A/C: {item.bankAccountNo ? `••••${item.bankAccountNo.slice(-4)}` : '••••9841'}</p>
                              <p>IFSC: {item.bankIfsc || 'HDFC0001042'}</p>
                              <p className="mt-1 font-sans">
                                <span className="text-[9px] bg-success/15 border border-success/20 text-success px-2 py-0.5 rounded-full font-bold">
                                  🟢 NPCI PENNY-DROP CLEARED
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-1.5 pt-1">
                            <p className="font-bold text-[#0E4B3D] font-serif text-[11px] flex items-center gap-1">
                              📦 Seeding Catalog Parts List ({item.catalogSeedItems?.length || 3} items)
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 max-h-[80px] overflow-y-auto">
                              {item.catalogSeedItems && item.catalogSeedItems.length > 0 ? (
                                item.catalogSeedItems.map((c: any, index: number) => (
                                  <span key={index} className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-mono font-bold">
                                    {c.sku || 'PART'}: ₹{c.price.toLocaleString('en-IN')}
                                  </span>
                                ))
                              ) : (
                                <>
                                  <span className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-mono font-bold">TRAC-GEAR-01: ₹2,50,000</span>
                                  <span className="text-[9px] bg-royalemerald/10 border border-royalemerald/25 text-[#0E4B3D] px-2.5 py-0.5 rounded-full font-mono font-bold">VVVF-CTRL-01: ₹1,50,000</span>
                                </>
                              )}
                              
                              <span className="text-[9px] bg-[#B8873D]/10 border border-antiquegold/25 text-antiquegold px-2.5 py-0.5 rounded-full font-bold ml-auto flex items-center gap-1 font-serif">
                                {item.paymentTermsAcceptedFlag ? '✓ SLA signed (v4.2)' : '✓ SLA Standard Agreement'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 2. ACTIVE DIRECTORY */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-royalemerald" />
                <h3 className="font-serif text-md font-bold text-charcoal">Active Partners & Clients</h3>
              </div>
              <span className="text-[10px] text-warmgray uppercase tracking-wider font-mono">Ledger Database</span>
            </div>

            <div className="space-y-3">
              {activePartners.map((partner) => {
                const isEditing = editingUserId === partner.id;
                return (
                  <div 
                    key={partner.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      isEditing 
                        ? 'border-antiquegold bg-[#B8873D]/5' 
                        : 'border-[rgba(184,135,61,0.12)] bg-white hover:bg-alabaster/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                      <div className="flex items-center gap-3">
                        <img 
                          src={partner.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={partner.name} 
                          className="w-11 h-11 rounded-full border border-antiquegold object-cover shrink-0" 
                        />
                        <div>
                          <h4 className="font-bold text-sm text-charcoal">{partner.name}</h4>
                          <p className="text-[10px] font-mono text-warmgray">{partner.phone}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] bg-charcoal/5 border border-charcoal/10 text-charcoal px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {partner.role}
                            </span>
                            <span className="text-[9px] bg-success/10 border border-success/20 text-success px-2 py-0.5 rounded-full font-bold">
                              Live Approved
                            </span>
                          </div>
                        </div>
                      </div>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleOpenReassignForm(partner)}
                          className="px-3 py-1.5 border border-antiquegold/30 hover:border-antiquegold hover:bg-[#B8873D]/10 text-[#B8873D] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Reassign Role
                        </button>
                      )}
                    </div>

                    {/* Inline role reassign form */}
                    {isEditing && (
                      <div className="mt-4 pt-3.5 border-t border-dashed border-[#e6dfd4] space-y-3.5 text-left">
                        <h5 className="text-xs font-bold text-charcoal">Reassign Platform Security Role</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-warmgray uppercase">New Target Role</label>
                            <select
                              value={newSelectedRole}
                              onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs font-semibold cursor-pointer text-charcoal"
                            >
                              <option value="surveyor">Field Surveyor</option>
                              <option value="technician">Installation Technician</option>
                              <option value="supplier">Supplier / Manufacturer</option>
                              <option value="customer">Elevator Owner / Customer</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-warmgray uppercase">Audit Clearance Reason</label>
                            <input
                              type="text"
                              required
                              placeholder="Reason for historical ledger audit..."
                              value={changeReason}
                              onChange={(e) => setChangeReason(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#e6dfd4] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-antiquegold text-charcoal"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1.5 text-xs text-warmgray font-bold hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveRoleChange(partner)}
                            className="px-4 py-1.5 bg-antiquegold hover:bg-[#a37633] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            Save Audit & Reallocate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: HISTORICAL AUDIT STREAM */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-antiquegold" />
                <h3 className="font-serif text-md font-bold text-charcoal">Platform Audit Ledger</h3>
              </div>
              <span className="text-[10px] bg-charcoal/5 px-2 py-0.5 rounded font-mono text-warmgray font-bold">
                LOGS
              </span>
            </div>

            {/* Audit log scroll container */}
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
              {auditLogs.map((log) => {
                return (
                  <div key={log.id} className="p-3 bg-alabaster rounded-xl border border-[rgba(184,135,61,0.08)] text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        log.actionType === 'approve' 
                          ? 'bg-success/10 text-success' 
                          : log.actionType === 'reject' 
                          ? 'bg-error/10 text-error' 
                          : 'bg-antiquegold/10 text-antiquegold'
                      }`}>
                        {log.actionType} Action
                      </span>
                      <span className="text-[9px] text-warmgray font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-charcoal">
                      Admin <strong className="text-[#0E4B3D]">{log.adminName}</strong> authorized layout parameters for <strong>{log.targetUserName}</strong>.
                    </p>

                    <div className="text-[9px] bg-white border border-[#e6dfd4] p-2 rounded-lg font-mono text-warmgray space-y-0.5">
                      <div>PREVIOUS ROLE: {log.previousRole}</div>
                      <div>ASSIGNED ROLE: {log.newRole}</div>
                      <div className="italic text-charcoal mt-1 shrink-0 select-text">
                        📢 Reason: {log.changeReason || 'No documentation recorded.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#e6dfd4] mt-4 flex items-center justify-between">
            <span className="text-[9px] font-mono text-warmgray">LEDGER VERSION: v1.0.1</span>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('aiec_role_audit_log', JSON.stringify(INITIAL_AUDIT_LOGS));
                  setAuditLogs(INITIAL_AUDIT_LOGS);
                  triggerToast('Historical logs reset to seed records.');
                } catch (err) {
                  console.error('Error resetting audit history:', err);
                }
              }}
              className="text-[9px] text-[#B8873D] font-bold underline hover:text-[#0E4B3D] cursor-pointer"
            >
              Reset Audit History
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
};
